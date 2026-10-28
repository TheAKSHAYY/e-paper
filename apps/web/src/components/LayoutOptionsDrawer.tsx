import React from 'react';
import type {
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  SpacingDensity,
} from '@epaper-studio/document-schema';
import { PAGE_SIZE_DEFINITIONS } from '@epaper-studio/document-schema';
import { HindiFontPicker } from './HindiFontPicker';

export interface LayoutOptionsDrawerProps {
  masthead: MastheadConfig;
  layout: NewspaperLayoutConfig;
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  language: string;
  direction: 'ltr' | 'rtl';
  onUpdateMasthead: (updated: MastheadConfig) => void;
  onUpdateLayout: (updated: NewspaperLayoutConfig) => void;
  onUpdatePageSize: (size: PageSizePreset) => void;
  onUpdateOrientation: (orientation: PageOrientation) => void;
  onUpdateDirection: (direction: 'ltr' | 'rtl') => void;
}

export const LayoutOptionsDrawer: React.FC<LayoutOptionsDrawerProps> = ({
  masthead,
  layout,
  pageSize,
  orientation,
  direction,
  onUpdateMasthead,
  onUpdateLayout,
  onUpdatePageSize,
  onUpdateOrientation,
  onUpdateDirection,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* SECTION 1: Hindi Typography & Font Picker */}
      <section
        style={{
          backgroundColor: '#fff',
          border: '1px solid #dcd7cc',
          borderRadius: '8px',
          padding: '14px',
        }}
      >
        <h4
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontFamily: "'Noto Serif Devanagari', serif",
            fontWeight: 700,
            color: '#111',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>✍️</span>
          <span>देवनागरी फॉन्ट व टाइपोग्राफी (Typography)</span>
        </h4>

        <HindiFontPicker
          currentMastheadFont={layout.mastheadFont}
          currentHeadlineFont={layout.headlineFont}
          currentSubheadlineFont={layout.subheadlineFont}
          currentBodyFont={layout.bodyFont}
          currentHeadlineWeight={layout.headlineWeight}
          onUpdateFonts={(updatedFonts) => {
            onUpdateLayout({
              ...layout,
              ...updatedFonts,
            });
          }}
        />

        {/* Font Size Tuner */}
        <div style={{ marginTop: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="body-font-size"
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '4px',
              }}
            >
              समाचार पाठ का आकार: {layout.bodyFontSizePt} pt
            </label>
            <input
              id="body-font-size"
              type="range"
              min={8}
              max={15}
              step={0.5}
              value={layout.bodyFontSizePt}
              onChange={(e) =>
                onUpdateLayout({ ...layout, bodyFontSizePt: parseFloat(e.target.value) })
              }
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Grid, Columns & Page Geometry */}
      <section
        style={{
          backgroundColor: '#fff',
          border: '1px solid #dcd7cc',
          borderRadius: '8px',
          padding: '14px',
        }}
      >
        <h4
          style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontFamily: "'Noto Serif Devanagari', serif",
            fontWeight: 700,
            color: '#111',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📐</span>
          <span>ग्रिड, कॉलम व पृष्ठ प्रारूप (Layout & Grid)</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                htmlFor="layout-page-size"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                पेज का आकार (Page Size)
              </label>
              <select
                id="layout-page-size"
                value={pageSize}
                onChange={(e) => onUpdatePageSize(e.target.value as PageSizePreset)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                {Object.entries(PAGE_SIZE_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="layout-orientation"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                दिशा (Orientation)
              </label>
              <select
                id="layout-orientation"
                value={orientation}
                onChange={(e) => onUpdateOrientation(e.target.value as PageOrientation)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="portrait">खड़ा (Portrait)</option>
                <option value="landscape">आड़ा (Landscape)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                htmlFor="layout-columns"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                कॉलम ग्रिड संख्या
              </label>
              <select
                id="layout-columns"
                value={layout.columnCount}
                onChange={(e) =>
                  onUpdateLayout({ ...layout, columnCount: parseInt(e.target.value, 10) })
                }
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value={2}>2 कॉलम (डाइजेस्ट)</option>
                <option value={3}>3 कॉलम (आधुनिक दैनिक)</option>
                <option value={4}>4 कॉलम (मानक समाचार पत्र)</option>
                <option value={5}>5 कॉलम (घना ब्रॉडशीट)</option>
                <option value={6}>6 कॉलम (पारंपरिक प्रेस)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="layout-density"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                अंतर सघनता (Density)
              </label>
              <select
                id="layout-density"
                value={layout.spacingDensity}
                onChange={(e) =>
                  onUpdateLayout({ ...layout, spacingDensity: e.target.value as SpacingDensity })
                }
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="compact">घनीभूत (Compact)</option>
                <option value="normal">सामान्य (Normal)</option>
                <option value="spacious">खुली (Spacious)</option>
              </select>
            </div>
          </div>

          {/* Column Rule & BiDi */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={layout.columnRule}
                onChange={(e) => onUpdateLayout({ ...layout, columnRule: e.target.checked })}
              />
              <span>कॉलम के बीच विभाजक रेखा दिखाएँ (Column Rules)</span>
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px dashed #e0ded8',
            }}
          >
            <div>
              <label
                htmlFor="layout-page-size"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                कागज़ का आकार (Paper Size)
              </label>
              <select
                id="layout-page-size"
                value={pageSize}
                onChange={(e) => onUpdatePageSize(e.target.value as PageSizePreset)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                {Object.entries(PAGE_SIZE_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="layout-orientation"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                दिशानिर्देश (Orientation)
              </label>
              <select
                id="layout-orientation"
                value={orientation}
                onChange={(e) => onUpdateOrientation(e.target.value as PageOrientation)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="portrait">खड़ा (Portrait)</option>
                <option value="landscape">आड़ा (Landscape)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '6px' }}>
            <label
              htmlFor="layout-direction"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '3px',
              }}
            >
              पाठ प्रवाह (Direction)
            </label>
            <select
              id="layout-direction"
              value={direction}
              onChange={(e) => onUpdateDirection(e.target.value as 'ltr' | 'rtl')}
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            >
              <option value="ltr">बाएँ से दाएँ (Left to Right — हिन्दी / English)</option>
              <option value="rtl">दाएँ से बाएँ (Right to Left — اردو Urdu / Arabic)</option>
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 3: Masthead & Edition Details */}
      <section
        style={{
          backgroundColor: '#fff',
          border: '1px solid #dcd7cc',
          borderRadius: '8px',
          padding: '14px',
        }}
      >
        <h4
          style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontFamily: "'Noto Serif Devanagari', serif",
            fontWeight: 700,
            color: '#111',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📰</span>
          <span>अख़बार का शीर्ष व विवरण (Masthead & Folio)</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label
              htmlFor="masthead-pub-title"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '3px',
              }}
            >
              अख़बार का नाम (Title)
            </label>
            <input
              id="masthead-pub-title"
              type="text"
              value={masthead.title}
              onChange={(e) => onUpdateMasthead({ ...masthead, title: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '14px',
                fontFamily: "'Noto Serif Devanagari', serif",
                fontWeight: 700,
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="masthead-pub-sub"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '3px',
              }}
            >
              उप-शीर्षक / ध्येय वाक्य (Subtitle)
            </label>
            <input
              id="masthead-pub-sub"
              type="text"
              value={masthead.subtitle || ''}
              onChange={(e) => onUpdateMasthead({ ...masthead, subtitle: e.target.value })}
              placeholder="सत्य, निष्पक्षता और जनसेवा का प्रतीक..."
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label
                htmlFor="masthead-edition"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                संस्करण (Edition)
              </label>
              <input
                id="masthead-edition"
                type="text"
                value={masthead.edition || ''}
                onChange={(e) => onUpdateMasthead({ ...masthead, edition: e.target.value })}
                placeholder="प्रातःकालीन मुख्य संस्करण"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="masthead-issue"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                अंक व वर्ष (Issue Number)
              </label>
              <input
                id="masthead-issue"
                type="text"
                value={masthead.issueNumber || ''}
                onChange={(e) => onUpdateMasthead({ ...masthead, issueNumber: e.target.value })}
                placeholder="वर्ष 78 • अंक 142"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label
                htmlFor="masthead-date"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                दिनांक (Date)
              </label>
              <input
                id="masthead-date"
                type="text"
                value={masthead.date}
                onChange={(e) => onUpdateMasthead({ ...masthead, date: e.target.value })}
                placeholder="मंगलवार, 27 अक्टूबर 2026"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="masthead-price"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '3px',
                }}
              >
                मूल्य (Price)
              </label>
              <input
                id="masthead-price"
                type="text"
                value={masthead.price || ''}
                onChange={(e) => onUpdateMasthead({ ...masthead, price: e.target.value })}
                placeholder="मूल्य: ₹5.00"
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="masthead-weather"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '3px',
              }}
            >
              मौसम / सुविचार (Weather / Thought)
            </label>
            <input
              id="masthead-weather"
              type="text"
              value={masthead.weatherNotice || ''}
              onChange={(e) => onUpdateMasthead({ ...masthead, weatherNotice: e.target.value })}
              placeholder="मौसम: सुहावना, 25° से. • वायु गुणवत्ता: मध्यम"
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
