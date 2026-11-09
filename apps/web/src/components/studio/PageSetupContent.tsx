import React, { useState } from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import {
  type PageSizePreset,
  type PageOrientation,
  type PageDimensions,
  type PageMargins,
  PAGE_SIZE_DEFINITIONS,
  getPageDimensions,
} from '@epaper-studio/document-schema';
import { useI18n } from '../../i18n';

export type DimensionUnit = 'mm' | 'cm' | 'in' | 'pt';

export interface PageSetupState {
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  customWidthPt: number;
  customHeightPt: number;
  unit: DimensionUnit;
  margins: PageMargins;
  isUniformMargins: boolean;
}

export interface PageSetupContentProps {
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
  onClose?: () => void;
  isMobile?: boolean;
}

// Unit conversion helpers
export function ptToUnit(pt: number, unit: DimensionUnit): number {
  switch (unit) {
    case 'mm':
      return Number(((pt * 25.4) / 72).toFixed(1));
    case 'cm':
      return Number(((pt * 2.54) / 72).toFixed(2));
    case 'in':
      return Number((pt / 72).toFixed(2));
    case 'pt':
    default:
      return Math.round(pt);
  }
}

export function unitToPt(val: number, unit: DimensionUnit): number {
  switch (unit) {
    case 'mm':
      return (val * 72) / 25.4;
    case 'cm':
      return (val * 72) / 2.54;
    case 'in':
      return val * 72;
    case 'pt':
    default:
      return val;
  }
}

