import { describe, it, expect } from 'vitest';
import {
  createNewspaperDocument,
  type NewspaperDocument,
  type NewspaperPage,
  type Article,
  type FrameMm,
} from './index';
import {
  balanceNewspaperPage,
  balanceNewspaperDocument,
  calculateArticleInnerColumns,
  getPermissibleSpanRange,
} from './balancer';
import { checkAabbOverlap } from './freeLayout';
import { estimateArticleRequiredHeightPx, runPreflightValidation } from './preflight';
import {
  getPageDimensions,
  DailyEditionSchema,
  type DailyEdition,
  type PageSizePreset,
} from '@epaper-studio/document-schema';

/* ====================================================================
 * Test Fixture Generators
 * ==================================================================== */

function createTestArticle(
  id: string,
  priority: 'lead' | 'major' | 'minor' | 'brief',
  wordCount: number,
  isHindi: boolean = true,
  overrides: Partial<Article> = {}
): Article {
  const hindiWords = [
    'प्रधानमंत्री', 'ने', 'नई', 'दिल्ली', 'में', 'आयोजित', 'अंतरराष्ट्रीय', 'शिखर', 'सम्मेलन',
    'का', 'उद्घाटन', 'किया।', 'इस', 'अवसर', 'पर', 'उन्होंने', 'कहा', 'कि', 'भारत', 'आर्थिक',
    'विकास', 'और', 'तकनीकी', 'नवाचार', 'के', 'क्षेत्र', 'में', 'वैश्विक', 'स्तर', 'पर', 'अग्रणी',
    'भूमिका', 'निभा', 'रहा', 'है।', 'पर्यावरण', 'संरक्षण', 'और', 'सतत', 'विकास', 'हमारी',
    'प्राथमिकता', 'है।', 'ग्रामीण', 'क्षेत्रों', 'में', 'डिजिटल', 'क्रांति', 'से', 'परिवर्तन', 'आया', 'है।'
  ];

  const englishWords = [
    'The', 'government', 'announced', 'a', 'comprehensive', 'package', 'for', 'infrastructure',
    'development', 'and', 'economic', 'growth.', 'Officials', 'stated', 'that', 'the', 'initiative',
    'aims', 'to', 'boost', 'manufacturing,', 'create', 'sustainable', 'jobs,', 'and', 'modernize',
    'urban', 'transportation', 'networks', 'across', 'key', 'regions', 'nationwide.'
  ];

  const vocab = isHindi ? hindiWords : englishWords;
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(vocab[i % vocab.length]!);
  }

  return {
    id,
    headline: isHindi ? `प्रमुख समाचार: शीर्षक ${id}` : `Breaking News Headline ${id}`,
    subheadline: isHindi ? `उपशीर्षक विवरण संक्षेप ${id}` : `Subheadline summary details ${id}`,
    body: words.join(' '),
    byline: isHindi ? 'विशेष संवाददाता' : 'Special Correspondent',
    dateline: isHindi ? 'नई दिल्ली' : 'New Delhi',
    priority,
    columnSpan: priority === 'lead' ? 4 : priority === 'major' ? 2 : 1,
    orderIndex: 0,
    ...overrides,
  };
}

function createBaseDocument(
  pageSize: 'tabloid' | 'broadsheet' | 'a3' | 'a4',
  columnCount: number,
  spacingDensity: 'compact' | 'normal' | 'relaxed' = 'normal'
): { doc: NewspaperDocument; page: NewspaperPage } {
  const doc = createNewspaperDocument({
    presetId: 'classic-hindi-broadsheet',
    title: 'परीक्षण दैनिक',
    pageSize,
  });

  doc.layout.columnCount = columnCount;
  doc.layout.spacingDensity = spacingDensity;

  const page = doc.pages[0]!;
  page.columnCount = columnCount;
  page.articles = [];

  return { doc, page };
}

/* ====================================================================
 * Balancer Test Suite
 * ==================================================================== */

