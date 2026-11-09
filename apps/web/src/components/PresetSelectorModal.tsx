import React from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import type { NewspaperPresetId, NewspaperLayoutConfig } from '@epaper-studio/document-schema';
import { LayoutPresetsContent } from './studio/LayoutPresetsContent';
import { useI18n } from '../i18n';

export interface PresetSelectorModalProps {
  isOpen: boolean;
  currentPresetId: NewspaperPresetId;
  layout?: NewspaperLayoutConfig;
  onClose: () => void;
  onApplyPreset: (presetId: NewspaperPresetId, replaceArticles: boolean) => void;
  onUpdateLayout?: (layout: NewspaperLayoutConfig) => void;
  onApplyLayoutRow?: (columns: number[]) => void;
  onAutoFit?: () => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  currentPresetId,
  layout = {
    presetId: currentPresetId,
    columnCount: 12,
    columnRule: true,
    columnRuleStyle: 'solid',
    mastheadFont: "'Rozha One', serif",
    headlineFont: "'Noto Serif Devanagari', serif",
    subheadlineFont: "'Noto Serif Devanagari', serif",
    bodyFont: "'Noto Serif Devanagari', serif",
    headlineWeight: 700,
    bodyFontSizePt: 10,
    spacingDensity: 'normal',
    showFooter: true,
    footerText: '',
  },
  onClose,
  onApplyPreset,
  onUpdateLayout = () => {},
  onApplyLayoutRow,
  onAutoFit,
}) => {
  const { locale } = useI18n();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preset-selector-modal-title"
      data-testid="preset-selector-modal"
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
        fontFamily:
          locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiUi : APP_UI_TYPOGRAPHY.fonts.sans,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
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
            <span style={{ fontSize: '18px' }}>🗞️</span>
            <div>
              <h2
                id="preset-selector-modal-title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1C1917',
                  fontFamily:
                    locale === 'hi'
                      ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay
                      : APP_UI_TYPOGRAPHY.fonts.display,
                  lineHeight: locale === 'hi' ? 1.35 : 1.25,
                }}
              >
                {locale === 'hi'
                  ? 'अख़बार प्रारूप व शैली चुनें (Layout Presets)'
                  : 'Newspaper Layout Presets & Grid'}
              </h2>
              <span style={{ fontSize: '11px', color: '#78716C' }}>
                {locale === 'hi'
                  ? 'कॉलम ग्रिड, फॉन्ट संयोजन और संपादकीय शैली का चयन करें'
                  : 'Switch between broadsheet, tabloid, and modern editorial grid architectures'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'hi' ? 'डायलॉग बंद करें' : 'Close Presets'}
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
          <LayoutPresetsContent
            currentPresetId={currentPresetId}
            layout={layout}
            onSelectPreset={onApplyPreset}
            onUpdateLayout={onUpdateLayout}
            onApplyLayoutRow={onApplyLayoutRow}
            onAutoFit={onAutoFit}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};
