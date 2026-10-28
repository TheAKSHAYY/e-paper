import React, { useState, useRef } from 'react';
import type {
  NewspaperPage,
  NewspaperDocument,
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  Article,
  FrameMm,
} from '@epaper-studio/document-schema';
import {
  getPageDimensions,
  getImageObjectPosition,
  getImageAspectRatio,
  resolvePageColumnCount,
} from '@epaper-studio/document-schema';
import { THEME_TOKENS } from '@epaper-studio/ui';
import {
  getMastheadEmblemSvg,
  getPhysicalPageMetrics,
  screenToPageMm,
} from '@epaper-studio/template-engine';
import { FreeLayoutLayer } from './FreeLayoutLayer';

export interface NewspaperCanvasProps {
  page: NewspaperPage;
  pageIndex: number;
  totalPages: number;
  masthead: MastheadConfig;
  layout: NewspaperLayoutConfig;
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  scale?: number;
  selectedArticleId: string | null;
  usePhysicalCanvasCoordinates?: boolean;
  useFreeLayout?: boolean;
  doc?: NewspaperDocument;
  onSelectArticle: (articleId: string) => void;
  onMoveArticleUp: (articleId: string) => void;
  onMoveArticleDown: (articleId: string) => void;
  onAdjustColumnSpan: (articleId: string, delta: number) => void;
  onAddBlock?: (blockTemplate: Partial<Article>) => void;
  onAddPage?: () => void;
  isMastheadSelected?: boolean;
  onSelectMasthead?: () => void;
  onUpdateArticleFrame?: (articleId: string, frame: FrameMm) => void;
  onSwapArticles?: (idA: string, idB: string) => void;
  onTogglePageLayoutMode?: (mode: 'auto' | 'free') => void;
}

