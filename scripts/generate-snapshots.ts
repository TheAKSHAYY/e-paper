import { describe, it, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  createNewspaperDocument,
  getAllNewspaperPresets,
} from '../packages/template-engine/src/index';
import {
  getPageDimensions,
  type NewspaperDocument,
} from '../packages/document-schema/src/index';
import { RendererWorker } from '../apps/renderer/src/index';

const TARGET_DIR = path.resolve(
  process.cwd(),
  process.env.SNAPSHOT_DIR || 'tests/baseline'
);

describe('E-Paper Designer Snapshot Generator', () => {
  const worker = new RendererWorker({ timeoutMs: 60000 });

  afterAll(async () => {
    await worker.close();
  });

  it('generates baseline PDFs and PNGs for all built-in templates and hindi-fixture', async () => {
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const presets = getAllNewspaperPresets();
    const documentsToRender: { id: string; doc: NewspaperDocument }[] = [];

    // 1. Built-in templates
    for (const preset of presets) {
      const doc = createNewspaperDocument({
        presetId: preset.id,
      });
      documentsToRender.push({ id: preset.id, doc });
    }

    // 2. Hindi Fixture Document
    const hindiFixtureDoc = createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      title: 'जनसत्ता विशेष: हिंदी टाइपोग्राफी परीक्षण',
      language: 'hi',
    });

    // Provide rich Hindi test elements with all required strings
    hindiFixtureDoc.masthead.title = 'दैनिक जनसंदेश';
    hindiFixtureDoc.masthead.tagline = 'सत्य, निष्पक्षता और संघर्ष का प्रतीक';

    const testArticles = [
      {
        id: 'hf-lead-story',
        title: 'प्रधानमंत्री नरेंद्र मोदी द्वारा क्षत्रिय और श्रद्धा का सम्मान: पूर्ण संघर्ष की गाथा',
        kicker: 'कर्त्ता एवं संघर्ष',
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
        body: '१. मुद्रा एवं अंक: कुल व्यय ₹७५,५०० (अंक: ०१२३४५६७८९) दर्ज किया गया।\n\n२. विराम चिह्न: पूर्ण विराम danda । एवं double danda ॥ का प्रयोग हुआ। उद्धरण: “सर्वोत्तम भारतीय पत्रकारिता” एवं ‘राष्ट्रीय चेतना’। डैश: लघु en-dash – तथा दीर्घ em-dash —।\n\n३. संयुक्ताक्षर एवं ZWJ/ZWNJ: "क्षत्रिय, त्रिशूल, ज्ञान, श्रद्धा" (संयुक्ताक्षर: क्ष त्र ज्ञ श्र) तथा विशेष हलंत क्रम (कर्त्ता एवं राष्ट्र)।\n\n४. नुक्ता युक्त ध्वनियाँ: क़लम, ख़ास, ग़ज़ल, ज़िला, पेड़, चढ़ाई, फ़िल्म (क़ ख़ ग़ ज़ ड़ ढ़ फ़)।\n\n5. English Typography Verification: The Daily Chronicle special report on Indian typography published successfully.',
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


    // Assign to pages
    if (hindiFixtureDoc.pages && hindiFixtureDoc.pages.length > 0) {
      hindiFixtureDoc.pages[0].articles = testArticles;
    }
    hindiFixtureDoc.articles = testArticles;

    documentsToRender.push({ id: 'hindi-fixture', doc: hindiFixtureDoc });

    console.log(`\n================ SNAPSHOT REPORT (${path.basename(TARGET_DIR)}) ================`);
    console.log(`Destination: ${TARGET_DIR}\n`);

    for (const item of documentsToRender) {
      const { id, doc } = item;
      const dims = getPageDimensions(doc.metadata.pageSize, doc.metadata.orientation);

      // Render PDF
      const pdfResult = await worker.renderToPdf(doc);
      const pdfPath = path.join(TARGET_DIR, `${id}.pdf`);
      fs.writeFileSync(pdfPath, Buffer.from(pdfResult.pdfBuffer));

      // Render PNG of each page
      const pngBuffers = await worker.renderAllPagesToImages(doc, { scale: 1 });
      pngBuffers.forEach((buffer, idx) => {
        const pngPath = path.join(TARGET_DIR, `${id}_page_${idx + 1}.png`);
        fs.writeFileSync(pngPath, Buffer.from(buffer));
      });

      console.log(
        `• [${id}] - Pages: ${pdfResult.pageCount} | Size: ${doc.metadata.pageSize} (${dims.widthMm}mm × ${dims.heightMm}mm) | PDF: ${(pdfResult.fileSizeBytes / 1024).toFixed(1)} KB | PNGs: ${pngBuffers.length}`
      );
    }
    console.log(`====================================================================\n`);
  }, 180000);
});
