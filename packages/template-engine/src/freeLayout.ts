import {
  type NewspaperPage,
  type NewspaperDocument,
  type Article,
  type FrameMm,
  type PrintableAreaBoundsMm,
  getPrintableAreaBoundsMm,
  clampFrameToPrintableArea,
  validateFrameInsidePrintableArea,
} from '@epaper-studio/document-schema';
import { getPhysicalPageMetrics } from './index';

export interface FreeLayoutConversionOptions {
  toleranceMm?: number;
}

export interface FreeToAutoResult {
  page: NewspaperPage;
  lossyWarnings: string[];
}

export interface SnapGuide {
  type: 'x' | 'y';
  positionMm: number;
  label?: string;
  source: 'page-margin' | 'page-center' | 'grid-column' | 'vertical-module' | 'sibling-edge' | 'sibling-center' | 'equal-gap';
}

export interface SnapResult {
  frame: FrameMm;
  snappedX: boolean;
  snappedY: boolean;
  activeGuides: SnapGuide[];
}

export interface PageFullnessMetrics {
  totalPrintableAreaMm2: number;
  usedAreaMm2: number;
  fullnessPercent: number;
  displayLabel: string;
}

export interface FreeSlotSearchResult {
  found: boolean;
  xMm?: number;
  yMm?: number;
  reason?: string;
}

/**
 * Axis-Aligned Bounding Box (AABB) overlap detection between two frames.
 * Returns true if the two rectangular regions intersect by more than epsilon.
 */
export function checkAabbOverlap(
  frameA: FrameMm,
  frameB: FrameMm,
  epsilonMm: number = 0.1
): boolean {
  return !(
    frameA.x + frameA.w <= frameB.x + epsilonMm ||
    frameB.x + frameB.w <= frameA.x + epsilonMm ||
    frameA.y + frameA.h <= frameB.y + epsilonMm ||
    frameB.y + frameB.h <= frameA.y + epsilonMm
  );
}

/**
 * Calculates page printable area bounds in millimeters.
 * Automatically accounts for Page 1 masthead vs inside folio headers.
 */
export function getPageLayoutBounds(
  page: NewspaperPage,
  doc: NewspaperDocument
): PrintableAreaBoundsMm {
  const isFirstPage = (page.pageNumber ?? 1) === 1;
  const metrics = getPhysicalPageMetrics(
    doc.metadata.pageSize,
    doc.metadata.orientation,
    doc.layout.spacingDensity,
    doc.layout.bodyFontSizePt
  );

  // Masthead on page 1 is ~125pt; inside folio on page 2+ is ~28pt.
  const headerHeightPt = isFirstPage ? 125 : 28;
  const footerHeightPt = 22;

  return getPrintableAreaBoundsMm(doc.metadata.pageSize, doc.metadata.orientation, {
    paddingPt: metrics.paddingPt,
    headerHeightPt,
    footerHeightPt,
  });
}

/**
 * Converts a structured auto-flow page into a free-placement layout (autoToFree),
 * calculating exact physical millimeter frames from column spans and layout rows.
 */
