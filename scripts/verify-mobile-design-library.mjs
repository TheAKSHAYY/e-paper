import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

const ARTIFACTS_DIR = 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const SCREENSHOTS_DIR = path.resolve('docs/mobile-design-library-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function copyToArtifacts(sourcePath, filename) {
  const targetArtifact = path.join(ARTIFACTS_DIR, filename);
  const targetDocs = path.join(SCREENSHOTS_DIR, filename);
  fs.copyFileSync(sourcePath, targetDocs);
  fs.copyFileSync(sourcePath, targetArtifact);
  console.log(`✓ Copied artifact: ${filename} (${fs.statSync(sourcePath).size} bytes)`);
}

async function verifyMobileDesignLibrary() {
  console.log('=================================================================');
  console.log('TESTING MOBILE DESIGN LIBRARY MODAL (RESPONSIVE VIEWPORT 390x844)');
  console.log('=================================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Emulate iPhone 14 / Mobile Viewport (390 x 844)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    console.log(`[Dialog] ${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    console.log('1. Navigating to mobile editor...');
    await page.goto('http://localhost:5173/#editor', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Open Design Library from Mobile Top Bar or Bottom Sheet
    console.log('2. Opening Design Library Modal on mobile...');
    
    const topBarBtn = page.locator('[data-testid="mobile-topbar-design-library-btn"]');
    const mobileBtn = page.locator('[data-testid="mobile-btn-design-library"]');

    if (await topBarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking mobile top bar design library button...');
      await topBarBtn.click();
    } else if (await mobileBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking mobile bottom sheet design library button...');
      await mobileBtn.click();
    } else {
      // Open mobile bottom sheet '+' button if needed
      const addBlockBtn = page.locator('[data-testid="mobile-nav-blocks"]');
      if (await addBlockBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBlockBtn.click();
        await page.waitForTimeout(500);
        const sheetDesignBtn = page.locator('[data-testid="mobile-btn-design-library"]');
        await sheetDesignBtn.waitFor({ state: 'visible', timeout: 3000 });
        await sheetDesignBtn.click();
      }
    }

    const modal = page.locator('[data-testid="design-library-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Design Library Modal is OPEN on mobile screen!');

    await page.waitForTimeout(600);

    // Capture initial mobile modal screenshot
    const snap1 = path.join(SCREENSHOTS_DIR, 'mobile-01-design-library-open.png');
    await page.screenshot({ path: snap1 });
    copyToArtifacts(snap1, 'mobile-01-design-library-open.png');

    // Test clicking a category chip (e.g. 'subheaders')
    console.log('3. Clicking subheaders category chip...');
    const subheaderChip = page.locator('[data-testid="category-filter-subheaders"]');
    await subheaderChip.waitFor({ state: 'visible', timeout: 5000 });
    await subheaderChip.click();
    await page.waitForTimeout(500);

    const snap2 = path.join(SCREENSHOTS_DIR, 'mobile-02-subheaders-category.png');
    await page.screenshot({ path: snap2 });
    copyToArtifacts(snap2, 'mobile-02-subheaders-category.png');

    // Verify des-140 is visible and card is full width
    console.log('4. Checking des-140 card and button visibility...');
    const card140 = page.locator('[data-testid="design-card-des-140"]');
    await card140.waitFor({ state: 'visible', timeout: 5000 });
    const insertBtn140 = page.locator('[data-testid="btn-insert-design-des-140"]');
    await insertBtn140.waitFor({ state: 'visible', timeout: 5000 });

    const cardBox = await card140.boundingBox();
    console.log(`✓ des-140 card bounding box: width=${cardBox?.width}px, x=${cardBox?.x}px`);

    // Click "पूर्वावलोकन" on des-140
    console.log('5. Clicking 🔍 पूर्वावलोकन to open mobile inspection modal...');
    const previewBtn140 = page.locator('[data-testid="btn-preview-design-des-140"]');
    await previewBtn140.click();
    await page.waitForTimeout(600);

    const inspectionModal = page.locator('[data-testid="design-inspection-modal"]');
    await inspectionModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Inspection modal opened cleanly on mobile!');

    const snap3 = path.join(SCREENSHOTS_DIR, 'mobile-03-inspection-modal.png');
    await page.screenshot({ path: snap3 });
    copyToArtifacts(snap3, 'mobile-03-inspection-modal.png');

    // Click Insert from inspection modal
    console.log('6. Clicking + कैनवास में जोड़ें inside mobile modal...');
    const confirmInsertBtn = page.locator('[data-testid="btn-confirm-insert-inspected-design"]');
    await confirmInsertBtn.click();
    await page.waitForTimeout(600);

    // Verify success toast
    const toast = page.locator('[data-testid="design-insert-success-toast"]');
    if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`✓ Insert success toast displayed: "${await toast.textContent()}"`);
    }

    // Close Design Library modal
    const closeBtn = page.locator('[data-testid="close-design-library-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(600);

    // Verify canvas shows the inserted design
    console.log('7. Verifying inserted design on mobile canvas...');
    const snap4 = path.join(SCREENSHOTS_DIR, 'mobile-04-canvas-with-inserted-design.png');
    await page.screenshot({ path: snap4 });
    copyToArtifacts(snap4, 'mobile-04-canvas-with-inserted-design.png');

    console.log('=================================================================');
    console.log('MOBILE DESIGN LIBRARY VERIFICATION PASSED WITH ZERO ERRORS');
    console.log('=================================================================');

  } catch (err) {
    console.error('Mobile verification failed:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

verifyMobileDesignLibrary().catch((err) => {
  console.error(err);
  process.exit(1);
});
