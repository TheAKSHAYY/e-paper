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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#111827',
        borderTop: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingLeft: '4px',
        paddingRight: '4px',
        boxSizing: 'border-box',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {/* 1. Pages Button */}
      <button
        type="button"
        onClick={() => onSelectDrawer(activeDrawer === 'pages' ? 'none' : 'pages')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'pages' ? '#1f2937' : 'none',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'pages' ? '#ffffff' : '#9ca3af',
          cursor: 'pointer',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'pages' ? 700 : 500,
          flex: 1,
          maxWidth: '72px',
          minHeight: '44px',
          minWidth: '44px',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>▤</span>
        <span style={{ whiteSpace: 'nowrap' }}>
          पेज {currentPageNumber}/{totalPages}
        </span>
      </button>

      {/* 2. Add Block Button */}
      <button
        type="button"
        onClick={() => onSelectDrawer(activeDrawer === 'blocks' ? 'none' : 'blocks')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'blocks' ? '#1f2937' : 'none',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'blocks' ? '#ef4444' : '#9ca3af',
          cursor: 'pointer',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'blocks' ? 700 : 500,
          flex: 1,
          maxWidth: '72px',
          minHeight: '44px',
          minWidth: '44px',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>✚</span>
        <span style={{ whiteSpace: 'nowrap' }}>+ ब्लॉक</span>
      </button>

      {/* 3. Edit / Inspector Button */}
      <button
        type="button"
        onClick={() => onSelectDrawer(activeDrawer === 'inspector' ? 'none' : 'inspector')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'inspector' ? '#1f2937' : 'none',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'inspector' ? '#60a5fa' : '#9ca3af',
          cursor: 'pointer',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'inspector' ? 700 : 500,
          flex: 1,
          maxWidth: '72px',
          minHeight: '44px',
          minWidth: '44px',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>✎</span>
        <span style={{ whiteSpace: 'nowrap' }}>{hasSelectedArticle ? 'संपादक' : 'गुण'}</span>
      </button>

      {/* 4. Presets Button */}
      <button
        type="button"
        onClick={() => onSelectDrawer(activeDrawer === 'presets' ? 'none' : 'presets')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'presets' ? '#1f2937' : 'none',
          border: 'none',
          borderRadius: '6px',
          color: activeDrawer === 'presets' ? '#a78bfa' : '#9ca3af',
          cursor: 'pointer',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: activeDrawer === 'presets' ? 700 : 500,
          flex: 1,
          maxWidth: '72px',
          minHeight: '44px',
          minWidth: '44px',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>❖</span>
        <span style={{ whiteSpace: 'nowrap' }}>प्रारूप</span>
      </button>

      {/* 5. Export PDF Button */}
      <button
        type="button"
        onClick={onExportPdf}
        disabled={isExportingPdf}
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
          padding: '6px 10px',
          fontSize: '11px',
          fontWeight: 700,
          minWidth: '48px',
          minHeight: '44px',
        }}
      >
        <span style={{ fontSize: '13px', lineHeight: 1 }}>⇓</span>
        <span>{isExportingPdf ? '...' : 'PDF'}</span>
      </button>
    </nav>
  );
};
