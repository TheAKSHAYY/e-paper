import React from 'react';
import { useI18n } from '../../i18n';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

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
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label={locale === 'hi' ? 'मोबाइल नेविगेशन टूलबार' : 'Mobile Editor Navigation'}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#1C1917',
        borderTop: '1px solid #2B2825',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '6px',
        paddingRight: '6px',
        boxSizing: 'border-box',
        zIndex: 100,
        userSelect: 'none',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.25)',
        fontFamily: locale === 'hi' ? PUBLISHER_DESIGN_SYSTEM.fonts.hindiUi : PUBLISHER_DESIGN_SYSTEM.fonts.interface,
      }}
    >
      {/* 1. Pages Button */}
      <button
        type="button"
        data-testid="mobile-nav-pages"
        onClick={() => onSelectDrawer(activeDrawer === 'pages' ? 'none' : 'pages')}
        aria-label={`${locale === 'hi' ? 'पृष्ठ' : 'Page'} ${currentPageNumber}/${totalPages}`}
        aria-expanded={activeDrawer === 'pages'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'pages' ? '#2B2825' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: activeDrawer === 'pages' ? '#FAF8F5' : '#A8A29E',
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
          {locale === 'hi' ? `पेज ${currentPageNumber}/${totalPages}` : `P. ${currentPageNumber}/${totalPages}`}
        </span>
      </button>

      {/* 2. Add Block Button */}
      <button
        type="button"
        data-testid="mobile-nav-blocks"
        onClick={() => onSelectDrawer(activeDrawer === 'blocks' ? 'none' : 'blocks')}
        aria-label={locale === 'hi' ? 'नया समाचार ब्लॉक जोड़ें' : 'Add Article Block'}
        aria-expanded={activeDrawer === 'blocks'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'blocks' ? '#2B2825' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: activeDrawer === 'blocks' ? '#F87171' : '#A8A29E',
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
        <span style={{ whiteSpace: 'nowrap' }}>
          {locale === 'hi' ? '+ ब्लॉक' : '+ Block'}
        </span>
      </button>

      {/* 3. Editor / Inspector Button */}
      <button
        type="button"
        data-testid="mobile-nav-inspector"
        onClick={() => onSelectDrawer(activeDrawer === 'inspector' ? 'none' : 'inspector')}
        aria-label={hasSelectedArticle ? (locale === 'hi' ? 'लेख संपादक' : 'Story Inspector') : (locale === 'hi' ? 'पृष्ठ गुण' : 'Page Inspector')}
        aria-expanded={activeDrawer === 'inspector'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'inspector' ? '#2B2825' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: activeDrawer === 'inspector' ? '#60A5FA' : '#A8A29E',
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
        <span style={{ whiteSpace: 'nowrap' }}>
          {locale === 'hi' ? 'संपादक' : 'Inspector'}
        </span>
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
              backgroundColor: '#38BDF8',
            }}
          />
        )}
      </button>

      {/* 4. Format / Presets Button */}
      <button
        type="button"
        data-testid="mobile-nav-presets"
        onClick={() => onSelectDrawer(activeDrawer === 'presets' ? 'none' : 'presets')}
        aria-label={locale === 'hi' ? 'अख़बार प्रारूप व विन्यास' : 'Layout & Presets'}
        aria-expanded={activeDrawer === 'presets'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: activeDrawer === 'presets' ? '#2B2825' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: activeDrawer === 'presets' ? '#C084FC' : '#A8A29E',
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
        <span style={{ whiteSpace: 'nowrap' }}>
          {locale === 'hi' ? 'प्रारूप' : 'Layout'}
        </span>
      </button>

      {/* 5. Direct PDF Export Button */}
      <button
        type="button"
        data-testid="mobile-nav-pdf"
        onClick={onExportPdf}
        disabled={isExportingPdf}
        aria-label={locale === 'hi' ? 'अख़बार का PDF डाउनलोड करें' : 'Download Vector PDF'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          backgroundColor: colors.pressRed,
          border: 'none',
          borderRadius: '8px',
          color: '#FFFFFF',
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
