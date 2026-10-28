import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { RendererWorker } from '@epaper-studio/renderer';
import { getTypographyFontsDir } from '@epaper-studio/typography/server';

function typographyFontsPlugin(): Plugin {
  const fontsDir = getTypographyFontsDir();
  const serveFont = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url) return next();
    const fontName = req.url.replace(/^\//, '').split('?')[0] || '';
    const fontPath = path.join(fontsDir, fontName);
    if (fs.existsSync(fontPath)) {
      const contentType = fontName.endsWith('.css') ? 'text/css' : 'font/woff2';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return fs.createReadStream(fontPath).pipe(res);
    }
    next();
  };

  return {
    name: 'typography-fonts-server',
    configureServer(server) {
      server.middlewares.use('/fonts', serveFont);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/fonts', serveFont);
    },
  };
}

function newspaperPdfServerPlugin(): Plugin {
  let worker: RendererWorker | null = null;

  const handlePdfRequest = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end('Method Not Allowed');
      return;
    }

    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      const document = JSON.parse(rawBody);

      if (!worker) {
        worker = new RendererWorker({ timeoutMs: 35000 });
      }

      const result = await worker.renderToPdf(document);

      const asciiTitle =
        (document.metadata?.title || 'newspaper')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .replace(/^_+|_+$/g, '') || 'newspaper';
      const asciiFilename = `${asciiTitle}.pdf`;
      const fullFilename = `${(document.metadata?.title || 'newspaper').replace(/[^\p{L}\p{N}_-]+/gu, '_')}.pdf`;
      const utf8Filename = encodeURIComponent(fullFilename);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', result.fileSizeBytes);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiFilename}"; filename*=UTF-8''${utf8Filename}`
      );
      res.statusCode = 200;
      res.end(Buffer.from(result.pdfBuffer));
    } catch (err) {
      console.error('PDF export server error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : 'Internal PDF generation failed',
        })
      );
    }
  };

  return {
    name: 'newspaper-pdf-server',
    configureServer(server) {
      server.middlewares.use('/api/render-pdf', (req, res, next) => {
        if (req.url === '' || req.url === '/') {
          handlePdfRequest(req, res).catch(next);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/render-pdf', (req, res, next) => {
        if (req.url === '' || req.url === '/') {
          handlePdfRequest(req, res).catch(next);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), newspaperPdfServerPlugin(), typographyFontsPlugin()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
  },
});
