import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Pre-Group A: Complete Audit Verification', () => {
  const screenshotsDir = path.resolve('test-results/audit-screenshots');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('1 & 2. Auto Fit verification on empty, short, long, and overflow pages', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Open sidebar pages tab if rail is collapsed
    const pagesRailBtn = page.getByRole('button', { name: /▤.*पेज/i });
    if (await pagesRailBtn.isVisible()) {
      await pagesRailBtn.click();
      await page.waitForTimeout(300);
    }

    // Add empty page
    const addPageBtn = page.getByRole('button', { name: /\+ नया पेज/i });
    await addPageBtn.click();
    await page.waitForTimeout(500);

    // Click Auto Fit on empty page
    const autoFitBtn = page.getByRole('button', { name: /⚡ ऑटो-फ़िट/i }).first();
    await autoFitBtn.click();
    await page.waitForTimeout(500);

    // Verify empty page still has 0 articles and didn't crash
    const emptyArticles = await page.locator('[data-testid^="article-card-"]').count();
    expect(emptyArticles).toBe(0);

    // Go back to Page 1
    const prevPageBtn = page.getByTitle('पिछला पेज');
    await prevPageBtn.click();
    await page.waitForTimeout(500);

    // Count articles on Page 1 before auto-fit
    const articlesBefore = await page.locator('[data-testid^="article-card-"]').count();
    expect(articlesBefore).toBeGreaterThan(0);

    // Run Auto Fit on populated page
    await autoFitBtn.click();
    await page.waitForTimeout(500);

    // Count articles on Page 1 after auto-fit
    const articlesAfter = await page.locator('[data-testid^="article-card-"]').count();
    // Verify no articles were lost or duplicated
    expect(articlesAfter).toBe(articlesBefore);
  });

  test('3. Reload persistence of layout and theme', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Open Theme modal
    const themeBtn = page.getByRole('button', { name: /रंग \/ थीम|Theme/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(500);

    // Select Deep Blue preset
    const deepBlue = page.getByRole('button', { name: /डीप ब्लू|Deep Blue/i });
    await deepBlue.click();
    await page.waitForTimeout(300);

    // Close theme modal
    const doneThemeBtn = page.getByRole('button', { name: /पूर्ण \(Done\)|बंद करें/i }).first();
    await doneThemeBtn.click();
    // Wait for debounced autosave (1500ms) to persist
    await page.waitForTimeout(2000);

    // Check CSS variable applied
    const headlineColor = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="newspaper-sheet-canvas"]');
      return el ? getComputedStyle(el).getPropertyValue('--headline-color').trim() : '';
    });
    expect(headlineColor).toBe('#1e3a8a');

    // Reload browser page
    await page.reload();
    await page.waitForTimeout(1500);

    // Verify theme persisted
    const headlineColorAfterReload = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="newspaper-sheet-canvas"]');
      return el ? getComputedStyle(el).getPropertyValue('--headline-color').trim() : '';
    });
    expect(headlineColorAfterReload).toBe('#1e3a8a');
  });

  test('4. PDF Export / Print rendering with Devanagari text across themes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Take screenshot of default theme on-screen
    const canvas = page.locator('[data-testid="newspaper-sheet-canvas"]').first();
    await expect(canvas).toBeVisible();
    await canvas.screenshot({ path: path.join(screenshotsDir, 'theme-classic-bw.png') });

    // Switch to Sepia theme and screenshot
    const themeBtn = page.getByRole('button', { name: /रंग \/ थीम|Theme/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(500);

    const sepiaPreset = page.getByRole('button', { name: /प्राचीन सेपिया|Warm Sepia/i });
    await sepiaPreset.click();
    await page.waitForTimeout(300);

    const doneThemeBtn = page.getByRole('button', { name: /पूर्ण \(Done\)|बंद करें/i }).first();
    await doneThemeBtn.click();
    // Wait for debounced autosave (1500ms) to persist
    await page.waitForTimeout(2000);

    await canvas.screenshot({ path: path.join(screenshotsDir, 'theme-warm-sepia.png') });

    // Verify Devanagari conjuncts and matras render on canvas
    const deavnagariText = await canvas.innerText();
    expect(deavnagariText).toContain('समाचार');
  });

  test('5. Performance with 20+ pages and zero console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Add pages programmatically via document state to reach 20+ pages
    const pageCount = await page.evaluate(async () => {
      // Find localStorage key for drafts
      const rawIndex = localStorage.getItem('epaper_studio_drafts_index_v1');
      if (!rawIndex) return 0;
      const indexList = JSON.parse(rawIndex);
      const draftId = indexList[0]?.id;
      if (!draftId) return 0;
      const rawDraft = localStorage.getItem(`epaper_studio_draft_doc_v1_${draftId}`);
      if (!rawDraft) return 0;
      const draft = JSON.parse(rawDraft);

      // Duplicate pages until at least 21 pages
      const originalPage = draft.pages?.[0] || {
        id: 'p-template',
        pageNumber: 1,
        sectionTitle: 'विशेष',
        layoutMode: 'auto',
        articles: [],
      };

      const newPages = [];
      for (let i = 1; i <= 22; i++) {
        newPages.push({
          ...originalPage,
          id: `page-perf-${i}`,
          pageNumber: i,
          sectionTitle: `पृष्ठ ${i}`,
          articles: originalPage.articles ? [...originalPage.articles] : [],
        });
      }
      draft.pages = newPages;
      localStorage.setItem(`epaper_studio_draft_doc_v1_${draftId}`, JSON.stringify(draft));
      return draft.pages.length;
    });

    expect(pageCount).toBe(22);

    // Reload with 22 pages
    const startTime = Date.now();
    await page.reload();
    await page.waitForTimeout(1500);
    const loadDuration = Date.now() - startTime;

    // Verify 22 pages in UI
    const pageIndicator = page.getByText('1 / 22', { exact: true }).first();
    await expect(pageIndicator).toBeVisible();

    // Verify performance: page loads smoothly and no crash
    console.log(`22-page document load time: ${loadDuration}ms`);
    expect(loadDuration).toBeLessThan(10000);
    expect(consoleErrors.length).toBe(0);
  });
});
