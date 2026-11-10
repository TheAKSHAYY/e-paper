import { test, expect } from '@playwright/test';

test.describe('Mobile Simple Mode & WhatsApp News Intake Workflow', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test('should default to Simple Mode on mobile, toggle modes, and insert WhatsApp news via paste modal', async ({
    page,
  }) => {
    // 1. Visit editor on mobile
    await page.goto('/#editor');
    await page.waitForLoadState('networkidle');

    // Verify mode toggle pill in top bar
    const topBarModeBtn = page.locator('[data-testid="mobile-mode-switch-btn"]');
    await expect(topBarModeBtn).toBeVisible();
    await expect(topBarModeBtn).toContainText('सरल');

    // 2. Toggle to Pro Mode
    await topBarModeBtn.click();
    await expect(topBarModeBtn).toContainText('प्रो');

    // Toggle back to Simple Mode
    await topBarModeBtn.click();
    await expect(topBarModeBtn).toContainText('सरल');

    // 3. Open "+ ब्लॉक" Bottom Sheet
    const addBlockNavBtn = page.locator('[data-testid="mobile-nav-blocks"]');
    await expect(addBlockNavBtn).toBeVisible();
    await addBlockNavBtn.click();

    // Verify WhatsApp Paste card is prominent at the top
    const whatsappPasteCard = page.locator('[data-testid="btn-open-whatsapp-paste"]');
    await expect(whatsappPasteCard).toBeVisible();
    await whatsappPasteCard.click();

    // 4. Verify WhatsAppNewsPasteModal is open
    const modal = page.locator('[data-testid="whatsapp-news-modal-content"]');
    await expect(modal).toBeVisible();

    // Click "📋 उदाहरण समाचार भरें" (Load Sample)
    const loadSampleBtn = page.locator('[data-testid="btn-load-sample-dispatch"]');
    await expect(loadSampleBtn).toBeVisible();
    await loadSampleBtn.click();

    // Click "⚡ पार्स करें (शीर्षक व खबर अलग करें)"
    const parseBtn = page.locator('[data-testid="btn-parse-whatsapp"]');
    await expect(parseBtn).toBeVisible();
    await parseBtn.click();

    // Capture screenshot of parsed WhatsApp modal
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-whatsapp-parsed-modal.png',
    });

    // Verify parsed editable fields are populated
    const headlineInput = page.locator('[data-testid="input-parsed-headline"]');
    await expect(headlineInput).toBeVisible();
    const headlineVal = await headlineInput.inputValue();
    expect(headlineVal.length).toBeGreaterThan(5);

    // Verify dateline and body are extracted
    const bodyInput = page.locator('[data-testid="input-parsed-body"]');
    await expect(bodyInput).toBeVisible();
    const bodyVal = await bodyInput.inputValue();
    expect(bodyVal.length).toBeGreaterThan(20);

    // 5. Click "✓ पेज पर जोड़ें (Insert to Page)"
    const insertBtn = page.locator('[data-testid="btn-insert-story-to-page"]');
    await expect(insertBtn).toBeVisible();
    await insertBtn.click();

    // Modal should close
    await expect(modal).toBeHidden();

    // Verify new article appeared on the newspaper canvas
    const canvas = page.locator('[data-testid="newspaper-sheet-canvas"]');
    await expect(canvas).toBeVisible();
    await expect(canvas.getByText(headlineVal.slice(0, 15))).toBeVisible();

    // Capture screenshot of story inserted on mobile canvas
    await page.screenshot({
      path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-whatsapp-story-inserted.png',
    });
  });
});
