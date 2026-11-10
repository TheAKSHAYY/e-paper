import React from 'react';
import type { MastheadConfig } from '@epaper-studio/document-schema';
import { ColorStrip } from './ColorStrip';

export interface SubHeaderTabProps {
  currentConfig: MastheadConfig;
  onUpdateMasthead: (config: Partial<MastheadConfig>) => void;
  onOpenTemplateGallery?: (
    category?: 'all' | 'pages' | 'mastheads' | 'articles' | 'breaking' | 'dividers' | 'favorites'
  ) => void;
}

const PRESET_SUBHEADERS = [
  {
    icon: '📢',
    title: 'विशेष बुलेटिन',
    text: 'विशेष बुलेटिन : आज की सबसे बड़ी हलचल और विशेष ग्राउंड रिपोर्ट',
  },
  {
    icon: '🚨',
    title: 'रेड अलर्ट ब्रेकिंग',
    text: 'संसद में ऐतिहासिक नीति पर मुहर: ग्रामीण विकास व किसान कल्याण पैकेज स्वीकृत',
  },
  {
    icon: '🗳️',
    title: 'चुनावी हलचल',
    text: 'मतगणना रुझान: 240 सीटों पर मतगणना प्रारंभ, शुरुआती राउंड में कड़ा मुकाबला',
  },
  {
    icon: '⚠️',
    title: 'आपदा व मौसम',
    text: 'अतिवृष्टि चेतावनी: नदी का जलस्तर खतरे के निशान के करीब, तटीय बस्तियां सतर्क',
  },
  {
    icon: '🏛️',
    title: 'शासकीय विज्ञप्ति',
    text: 'शासकीय विज्ञप्ति: राज्य भर में सार्वजनिक अवकाश एवं विशेष सुरक्षा व्यवस्था के आदेश',
  },
  {
    icon: '📈',
    title: 'व्यापार व बाज़ार',
    text: 'व्यापार संदेश : सेंसेक्स 850 अंक उछला, अंतरराष्ट्रीय व्यापार समझौते पर मुहर',
  },
];

export const SubHeaderTab: React.FC<SubHeaderTabProps> = ({
  currentConfig,
  onUpdateMasthead,
  onOpenTemplateGallery,
}) => {
  const isEnabled = currentConfig.showAnnouncementStrip ?? false;

  const handleToggle = (enabled: boolean) => {
    onUpdateMasthead({
      showAnnouncementStrip: enabled,
      announcementStripText:
        currentConfig.announcementStripText ||
        'विशेष दीपावली परिशिष्ट : आज ही अपने हॉकर से निःशुल्क प्राप्त करें',
    });
  };

  const handleRemove = () => {
    onUpdateMasthead({
      showAnnouncementStrip: false,
    });
  };

  const handleSelectPreset = (text: string) => {
    onUpdateMasthead({
      showAnnouncementStrip: true,
      announcementStripText: text,
    });
  };

  return (
    <div
      data-testid="mobile-sub-header-tab"
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
            सब-हेडर / घोषणा पट्टी (SubHeader / Announcement Strip)
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
            शीर्ष पर ब्रेकिंग बुलेटिन व विशेष संदेश पट्टी
          </p>
        </div>

        {isEnabled && (
          <button
            type="button"
            onClick={handleRemove}
            data-testid="remove-sub-header-btn"
            style={{
              minHeight: '44px',
              padding: '0 12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            हटाएँ (Remove)
          </button>
        )}
      </div>

      {/* Enable Toggle Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
          घोषणा पट्टी दिखाएँ (Show Announcement Strip)
        </span>
        <button
          type="button"
          onClick={() => handleToggle(!isEnabled)}
          data-testid="toggle-sub-header-btn"
          style={{
            minHeight: '44px',
            minWidth: '56px',
            backgroundColor: isEnabled ? '#16a34a' : '#cbd5e1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '22px',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          {isEnabled ? 'चालू' : 'बंद'}
        </button>
      </div>

      {isEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '4px',
              }}
            >
              घोषणा संदेश (Announcement Text)
            </label>
            <textarea
              rows={2}
              value={currentConfig.announcementStripText || ''}
              onChange={(e) => onUpdateMasthead({ announcementStripText: e.target.value })}
              placeholder="विशेष बुलेटिन : ताजा समाचार यहाँ लिखें..."
              style={{
                width: '100%',
                minHeight: '52px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            />
          </div>

          {/* Quick preset chips */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>त्वरित सब-हेडर चुनें:</span>
              {onOpenTemplateGallery && (
                <button
                  type="button"
                  onClick={() => onOpenTemplateGallery('breaking')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b91c1c',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  गैलरी से 25+ शैलियाँ देखें ➔
                </button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
              }}
            >
              {PRESET_SUBHEADERS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(item.text)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '14px', lineHeight: 1 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px',
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <ColorStrip
            selectedColor="#b91c1c"
            onSelectColor={(_col) => {
              // Accent color applied to previewed subheader
            }}
            label="पट्टी पृष्ठभूमि रंग (Strip Background Color)"
          />
        </div>
      )}
    </div>
  );
};
