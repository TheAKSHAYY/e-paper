import React, { useState } from 'react';
import type {
  ElementBorders,
  SingleBorderConfig,
  BorderStyle,
} from '@epaper-studio/document-schema';

export interface BorderControlsProps {
  label?: string;
  borders?: ElementBorders;
  onChange: (updatedBorders: ElementBorders) => void;
  onReset?: () => void;
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

export const BorderControls: React.FC<BorderControlsProps> = ({
  label = 'बॉर्डर (Borders)',
  borders = {},
  onChange,
  onReset,
}) => {
  const [activeSide, setActiveSide] = useState<'top' | 'right' | 'bottom' | 'left' | 'all'>('all');

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

  const handleResetBorders = () => {
    if (onReset) {
      onReset();
    } else {
      onChange({
        top: { width: 0, style: 'none', color: '#111111' },
        right: { width: 0, style: 'none', color: '#111111' },
        bottom: { width: 0, style: 'none', color: '#111111' },
        left: { width: 0, style: 'none', color: '#111111' },
      });
    }
  };

  const currentConfig = activeSide === 'all' ? getSideBorder('top') : getSideBorder(activeSide);

  // Compute live preview styles
  const previewBorderStyles: React.CSSProperties = {
    borderTop:
      borders.top && borders.top.style !== 'none' && borders.top.width > 0
        ? `${borders.top.width}px ${borders.top.style} ${borders.top.color}`
        : '1px dashed #cbd5e1',
    borderRight:
      borders.right && borders.right.style !== 'none' && borders.right.width > 0
        ? `${borders.right.width}px ${borders.right.style} ${borders.right.color}`
        : '1px dashed #cbd5e1',
    borderBottom:
      borders.bottom && borders.bottom.style !== 'none' && borders.bottom.width > 0
        ? `${borders.bottom.width}px ${borders.bottom.style} ${borders.bottom.color}`
        : '1px dashed #cbd5e1',
    borderLeft:
      borders.left && borders.left.style !== 'none' && borders.left.width > 0
        ? `${borders.left.width}px ${borders.left.style} ${borders.left.color}`
        : '1px dashed #cbd5e1',
  };

  return (
    <div
      data-testid="border-controls"
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
      {/* Header with Title and Quick Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>🔲 {label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            data-testid="border-apply-all-button"
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
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
            }}
          >
            चारों तरफ
          </button>
          <span style={{ color: '#cbd5e1', fontSize: '10px' }}>|</span>
          <button
            type="button"
            data-testid="border-reset-button"
            onClick={handleResetBorders}
            style={{
              fontSize: '10.5px',
              color: '#ef4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
            }}
          >
            रीसेट ✕
          </button>
        </div>
      </div>

      {/* Visual Live Border Preview Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          padding: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <span
          style={{
            fontSize: '9.5px',
            color: '#64748b',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          बॉर्डर पूर्वावलोकन (Live Preview)
        </span>
        <div
          data-testid="border-preview-box"
          style={{
            width: '100%',
            maxWidth: '220px',
            height: '42px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            transition: 'all 0.15s ease',
            ...previewBorderStyles,
          }}
        >
          <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
            {borders.top?.width ||
            borders.right?.width ||
            borders.bottom?.width ||
            borders.left?.width
              ? 'बॉर्डर सक्रिय (Active)'
              : 'कोई बॉर्डर नहीं (No border)'}
          </span>
        </div>
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
              ? Boolean(
                  (borders.top?.width && borders.top?.style !== 'none') ||
                  (borders.bottom?.width && borders.bottom?.style !== 'none')
                )
              : Boolean(borders[tab.key]?.width && borders[tab.key]?.style !== 'none');

          return (
            <button
              key={tab.key}
              type="button"
              data-testid={`border-side-${tab.key}`}
              onClick={() => setActiveSide(tab.key)}
              style={{
                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                color: isSelected ? '#b91c1c' : '#475569',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 2px',
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

      {/* Thickness / Width Stepper and Range Slider */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
            मोटाई (Width): {currentConfig.width}px
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              data-testid="border-width-minus"
              onClick={() => {
                const nextW = Math.max(0, currentConfig.width - 1);
                const style =
                  nextW === 0
                    ? 'none'
                    : currentConfig.style === 'none'
                      ? 'solid'
                      : currentConfig.style;
                if (activeSide === 'all') handleApplyToAll({ width: nextW, style });
                else handleUpdateSide(activeSide, { width: nextW, style });
              }}
              style={{
                width: '26px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12px',
                color: '#334155',
              }}
            >
              −
            </button>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0f172a',
                minWidth: '24px',
                textAlign: 'center',
              }}
            >
              {currentConfig.width}px
            </span>
            <button
              type="button"
              data-testid="border-width-plus"
              onClick={() => {
                const nextW = Math.min(12, currentConfig.width + 1);
                const style = currentConfig.style === 'none' ? 'solid' : currentConfig.style;
                if (activeSide === 'all') handleApplyToAll({ width: nextW, style });
                else handleUpdateSide(activeSide, { width: nextW, style });
              }}
              style={{
                width: '26px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12px',
                color: '#334155',
              }}
            >
              +
            </button>
          </div>
        </div>
        <input
          type="range"
          data-testid="border-width-input"
          min={0}
          max={10}
          step={1}
          value={currentConfig.width}
          onChange={(e) => {
            const width = parseInt(e.target.value, 10);
            const style =
              width > 0 && currentConfig.style === 'none' ? 'solid' : currentConfig.style;
            if (activeSide === 'all') {
              handleApplyToAll({ width, style });
            } else {
              handleUpdateSide(activeSide, { width, style });
            }
          }}
          style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
        />
      </div>

      {/* Style Dropdown */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '4px',
          }}
        >
          बॉर्डर प्रकार (Style)
        </label>
        <select
          data-testid="border-style-select"
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
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '4px',
          }}
        >
          रंग (Color)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              data-testid={`border-color-preset-${c.value.replace('#', '')}`}
              onClick={() => {
                const width = currentConfig.width === 0 ? 1 : currentConfig.width;
                const style = currentConfig.style === 'none' ? 'solid' : currentConfig.style;
                if (activeSide === 'all') {
                  handleApplyToAll({ color: c.value, width, style });
                } else {
                  handleUpdateSide(activeSide, { color: c.value, width, style });
                }
              }}
              style={{
                width: '24px',
                height: '24px',
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
            data-testid="border-color-input"
            value={currentConfig.color}
            onChange={(e) => {
              const width = currentConfig.width === 0 ? 1 : currentConfig.width;
              const style = currentConfig.style === 'none' ? 'solid' : currentConfig.style;
              if (activeSide === 'all') {
                handleApplyToAll({ color: e.target.value, width, style });
              } else {
                handleUpdateSide(activeSide, { color: e.target.value, width, style });
              }
            }}
            style={{
              width: '28px',
              height: '26px',
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
