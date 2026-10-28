import { describe, it, expect } from 'vitest';
import {
  MinimalDocumentSchema,
  SupportedDeviceSchema,
  NewspaperDocumentSchema,
  ArticleSchema,
  PageSizePresetSchema,
  PAGE_SIZE_DEFINITIONS,
  NewspaperPageSchema,
  getPublicationPages,
  getPageDimensions,
  resolvePageColumnCount,
  migrateDocumentSchema,
  getPrintableAreaBoundsMm,
  validateFrameInsidePrintableArea,
  clampFrameToPrintableArea,
} from './index';

describe('DocumentSchema', () => {
  it('should validate a valid minimal e-paper document', () => {
    const validDoc = {
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Morning Briefing',
        language: 'en',
        direction: 'ltr',
        device: 'remarkable-2',
        orientation: 'portrait',
      },
      pages: [],
    };

    const parsed = MinimalDocumentSchema.safeParse(validDoc);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid device target', () => {
    const invalidResult = SupportedDeviceSchema.safeParse('unsupported-device-xyz');
    expect(invalidResult.success).toBe(false);
  });

  it('should validate standard physical newspaper page size definitions', () => {
    const presets = PageSizePresetSchema.options;
    expect(presets).toContain('broadsheet');
    expect(presets).toContain('berliner');
    expect(presets).toContain('tabloid');
    expect(presets).toContain('a3');
    expect(presets).toContain('a4');

    for (const preset of presets) {
      const def = PAGE_SIZE_DEFINITIONS[preset];
      expect(def).toBeDefined();
      expect(def.widthPt).toBeGreaterThan(0);
      expect(def.heightPt).toBeGreaterThan(0);
    }
  });

  it('should validate a full newspaper document schema', () => {
    const now = new Date().toISOString();
    const doc = {
      version: '1.0.0',
      id: 'doc-001',
      metadata: {
        id: 'doc-001',
        title: 'The Daily Tribune',
        language: 'en',
        direction: 'ltr',
        pageSize: 'broadsheet',
        orientation: 'portrait',
        createdAt: now,
        updatedAt: now,
      },
      masthead: {
        title: 'THE DAILY TRIBUNE',
        subtitle: 'The Premier Morning Journal',
        edition: 'City Edition',
        issueNumber: 'Vol. CXX No. 45',
        date: '2026-10-27',
        price: '$2.00',
        weatherNotice: 'Fair, 68°F',
      },
      layout: {
        presetId: 'classic-broadsheet',
        columnCount: 4,
        columnRule: true,
        headlineFont: 'Playfair Display, serif',
        bodyFont: 'Georgia, serif',
        bodyFontSizePt: 10,
        spacingDensity: 'normal',
        showFooter: true,
        footerText: 'Page 1 — The Daily Tribune',
      },
      articles: [
        {
          id: 'art-1',
          headline: 'Historic Trade Agreement Signed in Capital',
          subheadline: 'Delegates from 40 nations finalize landmark pact',
          body: 'World leaders convened this morning to formally ratify the treaty...',
          byline: 'By Eleanor Vance, Diplomatic Correspondent',
          dateline: 'GENEVA —',
          imagePlacement: 'top',
          columnSpan: 3,
          priority: 'lead',
          orderIndex: 0,
        },
      ],
    };

    const parsed = NewspaperDocumentSchema.safeParse(doc);
    expect(parsed.success).toBe(true);
  });

  it('should reject articles with empty headlines or invalid column spans', () => {
    const badArticle = {
      id: 'art-bad',
      headline: '',
      body: 'Some text',
      columnSpan: 10, // Max is 6
    };
    const parsed = ArticleSchema.safeParse(badArticle);
    expect(parsed.success).toBe(false);
  });

  it('should validate multi-page publications and getPublicationPages helper', () => {
    const page = {
      id: 'page-1',
      pageNumber: 1,
      sectionTitle: 'मुख्य पृष्ठ',
      articles: [
        {
          id: 'art-1',
          headline: 'मुख पृष्ठ समाचार',
          body: 'समाचार का विवरण यहाँ...',
          columnSpan: 2,
          priority: 'lead' as const,
          orderIndex: 0,
        },
      ],
    };
    expect(NewspaperPageSchema.safeParse(page).success).toBe(true);
    const now = new Date().toISOString();
    const multiPageDoc = {
      version: '1.0.0' as const,
      id: 'doc-multi',
      metadata: {
        id: 'doc-multi',
        title: 'जनवाणी समाचार',
        language: 'hi',
        direction: 'ltr' as const,
        pageSize: 'broadsheet' as const,
        orientation: 'portrait' as const,
        createdAt: now,
        updatedAt: now,
      },
      masthead: {
        title: 'जनवाणी समाचार',
        subtitle: 'सत्य का प्रतीक',
        edition: 'मुख्य संस्करण',
        issueNumber: 'अंक 1',
        date: '27 अक्टूबर 2026',
        price: '₹5.00',
        weatherNotice: 'मौसम: सुहावना',
      },
      layout: {
        presetId: 'classic-hindi-broadsheet' as const,
        columnCount: 4,
        columnRule: true,
        mastheadFont: "'Rozha One', serif",
        headlineFont: "'Noto Serif Devanagari', serif",
        subheadlineFont: "'Noto Serif Devanagari', serif",
        bodyFont: "'Noto Serif Devanagari', serif",
        headlineWeight: 700,
        bodyFontSizePt: 10,
        spacingDensity: 'normal' as const,
        showFooter: true,
        footerText: 'पृष्ठ 1',
      },
      articles: [],
      pages: [page],
    };

    const parsed = NewspaperDocumentSchema.safeParse(multiPageDoc);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const pages = getPublicationPages(parsed.data);
      expect(pages).toHaveLength(1);
      expect(pages[0]?.sectionTitle).toBe('मुख्य पृष्ठ');
    }

    // 12-column page validation
    const twelveColPage = {
      ...page,
      columnCount: 12,
    };
    expect(NewspaperPageSchema.safeParse(twelveColPage).success).toBe(true);

    // Legacy doc without pages: getPublicationPages fallback leaves columnCount undefined to inherit dynamically
    const legacyDoc = {
      ...multiPageDoc,
      pages: undefined,
    };
    const parsedLegacy = NewspaperDocumentSchema.parse(legacyDoc);
    const fallbackPages = getPublicationPages(parsedLegacy);
    expect(fallbackPages).toHaveLength(1);
    expect(fallbackPages[0]?.columnCount).toBeUndefined();
    // Dynamically inherits document layout columnCount via resolver
    expect(resolvePageColumnCount(parsedLegacy, fallbackPages[0])).toBe(4);
  });

  it('should calculate explicit page dimensions and swap axes for landscape', () => {
    // Broadsheet Portrait
    const bs = getPageDimensions('broadsheet', 'portrait');
    expect(bs.widthPt).toBe(1080);
    expect(bs.heightPt).toBe(1638);
    expect(bs.aspectRatio).toBeLessThan(1); // tall

    // Broadsheet Landscape
    const bsLand = getPageDimensions('broadsheet', 'landscape');
    expect(bsLand.widthPt).toBe(1638);
    expect(bsLand.heightPt).toBe(1080);
    expect(bsLand.aspectRatio).toBeGreaterThan(1); // wide

    // Tabloid, Berliner, A3, A4
    const tab = getPageDimensions('tabloid', 'portrait');
    expect(tab.widthPt).toBe(792);
    expect(tab.heightPt).toBe(1224);

    const a4 = getPageDimensions('a4', 'portrait');
    expect(a4.widthMm).toBe(210);
    expect(a4.heightMm).toBe(297);
  });

  it('should validate article with rich photo layout, caption, and credit', () => {
    const articleWithPhoto = {
      id: 'art-photo-1',
      headline: 'विशेष फोटो रिपोर्ट: हिमालयी जैव विविधता',
      body: 'विशेषज्ञों के एक दल ने उच्च हिमालयी क्षेत्रों में दुर्लभ वनस्पतियों का दस्तावेजीकरण किया।',
      imageUrl: 'https://example.com/photo.jpg',
      imageCaption: 'फूलों की घाटी में अनुसंधान करते वैज्ञानिक।',
      imageCredit: 'छाया: पर्यावरण ब्यूरो',
      imagePlacement: 'top' as const,
      imageLayout: 'full' as const,
      imageAspect: 'wide' as const,
      imageFit: 'cover' as const,
      imageFocalPoint: 'center' as const,
      columnSpan: 3,
      priority: 'lead' as const,
      orderIndex: 0,
    };

    const parsed = ArticleSchema.safeParse(articleWithPhoto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.imageCredit).toBe('छाया: पर्यावरण ब्यूरो');
      expect(parsed.data.imageLayout).toBe('full');
      expect(parsed.data.imageAspect).toBe('wide');
    }
  });

  describe('Free-Placement Layout Schema & Clamping', () => {
    it('should validate Article with FrameMm', () => {
      const freeArticle = {
        id: 'art-free-1',
        headline: 'मुक्त लेआउट शीर्षक',
        body: 'आर्टिकल बॉडी टेक्स्ट...',
        frame: {
          x: 25.4,
          y: 60.0,
          w: 120.0,
          h: 85.5,
          z: 2,
        },
      };

      const parsed = ArticleSchema.safeParse(freeArticle);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.frame?.x).toBe(25.4);
        expect(parsed.data.frame?.w).toBe(120.0);
        expect(parsed.data.frame?.z).toBe(2);
      }
    });

    it('should reject invalid frame with dimensions below 10mm or negative coordinates', () => {
      const invalidFrame = {
        id: 'art-free-invalid',
        headline: 'अमान्य फ्रेम',
        body: 'सामग्री...',
        frame: {
          x: -5,
          y: 10,
          w: 5, // < 10mm min
          h: 20,
        },
      };

      const parsed = ArticleSchema.safeParse(invalidFrame);
      expect(parsed.success).toBe(false);
    });

    it('should validate NewspaperPage with layoutMode "free" and "auto"', () => {
      const freePage = {
        id: 'page-free',
        pageNumber: 1,
        layoutMode: 'free' as const,
        articles: [],
      };
      const parsedFree = NewspaperPageSchema.safeParse(freePage);
      expect(parsedFree.success).toBe(true);
      if (parsedFree.success) {
        expect(parsedFree.data.layoutMode).toBe('free');
      }

      const autoPage = {
        id: 'page-auto',
        pageNumber: 2,
        articles: [],
      };
      const parsedAuto = NewspaperPageSchema.safeParse(autoPage);
      expect(parsedAuto.success).toBe(true);
      if (parsedAuto.success) {
        expect(parsedAuto.data.layoutMode).toBe('auto');
      }
    });

    it('should migrate legacy 1.0.0 documents to 1.1.0 preserving all content', () => {
      const legacyDoc = {
        version: '1.0.0',
        id: 'legacy-doc-1',
        metadata: {
          id: 'legacy-doc-1',
          title: 'Legacy Paper',
          language: 'hi',
          direction: 'ltr',
          pageSize: 'broadsheet',
          orientation: 'portrait',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        masthead: {
          title: 'दैनिक नवप्रभात',
        },
        layout: {
          presetId: 'classic-hindi-broadsheet',
          columnCount: 12,
        },
        articles: [],
        pages: [
          {
            id: 'page-legacy-1',
            pageNumber: 1,
            articles: [
              {
                id: 'art-1',
                headline: 'समाचार',
                body: 'विवरण...',
              },
            ],
          },
        ],
      };

      const migrated = migrateDocumentSchema(legacyDoc);
      expect(migrated.version).toBe('1.1.0');
      expect(migrated.pages?.[0]?.layoutMode).toBe('auto');
      expect(migrated.pages?.[0]?.articles).toHaveLength(1);
    });

    it('should compute printable area bounds and correctly validate/clamp frames', () => {
      const bounds = getPrintableAreaBoundsMm('broadsheet', 'portrait', {
        paddingPt: 24, // ~8.47mm
        headerHeightPt: 120, // ~42.33mm
        footerHeightPt: 20, // ~7.06mm
      });

      expect(bounds.minX).toBeCloseTo(8.47, 1);
      expect(bounds.maxX).toBeCloseTo(381 - 8.47, 1);
      expect(bounds.minY).toBeCloseTo(8.47 + 42.33, 1);
      expect(bounds.maxY).toBeCloseTo(578 - 8.47 - 7.06, 1);

      // Frame completely inside
      const insideFrame = {
        x: bounds.minX + 10,
        y: bounds.minY + 10,
        w: 100,
        h: 100,
        z: 1,
      };
      expect(validateFrameInsidePrintableArea(insideFrame, bounds).valid).toBe(true);

      // Frame extending past right edge
      const outsideRightFrame = {
        x: bounds.maxX - 50,
        y: bounds.minY + 10,
        w: 100, // 50mm past margin!
        h: 100,
        z: 1,
      };
      const rightResult = validateFrameInsidePrintableArea(outsideRightFrame, bounds);
      expect(rightResult.valid).toBe(false);

      // Clamping should bring it strictly inside bounds
      const clamped = clampFrameToPrintableArea(outsideRightFrame, bounds);
      expect(clamped.x + clamped.w).toBeLessThanOrEqual(bounds.maxX + 0.05);
      expect(clamped.x).toBeGreaterThanOrEqual(bounds.minX);
      expect(validateFrameInsidePrintableArea(clamped, bounds).valid).toBe(true);
    });
  });
});
