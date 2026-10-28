import React, { useState } from 'react';
import type { ElementBorders, SingleBorderConfig, BorderStyle } from '@epaper-studio/document-schema';

export interface BorderControlsProps {
  borders?: ElementBorders;
  onChange: (updatedBorders: ElementBorders) => void;
}

const BORDER_STYLES: Array<{ value: BorderStyle; label: string }> = [
  { value: 'none', label: 'कोई नहीं (None)' },
  { value: 'solid', label: 'सॉलिड (Solid)' },
  { value: 'double', label: 'डबल (Double)' },
  { value: 'dashed', label: 'डैश्ड (Dashed)' },
  { value: 'dotted', label: 'डॉटेड (Dotted)' },
];

const PRESET_COLORS = [
  { value: '#111111', label: 'काली स्याही' },
  { value: '#b91c1c', label: 'लाल (Lead Red)' },
  { value: '#2563eb', label: 'नीला (Royal Blue)' },
  { value: '#15803d', label: 'हरा (Forest Green)' },
  { value: '#b45309', label: 'अंबर (Amber)' },
  { value: '#cbd5e1', label: 'हल्का ग्रे (Divider)' },
];

export const BorderControls: React.FC<BorderControlsProps> = ({ borders = {}, onChange }) => {
  const [activeSide, setActiveSide] = useState<'top' | 'right' | 'bottom' | 'left' | 'all'>('top');

  const getSideBorder = (side: 'top' | 'right' | 'bottom' | 'left'): SingleBorderConfig => {
    return borders[side] ?? { width: 0, style: 'none', color: '#111111' };
  };

  const handleUpdateSide = (
    side: 'top' | 'right' | 'bottom' | 'left',
    partial: Partial<SingleBorderConfig>
  ) => {
    const current = getSideBorder(side);
    const updated: SingleBorderConfig = { ...current, ...partial };
    onChange({
      ...borders,
      [side]: updated,
    });
  };

  const handleApplyToAll = (partial: Partial<SingleBorderConfig>) => {
    const base = activeSide === 'all' ? getSideBorder('top') : getSideBorder(activeSide);
    const updated: SingleBorderConfig = { ...base, ...partial };
    onChange({
      top: { ...updated },
      right: { ...updated },
      bottom: { ...updated },
      left: { ...updated },
    });
  };

  const currentConfig =
    activeSide === 'all' ? getSideBorder('top') : getSideBorder(activeSide);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
          🔲 बॉर्डर नियंत्रण (Border Controls)
        </span>
        <button
          type="button"
          onClick={() =>
            onChange({
              top: { width: 1, style: 'solid', color: '#111111' },
              right: { width: 1, style: 'solid', color: '#111111' },
              bottom: { width: 1, style: 'solid', color: '#111111' },
              left: { width: 1, style: 'solid', color: '#111111' },
            })
          }
          style={{
            fontSize: '10.5px',
            color: '#b91c1c',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            padding: 0,
          }}
        >
          चारों तरफ बॉर्डर लगाएँ
        </button>
      </div>

      {/* Side Selector Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
          backgroundColor: '#e2e8f0',
          padding: '2px',
          borderRadius: '6px',
        }}
      >
        {(
          [
            { key: 'top', label: 'ऊपर' },
            { key: 'right', label: 'दाएँ' },
            { key: 'bottom', label: 'नीचे' },
            { key: 'left', label: 'बाएँ' },
            { key: 'all', label: 'सभी' },
          ] as const
        ).map((tab) => {
          const isSelected = activeSide === tab.key;
          const hasBorder =
            tab.key === 'all'
              ? Boolean(borders.top?.width || borders.bottom?.width)
              : Boolean(borders[tab.key]?.width && borders[tab.key]?.style !== 'none');

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSide(tab.key)}
              style={{
                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                color: isSelected ? '#b91c1c' : '#475569',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 2px',
                fontSize: '11px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
              }}
            >
              <span>{tab.label}</span>
              {hasBorder && (
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#b91c1c',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Thickness / Width Slider & Input */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
            मोटाई (Thickness): {currentConfig.width}px
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={currentConfig.width}
            onChange={(e) => {
              const width = parseInt(e.target.value, 10);
              const style = width > 0 && currentConfig.style === 'none' ? 'solid' : currentConfig.style;
              if (activeSide === 'all') {
                handleApplyToAll({ width, style });
              } else {
                handleUpdateSide(activeSide, { width, style });
              }
            }}
            style={{ flex: 1, accentColor: '#b91c1c', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', minWidth: '24px' }}>
            {currentConfig.width}px
          </span>
        </div>
      </div>

      {/* Style Dropdown */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
          बॉर्डर प्रकार (Style)
        </label>
        <select
          value={currentConfig.style}
          onChange={(e) => {
            const style = e.target.value as BorderStyle;
            const width = style !== 'none' && currentConfig.width === 0 ? 1 : currentConfig.width;
            if (activeSide === 'all') {
              handleApplyToAll({ style, width });
            } else {
              handleUpdateSide(activeSide, { style, width });
            }
          }}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '11.5px',
            color: '#0f172a',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {BORDER_STYLES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Presets & Picker */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
          रंग (Color)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => {
                if (activeSide === 'all') {
                  handleApplyToAll({ color: c.value });
                } else {
                  handleUpdateSide(activeSide, { color: c.value });
                }
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: c.value,
                border: currentConfig.color === c.value ? '2px solid #2563eb' : '1px solid #94a3b8',
                cursor: 'pointer',
                padding: 0,
                outlineOffset: '1px',
              }}
            />
          ))}
          <input
            type="color"
            value={currentConfig.color}
            onChange={(e) => {
              if (activeSide === 'all') {
                handleApplyToAll({ color: e.target.value });
              } else {
                handleUpdateSide(activeSide, { color: e.target.value });
              }
            }}
            style={{
              width: '24px',
              height: '24px',
              padding: 0,
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
};
