import React, { useState, useEffect, useRef } from 'react';
import type {
  Article,
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  PageDimensions,
  PageMargins,
  NewspaperPage,
  NewspaperDocument,
  ElementTypography,
  NewspaperPresetId,
  ImagePlacement,
  ImageFit,
  SelectedElementPart,
} from '@epaper-studio/document-schema';
import { TypographyControls } from '../TypographyControls';
import { BorderControls } from '../BorderControls';
import { ELEMENT_PRESETS } from '../ElementsPanel';
import { MastheadInspectorPanel } from '../MastheadInspectorPanel';
import { PageSetupContent } from '../PageSetupContent';
import { LayoutPresetsContent } from '../LayoutPresetsContent';
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
  onPageSetupApply?: (config: {
    pageSize: PageSizePreset;
    orientation: PageOrientation;
    dimensions?: PageDimensions;
    margins?: PageMargins;
  }) => void;
  useFreeLayout: boolean;
  onToggleFreeLayout: () => void;
  onAutoFit?: () => void;
  onOpenPublishing?: () => void;
  onApplyPreset?: (presetId: NewspaperPresetId) => void;
  onApplyLayoutRow?: (columns: number[]) => void;
  onOpenTheme?: () => void;
  onDeselectArticle: () => void;
  onSelectArticle: (id: string) => void;
  selectedParagraphIndex?: number | null;
  onSelectParagraph?: (index: number | null) => void;
  initialTargetElement?: 'headline' | 'subheadline' | 'body';
  selectedElementPart?: SelectedElementPart;
  isMastheadSelected?: boolean;
  mastheadTab?: 'title' | 'subheaders' | 'meta' | 'rules';
  onOpenTemplateGallery?: (
    category?: 'all' | 'pages' | 'mastheads' | 'articles' | 'breaking' | 'dividers' | 'favorites'
  ) => void;
  onOpenDesignLibrary?: () => void;
  editorMode?: 'simple' | 'pro';
  onToggleEditorMode?: () => void;
  onOpenWhatsAppPaste?: () => void;
  onClearPage?: () => void;
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
  onPageSetupApply,
  useFreeLayout: _useFreeLayout,
  onToggleFreeLayout: _onToggleFreeLayout,
  onOpenPublishing,
  onAutoFit,
  onApplyPreset,
  onApplyLayoutRow,
  onOpenTheme,
  onDeselectArticle,
  onSelectArticle,
  selectedParagraphIndex,
  onSelectParagraph,
  initialTargetElement,
  selectedElementPart,
  isMastheadSelected = false,
  mastheadTab,
  onOpenTemplateGallery,
  onOpenDesignLibrary,
  editorMode = 'simple',
  onToggleEditorMode,
  onOpenWhatsAppPaste,
  onClearPage,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [presetTab, setPresetTab] = useState<'presets' | 'pagesetup' | 'theme'>(
    mode === 'page-setup' ? 'pagesetup' : 'presets'
  );
  const [activePart, setActivePart] = useState<
    'headline' | 'subheadline' | 'body' | 'image' | 'block'
  >(
    initialTargetElement === 'subheadline'
      ? 'subheadline'
      : initialTargetElement === 'body'
        ? 'body'
        : 'headline'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'page-setup') {
      setPresetTab('pagesetup');
    } else if (mode === 'presets') {
      setPresetTab('presets');
    }
  }, [mode]);

  useEffect(() => {
    if (
      initialTargetElement === 'headline' ||
      initialTargetElement === 'subheadline' ||
      initialTargetElement === 'body'
    ) {
      setActivePart(initialTargetElement);
    }
  }, [initialTargetElement]);

  useEffect(() => {
    if (selectedElementPart === 'headline') setActivePart('headline');
    else if (selectedElementPart === 'subheadline') setActivePart('subheadline');
    else if (selectedElementPart === 'body') setActivePart('body');
    else if (selectedElementPart === 'image' || selectedElementPart === 'caption')
      setActivePart('image');
    else if (selectedElementPart === 'block') setActivePart('block');
  }, [selectedElementPart]);

  if (mode === 'none') return null;

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
        return `पृष्ठ प्रबंधन (पृष्ठ ${currentPageIndex + 1} / ${totalPages})`;
      case 'blocks':
        return 'नया समाचार ब्लॉक जोड़ें';
      case 'inspector':
        if (isMastheadSelected) {
          return 'मास्टहेड संपादक';
        }
        return selectedArticle
          ? `समाचार संपादक: ${selectedArticle.headline ? selectedArticle.headline.slice(0, 22) + '...' : 'ब्लॉक'}`
          : 'पृष्ठ गुण व विन्यास';
      case 'presets':
        return 'अख़बार प्रारूप व विन्यास';
      case 'page-setup':
        return 'कागज़ आकार व विन्यास';
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
        backgroundColor: '#FAF8F5',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -8px 28px rgba(20, 18, 16, 0.24)',
        borderTop: '1px solid #E3DCD0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
        transition: 'height 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        fontFamily: "'Poppins', 'Hind', sans-serif",
      }}
    >
      {/* ── SHEET HEADER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid #E3DCD0',
          backgroundColor: '#FFFFFF',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#1C1917',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getTitle()}
          </span>
          {(selectedArticle || isMastheadSelected) && mode === 'inspector' && (
            <button
              type="button"
              onClick={onDeselectArticle}
              title="चयन हटाएँ"
              data-testid="mobile-btn-clear-selection"
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#57534E',
                background: '#F4F0E8',
                border: '1px solid #E3DCD0',
                borderRadius: '6px',
                padding: '2px 7px',
                cursor: 'pointer',
              }}
            >
              चयन हटाएँ ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Mode Switcher Pill */}
          {onToggleEditorMode && (
            <button
              type="button"
              data-testid="sheet-toggle-editor-mode"
              onClick={onToggleEditorMode}
              title={editorMode === 'simple' ? 'प्रो मोड में स्विच करें' : 'सरल मोड में स्विच करें'}
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '4px 9px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: editorMode === 'simple' ? '#E3DCD0' : '#FECACA',
                backgroundColor: editorMode === 'simple' ? '#FAF8F5' : '#FEF2F2',
                color: editorMode === 'simple' ? '#1C1917' : '#B91C1C',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>{editorMode === 'simple' ? 'सरल' : 'प्रो'}</span>
            </button>
          )}

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
              borderRadius: '8px',
              border: '1px solid #E3DCD0',
              backgroundColor: '#FAF8F5',
              color: '#44403C',
              cursor: 'pointer',
              fontSize: '12px',
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
              borderRadius: '8px',
              border: '1px solid #FECACA',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              cursor: 'pointer',
              fontSize: '14px',
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

              {onClearPage && (
                <button
                  type="button"
                  data-testid="mobile-clear-page-btn"
                  onClick={onClearPage}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>🗑️</span> पृष्ठ खाली करें
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
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
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isActive ? '#b91c1c' : '#0f172a',
                          }}
                        >
                          पृष्ठ {pIdx + 1}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              color: '#b91c1c',
                              backgroundColor: '#fee2e2',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
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
            {/* Quick WhatsApp News Paste Card */}
            {onOpenWhatsAppPaste && (
              <div
                data-testid="btn-open-whatsapp-paste"
                onClick={() => {
                  onClose();
                  onOpenWhatsAppPaste();
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#166534',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 8px rgba(22, 101, 52, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📲</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>
                      त्वरित व्हाट्सएप समाचार पेस्ट (WhatsApp Paste)
                    </div>
                    <div style={{ fontSize: '10.5px', opacity: 0.9, marginTop: '2px' }}>
                      कच्चा टेक्स्ट पेस्ट करें — ऑटोमैटिक शीर्षक व खबर अलग करें
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>➔</span>
              </div>
            )}

            {/* Quick Header Templates Picker */}
            {onOpenTemplateGallery && (
              <div
                data-testid="add-block-masthead-template"
                onClick={() => {
                  onClose();
                  onOpenTemplateGallery('mastheads');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 5px rgba(30, 58, 138, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>📰</span>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e40af' }}>
                      मास्टहेड / हेडर टेम्पलेट्स (10+ Header Designs)
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#3b82f6', marginTop: '1px' }}>
                      पारंपरिक, आधुनिक व राष्ट्रीय अखबार शीर्ष सज्जा तुरंत लागू करें
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e40af' }}>➔</span>
              </div>
            )}

            {/* 278 Reference Design Library Access */}
            {onOpenDesignLibrary && (
              <div
                data-testid="mobile-btn-design-library"
                onClick={() => {
                  onClose();
                  onOpenDesignLibrary();
                }}
                style={{
                  padding: '11px 13px',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  color: '#15803d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 5px rgba(21, 128, 61, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>🎨</span>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#15803d' }}>
                      278 संदर्भ डिज़ाइन लाइब्रेरी (Design Library)
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#166534', marginTop: '1px' }}>
                      10 PoC, मास्टहेड, 2-12 कॉलम समाचार, राशिफल व विज्ञापन
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>➔</span>
              </div>
            )}

            {/* Quick Header Strips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                हेडर व सब-हेडर पट्टियाँ (Header & Strips):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div
                  data-testid="add-block-breaking-strip"
                  onClick={() => {
                    onUpdateMasthead({
                      ...doc.masthead,
                      showAnnouncementStrip: true,
                      announcementStripText:
                        doc.masthead.announcementStripText ||
                        '🔴 ब्रेकिंग न्यूज़ : आज की सबसे बड़ी हलचल और विशेष ग्राउंड रिपोर्ट',
                    });
                    onClose();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fff5f5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📢</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b' }}>
                      + ब्रेकिंग पट्टी
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#b91c1c' }}>शीर्ष घोषणा स्ट्रिप</div>
                  </div>
                </div>

                <div
                  data-testid="add-block-second-header"
                  onClick={() => {
                    onUpdateMasthead({
                      ...doc.masthead,
                      showSecondaryHeader: true,
                      secondaryHeaderTitle:
                        doc.masthead.secondaryHeaderTitle ||
                        'प्रादेशिक एवं राष्ट्रीय राजधानी संस्करण',
                      secondaryHeaderSubtitle:
                        doc.masthead.secondaryHeaderSubtitle ||
                        'दिल्ली • लखनऊ • पटना • भोपाल • जयपुर',
                    });
                    onClose();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🏛️</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                      + 2nd हेडर पट्टी
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>शहर व संस्करण सूची</div>
                  </div>
                </div>
              </div>
            </div>

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
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '2px',
                      }}
                    >
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
            {isMastheadSelected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Top Quick Actions Bar for Masthead */}
                <div
                  data-testid="mobile-active-part-banner"
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px' }}>🗞️</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e40af' }}>
                      मास्टहेड (हेडर)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {doc.masthead?.showVolumeIssue !== false ? (
                      <button
                        type="button"
                        data-testid="btn-banner-remove-volume-issue"
                        onClick={() =>
                          onUpdateMasthead({
                            ...doc.masthead,
                            showVolumeIssue: false,
                            issueNumber: '',
                            volumeYear: '',
                            issueCount: '',
                          })
                        }
                        title="वर्ष व अंक तुरंत हटाएँ"
                        style={{
                          fontSize: '11px',
                          color: '#991b1b',
                          backgroundColor: '#fee2e2',
                          border: '1.5px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '4px 9px',
                          cursor: 'pointer',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>✕</span>
                        <span>वर्ष 78 • अंक 142 हटाएँ</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="btn-banner-restore-volume-issue"
                        onClick={() =>
                          onUpdateMasthead({
                            ...doc.masthead,
                            showVolumeIssue: true,
                            volumeYear: 'वर्ष 78',
                            issueCount: 'अंक 142',
                            issueNumber: 'वर्ष 78 • अंक 142',
                          })
                        }
                        title="वर्ष व अंक जोड़ें"
                        style={{
                          fontSize: '11px',
                          color: '#15803d',
                          backgroundColor: '#dcfce7',
                          border: '1.5px solid #86efac',
                          borderRadius: '6px',
                          padding: '4px 9px',
                          cursor: 'pointer',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>✚</span>
                        <span>वर्ष व अंक जोड़ें</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onDeselectArticle}
                      style={{
                        fontSize: '10.5px',
                        color: '#64748b',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '4px 7px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      चयन हटाएँ ✕
                    </button>
                  </div>
                </div>

                {/* ── Quick Masthead Template Picker Button on Mobile ── */}
                {onOpenTemplateGallery && (
                  <button
                    type="button"
                    data-testid="btn-mobile-choose-masthead-template"
                    onClick={() => onOpenTemplateGallery('mastheads')}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: '#1e3a8a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)',
                    }}
                  >
                    <span>📰</span>
                    <span>रेडीमेड हेडर डिज़ाइन बदलें (10+ Templates)</span>
                  </button>
                )}

                {/* Render complete Masthead Inspector Panel */}
                <MastheadInspectorPanel
                  masthead={doc.masthead}
                  onUpdateMasthead={onUpdateMasthead}
                  presetId={doc.layout?.presetId}
                  initialTab={mastheadTab}
                  onClose={onDeselectArticle}
                  compactMode={true}
                  onOpenTemplateGallery={onOpenTemplateGallery}
                  onOpenDesigner={() => onOpenTemplateGallery?.('mastheads')}
                />
              </div>
            ) : selectedArticle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Top Selected Element Banner */}
                <div
                  data-testid="mobile-active-part-banner"
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>
                      {activePart === 'headline'
                        ? '📌'
                        : activePart === 'subheadline'
                          ? '📝'
                          : activePart === 'body'
                            ? '📄'
                            : activePart === 'image'
                              ? '📷'
                              : '🔲'}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e40af' }}>
                      संपादित हो रहा है:{' '}
                      {activePart === 'headline'
                        ? 'मुख्य शीर्षक (Main Headline)'
                        : activePart === 'subheadline'
                          ? 'उप-शीर्षक (Subheadline)'
                          : activePart === 'body'
                            ? selectedParagraphIndex !== null &&
                              selectedParagraphIndex !== undefined
                              ? `पैराग्राफ ${selectedParagraphIndex + 1} (Paragraph ${selectedParagraphIndex + 1})`
                              : 'संपूर्ण मूल पाठ (All Body Text)'
                            : activePart === 'image'
                              ? 'फोटो व कैप्शन (Photo & Caption)'
                              : 'ब्लॉक विन्यास सेटिंग्स (Block Layout)'}
                    </span>
                  </div>
                </div>

                {/* Quick Element Switcher Chips */}
                <div
                  data-testid="mobile-element-switcher"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px',
                    backgroundColor: '#f1f5f9',
                    padding: '3px',
                    borderRadius: '8px',
                  }}
                >
                  {(
                    [
                      { key: 'headline', label: 'शीर्षक', icon: '📌' },
                      { key: 'subheadline', label: 'उप-सुर्खी', icon: '📝' },
                      { key: 'body', label: 'विवरण', icon: '📄' },
                      { key: 'image', label: 'फोटो', icon: '📷' },
                      { key: 'block', label: 'ब्लॉक', icon: '🔲' },
                    ] as const
                  ).map((tab) => {
                    const isActive = activePart === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        data-testid={`mobile-switch-to-${tab.key}`}
                        onClick={() => {
                          setActivePart(tab.key);
                          if (tab.key !== 'body') {
                            onSelectParagraph?.(null);
                          }
                        }}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#1d4ed8' : '#64748b',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '11px',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          minHeight: '36px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                        }}
                      >
                        <span style={{ fontSize: '12px' }}>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ── PART 1: HEADLINE ── */}
                {activePart === 'headline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        मुख्य शीर्षक (Headline) *
                      </label>
                      <input
                        type="text"
                        data-testid="mobile-input-headline"
                        value={selectedArticle.headline}
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, headline: e.target.value })
                        }
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

                    {/* Headline Typography */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <TypographyControls
                        selectedArticle={selectedArticle}
                        article={selectedArticle}
                        initialTargetElement="headline"
                        onUpdateArticle={onUpdateArticle}
                        onApplyToPage={onApplyTypographyToPage}
                        isMobile={true}
                      />
                    </div>

                    {/* Headline Margins & Background */}
                    <div
                      style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                        शीर्षक दूरी व पृष्ठभूमि (Headline Spacing & Background)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10.5px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            ऊपरी अंतर (Top Margin)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="36"
                            step="1"
                            value={selectedArticle.typography?.headlineMarginTopPt ?? 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              onUpdateArticle({
                                ...selectedArticle,
                                typography: {
                                  ...(selectedArticle.typography || {}),
                                  headlineMarginTopPt: val,
                                },
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '11.5px',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10.5px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            निचला अंतर (Bottom Margin)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="36"
                            step="1"
                            value={selectedArticle.typography?.headlineMarginBottomPt ?? 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              onUpdateArticle({
                                ...selectedArticle,
                                typography: {
                                  ...(selectedArticle.typography || {}),
                                  headlineMarginBottomPt: val,
                                },
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '11.5px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Headline Background Chips */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10.5px',
                            color: '#64748b',
                            marginBottom: '4px',
                          }}
                        >
                          पृष्ठभूमि रंग (Background Color)
                        </label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            { label: 'पारदर्शी', color: 'transparent' },
                            { label: 'हल्का पीला', color: '#fef3c7' },
                            { label: 'हल्का लाल', color: '#fee2e2' },
                            { label: 'हल्का ग्रे', color: '#f1f5f9' },
                            { label: 'काला', color: '#111111' },
                          ].map((chip) => {
                            const isMatch =
                              (selectedArticle.typography?.headlineBackgroundColor ||
                                'transparent') === chip.color;
                            return (
                              <button
                                key={chip.color}
                                type="button"
                                onClick={() =>
                                  onUpdateArticle({
                                    ...selectedArticle,
                                    typography: {
                                      ...(selectedArticle.typography || {}),
                                      headlineBackgroundColor:
                                        chip.color === 'transparent' ? undefined : chip.color,
                                      ...(chip.color === '#111111'
                                        ? { headlineColor: '#ffffff' }
                                        : {}),
                                    },
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: isMatch ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                                  backgroundColor:
                                    chip.color === 'transparent' ? '#ffffff' : chip.color,
                                  color: chip.color === '#111111' ? '#ffffff' : '#0f172a',
                                  fontSize: '10.5px',
                                  fontWeight: isMatch ? 700 : 500,
                                  cursor: 'pointer',
                                }}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Headline Borders */}
                    <div
                      data-testid="section-headline-borders"
                      style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}
                    >
                      <BorderControls
                        label="शीर्षक बॉर्डर (Headline Borders)"
                        borders={selectedArticle.typography?.headlineBorders}
                        onChange={(headlineBorders) =>
                          onUpdateArticle({
                            ...selectedArticle,
                            typography: { ...selectedArticle.typography, headlineBorders },
                          })
                        }
                        onReset={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            typography: {
                              ...selectedArticle.typography,
                              headlineBorders: undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ── PART 2: SUBHEADLINE ── */}
                {activePart === 'subheadline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        उप-शीर्षक (Subheadline)
                      </label>
                      <input
                        type="text"
                        data-testid="mobile-input-subheadline"
                        value={selectedArticle.subheadline || ''}
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, subheadline: e.target.value })
                        }
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

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <TypographyControls
                        selectedArticle={selectedArticle}
                        article={selectedArticle}
                        initialTargetElement="subheadline"
                        onUpdateArticle={onUpdateArticle}
                        onApplyToPage={onApplyTypographyToPage}
                        isMobile={true}
                      />
                    </div>

                    {/* Subheadline Borders */}
                    <div
                      data-testid="section-subheadline-borders"
                      style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}
                    >
                      <BorderControls
                        label="उप-शीर्षक बॉर्डर (Subheadline Borders)"
                        borders={selectedArticle.typography?.subheadlineBorders}
                        onChange={(subheadlineBorders) =>
                          onUpdateArticle({
                            ...selectedArticle,
                            typography: { ...selectedArticle.typography, subheadlineBorders },
                          })
                        }
                        onReset={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            typography: {
                              ...selectedArticle.typography,
                              subheadlineBorders: undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ── PART 3: BODY ── */}
                {activePart === 'body' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 12-Zodiac Editor on Mobile if rashifal */}
                    {selectedArticle.elementType === 'rashifal' && (
                      <div
                        data-testid="mobile-rashifal-editor"
                        style={{
                          backgroundColor: '#faf5ff',
                          border: '1px solid #d8b4fe',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#581c87' }}>
                          ✨ 12 राशि भविष्यफल संपादक ({selectedArticle.rashifalItems?.length || 0}{' '}
                          राशियां)
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            maxHeight: '240px',
                            overflowY: 'auto',
                          }}
                        >
                          {(selectedArticle.rashifalItems || []).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: '#ffffff',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid #e9d5ff',
                              }}
                            >
                              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px' }}>{item.sign}</span>
                                <input
                                  type="text"
                                  value={item.rashi}
                                  onChange={(e) => {
                                    const updated = (selectedArticle.rashifalItems || []).map(
                                      (r, i) => (i === idx ? { ...r, rashi: e.target.value } : r)
                                    );
                                    onUpdateArticle({ ...selectedArticle, rashifalItems: updated });
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '2px 4px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '3px',
                                  }}
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={item.prediction}
                                onChange={(e) => {
                                  const updated = (selectedArticle.rashifalItems || []).map(
                                    (r, i) => (i === idx ? { ...r, prediction: e.target.value } : r)
                                  );
                                  onUpdateArticle({ ...selectedArticle, rashifalItems: updated });
                                }}
                                style={{
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  padding: '3px 5px',
                                  fontSize: '10px',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '3px',
                        }}
                      >
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
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, body: e.target.value })
                        }
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

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <TypographyControls
                        selectedArticle={selectedArticle}
                        article={selectedArticle}
                        initialTargetElement="body"
                        selectedParagraphIndex={selectedParagraphIndex}
                        onSelectParagraph={onSelectParagraph}
                        onUpdateArticle={onUpdateArticle}
                        onApplyToPage={onApplyTypographyToPage}
                        isMobile={true}
                      />
                    </div>

                    {/* Body Borders */}
                    <div
                      data-testid="section-body-borders"
                      style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}
                    >
                      <BorderControls
                        label="मूल पाठ बॉर्डर (Body Borders)"
                        borders={selectedArticle.typography?.bodyBorders}
                        onChange={(bodyBorders) =>
                          onUpdateArticle({
                            ...selectedArticle,
                            typography: { ...selectedArticle.typography, bodyBorders },
                          })
                        }
                        onReset={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            typography: {
                              ...selectedArticle.typography,
                              bodyBorders: undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ── PART 4: IMAGE & MEDIA ── */}
                {activePart === 'image' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                      }}
                    >
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
                        <span>📷</span>{' '}
                        {selectedArticle.imageUrl ? 'फोटो बदलें' : 'फोटो अपलोड करें'}
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
                          onClick={() =>
                            onUpdateArticle({ ...selectedArticle, imageUrl: undefined })
                          }
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
                      <>
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '10px',
                                color: '#64748b',
                                marginBottom: '2px',
                              }}
                            >
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
                            <label
                              style={{
                                display: 'block',
                                fontSize: '10px',
                                color: '#64748b',
                                marginBottom: '2px',
                              }}
                            >
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

                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            फोटो कैप्शन (Caption)
                          </label>
                          <input
                            type="text"
                            value={selectedArticle.imageCaption || ''}
                            onChange={(e) =>
                              onUpdateArticle({
                                ...selectedArticle,
                                imageCaption: e.target.value,
                              })
                            }
                            placeholder="फोटो का विवरण लिखें..."
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
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            क्रेडिट (Credit)
                          </label>
                          <input
                            type="text"
                            value={selectedArticle.imageCredit || ''}
                            onChange={(e) =>
                              onUpdateArticle({
                                ...selectedArticle,
                                imageCredit: e.target.value,
                              })
                            }
                            placeholder="फोटोग्राफर / एजेंसी का नाम..."
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
                      </>
                    )}

                    {/* Photo Borders */}
                    <div
                      data-testid="section-image-borders"
                      style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}
                    >
                      <BorderControls
                        label="फोटो बॉर्डर (Photo Borders)"
                        borders={
                          selectedArticle.imageBorders || selectedArticle.typography?.imageBorders
                        }
                        onChange={(imageBorders) =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageBorders,
                            typography: { ...selectedArticle.typography, imageBorders },
                          })
                        }
                        onReset={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            imageBorders: undefined,
                            typography: {
                              ...selectedArticle.typography,
                              imageBorders: undefined,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ── PART 5: BLOCK SETTINGS ── */}
                {activePart === 'block' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Kicker, Dateline, Byline */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        किकर / विषय (Kicker)
                      </label>
                      <input
                        type="text"
                        value={selectedArticle.kickerText || ''}
                        onChange={(e) =>
                          onUpdateArticle({ ...selectedArticle, kickerText: e.target.value })
                        }
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '3px',
                          }}
                        >
                          स्थान / तिथि (Dateline)
                        </label>
                        <input
                          type="text"
                          value={selectedArticle.dateline || ''}
                          onChange={(e) =>
                            onUpdateArticle({ ...selectedArticle, dateline: e.target.value })
                          }
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
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '3px',
                          }}
                        >
                          लेखक (Byline)
                        </label>
                        <input
                          type="text"
                          value={selectedArticle.byline || ''}
                          onChange={(e) =>
                            onUpdateArticle({ ...selectedArticle, byline: e.target.value })
                          }
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

                    {/* Column Span */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px',
                        }}
                      >
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                          कॉलम फैलाव (Column Span)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateArticle({
                                ...selectedArticle,
                                columnSpan: Math.max(1, selectedArticle.columnSpan - 1),
                              })
                            }
                            disabled={selectedArticle.columnSpan <= 1}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              cursor: selectedArticle.columnSpan <= 1 ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: '#b91c1c',
                              minWidth: '46px',
                              textAlign: 'center',
                            }}
                          >
                            {selectedArticle.columnSpan} / 12
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateArticle({
                                ...selectedArticle,
                                columnSpan: Math.min(12, selectedArticle.columnSpan + 1),
                              })
                            }
                            disabled={selectedArticle.columnSpan >= 12}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              cursor: selectedArticle.columnSpan >= 12 ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            +
                          </button>
                        </div>
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

                      {/* Padding & Margin Controls */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginTop: '8px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '2px',
                            }}
                          >
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              पैडिंग (Padding)
                            </span>
                            <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a' }}>
                              {selectedArticle.paddingPx ?? 8}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            step="2"
                            value={selectedArticle.paddingPx ?? 8}
                            onChange={(e) =>
                              onUpdateArticle({
                                ...selectedArticle,
                                paddingPx: parseInt(e.target.value, 10),
                              })
                            }
                            style={{ width: '100%', accentColor: '#3b82f6' }}
                          />
                        </div>

                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '2px',
                            }}
                          >
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              मार्जिन (Margin)
                            </span>
                            <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a' }}>
                              {selectedArticle.marginPx ?? 4}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            step="2"
                            value={selectedArticle.marginPx ?? 4}
                            onChange={(e) =>
                              onUpdateArticle({
                                ...selectedArticle,
                                marginPx: parseInt(e.target.value, 10),
                              })
                            }
                            style={{ width: '100%', accentColor: '#3b82f6' }}
                          />
                        </div>
                      </div>

                      {/* Fill Space Toggle */}
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateArticle({
                              ...selectedArticle,
                              fillSpace: !selectedArticle.fillSpace,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: selectedArticle.fillSpace
                              ? '1.5px solid #16a34a'
                              : '1px solid #cbd5e1',
                            backgroundColor: selectedArticle.fillSpace ? '#f0fdf4' : '#ffffff',
                            color: selectedArticle.fillSpace ? '#15803d' : '#475569',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>↕ खाली स्थान भरें (Fill Space)</span>
                          <span>{selectedArticle.fillSpace ? '✓ सक्रिय' : 'बंद'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Borders */}
                    <div
                      data-testid="section-block-borders"
                      style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}
                    >
                      <BorderControls
                        label="ब्लॉक बॉर्डर (Block Borders)"
                        borders={selectedArticle.borders}
                        onChange={(borders) => onUpdateArticle({ ...selectedArticle, borders })}
                        onReset={() =>
                          onUpdateArticle({
                            ...selectedArticle,
                            borders: undefined,
                          })
                        }
                      />
                    </div>

                    {/* Background Color & Opacity */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          marginBottom: '6px',
                        }}
                      >
                        पृष्ठभूमि व पारदर्शिता (Appearance & Background)
                      </label>

                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          marginBottom: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {[
                          { label: 'पारदर्शी', color: 'transparent' },
                          { label: 'सफेद', color: '#ffffff' },
                          { label: 'हल्का ग्रे', color: '#f8fafc' },
                          { label: 'क्रीम', color: '#fef3c7' },
                          { label: 'हल्का लाल', color: '#fee2e2' },
                          { label: 'हल्का नीला', color: '#e0f2fe' },
                        ].map((chip) => {
                          const isMatch =
                            (selectedArticle.backgroundColor || 'transparent') === chip.color;
                          return (
                            <button
                              key={chip.color}
                              type="button"
                              onClick={() =>
                                onUpdateArticle({
                                  ...selectedArticle,
                                  backgroundColor:
                                    chip.color === 'transparent' ? undefined : chip.color,
                                })
                              }
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: isMatch ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                                backgroundColor:
                                  chip.color === 'transparent' ? '#ffffff' : chip.color,
                                color: '#0f172a',
                                fontSize: '10.5px',
                                fontWeight: isMatch ? 700 : 500,
                                cursor: 'pointer',
                              }}
                            >
                              {chip.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Opacity Slider */}
                      <div style={{ marginTop: '4px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2px',
                          }}
                        >
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                            पारदर्शिता (Opacity)
                          </span>
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a' }}>
                            {Math.round((selectedArticle.opacity ?? 1) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="1"
                          step="0.05"
                          value={selectedArticle.opacity ?? 1}
                          onChange={(e) =>
                            onUpdateArticle({
                              ...selectedArticle,
                              opacity: parseFloat(e.target.value),
                            })
                          }
                          style={{ width: '100%', accentColor: '#0f172a' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Duplicate & Delete Block Buttons */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '10px',
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
                <div
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    color: '#475569',
                  }}
                >
                  ℹ️ किसी ब्लॉक को संपादित करने हेतु उस पर टैप करें, या नीचे पृष्ठ विन्यास सेटिंग्स
                  बदलें:
                </div>

                {/* Masthead Title & Date */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: '3px',
                    }}
                  >
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
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '3px',
                      }}
                    >
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
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '3px',
                      }}
                    >
                      संस्करण (Edition)
                    </label>
                    <input
                      type="text"
                      value={doc.masthead.edition || ''}
                      onChange={(e) =>
                        onUpdateMasthead({ ...doc.masthead, edition: e.target.value })
                      }
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                      पृष्ठ ग्रिड कॉलम (Page Columns)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const activeCols = currentPage.columnCount ?? doc.layout.columnCount;
                          const nextCols = Math.max(1, activeCols - 1);
                          onUpdateLayout({ ...doc.layout, columnCount: nextCols });
                        }}
                        disabled={(currentPage.columnCount ?? doc.layout.columnCount) <= 1}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor:
                            (currentPage.columnCount ?? doc.layout.columnCount) <= 1
                              ? 'not-allowed'
                              : 'pointer',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#b91c1c',
                          minWidth: '50px',
                          textAlign: 'center',
                        }}
                      >
                        {currentPage.columnCount ?? doc.layout.columnCount} Cols
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const activeCols = currentPage.columnCount ?? doc.layout.columnCount;
                          const nextCols = Math.min(12, activeCols + 1);
                          onUpdateLayout({ ...doc.layout, columnCount: nextCols });
                        }}
                        disabled={(currentPage.columnCount ?? doc.layout.columnCount) >= 12}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor:
                            (currentPage.columnCount ?? doc.layout.columnCount) >= 12
                              ? 'not-allowed'
                              : 'pointer',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
                  >
                    {[1, 2, 3, 4, 6, 8, 12].map((cols) => {
                      const activeCols = currentPage.columnCount ?? doc.layout.columnCount;
                      const isActive = activeCols === cols;
                      return (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => onUpdateLayout({ ...doc.layout, columnCount: cols })}
                          style={{
                            padding: '6px 2px',
                            borderRadius: '4px',
                            border: isActive ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                            backgroundColor: isActive ? '#fff5f5' : '#ffffff',
                            color: isActive ? '#b91c1c' : '#0f172a',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          {cols}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Articles on this Page */}
                {currentPage.articles.length > 0 && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                        marginBottom: '6px',
                      }}
                    >
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
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '80%',
                            }}
                          >
                            {art.headline || 'समाचार ब्लॉक'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700 }}>
                            संपादित करें ✎
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🗑️ Clear Current Page Canvas */}
                {onClearPage && (
                  <button
                    type="button"
                    data-testid="inspector-clear-page-btn"
                    onClick={onClearPage}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '44px',
                      marginTop: '8px',
                    }}
                  >
                    <span>🗑️</span>
                    <span>इस पृष्ठ को पूर्णतः खाली करें (Clear Page)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
         * 4. PRESETS & LAYOUT DRAWER (प्रारूप व विन्यास)
         * ========================================================== */}
        {/* ==========================================================
         * 4. PRESETS, GRID & PAGE SETUP DRAWER
         * ========================================================== */}
        {(mode === 'presets' || mode === 'page-setup') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Sub-tab Switcher: Presets vs Page Setup vs Themes */}
            <div
              style={{
                display: 'flex',
                borderRadius: '8px',
                backgroundColor: '#EDE8E1',
                padding: '3px',
                gap: '3px',
              }}
            >
              <button
                type="button"
                data-testid="mobile-tab-presets"
                onClick={() => setPresetTab('presets')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: presetTab === 'presets' ? '#FFFFFF' : 'transparent',
                  color: presetTab === 'presets' ? '#1C1917' : '#78716C',
                  fontWeight: presetTab === 'presets' ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: presetTab === 'presets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                ❖ अख़बार प्रारूप (Presets)
              </button>
              <button
                type="button"
                data-testid="mobile-tab-pagesetup"
                onClick={() => setPresetTab('pagesetup')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: presetTab === 'pagesetup' ? '#FFFFFF' : 'transparent',
                  color: presetTab === 'pagesetup' ? '#1C1917' : '#78716C',
                  fontWeight: presetTab === 'pagesetup' ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: presetTab === 'pagesetup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                📐 कागज़ आकार (Setup)
              </button>
              {onOpenTheme && (
                <button
                  type="button"
                  data-testid="mobile-tab-theme"
                  onClick={() => setPresetTab('theme')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: presetTab === 'theme' ? '#FFFFFF' : 'transparent',
                    color: presetTab === 'theme' ? '#1C1917' : '#78716C',
                    fontWeight: presetTab === 'theme' ? 700 : 500,
                    fontSize: '11px',
                    cursor: 'pointer',
                    boxShadow: presetTab === 'theme' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🎨 रंग थीम
                </button>
              )}
            </div>

            {/* TAB 1: PRESETS & GRID */}
            {presetTab === 'presets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {onOpenPublishing && (
                  <div
                    data-testid="mobile-btn-publishing"
                    onClick={onOpenPublishing}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#1C1917',
                      color: '#FAF8F5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#38BDF8' }}>
                        📰 मास्टर टेम्पलेट एवं दैनिक अंक
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#A8A29E', marginTop: '2px' }}>
                        दैनिक संस्करण बनाएं, पुराने अंक देखें व टेम्पलेट प्रबंधित करें
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', color: '#38BDF8' }}>➔</span>
                  </div>
                )}

                {/* Direct Header Gallery Access */}
                {onOpenTemplateGallery && (
                  <div
                    data-testid="mobile-btn-template-gallery"
                    onClick={() => {
                      onClose();
                      onOpenTemplateGallery('all');
                    }}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      border: '1.5px solid #bfdbfe',
                      color: '#1e40af',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(30, 58, 138, 0.08)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800 }}>
                        📰 सम्पूर्ण टेम्पलेट गैलरी (50+ Templates)
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#3b82f6', marginTop: '1px' }}>
                        हेडर, पूरे पृष्ठ, आर्टिकल लेआउट व सब-हेडर शैलियाँ
                      </div>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>➔</span>
                  </div>
                )}

                {/* Direct 278 Reference Design Library Access */}
                {onOpenDesignLibrary && (
                  <div
                    data-testid="mobile-btn-design-library"
                    onClick={() => {
                      onClose();
                      onOpenDesignLibrary();
                    }}
                    style={{
                      padding: '11px 13px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      color: '#15803d',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(21, 128, 61, 0.08)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800 }}>
                        🎨 278 संदर्भ डिज़ाइन लाइब्रेरी (Design Library)
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#166534', marginTop: '1px' }}>
                        278 संदर्भ छवियाँ, मास्टहेड, 2-12 कॉलम समाचार व विज्ञापन
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', color: '#22c55e' }}>➔</span>
                  </div>
                )}

                <LayoutPresetsContent
                  currentPresetId={doc.layout.presetId}
                  layout={doc.layout}
                  onSelectPreset={(pId) => {
                    onApplyPreset?.(pId);
                  }}
                  onUpdateLayout={onUpdateLayout}
                  onApplyLayoutRow={onApplyLayoutRow}
                  onAutoFit={onAutoFit}
                  onClose={onClose}
                  isMobile={true}
                />
              </div>
            )}

            {/* TAB 2: PAGE SETUP */}
            {presetTab === 'pagesetup' && (
              <PageSetupContent
                initialPageSize={doc.metadata.pageSize}
                initialOrientation={doc.metadata.orientation}
                initialDimensions={doc.metadata.dimensions}
                initialMargins={doc.layout.margins}
                onApply={(config) => {
                  if (onPageSetupApply) {
                    onPageSetupApply(config);
                  } else {
                    onPageSizeChange(config.pageSize);
                    onOrientationChange(config.orientation);
                  }
                  onClose();
                }}
                onClose={onClose}
                isMobile={true}
              />
            )}

            {/* TAB 3: THEMES */}
            {presetTab === 'theme' && onOpenTheme && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onOpenTheme}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E7E2DA',
                    backgroundColor: '#FAF8F5',
                    color: '#1C1917',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🎨</span>
                  <span>अख़बार रंग व कागज़ थीम (Color Themes)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
