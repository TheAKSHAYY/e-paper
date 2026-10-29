import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Group C: Accessibility & Hindi Terminology Verification in Real Browser', () => {
  const screenshotsDir = path.resolve('test-results/audit-screenshots');

  test('1. Theme modal dialog accessibility attributes and Escape key dismissal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Open Theme modal
    const themeBtn = page.getByRole('button', { name: /🎨.*रंग \/ थीम/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(500);

    // 1. Verify dialog landmark attributes
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-labelledby', 'theme-modal-title');

    // Screenshot of theme modal for proof
    await dialog.screenshot({ path: path.join(screenshotsDir, 'theme-modal-accessible.png') });

    // 2. Press Escape key to dismiss
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify modal is closed
    await expect(dialog).toBeHidden();
  });

  test('2. Hindi terminology normalization in Contextual Inspector', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(1000);

    // Click first article to open inspector
    const firstArticle = page.locator('[data-testid^="article-card-"]').first();
    await firstArticle.click();
    await page.waitForTimeout(500);

    // Check Hindi labels in inspector
    const inspector = page.locator('aside').filter({ hasText: /संपादक|गुण/i }).first();
    await expect(inspector).toBeVisible();

    const inspectorText = await inspector.innerText();

    // Verify standardized Hindi terminology exists
    expect(inspectorText).toMatch(/कॉलम/i);
    expect(inspectorText).toMatch(/ऊँचाई मोड/i);
    expect(inspectorText).toMatch(/शीर्षक/i);

    // Screenshot of inspector with Hindi terminology
    await inspector.screenshot({ path: path.join(screenshotsDir, 'inspector-hindi-terminology.png') });
  });
});