export const PageSetupContent: React.FC<PageSetupContentProps> = ({
  initialPageSize,
  initialOrientation,
  initialDimensions,
  initialMargins,
  onApply,
  onClose,
  isMobile = false,
}) => {
  const { locale } = useI18n();

  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'margins'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<PageSizePreset>(initialPageSize);
  const [orientation, setOrientation] = useState<PageOrientation>(initialOrientation);
  const [unit, setUnit] = useState<DimensionUnit>('mm');

  // Custom dimensions in Points
  const defaultDims = getPageDimensions(initialPageSize, initialOrientation, initialDimensions);
  const [customWidthPt, setCustomWidthPt] = useState<number>(
    initialDimensions?.widthPt ?? defaultDims.widthPt
  );
  const [customHeightPt, setCustomHeightPt] = useState<number>(
    initialDimensions?.heightPt ?? defaultDims.heightPt
  );

  // Form input strings for custom dimensions
  const [widthInput, setWidthInput] = useState<string>(
    ptToUnit(initialDimensions?.widthPt ?? defaultDims.widthPt, 'mm').toString()
  );
  const [heightInput, setHeightInput] = useState<string>(
    ptToUnit(initialDimensions?.heightPt ?? defaultDims.heightPt, 'mm').toString()
  );

  // Margins in mm
  const [margins, setMargins] = useState<PageMargins>(
    initialMargins ?? {
      topMm: 8.5,
      bottomMm: 8.5,
      leftMm: 8.5,
      rightMm: 8.5,
      unit: 'mm',
    }
  );
  const [isUniformMargins, setIsUniformMargins] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize unit changes
  const handleUnitChange = (newUnit: DimensionUnit) => {
    setUnit(newUnit);
    setWidthInput(ptToUnit(customWidthPt, newUnit).toString());
    setHeightInput(ptToUnit(customHeightPt, newUnit).toString());
  };

  // Preset Selection
  const handleSelectPreset = (presetKey: PageSizePreset) => {
    setSelectedPreset(presetKey);
    setErrorMsg(null);
    if (presetKey !== 'custom') {
      const def = PAGE_SIZE_DEFINITIONS[presetKey];
      const isLand = orientation === 'landscape';
      const wPt = isLand ? def.heightPt : def.widthPt;
      const hPt = isLand ? def.widthPt : def.heightPt;
      setCustomWidthPt(wPt);
      setCustomHeightPt(hPt);
      setWidthInput(ptToUnit(wPt, unit).toString());
      setHeightInput(ptToUnit(hPt, unit).toString());
    }
  };

  // Orientation Toggle
  const handleToggleOrientation = (newOrientation: PageOrientation) => {
    if (orientation === newOrientation) return;
    setOrientation(newOrientation);

    // Swap custom width and height
    const swappedW = customHeightPt;
    const swappedH = customWidthPt;
    setCustomWidthPt(swappedW);
    setCustomHeightPt(swappedH);
    setWidthInput(ptToUnit(swappedW, unit).toString());
    setHeightInput(ptToUnit(swappedH, unit).toString());
  };

  // Apply Changes
  const handleApplyChanges = () => {
    let finalWidthPt = customWidthPt;
    let finalHeightPt = customHeightPt;

    if (selectedPreset === 'custom') {
      const numW = parseFloat(widthInput);
      const numH = parseFloat(heightInput);
      if (isNaN(numW) || numW <= 0 || isNaN(numH) || numH <= 0) {
        setErrorMsg(
          locale === 'hi'
            ? 'कृपया वैध सकारात्मक चौड़ाई और ऊंचाई दर्ज करें।'
            : 'Please enter valid positive dimensions.'
        );
        return;
      }

      const calculatedWPt = unitToPt(numW, unit);
      const calculatedHPt = unitToPt(numH, unit);

      // Boundaries: min 50mm, max 2000mm
      const minPt = (50 * 72) / 25.4;
      const maxPt = (2000 * 72) / 25.4;

      if (
        calculatedWPt < minPt ||
        calculatedWPt > maxPt ||
        calculatedHPt < minPt ||
        calculatedHPt > maxPt
      ) {
        setErrorMsg(
          locale === 'hi'
            ? 'आयाम 50 मिमी और 2000 मिमी के बीच होने चाहिए।'
            : 'Dimensions must be between 50mm and 2000mm.'
        );
        return;
      }

      finalWidthPt = calculatedWPt;
      finalHeightPt = calculatedHPt;
    }

    const calculatedDimensions: PageDimensions = getPageDimensions(selectedPreset, orientation, {
      widthPt: finalWidthPt,
      heightPt: finalHeightPt,
      dpi: 300,
      grayscaleLevels: 16,
    });

    onApply({
      pageSize: selectedPreset,
      orientation,
      dimensions: calculatedDimensions,
      margins,
    });

    if (onClose) {
      onClose();
    }
  };

  // Compute live visual aspect ratio for preview box
  const previewRatio = Math.max(0.2, Math.min(5, customWidthPt / (customHeightPt || 1)));
  const previewMaxH = 90;
  const previewBoxH = previewRatio > 1 ? previewMaxH / previewRatio : previewMaxH;
  const previewBoxW = previewRatio > 1 ? previewMaxH : previewMaxH * previewRatio;

  return (
    <div
      data-testid="page-setup-content"
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
          {locale === 'hi' ? 'मानक आकार' : 'Standard Sizes'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'custom' ? 700 : 500,
            backgroundColor: activeTab === 'custom' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'custom' ? '#1C1917' : '#78716C',
            cursor: 'pointer',
            boxShadow: activeTab === 'custom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {locale === 'hi' ? 'कस्टम माप' : 'Custom Dimensions'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('margins')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'margins' ? 700 : 500,
            backgroundColor: activeTab === 'margins' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'margins' ? '#1C1917' : '#78716C',
            cursor: 'pointer',
            boxShadow: activeTab === 'margins' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {locale === 'hi' ? 'हाशिया व मार्जिन' : 'Margins'}
        </button>
      </div>

      {/* ── Live Aspect Ratio & Physical Summary Card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#FAF8F5',
          border: '1px solid #E7E2DA',
          borderRadius: '10px',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>
              {selectedPreset === 'custom'
                ? locale === 'hi'
                  ? 'कस्टम आकार'
                  : 'Custom Dimensions'
                : PAGE_SIZE_DEFINITIONS[selectedPreset]?.name}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: orientation === 'portrait' ? '#EDE8E1' : '#DC2626',
                color: orientation === 'portrait' ? '#44403C' : '#FFFFFF',
                textTransform: 'uppercase',
              }}
            >
              {orientation === 'portrait'
                ? locale === 'hi'
                  ? 'लंबवत'
                  : 'Portrait'
                : locale === 'hi'
                  ? 'क्षैतिज'
                  : 'Landscape'}
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#78716C', fontFamily: 'monospace' }}>
            {ptToUnit(customWidthPt, 'mm')} × {ptToUnit(customHeightPt, 'mm')} mm •{' '}
            {ptToUnit(customWidthPt, 'in')}″ × {ptToUnit(customHeightPt, 'in')}″ (Ratio:{' '}
            {previewRatio.toFixed(2)})
          </span>
        </div>

        {/* Live Miniature Sheet Graphic */}
        <div
          style={{
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#EDE8E1',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: `${Math.round(Math.min(48, Math.max(16, previewBoxW * 0.45)))}px`,
              height: `${Math.round(Math.min(48, Math.max(16, previewBoxH * 0.45)))}px`,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #1C1917',
              boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
              borderRadius: '2px',
              transition: 'all 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* ── Orientation Selector ── */}
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
          {locale === 'hi' ? 'पृष्ठ दिशा (Orientation)' : 'Orientation'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            data-testid="btn-orientation-portrait"
            onClick={() => handleToggleOrientation('portrait')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: orientation === 'portrait' ? `2px solid #1C1917` : '1px solid #E7E2DA',
              backgroundColor: orientation === 'portrait' ? '#FFFFFF' : '#FAF8F5',
              fontWeight: orientation === 'portrait' ? 700 : 500,
              color: '#1C1917',
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '15px' }}>▯</span>
            <span style={{ fontSize: '12px' }}>
              {locale === 'hi' ? 'लंबवत (Portrait)' : 'Portrait'}
            </span>
          </button>
          <button
            type="button"
            data-testid="btn-orientation-landscape"
            onClick={() => handleToggleOrientation('landscape')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: orientation === 'landscape' ? `2px solid #1C1917` : '1px solid #E7E2DA',
              backgroundColor: orientation === 'landscape' ? '#FFFFFF' : '#FAF8F5',
              fontWeight: orientation === 'landscape' ? 700 : 500,
              color: '#1C1917',
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '15px' }}>▭</span>
            <span style={{ fontSize: '12px' }}>
              {locale === 'hi' ? 'क्षैतिज (Landscape)' : 'Landscape'}
            </span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: STANDARD PRESETS ── */}
      {activeTab === 'presets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#78716C',
            }}
          >
            {locale === 'hi' ? 'अख़बार व प्रिंट मानक आकार' : 'Newspaper & Standard Formats'}
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '8px',
              maxHeight: isMobile ? '280px' : '360px',
              overflowY: 'auto',
              paddingRight: '2px',
            }}
          >
            {(Object.keys(PAGE_SIZE_DEFINITIONS) as PageSizePreset[]).map((key) => {
              const def = PAGE_SIZE_DEFINITIONS[key];
              const isSelected = selectedPreset === key;
              return (
                <div
                  key={key}
                  data-testid={`preset-card-${key}`}
                  onClick={() => handleSelectPreset(key)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #1C1917' : '1px solid #E7E2DA',
                    backgroundColor: isSelected ? '#FFFFFF' : '#FAF8F5',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1C1917' }}>
                      {def.name}
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
                  <span style={{ fontSize: '11px', color: '#78716C', fontFamily: 'monospace' }}>
                    {def.widthMm} × {def.heightMm} mm ({def.aspectRatio})
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      color: '#57534E',
                      lineHeight: 1.4,
                    }}
                  >
                    {def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: CUSTOM DIMENSIONS ── */}
      {activeTab === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Unit Selector */}
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
              {locale === 'hi' ? 'माप इकाई (Measurement Unit)' : 'Measurement Unit'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {(['mm', 'cm', 'in', 'pt'] as DimensionUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitChange(u)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: unit === u ? '2px solid #1C1917' : '1px solid #E7E2DA',
                    backgroundColor: unit === u ? '#FFFFFF' : '#FAF8F5',
                    fontSize: '12px',
                    fontWeight: unit === u ? 700 : 500,
                    color: '#1C1917',
                    cursor: 'pointer',
                    minHeight: '40px',
                    textTransform: 'uppercase',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Width & Height Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#44403C',
                  marginBottom: '4px',
                }}
              >
                {locale === 'hi' ? `चौड़ाई (${unit})` : `Width (${unit})`}
              </label>
              <input
                type="number"
                data-testid="input-custom-width"
                value={widthInput}
                step={unit === 'in' || unit === 'cm' ? '0.1' : '1'}
                min="1"
                onChange={(e) => {
                  setWidthInput(e.target.value);
                  setSelectedPreset('custom');
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setCustomWidthPt(unitToPt(val, unit));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D0C5',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#44403C',
                  marginBottom: '4px',
                }}
              >
                {locale === 'hi' ? `ऊंचाई (${unit})` : `Height (${unit})`}
              </label>
              <input
                type="number"
                data-testid="input-custom-height"
                value={heightInput}
                step={unit === 'in' || unit === 'cm' ? '0.1' : '1'}
                min="1"
                onChange={(e) => {
                  setHeightInput(e.target.value);
                  setSelectedPreset('custom');
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setCustomHeightPt(unitToPt(val, unit));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D0C5',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Quick Presets Shortcut */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#78716C', alignSelf: 'center' }}>
              {locale === 'hi' ? 'त्वरित मानक:' : 'Quick copy:'}
            </span>
            {(['broadsheet', 'tabloid', 'berliner', 'a4'] as PageSizePreset[]).map((pKey) => (
              <button
                key={pKey}
                type="button"
                onClick={() => handleSelectPreset(pKey)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #E7E2DA',
                  backgroundColor: '#FAF8F5',
                  fontSize: '11px',
                  color: '#57534E',
                  cursor: 'pointer',
                }}
              >
                {PAGE_SIZE_DEFINITIONS[pKey].name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: MARGINS & SPACING ── */}
      {activeTab === 'margins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
              {locale === 'hi' ? 'कागज़ हाशिया (Margins)' : 'Page Margins (mm)'}
            </label>
            <button
              type="button"
              onClick={() => setIsUniformMargins(!isUniformMargins)}
              style={{
                fontSize: '11px',
                color: isUniformMargins ? '#DC2626' : '#57534E',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isUniformMargins
                ? locale === 'hi'
                  ? 'अलग-अलग सेट करें'
                  : 'Set Individual'
                : locale === 'hi'
                  ? 'एकसमान मार्जिन'
                  : 'Link Uniform'}
            </button>
          </div>

          {isUniformMargins ? (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#44403C',
                  marginBottom: '4px',
                }}
              >
                {locale === 'hi' ? 'सभी तरफ एकसमान (मिमी)' : 'Uniform Margin (mm)'}
              </label>
              <input
                type="number"
                data-testid="input-uniform-margin"
                value={margins.topMm}
                min="0"
                max="50"
                step="0.5"
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setMargins({
                    topMm: val,
                    bottomMm: val,
                    leftMm: val,
                    rightMm: val,
                    unit: 'mm',
                  });
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D6D0C5',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    color: '#57534E',
                    marginBottom: '3px',
                  }}
                >
                  {locale === 'hi' ? 'ऊपर (Top)' : 'Top Margin'}
                </label>
                <input
                  type="number"
                  value={margins.topMm}
                  min="0"
                  max="50"
                  step="0.5"
                  onChange={(e) =>
                    setMargins({ ...margins, topMm: parseFloat(e.target.value) || 0 })
                  }
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D6D0C5',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    color: '#57534E',
                    marginBottom: '3px',
                  }}
                >
                  {locale === 'hi' ? 'नीचे (Bottom)' : 'Bottom Margin'}
                </label>
                <input
                  type="number"
                  value={margins.bottomMm}
                  min="0"
                  max="50"
                  step="0.5"
                  onChange={(e) =>
                    setMargins({ ...margins, bottomMm: parseFloat(e.target.value) || 0 })
                  }
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D6D0C5',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    color: '#57534E',
                    marginBottom: '3px',
                  }}
                >
                  {locale === 'hi' ? 'बायाँ (Left)' : 'Left Margin'}
                </label>
                <input
                  type="number"
                  value={margins.leftMm}
                  min="0"
                  max="50"
                  step="0.5"
                  onChange={(e) =>
                    setMargins({ ...margins, leftMm: parseFloat(e.target.value) || 0 })
                  }
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D6D0C5',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10.5px',
                    color: '#57534E',
                    marginBottom: '3px',
                  }}
                >
                  {locale === 'hi' ? 'दायाँ (Right)' : 'Right Margin'}
                </label>
                <input
                  type="number"
                  value={margins.rightMm}
                  min="0"
                  max="50"
                  step="0.5"
                  onChange={(e) =>
                    setMargins({ ...margins, rightMm: parseFloat(e.target.value) || 0 })
                  }
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D6D0C5',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick margin presets */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#78716C' }}>
              {locale === 'hi' ? 'मानक:' : 'Presets:'}
            </span>
            <button
              type="button"
              onClick={() =>
                setMargins({ topMm: 6, bottomMm: 6, leftMm: 6, rightMm: 6, unit: 'mm' })
              }
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E7E2DA',
                backgroundColor: '#FAF8F5',
                fontSize: '11px',
                color: '#57534E',
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'सघन (6mm)' : 'Compact (6mm)'}
            </button>
            <button
              type="button"
              onClick={() =>
                setMargins({ topMm: 8.5, bottomMm: 8.5, leftMm: 8.5, rightMm: 8.5, unit: 'mm' })
              }
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E7E2DA',
                backgroundColor: '#FAF8F5',
                fontSize: '11px',
                color: '#57534E',
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'सामान्य (8.5mm)' : 'Standard (8.5mm)'}
            </button>
            <button
              type="button"
              onClick={() =>
                setMargins({ topMm: 12, bottomMm: 12, leftMm: 12, rightMm: 12, unit: 'mm' })
              }
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E7E2DA',
                backgroundColor: '#FAF8F5',
                fontSize: '11px',
                color: '#57534E',
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'विशाल (12mm)' : 'Spacious (12mm)'}
            </button>
          </div>
        </div>
      )}

      {/* ── Error Notification ── */}
      {errorMsg && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* ── Actions Footer ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #E7E2DA',
        }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
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
          data-testid="btn-apply-page-setup"
          onClick={handleApplyChanges}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1C1917',
            color: '#FAF8F5',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: '44px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            transition: 'background-color 0.15s ease',
          }}
        >
          {locale === 'hi' ? 'आकार लागू करें ✓' : 'Apply Configuration ✓'}
        </button>
      </div>
    </div>
  );
};
