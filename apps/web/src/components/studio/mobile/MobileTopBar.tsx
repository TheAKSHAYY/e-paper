import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../../i18n';
import {
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  DownloadIcon,
  LayoutGridIcon,
  MaximizeIcon,
  NewspaperIcon,
  PaletteIcon,
  PenIcon,
  PrinterIcon,
  RedoIcon,
  RulerIcon,
  SlidersIcon,
  SparkleIcon,
  TrashIcon,
  UndoIcon,
  ZapIcon,
} from '../StudioIcons';

export interface MobileTopBarProps {
  documentTitle: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave?: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onPrintPdf?: () => void;
  isPrintingPdf?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onBack: () => void;
  onOpenDashboard?: () => void;
  onOpenLanding?: () => void;
  onRenameTitle?: (newTitle: string) => void;
  currentPageNumber: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFitWidth?: () => void;
  onAutoFit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenTheme?: () => void;
  onOpenPageSetup?: () => void;
  onOpenPresets?: () => void;
  onOpenTemplateGallery?: (
    category?: 'all' | 'pages' | 'mastheads' | 'articles' | 'breaking' | 'dividers' | 'favorites'
  ) => void;
  editorMode?: 'simple' | 'pro';
  onToggleEditorMode?: () => void;
  onClearPage?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  documentTitle,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onExportPdf,
  isExportingPdf,
  onPrintPdf,
  isPrintingPdf = false,
  isFullscreen,
  onToggleFullscreen,
  onBack,
  onOpenDashboard,
  onOpenLanding,
  onRenameTitle,
  currentPageNumber,
  totalPages,
  onPrevPage,
  onNextPage,
  onFitWidth,
  onAutoFit,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenTheme,
  onOpenPageSetup,
  onOpenPresets,
  onOpenTemplateGallery,
  editorMode = 'simple',
  onToggleEditorMode,
  onClearPage,
}) => {
  const { locale } = useI18n();
  const isHi = locale === 'hi';
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameInput, setRenameInput] = useState(documentTitle);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMoreMenuOpen]);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameInput.trim() && onRenameTitle) {
      onRenameTitle(renameInput.trim());
    }
    setIsRenameOpen(false);
  };

  const overflowBtnStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '40px',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '7px',
    color: '#FAF8F5',
    textAlign: 'left',
    fontSize: '12.5px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  return (
    <>
      <header
        data-testid="mobile-top-bar"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          backgroundColor: '#141210',
          color: '#FAF8F5',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          zIndex: 60,
          position: 'sticky',
          top: 0,
          width: '100%',
          borderBottom: '1px solid #2B2723',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.28)',
          fontFamily: "'Poppins', 'Hind', sans-serif",
        }}
      >
        {/* Row 1: Back | Editable Title + Save Status | More Menu */}
        <div
          style={{
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            gap: '6px',
            borderBottom: '1px solid #24201C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
            <button
              type="button"
              onClick={onBack}
              aria-label={isHi ? 'डैशबोर्ड पर वापस जाएँ' : 'Back to Dashboard'}
              data-testid="mobile-back-btn"
              style={{
                width: '38px',
                height: '38px',
                minWidth: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#211E1B',
                border: '1px solid #35302B',
                borderRadius: '8px',
                color: '#FAF8F5',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <ChevronLeftIcon size={16} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 0,
                flex: 1,
                cursor: onRenameTitle ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (onRenameTitle) {
                  setRenameInput(documentTitle);
                  setIsRenameOpen(true);
                }
              }}
              title={isHi ? 'अख़बार का नाम बदलने के लिए टैप करें' : 'Tap to rename title'}
            >
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#FAF8F5',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}
              >
                {documentTitle || (isHi ? 'मेरा अख़बार' : 'Untitled Newspaper')}
              </span>
              {onRenameTitle && (
                <span style={{ color: '#A8A29E', flexShrink: 0, display: 'inline-flex' }}>
                  <PenIcon size={11} />
                </span>
              )}
            </div>
          </div>

          {/* Save Pill + Overflow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={(e) => {
                if (hasUnsavedChanges && onSave) {
                  e.stopPropagation();
                  onSave();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '999px',
                backgroundColor: hasUnsavedChanges
                  ? 'rgba(245, 158, 11, 0.14)'
                  : 'rgba(34, 197, 94, 0.12)',
                border: hasUnsavedChanges
                  ? '1px solid rgba(245, 158, 11, 0.35)'
                  : '1px solid rgba(34, 197, 94, 0.25)',
                color: hasUnsavedChanges ? '#FCD34D' : '#86EFAC',
                fontSize: '10.5px',
                fontWeight: 500,
                cursor: hasUnsavedChanges && onSave ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isSaving ? '#38BDF8' : hasUnsavedChanges ? '#F59E0B' : '#22C55E',
                }}
              />
              <span>
                {isSaving
                  ? isHi
                    ? 'सेव हो रहा...'
                    : 'Saving...'
                  : hasUnsavedChanges
                    ? isHi
                      ? 'सेव करें'
                      : 'Save'
                    : isHi
                      ? 'सेव है'
                      : 'Saved'}
              </span>
            </button>

            <div style={{ position: 'relative' }} ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                aria-label={isHi ? 'अधिक विकल्प' : 'More options'}
                aria-expanded={isMoreMenuOpen}
                data-testid="mobile-more-btn"
                style={{
                  width: '38px',
                  height: '38px',
                  minWidth: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isMoreMenuOpen ? '#2B2723' : '#211E1B',
                  border: '1px solid #35302B',
                  borderRadius: '8px',
                  color: '#FAF8F5',
                  cursor: 'pointer',
                  fontSize: '17px',
                  padding: 0,
                }}
              >
                ⋮
              </button>

              {isMoreMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: '0',
                    width: '240px',
                    maxHeight: '72vh',
                    overflowY: 'auto',
                    backgroundColor: '#181513',
                    borderRadius: '12px',
                    border: '1px solid #35302B',
                    boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
                    padding: '6px',
                    zIndex: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {onToggleEditorMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onToggleEditorMode();
                      }}
                      style={{
                        ...overflowBtnStyle,
                        color: editorMode === 'simple' ? '#86EFAC' : '#FDE68A',
                        fontWeight: 600,
                      }}
                    >
                      {editorMode === 'simple' ? (
                        <SlidersIcon size={14} color="#86EFAC" />
                      ) : (
                        <SparkleIcon size={14} color="#FDE68A" />
                      )}
                      <span>
                        {editorMode === 'simple'
                          ? isHi
                            ? 'प्रो मोड चालू करें'
                            : 'Switch to Pro Mode'
                          : isHi
                            ? 'सरल मोड पर जाएँ'
                            : 'Switch to Simple Mode'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      if (onOpenDashboard) onOpenDashboard();
                      else onBack();
                    }}
                    style={overflowBtnStyle}
                  >
                    <DashboardIcon size={14} color="#C7BFAF" />
                    <span>{isHi ? 'डैशबोर्ड पर जाएँ' : 'Dashboard'}</span>
                  </button>

                  {onOpenLanding && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenLanding();
                      }}
                      style={overflowBtnStyle}
                    >
                      <NewspaperIcon size={14} color="#C7BFAF" />
                      <span>{isHi ? 'होम पेज' : 'Home Landing'}</span>
                    </button>
                  )}

                  <div style={{ height: '1px', backgroundColor: '#2B2723', margin: '4px 0' }} />

                  {onOpenTemplateGallery && (
                    <>
                      <button
                        type="button"
                        data-testid="mobile-menu-template-gallery"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenTemplateGallery('all');
                        }}
                        style={{ ...overflowBtnStyle, color: '#FCA5A5', fontWeight: 600 }}
                      >
                        <LayoutGridIcon size={14} color="#FCA5A5" />
                        <span>{isHi ? 'टेम्पलेट गैलरी' : 'Template Gallery'}</span>
                      </button>

                      <button
                        type="button"
                        data-testid="mobile-menu-masthead-presets"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenTemplateGallery('mastheads');
                        }}
                        style={{ ...overflowBtnStyle, color: '#93C5FD', fontWeight: 600 }}
                      >
                        <NewspaperIcon size={14} color="#93C5FD" />
                        <span>{isHi ? 'हेडर टेम्पलेट्स' : 'Header Presets'}</span>
                      </button>
                      <div style={{ height: '1px', backgroundColor: '#2B2723', margin: '4px 0' }} />
                    </>
                  )}

                  {onAutoFit && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onAutoFit();
                      }}
                      style={{ ...overflowBtnStyle, color: '#93C5FD' }}
                    >
                      <ZapIcon size={14} color="#93C5FD" />
                      <span>{isHi ? 'कॉलम संतुलित करें' : 'Balance Columns'}</span>
                    </button>
                  )}

                  {onFitWidth && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onFitWidth();
                      }}
                      style={overflowBtnStyle}
                    >
                      <ArrowLeftRightIcon size={14} color="#C7BFAF" />
                      <span>{isHi ? 'स्क्रीन पर फ़िट करें' : 'Fit to Width'}</span>
                    </button>
                  )}

                  {onOpenPageSetup && (
                    <button
                      type="button"
                      data-testid="mobile-menu-page-setup"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenPageSetup();
                      }}
                      style={overflowBtnStyle}
                    >
                      <RulerIcon size={14} color="#C7BFAF" />
                      <span>{isHi ? 'पेज सेटअप' : 'Page Setup'}</span>
                    </button>
                  )}

                  {onOpenPresets && (
                    <button
                      type="button"
                      data-testid="mobile-menu-presets"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenPresets();
                      }}
                      style={overflowBtnStyle}
                    >
                      <LayoutGridIcon size={14} color="#C7BFAF" />
                      <span>{isHi ? 'अख़बार प्रारूप' : 'Layout Presets'}</span>
                    </button>
                  )}

                  {onOpenTheme && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenTheme();
                      }}
                      style={{ ...overflowBtnStyle, color: '#DDD6FE' }}
                    >
                      <PaletteIcon size={14} color="#DDD6FE" />
                      <span>{isHi ? 'रंग व थीम' : 'Theme Settings'}</span>
                    </button>
                  )}

                  {onPrintPdf && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onPrintPdf();
                      }}
                      disabled={isPrintingPdf}
                      style={{ ...overflowBtnStyle, cursor: isPrintingPdf ? 'wait' : 'pointer' }}
                    >
                      <PrinterIcon size={14} color="#C7BFAF" />
                      <span>{isHi ? 'ब्राउज़र प्रिंट' : 'Print Preview'}</span>
                    </button>
                  )}

                  {onClearPage && (
                    <button
                      type="button"
                      data-testid="mobile-btn-clear-page"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onClearPage();
                      }}
                      style={{ ...overflowBtnStyle, color: '#FCA5A5', fontWeight: 600 }}
                    >
                      <TrashIcon size={14} color="#F87171" />
                      <span>{isHi ? 'पूरा पेज खाली करें' : 'Clear Current Page'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onToggleFullscreen();
                    }}
                    style={overflowBtnStyle}
                  >
                    <MaximizeIcon size={14} color="#C7BFAF" />
                    <span>
                      {isFullscreen
                        ? isHi
                          ? 'फुलस्क्रीन बंद करें'
                          : 'Exit Fullscreen'
                        : isHi
                          ? 'फुलस्क्रीन'
                          : 'Fullscreen'}
                    </span>
                  </button>

                  {onSave && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onSave();
                      }}
                      disabled={isSaving}
                      style={{ ...overflowBtnStyle, color: '#86EFAC', fontWeight: 600 }}
                    >
                      <DownloadIcon size={14} color="#86EFAC" />
                      <span>{isHi ? 'अभी सेव करें' : 'Save Draft'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Compact Page Stepper | Undo/Redo | Simple/Pro | Print | PDF */}
        <div
          style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            gap: '6px',
            backgroundColor: '#191614',
          }}
        >
          {/* Left: Page Stepper & Undo/Redo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#211E1B',
                border: '1px solid #35302B',
                borderRadius: '999px',
                padding: '0 2px',
                height: '30px',
              }}
            >
              <button
                type="button"
                onClick={onPrevPage}
                disabled={currentPageNumber <= 1}
                aria-label={isHi ? 'पिछला पेज' : 'Previous page'}
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'none',
                  border: 'none',
                  color: currentPageNumber <= 1 ? '#57524C' : '#FAF8F5',
                  cursor: currentPageNumber <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <ChevronLeftIcon size={13} />
              </button>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FAF8F5',
                  padding: '0 4px',
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {currentPageNumber}/{totalPages}
              </span>
              <button
                type="button"
                onClick={onNextPage}
                disabled={currentPageNumber >= totalPages}
                aria-label={isHi ? 'अगला पेज' : 'Next page'}
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'none',
                  border: 'none',
                  color: currentPageNumber >= totalPages ? '#57524C' : '#FAF8F5',
                  cursor: currentPageNumber >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <ChevronRightIcon size={13} />
              </button>
            </div>

            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label={isHi ? 'पूर्ववत करें (Undo)' : 'Undo'}
                title="Undo"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: canUndo ? '#FAF8F5' : '#57524C',
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                  padding: 0,
                }}
              >
                <UndoIcon size={14} />
              </button>
            )}

            {onRedo && (
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label={isHi ? 'फिर से करें (Redo)' : 'Redo'}
                title="Redo"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: canRedo ? '#FAF8F5' : '#57524C',
                  cursor: canRedo ? 'pointer' : 'not-allowed',
                  padding: 0,
                }}
              >
                <RedoIcon size={14} />
              </button>
            )}
          </div>

          {/* Right: Mode | Print | PDF */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            {onToggleEditorMode && (
              <button
                type="button"
                data-testid="mobile-mode-switch-btn"
                onClick={onToggleEditorMode}
                style={{
                  height: '30px',
                  padding: '0 9px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: editorMode === 'simple' ? '#1F2421' : '#26211E',
                  border: editorMode === 'simple' ? '1px solid #2F4A38' : '1px solid #4D3D2B',
                  borderRadius: '999px',
                  color: editorMode === 'simple' ? '#BBF7D0' : '#FDE68A',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {editorMode === 'simple' ? (
                  <SparkleIcon size={11} color="#86EFAC" />
                ) : (
                  <SlidersIcon size={11} color="#FDE68A" />
                )}
                <span>
                  {editorMode === 'simple' ? (isHi ? 'सरल' : 'Simple') : isHi ? 'प्रो' : 'Pro'}
                </span>
              </button>
            )}

            {onPrintPdf && (
              <button
                type="button"
                onClick={onPrintPdf}
                disabled={isPrintingPdf}
                aria-label={isHi ? 'ब्राउज़र प्रिंट या PDF सहेजें' : 'Browser Print'}
                data-testid="btn-print-pdf"
                style={{
                  height: '30px',
                  padding: '0 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  backgroundColor: '#211E1B',
                  border: '1px solid #35302B',
                  borderRadius: '6px',
                  color: '#FAF8F5',
                  cursor: isPrintingPdf ? 'wait' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                <PrinterIcon size={12} color="#D6CFC4" />
                <span>{isHi ? 'प्रिंट' : 'Print'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExportingPdf}
              aria-label={isHi ? 'PDF डाउनलोड करें' : 'Export PDF'}
              data-testid="mobile-export-pdf-btn"
              style={{
                height: '30px',
                padding: '0 10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: '#B91C1C',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                cursor: isExportingPdf ? 'wait' : 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 1px 4px rgba(185, 28, 28, 0.35)',
              }}
            >
              <DownloadIcon size={12} />
              <span>{isExportingPdf ? '...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Title Rename Modal for Mobile */}
      {isRenameOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 18, 16, 0.72)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsRenameOpen(false)}
        >
          <form
            onSubmit={handleTitleSubmit}
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: '#FAF8F5',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #E3DCD0',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              fontFamily: "'Poppins', 'Hind', sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>
              {isHi ? 'अख़बार का नाम बदलें' : 'Rename Edition Title'}
            </h4>
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #D6CFC4',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
                color: '#1C1917',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsRenameOpen(false)}
                style={{
                  minHeight: '40px',
                  padding: '8px 14px',
                  borderRadius: '7px',
                  border: '1px solid #D6CFC4',
                  backgroundColor: '#FFFFFF',
                  color: '#57524C',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                style={{
                  minHeight: '40px',
                  padding: '8px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: '#141210',
                  color: '#FAF8F5',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isHi ? 'सेव करें' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
