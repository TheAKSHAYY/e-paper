import { test, expect } from '@playwright/test';

test.describe('E-Paper Studio Comprehensive QA & Audit', () => {
  test('Desktop & Mobile: Run through all workflows, edge cases and console checks', async ({
    page,
  }) => {
    const consoleLogs: { type: string; text: string }[] = [];
    page.on('console', (msg) => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    });

    // 1. Visit editor on desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Verify editor loaded
    await expect(page.locator('[data-testid="newspaper-articles-grid"]')).toBeVisible();

    // 2. Test Keyboard Shortcut in Input (Bug Check: does Ctrl+Z fire while typing in an input?)
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    await firstArticle.click();
    await page.waitForTimeout(300);

    const headlineInput = page.locator('textarea').first();
    await expect(headlineInput).toBeVisible();
    await headlineInput.focus();
    await headlineInput.fill('परीक्षण शीर्षक पूर्व');
    // Press Ctrl+Z inside the textarea
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(300);
    const textAfterCtrlZ = await headlineInput.inputValue();
    console.log('Text in textarea after Ctrl+Z:', textAfterCtrlZ);

    // 3. Test Auto Fit on current page
    const autoFitBtn = page.getByRole('button', { name: /ऑटो-फ़िट|Auto Fit/i }).first();
    await expect(autoFitBtn).toBeVisible();
    await autoFitBtn.click();
    await page.waitForTimeout(500);

    // 4. Test Theme / Colours Modal
    const themeBtn = page.getByRole('button', { name: /रंग \/ थीम|Theme/i }).first();
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    await page.waitForTimeout(500);

    // Check Theme Modal is visible
    const themeModal = page.locator('[role="dialog"]').or(page.getByText('समाचार पत्र थीम व रंग'));
    await expect(themeModal.first()).toBeVisible();

    // Click Deep Blue preset
    const deepBluePreset = page.getByRole('button', { name: /गहरा नीला|Deep Editorial Blue/i });
    if ((await deepBluePreset.count()) > 0) {
      await deepBluePreset.click();
      await page.waitForTimeout(300);
    }

    // Apply/Done theme and close modal
    const doneThemeBtn = page.getByRole('button', { name: /पूर्ण \(Done\)|बंद करें/i }).first();
    await doneThemeBtn.click();
    await page.waitForTimeout(300);

    // 5. Test Page Management: Add Page, Duplicate Page, Delete Page
    // Switch to Pages tab in sidebar (open rail if collapsed)
    const pagesRailBtn = page.getByRole('button', { name: /▤.*पेज/i });
    if (await pagesRailBtn.isVisible()) {
      await pagesRailBtn.click();
      await page.waitForTimeout(300);
    }
    const pagesTab = page.getByRole('button', { name: /पेज \(\d+\)/i }).first();
    await pagesTab.click();
    await page.waitForTimeout(300);

    const initialPageCount = await page.locator('[draggable="true"]').count();
    console.log('Initial draggable page cards count:', initialPageCount);

    const addPageBtn = page.getByRole('button', { name: /\+ नया पेज/i });
    await addPageBtn.click();
    await page.waitForTimeout(500);

    // 6. Test Mobile Viewport (~390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);

    // Verify mobile top bar and mobile bottom nav
    const mobileTopBar = page.locator('[data-testid="mobile-top-bar"]');
    await expect(mobileTopBar).toBeVisible();

    const mobileBottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(mobileBottomNav).toBeVisible();

    // Check button sizes for tap target compliance (min 44px)
    const navButtons = mobileBottomNav.locator('button');
    const buttonCount = await navButtons.count();
    const tapTargetIssues: string[] = [];
    for (let i = 0; i < buttonCount; i++) {
      const box = await navButtons.nth(i).boundingBox();
      const text = await navButtons.nth(i).innerText();
      if (box && (box.width < 44 || box.height < 44)) {
        tapTargetIssues.push(
          `Button "${text.replace(/\n/g, ' ')}" is ${box.width}x${box.height}px (< 44px)`
        );
      }
    }
    console.log('Mobile tap target issues:', tapTargetIssues);

    // Check console errors
    const errors = consoleLogs.filter((l) => l.type === 'error');
    const warnings = consoleLogs.filter((l) => l.type === 'warning');
    console.log('Total console errors:', errors.length, errors);
    console.log('Total console warnings:', warnings.length);

    expect(errors.length).toBe(0);
  });
});
