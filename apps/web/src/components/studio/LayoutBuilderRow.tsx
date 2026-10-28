import React from 'react';

export interface LayoutPresetOption {
  id: string;
  name: string;
  columns: number[];
  label: string;
}

export const LAYOUT_PRESET_OPTIONS: LayoutPresetOption[] = [
  { id: '12', name: 'पूर्ण चौड़ाई (Full Width)', columns: [12], label: '12' },
  { id: '6-6', name: 'समान आधा (Half & Half)', columns: [6, 6], label: '6 + 6' },
  { id: '4-8', name: 'साइडबार + मुख्य समाचार', columns: [4, 8], label: '4 + 8' },
  { id: '8-4', name: 'मुख्य समाचार + साइडबार', columns: [8, 4], label: '8 + 4' },
  { id: '3-9', name: 'पतला कॉलम + विस्तृत आलेख', columns: [3, 9], label: '3 + 9' },
  { id: '9-3', name: 'विस्तृत आलेख + पतला कॉलम', columns: [9, 3], label: '9 + 3' },
  { id: '5-7', name: 'असममित 5 + 7', columns: [5, 7], label: '5 + 7' },
  { id: '7-5', name: 'असममित 7 + 5', columns: [7, 5], label: '7 + 5' },
  { id: '4-4-4', name: 'तीन समान कॉलम (Tri-Column)', columns: [4, 4, 4], label: '4 + 4 + 4' },
  { id: '3-3-3-3', name: 'चार कॉलम ग्रिड (Quarter Grid)', columns: [3, 3, 3, 3], label: '3 + 3 + 3 + 3' },
  { id: '2-8-2', name: 'केंद्रित समाचार + दो गटर', columns: [2, 8, 2], label: '2 + 8 + 2' },
];

export interface LayoutBuilderRowProps {
  onApplyLayoutRow: (columns: number[]) => void;
}

export const LayoutBuilderRow: React.FC<LayoutBuilderRowProps> = ({ onApplyLayoutRow }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
          12-कॉलम लेआउट ग्रिड (12-Column Grid Builder)
        </h4>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
          समाचार पृष्ठ के लिए कॉलम संयोजन चुनें
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
        }}
      >
        {LAYOUT_PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onApplyLayoutRow(opt.columns)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '6px 8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
          >
            {/* Visual Bar Preview */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '10px',
                gap: '2px',
                marginBottom: '4px',
                backgroundColor: '#e2e8f0',
                padding: '1px',
                borderRadius: '2px',
                boxSizing: 'border-box',
              }}
            >
              {opt.columns.map((col, idx) => (
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

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                {opt.label}
              </span>
              <span style={{ fontSize: '9.5px', color: '#64748b' }}>
                {opt.columns.length} कॉलम
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
