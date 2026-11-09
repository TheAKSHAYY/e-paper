/* global console, process, document, window */
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const artifactDir =
  'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const port = 4199;

async function run() {
  console.log('[Typography Verification] Starting preview server on port ' + port + '...');
  const server = await preview({
    root: webRoot,
    preview: { port },
  });

  console.log('[Typography Verification] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  const fontRequests = [];
  let totalFontBytes = 0;

  try {
    // -------------------------------------------------------------
    // 1. Initial Page Load Performance & Font Request Interception
    // -------------------------------------------------------------
    console.log('[Typography Verification] 1. Intercepting initial font requests on load...');
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await desktopCtx.newPage();

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/fonts/') && url.endsWith('.woff2')) {
        const fontName = path.basename(url);
        try {
          const buffer = await response.body();
          const size = buffer.length;
          fontRequests.push({ fontName, size, url });
          totalFontBytes += size;
        } catch {
          // ignore stream errors
        }
      }
    });

    await page.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log(
      `[Typography Verification] Initial page load requested ${fontRequests.length} fonts totaling ${(totalFontBytes / 1024).toFixed(1)} KB.`
    );
    for (const f of fontRequests) {
      console.log(`   - ${f.fontName}: ${(f.size / 1024).toFixed(1)} KB`);
    }

    // -------------------------------------------------------------
    // 2. Real Typography Content Quality Tests
    // -------------------------------------------------------------
    console.log('[Typography Verification] 2. Rendering Real String Visual Benchmarks...');

    // Inject dedicated typography verification container into page to verify exact user strings
    await page.evaluate(() => {
      const testCard = document.createElement('div');
      testCard.id = 'typography-specimen-board';
      testCard.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        right: 24px;
        background: #FAF8F5;
        border: 2px solid #1C1917;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 20px 48px rgba(0,0,0,0.25);
        z-index: 99999;
        max-width: 960px;
        margin: 0 auto;
        font-family: var(--font-ui-sans);
      `;
      testCard.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #DC2626; text-transform: uppercase; margin-bottom: 12px;">
          TYPOGRAPHY QUALITY BENCHMARK — ENGLISH & DEVANAGARI (HINDI)
        </div>
        
        <!-- English Test Content -->
        <div style="margin-bottom: 18px; border-bottom: 1px solid #E7E2DA; padding-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 600; color: #78716C; text-transform: uppercase; margin-bottom: 4px;">English Specimen</div>
          <h2 style="font-family: var(--font-ui-display); font-size: 26px; font-weight: 800; font-style: italic; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 4px 0; color: #1C1917;">
            Create a professional newspaper layout.
          </h2>
          <div style="font-family: var(--font-ui-sans); font-size: 15px; font-weight: 600; line-height: 1.4; color: #292524; margin-bottom: 2px;">
            Manage your publication.
          </div>
          <div style="font-family: var(--font-ui-sans); font-size: 13.5px; font-weight: 400; line-height: 1.55; color: #57534E;">
            Select your preferred page size.
          </div>
        </div>

        <!-- Hindi Test Content -->
        <div style="margin-bottom: 18px; border-bottom: 1px solid #E7E2DA; padding-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 600; color: #78716C; text-transform: uppercase; margin-bottom: 4px;">शुद्ध, स्पष्ट और स्वाभाविक हिंदी</div>
          <h2 style="font-family: var(--font-ui-hindi-display); font-size: 26px; font-weight: 800; line-height: 1.35; letter-spacing: 0em; margin: 0 0 6px 0; color: #1C1917;">
            अपना समाचार पत्र तैयार करें।
          </h2>
          <div style="font-family: var(--font-ui-hindi); font-size: 15.5px; font-weight: 600; line-height: 1.45; color: #292524; margin-bottom: 4px;">
            पृष्ठ का आकार और लेआउट चुनें।
          </div>
          <div style="font-family: var(--font-ui-hindi); font-size: 14px; font-weight: 400; line-height: 1.6; color: #57534E;">
            समाचार और लेख यहाँ संपादित करें।
          </div>
        </div>

        <!-- Mixed Language & Local Newspaper Test Content -->
        <div>
          <div style="font-size: 11px; font-weight: 600; color: #78716C; text-transform: uppercase; margin-bottom: 4px;">Local Hindi & Mixed Language Alignment</div>
          <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: baseline;">
            <div style="font-family: var(--font-ui-hindi-display); font-size: 18px; font-weight: 700; color: #1C1917; line-height: 1.35;">
              आज की मुख्य खबरें — Today's Headlines
            </div>
            <div style="font-family: var(--font-ui-hindi); font-size: 14px; color: #44403C; line-height: 1.5;">
              Page Setup में अपने अखबार का आकार चुनें।
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 12.5px; color: #78716C; font-family: var(--font-ui-hindi);">
            <span>• शहर की ताज़ा जानकारी</span>
            <span>• जनता से जुड़ी महत्वपूर्ण खबरें</span>
            <span>• स्थानीय समाचार और विशेष रिपोर्ट</span>
          </div>
        </div>
      `;
      document.body.appendChild(testCard);
    });

    await page.waitForTimeout(600);
    const specimenElement = await page.$('#typography-specimen-board');
    if (specimenElement) {
      await specimenElement.screenshot({
        path: path.join(artifactDir, 'typography-specimen-proof-1440px.png'),
      });
      console.log('   ✓ Captured typography-specimen-proof-1440px.png');
    }

    // Remove specimen board before full page captures
    await page.evaluate(() => {
      document.getElementById('typography-specimen-board')?.remove();
    });

    // -------------------------------------------------------------
    // 3. Desktop Captures (English & Hindi)
    // -------------------------------------------------------------
    console.log('[Typography Verification] 3. Capturing Desktop Views (EN & HI)...');

    // Switch to English
    const enBtn = await page.locator('button:has-text("EN")').first();
    if (await enBtn.isVisible()) {
      await enBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(artifactDir, 'typo-desktop-en-hero.png') });

    // Switch to Hindi
    const hiBtn = await page.locator('button:has-text("हिन्दी")').first();
    if (await hiBtn.isVisible()) {
      await hiBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(artifactDir, 'typo-desktop-hi-hero.png') });

    // -------------------------------------------------------------
    // 4. Multi-Viewport Mobile Responsive Testing (320px, 360px, 390px, 430px)
    // -------------------------------------------------------------
    const mobileViewports = [
      { name: '320px', width: 320, height: 640 },
      { name: '360px', width: 360, height: 740 },
      { name: '390px', width: 390, height: 844 },
      { name: '430px', width: 430, height: 932 },
    ];

    for (const vp of mobileViewports) {
      console.log(`[Typography Verification] 4. Testing responsive viewport ${vp.name}...`);
      const mCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const mPage = await mCtx.newPage();
      await mPage.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
      await mPage.waitForTimeout(500);

      // Check horizontal overflow
      const hasHorizontalScroll = await mPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      console.log(`   - Viewport ${vp.name}: horizontal overflow = ${hasHorizontalScroll}`);

      await mPage.screenshot({
        path: path.join(artifactDir, `typo-mobile-${vp.name}.png`),
      });

      await mCtx.close();
    }

    // -------------------------------------------------------------
    // 5. Modal Typography Verification
    // -------------------------------------------------------------
    console.log('[Typography Verification] 5. Capturing Modal Typography...');

    // Open About Modal
    await page.evaluate(() => {
      const aboutBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.includes('परिचय') || b.textContent.includes('About')
      );
      if (aboutBtn) aboutBtn.click();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'typo-modal-about.png') });

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Save metrics JSON
    const metricsData = {
      timestamp: new Date().toISOString(),
      fontRequestsCount: fontRequests.length,
      totalFontBytes,
      fontRequests,
    };
    fs.writeFileSync(
      path.join(artifactDir, 'typography-metrics.json'),
      JSON.stringify(metricsData, null, 2)
    );

    console.log('[Typography Verification] Complete! Results saved to artifacts.');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run().catch((err) => {
  console.error('[Verification Error]', err);
  process.exit(1);
});
