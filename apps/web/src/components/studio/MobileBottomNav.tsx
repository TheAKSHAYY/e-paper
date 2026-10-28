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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        backgroundColor: '#111827',
        borderTop: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        boxSizing: 'border-box',
        zIndex: 100,
      }}
    >
      {/* 1. Pages Button */}
      <button
        onClick={() => onSelectDrawer(activeDrawer === 'pages' ? 'none' : 'pages')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeDrawer === 'pages' ? '#ffffff' : '#9ca3af',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '13px' }}>▤</span>
        <span>
          पेज {currentPageNumber}/{totalPages}
        </span>
      </button>

      {/* 2. Add Block Button */}
      <button
        onClick={() => onSelectDrawer(activeDrawer === 'blocks' ? 'none' : 'blocks')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeDrawer === 'blocks' ? '#ffffff' : '#9ca3af',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '13px' }}>✚</span>
        <span>+ ब्लॉक</span>
      </button>

      {/* 3. Edit / Inspector Button */}
      <button
        onClick={() => onSelectDrawer(activeDrawer === 'inspector' ? 'none' : 'inspector')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeDrawer === 'inspector' ? '#ffffff' : '#9ca3af',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '13px' }}>✎</span>
        <span>{hasSelectedArticle ? 'संपादक' : 'गुण'}</span>
      </button>

      {/* 4. Presets Button */}
      <button
        onClick={() => onSelectDrawer(activeDrawer === 'presets' ? 'none' : 'presets')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeDrawer === 'presets' ? '#ffffff' : '#9ca3af',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '13px' }}>❖</span>
        <span>प्रारूप</span>
      </button>

      {/* 5. Export PDF Button */}
      <button
        onClick={onExportPdf}
        disabled={isExportingPdf}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: '#b91c1c',
          border: 'none',
          borderRadius: '3px',
          color: '#ffffff',
          cursor: isExportingPdf ? 'wait' : 'pointer',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        <span style={{ fontSize: '12px' }}>⇓</span>
        <span>{isExportingPdf ? '...' : 'PDF'}</span>
      </button>
    </nav>
  );
};
