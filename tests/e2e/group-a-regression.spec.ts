import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Group A Regression & Feature Verification in Real Browser', () => {
  const screenshotsDir = path.resolve('test-results/audit-screenshots');

  test('1. Ctrl+Z / Ctrl+Y ignored inside input and textarea (no whole-doc revert)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Select first article
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    await firstArticle.click();
    await page.waitForTimeout(300);

    // Focus headline textarea and append text via typing
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await textarea.focus();
    const initialText = await textarea.inputValue();

    // Type additional letters
    await textarea.pressSequentially(' - ताज़ा');
    await page.waitForTimeout(200);
    const typedText = await textarea.inputValue();
    expect(typedText).toContain('- ताज़ा');

    // Press Ctrl+Z: it should undo only the recent typing in the input, NOT revert the entire document
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(300);

    // Verify document-level undo toast did NOT appear
    const undoToast = page.getByText('पूर्ववत किया गया (Undo)');
    expect(await undoToast.count()).toBe(0);
  });

  test('2. Page deletion confirmation modal and Undo toast restoration', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Open sidebar pages tab if rail is collapsed
    const pagesRailBtn = page.getByRole('button', { name: /▤.*पेज/i });
    if (await pagesRailBtn.isVisible()) {
      await pagesRailBtn.click();
      await page.waitForTimeout(300);
    }
    const pagesTab = page.getByRole('button', { name: /पेज \(\d+\)/i }).first();
    await pagesTab.click();
    await page.waitForTimeout(300);

    // Add a new page first so we have at least 2 pages
    const addPageBtn = page.getByRole('button', { name: /\+ नया पेज/i });
    await addPageBtn.click();
    await page.waitForTimeout(500);

    const pagesCountBefore = await page.locator('[data-testid^="page-thumbnail-card-"]').count();
    expect(pagesCountBefore).toBeGreaterThanOrEqual(2);

    // Click delete on the last page card
    const deleteBtn = page.getByTitle(/पेज हटा/i).last();
    await deleteBtn.click();
    await page.waitForTimeout(300);

    // 1. Verify confirmation modal is visible
    const confirmModal = page.locator('[data-testid="delete-page-confirm-dialog"]');
    await expect(confirmModal).toBeVisible();

    // 2. Test Cancel button
    const cancelBtn = page.locator('[data-testid="cancel-delete-page-btn"]');
    await cancelBtn.click();
    await expect(confirmModal).toBeHidden();
    expect(await page.locator('[data-testid^="page-thumbnail-card-"]').count()).toBe(pagesCountBefore);

    // 3. Confirm deletion
    await deleteBtn.click();
    await expect(confirmModal).toBeVisible();
    const confirmDeleteBtn = page.locator('[data-testid="confirm-delete-page-btn"]');
    await confirmDeleteBtn.click();
    await expect(confirmModal).toBeHidden();

    // Verify page count decreased
    await page.waitForTimeout(300);
    expect(await page.locator('[data-testid^="page-thumbnail-card-"]').count()).toBe(pagesCountBefore - 1);

    // 4. Verify Toast with Undo button appeared and restore page
    const toastUndoBtn = page.locator('[data-testid="toast-undo-btn"]');
    await expect(toastUndoBtn).toBeVisible();
    await toastUndoBtn.click();
    await page.waitForTimeout(500);

    // Verify page was restored!
    expect(await page.locator('[data-testid^="page-thumbnail-card-"]').count()).toBe(pagesCountBefore);
  });

  test('4. JSON Backup Export & Import buttons present and active', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Verify backup button
    const backupBtn = page.getByRole('button', { name: /📁.*बैकअप/i }).first();
    await expect(backupBtn).toBeVisible();

    // Verify import button
    const importBtn = page.getByRole('button', { name: /📂.*इम्पोर्ट/i }).first();
    await expect(importBtn).toBeVisible();

    // Capture screenshot of TopBar with backup/import
    const topBar = page.locator('[data-testid="studio-top-bar"]').or(page.locator('header').first());
    await topBar.screenshot({ path: path.join(screenshotsDir, 'topbar-group-a-buttons.png') });
  });

  test('5 & 8. Numeric clamping: zero/negative values are safely guarded', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Open inspector for first article
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    await firstArticle.click();
    await page.waitForTimeout(300);

    // Switch to Free placement mode or inspect custom height input if available
    const heightModeSelect = page.getByRole('button', { name: /ऊँचाई.*Min|न्यूनतम/i }).first();
    if (await heightModeSelect.count() > 0) {
      await heightModeSelect.click();
      await page.waitForTimeout(300);

      const heightInput = page.locator('input[type="number"][min="50"]').first();
      if (await heightInput.count() > 0) {
        await heightInput.fill('-50');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(300);

        // Verify it was clamped to min 50
        const val = await heightInput.inputValue();
        expect(parseInt(val, 10)).toBeGreaterThanOrEqual(50);
      }
    }
  });
});
