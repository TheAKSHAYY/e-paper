import React from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import type {
  PageSizePreset,
  PageOrientation,
  PageDimensions,
  PageMargins,
} from '@epaper-studio/document-schema';
import { PageSetupContent } from './PageSetupContent';
import { useI18n } from '../../i18n';

export interface PageSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPageSize: PageSizePreset;
  initialOrientation: PageOrientation;
  initialDimensions?: PageDimensions;
  initialMargins?: PageMargins;
  onApply: (config: {
    pageSize: PageSizePreset;
    orientation: PageOrientation;
    dimensions?: PageDimensions;
    margins?: PageMargins;
  }) => void;
}

export const PageSetupModal: React.FC<PageSetupModalProps> = ({
  isOpen,
  onClose,
  initialPageSize,
  initialOrientation,
  initialDimensions,
  initialMargins,
  onApply,
}) => {
  const { locale } = useI18n();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-setup-modal-title"
      data-testid="page-setup-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiUi : APP_UI_TYPOGRAPHY.fonts.sans,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)',
          border: '1px solid #E7E2DA',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E7E2DA',
            backgroundColor: '#FAF8F5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📐</span>
            <div>
              <h2
                id="page-setup-modal-title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1C1917',
                  fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display,
                  lineHeight: locale === 'hi' ? 1.35 : 1.25,
                }}
              >
                {locale === 'hi' ? 'कागज़ आकार व विन्यास (Page Setup)' : 'Page & Paper Setup'}
              </h2>
              <span style={{ fontSize: '11px', color: '#78716C' }}>
                {locale === 'hi'
                  ? 'अख़बार के भौतिक आयाम, अभिविन्यास और मार्जिन निर्धारित करें'
                  : 'Configure physical page dimensions, orientation, and margins'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'hi' ? 'डायलॉग बंद करें' : 'Close Page Setup'}
            style={{
              background: 'none',
              border: 'none',
              color: '#78716C',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          <PageSetupContent
            initialPageSize={initialPageSize}
            initialOrientation={initialOrientation}
            initialDimensions={initialDimensions}
            initialMargins={initialMargins}
            onApply={onApply}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

