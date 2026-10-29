import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { preview, type PreviewServer } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { SELF_HOSTED_FONTS_CSS } from '@epaper-studio/typography';

describe('Vite Preview Font Delivery (Production Build Validation)', () => {
  let server: PreviewServer;
  const webRoot = path.resolve(__dirname, '..');
  const port = 4199;

  beforeAll(async () => {
    // Starts Vite preview server pointing directly at apps/web/dist/
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

  it('should serve /fonts/fonts.css with 200 OK and valid CSS content', async () => {
    const res = await fetch(`http://localhost:${port}/fonts/fonts.css`);
    expect(res.status).toBe(200);
    const css = await res.text();
    expect(css.length).toBeGreaterThan(1000);
    expect(css).toContain('@font-face');
    expect(css).toContain('url(/fonts/');
  });

  it('should return 200 for every font file in dist/fonts', async () => {
    const fontsDir = path.join(webRoot, 'dist/fonts');
    expect(fs.existsSync(fontsDir)).toBe(true);
    const fontFiles = fs.readdirSync(fontsDir).filter((f) => f.endsWith('.woff2'));
    expect(fontFiles.length).toBeGreaterThanOrEqual(40);

    for (const font of fontFiles) {
      const res = await fetch(`http://localhost:${port}/fonts/${font}`);
      expect(res.status, `Font /fonts/${font} failed to return 200`).toBe(200);
      const buffer = await res.arrayBuffer();
      expect(buffer.byteLength, `Font ${font} is empty`).toBeGreaterThan(0);
    }
  }, 25000);

  it('should confirm all @font-face URLs in print HTML resolve with 200 OK against static production build', async () => {
    // Extract every url(...) path from SELF_HOSTED_FONTS_CSS (the CSS embedded in print HTML)
    const urlRegex = /url\((?:['"]?)([^'")]+)(?:['"]?)\)/g;
    const fontUrls: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = urlRegex.exec(SELF_HOSTED_FONTS_CSS)) !== null) {
      if (match[1]) {
        fontUrls.push(match[1]);
      }
    }

    expect(fontUrls.length).toBeGreaterThanOrEqual(16);

    for (const fontUrl of fontUrls) {
      // Clean path (e.g. /fonts/noto-serif-devanagari-400.woff2)
      const cleanPath = fontUrl.startsWith('/') ? fontUrl : `/${fontUrl}`;
      const res = await fetch(`http://localhost:${port}${cleanPath}`);
      expect(res.status, `Print font ${cleanPath} returned ${res.status}`).toBe(200);
      const data = await res.arrayBuffer();
      expect(data.byteLength).toBeGreaterThan(1000);
    }
  }, 25000);
});
