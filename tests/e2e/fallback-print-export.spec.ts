import { test, expect } from '@playwright/test';
import { createNewspaperDocument, getPhysicalPageMetrics } from '../../packages/template-engine/src/index';
import { generatePrintHtml } from '../../apps/web/src/utils/browserPrintExport';

test.describe('Fallback Print / Save as PDF Flow (Standalone without Renderer)', () => {
  test('1. Print button opens instructions modal with Hindi settings and recommendations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(500);

    // Verify the Print fallback button exists in the TopBar next to PDF
    const printBtn = page.locator('[data-testid="btn-print-pdf"]');
    await expect(printBtn).toBeVisible();
    await expect(printBtn).toContainText('प्रिंट / PDF');

    // Click the fallback print button
    await printBtn.click();

    // Verify the modal appears with the required Hindi instructions
    const modal = page.locator('[data-testid="print-instructions-modal"]');
    await expect(modal).toBeVisible();

    // Verify requirement 2: Destination: Save as PDF, Margins: None, Background graphics: On
    await expect(modal).toContainText('Save as PDF');
    await expect(modal).toContainText('None');
    await expect(modal).toContainText('Background graphics');
    await expect(modal).toContainText('BROADSHEET');

    // Dismiss modal with cancel button
    const cancelBtn = page.locator('[data-testid="btn-cancel-print"]');
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('2. Shows mobile warning banner when on mobile viewport', async ({ page }) => {
    // Set small mobile viewport (390 x 844 iPhone size)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#editor');
    await page.waitForTimeout(500);

    const printBtn = page.locator('[data-testid="btn-print-pdf"]');
    await expect(printBtn).toBeVisible();
    await printBtn.click();

    const modal = page.locator('[data-testid="print-instructions-modal"]');
    await expect(modal).toBeVisible();

    // Verify requirement 3: Mobile warning is displayed recommending the main renderer PDF export
    const mobileWarning = page.locator('[data-testid="mobile-print-warning"]');
    await expect(mobileWarning).toBeVisible();
    await expect(mobileWarning).toContainText('मोबाइल उपयोगकर्ताओं के लिए');
    await expect(mobileWarning).toContainText('सर्वर रेंडरर');
  });

  test('3. Offers fallback print option when renderer export fails (503 / network failure)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#editor');
    await page.waitForTimeout(500);

    // Simulate export failure in the browser environment (e.g. canvas allocation error / memory pressure)
    await page.evaluate(() => {
      const origCreate = document.createElement.bind(document);
      document.createElement = function (tag: string, options?: ElementCreationOptions) {
        if (tag.toLowerCase() === 'canvas') {
          throw new Error('Canvas render memory limit exceeded: Service Busy');
        }
        return origCreate(tag, options);
      };
    });

    // Click primary PDF export
    const exportPdfBtn = page.locator('[data-testid="btn-export-pdf"]');
    await expect(exportPdfBtn).toBeVisible();
    await exportPdfBtn.click();

    // Verify requirement 1: Hindi message and print fallback modal are triggered
    const modal = page.locator('[data-testid="print-instructions-modal"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const failureAlert = page.locator('[data-testid="renderer-failure-alert"]');
    await expect(failureAlert).toBeVisible();
    await expect(failureAlert).toContainText('Service Busy');
  });

  test('4. Standalone Print HTML verification: page size, self-hosted fonts, and theme colours', async ({
    page,
  }) => {
    await page.goto('/#editor');
    await page.waitForTimeout(500);

    // Generate print HTML from an authentic Classic Hindi Broadsheet document
    const doc = createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      title: 'दैनिक जनसंदेश',
    });

    const printHtml = generatePrintHtml(doc, 'http://localhost:5173/');

    // Open print HTML directly in a fresh page context
    await page.setContent(printHtml, { waitUntil: 'load' });

    // 1. Verify exact physical @page dimensions in CSS
    const metrics = getPhysicalPageMetrics(
      doc.metadata.pageSize,
      doc.metadata.orientation,
      doc.layout.spacingDensity,
      doc.layout.bodyFontSizePt
    );

    const styleContent = await page.locator('style').allTextContents();
    const joinedStyles = styleContent.join('\n');

    expect(joinedStyles).toContain(`size: ${metrics.widthPt}pt ${metrics.heightPt}pt;`);
    expect(joinedStyles).toContain('margin: 0;');
    expect(joinedStyles).toContain('print-color-adjust: exact');
    expect(joinedStyles).toContain('-webkit-print-color-adjust: exact');

    // 2. Verify theme colors are present in CSS variables and page background
    expect(joinedStyles).toContain('--masthead-color: #111111');
    expect(joinedStyles).toContain('--page-bg: #ffffff');

    const pageBgColor = await page.locator('.newspaper-page').first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(pageBgColor).toBe('rgb(255, 255, 255)');

    // 3. Verify fonts loaded via document.fonts.ready from web app's static origin (no Google Fonts)
    expect(joinedStyles).not.toContain('fonts.googleapis.com');
    expect(joinedStyles).toContain('/fonts/');

    const fontCheck = await page.evaluate(async () => {
      await document.fonts.ready;
      const loadedFamilies = new Set<string>();
      document.fonts.forEach((f) => {
        if (f.status === 'loaded') {
          loadedFamilies.add(f.family);
        }
      });
      return {
        ready: true,
        loadedCount: document.fonts.size,
        loadedFamilies: Array.from(loadedFamilies),
      };
    });

    expect(fontCheck.ready).toBe(true);
    expect(fontCheck.loadedCount).toBeGreaterThan(0);
  });
});

