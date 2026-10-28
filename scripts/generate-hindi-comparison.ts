import { describe, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createNewspaperDocument } from '../packages/template-engine/src/index';
import { RendererWorker } from '../apps/renderer/src/index';

describe('Hindi Body Typography Comparison Generator', () => {
  it('renders side-by-side comparison for classic-hindi-broadsheet page 1', async () => {
    const worker = new RendererWorker({ timeoutMs: 60000 });

    // 1. Doc with Noto Serif Devanagari (preset default)
    const docNoto = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    docNoto.layout.bodyFont = "'Noto Serif Devanagari', serif";
    const pngNoto = await worker.renderToImage(docNoto, { pageNumber: 1, scale: 1.5 });
    console.log('Rendered Noto Serif Devanagari page preview');

    // 2. Doc with Hind as bodyFont
    const docHind = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    docHind.layout.bodyFont = "'Hind', sans-serif";
    const pngHind = await worker.renderToImage(docHind, { pageNumber: 1, scale: 1.5 });
    console.log('Rendered Hind page preview');

    const b64Noto = Buffer.from(pngNoto).toString('base64');
    const b64Hind = Buffer.from(pngHind).toString('base64');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hindi Body Font Comparison</title>
        <style>
          body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #eef1f5; }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 26px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
          .subtitle { font-size: 15px; color: #64748b; }
          .comparison-container { display: flex; gap: 24px; justify-content: center; }
          .column { background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); width: 880px; }
          .column-header { font-size: 18px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-align: center; color: #0f172a; }
          .column img { width: 100%; height: auto; border: 1px solid #cbd5e1; border-radius: 4px; display: block; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Hindi Body Typography Evaluation: classic-hindi-broadsheet (Page 1)</div>
          <div class="subtitle">Side-by-side comparison between Hind (Sans-Serif) and Noto Serif Devanagari (Traditional Editorial Serif)</div>
        </div>
        <div class="comparison-container">
          <div class="column">
            <div class="column-header">Option A: Hind (Current Sans-Serif Body)</div>
            <img src="data:image/png;base64,${b64Hind}" alt="Hind Body" />
          </div>
          <div class="column">
            <div class="column-header">Option B: Noto Serif Devanagari (Editorial Serif Body)</div>
            <img src="data:image/png;base64,${b64Noto}" alt="Noto Serif Devanagari Body" />
          </div>
        </div>
      </body>
      </html>
    `;

    // Render using worker's internal playwright page
    const browser = await (
      worker as unknown as { getBrowser(): Promise<import('playwright').Browser> }
    ).getBrowser();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1600 } });
    await page.setContent(html);
    await page.waitForLoadState('networkidle');

    const compBuffer = await page.screenshot({ fullPage: true });
    await page.close();
    await worker.close();

    const outPath = path.resolve(process.cwd(), 'docs/hindi-body-comparison.png');
    fs.writeFileSync(outPath, compBuffer);
    console.log('Saved comparison to:', outPath, 'Bytes:', compBuffer.length);
  }, 120000);
});
