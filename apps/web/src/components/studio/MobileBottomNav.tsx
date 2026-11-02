import React from 'react';

export type MobileDrawerMode = 'pages' | 'blocks' | 'inspector' | 'presets' | 'none';

export interface MobileBottomNavProps {
  activeDrawer: MobileDrawerMode;
  onSelectDrawer: (mode: MobileDrawerMode) => void;
  currentPageNumber: number;
  totalPages: number;
  hasSelectedArticle: boolean;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeDrawer,
  onSelectDrawer,
  currentPageNumber,
  totalPages,
  hasSelectedArticle,
  onExportPdf,
  isExportingPdf,
}) => {
  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label="मोबाइल नेविगेशन टूलबार"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '4px',
        paddingRight: '4px',
        boxSizing: 'border-box',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {/* 1. Pages Button (पेज) */}
      <button
        type="button"
        data-testid="mobile-nav-pages"
        onClick={() => onSelectDrawer(activeDrawer === 'pages' ? 'none' : 'pages')}
        aria-label={`पेज ${currentPageNumber}/${totalPages}`}
        aria-expanded={activeDrawer === 'pages'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'pages' ? '#1e293b' : 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'pages' ? '#38bdf8' : '#94a3b8',
          cursor: 'pointer',
          padding: '6px 4px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'pages' ? 700 : 500,
          flex: 1,
          minHeight: '44px',
          minWidth: '44px',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>▤</span>
        <span style={{ whiteSpace: 'nowrap' }}>
          पेज {currentPageNumber}/{totalPages}
        </span>
      </button>

      {/* 2. Add Block Button (+ ब्लॉक) */}
      <button
        type="button"
        data-testid="mobile-nav-blocks"
        onClick={() => onSelectDrawer(activeDrawer === 'blocks' ? 'none' : 'blocks')}
        aria-label="नया समाचार ब्लॉक जोड़ें"
        aria-expanded={activeDrawer === 'blocks'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'blocks' ? '#1e293b' : 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'blocks' ? '#ef4444' : '#94a3b8',
          cursor: 'pointer',
          padding: '6px 4px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'blocks' ? 700 : 500,
          flex: 1,
          minHeight: '44px',
          minWidth: '44px',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>✚</span>
        <span style={{ whiteSpace: 'nowrap' }}>+ ब्लॉक</span>
      </button>

      {/* 3. Editor / Inspector Button (संपादक / गुण) */}
      <button
        type="button"
        data-testid="mobile-nav-inspector"
        onClick={() => onSelectDrawer(activeDrawer === 'inspector' ? 'none' : 'inspector')}
        aria-label={hasSelectedArticle ? 'लेख संपादक' : 'पृष्ठ गुण'}
        aria-expanded={activeDrawer === 'inspector'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'inspector' ? '#1e293b' : 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'inspector' ? '#60a5fa' : '#94a3b8',
          cursor: 'pointer',
          padding: '6px 4px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'inspector' ? 700 : 500,
          flex: 1,
          minHeight: '44px',
          minWidth: '44px',
          position: 'relative',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>✎</span>
        <span style={{ whiteSpace: 'nowrap' }}>संपादक</span>
        {hasSelectedArticle && (
          <span
            data-testid="inspector-selection-dot"
            style={{
              position: 'absolute',
              top: '5px',
              right: '12px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
            }}
          />
        )}
      </button>

      {/* 4. Format / Presets Button (प्रारूप) */}
      <button
        type="button"
        data-testid="mobile-nav-presets"
        onClick={() => onSelectDrawer(activeDrawer === 'presets' ? 'none' : 'presets')}
        aria-label="अख़बार प्रारूप व विन्यास"
        aria-expanded={activeDrawer === 'presets'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'presets' ? '#1e293b' : 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'presets' ? '#a78bfa' : '#94a3b8',
          cursor: 'pointer',
          padding: '6px 4px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'presets' ? 700 : 500,
          flex: 1,
          minHeight: '44px',
          minWidth: '44px',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>❖</span>
        <span style={{ whiteSpace: 'nowrap' }}>प्रारूप</span>
      </button>

      {/* 5. Direct PDF Export Button (PDF) */}
      <button
        type="button"
        data-testid="mobile-nav-pdf"
        onClick={onExportPdf}
        disabled={isExportingPdf}
        aria-label="अख़बार का PDF डाउनलोड करें"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          backgroundColor: '#b91c1c',
          border: 'none',
          borderRadius: '6px',
          color: '#ffffff',
          cursor: isExportingPdf ? 'wait' : 'pointer',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: 700,
          flex: 1,
          minHeight: '44px',
          minWidth: '44px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          opacity: isExportingPdf ? 0.7 : 1,
          transition: 'background-color 0.15s ease',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>⇓</span>
        <span style={{ whiteSpace: 'nowrap' }}>{isExportingPdf ? '...' : 'PDF'}</span>
      </button>
    </nav>
  );
};
