import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

const files = [
  { id: 'des-002', path: 'epaper_assets_sorted (1)/ads/4d72df_ad3.jpg', title: 'Commercial Display Ad (Gold/Jewellery)' },
  { id: 'des-003', path: 'epaper_assets_sorted (1)/ads/50c9de_ad4.jpg', title: 'Commercial Quarter-Page Ad' },
  { id: 'des-010', path: 'epaper_assets_sorted (1)/calendar/ab15f0_cal_full_1.PNG', title: 'Panchang / Calendar Grid' },
  { id: 'des-012', path: 'epaper_assets_sorted (1)/columns/12col/270bdf_col_12_5.png', title: '12-Column Banner Story' },
  { id: 'des-019', path: 'epaper_assets_sorted (1)/columns/2col/0bb331_col_2_11.PNG', title: '2-Column Vertical Digest' },
  { id: 'des-090', path: 'epaper_assets_sorted (1)/footers/9ec940_f_footer_1.png', title: 'Page Bottom Folio / Footer Rule' },
  { id: 'des-097', path: 'epaper_assets_sorted (1)/headers/t_style/04e9b5_t_header_21.PNG', title: 'Traditional T-Style Header' },
  { id: 'des-130', path: 'epaper_assets_sorted (1)/rashifal/043cbf_rashifal_2.PNG', title: 'Circular Zodiac Rashifal Grid' },
  { id: 'des-134', path: 'epaper_assets_sorted (1)/start-decor/76ca68_start_3.png', title: 'Decorative Section Opener / Kicker Header' },
  { id: 'des-140', path: 'epaper_assets_sorted (1)/subheaders/170565_sub_header_8.png', title: 'Crimson Ribbon Sub-Header / Breaking News' },
];

async function generateInspection() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2600 } });

  let cards = '';
  for (const item of files) {
    const ext = path.extname(item.path).toLowerCase().replace('.', '') === 'png' ? 'png' : 'jpeg';
    const base64 = fs.readFileSync(item.path).toString('base64');
    cards += `
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #38bdf8; margin: 0 0 8px 0;">${item.id} — ${item.title}</h3>
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 12px 0;">Path: ${item.path}</p>
        <div style="background: #ffffff; padding: 12px; border-radius: 4px; text-align: center;">
          <img src="data:image/${ext};base64,${base64}" style="max-width: 100%; max-height: 450px; object-fit: contain;" />
        </div>
      </div>
    `;
  }

  await page.setContent(`
    <!DOCTYPE html><html><body style="font-family:sans-serif; background:#0f172a; padding:24px; color:#f8fafc;">
      <h1 style="text-align:center; color:#38bdf8;">Visual Details of 10 Batch 1 Reference Assets</h1>
      <div style="max-width: 1100px; margin:0 auto;">${cards}</div>
    </body></html>
  `);

  await page.screenshot({ path: 'docs/batch1-details-inspection.png', fullPage: true });
  fs.copyFileSync('docs/batch1-details-inspection.png', 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/batch1-details-inspection.png');
  console.log('✓ Saved inspection image to docs/batch1-details-inspection.png');
  await browser.close();
}

generateInspection();

