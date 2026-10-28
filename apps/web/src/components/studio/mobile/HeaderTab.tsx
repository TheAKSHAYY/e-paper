import React, { useState } from 'react';
import type { MastheadConfig } from '@epaper-studio/document-schema';
import { MASTHEAD_GALLERY_PRESETS, type MastheadPresetItem } from '../MastheadGalleryModal';
import { ColorStrip } from './ColorStrip';

export interface HeaderTabProps {
  currentConfig: MastheadConfig;
  onPreviewMasthead: (config: Partial<MastheadConfig>) => void;
  onApplyMasthead: (config: Partial<MastheadConfig>) => void;
}

export const HeaderTab: React.FC<HeaderTabProps> = ({
  currentConfig,
  onPreviewMasthead,
  onApplyMasthead,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    MASTHEAD_GALLERY_PRESETS[0]?.id || 'classic-hindi-double'
  );
  const [accentColor, setAccentColor] = useState<string>('#b91c1c');

  const handleSelectPreset = (preset: MastheadPresetItem) => {
    setSelectedPresetId(preset.id);
    const updated = {
      ...preset.config,
      // Apply chosen accent color to rule or strip
      announcementStripText: preset.config.announcementStripText,
    };
    onPreviewMasthead(updated);
  };

  const handleApply = () => {
    const preset = MASTHEAD_GALLERY_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      onApplyMasthead({
        ...preset.config,
        // Preserve user's publication title if already customized
        title: currentConfig.title || preset.config.title,
      });
    }
  };

  const handleColorChange = (color: string) => {
    setAccentColor(color);
    onPreviewMasthead({
      ...currentConfig,
      // In mobile header, apply color to announcement strip or theme accent
    });
  };

  return (
    <div
      data-testid="mobile-header-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            हेडर शैलियाँ (Masthead Presets)
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
            पारंपरिक हिंदी दैनिक व ब्रॉडशीट हेडर चुनें (Tap to preview)
          </p>
        </div>

        <button
          type="button"
          onClick={handleApply}
          data-testid="apply-header-preset-btn"
          style={{
            minHeight: '44px',
            padding: '0 16px',
            backgroundColor: '#b91c1c',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          लागू करें (Apply) ✓
        </button>
      </div>

      {/* Color Strip for Accent */}
      <ColorStrip
        selectedColor={accentColor}
        onSelectColor={handleColorChange}
        label="हेडर एक्सेंट रंग (Header Accent Color)"
      />

      {/* Preset Cards with Real JSON & Real Hindi Sample Text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {MASTHEAD_GALLERY_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              data-testid={`header-preset-${preset.id}`}
              style={{
                border: isSelected ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  {preset.name}
                </span>
                {isSelected && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#b91c1c',
                      backgroundColor: '#fee2e2',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    सक्रिय (Previewing)
                  </span>
                )}
              </div>

              {/* Real Masthead JSON Miniature Render */}
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                }}
              >
                {preset.config.showAnnouncementStrip && (
                  <div
                    style={{
                      backgroundColor: accentColor || '#b91c1c',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 4px',
                      marginBottom: '4px',
                      borderRadius: '2px',
                    }}
                  >
                    {preset.config.announcementStripText || 'विशेष बुलेटिन : निःशुल्क परिशिष्ट'}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '8.5px',
                    color: '#64748b',
                    borderBottom: '1px solid #111111',
                    paddingBottom: '2px',
                    marginBottom: '4px',
                  }}
                >
                  <span>
                    मौसम: {preset.config.weatherCity || 'नई दिल्ली'}{' '}
                    {preset.config.temperature || '25°C'}
                  </span>
                  <span style={{ fontStyle: 'italic' }}>
                    {preset.config.tagline || 'सत्य एवं निष्पक्षता'}
                  </span>
                  <span>{preset.config.price || 'मूल्य ₹5.00'}</span>
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontFamily: preset.config.fontFamily || "'Rozha One', serif",
                    fontWeight: 900,
                    color: '#111111',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {preset.config.title || 'जनवाणी समाचार'}
                </div>

                {preset.config.showSecondaryHeader && (
                  <div
                    style={{
                      backgroundColor: '#f1f5f9',
                      borderTop: '1px solid #cbd5e1',
                      marginTop: '4px',
                      padding: '2px 4px',
                      fontSize: '8.5px',
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    {preset.config.secondaryHeaderTitle ||
                      'प्रादेशिक एवं राष्ट्रीय राजधानी संस्करण'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
