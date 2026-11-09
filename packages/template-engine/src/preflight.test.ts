import { describe, it, expect } from 'vitest';
import { createNewspaperDocument, runPreflightValidation, isPageCapacityFull } from './index';

describe('PDF Preflight Validation Engine (12-Point Audit)', () => {
  it('should report GREEN status when document is healthy and well-formed', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const report = runPreflightValidation(doc, {
      currentDate: new Date('2026-10-28T00:00:00Z'),
    });

    // Check what issues are present
    expect(report.issues).toEqual([]);
    expect(report.canExport).toBe(true);
    expect(report.errorCount).toBe(0);
    expect(report.overallStatus).toBe('green');
  });

  it('should detect RED blocker when free-layout text area is overflown', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        layoutMode: 'free',
        articles: [
          {
            ...doc.articles[0],
            id: 'art-overflow',
            headline: 'अत्यधिक लंबी खबर',
            // Small frame (50mm x 20mm = 1000mm2) with 500 words
            frame: { x: 20, y: 30, w: 50, h: 20, z: 1 },
            body: new Array(500).fill('समाचार').join(' '),
          },
        ],
      },
    ];

    const report = runPreflightValidation(doc);
    expect(report.errorCount).toBeGreaterThan(0);
    expect(report.canExport).toBe(false);
    expect(report.overallStatus).toBe('red');

    const overflowIssue = report.issues.find((i) => i.type === 'text_overflow');
    expect(overflowIssue).toBeDefined();
    expect(overflowIssue?.severity).toBe('red');
    expect(overflowIssue?.articleId).toBe('art-overflow');
    expect(overflowIssue?.autoFixAvailable).toBe(true);
  });

  it('should detect RED blocker when element exceeds printable page boundaries', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        layoutMode: 'free',
        articles: [
          {
            ...doc.articles[0],
            id: 'art-out-of-bounds',
            // Placed at x=500mm on a 381mm broadsheet!
            frame: { x: 500, y: 100, w: 100, h: 50, z: 1 },
          },
        ],
      },
    ];

    const report = runPreflightValidation(doc);
    expect(report.canExport).toBe(false);
    const boundaryIssue = report.issues.find((i) => i.type === 'page_boundaries');
    expect(boundaryIssue).toBeDefined();
    expect(boundaryIssue?.severity).toBe('red');
    expect(boundaryIssue?.articleId).toBe('art-out-of-bounds');
  });

  it('should detect RED blocker for broken or error image URL', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.articles[0].imageUrl = 'broken';

    const report = runPreflightValidation(doc, { currentDate: new Date('2026-10-28T00:00:00Z') });
    const missingImgIssue = report.issues.find((i) => i.type === 'missing_images');
    expect(missingImgIssue).toBeDefined();
    expect(missingImgIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false);
  });

  it('should detect RED blocker for corrupted Devanagari unicode characters', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.articles[0].headline = 'खंडित वर्ण \uFFFD समाचार';

    const report = runPreflightValidation(doc);
    const unicodeIssue = report.issues.find((i) => i.type === 'hindi_rendering');
    expect(unicodeIssue).toBeDefined();
    expect(unicodeIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false);
  });

  it('should detect YELLOW warning for empty headline or empty body', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.articles[0].headline = '   '; // empty!

    const report = runPreflightValidation(doc);
    const emptyIssue = report.issues.find((i) => i.type === 'empty_blocks');
    expect(emptyIssue).toBeDefined();
    expect(emptyIssue?.severity).toBe('yellow');
  });

  it('should detect RED blocker for unexpected blank page', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        layoutMode: 'auto',
        articles: doc.articles,
      },
      {
        id: 'page-2',
        pageNumber: 2,
        sectionTitle: 'खाली पृष्ठ',
        layoutMode: 'auto',
        articles: [], // blank!
      },
    ];

    const report = runPreflightValidation(doc);
    const blankIssue = report.issues.find((i) => i.type === 'blank_pages');
    expect(blankIssue).toBeDefined();
    expect(blankIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false);
  });

  it('should detect YELLOW warning for outdated edition date', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.masthead.date = '15 अगस्त 2021'; // Outdated past year

    const report = runPreflightValidation(doc, { currentDate: new Date('2026-11-02T00:00:00Z') });
    const dateIssue = report.issues.find((i) => i.type === 'outdated_date');
    expect(dateIssue).toBeDefined();
    expect(dateIssue?.severity).toBe('yellow');
  });

  describe('Element-Level Text Overflow Safety (Fixed-Height & DOM)', () => {
    it('should PASS preflight for a 280px fixed-height article when content comfortably fits', () => {
      const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
      doc.pages = [
        {
          id: 'page-1',
          pageNumber: 1,
          sectionTitle: 'मुख्य पृष्ठ',
          layoutMode: 'auto',
          articles: [
            {
              ...doc.articles[0],
              id: 'art-fixed-short',
              headline: 'संक्षिप्त समाचार',
              heightMode: 'fixed',
              customHeight: 280,
              body: 'यह एक संक्षिप्त समाचार है जो 280 पिक्सल के कंटेनर में सरलता से समाहित हो जाता है। कोई ओवरफ्लो नहीं है।',
            },
          ],
        },
      ];

      const report = runPreflightValidation(doc, {
        currentDate: new Date('2026-10-28T00:00:00Z'),
      });
      const overflowIssues = report.issues.filter((i) => i.type === 'text_overflow');
      expect(overflowIssues).toHaveLength(0);
      expect(report.canExport).toBe(true);
    });

    it('should BLOCK export (RED blocker) when a 280px fixed-height article contains ~350 words overflowing the container', () => {
      const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
      const hindi350Words = new Array(350)
        .fill('डिजिटल युग में भारतीय पत्रकारिता और समाचार पत्रों का अभिनव स्वरूप निरंतर विकसित हो रहा है।')
        .join(' ');

      doc.pages = [
        {
          id: 'page-1',
          pageNumber: 1,
          sectionTitle: 'मुख्य पृष्ठ',
          layoutMode: 'auto',
          articles: [
            {
              ...doc.articles[0],
              id: 'art-fixed-overflow',
              headline: 'बजट 2026: भारतीय अर्थव्यवस्था और नवाचार पर विशेष रिपोर्ट',
              heightMode: 'fixed',
              customHeight: 280,
              body: hindi350Words,
            },
          ],
        },
      ];

      const report = runPreflightValidation(doc, {
        currentDate: new Date('2026-10-28T00:00:00Z'),
      });
      expect(report.canExport).toBe(false);
      expect(report.errorCount).toBeGreaterThan(0);

      const overflowIssue = report.issues.find(
        (i) => i.type === 'text_overflow' && i.articleId === 'art-fixed-overflow'
      );
      expect(overflowIssue).toBeDefined();
      expect(overflowIssue?.severity).toBe('red');
      expect(overflowIssue?.autoFixAvailable).toBe(true);
      expect(overflowIssue?.autoFixType).toBe('switch_to_auto_height');
      expect(overflowIssue?.explanation).toContain('280px');
    });

    it('should report multiple RED blockers when multiple fixed-height articles overflow', () => {
      const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
      const longBody = new Array(300).fill('महत्वपूर्ण संपादकीय विश्लेषण').join(' ');

      doc.pages = [
        {
          id: 'page-1',
          pageNumber: 1,
          sectionTitle: 'मुख्य पृष्ठ',
          layoutMode: 'auto',
          articles: [
            {
              ...doc.articles[0],
              id: 'art-1',
              headline: 'लेख 1',
              heightMode: 'fixed',
              customHeight: 200,
              body: longBody,
            },
            {
              ...doc.articles[0],
              id: 'art-2',
              headline: 'लेख 2',
              heightMode: 'fixed',
              customHeight: 180,
              body: longBody,
            },
          ],
        },
      ];

      const report = runPreflightValidation(doc);
      const blockers = report.issues.filter(
        (i) => i.type === 'text_overflow' && i.severity === 'red'
      );
      expect(blockers).toHaveLength(2);
      expect(report.canExport).toBe(false);
    });

    it('should flag RED blocker with exact overset pixels from live DOM measurements', () => {
      const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
      doc.pages = [
        {
          id: 'page-1',
          pageNumber: 1,
          sectionTitle: 'मुख्य पृष्ठ',
          layoutMode: 'auto',
          articles: [
            {
              ...doc.articles[0],
              id: 'art-dom-measured',
              headline: 'लाइव डीओएम परीक्षण',
              heightMode: 'fixed',
              customHeight: 280,
            },
          ],
        },
      ];

      const report = runPreflightValidation(doc, {
        currentDate: new Date('2026-10-28T00:00:00Z'),
        domMeasurements: [
          {
            articleId: 'art-dom-measured',
            isOverflown: true,
            scrollHeight: 376,
            clientHeight: 280,
          },
        ],
      });

      expect(report.canExport).toBe(false);
      const blocker = report.issues.find((i) => i.articleId === 'art-dom-measured');
      expect(blocker).toBeDefined();
      expect(blocker?.severity).toBe('red');
      expect(blocker?.explanation).toContain('+96px');
      expect(blocker?.autoFixType).toBe('switch_to_auto_height');
    });

    it('should resolve overflow and permit export when switched to auto-height', () => {
      const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
      const hindi350Words = new Array(350).fill('समाचार सामग्री').join(' ');

      const art = {
        ...doc.articles[0],
        id: 'art-fixed-overflow',
        headline: 'बजट 2026',
        heightMode: 'fixed' as const,
        customHeight: 280,
        body: hindi350Words,
      };

      doc.pages[0].articles = [art];

      // Initially blocked
      let report = runPreflightValidation(doc, { currentDate: new Date('2026-10-28T00:00:00Z') });
      expect(report.canExport).toBe(false);

      // Apply switch_to_auto_height fix
      art.heightMode = 'auto';
      art.customHeight = undefined;

      // Re-run validation without fixed constraint
      report = runPreflightValidation(doc, { currentDate: new Date('2026-10-28T00:00:00Z') });
      const overflowIssues = report.issues.filter((i) => i.type === 'text_overflow');
      expect(overflowIssues).toHaveLength(0);
      expect(report.canExport).toBe(true);
    });

    it('should detect when page capacity is full and prevent adding more content', () => {
      const doc = createNewspaperDocument({ presetId: 'compact-local', pageSize: 'a4' });
      const page = doc.pages[0];

      // Page with default seed articles is not full
      const initialStatus = isPageCapacityFull(page, doc);
      expect(initialStatus.isFull).toBe(false);

      // 1. Report full when live DOM overflow is detected
      const domOverflowStatus = isPageCapacityFull(page, doc, { isPageDomOverflown: true });
      expect(domOverflowStatus.isFull).toBe(true);
      expect(domOverflowStatus.reason).toBe('dom_overflow');

      // 2. Report full when word budget limit is exceeded on A4
      const heavyArticles = Array.from({ length: 6 }).map((_, i) => ({
        ...doc.articles[0],
        id: `story-heavy-${i}`,
        body: new Array(220).fill('महत्वपूर्ण विस्तृत समाचार विवरण').join(' '),
      }));
      const heavyPage = { ...page, articles: heavyArticles };

      const wordBudgetStatus = isPageCapacityFull(heavyPage, doc);
      expect(wordBudgetStatus.isFull).toBe(true);
      expect(wordBudgetStatus.reason).toBe('word_budget_exceeded');

      // 3. Report full when adding an additional article would exceed capacity
      const fullStatusWithNew = isPageCapacityFull(page, doc, {
        additionalArticle: {
          headline: 'अत्यधिक बड़ा समाचार',
          body: new Array(1200).fill('अतिरिक्त शब्द सीमा').join(' '),
        },
      });
      expect(fullStatusWithNew.isFull).toBe(true);
    });
  });
});
