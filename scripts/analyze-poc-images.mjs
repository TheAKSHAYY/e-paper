import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

const pocFiles = [
  { id: 'des-103', file: 'des-103-7aac82_t_header_10n.png', type: 'header-traditional', name: 'पारंपरिक ब्रॉडशीट मास्टहेड (Classic Broadsheet Header)' },
  { id: 'des-115', file: 'des-115-3c38b3_t2_header_6.png', type: 'header-modern', name: 'आधुनिक समाचार पत्र हेडर (Modern Broadsheet Masthead)' },
  { id: 'des-119', file: 'des-119-628412_t2_header_14.png', type: 'header-regional', name: 'क्षेत्रीय संस्करण हेडर (Regional Highlight Masthead)' },
  { id: 'des-041', file: 'des-041-01c50b_col_4_1.PNG', type: 'article-lead', name: 'प्रमुख समाचार ब्लॉक (Lead Story with Dateline)' },
  { id: 'des-054', file: 'des-054-3e8f56_col_6_2.png', type: 'article-composite', name: 'समग्र 6-कॉलम समाचार (Composite News with Hero Photo)' },
  { id: 'des-022', file: 'des-022-3c1a26_col_2_2.png', type: 'multicolumn-2col', name: '2-कॉलम समाचार डाइजेस्ट (2-Column Vertical Digest)' },
  { id: 'des-033', file: 'des-033-190d90_col_3_1.png', type: 'multicolumn-3col', name: '3-कॉलम फ़ीचर लेआउट (3-Column Feature Layout)' },
  { id: 'des-142', file: 'des-142-9c331a_sub_header_1.png', type: 'breaking-news', name: 'ब्रेकिंग न्यूज़ पट्टी (Red Alert Breaking Banner)' },
  { id: 'des-132', file: 'des-132-a7daf2_rashifal_1.PNG', type: 'rashifal', name: 'दैनिक राशिफल चक्र (Daily Rashifal 12-Zodiac Panel)' },
  { id: 'des-001', file: 'des-001-3843c9_advt.png', type: 'advertisement', name: 'व्यावसायिक विज्ञापन ब्लॉक (Commercial Display Ad)' }
];

async function analyze() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('--- Analyzing 10 Representative POC Reference Designs ---');
  const results = [];

  for (const item of pocFiles) {
    const fullPath = path.resolve('apps/web/public/design-library/references', item.file);
    const buf = fs.readFileSync(fullPath);
    const base64 = buf.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; background: #fff;">
          <img id="ref-img" src="${dataUri}" style="display: block; max-width: 100%;" />
          <canvas id="cvs"></canvas>
        </body>
      </html>
    `);

    const imgInfo = await page.evaluate(() => {
      const img = document.getElementById('ref-img');
      const cvs = document.getElementById('cvs');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const w = cvs.width;
      const h = cvs.height;
      const getPixel = (x, y) => {
        const p = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return '#' + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      const bgCorner = getPixel(2, 2);
      const centerPixel = getPixel(w / 2, h / 2);
      const topStrip = getPixel(w / 2, 4);
      const bottomStrip = getPixel(w / 2, h - 4);

      return {
        width: w,
        height: h,
        aspect: (w / h).toFixed(2),
        bgCorner,
        centerPixel,
        topStrip,
        bottomStrip
      };
    });

    results.push({
      ...item,
      ...imgInfo
    });
    console.log(`[${item.id}] ${item.type} — ${imgInfo.width}x${imgInfo.height} (Aspect: ${imgInfo.aspect})`);
    console.log(`       Sample colors: bg=${imgInfo.bgCorner}, center=${imgInfo.centerPixel}, top=${imgInfo.topStrip}`);
  }

  await browser.close();
  fs.writeFileSync('docs/poc-analysis-results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved analysis results to docs/poc-analysis-results.json');
}

analyze();
