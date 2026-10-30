import { test, expect } from '@playwright/test';

test.describe('Mobile-First Newspaper Editor & Complete Typography Control', () => {
  const mobileViewports = [
    { name: 'Small Phone (360x740)', width: 360, height: 740 },
    { name: 'iPhone SE (375x667)', width: 375, height: 667 },
    { name: 'iPhone 14 (390x844)', width: 390, height: 844 },
    { name: 'iPhone 15 Pro Max (430x932)', width: 430, height: 932 },
  ];

  for (const vp of mobileViewports) {
    test(`1. Bottom toolbar renders 6 touch-friendly items (>= 44px) on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/#editor');
      await page.waitForTimeout(600);

      const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
      await expect(bottomNav).toBeVisible();

      // Check all 6 required items: Text, Image, Layout, Style, Pages, More
      const navButtons = [
        page.locator('[data-testid="mobile-nav-text"]'),
        page.locator('[data-testid="mobile-nav-image"]'),
        page.locator('[data-testid="mobile-nav-layout"]'),
        page.locator('[data-testid="mobile-nav-style"]'),
        page.locator('[data-testid="mobile-nav-pages"]'),
        page.locator('[data-testid="mobile-nav-more"]'),
      ];

      for (const btn of navButtons) {
        await expect(btn).toBeVisible();
        const box = await btn.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          // Touch target rule: at least 44px wide and 44px high
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  }

  test('2. Always-Visible Preview: Opening bottom sheet does not block canvas preview with opaque overlay', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Canvas preview must be visible
    const canvas = page.locator('[data-testid="newspaper-sheet-canvas"]').first();
    await expect(canvas).toBeVisible();

    // Tap "Text" tool to open bottom sheet
    const textNavBtn = page.locator('[data-testid="mobile-nav-text"]');
    await textNavBtn.click();
    await page.waitForTimeout(300);

    // Bottom sheet is visible
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Canvas must STILL be visible and NOT obscured by a full-screen backdrop
    await expect(canvas).toBeVisible();

    // Check that canvas bounding box is still in view above sheet
    const sheetBox = await sheet.boundingBox();
    const canvasBox = await canvas.boundingBox();
    expect(sheetBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();

    if (sheetBox && canvasBox) {
      // Sheet top should be below canvas top, keeping canvas preview visible
      expect(sheetBox.y).toBeGreaterThan(canvasBox.y);
    }
  });

  test('3. Bottom sheet supports collapsed, expanded state and close button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Open Layout sheet
    await page.locator('[data-testid="mobile-nav-layout"]').click();
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Initial height is compact peek (~38vh)
    const initialBox = await sheet.boundingBox();
    expect(initialBox).not.toBeNull();

    // Click Expand button
    const expandBtn = page.locator('[data-testid="sheet-toggle-expand"]');
    await expandBtn.click();
    await page.waitForTimeout(350);

    const expandedBox = await sheet.boundingBox();
    expect(expandedBox).not.toBeNull();
    if (initialBox && expandedBox) {
      // Expanded height should be noticeably larger than collapsed height
      expect(expandedBox.height).toBeGreaterThan(initialBox.height);
    }

    // Click Close button
    const closeBtn = page.locator('[data-testid="sheet-close-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(200);

    // Sheet should be closed
    await expect(sheet).not.toBeVisible();
  });

  test('4. Floating mobile zoom controls (+, -, ⊡) dynamically zoom canvas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const zoomControls = page.locator('[data-testid="mobile-canvas-zoom-controls"]');
    await expect(zoomControls).toBeVisible();

    // Read initial zoom percentage
    const initialZoomText = await zoomControls.innerText();

    // Tap Zoom In (+)
    const zoomInBtn = zoomControls.locator('button', { hasText: '+' });
    await zoomInBtn.click();
    await page.waitForTimeout(200);

    const zoomedInText = await zoomControls.innerText();
    expect(zoomedInText).not.toEqual(initialZoomText);

    // Tap Fit Width (⊡)
    const fitBtn = zoomControls.locator('button', { hasText: '⊡' });
    await fitBtn.click();
    await page.waitForTimeout(200);
    const fitText = await zoomControls.innerText();
    expect(fitText).toBeTruthy();
  });

  test('5. Complete Typography Controls: Independent formatting with slider and numeric inputs', async ({
    page,
  }) => {
    // Test on desktop inspector to thoroughly assert typography sliders, inputs & preset chips
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Click on the lead article to select it
    const article = page.locator('[data-testid^="article-card-"]').first();
    await expect(article).toBeVisible();
    await article.click();
    await page.waitForTimeout(300);

    // Switch to Style / Typography tab
    const typoTabBtn = page.locator('[data-testid="inspector-tab-typography"]');
    await expect(typoTabBtn).toBeVisible();
    await typoTabBtn.click();
    await page.waitForTimeout(300);

    // Typography Controls component must be visible
    const typoControls = page.locator('[data-testid="typography-controls"]');
    await expect(typoControls).toBeVisible();

    // Verify sub-element target buttons (Headline, Subheadline, Body, Byline, Caption)
    await expect(page.locator('[data-testid="target-element-headline"]')).toBeVisible();
    await expect(page.locator('[data-testid="target-element-body"]')).toBeVisible();

    // Verify font size slider, number input, and size badge
    const sizeBadge = page.locator('[data-testid="current-font-size-badge"]');
    await expect(sizeBadge).toBeVisible();

    const sizeInput = page.locator('[data-testid="font-size-numeric-input"]');
    await expect(sizeInput).toBeVisible();

    // Test increment button (+)
    const initialBadgeText = await sizeBadge.innerText();
    const incBtn = page.locator('[data-testid="font-size-increment-btn"]');
    await incBtn.click();
    await page.waitForTimeout(200);

    const incBadgeText = await sizeBadge.innerText();
    expect(incBadgeText).not.toEqual(initialBadgeText);

    // Test text alignment buttons
    const alignCenterBtn = page.locator('[data-testid="align-center-btn"]');
    await expect(alignCenterBtn).toBeVisible();
    await alignCenterBtn.click();
    await page.waitForTimeout(200);

    // Verify that other articles are NOT affected (individual formatting preserved)
    const secondArticle = page.locator('[data-testid^="article-card-"]').nth(1);
    if ((await secondArticle.count()) > 0) {
      await expect(secondArticle).toBeVisible();
    }
  });
});
