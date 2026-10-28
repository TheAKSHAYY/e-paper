import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { preview, type PreviewServer } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';

describe('Vite Preview Font Delivery', () => {
  let server: PreviewServer;
  const webRoot = path.resolve(__dirname, '..');
  const port = 4199;

  beforeAll(async () => {
    server = await preview({
      root: webRoot,
      preview: { port },
    });
  });

  afterAll(() => {
    server.httpServer.close();
  });

  it('should serve index.html with fonts.css referenced', async () => {
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('/fonts/fonts.css');
  });

  it('should return 200 for every font file in dist/fonts', async () => {
    const fontsDir = path.join(webRoot, 'dist/fonts');
    expect(fs.existsSync(fontsDir)).toBe(true);
    const fontFiles = fs.readdirSync(fontsDir);
    expect(fontFiles.length).toBeGreaterThan(20);

    for (const font of fontFiles) {
      const res = await fetch(`http://localhost:${port}/fonts/${font}`);
      expect(res.status, `Font ${font} failed to return 200`).toBe(200);
      const buffer = await res.arrayBuffer();
      expect(buffer.byteLength).toBeGreaterThan(0);
    }
  });
});
