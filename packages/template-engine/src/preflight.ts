import type {
  NewspaperDocument,
  PreflightReport,
  PreflightIssue,
  PreflightSeverity,
  Article,
  NewspaperPage,
} from '@epaper-studio/document-schema';
import {
  PreflightReportSchema,
  getPublicationPages,
  getPageDimensions,
  getPrintableAreaBoundsMm,
  validateFrameInsidePrintableArea,
} from '@epaper-studio/document-schema';
import { balanceNewspaperPage } from './balancer.js';
import { findNearestFreeSlot } from './freeLayout.js';

export interface PreflightOptions {
  /** Optional reference date (default: today's ISO string / current date) */
  currentDate?: Date;
  /** Allow checking DOM-rendered heights when available in browser */
  domMeasurements?: Array<{
    articleId: string;
    isOverflown: boolean;
    scrollHeight: number;
    clientHeight: number;
  }>;
  /** Real image resolutions if probed */
  imageResolutions?: Array<{
    articleId: string;
    effectiveDpi: number;
    naturalWidth: number;
    naturalHeight: number;
  }>;
  /** Verified loaded fonts in browser */
  availableFonts?: string[];
  /**
   * Diagnostic-only newspaper column balancing & overset check.
   * When enabled (opt-in), evaluates modular 2D balancing health and reports unplaced stories.
   * Strictly non-destructive (does NOT alter the input document or change editor layout).
   * Default: false (preserves 100% existing editor behavior).
   */
  checkColumnBalancing?: boolean;
}

export const PAGE_CAPACITY_WORDS: Record<string, number> = {
  a3: 1800,
  a4: 850,
  tabloid: 1200,
  broadsheet: 2400,
  berliner: 1600,
};

/**
 * Counts visual typographic character units.
 * In Devanagari script, combining vowel signs (matras), viramas, and diacritics
 * do not occupy horizontal advance width. Using raw character length inflates
 * visual line measure by 30-45%.
 */
export function countVisualTextUnits(text: string): number {
  if (!text) return 0;
  if (/[\u0900-\u097F]/.test(text)) {
    // Strip Devanagari combining marks (matras, viramas, nukta, anusvara)
    const baseText = text.replace(/[\u0901-\u0903\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963]/g, '');
    return Math.max(1, baseText.length);
  }
  return text.length;
}

/**
 * Estimates minimum vertical pixel height required for an article card's content,
 * including headline, subdeck, metadata, images, and body paragraphs formatted across inner columns.
 *
 * Typographic Calibration & Known Limitations:
 * - Calibrated within ±10% for core Devanagari editorial fonts (Mukta, Hind, Noto Serif Devanagari)
 *   at standard newspaper reading sizes (10pt–12pt) and line heights (1.45–1.55).
 * - Known Limitations (where estimator may diverge from Chromium DOM rendering):
 *   1. Poppins: Geometric sans with wide glyph advance widths (~0.70em vs 0.60em model), resulting
 *      in up to ~17% height underestimation.
 *   2. Gotu: Decorative display sans with wider letterforms, leading to ~17% underestimation.
 *   3. 9pt Typography: Sub-10pt micro-type leading scales non-linearly due to font-hinting (~12% error).
 *   4. Conjunct-Heavy Hindi Text: Words with stacked ligatures and virama clusters (e.g. क्ष, त्र, ज्ञ,
 *      दृष्टिकोण) alter character advance widths and hyphenation line breaks (~11.8% error).
 *   5. Justification Micro-Spacing: Inter-word expansion in justified text cannot be fully predicted statically.
 */
