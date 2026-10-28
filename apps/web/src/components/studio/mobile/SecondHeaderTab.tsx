import React from 'react';
import type { MastheadConfig } from '@epaper-studio/document-schema';

export interface SecondHeaderTabProps {
  currentConfig: MastheadConfig;
  onUpdateMasthead: (config: Partial<MastheadConfig>) => void;
}

export const SecondHeaderTab: React.FC<SecondHeaderTabProps> = ({
  currentConfig,
  onUpdateMasthead,
}) => {
  const isEnabled = currentConfig.showSecondaryHeader ?? false;

  const handleToggle = (enabled: boolean) => {
    onUpdateMasthead({
      showSecondaryHeader: enabled,
      secondaryHeaderTitle:
        currentConfig.secondaryHeaderTitle || 'प्रादेशिक एवं राष्ट्रीय राजधानी संस्करण',
      secondaryHeaderSubtitle:
        currentConfig.secondaryHeaderSubtitle || 'दिल्ली • लखनऊ • पटना • भोपाल • जयपुर • चंडीगढ़',
    });
  };

  const handleRemove = () => {
    onUpdateMasthead({
      showSecondaryHeader: false,
    });
  };

  return (
    <div
      data-testid="mobile-second-header-tab"
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
            द्वितीयक हेडर (2nd Header / Sub-Edition Strip)
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
            मास्टहेड के नीचे प्रादेशिक संस्करण व शहर सूची पट्टी
          </p>
        </div>

        {isEnabled && (
          <button
            type="button"
            onClick={handleRemove}
            data-testid="remove-second-header-btn"
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
          द्वितीयक हेडर पट्टी दिखाएँ (Show 2nd Header)
        </span>
        <button
          type="button"
          onClick={() => handleToggle(!isEnabled)}
          data-testid="toggle-second-header-btn"
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
              संस्करण शीर्षक (Edition Title)
            </label>
            <input
              type="text"
              value={currentConfig.secondaryHeaderTitle || ''}
              onChange={(e) => onUpdateMasthead({ secondaryHeaderTitle: e.target.value })}
              placeholder="प्रादेशिक एवं राष्ट्रीय राजधानी संस्करण"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            />
          </div>

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
              उप-शीर्षक / नगर सूची (Sub-title / Cities)
            </label>
            <input
              type="text"
              value={currentConfig.secondaryHeaderSubtitle || ''}
              onChange={(e) => onUpdateMasthead({ secondaryHeaderSubtitle: e.target.value })}
              placeholder="दिल्ली • लखनऊ • पटना • भोपाल • जयपुर"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
