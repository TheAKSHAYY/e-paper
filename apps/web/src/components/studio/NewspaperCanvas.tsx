import React, { useState } from 'react';
import type {
  NewspaperPage,
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  Article,
} from '@epaper-studio/document-schema';
import {
  getPageDimensions,
  getImageObjectPosition,
  getImageAspectRatio,
  resolvePageColumnCount,
} from '@epaper-studio/document-schema';
import { THEME_TOKENS } from '@epaper-studio/ui';
import { getMastheadEmblemSvg } from '@epaper-studio/template-engine';

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
  onSelectArticle: (articleId: string) => void;
  onMoveArticleUp: (articleId: string) => void;
  onMoveArticleDown: (articleId: string) => void;
  onAdjustColumnSpan: (articleId: string, delta: number) => void;
  onAddBlock?: (blockTemplate: Partial<Article>) => void;
  onAddPage?: () => void;
  isMastheadSelected?: boolean;
  onSelectMasthead?: () => void;
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
  onSelectArticle,
  onMoveArticleUp: _onMoveArticleUp,
  onMoveArticleDown: _onMoveArticleDown,
  onAdjustColumnSpan: _onAdjustColumnSpan,
  onAddBlock,
  onAddPage,
  isMastheadSelected = false,
  onSelectMasthead,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const isFirstPage = pageIndex === 0;
  const pageNumber = page.pageNumber ?? pageIndex + 1;
  const columnCount = resolvePageColumnCount({ layout }, page);
  const columnRule = layout.columnRule;
  const density = layout.spacingDensity;

  // Strict Physical Page Dimensions & Fixed Aspect Ratio (Requirement 1)
  const dimensions = getPageDimensions(pageSize, orientation);
  const aspectRatio = dimensions.aspectRatio ?? dimensions.widthPt / dimensions.heightPt;
  const baseWidth = orientation === 'landscape' ? 1080 : 800;
  const baseHeight = Math.round(baseWidth / aspectRatio);
  const exactWidthPx = Math.round(baseWidth * scale);
  const exactHeightPx = Math.round(baseHeight * scale);

  // Spacing scales cleanly with visual zoom
  const paddingPx = density === 'compact' ? 22 : density === 'spacious' ? 38 : 28;
  const gapPx = density === 'compact' ? 12 : density === 'spacious' ? 22 : 16;

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

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
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
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            minWidth: `${baseWidth}px`,
            maxWidth: `${baseWidth}px`,
            minHeight: `${baseHeight}px`,
            maxHeight: `${baseHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundColor: '#ffffff', // Requirement 4: Pure White Print Paper
            color: THEME_TOKENS.inkPrimary,
            fontFamily: layout.bodyFont,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22), 0 2px 10px rgba(0, 0, 0, 0.12)',
            border: '1px solid #d1d5db',
            padding: `${paddingPx}px`,
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
            style={{
              ...getRuleBorderStyle(),
              paddingBottom: '8px',
              marginBottom: '16px',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
              outline: isMastheadSelected ? '2px solid #2563eb' : '1px dashed transparent',
              outlineOffset: '4px',
              borderRadius: isMastheadSelected ? '4px' : '0px',
              transition: 'outline 0.15s ease',
            }}
          >
            {/* Top Metadata Row (Ear Strip) */}
            {masthead.showTopStrip !== false && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #222222',
                  paddingBottom: '3px',
                  marginBottom: '6px',
                  fontSize: '10.5px',
                  color: '#333333',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.02em',
                }}
              >
                {/* Weather & AQI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {masthead.showWeather !== false && (
                    <div>
                      <strong style={{ color: '#111111' }}>मौसम: </strong>
                      <span>
                        {masthead.weatherCity || 'नई दिल्ली'} {masthead.temperature || '25°C'} •{' '}
                        {masthead.weatherCondition || 'साफ़ आसमान'}
                      </span>
                    </div>
                  )}
                  {masthead.showAirQuality !== false && masthead.airQuality && (
                    <div style={{ color: '#475569', fontSize: '10px' }}>
                      <span>{masthead.airQuality}</span>
                    </div>
                  )}
                </div>

                {/* Tagline & Establishment */}
                <div
                  style={{
                    fontFamily: "'Noto Serif Devanagari', serif",
                    fontSize: '11px',
                    color: '#333333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {masthead.showTagline !== false && (
                    <span style={{ fontStyle: 'italic' }}>
                      {masthead.tagline || masthead.subtitle || 'सत्य, निष्पक्षता और जनसेवा का प्रतीक'}
                    </span>
                  )}
                  {masthead.showTagline !== false && masthead.showEstablishment !== false && (
                    <span style={{ color: '#888888' }}>•</span>
                  )}
                  {masthead.showEstablishment !== false && (
                    <strong style={{ color: '#111111' }}>
                      स्थापना {masthead.establishmentYear || '1947'}
                    </strong>
                  )}
                </div>

                {/* Price & Registration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {masthead.showPrice !== false && (
                    <div>
                      <strong style={{ color: '#111111' }}>{masthead.price || 'मूल्य ₹5.00'}</strong>
                    </div>
                  )}
                  {masthead.showPostalReg !== false && masthead.postalRegNumber && (
                    <div style={{ color: '#64748b', fontSize: '10px' }}>
                      <span>{masthead.postalRegNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Main Masthead Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  masthead.alignment === 'left'
                    ? 'flex-start'
                    : masthead.alignment === 'justified'
                      ? 'space-between'
                      : 'center',
                gap: '16px',
                margin: '4px 0 8px',
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
                  fontSize: `${masthead.fontSizePt || 52}px`,
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
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #111111',
                  paddingTop: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#222222',
                  letterSpacing: '0.03em',
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
                    <span style={{ fontSize: '11.5px', fontFamily: "'Noto Serif Devanagari', serif" }}>
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
                  marginTop: '5px',
                  padding: '3px 6px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '0.02em',
                }}
              >
                <span>{masthead.secondaryHeaderTitle}</span>
                {masthead.secondaryHeaderSubtitle && (
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#475569' }}>
                    {masthead.secondaryHeaderSubtitle}
                  </span>
                )}
              </div>
            )}

            {/* 5. Highlighted Announcement / Breaking Strip (Requirement 3) */}
            {masthead.showAnnouncementStrip && masthead.announcementStripText && (
              <div
                style={{
                  marginTop: '5px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '2px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(185,28,28,0.2)',
                }}
              >
                <span style={{ backgroundColor: '#ffffff', color: '#b91c1c', padding: '1px 4px', borderRadius: '2px', fontSize: '9px' }}>
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
              paddingBottom: '6px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: '#111',
              flexShrink: 0,
            }}
          >
            <div
              style={{ fontFamily: layout.mastheadFont || "'Rozha One', serif", fontSize: '15px' }}
            >
              {masthead.title}
            </div>
            <div
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                fontSize: '12px',
                color: '#333',
              }}
            >
              {page.sectionTitle ? `${page.sectionTitle} • ` : ''}पृष्ठ {pageNumber} / {totalPages}
            </div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              {masthead.date} • {masthead.edition || 'अंदर के पृष्ठ'}
            </div>
          </header>
        )}

        {/* ==========================================================
         * 2. ARTICLES MULTI-COLUMN GRID & PLACEMENT GHOST (Requirement 2)
         * ========================================================== */}
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
                border: isDraggingOver ? '2px dashed #2563eb' : '2px dashed #d5d0c4',
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
                columnGap: `${gapPx}px`,
                rowGap: `${Math.round(gapPx * 1.1)}px`,
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
                    border: '2px dashed #2563eb',
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

              {page.articles.length === 0 && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    border: '2px dashed #cbd5e1',
                    backgroundColor: '#f8fafc',
                    padding: '48px 24px',
                    textAlign: 'center',
                    borderRadius: '2px',
                    margin: '24px 0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      color: '#b91c1c',
                      marginBottom: '8px',
                      fontFamily: "'Noto Serif Devanagari', serif",
                      fontWeight: 900,
                    }}
                  >
                    पेज {pageNumber} पर समाचार सामग्री जोड़ें
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      maxWidth: '460px',
                      margin: '0 auto 20px auto',
                      lineHeight: 1.5,
                    }}
                  >
                    बाईं ओर स्थित "तत्व (Elements)" या "12-कॉलम लेआउट" से ब्लॉक ड्रैग करें, या नीचे दिए गए त्वरित विकल्पों पर क्लिक करें:
                  </div>

                  {onAddBlock && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() =>
                          onAddBlock({
                            headline: 'मुख्य समाचार शीर्षक यहाँ लिखें',
                            subheadline: 'उप-शीर्षक डेक और संदर्भ सारांश',
                            body: 'समाचार का विस्तृत आलेख यहाँ से प्रारंभ करें...',
                            priority: 'lead',
                            columnSpan: columnCount,
                          })
                        }
                        style={{
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        + मुख्य समाचार (Lead Story)
                      </button>

                      <button
                        onClick={() =>
                          onAddBlock({
                            headline: 'सचित्र समाचार रिपोर्ट',
                            subheadline: 'चित्र परिचय और विश्लेषण',
                            body: 'सचित्र विवरण यहाँ दर्ज करें...',
                            priority: 'major',
                            columnSpan: Math.max(1, Math.floor(columnCount / 2)),
                            imageUrl:
                              'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
                            imagePlacement: 'top',
                            imageCaption: 'चित्र परिचय: विशेष संवाददाता द्वारा भेजी गई रिपोर्ट',
                          })
                        }
                        style={{
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        + फोटो स्टोरी (Photo Story)
                      </button>

                      <button
                        onClick={() =>
                          onAddBlock({
                            headline: 'प्रादेशिक एवं नगर बुलेटिन',
                            body: 'स्थानीय नगर और प्रादेशिक गतिविधियों का संक्षिप्त विवरण...',
                            priority: 'minor',
                            columnSpan: Math.max(1, Math.floor(columnCount / 3)),
                          })
                        }
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#111827',
                          border: '1px solid #111827',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        + प्रादेशिक बुलेटिन (Briefs)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {page.articles.map((article) => {
                const span = Math.min(columnCount, Math.max(1, article.columnSpan));
                const isSelected = selectedArticleId === article.id;
                const isLead = article.priority === 'lead';
                const headlineWeight = layout.headlineWeight ?? (isLead ? 900 : 700);
                const hasPhoto = Boolean(article.imageUrl && article.imagePlacement !== 'none');

                // Compute image rendering values from document model using shared helpers
                const photoAspect = getImageAspectRatio(article.imageAspect);
                const photoObjectPosition = getImageObjectPosition(article);
                const photoObjectFit = article.imageFit ?? 'cover';
                // Side placement uses fixed 42% float width to avoid overlap on narrow columns
                const isSide = article.imagePlacement === 'side';

                // Photo component — consistent rendering model for editor and PDF
                const renderPhoto = () => {
                  if (!hasPhoto) return null;
                  return (
                    <figure
                      data-image-placement={article.imagePlacement}
                      data-image-fit={photoObjectFit}
                      style={{
                        margin: 0,
                        padding: 0,
                        // Side float: fixed width so it never overlaps column text
                        width: isSide ? '42%' : '100%',
                        float: isSide ? 'left' : 'none',
                        marginRight: isSide ? '8px' : '0',
                        marginBottom: isSide ? '4px' : '8px',
                        // Clear floats after bottom placement
                        clear: article.imagePlacement === 'bottom' ? 'both' : 'none',
                        flexShrink: 0,
                      }}
                    >
                      {/* Image frame: aspect-ratio drives the height — NO maxHeight override */}
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

                // Custom 4-side border calculation
                const customBorders = article.borders;
                const borderStyles: React.CSSProperties = {
                  borderTop: customBorders?.top && customBorders.top.style !== 'none'
                    ? `${customBorders.top.width}px ${customBorders.top.style} ${customBorders.top.color}`
                    : undefined,
                  borderRight: customBorders?.right && customBorders.right.style !== 'none'
                    ? `${customBorders.right.width}px ${customBorders.right.style} ${customBorders.right.color}`
                    : (columnRule && span < columnCount ? '1px solid #d5d0c4' : undefined),
                  borderBottom: customBorders?.bottom && customBorders.bottom.style !== 'none'
                    ? `${customBorders.bottom.width}px ${customBorders.bottom.style} ${customBorders.bottom.color}`
                    : '1px solid #e0ded6',
                  borderLeft: customBorders?.left && customBorders.left.style !== 'none'
                    ? `${customBorders.left.width}px ${customBorders.left.style} ${customBorders.left.color}`
                    : undefined,
                };

                const isHindi = Boolean(article.headline?.match(/[\u0900-\u097F]/)) ||
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
                    lang={isHindi ? 'hi' : 'en'}
                    onClick={() => onSelectArticle(article.id)}
                    style={{
                      gridColumn: `span ${span}`,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: article.paddingPx ? `${article.paddingPx}px` : undefined,
                      paddingBottom: '12px',
                      ...borderStyles,
                      position: 'relative',
                      cursor: 'pointer',
                      outline: isSelected ? '1.5px solid #2563eb' : 'none',
                      outlineOffset: '2px',
                      backgroundColor: article.backgroundColor ?? 'transparent',
                      borderRadius: '1px',
                      transition: 'outline 0.15s ease',
                      hyphens: isHindi ? 'manual' : undefined,
                      WebkitHyphens: isHindi ? 'manual' : undefined,
                      ...(columnRule && span < columnCount && !customBorders?.right
                        ? {
                            paddingRight: `${Math.round(gapPx / 2)}px`,
                          }
                        : {}),
                    }}
                  >
                    {/* Top Photo if placement === 'top' */}
                    {article.imagePlacement === 'top' && renderPhoto()}

                    {/* Headline, Subheadline & Byline */}
                    <header style={{ marginBottom: '6px' }}>
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
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#111',
                              }}
                            >
                              {item.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '11px', color: '#444', lineHeight: 1.35 }}>
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
                            fontSize: '9px',
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
                          <p style={{ margin: '4px 0', fontSize: '12px', lineHeight: 1.4, color: '#222' }}>
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
                              fontSize: '11px',
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
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#b45309',
                              }}
                            >
                              <span>{rashi.rashi}</span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>({rashi.sign})</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '9.5px', lineHeight: 1.3, color: '#334155' }}>
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
                          fontSize: `${layout.bodyFontSizePt ? Math.round(layout.bodyFontSizePt * 1.33) : 13}px`,
                          lineHeight: 1.45,
                          color: article.textColor ?? THEME_TOKENS.inkSecondary,
                          fontFamily: layout.bodyFont,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          hyphens: isHindi ? 'manual' : 'auto',
                          WebkitHyphens: isHindi ? 'manual' : 'auto',
                        }}
                      >
                        {article.imagePlacement === 'side' && renderPhoto()}

                        {article.dateline && (
                          <strong style={{ color: '#111', marginRight: '4px' }}>
                            {article.dateline}
                          </strong>
                        )}
                        {article.body.split(/\n\s*\n/).map((para, pIdx) => (
                          <p key={pIdx} style={{ margin: '0 0 7px 0' }}>
                            {para}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Bottom Photo if placement === 'bottom' */}
                    {article.imagePlacement === 'bottom' && renderPhoto()}

                    {/* Quick Add Photo Action Placeholder if no photo attached (Requirement 3) */}
                  </article>
                );
              })}
            </main>
          )}
        </div>

        {/* ==========================================================
         * 3. PAGE FOLIO FOOTER
         * ========================================================== */}
        <footer
          style={{
            borderTop: '1px solid #111',
            paddingTop: '6px',
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#444',
            flexShrink: 0,
          }}
        >
          <span>{masthead.title}</span>
          <span style={{ fontWeight: 600 }}>
            पृष्ठ {pageNumber} / {totalPages}
          </span>
          <span>जनवाणी समाचार • डिजिटल व प्रिंट संस्करण</span>
        </footer>
      </div>
    </div>
  </div>
);
};
