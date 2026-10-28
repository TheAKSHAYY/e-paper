import React from 'react';

export interface MobileLayoutPreset {
  id: string;
  label: string;
  name: string;
  columns: number[];
}

export const MOBILE_LAYOUT_PRESETS: MobileLayoutPreset[] = [
  { id: '12', label: '12', name: 'पूर्ण चौड़ाई (Full Width)', columns: [12] },
  { id: '6-6', label: '6 + 6', name: 'समान आधा (Half & Half)', columns: [6, 6] },
  { id: '4-8', label: '4 + 8', name: 'साइडबार + मुख्य समाचार', columns: [4, 8] },
  { id: '8-4', label: '8 + 4', name: 'मुख्य समाचार + साइडबार', columns: [8, 4] },
  { id: '3-9', label: '3 + 9', name: 'पतला कॉलम + विस्तृत आलेख', columns: [3, 9] },
  { id: '9-3', label: '9 + 3', name: 'विस्तृत आलेख + पतला कॉलम', columns: [9, 3] },
  { id: '4-4-4', label: '4 + 4 + 4', name: 'तीन समान कॉलम (Tri-Column)', columns: [4, 4, 4] },
  {
    id: '3-3-3-3',
    label: '3 + 3 + 3 + 3',
    name: 'चार कॉलम ग्रिड (Quarter Grid)',
    columns: [3, 3, 3, 3],
  },
  { id: '2-4-4-2', label: '2 + 4 + 4 + 2', name: 'संतुलित 4-कॉलम लेआउट', columns: [2, 4, 4, 2] },
  { id: '5-7', label: '5 + 7', name: 'असममित 5 + 7', columns: [5, 7] },
];

export interface LayoutTabProps {
  onAddLayoutRow: (columns: number[]) => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ onAddLayoutRow }) => {
  return (
    <div
      data-testid="mobile-layout-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
          पंक्ति लेआउट ग्रिड (12-Column Row Presets)
        </h4>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
          पृष्ठ के अंत में खाली स्लॉट पंक्ति जोड़ने के लिए किसी भी ग्रिड पर टैप करें
        </p>
      </div>

      {/* Compact Grid of Presets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}
      >
        {MOBILE_LAYOUT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onAddLayoutRow(preset.columns)}
            data-testid={`layout-preset-${preset.id}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              minHeight: '56px',
              textAlign: 'left',
              boxSizing: 'border-box',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            {/* Visual Bar Preview */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '10px',
                gap: '2px',
                marginBottom: '6px',
                backgroundColor: '#e2e8f0',
                padding: '1px',
                borderRadius: '3px',
                boxSizing: 'border-box',
              }}
            >
              {preset.columns.map((col, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: col,
                    height: '100%',
                    backgroundColor: idx % 2 === 0 ? '#b91c1c' : '#2563eb',
                    borderRadius: '1px',
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                {preset.label}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>+ पंक्ति जोड़ें</span>
            </div>
            <span
              style={{
                fontSize: '10px',
                color: '#64748b',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {preset.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