export const NewspaperCanvas: React.FC<NewspaperCanvasProps> = ({
  page,
  pageIndex,
  totalPages,
  masthead,
  layout,
  pageSize,
  orientation,
  scale = 1.0,
  selectedArticleId,
  usePhysicalCanvasCoordinates = true,
  useFreeLayout = false,
  doc,
  onSelectArticle,
  onMoveArticleUp: _onMoveArticleUp,
  onMoveArticleDown: _onMoveArticleDown,
  onAdjustColumnSpan: _onAdjustColumnSpan,
  onAddBlock,
  onAddPage,
  isMastheadSelected = false,
  onSelectMasthead,
  onUpdateArticleFrame,
  onSwapArticles,
  onTogglePageLayoutMode,
}) => {
  const sheetCanvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const isFirstPage = pageIndex === 0;
  const pageNumber = page.pageNumber ?? pageIndex + 1;
  const columnCount = resolvePageColumnCount({ layout }, page);
  const columnRule = layout.columnRule;
  const density = layout.spacingDensity;

  // Physical coordinates derived via template-engine shared metrics
  const physicalMetrics = getPhysicalPageMetrics(
    pageSize,
    orientation,
    density,
    layout.bodyFontSizePt
  );

  // Strict Physical Page Dimensions & Fixed Aspect Ratio (Requirement 1)
  const dimensions = getPageDimensions(pageSize, orientation);
  const aspectRatio = dimensions.aspectRatio ?? dimensions.widthPt / dimensions.heightPt;
  const legacyBaseWidth = orientation === 'landscape' ? 1080 : 800;
  const legacyBaseHeight = Math.round(legacyBaseWidth / aspectRatio);

  const canvasWidthPx = usePhysicalCanvasCoordinates ? physicalMetrics.widthPx : legacyBaseWidth;
  const canvasHeightPx = usePhysicalCanvasCoordinates ? physicalMetrics.heightPx : legacyBaseHeight;
  const exactWidthPx = Math.round(canvasWidthPx * scale);
  const exactHeightPx = Math.round(canvasHeightPx * scale);

  // Spacing scales cleanly with visual zoom
  const legacyPaddingPx = density === 'compact' ? 22 : density === 'spacious' ? 38 : 28;
  const legacyGapPx = density === 'compact' ? 12 : density === 'spacious' ? 22 : 16;

  const paddingVal = usePhysicalCanvasCoordinates
    ? `${physicalMetrics.paddingPt}pt`
    : `${legacyPaddingPx}px`;
  const gapVal = usePhysicalCanvasCoordinates
    ? `${physicalMetrics.gapPt}pt`
    : `${legacyGapPx}px`;
  const colRuleGutter = usePhysicalCanvasCoordinates
    ? `${physicalMetrics.gapPt / 2}pt`
    : `${Math.round(legacyGapPx / 2)}px`;

  // Scale-independent visual borders & outlines (~1.5px constant visual size)
  const visualOutlineWidth = Math.max(0.5, 1.5 / scale);
  const visualOutlineOffset = Math.max(1, 2 / scale);
  const visualMastheadOutline = Math.max(1, 2 / scale);
  const visualMastheadOffset = Math.max(1, 4 / scale);
  const visualDropBorderWidth = Math.max(1, 2 / scale);

  // Estimate content capacity
  const totalWords = page.articles.reduce(
    (acc, art) => acc + art.body.trim().split(/\s+/).filter(Boolean).length,
    0
  );
  const wordBudget =
    pageSize === 'broadsheet'
      ? orientation === 'landscape'
        ? 2800
        : 3500
      : pageSize === 'berliner'
        ? 2600
        : pageSize === 'a3'
          ? 2800
          : 1800;
  const exceedsBudget = totalWords > wordBudget || page.articles.length > 7;

  // Drag and drop handler with physical screen-to-page coordinate conversion
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      if (sheetCanvasRef.current) {
        const rect = sheetCanvasRef.current.getBoundingClientRect();
        const pagePointMm = screenToPageMm(
          { clientX: e.clientX, clientY: e.clientY },
          rect,
          scale,
          { widthMm: physicalMetrics.widthMm, heightMm: physicalMetrics.heightMm }
        );
        if (process.env.NODE_ENV !== 'production') {
          // Log or use point if debugging drop placement
          console.debug('Dropped block at page coordinate (mm):', pagePointMm);
        }
      }
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr && onAddBlock) {
        const block = JSON.parse(dataStr);
        onAddBlock(block);
      }
    } catch (err) {
      console.error('Failed to parse dropped newspaper block', err);
    }
  };

  const emblemSvg = getMastheadEmblemSvg(masthead.emblem, masthead.customEmblemUrl);

  const getRuleBorderStyle = (): React.CSSProperties => {
    switch (masthead.ruleStyle) {
      case 'ornate-double':
        return { borderBottom: '3.5px double #111111' };
      case 'oxford-thick-thin':
        return { borderBottom: '3px solid #111111' };
      case 'classic-double':
        return { borderBottom: '2.5px double #111111' };
      case 'single-hairline':
        return { borderBottom: '1px solid #111111' };
      case 'none':
        return { borderBottom: 'none' };
      default:
        return { borderBottom: '3.5px double #111111' };
    }
  };

  const renderArticleCard = (article: Article, isSelected: boolean, isFreeLayout: boolean) => {
    const span = Math.min(columnCount, Math.max(1, article.columnSpan));
    const isLead = article.priority === 'lead';
    const headlineWeight = layout.headlineWeight ?? (isLead ? 900 : 700);
    const hasPhoto = Boolean(article.imageUrl && article.imagePlacement !== 'none');

    const photoAspect = getImageAspectRatio(article.imageAspect);
    const photoObjectPosition = getImageObjectPosition(article);
    const photoObjectFit = article.imageFit ?? 'cover';
    const isSide = article.imagePlacement === 'side';

    const renderPhoto = () => {
      if (!hasPhoto) return null;
      return (
        <figure
          data-image-placement={article.imagePlacement}
          data-image-fit={photoObjectFit}
          style={{
            margin: 0,
            padding: 0,
            width: isSide ? '42%' : '100%',
            float: isSide ? 'left' : 'none',
            marginRight: isSide ? '8px' : '0',
            marginBottom: isSide ? '4px' : '8px',
            clear: article.imagePlacement === 'bottom' ? 'both' : 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: photoAspect,
              overflow: 'hidden',
              border: '1px solid #222',
              borderRadius: '1px',
              backgroundColor: '#f3f4f6',
            }}
          >
            <img
              src={article.imageUrl}
              alt={article.imageCaption || article.headline}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: photoObjectFit === 'fill' ? 'fill' : photoObjectFit,
                objectPosition: photoObjectPosition,
                display: 'block',
              }}
            />
          </div>
          {(article.imageCaption || article.imageCredit) && (
            <figcaption
              style={{
                fontSize: '10px',
                color: '#444',
                fontStyle: 'italic',
                marginTop: '3px',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {article.imageCaption && <span>{article.imageCaption} </span>}
              {article.imageCredit && (
                <span
                  style={{
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    color: '#666',
                  }}
                >
                  ({article.imageCredit})
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );
    };

    const customBorders = article.borders;
    const borderStyles: React.CSSProperties = {
      borderTop:
        customBorders?.top && customBorders.top.style !== 'none'
          ? `${customBorders.top.width}px ${customBorders.top.style} ${customBorders.top.color}`
          : undefined,
      borderRight:
        customBorders?.right && customBorders.right.style !== 'none'
          ? `${customBorders.right.width}px ${customBorders.right.style} ${customBorders.right.color}`
          : !isFreeLayout && columnRule && (usePhysicalCanvasCoordinates || span < columnCount)
            ? usePhysicalCanvasCoordinates
              ? '1px solid #c8c5bc'
              : '1px solid #d5d0c4'
            : undefined,
      borderBottom:
        customBorders?.bottom && customBorders.bottom.style !== 'none'
          ? `${customBorders.bottom.width}px ${customBorders.bottom.style} ${customBorders.bottom.color}`
          : !isFreeLayout && usePhysicalCanvasCoordinates
            ? undefined
            : !isFreeLayout
              ? '1px solid #e0ded6'
              : undefined,
      borderLeft:
        customBorders?.left && customBorders.left.style !== 'none'
          ? `${customBorders.left.width}px ${customBorders.left.style} ${customBorders.left.color}`
          : undefined,
    };

    const isHindi =
      Boolean(article.headline?.match(/[\u0900-\u097F]/)) ||
      Boolean(article.body?.match(/[\u0900-\u097F]/)) ||
      Boolean(article.subheadline?.match(/[\u0900-\u097F]/)) ||
      layout.headlineFont?.toLowerCase().includes('devanagari') ||
      layout.bodyFont?.toLowerCase().includes('devanagari') ||
      ['Gotu', 'Hind', 'Mukta', 'Rozha One', 'Yatra One', 'Tiro Devanagari Hindi', 'Noto Serif Devanagari'].some(
        (f) => layout.bodyFont?.includes(f) || layout.headlineFont?.includes(f)
      );

    return (
      <article
        key={article.id}
        data-testid={`article-card-${article.id}`}
        data-article-id={article.id}
        className="newspaper-article"
        lang={isHindi ? 'hi' : 'en'}
        onClick={() => onSelectArticle(article.id)}
        style={{
          gridColumn: isFreeLayout ? undefined : `span ${span}`,
          width: isFreeLayout ? '100%' : undefined,
          height: isFreeLayout ? '100%' : undefined,
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: article.paddingPx ? `${article.paddingPx}px` : isFreeLayout ? '6px' : undefined,
          paddingBottom: usePhysicalCanvasCoordinates ? undefined : '12px',
          ...borderStyles,
          position: 'relative',
          cursor: 'pointer',
          outline: !isFreeLayout && isSelected ? `${visualOutlineWidth}px solid #2563eb` : 'none',
          outlineOffset: `${visualOutlineOffset}px`,
          backgroundColor: article.backgroundColor ?? 'transparent',
          borderRadius: '1px',
          transition: 'outline 0.15s ease',
          hyphens: isHindi ? 'manual' : undefined,
          WebkitHyphens: isHindi ? 'manual' : undefined,
          ...(!isFreeLayout && columnRule && (usePhysicalCanvasCoordinates || span < columnCount) && !customBorders?.right
            ? {
                paddingRight: colRuleGutter,
              }
            : {}),
        }}
      >
        {/* Top Photo if placement === 'top' */}
        {article.imagePlacement === 'top' && renderPhoto()}

        {/* Headline, Subheadline & Byline */}
        <header
          className={`article-header priority-${article.priority}`}
          style={{
            marginBottom: usePhysicalCanvasCoordinates
              ? `${physicalMetrics.spacingPt.articleHeaderMarginBottomPt}pt`
              : '6px',
          }}
        >
          {usePhysicalCanvasCoordinates ? (
            <>
              {article.subheadline && (
                <p
                  className="article-deck"
                  style={{
                    margin: `0 0 ${physicalMetrics.spacingPt.deckMarginBottomPt}pt 0`,
                    fontSize: `${physicalMetrics.typographyPt.deckFontSizePt}pt`,
                    lineHeight: 1.35,
                    fontFamily: layout.subheadlineFont || layout.headlineFont,
                    color: '#444',
                  }}
                >
                  {article.subheadline}
                </p>
              )}
              <h2
                className="article-headline"
                style={{
                  fontFamily: layout.headlineFont,
                  fontSize: isLead
                    ? `${physicalMetrics.headlineSizesPt.lead}pt`
                    : article.priority === 'major'
                      ? `${physicalMetrics.headlineSizesPt.major}pt`
                      : article.priority === 'minor'
                        ? `${physicalMetrics.headlineSizesPt.minor}pt`
                        : `${physicalMetrics.headlineSizesPt.brief}pt`,
                  fontWeight: headlineWeight,
                  lineHeight: 1.15,
                  margin: 0,
                  color: article.textColor ?? THEME_TOKENS.inkPrimary,
                  letterSpacing: isLead ? '-0.3pt' : undefined,
                }}
              >
                {article.headline}
              </h2>
              {article.byline && (
                <div
                  className="article-byline"
                  style={{
                    fontSize: `${physicalMetrics.typographyPt.bylineFontSizePt}pt`,
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5pt',
                    marginTop: `${physicalMetrics.spacingPt.bylineMarginTopPt}pt`,
                    fontFamily: "'Hind', 'Noto Serif Devanagari', sans-serif",
                  }}
                >
                  {article.byline}
                </div>
              )}
            </>
          ) : (
            <>
              {article.kickerText && (
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#b91c1c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '2px',
                  }}
                >
                  {article.kickerText}
                </div>
              )}
              <h2
                style={{
                  fontFamily: layout.headlineFont,
                  fontSize: isLead
                    ? '30px'
                    : article.priority === 'major'
                      ? '22px'
                      : article.priority === 'minor'
                        ? '15px'
                        : '18px',
                  fontWeight: headlineWeight,
                  lineHeight: 1.15,
                  margin: '0 0 4px 0',
                  color: article.textColor ?? THEME_TOKENS.inkPrimary,
                  letterSpacing: '-0.01em',
                }}
              >
                {article.headline}
              </h2>
              {article.subheadline && (
                <p
                  style={{
                    margin: '3px 0 5px 0',
                    fontSize: isLead ? '13px' : '11.5px',
                    lineHeight: 1.35,
                    fontFamily: layout.subheadlineFont || layout.headlineFont,
                    fontStyle: 'italic',
                    color: '#333',
                  }}
                >
                  {article.subheadline}
                </p>
              )}
              {(article.byline || article.dateline) && (
                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#555',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    borderTop: isLead ? '1px solid #222' : 'none',
                    paddingTop: isLead ? '3px' : 0,
                    marginBottom: '6px',
                  }}
                >
                  {article.byline}
                </div>
              )}
            </>
          )}
        </header>

        {/* Middle Photo if placement === 'middle' */}
        {article.imagePlacement === 'middle' && renderPhoto()}

        {/* SPECIALIZED ELEMENT RENDERING: Short News, Advertisement, or Rashifal */}
        {article.elementType === 'short-news' && article.shortNewsItems && article.shortNewsItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
            {article.shortNewsItems.map((item, snIdx) => (
              <div
                key={snIdx}
                style={{
                  paddingBottom: '6px',
                  borderBottom: snIdx < (article.shortNewsItems?.length ?? 0) - 1 ? '1px dotted #ccc' : 'none',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 2px 0',
                    fontSize: usePhysicalCanvasCoordinates ? '7.5pt' : '12px',
                    fontWeight: 700,
                    color: '#111',
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: usePhysicalCanvasCoordinates ? '7pt' : '11px',
                    color: '#444',
                    lineHeight: 1.35,
                  }}
                >
                  {item.snippet}
                </p>
              </div>
            ))}
          </div>
        ) : article.elementType === 'advertisement' ? (
          <div style={{ margin: '4px 0' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: usePhysicalCanvasCoordinates ? '6.5pt' : '9px',
                textTransform: 'uppercase',
                color: '#666',
                fontWeight: 700,
                letterSpacing: '0.05em',
                borderBottom: '1px solid #ccc',
                paddingBottom: '2px',
                marginBottom: '4px',
              }}
            >
              <span>विज्ञापन / Advertisement</span>
              {article.advertisementData?.sponsor && (
                <span>{article.advertisementData.sponsor}</span>
              )}
            </div>
            {article.body && (
              <p
                style={{
                  margin: '4px 0',
                  fontSize: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.bodyFontSizePt}pt`
                    : '12px',
                  lineHeight: 1.4,
                  color: '#222',
                }}
              >
                {article.body}
              </p>
            )}
            {(article.advertisementData?.phone || article.advertisementData?.callToAction) && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '3px',
                  fontSize: usePhysicalCanvasCoordinates ? '7.5pt' : '11px',
                  fontWeight: 700,
                  color: '#0f172a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{article.advertisementData.callToAction || 'संपर्क करें:'}</span>
                <span>{article.advertisementData.phone}</span>
              </div>
            )}
          </div>
        ) : article.elementType === 'rashifal' && article.rashifalItems && article.rashifalItems.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: span >= 6 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: '6px',
              margin: '4px 0',
            }}
          >
            {article.rashifalItems.map((rashi) => (
              <div
                key={rashi.sign}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '5px',
                  backgroundColor: '#fffdfa',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '2px',
                    marginBottom: '3px',
                    fontSize: usePhysicalCanvasCoordinates ? '7.5pt' : '11px',
                    fontWeight: 700,
                    color: '#b45309',
                  }}
                >
                  <span>{rashi.rashi}</span>
                  <span
                    style={{
                      fontSize: usePhysicalCanvasCoordinates ? '7pt' : '10px',
                      color: '#64748b',
                    }}
                  >
                    ({rashi.sign})
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: usePhysicalCanvasCoordinates ? '7pt' : '9.5px',
                    lineHeight: 1.3,
                    color: '#334155',
                  }}
                >
                  {rashi.prediction}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Standard Body Paragraphs (with Side Photo if placement === 'side') */
          <div
            lang={isHindi ? 'hi' : 'en'}
            style={{
              fontSize: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.bodyFontSizePt}pt`
                : `${layout.bodyFontSizePt ? Math.round(layout.bodyFontSizePt * 1.33) : 13}px`,
              lineHeight: Math.max(1.4, 1.45),
              color: article.textColor ?? THEME_TOKENS.inkSecondary,
              fontFamily: layout.bodyFont,
              textAlign: 'justify',
              textJustify: 'inter-word',
              hyphens: isHindi ? 'manual' : 'auto',
              WebkitHyphens: isHindi ? 'manual' : 'auto',
            }}
          >
            {article.imagePlacement === 'side' && renderPhoto()}

            {usePhysicalCanvasCoordinates && article.kickerText && (
              <div
                className="article-kicker"
                style={{
                  color: '#b91c1c',
                  fontFamily: "'Hind', 'Noto Serif Devanagari', sans-serif",
                  fontWeight: 700,
                  fontSize: `${physicalMetrics.typographyPt.kickerFontSizePt}pt`,
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                {article.kickerText}
              </div>
            )}

            {article.dateline &&
              (usePhysicalCanvasCoordinates ? (
                <span
                  className="article-dateline"
                  style={{
                    color: '#121212',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.9em',
                    letterSpacing: '0.5pt',
                  }}
                >
                  {article.dateline}{' '}
                </span>
              ) : (
                <strong style={{ color: '#111', marginRight: '4px' }}>
                  {article.dateline}
                </strong>
              ))}
            {article.body.split(/\n\s*\n/).map((para, pIdx) => (
              <p
                key={pIdx}
                className="article-para"
                style={{
                  margin: usePhysicalCanvasCoordinates
                    ? `0 0 ${physicalMetrics.spacingPt.paraMarginBottomPt}pt 0`
                    : '0 0 7px 0',
                  textIndent: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.paraTextIndentPt}pt`
                    : undefined,
                }}
              >
                {usePhysicalCanvasCoordinates
                  ? para.split('\n').map((line, lIdx, arr) => (
                      <React.Fragment key={lIdx}>
                        {line}
                        {lIdx < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))
                  : para}
              </p>
            ))}
          </div>
        )}

        {/* Bottom Photo if placement === 'bottom' */}
        {article.imagePlacement === 'bottom' && renderPhoto()}
      </article>
    );
  };

  return (
    <div
      className="newspaper-canvas-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 48px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* High Density / Overflow Warning Banner (Requirement 1) */}
      {exceedsBudget && (
        <div
          role="alert"
          style={{
            width: `${exactWidthPx}px`,
            maxWidth: '100%',
            marginBottom: '14px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            padding: '10px 14px',
            color: '#92400e',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>
              <strong>Page Boundary Warning:</strong> Content volume ({totalWords.toLocaleString()}{' '}
              words, {page.articles.length} stories) exceeds Page {pageNumber} physical capacity.
              Stories beyond boundary will not fit in print.
            </div>
          </div>
          {onAddPage && (
            <button
              onClick={onAddPage}
              style={{
                backgroundColor: '#b45309',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Add Next Page
            </button>
          )}
        </div>
      )}

      {/* Scaled Layout Container — occupies exact visual dimensions in the scrollable viewport */}
      <div
        className="newspaper-canvas-scale-container"
        style={{
          width: `${exactWidthPx}px`,
          height: `${exactHeightPx}px`,
          minWidth: `${exactWidthPx}px`,
          maxWidth: `${exactWidthPx}px`,
          minHeight: `${exactHeightPx}px`,
          maxHeight: `${exactHeightPx}px`,
          position: 'relative',
          flexShrink: 0,
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      >
        {/* The Physical Newspaper Sheet Canvas (Strict Fixed Size & Pure White Background) */}
        <div
          ref={sheetCanvasRef}
          className="newspaper-sheet-canvas"
          data-testid="newspaper-sheet-canvas"
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDraggingOver) setIsDraggingOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDraggingOver(false);
            }
          }}
          onDrop={handleDrop}
          style={{
            width: `${canvasWidthPx}px`,
            height: `${canvasHeightPx}px`,
            minWidth: `${canvasWidthPx}px`,
            maxWidth: `${canvasWidthPx}px`,
            minHeight: `${canvasHeightPx}px`,
            maxHeight: `${canvasHeightPx}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundColor: '#ffffff', // Requirement 4: Pure White Print Paper
            color: THEME_TOKENS.inkPrimary,
            fontFamily: layout.bodyFont,
            boxShadow: usePhysicalCanvasCoordinates
              ? '0 0 0 1px #d1d5db, 0 12px 40px rgba(0, 0, 0, 0.22), 0 2px 10px rgba(0, 0, 0, 0.12)'
              : '0 12px 40px rgba(0, 0, 0, 0.22), 0 2px 10px rgba(0, 0, 0, 0.12)',
            border: usePhysicalCanvasCoordinates ? 'none' : '1px solid #d1d5db',
            padding: paddingVal,
            boxSizing: 'border-box',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease',
          }}
        >
        {/* ==========================================================
         * 1. PAGE HEADER: MASTHEAD ON PAGE 1, FOLIO ON PAGE 2+
         * ========================================================== */}
        {isFirstPage ? (
          <header
            onClick={(e) => {
              e.stopPropagation();
              onSelectMasthead?.();
            }}
            data-testid="masthead-section"
            className="masthead-section"
            style={{
              ...getRuleBorderStyle(),
              paddingBottom: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.spacingPt.mastheadPaddingBottomPt}pt`
                : '8px',
              marginBottom: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.spacingPt.mastheadMarginBottomPt}pt`
                : '16px',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
              outline: isMastheadSelected
                ? `${visualMastheadOutline}px solid #2563eb`
                : '1px dashed transparent',
              outlineOffset: `${visualMastheadOffset}px`,
              borderRadius: isMastheadSelected ? '4px' : '0px',
              transition: 'outline 0.15s ease',
            }}
          >
            {/* Top Metadata Row (Ear Strip) */}
            {masthead.showTopStrip !== false && (
              <div
                className="masthead-top-strip"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #222222',
                  paddingBottom: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.topStripPaddingBottomPt}pt`
                    : '3px',
                  marginBottom: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.topStripMarginBottomPt}pt`
                    : '6px',
                  fontSize: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.typographyPt.topStripFontSizePt}pt`
                    : '10.5px',
                  color: '#333333',
                  fontFamily: usePhysicalCanvasCoordinates
                    ? "'Hind', 'Noto Serif Devanagari', sans-serif"
                    : "'Inter', sans-serif",
                  letterSpacing: usePhysicalCanvasCoordinates ? '0.2pt' : '0.02em',
                  lineHeight: usePhysicalCanvasCoordinates ? 1.25 : undefined,
                }}
              >
                {/* Weather & AQI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {masthead.showWeather !== false && (
                    <div>
                      <strong style={{
                        color: '#111111',
                        fontSize: usePhysicalCanvasCoordinates
                          ? `${physicalMetrics.typographyPt.weatherLabelFontSizePt}pt`
                          : undefined
                      }}>मौसम: </strong>
                      <span>
                        {masthead.weatherCity || 'नई दिल्ली'} {masthead.temperature || '25°C'} •{' '}
                        {masthead.weatherCondition || 'साफ़ आसमान'}
                      </span>
                    </div>
                  )}
                  {masthead.showAirQuality !== false && masthead.airQuality && (
                    <div style={{
                      color: '#475569',
                      fontSize: usePhysicalCanvasCoordinates
                        ? `${physicalMetrics.typographyPt.taglineFontSizePt}pt`
                        : '10px'
                    }}>
                      <span>{masthead.airQuality}</span>
                    </div>
                  )}
                </div>

                {/* Tagline & Establishment */}
                <div
                  style={{
                    fontFamily: "'Noto Serif Devanagari', serif",
                    fontSize: usePhysicalCanvasCoordinates
                      ? `${physicalMetrics.typographyPt.taglineFontSizePt}pt`
                      : '11px',
                    color: '#333333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: usePhysicalCanvasCoordinates ? '4pt' : '6px',
                  }}
                >
                  {masthead.showTagline !== false && (
                    <span style={{ fontStyle: 'italic' }}>
                      {masthead.tagline || masthead.subtitle || 'सत्य, निष्पक्षता और जनसेवा का प्रतीक'}
                    </span>
                  )}
                  {masthead.showTagline !== false && masthead.showEstablishment !== false && (
                    <span style={{ color: '#888888', fontSize: usePhysicalCanvasCoordinates ? '7pt' : undefined }}>•</span>
                  )}
                  {masthead.showEstablishment !== false && (
                    <strong style={{
                      color: '#111111',
                      fontSize: usePhysicalCanvasCoordinates
                        ? `${physicalMetrics.typographyPt.establishmentFontSizePt}pt`
                        : undefined
                    }}>
                      स्थापना {masthead.establishmentYear || '1947'}
                    </strong>
                  )}
                </div>

                {/* Price & Registration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: usePhysicalCanvasCoordinates ? '8pt' : '8px' }}>
                  {masthead.showPrice !== false && (
                    <div>
                      <strong style={{ color: '#111111' }}>{masthead.price || 'मूल्य ₹5.00'}</strong>
                    </div>
                  )}
                  {masthead.showPostalReg !== false && masthead.postalRegNumber && (
                    <div style={{
                      color: '#64748b',
                      fontSize: usePhysicalCanvasCoordinates
                        ? `${physicalMetrics.typographyPt.topStripFontSizePt}pt`
                        : '10px'
                    }}>
                      <span>{masthead.postalRegNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Main Masthead Row */}
            <div
              className="masthead-main-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  masthead.alignment === 'left'
                    ? 'flex-start'
                    : masthead.alignment === 'justified'
                      ? 'space-between'
                      : 'center',
                gap: usePhysicalCanvasCoordinates ? '14pt' : '16px',
                padding: usePhysicalCanvasCoordinates ? '4pt 0 6pt 0' : undefined,
                margin: usePhysicalCanvasCoordinates ? 0 : '4px 0 8px',
                textAlign:
                  masthead.alignment === 'left'
                    ? 'left'
                    : masthead.alignment === 'justified'
                      ? 'justify'
                      : 'center',
              }}
            >
              {masthead.showEmblem && emblemSvg && (
                <div
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
                  dangerouslySetInnerHTML={{ __html: emblemSvg }}
                />
              )}
              <h1
                data-testid="masthead-title"
                style={{
                  fontFamily: masthead.fontFamily || layout.mastheadFont || "'Rozha One', serif",
                  fontSize: usePhysicalCanvasCoordinates
                    ? `${masthead.fontSizePt || 48}pt`
                    : `${masthead.fontSizePt || 52}px`,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  margin: 0,
                  color: THEME_TOKENS.inkPrimary,
                  letterSpacing: '-0.02em',
                }}
              >
                {masthead.title}
              </h1>
            </div>

            {/* 3. Masthead Bottom Folio Strip */}
            {masthead.showBottomStrip !== false && (
              <div
                className="masthead-bottom-strip"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #111111',
                  paddingTop: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.bottomStripPaddingTopPt}pt`
                    : '4px',
                  marginTop: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.bottomStripMarginTopPt}pt`
                    : undefined,
                  fontSize: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.typographyPt.bottomStripFontSizePt}pt`
                    : '11px',
                  fontFamily: usePhysicalCanvasCoordinates
                    ? "'Hind', 'Noto Serif Devanagari', sans-serif"
                    : undefined,
                  lineHeight: usePhysicalCanvasCoordinates ? 1.5 : undefined,
                  fontWeight: 600,
                  color: '#222222',
                  letterSpacing: usePhysicalCanvasCoordinates ? '0.3pt' : '0.03em',
                }}
              >
                <div>
                  {masthead.showVolumeIssue !== false && (
                    <span>
                      {masthead.issueNumber ||
                        `${masthead.volumeYear || 'वर्ष 78'} • ${masthead.issueCount || 'अंक 142'}`}
                    </span>
                  )}
                </div>
                <div>
                  {masthead.showDate !== false && (
                    <span style={{ fontSize: usePhysicalCanvasCoordinates ? undefined : '11.5px', fontFamily: "'Noto Serif Devanagari', serif" }}>
                      {masthead.dayOfWeek ? `${masthead.dayOfWeek}, ` : ''}
                      {masthead.date || '28 अक्टूबर 2026'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {masthead.showEdition !== false && (
                    <span>{masthead.edition || 'प्रातःकालीन मुख्य संस्करण'}</span>
                  )}
                  {masthead.showPostalReg !== false && masthead.pageCountLabel && (
                    <span style={{ color: '#64748b', fontSize: '10px' }}>
                      • {masthead.pageCountLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 4. Secondary Header / Sub-Banner (Requirement 3) */}
            {masthead.showSecondaryHeader && masthead.secondaryHeaderTitle && (
              <div
                style={{
                  borderTop: '1px solid #111111',
                  borderBottom: '1px solid #111111',
                  marginTop: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.topStripMarginBottomPt}pt`
                    : '5px',
                  padding: usePhysicalCanvasCoordinates ? '2pt 4pt' : '3px 6px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.typographyPt.bottomStripFontSizePt}pt`
                    : '11px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '0.02em',
                }}
              >
                <span>{masthead.secondaryHeaderTitle}</span>
                {masthead.secondaryHeaderSubtitle && (
                  <span style={{
                    fontSize: usePhysicalCanvasCoordinates
                      ? `${physicalMetrics.typographyPt.bylineFontSizePt}pt`
                      : '10px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    {masthead.secondaryHeaderSubtitle}
                  </span>
                )}
              </div>
            )}

            {/* 5. Highlighted Announcement / Breaking Strip (Requirement 3) */}
            {masthead.showAnnouncementStrip && masthead.announcementStripText && (
              <div
                style={{
                  marginTop: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.spacingPt.topStripMarginBottomPt}pt`
                    : '5px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  padding: usePhysicalCanvasCoordinates ? '3pt 8pt' : '3px 10px',
                  borderRadius: '2px',
                  fontSize: usePhysicalCanvasCoordinates
                    ? `${physicalMetrics.typographyPt.topStripFontSizePt}pt`
                    : '10.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(185,28,28,0.2)',
                }}
              >
                <span style={{
                  backgroundColor: '#ffffff',
                  color: '#b91c1c',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontSize: usePhysicalCanvasCoordinates ? '7pt' : '9px'
                }}>
                  विशेष
                </span>
                <span>{masthead.announcementStripText}</span>
              </div>
            )}
          </header>
        ) : (
          /* Inside Page Running Folio */
          <header
            style={{
              borderBottom: '2px solid #111111',
              paddingBottom: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.spacingPt.bottomStripPaddingTopPt}pt`
                : '6px',
              marginBottom: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.spacingPt.mastheadMarginBottomPt}pt`
                : '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.typographyPt.topStripFontSizePt}pt`
                : '12px',
              fontWeight: 600,
              color: '#111',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: layout.mastheadFont || "'Rozha One', serif",
                fontSize: usePhysicalCanvasCoordinates ? '12pt' : '15px'
              }}
            >
              {masthead.title}
            </div>
            <div
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                fontSize: usePhysicalCanvasCoordinates
                  ? `${physicalMetrics.typographyPt.topStripFontSizePt}pt`
                  : '12px',
                color: '#333',
              }}
            >
              {page.sectionTitle ? `${page.sectionTitle} • ` : ''}पृष्ठ {pageNumber} / {totalPages}
            </div>
            <div style={{
              fontSize: usePhysicalCanvasCoordinates
                ? `${physicalMetrics.typographyPt.bylineFontSizePt}pt`
                : '11px',
              color: '#555'
            }}>
              {masthead.date} • {masthead.edition || 'अंदर के पृष्ठ'}
            </div>
          </header>
        )}

        {/* 1.5 LAYOUT SWITCHER PILL (when useFreeLayout is enabled) */}
        {useFreeLayout && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: '6px',
              gap: '8px',
              zIndex: 35,
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                overflow: 'hidden',
                fontSize: '11px',
              }}
            >
              <button
                onClick={() => onTogglePageLayoutMode?.('auto')}
                data-testid="page-layout-auto-btn"
                style={{
                  padding: '3px 9px',
                  backgroundColor: page.layoutMode !== 'free' ? '#2563eb' : 'transparent',
                  color: page.layoutMode !== 'free' ? '#ffffff' : '#475569',
                  border: 'none',
                  fontWeight: page.layoutMode !== 'free' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                📄 ऑटो-ग्रिड
              </button>
              <button
                onClick={() => onTogglePageLayoutMode?.('free')}
                data-testid="page-layout-free-btn"
                style={{
                  padding: '3px 9px',
                  backgroundColor: page.layoutMode === 'free' ? '#2563eb' : 'transparent',
                  color: page.layoutMode === 'free' ? '#ffffff' : '#475569',
                  border: 'none',
                  fontWeight: page.layoutMode === 'free' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                📐 मुक्त लेआउट (mm)
              </button>
            </div>
          </div>
        )}

        {/* ==========================================================
         * 2. ARTICLES LAYER: FREE-PLACEMENT OR AUTO-FLOW MULTI-COLUMN GRID
         * ========================================================== */}
        {useFreeLayout && page.layoutMode === 'free' ? (
          <FreeLayoutLayer
            page={page}
            doc={
              doc ?? {
                version: '1.1.0',
                schemaVersion: '1.1.0',
                id: 'doc',
                metadata: {
                  id: 'meta-doc',
                  title: masthead.title,
                  language: 'hi',
                  direction: 'ltr',
                  pageSize,
                  orientation,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                masthead,
                layout,
                pages: [page],
                articles: page.articles,
              }
            }
            pageSize={pageSize}
            orientation={orientation}
            scale={scale}
            selectedArticleId={selectedArticleId}
            onSelectArticle={onSelectArticle}
            onUpdateArticleFrame={onUpdateArticleFrame ?? (() => {})}
            onSwapArticles={onSwapArticles ?? (() => {})}
            onToggleLayoutMode={onTogglePageLayoutMode}
            onAddBlock={onAddBlock}
            onAddPage={onAddPage}
            sheetContainerRef={sheetCanvasRef}
            renderArticleContent={(art, isSel) => renderArticleCard(art, isSel, true)}
          />
        ) : (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {page.articles.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: isDraggingOver ? '#eff6ff' : 'rgba(0,0,0,0.015)',
                  border: isDraggingOver
                    ? `${visualDropBorderWidth}px dashed #2563eb`
                    : '2px dashed #d5d0c4',
                  borderRadius: '6px',
                  margin: '20px 0',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                  {isDraggingOver ? '📥' : '📰'}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDraggingOver ? '#1d4ed8' : '#475569',
                    fontFamily: "'Noto Serif Devanagari', serif",
                  }}
                >
                  {isDraggingOver
                    ? 'इस पृष्ठ पर ब्लॉक छोड़ने के लिए तैयार'
                    : 'इस पृष्ठ पर अभी कोई समाचार नहीं है'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Drag and drop a block from the left Blocks library, or click "+ Add to Page".
                </div>
              </div>
            ) : (
              <main
                data-testid="newspaper-articles-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  columnGap: gapVal,
                  rowGap: gapVal,
                  alignContent: 'start',
                  flex: 1,
                  position: 'relative',
                }}
              >
                {/* Drag Placement Ghost Overlay (Requirement 2) */}
                {isDraggingOver && (
                  <div
                    style={{
                      gridColumn: `span ${columnCount}`,
                      border: `${visualDropBorderWidth}px dashed #2563eb`,
                      backgroundColor: 'rgba(239, 246, 255, 0.92)',
                      borderRadius: '6px',
                      padding: '16px',
                      textAlign: 'center',
                      color: '#1d4ed8',
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
                      zIndex: 20,
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📥</span>
                    <span>
                      Drop block to insert into Page {pageNumber} ({columnCount}-column grid)
                    </span>
                  </div>
                )}

                {page.articles.map((article) =>
                  renderArticleCard(article, selectedArticleId === article.id, false)
                )}
              </main>
            )}
          </div>
        )}

        {/* ==========================================================
         * 3. PAGE FOLIO FOOTER
         * ========================================================== */}
        <footer
          className="newspaper-folio-footer"
          data-testid="newspaper-folio-footer"
          style={{
            marginTop: 'auto',
            paddingTop: usePhysicalCanvasCoordinates ? '6pt' : '6px',
            borderTop: usePhysicalCanvasCoordinates ? undefined : '1px solid #111',
            flexShrink: 0,
          }}
        >
          {usePhysicalCanvasCoordinates ? (
            <>
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#121212',
                  marginBottom: '4pt',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '7pt',
                  fontFamily: "'Hind', 'Noto Serif Devanagari', sans-serif",
                  textTransform: 'uppercase',
                  color: '#666',
                  letterSpacing: '0.5pt',
                }}
              >
                <span>{masthead.title}</span>
                <span>
                  पृष्ठ {pageNumber} / {totalPages}
                </span>
                <span>जनवाणी समाचार • डिजिटल व प्रिंट संस्करण</span>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: '#444',
              }}
            >
              <span>{masthead.title}</span>
              <span style={{ fontWeight: 600 }}>
                पृष्ठ {pageNumber} / {totalPages}
              </span>
              <span>जनवाणी समाचार • डिजिटल व प्रिंट संस्करण</span>
            </div>
          )}
        </footer>
      </div>
    </div>
  </div>
);
};
