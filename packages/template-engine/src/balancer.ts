import type {
  NewspaperDocument,
  NewspaperPage,
  Article,
  FrameMm,
  PrintableAreaBoundsMm,
  ArticlePriority,
} from '@epaper-studio/document-schema';
import {
  resolvePageColumnCount,
  getPrintableAreaBoundsMm,
  clampFrameToPrintableArea,
  getPageDimensions,
  NewspaperPageSchema,
  NewspaperDocumentSchema,
} from '@epaper-studio/document-schema';
import { getPhysicalPageMetrics, createNewspaperDocument } from './index.js';
import { checkAabbOverlap } from './freeLayout.js';
import { estimateArticleRequiredHeightPx } from './preflight.js';

/* ====================================================================
 * Types & Interfaces for Intelligent Newspaper Balancing Engine
 * ==================================================================== */

export interface BalancingOptions {
  /**
   * Configurable guideline for minimum readable body column width in millimeters.
   * Default: 45mm for Devanagari text; can be tuned down for compact formats.
   */
  minColumnWidthMm?: number;

  /**
   * Target density preference (e.g. 0.85 for 85% ink-to-page surface).
   * Treated as a scoring preference rather than a hard constraint.
   */
  targetDensityPreference?: number;

  /**
   * Weights for the layout balance cost function.
   */
  weights?: {
    voidPenalty?: number;
    variancePenalty?: number;
    priorityPenalty?: number;
    aspectPenalty?: number;
    densityPenalty?: number;
  };
}

export interface PlacedArticleGeometry {
  article: Article;
  columnStart: number; // 0-based column index
  columnSpan: number; // Grid columns spanned
  rowBandIndex: number; // Vertical modular band index
  estimatedHeightPx: number; // Estimated content height in px
  estimatedHeightMm: number; // Estimated content height in mm
  frameMm: FrameMm; // Exact physical mm frame coordinates
  innerColumnCount: number; // Typographically sound inner column count
}

export interface VoidRegion {
  columnStart: number;
  columnSpan: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  classification: 'accidental_gap' | 'intentional_whitespace' | 'reserved_ad';
}

export interface BalancingReport {
  overallScore: number;
  bandCount: number;
  placedArticles: PlacedArticleGeometry[];
  unplacedArticles: Article[];
  voidRegions: VoidRegion[];
  executionTimeMs: number;
  isDeterministic: boolean;
}

export interface BalancingResult {
  page: NewspaperPage;
  report: BalancingReport;
}

/* ====================================================================
 * Priority Weights & Helper Utilities
 * ==================================================================== */

const PRIORITY_RANK: Record<ArticlePriority, number> = {
  lead: 4,
  major: 3,
  minor: 2,
  brief: 1,
};

/**
 * Calculates page layout bounds in millimeters, accounting for Page 1 masthead vs folio headers.
 * Guarantees printable bounds remain strictly within physical page bounds.
 */
function getPageContentBounds(page: NewspaperPage, doc: NewspaperDocument): PrintableAreaBoundsMm {
  const isFirstPage = (page.pageNumber ?? 1) === 1;
  const metrics = getPhysicalPageMetrics(
    doc.metadata.pageSize,
    doc.metadata.orientation,
    doc.layout.spacingDensity,
    doc.layout.bodyFontSizePt
  );

  const headerHeightPt = isFirstPage ? 125 : 28;
  const footerHeightPt = 22;

  const bounds = getPrintableAreaBoundsMm(doc.metadata.pageSize, doc.metadata.orientation, {
    paddingPt: metrics.paddingPt,
    headerHeightPt,
    footerHeightPt,
  });

  const dims = getPageDimensions(doc.metadata.pageSize, doc.metadata.orientation);
  if (!dims || dims.widthPt <= 0 || dims.heightPt <= 0) {
    throw new Error(
      `Invalid page dimensions for preset "${doc.metadata.pageSize}" and orientation "${doc.metadata.orientation}".`
    );
  }
  const maxW = dims.widthMm ?? (dims.widthPt * 25.4) / 72;
  const maxH = dims.heightMm ?? (dims.heightPt * 25.4) / 72;

  // Guarantee physical bounds invariants
  bounds.minX = Math.max(0, bounds.minX);
  bounds.maxX = Math.min(maxW, bounds.maxX);
  bounds.minY = Math.max(0, bounds.minY);
  bounds.maxY = Math.min(maxH, bounds.maxY);
  bounds.contentWidth = Number((bounds.maxX - bounds.minX).toFixed(2));
  bounds.contentHeight = Number((bounds.maxY - bounds.minY).toFixed(2));

  if (bounds.contentWidth <= 0 || bounds.contentHeight <= 0) {
    throw new Error(
      `Invalid printable area: Content width (${bounds.contentWidth}mm) or height (${bounds.contentHeight}mm) is non-positive.`
    );
  }

  return bounds;
}

