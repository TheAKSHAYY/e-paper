import { describe, it, expect } from 'vitest';
import type { Article } from '@epaper-studio/document-schema';
import { segmentArticleContent } from './segmenter.js';
import { runPreflightValidation } from './preflight.js';
import { createNewspaperDocument } from './index.js';

describe('Phase 2B Multi-Page Article Continuation Engine', () => {
  const sampleHindiArticle: Article = {
    id: 'hindi-lead-01',
    headline: 'राष्ट्र निर्माण की नई दिशा: विज्ञान, नवाचार और आत्मनिर्भरता',
    subheadline: 'प्रधानमंत्री ने अंतरराष्ट्रीय शिखर सम्मेलन में आर्थिक सुधारों पर दिया बल',
    byline: 'विशेष संवाददाता • नई दिल्ली',
    dateline: 'नई दिल्ली',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
    imagePlacement: 'top',
    imageCaption: 'शिखर सम्मेलन का उद्घाटन सत्र',
    body: [
      'प्रधानमंत्री ने नई दिल्ली में आयोजित अंतरराष्ट्रीय शिखर सम्मेलन का उद्घाटन करते हुए कहा कि भारत आर्थिक विकास और तकनीकी नवाचार के क्षेत्र में वैश्विक स्तर पर अग्रणी भूमिका निभा रहा है।',
      'सम्मेलन में भाग ले रहे 68 देशों के प्रतिनिधियों ने सतत विकास और स्वच्छ ऊर्जा गलियारे पर सहमति व्यक्त की। इस ऐतिहासिक समझौते से ऊर्जा क्षेत्र में अभूतपूर्व निवेश की संभावना है।',
      'ग्रामीण भारत में डिजिटल साक्षरता और उद्यमिता को बढ़ावा देने के लिए एक विशेष कोष की घोषणा की गई, जिससे दस लाख नए सूक्ष्म उद्यम लाभान्वित होंगे।',
      'शिक्षा और अनुसंधान संस्थानों के बीच समन्वय स्थापित करने हेतु राष्ट्रीय शोध संस्थान की स्थापना की रूपरेखा तैयार की गई है, जो युवा वैज्ञानिकों को आवश्यक संसाधन उपलब्ध कराएगा।',
      'समारोह के समापन पर वित्त मंत्री ने आश्वस्त किया कि सभी सुधारों का सीधा लाभ समाज के अंतिम व्यक्ति तक पहुँचाने के लिए सरकार कृतसंकल्प है।',
    ].join('\n\n'),
    priority: 'lead',
    columnSpan: 4,
  };

  it('1. Segments multi-paragraph article into origin and continuation fragments', () => {
    // Allocate 130mm (out of ~187mm total story height) to force a 2-paragraph jump
    const result = segmentArticleContent(sampleHindiArticle, 130, 90, {
      originPageNumber: 1,
      targetPageNumber: 2,
    });

    expect(result).not.toBeNull();
    const { originArticle, continuationArticle, splitParagraphIndex, totalParagraphs } = result!;

    expect(totalParagraphs).toBe(5);
    expect(splitParagraphIndex).toBeGreaterThanOrEqual(2);
    expect(splitParagraphIndex).toBeLessThan(5);

    // Origin checks
    expect(originArticle.continuation?.role).toBe('origin');
    expect(originArticle.continuation?.rootArticleId).toBe('hindi-lead-01');
    expect(originArticle.continuation?.nextArticleId).toBe('hindi-lead-01-cont-1');
    expect(originArticle.continuation?.jumpToLabel).toContain('पृष्ठ 2 पर जारी');
    expect(originArticle.imageUrl).toBe(sampleHindiArticle.imageUrl);
    expect(originArticle.byline).toBe(sampleHindiArticle.byline);

    // Continuation checks
    expect(continuationArticle.id).toBe('hindi-lead-01-cont-1');
    expect(continuationArticle.continuation?.role).toBe('continuation');
    expect(continuationArticle.continuation?.previousArticleId).toBe('hindi-lead-01');
    expect(continuationArticle.continuation?.jumpFromLabel).toContain('पृष्ठ 1 से आगे');
    expect(continuationArticle.imageUrl).toBeUndefined();
    expect(continuationArticle.byline).toBe('');
    expect(continuationArticle.subheadline).toBe('');
  });

  it('2. Preserves 100% of body text with zero content loss (Parity Invariant)', () => {
    const result = segmentArticleContent(sampleHindiArticle, 135, 90, {
      originPageNumber: 1,
      targetPageNumber: 3,
    });
    expect(result).not.toBeNull();
    const { originArticle, continuationArticle } = result!;

    const combinedBody = `${originArticle.body}\n\n${continuationArticle.body}`;
    expect(combinedBody).toBe(sampleHindiArticle.body);
  });

  it('3. Protects Devanagari Unicode graphemes (no severed viramas or conjuncts)', () => {
    const result = segmentArticleContent(sampleHindiArticle, 125, 90);
    expect(result).not.toBeNull();
    const { originArticle, continuationArticle } = result!;

    // Assert both fragments end and start cleanly with standard words
    expect(originArticle.body).toMatch(/।$/); // Ends cleanly with a Hindi purna viram
    expect(continuationArticle.body.length).toBeGreaterThan(20);
    expect(continuationArticle.body).not.toMatch(/^[\u093E-\u094F]/); // Never starts with a floating matra
  });

  it('4. Refuses to split single-paragraph stories or briefs (Safety Rule)', () => {
    const singleParaArticle: Article = {
      id: 'brief-01',
      headline: 'संक्षिप्त समाचार',
      body: 'यह केवल एक पैराग्राफ का संक्षिप्त समाचार है जो विभाजित नहीं होना चाहिए।',
      priority: 'brief',
      columnSpan: 1,
    };

    const result = segmentArticleContent(singleParaArticle, 30, 45);
    expect(result).toBeNull();
  });

  it('5. Preflight Check: Validates unbroken continuation chains', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const split = segmentArticleContent(sampleHindiArticle, 130, 90, {
      originPageNumber: 1,
      targetPageNumber: 2,
    })!;

    // Page 1 gets origin, Page 2 gets continuation
    doc.pages = [
      {
        id: 'p-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        articles: [split.originArticle],
      },
      {
        id: 'p-2',
        pageNumber: 2,
        sectionTitle: 'अंदर के पृष्ठ',
        articles: [split.continuationArticle],
      },
    ];

    const report = runPreflightValidation(doc);
    const brokenIssues = report.issues.filter(
      (i) => i.type === 'continuation_broken' || i.type === 'continuation_target_invalid'
    );
    expect(brokenIssues.length).toBe(0);
  });

  it('6. Preflight Check: Detects orphan continuation when child fragment is missing', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const split = segmentArticleContent(sampleHindiArticle, 130, 90, {
      originPageNumber: 1,
      targetPageNumber: 2,
    })!;

    // Page 1 has origin, but Page 2 is missing the continuation fragment!
    doc.pages = [
      {
        id: 'p-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        articles: [split.originArticle],
      },
      {
        id: 'p-2',
        pageNumber: 2,
        sectionTitle: 'अंदर के पृष्ठ',
        articles: [], // Missing child!
      },
    ];

    const report = runPreflightValidation(doc);
    const orphanIssue = report.issues.find((i) => i.type === 'continuation_broken');
    expect(orphanIssue).toBeDefined();
    expect(orphanIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false); // Blocks PDF export on content loss
  });

  it('7. Preflight Check: Warns when target page number diverges from actual layout', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const split = segmentArticleContent(sampleHindiArticle, 130, 90, {
      originPageNumber: 1,
      targetPageNumber: 4, // Labeled Page 4...
    })!;

    // ...but placed on Page 2!
    doc.pages = [
      {
        id: 'p-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        articles: [split.originArticle],
      },
      {
        id: 'p-2',
        pageNumber: 2, // Actual page is 2!
        sectionTitle: 'अंदर के पृष्ठ',
        articles: [split.continuationArticle],
      },
    ];

    const report = runPreflightValidation(doc);
    const mismatchIssue = report.issues.find((i) => i.type === 'continuation_target_invalid');
    expect(mismatchIssue).toBeDefined();
    expect(mismatchIssue?.severity).toBe('yellow');
  });
});
