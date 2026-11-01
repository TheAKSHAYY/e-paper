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
  NewspaperPresetId,
  ImagePlacement,
  ImageFit,
} from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';
import { TypographyControls } from '../TypographyControls';
import { ELEMENT_PRESETS } from '../ElementsPanel';
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
  onAddBlock: (blockTemplate?: Partial<Article>) => void;
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
  onApplyPreset?: (presetId: NewspaperPresetId) => void;
  onApplyLayoutRow?: (columns: number[]) => void;
  onOpenTheme?: () => void;
  onDeselectArticle: () => void;
  onSelectArticle: (id: string) => void;
  selectedParagraphIndex?: number | null;
  onSelectParagraph?: (index: number | null) => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  mode,
  onClose,
  selectedArticle,
  onUpdateArticle,
  onDeleteArticle,
  onDuplicateArticle,
  onApplyTypographyToPage,
  onAddBlock,
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
  onApplyPreset,
  onApplyLayoutRow,
  onOpenTheme,
  onDeselectArticle,
  onSelectArticle,
  selectedParagraphIndex,
  onSelectParagraph,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (mode === 'none') return null;

  const presets = getAllNewspaperPresets();

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedArticle) {
      try {
        const compressed = await downscaleImageFile(file, 1600, 0.85);
        onUpdateArticle({
          ...selectedArticle,
          imageUrl: compressed,
          imagePlacement:
            selectedArticle.imagePlacement === 'none' ? 'top' : selectedArticle.imagePlacement,
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
            imagePlacement:
              selectedArticle.imagePlacement === 'none' ? 'top' : selectedArticle.imagePlacement,
            imageFit: selectedArticle.imageFit ?? 'cover',
            imageAspect: selectedArticle.imageAspect ?? 'standard',
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'pages':
        return `▤ पृष्ठ प्रबंधन (Page ${currentPageIndex + 1} of ${totalPages})`;
      case 'blocks':
        return '✚ नया समाचार ब्लॉक जोड़ें';
      case 'inspector':
        return selectedArticle
          ? `✎ समाचार संपादक: ${selectedArticle.headline ? selectedArticle.headline.slice(0, 20) + '...' : 'ब्लॉक'}`
          : '✎ पृष्ठ गुण व विन्यास';
      case 'presets':
        return '❖ अख़बार प्रारूप व विन्यास';
      default:
        return 'टूलबार';
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
        height: isExpanded ? '68vh' : '42vh',
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
      {/* ── SHEET HEADER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
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
          {selectedArticle && mode === 'inspector' && (
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Expand / Collapse Button */}
          <button
            type="button"
            data-testid="sheet-toggle-expand"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'छोटा करें' : 'बड़ा करें'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {isExpanded ? '▼' : '▲'}
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
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── SHEET BODY SCROLLABLE ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* ==========================================================
         * 1. PAGES DRAWER (पेज प्रबंधन)
         * ========================================================== */}
        {mode === 'pages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Quick Page Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                data-testid="mobile-add-page-btn"
                onClick={onAddPage}
                style={{
                  padding: '10px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '44px',
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
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '44px',
                }}
              >
                <span>📑</span> डुप्लीकेट पेज
              </button>
            </div>

            {/* Reorder and Delete Row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {onMovePageLeft && (
                <button
                  type="button"
                  disabled={currentPageIndex === 0}
                  onClick={onMovePageLeft}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: currentPageIndex === 0 ? '#94a3b8' : '#334155',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
                    minHeight: '40px',
                  }}
                >
                  ← आगे खिसकाएँ
                </button>
              )}

              {onMovePageRight && (
                <button
                  type="button"
                  disabled={currentPageIndex >= totalPages - 1}
                  onClick={onMovePageRight}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: currentPageIndex >= totalPages - 1 ? '#94a3b8' : '#334155',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: currentPageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    minHeight: '40px',
                  }}
                >
                  → पीछे खिसकाएँ
                </button>
              )}

              {totalPages > 1 && (
                <button
                  type="button"
                  onClick={onDeletePage}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: '40px',
                  }}
                >
                  🗑️ पेज हटाएँ
                </button>
              )}
            </div>

            {/* Page List Cards */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                अख़बार के सभी पृष्ठ (Pages in Newspaper)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {Array.from({ length: totalPages }).map((_, pIdx) => {
                  const isActive = pIdx === currentPageIndex;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => onSelectPage(pIdx)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: isActive ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                        backgroundColor: isActive ? '#fff5f5' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#b91c1c' : '#0f172a' }}>
                          पृष्ठ {pIdx + 1}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>
                            सक्रिय
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {pIdx === 0 ? 'मुखपृष्ठ (Front Page)' : `अंदरूनी पृष्ठ ${pIdx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auto-fit Button */}
            {onAutoFit && (
              <button
                type="button"
                onClick={onAutoFit}
                style={{
                  padding: '9px 12px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                📐 वर्तमान पेज को ऑटो-फिट करें (Auto-fit Grid)
              </button>
            )}
          </div>
        )}

        {/* ==========================================================
         * 2. ADD BLOCK DRAWER (+ ब्लॉक)
         * ========================================================== */}
        {mode === 'blocks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
              पेज पर जोड़ने के लिए किसी भी समाचार या विज्ञापन ब्लॉक पर टैप करें:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ELEMENT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  data-testid={`add-block-preset-${preset.id}`}
                  onClick={() => {
                    onAddBlock(preset.data);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{preset.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {preset.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {preset.description}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {preset.defaultSpan} Col
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================================
         * 3. INSPECTOR / EDITOR DRAWER (संपादक / गुण)
         * ========================================================== */}
        {mode === 'inspector' && (
          <div>
            {selectedArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Kicker & Headline */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    किकर / विषय (Kicker)
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.kickerText || ''}
                    onChange={(e) => onUpdateArticle({ ...selectedArticle, kickerText: e.target.value })}
                    placeholder="उदा. विशेष रिपोर्ट / ताज़ा खबर..."
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    मुख्य शीर्षक (Headline) *
                  </label>
                  <input
                    type="text"
                    data-testid="mobile-input-headline"
                    value={selectedArticle.headline}
                    onChange={(e) => onUpdateArticle({ ...selectedArticle, headline: e.target.value })}
                    placeholder="मुख्य खबर का शीर्षक..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    उप-शीर्षक (Subheadline)
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.subheadline || ''}
                    onChange={(e) => onUpdateArticle({ ...selectedArticle, subheadline: e.target.value })}
                    placeholder="खबर की उप-सुर्खी..."
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 2. Dateline & Byline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      स्थान / तिथि (Dateline)
                    </label>
                    <input
                      type="text"
                      value={selectedArticle.dateline || ''}
                      onChange={(e) => onUpdateArticle({ ...selectedArticle, dateline: e.target.value })}
                      placeholder="नई दिल्ली —"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '11.5px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      लेखक (Byline)
                    </label>
                    <input
                      type="text"
                      value={selectedArticle.byline || ''}
                      onChange={(e) => onUpdateArticle({ ...selectedArticle, byline: e.target.value })}
                      placeholder="विशेष संवाददाता"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '11.5px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* 3. Body Text */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                      समाचार का मुख्य विवरण (Body Text)
                    </label>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                      {selectedArticle.body.trim().split(/\s+/).filter(Boolean).length} शब्द
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    data-testid="mobile-input-body"
                    value={selectedArticle.body}
                    onChange={(e) => onUpdateArticle({ ...selectedArticle, body: e.target.value })}
                    placeholder="खबर का विवरण लिखें (पैराग्राफ बदलने हेतु दो बार Enter दबाएँ)..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* 4. Complete Typography Controls (Requirement 3) */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <TypographyControls
                    selectedArticle={selectedArticle}
                    selectedParagraphIndex={selectedParagraphIndex}
                    onSelectParagraph={onSelectParagraph}
                    onUpdateArticle={onUpdateArticle}
                    onApplyToPage={onApplyTypographyToPage}
                    isMobile={true}
                  />
                </div>

                {/* 5. Photo & Media */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    फोटो व चित्र (Photo & Media)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>📷</span> {selectedArticle.imageUrl ? 'फोटो बदलें' : 'फोटो अपलोड करें'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileChange}
                    />

                    {selectedArticle.imageUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateArticle({ ...selectedArticle, imageUrl: undefined })}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: '#b91c1c',
                          cursor: 'pointer',
                          minHeight: '40px',
                        }}
                      >
                        फोटो हटाएँ
                      </button>
                    )}
                  </div>

                  {selectedArticle.imageUrl && (
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          स्थान (Placement)
                        </label>
                        <select
                          value={selectedArticle.imagePlacement || 'top'}
                          onChange={(e) =>
                            onUpdateArticle({
                              ...selectedArticle,
                              imagePlacement: e.target.value as ImagePlacement,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                          }}
                        >
                          <option value="top">शीर्ष पर (Top)</option>
                          <option value="bottom">नीचे (Bottom)</option>
                          <option value="side">बाजू में (Side)</option>
                          <option value="none">छुपाएँ (Hidden)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          फिट (Fit Mode)
                        </label>
                        <select
                          value={selectedArticle.imageFit || 'cover'}
                          onChange={(e) =>
                            onUpdateArticle({
                              ...selectedArticle,
                              imageFit: e.target.value as ImageFit,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                          }}
                        >
                          <option value="cover">क्रॉप (Cover)</option>
                          <option value="contain">पूरा (Contain)</option>
                          <option value="fill">खिंचाव (Fill)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Column Span & Actions */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                      कॉलम फैलाव (Column Span)
                    </label>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c' }}>
                      {selectedArticle.columnSpan} / 12
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={selectedArticle.columnSpan}
                    onChange={(e) =>
                      onUpdateArticle({
                        ...selectedArticle,
                        columnSpan: parseInt(e.target.value, 10),
                      })
                    }
                    style={{ width: '100%', accentColor: '#b91c1c' }}
                  />
                </div>

                {/* Duplicate & Delete Block Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => onDuplicateArticle(selectedArticle)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '11.5px',
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
                      onDeleteArticle(selectedArticle.id);
                      onClose();
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
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
              /* No Article Selected -> Page-wide Layout & Masthead Settings */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#475569' }}>
                  ℹ️ किसी ब्लॉक को संपादित करने हेतु उस पर टैप करें, या नीचे पृष्ठ विन्यास सेटिंग्स बदलें:
                </div>

                {/* Masthead Title & Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                    अख़बार का मुख्य नाम (Masthead Title)
                  </label>
                  <input
                    type="text"
                    value={doc.masthead.title}
                    onChange={(e) => onUpdateMasthead({ ...doc.masthead, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      दिनांक (Date)
                    </label>
                    <input
                      type="text"
                      value={doc.masthead.date}
                      onChange={(e) => onUpdateMasthead({ ...doc.masthead, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '11.5px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      संस्करण (Edition)
                    </label>
                    <input
                      type="text"
                      value={doc.masthead.edition || ''}
                      onChange={(e) => onUpdateMasthead({ ...doc.masthead, edition: e.target.value })}
                      placeholder="उदा. नई दिल्ली"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '11.5px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Page Columns */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    पृष्ठ ग्रिड कॉलम (Page Columns)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[4, 6, 8, 12].map((cols) => {
                      const isActive = doc.layout.columnCount === cols;
                      return (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => onUpdateLayout({ ...doc.layout, columnCount: cols })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: isActive ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                            backgroundColor: isActive ? '#fff5f5' : '#ffffff',
                            color: isActive ? '#b91c1c' : '#0f172a',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {cols} Cols
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Articles on this Page */}
                {currentPage.articles.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      इस पृष्ठ के समाचार ब्लॉक (Articles on this Page):
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentPage.articles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => onSelectArticle(art.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            {art.headline || 'समाचार ब्लॉक'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700 }}>संपादित करें ✎</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
         * 4. PRESETS / FORMAT DRAWER (प्रारूप)
         * ========================================================== */}
        {mode === 'presets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. Newspaper Presets */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                अख़बार प्रारूप (Newspaper Presets)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {presets.map((preset) => {
                  const isSelected = doc.layout.presetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onApplyPreset?.(preset.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: isSelected ? '#b91c1c' : '#0f172a' }}>
                          {preset.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {preset.defaultColumns} कॉलम • {preset.recommendedPageSize.toUpperCase()}
                        </div>
                      </div>
                      {isSelected && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                          लागू है
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. 12-Column Row Presets */}
            {onApplyLayoutRow && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  पंक्ति लेआउट (12-Col Row Presets)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { label: '6 + 6 (समान दो)', cols: [6, 6] },
                    { label: '4 + 4 + 4 (तीन कॉलम)', cols: [4, 4, 4] },
                    { label: '8 + 4 (लीड + साइड)', cols: [8, 4] },
                    { label: '12 (पूरा बैनर)', cols: [12] },
                  ].map((rowPreset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onApplyLayoutRow(rowPreset.cols);
                        onClose();
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minHeight: '40px',
                      }}
                    >
                      {rowPreset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Page Size & Orientation */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                कागज़ का आकार व दिशा (Size & Orientation)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', color: '#64748b', marginBottom: '3px' }}>
                    आकार (Page Size)
                  </label>
                  <select
                    value={doc.metadata.pageSize}
                    onChange={(e) => onPageSizeChange(e.target.value as PageSizePreset)}
                    style={{
                      width: '100%',
                      padding: '7px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11.5px',
                    }}
                  >
                    <option value="broadsheet">ब्रॉडशीट (Broadsheet)</option>
                    <option value="berliner">बर्लिनर (Berliner)</option>
                    <option value="a3">A3 पोस्टर (A3)</option>
                    <option value="tabloid">टैब्लॉयड (Tabloid)</option>
                    <option value="a4">A4 मानक (A4)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', color: '#64748b', marginBottom: '3px' }}>
                    दिशा (Orientation)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onOrientationChange(doc.metadata.orientation === 'portrait' ? 'landscape' : 'portrait')
                    }
                    style={{
                      width: '100%',
                      padding: '7px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {doc.metadata.orientation === 'portrait' ? '↕ लंबवत (Portrait)' : '↔ क्षैतिज (Landscape)'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Color Themes & Free Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {onOpenTheme && (
                <button
                  type="button"
                  onClick={onOpenTheme}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  🎨 रंग व कागज़ थीम
                </button>
              )}

              <button
                type="button"
                onClick={onToggleFreeLayout}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: useFreeLayout ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                  backgroundColor: useFreeLayout ? '#fff5f5' : '#f8fafc',
                  color: useFreeLayout ? '#b91c1c' : '#0f172a',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {useFreeLayout ? '🔓 मुक्त लेआउट ऑन' : '🔒 ग्रिड लेआउट ऑन'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
