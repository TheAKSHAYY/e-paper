import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const req = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = req('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1600 } });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { background: #1e293b; color: #f8fafc; font-family: system-ui, sans-serif; padding: 24px; }
      .container { display: flex; flex-direction: column; gap: 32px; max-width: 1350px; margin: 0 auto; }
      .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
      h2 { margin-top: 0; color: #38bdf8; font-size: 18px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
      .meta { font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
      .img-wrapper { background: #ffffff; padding: 12px; border-radius: 8px; overflow: hidden; display: flex; justify-content: center; }
      img { max-width: 100%; height: auto; object-fit: contain; border: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h2>1. des-103: Traditional Newspaper Masthead</h2>
        <div class="meta">Original File: epaper_assets_sorted (1)/headers/t_style/7aac82_t_header_10n.png (1317 × 271 px)</div>
        <div class="img-wrapper">
          <img src="http://localhost:5173/design-library/references/des-103-7aac82_t_header_10n.png" alt="des-103" />
        </div>
      </div>

      <div class="card">
        <h2>2. des-041: Four-column Article Layout</h2>
        <div class="meta">Original File: epaper_assets_sorted (1)/columns/4col/01c50b_col_4_1.PNG (307 × 260 px)</div>
        <div class="img-wrapper">
          <img src="http://localhost:5173/design-library/references/des-041-01c50b_col_4_1.PNG" alt="des-041" />
        </div>
      </div>

      <div class="card">
        <h2>3. des-132: Daily Rashifal Layout</h2>
        <div class="meta">Original File: epaper_assets_sorted (1)/rashifal/a7daf2_rashifal_1.PNG (243 × 504 px)</div>
        <div class="img-wrapper">
          <img src="http://localhost:5173/design-library/references/des-132-a7daf2_rashifal_1.PNG" alt="des-132" />
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/inspect-3-references.png', fullPage: true });
  fs.copyFileSync(
    'docs/inspect-3-references.png',
    'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/inspect-3-references.png'
  );
  console.log('Saved docs/inspect-3-references.png and copied to artifacts.');
  await browser.close();
}

main().catch(console.error);