describe('Intelligent Newspaper Column Balancer Engine (Phase 2A Step 1 Corrected)', () => {
  it('1. Physical Page Bounds: printable bounds and all article frames strictly inside physical dimensions', () => {
    const pageSizes: Array<'broadsheet' | 'tabloid' | 'a3' | 'a4'> = [
      'broadsheet',
      'tabloid',
      'a3',
      'a4',
    ];

    for (const size of pageSizes) {
      const { doc, page } = createBaseDocument(size, 4);
      const dims = getPageDimensions(size, 'portrait');

      page.articles = [
        createTestArticle('p-lead', 'lead', 200, true),
        createTestArticle('p-maj', 'major', 120, true),
        createTestArticle('p-min', 'minor', 80, true),
      ];

      const result = balanceNewspaperPage(page, doc);

      for (const placed of result.report.placedArticles) {
        const f = placed.frameMm;
        // Frame must be positive
        expect(f.x).toBeGreaterThanOrEqual(0);
        expect(f.y).toBeGreaterThanOrEqual(0);
        // Frame must fit within physical page dimensions
        expect(f.x + f.w).toBeLessThanOrEqual(dims.widthMm + 0.1);
        expect(f.y + f.h).toBeLessThanOrEqual(dims.heightMm + 0.1);
      }
    }
  });

  it('2. Real 2D Vertical Sub-Slotting: 450-word lead next to 60-word story A, with 60-word story B stacked beneath A', () => {
    const { doc, page } = createBaseDocument('broadsheet', 6);
    page.articles = [
      createTestArticle('art-tall-4col', 'lead', 450, true),
      createTestArticle('art-short-2col-A', 'major', 60, true),
      createTestArticle('art-short-2col-B', 'major', 60, true),
    ];

    const result = balanceNewspaperPage(page, doc);

    const lead = result.report.placedArticles.find((p) => p.article.id === 'art-tall-4col');
    const shortA = result.report.placedArticles.find((p) => p.article.id === 'art-short-2col-A');
    const shortB = result.report.placedArticles.find((p) => p.article.id === 'art-short-2col-B');

    expect(lead).toBeDefined();
    expect(shortA).toBeDefined();
    expect(shortB).toBeDefined();

    // Both short stories must be placed in the same column track (cols 4..5)
    expect(shortA!.columnStart).toBe(4);
    expect(shortB!.columnStart).toBe(4);
    expect(shortA!.columnSpan).toBe(2);
    expect(shortB!.columnSpan).toBe(2);

    // Both short stories must share Band 0 with the lead story
    expect(shortA!.rowBandIndex).toBe(0);
    expect(shortB!.rowBandIndex).toBe(0);
    expect(lead!.rowBandIndex).toBe(0);

    // Story B must stack vertically beneath Story A
    expect(shortB!.frameMm.y).toBeGreaterThanOrEqual(shortA!.frameMm.y + shortA!.frameMm.h);

    // Assert zero collision between Short A and Short B
    expect(checkAabbOverlap(shortA!.frameMm, shortB!.frameMm)).toBe(false);
    expect(checkAabbOverlap(lead!.frameMm, shortA!.frameMm)).toBe(false);
    expect(checkAabbOverlap(lead!.frameMm, shortB!.frameMm)).toBe(false);
  });

  it('3. 8-column broadsheet with locked advertisement: preserves exact ad coordinates (Δx=0, Δy=0)', () => {
    const { doc, page } = createBaseDocument('broadsheet', 8);

    const lockedAdFrame: FrameMm = {
      x: 20,
      y: 320,
      w: 260,
      h: 65,
      z: 5,
    };

    const lockedAd: Article = {
      id: 'commercial-ad-banner',
      headline: 'Commercial Sponsor Banner',
      body: 'Advertisement content',
      elementType: 'advertisement',
      locked: true,
      frame: lockedAdFrame,
      columnSpan: 8,
      orderIndex: 99,
    };

    page.articles = [
      createTestArticle('story-1', 'lead', 300, true),
      createTestArticle('story-2', 'major', 190, true),
      createTestArticle('story-3', 'major', 160, true),
      createTestArticle('story-4', 'minor', 100, true),
      lockedAd,
    ];

    const result = balanceNewspaperPage(page, doc);

    const placedAd = result.page.articles.find((a) => a.id === 'commercial-ad-banner');
    expect(placedAd).toBeDefined();
    expect(placedAd!.frame).toBeDefined();

    // Verify EXACT physical frame preservation: Δx = 0, Δy = 0, Δw = 0, Δh = 0
    expect(placedAd!.frame!.x).toBe(lockedAdFrame.x);
    expect(placedAd!.frame!.y).toBe(lockedAdFrame.y);
    expect(placedAd!.frame!.w).toBe(lockedAdFrame.w);
    expect(placedAd!.frame!.h).toBe(lockedAdFrame.h);

    // Verify no unlocked article overlaps with the locked advertisement
    for (const placed of result.report.placedArticles) {
      if (placed.article.id !== 'commercial-ad-banner') {
        const overlap = checkAabbOverlap(placed.frameMm, lockedAdFrame);
        expect(overlap).toBe(false);
      }
    }
  });

  it('4. Advertisement without frame: safely anchored at bottom of page as locked obstacle, never movable', () => {
    const { doc, page } = createBaseDocument('broadsheet', 6);

    const unpositionedAd: Article = {
      id: 'ad-no-frame',
      headline: 'Local Business Sponsor',
      body: 'Visit our store today for discounts',
      elementType: 'advertisement',
      columnSpan: 6,
      orderIndex: 99,
    };

    page.articles = [
      createTestArticle('art-1', 'lead', 250, true),
      createTestArticle('art-2', 'major', 140, true),
      unpositionedAd,
    ];

    const result = balanceNewspaperPage(page, doc);

    const placedAd = result.page.articles.find((a) => a.id === 'ad-no-frame');
    expect(placedAd).toBeDefined();
    expect(placedAd!.frame).toBeDefined();
    // Must be placed at bottom of page
    expect(placedAd!.frame!.y).toBeGreaterThan(200);
    // Must be reported as reserved ad in voidRegions
    const adVoid = result.report.voidRegions.find((v) => v.classification === 'reserved_ad');
    expect(adVoid).toBeDefined();
  });

  it('5. Reserved regions: isReserved preserves empty space, prevents collision, recorded in report', () => {
    const { doc, page } = createBaseDocument('broadsheet', 6);

    const reservedSlot: Article = {
      id: 'editorial-reserved-box',
      headline: 'आरक्षित स्थान',
      body: 'संपादकीय रिक्त स्थान',
      isReserved: true,
      reservationType: 'editorial_whitespace',
      columnSpan: 2,
      orderIndex: 2,
    };

    page.articles = [
      createTestArticle('main-lead', 'lead', 280, true),
      reservedSlot,
      createTestArticle('side-art', 'major', 120, true),
    ];

    const result = balanceNewspaperPage(page, doc);

    const placedReserved = result.page.articles.find((a) => a.id === 'editorial-reserved-box');
    expect(placedReserved).toBeDefined();
    expect(placedReserved!.frame).toBeDefined();

    // Verify zero collision between reserved slot and other stories
    for (const placed of result.report.placedArticles) {
      if (placed.article.id !== 'editorial-reserved-box') {
        expect(checkAabbOverlap(placed.frameMm, placedReserved!.frame!)).toBe(false);
      }
    }
  });

  it('6. Devanagari height calibration: estimates within 15% of browser DOM measurement (no 37% inflation)', () => {
    const excessiveBody = `राजधानी में आज एक भव्य समारोह के दौरान कई बड़ी विकास परियोजनाओं का शिलान्यास किया गया। इस ऐतिहासिक अवसर पर विभिन्न गणमान्य व्यक्तियों ने भाग लिया और क्षेत्र के समग्र विकास के लिए सरकार की अटूट प्रतिबद्धता की सराहना की। नई चौड़ी सड़कों, आधुनिक पुलों और सुसज्जित स्वास्थ्य केंद्रों के निर्माण से लाखों नागरिकों को सीधा लाभ मिलेगा।

स्थानीय नागरिकों एवं व्यापारियों ने सरकार के इस दूरदर्शी कदम का गर्मजोशी से स्वागत किया है। उद्योग व्यापार मंडल के अध्यक्ष ने अपने संबोधन में कहा कि आधारभूत ढांचे में सुधार से स्थानीय अर्थव्यवस्था को नई गति मिलेगी, पर्यटन उद्योग को बढ़ावा मिलेगा और स्थानीय युवाओं के लिए रोजगार के नए अवसर सृजित होंगे।

परियोजना निदेशकों के अनुसार अगले वित्तीय वर्ष की अंतिम तिमाही तक इन सभी निर्माण कार्यों को पूरा करने का कड़ा लक्ष्य निर्धारित किया गया है। संबंधित कार्यदायी संस्थाओं को निर्माण कार्य में उच्च कोटि की गुणवत्ता मानकों और समय-सीमा का कड़ाई से पालन करने के स्पष्ट और कड़े निर्देश दिए गए हैं।

उत्तराखंड एवं हिमाचल के उच्च पर्वतीय क्षेत्रों में भारी बर्फबारी के बाद मैदानी इलाकों में ठंड का प्रकोप बढ़ गया है। मौसम विज्ञान विभाग ने आगामी 48 घंटों के लिए यलो अलर्ट जारी किया है। सुबह के समय घने कोहरे के कारण यातायात प्रभावित हो रहा है।

प्रशासन ने बेसहारा लोगों के लिए प्रमुख चौराहों पर अलाव जलाने और रैन बसेरों में समुचित व्यवस्था करने के निर्देश दिए हैं। डॉक्टरों ने बुजुर्गों और बच्चों को विशेष सावधानी बरतने की सलाह दी है।`;

    const art: Article = {
      id: 'art-calib',
      headline: 'अत्यधिक सामग्री परीक्षण: 280px निर्धारित ऊंचाई में पाठ सीमा और क्लिपिंग की जांच',
      subheadline: 'कंटेनर की क्षमता से अधिक सामग्री होने पर दृश्यता और ओवरफ्लो का व्यवहार',
      kickerText: 'जांच रिपोर्ट',
      byline: 'विशेष परीक्षण संवाददाता',
      priority: 'lead',
      columnSpan: 2,
      body: excessiveBody,
      typography: { bodyColumnCount: 1 },
      orderIndex: 0,
    };

    // Actual DOM scrollHeight from Phase 1 Playwright test
    const actualBrowserDomHeight = 376;
    const estimatedHeight = estimateArticleRequiredHeightPx(art, 4, 1376);

    const deviationPct = Math.abs((estimatedHeight - actualBrowserDomHeight) / actualBrowserDomHeight) * 100;
    // Must be calibrated within 15% (previously failed at +37.0%)
    expect(deviationPct).toBeLessThan(15.0);
  });

  it('7. Wide article inner columns: allocates 4 inner columns for 6+ span and 5 for 8+ span with high word counts', () => {
    const singleColWidthMm = 45;
    const gapMm = 4;

    const wideHindiLead6 = createTestArticle('lead-6', 'lead', 550, true);
    const wideHindiLead8 = createTestArticle('lead-8', 'lead', 750, true);

    const cols6 = calculateArticleInnerColumns(wideHindiLead6, 6, singleColWidthMm, gapMm, 45);
    expect(cols6).toBe(4);

    const cols8 = calculateArticleInnerColumns(wideHindiLead8, 8, singleColWidthMm, gapMm, 45);
    expect(cols8).toBe(5);
  });

  it('8. Manually positioned article with lockPosition: true: preserves position (Δx = 0, Δy = 0)', () => {
    const { doc, page } = createBaseDocument('tabloid', 4);

    const pinnedFrame: FrameMm = {
      x: 30,
      y: 120,
      w: 80,
      h: 55,
      z: 3,
    };

    const pinnedArticle: Article = {
      ...createTestArticle('pinned-art', 'major', 110, true),
      lockPosition: true,
      frame: pinnedFrame,
    };

    page.articles = [
      createTestArticle('art-unlocked-1', 'lead', 180, true),
      pinnedArticle,
      createTestArticle('art-unlocked-2', 'minor', 80, true),
    ];

    const result = balanceNewspaperPage(page, doc);

    const resultPinned = result.page.articles.find((a) => a.id === 'pinned-art');
    expect(resultPinned).toBeDefined();
    expect(resultPinned!.frame).toBeDefined();
    expect(resultPinned!.frame!.x).toBe(pinnedFrame.x);
    expect(resultPinned!.frame!.y).toBe(pinnedFrame.y);
  });

  it('9. Manually locked span with lockSpan: true: preserves column span', () => {
    const artWithLockedSpan: Article = {
      ...createTestArticle('locked-span-art', 'major', 150, true),
      columnSpan: 3,
      lockSpan: true,
    };

    const range = getPermissibleSpanRange(artWithLockedSpan, 6);
    expect(range.minSpan).toBe(3);
    expect(range.maxSpan).toBe(3);
    expect(range.defaultSpan).toBe(3);
  });

  it('10. Geometric collision assertion: zero AABB overlaps among placed frames across full broadsheet', () => {
    const { doc, page } = createBaseDocument('broadsheet', 6);
    page.articles = [
      createTestArticle('c-lead', 'lead', 300, true),
      createTestArticle('c-maj1', 'major', 180, true),
      createTestArticle('c-maj2', 'major', 160, true),
      createTestArticle('c-min1', 'minor', 110, true),
      createTestArticle('c-min2', 'minor', 90, true),
      createTestArticle('c-brief1', 'brief', 45, true),
      createTestArticle('c-brief2', 'brief', 40, true),
    ];

    const result = balanceNewspaperPage(page, doc);
    const placed = result.report.placedArticles;

    let collisionCount = 0;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        if (checkAabbOverlap(placed[i]!.frameMm, placed[j]!.frameMm)) {
          collisionCount++;
        }
      }
    }

    expect(collisionCount).toBe(0);
  });

  it('11. Determinism: 100 consecutive runs produce 100% identical JSON outputs', () => {
    const { doc, page } = createBaseDocument('broadsheet', 8);
    page.articles = [
      createTestArticle('det-lead', 'lead', 350, true),
      createTestArticle('det-maj1', 'major', 210, true),
      createTestArticle('det-maj2', 'major', 190, true),
      createTestArticle('det-min1', 'minor', 120, true),
      createTestArticle('det-min2', 'minor', 85, true),
      createTestArticle('det-brief', 'brief', 40, true),
    ];

    const firstRun = balanceNewspaperPage(page, doc);
    const firstJson = JSON.stringify(firstRun.page);

    for (let run = 1; run <= 100; run++) {
      const currentRun = balanceNewspaperPage(page, doc);
      const currentJson = JSON.stringify(currentRun.page);
      expect(currentJson).toBe(firstJson);
    }
  });

  it('12. Benchmark: measures latency across 4, 6, 8, and 12-column configurations', () => {
    const benchmarks: Record<number, number> = {};

    const configs: Array<{ cols: number; size: 'tabloid' | 'broadsheet'; count: number }> = [
      { cols: 4, size: 'tabloid', count: 5 },
      { cols: 6, size: 'broadsheet', count: 8 },
      { cols: 8, size: 'broadsheet', count: 12 },
      { cols: 12, size: 'broadsheet', count: 14 },
    ];

    for (const cfg of configs) {
      const { doc, page } = createBaseDocument(cfg.size, cfg.cols);
      page.articles = [];
      for (let i = 0; i < cfg.count; i++) {
        const priority = i === 0 ? 'lead' : i < 3 ? 'major' : i < 6 ? 'minor' : 'brief';
        page.articles.push(createTestArticle(`bm-${cfg.cols}-${i}`, priority, 120 + i * 15, true));
      }

      // Warmup
      balanceNewspaperPage(page, doc);

      // Measure 10 runs and take median
      const samples: number[] = [];
      for (let run = 0; run < 10; run++) {
        const t0 = performance.now();
        balanceNewspaperPage(page, doc);
        const t1 = performance.now();
        samples.push(t1 - t0);
      }

      samples.sort((a, b) => a - b);
      const medianMs = samples[Math.floor(samples.length / 2)]!;
      benchmarks[cfg.cols] = Number(medianMs.toFixed(3));

      // In isolated runs medianMs is ~0.8-4ms; allow up to 50ms under heavy parallel test suite execution
      expect(medianMs).toBeLessThan(50.0);
    }

    console.log('\n--- Corrected Column Balancer Benchmark Results ---');
    console.log(`4-column Tabloid  (5 articles) : ${benchmarks[4]} ms`);
    console.log(`6-column Broadsheet (8 articles) : ${benchmarks[6]} ms`);
    console.log(`8-column Broadsheet (12 articles): ${benchmarks[8]} ms`);
    console.log(`12-column Modular (14 articles) : ${benchmarks[12]} ms`);
    console.log('---------------------------------------------------\n');
  });

  /* ====================================================================
   * Phase 2A Step 2: Safe Schema & Preflight Integration Tests
   * ==================================================================== */

  describe('Phase 2A Step 2: Safe Schema & Preflight Integration', () => {
    it('13. Schema validation: Throws ZodError on malformed input page or document', () => {
      const { doc, page } = createBaseDocument('broadsheet', 6);

      // Malformed page: invalid layoutMode
      const malformedPage = {
        ...page,
        layoutMode: 'invalid_mode_not_in_enum',
      } as unknown as NewspaperPage;

      expect(() => balanceNewspaperPage(malformedPage, doc)).toThrow();

      // Malformed document: invalid schemaVersion
      const malformedDoc = {
        ...doc,
        schemaVersion: '9.9.9',
      } as unknown as NewspaperDocument;

      expect(() => balanceNewspaperDocument(malformedDoc)).toThrow();
    });

    it('14. Page dimensions and bounds validation: Rejects invalid page presets', () => {
      const { doc, page } = createBaseDocument('broadsheet', 6);
      const invalidSizeDoc = {
        ...doc,
        metadata: {
          ...doc.metadata,
          pageSize: 'non_existent_preset' as unknown as PageSizePreset,
        },
      };

      expect(() => balanceNewspaperPage(page, invalidSizeDoc)).toThrow();
    });

    it('15. Original document immutability: balanceNewspaperDocument returns a fresh copy without modifying input', () => {
      const { doc, page } = createBaseDocument('broadsheet', 6);
      page.articles = [
        createTestArticle('imm-lead', 'lead', 300, true),
        createTestArticle('imm-maj', 'major', 150, true),
        createTestArticle('imm-min', 'minor', 80, true),
      ];

      const originalDocJson = JSON.stringify(doc);

      const result = balanceNewspaperDocument(doc);

      // Verify fresh object references
      expect(result.document).not.toBe(doc);
      expect(result.document.pages[0]).not.toBe(doc.pages[0]);
      expect(result.reports).toHaveLength(1);

      // Verify original doc is completely untouched
      expect(JSON.stringify(doc)).toBe(originalDocJson);

      // Verify balanced document has computed frames and column inner counts
      const balancedArt = result.document.pages[0]!.articles[0]!;
      expect(balancedArt.frame).toBeDefined();
      expect(balancedArt.typography?.bodyColumnCount).toBeGreaterThanOrEqual(1);
    });

    it('16. Locked element and reserved region preservation during document balancing', () => {
      const { doc, page } = createBaseDocument('broadsheet', 6);

      const lockedAd: Article = {
        id: 'locked-bottom-banner',
        headline: 'विशेष व्यावसायिक विज्ञापन',
        body: 'विज्ञापन विवरण',
        elementType: 'advertisement',
        locked: true,
        frame: { x: 8.47, y: 500, w: 364.06, h: 45, z: 10 },
        columnSpan: 6,
        orderIndex: 99,
      };

      const reservedSlot: Article = {
        id: 'reserved-editorial-quote',
        headline: 'आरक्षित स्थान',
        body: 'संपादकीय रिक्त स्थान',
        isReserved: true,
        reservationType: 'editorial_whitespace',
        columnSpan: 2,
        orderIndex: 2,
      };

      page.articles = [
        createTestArticle('lead-story', 'lead', 350, true),
        createTestArticle('major-story', 'major', 180, true),
        reservedSlot,
        lockedAd,
      ];

      const result = balanceNewspaperDocument(doc);
      const balancedPage = result.document.pages[0]!;

      // 1. Locked ad preserves exact frame
      const foundAd = balancedPage.articles.find((a) => a.id === 'locked-bottom-banner')!;
      expect(foundAd.frame!.x).toBe(8.47);
      expect(foundAd.frame!.y).toBe(500);
      expect(foundAd.frame!.w).toBe(364.06);
      expect(foundAd.frame!.h).toBe(45);

      // 2. Reserved slot is assigned a frame and recorded as intentional void
      const foundReserved = balancedPage.articles.find((a) => a.id === 'reserved-editorial-quote')!;
      expect(foundReserved.frame).toBeDefined();
      expect(
        result.reports[0]!.voidRegions.some(
          (v) => v.classification === 'intentional_whitespace' || v.classification === 'reserved_ad'
        )
      ).toBe(true);

      // 3. No collision with locked ad
      for (const art of balancedPage.articles) {
        if (art.id !== 'locked-bottom-banner' && art.frame) {
          expect(checkAabbOverlap(art.frame, foundAd.frame!)).toBe(false);
        }
      }
    });

    it('17. Unplaced article reporting on overset page: Identifies stories that cannot fit in grid', () => {
      const { doc, page } = createBaseDocument('tabloid', 4);

      // Create 20 long articles that far exceed a single tabloid page
      page.articles = [];
      for (let i = 0; i < 20; i++) {
        page.articles.push(createTestArticle(`over-${i}`, 'major', 250, true));
      }

      const result = balanceNewspaperPage(page, doc);

      // Engine must report unplaced articles
      expect(result.report.unplacedArticles.length).toBeGreaterThan(0);

      // All articles (both placed and unplaced) must still be preserved in page.articles without content loss
      expect(result.page.articles).toHaveLength(20);

      const unplacedIds = new Set(result.report.unplacedArticles.map((a) => a.id));
      for (const unplacedArt of result.report.unplacedArticles) {
        expect(unplacedIds.has(unplacedArt.id)).toBe(true);
        expect(unplacedArt.body).toBeDefined();
        expect(unplacedArt.body!.length).toBeGreaterThan(0);
      }
    });

    it('18. Preflight integration (Opt-in check): Reports layout_overset issues when checkColumnBalancing: true', () => {
      const { doc, page } = createBaseDocument('tabloid', 4);

      // Overset tabloid page
      page.articles = [];
      for (let i = 0; i < 18; i++) {
        page.articles.push(createTestArticle(`pf-art-${i}`, 'major', 220, true));
      }

      // Run preflight with opt-in balancing check
      const report = runPreflightValidation(doc, { checkColumnBalancing: true });

      expect(report.totalChecks).toBe(13);
      expect(report.canExport).toBe(false);

      const oversetIssues = report.issues.filter((i) => i.type === 'layout_overset');
      expect(oversetIssues.length).toBeGreaterThan(0);
      expect(oversetIssues.some((i) => i.severity === 'red')).toBe(true);

      // Verify original doc was NOT mutated by preflight
      expect(doc.pages[0]!.articles[0]!.frame).toBeUndefined();
    });

    it('19. Preflight isolation (Default): Preserves 12 checks and zero layout_overset issues when checkColumnBalancing is omitted', () => {
      const { doc, page } = createBaseDocument('tabloid', 4);
      page.articles = [
        createTestArticle('std-1', 'lead', 120, true),
        createTestArticle('std-2', 'major', 80, true),
      ];

      // Standard preflight call as used by the existing editor and PDF export
      const report = runPreflightValidation(doc);

      expect(report.totalChecks).toBe(12);
      expect(report.issues.some((i) => i.type === 'layout_overset')).toBe(false);
    });

    it('20. Backwards compatibility: Existing saved edition and template schemas parse with 0 errors', () => {
      const { doc } = createBaseDocument('broadsheet', 6);

      // Standard DailyEdition conforming to 1.1.0 without modern balancing properties
      const legacyEdition: DailyEdition = {
        id: 'edition-legacy-2026',
        templateId: 'tpl-classic-broadsheet',
        templateName: 'क्लासिक ब्रॉडशीट',
        editionName: 'मुख्य संस्करण',
        editionDate: '2 नवंबर 2026',
        publicationName: 'दैनिक जनवाणी',
        document: doc,
        saveStatus: 'saved',
        createdAt: '2026-11-02T10:00:00.000Z',
        updatedAt: '2026-11-02T10:00:00.000Z',
      };

      const parsedEdition = DailyEditionSchema.parse(legacyEdition);
      expect(parsedEdition.id).toBe('edition-legacy-2026');

      // Verify that balanceNewspaperDocument handles legacy editions cleanly
      const balanced = balanceNewspaperDocument(parsedEdition.document);
      expect(balanced.document.id).toBe(doc.id);
      expect(balanced.reports).toHaveLength(1);
    });
  });
});
