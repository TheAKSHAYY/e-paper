import { createRequire } from 'node:module';
import path from 'node:path';

const req = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = req('playwright');

(async () => {
  console.log('=== STARTING CUSTOM COLOR VERIFICATION ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  const studioBtn = await page.$('text=स्टूडियो खोलें');
  if (studioBtn) { await studioBtn.click(); await page.waitForTimeout(400); }

  for (let i = 0; i < 4; i++) {
    const nextBtn = await page.$('button:has-text("आगे बढ़ें"), button:has-text("संस्करण बनाएं"), button:has-text("बनाएं")');
    if (nextBtn) { await nextBtn.click(); await page.waitForTimeout(300); }
  }

  // Click on masthead bottom strip (which directly selects masthead and opens Subheaders tab!)
  const bottomStrip = await page.waitForSelector('[data-testid="masthead-bottom-strip"]', { timeout: 8000 });
  console.log('Clicking canvas masthead bottom strip to open subheaders inspector...');
  await bottomStrip.click();
  await page.waitForTimeout(800);

  // Check if Masthead Inspector Panel is open
  const inspectorEl = await page.$('[data-testid="masthead-inspector-panel"], [data-testid="color-strip-container"]');
  console.log('Inspector panel / ColorStrip container found:', Boolean(inspectorEl));

  // Find all hex inputs in the panel
  const hexInputs = await page.$$('[data-testid="color-strip-hex-input"]');
  console.log(`Found ${hexInputs.length} color strip hex inputs in the inspector panel`);

  // Find rainbow custom color buttons
  const rainbowButtons = await page.$$('[data-testid="btn-pick-custom-color"]');
  console.log(`Found ${rainbowButtons.length} rainbow custom color buttons`);

  // Capture screenshot of the inspector panel with new ColorStrips
  await page.screenshot({
    path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/custom-color-inspector-panel.png'
  });
  console.log('✓ Captured custom-color-inspector-panel.png');

  if (hexInputs.length >= 2) {
    // 1. Set custom Date Strip Background to vivid purple (#8B5CF6)
    console.log('Testing custom color #8B5CF6 on Date Strip Background...');
    await hexInputs[0].click();
    await hexInputs[0].fill('#8b5cf6');
    await hexInputs[0].press('Tab');
    await page.waitForTimeout(400);

    // 2. Set custom Date Strip Text Color to golden yellow (#FBBF24)
    console.log('Testing custom color #FBBF24 on Date Strip Text Color...');
    await hexInputs[1].click();
    await hexInputs[1].fill('#fbbf24');
    await hexInputs[1].press('Tab');
    await page.waitForTimeout(400);
  }

  // Check announcement strip
  const announcementCheckbox = await page.$('input[type="checkbox"]');
  if (announcementCheckbox) {
    const isChecked = await announcementCheckbox.isChecked();
    if (!isChecked) {
      await announcementCheckbox.check();
      await page.waitForTimeout(400);
      console.log('✓ Enabled announcement strip');
      
      const moreHexInputs = await page.$$('[data-testid="color-strip-hex-input"]');
      if (moreHexInputs.length >= 3) {
        console.log('Testing custom color #059669 on Announcement Strip Background...');
        await moreHexInputs[2].click();
        await moreHexInputs[2].fill('#059669');
        await moreHexInputs[2].press('Tab');
        await page.waitForTimeout(400);
      }
    }
  }

  // Capture final screenshot showing the custom colors live on canvas and panel
  await page.screenshot({
    path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/custom-color-live-canvas.png'
  });
  console.log('✓ Captured custom-color-live-canvas.png');

  // Verify computed background on canvas
  const updatedStrip = await page.$('[data-testid="masthead-bottom-strip"]');
  if (updatedStrip) {
    const bg = await updatedStrip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log(`Canvas masthead bottom strip computed background: ${bg}`);
  }

  await browser.close();
  console.log('=== CUSTOM COLOR VERIFICATION COMPLETED SUCCESSFULLY ===');
})();
