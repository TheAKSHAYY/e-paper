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
        body: 'क्षत्रिय परंपरा और श्रद्धा के प्रतीक के रूप में यह ऐतिहासिक निर्णय लिया गया है। प्रधानमंत्री नरेंद्र मोदी द्वारा राष्ट्र को संबोधित करते हुए कहा गया कि प्रत्येक नागरिक का संघर्ष और कर्त्ता का दायित्व ही राष्ट्र की पूर्ण शक्ति है।\n\nभारतीय समाज और संस्कृति में त्याग, तपस्या और अटूट निष्ठा का सदैव सर्वोपरि स्थान रहा है। ऐतिहासिक कालखंडों में हमारे पूर्वजों द्वारा स्थापित उच्च मानवीय आदर्श आज भी संपूर्ण मानवता का मार्गदर्शन कर रहे हैं। जब हम अपने अतीत के पन्नों को पलटते हैं, तो हमें स्पष्ट दिखाई देता है कि समाज के प्रत्येक वर्ग ने राष्ट्र निर्माण में अपना अमूल्य योगदान दिया है। ज्ञान, विज्ञान, कला, साहित्य और समाज सेवा के विभिन्न क्षेत्रों में भारत ने विश्व पटल पर अपनी अमिट छाप छोड़ी है। आधुनिक युग की तीव्र गति और तकनीकी प्रगति के साथ-साथ अपनी मौलिक सांस्कृतिक जड़ों से जुड़े रहना आज के समय की सबसे बड़ी आवश्यकता बन गया है। जब तक आने वाली पीढ़ियाँ अपने गौरवशाली इतिहास, लोक परंपराओं और उच्च नैतिक मूल्यों से भली-भांति परिचित नहीं होंगी, तब तक एक सशक्त, समृद्ध और आत्मनिर्भर राष्ट्र का सर्वांगीण विकास संभव नहीं हो सकता। अतः हमें सामूहिक संकल्प के साथ देश की एकता, अखंडता और समरसता को सुदृढ़ बनाने हेतु निरंतर प्रयत्नशील रहना होगा ताकि आने वाला भविष्य और अधिक उज्ज्वल तथा गौरवमयी बन सके।',
      },
      {
        id: 'hf-justified-analysis',
        title: 'पूर्ण निष्ठा के साथ कर्त्ता का संकल्प',
        kicker: 'संपादकीय विश्लेषण',
        byline: 'डॉ. विद्याधर शर्मा',
        category: 'संपादकीय',
        columnSpan: 2,
        rowSpan: 2,
        orderIndex: 1,
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
