import { describe, it, expect } from 'vitest';
import type { NewspaperDocument, Article } from '@epaper-studio/document-schema';
import { allocateMultiPageDocumentOverflow } from './multiPageAllocator.js';
import { createNewspaperDocument } from './index.js';
import { runPreflightValidation } from './preflight.js';

describe('Automatic Multi-Page Overflow & Continuation Allocator', () => {
  const createMockStory = (id: string, headline: string, paraCount: number = 4): Article => {
    const paragraphs = Array.from({ length: paraCount }, (_, idx) => (
      `पैराग्राफ ${idx + 1}: राष्ट्र निर्माण में सतत विकास, बुनियादी ढांचे का विस्तार, डिजिटल नवाचार और सामाजिक समरसता एक महत्वपूर्ण भूमिका निभाते हैं। यह संवाद जनहित में जारी किया गया है।`
    ));
    return {
      id,
      headline,
      subheadline: 'विस्तृत राष्ट्रीय संपादकीय रिपोर्ट',
      body: paragraphs.join('\n\n'),
      priority: 'major',
      imagePlacement: 'none',
      orderIndex: 0,
    };
  };

  it('1. should leave a balanced single-page document intact when all stories fit within budget', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    // Only 2 short articles fit cleanly on Page 1
    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: [
        createMockStory('art-1', 'प्रथम मुख्य समाचार', 2),
        createMockStory('art-2', 'द्वितीय व्यापारिक समाचार', 2),
      ],
    };

    const result = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 4 });
    expect(result.createdPagesCount).toBe(0);
    expect(result.splitStoriesCount).toBe(0);
    expect(result.oversetStories.length).toBe(0);
    expect(result.document.pages?.length ?? 1).toBe(1);
  });

  it('2. should automatically allocate overflowing stories to Page 2 when Page 1 capacity is exceeded', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    // Place 30 major multi-paragraph stories on Page 1, heavily exceeding physical page height capacity
    const heavyStories: Article[] = Array.from({ length: 30 }, (_, idx) => (
      createMockStory(`heavy-art-${idx + 1}`, `राष्ट्रीय समाचार अंक ${idx + 1}`, 5)
    ));

    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: heavyStories,
    };

    const result = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 6 });
    expect(result.createdPagesCount).toBeGreaterThan(0);
    expect(result.document.pages!.length).toBeGreaterThan(1);

    // Verify Page 2 has articles
    const page2 = result.document.pages![1];
    expect(page2.articles.length).toBeGreaterThan(0);
  });

  it('3. should preserve 100% of paragraph text across origin and continuation fragments (Zero Content Loss)', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    const longArticle = createMockStory('split-test-story', 'महा-कथा: विज्ञान और भविष्य', 6);
    const fillerStories = Array.from({ length: 10 }, (_, idx) => (
      createMockStory(`filler-${idx + 1}`, `पूरक कथा ${idx + 1}`, 4)
    ));

    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: [...fillerStories, longArticle],
    };

    const result = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 4 });
    const allArticles = result.document.pages!.flatMap((p) => p.articles);

    const origin = allArticles.find((a) => a.id === 'split-test-story');
    if (origin && origin.continuation?.role === 'origin') {
      const continuation = allArticles.find((a) => a.continuation?.previousArticleId === origin.id);
      expect(continuation).toBeDefined();

      const combinedParas = [
        ...origin.body.split(/\n\n+/),
        ...continuation!.body.split(/\n\n+/),
      ];
      const originalParas = longArticle.body.split(/\n\n+/);

      expect(combinedParas.length).toBe(originalParas.length);
      expect(combinedParas).toEqual(originalParas);
    }
  });

  it('4. should protect locked advertisements and obstacles from being moved or split', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    const lockedAd: Article = {
      id: 'locked-front-page-ad',
      headline: 'विशेष वाणिज्यिक विज्ञापन',
      body: 'यह विज्ञापन प्रथम पृष्ठ पर आरक्षित स्थान पर ही मुद्रित होना अनिवार्य है।',
      priority: 'brief',
      locked: true,
      lockPosition: true,
      elementType: 'advertisement',
      imagePlacement: 'none',
      orderIndex: 0,
      frame: {
        x: 10,
        y: 350,
        w: 250,
        h: 50,
      },
    };

    const fillerStories = Array.from({ length: 12 }, (_, idx) => (
      createMockStory(`story-${idx + 1}`, `संवाद संख्या ${idx + 1}`, 4)
    ));

    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: [lockedAd, ...fillerStories],
    };

    const result = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 4 });
    const page1 = result.document.pages![0];
    const adOnPage1 = page1.articles.find((a) => a.id === 'locked-front-page-ad');

    // Locked ad must remain on Page 1 exactly as placed
    expect(adOnPage1).toBeDefined();
    expect(adOnPage1!.locked).toBe(true);
    expect(adOnPage1!.frame?.x).toBe(10);
    expect(adOnPage1!.frame?.y).toBe(350);
  });

  it('5. should enforce maxPages ceiling and report actionable overset diagnostics when capacity is reached', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    // Massive volume of stories: 60 stories with 6 paragraphs each
    const massiveVolume = Array.from({ length: 60 }, (_, idx) => (
      createMockStory(`massive-${idx + 1}`, `अति-विस्तृत समाचार ${idx + 1}`, 6)
    ));

    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: massiveVolume,
    };

    // Restrict strictly to 2 pages maximum
    const result = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 2, allowNewPages: true });
    expect(result.document.pages!.length).toBeLessThanOrEqual(2);
    expect(result.oversetStories.length).toBeGreaterThan(0);
    expect(result.oversetStories[0].reason).toBe('page_limit_reached');
  });

  it('6. should be idempotent and repeated-balancing safe without creating duplicate continuation fragments', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    const stories = Array.from({ length: 14 }, (_, idx) => (
      createMockStory(`idempotent-${idx + 1}`, `समाचार ${idx + 1}`, 4)
    ));

    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: stories,
    };

    // First allocation pass
    const pass1 = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 4 });
    const pagesCountPass1 = pass1.document.pages!.length;
    const articlesCountPass1 = pass1.document.pages!.flatMap((p) => p.articles).length;

    // Second allocation pass on the output of pass1
    const pass2 = allocateMultiPageDocumentOverflow(pass1.document, { maxPages: 4 });
    const pagesCountPass2 = pass2.document.pages!.length;
    const articlesCountPass2 = pass2.document.pages!.flatMap((p) => p.articles).length;

    expect(pagesCountPass2).toBe(pagesCountPass1);
    expect(articlesCountPass2).toBe(articlesCountPass1);
  });

  it('7. should pass preflight checks 14, 15, and 16 on the multi-page allocated document', () => {
    const baseDoc = createNewspaperDocument({ pageSize: 'tabloid', presetId: 'classic-hindi-broadsheet' });
    const stories = Array.from({ length: 12 }, (_, idx) => (
      createMockStory(`preflight-story-${idx + 1}`, `मुख्य संवाद ${idx + 1}`, 5)
    ));

    const testDoc: NewspaperDocument = {
      ...baseDoc,
      articles: stories,
    };

    const result = allocateMultiPageDocumentOverflow(testDoc, { maxPages: 4 });
    const preflight = runPreflightValidation(result.document);

    // Filter continuation-specific issues
    const continuationIssues = preflight.issues.filter((i) => (
      i.type === 'continuation_broken' ||
      i.type === 'continuation_text_mismatch' ||
      i.type === 'continuation_target_invalid'
    ));

    expect(continuationIssues.length).toBe(0);
  });
});
