import React, { useRef, useState, useEffect } from 'react';

export interface MobileAccentColor {
  id: string;
  value: string;
  label: string;
}

export const MOBILE_THEME_COLORS: MobileAccentColor[] = [
  { id: 'crimson', value: '#b91c1c', label: 'लीड रेड (Lead Red)' },
  { id: 'red', value: '#dc2626', label: 'चमकीला लाल (Bright Red)' },
  { id: 'maroon', value: '#7f1d1d', label: 'डीप मैरून (Deep Maroon)' },
  { id: 'navy', value: '#1e3a8a', label: 'रॉयल ब्लू (Royal Blue)' },
  { id: 'blue', value: '#2563eb', label: 'प्रेस ब्लू (Press Blue)' },
  { id: 'saffron', value: '#ea580c', label: 'केसरिया (Saffron Orange)' },
  { id: 'gold', value: '#b45309', label: 'अंबर गोल्ड (Amber Gold)' },
  { id: 'yellow', value: '#f59e0b', label: 'सुनहरा पीला (Golden Yellow)' },
  { id: 'green', value: '#15803d', label: 'फॉरेस्ट ग्रीन (Forest Green)' },
  { id: 'teal', value: '#0f766e', label: 'गहरा टील (Deep Teal)' },
  { id: 'purple', value: '#7e22ce', label: 'रॉयल पर्पल (Royal Purple)' },
  { id: 'slate', value: '#334155', label: 'क्लासिक स्लेट (Slate)' },
  { id: 'black', value: '#111111', label: 'ब्लैक इंक (Black Ink)' },
  { id: 'white', value: '#ffffff', label: 'सफ़ेद (Pure White)' },
];

export interface ColorStripProps {
  selectedColor?: string;
  onSelectColor: (color: string) => void;
  label?: string;
  allowTransparent?: boolean;
}

