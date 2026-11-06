import type { Article, ArticleContinuation } from '@epaper-studio/document-schema';

export interface SegmentationOptions {
  targetPageNumber?: number;
  originPageNumber?: number;
  defaultJumpToLabel?: string;
  defaultJumpFromLabel?: string;
  jumpHeadline?: string;
}

export interface SegmentedStoryResult {
  originArticle: Article;
  continuationArticle: Article;
  splitParagraphIndex: number;
  totalParagraphs: number;
}

/**
 * Checks if a string contains predominantly Hindi / Devanagari script.
 */
function isDevanagariText(text: string): boolean {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Estimates the pixel height of a given paragraph text when formatted within a given column width.
 */
function estimateParagraphPixelHeight(
  paragraph: string,
  columnWidthPx: number,
  fontSizePt: number = 10,
  lineHeight: number = 1.45
): number {
  if (!paragraph.trim()) return 0;
  const isHindi = isDevanagariText(paragraph);
  const factor = isHindi ? 0.58 : 0.52;
  const charsPerLine = Math.max(15, Math.floor(columnWidthPx / (fontSizePt * 1.333 * factor)));
  const lines = Math.ceil(paragraph.length / charsPerLine) || 1;
  return lines * (fontSizePt * 1.333 * lineHeight) + 6; // 6px inter-paragraph spacing
}

/**
 * Deterministically segments an article that exceeds its available origin frame height,
 * producing an Origin Article (Page A) and a Continuation Article (Page B+).
 *
 * Safety & Invariant Guarantees:
 * 1. Zero Content Loss: Concat(origin.paragraphs, continuation.paragraphs) === canonical.paragraphs.
 * 2. Unicode Grapheme Safety: Splitting occurs strictly at clean paragraph boundaries or sentence terminators.
 * 3. Orphan / Widow Protection: At least 2 paragraphs on Origin, at least 1 paragraph on Continuation.
 * 4. Image Anchor Priority: Images, captions, and credits remain on the Origin article.
 */
export function segmentArticleContent(
  article: Article,
  availableOriginHeightMm: number,
  columnWidthMm: number,
  options: SegmentationOptions = {}
): SegmentedStoryResult | null {
  // If continuation is explicitly disabled or article is a brief, do not split
  if (article.continuation?.allowContinuation === false) return null;
  if (article.priority === 'brief') return null;

  const isHindi = isDevanagariText(article.headline) || isDevanagariText(article.body);
  const targetPage = options.targetPageNumber ?? 2;
  const originPage = options.originPageNumber ?? 1;

  // Split strictly by paragraph breaks
  const rawParagraphs = article.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (rawParagraphs.length < 2) {
    // Single-paragraph story: cannot cleanly split across pages without mid-paragraph truncation
    return null;
  }

  const columnWidthPx = Math.round((columnWidthMm * 96) / 25.4);
  const availableOriginHeightPx = Math.round((availableOriginHeightMm * 96) / 25.4);

  // Calculate fixed header/image/dateline overhead on Origin
  let fixedOverheadPx = 20; // Container padding & border
  if (article.imageUrl && article.imagePlacement !== 'none') {
    fixedOverheadPx += (article.customImageHeight || 160) + (article.imageCaption ? 18 : 0);
  }
  // Headline estimate
  const isLead = article.priority === 'lead';
  fixedOverheadPx += isLead ? 65 : 45;
  if (article.subheadline) fixedOverheadPx += 30;
  if (article.byline) fixedOverheadPx += 18;

  // Reserve space for the Jump-To footer line (~24px)
  const availableBodyPx = availableOriginHeightPx - fixedOverheadPx - 24;
  if (availableBodyPx < 30) {
    // Not enough space on Page 1 even for minimal content
    return null;
  }

  // Determine how many paragraphs fit on Origin
  let accumulatedPx = 0;
  let splitIndex = 0;

  for (let i = 0; i < rawParagraphs.length; i++) {
    const pHeight = estimateParagraphPixelHeight(
      rawParagraphs[i]!,
      columnWidthPx,
      article.customFontSizePt || 10
    );
    if (accumulatedPx + pHeight <= availableBodyPx) {
      accumulatedPx += pHeight;
      splitIndex = i + 1;
    } else {
      break;
    }
  }

  // Enforce Orphan / Widow safety:
  // Origin must have at least 2 paragraphs; Continuation must have at least 1 paragraph
  if (splitIndex < 2) {
    splitIndex = 2; // Guarantee at least 2 paragraphs on origin
  }
  if (splitIndex >= rawParagraphs.length) {
    // If all fit or only 1 remains, cannot split safely
    if (rawParagraphs.length <= 2) return null;
    splitIndex = rawParagraphs.length - 1; // Leave at least 1 for continuation
  }

  const originParagraphs = rawParagraphs.slice(0, splitIndex);
  const continuationParagraphs = rawParagraphs.slice(splitIndex);

  const rootId = article.continuation?.rootArticleId || article.id;
  const continuationId = `${article.id}-cont-${(article.continuation?.continuationIndex ?? 0) + 1}`;

  // Default localized labels
  const jumpToText =
    options.defaultJumpToLabel ||
    (isHindi ? `(शेष पृष्ठ ${targetPage} पर जारी...)` : `(Continued on Page ${targetPage}...)`);
  const jumpFromText =
    options.defaultJumpFromLabel ||
    (isHindi ? `(पृष्ठ ${originPage} से आगे...)` : `(Continued from Page ${originPage}...)`);
  const jumpHead =
    options.jumpHeadline ||
    article.continuation?.jumpHeadline ||
    (isHindi ? `${article.headline} (पृष्ठ ${originPage} से आगे)` : `${article.headline} (Cont.)`);

  // Origin Article
  const originContinuation: ArticleContinuation = {
    role: 'origin',
    rootArticleId: rootId,
    continuationIndex: 0,
    nextArticleId: continuationId,
    targetPageNumber: targetPage,
    jumpToLabel: jumpToText,
    paragraphRange: [0, splitIndex],
    allowContinuation: true,
  };

  const originArticle: Article = {
    ...article,
    body: originParagraphs.join('\n\n'),
    continuation: originContinuation,
  };

  // Continuation Article (inside page)
  const contContinuation: ArticleContinuation = {
    role: 'continuation',
    rootArticleId: rootId,
    continuationIndex: (article.continuation?.continuationIndex ?? 0) + 1,
    previousArticleId: article.id,
    jumpFromLabel: jumpFromText,
    jumpHeadline: jumpHead,
    paragraphRange: [splitIndex, rawParagraphs.length],
    allowContinuation: true,
  };

  const continuationArticle: Article = {
    ...article,
    id: continuationId,
    headline: jumpHead,
    subheadline: '', // Suppress subdeck on continuation
    byline: '', // Suppress byline on continuation
    dateline: '', // Suppress dateline on continuation
    imageUrl: undefined, // Primary image stays on origin
    imagePlacement: 'none',
    imageCaption: '',
    imageCredit: undefined,
    body: continuationParagraphs.join('\n\n'),
    priority: 'minor', // Inside stories adopt standard body weight
    continuation: contContinuation,
  };

  return {
    originArticle,
    continuationArticle,
    splitParagraphIndex: splitIndex,
    totalParagraphs: rawParagraphs.length,
  };
}

/**
 * Splits an article at a specific paragraph index.
 */
export function splitArticleAtParagraph(
  article: Article,
  splitParagraphIndex: number,
  options: SegmentationOptions = {}
): SegmentedStoryResult | null {
  if (article.continuation?.allowContinuation === false) return null;
  const rawParagraphs = article.body.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (rawParagraphs.length < 2) return null;

  const originPage = options.originPageNumber ?? 1;
  const targetPage = options.targetPageNumber ?? originPage + 1;
  const isHindi = isDevanagariText(article.headline) || isDevanagariText(article.body);

  let splitIndex = splitParagraphIndex;
  if (splitIndex < 1) splitIndex = 1;
  if (splitIndex >= rawParagraphs.length) splitIndex = rawParagraphs.length - 1;

  const originParagraphs = rawParagraphs.slice(0, splitIndex);
  const continuationParagraphs = rawParagraphs.slice(splitIndex);

  const rootId = article.continuation?.rootArticleId || article.id;
  const continuationId = `${article.id}-cont-${(article.continuation?.continuationIndex ?? 0) + 1}`;

  const jumpToText =
    options.defaultJumpToLabel ||
    (isHindi ? `(शेष पृष्ठ ${targetPage} पर जारी...)` : `(Continued on Page ${targetPage}...)`);
  const jumpFromText =
    options.defaultJumpFromLabel ||
    (isHindi ? `(पृष्ठ ${originPage} से आगे...)` : `(Continued from Page ${originPage}...)`);
  const jumpHead =
    options.jumpHeadline ||
    article.continuation?.jumpHeadline ||
    (isHindi ? `${article.headline} (पृष्ठ ${originPage} से आगे)` : `${article.headline} (Cont.)`);

  const originContinuation: ArticleContinuation = {
    role: 'origin',
    rootArticleId: rootId,
    continuationIndex: 0,
    nextArticleId: continuationId,
    targetPageNumber: targetPage,
    jumpToLabel: jumpToText,
    paragraphRange: [0, splitIndex],
    allowContinuation: true,
  };

  const originArticle: Article = {
    ...article,
    body: originParagraphs.join('\n\n'),
    continuation: originContinuation,
  };

  const contContinuation: ArticleContinuation = {
    role: 'continuation',
    rootArticleId: rootId,
    continuationIndex: (article.continuation?.continuationIndex ?? 0) + 1,
    previousArticleId: article.id,
    jumpFromLabel: jumpFromText,
    jumpHeadline: jumpHead,
    paragraphRange: [splitIndex, rawParagraphs.length],
    allowContinuation: true,
  };

  const continuationArticle: Article = {
    ...article,
    id: continuationId,
    headline: jumpHead,
    subheadline: '',
    byline: '',
    dateline: '',
    imageUrl: undefined,
    imagePlacement: 'none',
    imageCaption: '',
    imageCredit: undefined,
    body: continuationParagraphs.join('\n\n'),
    priority: 'minor',
    continuation: contContinuation,
  };

  return {
    originArticle,
    continuationArticle,
    splitParagraphIndex: splitIndex,
    totalParagraphs: rawParagraphs.length,
  };
}