export function autoToFree(
  page: NewspaperPage,
  doc: NewspaperDocument,
  _options: FreeLayoutConversionOptions = {}
): NewspaperPage {
  const bounds = getPageLayoutBounds(page, doc);
  const metrics = getPhysicalPageMetrics(
    doc.metadata.pageSize,
    doc.metadata.orientation,
    doc.layout.spacingDensity,
    doc.layout.bodyFontSizePt
  );

  const colCount = page.columnCount ?? doc.layout.columnCount ?? 12;
  const gapMm = (metrics.gapPt * 25.4) / 72;
  const totalGapsWidth = (colCount - 1) * gapMm;
  const singleColWidthMm = (bounds.contentWidth - totalGapsWidth) / colCount;

  let currentXCol = 0;
  let currentRowTopMm = bounds.minY;
  let currentRowMaxHeightMm = 0;

  const freeArticles: Article[] = page.articles.map((art, index) => {
    // If article already has a valid frame within bounds, preserve it
    if (art.frame && validateFrameInsidePrintableArea(art.frame, bounds).valid) {
      return art;
    }

    const span = Math.min(colCount, Math.max(1, art.columnSpan));

    // Wrap to next row if this block overflows the current column count
    if (currentXCol + span > colCount && currentXCol > 0) {
      currentRowTopMm += currentRowMaxHeightMm + gapMm;
      currentXCol = 0;
      currentRowMaxHeightMm = 0;
    }

    const xMm = bounds.minX + currentXCol * (singleColWidthMm + gapMm);
    const wMm = span * singleColWidthMm + (span - 1) * gapMm;

    // Estimate block height based on priority, photo, and text volume
    const isLead = art.priority === 'lead';
    const hasPhoto = Boolean(art.imageUrl && art.imagePlacement !== 'none');
    const wordCount = art.body.trim().split(/\s+/).filter(Boolean).length;
    
    // Baseline heights in mm
    let estimatedHeightMm = 45;
    if (hasPhoto) estimatedHeightMm += 40;
    if (isLead) estimatedHeightMm += 30;
    if (wordCount > 150) estimatedHeightMm += 25;
    if (wordCount > 300) estimatedHeightMm += 35;

    // Respect page bounds limit
    const availableHeightMm = Math.max(20, bounds.maxY - currentRowTopMm);
    const hMm = Math.min(estimatedHeightMm, availableHeightMm);

    currentRowMaxHeightMm = Math.max(currentRowMaxHeightMm, hMm);
    currentXCol += span;

    const rawFrame: FrameMm = {
      x: Number(xMm.toFixed(2)),
      y: Number(currentRowTopMm.toFixed(2)),
      w: Number(wMm.toFixed(2)),
      h: Number(hMm.toFixed(2)),
      z: index + 1,
    };

    const clampedFrame = clampFrameToPrintableArea(rawFrame, bounds);

    return {
      ...art,
      orderIndex: index,
      frame: clampedFrame,
    };
  });

  return {
    ...page,
    layoutMode: 'free',
    articles: freeArticles,
  };
}

/**
 * Converts a free-placement page back into sequential 12-column auto-flow (freeToAuto).
 * Sorts articles topologically by y (with row tolerance) then x, and projects width to column spans.
 */
export function freeToAuto(
  page: NewspaperPage,
  doc: NewspaperDocument
): FreeToAutoResult {
  const bounds = getPageLayoutBounds(page, doc);
  const metrics = getPhysicalPageMetrics(
    doc.metadata.pageSize,
    doc.metadata.orientation,
    doc.layout.spacingDensity,
    doc.layout.bodyFontSizePt
  );

  const colCount = page.columnCount ?? doc.layout.columnCount ?? 12;
  const gapMm = (metrics.gapPt * 25.4) / 72;
  const totalGapsWidth = (colCount - 1) * gapMm;
  const singleColWidthMm = (bounds.contentWidth - totalGapsWidth) / colCount;

  const lossyWarnings: string[] = [];

  // Sort articles by Y then X
  const sorted = [...page.articles].sort((a, b) => {
    const frameA = a.frame ?? { x: 0, y: 0, w: 100, h: 50 };
    const frameB = b.frame ?? { x: 0, y: 0, w: 100, h: 50 };

    // Group items into rows if their Y delta is within 12mm
    if (Math.abs(frameA.y - frameB.y) > 12) {
      return frameA.y - frameB.y;
    }
    return frameA.x - frameB.x;
  });

  // Check for overlapping blocks
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (a?.frame && b?.frame && checkAabbOverlap(a.frame, b.frame)) {
        lossyWarnings.push(
          `Blocks "${a.headline.slice(0, 20)}" and "${b.headline.slice(0, 20)}" overlap in free layout; serialized into flow order.`
        );
      }
    }
  }

  const convertedArticles: Article[] = sorted.map((art, idx) => {
    const frame = art.frame;
    if (!frame) {
      return { ...art, orderIndex: idx };
    }

    // Project width in mm to nearest integer column span
    const rawSpan = Math.round((frame.w + gapMm) / (singleColWidthMm + gapMm));
    const columnSpan = Math.max(1, Math.min(colCount, rawSpan));

    const exactColMm = columnSpan * singleColWidthMm + (columnSpan - 1) * gapMm;
    if (Math.abs(frame.w - exactColMm) > 15) {
      lossyWarnings.push(
        `Block "${art.headline.slice(0, 20)}" width (${frame.w}mm) snapped to ${columnSpan} columns (${exactColMm.toFixed(1)}mm).`
      );
    }

    return {
      ...art,
      columnSpan,
      orderIndex: idx,
    };
  });

  return {
    page: {
      ...page,
      layoutMode: 'auto',
      articles: convertedArticles,
    },
    lossyWarnings,
  };
}

