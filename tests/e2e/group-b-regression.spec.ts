import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Group B Regression & Mobile UX Verification in Real Browser', () => {
  const screenshotsDir = path.resolve('test-results/audit-screenshots');

  test('1. Article Move Up & Move Down toolbar controls', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Select the first article
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    const firstArticleId = await firstArticle.getAttribute('data-article-id');
    await firstArticle.click();
    await page.waitForTimeout(300);

    // Verify Move Down button appeared
    const moveDownBtn = page.locator('[data-testid="article-move-down-btn"]');
    await expect(moveDownBtn).toBeVisible();

    // Click Move Down
    await moveDownBtn.click();
    await page.waitForTimeout(500);

    // Verify first article is now at second position
    const secondArticle = page.locator('[data-testid^="article-card-"]').nth(1);
    const secondArticleId = await secondArticle.getAttribute('data-article-id');
    expect(secondArticleId).toBe(firstArticleId);
  });

  test('2. Auto Fit toast notification with inline Undo action', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Click Auto Fit button
    const autoFitBtn = page.getByRole('button', { name: /⚡.*ऑटो-फ़िट/i }).first();
    await autoFitBtn.click();
    await page.waitForTimeout(500);

    // Verify toast appeared with Undo button
    const toast = page.locator('[data-testid="status-notification-toast"]');
    await expect(toast).toBeVisible();
    const undoBtn = page.locator('[data-testid="toast-undo-btn"]');
    await expect(undoBtn).toBeVisible();
    await expect(undoBtn).toHaveText(/पूर्ववत करें/i);

    // Click Undo
    await undoBtn.click();
    await page.waitForTimeout(500);
  });

  test('3. Autosave indicator ("स्वतः सहेजा गया")', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(2000);

    // Verify Autosave badge indicates saved status
    const saveBadge = page.locator('[data-testid="autosave-status-badge"]');
    await expect(saveBadge).toBeVisible();
    const text = await saveBadge.innerText();
    expect(text).toContain('सहेजा');
  });

  test('4. Mobile tap targets (all >= 44px) on 390px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    const buttons = bottomNav.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);

    const violations: string[] = [];
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const box = await btn.boundingBox();
      const btnText = (await btn.innerText()).replace(/\n/g, ' ');
      if (!box || box.width < 44 || box.height < 44) {
        violations.push(`Button "${btnText}" is ${box?.width}x${box?.height}px (< 44px)`);
      }
    }

    console.log('Mobile bottom nav tap target violations:', violations);
    expect(violations.length).toBe(0);

    // Capture mobile viewport screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-viewport-390px.png') });

    // Open '+ ब्लॉक' drawer
    const blockBtn = bottomNav.locator('button', { hasText: /ब्लॉक/i });
    await blockBtn.click();
    await page.waitForTimeout(600);

    // Capture drawer screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-drawer-blocks.png') });

    // Open 'पेज' drawer
    const pageBtn = bottomNav.locator('button', { hasText: /पेज/i }).first();
    await pageBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-drawer-pages.png') });

    // Open 'प्रारूप' drawer
    const presetBtn = bottomNav.locator('button', { hasText: /प्रारूप/i });
    await presetBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-drawer-presets.png') });

    // Open 'गुण' drawer
    const inspectorBtn = bottomNav.locator('button', { hasText: /गुण/i });
    await inspectorBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-drawer-inspector.png') });

    // Close drawer
    const closeBtn = page.locator('button[aria-label="बंद करें (Close)"]');
    await closeBtn.click();
    await page.waitForTimeout(400);

    // Click first article to open inspector for an article
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    await firstArticle.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile-drawer-article-inspector.png'),
    });
  });
});
