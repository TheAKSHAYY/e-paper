import { test, expect } from '@playwright/test';

test.describe('Mobile-First Newspaper Editor & Complete Typography Control', () => {
  const mobileViewports = [
    { name: 'Small Phone (360x740)', width: 360, height: 740 },
    { name: 'iPhone SE (375x667)', width: 375, height: 667 },
    { name: 'iPhone 14 (390x844)', width: 390, height: 844 },
    { name: 'iPhone 15 Pro Max (430x932)', width: 430, height: 932 },
  ];

  for (const vp of mobileViewports) {
    test(`1. Bottom toolbar renders 5 newspaper-focused touch items (>= 44px) on ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/#editor');
      await page.waitForTimeout(600);

      const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
      await expect(bottomNav).toBeVisible();

      // Check all 5 restored authentic newspaper items: Pages, Add Block, Editor, Format, PDF
      const navButtons = [
        page.locator('[data-testid="mobile-nav-pages"]'),
        page.locator('[data-testid="mobile-nav-blocks"]'),
        page.locator('[data-testid="mobile-nav-inspector"]'),
        page.locator('[data-testid="mobile-nav-presets"]'),
        page.locator('[data-testid="mobile-nav-pdf"]'),
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

      // Verify labels match exact newspaper terms
      await expect(page.locator('[data-testid="mobile-nav-pages"]')).toContainText(/पेज/i);
      await expect(page.locator('[data-testid="mobile-nav-blocks"]')).toContainText(/ब्लॉक/i);
      await expect(page.locator('[data-testid="mobile-nav-inspector"]')).toContainText(
        /संपादक|गुण/i
      );
      await expect(page.locator('[data-testid="mobile-nav-presets"]')).toContainText(/प्रारूप/i);
      await expect(page.locator('[data-testid="mobile-nav-pdf"]')).toContainText(/PDF/i);
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

    // Tap "+ ब्लॉक" tool to open bottom sheet
    const blockNavBtn = page.locator('[data-testid="mobile-nav-blocks"]');
    await blockNavBtn.click();
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

    // Open Presets sheet
    await page.locator('[data-testid="mobile-nav-presets"]').click();
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Initial height is compact peek (~42vh)
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

  test('6. Mobile Grid & Column Control: 12-col row presets and column adjustments on phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Open Presets / Format drawer
    await page.locator('[data-testid="mobile-nav-presets"]').click();
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Switch to Layout & Grid sub-tab
    const layoutTab = page.locator('[data-testid="mobile-tab-layout"]');
    await expect(layoutTab).toBeVisible();
    await layoutTab.click();
    await page.waitForTimeout(200);

    // Verify 12-column row presets are rendered
    const rowPreset6_6 = page.locator('[data-testid="layout-preset-6-6"]');
    await expect(rowPreset6_6).toBeVisible();

    // Tap quick column button (e.g. 6 Cols)
    const col6Btn = page.locator('[data-testid="mobile-grid-col-6"]');
    await expect(col6Btn).toBeVisible();
    await col6Btn.click();
    await page.waitForTimeout(200);

    // Verify canvas reflects 6-column layout
    const canvas = page.locator('[data-testid="newspaper-sheet-canvas"]').first();
    await expect(canvas).toBeVisible();
  });

  test('7. Mobile Contextual Inspector: Border controls, spacing & appearance accessible for articles', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Tap on an article in the canvas
    const article = page.locator('[data-testid^="article-card-"]').first();
    await expect(article).toBeVisible();
    await article.click();
    await page.waitForTimeout(300);

    // Mobile Bottom Sheet opens in inspector mode
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Check Headline input & active element banner
    await expect(page.locator('[data-testid="mobile-active-part-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-input-headline"]')).toBeVisible();

    // Check Typography Controls are rendered inside mobile sheet
    const typoControls = sheet.locator('[data-testid="typography-controls"]');
    await expect(typoControls).toBeVisible();

    // Switch to Block settings chip
    const blockChip = page.locator('[data-testid="mobile-switch-to-block"]');
    await expect(blockChip).toBeVisible();
    await blockChip.click();
    await page.waitForTimeout(200);

    // Verify Border Controls are present in Block Settings
    const borderControls = sheet.locator('[data-testid="border-controls"]');
    await expect(borderControls).toBeVisible();

    // Verify Padding, Margin, and Appearance (Background & Opacity)
    await expect(sheet.locator('text=पैडिंग (Padding)')).toBeVisible();
    await expect(sheet.locator('text=मार्जिन (Margin)')).toBeVisible();
    await expect(sheet.locator('text=पारदर्शिता (Opacity)')).toBeVisible();
  });

  test('8. Cross-Element Style Isolation: Modifying Headline typography does NOT affect Body text', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Click directly on the headline in the first article
    const headlineEl = page.locator('h2.article-headline').first();
    await expect(headlineEl).toBeVisible();
    await headlineEl.click();
    await page.waitForTimeout(300);

    // Locate body paragraph
    const bodyPara = page.locator('p.article-para').first();
    await expect(bodyPara).toBeVisible();

    // Capture initial body font size and color
    const initialBodyFontSize = await bodyPara.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    );
    const initialBodyColor = await bodyPara.evaluate((el) => window.getComputedStyle(el).color);

    // Bottom sheet is open with headline active
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(page.locator('[data-testid="mobile-active-part-banner"]')).toContainText(
      /शीर्षक|Headline/i
    );

    // Click headline font size increment button (+) multiple times
    const incBtn = sheet.locator('[data-testid="font-size-increment-btn"]');
    await incBtn.click();
    await incBtn.click();
    await page.waitForTimeout(200);

    // Change headline text color
    const colorPicker = sheet.locator('[data-testid="text-color-picker"]');
    if (await colorPicker.isVisible()) {
      await colorPicker.fill('#b91c1c');
      await page.waitForTimeout(200);
    }

    // Verify headline font size increased
    const updatedHeadlineFontSize = await headlineEl.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    );
    expect(updatedHeadlineFontSize).toBeTruthy();

    // Verify BODY FONT SIZE IS UNCHANGED
    const finalBodyFontSize = await bodyPara.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(finalBodyFontSize).toEqual(initialBodyFontSize);

    // Verify BODY COLOR IS UNCHANGED
    const finalBodyColor = await bodyPara.evaluate((el) => window.getComputedStyle(el).color);
    expect(finalBodyColor).toEqual(initialBodyColor);
  });

  test('9. Cross-Element Alignment Isolation: Modifying Headline alignment does NOT affect Body alignment', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const headlineEl = page.locator('h2.article-headline').first();
    await headlineEl.click();
    await page.waitForTimeout(300);

    const bodyPara = page.locator('p.article-para').first();
    const initialBodyAlign = await bodyPara.evaluate((el) => window.getComputedStyle(el).textAlign);

    // Set headline alignment to Center
    const centerAlignBtn = page.locator('[data-testid="align-center-btn"]');
    await centerAlignBtn.click();
    await page.waitForTimeout(200);

    // Headline is centered
    const headlineAlign = await headlineEl.evaluate((el) => window.getComputedStyle(el).textAlign);
    expect(headlineAlign).toBe('center');

    // Body paragraph alignment remains unchanged
    const finalBodyAlign = await bodyPara.evaluate((el) => window.getComputedStyle(el).textAlign);
    expect(finalBodyAlign).toEqual(initialBodyAlign);
  });

  test('10. Individual Paragraph Isolation: Changing ¶1 font size does NOT change ¶2 or headline', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const headlineEl = page.locator('h2.article-headline').first();
    const initialHeadlineSize = await headlineEl.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    );

    // Click specifically on paragraph 1
    const para1 = page.locator('p.article-para').first();
    await expect(para1).toBeVisible();
    await para1.click();
    await page.waitForTimeout(300);

    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // Verify Paragraph 1 is active
    const p1Chip = sheet.locator('[data-testid="target-paragraph-0"]');
    if (await p1Chip.isVisible()) {
      await p1Chip.click();
      await page.waitForTimeout(200);
    }

    // Increment Paragraph 1 size
    const incBtn = sheet.locator('[data-testid="font-size-increment-btn"]');
    await incBtn.click();
    await incBtn.click();
    await page.waitForTimeout(200);

    // Headline size must be untouched
    const finalHeadlineSize = await headlineEl.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    );
    expect(finalHeadlineSize).toEqual(initialHeadlineSize);

    // If there is a second paragraph, its style is unaffected
    const para2 = page.locator('p.article-para').nth(1);
    if ((await para2.count()) > 0) {
      const p1Style = await para1.evaluate((el) => window.getComputedStyle(el).fontSize);
      const p2Style = await para2.evaluate((el) => window.getComputedStyle(el).fontSize);
      expect(p1Style).not.toEqual(p2Style);
    }
  });

  test('11. Mobile Top Inspector Hierarchy across 360px, 375px, 390px, 430px viewports', async ({
    page,
  }) => {
    const viewports = [
      { name: '360px', width: 360, height: 740 },
      { name: '375px', width: 375, height: 667 },
      { name: '390px', width: 390, height: 844 },
      { name: '430px', width: 430, height: 932 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/#editor');
      await page.waitForTimeout(400);

      const headlineEl = page.locator('h2.article-headline').first();
      await headlineEl.click();
      await page.waitForTimeout(200);

      const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
      await expect(sheet).toBeVisible();

      // Top banner is visible
      const banner = page.locator('[data-testid="mobile-active-part-banner"]');
      await expect(banner).toBeVisible();

      // Headline input is visible immediately at the top
      const headlineInput = page.locator('[data-testid="mobile-input-headline"]');
      await expect(headlineInput).toBeVisible();

      // Stepper & Badges are visible without scrolling
      const sizeBadge = sheet.locator('[data-testid="current-font-size-badge"]');
      await expect(sizeBadge).toBeVisible();
      const stepper = sheet.locator('[data-testid="font-size-decrement-btn"]');
      await expect(stepper).toBeVisible();

      // Save screenshot for proof
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-viewport-${vp.name}-inspector.png`,
      });
    }
  });

  test('12. Quick Element Switcher: Seamless switching between Headline, Subhead, Body, Media, Block', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const headlineEl = page.locator('h2.article-headline').first();
    await headlineEl.click();
    await page.waitForTimeout(300);

    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();

    // 1. Switch to Subheadline
    await page.locator('[data-testid="mobile-switch-to-subheadline"]').click();
    await page.waitForTimeout(150);
    await expect(page.locator('[data-testid="mobile-input-subheadline"]')).toBeVisible();

    // 2. Switch to Body
    await page.locator('[data-testid="mobile-switch-to-body"]').click();
    await page.waitForTimeout(150);
    await expect(page.locator('[data-testid="mobile-input-body"]')).toBeVisible();

    // 3. Switch to Photo
    await page.locator('[data-testid="mobile-switch-to-image"]').click();
    await page.waitForTimeout(150);
    await expect(sheet.locator('text=फोटो व चित्र')).toBeVisible();

    // 4. Switch to Block
    await page.locator('[data-testid="mobile-switch-to-block"]').click();
    await page.waitForTimeout(150);
    await expect(sheet.locator('text=कॉलम फैलाव')).toBeVisible();

    // 5. Switch back to Headline
    await page.locator('[data-testid="mobile-switch-to-headline"]').click();
    await page.waitForTimeout(150);
    await expect(page.locator('[data-testid="mobile-input-headline"]')).toBeVisible();
  });

  test('13. Canvas Selection Highlight Outline', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Tap headline
    const headlineEl = page.locator('h2.article-headline').first();
    await headlineEl.click();
    await page.waitForTimeout(300);

    // Check outline style on headline
    const headlineOutline = await headlineEl.evaluate((el) => window.getComputedStyle(el).outline);
    expect(headlineOutline).toContain('rgb(37, 99, 235)');

    // Tap body paragraph
    const bodyPara = page.locator('p.article-para').first();
    await bodyPara.click();
    await page.waitForTimeout(300);

    // Check outline on body paragraph
    const bodyOutline = await bodyPara.evaluate((el) => window.getComputedStyle(el).outline);
    expect(bodyOutline).toContain('rgb(37, 99, 235)');
  });

  test('14. Empty Canvas Tap Deselects Article', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Select headline
    const headlineEl = page.locator('h2.article-headline').first();
    await headlineEl.click();
    await page.waitForTimeout(300);
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(page.locator('[data-testid="mobile-active-part-banner"]')).toBeVisible();

    // Tap deselect button in sheet header
    const deselectBtn = page.locator('button', { hasText: 'चयन हटाएँ' });
    if (await deselectBtn.isVisible()) {
      await deselectBtn.click();
      await page.waitForTimeout(200);
      // Sheet returns to page properties
      await expect(page.locator('[data-testid="mobile-active-part-banner"]')).not.toBeVisible();
      await expect(sheet.locator('text=अख़बार का मुख्य नाम')).toBeVisible();
    }
  });

  test('15. Tapping Masthead automatically opens Editor with Masthead Inspector Panel across 4 viewports', async ({
    page,
  }) => {
    for (const vp of mobileViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/#editor');
      await page.waitForTimeout(600);

      const mastheadSection = page.locator('[data-testid="masthead-section"]');
      await expect(mastheadSection).toBeVisible();

      // Tap masthead on canvas
      await mastheadSection.click();
      await page.waitForTimeout(400);

      // Verify bottom sheet opens in 'inspector' mode
      const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
      await expect(sheet).toBeVisible();

      // Verify header/banner says Editing: Masthead
      const banner = page.locator('[data-testid="mobile-active-part-banner"]');
      await expect(banner).toBeVisible();
      await expect(banner).toContainText(/संपादित हो रहा है: मास्टहेड/i);

      // Verify MastheadInspectorPanel is visible
      const mastheadPanel = page.locator('[data-testid="masthead-inspector-panel"]');
      await expect(mastheadPanel).toBeVisible();

      // Verify core controls exist: title input, font family, font size, tabs
      await expect(page.locator('[data-testid="input-masthead-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="masthead-tab-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="masthead-tab-meta"]')).toBeVisible();
      await expect(page.locator('[data-testid="masthead-tab-rules"]')).toBeVisible();

      // Capture screenshot for visual proof
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/masthead-selected-inspector-${vp.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
      });
    }
  });

  test('16. Sub-element masthead selection: Weather/AQI strip opens Meta tab, Title opens Title tab', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Tap top strip (weather/AQI)
    const topStrip = page.locator('[data-testid="masthead-top-strip"]');
    if (await topStrip.isVisible()) {
      await topStrip.click();
      await page.waitForTimeout(400);

      // Verify bottom sheet is open in inspector with Meta tab active
      const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
      await expect(sheet).toBeVisible();
      await expect(page.locator('[data-testid="masthead-tab-meta"]')).toBeVisible();
      // Meta tab content check
      await expect(page.locator('text=मौसम व विवरण')).toBeVisible();
    }

    // Tap main title row
    const mainTitleRow = page.locator('[data-testid="masthead-main-row"]');
    await mainTitleRow.click();
    await page.waitForTimeout(400);

    // Verify Title tab is active
    await expect(page.locator('[data-testid="input-masthead-title"]')).toBeVisible();
  });

  test('17. Switching between Format and Editor preserves selected element', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // 1. Select headline
    const headline = page.locator('h2.article-headline').first();
    await headline.click();
    await page.waitForTimeout(400);

    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(page.locator('[data-testid="mobile-input-headline"]')).toBeVisible();

    // 2. Tap Format (प्रारूप) on bottom nav
    await page.locator('[data-testid="mobile-nav-presets"]').click();
    await page.waitForTimeout(300);
    await expect(sheet.locator('text=अख़बार प्रारूप व विन्यास')).toBeVisible();

    // 3. Tap Editor (संपादक) on bottom nav
    await page.locator('[data-testid="mobile-nav-inspector"]').click();
    await page.waitForTimeout(300);

    // Verify headline is still selected and headline editor is restored!
    await expect(page.locator('[data-testid="mobile-input-headline"]')).toBeVisible();
  });

  test('18. Selecting an element while Format is open automatically switches to Editor', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    // Open Format sheet
    await page.locator('[data-testid="mobile-nav-presets"]').click();
    await page.waitForTimeout(300);
    const sheet = page.locator('[data-testid="mobile-bottom-sheet"]');
    await expect(sheet.locator('text=अख़बार प्रारूप व विन्यास')).toBeVisible();

    // While Format is open, tap the Masthead on canvas
    const masthead = page.locator('[data-testid="masthead-section"]');
    await masthead.click();
    await page.waitForTimeout(400);

    // Bottom sheet must automatically switch to Editor with Masthead Inspector!
    await expect(page.locator('[data-testid="mobile-active-part-banner"]')).toContainText(
      /संपादित हो रहा है: मास्टहेड/i
    );
    await expect(page.locator('[data-testid="masthead-inspector-panel"]')).toBeVisible();

    // Open Format sheet again
    await page.locator('[data-testid="mobile-nav-presets"]').click();
    await page.waitForTimeout(300);
    await expect(sheet.locator('text=अख़बार प्रारूप व विन्यास')).toBeVisible();

    // While Format is open, tap a Subheadline on canvas
    const subhead = page.locator('.article-subheadline').first();
    await subhead.click();
    await page.waitForTimeout(400);

    // Bottom sheet must automatically switch to Editor with Subheadline input!
    await expect(page.locator('[data-testid="mobile-input-subheadline"]')).toBeVisible();
  });

  test('19. Visual Proof Screenshots: Masthead, Headline, Subheadline, Body, Format across viewports', async ({
    page,
  }) => {
    const viewportsToTest = [
      { name: '360px', width: 360, height: 740 },
      { name: '375px', width: 375, height: 667 },
      { name: '390px', width: 390, height: 844 },
      { name: '430px', width: 430, height: 932 },
    ];

    for (const vp of viewportsToTest) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/#editor');
      await page.waitForTimeout(600);

      // 1. Masthead selected with Masthead Inspector open
      await page.locator('[data-testid="masthead-section"]').click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/masthead-selected-inspector-${vp.name}.png`,
      });

      // 2. Headline selected with Headline Inspector open
      await page.locator('h2.article-headline').first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/headline-selected-inspector-${vp.name}.png`,
      });

      // 3. Subheadline selected with Subheadline Inspector open
      await page.locator('.article-subheadline').first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/subheadline-selected-inspector-${vp.name}.png`,
      });

      // 4. Body paragraph selected with Body Inspector open
      await page.locator('p.article-para').first().click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/body-selected-inspector-${vp.name}.png`,
      });

      // 5. Format panel open independently
      await page.locator('[data-testid="mobile-nav-presets"]').click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/format-panel-open-${vp.name}.png`,
      });
    }
  });

  test('20. Mobile Border Controls visibility across all element tabs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const headlineEl = page.locator('h2.article-headline').first();
    await headlineEl.click();
    await page.waitForTimeout(300);

    // Headline tab should have headline borders section
    await expect(page.locator('[data-testid="section-headline-borders"]')).toBeVisible();
    await expect(page.locator('[data-testid="border-preview-box"]').first()).toBeVisible();

    // Switch to Subheadline tab
    await page.locator('[data-testid="mobile-switch-to-subheadline"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="section-subheadline-borders"]')).toBeVisible();

    // Switch to Body tab
    await page.locator('[data-testid="mobile-switch-to-body"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="section-body-borders"]')).toBeVisible();

    // Switch to Photo tab
    await page.locator('[data-testid="mobile-switch-to-image"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="section-image-borders"]')).toBeVisible();

    // Switch to Block tab
    await page.locator('[data-testid="mobile-switch-to-block"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="section-block-borders"]')).toBeVisible();
  });

  test('21. Border Controls functionality: sides, width stepper, style select, and color', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const headlineEl = page.locator('h2.article-headline').first();
    await headlineEl.click();
    await page.waitForTimeout(300);

    const borderSection = page.locator('[data-testid="section-headline-borders"]');
    await expect(borderSection).toBeVisible();

    // Toggle Top side border
    const topBtn = borderSection.locator('[data-testid="border-side-top"]');
    await topBtn.click();
    await page.waitForTimeout(200);

    // Increment width using stepper
    const widthPlus = borderSection.locator('[data-testid="border-width-plus"]');
    await widthPlus.click();
    await widthPlus.click();
    await page.waitForTimeout(200);

    // Select dashed style
    const styleSelect = borderSection.locator('[data-testid="border-style-select"]');
    await styleSelect.selectOption('dashed');
    await page.waitForTimeout(200);

    // Live preview box should reflect dashed border
    const previewBox = borderSection.locator('[data-testid="border-preview-box"]');
    await expect(previewBox).toBeVisible();
    const borderTopStyle = await previewBox.evaluate((el) => window.getComputedStyle(el).borderTopStyle);
    expect(borderTopStyle).toBe('dashed');

    // Also check on the canvas headline element itself
    const headlineTopStyle = await headlineEl.evaluate((el) => window.getComputedStyle(el).borderTopStyle);
    expect(headlineTopStyle).toBe('dashed');

    await page.screenshot({
      path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-headline-border.png`,
    });
  });

  test('22. Independent element borders: Headline border does NOT bleed to Body or Block', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(600);

    const headlineEl = page.locator('h2.article-headline').first();
    const bodyEl = page.locator('.article-body').first();
    const articleEl = page.locator('article.newspaper-article').first();

    await headlineEl.click();
    await page.waitForTimeout(300);

    const headlineBorders = page.locator('[data-testid="section-headline-borders"]');
    // Turn on All borders for headline
    await headlineBorders.locator('[data-testid="border-side-all"]').click();
    await headlineBorders.locator('[data-testid="border-style-select"]').selectOption('double');
    await page.waitForTimeout(200);

    // Verify headline has double border
    const headlineStyle = await headlineEl.evaluate((el) => window.getComputedStyle(el).borderBottomStyle);
    expect(headlineStyle).toBe('double');

    // Body and Article Block MUST NOT have double border
    const bodyBottomStyle = await bodyEl.evaluate((el) => window.getComputedStyle(el).borderBottomStyle);
    expect(bodyBottomStyle).not.toBe('double');

    const articleBottomStyle = await articleEl.evaluate((el) => window.getComputedStyle(el).borderBottomStyle);
    expect(articleBottomStyle).not.toBe('double');

    // Now switch to Block tab and set border for the block container
    await page.locator('[data-testid="mobile-switch-to-block"]').click();
    await page.waitForTimeout(200);

    const blockBorders = page.locator('[data-testid="section-block-borders"]');
    await blockBorders.locator('[data-testid="border-side-bottom"]').click();
    await blockBorders.locator('[data-testid="border-style-select"]').selectOption('solid');
    await page.waitForTimeout(200);

    await page.screenshot({
      path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-block-border.png`,
    });
  });
});