/**
 * Calculates page fullness metric ("Page X% bhara") by summing frame areas
 * inside the printable area.
 */
export function calculatePageFullness(
  page: NewspaperPage,
  doc: NewspaperDocument
): PageFullnessMetrics {
  const bounds = getPageLayoutBounds(page, doc);
  const totalPrintableAreaMm2 = bounds.contentWidth * bounds.contentHeight;

  if (totalPrintableAreaMm2 <= 0) {
    return {
      totalPrintableAreaMm2: 0,
      usedAreaMm2: 0,
      fullnessPercent: 0,
      displayLabel: '0% भरा',
    };
  }

  let usedAreaMm2 = 0;
  for (const art of page.articles) {
    if (page.layoutMode === 'free' && art.frame) {
      usedAreaMm2 += art.frame.w * art.frame.h;
    } else {
      // In auto mode, estimate area based on columnSpan fraction of page
      const colCount = page.columnCount ?? doc.layout.columnCount ?? 12;
      const spanFraction = Math.min(1, art.columnSpan / colCount);
      // Rough estimation: each standard block takes ~50mm height
      const estimatedBlockArea = (bounds.contentWidth * spanFraction) * 45;
      usedAreaMm2 += estimatedBlockArea;
    }
  }

  const fullnessPercent = Math.min(100, Math.round((usedAreaMm2 / totalPrintableAreaMm2) * 100));

  return {
    totalPrintableAreaMm2: Math.round(totalPrintableAreaMm2),
    usedAreaMm2: Math.round(usedAreaMm2),
    fullnessPercent,
    displayLabel: `${fullnessPercent}% भरा`,
  };
}

/**
 * Searches for the nearest unoccupied rectangular slot for adding a new block.
 * Scans top-to-bottom, left-to-right in 4mm vertical module increments.
 */
export function findNearestFreeSlot(
  page: NewspaperPage,
  doc: NewspaperDocument,
  blockWidthMm: number,
  blockHeightMm: number,
  stepMm: number = 4
): FreeSlotSearchResult {
  const bounds = getPageLayoutBounds(page, doc);
  const w = Math.min(blockWidthMm, bounds.contentWidth);
  const h = Math.min(blockHeightMm, bounds.contentHeight);

  // Scan row by row
  for (let y = bounds.minY; y <= bounds.maxY - h; y += stepMm) {
    for (let x = bounds.minX; x <= bounds.maxX - w; x += stepMm) {
      const candidateFrame: FrameMm = { x, y, w, h, z: 1 };

      const hasCollision = page.articles.some((art) => {
        if (!art.frame) return false;
        return checkAabbOverlap(candidateFrame, art.frame, 0.5);
      });

      if (!hasCollision) {
        return {
          found: true,
          xMm: Number(x.toFixed(2)),
          yMm: Number(y.toFixed(2)),
        };
      }
    }
  }

  return {
    found: false,
    reason: 'Page bhar gaya - naya page jodein?',
  };
}

/**
 * Swaps two blocks in free-layout mode.
 * If sizes differ, the smaller adopts the larger's slot only if it fits inside printable bounds
 * without causing collisions with third-party blocks.
 */
