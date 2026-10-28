import React from 'react';
import type { MastheadConfig } from '@epaper-studio/document-schema';
import { ColorStrip } from './ColorStrip';

export interface SubHeaderTabProps {
  currentConfig: MastheadConfig;
  onUpdateMasthead: (config: Partial<MastheadConfig>) => void;
}

export const SubHeaderTab: React.FC<SubHeaderTabProps> = ({ currentConfig, onUpdateMasthead }) => {
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
