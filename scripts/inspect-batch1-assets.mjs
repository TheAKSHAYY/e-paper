import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

const manifestData = JSON.parse(fs.readFileSync('apps/web/public/design-library/manifest.json', 'utf8'));
const items = manifestData.items;

const batch1Ids = [
  'des-002', 'des-003', 'des-010', 'des-012', 'des-019',
  'des-090', 'des-097', 'des-130', 'des-134', 'des-140'
];

const selectedItems = items.filter(it => batch1Ids.includes(it.id));

async function inspectAssets() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });

  let cardsHtml = '';
  for (const item of selectedItems) {
    const origPath = path.resolve('epaper_assets_sorted (1)', item.originalPath);
    const exists = fs.existsSync(origPath);
    const base64 = exists ? fs.readFileSync(origPath).toString('base64') : '';
    const ext = path.extname(origPath).toLowerCase().replace('.', '') === 'png' ? 'png' : 'jpeg';

    cardsHtml += `
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #334155; padding-bottom: 8px;">
          <div>
            <span style="font-weight: 800; font-size: 16px; color: #38bdf8;">${item.id}</span>
            <span style="background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">${item.category} / ${item.subcategory}</span>
          </div>
          <span style="color: #94a3b8; font-size: 12px;">File: ${item.filename} (${item.width}×${item.height})</span>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 6px; text-align: center;">
          ${exists ? `<img src="data:image/${ext};base64,${base64}" style="max-width: 100%; max-height: 400px; object-fit: contain; background: #fff; border-radius: 4px;" />` : '<span style="color:red">FILE NOT FOUND</span>'}
        </div>
      </div>
    `;
  }

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Batch 1 Reference Assets Inspection</title>
      <style>body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }</style>
    </head>
    <body>
      <h1 style="text-align: center; color: #38bdf8;">Batch 1: 10 Reference Assets Visual Inspection</h1>
      <div style="max-width: 1100px; margin: 0 auto;">${cardsHtml}</div>
    </body>
    </html>
  `;

  await page.setContent(fullHtml, { waitUntil: 'load' });
  const outPath = path.resolve('docs/batch1-references-inspection.png');
  await page.screenshot({ path: outPath, fullPage: true });
  fs.copyFileSync(outPath, 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/batch1-references-inspection.png');
  console.log('✓ Batch 1 reference inspection sheet saved to docs/batch1-references-inspection.png');
  await browser.close();
}

inspectAssets();