export function swapFrames(
  page: NewspaperPage,
  doc: NewspaperDocument,
  articleIdA: string,
  articleIdB: string
): { success: boolean; page: NewspaperPage; message?: string } {
  const bounds = getPageLayoutBounds(page, doc);
  const artA = page.articles.find((a) => a.id === articleIdA);
  const artB = page.articles.find((a) => a.id === articleIdB);

  if (!artA?.frame || !artB?.frame) {
    return { success: false, page, message: 'Both blocks must have valid frames to swap.' };
  }

  const frameA = artA.frame;
  const frameB = artB.frame;

  // New positions: A takes B's anchor, B takes A's anchor
  const newFrameA: FrameMm = {
    ...frameA,
    x: frameB.x,
    y: frameB.y,
  };

  const newFrameB: FrameMm = {
    ...frameB,
    x: frameA.x,
    y: frameA.y,
  };

  // Clamped candidates
  const clampedA = clampFrameToPrintableArea(newFrameA, bounds);
  const clampedB = clampFrameToPrintableArea(newFrameB, bounds);

  // Check if clamped candidates overlap each other
  if (checkAabbOverlap(clampedA, clampedB)) {
    return {
      success: false,
      page,
      message: 'Donon block swap hone par aapas mein takra rahe hain.',
    };
  }

  // Check if either overlaps any other block
  const otherArticles = page.articles.filter((a) => a.id !== articleIdA && a.id !== articleIdB);

  for (const other of otherArticles) {
    if (other.frame) {
      if (checkAabbOverlap(clampedA, other.frame)) {
        return {
          success: false,
          page,
          message: 'Swap karne ke baad anya block se collision ho raha hai.',
        };
      }
      if (checkAabbOverlap(clampedB, other.frame)) {
        return {
          success: false,
          page,
          message: 'Swap karne ke baad anya block se collision ho raha hai.',
        };
      }
    }
  }

  // Valid swap
  const updatedArticles = page.articles.map((art) => {
    if (art.id === articleIdA) return { ...art, frame: clampedA };
    if (art.id === articleIdB) return { ...art, frame: clampedB };
    return art;
  });

  return {
    success: true,
    page: { ...page, articles: updatedArticles },
  };
}

/**
 * Snapping engine for free-placement dragging and resizing.
 * Evaluates candidate frame against:
 * 1. Page margins and center
 * 2. 12-column horizontal lines
 * 3. 4mm vertical module
 * 4. Sibling edges and centers
 * 5. Equal-gap hints
 */
