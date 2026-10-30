import React from 'react';

export type MobileDrawerMode =
  | 'text'
  | 'image'
  | 'layout'
  | 'style'
  | 'pages'
  | 'more'
  | 'blocks'
  | 'presets'
  | 'inspector'
  | 'none';

export interface MobileBottomNavProps {
  activeDrawer: MobileDrawerMode;
  onSelectDrawer: (mode: MobileDrawerMode) => void;
  currentPageNumber: number;
  totalPages: number;
  hasSelectedArticle: boolean;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeDrawer,
  onSelectDrawer,
  currentPageNumber,
  totalPages,
  hasSelectedArticle,
}) => {
  // Map legacy modes to primary 6 categories
  const normalizedActive =
    activeDrawer === 'inspector'
      ? hasSelectedArticle
        ? 'text'
        : 'layout'
      : activeDrawer === 'blocks'
        ? 'text'
        : activeDrawer === 'presets'
          ? 'style'
          : activeDrawer;

  const handleToggle = (mode: 'text' | 'image' | 'layout' | 'style' | 'pages' | 'more') => {
    if (activeDrawer === mode) {
      onSelectDrawer('none');
    } else {
      onSelectDrawer(mode);
    }
  };

  const navItems = [
    {
      id: 'text' as const,
      label: 'टेक्स्ट',
      aliasText: '+ ब्लॉक',
      icon: '🔤',
      testId: 'mobile-nav-text',
      badge: hasSelectedArticle ? '✓' : undefined,
    },
    {
      id: 'image' as const,
      label: 'चित्र',
      icon: '🖼️',
      testId: 'mobile-nav-image',
    },
    {
      id: 'layout' as const,
      label: 'लेआउट',
      aliasText: 'गुण',
      icon: '⊞',
      testId: 'mobile-nav-layout',
    },
    {
      id: 'style' as const,
      label: 'शैली',
      aliasText: 'प्रारूप',
      icon: '🎨',
      testId: 'mobile-nav-style',
    },
    {
      id: 'pages' as const,
      label: `पृष्ठ ${currentPageNumber}/${totalPages}`,
      aliasText: 'पेज',
      icon: '📄',
      testId: 'mobile-nav-pages',
    },
    {
      id: 'more' as const,
      label: 'अधिक',
      icon: '⋯',
      testId: 'mobile-nav-more',
    },
  ];

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
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '2px',
        paddingRight: '2px',
        boxSizing: 'border-box',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {navItems.map((item) => {
        const isActive = normalizedActive === item.id;
        return (
          <button
            key={item.id}
            type="button"
            data-testid={item.testId}
            onClick={() => handleToggle(item.id)}
            aria-label={item.label}
            aria-expanded={isActive}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1px',
              background: isActive ? '#1e293b' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: isActive ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              padding: '4px 2px',
              fontSize: '10px',
              fontWeight: isActive ? 700 : 500,
              flex: 1,
              minHeight: '44px',
              minWidth: '44px',
              position: 'relative',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{item.icon}</span>
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '56px',
              }}
            >
              {item.label}
            </span>
            {item.aliasText && (
              <span
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >
                {item.aliasText}
              </span>
            )}
            {item.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '6px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
