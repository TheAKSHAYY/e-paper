import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { NewspaperDocumentSchema, type NewspaperDocument } from '@epaper-studio/document-schema';
import { RendererWorker, type RenderPdfResult } from './index.js';

const MAX_PAYLOAD_MB = Number(process.env.MAX_PAYLOAD_MB) || 15;
const MAX_PAYLOAD_BYTES = MAX_PAYLOAD_MB * 1024 * 1024;
const DEFAULT_PORT = Number(process.env.PORT) || 4000;
const MAX_CONCURRENCY = Number(process.env.RENDER_CONCURRENCY) || 4;
const DEFAULT_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS) || 35000;
const RATE_LIMIT_MAX_PER_MINUTE = Number(process.env.RATE_LIMIT_MAX_PER_MINUTE) || 60;
const EXPECTED_API_KEY = process.env.RENDER_API_KEY || process.env.API_KEY || '';

export interface ServerInstance {
  server: ReturnType<typeof createServer>;
  worker: RendererWorker;
  close: () => Promise<void>;
}

/**
 * In-memory sliding window rate limiter per client IP.
 */
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Safely resolves the true client IP address behind reverse proxies (Render, Cloudflare, etc.).
 *
 * Configurable via environment variables:
 * - TRUST_PROXY:
 *   - 'false' / '0': Disables proxy trust, strictly uses direct socket remoteAddress.
 *   - 'true' / unset (default on Render): Resolves client IP from X-Forwarded-For or X-Real-IP.
 * - TRUST_PROXY_HOPS: Number of reverse proxy layers upstream (default: 1 for Render's edge ingress).
 *   When an attacker attempts to spoof "X-Forwarded-For: fake-ip", Render's reverse proxy appends
 *   the attacker's real public IP ("fake-ip, real-client-ip"). Selecting the IP at index
 *   (length - hops) prevents IP-spoofing rate limit bypasses.
 */
export function getClientIp(req: IncomingMessage): string {
  const trustProxyEnv = process.env.TRUST_PROXY?.trim().toLowerCase();
  if (trustProxyEnv === 'false' || trustProxyEnv === '0') {
    return req.socket.remoteAddress || '127.0.0.1';
  }

  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    const ips = xff
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (ips.length > 0) {
      const hops = Math.max(1, Number(process.env.TRUST_PROXY_HOPS) || 1);
      const targetIndex = Math.max(0, ips.length - hops);
      return ips[targetIndex] || ips[0]!;
    }
  }

  const xRealIp = req.headers['x-real-ip'];
  if (typeof xRealIp === 'string' && xRealIp.trim()) {
    return xRealIp.trim();
  }

  return req.socket.remoteAddress || '127.0.0.1';
}

export function resetRateLimitsForTesting(): void {
  ipRateMap.clear();
}

export function checkRateLimit(req: IncomingMessage, maxLimitOverride?: number): boolean {
  const maxLimit = maxLimitOverride ?? RATE_LIMIT_MAX_PER_MINUTE;
  if (maxLimit <= 0) return true;

  const ip = getClientIp(req);
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= maxLimit) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodically clean up expired rate-limit IP records
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateMap.entries()) {
    if (now > entry.resetAt) {
      ipRateMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Validates optional API key passed via X-Api-Key or Authorization: Bearer.
 */
function validateApiKey(req: IncomingMessage): boolean {
  if (!EXPECTED_API_KEY) return true;
  const xApiKey = req.headers['x-api-key'];
  if (typeof xApiKey === 'string' && xApiKey.trim() === EXPECTED_API_KEY) {
    return true;
  }
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string') {
    const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (bearer === EXPECTED_API_KEY) {
      return true;
    }
  }
  return false;
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

/**
 * Sets CORS headers restricted to ALLOWED_ORIGINS (or fallback in development).
 */
function setCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS?.trim();
  const requestOrigin = req.headers.origin;

  if (!allowedOriginsEnv || allowedOriginsEnv === '*') {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
  } else {
    const allowedList = allowedOriginsEnv
      .split(',')
      .map((o) => o.trim().toLowerCase())
      .filter(Boolean);

    if (requestOrigin && allowedList.includes(requestOrigin.toLowerCase())) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Api-Key, Accept'
  );
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
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Rate limiting check
    if (!checkRateLimit(req)) {
      res.writeHead(429, {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      });
      res.end(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait a minute before retrying.',
        })
      );
      return;
    }

    // Health check endpoint (always unauthenticated for uptime monitors and orchestrators)
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

    // Optional API key enforcement on operational render endpoints
    if (!validateApiKey(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Missing or invalid API key.',
        })
      );
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
