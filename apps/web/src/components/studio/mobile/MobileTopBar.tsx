import React, { useState, useRef, useEffect } from 'react';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../../i18n';

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
}) => {
  const { locale } = useI18n();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameInput, setRenameInput] = useState(documentTitle);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on click outside
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

  return (
    <>
      <header
        data-testid="mobile-top-bar"
        style={{
          minHeight: '52px',
          height: 'calc(52px + env(safe-area-inset-top, 0px))',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          backgroundColor: '#1C1917',
          color: '#FAF8F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '6px',
          paddingRight: '6px',
          boxSizing: 'border-box',
          zIndex: 60,
          position: 'sticky',
          top: 0,
          width: '100%',
          borderBottom: '1px solid #2B2825',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          fontFamily: locale === 'hi' ? PUBLISHER_DESIGN_SYSTEM.fonts.hindiUi : PUBLISHER_DESIGN_SYSTEM.fonts.interface,
        }}
      >
        {/* ====================================================================
         * 1. LEFT: [← Back] and Document Info
         * ==================================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
          {/* Back Button with 44x44 Touch Target */}
          <button
            type="button"
            onClick={onBack}
            aria-label={locale === 'hi' ? 'डैशबोर्ड पर वापस जाएँ' : 'Back to Dashboard'}
            data-testid="mobile-back-btn"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#FAF8F5',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 700,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ←
          </button>

          {/* Document Title & Save Status */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              cursor: onRenameTitle ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (onRenameTitle) {
                setRenameInput(documentTitle);
                setIsRenameOpen(true);
              }
            }}
            title={locale === 'hi' ? 'शीर्षक बदलने के लिए क्लिक करें' : 'Tap to rename title'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FAF8F5',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px',
                  lineHeight: 1.2,
                }}
              >
                {documentTitle || (locale === 'hi' ? 'अनाम समाचार पत्र' : 'Untitled Newspaper')}
              </span>
              {onRenameTitle && (
                <span style={{ fontSize: '10px', color: '#78716C', lineHeight: 1 }}>✎</span>
              )}
            </div>

            {/* Save Status Touch Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '1px',
              }}
              onClick={(e) => {
                if (hasUnsavedChanges && onSave) {
                  e.stopPropagation();
                  onSave();
                }
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isSaving
                    ? '#38BDF8'
                    : hasUnsavedChanges
                    ? '#F59E0B'
                    : '#10B981',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: hasUnsavedChanges ? '#FDE68A' : '#A8A29E',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {isSaving
                  ? (locale === 'hi' ? 'सहेज रहा है...' : 'Saving...')
                  : hasUnsavedChanges
                  ? (locale === 'hi' ? 'असुरक्षित (टैप करें)' : 'Unsaved (Tap)')
                  : (locale === 'hi' ? 'सहेजा गया ✓' : 'Saved ✓')}
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================
         * 2. CENTER: Compact Page Navigation
         * ==================================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#262422',
            border: '1px solid #3D3835',
            borderRadius: '16px',
            padding: '0 2px',
            margin: '0 4px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPageNumber <= 1}
            aria-label={locale === 'hi' ? 'पिछला पृष्ठ' : 'Previous page'}
            style={{
              width: '36px',
              height: '40px',
              background: 'none',
              border: 'none',
              color: currentPageNumber <= 1 ? '#57534E' : '#FAF8F5',
              cursor: currentPageNumber <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            ‹
          </button>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#FAF8F5',
              padding: '0 4px',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}
          >
            {currentPageNumber}/{totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPageNumber >= totalPages}
            aria-label={locale === 'hi' ? 'अगला पृष्ठ' : 'Next page'}
            style={{
              width: '36px',
              height: '40px',
              background: 'none',
              border: 'none',
              color: currentPageNumber >= totalPages ? '#57534E' : '#FAF8F5',
              cursor: currentPageNumber >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            ›
          </button>
        </div>

        {/* ====================================================================
         * 3. RIGHT: Undo, Redo, Quick PDF & [⋮ More] Overflow
         * ==================================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          {/* Undo */}
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label={locale === 'hi' ? 'पूर्ववत करें (Undo)' : 'Undo'}
              title="Undo"
              style={{
                width: '38px',
                height: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: canUndo ? '#FAF8F5' : '#57534E',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 700,
                padding: 0,
              }}
            >
              ↶
            </button>
          )}

          {/* Redo */}
          {onRedo && (
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label={locale === 'hi' ? 'फिर से करें (Redo)' : 'Redo'}
              title="Redo"
              style={{
                width: '38px',
                height: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: canRedo ? '#FAF8F5' : '#57534E',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 700,
                padding: 0,
              }}
            >
              ↷
            </button>
          )}

          {/* Quick PDF Export */}
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            aria-label={locale === 'hi' ? 'PDF डाउनलोड करें' : 'Export PDF'}
            data-testid="mobile-export-pdf-btn"
            style={{
              height: '34px',
              minHeight: '34px',
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: colors.pressRed,
              border: 'none',
              borderRadius: '6px',
              color: '#FFFFFF',
              cursor: isExportingPdf ? 'wait' : 'pointer',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <span>PDF</span>
            <span>{isExportingPdf ? '...' : '↓'}</span>
          </button>

          {/* [⋮ More] Overflow Button */}
          <div style={{ position: 'relative' }} ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              aria-label={locale === 'hi' ? 'अधिक विकल्प' : 'More options'}
              aria-expanded={isMoreMenuOpen}
              data-testid="mobile-more-btn"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isMoreMenuOpen ? '#2B2825' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#FAF8F5',
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0,
              }}
            >
              ⋮
            </button>

            {/* Overflow Dropdown Sheet */}
            {isMoreMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '230px',
                  backgroundColor: '#1C1917',
                  borderRadius: '12px',
                  border: '1px solid #3D3835',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  padding: '6px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {/* 1. Dashboard */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    if (onOpenDashboard) onOpenDashboard();
                    else onBack();
                  }}
                  style={{
                    width: '100%',
                    minHeight: '42px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FAF8F5',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  className="hover:bg-stone-800"
                >
                  <span>🏠</span>
                  <span>{locale === 'hi' ? 'डैशबोर्ड पर जाएँ' : 'Dashboard'}</span>
                </button>

                {/* 2. Home / Landing */}
                {onOpenLanding && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenLanding();
                    }}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FAF8F5',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>🌐</span>
                    <span>{locale === 'hi' ? 'मुख्य पृष्ठ (Home)' : 'Home Landing'}</span>
                  </button>
                )}

                <div style={{ height: '1px', backgroundColor: '#2B2825', margin: '4px 0' }} />

                {/* 3. Auto-Fit Column Balancer */}
                {onAutoFit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onAutoFit();
                    }}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#38BDF8',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>⚡</span>
                    <span>{locale === 'hi' ? 'कॉलम बैलेंस करें' : 'Balance Columns'}</span>
                  </button>
                )}

                {/* 4. Fit to Width */}
                {onFitWidth && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onFitWidth();
                    }}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FAF8F5',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>↔️</span>
                    <span>{locale === 'hi' ? 'स्क्रीन पर फ़िट करें' : 'Fit to Width'}</span>
                  </button>
                )}

                {/* Page Setup */}
                {onOpenPageSetup && (
                  <button
                    type="button"
                    data-testid="mobile-menu-page-setup"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenPageSetup();
                    }}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FAF8F5',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>📐</span>
                    <span>{locale === 'hi' ? 'कागज़ आकार (Page Setup)' : 'Page Setup'}</span>
                  </button>
                )}

                {/* Presets */}
                {onOpenPresets && (
                  <button
                    type="button"
                    data-testid="mobile-menu-presets"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenPresets();
                    }}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FAF8F5',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>❖</span>
                    <span>{locale === 'hi' ? 'अख़बार शैलियाँ (Presets)' : 'Layout Presets'}</span>
                  </button>
                )}

                {/* 5. Color Themes */}
                {onOpenTheme && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenTheme();
                    }}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#C084FC',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>🎨</span>
                    <span>{locale === 'hi' ? 'थीम व रंग' : 'Theme Settings'}</span>
                  </button>
                )}

                {/* 6. Direct Print */}
                {onPrintPdf && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onPrintPdf();
                    }}
                    disabled={isPrintingPdf}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FAF8F5',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: isPrintingPdf ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>🖨️</span>
                    <span>{locale === 'hi' ? 'प्रिंट पूर्वावलोकन' : 'Print Preview'}</span>
                  </button>
                )}

                {/* 7. Fullscreen */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onToggleFullscreen();
                  }}
                  style={{
                    width: '100%',
                    minHeight: '42px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FAF8F5',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  className="hover:bg-stone-800"
                >
                  <span>{isFullscreen ? '⤢' : '⛶'}</span>
                  <span>
                    {isFullscreen
                      ? (locale === 'hi' ? 'फुलस्क्रीन बंद करें' : 'Exit Fullscreen')
                      : (locale === 'hi' ? 'फुलस्क्रीन मोड' : 'Fullscreen')}
                  </span>
                </button>

                {/* 8. Manual Save Draft */}
                {onSave && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onSave();
                    }}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#34D399',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isSaving ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="hover:bg-stone-800"
                  >
                    <span>💾</span>
                    <span>{locale === 'hi' ? 'ड्राफ्ट सहेजें' : 'Save Draft'}</span>
                  </button>
                )}
              </div>
            )}
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
            backgroundColor: 'rgba(28,25,23,0.7)',
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
              border: '1px solid #E7E2DA',
              boxShadow: '0 20px 48px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>
              {locale === 'hi' ? 'संस्करण का शीर्षक बदलें' : 'Rename Edition Title'}
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
                border: '1px solid #D6D0C5',
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
                  borderRadius: '6px',
                  border: '1px solid #D6D0C5',
                  backgroundColor: '#FAF8F5',
                  color: '#57534E',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {locale === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                style={{
                  minHeight: '40px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#1C1917',
                  color: '#FAF8F5',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {locale === 'hi' ? 'सहेजें' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
