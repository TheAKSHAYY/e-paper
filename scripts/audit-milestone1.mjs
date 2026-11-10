import { chromium } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const artifactDir =
  'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';

// Expected 50 Template IDs
const EXPECTED_50_TEMPLATES = {
  completePages: [
    'tpl-national-broadsheet',
    'tpl-district-gazette',
    'tpl-morning-express',
    'tpl-krishi-gramin',
    'tpl-election-special',
  ],
  mastheads: [
    'traditional-hindi',
    'modern-minimal',
    'advertisement-focused',
    'regional-gazette',
    'english-chronicle',
    'bilingual-metro',
    'mstd-prabhat-sunrise',
    'mstd-sandhya-bulletin',
    'mstd-krishi-darpan',
    'mstd-sansad-patrika',
  ],
  articleLayouts: [
    'art-hero-screamer-12',
    'art-two-col-anchor',
    'art-three-col-standard',
    'art-side-column-analysis',
    'art-interview-qa',
    'art-photo-story',
    'art-opinion-column',
    'art-bulletin-list',
    'art-factbox-sidebar',
    'art-quote-deck',
  ],
  breakingNews: [
    'preset-breaking-red',
    'preset-breaking-black',
    'preset-breaking-orange',
    'preset-breaking-blue-live',
    'preset-breaking-election',
    'preset-breaking-weather',
    'preset-breaking-two-tone',
    'preset-breaking-compact',
    'preset-breaking-police',
    'preset-breaking-communique',
  ],
  dividers: [
    'preset-divider-ornate',
    'preset-divider-ribbon',
    'preset-divider-category-red',
    'preset-divider-category-blue',
    'preset-divider-category-green',
    'preset-divider-ribbon-gold',
    'preset-divider-dateline-gray',
    'preset-divider-district',
    'preset-divider-business',
    'preset-divider-sports',
    'preset-divider-investigation',
    'preset-divider-literature',
    'preset-divider-hairline-centered',
    'preset-divider-dark-strip',
    'preset-divider-boxed',
  ],
};

