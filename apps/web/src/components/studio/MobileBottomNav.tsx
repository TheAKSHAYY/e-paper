import React from 'react';
import { useI18n } from '../../i18n';
import { DownloadIcon, LayersIcon, LayoutGridIcon, PenIcon, PlusSquareIcon } from './StudioIcons';

export type MobileDrawerMode = 'pages' | 'blocks' | 'inspector' | 'presets' | 'page-setup' | 'none';

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
  const { locale } = useI18n();
  const isHi = locale === 'hi';

  const navBtnStyle = (isActive: boolean, activeColor = '#FAF8F5'): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    backgroundColor: isActive ? '#26221E' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: isActive ? activeColor : '#A8A29E',
    cursor: 'pointer',
    padding: '6px 4px',
    fontSize: '10.5px',
    fontWeight: isActive ? 600 : 500,
    flex: 1,
    minHeight: '44px',
    minWidth: '44px',
    position: 'relative',
    transition: 'background-color 140ms ease, color 140ms ease',
  });

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label={isHi ? 'मोबाइल नेविगेशन टूलबार' : 'Mobile Editor Navigation'}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#141210',
        borderTop: '1px solid #2B2723',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '6px',
        paddingRight: '6px',
        gap: '4px',
        boxSizing: 'border-box',
        zIndex: 100,
        userSelect: 'none',
        boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.32)',
        fontFamily: "'Poppins', 'Hind', sans-serif",
      }}
    >
      {/* 1. Pages */}
      <button
        type="button"
        data-testid="mobile-nav-pages"
        onClick={() => onSelectDrawer(activeDrawer === 'pages' ? 'none' : 'pages')}
        aria-label={`${isHi ? 'पेज' : 'Page'} ${currentPageNumber}/${totalPages}`}
        aria-expanded={activeDrawer === 'pages'}
        style={navBtnStyle(activeDrawer === 'pages', '#FAF8F5')}
      >
        <LayersIcon size={16} />
        <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {isHi
            ? `पेज ${currentPageNumber}/${totalPages}`
            : `P. ${currentPageNumber}/${totalPages}`}
        </span>
      </button>

      {/* 2. Add Block */}
      <button
        type="button"
        data-testid="mobile-nav-blocks"
        onClick={() => onSelectDrawer(activeDrawer === 'blocks' ? 'none' : 'blocks')}
        aria-label={isHi ? 'नया समाचार ब्लॉक जोड़ें' : 'Add Article Block'}
        aria-expanded={activeDrawer === 'blocks'}
        style={navBtnStyle(activeDrawer === 'blocks', '#FCA5A5')}
      >
        <PlusSquareIcon size={16} />
        <span style={{ whiteSpace: 'nowrap' }}>{isHi ? '+ ब्लॉक' : '+ Block'}</span>
      </button>

      {/* 3. Editor / Inspector */}
      <button
        type="button"
        data-testid="mobile-nav-inspector"
        onClick={() => onSelectDrawer(activeDrawer === 'inspector' ? 'none' : 'inspector')}
        aria-label={
          hasSelectedArticle
            ? isHi
              ? 'ख़बर संपादक'
              : 'Story Inspector'
            : isHi
              ? 'पेज गुण'
              : 'Page Inspector'
        }
        aria-expanded={activeDrawer === 'inspector'}
        style={navBtnStyle(activeDrawer === 'inspector', '#93C5FD')}
      >
        <PenIcon size={15} />
        <span style={{ whiteSpace: 'nowrap' }}>{isHi ? 'संपादक' : 'Inspector'}</span>
        {hasSelectedArticle && (
          <span
            data-testid="inspector-selection-dot"
            style={{
              position: 'absolute',
              top: '6px',
              right: '14px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#38BDF8',
            }}
          />
        )}
      </button>

      {/* 4. Presets & Format */}
      <button
        type="button"
        data-testid="mobile-nav-presets"
        onClick={() => onSelectDrawer(activeDrawer === 'presets' ? 'none' : 'presets')}
        aria-label={isHi ? 'अख़बार प्रारूप व विन्यास' : 'Layout & Presets'}
        aria-expanded={activeDrawer === 'presets'}
        style={navBtnStyle(activeDrawer === 'presets', '#DDD6FE')}
      >
        <LayoutGridIcon size={15} />
        <span style={{ whiteSpace: 'nowrap' }}>{isHi ? 'प्रारूप' : 'Layout'}</span>
      </button>

      {/* 5. Direct PDF Export */}
      <button
        type="button"
        data-testid="mobile-nav-pdf"
        onClick={onExportPdf}
        disabled={isExportingPdf}
        aria-label={isHi ? 'अख़बार का PDF डाउनलोड करें' : 'Download Vector PDF'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          backgroundColor: '#B91C1C',
          border: 'none',
          borderRadius: '8px',
          color: '#FFFFFF',
          cursor: isExportingPdf ? 'wait' : 'pointer',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: 600,
          flex: 1,
          minHeight: '44px',
          minWidth: '44px',
          boxShadow: '0 2px 6px rgba(185, 28, 28, 0.35)',
          opacity: isExportingPdf ? 0.75 : 1,
          transition: 'background-color 140ms ease',
        }}
      >
        <DownloadIcon size={15} />
        <span style={{ whiteSpace: 'nowrap' }}>{isExportingPdf ? '...' : 'PDF'}</span>
      </button>
    </nav>
  );
};
