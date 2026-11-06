/* global console, process, document, window */
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const port = 4196;

async function runAudit() {
  console.log('[Audit] Starting Vite preview server on port ' + port + '...');
  const server = await preview({
    root: webRoot,
    preview: { port },
  });

  console.log('[Audit] Launching Chromium for UX/UI & Gravitas Audit...');
  const browser = await chromium.launch({ headless: true });

  const auditResults = {
    timestamp: new Date().toISOString(),
    pagesAudited: [],
    consoleErrors: [],
    contrastFindings: [],
    touchTargetFindings: [],
    horizontalOverflowFindings: [],
    focusRingFindings: [],
    bilingualFindings: [],
  };

  try {
    // -------------------------------------------------------------
    // 1. AUDIT DESKTOP LANDING (1440x900)
    // -------------------------------------------------------------
    console.log('[Audit] Inspecting Desktop Landing Page (1440px)...');
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const desktopPage = await desktopCtx.newPage();

    desktopPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        auditResults.consoleErrors.push({ page: 'desktop-landing', text: msg.text() });
      }
    });

    await desktopPage.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);

    // Check for horizontal overflow
    const desktopOverflow = await desktopPage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (desktopOverflow) {
      auditResults.horizontalOverflowFindings.push({ page: 'desktop-landing', hasOverflow: true });
    }

    // Inspect heading hierarchy
    const desktopHeadings = await desktopPage.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim());
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());
      return { h1Count: h1s.length, h1s, h2Count: h2s.length, h2s, h3Count: h3s.length };
    });

    // Check touch targets & contrast on Desktop
    const buttonMetrics = await desktopPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.map(b => {
        const rect = b.getBoundingClientRect();
        const style = window.getComputedStyle(b);
        return {
          text: (b.innerText || b.getAttribute('aria-label') || '').slice(0, 30).trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
          color: style.color,
          bgColor: style.backgroundColor,
        };
      }).filter(b => b.visible);
    });

    await desktopPage.screenshot({
      path: path.join(artifactDir, 'audit-landing-desktop.png'),
      fullPage: true,
    });

    auditResults.pagesAudited.push({
      view: 'desktop-landing',
      viewport: '1440x900',
      headings: desktopHeadings,
      buttonCount: buttonMetrics.length,
      sampleButtons: buttonMetrics.slice(0, 10),
      hasHorizontalOverflow: desktopOverflow,
    });

    // -------------------------------------------------------------
    // 2. AUDIT MOBILE LANDING (390x844 - iPhone 14/15)
    // -------------------------------------------------------------
    console.log('[Audit] Inspecting Mobile Landing Page (390px)...');
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();

    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        auditResults.consoleErrors.push({ page: 'mobile-landing', text: msg.text() });
      }
    });

    await mobilePage.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (mobileOverflow) {
      auditResults.horizontalOverflowFindings.push({ page: 'mobile-landing', hasOverflow: true });
    }

    // Measure mobile touch targets (< 44px height or width)
    const mobileSmallTargets = await mobilePage.evaluate(() => {
      const clickables = Array.from(document.querySelectorAll('button, a, input, select'));
      const small = [];
      clickables.forEach(c => {
        const rect = c.getBoundingClientRect();
        const style = window.getComputedStyle(c);
        if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
          if (rect.width < 44 || rect.height < 44) {
            small.push({
              text: (c.innerText || c.getAttribute('aria-label') || c.tagName).slice(0, 30).trim(),
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            });
          }
        }
      });
      return small;
    });

    await mobilePage.screenshot({
      path: path.join(artifactDir, 'audit-landing-mobile.png'),
      fullPage: true,
    });

    auditResults.pagesAudited.push({
      view: 'mobile-landing',
      viewport: '390x844',
      smallTargetsCount: mobileSmallTargets.length,
      sampleSmallTargets: mobileSmallTargets.slice(0, 10),
      hasHorizontalOverflow: mobileOverflow,
    });

    // -------------------------------------------------------------
    // 3. AUDIT DASHBOARD (Desktop & Mobile)
    // -------------------------------------------------------------
    console.log('[Audit] Inspecting Publisher Dashboard...');
    await desktopPage.goto(`http://localhost:${port}/?view=dashboard`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(800);
    await desktopPage.screenshot({
      path: path.join(artifactDir, 'audit-dashboard-desktop.png'),
    });

    await mobilePage.goto(`http://localhost:${port}/?view=dashboard`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: path.join(artifactDir, 'audit-dashboard-mobile.png'),
    });

    // -------------------------------------------------------------
    // 4. AUDIT STUDIO EDITOR (Desktop & Mobile)
    // -------------------------------------------------------------
    console.log('[Audit] Inspecting Studio Editor...');
    await desktopPage.goto(`http://localhost:${port}/?view=split`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1200);
    await desktopPage.screenshot({
      path: path.join(artifactDir, 'audit-editor-desktop.png'),
    });

    await mobilePage.goto(`http://localhost:${port}/?view=split`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1200);
    await mobilePage.screenshot({
      path: path.join(artifactDir, 'audit-editor-mobile.png'),
    });

    // -------------------------------------------------------------
    // 5. AUDIT PAGE SETUP & PRESETS MODALS
    // -------------------------------------------------------------
    console.log('[Audit] Inspecting Modals & Drawers...');
    const pageSetupBtn = desktopPage.locator('button:has-text("Page Setup"), button:has-text("पेज सेटअप")');
    if (await pageSetupBtn.count() > 0) {
      await pageSetupBtn.first().click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(artifactDir, 'audit-page-setup-modal.png'),
      });

      // Verify modal accessibility attributes
      const modalAttrs = await desktopPage.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return null;
        return {
          role: modal.getAttribute('role'),
          ariaModal: modal.getAttribute('aria-modal'),
          ariaLabelledby: modal.getAttribute('aria-labelledby'),
          hasCloseButton: Boolean(modal.querySelector('button[aria-label]')),
        };
      });
      auditResults.modalAccessibility = modalAttrs;

      // Close modal
      const closeBtn = desktopPage.locator('button[aria-label*="Close"], button[aria-label*="बंद"]');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
        await desktopPage.waitForTimeout(400);
      }
    }

    // -------------------------------------------------------------
    // 6. AUDIT BILINGUAL HINDI RENDERING
    // -------------------------------------------------------------
    console.log('[Audit] Inspecting Hindi Localization & Typography...');
    await desktopPage.goto(`http://localhost:${port}/?view=landing`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(600);

    // Switch to Hindi
    const langBtn = desktopPage.locator('button:has-text("हिंदी"), button:has-text("हि")');
    if (await langBtn.count() > 0) {
      await langBtn.first().click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(artifactDir, 'audit-landing-hindi.png'),
      });
    }

    // Save audit data to JSON
    fs.writeFileSync(
      path.join(artifactDir, 'audit-extracted-data.json'),
      JSON.stringify(auditResults, null, 2),
      'utf8'
    );

    console.log('[Audit] Complete! Results saved to audit-extracted-data.json');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

runAudit().catch(err => {
  console.error('[Audit Error]', err);
  process.exit(1);
});

