/* global console, process */
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const artifactDir =
  'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const port = 4197;

async function run() {
  console.log('[Capture] Starting Vite preview server on port ' + port + '...');
  const server = await preview({
    root: webRoot,
    preview: { port },
  });

  console.log('[Capture] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Viewport (1440x900)
    console.log('[Capture] 1. Desktop Viewport (1440px)...');
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);

    // Hero screenshot
    await desktopPage.screenshot({
      path: path.join(artifactDir, 'landing-refined-hero-desktop.png'),
    });

    // Full page screenshot
    await desktopPage.screenshot({
      path: path.join(artifactDir, 'landing-refined-fullpage-desktop.png'),
      fullPage: true,
    });

    // 2. Mobile Viewport (390x844)
    console.log('[Capture] 2. Mobile Viewport (390px)...');
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: path.join(artifactDir, 'landing-refined-hero-mobile.png'),
    });
    await mobilePage.screenshot({
      path: path.join(artifactDir, 'landing-refined-fullpage-mobile.png'),
      fullPage: true,
    });

    console.log('[Capture] All landing page verification screenshots captured successfully!');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
