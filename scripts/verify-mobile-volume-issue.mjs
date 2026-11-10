import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const req = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = req('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/#editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click on masthead
  const masthead = page.locator('[data-testid="masthead-section"]');
  await masthead.click();
  await page.waitForTimeout(600);

  // Take screenshot with masthead selected
  await page.screenshot({ path: 'docs/mobile-masthead-with-volume-button.png' });
  fs.copyFileSync(
    'docs/mobile-masthead-with-volume-button.png',
    'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-masthead-with-volume-button.png'
  );
  console.log('✓ Screenshot 1: docs/mobile-masthead-with-volume-button.png');

  // Click on 'वर्ष 78 • अंक 142 हटाएँ'
  const removeBtn = page.locator('[data-testid="btn-banner-remove-volume-issue"]');
  if (await removeBtn.isVisible()) {
    await removeBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'docs/mobile-masthead-volume-removed.png' });
    fs.copyFileSync(
      'docs/mobile-masthead-volume-removed.png',
      'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-masthead-volume-removed.png'
    );
    console.log('✓ Screenshot 2: docs/mobile-masthead-volume-removed.png');
  }

  await browser.close();
})();