export function estimateArticleRequiredHeightPx(
  art: Article,
  pageColumnCount: number = 4,
  usableContentWidthPx?: number
): number {
  const span = Math.min(pageColumnCount, Math.max(1, art.columnSpan));

  // Determine inner columns count
  let innerCols = 1;
  const explicitCols = art.typography?.bodyColumnCount ?? art.bodyColumnCount;
  if (explicitCols && explicitCols >= 1) {
    innerCols = Math.min(6, Math.max(1, explicitCols));
  } else {
    const wordCount = (art.body || '').trim().split(/\s+/).filter(Boolean).length;
    if (span >= 2 && wordCount >= 35) {
      if (pageColumnCount === 4) {
        innerCols =
          span === 2 ? 2 : span === 3 ? (wordCount >= 70 ? 3 : 2) : wordCount >= 100 ? 4 : 3;
      } else if (span >= 4) {
        innerCols = 2;
      }
    }
  }

  // Base typography metrics (at 96 DPI screen equivalent: 1pt = 1.333px)
  const bodyFontSizePt = art.typography?.bodyFontSizePt || art.typography?.fontSizePt || 10;
  const bodyFontSizePx = bodyFontSizePt * 1.333;
  const bodyLineHeight = art.typography?.bodyLineHeight || 1.45;
  const lineSpacingPx = bodyFontSizePx * bodyLineHeight;

  // Approximate card width on page (default: 1380px for standard broadsheet)
  const usableWidth = usableContentWidthPx ?? 1380;
  const cardWidthPx = Math.max(120, (usableWidth / pageColumnCount) * span - 14);
  const colWidthPx = Math.max(80, (cardWidthPx - (innerCols - 1) * 18.67) / innerCols);

  const isHindi =
    /[\u0900-\u097F]/.test(art.body || '') || /[\u0900-\u097F]/.test(art.headline || '');

  // Characters per line in Devanagari (graphemes average ~0.60 * fontSize) vs Latin (~0.52 * fontSize)
  const charWidthPx = Math.max(4.5, bodyFontSizePx * (isHindi ? 0.6 : 0.52));
  const charsPerLine = Math.max(14, Math.floor(colWidthPx / charWidthPx));

  const paragraphs = (art.body || '').split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  let totalBodyLines = 0;
  for (const para of paragraphs) {
    const trimmed = para.trim();
    const units = countVisualTextUnits(trimmed);
    const lines = Math.ceil(units / charsPerLine) || 1;
    totalBodyLines += lines;
  }

  const linesPerCol = Math.ceil(totalBodyLines / innerCols);
  const paraSpacingPt = art.typography?.paragraphSpacingPt ?? 5;
  const paraSpacingPx = paraSpacingPt * 1.333;
  const bodyHeightPx =
    linesPerCol * lineSpacingPx + Math.max(0, paragraphs.length - 1) * paraSpacingPx;

  // Headline height
  const headlineFontSizePt = art.typography?.headlineFontSizePt || 20;
  const headlineLineHeight = 1.2;
  const headlineCharsPerLine = Math.max(
    10,
    Math.floor(cardWidthPx / (headlineFontSizePt * 1.333 * (isHindi ? 0.6 : 0.55)))
  );
  const hlUnits = countVisualTextUnits(art.headline || 'समाचार');
  const headlineLines = Math.ceil(hlUnits / headlineCharsPerLine) || 1;
  const headlineHeightPx = headlineLines * (headlineFontSizePt * 1.333 * headlineLineHeight) + 12;

  // Subheadline / Deck
  let deckHeightPx = 0;
  if (art.subheadline) {
    const deckFontSizePt = art.typography?.subheadlineFontSizePt || 11.5;
    const deckCharsPerLine = Math.max(
      15,
      Math.floor(cardWidthPx / (deckFontSizePt * 1.333 * (isHindi ? 0.56 : 0.52)))
    );
    const deckUnits = countVisualTextUnits(art.subheadline);
    const deckLines = Math.ceil(deckUnits / deckCharsPerLine) || 1;
    deckHeightPx = deckLines * (deckFontSizePt * 1.333 * 1.35) + 6;
  }

  // Meta (kicker, dateline, byline)
  let metaHeightPx = 0;
  if (art.kickerText) metaHeightPx += 18;
  if (art.byline || art.dateline) metaHeightPx += 20;

  // Image height
  let imageHeightPx = 0;
  if (art.imageUrl && art.imagePlacement !== 'none' && art.imagePlacement !== 'side') {
    imageHeightPx = art.customImageHeight || 160;
    if (art.imageCaption) {
      imageHeightPx += 18;
    }
  }

  // Container paddings and margins
  const cardPaddingPx = (art.paddingPx || 0) * 2;
  const totalNeededPx = Math.round(
    headlineHeightPx + deckHeightPx + metaHeightPx + imageHeightPx + bodyHeightPx + cardPaddingPx
  );
  return totalNeededPx;
}

/**
 * Executes the complete 12-point Preflight & Quality Assurance audit
 * on a NewspaperDocument prior to PDF export.
 */
