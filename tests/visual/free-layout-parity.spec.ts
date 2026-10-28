import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { NewspaperDocument, Article } from '@epaper-studio/document-schema';
import {
  createNewspaperDocument,
  renderNewspaperDocumentToHtml,
  autoToFree,
} from '@epaper-studio/template-engine';

const AFTER_FREE_LAYOUT_DIR = path.resolve(process.cwd(), 'tests', 'after-free-layout');

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
    headline: 'जनसत्ता विशेष: हिंदी टाइपोग्राफी मुक्त लेआउट परीक्षण',
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
      body: '१. मुद्रा एवं अंक: कुल व्यय ₹७५,५०० (अंक: ०१२३४५६७८९) दर्ज किया गया।\n\n२. विराम चिह्न: पूर्ण विराम danda । एवं double danda ॥ का प्रयोग हुआ। उद्धरण: “सर्वोत्तम भारतीय पत्रकारिता” एवं ‘राष्ट्रीय चेतना’। डैश: लघु en-dash – तथा दीर्घ em-dash —।',
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

test.describe('Free Layout: Canvas vs PDF Physical Parity (<= 0.5mm)', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(AFTER_FREE_LAYOUT_DIR)) {
      fs.mkdirSync(AFTER_FREE_LAYOUT_DIR, { recursive: true });
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
    test(`Parity <= 0.5mm Gate: ${template.name} (${template.id})`, async ({ page, context }) => {
      const doc = template.getDoc();

      // Convert page 1 from auto layout to free layout
      const firstPage = doc.pages[0];
      expect(firstPage).toBeDefined();
      const freePage = autoToFree(firstPage, doc);
      doc.pages[0] = freePage;

      // Configure viewport so full layout fits
      await page.setViewportSize({ width: 1700, height: 2500 });

      // 1. Render Editor Canvas with free layout enabled and physical mm coordinates
      await page.goto('/?physicalCanvas=true&freeLayout=true&scale=1.0#editor', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

      // Inject the free-layout document
      await page.evaluate((d) => {
        window.__setDocument?.(d);
        window.__setScale?.(1.0);
        window.__setPhysicalCanvas?.(true);
        window.__setFreeLayout?.(true);
      }, doc);

      // Wait for fonts to settle
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

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, c.width, c.height);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('Free Layout Editor Canvas (Physical 100%)', 20, 26);
          ctx.fillText('Free Layout PDF Export HTML', img1.width + 30, 26);

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
        path.join(AFTER_FREE_LAYOUT_DIR, `${template.id}_free_side_by_side.png`),
        Buffer.from(sideBySideBuffer, 'base64')
      );

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

      // Compare every article frame's rendered bounding box: Fail above 0.5 mm
      for (const article of freePage.articles) {
        const cArt = canvasSheet.locator(`[data-testid="free-article-${article.id}"]`);
        const pArt = pdfPage.locator(`[data-article-id="${article.id}"]`).first();

        const cCount = await cArt.count();
        const pCount = await pArt.count();

        expect(cCount).toBe(1);
        expect(pCount).toBe(1);

        const cBox = await cArt.boundingBox();
        const pBox = await pArt.boundingBox();

        expect(cBox).toBeTruthy();
        expect(pBox).toBeTruthy();

        const cMm = getRelativeBoxMm(cBox!, canvasRootBox);
        const pMm = getRelativeBoxMm(pBox!, pdfPageBox!);

        const deltaX = Math.abs(cMm.x - pMm.x);
        const deltaY = Math.abs(cMm.y - pMm.y);
        const deltaW = Math.abs(cMm.width - pMm.width);
        const deltaH = Math.abs(cMm.height - pMm.height);

        console.log(
          `[${template.id}] Article "${article.headline?.slice(0, 16) || article.id}" deltas (mm): ` +
            `ΔX=${deltaX.toFixed(3)}, ΔY=${deltaY.toFixed(3)}, ΔW=${deltaW.toFixed(3)}, ΔH=${deltaH.toFixed(3)}`
        );

        // Strict 0.5mm parity requirement
        expect(deltaX).toBeLessThanOrEqual(0.5);
        expect(deltaY).toBeLessThanOrEqual(0.5);
        expect(deltaW).toBeLessThanOrEqual(0.5);
        expect(deltaH).toBeLessThanOrEqual(0.5);
      }

      await pdfPage.close();
    });
  }
});
