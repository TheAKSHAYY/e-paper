import React from 'react';

export interface MobileTopBarProps {
  documentTitle: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave?: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onBack: () => void;
  currentPageNumber: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  documentTitle,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onExportPdf,
  isExportingPdf,
  isFullscreen,
  onToggleFullscreen,
  onBack,
  currentPageNumber,
  totalPages,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <header
      data-testid="mobile-top-bar"
      style={{
        height: '52px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        boxSizing: 'border-box',
        zIndex: 50,
        position: 'sticky',
        top: 0,
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* 1. Left: Back Button & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="वापस जाएँ (Back)"
          data-testid="mobile-back-btn"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
          }}
        >
          ←
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#f8fafc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '140px',
            }}
            title={documentTitle}
          >
            {documentTitle || 'अनाम समाचार पत्र'}
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            {isSaving ? 'सहेज रहा है...' : hasUnsavedChanges ? 'असुरक्षित परिवर्तन' : 'सहेजा गया ✓'}
          </span>
        </div>
      </div>

      {/* 2. Center: Page Navigator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          padding: '2px 4px',
          margin: '0 4px',
        }}
      >
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPageNumber <= 1}
          aria-label="पिछला पृष्ठ"
          style={{
            minWidth: '36px',
            minHeight: '36px',
            background: 'none',
            border: 'none',
            color: currentPageNumber <= 1 ? '#475569' : '#e2e8f0',
            cursor: currentPageNumber <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#f1f5f9',
            padding: '0 4px',
            whiteSpace: 'nowrap',
          }}
        >
          {currentPageNumber}/{totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPageNumber >= totalPages}
          aria-label="अगला पृष्ठ"
          style={{
            minWidth: '36px',
            minHeight: '36px',
            background: 'none',
            border: 'none',
            color: currentPageNumber >= totalPages ? '#475569' : '#e2e8f0',
            cursor: currentPageNumber >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ›
        </button>
      </div>

      {/* 3. Right: Action Buttons (Save, Fullscreen, PDF) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            aria-label="सहेजें (Save)"
            data-testid="mobile-save-btn"
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: isSaving ? 'wait' : 'pointer',
              fontSize: '16px',
              padding: 0,
            }}
          >
            💾
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'पूर्ण स्क्रीन से बाहर निकलें' : 'पूर्ण स्क्रीन'}
          data-testid="mobile-fullscreen-btn"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '15px',
            padding: 0,
          }}
        >
          {isFullscreen ? '⤢' : '⛶'}
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          aria-label="PDF डाउनलोड करें"
          data-testid="mobile-export-pdf-btn"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            backgroundColor: '#b91c1c',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            cursor: isExportingPdf ? 'wait' : 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            padding: '0 8px',
          }}
        >
          <span>PDF</span>
          <span>{isExportingPdf ? '...' : '↓'}</span>
        </button>
      </div>
    </header>
  );
};
