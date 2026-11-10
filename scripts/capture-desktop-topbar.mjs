import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

(async () => {
  const br = await chromium.launch({ headless: true });
  const pg = await br.newPage();
  await pg.setViewportSize({ width: 1366, height: 768 });
  await pg.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Click on "स्टूडियो खोलें"
  const studioBtn = await pg.$('text=स्टूडियो खोलें');
  if (studioBtn) {
    await studioBtn.click();
    await pg.waitForTimeout(1000);
  }

  // If Publication Wizard dialog is open, step through or close it:
  // Step 1 -> आगे बढ़ें
  let nextBtn = await pg.$('button:has-text("आगे बढ़ें")');
  if (nextBtn) {
    await nextBtn.click();
    await pg.waitForTimeout(500);
    // Step 2 -> आगे बढ़ें
    nextBtn = await pg.$('button:has-text("आगे बढ़ें")');
    if (nextBtn) {
      await nextBtn.click();
      await pg.waitForTimeout(500);
      // Step 3 -> आगे बढ़ें
      nextBtn = await pg.$('button:has-text("आगे बढ़ें")');
      if (nextBtn) {
        await nextBtn.click();
        await pg.waitForTimeout(500);
        // Step 4 -> बनाएं / संपन्न
        const finishBtn = await pg.$('button:has-text("संस्करण बनाएं"), button:has-text("बनाएं")');
        if (finishBtn) {
          await finishBtn.click();
          await pg.waitForTimeout(2000);
        }
      }
    }
  }

  // Wait for studio canvas / topbar
  await pg.waitForSelector('[data-testid="desktop-top-bar"]', { timeout: 10000 });

  await pg.screenshot({
    path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/desktop-topbar-2row-verified.png',
    fullPage: false
  });

  console.log('STUDIO_CANVAS_TOPBAR_CAPTURED');
  await br.close();
})();
