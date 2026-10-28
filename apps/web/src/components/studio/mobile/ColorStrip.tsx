import React from 'react';

export interface MobileAccentColor {
  id: string;
  value: string;
  label: string;
}

export const MOBILE_THEME_COLORS: MobileAccentColor[] = [
  { id: 'crimson', value: '#b91c1c', label: 'लीड रेड (Lead Red)' },
  { id: 'navy', value: '#1e3a8a', label: 'रॉयल ब्लू (Royal Blue)' },
  { id: 'gold', value: '#b45309', label: 'अंबर गोल्ड (Amber Gold)' },
  { id: 'green', value: '#15803d', label: 'फॉरेस्ट ग्रीन (Forest Green)' },
  { id: 'slate', value: '#334155', label: 'क्लासिक स्लेट (Slate)' },
  { id: 'black', value: '#111111', label: 'ब्लैक इंक (Black Ink)' },
  { id: 'maroon', value: '#7f1d1d', label: 'डीप मैरून (Deep Maroon)' },
];

export interface ColorStripProps {
  selectedColor?: string;
  onSelectColor: (color: string) => void;
  label?: string;
}

export const ColorStrip: React.FC<ColorStripProps> = ({
  selectedColor,
  onSelectColor,
  label = 'थीम एक्सेंट रंग (Accent Color)',
}) => {
  return (
    <div
      data-testid="color-strip-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px 0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{label}</span>
        {selectedColor && (
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
            {selectedColor}
          </span>
        )}
      </div>

      <div
        data-testid="mobile-color-strip"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '2px 0',
          scrollbarWidth: 'none',
        }}
      >
        {MOBILE_THEME_COLORS.map((col) => {
          const isSelected = selectedColor?.toLowerCase() === col.value.toLowerCase();
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onSelectColor(col.value)}
              title={col.label}
              aria-label={col.label}
              data-testid={`color-swatch-${col.id}`}
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '50%',
                backgroundColor: col.value,
                border: isSelected ? '3px solid #0284c7' : '2px solid #ffffff',
                boxShadow: isSelected
                  ? '0 0 0 2px #0284c7, 0 2px 4px rgba(0,0,0,0.2)'
                  : '0 1px 3px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'transform 0.15s ease',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {isSelected && (
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