/**
 * Determines whether an article contains predominantly Hindi / Devanagari text.
 */
function isDevanagariText(text: string): boolean {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Derives typographically sound inner body columns for an article.
 * Does NOT blindly set inner column count equal to outer page column span.
 * Respects minColumnWidthMm (default: 45mm) and word count thresholds.
 */
export function calculateArticleInnerColumns(
  article: Article,
  outerColumnSpan: number,
  singleColumnWidthMm: number,
  gapMm: number,
  minColumnWidthMm: number = 45
): number {
  if (outerColumnSpan <= 1) return 1;

  // If user explicitly locked/specified inner column count, respect it within [1, 6]
  const explicit = article.typography?.bodyColumnCount ?? article.bodyColumnCount;
  if (explicit && explicit >= 1 && explicit <= 6) {
    return explicit;
  }

  const articleWidthMm = outerColumnSpan * singleColumnWidthMm + (outerColumnSpan - 1) * gapMm;
  const words = (article.body || '').trim().split(/\s+/).filter(Boolean).length;
  const isHindi = isDevanagariText(article.body) || isDevanagariText(article.headline);

  // For Devanagari, line measure must hold long compound words without rivers
  const effectiveMinColMm = isHindi ? minColumnWidthMm : Math.max(35, minColumnWidthMm - 8);

  // Evaluate candidate inner column counts
  if (outerColumnSpan >= 8) {
    const col5WidthMm = (articleWidthMm - 4 * gapMm) / 5;
    const col4WidthMm = (articleWidthMm - 3 * gapMm) / 4;
    const col3WidthMm = (articleWidthMm - 2 * gapMm) / 3;
    if (words >= 700 && col5WidthMm >= effectiveMinColMm) {
      return 5;
    }
    if (words >= 500 && col4WidthMm >= effectiveMinColMm) {
      return 4;
    }
    if (words >= 350 && col3WidthMm >= effectiveMinColMm) {
      return 3;
    }
    if (words >= 140) {
      return 2;
    }
    return 1;
  }

  if (outerColumnSpan >= 6) {
    const col4WidthMm = (articleWidthMm - 3 * gapMm) / 4;
    const col3WidthMm = (articleWidthMm - 2 * gapMm) / 3;
    const col2WidthMm = (articleWidthMm - gapMm) / 2;
    if (words >= 500 && col4WidthMm >= effectiveMinColMm) {
      return 4;
    }
    if (words >= 350 && col3WidthMm >= effectiveMinColMm) {
      return 3;
    }
    if (words >= 140 && col2WidthMm >= effectiveMinColMm) {
      return 2;
    }
    return 1;
  }

  if (outerColumnSpan >= 4) {
    const col3WidthMm = (articleWidthMm - 2 * gapMm) / 3;
    const col2WidthMm = (articleWidthMm - gapMm) / 2;
    if (words >= 350 && col3WidthMm >= effectiveMinColMm) {
      return 3;
    }
    if (words >= 140 && col2WidthMm >= effectiveMinColMm) {
      return 2;
    }
    return 1;
  }

  if (outerColumnSpan === 3) {
    const col3WidthMm = (articleWidthMm - 2 * gapMm) / 3;
    const col2WidthMm = (articleWidthMm - gapMm) / 2;
    if (words >= 220 && col3WidthMm >= effectiveMinColMm) {
      return 3;
    }
    if (words >= 110 && col2WidthMm >= effectiveMinColMm) {
      return 2;
    }
    return 1;
  }

  if (outerColumnSpan === 2) {
    const col2WidthMm = (articleWidthMm - gapMm) / 2;
    if (words >= 90 && col2WidthMm >= effectiveMinColMm) {
      return 2;
    }
    return 1;
  }

  return 1;
}

/**
 * Calculates permissible outer column span range [minSpan, maxSpan] for an article.
 */
export function getPermissibleSpanRange(
  art: Article,
  totalPageColumns: number
): { minSpan: number; maxSpan: number; defaultSpan: number } {
  // If user locked the span, span is strictly fixed
  if (art.lockSpan && art.columnSpan) {
    const clamped = Math.max(1, Math.min(totalPageColumns, art.columnSpan));
    return { minSpan: clamped, maxSpan: clamped, defaultSpan: clamped };
  }

  const priority = art.priority || 'major';
  const words = (art.body || '').trim().split(/\s+/).filter(Boolean).length;
  const hasPhoto = Boolean(art.imageUrl && art.imagePlacement !== 'none');

  if (priority === 'lead') {
    if (totalPageColumns === 4) {
      const span = words >= 100 || hasPhoto ? 3 : 2;
      return { minSpan: 2, maxSpan: 4, defaultSpan: span };
    }
    if (totalPageColumns === 6) {
      const span = words >= 250 || hasPhoto ? 4 : 3;
      return { minSpan: 3, maxSpan: 6, defaultSpan: span };
    }
    if (totalPageColumns === 8) {
      const span = words >= 300 || hasPhoto ? 5 : 4;
      return { minSpan: 4, maxSpan: 8, defaultSpan: span };
    }
    // 12 columns
    return { minSpan: 6, maxSpan: 12, defaultSpan: 8 };
  }

  if (priority === 'major') {
    if (totalPageColumns === 4) {
      return { minSpan: 1, maxSpan: 2, defaultSpan: words >= 150 ? 2 : 1 };
    }
    if (totalPageColumns === 6) {
      return { minSpan: 2, maxSpan: 3, defaultSpan: words >= 200 ? 3 : 2 };
    }
    if (totalPageColumns === 8) {
      return { minSpan: 2, maxSpan: 4, defaultSpan: 3 };
    }
    return { minSpan: 3, maxSpan: 6, defaultSpan: 4 };
  }

  if (priority === 'minor') {
    if (totalPageColumns <= 4) {
      return { minSpan: 1, maxSpan: 2, defaultSpan: 1 };
    }
    return { minSpan: 1, maxSpan: 2, defaultSpan: words >= 120 ? 2 : 1 };
  }

  // Brief
  return { minSpan: 1, maxSpan: 1, defaultSpan: 1 };
}

/* ====================================================================
 * Core Balancing Engine Implementation (HDMH)
 * ==================================================================== */

/**
 * Balances and positions articles into a clean 2D modular layout across the page.
 *
 * Guaranteed Properties:
 * 1. Deterministic: 100% reproducible output across repeated runs.
 * 2. Non-destructive: Never modifies the input document or deletes/truncates article copy.
 * 3. Obstacle Preserving: Never moves or resizes locked articles or advertisements.
 * 4. Single-Page Scope: Reports unplaced overflow stories without moving them across pages.
 */
export function balanceNewspaperPage(
  page: NewspaperPage,
  doc?: NewspaperDocument,
  options: BalancingOptions = {}
): BalancingResult {
  // 1. Schema Validation (Backwards-compatible: validates input structures against document-schema)
  NewspaperPageSchema.parse(page);

  const effectiveDoc: NewspaperDocument =
    doc ??
    createNewspaperDocument({
      presetId: 'classic-hindi-broadsheet',
      pageSize: 'broadsheet',
    });
  NewspaperDocumentSchema.parse(effectiveDoc);

  const startTime = performance.now();

  const minColumnWidthMm = options.minColumnWidthMm ?? 45;
  const targetDensity = options.targetDensityPreference ?? 0.88;
  const weights = {
    voidPenalty: options.weights?.voidPenalty ?? 1000,
    variancePenalty: options.weights?.variancePenalty ?? 1.5,
    priorityPenalty: options.weights?.priorityPenalty ?? 50,
    aspectPenalty: options.weights?.aspectPenalty ?? 20,
    densityPenalty: options.weights?.densityPenalty ?? 100,
  };

  const totalPageColumns = resolvePageColumnCount(effectiveDoc, page);
  const bounds = getPageContentBounds(page, effectiveDoc);

  const metrics = getPhysicalPageMetrics(
    effectiveDoc.metadata.pageSize,
    effectiveDoc.metadata.orientation,
    effectiveDoc.layout.spacingDensity,
    effectiveDoc.layout.bodyFontSizePt
  );

  const gapMm = (metrics.gapPt * 25.4) / 72;
  const totalGapsWidthMm = (totalPageColumns - 1) * gapMm;
  const singleColWidthMm = (bounds.contentWidth - totalGapsWidthMm) / totalPageColumns;
  const usableContentWidthPx = Number(((bounds.contentWidth * 96) / 25.4).toFixed(1));

  // 1. Separate Locked / Manually Positioned Articles vs Dynamic Unlocked Articles
  const lockedArticles: Article[] = [];
  const unlockedArticles: Article[] = [];

  for (const art of page.articles) {
    const isAd = art.elementType === 'advertisement';
    const isReserved = Boolean(art.isReserved);
    const isLocked =
      Boolean(art.locked) ||
      Boolean(art.lockPosition) ||
      isAd ||
      isReserved;

    if (isLocked) {
      lockedArticles.push(art);
    } else {
      unlockedArticles.push(art);
    }
  }

  // 2. Strict Deterministic Sorting of Unlocked Articles
  // Sort by priority rank (descending), required area (descending), word count (descending),
  // orderIndex (ascending), and tie-breaker by article id (lexicographical).
  const sortedUnlocked = [...unlockedArticles].sort((a, b) => {
    const pA = PRIORITY_RANK[a.priority || 'major'];
    const pB = PRIORITY_RANK[b.priority || 'major'];
    if (pA !== pB) return pB - pA;

    const wordsA = (a.body || '').trim().split(/\s+/).filter(Boolean).length;
    const wordsB = (b.body || '').trim().split(/\s+/).filter(Boolean).length;
    if (wordsA !== wordsB) return wordsB - wordsA;

    const ordA = a.orderIndex ?? 0;
    const ordB = b.orderIndex ?? 0;
    if (ordA !== ordB) return ordA - ordB;

    return a.id.localeCompare(b.id);
  });

  // 3. Register Locked Obstacle Frames
  // Process articles with pre-existing explicit frames first, then unpositioned reserved/ad regions
  lockedArticles.sort((a, b) => {
    const hasFrameA = a.frame ? 1 : 0;
    const hasFrameB = b.frame ? 1 : 0;
    return hasFrameB - hasFrameA;
  });

  const obstacleFrames: FrameMm[] = [];
  const placedGeometries: PlacedArticleGeometry[] = [];

  for (const lockedArt of lockedArticles) {
    let frame = lockedArt.frame;
    const isAd = lockedArt.elementType === 'advertisement';
    const isReserved = Boolean(lockedArt.isReserved);

    if (!frame) {
      if (isAd) {
        // Safe default: Anchor ad at bottom of printable area across all or assigned columns
        const span = Math.max(1, Math.min(totalPageColumns, lockedArt.columnSpan || totalPageColumns));
        const wMm = span * singleColWidthMm + (span - 1) * gapMm;
        const hMm = lockedArt.customHeight ? (lockedArt.customHeight * 25.4) / 96 : 45;
        const colStart = totalPageColumns - span;
        const xMm = bounds.minX + colStart * (singleColWidthMm + gapMm);
        const yMm = bounds.maxY - hMm;
        frame = {
          x: Number(xMm.toFixed(2)),
          y: Number(yMm.toFixed(2)),
          w: Number(wMm.toFixed(2)),
          h: Number(hMm.toFixed(2)),
          z: 10,
        };
      } else if (isReserved) {
        const span = Math.max(1, Math.min(totalPageColumns, lockedArt.columnSpan || 2));
        const wMm = span * singleColWidthMm + (span - 1) * gapMm;
        // Anchor above existing bottom obstacles if any, or at bottom of printable area
        const bottomObstacleY = obstacleFrames.reduce(
          (minY, obs) => (obs.y > bounds.minY + 100 ? Math.min(minY, obs.y) : minY),
          bounds.maxY
        );
        frame = {
          x: bounds.minX,
          y: Number((bottomObstacleY - 42).toFixed(2)),
          w: Number(wMm.toFixed(2)),
          h: 40,
          z: 1,
        };
      } else {
        const span = Math.max(1, Math.min(totalPageColumns, lockedArt.columnSpan || 1));
        const wMm = span * singleColWidthMm + (span - 1) * gapMm;
        frame = {
          x: bounds.minX,
          y: bounds.minY,
          w: Number(wMm.toFixed(2)),
          h: 60,
          z: 1,
        };
      }
    }

    const clamped = clampFrameToPrintableArea(frame, bounds);
    obstacleFrames.push(clamped);

    // Preserve explicit columnSpan if set, or estimate from physical width
    const approxSpan =
      lockedArt.columnSpan ??
      Math.max(
        1,
        Math.min(
          totalPageColumns,
          Math.round((clamped.w + gapMm) / (singleColWidthMm + gapMm))
        )
      );

    const approxColStart = Math.max(
      0,
      Math.min(
        totalPageColumns - approxSpan,
        Math.round((clamped.x - bounds.minX) / (singleColWidthMm + gapMm))
      )
    );

    placedGeometries.push({
      article: lockedArt,
      columnStart: approxColStart,
      columnSpan: approxSpan,
      rowBandIndex: -1,
      estimatedHeightPx: Math.round(((clamped.h * 72) / 25.4) * 1.333),
      estimatedHeightMm: clamped.h,
      frameMm: clamped,
      innerColumnCount: lockedArt.bodyColumnCount || 1,
    });
  }

  // 4. Modular Band Generation & Deterministic Placement with 2D Vertical Sub-Slotting
  // Track vertical progress from top to bottom
  let currentYMm = bounds.minY;
  let bandIndex = 0;
  const unplacedArticles: Article[] = [];
  const remainingArticles = [...sortedUnlocked];

  while (remainingArticles.length > 0 && currentYMm < bounds.maxY - 15) {
    // If currentYMm starts inside any locked obstacle, jump past it
    let jumping = true;
    while (jumping) {
      jumping = false;
      for (const obs of obstacleFrames) {
        if (currentYMm >= obs.y - 0.5 && currentYMm < obs.y + obs.h) {
          currentYMm = obs.y + obs.h + gapMm;
          jumping = true;
        }
      }
    }

    if (currentYMm >= bounds.maxY - 15) {
      break;
    }

    // Determine target band: Lead Band if at top and lead story present, else standard band
    const isTopBand = bandIndex === 0 && currentYMm <= bounds.minY + 2;
    let availableBandHeightMm = bounds.maxY - currentYMm;

    // Check if there is an obstacle below currentYMm that caps available band height
    for (const obs of obstacleFrames) {
      if (obs.y > currentYMm && obs.y < currentYMm + availableBandHeightMm) {
        const spaceBeforeObs = obs.y - currentYMm - gapMm;
        if (spaceBeforeObs >= 25) {
          availableBandHeightMm = Math.min(availableBandHeightMm, spaceBeforeObs);
        } else {
          // Insufficient space before obstacle; jump past it
          currentYMm = obs.y + obs.h + gapMm;
          availableBandHeightMm = bounds.maxY - currentYMm;
        }
      }
    }

    if (availableBandHeightMm < 20) {
      // Remaining page space too small for a readable article
      break;
    }

    // Identify candidate articles to form a full-width modular row (sum of spans == totalPageColumns)
    const bandSelection = selectBandArticles(
      remainingArticles,
      totalPageColumns,
      isTopBand,
      singleColWidthMm,
      gapMm,
      minColumnWidthMm
    );

    if (bandSelection.articles.length === 0) {
      // No valid partition could be formed
      break;
    }

    // Calculate natural required height for each primary article in the band
    let maxBandHeightMm = 0;
    const bandItemsWithHeight: Array<{
      article: Article;
      span: number;
      innerCols: number;
      heightMm: number;
      heightPx: number;
    }> = [];

    for (const item of bandSelection.articles) {
      const innerCols = calculateArticleInnerColumns(
        item.article,
        item.span,
        singleColWidthMm,
        gapMm,
        minColumnWidthMm
      );

      // Estimate required height using typography engine with calibrated content width
      const tempArt = {
        ...item.article,
        columnSpan: item.span,
        typography: {
          ...item.article.typography,
          bodyColumnCount: innerCols,
        },
      };
      const heightPx = estimateArticleRequiredHeightPx(
        tempArt,
        totalPageColumns,
        usableContentWidthPx
      );
      // Convert px (96 DPI) to mm: 1px = (25.4 / 96) mm ≈ 0.264583 mm
      const heightMm = Math.max(25, Number((heightPx * 0.264583).toFixed(1)));

      bandItemsWithHeight.push({
        article: item.article,
        span: item.span,
        innerCols,
        heightMm,
        heightPx,
      });

      maxBandHeightMm = Math.max(maxBandHeightMm, heightMm);
    }

    // Clamp band height to remaining printable page bounds
    const effectiveBandHeightMm = Math.min(maxBandHeightMm, availableBandHeightMm);

    // Place each sector with 2D Vertical Sub-Slotting
    let currentColStart = 0;
    const newlyPlacedIds = new Set<string>();

    for (const item of bandItemsWithHeight) {
      const xMm = Number(
        (bounds.minX + currentColStart * (singleColWidthMm + gapMm)).toFixed(2)
      );
      const wMm = Number(
        (item.span * singleColWidthMm + (item.span - 1) * gapMm).toFixed(2)
      );

      const hasHeadroom = item.heightMm < effectiveBandHeightMm - 28;
      const primaryHeightMm = hasHeadroom
        ? Number(item.heightMm.toFixed(2))
        : Number(effectiveBandHeightMm.toFixed(2));

      const candidateFrame: FrameMm = {
        x: xMm,
        y: Number(currentYMm.toFixed(2)),
        w: wMm,
        h: primaryHeightMm,
        z: placedGeometries.length + 1,
      };

      // Check collision with locked obstacles
      const collidesWithObstacle = obstacleFrames.some((obs) =>
        checkAabbOverlap(candidateFrame, obs)
      );

      if (!collidesWithObstacle) {
        placedGeometries.push({
          article: {
            ...item.article,
            columnSpan: item.span,
            bodyColumnCount: item.innerCols,
            typography: {
              ...item.article.typography,
              bodyColumnCount: item.innerCols,
            },
          },
          columnStart: currentColStart,
          columnSpan: item.span,
          rowBandIndex: bandIndex,
          estimatedHeightPx: item.heightPx,
          estimatedHeightMm: primaryHeightMm,
          frameMm: candidateFrame,
          innerColumnCount: item.innerCols,
        });

        newlyPlacedIds.add(item.article.id);

        // 2D Vertical Sub-Slotting: Stack secondary articles underneath when headroom permits
        if (hasHeadroom) {
          let subSlotYMm = currentYMm + primaryHeightMm + gapMm;
          let remainingSubSlotHeightMm = effectiveBandHeightMm - primaryHeightMm - gapMm;
          const secondaryPlacedIds = new Set<string>();

          for (let rIdx = 0; rIdx < remainingArticles.length; rIdx++) {
            const candidateArt = remainingArticles[rIdx];
            if (!candidateArt) continue;
            // Skip articles already placed or selected in this band
            if (bandSelection.articles.some((a) => a.article.id === candidateArt.id)) continue;
            if (newlyPlacedIds.has(candidateArt.id) || secondaryPlacedIds.has(candidateArt.id))
              continue;

            // Candidate must be permissible in item.span
            const candRange = getPermissibleSpanRange(candidateArt, totalPageColumns);
            if (candRange.minSpan > item.span) continue;

            const candInnerCols = calculateArticleInnerColumns(
              candidateArt,
              item.span,
              singleColWidthMm,
              gapMm,
              minColumnWidthMm
            );
            const candTemp = {
              ...candidateArt,
              columnSpan: item.span,
              typography: {
                ...candidateArt.typography,
                bodyColumnCount: candInnerCols,
              },
            };
            const candHeightPx = estimateArticleRequiredHeightPx(
              candTemp,
              totalPageColumns,
              usableContentWidthPx
            );
            const candHeightMm = Math.max(22, Number((candHeightPx * 0.264583).toFixed(1)));

            if (candHeightMm <= remainingSubSlotHeightMm + 10) {
              const allocHeightMm = Math.min(
                remainingSubSlotHeightMm,
                remainingSubSlotHeightMm <= candHeightMm + 18
                  ? remainingSubSlotHeightMm
                  : candHeightMm
              );

              const subCandidateFrame: FrameMm = {
                x: xMm,
                y: Number(subSlotYMm.toFixed(2)),
                w: wMm,
                h: Number(allocHeightMm.toFixed(2)),
                z: placedGeometries.length + 1,
              };

              const subCollides = obstacleFrames.some((obs) =>
                checkAabbOverlap(subCandidateFrame, obs)
              );

              if (!subCollides) {
                placedGeometries.push({
                  article: {
                    ...candidateArt,
                    columnSpan: item.span,
                    bodyColumnCount: candInnerCols,
                    typography: {
                      ...candidateArt.typography,
                      bodyColumnCount: candInnerCols,
                    },
                  },
                  columnStart: currentColStart,
                  columnSpan: item.span,
                  rowBandIndex: bandIndex,
                  estimatedHeightPx: candHeightPx,
                  estimatedHeightMm: allocHeightMm,
                  frameMm: subCandidateFrame,
                  innerColumnCount: candInnerCols,
                });

                secondaryPlacedIds.add(candidateArt.id);
                newlyPlacedIds.add(candidateArt.id);
                subSlotYMm += allocHeightMm + gapMm;
                remainingSubSlotHeightMm -= allocHeightMm + gapMm;

                if (remainingSubSlotHeightMm < 25) {
                  break;
                }
              }
            }
          }

          // If no secondary article was placed, expand primary article to full band height
          if (secondaryPlacedIds.size === 0) {
            const primaryGeom = placedGeometries.find((p) => p.article.id === item.article.id);
            if (primaryGeom) {
              primaryGeom.frameMm.h = Number(effectiveBandHeightMm.toFixed(2));
              primaryGeom.estimatedHeightMm = Number(effectiveBandHeightMm.toFixed(2));
            }
          }
        }
      } else {
        // Collided with obstacle; retain in unplaced queue
        unplacedArticles.push(item.article);
      }

      currentColStart += item.span;
    }

    // Advance Y coordinate
    currentYMm += effectiveBandHeightMm + gapMm;
    bandIndex++;

    // Remove placed articles from remaining queue
    for (let i = remainingArticles.length - 1; i >= 0; i--) {
      const art = remainingArticles[i];
      if (art && newlyPlacedIds.has(art.id)) {
        remainingArticles.splice(i, 1);
      }
    }
  }

  // Any remaining articles that could not safely fit are reported as unplaced
  unplacedArticles.push(...remainingArticles);

  // 5. Detect and Classify Void Regions
  const voidRegions: VoidRegion[] = [];

  // Register reserved regions and ads in voidRegions
  for (const lockedArt of lockedArticles) {
    if (lockedArt.isReserved || lockedArt.elementType === 'advertisement') {
      const placed = placedGeometries.find((p) => p.article.id === lockedArt.id);
      if (placed) {
        voidRegions.push({
          columnStart: placed.columnStart,
          columnSpan: placed.columnSpan,
          xMm: placed.frameMm.x,
          yMm: placed.frameMm.y,
          widthMm: placed.frameMm.w,
          heightMm: placed.frameMm.h,
          classification:
            lockedArt.elementType === 'advertisement' ? 'reserved_ad' : 'intentional_whitespace',
        });
      }
    }
  }

  const remainingBottomHeightMm = bounds.maxY - currentYMm;
  if (remainingBottomHeightMm > 10) {
    voidRegions.push({
      columnStart: 0,
      columnSpan: totalPageColumns,
      xMm: bounds.minX,
      yMm: Number(currentYMm.toFixed(2)),
      widthMm: Number(bounds.contentWidth.toFixed(2)),
      heightMm: Number(remainingBottomHeightMm.toFixed(2)),
      classification:
        remainingBottomHeightMm <= 35 ? 'intentional_whitespace' : 'accidental_gap',
    });
  }

  // 6. Compute Objective Layout Quality Score
  const totalPrintableAreaMm2 = bounds.contentWidth * bounds.contentHeight;
  const placedAreaMm2 = placedGeometries.reduce(
    (sum, p) => sum + p.frameMm.w * p.frameMm.h,
    0
  );
  const actualDensity = totalPrintableAreaMm2 > 0 ? placedAreaMm2 / totalPrintableAreaMm2 : 0;

  let totalCost = 0;
  // Void penalty
  const accidentalVoids = voidRegions.filter((v) => v.classification === 'accidental_gap');
  for (const voidReg of accidentalVoids) {
    const ratio = (voidReg.widthMm * voidReg.heightMm) / totalPrintableAreaMm2;
    totalCost += ratio * ratio * weights.voidPenalty;
  }
  // Density preference penalty
  totalCost += Math.abs(actualDensity - targetDensity) * weights.densityPenalty;
  // Unplaced articles penalty
  totalCost += unplacedArticles.length * 150;

  const overallScore = Math.max(0, Math.min(100, Math.round(100 - totalCost)));

  // 7. Assemble Balanced Page Copy
  const updatedArticles: Article[] = [];
  let orderCounter = 0;

  // Add placed articles in topological top-to-bottom, left-to-right order
  const sortedPlaced = [...placedGeometries].sort((a, b) => {
    if (Math.abs(a.frameMm.y - b.frameMm.y) > 6) {
      return a.frameMm.y - b.frameMm.y;
    }
    return a.frameMm.x - b.frameMm.x;
  });

  for (const placed of sortedPlaced) {
    updatedArticles.push({
      ...placed.article,
      orderIndex: orderCounter++,
      columnSpan: placed.columnSpan,
      frame: placed.frameMm,
      bodyColumnCount: placed.innerColumnCount,
      typography: {
        ...placed.article.typography,
        bodyColumnCount: placed.innerColumnCount,
      },
    });
  }

  // Preserve unplaced articles at the end of the page list without modifying their text
  for (const unplaced of unplacedArticles) {
    updatedArticles.push({
      ...unplaced,
      orderIndex: orderCounter++,
    });
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  return {
    page: {
      ...page,
      articles: updatedArticles,
    },
    report: {
      overallScore,
      bandCount: bandIndex,
      placedArticles: placedGeometries,
      unplacedArticles,
      voidRegions,
      executionTimeMs,
      isDeterministic: true,
    },
  };
}

/**
 * Deterministically selects a set of articles whose column spans sum to totalPageColumns.
 */
function selectBandArticles(
  pool: Article[],
  targetSum: number,
  isTopBand: boolean,
  _singleColWidthMm: number,
  _gapMm: number,
  _minColumnWidthMm: number
): { articles: Array<{ article: Article; span: number }> } {
  if (pool.length === 0) return { articles: [] };

  // Precompute permissible ranges once
  const poolInfo = pool.map((art) => ({
    article: art,
    range: getPermissibleSpanRange(art, targetSum),
  }));

  // If top band, prioritize lead story
  const leadIndex = poolInfo.findIndex((item) => item.article.priority === 'lead');
  if (isTopBand && leadIndex !== -1 && poolInfo[leadIndex]) {
    const leadItem = poolInfo[leadIndex]!;
    const leadSpan = Math.min(
      targetSum,
      Math.max(leadItem.range.minSpan, leadItem.range.defaultSpan)
    );

    if (leadSpan === targetSum) {
      return { articles: [{ article: leadItem.article, span: leadSpan }] };
    }

    // Find complementary story/stories for the remaining columns
    const remainingColumns = targetSum - leadSpan;
    const candidates = poolInfo.filter((_, idx) => idx !== leadIndex);

    for (const cand of candidates) {
      if (cand.range.minSpan <= remainingColumns && cand.range.maxSpan >= remainingColumns) {
        return {
          articles: [
            { article: leadItem.article, span: leadSpan },
            { article: cand.article, span: remainingColumns },
          ],
        };
      }
    }

    // If no single story fits remaining, try two 1-column stories if remainingColumns == 2
    if (remainingColumns === 2 && candidates.length >= 2 && candidates[0] && candidates[1]) {
      return {
        articles: [
          { article: leadItem.article, span: leadSpan },
          { article: candidates[0].article, span: 1 },
          { article: candidates[1].article, span: 1 },
        ],
      };
    }

    // Default: Lead expands to full targetSum if complement not found
    return { articles: [{ article: leadItem.article, span: targetSum }] };
  }

  // 1. Check if any single story fits targetSum exactly
  for (const item of poolInfo) {
    if (item.range.minSpan <= targetSum && item.range.maxSpan >= targetSum) {
      return { articles: [{ article: item.article, span: targetSum }] };
    }
  }

  // 2. Check 2-story combinations with candidate spans (default, max, min)
  for (let i = 0; i < poolInfo.length; i++) {
    const itemA = poolInfo[i]!;
    const candidateSpansA = Array.from(
      new Set([itemA.range.defaultSpan, itemA.range.maxSpan, itemA.range.minSpan])
    );

    for (const spanA of candidateSpansA) {
      if (spanA >= targetSum) continue;
      const remainderA = targetSum - spanA;

      for (let j = 0; j < poolInfo.length; j++) {
        if (i === j) continue;
        const itemB = poolInfo[j]!;
        if (itemB.range.minSpan <= remainderA && itemB.range.maxSpan >= remainderA) {
          return {
            articles: [
              { article: itemA.article, span: spanA },
              { article: itemB.article, span: remainderA },
            ],
          };
        }
      }
    }
  }

  // 3. Check 3-story combinations using natural spans
  for (let i = 0; i < poolInfo.length; i++) {
    const itemA = poolInfo[i]!;
    const spanA = itemA.range.defaultSpan;
    if (spanA >= targetSum - 1) continue;
    const remA = targetSum - spanA;

    for (let j = 0; j < poolInfo.length; j++) {
      if (i === j) continue;
      const itemB = poolInfo[j]!;
      const spanB = Math.min(itemB.range.defaultSpan, remA - 1);
      if (spanB < itemB.range.minSpan) continue;
      const remB = remA - spanB;

      for (let k = 0; k < poolInfo.length; k++) {
        if (k === i || k === j) continue;
        const itemC = poolInfo[k]!;
        if (itemC.range.minSpan <= remB && itemC.range.maxSpan >= remB) {
          return {
            articles: [
              { article: itemA.article, span: spanA },
              { article: itemB.article, span: spanB },
              { article: itemC.article, span: remB },
            ],
          };
        }
      }
    }
  }

  // Fallback: Pack greedy subset that fits within targetSum
  const subset: Array<{ article: Article; span: number }> = [];
  let accumulatedSpan = 0;
  for (const item of poolInfo) {
    const candidateSpan = Math.min(
      targetSum - accumulatedSpan,
      Math.max(1, item.range.defaultSpan)
    );
    if (candidateSpan > 0 && accumulatedSpan + candidateSpan <= targetSum) {
      subset.push({ article: item.article, span: candidateSpan });
      accumulatedSpan += candidateSpan;
      if (accumulatedSpan >= targetSum) break;
    }
  }

  if (subset.length > 0) {
    return { articles: subset };
  }

  return { articles: [] };
}

/**
 * Balances an entire NewspaperDocument page-by-page.
 *
 * Guaranteed Properties:
 * 1. Immutability: Returns a fresh deep-cloned document copy; the input document is strictly untouched.
 * 2. Schema-compliant: Validates input with NewspaperDocumentSchema before processing.
 * 3. Content Integrity: Preserves all metadata, edition info, and article copy without loss.
 * 4. Backwards-compatible: Compatible with version 1.0.0 and 1.1.0 documents.
 * 5. Isolation: Opt-in engine; never invoked automatically on load or save.
 */
export function balanceNewspaperDocument(
  doc: NewspaperDocument,
  options: BalancingOptions = {}
): { document: NewspaperDocument; reports: BalancingReport[] } {
  // Validate input document schema
  NewspaperDocumentSchema.parse(doc);

  // Deep clone to guarantee original document immutability
  const clonedDoc: NewspaperDocument = JSON.parse(JSON.stringify(doc));
  const reports: BalancingReport[] = [];

  if (clonedDoc.pages && clonedDoc.pages.length > 0) {
    for (let pIdx = 0; pIdx < clonedDoc.pages.length; pIdx++) {
      const page = clonedDoc.pages[pIdx]!;
      const result = balanceNewspaperPage(page, clonedDoc, options);
      clonedDoc.pages[pIdx] = result.page;
      reports.push(result.report);
    }
    // Sync clonedDoc.articles if present
    if (clonedDoc.articles) {
      clonedDoc.articles = clonedDoc.pages.flatMap((p) => p.articles);
    }
  } else if (clonedDoc.articles) {
    const virtualPage: NewspaperPage = {
      id: 'page-1',
      pageNumber: 1,
      sectionTitle: clonedDoc.metadata.language === 'hi' ? 'मुख्य पृष्ठ' : 'Front Page',
      layoutMode: 'auto',
      articles: clonedDoc.articles,
    };
    const result = balanceNewspaperPage(virtualPage, clonedDoc, options);
    clonedDoc.articles = result.page.articles;
    reports.push(result.report);
  }

  return {
    document: clonedDoc,
    reports,
  };
}
