import React from 'react';
import type { NewspaperThemeConfig } from '@epaper-studio/document-schema';
import { NEWSPAPER_THEME_PRESETS } from '@epaper-studio/document-schema';

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: NewspaperThemeConfig;
  onUpdateTheme: (theme: NewspaperThemeConfig) => void;
}

const DEFAULT_THEME = NEWSPAPER_THEME_PRESETS[0]!;

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  theme = DEFAULT_THEME,
  onUpdateTheme,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme: NewspaperThemeConfig = {
    id: theme.id ?? 'custom',
    name: theme.name ?? 'Custom Theme',
    mastheadColor: theme.mastheadColor ?? '#111111',
    headlineColor: theme.headlineColor ?? '#111111',
    subheadlineColor: theme.subheadlineColor ?? '#333333',
    bodyColor: theme.bodyColor ?? '#222222',
    bylineColor: theme.bylineColor ?? '#555555',
    kickerColor: theme.kickerColor ?? '#b91c1c',
    borderColor: theme.borderColor ?? '#c8c5bc',
    pageBackground: theme.pageBackground ?? '#ffffff',
  };

  const handleColorChange = (key: keyof NewspaperThemeConfig, value: string) => {
    onUpdateTheme({
      ...currentTheme,
      id: 'custom',
      name: 'कस्टम रंग (Custom)',
      [key]: value,
    });
  };

  const colorFields: Array<{
    key: keyof NewspaperThemeConfig;
    label: string;
    description: string;
  }> = [
    {
      key: 'mastheadColor',
      label: 'समाचार पत्र का नाम / मास्टहेड (Masthead)',
      description: 'मुख्य शीर्षक जैसे "अखबार का नाम"',
    },
    {
      key: 'headlineColor',
      label: 'मुख्य सुर्खियाँ (Headlines)',
      description: 'सभी खबरों के मुख्य शीर्षक का रंग',
    },
    {
      key: 'subheadlineColor',
      label: 'उप-सुर्खियाँ / डेक (Sub-Headlines)',
      description: 'शीर्षक के ऊपर या नीचे का विवरण',
    },
    {
      key: 'bodyColor',
      label: 'मुख्य पाठ्य सामग्री (Body Text)',
      description: 'समाचार लेखों का मुख्य टेक्स्ट',
    },
    {
      key: 'bylineColor',
      label: 'लेखक व डेटलाइन (Byline / Dateline)',
      description: 'विशेष संवाददाता, नई दिल्ली आदि',
    },
    {
      key: 'kickerColor',
      label: 'किकर व सेक्शन लेबल (Kickers & Labels)',
      description: 'ताजा खबर, विशेष आदि किकर टैग',
    },
    {
      key: 'borderColor',
      label: 'विभाजक रेखाएँ व बॉर्डर (Dividers & Borders)',
      description: 'कॉलम नियम, बॉर्डर व बॉक्स रेखाएँ',
    },
    {
      key: 'pageBackground',
      label: 'पृष्ठ की पृष्ठभूमि (Page Background)',
      description: 'अखबार के कागज का रंग (प्रिंट में डिफ़ॉल्ट सफेद)',
    },
  ];

  return (
    <div
      data-testid="theme-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        data-testid="theme-modal-content"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h3
              id="theme-modal-title"
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            >
              🎨 थीम एवं रंग अनुकूलन (Theme & Colors)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              मास्टहेड, शीर्षक, टेक्स्ट और बॉर्डर के रंग तुरंत लाइव लागू करें
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="बंद करें"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Preset Themes Row */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '8px',
              }}
            >
              अनुशंसित थीम प्रारूप (Preset Themes):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {NEWSPAPER_THEME_PRESETS.map((preset) => {
                const isSelected = currentTheme.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onUpdateTheme(preset)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: preset.mastheadColor,
                        border: `1px solid ${preset.borderColor}`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {preset.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '16px 0' }} />

          {/* Color Pickers Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {colorFields.map((field) => {
              const val = String(currentTheme[field.key] ?? '#111111');
              return (
                <div
                  key={field.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{field.description}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={val.startsWith('#') && val.length === 7 ? val : '#111111'}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '1px',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                      }}
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      style={{
                        width: '74px',
                        padding: '6px 8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={() => onUpdateTheme(DEFAULT_THEME)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            डिफ़ॉल्ट पर रीसेट करें (Reset to Default)
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 18px',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