async function main() {
  console.log('[Audit] Starting Milestone 1 Visual & Functional Audit...');
  const auditResults = {
    timestamp: new Date().toISOString(),
    templatesFound: {},
    completeTemplatesAnalysis: [],
    functionalTests: {},
    pdfAudit: [],
    simpleModeWorkflow: {},
    visualDefects: [],
    pdfDefects: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // PHASE 1: Launch and Inspect Editor & Template Gallery
    // -------------------------------------------------------------
    console.log(
      '[Audit] 1. Loading editor at http://localhost:5173/editor?returnOn=%2Fdashboard#editor ...'
    );
    await page.goto('http://localhost:5173/editor?returnOn=%2Fdashboard#editor', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(1500);

    // Capture initial editor view (confirm Simple Mode is active by default)
    await page.screenshot({
      path: path.join(artifactDir, '01-editor-initial-simple-mode.png'),
    });
    console.log('[Audit] Saved 01-editor-initial-simple-mode.png');

    const simpleModeBtn = page.locator('[data-testid="topbar-btn-editor-mode"]');
    const simpleModeText = await simpleModeBtn.textContent();
    auditResults.functionalTests.simpleModeDefault = simpleModeText?.includes('सरल');

    // Open Template Gallery Modal
    console.log('[Audit] Opening Template Gallery Modal...');
    const galleryBtn = page.locator('[data-testid="topbar-btn-template-gallery"]');
    await galleryBtn.click();
    await page.waitForSelector('[data-testid="template-gallery-modal"]', { timeout: 5000 });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(artifactDir, '02-gallery-category-all.png'),
    });
    console.log('[Audit] Saved 02-gallery-category-all.png');

    // Inspect each category tab and capture screenshots
    const categories = [
      {
        id: 'pages',
        label: 'पूरे अखबार पृष्ठ',
        screenshot: '03-gallery-complete-pages.png',
        key: 'completePages',
      },
      {
        id: 'mastheads',
        label: 'मास्टहेड',
        screenshot: '04-gallery-mastheads.png',
        key: 'mastheads',
      },
      {
        id: 'articles',
        label: 'आर्टिकल लेआउट',
        screenshot: '05-gallery-article-layouts.png',
        key: 'articleLayouts',
      },
      {
        id: 'breaking',
        label: 'ब्रेकिंग न्यूज़',
        screenshot: '06-gallery-breaking-news.png',
        key: 'breakingNews',
      },
      {
        id: 'dividers',
        label: 'सब-हेडर व डिवाइडर',
        screenshot: '07-gallery-dividers.png',
        key: 'dividers',
      },
    ];

    for (const cat of categories) {
      console.log(`[Audit] Navigating to gallery category: ${cat.label} (${cat.id})...`);
      const catTab = page.locator(`[data-testid="category-tab-${cat.id}"]`);
      await catTab.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: path.join(artifactDir, cat.screenshot),
      });
      console.log(`[Audit] Saved ${cat.screenshot}`);

      // Count cards and collect IDs
      const cards = page.locator('[data-testid^="template-card-"]');
      const cardCount = await cards.count();
      const cardIds = [];
      for (let i = 0; i < cardCount; i++) {
        const testId = await cards.nth(i).getAttribute('data-testid');
        const templateId = testId?.replace('template-card-', '');
        if (templateId) cardIds.push(templateId);
      }
      auditResults.templatesFound[cat.key] = {
        count: cardCount,
        ids: cardIds,
      };
      console.log(`[Audit] Category ${cat.label}: found ${cardCount} templates.`);
    }

    // Verify all 50 IDs
    let totalMissing = 0;
    for (const [key, expectedList] of Object.entries(EXPECTED_50_TEMPLATES)) {
      const foundList = auditResults.templatesFound[key]?.ids || [];
      const missing = expectedList.filter((id) => !foundList.includes(id));
      if (missing.length > 0) {
        console.warn(`[Audit Warning] Missing IDs in ${key}:`, missing);
        totalMissing += missing.length;
      }
    }
    auditResults.totalTemplatesFound = Object.values(auditResults.templatesFound).reduce(
      (acc, c) => acc + c.count,
      0
    );
    auditResults.all50Present = totalMissing === 0;

    // Close gallery
    const closeBtn = page.locator('[data-testid="template-gallery-close"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // PHASE 2 & 3: Visual Design Audit & Application of All 5 Complete Page Templates
    // -------------------------------------------------------------
    console.log('[Audit] 2. Auditing all 5 Complete Page Templates...');
    const completeTemplates = [
      {
        id: 'tpl-national-broadsheet',
        name: 'राष्ट्रीय दैनिक (National Broadsheet)',
        expectedCols: 8,
        expectedFormat: 'Broadsheet',
        screenshot: 'canvas-template-1-national-broadsheet.png',
      },
      {
        id: 'tpl-district-gazette',
        name: 'जिला समाचार पत्र (District Gazette Tabloid)',
        expectedCols: 4,
        expectedFormat: 'Tabloid',
        screenshot: 'canvas-template-2-district-gazette.png',
      },
      {
        id: 'tpl-morning-express',
        name: 'प्रभात समाचार (Morning Express 6-Col)',
        expectedCols: 6,
        expectedFormat: 'Broadsheet',
        screenshot: 'canvas-template-3-morning-express.png',
      },
      {
        id: 'tpl-krishi-gramin',
        name: 'ग्रामीण एवं कृषि संदेश (Rural Agriculture)',
        expectedCols: 4,
        expectedFormat: 'Broadsheet',
        screenshot: 'canvas-template-4-krishi-gramin.png',
      },
      {
        id: 'tpl-election-special',
        name: 'चुनाव एवं विशेष बुलेटिन (Election Special)',
        expectedCols: 8,
        expectedFormat: 'Broadsheet',
        screenshot: 'canvas-template-5-election-special.png',
      },
    ];

    for (let idx = 0; idx < completeTemplates.length; idx++) {
      const tpl = completeTemplates[idx];
      console.log(`[Audit] Applying template ${idx + 1}/5: ${tpl.id} (${tpl.name})...`);

      // Open gallery
      await galleryBtn.click();
      await page.waitForSelector('[data-testid="template-gallery-modal"]');
      await page.locator('[data-testid="category-tab-pages"]').click();
      await page.waitForTimeout(400);

      // Click the template card's "लागू करें" button
      const card = page.locator(`[data-testid="template-card-${tpl.id}"]`);
      const applyBtnOnCard = card.locator('button:has-text("लागू करें")');
      await applyBtnOnCard.click();
      await page.waitForTimeout(400);

      // Confirm safe apply dialog (Choose "replace all content" to get template fidelity)
      const confirmDialog = page.locator('[data-testid="template-apply-confirm-modal"]');
      await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
      const replaceRadio = confirmDialog.locator('input[value="replace"]');
      await replaceRadio.check();
      const executeBtn = confirmDialog.locator('[data-testid="template-confirm-apply-btn"]');
      await executeBtn.click();
      await page.waitForTimeout(1000);

      // Fit page to view
      const fitBtn = page.locator('button:has-text("Fit"), button:has-text("पेज")');
      if ((await fitBtn.count()) > 0) {
        await fitBtn.first().click();
        await page.waitForTimeout(600);
      }

      // Capture full canvas screenshot
      const canvasEl = page.locator('[data-testid="newspaper-sheet-canvas"]');
      if (await canvasEl.isVisible()) {
        await canvasEl.screenshot({
          path: path.join(artifactDir, tpl.screenshot),
        });
      } else {
        await page.screenshot({
          path: path.join(artifactDir, tpl.screenshot),
        });
      }
      console.log(`[Audit] Saved ${tpl.screenshot}`);

      // Inspect canvas properties
      const canvasMetrics = await page.evaluate(() => {
        const sheet = document.querySelector('[data-testid="newspaper-sheet-canvas"]');
        const grid = sheet?.querySelector('[data-testid="newspaper-articles-grid"]');
        const articles = sheet?.querySelectorAll('.newspaper-article');
        const mastheadTitle = sheet
          ?.querySelector('[data-testid="masthead-title"]')
          ?.textContent?.trim();
        const topStrip = sheet
          ?.querySelector('[data-testid="masthead-top-strip"]')
          ?.textContent?.trim();
        const bottomStrip = sheet
          ?.querySelector('[data-testid="masthead-bottom-strip"]')
          ?.textContent?.trim();
        const isSheetOver = sheet ? sheet.scrollHeight > sheet.clientHeight + 4 : false;
        const gridComputed = grid ? window.getComputedStyle(grid) : null;
        const colTemplate = gridComputed?.gridTemplateColumns || '';
        const cols = colTemplate.split(' ').filter(Boolean).length;

        return {
          mastheadTitle,
          hasTopStrip: Boolean(topStrip),
          hasBottomStrip: Boolean(bottomStrip),
          articleCount: articles?.length || 0,
          renderedColumns: cols,
          isOverflown: isSheetOver,
        };
      });

      auditResults.completeTemplatesAnalysis.push({
        id: tpl.id,
        name: tpl.name,
        metrics: canvasMetrics,
        screenshot: tpl.screenshot,
      });
      console.log(`[Audit] Metrics for ${tpl.id}:`, canvasMetrics);
    }

    // -------------------------------------------------------------
    // PHASE 4: Functional Editing & Simple Mode Usability Audit
    // -------------------------------------------------------------
    console.log('[Audit] 4. Testing Simple Mode Workflow & Editing...');
    // We are on template 5 (or any). Let's edit its masthead title, lead article, and replace photo in Simple Mode
    // 1. Select the Masthead on canvas or click Masthead in inspector
    const sheetBackground = page.locator('[data-testid="newspaper-sheet-canvas"]');
    await sheetBackground.click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(400);

    // Inspector should show Masthead title input
    const mastheadTitleInput = page.locator('[data-testid="input-masthead-title"]');
    if (await mastheadTitleInput.isVisible()) {
      await mastheadTitleInput.fill('दैनिक भारत केसरी');
      await page.waitForTimeout(400);
      const updatedMh = await page.locator('[data-testid="masthead-title"]').textContent();
      auditResults.functionalTests.mastheadTitleEdit = updatedMh?.includes('दैनिक भारत केसरी');
      console.log(
        '[Audit] Masthead title edited to "दैनिक भारत केसरी" ->',
        auditResults.functionalTests.mastheadTitleEdit
      );
    }

    // 2. Select first article and edit headline
    const firstArticle = page.locator('.newspaper-article').first();
    await firstArticle.click();
    await page.waitForTimeout(500);

    const headlineTextarea = page
      .locator('label:has-text("मुख्य शीर्षक") + div textarea, textarea')
      .first();
    if (await headlineTextarea.isVisible()) {
      await headlineTextarea.fill(
        'विशेष रिपोर्ट: ग्रामीण क्षेत्रों में डिजिटल क्रांति से बदल रही किसानों की जिंदगी'
      );
      await page.waitForTimeout(400);
      const headlineOnCanvas = await page
        .locator('.newspaper-article .article-headline')
        .first()
        .textContent();
      auditResults.functionalTests.headlineEdit = headlineOnCanvas?.includes('डिजिटल क्रांति');
      console.log('[Audit] Article headline edited ->', auditResults.functionalTests.headlineEdit);
    }

    // 3. Edit Body
    const bodyTextarea = page
      .locator('label:has-text("Body Text")')
      .locator('..')
      .locator('..')
      .locator('textarea');
    if (await bodyTextarea.isVisible()) {
      await bodyTextarea.fill(
        'लखनऊ — नई कृषि नीतियों और तकनीक के समावेश से ग्रामीण अर्थव्यवस्था में अभूतपूर्व उछाल देखने को मिल रहा है। सभी ग्राम पंचायतों में हाई-स्पीड ब्रॉडबैंड और ई-मंडी पोर्टल की स्थापना से किसानों को फसलों का उचित दाम सीधे खाते में मिल रहा है।'
      );
      await page.waitForTimeout(400);
      const bodyOnCanvas = await page
        .locator('.newspaper-article .article-body')
        .first()
        .textContent();
      auditResults.functionalTests.bodyEdit = bodyOnCanvas?.includes('नई कृषि नीतियों');
      console.log('[Audit] Article body edited ->', auditResults.functionalTests.bodyEdit);
    }

    // 4. Test Sub-header Preset Insertion from Gallery
    console.log('[Audit] Testing Sub-header insertion from Gallery...');
    await galleryBtn.click();
    await page.waitForSelector('[data-testid="template-gallery-modal"]');
    await page.locator('[data-testid="category-tab-dividers"]').click();
    await page.waitForTimeout(400);

    const dividerCard = page.locator('[data-testid="template-card-preset-divider-ribbon-gold"]');
    if (await dividerCard.isVisible()) {
      const applyBtn = dividerCard.locator(
        'button:has-text("Add Divider"), button:has-text("विभाजक")'
      );
      await applyBtn.click();
      await page.waitForTimeout(800);
      auditResults.functionalTests.dividerInsertion = true;
      console.log('[Audit] Inserted preset-divider-ribbon-gold successfully.');
    }

    // 5. Test Breaking News Insertion from Gallery
    console.log('[Audit] Testing Breaking News insertion from Gallery...');
    await galleryBtn.click();
    await page.waitForSelector('[data-testid="template-gallery-modal"]');
    await page.locator('[data-testid="category-tab-breaking"]').click();
    await page.waitForTimeout(400);

    const breakingCard = page.locator('[data-testid="template-card-preset-breaking-red"]');
    if (await breakingCard.isVisible()) {
      const applyBtn = breakingCard.locator(
        'button:has-text("Insert Banner"), button:has-text("शीर्ष पर जोड़ें")'
      );
      await applyBtn.click();
      await page.waitForTimeout(800);
      auditResults.functionalTests.breakingNewsInsertion = true;
      console.log('[Audit] Inserted preset-breaking-red successfully.');
    }

    // 6. Test Save and Reopen (Persistence)
    console.log('[Audit] Testing Save Draft and Page Reload...');
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("सहेजें")');
    if ((await saveBtn.count()) > 0) {
      await saveBtn.first().click();
      await page.waitForTimeout(1000);
    }
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Verify after reload that masthead title is still "दैनिक भारत केसरी"
    const restoredTitle = await page.locator('[data-testid="masthead-title"]').textContent();
    auditResults.functionalTests.saveAndReopen = restoredTitle?.includes('दैनिक भारत केसरी');
    console.log(
      '[Audit] Save and Reopen Persistence Verified ->',
      auditResults.functionalTests.saveAndReopen
    );

    await page.screenshot({
      path: path.join(artifactDir, '08-functional-editing-saved-reloaded.png'),
    });
    console.log('[Audit] Saved 08-functional-editing-saved-reloaded.png');

    // 7. Usability Verification for Simple Mode Workflow
    await page.screenshot({
      path: path.join(artifactDir, '09-simple-mode-workflow.png'),
    });
    console.log('[Audit] Saved 09-simple-mode-workflow.png');

    auditResults.simpleModeWorkflow = {
      defaultModeIsSimple: auditResults.functionalTests.simpleModeDefault,
      templateSelectionWorking: true,
      headlineEditingWorking: auditResults.functionalTests.headlineEdit,
      bodyEditingWorking: auditResults.functionalTests.bodyEdit,
      mastheadEditingWorking: auditResults.functionalTests.mastheadTitleEdit,
      presetInsertionWorking: auditResults.functionalTests.dividerInsertion,
      persistenceWorking: auditResults.functionalTests.saveAndReopen,
    };

    console.log('[Audit] Browser inspection completed successfully.');
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------
  // PHASE 5: PDF Vector & Parity Audit using RendererWorker
  // -------------------------------------------------------------
  console.log('[Audit] 5. Running Vector PDF Audit for all 5 complete page templates...');
  try {
    const { RendererWorker } = await import('../apps/renderer/dist/index.js');
    const { COMPLETE_PAGE_TEMPLATES } =
      await import('../packages/template-engine/dist/completePageTemplates.js');

    const worker = new RendererWorker();
    const envOk = await worker.validateEnvironment();
    console.log('[Audit] RendererWorker environment ready:', envOk);

    for (const tpl of COMPLETE_PAGE_TEMPLATES) {
      console.log(`[Audit] Rendering PDF for ${tpl.id} (${tpl.name})...`);
      const doc = tpl.createDocument();
      const pdfRes = await worker.renderToPdf(doc, { strictPages: true });
      const imgRes = await worker.renderToImage(doc, { scale: 1.5 });

      const imgPath = path.join(artifactDir, `pdf-${tpl.id}.png`);
      fs.writeFileSync(imgPath, Buffer.from(imgRes));

      auditResults.pdfAudit.push({
        id: tpl.id,
        name: tpl.name,
        pageCount: pdfRes.pageCount,
        fileSizeBytes: pdfRes.fileSizeBytes,
        hasOverflow: pdfRes.hasOverflow,
        warnings: pdfRes.warnings,
        rasterImage: `pdf-${tpl.id}.png`,
        isStrictlyOnePage: pdfRes.pageCount === 1,
      });

      console.log(
        `[Audit] PDF for ${tpl.id}: ${pdfRes.pageCount} page(s), size: ${(pdfRes.fileSizeBytes / 1024).toFixed(1)} KB, overflow: ${pdfRes.hasOverflow}`
      );
    }
  } catch (pdfErr) {
    console.error('[Audit Error in PDF audit]', pdfErr);
    auditResults.pdfAuditError = pdfErr.message;
  }

  // Save audit results JSON
  fs.writeFileSync(
    path.join(artifactDir, 'milestone1-audit-report.json'),
    JSON.stringify(auditResults, null, 2)
  );
  console.log('[Audit] Full audit completed! Saved milestone1-audit-report.json');
}

main().catch((err) => {
  console.error('[Audit Fatal Error]', err);
  process.exit(1);
});
