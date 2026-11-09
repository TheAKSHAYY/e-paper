/* global console, process */
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const artifactDir =
  'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const port = 4199;

async function run() {
  console.log('[Capture] Starting Vite preview server...');
  const server = await preview({
    root: webRoot,
    preview: { port },
  });

  console.log('[Capture] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  const breakpoints = [
    { name: 'mobile-390', width: 390, height: 844, isMobile: true },
    { name: 'tablet-768', width: 768, height: 1024, isMobile: false },
    { name: 'laptop-1024', width: 1024, height: 768, isMobile: false },
    { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
  ];

  try {
    for (const bp of breakpoints) {
      console.log(`[Capture] Processing Breakpoint: ${bp.name} (${bp.width}x${bp.height})...`);
      const context = await browser.newContext({
        viewport: { width: bp.width, height: bp.height },
        deviceScaleFactor: 2,
        isMobile: bp.isMobile,
        hasTouch: bp.isMobile,
      });
      const page = await context.newPage();

      // 1. Landing
      await page.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(artifactDir, `landing-${bp.name}.png`),
        fullPage: false,
      });

      // 2. Dashboard
      await page.goto(`http://localhost:${port}/?view=dashboard`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(artifactDir, `dashboard-${bp.name}.png`),
        fullPage: false,
      });

      // 3. Editor
      await page.goto(`http://localhost:${port}/?view=split`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: path.join(artifactDir, `editor-${bp.name}.png`),
        fullPage: false,
      });

      // If desktop, also capture modal and continuation inspector
      if (bp.name === 'desktop-1440') {
        // Wizard Modal
        await page.goto(`http://localhost:${port}/?view=dashboard`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        const newEditionBtn = page.locator('button:has-text("नया संस्करण बनाएं")');
        if ((await newEditionBtn.count()) > 0) {
          await newEditionBtn.first().click();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(artifactDir, 'new-edition-wizard.png'),
            fullPage: false,
          });
        }

        // Continuation Inspector
        await page.goto(`http://localhost:${port}/?view=split`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1200);
        const firstArticle = page.locator('.newspaper-article').first();
        if ((await firstArticle.count()) > 0) {
          await firstArticle.click();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(artifactDir, 'editor-continuation.png'),
            fullPage: false,
          });
        }
      }

      await context.close();
    }

    console.log('[Capture] Successfully captured all responsive visual audit screenshots!');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
