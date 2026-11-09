import React, { useState } from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import type { NewspaperPresetId, NewspaperLayoutConfig } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';
import { LAYOUT_PRESET_OPTIONS } from './LayoutBuilderRow';
import { useI18n } from '../../i18n';

export interface LayoutPresetsContentProps {
  currentPresetId: NewspaperPresetId;
  layout: NewspaperLayoutConfig;
  onSelectPreset: (presetId: NewspaperPresetId, replaceArticles: boolean) => void;
  onUpdateLayout: (updatedLayout: NewspaperLayoutConfig) => void;
  onApplyLayoutRow?: (columns: number[]) => void;
  onAutoFit?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const LayoutPresetsContent: React.FC<LayoutPresetsContentProps> = ({
  currentPresetId,
  layout,
  onSelectPreset,
  onUpdateLayout,
  onApplyLayoutRow,
  onAutoFit,
  onClose,
  isMobile = false,
}) => {
  const { locale } = useI18n();
  const presets = getAllNewspaperPresets();

  const [activeTab, setActiveTab] = useState<'presets' | 'columns' | 'grid-builder'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<NewspaperPresetId>(currentPresetId);
  const [replaceArticles, setReplaceArticles] = useState(false);

  // Mini SVG newspaper grid diagram for each preset
  const renderPresetMiniature = (presetId: NewspaperPresetId) => {
    switch (presetId) {
      case 'classic-hindi-broadsheet':
      case 'classic-broadsheet':
        // 8-column style: Masthead on top, lead 4-col box with photo, side columns, 4 lower columns
        return (
          <svg viewBox="0 0 64 80" width="48" height="60" fill="none" style={{ flexShrink: 0 }}>
            <rect width="64" height="80" rx="3" fill="#FAF8F5" stroke="#D6D0C5" strokeWidth="1" />
            {/* Masthead */}
            <rect x="4" y="4" width="56" height="10" fill="#1C1917" rx="1" />
            <line x1="4" y1="17" x2="60" y2="17" stroke="#1C1917" strokeWidth="0.75" />
            {/* Lead Story (Left 36px) */}
            <rect x="4" y="20" width="34" height="16" fill="#D6D0C5" rx="1" />
            <rect x="4" y="38" width="16" height="18" fill="#E7E2DA" rx="1" />
            <rect x="22" y="38" width="16" height="18" fill="#E7E2DA" rx="1" />
            {/* Side column */}
            <rect x="40" y="20" width="20" height="36" fill="#E7E2DA" rx="1" />
            {/* Lower row */}
            <rect x="4" y="58" width="17" height="16" fill="#E7E2DA" rx="1" />
            <rect x="23" y="58" width="17" height="16" fill="#E7E2DA" rx="1" />
            <rect x="42" y="58" width="18" height="16" fill="#E7E2DA" rx="1" />
            {/* Bottom folio line */}
            <line x1="4" y1="76" x2="60" y2="76" stroke="#D6D0C5" strokeWidth="0.5" />
          </svg>
        );
      case 'modern-editorial':
        // 3-column asymmetric layout with large photo feature
        return (
          <svg viewBox="0 0 64 80" width="48" height="60" fill="none" style={{ flexShrink: 0 }}>
            <rect width="64" height="80" rx="3" fill="#FAF8F5" stroke="#D6D0C5" strokeWidth="1" />
            <rect x="4" y="5" width="36" height="6" fill="#1C1917" rx="1" />
            {/* Big feature photo */}
            <rect x="4" y="14" width="56" height="26" fill="#A8A29E" rx="1" />
            {/* 3 clean columns below */}
            <rect x="4" y="43" width="17" height="32" fill="#E7E2DA" rx="1" />
            <rect x="23" y="43" width="17" height="32" fill="#E7E2DA" rx="1" />
            <rect x="42" y="43" width="18" height="32" fill="#E7E2DA" rx="1" />
          </svg>
        );
      case 'modern-hindi-daily':
        // Modern 6-column daily: masthead with weather ear, 2-col lead, 4-col hero
        return (
          <svg viewBox="0 0 64 80" width="48" height="60" fill="none" style={{ flexShrink: 0 }}>
            <rect width="64" height="80" rx="3" fill="#FAF8F5" stroke="#D6D0C5" strokeWidth="1" />
            <rect x="4" y="4" width="42" height="9" fill="#1C1917" rx="1" />
            <rect x="48" y="4" width="12" height="9" fill="#DC2626" rx="1" />
            <line x1="4" y1="16" x2="60" y2="16" stroke="#1C1917" strokeWidth="0.5" />
            <rect x="4" y="19" width="36" height="28" fill="#E7E2DA" rx="1" />
            <rect x="42" y="19" width="18" height="28" fill="#D6D0C5" rx="1" />
            <rect x="4" y="50" width="27" height="24" fill="#E7E2DA" rx="1" />
            <rect x="33" y="50" width="27" height="24" fill="#E7E2DA" rx="1" />
          </svg>
        );
      case 'local-hindi-gazette':
      case 'compact-local':
      default:
        // Tabloid 5-column compact: bold kicker top, central photo, dense story grid
        return (
          <svg viewBox="0 0 64 80" width="48" height="60" fill="none" style={{ flexShrink: 0 }}>
            <rect width="64" height="80" rx="3" fill="#FAF8F5" stroke="#D6D0C5" strokeWidth="1" />
            <rect x="4" y="4" width="56" height="12" fill="#1C1917" rx="1" />
            <rect x="4" y="19" width="27" height="24" fill="#A8A29E" rx="1" />
            <rect x="33" y="19" width="27" height="24" fill="#E7E2DA" rx="1" />
            <rect x="4" y="46" width="17" height="28" fill="#E7E2DA" rx="1" />
            <rect x="23" y="46" width="17" height="28" fill="#E7E2DA" rx="1" />
            <rect x="42" y="46" width="18" height="28" fill="#E7E2DA" rx="1" />
          </svg>
        );
    }
  };

  const handleApplyPresetClick = () => {
    if (replaceArticles) {
      const confirmText =
        locale === 'hi'
          ? 'चेतावनी: मौजूदा लेखों को इस प्रारूप के नमूना समाचारों से बदल दिया जाएगा। क्या आप जारी रखना चाहते हैं?'
          : 'Warning: Existing articles will be replaced with sample articles from this preset. Continue?';
      if (!window.confirm(confirmText)) return;
    }
    onSelectPreset(selectedPresetId, replaceArticles);
    if (onClose) onClose();
  };

  return (
    <div
      data-testid="layout-presets-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#1C1917',
        fontFamily:
          locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiUi : APP_UI_TYPOGRAPHY.fonts.sans,
      }}
    >
      {/* ── Sub-Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#EDE8E1',
          padding: '3px',
          borderRadius: '8px',
          gap: '3px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'presets' ? 700 : 500,
            backgroundColor: activeTab === 'presets' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'presets' ? '#1C1917' : '#78716C',
            cursor: 'pointer',
            boxShadow: activeTab === 'presets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {locale === 'hi' ? 'अख़बार शैलियाँ' : 'Newspaper Presets'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('columns')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'columns' ? 700 : 500,
            backgroundColor: activeTab === 'columns' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'columns' ? '#1C1917' : '#78716C',
            cursor: 'pointer',
            boxShadow: activeTab === 'columns' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {locale === 'hi' ? 'कॉलम व स्पेसिंग' : 'Columns & Spacing'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grid-builder')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'grid-builder' ? 700 : 500,
            backgroundColor: activeTab === 'grid-builder' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'grid-builder' ? '#1C1917' : '#78716C',
            cursor: 'pointer',
            boxShadow: activeTab === 'grid-builder' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {locale === 'hi' ? '12-कॉलम रो ग्रिड' : 'Row Presets'}
        </button>
      </div>

      {/* ── TAB 1: NEWSPAPER PRESETS ── */}
      {activeTab === 'presets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#78716C',
              }}
            >
              {locale === 'hi' ? 'शास्त्रीय व आधुनिक प्रारूप' : 'Editorial Layout Presets'}
            </span>
            <span style={{ fontSize: '11px', color: '#78716C' }}>
              {presets.length} {locale === 'hi' ? 'प्रारूप उपलब्ध' : 'styles available'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '10px',
              maxHeight: isMobile ? '280px' : '360px',
              overflowY: 'auto',
              paddingRight: '2px',
            }}
          >
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const isHindi = preset.id.includes('hindi');
              return (
                <div
                  key={preset.id}
                  data-testid={`preset-card-${preset.id}`}
                  onClick={() => setSelectedPresetId(preset.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #1C1917' : '1px solid #E7E2DA',
                    backgroundColor: isSelected ? '#FAF8F5' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Miniature Column Diagram */}
                  {renderPresetMiniature(preset.id)}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1C1917',
                          fontFamily: isHindi
                            ? "'Noto Serif Devanagari', serif"
                            : "'Playfair Display', serif",
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#DC2626',
                            backgroundColor: '#FEE2E2',
                            padding: '1px 5px',
                            borderRadius: '3px',
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          backgroundColor: '#EDE8E1',
                          color: '#44403C',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {preset.defaultColumns} Cols
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          backgroundColor: isHindi ? '#FEF2F2' : '#F0F9FF',
                          color: isHindi ? '#DC2626' : '#0369A1',
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        {isHindi ? 'हिंदी' : 'English'}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#78716C',
                          textTransform: 'capitalize',
                        }}
                      >
                        {preset.recommendedPageSize}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '11px',
                        color: '#57534E',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {preset.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Replace Content Option */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#FAF8F5',
              borderRadius: '8px',
              border: '1px solid #E7E2DA',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#44403C',
            }}
          >
            <input
              type="checkbox"
              checked={replaceArticles}
              onChange={(e) => setReplaceArticles(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>
              {locale === 'hi'
                ? 'शैली के साथ इसके नमूना लेख लोड करें (Replace with sample stories)'
                : 'Replace existing articles with preset sample stories'}
            </span>
          </label>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D6D0C5',
                  backgroundColor: '#FFFFFF',
                  color: '#57534E',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {locale === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            )}
            <button
              type="button"
              data-testid="btn-apply-preset"
              onClick={handleApplyPresetClick}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1C1917',
                color: '#FAF8F5',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {locale === 'hi' ? 'शैली लागू करें ✓' : 'Apply Preset ✓'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: COLUMNS, DIVIDERS & SPACING ── */}
      {activeTab === 'columns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. Column Structure */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#78716C',
                }}
              >
                {locale === 'hi' ? 'कॉलम संरचना (Column Count)' : 'Column Structure'}
              </label>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#DC2626',
                  backgroundColor: '#FEE2E2',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {layout.columnCount} {locale === 'hi' ? 'कॉलम' : 'Columns'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '4px',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 8, 12].map((colNum) => {
                const isActive = layout.columnCount === colNum;
                return (
                  <button
                    key={colNum}
                    type="button"
                    data-testid={`btn-col-${colNum}`}
                    onClick={() => onUpdateLayout({ ...layout, columnCount: colNum })}
                    style={{
                      padding: '8px 2px',
                      borderRadius: '6px',
                      border: isActive ? '2px solid #1C1917' : '1px solid #E7E2DA',
                      backgroundColor: isActive ? '#FFFFFF' : '#FAF8F5',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '12px',
                      color: '#1C1917',
                      cursor: 'pointer',
                      minHeight: '38px',
                    }}
                  >
                    {colNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Spacing Density */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#78716C',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'कॉलम रिक्ति व स्पेसिंग (Density)' : 'Spacing Density'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(
                [
                  { id: 'compact', labelEn: 'Compact (18pt)', labelHi: 'सघन (18pt)' },
                  { id: 'normal', labelEn: 'Normal (24pt)', labelHi: 'सामान्य (24pt)' },
                  { id: 'spacious', labelEn: 'Spacious (32pt)', labelHi: 'विशाल (32pt)' },
                ] as const
              ).map((dens) => {
                const isActive = (layout.spacingDensity ?? 'normal') === dens.id;
                return (
                  <button
                    key={dens.id}
                    type="button"
                    data-testid={`btn-density-${dens.id}`}
                    onClick={() => onUpdateLayout({ ...layout, spacingDensity: dens.id })}
                    style={{
                      padding: '9px 8px',
                      borderRadius: '6px',
                      border: isActive ? '2px solid #1C1917' : '1px solid #E7E2DA',
                      backgroundColor: isActive ? '#FFFFFF' : '#FAF8F5',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '11.5px',
                      color: '#1C1917',
                      cursor: 'pointer',
                      minHeight: '40px',
                    }}
                  >
                    {locale === 'hi' ? dens.labelHi : dens.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Column Dividers */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#78716C',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'कॉलम विभाजक रेखाएँ (Dividers)' : 'Column Dividers'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() =>
                  onUpdateLayout({ ...layout, columnRule: false, columnRuleStyle: 'none' })
                }
                style={{
                  padding: '9px 8px',
                  borderRadius: '6px',
                  border: !layout.columnRule ? '2px solid #1C1917' : '1px solid #E7E2DA',
                  backgroundColor: !layout.columnRule ? '#FFFFFF' : '#FAF8F5',
                  fontWeight: !layout.columnRule ? 700 : 500,
                  fontSize: '12px',
                  color: '#1C1917',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                {locale === 'hi' ? 'बंद (Off)' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateLayout({ ...layout, columnRule: true, columnRuleStyle: 'solid' })
                }
                style={{
                  padding: '9px 8px',
                  borderRadius: '6px',
                  border:
                    layout.columnRule && layout.columnRuleStyle !== 'dashed'
                      ? '2px solid #1C1917'
                      : '1px solid #E7E2DA',
                  backgroundColor:
                    layout.columnRule && layout.columnRuleStyle !== 'dashed'
                      ? '#FFFFFF'
                      : '#FAF8F5',
                  fontWeight: layout.columnRule && layout.columnRuleStyle !== 'dashed' ? 700 : 500,
                  fontSize: '12px',
                  color: '#1C1917',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                {locale === 'hi' ? 'ठोस रेखा (Solid)' : 'Solid'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateLayout({ ...layout, columnRule: true, columnRuleStyle: 'dashed' })
                }
                style={{
                  padding: '9px 8px',
                  borderRadius: '6px',
                  border:
                    layout.columnRule && layout.columnRuleStyle === 'dashed'
                      ? '2px solid #1C1917'
                      : '1px solid #E7E2DA',
                  backgroundColor:
                    layout.columnRule && layout.columnRuleStyle === 'dashed'
                      ? '#FFFFFF'
                      : '#FAF8F5',
                  fontWeight: layout.columnRule && layout.columnRuleStyle === 'dashed' ? 700 : 500,
                  fontSize: '12px',
                  color: '#1C1917',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                {locale === 'hi' ? 'बिंदु रेखा (Dashed)' : 'Dashed'}
              </button>
            </div>
          </div>

          {/* 4. Auto-Fit Action */}
          {onAutoFit && (
            <button
              type="button"
              data-testid="btn-autofit-grid"
              onClick={onAutoFit}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D6D0C5',
                backgroundColor: '#FAF8F5',
                color: '#1C1917',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <span>⚖️</span>
              <span>
                {locale === 'hi'
                  ? 'ग्रिड व सामग्री स्वतः समतुल्य करें (Auto-fit Balance)'
                  : 'Auto-balance Grid & Content'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── TAB 3: 12-COLUMN ROW PRESETS BUILDER ── */}
      {activeTab === 'grid-builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#78716C',
              }}
            >
              {locale === 'hi' ? 'पंक्ति संयोजन (Row Combinations)' : '12-Column Row Combinations'}
            </span>
            <p style={{ margin: '2px 0 8px 0', fontSize: '11px', color: '#57534E' }}>
              {locale === 'hi'
                ? 'पृष्ठ पर नए समाचार ब्लॉक जोड़ने के लिए कॉलम चौड़ाई चुनें:'
                : 'Select column proportions to arrange news blocks on this page:'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '8px',
              maxHeight: isMobile ? '280px' : '360px',
              overflowY: 'auto',
            }}
          >
            {LAYOUT_PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`layout-row-${opt.id}`}
                onClick={() => {
                  if (onApplyLayoutRow) onApplyLayoutRow(opt.columns);
                  if (onClose) onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E7E2DA',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1917' }}>
                    {opt.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#DC2626',
                      backgroundColor: '#FEE2E2',
                      padding: '1px 5px',
                      borderRadius: '3px',
                    }}
                  >
                    {opt.label}
                  </span>
                </div>

                {/* Visual Proportion Bar */}
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '10px',
                    gap: '2px',
                    backgroundColor: '#EDE8E1',
                    padding: '1px',
                    borderRadius: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                  {opt.columns.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        flex: c,
                        height: '100%',
                        backgroundColor: i % 2 === 0 ? '#1C1917' : '#78716C',
                        borderRadius: '1px',
                      }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
