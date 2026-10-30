import React, { useState, useRef } from 'react';
import type {
  Article,
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  NewspaperPage,
  NewspaperDocument,
  ElementTypography,
} from '@epaper-studio/document-schema';
import {
  getPublicationPages,
  resolvePageColumnCount,
} from '@epaper-studio/document-schema';
import { RECOMMENDED_HINDI_FONT_COMBINATIONS } from '@epaper-studio/typography';
import { TypographyControls } from '../TypographyControls';
import { downscaleImageFile } from '../../../utils/imageOptimizer';
import type { MobileDrawerMode } from '../MobileBottomNav';

export interface MobileBottomSheetProps {
  mode: MobileDrawerMode;
  onClose: () => void;
  selectedArticle: Article | null;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onDuplicateArticle: (article: Article) => void;
  onApplyTypographyToPage?: (typography: ElementTypography) => void;
  onAddArticle: () => void;
  currentPage: NewspaperPage;
  currentPageIndex: number;
  totalPages: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  onMovePageLeft?: () => void;
  onMovePageRight?: () => void;
  document: NewspaperDocument;
  onUpdateLayout: (layout: NewspaperLayoutConfig) => void;
  onUpdateMasthead: (masthead: MastheadConfig) => void;
  onPageSizeChange: (size: PageSizePreset) => void;
  onOrientationChange: (orientation: PageOrientation) => void;
  useFreeLayout: boolean;
  onToggleFreeLayout: () => void;
  onAutoFit?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onPrintPdf: () => void;
  onOpenTheme: () => void;
  onExportProjectJson: () => void;
  onDeselectArticle: () => void;
  onSelectArticle: (id: string) => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  mode,
  onClose,
  selectedArticle,
  onUpdateArticle,
  onDeleteArticle,
  onDuplicateArticle,
  onApplyTypographyToPage,
  onAddArticle,
  currentPage,
  currentPageIndex,
  totalPages,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePageLeft,
  onMovePageRight,
  document: doc,
  onUpdateLayout,
  onUpdateMasthead,
  onPageSizeChange,
  onOrientationChange,
  useFreeLayout,
  onToggleFreeLayout,
  onAutoFit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportPdf,
  isExportingPdf,
  onPrintPdf,
  onOpenTheme,
  onExportProjectJson,
  onDeselectArticle,
  onSelectArticle,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (mode === 'none') return null;

