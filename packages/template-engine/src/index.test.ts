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
});
