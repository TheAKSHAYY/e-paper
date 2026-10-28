import React, { useState } from 'react';
import type { NewspaperPresetId } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets, getNewspaperPreset } from '@epaper-studio/template-engine';

export interface PresetSelectorModalProps {
  isOpen: boolean;
  currentPresetId: NewspaperPresetId;
  onClose: () => void;
  onApplyPreset: (presetId: NewspaperPresetId, replaceArticles: boolean) => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  currentPresetId,
  onClose,
  onApplyPreset,
}) => {
  const presets = getAllNewspaperPresets();
  const [selectedId, setSelectedId] = useState<NewspaperPresetId>(currentPresetId);
  const [replaceArticles, setReplaceArticles] = useState(false);

  if (!isOpen) return null;

  const activePreset = getNewspaperPreset(selectedId);

  const handleApply = () => {
    if (replaceArticles) {
      const confirmed = window.confirm(
        'सावधानी: आपने "नमूना खबरों से बदलें" चुना है। क्या आप सचमुच मौजूदा खबरों को हटाकर नई नमूना खबरें लोड करना चाहते हैं?'
      );
      if (!confirmed) return;
    }
    onApplyPreset(selectedId, replaceArticles);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
          border: '1px solid #d5cfc5',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fbfaf7',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontFamily: "'Rozha One', 'Noto Serif Devanagari', serif",
                color: '#111',
              }}
            >
              🗞️ अख़बार की शैली व प्रारूप चुनें (Newspaper Presets)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
              अपने प्रकाशन के उद्देश्य के अनुसार शास्त्रीय, समकालीन या स्थानीय शैली चुनें:
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="डायलॉग बंद करें"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body: Preset Cards on Left, Detailed Preview on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          {/* Preset Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {presets.map((preset) => {
              const isSelected = preset.id === selectedId;
              const isHindiPreset = preset.id.includes('hindi');

              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedId(preset.id)}
                  data-testid={`preset-card-${preset.id}`}
                  style={{
                    border: isSelected ? '2px solid #b22222' : '1px solid #dcd7cc',
                    backgroundColor: isSelected ? '#fff9f9' : '#fafafa',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(178,34,34,0.15)' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '14.5px',
                        fontFamily: "'Noto Serif Devanagari', serif",
                        color: '#111',
                      }}
                    >
                      {preset.name}
                    </span>
                    {isHindiPreset && (
                      <span
                        style={{
                          fontSize: '10px',
                          backgroundColor: '#b22222',
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 700,
                        }}
                      >
                        हिंदी
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#b22222',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    {preset.tagline}
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.4 }}>
                    {preset.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Preview Box */}
          <div
            style={{
              backgroundColor: '#fbfaf6',
              border: '1px solid #d5d0c4',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                color: '#777',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              प्रारूप पूर्वावलोकन: {activePreset.name}
            </div>

            {/* Mock Header */}
            <div
              style={{
                borderTop: '2px solid #111',
                borderBottom:
                  activePreset.mastheadStyle === 'ornate-double-rule'
                    ? '3px double #111'
                    : '1px solid #111',
                padding: '10px 0',
                textAlign: 'center',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  fontFamily: activePreset.mastheadFont || activePreset.headlineFont,
                  fontWeight: 900,
                  fontSize: '22px',
                  color: activePreset.accentColor,
                  lineHeight: 1.15,
                }}
              >
                {activePreset.defaultMasthead.title}
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  fontStyle: 'italic',
                  color: '#666',
                  marginTop: '3px',
                }}
              >
                {activePreset.defaultMasthead.subtitle}
              </div>
            </div>

            {/* Specs Summary */}
            <div
              style={{
                fontSize: '12px',
                color: '#333',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div>
                <strong>अनुशंसित आकार:</strong> {activePreset.recommendedPageSize.toUpperCase()}
              </div>
              <div>
                <strong>कॉलम व्यवस्था:</strong> {activePreset.defaultColumns} कॉलम{' '}
                {activePreset.columnRule ? '(विभाजक रेखाओं के साथ)' : ''}
              </div>
              <div>
                <strong>मास्टहेड फॉन्ट:</strong>{' '}
                <code style={{ fontSize: '11px' }}>
                  {(activePreset.mastheadFont || activePreset.headlineFont).split(',')[0]}
                </code>
              </div>
              <div>
                <strong>मुख्य हेडलाइन फॉन्ट:</strong>{' '}
                <code style={{ fontSize: '11px' }}>{activePreset.headlineFont.split(',')[0]}</code>
              </div>
              <div>
                <strong>समाचार पाठ (Body):</strong>{' '}
                <code style={{ fontSize: '11px' }}>
                  {activePreset.bodyFont.split(',')[0]} ({activePreset.bodyFontSizePt}pt)
                </code>
              </div>
            </div>

            {/* Seed sample headline */}
            <div style={{ marginTop: '14px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#777', marginBottom: '4px' }}>
                नमूना लीड खबर:
              </div>
              <div
                style={{
                  fontFamily: activePreset.headlineFont,
                  fontWeight: activePreset.headlineWeight || 700,
                  fontSize: '14px',
                  lineHeight: 1.3,
                  color: '#111',
                }}
              >
                {activePreset.seedArticles[0]?.headline}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#fbfaf7',
          }}
        >
          {/* Article Preservation Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#333',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={replaceArticles}
                onChange={(e) => setReplaceArticles(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>मौजूदा खबरों को इस प्रारूप की नमूना खबरों से बदलें</span>
            </label>
            <span style={{ fontSize: '11px', color: '#777', marginLeft: '24px' }}>
              {!replaceArticles
                ? '✓ सुरक्षित विकल्प: आपकी लिखी हुई सभी खबरें यथावत रहेंगी, केवल फॉन्ट व लेआउट बदलेगा।'
                : '⚠️ चेतावनी: आपकी वर्तमान खबरें हट जाएंगी और नई नमूना खबरें आ जाएंगी।'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#eee',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              रद्द करें
            </button>
            <button
              onClick={handleApply}
              data-testid="btn-apply-preset"
              style={{
                backgroundColor: '#b22222',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(178,34,34,0.3)',
              }}
            >
              प्रारूप लागू करें →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