  // Normalize legacy modes
  const currentTab: 'text' | 'image' | 'layout' | 'style' | 'pages' | 'more' =
    mode === 'inspector'
      ? selectedArticle
        ? 'text'
        : 'layout'
      : mode === 'blocks'
        ? 'text'
        : mode === 'presets'
          ? 'style'
          : mode;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedArticle) {
      try {
        const compressed = await downscaleImageFile(file, 1600, 0.85);
        onUpdateArticle({
          ...selectedArticle,
          imageUrl: compressed,
          imagePlacement: selectedArticle.imagePlacement === 'none' ? 'top' : selectedArticle.imagePlacement,
          imageFit: selectedArticle.imageFit ?? 'cover',
          imageAspect: selectedArticle.imageAspect ?? 'standard',
        });
      } catch {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const base64 = loadEvt.target?.result as string;
          onUpdateArticle({
            ...selectedArticle,
            imageUrl: base64,
            imagePlacement: selectedArticle.imagePlacement === 'none' ? 'top' : selectedArticle.imagePlacement,
            imageFit: selectedArticle.imageFit ?? 'cover',
            imageAspect: selectedArticle.imageAspect ?? 'standard',
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const getTitle = () => {
    switch (currentTab) {
      case 'text':
        return selectedArticle
          ? `🔤 ${selectedArticle.headline || 'खबर संपादन'}`
          : '🔤 टेक्स्ट और टाइपोग्राफी';
      case 'image':
        return selectedArticle ? '🖼️ फोटो व चित्र' : '🖼️ फोटो प्रबंधन';
      case 'layout':
        return '⊞ लेआउट व कॉलम';
      case 'style':
        return '🎨 अख़बार शैली व रंग';
      case 'pages':
        return `📄 पृष्ठ प्रबंधन (${currentPageIndex + 1}/${totalPages})`;
      case 'more':
        return '⋯ अधिक टूल्स व एक्सपोर्ट';
      default:
        return 'संपादक';
    }
  };

  return (
    <div
      data-testid="mobile-bottom-sheet"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        height: isExpanded ? '62vh' : '38vh',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -6px 25px rgba(0,0,0,0.22)',
        borderTop: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
        transition: 'height 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Sheet Top Bar: Drag indicator, Title, Expand/Collapse & Close */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getTitle()}
          </span>
          {selectedArticle && (
            <button
              type="button"
              onClick={onDeselectArticle}
              title="चयन हटाएँ"
              style={{
                fontSize: '10px',
                color: '#64748b',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              चयन हटाएँ ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Expand / Collapse Button */}
          <button
            type="button"
            data-testid="sheet-toggle-expand"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'छोटा करें' : 'बड़ा करें'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 8px',
              cursor: 'pointer',
              minHeight: '32px',
            }}
          >
            <span>{isExpanded ? '▼ छोटा' : '▲ बड़ा'}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            data-testid="sheet-close-btn"
            onClick={onClose}
            aria-label="बंद करें (Close)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#64748b',
              fontSize: '18px',
              fontWeight: 700,
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable Sheet Body */}
      <div
        data-testid="sheet-body"
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* =========================================================
         * TAB 1: TEXT & TYPOGRAPHY
         * ========================================================= */}
        {currentTab === 'text' && (
          <div>
            {selectedArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Headline Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    मुख्य शीर्षक (Headline)
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.headline}
                    onChange={(e) => onUpdateArticle({ ...selectedArticle, headline: e.target.value })}
                    placeholder="खबर का मुख्य शीर्षक..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Subheadline & Byline in 2 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#64748b',
                        marginBottom: '3px',
                      }}
                    >
                      उपशीर्षक (Subheadline)
                    </label>
                    <input
                      type="text"
                      value={selectedArticle.subheadline ?? ''}
                      onChange={(e) =>
                        onUpdateArticle({ ...selectedArticle, subheadline: e.target.value })
                      }
                      placeholder="उपशीर्षक..."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#64748b',
                        marginBottom: '3px',
                      }}
                    >
                      लेखक / ब्यूरो (Byline)
                    </label>
                    <input
                      type="text"
                      value={selectedArticle.byline ?? ''}
                      onChange={(e) =>
                        onUpdateArticle({ ...selectedArticle, byline: e.target.value })
                      }
                      placeholder="विशेष संवाददाता..."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Paragraphs Editor */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                      मुख्य समाचार विवरण (Body Text)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateArticle({
                          ...selectedArticle,
                          body: selectedArticle.body
                            ? `${selectedArticle.body}\n\nनया अनुच्छेद यहाँ लिखें...`
                            : 'नया अनुच्छेद यहाँ लिखें...',
                        })
                      }
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ✚ नया पैराग्राफ
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={selectedArticle.body}
                    onChange={(e) =>
                      onUpdateArticle({ ...selectedArticle, body: e.target.value })
                    }
                    placeholder="खबर का मुख्य विवरण यहाँ लिखें (अनुच्छेद बदलने के लिए दो बार Enter दबाएँ)..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      lineHeight: 1.6,
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Typography Controls for this Article */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <TypographyControls
                    selectedArticle={selectedArticle}
                    onUpdateArticle={onUpdateArticle}
                    onApplyToPage={onApplyTypographyToPage}
                  />
                </div>

                {/* Block Management Actions */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    paddingTop: '10px',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onDuplicateArticle(selectedArticle)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>📑</span> डुप्लीकेट ब्लॉक
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('क्या आप वाकई इस ब्लॉक को हटाना चाहते हैं?')) {
                        onDeleteArticle(selectedArticle.id);
                      }
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#b91c1c',
                      cursor: 'pointer',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🗑️</span> ब्लॉक हटाएँ
                  </button>
                </div>
              </div>
            ) : (
              /* No Article Selected View */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '16px 8px',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '28px' }}>📝</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    कोई खबर चुनी नहीं गई है
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    संपादन के लिए ऊपर दिए गए अख़बार कैनवास पर किसी खबर को छुएँ, या नीचे नया ब्लॉक जोड़ें।
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onAddArticle}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>✚</span> नई खबर जोड़ें (Add Article)
                </button>

                {/* Article quick selector if page has articles */}
                {currentPage.articles.length > 0 && (
                  <div style={{ width: '100%', marginTop: '8px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textAlign: 'left',
                        marginBottom: '6px',
                      }}
                    >
                      इस पेज की खबरें ({currentPage.articles.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentPage.articles.map((art) => (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => onSelectArticle(art.id)}
                          style={{
                            textAlign: 'left',
                            padding: '8px 10px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#0f172a',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '44px',
                          }}
                        >
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '240px',
                            }}
                          >
                            {art.headline || 'अनाम खबर'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>चुनें ➔</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
         * TAB 2: IMAGE EDITING
         * ========================================================= */}
        {currentTab === 'image' && (
          <div>
            {selectedArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ display: 'none' }}
                />

                {/* Image preview & upload button */}
                <div
                  style={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {selectedArticle.imageUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        style={{
                          height: '120px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={selectedArticle.imageUrl}
                          alt={selectedArticle.imageCaption || 'Preview'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: selectedArticle.imageFit ?? 'cover',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                        >
                          📷 फोटो बदलें (Replace)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateArticle({
                              ...selectedArticle,
                              imageUrl: undefined,
                              imagePlacement: 'none',
                            })
                          }
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                        >
                          हटाएँ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 0',
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>📷</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                        इस खबर में कोई फोटो नहीं है
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          marginTop: '6px',
                          padding: '8px 16px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          minHeight: '44px',
                        }}
                      >
                        फोटो अपलोड करें (Upload Image)
                      </button>
                    </div>
                  )}
                </div>

                {selectedArticle.imageUrl && (
                  <>
                    {/* Fit Mode */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '4px',
                        }}
                      >
                        फिट मोड (Fit Mode)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {[
                          { id: 'cover' as const, label: 'Cover (क्रॉप)' },
                          { id: 'contain' as const, label: 'Contain (पूरा)' },
                          { id: 'fill' as const, label: 'Fill (स्ट्रेच)' },
                        ].map((fit) => (
                          <button
                            key={fit.id}
                            type="button"
                            onClick={() => onUpdateArticle({ ...selectedArticle, imageFit: fit.id })}
                            style={{
                              padding: '8px 4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor:
                                (selectedArticle.imageFit ?? 'cover') === fit.id
                                  ? '#eff6ff'
                                  : '#ffffff',
                              color:
                                (selectedArticle.imageFit ?? 'cover') === fit.id
                                  ? '#1d4ed8'
                                  : '#475569',
                              border: `1px solid ${(selectedArticle.imageFit ?? 'cover') === fit.id ? '#3b82f6' : '#cbd5e1'}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              minHeight: '44px',
                            }}
                          >
                            {fit.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Placement */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '4px',
                        }}
                      >
                        स्थान (Placement)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {[
                          { id: 'top' as const, label: 'शीर्ष (Top)' },
                          { id: 'middle' as const, label: 'मध्य (Middle)' },
                          { id: 'side' as const, label: 'साइड (Side)' },
                          { id: 'bottom' as const, label: 'नीचे (Bottom)' },
                        ].map((plc) => (
                          <button
                            key={plc.id}
                            type="button"
                            onClick={() =>
                              onUpdateArticle({ ...selectedArticle, imagePlacement: plc.id })
                            }
                            style={{
                              padding: '8px 4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              backgroundColor:
                                selectedArticle.imagePlacement === plc.id ? '#eff6ff' : '#ffffff',
                              color:
                                selectedArticle.imagePlacement === plc.id ? '#1d4ed8' : '#475569',
                              border: `1px solid ${selectedArticle.imagePlacement === plc.id ? '#3b82f6' : '#cbd5e1'}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              minHeight: '44px',
                            }}
                          >
                            {plc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caption & Credit */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#64748b',
                            marginBottom: '3px',
                          }}
                        >
                          कैप्शन (Caption)
                        </label>
                        <input
                          type="text"
                          value={selectedArticle.imageCaption ?? ''}
                          onChange={(e) =>
                            onUpdateArticle({ ...selectedArticle, imageCaption: e.target.value })
                          }
                          placeholder="फोटो का विवरण..."
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#64748b',
                            marginBottom: '3px',
                          }}
                        >
                          फोटो क्रेडिट (Photo Credit)
                        </label>
                        <input
                          type="text"
                          value={selectedArticle.imageCredit ?? ''}
                          onChange={(e) =>
                            onUpdateArticle({ ...selectedArticle, imageCredit: e.target.value })
                          }
                          placeholder="उदा. PTI / फाइल फोटो"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '32px' }}>🖼️</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  फोटो जोड़ने के लिए खबर चुनें
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  अख़बार के कैनवास पर किसी भी खबर को टैप करके उसमें फोटो अपलोड कर सकते हैं।
                </span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
         * TAB 3: LAYOUT & COLUMNS
         * ========================================================= */}
        {currentTab === 'layout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Page Paper Size Preset */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                कागज का आकार (Paper Size)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {(['a3', 'a4', 'broadsheet', 'tabloid'] as PageSizePreset[]).map((preset) => {
                  const isSelected = doc.metadata.pageSize === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onPageSizeChange(preset)}
                      style={{
                        padding: '8px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#1d4ed8' : '#334155',
                        border: `1px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minHeight: '44px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                दिशा (Orientation)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(['portrait', 'landscape'] as PageOrientation[]).map((orient) => {
                  const isSelected = doc.metadata.orientation === orient;
                  return (
                    <button
                      key={orient}
                      type="button"
                      onClick={() => onOrientationChange(orient)}
                      style={{
                        padding: '8px 4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#1d4ed8' : '#334155',
                        border: `1px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minHeight: '44px',
                      }}
                    >
                      {orient === 'portrait' ? 'पोर्ट्रेट (खड़ा)' : 'लैंडस्केप (आड़ा)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column Count */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                  कॉलम संख्या (Columns: {resolvePageColumnCount({ layout: doc.layout }, currentPage)})
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {[2, 3, 4, 5, 6].map((cols) => {
                  const activeCols = resolvePageColumnCount({ layout: doc.layout }, currentPage);
                  const isSelected = activeCols === cols;
                  return (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => {
                        const newLayout = { ...doc.layout, columns: cols };
                        onUpdateLayout(newLayout);
                      }}
                      style={{
                        padding: '8px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isSelected ? '#b91c1c' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#334155',
                        border: `1px solid ${isSelected ? '#b91c1c' : '#cbd5e1'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minHeight: '44px',
                      }}
                    >
                      {cols} कॉलम
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spacing Density */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                दूरी व सघनता (Spacing Density)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'compact' as const, label: 'सघन (Compact)' },
                  { id: 'normal' as const, label: 'सामान्य (Normal)' },
                  { id: 'spacious' as const, label: 'खुला (Spacious)' },
                ].map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onUpdateLayout({ ...doc.layout, spacingDensity: sp.id })}
                    style={{
                      padding: '8px 4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor:
                        doc.layout.spacingDensity === sp.id ? '#eff6ff' : '#ffffff',
                      color: doc.layout.spacingDensity === sp.id ? '#1d4ed8' : '#475569',
                      border: `1px solid ${doc.layout.spacingDensity === sp.id ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Rule Divider */}
            <div>
              <button
                type="button"
                onClick={() => onUpdateLayout({ ...doc.layout, columnRule: !doc.layout.columnRule })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: doc.layout.columnRule ? '#eff6ff' : '#ffffff',
                  border: `1px solid ${doc.layout.columnRule ? '#3b82f6' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: doc.layout.columnRule ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>कॉलम विभाजक रेखा (Column Divider Rule)</span>
                <span>{doc.layout.columnRule ? 'चालू (ON)' : 'बंद (OFF)'}</span>
              </button>
            </div>

            {/* Free Layout Mode & Auto-Fit */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={onToggleFreeLayout}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: useFreeLayout ? '#f0fdf4' : '#ffffff',
                  border: `1px solid ${useFreeLayout ? '#22c55e' : '#cbd5e1'}`,
                  color: useFreeLayout ? '#15803d' : '#334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>📐</span> {useFreeLayout ? 'मुक्त लेआउट ON' : 'मुक्त लेआउट OFF'}
              </button>

              {onAutoFit && (
                <button
                  type="button"
                  onClick={onAutoFit}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>⚖️</span> ऑटो-फिट कॉलम
                </button>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
         * TAB 4: STYLE, THEMES & MASTHEAD
         * ========================================================= */}
        {currentTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Theme Presets Button */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                  रंग व थीम (Themes)
                </label>
                <button
                  type="button"
                  onClick={onOpenTheme}
                  style={{
                    fontSize: '11px',
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  थीम गैलरी खोलें ➔
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { id: 'classic-bw', label: 'Classic B&W' },
                  { id: 'warm-sepia', label: 'Warm Sepia' },
                  { id: 'modern-minimalist', label: 'Modern Clean' },
                  { id: 'editorial-gray', label: 'Editorial Gray' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={onOpenTheme}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      minHeight: '44px',
                      textAlign: 'left',
                    }}
                  >
                    🎨 {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Masthead Config (Front Page Title) */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                मुख्य मास्टहेड (Masthead Title)
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={doc.masthead.title}
                  onChange={(e) => onUpdateMasthead({ ...doc.masthead, title: e.target.value })}
                  placeholder="दैनिक नवयुग..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <input
                    type="text"
                    value={doc.masthead.edition ?? ''}
                    onChange={(e) => onUpdateMasthead({ ...doc.masthead, edition: e.target.value })}
                    placeholder="संस्करण (उदा. भोपाल)"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    value={doc.masthead.date ?? ''}
                    onChange={(e) => onUpdateMasthead({ ...doc.masthead, date: e.target.value })}
                    placeholder="दिनांक"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Curated Devanagari Pairings */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                अनुशंसित फॉन्ट जोड़ियाँ (Font Pairings)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {RECOMMENDED_HINDI_FONT_COMBINATIONS.slice(0, 3).map((combo) => (
                  <button
                    key={combo.id}
                    type="button"
                    onClick={() =>
                      onUpdateLayout({
                        ...doc.layout,
                        mastheadFont: combo.mastheadFont,
                        headlineFont: combo.headlineFont,
                        subheadlineFont: combo.subheadlineFont,
                        bodyFont: combo.bodyFont,
                      })
                    }
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                      {combo.nameHi}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{combo.descriptionHi}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
         * TAB 5: PAGES MANAGEMENT
         * ========================================================= */}
        {currentTab === 'pages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                अख़बार के पृष्ठ ({totalPages})
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                सक्रिय: पेज {currentPageIndex + 1}
              </span>
            </div>

            {/* Page Selector Strip */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {getPublicationPages(doc).map((p, idx) => {
                const isSelected = idx === currentPageIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPage(idx)}
                    style={{
                      flexShrink: 0,
                      width: '64px',
                      height: '84px',
                      backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                      border: `2px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 4px',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#334155' }}>
                      पृष्ठ {idx + 1}
                    </span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>
                      {p.articles.length} खबरें
                    </span>
                    <span style={{ fontSize: '12px' }}>{idx === 0 ? '🗞️' : '📄'}</span>
                  </button>
                );
              })}
            </div>

            {/* Page Actions: Add Page, Duplicate Page, Delete Page */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={onAddPage}
                style={{
                  padding: '10px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>✚</span> नया पेज जोड़ें
              </button>

              <button
                type="button"
                onClick={onDuplicatePage}
                style={{
                  padding: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>📑</span> यह पेज डुप्लीकेट करें
              </button>
            </div>

            {/* Reorder & Delete */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              {onMovePageLeft && (
                <button
                  type="button"
                  onClick={onMovePageLeft}
                  disabled={currentPageIndex <= 0}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: currentPageIndex <= 0 ? '#94a3b8' : '#334155',
                    cursor: currentPageIndex <= 0 ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                  }}
                >
                  ◀ बाएँ ले जाएँ
                </button>
              )}

              {onMovePageRight && (
                <button
                  type="button"
                  onClick={onMovePageRight}
                  disabled={currentPageIndex >= totalPages - 1}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: currentPageIndex >= totalPages - 1 ? '#94a3b8' : '#334155',
                    cursor: currentPageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                  }}
                >
                  दाएँ ले जाएँ ▶
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (totalPages <= 1) {
                    alert('अख़बार में कम से कम एक पृष्ठ होना आवश्यक है।');
                    return;
                  }
                  if (
                    currentPage.articles.length === 0 ||
                    window.confirm(
                      `पेज ${currentPageIndex + 1} पर ${currentPage.articles.length} खबरें हैं। क्या आप इसे हटाना चाहते हैं?`
                    )
                  ) {
                    onDeletePage();
                  }
                }}
                disabled={totalPages <= 1}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: totalPages <= 1 ? '#f1f5f9' : '#fef2f2',
                  border: `1px solid ${totalPages <= 1 ? '#e2e8f0' : '#fecaca'}`,
                  color: totalPages <= 1 ? '#94a3b8' : '#ef4444',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: totalPages <= 1 ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                }}
              >
                🗑️ पेज हटाएँ
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
         * TAB 6: MORE TOOLS & EXPORTS
         * ========================================================= */}
        {currentTab === 'more' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Undo / Redo */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                इतिहास (History)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  style={{
                    padding: '8px',
                    backgroundColor: canUndo ? '#ffffff' : '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: canUndo ? '#0f172a' : '#94a3b8',
                    cursor: canUndo ? 'pointer' : 'not-allowed',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>↶</span> पूर्ववत (Undo)
                </button>

                <button
                  type="button"
                  onClick={onRedo}
                  disabled={!canRedo}
                  style={{
                    padding: '8px',
                    backgroundColor: canRedo ? '#ffffff' : '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: canRedo ? '#0f172a' : '#94a3b8',
                    cursor: canRedo ? 'pointer' : 'not-allowed',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>↷</span> पुनः करें (Redo)
                </button>
              </div>
            </div>

            {/* Export Actions */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                अख़बार डाउनलोड व प्रिंट (Export)
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={onExportPdf}
                  disabled={isExportingPdf}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: isExportingPdf ? 'wait' : 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>📥</span> {isExportingPdf ? 'PDF तैयार हो रहा है...' : 'PDF डाउनलोड करें (100% In-Browser)'}
                </button>

                <button
                  type="button"
                  onClick={onPrintPdf}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🖨️</span> प्रिंट / सेव एज़ PDF (Print Fallback)
                </button>
              </div>
            </div>

            {/* Project Backup & Storage */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                प्रोजेक्ट बैकअप (Project)
              </label>

              <button
                type="button"
                onClick={onExportProjectJson}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>💾</span> प्रोजेक्ट JSON बैकअप डाउनलोड करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
