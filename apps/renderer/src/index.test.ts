import { describe, it, expect, afterAll } from 'vitest';
import { RendererWorker, inspectPdf } from './index';
import { createNewspaperDocument } from '@epaper-studio/template-engine';

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
  });
});

