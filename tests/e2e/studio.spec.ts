import { test, expect } from '@playwright/test';

test.describe('E-Paper Studio — Professional Indian Newspaper Publishing Flow', () => {
  test('should load editor, render authentic Hindi newspaper sheet, and check for clean console', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/#editor');

    // Check title and branding
    await expect(page).toHaveTitle(/E-Paper Studio/);
    await expect(page.getByText('E-Paper Studio').first()).toBeVisible();

    // Check authentic Hindi masthead rendering on canvas
    const mastheadTitle = page.locator('[data-testid="masthead-title"]');
    await expect(mastheadTitle).toBeVisible();
    await expect(mastheadTitle).toHaveText(/जनवाणी समाचार/);

    // Verify articles are rendered in the newspaper grid
    const grid = page.locator('[data-testid="newspaper-articles-grid"]');
    await expect(grid).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('should edit an article headline via contextual inspector and update canvas immediately', async ({
    page,
  }) => {
    await page.goto('/#editor');

    // Click on the first article card to select it
    const firstArticleCard = page.locator('[data-testid^="article-card-"]').first();
    await firstArticleCard.click();

    // Locate headline textarea in the contextual inspector
    const headlineInput = page.locator('textarea').first();
    await expect(headlineInput).toBeVisible();

    const newHeadline = 'विशेष रिपोर्ट: देश के ग्रामीण क्षेत्रों में सौर ऊर्जा क्रांति';
    await headlineInput.fill(newHeadline);

    // Verify live preview on the newspaper sheet updates reactively
    const updatedHeading = page.locator('[data-testid="newspaper-articles-grid"] h2').first();
    await expect(updatedHeading).toHaveText(newHeadline);
  });

  test('should add a newspaper block from the block library and display it on the page', async ({
    page,
  }) => {
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Click "तत्व (Catalog)" tab in left sidebar
    await page
      .getByRole('button', { name: /तत्व|Catalog|Blocks/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Count initial articles on canvas
    const initialCount = await page.locator('[data-testid^="article-card-"]').count();

    // Click "+ Add to Page 1" button on the first block template card
    const addBtn = page.getByRole('button', { name: /\+ पेज 1 पर जोड़ें|\+ Add to Page/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);

    // Verify article count incremented on canvas
    const newCount = await page.locator('[data-testid^="article-card-"]').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should manage multiple pages and render inside running folios on page 2', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    const leftSidebar = page.locator('[data-testid="left-sidebar"]');
    if (!(await leftSidebar.isVisible())) {
      const pageRailBtn = page.locator('button:has-text("▤ पेज")');
      if (await pageRailBtn.isVisible()) {
        await pageRailBtn.click();
      } else {
        await page.locator('button[title*="sidebar"], button:has-text("☰")').first().click();
      }
      await page.waitForTimeout(500);
    }

    // Click "+ Add Page"
    const addPageBtn = page.locator('[data-testid="add-page-btn"]').first();
    await expect(addPageBtn).toBeVisible();
    await addPageBtn.click();
    await page.waitForTimeout(500);

    // Top bar should now show Page 2
    await expect(page.getByText(/पेज 2|Page 2/i).first()).toBeVisible();

    // The canvas should display an inside folio header instead of the front page masthead
    await expect(page.getByText(/पृष्ठ 2 \/ 2/).first()).toBeVisible();
  });

  test('should save draft locally and persist edits across page reload', async ({ page }) => {
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Select first article and edit headline
    await page.locator('[data-testid^="article-card-"]').first().click();
    const headlineInput = page.locator('textarea').first();
    const persistedTitle = 'स्थानीय समाचार: शहर में नए पुस्तकालय का लोकार्पण';
    await headlineInput.fill(persistedTitle);

    // Verify Autosave badge or notification toast indicates status
    await page.waitForTimeout(1500);
    const saveBadge = page.locator('[data-testid="autosave-status-badge"]');
    await expect(saveBadge).toBeVisible();

    // Reload browser page
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify the persisted headline survived reload
    const reloadedHeading = page.locator('[data-testid="newspaper-articles-grid"] h2').first();
    await expect(reloadedHeading).toHaveText(persistedTitle);
  });

  test('should trigger Export PDF action and download print-ready PDF', async ({ page }) => {
    test.slow();
    await page.goto('/#editor');

    const exportBtn = page.locator(
      '[data-testid="btn-export-pdf"], [data-testid="export-pdf-button"]'
    );
    await expect(exportBtn).toBeVisible();

    // Trigger download listener with generous timeout for background chromium generation
    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
    await exportBtn.click();

    // Wait for the download event
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    expect(download.suggestedFilename().length).toBeGreaterThan(4);
  }, 60000);
});
