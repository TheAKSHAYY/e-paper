import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import type { NewspaperDocument, Article } from '../../packages/document-schema/src/index';
import {
  createNewspaperDocument,
  renderNewspaperDocumentToHtml,
} from '../../packages/template-engine/src/index';

const ARTIFACT_DIR = 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';

test.describe('Phase 1 Live Canvas & PDF Multi-Column Typography Verification', () => {
  test('Complete Interactive Canvas & PDF Verification', async ({ page, context }) => {
    // Set a broadsheet-appropriate viewport
    await page.setViewportSize({ width: 1700, height: 2600 });

    // 1. Open the actual application in the browser
    await page.goto('/?physicalCanvas=true&scale=1.0#editor', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]', { timeout: 30000 });

    // 2. Build a realistic Hindi newspaper document with comprehensive variations
    const doc: NewspaperDocument = createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      title: 'दैनिक जनसंदेश - राष्ट्रीय संस्करण',
      pageSize: 'broadsheet',
    });

    const longHindiBody = `राजधानी में आज एक भव्य समारोह के दौरान कई बड़ी विकास परियोजनाओं का शिलान्यास किया गया। इस ऐतिहासिक अवसर पर विभिन्न गणमान्य व्यक्तियों ने भाग लिया और क्षेत्र के समग्र विकास के लिए सरकार की अटूट प्रतिबद्धता की सराहना की। नई चौड़ी सड़कों, आधुनिक पुलों और सुसज्जित स्वास्थ्य केंद्रों के निर्माण से लाखों नागरिकों को सीधा लाभ मिलेगा।

स्थानीय नागरिकों एवं व्यापारियों ने सरकार के इस दूरदर्शी कदम का गर्मजोशी से स्वागत किया है। उद्योग व्यापार मंडल के अध्यक्ष ने अपने संबोधन में कहा कि आधारभूत ढांचे में सुधार से स्थानीय अर्थव्यवस्था को नई गति मिलेगी, पर्यटन उद्योग को बढ़ावा मिलेगा और स्थानीय युवाओं के लिए रोजगार के नए अवसर सृजित होंगे।

परियोजना निदेशकों के अनुसार अगले वित्तीय वर्ष की अंतिम तिमाही तक इन सभी निर्माण कार्यों को पूरा करने का कड़ा लक्ष्य निर्धारित किया गया है। संबंधित कार्यदायी संस्थाओं को निर्माण कार्य में उच्च कोटि की गुणवत्ता मानकों और समय-सीमा का कड़ाई से पालन करने के स्पष्ट और कड़े निर्देश दिए गए हैं।`;

    const mediumHindiBody = `उत्तराखंड एवं हिमाचल के उच्च पर्वतीय क्षेत्रों में भारी बर्फबारी के बाद मैदानी इलाकों में ठंड का प्रकोप बढ़ गया है। मौसम विज्ञान विभाग ने आगामी 48 घंटों के लिए यलो अलर्ट जारी किया है। सुबह के समय घने कोहरे के कारण यातायात प्रभावित हो रहा है।

प्रशासन ने बेसहारा लोगों के लिए प्रमुख चौराहों पर अलाव जलाने और रैन बसेरों में समुचित व्यवस्था करने के निर्देश दिए हैं। डॉक्टरों ने बुजुर्गों और बच्चों को विशेष सावधानी बरतने की सलाह दी है।`;

    const shortHindiBody =
      'राजधानी के विज्ञान भवन में कल से दो दिवसीय राष्ट्रीय पर्यावरण सम्मेलन का आयोजन किया जाएगा जिसमें विशेषज्ञ मंथन करेंगे।';

    const testArticles: Article[] = [
      // Article 1: 3-column lead article, long text, heavy conjunct headline
      {
        id: 'art-lead-3col',
        headline:
          'राष्ट्रव्यापी विकास परियोजनाओं का ऐतिहासिक शुभारंभ: प्रधानमंत्री द्वारा नए युग की घोषणा',
        subheadline:
          'सड़कों, पुलों और स्वास्थ्य केंद्रों के निर्माण से लाखों नागरिकों को मिलेगा सीधा लाभ',
        kickerText: 'विशेष रिपोर्ट',
        byline: 'ब्यूरो प्रमुख, नई दिल्ली',
        dateline: 'नई दिल्ली —',
        priority: 'lead',
        category: 'national',
        columnSpan: 3,
        orderIndex: 0,
        heightMode: 'auto',
        body: longHindiBody,
      },
      // Article 2: 1-column article (single column regression)
      {
        id: 'art-side-1col',
        headline: 'पर्वतीय राज्यों में भारी बर्फबारी, मैदानी क्षेत्रों में शीतलहर की चेतावनी',
        subheadline: 'आगामी 48 घंटों में तापमान में भारी गिरावट की संभावना',
        priority: 'major',
        category: 'weather',
        columnSpan: 1,
        orderIndex: 1,
        heightMode: 'auto',
        body: mediumHindiBody,
      },
      // Article 3: 2-column article
      {
        id: 'art-mid-2col',
        headline: 'उद्योग जगत में नई ऊर्जा: व्यापार मंडल ने आर्थिक सुधारों की नीति का स्वागत किया',
        subheadline: 'स्थानीय विनिर्माण और छोटे उद्योगों को मिलेगा अतिरिक्त प्रोत्साहन',
        priority: 'major',
        category: 'business',
        columnSpan: 2,
        orderIndex: 2,
        heightMode: 'auto',
        body: longHindiBody,
      },
      // Article 4: Short story spanning 2 columns (Safeguard check: < 35 words must stay 1 column)
      {
        id: 'art-short-2col',
        headline: 'विज्ञान भवन में दो दिवसीय राष्ट्रीय पर्यावरण सम्मेलन कल से',
        priority: 'brief',
        category: 'environment',
        columnSpan: 2,
        orderIndex: 3,
        heightMode: 'auto',
        body: shortHindiBody,
      },
      // Article 5: Fixed-height container (Height mode test)
      {
        id: 'art-fixed-height',
        headline: 'संक्षिप्त प्रादेशिक हलचल: एक नज़र में राज्य की प्रमुख खबरें',
        priority: 'minor',
        category: 'regional',
        columnSpan: 4,
        orderIndex: 4,
        heightMode: 'fixed',
        customHeight: 280,
        body: `${longHindiBody}\n\n${mediumHindiBody}`,
      },
    ];

    doc.articles = testArticles;
    doc.pages[0]!.articles = testArticles;

    // 3. Inject the document into the live interactive canvas
    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
    }, doc);

    // Wait for fonts to be ready
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    // 4. Inspect interactive canvas DOM properties
    const canvasSheet = page.locator('[data-testid="newspaper-sheet-canvas"]');
    await expect(canvasSheet).toBeVisible();

    const leadCard = page.locator('[data-testid="article-card-art-lead-3col"]');
    await expect(leadCard).toBeVisible();

    const leadBody = leadCard.locator('.article-body');
    const leadBodyStyles = await leadBody.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        columnCount: style.columnCount,
        columnGap: style.columnGap,
        columnRule: style.columnRule,
        wordBreak: style.wordBreak,
        overflowWrap: style.overflowWrap,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      };
    });

    console.log('Lead 3-Col Body Styles in Canvas:', leadBodyStyles);

    // Assert multi-column applied on lead story
    expect(leadBodyStyles.columnCount).toBe('3');
    // Ensure no horizontal overflow
    expect(leadBodyStyles.scrollWidth).toBeLessThanOrEqual(leadBodyStyles.clientWidth + 2);

    // Single-column card check (must stay single-column flow: 'auto' or '1')
    const side1ColCard = page.locator('[data-testid="article-card-art-side-1col"]');
    const side1ColStyles = await side1ColCard.locator('.article-body').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { columnCount: style.columnCount };
    });
    console.log('Side 1-Col Body Styles:', side1ColStyles);
    expect(['auto', '1']).toContain(side1ColStyles.columnCount);

    // 2-column card check (must split into 2 columns)
    const mid2ColCard = page.locator('[data-testid="article-card-art-mid-2col"]');
    const mid2ColStyles = await mid2ColCard.locator('.article-body').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { columnCount: style.columnCount };
    });
    console.log('Mid 2-Col Body Styles:', mid2ColStyles);
    expect(mid2ColStyles.columnCount).toBe('2');

    // Short article safeguard check (< 35 words must remain single-column despite span 2)
    const shortCard = page.locator('[data-testid="article-card-art-short-2col"]');
    const shortStyles = await shortCard.locator('.article-body').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { columnCount: style.columnCount };
    });
    console.log('Short Story (<35 words) Body Styles:', shortStyles);
    expect(['auto', '1']).toContain(shortStyles.columnCount);

    // Fixed-height card check
    const fixedCard = page.locator('[data-testid="article-card-art-fixed-height"]');
    const fixedHeightPx = await fixedCard.evaluate((el) => el.getBoundingClientRect().height);
    console.log('Fixed Height Card Height:', fixedHeightPx);
    expect(fixedHeightPx).toBeCloseTo(280, -1);

    // 5. Capture Live Interactive Canvas Screenshot
    const canvasScreenshotPath = path.join(ARTIFACT_DIR, 'phase1-live-canvas-editor.png');
    await canvasSheet.screenshot({ path: canvasScreenshotPath });
    console.log('Saved canvas screenshot to:', canvasScreenshotPath);

    // 6. Test Grid Preset Behavior: Switch to 6-column grid
    const doc6Col = JSON.parse(JSON.stringify(doc)) as NewspaperDocument;
    doc6Col.layout.columnCount = 6;
    if (doc6Col.pages && doc6Col.pages[0]) {
      doc6Col.pages[0].columnCount = 6;
    }
    // Map spans: lead 4 of 6, side 2 of 6, mid 3 of 6, short 3 of 6, fixed 6 of 6
    doc6Col.articles[0]!.columnSpan = 4;
    doc6Col.articles[1]!.columnSpan = 2;
    doc6Col.articles[2]!.columnSpan = 3;
    doc6Col.articles[3]!.columnSpan = 3;
    doc6Col.articles[4]!.columnSpan = 6;
    if (doc6Col.pages && doc6Col.pages[0]) {
      doc6Col.pages[0].articles = doc6Col.articles;
    }

    await page.evaluate((d) => {
      window.__setDocument?.(d);
    }, doc6Col);
    await page.waitForTimeout(400);

    const grid6CanvasPath = path.join(ARTIFACT_DIR, 'phase1-grid-switch-canvas.png');
    await canvasSheet.screenshot({ path: grid6CanvasPath });
    console.log('Saved 6-col grid switch screenshot to:', grid6CanvasPath);

    // 7. Render exact same broadsheet doc through PDF Template Engine
    const pdfPage = await context.newPage();
    await pdfPage.setViewportSize({ width: 1700, height: 2600 });
    const printHtml = renderNewspaperDocumentToHtml(doc, { baseUrl: 'http://localhost:5173/' });
    await pdfPage.setContent(printHtml, { waitUntil: 'load' });
    await pdfPage.evaluate(() => document.fonts.ready);
    await pdfPage.waitForTimeout(400);

    const pdfPageEl = pdfPage.locator('.newspaper-page').first();
    const pdfScreenshotPath = path.join(ARTIFACT_DIR, 'phase1-pdf-export-output.png');
    await pdfPageEl.screenshot({ path: pdfScreenshotPath });
    console.log('Saved PDF export screenshot to:', pdfScreenshotPath);

    // 8. Generate Side-by-Side Comparison Composite
    const compositePath = path.join(ARTIFACT_DIR, 'phase1-canvas-vs-pdf-comparison.png');
    const canvasB64 = (await canvasSheet.screenshot()).toString('base64');
    const pdfB64 = (await pdfPageEl.screenshot()).toString('base64');

    const compositeBuffer = await page.evaluate(
      async ({ cB64, pB64 }) => {
        const loadImg = (b64: string) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = 'data:image/png;base64,' + b64;
          });

        const [img1, img2] = await Promise.all([loadImg(cB64), loadImg(pB64)]);
        const canvas = document.createElement('canvas');
        const headerH = 50;
        canvas.width = img1.width + img2.width + 30;
        canvas.height = Math.max(img1.height, img2.height) + headerH;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('1. Interactive Canvas Editor (Live DOM)', 30, 32);
        ctx.fillText('2. Exported PDF Engine (Print HTML)', img1.width + 50, 32);

        ctx.drawImage(img1, 10, headerH);
        ctx.drawImage(img2, img1.width + 30, headerH);

        return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      },
      { cB64: canvasB64, pB64: pdfB64 }
    );

    const fs = await import('node:fs');
    fs.writeFileSync(compositePath, Buffer.from(compositeBuffer, 'base64'));
    console.log('Saved Composite Comparison to:', compositePath);
  });
});
