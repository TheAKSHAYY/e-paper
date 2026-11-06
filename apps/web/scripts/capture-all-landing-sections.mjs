/* global console, process, document, window */
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
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Hero & Masthead (Hindi initial)
    console.log('[Capture] Capturing Masthead & Hero (Hindi)...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, 'sec-1-masthead-hero.png') });

    // 2. English Hero Capture
    console.log('[Capture] Switching to English locale...');
    const enButton = await page.locator('button:has-text("EN")').first();
    if (await enButton.isVisible()) {
      await enButton.click();
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(artifactDir, 'sec-1-masthead-hero-en.png') });
    }

    // 3. Process Workflow (Ref 3)
    console.log('[Capture] Scrolling to #workflow (Process 01, 02, 03)...');
    await page.evaluate(() => {
      document.getElementById('workflow')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'sec-2-process-workflow.png') });

    // 4. Bento Capabilities (Ref 2)
    console.log('[Capture] Scrolling to #features (Bento Capabilities)...');
    await page.evaluate(() => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'sec-3-bento-features.png') });

    // 5. Print Templates
    console.log('[Capture] Scrolling to #showcase (Templates)...');
    await page.evaluate(() => {
      document.getElementById('showcase')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'sec-4-templates.png') });

    // 6. Final CTA & Footer (Ref 4)
    console.log('[Capture] Scrolling to footer (Dark CTA & Footer)...');
    await page.evaluate(() => {
      document.querySelector('footer')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'sec-5-dark-cta-footer.png') });

    console.log('[Capture] All section captures complete!');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
