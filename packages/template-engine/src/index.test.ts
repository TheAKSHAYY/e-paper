import { describe, it, expect } from 'vitest';
import {
  compileTemplate,
  TemplateDefinition,
  RenderContext,
  getAllNewspaperPresets,
  getNewspaperPreset,
  createNewspaperDocument,
  estimateNewspaperContentVolume,
  renderNewspaperDocumentToHtml,
  formatBodyParagraphsHtml,
  isPredominantlyDevanagari,
  resolvePageColumnCount,
} from './index';

describe('TemplateEngine', () => {
  it('should compile a basic template into a minimal document structure (legacy compatibility)', () => {
    const template: TemplateDefinition = {
      id: 'daily-chronicle',
      name: 'Daily Chronicle',
      category: 'newspaper',
      targetDevice: 'kindle-scribe',
      defaultOrientation: 'portrait',
    };

    const context: RenderContext = {
      locale: 'en',
      timestamp: '2026-10-27',
      data: { headlines: ['Breaking News'] },
    };

    const result = compileTemplate(template, context);
    expect(result.success).toBe(true);
    expect(result.document.metadata.device).toBe('kindle-scribe');
    expect(result.document.metadata.title).toContain('Daily Chronicle');
  });

  it('should provide at least 3 distinct newspaper presets with unique typographic and grid definitions', () => {
    const presets = getAllNewspaperPresets();
    expect(presets.length).toBeGreaterThanOrEqual(3);

    const ids = presets.map((p) => p.id);
    expect(ids).toContain('classic-broadsheet');
    expect(ids).toContain('modern-editorial');
    expect(ids).toContain('compact-local');

    const broadsheet = getNewspaperPreset('classic-broadsheet');
    const modern = getNewspaperPreset('modern-editorial');
    const compact = getNewspaperPreset('compact-local');

    // Distinct columns & styles
    expect(broadsheet.defaultColumns).not.toBe(modern.defaultColumns);
    expect(broadsheet.mastheadStyle).toBe('ornate-double-rule');
    expect(modern.mastheadStyle).toBe('clean-minimal');
    expect(compact.mastheadStyle).toBe('bold-slab');

    // Seed articles present
    expect(broadsheet.seedArticles.length).toBeGreaterThan(0);
    expect(modern.seedArticles.length).toBeGreaterThan(0);
    expect(compact.seedArticles.length).toBeGreaterThan(0);
  });

  it('should create a complete newspaper document with seed articles from a preset', () => {
    const doc = createNewspaperDocument({
      presetId: 'classic-broadsheet',
      title: 'The National Dispatch',
      pageSize: 'broadsheet',
    });

    expect(doc.metadata.title).toBe('The National Dispatch');
    expect(doc.masthead.title).toBe('The National Dispatch');
    expect(doc.layout.presetId).toBe('classic-broadsheet');
    expect(doc.articles.length).toBeGreaterThanOrEqual(3);
  });

  it('should support starting from a blank layout with a default lead article template', () => {
    const blankDoc = createNewspaperDocument({
      presetId: 'modern-editorial',
      startBlank: true,
    });

    expect(blankDoc.articles.length).toBe(1);
    expect(blankDoc.articles[0]?.priority).toBe('lead');
  });

  it('should estimate content volume and flag potential overflow', () => {
    const doc = createNewspaperDocument({ presetId: 'compact-local' });
    const volume = estimateNewspaperContentVolume(doc);

    expect(volume.wordCount).toBeGreaterThan(0);
    expect(volume.estimatedCharacterCount).toBeGreaterThan(0);
    expect(volume.overflowRiskPercentage).toBeLessThanOrEqual(100);

    // Test with massive article to trigger overflow detection
    const longDoc = {
      ...doc,
      articles: [
        {
          id: 'huge',
          headline: 'Massive Story',
          body: 'word '.repeat(3500),
          columnSpan: 2,
          priority: 'lead' as const,
          orderIndex: 0,
        },
      ],
    };

    const overflowEstimate = estimateNewspaperContentVolume(longDoc);
    expect(overflowEstimate.exceedsSinglePage).toBe(true);
    expect(overflowEstimate.recommendation).toContain('exceeds estimated single-page capacity');
  });

  it('should render HTML with pure white background and rich photo placements', () => {
    const doc = createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      title: 'जनवाणी समाचार',
    });
    // Add an article with photo
    doc.articles.push({
      id: 'photo-art',
      headline: 'फोटो स्टोरी: धरोहर का संरक्षण',
      body: 'पुरातत्व विभाग ने विशेष अभियान शुरू किया।',
      imageUrl: 'https://example.com/monument.jpg',
      imageCaption: 'प्राचीन वास्तुकला की झलक।',
      imageCredit: 'छाया: विशेष छायाकार',
      imagePlacement: 'side',
      imageAspect: 'wide',
      columnSpan: 2,
      priority: 'major',
      orderIndex: 99,
    });

    const html = renderNewspaperDocumentToHtml(doc);
    expect(html).toContain('background-color: #ffffff;');
    expect(html).toContain('placement-side');
    expect(html).toContain('छाया: विशेष छायाकार');
    expect(html).toContain('प्राचीन वास्तुकला की झलक।');
  });

  it('should render authentic Hindi daily masthead with 3-row hierarchy, independent fields, rule styles, and emblems', () => {
    const doc = createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      title: 'जनवाणी समाचार',
    });

    doc.masthead.tagline = 'सत्य, निष्पक्षता और जनसेवा का प्रतीक';
    doc.masthead.establishmentYear = '1947';
    doc.masthead.weatherCity = 'नई दिल्ली';
    doc.masthead.temperature = '25°C';
    doc.masthead.weatherCondition = 'साफ़ आसमान';
    doc.masthead.airQuality = 'AQI 128 • मध्यम';
    doc.masthead.price = 'मूल्य ₹5.00';
    doc.masthead.dayOfWeek = 'बुधवार';
    doc.masthead.date = '28 अक्टूबर 2026';
    doc.masthead.volumeYear = 'वर्ष 78';
    doc.masthead.issueCount = 'अंक 142';
    doc.masthead.edition = 'प्रातःकालीन मुख्य संस्करण';
    doc.masthead.ruleStyle = 'ornate-double';
    doc.masthead.emblem = 'ashoka-chakra';
    doc.masthead.showEmblem = true;

    const html = renderNewspaperDocumentToHtml(doc);

    // Verify 3-row hierarchy and independent fields
    expect(html).toContain('masthead-section rule-ornate-double');
    expect(html).toContain('masthead-top-strip');
    expect(html).toContain('नई दिल्ली 25°C • साफ़ आसमान');
    expect(html).toContain('AQI 128 • मध्यम');
    expect(html).toContain('सत्य, निष्पक्षता और जनसेवा का प्रतीक');
    expect(html).toContain('स्थापना 1947');
    expect(html).toContain('मूल्य ₹5.00');

    // Main row
    expect(html).toContain('जनवाणी समाचार');
    expect(html).toContain('masthead-emblem-svg');

    // Bottom strip
    expect(html).toContain('masthead-bottom-strip');
    expect(html).toContain('वर्ष 78 • अंक 142');
    expect(html).toContain('बुधवार, 28 अक्टूबर 2026');
    expect(html).toContain('प्रातःकालीन मुख्य संस्करण');
  });

  describe('Devanagari Typography Rules', () => {
    it('detects predominantly Devanagari text correctly', () => {
      expect(isPredominantlyDevanagari('क्षत्रिय और श्रद्धा का प्रतीक')).toBe(true);
      expect(isPredominantlyDevanagari('प्रधानमंत्री नरेंद्र मोदी ने संबोधित किया।')).toBe(true);
      expect(isPredominantlyDevanagari('The quick brown fox jumps over the lazy dog')).toBe(false);
      expect(isPredominantlyDevanagari('')).toBe(false);
    });

    it('suppresses drop-cap class on Devanagari text even if enableDropCap is true', () => {
      const hindiBody =
        'क्षत्रिय धर्म और मर्यादा का पालन करते हुए समाज के हर वर्ग ने अपनी प्रतिबद्धता दोहराई।';
      const renderedHindi = formatBodyParagraphsHtml(hindiBody, true, 'hi');
      expect(renderedHindi).not.toContain('drop-cap');
      expect(renderedHindi).toContain('class="article-para"');

      // Also when auto-detected via predominantly Devanagari
      const renderedAuto = formatBodyParagraphsHtml(hindiBody, true);
      expect(renderedAuto).not.toContain('drop-cap');
    });

    it('preserves drop-cap class on English text when enableDropCap is true', () => {
      const englishBody =
        'In an extraordinary plenary session, parliament passed the landmark bill with unanimous support.';
      const renderedEnglish = formatBodyParagraphsHtml(englishBody, true, 'en');
      expect(renderedEnglish).toContain('class="article-para drop-cap"');
    });

    it('injects hyphens: manual and lang="hi" attributes for Devanagari articles in generated HTML', () => {
      const doc = createNewspaperDocument({
        presetId: 'classic-hindi-broadsheet',
        title: 'दैनिक जागरण',
      });
      doc.articles = [
        {
          id: 'lead-hindi',
          headline: 'प्रधानमंत्री नरेंद्र मोदी का बड़ा ऐलान',
          body: 'क्षत्रिय और श्रद्धा की पावन भूमि पर आज एक ऐतिहासिक निर्णय लिया गया।',
          priority: 'lead',
          columnSpan: 6,
          orderIndex: 0,
        },
      ];

      const html = renderNewspaperDocumentToHtml(doc);
      expect(html).toContain('lang="hi"');
      expect(html).toContain('newspaper-article.lang-hi');
      expect(html).toContain('hyphens: manual');
      expect(html).toContain(':lang(hi) .drop-cap:first-of-type::first-letter');
      expect(html).toContain('float: none !important');
    });
  });

  describe('Column Count Resolution & Grid Row Placement Parity (FIX A)', () => {
    it('resolvePageColumnCount prioritizes page.columnCount, falls back to layout.columnCount, and defaults to 12', () => {
      // 1. page.columnCount overrides layout.columnCount
      expect(resolvePageColumnCount({ layout: { columnCount: 4 } }, { columnCount: 12 })).toBe(12);

      // 2. doc with no page.columnCount falls back to layout.columnCount
      expect(
        resolvePageColumnCount({ layout: { columnCount: 5 } }, { columnCount: undefined })
      ).toBe(5);

      expect(resolvePageColumnCount({ layout: { columnCount: 6 } }, null)).toBe(6);

      // 3. no layout.columnCount defaults to 12
      expect(resolvePageColumnCount({ layout: {} }, {})).toBe(12);

      // 4. clamps between 2 and 12
      expect(resolvePageColumnCount({ layout: { columnCount: 1 } })).toBe(2);
      expect(resolvePageColumnCount({ layout: { columnCount: 16 } })).toBe(12);
    });

    it('renders a 12-column grid allowing 9-col lead and 3-col story to share the same row when page.columnCount=12', () => {
      const doc = createNewspaperDocument({
        presetId: 'classic-hindi-broadsheet',
      });
      // Preset layout.columnCount is 4, but page.columnCount is set to 12
      doc.layout.columnCount = 4;
      doc.pages[0].columnCount = 12;

      const articles = [
        {
          id: 'art-lead',
          headline: 'Lead Story Spanning 9 Columns',
          body: 'Lead story body paragraph text.',
          priority: 'lead' as const,
          columnSpan: 9,
          orderIndex: 0,
        },
        {
          id: 'art-sidebar',
          headline: 'Narrow Sidebar Spanning 3 Columns',
          body: 'Sidebar story body paragraph text.',
          priority: 'minor' as const,
          columnSpan: 3,
          orderIndex: 1,
        },
      ];

      doc.pages[0].articles = articles;
      doc.articles = articles;

      const html = renderNewspaperDocumentToHtml(doc);

      // 1. Grid container must have inline 12-column template
      expect(html).toContain('grid-template-columns: repeat(12, 1fr);');

      // 2. Lead story must span 9 columns (not clamped to 4)
      expect(html).toContain('grid-column: span 9;');

      // 3. Second story must span 3 columns
      expect(html).toContain('grid-column: span 3;');

      // 4. Combined spans: 9 + 3 = 12 <= 12, so CSS Grid places them in the same row
      expect(doc.pages[0].articles[0].columnSpan + doc.pages[0].articles[1].columnSpan).toBe(12);
    });

    it('falls back to layout.columnCount and clamps spans when page has no page.columnCount', () => {
      const doc = createNewspaperDocument({
        presetId: 'classic-hindi-broadsheet',
      });
      doc.layout.columnCount = 4;
      delete doc.pages[0].columnCount;

      const articles = [
        {
          id: 'art-lead',
          headline: 'Lead Story Spanning 9 Columns',
          body: 'Lead story body paragraph text.',
          priority: 'lead' as const,
          columnSpan: 9,
          orderIndex: 0,
        },
        {
          id: 'art-story-2',
          headline: 'Second Story Spanning 3 Columns',
          body: 'Second story body paragraph text.',
          priority: 'minor' as const,
          columnSpan: 3,
          orderIndex: 1,
        },
      ];

      doc.pages[0].articles = articles;
      doc.articles = articles;

      const html = renderNewspaperDocumentToHtml(doc);

      // 1. Grid container must have inline 4-column template resolved from layout.columnCount
      expect(html).toContain('grid-template-columns: repeat(4, 1fr);');

      // 2. Lead story with columnSpan 9 must be clamped to resolved columnCount 4
      expect(html).toContain('grid-column: span 4;');

      // 3. Second story with columnSpan 3 must span 3
      expect(html).toContain('grid-column: span 3;');
    });
  });
});