export function runPreflightValidation(
  doc: NewspaperDocument,
  options: PreflightOptions = {}
): PreflightReport {
  const issues: PreflightIssue[] = [];
  const pages = getPublicationPages(doc);
  const now = options.currentDate || new Date();
  const currentYear = now.getFullYear();

  // 1. Element-Level and Page-Level Text Overflow Check
  pages.forEach((page, pIdx) => {
    const isFree = page.layoutMode === 'free';
    const pageCols = page.columnCount || doc.layout.columnCount || 4;

    page.articles.forEach((art) => {
      // 1A. Direct DOM measurement check (when available from live canvas)
      // Only applies if article is in free-layout or has constrained height
      const isConstrained =
        isFree ||
        art.heightMode === 'fixed' ||
        (art.customHeight !== undefined && art.customHeight > 0);
      const domMeasurement = options.domMeasurements?.find((m) => m.articleId === art.id);
      if (isConstrained && domMeasurement && domMeasurement.isOverflown) {
        const oversetPx = Math.max(0, domMeasurement.scrollHeight - domMeasurement.clientHeight);
        issues.push({
          id: `overflow-dom-${art.id}`,
          type: 'text_overflow',
          severity: 'red',
          pageIndex: pIdx,
          pageNumber: page.pageNumber || pIdx + 1,
          articleId: art.id,
          headline: art.headline,
          title: 'सामग्री ओवरफ्लो (Text Overflow)',
          explanation: `लेख "${art.headline || 'समाचार'}" में सामग्री अपने निर्धारित स्थान (${domMeasurement.clientHeight}px) से अधिक (${domMeasurement.scrollHeight}px) है और प्रिंट में कट जाएगी (+${oversetPx}px अतिरिक्त)।`,
          suggestedCorrection:
            'सामग्री संक्षिप्त करें, कंटेनर को ऑटो-हाइट में बदलें (Auto-fit करें), या फ़ॉन्ट का आकार समायोजित करें।',
          autoFixAvailable: art.heightMode === 'fixed' || isFree,
          autoFixType: art.heightMode === 'fixed' ? 'switch_to_auto_height' : 'reduce_font_size',
        });
        return;
      }

      // 1B. Element-level static check for fixed-height containers (when DOM measurements not provided)
      if (art.heightMode === 'fixed' && art.customHeight) {
        const estimatedHeight = estimateArticleRequiredHeightPx(art, pageCols);
        if (estimatedHeight > art.customHeight * 1.12) {
          const oversetPx = estimatedHeight - art.customHeight;
          issues.push({
            id: `overflow-fixed-${art.id}`,
            type: 'text_overflow',
            severity: 'red',
            pageIndex: pIdx,
            pageNumber: page.pageNumber || pIdx + 1,
            articleId: art.id,
            headline: art.headline,
            title: 'सामग्री ओवरफ्लो (Text Overflow)',
            explanation: `लेख "${art.headline || 'समाचार'}" की सामग्री निर्धारित ऊंचाई (${art.customHeight}px) से अधिक है (अनुमानित आवश्यक: ${estimatedHeight}px, +${oversetPx}px अतिरिक्त) और प्रिंट में कट जाएगी।`,
            suggestedCorrection:
              'कंटेनर को ऑटो-हाइट में बदलें (Auto-fit करें) या सामग्री संक्षिप्त करें।',
            autoFixAvailable: true,
            autoFixType: 'switch_to_auto_height',
          });
          return;
        }
      }

      // 1C. Free-layout frame area check (when DOM measurements not provided)
      if (isFree && art.frame) {
        const areaMm2 = art.frame.w * art.frame.h;
        const words = (art.body || '').trim().split(/\s+/).filter(Boolean).length;
        // ~18mm2 per word in standard 10pt text
        if (words * 18 > areaMm2 * 1.35) {
          issues.push({
            id: `overflow-area-${art.id}`,
            type: 'text_overflow',
            severity: 'red',
            pageIndex: pIdx,
            pageNumber: page.pageNumber || pIdx + 1,
            articleId: art.id,
            headline: art.headline,
            title: 'सामग्री क्षमता से अधिक (Content Exceeds Area)',
            explanation: `अनुमानित शब्द संख्या (${words}) फ़्रेम क्षेत्रफल (${Math.round(areaMm2)} mm²) के अनुसार अत्यधिक है।`,
            suggestedCorrection: 'लेख का फ़्रेम बड़ा करें या टेक्स्ट को संक्षिप्त करें।',
            autoFixAvailable: true,
            autoFixType: 'reduce_font_size',
          });
        }
      }
    });

    // 1D. Page word budget check (informational/advisory warning)
    const totalWords = page.articles.reduce(
      (sum, a) =>
        sum + (a.headline?.split(/\s+/).length || 0) + (a.body?.split(/\s+/).length || 0),
      0
    );
    const budget = PAGE_CAPACITY_WORDS[doc.metadata.pageSize] || 1500;
    if (totalWords > budget * 1.25) {
      issues.push({
        id: `overflow-grid-page-${pIdx}`,
        type: 'text_overflow',
        severity: 'yellow',
        pageIndex: pIdx,
        pageNumber: page.pageNumber || pIdx + 1,
        title: 'पृष्ठ शब्द सीमा चेतावनी (Page Word Budget)',
        explanation: `पृष्ठ ${pIdx + 1} पर कुल शब्द (${totalWords}) अनुशंसित सीमा (${budget}) से अधिक हैं।`,
        suggestedCorrection: 'कुछ समाचारों को अगले पृष्ठ पर स्थानांतरित करें।',
        autoFixAvailable: false,
      });
    }
  });

  // 2. Content Outside Page Boundaries (Printable Area Check)
  const bounds = getPrintableAreaBoundsMm(doc.metadata.pageSize, doc.metadata.orientation);
  pages.forEach((page, pIdx) => {
    if (page.layoutMode === 'free') {
      page.articles.forEach((art) => {
        if (art.frame) {
          const validity = validateFrameInsidePrintableArea(art.frame, bounds);
          if (!validity.valid) {
            issues.push({
              id: `boundary-${art.id}`,
              type: 'page_boundaries',
              severity: 'red',
              pageIndex: pIdx,
              pageNumber: page.pageNumber || pIdx + 1,
              articleId: art.id,
              headline: art.headline,
              title: 'पृष्ठ सीमा से बाहर फ़्रेम (Boundary Violation)',
              explanation: validity.reason || 'फ़्रेम प्रिंट सुरक्षित क्षेत्र से बाहर जा रहा है।',
              suggestedCorrection: 'फ़्रेम को पृष्ठ के अंदर ड्रैग करें।',
              autoFixAvailable: true,
              autoFixType: 'clamp_to_bounds',
            });
          }
        }
      });
    }
  });

  // 3. Missing / Broken Images Check
  pages.forEach((page, pIdx) => {
    page.articles.forEach((art) => {
      if (art.imageUrl && (art.imageUrl === 'broken' || art.imageUrl === 'error')) {
        issues.push({
          id: `broken-img-${art.id}`,
          type: 'missing_images',
          severity: 'red',
          pageIndex: pIdx,
          pageNumber: page.pageNumber || pIdx + 1,
          articleId: art.id,
          headline: art.headline,
          title: 'चित्र लोड विफल (Broken Image)',
          explanation: `लेख "${art.headline || 'समाचार'}" का चित्र लोड नहीं हो सका।`,
          suggestedCorrection: 'वैध चित्र अपलोड करें।',
          autoFixAvailable: true,
          autoFixType: 'remove_image_placement',
        });
      }
    });
  });

  // 4. Low-Resolution Image Check
  if (options.imageResolutions && options.imageResolutions.length > 0) {
    options.imageResolutions.forEach((res) => {
      if (res.effectiveDpi < 150) {
        issues.push({
          id: `low-dpi-${res.articleId}`,
          type: 'low_res_images',
          severity: 'yellow',
          articleId: res.articleId,
          title: 'कम रिज़ॉल्यूशन चित्र (Low DPI Image)',
          explanation: `चित्र का रिज़ॉल्यूशन (${Math.round(res.effectiveDpi)} DPI) प्रिंट गुणवत्ता (न्यूनतम 150 DPI) से कम है।`,
          suggestedCorrection: 'उच्च रिज़ॉल्यूशन वाला मूल चित्र अपलोड करें।',
          autoFixAvailable: false,
        });
      }
    });
  }

  // 5. Font Availability Check
  const requiredFonts = [
    doc.masthead.fontFamily,
    doc.layout.headlineFont,
    doc.layout.bodyFont,
  ].filter(Boolean);

  if (options.availableFonts && options.availableFonts.length > 0) {
    requiredFonts.forEach((font) => {
      const cleanName = font.replace(/['",]/g, '').trim().split(' ')[0] || '';
      const isAvailable = options.availableFonts!.some((avail) =>
        avail.toLowerCase().includes(cleanName.toLowerCase())
      );
      if (!isAvailable && cleanName && cleanName !== 'serif' && cleanName !== 'sans-serif') {
        issues.push({
          id: `font-missing-${cleanName}`,
          type: 'font_availability',
          severity: 'yellow',
          title: `फॉन्ट अनुपलब्ध: ${cleanName}`,
          explanation: `निर्दिष्ट फॉन्ट "${cleanName}" सिस्टम में लोड नहीं हो पाया है; फ़ालबैक फॉन्ट प्रयुक्त होगा।`,
          suggestedCorrection: 'मानक देवनागरी फॉन्ट (Noto Serif / Noto Sans) का चयन करें।',
          autoFixAvailable: false,
        });
      }
    });
  }

  // 6. Font Embedding
  // Verify self-hosted web font family compatibility
  const hasValidHeadlineFont = doc.layout.headlineFont && doc.layout.headlineFont.length > 0;
  if (!hasValidHeadlineFont) {
    issues.push({
      id: 'font-embed-headline',
      type: 'font_embedding',
      severity: 'red',
      title: 'अमान्य शीर्षक फॉन्ट',
      explanation: 'दस्तावेज़ में मुख्य शीर्षक का फॉन्ट निर्धारित नहीं है।',
      suggestedCorrection: "डिफ़ॉल्ट 'Noto Serif Devanagari' सेट करें।",
      autoFixAvailable: true,
      autoFixType: 'reset_default_fonts',
    });
  }

  // 7. Hindi Text Rendering & Unicode Integrity
  pages.forEach((page, pIdx) => {
    page.articles.forEach((art) => {
      const textToTest = `${art.headline || ''} ${art.body || ''}`;
      // Check for replacement character (U+FFFD)
      if (textToTest.includes('\uFFFD')) {
        issues.push({
          id: `unicode-replacement-${art.id}`,
          type: 'hindi_rendering',
          severity: 'red',
          pageIndex: pIdx,
          pageNumber: page.pageNumber || pIdx + 1,
          articleId: art.id,
          headline: art.headline,
          title: 'यूनिकोड ग्लिफ़ त्रुटि (Corrupted Glyphs)',
          explanation: `लेख "${art.headline || 'समाचार'}" में अमान्य या खंडित यूनिकोड वर्ण () पाए गए हैं।`,
          suggestedCorrection: 'टेक्स्ट को शुद्ध देवनागरी यूनिकोड में पुनः पेस्ट करें।',
          autoFixAvailable: false,
        });
      }
    });
  });

  // 8. Empty Blocks Check
  pages.forEach((page, pIdx) => {
    page.articles.forEach((art) => {
      const isHeadlineEmpty = !art.headline || art.headline.trim().length === 0;
      const isBodyEmpty = !art.body || art.body.trim().length === 0;

      if (isHeadlineEmpty || isBodyEmpty) {
        issues.push({
          id: `empty-block-${art.id}`,
          type: 'empty_blocks',
          severity: 'yellow',
          pageIndex: pIdx,
          pageNumber: page.pageNumber || pIdx + 1,
          articleId: art.id,
          headline: art.headline || '(खाली शीर्षक)',
          title: 'रिक्त समाचार ब्लॉक (Empty Block)',
          explanation: isHeadlineEmpty
            ? 'समाचार ब्लॉक का शीर्षक रिक्त है।'
            : 'समाचार ब्लॉक का विवरण (बॉडी) रिक्त है।',
          suggestedCorrection: 'ब्लॉक में सामग्री भरें अथवा अवांछित ब्लॉक को हटाएं।',
          autoFixAvailable: true,
          autoFixType: 'delete_empty_block',
        });
      }
    });
  });

  // 9. Page Dimensions Check
  const dims = getPageDimensions(doc.metadata.pageSize, doc.metadata.orientation);
  if (!dims || dims.widthPt <= 0 || dims.heightPt <= 0) {
    issues.push({
      id: 'invalid-dimensions',
      type: 'page_dimensions',
      severity: 'red',
      title: 'अमान्य पृष्ठ आकार (Invalid Page Dimensions)',
      explanation: 'पृष्ठ के भौतिक आयाम (चौड़ाई/ऊंचाई) सही रूप से परिभाषित नहीं हैं।',
      suggestedCorrection: 'दस्तावेज़ सेटिंग्स में मानक A3 या ब्रॉडशीट आकार चुनें।',
      autoFixAvailable: true,
      autoFixType: 'reset_a3_dimensions',
    });
  }

  // 10. Invalid Page Configuration
  pages.forEach((page, pIdx) => {
    if (page.columnCount && (page.columnCount < 2 || page.columnCount > 12)) {
      issues.push({
        id: `invalid-columns-${pIdx}`,
        type: 'invalid_page_config',
        severity: 'red',
        pageIndex: pIdx,
        pageNumber: page.pageNumber || pIdx + 1,
        title: 'अमान्य कॉलम संख्या',
        explanation: `पृष्ठ ${pIdx + 1} पर कॉलम संख्या (${page.columnCount}) मान्य सीमा (2 से 12) से बाहर है।`,
        suggestedCorrection: 'कॉलम संख्या 4 या 8 पर रीसेट करें।',
        autoFixAvailable: true,
        autoFixType: 'reset_column_count',
      });
    }
  });

  // 11. Outdated Edition Date Check
  const mastheadDate = doc.masthead.date || '';
  if (mastheadDate) {
    // Check if the date string contains a previous year
    const pastYearMatches = mastheadDate.match(/\b(19\d\d|20[0-1]\d|202[0-5])\b/);
    if (pastYearMatches && Number(pastYearMatches[0]) < currentYear) {
      issues.push({
        id: 'outdated-date',
        type: 'outdated_date',
        severity: 'yellow',
        title: 'पुरानी संस्करण तिथि (Outdated Edition Date)',
        explanation: `मास्टहेड में उल्लिखित तिथि "${mastheadDate}" पिछले वर्ष (${pastYearMatches[0]}) की प्रतीत होती है।`,
        suggestedCorrection: 'मास्टहेड में आज की तिथि दर्ज करें।',
        autoFixAvailable: true,
        autoFixType: 'set_today_date',
      });
    }
  }

  // 12. Blank Pages Check
  pages.forEach((page, pIdx) => {
    if (!page.articles || page.articles.length === 0) {
      issues.push({
        id: `blank-page-${pIdx}`,
        type: 'blank_pages',
        severity: 'red',
        pageIndex: pIdx,
        pageNumber: page.pageNumber || pIdx + 1,
        title: 'पूर्णतः रिक्त पृष्ठ (Blank Page)',
        explanation: `पृष्ठ ${pIdx + 1} पर कोई भी समाचार या विज्ञापन ब्लॉक नहीं है।`,
        suggestedCorrection: 'इस पृष्ठ पर ब्लॉक जोड़ें अथवा खाली पृष्ठ को हटाएं।',
        autoFixAvailable: true,
        autoFixType: 'remove_blank_page',
      });
    }
  });

  // 13. Column Balancing & Overset Diagnostics (Opt-in Check)
  if (options.checkColumnBalancing) {
    pages.forEach((page, pIdx) => {
      // Diagnostic balancing pass (purely read-only; does not modify doc or page)
      const balanceResult = balanceNewspaperPage(page, doc);
      const unplaced = balanceResult.report.unplacedArticles;

      // Report unplaced articles as overset errors
      for (const art of unplaced) {
        issues.push({
          id: `overset-unplaced-${art.id}`,
          type: 'layout_overset',
          severity: 'red',
          pageIndex: pIdx,
          pageNumber: page.pageNumber || pIdx + 1,
          articleId: art.id,
          headline: art.headline,
          title: 'सामग्री लेआउट में समाहित नहीं (Unplaced / Overset Story)',
          explanation: `लेख "${art.headline || 'समाचार'}" पृष्ठ के उपलब्ध मुद्रण क्षेत्र में समाहित नहीं हो सका और ओवरसेट हो गया है। पृष्ठ की ग्रिड क्षमता समाप्त हो चुकी है।`,
          suggestedCorrection:
            'लेख को अगले पृष्ठ पर स्थानांतरित करें, सामग्री संक्षिप्त करें, या विज्ञापन/अन्य आकारों को समायोजित करें।',
          autoFixAvailable: false,
        });
      }

      // Check for large accidental layout gaps
      const accidentalGaps = balanceResult.report.voidRegions.filter(
        (v) => v.classification === 'accidental_gap' && v.heightMm >= 35
      );
      for (let gIdx = 0; gIdx < accidentalGaps.length; gIdx++) {
        const gap = accidentalGaps[gIdx]!;
        issues.push({
          id: `layout-gap-${pIdx}-${gIdx}`,
          type: 'layout_overset',
          severity: 'yellow',
          pageIndex: pIdx,
          pageNumber: page.pageNumber || pIdx + 1,
          title: 'असंतुलित लेआउट रिक्त स्थान (Accidental Gap)',
          explanation: `पृष्ठ ${page.pageNumber || pIdx + 1} पर कॉलम ${gap.columnStart + 1} में ${Math.round(gap.widthMm)}mm × ${Math.round(gap.heightMm)}mm का अप्रयुक्त रिक्त स्थान छूट गया है।`,
          suggestedCorrection:
            'कॉलम संतुलन इंजन से लेआउट पुनः व्यवस्थित करें अथवा एक संक्षिप्त समाचार जोड़ें।',
          autoFixAvailable: false,
        });
      }
    });
  }

  // 14. Multi-Page Story Continuation Integrity Checks
  const allArticlesWithPages: Array<{ article: Article; pageIndex: number; pageNumber: number }> = [];
  pages.forEach((p, pIdx) => {
    p.articles.forEach((art) => {
      allArticlesWithPages.push({ article: art, pageIndex: pIdx, pageNumber: p.pageNumber || pIdx + 1 });
    });
  });

  const articleMap = new Map<string, { article: Article; pageIndex: number; pageNumber: number }>();
  allArticlesWithPages.forEach((entry) => {
    articleMap.set(entry.article.id, entry);
  });

  allArticlesWithPages.forEach(({ article, pageIndex, pageNumber }) => {
    if (article.continuation) {
      const c = article.continuation;
      if (c.role === 'origin' && c.nextArticleId) {
        const nextEntry = articleMap.get(c.nextArticleId);
        if (!nextEntry) {
          issues.push({
            id: `continuation-orphan-${article.id}`,
            type: 'continuation_broken',
            severity: 'red',
            pageIndex,
            pageNumber,
            articleId: article.id,
            headline: article.headline,
            title: 'कथा सातत्य विच्छेद (Orphan Continuation)',
            explanation: `लेख "${article.headline || 'समाचार'}" का अगला भाग (Continuation) दस्तावेज़ में नहीं मिला। पाठक अधूरी खबर पढ़ेंगे।`,
            suggestedCorrection: 'लेख का अगला भाग अंदर के पृष्ठ पर जोड़ें अथवा इस लेख से सातत्य संदर्भ हटाएं।',
            autoFixAvailable: false,
          });
        } else if (c.targetPageNumber && typeof c.targetPageNumber === 'number' && c.targetPageNumber !== nextEntry.pageNumber) {
          issues.push({
            id: `continuation-target-mismatch-${article.id}`,
            type: 'continuation_target_invalid',
            severity: 'yellow',
            pageIndex,
            pageNumber,
            articleId: article.id,
            headline: article.headline,
            title: 'पृष्ठ संदर्भ असंगति (Target Page Mismatch)',
            explanation: `लेख "${article.headline}" का जम्प संदर्भ पृष्ठ ${c.targetPageNumber} दर्शाता है, किंतु अगला भाग पृष्ठ ${nextEntry.pageNumber} पर स्थित है।`,
            suggestedCorrection: `जम्प लेबल को पृष्ठ ${nextEntry.pageNumber} के अनुसार अद्यतन करें।`,
            autoFixAvailable: false,
          });
        }
      } else if (c.role === 'continuation' && c.previousArticleId) {
        const prevEntry = articleMap.get(c.previousArticleId);
        if (!prevEntry) {
          issues.push({
            id: `continuation-parent-missing-${article.id}`,
            type: 'continuation_broken',
            severity: 'red',
            pageIndex,
            pageNumber,
            articleId: article.id,
            headline: article.headline,
            title: 'मूल कथा अनुपलब्ध (Missing Parent Story)',
            explanation: `अंदर के पृष्ठ पर जारी यह लेख "${article.headline || 'समाचार'}" अपने मूल समाचार से जुड़ा हुआ नहीं है।`,
            suggestedCorrection: 'मूल समाचार को प्रथम पृष्ठ से जोड़ें।',
            autoFixAvailable: false,
          });
        }
      }
    }
  });

  // Aggregate severities
  const errorCount = issues.filter((i) => i.severity === 'red').length;
  const warningCount = issues.filter((i) => i.severity === 'yellow').length;
  const totalChecks = options.checkColumnBalancing ? 13 : 12;
  const passedChecks = Math.max(
    0,
    totalChecks - (errorCount > 0 ? 1 : 0) - (warningCount > 0 ? 1 : 0)
  );

  let overallStatus: PreflightSeverity = 'green';
  if (errorCount > 0) {
    overallStatus = 'red';
  } else if (warningCount > 0) {
    overallStatus = 'yellow';
  }

  const report: PreflightReport = {
    timestamp: now.toISOString(),
    overallStatus,
    totalChecks,
    passedChecks,
    warningCount,
    errorCount,
    issues,
    canExport: errorCount === 0,
  };

  return PreflightReportSchema.parse(report);
}

export interface PageCapacityStatus {
  isFull: boolean;
  reason?:
    | 'dom_overflow'
    | 'element_overflow'
    | 'free_slot_exhausted'
    | 'word_budget_exceeded'
    | 'max_articles_exceeded'
    | 'grid_area_exhausted';
  message: string;
  wordCount: number;
  wordBudget: number;
  articleCount: number;
  maxArticles: number;
}

/**
 * Validates whether a newspaper page has reached its maximum physical and typographic capacity,
 * preventing accidental content overflow and clipping.
 */
export function isPageCapacityFull(
  page: NewspaperPage,
  doc: NewspaperDocument,
  options: {
    domMeasurements?: Array<{
      articleId: string;
      isOverflown: boolean;
      scrollHeight: number;
      clientHeight: number;
    }>;
    isPageDomOverflown?: boolean;
    additionalArticle?: Partial<Article>;
  } = {}
): PageCapacityStatus {
  const pageSize = doc.metadata.pageSize || 'broadsheet';
  const orientation = doc.metadata.orientation || 'portrait';
  const wordBudget = PAGE_CAPACITY_WORDS[pageSize] || 1500;
  const maxArticles = pageSize === 'a4' ? 6 : pageSize === 'tabloid' ? 8 : 12;

  // 1. Check DOM-level overflow if reported by the live canvas
  if (options.isPageDomOverflown) {
    return {
      isFull: true,
      reason: 'dom_overflow',
      message: 'पृष्ठ की सामग्री प्रिंट सुरक्षित क्षेत्र से बाहर जा रही है।',
      wordCount: 0,
      wordBudget,
      articleCount: page.articles.length,
      maxArticles,
    };
  }

  // 2. Check if any individual article on this page has visual DOM overflow
  if (options.domMeasurements && options.domMeasurements.length > 0) {
    const pageArticleIds = new Set(page.articles.map((a) => a.id));
    const hasOverflownArticle = options.domMeasurements.some(
      (m) => pageArticleIds.has(m.articleId) && m.isOverflown
    );
    if (hasOverflownArticle) {
      return {
        isFull: true,
        reason: 'element_overflow',
        message: 'इस पृष्ठ पर खबरों में टेक्स्ट ओवरफ्लो है और जगह समाप्त हो चुकी है।',
        wordCount: 0,
        wordBudget,
        articleCount: page.articles.length,
        maxArticles,
      };
    }
  }

  // 3. Free Layout: check slot availability
  if (page.layoutMode === 'free') {
    const blockW = options.additionalArticle?.frame?.w ?? 90;
    const blockH = options.additionalArticle?.frame?.h ?? 60;
    const slot = findNearestFreeSlot(page, doc, blockW, blockH, 4);
    if (!slot.found || !slot.slot) {
      return {
        isFull: true,
        reason: 'free_slot_exhausted',
        message: 'इस पृष्ठ पर नए ब्लॉक के लिए पर्याप्त खाली जगह नहीं बची है।',
        wordCount: 0,
        wordBudget,
        articleCount: page.articles.length,
        maxArticles,
      };
    }
  }

  // 4. Calculate total words with or without additional article
  const articlesToEvaluate = options.additionalArticle
    ? [...page.articles, options.additionalArticle as Article]
    : page.articles;

  const totalWords = articlesToEvaluate.reduce(
    (sum, a) =>
      sum +
      (a.headline ? a.headline.trim().split(/\s+/).filter(Boolean).length : 0) +
      (a.body ? a.body.trim().split(/\s+/).filter(Boolean).length : 0),
    0
  );

  // If word count exceeds 115% of page capacity budget
  if (totalWords > wordBudget * 1.15) {
    return {
      isFull: true,
      reason: 'word_budget_exceeded',
      message: `पृष्ठ शब्द सीमा (${totalWords}/${wordBudget} शब्द) पूरी हो चुकी है।`,
      wordCount: totalWords,
      wordBudget,
      articleCount: articlesToEvaluate.length,
      maxArticles,
    };
  }

  // 5. Maximum practical article count per page
  if (articlesToEvaluate.length > maxArticles) {
    return {
      isFull: true,
      reason: 'max_articles_exceeded',
      message: `इस पृष्ठ पर अधिकतम समाचार संख्या (${maxArticles}) पूरी हो चुकी है।`,
      wordCount: totalWords,
      wordBudget,
      articleCount: articlesToEvaluate.length,
      maxArticles,
    };
  }

  // 6. Grid Area Volumetric Check (Auto Layout)
  if (page.layoutMode !== 'free') {
    const pageCols = page.columnCount || doc.layout.columnCount || 4;
    const isFirstPage = (page.pageNumber ?? 1) === 1;
    const dims = getPageDimensions(pageSize, orientation, doc.metadata.dimensions);
    const usableHeightPx = (dims.heightPt * 96) / 72;
    const headerHeightPx = isFirstPage ? 160 : 40;
    const footerHeightPx = 35;
    const availableColumnHeightPx = Math.max(100, usableHeightPx - headerHeightPx - footerHeightPx);
    const totalGridCapacityPx = pageCols * availableColumnHeightPx;

    const totalOccupiedPx = articlesToEvaluate.reduce((sum, art) => {
      const span = Math.min(pageCols, Math.max(1, art.columnSpan || 1));
      const estHeight = estimateArticleRequiredHeightPx(art, pageCols);
      return sum + span * estHeight;
    }, 0);

    if (totalOccupiedPx > totalGridCapacityPx * 1.08) {
      return {
        isFull: true,
        reason: 'grid_area_exhausted',
        message: 'इस पृष्ठ का ग्रिड क्षेत्र पूरी तरह भर चुका है।',
        wordCount: totalWords,
        wordBudget,
        articleCount: articlesToEvaluate.length,
        maxArticles,
      };
    }
  }

  return {
    isFull: false,
    message: 'पृष्ठ पर सामग्री जोड़ने के लिए स्थान उपलब्ध है।',
    wordCount: totalWords,
    wordBudget,
    articleCount: articlesToEvaluate.length,
    maxArticles,
  };
}
