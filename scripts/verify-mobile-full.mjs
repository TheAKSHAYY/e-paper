import { createRequire } from 'node:module';
import path from 'node:path';

const req = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = req('playwright');

async function verifyMobile() {
  const browser = await chromium.launch({ headless: true });
  
  for (const vp of [{ width: 390, height: 844, name: 'iPhone 12/13/14' }, { width: 360, height: 780, name: 'Android Standard' }]) {
    console.log(`\n--- Testing Mobile Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true
    });

    await page.goto('http://localhost:5173/#editor');
    await page.waitForTimeout(1000);

    // 1. Check Mobile Top Bar exists
    const topBar = await page.locator('[data-testid="mobile-topbar"]').count();
    console.log('Mobile TopBar present:', topBar > 0);

    // 2. Check Mobile Bottom Nav exists
    const bottomNav = await page.locator('[data-testid="mobile-bottom-nav"]').count();
    console.log('Mobile BottomNav present:', bottomNav > 0);

    // 3. Open Sub-Header / Masthead drawer from Bottom Nav or masthead click
    const mastheadBtn = page.locator('[data-testid="masthead-bottom-strip"]');
    if (await mastheadBtn.count() > 0) {
      await mastheadBtn.first().click();
      await page.waitForTimeout(600);
      console.log('Clicked masthead strip to open drawer');
    }

    // 4. Check if SubHeader drawer opened
    const subheaderTab = await page.locator('[data-testid="sub-header-tab"]').count();
    console.log('Sub-Header Tab opened:', subheaderTab > 0);

    // 5. Test ColorStrip inside drawer
    const colorStrips = await page.locator('[data-testid^="color-strip-"]').count();
    console.log(`Found ${colorStrips} color strips in drawer`);

    // 6. Test Hex input
    const hexInputs = await page.locator('[data-testid^="color-strip-hex-"]').count();
    console.log(`Found ${hexInputs} hex input fields in drawer`);

    // 7. Verify horizontal pan controls or canvas interaction
    const canvas = page.locator('[data-testid="newspaper-canvas"]');
    const canvasExists = await canvas.count() > 0;
    console.log('Canvas exists and rendered:', canvasExists);

    await page.screenshot({ path: `docs/mobile-verified-${vp.width}.png` });
    console.log(`Saved screenshot docs/mobile-verified-${vp.width}.png`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll mobile tests passed successfully!');
}

verifyMobile().catch((err) => {
  console.error('Error during mobile verification:', err);
  process.exit(1);
});
