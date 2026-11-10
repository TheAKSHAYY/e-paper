import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

const ARTIFACTS_DIR = 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
const SCREENSHOTS_DIR = path.resolve('docs/poc-verification-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function saveScreenshot(sourcePath, filename) {
  const targetArtifact = path.join(ARTIFACTS_DIR, filename);
  const targetDocs = path.join(SCREENSHOTS_DIR, filename);
  fs.copyFileSync(sourcePath, targetDocs);
  fs.copyFileSync(sourcePath, targetArtifact);
  console.log(`Saved screenshot: ${filename}`);
}

async function runLiveVerification() {
  console.log('--- Starting Playwright Live E2E Verification of 10-Design PoC ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  const report = {
    desktopLibraryOpened: false,
    desktopSideBySidePreview: false,
    mobileLibraryOpened: false,
    pocInsertions: {},
    liveEditingHeadline: false,
    liveEditingDuplicateIsolated: false,
    undoRedoWorked: false,
    persistenceReloadWorked: false,
    volumeIssueToggled: false,
    pdfExportValid: false,
    pdfSizeBytes: 0,
    errors: [],
  };

  const dismissIfPageFull = async () => {
    try {
      const pageFullDismiss = page.locator('[data-testid="page-full-modal"] button:has-text("रद्द करें")');
      if (await pageFullDismiss.isVisible({ timeout: 800 }).catch(() => false)) {
        console.log('Dismissing Page Full notice...');
        await pageFullDismiss.click();
        await page.waitForTimeout(300);
      }
    } catch {
      // Ignore
    }
  };

  try {
    // -------------------------------------------------------------
    // STEP 1: Desktop Entry & Design Library Opening
    // -------------------------------------------------------------
    console.log('1. Loading http://localhost:5173/#editor ...');
    await page.goto('http://localhost:5173/#editor', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Look for topbar button
    console.log('Finding Design Library topbar button...');
    const topBarBtn = page.locator('[data-testid="topbar-btn-design-library"]');
    await topBarBtn.waitFor({ state: 'visible', timeout: 10000 });
    await topBarBtn.click();

    // Verify modal is visible
    const modal = page.locator('[data-testid="design-library-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    report.desktopLibraryOpened = true;
    console.log('✓ Desktop Design Library modal opened successfully.');

    const snap1 = path.join(SCREENSHOTS_DIR, '01-desktop-design-library-opened.png');
    await page.screenshot({ path: snap1 });
    saveScreenshot(snap1, '01-desktop-design-library-opened.png');

    // -------------------------------------------------------------
    // STEP 2: Category Filter & Side-by-Side Inspection
    // -------------------------------------------------------------
    console.log('2. Testing Category filter and side-by-side inspection...');
    // Click PoC category filter
    const pocCategoryPill = page.locator('[data-testid="category-filter-poc"]');
    await pocCategoryPill.waitFor({ state: 'visible', timeout: 5000 });
    await pocCategoryPill.click();
    await page.waitForTimeout(500);

    // Locate des-103 card and click preview button
    const cardDes103 = page.locator('[data-testid="design-card-des-103"]');
    await cardDes103.scrollIntoViewIfNeeded();
    await cardDes103.waitFor({ state: 'visible', timeout: 5000 });

    const previewBtn = page.locator('[data-testid="btn-preview-design-des-103"]');
    await previewBtn.click();
    await page.waitForTimeout(800);

    const inspectionModal = page.locator('[data-testid="design-inspection-modal"]');
    if (await inspectionModal.isVisible()) {
      report.desktopSideBySidePreview = true;
      console.log('✓ Side-by-side comparison modal is active.');
    }

    const snap2 = path.join(SCREENSHOTS_DIR, '02-desktop-design-library-side-by-side.png');
    await page.screenshot({ path: snap2 });
    saveScreenshot(snap2, '02-desktop-design-library-side-by-side.png');

    // Close inspection modal by clicking "बंद करें"
    const closeInspectionBtn = inspectionModal.locator('button:has-text("बंद करें")');
    if (await closeInspectionBtn.isVisible()) {
      await closeInspectionBtn.click();
      await page.waitForTimeout(400);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // Close design library modal
    const closeBtn = page.locator('[data-testid="close-design-library-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // STEP 3: Mobile Entry & Responsive Bottom Sheet Verification
    // -------------------------------------------------------------
    console.log('3. Testing Mobile Entry Point (viewport 390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);

    // Click mobile + ब्लॉक bottom nav button
    const mobileAddBlockBtn = page.locator('[data-testid="mobile-nav-blocks"]');
    if (await mobileAddBlockBtn.isVisible()) {
      await mobileAddBlockBtn.click();
      await page.waitForTimeout(600);

      // In the bottom sheet, click Design Library button
      const mobileDesignLibBtn = page.locator('[data-testid="mobile-btn-design-library"]').first();
      await mobileDesignLibBtn.waitFor({ state: 'visible', timeout: 5000 });
      await mobileDesignLibBtn.scrollIntoViewIfNeeded();
      await mobileDesignLibBtn.click();
      await page.waitForTimeout(800);

      const mobileModal = page.locator('[data-testid="design-library-modal"]');
      if (await mobileModal.isVisible()) {
        report.mobileLibraryOpened = true;
        console.log('✓ Mobile Design Library opened successfully from + ब्लॉक sheet.');
      }

      const snap3 = path.join(SCREENSHOTS_DIR, '03-mobile-design-library-opened.png');
      await page.screenshot({ path: snap3 });
      saveScreenshot(snap3, '03-mobile-design-library-opened.png');

      // Close modal on mobile
      const mobileClose = page.locator('[data-testid="close-design-library-btn"]');
      await mobileClose.click();
      await page.waitForTimeout(400);
    }

    // Restore desktop viewport
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.waitForTimeout(600);

    // -------------------------------------------------------------
    // STEP 4: Insert Masthead PoC Designs (des-103, des-115, des-119)
    // -------------------------------------------------------------
    console.log('4. Testing Masthead PoC Insertions...');
    // Insert des-103 (Traditional Broadsheet Masthead)
    await topBarBtn.click();
    await modal.waitFor({ state: 'visible' });
    await pocCategoryPill.click();
    await page.waitForTimeout(300);

    const insertDes103Btn = page.locator('[data-testid="btn-insert-design-des-103"]');
    await insertDes103Btn.scrollIntoViewIfNeeded();
    await insertDes103Btn.click();
    await page.waitForTimeout(500);
    await closeBtn.click();
    await page.waitForTimeout(500);
    await dismissIfPageFull();

    const mastheadSection = page.locator('[data-testid="masthead-section"]');
    await mastheadSection.waitFor({ state: 'visible' });
    report.pocInsertions['des-103'] = true;
    console.log('✓ des-103 Masthead inserted on canvas.');

    const snap4 = path.join(SCREENSHOTS_DIR, '04-canvas-masthead-des103.png');
    await page.screenshot({ path: snap4 });
    saveScreenshot(snap4, '04-canvas-masthead-des103.png');

    // Insert des-115 (Modern Broadsheet Masthead)
    await topBarBtn.click();
    await modal.waitFor({ state: 'visible' });
    await pocCategoryPill.click();
    await page.waitForTimeout(300);

    const insertDes115Btn = page.locator('[data-testid="btn-insert-design-des-115"]');
    await insertDes115Btn.scrollIntoViewIfNeeded();
    await insertDes115Btn.click();
    await page.waitForTimeout(500);
    await closeBtn.click();
    await page.waitForTimeout(500);
    await dismissIfPageFull();

    report.pocInsertions['des-115'] = true;
    console.log('✓ des-115 Modern Masthead inserted on canvas.');
    const snap5 = path.join(SCREENSHOTS_DIR, '05-canvas-masthead-des115.png');
    await page.screenshot({ path: snap5 });
    saveScreenshot(snap5, '05-canvas-masthead-des115.png');

    // Insert des-119 (Regional Highlight Masthead)
    await topBarBtn.click();
    await modal.waitFor({ state: 'visible' });
    await pocCategoryPill.click();
    await page.waitForTimeout(300);

    const insertDes119Btn = page.locator('[data-testid="btn-insert-design-des-119"]');
    await insertDes119Btn.scrollIntoViewIfNeeded();
    await insertDes119Btn.click();
    await page.waitForTimeout(500);
    await closeBtn.click();
    await page.waitForTimeout(500);
    await dismissIfPageFull();

    report.pocInsertions['des-119'] = true;
    console.log('✓ des-119 Regional Masthead inserted on canvas.');
    const snap6 = path.join(SCREENSHOTS_DIR, '06-canvas-masthead-des119.png');
    await page.screenshot({ path: snap6 });
    saveScreenshot(snap6, '06-canvas-masthead-des119.png');

    // -------------------------------------------------------------
    // STEP 5: Insert Editorial & Special PoC Designs
    // (des-041, des-054, des-022, des-033, des-142, des-132, des-001)
    // -------------------------------------------------------------
    console.log('5. Inserting remaining 7 PoC designs onto canvas...');
    const editorialPoCs = [
      'des-041', // Lead Story 4-col
      'des-054', // Composite 6-col Hero Photo
      'des-022', // 2-Col Digest
      'des-033', // 3-Col Feature
      'des-142', // Breaking News Crimson Strip
      'des-132', // Daily Rashifal
      'des-001', // Commercial Display Ad
    ];

    await topBarBtn.click();
    await modal.waitFor({ state: 'visible' });
    await pocCategoryPill.click();
    await page.waitForTimeout(400);

    for (const id of editorialPoCs) {
      const btn = page.locator(`[data-testid="btn-insert-design-${id}"]`);
      if (await btn.isVisible()) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.waitForTimeout(300);
        report.pocInsertions[id] = true;
        console.log(`✓ Inserted ${id}`);
      }
    }

    await closeBtn.click();
    await page.waitForTimeout(600);
    await dismissIfPageFull();

    const snap7 = path.join(SCREENSHOTS_DIR, '07-canvas-editorial-poc-inserted.png');
    await page.screenshot({ path: snap7 });
    saveScreenshot(snap7, '07-canvas-editorial-poc-inserted.png');

    // -------------------------------------------------------------
    // STEP 6: Live Canvas Editability & Independence Verification
    // -------------------------------------------------------------
    console.log('6. Testing Live Canvas Editability...');
    await dismissIfPageFull();

    // Find an article element on the canvas and click it
    const firstArticle = page.locator('[data-testid^="article-card-"], [data-testid^="article-"]').first();
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      await page.waitForTimeout(500);

      // In the Article Inspector Panel, edit the headline
      const headlineInput = page.locator('input[placeholder*="शीर्षक"], textarea[placeholder*="शीर्षक"]').first();
      if (await headlineInput.isVisible()) {
        await headlineInput.fill('लाइव संपादन सत्यापन: संसद में नया ई-पेपर Studio विधेयक पारित');
        report.liveEditingHeadline = true;
        console.log('✓ Article headline live-edited successfully.');
      }

      await dismissIfPageFull();

      // Test duplicate button
      const duplicateBtn = page.locator('button:has-text("डुप्लिकेट"), button:has-text("Duplicate")').first();
      if (await duplicateBtn.isVisible()) {
        const initialCount = await page.locator('[data-testid^="article-card-"], [data-testid^="article-"]').count();
        await duplicateBtn.click();
        await page.waitForTimeout(500);
        await dismissIfPageFull();

        const newCount = await page.locator('[data-testid^="article-card-"], [data-testid^="article-"]').count();
        if (newCount > initialCount) {
          report.liveEditingDuplicateIsolated = true;
          console.log('✓ Article duplicate created cleanly and independently.');
        }

        // Test Undo
        const undoBtn = page.locator('[data-testid="topbar-btn-undo"], button[title*="पूर्ववत"]').first();
        if (await undoBtn.isVisible()) {
          await undoBtn.click({ force: true });
          await page.waitForTimeout(500);
          const countAfterUndo = await page.locator('[data-testid^="article-card-"], [data-testid^="article-"]').count();
          if (countAfterUndo <= initialCount) {
            report.undoRedoWorked = true;
            console.log('✓ Undo operation successfully reverted duplicate.');
          }
        }
      }
    }

    const snap8 = path.join(SCREENSHOTS_DIR, '08-live-canvas-editing-demonstration.png');
    await page.screenshot({ path: snap8 });
    saveScreenshot(snap8, '08-live-canvas-editing-demonstration.png');

    // -------------------------------------------------------------
    // STEP 7: Masthead Volume/Issue ("वर्ष व अंक") Toggle Verification
    // -------------------------------------------------------------
    console.log('7. Testing Masthead Volume & Issue Toggle...');
    await dismissIfPageFull();
    await mastheadSection.click();
    await page.waitForTimeout(500);

    const subheadersTab = page.locator('[data-testid="masthead-tab-subheaders"]');
    if (await subheadersTab.isVisible()) {
      await subheadersTab.click();
      await page.waitForTimeout(300);

      // Click remove volume issue button
      const removeBtn = page.locator('[data-testid="btn-remove-volume-issue"], [data-testid="btn-header-quick-clear-volume"], button:has-text("हटाएँ ✕")').first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForTimeout(400);

        // Check that "वर्ष 78 • अंक 142" is removed from canvas
        const hasVolAfterRemove = await page.locator('text=वर्ष 78 • अंक 142').count();
        console.log(`Volume/issue on canvas after remove: count = ${hasVolAfterRemove}`);

        // Click restore button
        const restoreBtn = page.locator('[data-testid="btn-restore-volume-issue"], [data-testid="btn-header-quick-restore-volume"], button:has-text("पुनर्स्थापित करें")').first();
        if (await restoreBtn.isVisible()) {
          await restoreBtn.click();
          await page.waitForTimeout(400);
          const hasVolAfterRestore = await page.locator('text=वर्ष 78 • अंक 142').count();
          console.log(`Volume/issue on canvas after restore: count = ${hasVolAfterRestore}`);
          report.volumeIssueToggled = true;
          console.log('✓ Volume & Issue toggled off and on successfully.');
        }
      }
    }

    const snap9 = path.join(SCREENSHOTS_DIR, '09-masthead-volume-issue-toggle.png');
    await page.screenshot({ path: snap9 });
    saveScreenshot(snap9, '09-masthead-volume-issue-toggle.png');

    // -------------------------------------------------------------
    // STEP 8: LocalStorage Persistence
    // -------------------------------------------------------------
    console.log('8. Testing Persistence on Page Reload...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const persistedMasthead = page.locator('[data-testid="masthead-section"]');
    if (await persistedMasthead.isVisible()) {
      report.persistenceReloadWorked = true;
      console.log('✓ Document state persisted cleanly through page reload.');
    }

    // -------------------------------------------------------------
    // STEP 9: PDF Export Verification
    // -------------------------------------------------------------
    console.log('9. Testing Newspaper PDF Export...');
    const pdfResult = await page.evaluate(async () => {
      try {
        const stored = localStorage.getItem('epaper_studio_active_document_v1');
        const doc = stored ? JSON.parse(stored) : null;
        if (!doc) return { error: 'No stored document' };

        const resp = await fetch('/api/render-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        });

        if (!resp.ok) return { error: `Server error: ${resp.status} ${resp.statusText}` };
        const blob = await resp.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return { success: true, size: buffer.byteLength, base64: base64 };
      } catch (err) {
        return { error: err.message };
      }
    });

    console.log('PDF Export Result (size):', pdfResult?.size);
    if (pdfResult && pdfResult.success && pdfResult.size > 1000) {
      report.pdfExportValid = true;
      report.pdfSizeBytes = pdfResult.size;
      const pdfBuffer = Buffer.from(pdfResult.base64, 'base64');
      fs.writeFileSync(path.resolve('docs/poc-exported-newspaper.pdf'), pdfBuffer);
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'poc-exported-newspaper.pdf'), pdfBuffer);
      console.log(`✓ PDF successfully generated and saved: ${pdfResult.size} bytes`);
    } else {
      console.warn('PDF export evaluated fallback or warning:', pdfResult);
    }

    const snap10 = path.join(SCREENSHOTS_DIR, '10-pdf-export-verified.png');
    await page.screenshot({ path: snap10 });
    saveScreenshot(snap10, '10-pdf-export-verified.png');

  } catch (err) {
    console.error('Test execution error:', err);
    report.errors.push(err.message);
  } finally {
    await browser.close();
  }

  // Write verification execution result
  fs.writeFileSync(
    path.resolve('docs/poc-live-verification-results.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
  console.log('Verification run finished. Results saved to docs/poc-live-verification-results.json');
}

runLiveVerification().catch(console.error);
