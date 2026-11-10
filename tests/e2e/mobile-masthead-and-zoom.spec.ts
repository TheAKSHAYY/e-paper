import { test, expect } from '@playwright/test';

test.describe('Mobile Masthead Editing, Sub-headers, Presets & Volume/Issue Removal', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test('should open clean masthead editor on mobile, allow removing "वर्ष 78 • अंक 142", edit sub-header, and open presets', async ({
    page,
  }) => {
    await page.goto('/#editor');
    const mastheadBox = page.locator('[data-testid="masthead-section"]');
    await expect(mastheadBox).toBeVisible();

    // 2. Click the Masthead on canvas to open mobile editor
    await mastheadBox.click();

    // The bottom sheet should open with Masthead inspector
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Verify Masthead active banner is present and clear
    await expect(page.locator('[data-testid="mobile-active-part-banner"]')).toBeVisible();

    // Verify Masthead inspector panel is mounted in compact mode
    const inspector = page.locator('[data-testid="masthead-inspector-panel"]');
    await expect(inspector).toBeVisible();

    // Capture screenshot of the clean, uncluttered mobile header editor
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-header-editor-clean.png',
    });

    // 3. Test removing "वर्ष व अंक" (DEF-VARSH-ANKH)
    // Click "हटाएँ ✕" button in the Volume & Issue box
    const removeVolBtn = inspector.locator('button:has-text("हटाएँ ✕")');
    await expect(removeVolBtn).toBeVisible();
    await removeVolBtn.click();

    // Close the drawer or inspect canvas to verify "वर्ष 78" and "अंक 142" are completely gone!
    await expect(page.locator('text=वर्ष 78 • अंक 142')).toHaveCount(0);

    // Capture screenshot showing canvas with "वर्ष व अंक" completely removed
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-canvas-varsh-ankh-removed.png',
    });

    // 4. Test Sub-Header & Announcement Strip Editing
    const subheaderTab = page.locator('[data-testid="masthead-tab-meta"]');
    await expect(subheaderTab).toBeVisible();
    await subheaderTab.click();

    // Check "पट्टी दिखाएँ" checkbox
    const announcementCheckbox = page.locator(
      'label:has-text("पट्टी दिखाएँ") input[type="checkbox"]'
    );
    await announcementCheckbox.check();

    // Type custom announcement / breaking text
    const announcementTextarea = inspector.locator('textarea');
    await announcementTextarea.fill('🔴 विशेष बुलेटिन: 68 देशों के बीच ऐतिहासिक समझौता');

    // Canvas should now display the announcement strip!
    await expect(
      page.locator('[data-testid="masthead-section"]').getByText('विशेष बुलेटिन')
    ).toBeVisible();

    // 5. Test Header Presets Button on Mobile
    const presetsBtn = page.locator('[data-testid="btn-open-masthead-presets"]');
    await expect(presetsBtn).toBeVisible();
    await presetsBtn.click();

    // Template Gallery Modal should open with Mastheads active!
    const galleryModal = page.locator('[data-testid="template-gallery-modal"]');
    await expect(galleryModal).toBeVisible();

    // Capture screenshot showing Template Gallery Modal on mobile
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-template-gallery-open.png',
    });

    // Close modal
    await page.locator('[data-testid="template-gallery-close"]').click();
    await expect(galleryModal).toBeHidden();
  });

  test('should allow horizontal (left-right) scrolling on mobile canvas and apply sub-headers to correct positions', async ({
    page,
  }) => {
    await page.goto('/#editor');
    const viewport = page.locator('[data-testid="canvas-viewport"]');
    await expect(viewport).toBeVisible();

    // 1. Verify Horizontal Scrolling (Left-Right) when zoomed
    const zoomInBtn = page.locator(
      '[data-testid="mobile-canvas-zoom-controls"] button[title="Zoom In"]'
    );
    await expect(zoomInBtn).toBeVisible();
    // Click zoom in to increase scale
    await zoomInBtn.click();
    await zoomInBtn.click();
    await page.waitForTimeout(300);

    // Check scrollWidth vs clientWidth
    const scrollDimensions = await viewport.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      canScrollHorizontally: el.scrollWidth > el.clientWidth,
    }));
    expect(scrollDimensions.canScrollHorizontally).toBe(true);

    // Scroll to the right
    await viewport.evaluate((el) => {
      el.scrollLeft = 80;
    });
    const scrolledLeft = await viewport.evaluate((el) => el.scrollLeft);
    expect(scrolledLeft).toBeGreaterThan(0);

    // Scroll back to the left
    await viewport.evaluate((el) => {
      el.scrollLeft = 0;
    });
    const scrolledBack = await viewport.evaluate((el) => el.scrollLeft);
    expect(scrolledBack).toBe(0);

    // Take screenshot of horizontally scrolled canvas
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-canvas-horizontal-scroll.png',
    });

    // 2. Open Template Gallery -> Breaking News tab
    const bottomNavPresetsBtn = page.locator('[data-testid="mobile-nav-presets"]');
    await bottomNavPresetsBtn.click();

    const galleryOpenBtn = page.locator('[data-testid="mobile-btn-template-gallery"]');
    await galleryOpenBtn.click();

    const galleryModal = page.locator('[data-testid="template-gallery-modal"]');
    await expect(galleryModal).toBeVisible();

    // Switch to Breaking News tab
    const breakingTab = page.locator('[data-testid="category-tab-breaking"]');
    await breakingTab.click();

    // 3. Test "📢 मास्टहेड पट्टी" - Applying subheader directly to Masthead
    const applyMastheadBtn = page.locator(
      '[data-testid="btn-apply-masthead-sub-preset-breaking-red"]'
    );
    await expect(applyMastheadBtn).toBeVisible();
    await applyMastheadBtn.click();

    // Verify notification and masthead announcement strip updated
    await expect(page.locator('[data-testid="masthead-section"]')).toBeVisible();
    const mastheadText = await page.locator('[data-testid="masthead-section"]').textContent();
    expect(mastheadText).toContain('संसद में ऐतिहासिक नीति पर मुहर');

    // 4. Test "📰 पेज शीर्ष पर" - Inserting subheader at the very TOP of the page (not bottom of news!)
    if (!(await galleryOpenBtn.isVisible())) {
      await bottomNavPresetsBtn.click();
    }
    await galleryOpenBtn.click();
    await breakingTab.click();

    const applyTopBtn = page.locator('[data-testid="btn-apply-top-banner-preset-breaking-black"]');
    await expect(applyTopBtn).toBeVisible();
    await applyTopBtn.click();

    // Verify that the top article on the page is now the newly inserted banner
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    await expect(firstArticle).toBeVisible();
    const firstArticleText = await firstArticle.textContent();
    expect(firstArticleText).toContain('अंतरराष्ट्रीय शिखर सम्मेलन');

    // Close any bottom sheet drawer so full canvas view is visible
    const sheetCloseBtn = page
      .locator('[data-testid="mobile-bottom-sheet"] button')
      .filter({ hasText: '✕' });
    if ((await sheetCloseBtn.count()) > 0 && (await sheetCloseBtn.first().isVisible())) {
      await sheetCloseBtn.first().click();
    }
    await page.waitForTimeout(300);

    // Fit width for clean visual inspection
    const fitWidthBtn = page.locator(
      '[data-testid="mobile-canvas-zoom-controls"] button[title="Fit Width"]'
    );
    if (await fitWidthBtn.isVisible()) {
      await fitWidthBtn.click();
      await page.waitForTimeout(300);
    }

    // Take screenshot of page with sub-header at masthead and top banner at page index 0
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-subheader-positions-verified.png',
    });
  });
});
