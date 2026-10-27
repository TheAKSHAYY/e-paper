import { test, expect } from '@playwright/test';

test.describe('E-Paper Studio UI Baseline', () => {
  test('should load the studio home page and display hardware profiles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/E-Paper Studio/);
    await expect(page.locator('h1')).toContainText('E-Paper Studio');
    await expect(page.getByText('Target Hardware Profiles')).toBeVisible();
  });
});
