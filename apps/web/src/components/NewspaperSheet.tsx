import React from 'react';
import {
  getPageDimensions,
  PAGE_SIZE_DEFINITIONS,
  getImageObjectPosition,
  getImageAspectRatio,
  type NewspaperDocument,
} from '@epaper-studio/document-schema';
import { THEME_TOKENS } from '@epaper-studio/ui';
import { estimateNewspaperContentVolume } from '@epaper-studio/template-engine';

export interface NewspaperSheetProps {
  document: NewspaperDocument;
  scale?: number;
  showOverflowWarning?: boolean;
  selectedArticleId?: string;
  onSelectArticle?: (id: string) => void;
}

export const NewspaperSheet: React.FC<NewspaperSheetProps> = ({
  document: doc,
  scale = 1,
  showOverflowWarning = true,
  selectedArticleId,
  onSelectArticle,
}) => {
  const dimensions = getPageDimensions(doc.metadata.pageSize, doc.metadata.orientation);
  const pageSizeDef =
    PAGE_SIZE_DEFINITIONS[doc.metadata.pageSize] ?? PAGE_SIZE_DEFINITIONS.broadsheet;
  const aspectRatio = dimensions.aspectRatio ?? dimensions.widthPt / dimensions.heightPt;
  const baseWidth = doc.metadata.orientation === 'landscape' ? 1080 : 800;
  const baseHeight = Math.round(baseWidth / aspectRatio);
  const exactWidthPx = Math.round(baseWidth * scale);
  const exactHeightPx = Math.round(baseHeight * scale);

  // Aspect ratio in percentage for container sizing
  const presetId = doc.layout.presetId;
  const columnCount = Math.max(2, Math.min(6, doc.layout.columnCount));
  const columnRule = doc.layout.columnRule;
  const density = doc.layout.spacingDensity;
  const direction = doc.metadata.direction ?? 'ltr';

  // Density spacing multipliers
  const paddingPx = density === 'compact' ? 24 : density === 'spacious' ? 44 : 34;
  const gapPx = density === 'compact' ? 14 : density === 'spacious' ? 28 : 20;

  const volume = estimateNewspaperContentVolume(doc);

  // Sort articles by orderIndex
  const sortedArticles = [...doc.articles].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {showOverflowWarning && volume.exceedsSinglePage && (
        <div
          role="alert"
          style={{
            maxWidth: `${exactWidthPx}px`,
            width: '100%',
            marginBottom: '16px',
            backgroundColor: '#fff4e5',
            border: '1px solid #ffd599',
            borderRadius: '6px',
            padding: '12px 16px',
            color: '#8a4b00',
            fontSize: '13px',
            lineHeight: 1.5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
          <div>
            <strong>Layout Density Warning:</strong> {volume.recommendation}
            <div style={{ fontSize: '12px', marginTop: '4px', color: '#a65b00' }}>
              Current: {volume.wordCount.toLocaleString()} words (
              {volume.estimatedCharacterCount.toLocaleString()} characters) across{' '}
              {doc.articles.length} articles.
            </div>
          </div>
        </div>
      )}

      {/* The Authentic Newspaper Sheet Canvas */}
      <div
        className="newspaper-sheet-canvas"
        data-testid="newspaper-sheet-canvas"
        dir={direction}
        style={{
          width: `${exactWidthPx}px`,
          height: `${exactHeightPx}px`,
          minWidth: `${exactWidthPx}px`,
          maxWidth: `${exactWidthPx}px`,
          minHeight: `${exactHeightPx}px`,
          maxHeight: `${exactHeightPx}px`,
          aspectRatio: `${dimensions.widthPt} / ${dimensions.heightPt}`,
          backgroundColor: '#ffffff',
          color: THEME_TOKENS.inkPrimary,
          fontFamily: doc.layout.bodyFont,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${THEME_TOKENS.borderPaper}`,
          padding: `${Math.round(paddingPx * scale)}px`,
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      >
        {/* MASTHEAD HEADER SECTION */}
        <header
          style={{
            borderBottom: presetId === 'classic-broadsheet' ? '3px double #111' : '2px solid #111',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Top Ear Pieces (Weather, Price & Edition) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #777',
              paddingBottom: '4px',
              marginBottom: '10px',
              fontSize: '11px',
              fontFamily: "'Courier New', Courier, monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#333',
            }}
          >
            <span>{doc.masthead.weatherNotice || 'Standard Edition'}</span>
            <span style={{ fontWeight: 'bold' }}>{doc.masthead.edition}</span>
            <span>{doc.masthead.price || 'Official Press'}</span>
          </div>

          {/* Main Title Nameplate */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <h1
              data-testid="masthead-title"
              style={{
                fontFamily: doc.layout.mastheadFont || doc.layout.headlineFont,
                fontSize:
                  presetId === 'compact-local' || presetId === 'local-hindi-gazette'
                    ? 'clamp(2.2rem, 5vw, 3.4rem)'
                    : 'clamp(2.6rem, 6.5vw, 4.4rem)',
                fontWeight: 900,
                letterSpacing: presetId === 'compact-local' ? '-0.02em' : '0.01em',
                lineHeight: 1.05,
                margin: 0,
                color: THEME_TOKENS.inkPrimary,
              }}
            >
              {doc.masthead.title}
            </h1>
            {doc.masthead.subtitle && (
              <p
                style={{
                  margin: '6px 0 0 0',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  fontFamily: doc.layout.subheadlineFont || doc.layout.bodyFont,
                  letterSpacing: '0.03em',
                  color: '#444',
                }}
              >
                {doc.masthead.subtitle}
              </p>
            )}
          </div>

          {/* Folio Line (Date, Issue Number, Price) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #222',
              borderBottom: '1px solid #222',
              padding: '3px 0',
              marginTop: '10px',
              fontSize: '11px',
              fontFamily: 'serif',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span>{doc.masthead.issueNumber}</span>
            <span style={{ textAlign: 'center' }}>{doc.masthead.date}</span>
            <span>{pageSizeDef.name.split(' (')[0]}</span>
          </div>
        </header>

        {/* ARTICLES GRID */}
        {sortedArticles.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#888',
              fontStyle: 'italic',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              margin: '20px 0',
            }}
          >
            No articles on this page. Click "+ Add Article" in the editor panel to compose a story.
          </div>
        ) : (
          <main
            data-testid="newspaper-articles-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              columnGap: `${Math.round(gapPx * scale)}px`,
              rowGap: `${Math.round(gapPx * 1.2 * scale)}px`,
            }}
          >
            {sortedArticles.map((article) => {
              const span = Math.min(columnCount, Math.max(1, article.columnSpan));
              const isLead = article.priority === 'lead';
              const isBrief = article.priority === 'brief';

              const isSelected = selectedArticleId === article.id;
              const headlineFontWeight =
                doc.layout.headlineWeight ??
                (isLead ? 900 : article.priority === 'major' ? 700 : 600);

              return (
                <article
                  key={article.id}
                  data-testid={`article-card-${article.id}`}
                  onClick={() => onSelectArticle?.(article.id)}
                  title="संपादित करने के लिए क्लिक करें (Click to edit)"
                  style={{
                    gridColumn: `span ${span}`,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #e0ded6',
                    position: 'relative',
                    cursor: onSelectArticle ? 'pointer' : 'default',
                    outline: isSelected ? '2px solid #b91c1c' : 'none',
                    outlineOffset: '4px',
                    backgroundColor: isSelected ? 'rgba(185, 28, 28, 0.03)' : 'transparent',
                    borderRadius: '2px',
                    transition: 'all 0.15s ease',
                    ...(columnRule && span < columnCount
                      ? {
                          borderRight: direction === 'rtl' ? 'none' : '1px solid #d5d0c4',
                          borderLeft: direction === 'rtl' ? '1px solid #d5d0c4' : 'none',
                          paddingRight:
                            direction === 'rtl' ? 0 : `${Math.round((gapPx / 2) * scale)}px`,
                          paddingLeft:
                            direction === 'rtl' ? `${Math.round((gapPx / 2) * scale)}px` : 0,
                        }
                      : {}),
                  }}
                >
                  {/* Article Headline */}
                  <header style={{ marginBottom: '8px' }}>
                    <h2
                      style={{
                        fontFamily: doc.layout.headlineFont,
                        fontSize: isLead
                          ? 'clamp(1.5rem, 3.2vw, 2.3rem)'
                          : article.priority === 'major'
                            ? 'clamp(1.2rem, 2.4vw, 1.7rem)'
                            : 'clamp(1.0rem, 1.8vw, 1.3rem)',
                        fontWeight: headlineFontWeight,
                        lineHeight: 1.15,
                        margin: '0 0 4px 0',
                        color: THEME_TOKENS.inkPrimary,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {article.headline}
                    </h2>

                    {article.subheadline && (
                      <p
                        style={{
                          margin: '4px 0 6px 0',
                          fontSize: isLead ? '14px' : '12px',
                          lineHeight: 1.35,
                          fontFamily: doc.layout.subheadlineFont || doc.layout.bodyFont,
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
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontWeight: 600,
                          color: '#555',
                          borderTop: isLead ? '1px solid #111' : 'none',
                          paddingTop: isLead ? '4px' : 0,
                          marginTop: '4px',
                        }}
                      >
                        {article.byline}
                      </div>
                    )}
                  </header>

                  {/* Optional Image */}
                  {article.imageUrl && article.imagePlacement !== 'none' && (
                    <figure
                      style={{
                        margin: '6px 0 10px 0',
                        padding: 0,
                      }}
                    >
                      <img
                        src={article.imageUrl}
                        alt={article.imageCaption || article.headline}
                        style={{
                          width: '100%',
                          aspectRatio: getImageAspectRatio(article.imageAspect),
                          objectFit: article.imageFit ?? 'cover',
                          objectPosition: getImageObjectPosition(article),
                          display: 'block',
                          border: '1px solid #111',
                          filter: 'contrast(1.05) grayscale(0.2)', // Classic newsprint photo contrast
                        }}
                      />
                      {(article.imageCaption || article.imageCredit) && (
                        <figcaption
                          style={{
                            fontSize: '11px',
                            fontFamily: 'serif',
                            fontStyle: 'italic',
                            color: '#444',
                            lineHeight: 1.3,
                            marginTop: '4px',
                            borderLeft: '2px solid #888',
                            paddingLeft: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '4px',
                          }}
                        >
                          {article.imageCaption && <span>{article.imageCaption}</span>}
                          {article.imageCredit && (
                            <span style={{ fontSize: '10px', color: '#666', fontStyle: 'normal' }}>
                              {article.imageCredit}
                            </span>
                          )}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Body Text */}
                  <div
                    style={{
                      fontSize: `${doc.layout.bodyFontSizePt}pt`,
                      lineHeight: 1.45,
                      textAlign: 'justify',
                      color: '#222',
                      flex: 1,
                    }}
                  >
                    {article.body.split('\n\n').map((paragraph, pIdx) => {
                      if (!paragraph.trim()) return null;
                      const isFirstParagraph = pIdx === 0 && isLead && !isBrief;
                      const isHindiText =
                        doc.metadata.language === 'hi' || /[\u0900-\u097F]/.test(paragraph);

                      return (
                        <p
                          key={pIdx}
                          style={{
                            margin: '0 0 8px 0',
                            textIndent: pIdx > 0 ? '1.2em' : 0,
                          }}
                        >
                          {isFirstParagraph && article.dateline && (
                            <strong style={{ textTransform: 'uppercase', marginRight: '6px' }}>
                              {article.dateline} —
                            </strong>
                          )}
                          {isFirstParagraph && !isHindiText ? (
                            <>
                              <span
                                style={{
                                  float: direction === 'rtl' ? 'right' : 'left',
                                  fontSize: '3.2em',
                                  lineHeight: '0.8',
                                  paddingRight: direction === 'rtl' ? '0' : '6px',
                                  paddingLeft: direction === 'rtl' ? '6px' : '0',
                                  paddingTop: '2px',
                                  fontFamily: doc.layout.headlineFont,
                                  fontWeight: 900,
                                }}
                              >
                                {paragraph.charAt(0)}
                              </span>
                              {paragraph.slice(1)}
                            </>
                          ) : (
                            paragraph
                          )}
                        </p>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </main>
        )}

        {/* FOOTER SECTION */}
        {doc.layout.showFooter && (
          <footer
            style={{
              marginTop: '24px',
              paddingTop: '8px',
              borderTop: '2px solid #111',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              fontFamily: 'serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#555',
            }}
          >
            <span>{doc.layout.footerText || `Page 1 • ${doc.masthead.title}`}</span>
            <span>{pageSizeDef.aspectRatio} Aspect Ratio • Print-Ready Vector Grid</span>
          </footer>
        )}
      </div>
    </div>
  );
};
