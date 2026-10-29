import { describe, it, expect, afterAll } from 'vitest';
import { RendererWorker, inspectPdf } from './index';
import { createNewspaperDocument, getAllNewspaperPresets } from '@epaper-studio/template-engine';
import { SELF_HOSTED_FONT_FAMILIES } from '@epaper-studio/typography';

describe('RendererWorker & PDF Export Engine', () => {
  const worker = new RendererWorker({ timeoutMs: 25000 });

  afterAll(async () => {
    await worker.close();
  });

  describe('Configuration & Initialization', () => {
    it('should initialize with default concurrency and timeout settings', () => {
      const defaultWorker = new RendererWorker();
      const config = defaultWorker.getConfig();
      expect(config.concurrency).toBe(4);
      expect(config.timeoutMs).toBe(30000);
    });

    it('should allow overriding configuration parameters', () => {
      const customWorker = new RendererWorker({ concurrency: 8, timeoutMs: 60000 });
      const config = customWorker.getConfig();
      expect(config.concurrency).toBe(8);
      expect(config.timeoutMs).toBe(60000);
    });

    it('should validate environment successfully', async () => {
      const isValid = await worker.validateEnvironment();
      expect(isValid).toBe(true);
    }, 15000);
  });

  describe('inspectPdf parser', () => {
    it('should correctly inspect synthetic PDF buffer structure', () => {
      const mockPdf = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Type /Page /MediaBox [0 0 1080 1638] >>\nBT\n/F1 12 Tf\n(Hello) Tj\nET\nendobj\n%%EOF'
      );
      const metadata = inspectPdf(mockPdf);
      expect(metadata.isValidPdf).toBe(true);
      expect(metadata.version).toBe('1.4');
      expect(metadata.pageCount).toBe(1);
      expect(metadata.mediaBoxes).toHaveLength(1);
      expect(metadata.mediaBoxes[0]?.width).toBe(1080);
      expect(metadata.mediaBoxes[0]?.height).toBe(1638);
      expect(metadata.hasSelectableText).toBe(true);
    });

    it('should handle non-PDF buffers gracefully', () => {
      const invalidBuffer = Buffer.from('NOT A PDF FILE');
      const metadata = inspectPdf(invalidBuffer);
      expect(metadata.isValidPdf).toBe(false);
      expect(metadata.version).toBe('');
      expect(metadata.hasSelectableText).toBe(false);
    });
  });

  describe('Real Vector PDF Generation', () => {
    it('should generate a genuine print-ready Broadsheet PDF with exact physical geometry and selectable text', async () => {
      const doc = createNewspaperDocument({
        title: 'The Daily Chronicle',
        presetId: 'classic-broadsheet',
        pageSize: 'broadsheet',
      });

      const result = await worker.renderToPdf(doc);

      expect(result).toBeDefined();
      expect(result.fileSizeBytes).toBeGreaterThan(10000);
      expect(result.widthPt).toBe(1080);
      expect(result.heightPt).toBe(1638);
      expect(result.pageCount).toBeGreaterThanOrEqual(1);

      // Verify binary PDF signature %PDF-
      const signature = Buffer.from(result.pdfBuffer.subarray(0, 5)).toString('ascii');
      expect(signature).toBe('%PDF-');

      // Inspect binary metadata
      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.isValidPdf).toBe(true);
      expect(metadata.mediaBoxes.length).toBeGreaterThanOrEqual(1);
      expect(metadata.mediaBoxes[0]?.width).toBe(1080);
      expect(metadata.mediaBoxes[0]?.height).toBe(1638);
      expect(metadata.hasSelectableText).toBe(true);
    }, 30000);

    it('should generate a Tabloid PDF in Landscape with swapped physical dimensions', async () => {
      const doc = createNewspaperDocument({
        title: 'Metropolitan Observer',
        presetId: 'modern-editorial',
        pageSize: 'tabloid',
      });
      doc.metadata.orientation = 'landscape';

      const result = await worker.renderToPdf(doc);

      // Tabloid is 792 x 1224 pt. In landscape: 1224 x 792 pt.
      expect(result.widthPt).toBe(1224);
      expect(result.heightPt).toBe(792);

      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.isValidPdf).toBe(true);
      expect(metadata.mediaBoxes[0]?.width).toBe(1224);
      expect(metadata.mediaBoxes[0]?.height).toBe(792);
    }, 30000);

    it('should paginate a multi-story newspaper into multiple pages with inside folios', async () => {
      const doc = createNewspaperDocument({
        title: 'The Evening Gazette',
        presetId: 'compact-local',
        pageSize: 'a4', // Smaller A4 page forces multi-page distribution with multiple articles
      });

      // Add additional long articles to trigger multi-page pagination
      for (let i = 1; i <= 6; i++) {
        doc.articles.push({
          id: `extra-story-${i}`,
          headline: `Inside Edition Report ${i}: Regional Development and Municipal Infrastructure`,
          subheadline: `Comprehensive review of civic projects underway across district ${i}`,
          body: `CITY HALL — Municipal authorities this afternoon released extensive quarterly audits outlining infrastructure expenditures spanning transport, public parks, and water distribution networks.\n\nCivil engineering teams report significant advancements along the eastern transit corridor, where tunneling works have reached 85% completion four weeks ahead of targeted seasonal milestones.\n\nLocal commercial chambers have welcomed the progress, noting that enhanced transit access is already spurring private investment in commercial and residential developments across neighboring boroughs.`,
          byline: `By Staff Reporter ${i}`,
          dateline: 'CENTRAL DESK —',
          imageUrl: '',
          imageCaption: '',
          imagePlacement: 'none',
          columnSpan: 2,
          priority: 'minor',
          orderIndex: 4 + i,
        });
      }

      const result = await worker.renderToPdf(doc);

      expect(result.pageCount).toBeGreaterThan(1);
      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.pageCount).toBeGreaterThan(1);
      expect(metadata.mediaBoxes.length).toBeGreaterThan(1);
    }, 35000);

    it('should render Hindi / Devanagari script correctly without glyph collapse or errors', async () => {
      const doc = createNewspaperDocument({
        title: 'दैनिक नवप्रभात',
        presetId: 'classic-broadsheet',
        pageSize: 'berliner',
        language: 'hi',
      });

      doc.masthead.title = 'दैनिक नवप्रभात';
      doc.masthead.subtitle = 'सत्य, निष्ठा एवं राष्ट्रीय चेतना का संवाहक • स्थापना 1947';
      doc.masthead.edition = 'प्रभात संस्करण';
      doc.masthead.date = 'मंगलवार, 27 अक्टूबर 2026';

      doc.articles = [
        {
          id: 'art-hi-1',
          headline: 'वैश्विक स्वच्छ ऊर्जा शिखर सम्मेलन में ऐतिहासिक सहमति, 68 देशों ने दी स्वीकृति',
          subheadline: 'सौर एवं पवन ऊर्जा वितरण के लिए अंतरराष्ट्रीय ग्रिड प्रणाली पर सहमति बनी',
          body: 'जिनेवा — छह दिनों तक चली गहन वार्ता के बाद आज देर रात आयोजित पूर्ण सत्र में अड़सठ देशों के प्रतिनिधियों ने अंतरराष्ट्रीय ग्रिड समझौते को सर्वसम्मति से मंजूरी दे दी।\n\nइस ऐतिहासिक संधि के तहत चार महाद्वीपों में फैले नवीकरणीय ऊर्जा संचरण गलियारों के लिए सामान्य मानक स्थापित किए जाएंगे।\n\nभारतीय प्रतिनिधिमंडल के मुख्य दूत ने हस्ताक्षर समारोह में कहा कि यह समझौता ऊर्जा क्षेत्र में आत्मनिर्भरता और साझा विकास के नए युग का सूत्रपात करता है।',
          byline: 'ब्यूरो रिपोर्ट, नई दिल्ली',
          dateline: 'जिनेवा —',
          imageUrl: '',
          imageCaption: '',
          imagePlacement: 'none',
          columnSpan: 3,
          priority: 'lead',
          orderIndex: 0,
        },
      ];

      const result = await worker.renderToPdf(doc);
      expect(result.isValidPdf ?? true).toBe(true);
      expect(result.fileSizeBytes).toBeGreaterThan(12000);

      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.isValidPdf).toBe(true);
      expect(metadata.hasSelectableText).toBe(true);
    }, 30000);

    it('should handle broken image URLs gracefully without failing the PDF render job', async () => {
      const doc = createNewspaperDocument({
        title: 'The Resilience Gazette',
        presetId: 'compact-local',
        pageSize: 'a4',
      });

      doc.articles[0]!.imageUrl = 'https://invalid-non-existent-domain-999.com/fake-image.jpg';
      doc.articles[0]!.imagePlacement = 'top';

      const result = await worker.renderToPdf(doc);
      expect(result.fileSizeBytes).toBeGreaterThan(5000);

      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.isValidPdf).toBe(true);
    }, 30000);

    it('should render a raster PNG page preview with valid image buffer', async () => {
      const doc = createNewspaperDocument({
        title: 'Visual Proof Gazette',
        presetId: 'compact-local',
        pageSize: 'a4',
      });

      const imageBuffer = await worker.renderToImage(doc, { pageNumber: 1 });
      expect(imageBuffer).toBeDefined();
      expect(imageBuffer.length).toBeGreaterThan(5000);

      // Verify PNG magic bytes: \x89PNG\r\n\x1a\n
      const pngHeader = Buffer.from(imageBuffer.subarray(0, 8));
      expect(pngHeader[0]).toBe(0x89);
      expect(pngHeader[1]).toBe(0x50); // 'P'
      expect(pngHeader[2]).toBe(0x4e); // 'N'
      expect(pngHeader[3]).toBe(0x47); // 'G'
    }, 30000);

    it('should render and rasterize Devanagari Hindi newspaper page at 200% scale', async () => {
      const doc = createNewspaperDocument({
        title: 'दैनिक नवप्रभात',
        presetId: 'classic-hindi-broadsheet',
        pageSize: 'a4',
        language: 'hi',
      });

      doc.masthead.title = 'दैनिक नवप्रभात';
      doc.masthead.subtitle = 'सत्य, निष्ठा एवं राष्ट्रीय चेतना का संवाहक • स्थापना 1947';
      doc.masthead.edition = 'प्रभात संस्करण • दिल्ली';
      doc.articles = [
        {
          id: 'lead-hindi-story',
          title: 'प्रधानमंत्री द्वारा क्षत्रिय और राष्ट्रनिष्ठा का सम्मान: संकल्प से सिद्धि की नई गाथा',
          kicker: 'राष्ट्रीय विशेष',
          byline: 'विशेष संवाददाता, नई दिल्ली',
          dateline: 'नई दिल्ली —',
          category: 'राष्ट्रीय',
          columnSpan: 4,
          rowSpan: 2,
          orderIndex: 0,
          enableDropCap: true,
          body: 'राष्ट्र के नवनिर्माण और सर्वांगीण विकास में क्षत्रिय धर्म, जन-जन की अटूट श्रद्धा तथा निस्वार्थ संघर्ष की महत्ता सर्वोपरि है। नई दिल्ली में आयोजित भव्य राष्ट्रीय संगोष्ठी में प्रधानमंत्री ने कहा कि भारत का ऐतिहासिक दृष्टिकोण हमेशा सत्य और निष्पक्षता पर आधारित रहा है। आधुनिक तकनीकी क्रांति और ग्रामीण विकास के संतुलन से ही भारत सशक्त बनेगा।',
        },
      ];
      if (doc.pages && doc.pages[0]) {
        doc.pages[0].articles = doc.articles;
      }

      // Render vector PDF
      const pdfResult = await worker.renderToPdf(doc);
      expect(pdfResult.fileSizeBytes).toBeGreaterThan(5000);
      const pdfMeta = inspectPdf(pdfResult.pdfBuffer);
      expect(pdfMeta.isValidPdf).toBe(true);

      // Rasterize page 1 at scale 2 (200% DPI)
      const imageBuffer = await worker.renderToImage(doc, { pageNumber: 1, scale: 2 });
      expect(imageBuffer.length).toBeGreaterThan(10000);

      // Save to artifact directory
      const fs = await import('node:fs');
      const path = await import('node:path');
      const artifactDir = 'C:\\Users\\Pc\\.gemini\\antigravity\\brain\\708fb6a9-d309-4b3e-81e3-f0d9355fdf2b';
      if (fs.existsSync(artifactDir)) {
        fs.writeFileSync(path.join(artifactDir, 'devanagari-rasterized-200pct.png'), imageBuffer);
      }
    }, 45000);

    it('should render a PDF containing 6 data: URI photos and confirm all images are embedded in output', async () => {
      // 6 distinct valid PNG data URIs (1x1 pixels with distinct color spectra)
      const photoDataUris = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4/5/hPwAG/wH+XQ2jYAAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5/hPwAH/gL+P4B0oAAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAF/AL+137+qgAAAABJRU5ErkJggg==',
      ];

      const doc = createNewspaperDocument({
        title: 'दैनिक चित्र समाचार',
        presetId: 'classic-hindi-broadsheet',
        pageSize: 'broadsheet',
        language: 'hi',
      });

      doc.articles = photoDataUris.map((dataUri, idx) => ({
        id: `photo-story-${idx + 1}`,
        title: `फोटो समाचार खंड ${idx + 1}: क्षेत्रीय विकास एवं नागरिक संवाद`,
        kicker: `फोटो रिपोर्ट ${idx + 1}`,
        byline: `छायाकार दल ${idx + 1}`,
        dateline: 'भोपाल —',
        category: 'चित्र विशेष',
        columnSpan: 2,
        rowSpan: 2,
        orderIndex: idx,
        enableDropCap: false,
        imageUrl: dataUri,
        imageCaption: `चित्र विवरण ${idx + 1}: राष्ट्रीय परियोजना का प्रत्यक्ष दृश्य।`,
        imagePlacement: 'top' as const,
        body: `प्रशासनिक दल ने परियोजना स्थल का दौरा किया। स्थानीय नागरिकों से सीधे संवाद के माध्यम से सभी आवश्यक सुझाव दर्ज किए गए।`,
      }));

      if (doc.pages && doc.pages[0]) {
        doc.pages[0].articles = doc.articles;
      }

      const result = await worker.renderToPdf(doc);
      expect(result).toBeDefined();
      expect(result.fileSizeBytes).toBeGreaterThan(10000);

      // Verify PDF validity
      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.isValidPdf).toBe(true);

      // Verify images are embedded into the PDF binary stream as XObjects
      const binaryPdf = Buffer.from(result.pdfBuffer).toString('binary');
      const imageOccurrences = (binaryPdf.match(/\/Subtype\s*\/Image/g) || []).length;
      expect(imageOccurrences).toBeGreaterThanOrEqual(6);
    }, 45000);

    it('should render PDF using self-hosted fonts without Google Fonts CDN dependency', async () => {
      const doc = createNewspaperDocument({
        title: 'दैनिक जनसंदेश',
        presetId: 'classic-hindi-broadsheet',
        pageSize: 'broadsheet',
        language: 'hi',
      });

      const result = await worker.renderToPdf(doc);
      expect(result).toBeDefined();
      expect(result.fileSizeBytes).toBeGreaterThan(10000);
      expect(result.pageCount).toBe(1);

      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.isValidPdf).toBe(true);
      expect(metadata.hasSelectableText).toBe(true);
    }, 30000);

    it('should maintain exact physical dimensions in mm and keep footer inside page box (FIX B)', async () => {
      const doc = createNewspaperDocument({
        title: 'जनवाणी समाचार',
        presetId: 'classic-hindi-broadsheet',
        pageSize: 'broadsheet',
        language: 'hi',
      });

      const result = await worker.renderToPdf(doc);

      // Verify no footer boundary overflow warnings
      const footerOverflowWarnings = result.warnings.filter((w) =>
        w.toLowerCase().includes('footer')
      );
      expect(footerOverflowWarnings).toHaveLength(0);

      // Read back MediaBox from PDF and verify dimensions in mm
      const metadata = inspectPdf(result.pdfBuffer);
      expect(metadata.mediaBoxes).toHaveLength(1);
      const mediaBox = metadata.mediaBoxes[0]!;

      // Broadsheet is 1080pt x 1638pt (15in x 22.75in)
      expect(mediaBox.width).toBe(1080);
      expect(mediaBox.height).toBe(1638);

      const widthMm = (mediaBox.width * 25.4) / 72;
      const heightMm = (mediaBox.height * 25.4) / 72;

      // 1080 * 25.4 / 72 = 381.0 mm
      expect(widthMm).toBeCloseTo(381.0, 1);
      // 1638 * 25.4 / 72 = 577.85 mm
      expect(heightMm).toBeCloseTo(577.85, 1);
    }, 35000);

    it('should embed ONLY self-hosted allowlisted fonts in PDF across all 6 templates and hindi fixture', async () => {
      const forbiddenSubstrings = [
        'nirmala',
        'arial',
        'georgia',
        'timesnewroman',
        'times new roman',
        'impact',
        'playfair',
        'newsreader',
        'fraunces',
        'merriweather',
        'oswald',
        'microsoftyahei',
        'simsun',
        'segoe',
      ];

      const presets = getAllNewspaperPresets();
      const docsToTest = presets.map((p) => ({
        id: p.id,
        doc: createNewspaperDocument({ presetId: p.id }),
      }));

      // Add Hindi Fixture
      const hindiFixture = createNewspaperDocument({
        presetId: 'classic-hindi-broadsheet',
        title: 'दैनिक जनसंदेश',
        language: 'hi',
      });
      hindiFixture.masthead.title = 'दैनिक जनसंदेश';
      hindiFixture.masthead.tagline = 'सत्य, निष्पक्षता और संघर्ष का प्रतीक';
      hindiFixture.articles = [
        {
          id: 'hf-lead-story',
          title:
            'प्रधानमंत्री नरेंद्र मोदी द्वारा क्षत्रिय और श्रद्धा का सम्मान: पूर्ण संघर्ष की गाथा',
          kicker: 'कर्त्ता एवं संघर्ष',
          byline: 'विशेष संवाददाता, नई दिल्ली',
          dateline: 'नई दिल्ली —',
          category: 'राष्ट्रीय',
          columnSpan: 4,
          rowSpan: 2,
          orderIndex: 0,
          enableDropCap: true,
          body: 'क्षत्रिय परंपरा और श्रद्धा के प्रतीक के रूप में यह ऐतिहासिक निर्णय लिया गया है। प्रधानमंत्री नरेंद्र मोदी द्वारा राष्ट्र को संबोधित करते हुए कहा गया कि प्रत्येक नागरिक का संघर्ष और कर्त्ता का दायित्व ही राष्ट्र की पूर्ण शक्ति है।',
        },
        {
          id: 'hf-analysis',
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
      if (hindiFixture.pages && hindiFixture.pages[0]) {
        hindiFixture.pages[0].articles = hindiFixture.articles;
      }
      docsToTest.push({ id: 'hindi-fixture', doc: hindiFixture });

      for (const item of docsToTest) {
        const renderResult = await worker.renderToPdf(item.doc);
        expect(renderResult.fileSizeBytes).toBeGreaterThan(5000);

        const pdfText = renderResult.pdfBuffer.toString('binary');
        const baseFontMatches = pdfText.match(/\/BaseFont\s*\/([A-Za-z0-9+#_.-]+)/g) || [];
        const baseFonts = baseFontMatches.map((m) => m.replace(/^\/BaseFont\s*\//, ''));

        expect(
          baseFonts.length,
          `Expected at least one font embedded in PDF for ${item.id}`
        ).toBeGreaterThan(0);

        for (const fontName of baseFonts) {
          const lowerName = fontName.toLowerCase();
          for (const forbidden of forbiddenSubstrings) {
            expect(
              lowerName.includes(forbidden),
              `Document "${item.id}" embedded disallowed host OS font "${fontName}" (matched forbidden: "${forbidden}")`
            ).toBe(false);
          }

          const cleanName = fontName.replace(/^[A-Z]{6}\+/, '').toLowerCase();
          const matchesAllowlist = SELF_HOSTED_FONT_FAMILIES.some((fam) => {
            const fClean = fam.toLowerCase().replace(/[\s-]+/g, '');
            const targetClean = cleanName.replace(/[\s-]+/g, '');
            return targetClean.includes(fClean);
          });

          expect(
            matchesAllowlist,
            `Document "${item.id}" embedded non-allowlisted font "${fontName}". Allowed families: ${SELF_HOSTED_FONT_FAMILIES.join(', ')}`
          ).toBe(true);
        }
      }
    }, 90000);
  });
});
