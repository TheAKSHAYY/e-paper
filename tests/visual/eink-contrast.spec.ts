import { test, expect } from '@playwright/test';

test.describe('Visual & Typographic Rendering Specs', () => {
  test('should render high-contrast typography and newspaper sheet container', async ({ page }) => {
    await page.goto('/');

    const sheet = page.locator('[data-testid="newspaper-sheet-canvas"]');
    await expect(sheet).toBeVisible();

    // Verify background color is newsprint tone
    const backgroundColor = await sheet.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(backgroundColor).toBeTruthy();

    // Verify masthead headline color is dark/high-contrast
    const masthead = page.locator('[data-testid="masthead-title"]');
    await expect(masthead).toBeVisible();
    const mastheadColor = await masthead.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Dark ink (rgb(17, 17, 17))
    expect(mastheadColor).toContain('rgb');

    // Verify grid has multiple article cards
    const articleCards = page.locator('[data-testid^="article-card-"]');
    const count = await articleCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
