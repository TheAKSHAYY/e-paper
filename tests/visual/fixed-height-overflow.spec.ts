import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import type { NewspaperDocument, Article } from '../../packages/document-schema/src/index';
import {
  createNewspaperDocument,
  renderNewspaperDocumentToHtml,
} from '../../packages/template-engine/src/index';

const ARTIFACT_DIR = 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';

test.describe('Fixed-Height Container Overflow Safety & Resolution', () => {
  test('Verify element-level overflow detection, preflight blocker, and non-destructive auto-fix', async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1700, height: 2600 });
    await page.goto('/?physicalCanvas=true&scale=1.0#editor', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]', { timeout: 30000 });

    const doc: NewspaperDocument = createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      title: 'दैनिक जनसंदेश - ओवरफ्लो परीक्षण',
      pageSize: 'broadsheet',
    });

    // Substantial Hindi text volume: 5 paragraphs (~350 words) that exceeds 280px container
    const excessiveBody = `राजधानी में आज एक भव्य समारोह के दौरान कई बड़ी विकास परियोजनाओं का शिलान्यास किया गया। इस ऐतिहासिक अवसर पर विभिन्न गणमान्य व्यक्तियों ने भाग लिया और क्षेत्र के समग्र विकास के लिए सरकार की अटूट प्रतिबद्धता की सराहना की। नई चौड़ी सड़कों, आधुनिक पुलों और सुसज्जित स्वास्थ्य केंद्रों के निर्माण से लाखों नागरिकों को सीधा लाभ मिलेगा।

स्थानीय नागरिकों एवं व्यापारियों ने सरकार के इस दूरदर्शी कदम का गर्मजोशी से स्वागत किया है। उद्योग व्यापार मंडल के अध्यक्ष ने अपने संबोधन में कहा कि आधारभूत ढांचे में सुधार से स्थानीय अर्थव्यवस्था को नई गति मिलेगी, पर्यटन उद्योग को बढ़ावा मिलेगा और स्थानीय युवाओं के लिए रोजगार के नए अवसर सृजित होंगे।

परियोजना निदेशकों के अनुसार अगले वित्तीय वर्ष की अंतिम तिमाही तक इन सभी निर्माण कार्यों को पूरा करने का कड़ा लक्ष्य निर्धारित किया गया है। संबंधित कार्यदायी संस्थाओं को निर्माण कार्य में उच्च कोटि की गुणवत्ता मानकों और समय-सीमा का कड़ाई से पालन करने के स्पष्ट और कड़े निर्देश दिए गए हैं।

उत्तराखंड एवं हिमाचल के उच्च पर्वतीय क्षेत्रों में भारी बर्फबारी के बाद मैदानी इलाकों में ठंड का प्रकोप बढ़ गया है। मौसम विज्ञान विभाग ने आगामी 48 घंटों के लिए यलो अलर्ट जारी किया है। सुबह के समय घने कोहरे के कारण यातायात प्रभावित हो रहा है।

प्रशासन ने बेसहारा लोगों के लिए प्रमुख चौराहों पर अलाव जलाने और रैन बसेरों में समुचित व्यवस्था करने के निर्देश दिए हैं। डॉक्टरों ने बुजुर्गों और बच्चों को विशेष सावधानी बरतने की सलाह दी है।`;

    const fixedOverflowArticle: Article = {
      id: 'art-fixed-overflow',
      headline: 'अत्यधिक सामग्री परीक्षण: 280px निर्धारित ऊंचाई में पाठ सीमा और क्लिपिंग की जांच',
      subheadline: 'कंटेनर की क्षमता से अधिक सामग्री होने पर दृश्यता और ओवरफ्लो का व्यवहार',
      kickerText: 'जांच रिपोर्ट',
      byline: 'विशेष परीक्षण संवाददाता',
      priority: 'lead',
      category: 'national',
      columnSpan: 2,
      orderIndex: 0,
      heightMode: 'fixed',
      customHeight: 280,
      body: excessiveBody,
    };

    doc.articles = [fixedOverflowArticle];
    doc.pages[0]!.articles = [fixedOverflowArticle];

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
    }, doc);

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const articleCard = page.locator('[data-testid="article-card-art-fixed-overflow"]');
    await expect(articleCard).toBeVisible();

    // 1. Verify card rendered with fixed height and overflow detection badge
    const badgeLocator = page.locator('[data-testid="article-overflow-badge-art-fixed-overflow"]');
    await expect(badgeLocator).toBeVisible();
    const badgeText = await badgeLocator.innerText();
    expect(badgeText).toContain('टेक्स्ट ओवरफ्लो');
    console.log('Detected canvas badge text:', badgeText);

    // 2. Verify red outline on article card
    const outline = await articleCard.evaluate((el) => window.getComputedStyle(el).outline);
    console.log('Card computed outline:', outline);
    expect(outline).toContain('rgb(220, 38, 38)');

    // 3. Capture screenshot of overflowing card with red outline & badge
    const canvasOverflowPath = path.join(ARTIFACT_DIR, 'phase1-fixed-overflow-canvas.png');
    await articleCard.screenshot({ path: canvasOverflowPath });
    console.log('Saved fixed overflow card screenshot to:', canvasOverflowPath);

    // 4. Trigger Export PDF from TopBar -> Preflight blocker modal must appear
    const exportBtn = page.locator('[data-testid="btn-export-pdf"]');
    await exportBtn.click();

    const preflightModal = page.locator('[data-testid="preflight-report-modal"]');
    await expect(preflightModal).toBeVisible();

    // Verify modal indicates blocked state and export button is disabled
    const modalExportBtn = page.locator('[data-testid="preflight-btn-export"]');
    await expect(modalExportBtn).toBeDisabled();
    const exportBtnText = await modalExportBtn.innerText();
    expect(exportBtnText).toContain('पहले रुकावटें ठीक करें');

    // 5. Capture screenshot of preflight blocker modal
    const preflightModalPath = path.join(ARTIFACT_DIR, 'phase1-preflight-overflow-blocker.png');
    await preflightModal.screenshot({ path: preflightModalPath });
    console.log('Saved preflight modal screenshot to:', preflightModalPath);

    // 6. Click auto-fix: "⚡ स्वतः सुधारें"
    const autoFixBtn = preflightModal.locator('button:has-text("स्वतः सुधारें")').first();
    await expect(autoFixBtn).toBeVisible();
    await autoFixBtn.click();

    // Wait for state update and re-validation
    await page.waitForTimeout(500);

    // Modal canExport should now be true
    await expect(modalExportBtn).toBeEnabled();

    // Close preflight modal to inspect canvas
    const closeBtn = preflightModal.locator('button:has-text("संपादित करने के लिए वापस जाएं")');
    await closeBtn.click();
    await expect(preflightModal).toBeHidden();

    // 7. Verify canvas state after auto-fix:
    // Badge must be gone, outline restored to normal, container height expanded
    await expect(badgeLocator).toBeHidden();
    const resolvedCard = page.locator('[data-testid="article-card-art-fixed-overflow"]');
    const resolvedMeasurements = await resolvedCard.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        boundingHeight: rect.height,
        outline: style.outline,
      };
    });
    console.log('Resolved card measurements:', resolvedMeasurements);
    // Height should now expand beyond 280px to accommodate all text
    expect(resolvedMeasurements.clientHeight).toBeGreaterThan(280);

    // 8. Capture screenshot of resolved card (full text visible without clipping)
    const canvasResolvedPath = path.join(ARTIFACT_DIR, 'phase1-fixed-overflow-resolved.png');
    await resolvedCard.screenshot({ path: canvasResolvedPath });
    console.log('Saved resolved card screenshot to:', canvasResolvedPath);

    // 9. Verify PDF render HTML output
    const pdfPage = await context.newPage();
    await pdfPage.setViewportSize({ width: 1700, height: 2600 });
    const printHtml = renderNewspaperDocumentToHtml(doc, { baseUrl: 'http://localhost:5173/' });
    await pdfPage.setContent(printHtml, { waitUntil: 'load' });
    await pdfPage.evaluate(() => document.fonts.ready);
    await pdfPage.waitForTimeout(400);

    const pdfCard = pdfPage.locator('.newspaper-article').first();
    const pdfScreenshotPath = path.join(ARTIFACT_DIR, 'phase1-fixed-overflow-pdf.png');
    await pdfCard.screenshot({ path: pdfScreenshotPath });
    console.log('Saved fixed overflow PDF card screenshot to:', pdfScreenshotPath);
    await pdfPage.close();
  });
});