export const ColorStrip: React.FC<ColorStripProps> = ({
  selectedColor,
  onSelectColor,
  label = 'थीम एक्सेंट रंग (Accent Color)',
  allowTransparent = true,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [hexInput, setHexInput] = useState<string>(selectedColor || '');

  useEffect(() => {
    setHexInput(selectedColor || '');
  }, [selectedColor]);

  const isTransparent =
    !selectedColor || selectedColor.toLowerCase() === 'transparent' || selectedColor === 'none';

  // Check if current selected color matches any preset
  const matchingPreset = MOBILE_THEME_COLORS.find(
    (col) => col.value.toLowerCase() === selectedColor?.toLowerCase()
  );
  const isCustomColor = !isTransparent && !matchingPreset && Boolean(selectedColor);

  // Compute a valid 6-digit hex for the native color picker
  const validPickerHex = (() => {
    if (!selectedColor || isTransparent) return '#dc2626';
    if (/^#[0-9a-fA-F]{6}$/i.test(selectedColor)) return selectedColor;
    if (/^#[0-9a-fA-F]{3}$/i.test(selectedColor)) {
      const r = selectedColor[1];
      const g = selectedColor[2];
      const b = selectedColor[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#dc2626';
  })();

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    const trimmed = val.trim();
    if (trimmed.toLowerCase() === 'transparent') {
      onSelectColor('transparent');
    } else if (/^#[0-9a-fA-F]{6}$/i.test(trimmed)) {
      onSelectColor(trimmed);
    } else if (/^#[0-9a-fA-F]{3}$/i.test(trimmed)) {
      onSelectColor(trimmed);
    }
  };

  const handleHexInputBlur = () => {
    const trimmed = hexInput.trim();
    if (/^#[0-9a-fA-F]{6}$/i.test(trimmed) || /^#[0-9a-fA-F]{3}$/i.test(trimmed)) {
      onSelectColor(trimmed);
    } else if (trimmed.toLowerCase() === 'transparent' || trimmed === '') {
      onSelectColor(allowTransparent ? 'transparent' : '#111111');
    } else {
      // Revert to current selected color
      setHexInput(selectedColor || '');
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setHexInput(newColor);
    onSelectColor(newColor);
  };

  const openNativePicker = () => {
    colorInputRef.current?.click();
  };

  return (
    <div
      data-testid="color-strip-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '6px 0',
      }}
    >
      {/* ── Label Row with Interactive Hex & Picker Trigger ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{label}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Quick Color Preview dot (click to open picker) */}
          <button
            type="button"
            onClick={openNativePicker}
            title="कस्टम रंग चुनें (Click to open custom color picker)"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: isTransparent ? '#ffffff' : (selectedColor || '#111111'),
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              backgroundImage: isTransparent
                ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                : undefined,
              backgroundSize: '6px 6px',
            }}
          >
            {isTransparent && (
              <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1 }}>⊘</span>
            )}
          </button>

          {/* Hex Input */}
          <input
            type="text"
            data-testid="color-strip-hex-input"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            placeholder="#HEX / ⊘"
            title="Hex रंग कोड लिखें या पेस्ट करें (उदा. #E63946 या transparent)"
            style={{
              width: '80px',
              padding: '2px 5px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              outline: 'none',
              textAlign: 'center',
              textTransform: 'uppercase',
              boxSizing: 'border-box',
            }}
          />

          {/* Hidden native color picker */}
          <input
            ref={colorInputRef}
            type="color"
            data-testid="color-strip-native-picker"
            value={validPickerHex}
            onChange={handleNativePickerChange}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 0,
              height: 0,
            }}
          />
        </div>
      </div>

      {/* ── Swatch Strip: Presets + Custom Color + Rainbow Picker Button ── */}
      <div
        data-testid="mobile-color-strip"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 2px',
          scrollbarWidth: 'thin',
        }}
      >
        {/* ── 1. RAINBOW CUSTOM COLOR BUTTON (Pick Any Color) ── */}
        <button
          type="button"
          data-testid="btn-pick-custom-color"
          onClick={openNativePicker}
          title="🎨 कस्टम रंग चुनें (Pick Any Color - Spectrum / Hex / RGB)"
          aria-label="कस्टम रंग चुनें"
          style={{
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
            border: isCustomColor ? '3px solid #0284c7' : '2px solid #ffffff',
            boxShadow: isCustomColor
              ? '0 0 0 2px #0284c7, 0 2px 5px rgba(0,0,0,0.25)'
              : '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            position: 'relative',
            transition: 'transform 0.15s ease',
            transform: isCustomColor ? 'scale(1.08)' : 'scale(1)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: isCustomColor ? (selectedColor || '#ffffff') : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>🎨</span>
          </div>
        </button>

        {/* ── 2. ACTIVE CUSTOM COLOR SWATCH (if custom color selected) ── */}
        {isCustomColor && (
          <button
            type="button"
            data-testid="color-swatch-custom-active"
            onClick={() => onSelectColor(selectedColor || '#ffffff')}
            title={`कस्टम चुना गया रंग: ${selectedColor}`}
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '50%',
              backgroundColor: selectedColor || '#ffffff',
              border: '3px solid #0284c7',
              boxShadow: '0 0 0 2px #0284c7, 0 2px 4px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transform: 'scale(1.08)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                lineHeight: 1,
              }}
            >
              ✓
            </span>
          </button>
        )}

        {/* ── 3. TRANSPARENT SWATCH (if allowed) ── */}
        {allowTransparent && (
          <button
            type="button"
            data-testid="color-swatch-transparent"
            onClick={() => onSelectColor('transparent')}
            title="पारदर्शी पृष्ठभूमि (Transparent)"
            aria-label="पारदर्शी पृष्ठभूमि"
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: isTransparent ? '3px solid #0284c7' : '2px solid #cbd5e1',
              boxShadow: isTransparent
                ? '0 0 0 2px #0284c7, 0 2px 4px rgba(0,0,0,0.2)'
                : '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              backgroundImage:
                'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
              backgroundSize: '8px 8px',
              transform: isTransparent ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                color: isTransparent ? '#0284c7' : '#94a3b8',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              ⊘
            </span>
          </button>
        )}

        {/* ── 4. CURATED NEWSPAPER PRESET SWATCHES ── */}
        {MOBILE_THEME_COLORS.map((col) => {
          const isSelected =
            !isTransparent && selectedColor?.toLowerCase() === col.value.toLowerCase();
          const isWhite = col.value.toLowerCase() === '#ffffff';

          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onSelectColor(col.value)}
              title={col.label}
              aria-label={col.label}
              data-testid={`color-swatch-${col.id}`}
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                borderRadius: '50%',
                backgroundColor: col.value,
                border: isSelected
                  ? '3px solid #0284c7'
                  : isWhite
                    ? '2px solid #cbd5e1'
                    : '2px solid #ffffff',
                boxShadow: isSelected
                  ? '0 0 0 2px #0284c7, 0 2px 4px rgba(0,0,0,0.2)'
                  : '0 1px 3px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0,
                transition: 'transform 0.15s ease',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {isSelected && (
                <span
                  style={{
                    color: isWhite ? '#0f172a' : '#ffffff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: isWhite ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
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
