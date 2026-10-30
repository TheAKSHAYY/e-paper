import { test, expect, type Locator } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { NewspaperDocument, Article } from '../../packages/document-schema/src/index';
import {
  createNewspaperDocument,
  renderNewspaperDocumentToHtml,
} from '../../packages/template-engine/src/index';

const AFTER_CANVAS_DIR = path.resolve(process.cwd(), 'tests', 'after-canvas');

function readSelfHostedFont(filename: string): Buffer | null {
  const fontPath = path.resolve(process.cwd(), 'packages/typography/fonts', filename);
  if (fs.existsSync(fontPath)) {
    return fs.readFileSync(fontPath);
  }
  return null;
}

function pxToMm(px: number): number {
  return (px * 25.4) / 96;
}

interface ElementBoxMm {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getHindiFixtureDocument(): NewspaperDocument {
  const doc = createNewspaperDocument({
    presetId: 'classic-hindi-broadsheet',
    headline: 'जनसत्ता विशेष: हिंदी टाइपोग्राफी परीक्षण',
    language: 'hi',
  });

  doc.masthead.title = 'दैनिक जनसंदेश';
  doc.masthead.tagline = 'सत्य, निष्पक्षता और संघर्ष का प्रतीक';

  const testArticles: Article[] = [
    {
      id: 'hf-lead-story',
      title: 'प्रधानमंत्री नरेंद्र मोदी द्वारा क्षत्रिय और श्रद्धा का सम्मान: पूर्ण संघर्ष की गाथा',
      kickerText: 'कर्त्ता एवं संघर्ष',
      byline: 'विशेष संवाददाता, नई दिल्ली',
      dateline: 'नई दिल्ली —',
      category: 'राष्ट्रीय',
      columnSpan: 4,
      rowSpan: 2,
      orderIndex: 0,
      enableDropCap: true,
      body: 'क्षत्रिय परंपरा और श्रद्धा के प्रतीक के रूप में यह ऐतिहासिक निर्णय लिया गया है। प्रधानमंत्री नरेंद्र मोदी द्वारा राष्ट्र को संबोधित करते हुए कहा गया कि प्रत्येक नागरिक का संघर्ष और कर्त्ता का दायित्व ही राष्ट्र की पूर्ण शक्ति है।\n\nभारतीय समाज और संस्कृति में त्याग, तपस्या और अटूट निष्ठा का सदैव सर्वोपरि स्थान रहा है। ऐतिहासिक कालखंडों में हमारे पूर्वजों द्वारा स्थापित उच्च मानवीय आदर्श आज भी संपूर्ण मानवता का मार्गदर्शन कर रहे हैं।',
    },
    {
      id: 'hf-glyph-coverage',
      title: 'टाइपोग्राफी एवं विशेष लिपि चिह्न परीक्षण (Glyph Coverage Verification)',
      kicker: 'लिपि एवं फॉन्ट परीक्षण',
      byline: 'वरिष्ठ भाषा विशेषज्ञ • Senior Typographer',
      dateline: 'प्रकाशन केंद्र —',
      category: 'विशेष',
      columnSpan: 2,
      rowSpan: 2,
      orderIndex: 1,
      enableDropCap: false,
      body: '१. मुद्रा एवं अंक: कुल व्यय ₹७५,५०० (अंक: ०१२३४५६७८९) दर्ज किया गया।\n\n२. विराम चिह्न: पूर्ण विराम danda । एवं double danda ॥ का प्रयोग हुआ। उद्धरण: “सर्वोत्तम भारतीय पत्रकारिता” एवं ‘राष्ट्रीय चेतना’। डैश: लघु en-dash – तथा दीर्घ em-dash —।\n\n३. संयुक्ताक्षर एवं ZWJ/ZWNJ: "क्षत्रिय, त्रिशूल, ज्ञान, श्रद्धा" (संयुक्ताक्षर: क्ष त्र ज्ञ श्र) तथा विशेष हलंत क्रम (कर्त्ता एवं राष्ट्र)।',
    },
    {
      id: 'hf-justified-analysis',
      title: 'पूर्ण निष्ठा के साथ कर्त्ता का संकल्प',
      kicker: 'संपादकीय विश्लेषण',
      byline: 'डॉ. विद्याधर शर्मा',
      category: 'संपादकीय',
      columnSpan: 2,
      rowSpan: 2,
      orderIndex: 2,
      enableDropCap: false,
      body: 'राष्ट्र के सर्वांगीण विकास में क्षत्रिय धर्म, जन-जन की श्रद्धा तथा निस्वार्थ संघर्ष की महत्ता को कभी विस्मृत नहीं किया जा सकता। प्रधानमंत्री नरेंद्र मोदी द्वारा रेखांकित किए गए विचार हमें निरंतर कर्तव्य पथ पर अग्रसर रहने की प्रेरणा देते हैं। जब संकल्प पूर्ण हो तो सफलता सुनिश्चित हो जाती है।',
    },
  ];

