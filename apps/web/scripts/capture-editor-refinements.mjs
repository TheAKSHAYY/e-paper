/* global console, process */
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const port = 4198;

async function run() {
  console.log('[Capture] Starting Vite preview server on port ' + port + '...');
  const server = await preview({
    root: webRoot,
    preview: { port },
  });

  console.log('[Capture] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile Editor (390x844)
    console.log('[Capture] 1. Mobile Editor Viewport (390px)...');
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(`http://localhost:${port}/?view=split`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: path.join(artifactDir, 'mobile-editor-refined.png'),
    });

    // 2. Mobile Page Setup Drawer
    console.log('[Capture] 2. Mobile Page Setup Drawer...');
    // Click Page Setup in bottom nav or More menu
    const moreBtn = mobilePage.locator('button:has-text("More"), button:has-text("अधिक")');
    if (await moreBtn.count() > 0) {
      await moreBtn.first().click();
      await mobilePage.waitForTimeout(400);
      const pageSetupOpt = mobilePage.locator('button:has-text("Page Setup"), button:has-text("पेज सेटअप")');
      if (await pageSetupOpt.count() > 0) {
        await pageSetupOpt.first().click();
        await mobilePage.waitForTimeout(600);
        await mobilePage.screenshot({
          path: path.join(artifactDir, 'mobile-page-setup-drawer.png'),
        });
      }
    }

    // 3. Mobile Layout Presets Drawer
    console.log('[Capture] 3. Mobile Layout Presets Drawer...');
    const layoutTab = mobilePage.locator('button:has-text("Layout"), button:has-text("लेआउट")');
    if (await layoutTab.count() > 0) {
      await layoutTab.first().click();
      await mobilePage.waitForTimeout(600);
      await mobilePage.screenshot({
        path: path.join(artifactDir, 'mobile-layout-presets-drawer.png'),
      });
    }
    await mobileCtx.close();

    // 4. Desktop Editor (1440x900)
    console.log('[Capture] 4. Desktop Editor Viewport (1440px)...');
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      isMobile: false,
    });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto(`http://localhost:${port}/?view=split`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(artifactDir, 'desktop-editor-refined.png'),
    });

    // 5. Desktop Page Setup Modal
    console.log('[Capture] 5. Desktop Page Setup Modal...');
    const pageSetupBtn = desktopPage.locator('button:has-text("Page Setup"), button:has-text("पेज सेटअप")');
    if (await pageSetupBtn.count() > 0) {
      await pageSetupBtn.first().click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(artifactDir, 'desktop-page-setup-modal.png'),
      });
    }

    // 6. Desktop Presets Modal
    console.log('[Capture] 6. Desktop Presets Modal...');
    const closeBtn = desktopPage.locator('button:has-text("✕"), button:has-text("Cancel")');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await desktopPage.waitForTimeout(400);
    }
    const presetsBtn = desktopPage.locator('button:has-text("Presets"), button:has-text("प्रीसेट")');
    if (await presetsBtn.count() > 0) {
      await presetsBtn.first().click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(artifactDir, 'desktop-presets-modal.png'),
      });
    }
    await desktopCtx.close();

    console.log('[Capture] All verification screenshots captured successfully!');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});

