import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { NewspaperDocumentSchema, type NewspaperDocument } from '@epaper-studio/document-schema';
import { RendererWorker, type RenderPdfResult } from './index.js';

const MAX_PAYLOAD_BYTES = 15 * 1024 * 1024; // 15 Megabytes
const DEFAULT_PORT = Number(process.env.PORT) || 4000;
const MAX_CONCURRENCY = Number(process.env.RENDER_CONCURRENCY) || 4;
const DEFAULT_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS) || 35000;

export interface ServerInstance {
  server: ReturnType<typeof createServer>;
  worker: RendererWorker;
  close: () => Promise<void>;
}

/**
 * Reads JSON payload from an incoming HTTP request with size cap protection.
 */
function readJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let bytesReceived = 0;
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      bytesReceived += chunk.length;
      if (bytesReceived > maxBytes) {
        req.destroy();
        const err = new Error(`Payload size exceeded limit of ${maxBytes} bytes`);
        (err as Error & { statusCode: number }).statusCode = 413;
        reject(err);
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw.trim()) {
          resolve({});
          return;
        }
        resolve(JSON.parse(raw));
      } catch (e) {
        const err = new Error(
          'Invalid JSON payload: ' + (e instanceof Error ? e.message : String(e))
        );
        (err as Error & { statusCode: number }).statusCode = 400;
        reject(err);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
}

/**
 * Creates and starts the standalone HTTP production renderer service.
 */
export function createRendererServer(
  options: { port?: number; concurrency?: number } = {}
): ServerInstance {
  const port = options.port ?? DEFAULT_PORT;
  const worker = new RendererWorker({
    concurrency: options.concurrency ?? MAX_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Health check endpoint
    if (
      req.method === 'GET' &&
      (pathname === '/health' || pathname === '/api/health' || pathname === '/')
    ) {
      const isReady = await worker.validateEnvironment();
      const mem = process.memoryUsage();
      const statusPayload = {
        status: isReady ? 'healthy' : 'degraded',
        service: '@epaper-studio/renderer',
        version: '0.1.0',
        uptimeSeconds: Math.round(process.uptime()),
        memoryRssMb: Math.round(mem.rss / (1024 * 1024)),
        activeJobs: worker.getActiveJobsCount(),
        maxConcurrency: worker.getConfig().concurrency,
        chromiumAvailable: isReady,
      };

      res.writeHead(isReady ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statusPayload, null, 2));
      return;
    }

    // PDF rendering endpoint
    if (req.method === 'POST' && (pathname === '/render-pdf' || pathname === '/api/render-pdf')) {
      if (worker.getActiveJobsCount() >= worker.getConfig().concurrency) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Service Busy',
            message: 'All rendering slots are currently utilized. Please retry shortly.',
            activeJobs: worker.getActiveJobsCount(),
          })
        );
        return;
      }

      try {
        const body = (await readJsonBody(req, MAX_PAYLOAD_BYTES)) as Record<string, unknown>;
        const rawDoc = body.document ? body.document : body;

        // Schema validation using canonical Zod schema
        const parseResult = NewspaperDocumentSchema.safeParse(rawDoc);
        if (!parseResult.success) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Invalid Document Schema',
              details: parseResult.error.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
              })),
            })
          );
          return;
        }

        const doc: NewspaperDocument = parseResult.data;
        const result: RenderPdfResult = await worker.renderToPdf(doc);

        const asciiTitle =
          doc.metadata.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'newspaper';
        const fullFilename =
          doc.metadata.title.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60) || 'newspaper';
        const utf8Filename = encodeURIComponent(`${fullFilename}.pdf`);

        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${asciiTitle}.pdf"; filename*=UTF-8''${utf8Filename}`,
          'Content-Length': result.fileSizeBytes,
          'X-Page-Count': String(result.pageCount),
          'X-Render-Time-Ms': String(result.durationMs),
          'X-Layout-Overflow': String(result.hasOverflow),
        });

        res.end(Buffer.from(result.pdfBuffer));
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === 'object' && 'statusCode' in err
            ? (err as { statusCode: number }).statusCode
            : 500;
        const message = err instanceof Error ? err.message : String(err);

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Render Failed',
            statusCode,
            message,
          })
        );
      }
      return;
    }

    // Raster PNG rendering endpoint
    if (
      req.method === 'POST' &&
      (pathname === '/render-image' || pathname === '/api/render-image')
    ) {
      try {
        const body = (await readJsonBody(req, MAX_PAYLOAD_BYTES)) as Record<string, unknown>;
        const rawDoc = body.document ? body.document : body;

        const parseResult = NewspaperDocumentSchema.safeParse(rawDoc);
        if (!parseResult.success) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Invalid Document Schema',
              details: parseResult.error.issues,
            })
          );
          return;
        }

        const doc: NewspaperDocument = parseResult.data;
        const pageNumber = typeof body.pageNumber === 'number' ? body.pageNumber : 1;
        const scale = typeof body.scale === 'number' ? body.scale : 2;

        const imageBuffer = await worker.renderToImage(doc, { pageNumber, scale });

        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': imageBuffer.length,
        });
        res.end(Buffer.from(imageBuffer));
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === 'object' && 'statusCode' in err
            ? (err as { statusCode: number }).statusCode
            : 500;
        const message = err instanceof Error ? err.message : String(err);

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Render Image Failed', message }));
      }
      return;
    }

    // 404 Route Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
  });

  server.listen(port, () => {
    console.log(
      `[E-Paper Studio Renderer] Standalone service listening on http://localhost:${port}`
    );
  });

  const close = async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await worker.close();
  };

  return { server, worker, close };
}

// Auto-start if invoked directly as CLI script
const isDirectExecution =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, '/');

if (isDirectExecution || process.env.RUN_RENDERER_SERVER === 'true') {
  const instance = createRendererServer();

  const shutdown = async () => {
    console.log('[E-Paper Studio Renderer] Shutting down gracefully...');
    await instance.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}
