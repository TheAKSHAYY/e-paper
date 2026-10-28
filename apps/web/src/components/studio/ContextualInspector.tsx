import React, { useState, useRef } from 'react';
import type {
  Article,
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  ArticlePriority,
  ImagePlacement,
  ImageAspect,
  SpacingDensity,
  NewspaperPage,
} from '@epaper-studio/document-schema';
import {
  PAGE_SIZE_DEFINITIONS,
  getImageObjectPosition,
  getImageAspectRatio,
  resolvePageColumnCount,
} from '@epaper-studio/document-schema';
import { DEVANAGARI_FONTS, RECOMMENDED_HINDI_FONT_COMBINATIONS } from '@epaper-studio/typography';
import { MastheadInspectorPanel } from './MastheadInspectorPanel';
import { BorderControls } from './BorderControls';

export interface ContextualInspectorProps {
  selectedArticle: Article | null;
  currentPage?: NewspaperPage;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle?: (articleId: string) => void;
  onMoveArticleUp?: (articleId: string) => void;
  onMoveArticleDown?: (articleId: string) => void;
  onMoveArticleToPage?: (articleId: string, targetPageIndex: number) => void;
  totalPages: number;
  currentPageIndex: number;
  masthead: MastheadConfig;
  onUpdateMasthead: (masthead: MastheadConfig) => void;
  layout: NewspaperLayoutConfig;
  onUpdateLayout: (layout: NewspaperLayoutConfig) => void;
  pageSize: PageSizePreset;
  onPageSizeChange: (size: PageSizePreset) => void;
  orientation: PageOrientation;
  onOrientationChange: (orientation: PageOrientation) => void;
  onDeselect: () => void;
  onCloseInspector?: () => void;
  isMastheadSelected?: boolean;
  onSelectMasthead?: () => void;
  onCloseMasthead?: () => void;
}

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  selectedArticle,
  currentPage,
  onUpdateArticle,
  onDeleteArticle,
  onMoveArticleUp,
  onMoveArticleDown,
  onMoveArticleToPage,
  totalPages,
  currentPageIndex,
  masthead,
  onUpdateMasthead,
  layout,
  onUpdateLayout,
  pageSize,
  onPageSizeChange,
  orientation,
  onOrientationChange,
  onDeselect,
  onCloseInspector,
  isMastheadSelected = false,
  onSelectMasthead: _onSelectMasthead,
  onCloseMasthead,
}) => {
  const [activeInspectorTab, setActiveInspectorTab] = useState<'content' | 'typography'>('content');
  const isPage1 = currentPageIndex === 0;
  const pageColumnCount = resolvePageColumnCount({ layout }, currentPage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedArticle) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        onUpdateArticle({
          ...selectedArticle,
          imageUrl: base64,
          imagePlacement:
            selectedArticle.imagePlacement === 'none' ? 'top' : selectedArticle.imagePlacement,
          imageFit: selectedArticle.imageFit ?? 'contain',
          imageAspect: selectedArticle.imageAspect ?? 'standard',
          imageFocalX: 0.5,
          imageFocalY: 0.5,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside
      style={{
        width: '300px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Inspector Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>{selectedArticle ? '📝' : isPage1 ? '🗞️' : '📄'}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
            {selectedArticle
              ? 'खबर संपादक'
              : isPage1
                ? 'मास्टहेड व पेज सेटिंग्स'
                : `पेज ${currentPageIndex + 1} सेटिंग्स`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {selectedArticle && (
            <button
              onClick={onDeselect}
              title="चयन हटाएँ"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              चयन हटाएँ ✕
            </button>
          )}

          {onCloseInspector && (
            <button
              onClick={onCloseInspector}
              title="Collapse inspector (इंस्पेक्टर छुपाएँ)"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs: Content vs Typography */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        <button
          onClick={() => setActiveInspectorTab('content')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom:
              activeInspectorTab === 'content' ? '2px solid #b91c1c' : '2px solid transparent',
            background: 'transparent',
            color: activeInspectorTab === 'content' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
          }}
        >
          {selectedArticle ? 'सामग्री (Content)' : 'पेज विन्यास (Layout)'}
        </button>

        <button
          onClick={() => setActiveInspectorTab('typography')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            borderBottom:
              activeInspectorTab === 'typography' ? '2px solid #b91c1c' : '2px solid transparent',
            background: 'transparent',
            color: activeInspectorTab === 'typography' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
          }}
        >
          टाइपोग्राफी (Style)
        </button>
      </div>

      {/* Main Form Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {isMastheadSelected ? (
          <MastheadInspectorPanel
            masthead={masthead}
            onUpdateMasthead={onUpdateMasthead}
            presetId={layout.presetId}
            onClose={onCloseMasthead}
          />
        ) : activeInspectorTab === 'content' ? (
          selectedArticle ? (
            /* ==========================================================
             * 1. ARTICLE / STORY INSPECTOR (WHEN ARTICLE IS SELECTED)
             * ========================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Quick Reorder and Move Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onMoveArticleUp?.(selectedArticle.id)}
                    title="खबर ऊपर ले जाएँ"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    ▲ ऊपर ले जाएँ
                  </button>

                  <button
                    onClick={() => onMoveArticleDown?.(selectedArticle.id)}
                    title="खबर नीचे ले जाएँ"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    ▼ नीचे ले जाएँ
                  </button>
                </div>

                {totalPages > 1 && onMoveArticleToPage && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const targetIdx = parseInt(e.target.value, 10);
                      if (!isNaN(targetIdx)) {
                        onMoveArticleToPage(selectedArticle.id, targetIdx);
                      }
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      fontSize: '11px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled>
                      दूसरे पेज पर भेजें...
                    </option>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <option key={idx} value={idx} disabled={idx === currentPageIndex}>
                        पेज {idx + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Kicker / Super-heading */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  किकर (Kicker)
                </label>
                <input
                  type="text"
                  value={selectedArticle.kickerText ?? ''}
                  onChange={(e) =>
                    onUpdateArticle({ ...selectedArticle, kickerText: e.target.value })
                  }
                  placeholder="उदा: विशेष रिपोर्ट, खेल, राजनीति"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#b91c1c',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Headline */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  मुख्य शीर्षक (Headline) *
                </label>
                <textarea
                  rows={2}
                  value={selectedArticle.headline}
                  onChange={(e) =>
                    onUpdateArticle({ ...selectedArticle, headline: e.target.value })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: layout.headlineFont,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Subheadline / Deck */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  उप-शीर्षक (Deck)
                </label>
                <input
                  type="text"
                  value={selectedArticle.subheadline ?? ''}
                  onChange={(e) =>
                    onUpdateArticle({ ...selectedArticle, subheadline: e.target.value })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                    fontFamily: layout.subheadlineFont || layout.headlineFont,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Byline & Dateline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    लेखक (Byline)
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.byline ?? ''}
                    onChange={(e) =>
                      onUpdateArticle({ ...selectedArticle, byline: e.target.value })
                    }
                    placeholder="विशेष संवाददाता"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    स्थान (Dateline)
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.dateline ?? ''}
                    onChange={(e) =>
                      onUpdateArticle({ ...selectedArticle, dateline: e.target.value })
                    }
                    placeholder="नई दिल्ली —"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Column Span & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    कॉलम ({selectedArticle.columnSpan}/{pageColumnCount})
                  </label>
                  <select
                    value={selectedArticle.columnSpan}
                    onChange={(e) =>
                      onUpdateArticle({
                        ...selectedArticle,
                        columnSpan: parseInt(e.target.value, 10),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11.5px',
                      outline: 'none',
                    }}
                  >
                    {Array.from({ length: pageColumnCount }, (_, i) => i + 1).map((col) => (
                      <option key={col} value={col}>
                        {col} कॉलम
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    प्राथमिकता (Priority)
                  </label>
                  <select
                    value={selectedArticle.priority}
                    onChange={(e) =>
                      onUpdateArticle({
                        ...selectedArticle,
                        priority: e.target.value as ArticlePriority,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11.5px',
                      outline: 'none',
                    }}
                  >
                    <option value="lead">मुख्य समाचार (Lead)</option>
                    <option value="major">प्रमुख खबर (Major)</option>
                    <option value="minor">सामान्य (Minor)</option>
                    <option value="brief">संक्षिप्त (Brief)</option>
                  </select>
                </div>
              </div>

              {/* In-Article Image / Photograph (Requirement 3) */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                    📷 फोटो (Photograph)
                  </label>

                  {selectedArticle.imageUrl && selectedArticle.imagePlacement !== 'none' ? (
                    <button
                      onClick={() =>
                        onUpdateArticle({
                          ...selectedArticle,
                          imageUrl: undefined,
                          imagePlacement: 'none',
                        })
                      }
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      🗑️ फोटो हटाएँ
                    </button>
                  ) : null}
                </div>

                {/* Hidden native file input for device image upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                {!selectedArticle.imageUrl || selectedArticle.imagePlacement === 'none' ? (
                  /* Placeholder when no photo attached (Requirement 3) */
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '6px',
                      padding: '16px 12px',
                      textAlign: 'center',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🖼️</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      फोटो जोड़ें
                    </div>
                    <p style={{ margin: '3px 0 10px 0', fontSize: '11px', color: '#64748b' }}>
                      डिवाइस से फोटो अपलोड करें या नमूना फोटो चुनें
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📁 फोटो अपलोड करें
                      </button>
                      <button
                        onClick={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageUrl:
                              'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
                            imagePlacement: 'top',
                            imageCaption: 'संरक्षण कार्य के दौरान प्राचीन नक्काशी का निरीक्षण।',
                            imageCredit: 'छाया: विशेष छायाकार',
                            imageLayout: 'full',
                            imageAspect: 'standard',
                          })
                        }
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        ✨ नमूना फोटो
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="या फोटो का लिंक पेस्ट करें (https://...)"
                      onChange={(e) => {
                        if (e.target.value) {
                          onUpdateArticle({
                            ...selectedArticle,
                            imageUrl: e.target.value,
                            imagePlacement: 'top',
                            imageLayout: 'full',
                            imageAspect: 'standard',
                          });
                        }
                      }}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        outline: 'none',
                      }}
                    />
                  </div>
                ) : (
                  /* ── Active Photo Editing Controls ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* LIVE PREVIEW with actual fit + focal point applied */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: getImageAspectRatio(selectedArticle.imageAspect),
                        overflow: 'hidden',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9',
                      }}
                    >
                      <img
                        src={selectedArticle.imageUrl}
                        alt="Photo preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit:
                            (selectedArticle.imageFit ?? 'cover') === 'fill'
                              ? 'fill'
                              : (selectedArticle.imageFit ?? 'cover'),
                          objectPosition: getImageObjectPosition(selectedArticle),
                          display: 'block',
                        }}
                      />
                      {/* Focal-point crosshair overlay */}
                      {(selectedArticle.imageFocalX !== undefined ||
                        selectedArticle.imageFocalY !== undefined) && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${Math.round((selectedArticle.imageFocalX ?? 0.5) * 100)}%`,
                            top: `${Math.round((selectedArticle.imageFocalY ?? 0.5) * 100)}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '20px',
                            border: '2px solid #ffffff',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* Replace / Remove buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          flex: 1,
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        🔄 फोटो बदलें
                      </button>
                      <button
                        onClick={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageUrl: undefined,
                            imagePlacement: 'none',
                            imageCaption: '',
                            imageCredit: undefined,
                            imageFocalX: undefined,
                            imageFocalY: undefined,
                            imageFocalPoint: undefined,
                          })
                        }
                        title="फोटो हटाएँ"
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                          borderRadius: '5px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        🗑️ फोटो हटाएँ
                      </button>
                    </div>

                    {/* Quick Smart Actions: Contain / Cover / Original Ratio / Reset Crop */}
                    <div
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}
                    >
                      <button
                        onClick={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageFit: 'contain',
                          })
                        }
                        title="Contain: Show entire image without cropping (पूरी फोटो दिखाएँ)"
                        style={{
                          padding: '5px 2px',
                          borderRadius: '4px',
                          border:
                            (selectedArticle.imageFit ?? 'cover') === 'contain'
                              ? '2px solid #2563eb'
                              : '1px solid #cbd5e1',
                          backgroundColor:
                            (selectedArticle.imageFit ?? 'cover') === 'contain'
                              ? '#eff6ff'
                              : '#ffffff',
                          color:
                            (selectedArticle.imageFit ?? 'cover') === 'contain'
                              ? '#1d4ed8'
                              : '#334155',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🔲 Contain
                      </button>

                      <button
                        onClick={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageFit: 'cover',
                          })
                        }
                        title="Cover: Fill frame and crop edges (क्रॉप भरें)"
                        style={{
                          padding: '5px 2px',
                          borderRadius: '4px',
                          border:
                            (selectedArticle.imageFit ?? 'cover') === 'cover'
                              ? '2px solid #b91c1c'
                              : '1px solid #cbd5e1',
                          backgroundColor:
                            (selectedArticle.imageFit ?? 'cover') === 'cover'
                              ? '#fff1f1'
                              : '#ffffff',
                          color:
                            (selectedArticle.imageFit ?? 'cover') === 'cover'
                              ? '#b91c1c'
                              : '#334155',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ⬛ Cover
                      </button>

                      <button
                        onClick={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageAspect: 'original',
                            imageFit: 'contain',
                          })
                        }
                        title="Original Ratio: Preserve exact image proportions (मूल अनुपात)"
                        style={{
                          padding: '5px 2px',
                          borderRadius: '4px',
                          border:
                            selectedArticle.imageAspect === 'original'
                              ? '2px solid #059669'
                              : '1px solid #cbd5e1',
                          backgroundColor:
                            selectedArticle.imageAspect === 'original' ? '#ecfdf5' : '#ffffff',
                          color: selectedArticle.imageAspect === 'original' ? '#047857' : '#334155',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📐 Original
                      </button>

                      <button
                        onClick={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageFocalX: 0.5,
                            imageFocalY: 0.5,
                            imageFocalPoint: 'center',
                            imageFit: 'contain',
                            imageAspect: 'standard',
                          })
                        }
                        title="Reset Crop: Return to default centered safe crop (क्रॉप रीसेट)"
                        style={{
                          padding: '5px 2px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#64748b',
                          fontSize: '10px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        ↺ Reset
                      </button>
                    </div>

                    {/* Image URL field */}
                    <input
                      type="text"
                      value={selectedArticle.imageUrl ?? ''}
                      onChange={(e) =>
                        onUpdateArticle({ ...selectedArticle, imageUrl: e.target.value })
                      }
                      placeholder="Image URL (paste or upload above)"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        fontSize: '10px',
                        color: '#475569',
                        outline: 'none',
                      }}
                    />

                    {/* ── FIT MODE ── */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Crop &amp; Fit Mode (क्रॉप मोड)
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(
                          [
                            {
                              value: 'contain',
                              label: 'Contain',
                              desc: 'Show full image, letterbox without cutting faces (पूरी दिखाएँ)',
                              icon: '🔲',
                            },
                            {
                              value: 'cover',
                              label: 'Cover',
                              desc: 'Fill frame, crop excess (फ्रेम भरें)',
                              icon: '⬛',
                            },
                            {
                              value: 'fill',
                              label: 'Fill',
                              desc: 'Stretch to fit (may distort) (खिंचाव)',
                              icon: '⤢',
                            },
                          ] as const
                        ).map(({ value, label, desc, icon }) => {
                          const isActive = (selectedArticle.imageFit ?? 'cover') === value;
                          return (
                            <button
                              key={value}
                              title={desc}
                              onClick={() =>
                                onUpdateArticle({ ...selectedArticle, imageFit: value })
                              }
                              style={{
                                flex: 1,
                                padding: '6px 4px',
                                borderRadius: '5px',
                                border: isActive ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                                backgroundColor: isActive ? '#fff1f1' : '#f8fafc',
                                color: isActive ? '#b91c1c' : '#475569',
                                fontWeight: isActive ? 700 : 400,
                                fontSize: '10px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                lineHeight: 1.3,
                              }}
                            >
                              <div style={{ fontSize: '13px', marginBottom: '2px' }}>{icon}</div>
                              <div>{label}</div>
                            </button>
                          );
                        })}
                      </div>
                      {selectedArticle.imageFit === 'fill' && (
                        <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#b45309' }}>
                          ⚠️ Fill mode stretches the image — may distort faces and text in photos.
                        </p>
                      )}
                    </div>

                    {/* ── FOCAL POINT GRID (9-point) ── */}
                    {(selectedArticle.imageFit ?? 'cover') === 'cover' && (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <label
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#334155',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Focal Point (Crop Position)
                          </label>
                          <button
                            onClick={() =>
                              onUpdateArticle({
                                ...selectedArticle,
                                imageFocalX: undefined,
                                imageFocalY: undefined,
                                imageFocalPoint: 'center',
                              })
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '10px',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '2px 4px',
                            }}
                          >
                            ↺ Reset
                          </button>
                        </div>

                        {/* 3×3 grid picker */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '3px',
                            marginBottom: '8px',
                          }}
                        >
                          {(
                            [
                              { label: '↖', x: 0, y: 0 },
                              { label: '↑', x: 0.5, y: 0 },
                              { label: '↗', x: 1, y: 0 },
                              { label: '←', x: 0, y: 0.5 },
                              { label: '●', x: 0.5, y: 0.5 },
                              { label: '→', x: 1, y: 0.5 },
                              { label: '↙', x: 0, y: 1 },
                              { label: '↓', x: 0.5, y: 1 },
                              { label: '↘', x: 1, y: 1 },
                            ] as const
                          ).map(({ label, x, y }) => {
                            const curX = selectedArticle.imageFocalX ?? 0.5;
                            const curY = selectedArticle.imageFocalY ?? 0.5;
                            const isActive = Math.abs(curX - x) < 0.01 && Math.abs(curY - y) < 0.01;
                            return (
                              <button
                                key={label}
                                title={`Set focal point to ${label}`}
                                onClick={() =>
                                  onUpdateArticle({
                                    ...selectedArticle,
                                    imageFocalX: x,
                                    imageFocalY: y,
                                  })
                                }
                                style={{
                                  aspectRatio: '1',
                                  borderRadius: '4px',
                                  border: isActive ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                                  backgroundColor: isActive ? '#b91c1c' : '#f8fafc',
                                  color: isActive ? '#fff' : '#64748b',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Precise X/Y sliders */}
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: '10px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '2px',
                              }}
                            >
                              Horizontal: {Math.round((selectedArticle.imageFocalX ?? 0.5) * 100)}%
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Math.round((selectedArticle.imageFocalX ?? 0.5) * 100)}
                              onChange={(e) =>
                                onUpdateArticle({
                                  ...selectedArticle,
                                  imageFocalX: parseInt(e.target.value, 10) / 100,
                                })
                              }
                              style={{ width: '100%', accentColor: '#b91c1c' }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: '10px',
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '2px',
                              }}
                            >
                              Vertical: {Math.round((selectedArticle.imageFocalY ?? 0.5) * 100)}%
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Math.round((selectedArticle.imageFocalY ?? 0.5) * 100)}
                              onChange={(e) =>
                                onUpdateArticle({
                                  ...selectedArticle,
                                  imageFocalY: parseInt(e.target.value, 10) / 100,
                                })
                              }
                              style={{ width: '100%', accentColor: '#b91c1c' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── PLACEMENT & ASPECT ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '4px',
                          }}
                        >
                          Placement in Story
                        </label>
                        <select
                          value={selectedArticle.imagePlacement}
                          onChange={(e) =>
                            onUpdateArticle({
                              ...selectedArticle,
                              imagePlacement: e.target.value as ImagePlacement,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                            outline: 'none',
                          }}
                        >
                          <option value="top">Above Headline</option>
                          <option value="middle">Below Headline</option>
                          <option value="side">Beside Text (Float)</option>
                          <option value="bottom">Bottom of Story</option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '4px',
                          }}
                        >
                          Frame Ratio
                        </label>
                        <select
                          value={selectedArticle.imageAspect ?? 'standard'}
                          onChange={(e) =>
                            onUpdateArticle({
                              ...selectedArticle,
                              imageAspect: e.target.value as ImageAspect,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                            outline: 'none',
                          }}
                        >
                          <option value="standard">Standard (4:3 / मानक)</option>
                          <option value="wide">Wide (16:9 / पैनोरामिक)</option>
                          <option value="square">Square (1:1 / चौकोर)</option>
                          <option value="portrait">Vertical (3:4 / लंबवत)</option>
                          <option value="original">Original Ratio (मूल अनुपात)</option>
                        </select>
                      </div>
                    </div>

                    {/* ── CAPTION & CREDIT ── */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        Photo Caption (चित्र परिचय)
                      </label>
                      <input
                        type="text"
                        value={selectedArticle.imageCaption ?? ''}
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, imageCaption: e.target.value })
                        }
                        placeholder="चित्र विवरण या परिचय लिखें..."
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '11px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        Photo Credit (छायाकार / स्रोत)
                      </label>
                      <input
                        type="text"
                        value={selectedArticle.imageCredit ?? ''}
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, imageCredit: e.target.value })
                        }
                        placeholder="उदा: छाया: विशेष संवाददाता"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '11px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Body Text */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Body Text (समाचार का पूरा विवरण)
                  </label>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {selectedArticle.body.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={selectedArticle.body}
                  onChange={(e) => onUpdateArticle({ ...selectedArticle, body: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontFamily: layout.bodyFont,
                    lineHeight: 1.5,
                    outline: 'none',
                  }}
                />
              </div>

              {/* ── BORDER CONTROLS (Top, Right, Bottom, Left) ── */}
              <BorderControls
                borders={selectedArticle.borders}
                onChange={(borders) => onUpdateArticle({ ...selectedArticle, borders })}
              />

              {/* ── BACKGROUND COLOR & PADDING ── */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                  🎨 पृष्ठभूमि व आंतरिक दूरी (Background & Padding)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10.5px',
                        color: '#475569',
                        marginBottom: '3px',
                      }}
                    >
                      पृष्ठभूमि रंग
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="color"
                        value={selectedArticle.backgroundColor || '#ffffff'}
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, backgroundColor: e.target.value })
                        }
                        style={{
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                        }}
                      />
                      {selectedArticle.backgroundColor && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateArticle({ ...selectedArticle, backgroundColor: undefined })
                          }
                          style={{
                            fontSize: '10px',
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          रीसेट
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10.5px',
                        color: '#475569',
                        marginBottom: '3px',
                      }}
                    >
                      पैडिंग ({selectedArticle.paddingPx ?? 0}px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={selectedArticle.paddingPx ?? 0}
                      onChange={(e) =>
                        onUpdateArticle({
                          ...selectedArticle,
                          paddingPx: parseInt(e.target.value, 10),
                        })
                      }
                      style={{ width: '100%', accentColor: '#b91c1c' }}
                    />
                  </div>
                </div>
              </div>

              {/* Delete Article Action */}
              {onDeleteArticle && (
                <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this article from the page?')) {
                        onDeleteArticle(selectedArticle.id);
                      }
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🗑️</span> Remove Article
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ==========================================================
             * 2. PAGE GEOMETRY & MASTHEAD INSPECTOR (NO ARTICLE SELECTED)
             * ========================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Paper Format & Orientation */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  Paper Dimensions (अख़बार का आकार)
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(e.target.value as PageSizePreset)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  {Object.entries(PAGE_SIZE_DEFINITIONS).map(([key, def]) => (
                    <option key={key} value={key}>
                      {def.name} ({def.widthMm} × {def.heightMm} mm)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => onOrientationChange(e.target.value as PageOrientation)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option value="portrait">Portrait (ऊर्ध्वाधर)</option>
                    <option value="landscape">Landscape (क्षैतिज)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    Columns per Page
                  </label>
                  <select
                    value={layout.columnCount}
                    onChange={(e) =>
                      onUpdateLayout({ ...layout, columnCount: parseInt(e.target.value, 10) })
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                    <option value={4}>4 Columns (Classic)</option>
                    <option value={5}>5 Columns (Broadsheet)</option>
                    <option value={6}>6 Columns (Dense)</option>
                  </select>
                </div>
              </div>

              {/* Column Rules & Density */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    Spacing Density
                  </label>
                  <select
                    value={layout.spacingDensity}
                    onChange={(e) =>
                      onUpdateLayout({
                        ...layout,
                        spacingDensity: e.target.value as SpacingDensity,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option value="compact">Compact (घना)</option>
                    <option value="normal">Standard (सामान्य)</option>
                    <option value="spacious">Spacious (खुला)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    Column Dividers
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      marginTop: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={layout.columnRule}
                      onChange={(e) => onUpdateLayout({ ...layout, columnRule: e.target.checked })}
                    />
                    Vertical Rules
                  </label>
                </div>
              </div>

              {/* Page 1 Masthead Settings */}
              {isPage1 ? (
                <MastheadInspectorPanel
                  masthead={masthead}
                  onUpdateMasthead={onUpdateMasthead}
                  presetId={layout.presetId}
                />
              ) : (
                /* Interior Page Folio Info */
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#475569',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Inside Page {currentPageIndex + 1}:</strong> Front-page masthead is
                  automatically replaced by an authentic inside running folio (
                  <em>
                    {masthead.title} • पृष्ठ {currentPageIndex + 1} • {masthead.date}
                  </em>
                  ).
                </div>
              )}
            </div>
          )
        ) : (
          /* ==========================================================
           * 3. TYPOGRAPHY & FONT SETTINGS
           * ========================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Curated Font Combinations */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Curated Devanagari Pairings (पारंपरिक फॉन्ट जोड़ियाँ)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {RECOMMENDED_HINDI_FONT_COMBINATIONS.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() =>
                      onUpdateLayout({
                        ...layout,
                        mastheadFont: combo.mastheadFont,
                        headlineFont: combo.headlineFont,
                        subheadlineFont: combo.subheadlineFont,
                        bodyFont: combo.bodyFont,
                      })
                    }
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {combo.nameHi}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{combo.descriptionHi}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Masthead Font */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '4px',
                }}
              >
                Masthead Font Family
              </label>
              <select
                value={layout.mastheadFont}
                onChange={(e) => onUpdateLayout({ ...layout, mastheadFont: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {DEVANAGARI_FONTS.map((f) => (
                  <option key={f.family} value={`'${f.family}', serif`}>
                    {f.nameHi} ({f.categories.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Headline Font & Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '6px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  Headline Font
                </label>
                <select
                  value={layout.headlineFont}
                  onChange={(e) => onUpdateLayout({ ...layout, headlineFont: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  {DEVANAGARI_FONTS.map((f) => (
                    <option key={f.family} value={`'${f.family}', serif`}>
                      {f.family}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  Weight
                </label>
                <select
                  value={layout.headlineWeight}
                  onChange={(e) =>
                    onUpdateLayout({ ...layout, headlineWeight: parseInt(e.target.value, 10) })
                  }
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value={400}>Regular (400)</option>
                  <option value={600}>SemiBold (600)</option>
                  <option value={700}>Bold (700)</option>
                  <option value={900}>Black (900)</option>
                </select>
              </div>
            </div>

            {/* Body Font & Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '6px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  Body Text Font
                </label>
                <select
                  value={layout.bodyFont}
                  onChange={(e) => onUpdateLayout({ ...layout, bodyFont: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  {DEVANAGARI_FONTS.map((f) => (
                    <option key={f.family} value={`'${f.family}', serif`}>
                      {f.family}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  Size (pt)
                </label>
                <select
                  value={layout.bodyFontSizePt}
                  onChange={(e) =>
                    onUpdateLayout({ ...layout, bodyFontSizePt: parseFloat(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value={8.5}>8.5 pt</option>
                  <option value={9.5}>9.5 pt</option>
                  <option value={10}>10.0 pt</option>
                  <option value={10.5}>10.5 pt</option>
                  <option value={11}>11.0 pt</option>
                  <option value={12}>12.0 pt</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