export function snapFrame(
  candidate: FrameMm,
  page: NewspaperPage,
  doc: NewspaperDocument,
  activeArticleId?: string,
  thresholdMm: number = 3.0
): SnapResult {
  const bounds = getPageLayoutBounds(page, doc);
  const metrics = getPhysicalPageMetrics(
    doc.metadata.pageSize,
    doc.metadata.orientation,
    doc.layout.spacingDensity,
    doc.layout.bodyFontSizePt
  );

  const colCount = page.columnCount ?? doc.layout.columnCount ?? 12;
  const gapMm = (metrics.gapPt * 25.4) / 72;
  const totalGapsWidth = (colCount - 1) * gapMm;
  const singleColWidthMm = (bounds.contentWidth - totalGapsWidth) / colCount;

  let bestX = candidate.x;
  let bestY = candidate.y;
  let minDeltaX = thresholdMm;
  let minDeltaY = thresholdMm;
  const activeGuides: SnapGuide[] = [];

  // 1. Page Margins & Center
  const pageXTargets: Array<{ pos: number; label: string; source: SnapGuide['source'] }> = [
    { pos: bounds.minX, label: 'बायाँ मार्जिन', source: 'page-margin' },
    { pos: bounds.minX + bounds.contentWidth / 2, label: 'पेज केंद्र', source: 'page-center' },
    { pos: bounds.maxX - candidate.w, label: 'दायाँ मार्जिन', source: 'page-margin' },
  ];

  for (const target of pageXTargets) {
    const delta = Math.abs(candidate.x - target.pos);
    if (delta < minDeltaX) {
      minDeltaX = delta;
      bestX = target.pos;
      activeGuides.push({ type: 'x', positionMm: target.pos, label: target.label, source: target.source });
    }
  }

  const pageYTargets: Array<{ pos: number; label: string; source: SnapGuide['source'] }> = [
    { pos: bounds.minY, label: 'शीर्ष मार्जिन', source: 'page-margin' },
    { pos: bounds.minY + bounds.contentHeight / 2, label: 'ऊर्ध्वाधर केंद्र', source: 'page-center' },
    { pos: bounds.maxY - candidate.h, label: 'निचला मार्जिन', source: 'page-margin' },
  ];

  for (const target of pageYTargets) {
    const delta = Math.abs(candidate.y - target.pos);
    if (delta < minDeltaY) {
      minDeltaY = delta;
      bestY = target.pos;
      activeGuides.push({ type: 'y', positionMm: target.pos, label: target.label, source: target.source });
    }
  }

  // 2. 12-Column Horizontal Lines
  for (let c = 0; c <= colCount; c++) {
    const colLeftMm = bounds.minX + c * (singleColWidthMm + gapMm);
    // Snap left edge to column start
    const deltaLeft = Math.abs(candidate.x - colLeftMm);
    if (deltaLeft < minDeltaX) {
      minDeltaX = deltaLeft;
      bestX = colLeftMm;
      activeGuides.push({
        type: 'x',
        positionMm: colLeftMm,
        label: `कॉलम ${c + 1}`,
        source: 'grid-column',
      });
    }

    // Snap right edge to column end
    const colRightMm = colLeftMm - gapMm;
    const deltaRight = Math.abs(candidate.x + candidate.w - colRightMm);
    if (deltaRight < minDeltaX) {
      minDeltaX = deltaRight;
      bestX = colRightMm - candidate.w;
      activeGuides.push({
        type: 'x',
        positionMm: colRightMm,
        label: `कॉलम अंत ${c}`,
        source: 'grid-column',
      });
    }
  }

  // 3. 4mm Vertical Module Grid
  const moduleStepMm = 4.0;
  const nearestModuleY = Math.round((candidate.y - bounds.minY) / moduleStepMm) * moduleStepMm + bounds.minY;
  const deltaModuleY = Math.abs(candidate.y - nearestModuleY);
  if (deltaModuleY < minDeltaY && deltaModuleY < 2.0) {
    minDeltaY = deltaModuleY;
    bestY = nearestModuleY;
    activeGuides.push({
      type: 'y',
      positionMm: nearestModuleY,
      label: '4mm मॉड्यूल',
      source: 'vertical-module',
    });
  }

  // 4. Sibling Edges & Centers
  const siblings = page.articles.filter((a) => a.id !== activeArticleId && a.frame);
  for (const sib of siblings) {
    const sf = sib.frame!;

    // Horizontal alignments: Left-to-Left, Right-to-Right, Center-to-Center, Left-to-Right (+ gap)
    const sibXTargets = [
      { pos: sf.x, label: 'बायाँ संरेखण' },
      { pos: sf.x + sf.w - candidate.w, label: 'दायाँ संरेखण' },
      { pos: sf.x + sf.w / 2 - candidate.w / 2, label: 'केंद्र संरेखण' },
      { pos: sf.x + sf.w + gapMm, label: `समान अंतर (${gapMm.toFixed(1)}mm)` },
      { pos: sf.x - candidate.w - gapMm, label: `समान अंतर (${gapMm.toFixed(1)}mm)` },
    ];

    for (const st of sibXTargets) {
      const delta = Math.abs(candidate.x - st.pos);
      if (delta < minDeltaX) {
        minDeltaX = delta;
        bestX = st.pos;
        activeGuides.push({ type: 'x', positionMm: st.pos, label: st.label, source: 'sibling-edge' });
      }
    }

    // Vertical alignments: Top-to-Top, Bottom-to-Bottom, Center-to-Center, Top-to-Bottom (+ gap)
    const sibYTargets = [
      { pos: sf.y, label: 'शीर्ष संरेखण' },
      { pos: sf.y + sf.h - candidate.h, label: 'निचला संरेखण' },
      { pos: sf.y + sf.h / 2 - candidate.h / 2, label: 'ऊर्ध्वाधर केंद्र' },
      { pos: sf.y + sf.h + gapMm, label: `समान अंतर (${gapMm.toFixed(1)}mm)` },
      { pos: sf.y - candidate.h - gapMm, label: `समान अंतर (${gapMm.toFixed(1)}mm)` },
    ];

    for (const st of sibYTargets) {
      const delta = Math.abs(candidate.y - st.pos);
      if (delta < minDeltaY) {
        minDeltaY = delta;
        bestY = st.pos;
        activeGuides.push({ type: 'y', positionMm: st.pos, label: st.label, source: 'sibling-edge' });
      }
    }
  }

  // Strict clamp to printable area bounds
  const clamped = clampFrameToPrintableArea(
    { ...candidate, x: bestX, y: bestY },
    bounds
  );

  return {
    frame: clamped,
    snappedX: Math.abs(clamped.x - candidate.x) > 0.05,
    snappedY: Math.abs(clamped.y - candidate.y) > 0.05,
    activeGuides,
  };
}