  if (doc.pages && doc.pages.length > 0 && doc.pages[0]) {
    doc.pages[0].articles = testArticles;
  }
  doc.articles = testArticles;
  return doc;
}

const TEMPLATES: Array<{ id: string; name: string; getDoc: () => NewspaperDocument }> = [
  {
    id: 'classic-hindi-broadsheet',
    name: 'Classic Hindi Broadsheet',
    getDoc: () => createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' }),
  },
  {
    id: 'modern-hindi-daily',
    name: 'Modern Hindi Daily',
    getDoc: () => createNewspaperDocument({ presetId: 'modern-hindi-daily' }),
  },
  {
    id: 'local-hindi-gazette',
    name: 'Local Hindi Gazette',
    getDoc: () => createNewspaperDocument({ presetId: 'local-hindi-gazette' }),
  },
  {
    id: 'classic-broadsheet',
    name: 'Classic Broadsheet',
    getDoc: () => createNewspaperDocument({ presetId: 'classic-broadsheet' }),
  },
  {
    id: 'modern-editorial',
    name: 'Modern Editorial',
    getDoc: () => createNewspaperDocument({ presetId: 'modern-editorial' }),
  },
  {
    id: 'compact-local',
    name: 'Compact Local',
    getDoc: () => createNewspaperDocument({ presetId: 'compact-local' }),
  },
  {
    id: 'hindi-fixture',
    name: 'Hindi Typographic Fixture',
    getDoc: getHindiFixtureDocument,
  },
];

test.describe('Canvas vs PDF Physical Coordinate Parity Specs', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(AFTER_CANVAS_DIR)) {
      fs.mkdirSync(AFTER_CANVAS_DIR, { recursive: true });
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.route('**/fonts/*', async (route) => {
      const reqUrl = route.request().url();
      const fontFilename = path.basename(new URL(reqUrl).pathname);
      const fontData = readSelfHostedFont(fontFilename);
      if (fontData) {
        const contentType = fontFilename.endsWith('.css') ? 'text/css' : 'font/woff2';
        return route.fulfill({
          status: 200,
          contentType,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: fontData,
        });
      }
      return route.continue();
    });
  });

  for (const template of TEMPLATES) {
    test(`Parity Gate: ${template.name} (${template.id})`, async ({ page, context }) => {
      const doc = template.getDoc();

      // Configure a large viewport so the full broadsheet fits without window scrolling
      await page.setViewportSize({ width: 1700, height: 2500 });

      // 1. Render Editor Canvas with physical coordinates ON at 100% scale (scale=1.0)
      await page.goto('/?physicalCanvas=true&scale=1.0#editor', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

      // Inject the exact document and lock scale to 1.0
      await page.evaluate((d) => {
        window.__setDocument?.(d);
        window.__setScale?.(1.0);
        window.__setPhysicalCanvas?.(true);
      }, doc);

      // Ensure fonts are fully decoded and rendered
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const canvasSheet = page.locator('[data-testid="newspaper-sheet-canvas"]');
      const canvasSheetBox = await canvasSheet.boundingBox();
      expect(canvasSheetBox).toBeTruthy();

      // 2. Render PDF HTML in a paired tab using identical viewport and font engine
      const pdfPage = await context.newPage();
      await pdfPage.setViewportSize({ width: 1700, height: 2500 });
      const html = renderNewspaperDocumentToHtml(doc, { baseUrl: 'http://localhost:5173/' });
      await pdfPage.setContent(html, { waitUntil: 'load' });
      await pdfPage.evaluate(() => document.fonts.ready);
      await pdfPage.waitForTimeout(300);

      const pdfPageEl = pdfPage.locator('.newspaper-page').first();
      const pdfPageBox = await pdfPageEl.boundingBox();
      expect(pdfPageBox).toBeTruthy();

      // Save side-by-side composite screenshot
      const canvasPng = await canvasSheet.screenshot({ type: 'png' });
      const pdfPng = await pdfPageEl.screenshot({ type: 'png' });

      // Create side-by-side PNG using Playwright browser canvas
      const sideBySideBuffer = await page.evaluate(
        async ({ canvasB64, pdfB64 }) => {
          const loadImg = (b64: string) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = 'data:image/png;base64,' + b64;
            });

          const [img1, img2] = await Promise.all([loadImg(canvasB64), loadImg(pdfB64)]);
          const c = document.createElement('canvas');
          const headerH = 40;
          c.width = img1.width + img2.width + 20;
          c.height = Math.max(img1.height, img2.height) + headerH;
          const ctx = c.getContext('2d')!;

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, c.width, c.height);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('Editor Canvas (Physical 100%)', 20, 26);
          ctx.fillText('PDF Export HTML', img1.width + 30, 26);

          ctx.drawImage(img1, 0, headerH);
          ctx.drawImage(img2, img1.width + 20, headerH);

          return c.toDataURL('image/png').split(',')[1];
        },
        {
          canvasB64: Buffer.from(canvasPng).toString('base64'),
          pdfB64: Buffer.from(pdfPng).toString('base64'),
        }
      );

      fs.writeFileSync(
        path.join(AFTER_CANVAS_DIR, `${template.id}_side_by_side.png`),
        Buffer.from(sideBySideBuffer, 'base64')
      );

      // Measure bounding boxes in mm
      // Helper to compute element bounds relative to page root
      const getRelativeBoxMm = (
        elBox: { x: number; y: number; width: number; height: number },
        rootBox: { x: number; y: number; width: number; height: number }
      ): ElementBoxMm => ({
        x: pxToMm(elBox.x - rootBox.x),
        y: pxToMm(elBox.y - rootBox.y),
        width: pxToMm(elBox.width),
        height: pxToMm(elBox.height),
      });

      const canvasBorderOffsets = await canvasSheet.evaluate((el) => ({
        borderLeft: el.clientLeft || 0,
        borderTop: el.clientTop || 0,
      }));
      const canvasRootBox = {
        x: canvasSheetBox!.x + canvasBorderOffsets.borderLeft,
        y: canvasSheetBox!.y + canvasBorderOffsets.borderTop,
        width: canvasSheetBox!.width,
        height: canvasSheetBox!.height,
      };

      // A. Page Container Size Parity
      const canvasPageWidthMm = pxToMm(canvasSheetBox!.width);
      const canvasPageHeightMm = pxToMm(canvasSheetBox!.height);
      const pdfPageWidthMm = pxToMm(pdfPageBox!.width);
      const pdfPageHeightMm = pxToMm(pdfPageBox!.height);

      expect(Math.abs(canvasPageWidthMm - pdfPageWidthMm)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(canvasPageHeightMm - pdfPageHeightMm)).toBeLessThanOrEqual(1.0);

      // B. Masthead Bounding Box Parity
      const canvasMasthead = canvasSheet.locator('[data-testid="masthead-section"]');
      const pdfMasthead = pdfPage.locator('.masthead-section').first();

      const canvasMhBox = await canvasMasthead.boundingBox();
      const pdfMhBox = await pdfMasthead.boundingBox();

      expect(canvasMhBox).toBeTruthy();
      expect(pdfMhBox).toBeTruthy();

      const canvasMhMm = getRelativeBoxMm(canvasMhBox!, canvasRootBox);
      const pdfMhMm = getRelativeBoxMm(pdfMhBox!, pdfPageBox!);

      console.log(`\n[${template.id}] Masthead Parity:`, {
        canvas: canvasMhMm,
        pdf: pdfMhMm,
        deltaWidthMm: Math.abs(canvasMhMm.width - pdfMhMm.width).toFixed(2),
        deltaHeightMm: Math.abs(canvasMhMm.height - pdfMhMm.height).toFixed(2),
      });

      expect(Math.abs(canvasMhMm.width - pdfMhMm.width)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(canvasMhMm.height - pdfMhMm.height)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(canvasMhMm.y - pdfMhMm.y)).toBeLessThanOrEqual(1.0);

      // C. Footer Bounding Box Parity
      const canvasFooter = canvasSheet.locator('[data-testid="newspaper-folio-footer"]');
      const pdfFooter = pdfPage.locator('.newspaper-folio-footer').first();

      const canvasFtBox = await canvasFooter.boundingBox();
      const pdfFtBox = await pdfFooter.boundingBox();

      expect(canvasFtBox).toBeTruthy();
      expect(pdfFtBox).toBeTruthy();

      const canvasFtMm = getRelativeBoxMm(canvasFtBox!, canvasRootBox);
      const pdfFtMm = getRelativeBoxMm(pdfFtBox!, pdfPageBox!);

      console.log(`[${template.id}] Footer Parity:`, {
        canvas: canvasFtMm,
        pdf: pdfFtMm,
        deltaWidthMm: Math.abs(canvasFtMm.width - pdfFtMm.width).toFixed(2),
        deltaHeightMm: Math.abs(canvasFtMm.height - pdfFtMm.height).toFixed(2),
        deltaYMm: Math.abs(canvasFtMm.y - pdfFtMm.y).toFixed(2),
      });

      expect(Math.abs(canvasFtMm.width - pdfFtMm.width)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(canvasFtMm.height - pdfFtMm.height)).toBeLessThanOrEqual(1.0);

      // D. Article Cards Parity
      const canvasArticles = canvasSheet.locator('[data-testid^="article-card-"]');
      const pdfArticles = pdfPage.locator('.newspaper-article');

      const canvasArtCount = await canvasArticles.count();
      const pdfArtCount = await pdfArticles.count();
      expect(canvasArtCount).toBe(pdfArtCount);

      for (let i = 0; i < canvasArtCount; i++) {
        const cArt = canvasArticles.nth(i);
        const pArt = pdfArticles.nth(i);

        const cBox = await cArt.boundingBox();
        const pBox = await pArt.boundingBox();

        expect(cBox).toBeTruthy();
        expect(pBox).toBeTruthy();

        const cMm = getRelativeBoxMm(cBox!, canvasRootBox);
        const pMm = getRelativeBoxMm(pBox!, pdfPageBox!);

        const deltaW = Math.abs(cMm.width - pMm.width);
        const deltaH = Math.abs(cMm.height - pMm.height);
        const deltaX = Math.abs(cMm.x - pMm.x);
        const deltaY = Math.abs(cMm.y - pMm.y);

        console.log(
          `  Article ${i + 1} deltas (mm): W=${deltaW.toFixed(2)}, H=${deltaH.toFixed(2)}, X=${deltaX.toFixed(2)}, Y=${deltaY.toFixed(2)}`
        );

        expect(deltaW).toBeLessThanOrEqual(1.0);
        expect(deltaH).toBeLessThanOrEqual(1.0);
        expect(deltaX).toBeLessThanOrEqual(1.0);
        expect(deltaY).toBeLessThanOrEqual(1.0);
      }

      // E. Total Content Height Parity
      const canvasTotalContentHeightMm = canvasFtMm.y + canvasFtMm.height - canvasMhMm.y;
      const pdfTotalContentHeightMm = pdfFtMm.y + pdfFtMm.height - pdfMhMm.y;
      const deltaContentH = Math.abs(canvasTotalContentHeightMm - pdfTotalContentHeightMm);

      console.log(
        `[${template.id}] Total Content Height: Canvas=${canvasTotalContentHeightMm.toFixed(2)}mm, PDF=${pdfTotalContentHeightMm.toFixed(2)}mm, Delta=${deltaContentH.toFixed(2)}mm`
      );
      expect(deltaContentH).toBeLessThanOrEqual(1.0);

      await pdfPage.close();
    });
  }

  test('Text line-break parity: 5 Hindi paragraphs', async ({ page, context }) => {
    const hindiDoc = getHindiFixtureDocument();

    await page.setViewportSize({ width: 1700, height: 2500 });
    await page.goto('/?physicalCanvas=true&scale=1.0#editor', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
    }, hindiDoc);

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const pdfPage = await context.newPage();
    await pdfPage.setViewportSize({ width: 1700, height: 2500 });
    const html = renderNewspaperDocumentToHtml(hindiDoc, { baseUrl: 'http://localhost:5173/' });
    await pdfPage.setContent(html, { waitUntil: 'load' });
    await pdfPage.evaluate(() => document.fonts.ready);
    await pdfPage.waitForTimeout(300);

    // Query 5 paragraphs across both pages
    const countLines = async (pLocator: Locator) => {
      return await pLocator.evaluate((el: HTMLElement) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = range.getClientRects();
        const ySet = new Set<number>();
        for (let i = 0; i < rects.length; i++) {
          const r = rects[i];
          if (r && r.height > 0) {
            ySet.add(Math.round(r.top));
          }
        }
        return ySet.size;
      });
    };

    const canvasParas = page.locator('[data-testid="newspaper-sheet-canvas"] article p');
    const pdfParas = pdfPage.locator('.newspaper-page .newspaper-article p');

    const cCount = await canvasParas.count();
    const pCount = await pdfParas.count();
    const testCount = Math.min(5, Math.min(cCount, pCount));
    expect(testCount).toBeGreaterThanOrEqual(3);

    console.log(`\nTesting Line Break Parity on ${testCount} Hindi Paragraphs:`);
    for (let i = 0; i < testCount; i++) {
      const cLines = await countLines(canvasParas.nth(i));
      const pLines = await countLines(pdfParas.nth(i));
      console.log(`  Paragraph ${i + 1}: Canvas=${cLines} lines, PDF=${pLines} lines`);
      expect(cLines).toBe(pLines);
    }

    await pdfPage.close();
  });
});
