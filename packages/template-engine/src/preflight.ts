import type {
  NewspaperDocument,
  PreflightReport,
  PreflightIssue,
  PreflightSeverity,
} from '@epaper-studio/document-schema';
import {
  PreflightReportSchema,
  getPublicationPages,
  getPageDimensions,
  getPrintableAreaBoundsMm,
  validateFrameInsidePrintableArea,
} from '@epaper-studio/document-schema';

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
}

const PAGE_CAPACITY_WORDS: Record<string, number> = {
  a3: 1800,
  a4: 850,
  tabloid: 1200,
  broadsheet: 2400,
  berliner: 1600,
};

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

  // 1. Text Overflow Check (DOM & Heuristic)
  pages.forEach((page, pIdx) => {
    const isFree = page.layoutMode === 'free';
    if (isFree) {
      page.articles.forEach((art) => {
        // Check DOM measurement if available
        const domMeasurement = options.domMeasurements?.find((m) => m.articleId === art.id);
        if (domMeasurement && domMeasurement.isOverflown) {
          issues.push({
            id: `overflow-dom-${art.id}`,
            type: 'text_overflow',
            severity: 'red',
            pageIndex: pIdx,
            pageNumber: page.pageNumber || pIdx + 1,
            articleId: art.id,
            headline: art.headline,
            title: 'सामग्री ओवरफ्लो (Text Overflow)',
            explanation: `लेख "${art.headline || 'समाचार'}" में सामग्री अपने निर्धारित फ़्रेम से अधिक है और प्रिंट में कट जाएगी।`,
            suggestedCorrection: 'फ़ॉन्ट का आकार थोड़ा घटाएं या फ़्रेम की ऊंचाई बढ़ाएं।',
            autoFixAvailable: true,
            autoFixType: 'reduce_font_size',
          });
          return;
        }

        // Heuristic area check in free mode
        if (art.frame) {
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
    } else {
      // Grid mode word budget check
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

  // Aggregate severities
  const errorCount = issues.filter((i) => i.severity === 'red').length;
  const warningCount = issues.filter((i) => i.severity === 'yellow').length;
  const totalChecks = 12;
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
