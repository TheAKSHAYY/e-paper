import React, { useState } from 'react';
import type {
  MastheadConfig,
  MastheadRuleStyle,
  MastheadAlignment,
  MastheadEmblem,
  NewspaperPresetId,
} from '@epaper-studio/document-schema';
import { getNewspaperPreset } from '@epaper-studio/template-engine';
import { toEnglishDigits } from '../../utils/formatters';

export interface MastheadInspectorPanelProps {
  masthead: MastheadConfig;
  onUpdateMasthead: (updated: MastheadConfig) => void;
  presetId?: NewspaperPresetId;
  onClose?: () => void;
}

export const MastheadInspectorPanel: React.FC<MastheadInspectorPanelProps> = ({
  masthead,
  onUpdateMasthead,
  presetId = 'classic-hindi-broadsheet',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'title' | 'meta' | 'rules'>('title');

  const updateField = <K extends keyof MastheadConfig>(key: K, value: MastheadConfig[K]) => {
    // If string, sanitize digits to ensure strictly English numerals (0-9)
    let finalVal = value;
    if (typeof value === 'string') {
      finalVal = toEnglishDigits(value) as MastheadConfig[K];
    }
    onUpdateMasthead({
      ...masthead,
      [key]: finalVal,
    });
  };

  const handleResetToTemplate = () => {
    try {
      const preset = getNewspaperPreset(presetId);
      if (preset && preset.defaultMasthead) {
        onUpdateMasthead({
          ...preset.defaultMasthead,
        });
      }
    } catch (e) {
      console.warn('Could not reset masthead to preset', e);
    }
  };

  return (
    <div
      data-testid="masthead-inspector-panel"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🗞️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              मास्टहेड संपादक (Masthead)
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              पारंपरिक भारतीय समाचार पत्र शीर्ष सज्जा
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleResetToTemplate}
            title="वर्तमान प्रारूप के अनुसार डिफ़ॉल्ट मान पुनर्स्थापित करें"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>↺</span>
            <span>रीसेट</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          backgroundColor: '#f1f5f9',
          padding: '3px',
          borderRadius: '7px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('title')}
          style={{
            padding: '6px 4px',
            fontSize: '11px',
            fontWeight: activeTab === 'title' ? 700 : 500,
            color: activeTab === 'title' ? '#0f172a' : '#64748b',
            backgroundColor: activeTab === 'title' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'title' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          शीर्षक व फॉन्ट
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('meta')}
          style={{
            padding: '6px 4px',
            fontSize: '11px',
            fontWeight: activeTab === 'meta' ? 700 : 500,
            color: activeTab === 'meta' ? '#0f172a' : '#64748b',
            backgroundColor: activeTab === 'meta' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'meta' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          मौसम व विवरण
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          style={{
            padding: '6px 4px',
            fontSize: '11px',
            fontWeight: activeTab === 'rules' ? 700 : 500,
            color: activeTab === 'rules' ? '#0f172a' : '#64748b',
            backgroundColor: activeTab === 'rules' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'rules' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          बॉर्डर व दृश्यता
        </button>
      </div>

      {/* ==========================================================
       * TAB 1: TITLE, TYPOGRAPHY & ALIGNMENT
       * ========================================================== */}
      {activeTab === 'title' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Newspaper Name */}
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
              समाचार पत्र का नाम (Newspaper Name)
            </label>
            <input
              type="text"
              data-testid="input-masthead-title"
              value={masthead.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="उदा. जनवाणी समाचार"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: masthead.fontFamily || "'Rozha One', serif",
                outline: 'none',
              }}
            />
          </div>

          {/* Tagline / Subtitle */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                ध्येय वाक्य (Tagline / Motto)
              </label>
              <label
                style={{
                  fontSize: '10px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <input
                  type="checkbox"
                  checked={masthead.showTagline !== false}
                  onChange={(e) => updateField('showTagline', e.target.checked)}
                />
                दिखाएँ
              </label>
            </div>
            <input
              type="text"
              value={masthead.tagline ?? masthead.subtitle ?? ''}
              onChange={(e) => {
                updateField('tagline', e.target.value);
                updateField('subtitle', e.target.value);
              }}
              placeholder="उदा. सत्य, निष्पक्षता और जनसेवा का प्रतीक"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '11.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Establishment Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  स्थापना वर्ष (Est. Year)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showEstablishment !== false}
                    onChange={(e) => updateField('showEstablishment', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.establishmentYear ?? '1947'}
                onChange={(e) => updateField('establishmentYear', e.target.value)}
                placeholder="1947"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Edition Label */}
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  संस्करण (Edition)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showEdition !== false}
                    onChange={(e) => updateField('showEdition', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.edition ?? 'प्रातःकालीन मुख्य संस्करण'}
                onChange={(e) => updateField('edition', e.target.value)}
                placeholder="प्रातःकालीन मुख्य संस्करण"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Font Family & Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
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
                मास्टहेड फॉन्ट (Font Family)
              </label>
              <select
                value={masthead.fontFamily || "'Rozha One', serif"}
                onChange={(e) => updateField('fontFamily', e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                }}
              >
                <option value="'Rozha One', serif">रोज़ा वन (Rozha One - पारंपरिक)</option>
                <option value="'Yatra One', serif">यात्रा वन (Yatra One - बोल्ड स्लैब)</option>
                <option value="'Tiro Devanagari Hindi', serif">
                  टिरो देवनागरी (Tiro Devanagari)
                </option>
                <option value="'Noto Serif Devanagari', serif">नोतो सेरिफ़ (Noto Serif)</option>
                <option value="'Poppins', sans-serif">पॉपिन्स (Poppins - समकालीन)</option>
                <option value="'Mukta', sans-serif">मुक्ता (Mukta - आधुनिक)</option>
                <option value="'Playfair Display', serif">Playfair Display (क्लासिक)</option>
              </select>
            </div>

            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  आकार (Size): {masthead.fontSizePt || 52}pt
                </label>
              </div>
              <input
                type="range"
                min="36"
                max="72"
                step="1"
                value={masthead.fontSizePt || 52}
                onChange={(e) => updateField('fontSizePt', parseInt(e.target.value, 10))}
                style={{ width: '100%', marginTop: '6px' }}
              />
            </div>
          </div>

          {/* Alignment & Emblem */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                संरेखण (Alignment)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'left', label: 'बायाँ' },
                  { id: 'center', label: 'मध्य' },
                  { id: 'justified', label: 'समान' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField('alignment', item.id as MastheadAlignment)}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      fontSize: '11px',
                      fontWeight: (masthead.alignment || 'center') === item.id ? 700 : 500,
                      backgroundColor:
                        (masthead.alignment || 'center') === item.id ? '#0f172a' : '#f1f5f9',
                      color: (masthead.alignment || 'center') === item.id ? '#ffffff' : '#475569',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  प्रतीक चिन्ह (Emblem)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showEmblem === true}
                    onChange={(e) => updateField('showEmblem', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <select
                value={masthead.emblem || 'none'}
                onChange={(e) => updateField('emblem', e.target.value as MastheadEmblem)}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                  outline: 'none',
                }}
              >
                <option value="none">कोई नहीं (None)</option>
                <option value="ashoka-chakra">अशोक चक्र (Ashoka Chakra)</option>
                <option value="sun">सूर्य (Surya Sun)</option>
                <option value="quill">कलम (Quill / Pen)</option>
                <option value="lion-capital">सिंह शीर्ष (Lion Capital)</option>
                <option value="custom">कस्टम URL (Custom)</option>
              </select>
            </div>
          </div>

          {/* Custom Emblem URL if custom selected */}
          {masthead.emblem === 'custom' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '2px',
                }}
              >
                कस्टम प्रतीक URL (Custom Image URL)
              </label>
              <input
                type="text"
                value={masthead.customEmblemUrl ?? ''}
                onChange={(e) => updateField('customEmblemUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
       * TAB 2: WEATHER, AQI, PRICE & PUBLICATION METADATA
       * ========================================================== */}
      {activeTab === 'meta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Weather Section Header */}
          <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                🌤️ मौसम व तापमान (Weather Strip)
              </span>
              <label
                style={{
                  fontSize: '10px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <input
                  type="checkbox"
                  checked={masthead.showWeather !== false}
                  onChange={(e) => updateField('showWeather', e.target.checked)}
                />
                मौसम दिखाएँ
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  शहर (City)
                </label>
                <input
                  type="text"
                  value={masthead.weatherCity ?? 'नई दिल्ली'}
                  onChange={(e) => updateField('weatherCity', e.target.value)}
                  placeholder="नई दिल्ली"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  तापमान (Temp)
                </label>
                <input
                  type="text"
                  value={masthead.temperature ?? '25°C'}
                  onChange={(e) => updateField('temperature', e.target.value)}
                  placeholder="25°C"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  स्थिति (Sky)
                </label>
                <input
                  type="text"
                  value={masthead.weatherCondition ?? 'साफ़ आसमान'}
                  onChange={(e) => updateField('weatherCondition', e.target.value)}
                  placeholder="साफ़ आसमान"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>
            </div>

            {/* AQI */}
            <div style={{ marginTop: '6px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label style={{ fontSize: '10px', color: '#64748b' }}>
                  वायु गुणवत्ता (Air Quality / AQI)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showAirQuality !== false}
                    onChange={(e) => updateField('showAirQuality', e.target.checked)}
                  />
                  AQI दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.airQuality ?? 'AQI 128 • मध्यम'}
                onChange={(e) => updateField('airQuality', e.target.value)}
                placeholder="AQI 128 • मध्यम"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '5px 6px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                }}
              />
            </div>
          </div>

          {/* Price & Registration Section */}
          <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#1e293b',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              💰 मूल्य व पंजीयन (Price & Reg.)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <label style={{ fontSize: '10px', color: '#64748b' }}>मूल्य (Cover Price)</label>
                  <label
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={masthead.showPrice !== false}
                      onChange={(e) => updateField('showPrice', e.target.checked)}
                    />
                    दिखाएँ
                  </label>
                </div>
                <input
                  type="text"
                  value={masthead.price ?? 'मूल्य ₹5.00'}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="मूल्य ₹5.00"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <label style={{ fontSize: '10px', color: '#64748b' }}>
                    पंजीयन संख्या (Reg. No.)
                  </label>
                  <label
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={masthead.showPostalReg !== false}
                      onChange={(e) => updateField('showPostalReg', e.target.checked)}
                    />
                    दिखाएँ
                  </label>
                </div>
                <input
                  type="text"
                  value={masthead.postalRegNumber ?? 'पंजीयन सं. DL-11001/2026'}
                  onChange={(e) => updateField('postalRegNumber', e.target.value)}
                  placeholder="पंजीयन सं. DL-11001/2026"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Date, Volume & Issue */}
          <div>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#1e293b',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              📅 दिनांक व अंक संख्या (Date & Volume)
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '0.8fr 1.2fr',
                gap: '6px',
                marginBottom: '6px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  वार (Day)
                </label>
                <input
                  type="text"
                  value={masthead.dayOfWeek ?? 'बुधवार'}
                  onChange={(e) => updateField('dayOfWeek', e.target.value)}
                  placeholder="बुधवार"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <label style={{ fontSize: '10px', color: '#64748b' }}>दिनांक (Date)</label>
                  <label
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={masthead.showDate !== false}
                      onChange={(e) => updateField('showDate', e.target.checked)}
                    />
                    दिखाएँ
                  </label>
                </div>
                <input
                  type="text"
                  value={masthead.date ?? '28 अक्टूबर 2026'}
                  onChange={(e) => updateField('date', e.target.value)}
                  placeholder="28 अक्टूबर 2026"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  वर्ष (Volume)
                </label>
                <input
                  type="text"
                  value={masthead.volumeYear ?? 'वर्ष 78'}
                  onChange={(e) => {
                    const newVol = e.target.value;
                    updateField('volumeYear', newVol);
                    updateField('issueNumber', `${newVol} • ${masthead.issueCount || 'अंक 142'}`);
                  }}
                  placeholder="वर्ष 78"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  अंक (Issue)
                </label>
                <input
                  type="text"
                  value={masthead.issueCount ?? 'अंक 142'}
                  onChange={(e) => {
                    const newIssue = e.target.value;
                    updateField('issueCount', newIssue);
                    updateField('issueNumber', `${masthead.volumeYear || 'वर्ष 78'} • ${newIssue}`);
                  }}
                  placeholder="अंक 142"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
       * TAB 3: DIVIDER RULES & VISIBILITY TOGGLES
       * ========================================================== */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Border Rule Style */}
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
              मास्टहेड विभाजक रेखा शैली (Divider Rule Style)
            </label>
            <select
              value={masthead.ruleStyle || 'ornate-double'}
              onChange={(e) => updateField('ruleStyle', e.target.value as MastheadRuleStyle)}
              style={{
                width: '100%',
                padding: '7px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="ornate-double">पारंपरिक डबल-रूल (Ornate Double Rule)</option>
              <option value="oxford-thick-thin">ऑक्सफोर्ड थिक-थिन (Oxford Thick-Thin)</option>
              <option value="classic-double">क्लासिक समानांतर रेखा (Classic Double)</option>
              <option value="single-hairline">महीन हेयरलाइन (Single Hairline)</option>
              <option value="none">कोई विभाजक नहीं (None)</option>
            </select>
          </div>

          {/* Section Visibility Controls */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '8px',
              }}
            >
              शीर्षक पट्टियाँ एवं प्रदर्शन नियंत्रण
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: '#f8fafc',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <span>ऊपरी मौसम व ध्येय पट्टी (Top Metadata Strip)</span>
                <input
                  type="checkbox"
                  checked={masthead.showTopStrip !== false}
                  onChange={(e) => updateField('showTopStrip', e.target.checked)}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <span>निचली दिनांक व संस्करण पट्टी (Bottom Info Strip)</span>
                <input
                  type="checkbox"
                  checked={masthead.showBottomStrip !== false}
                  onChange={(e) => updateField('showBottomStrip', e.target.checked)}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <span>वर्ष व अंक संख्या (Volume & Issue)</span>
                <input
                  type="checkbox"
                  checked={masthead.showVolumeIssue !== false}
                  onChange={(e) => updateField('showVolumeIssue', e.target.checked)}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                <span>पृष्ठ संख्या लेबल (Page Count Notice)</span>
                <input
                  type="checkbox"
                  checked={masthead.showPostalReg !== false}
                  onChange={(e) => updateField('showPostalReg', e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
