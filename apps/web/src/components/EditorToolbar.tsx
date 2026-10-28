import React from 'react';
import { THEME_TOKENS } from '@epaper-studio/ui';

export type ViewMode = 'split' | 'editor' | 'preview';
export type WorkflowStep = 'choose' | 'write' | 'format' | 'download';

export interface EditorToolbarProps {
  documentTitle: string;
  hasUnsavedChanges: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentStep: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onOpenSetupModal: () => void;
  onOpenPresetsModal: () => void;
  onOpenDraftsModal: () => void;
  onOpenGuideModal: () => void;
  onSaveDraft: () => void;
  isSaving: boolean;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  documentTitle,
  hasUnsavedChanges,
  viewMode,
  onViewModeChange,
  currentStep,
  onStepChange,
  scale,
  onScaleChange,
  onOpenSetupModal,
  onOpenPresetsModal,
  onOpenDraftsModal,
  onOpenGuideModal,
  onSaveDraft,
  isSaving,
  onExportPdf,
  isExportingPdf,
}) => {
  const steps: Array<{ id: WorkflowStep; label: string; icon: string; shortHint: string }> = [
    { id: 'choose', label: '1. चुनें', icon: '📰', shortHint: 'अख़बार व प्रारूप' },
    { id: 'write', label: '2. लिखें', icon: '✍️', shortHint: 'खबरें व चित्र' },
    { id: 'format', label: '3. सजाएँ', icon: '🎨', shortHint: 'फॉन्ट व रूप-सज्जा' },
    { id: 'download', label: '4. डाउनलोड करें', icon: '📥', shortHint: 'पूर्वावलोकन व PDF' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#1a1917',
        color: '#f4f1ea',
        borderBottom: '2px solid #2d2b27',
        padding: '8px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Brand & Project Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: '18px',
              fontFamily: "'Rozha One', 'Playfair Display', serif",
              fontWeight: 900,
              letterSpacing: '-0.01em',
              color: '#fff',
            }}
          >
            ई-पेपर स्टूडियो
          </span>
          <span
            style={{
              fontSize: '10px',
              backgroundColor: '#b22222',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            हिंदी
          </span>
        </div>

        <div style={{ height: '18px', width: '1px', backgroundColor: '#38352f' }} />

        {/* Current Document Name & Save Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenSetupModal}
            title="अख़बार का नाम व विवरण बदलने के लिए क्लिक करें"
            style={{
              background: 'none',
              border: 'none',
              color: '#f0ece1',
              fontSize: '14px',
              fontFamily: "'Noto Serif Devanagari', serif",
              fontWeight: 700,
              cursor: 'pointer',
              padding: '3px 6px',
              borderRadius: '4px',
              textDecoration: 'underline dotted',
              maxWidth: '180px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {documentTitle}
          </button>

          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600,
              backgroundColor: hasUnsavedChanges ? '#4a300a' : '#143818',
              color: hasUnsavedChanges ? '#ffcc80' : '#a5d6a7',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: hasUnsavedChanges ? '#ffa726' : '#66bb6a',
              }}
            />
            {hasUnsavedChanges ? 'असुरक्षित बदलाव' : 'ड्राफ्ट सुरक्षित'}
          </span>
        </div>
      </div>

      {/* Center: 4 Clear Steps Workflow (चुनें → लिखें → सजाएँ → डाउनलोड करें) */}
      <nav
        aria-label="प्रकाशन चरण"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#262420',
          padding: '3px 4px',
          borderRadius: '8px',
          border: '1px solid #38352f',
        }}
      >
        {steps.map((s) => {
          const isActive = currentStep === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onStepChange(s.id)}
              title={s.shortHint}
              style={{
                backgroundColor: isActive ? '#b22222' : 'transparent',
                color: isActive ? '#ffffff' : '#ccc',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '12px' }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: View Switcher, Guide, Save, Download */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* View Mode Switcher (Desktop) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: '#262420',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #38352f',
          }}
        >
          <button
            onClick={() => onViewModeChange('editor')}
            data-testid="view-btn-editor"
            title="सिर्फ संपादन स्क्रीन"
            style={{
              backgroundColor: viewMode === 'editor' ? '#444038' : 'transparent',
              color: viewMode === 'editor' ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            लिखें
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            data-testid="view-btn-split"
            title="संपादन व पूर्वावलोकन दोनों देखें"
            style={{
              backgroundColor: viewMode === 'split' ? '#444038' : 'transparent',
              color: viewMode === 'split' ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            दोनों
          </button>
          <button
            onClick={() => onViewModeChange('preview')}
            data-testid="view-btn-preview"
            title="अख़बार का वास्तविक पूर्वावलोकन देखें"
            style={{
              backgroundColor: viewMode === 'preview' ? '#444038' : 'transparent',
              color: viewMode === 'preview' ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            पूर्वावलोकन
          </button>
        </div>

        {/* Zoom Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: '#aaa',
          }}
        >
          <span>ज़ूम:</span>
          {(() => {
            const roundedScale = Math.round(scale * 100) / 100;
            const standardScales = [0.25, 0.35, 0.5, 0.65, 0.75, 1.0, 1.25, 1.5];
            const isCustom = !standardScales.includes(roundedScale);
            return (
              <select
                value={roundedScale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                aria-label="ज़ूम स्तर चुनें"
                style={{
                  backgroundColor: '#262420',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '3px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {isCustom && (
                  <option value={roundedScale}>{Math.round(scale * 100)}% (फ़िट)</option>
                )}
                {standardScales.map((val) => (
                  <option key={val} value={val}>
                    {Math.round(val * 100)}%
                  </option>
                ))}
              </select>
            );
          })()}
        </div>

        {/* First-use Guide Button */}
        <button
          onClick={onOpenGuideModal}
          title="त्वरित उपयोग मार्गदर्शिका खोलें"
          style={{
            backgroundColor: '#2d2b27',
            color: '#e8e4db',
            border: '1px solid #48453d',
            borderRadius: '4px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>💡</span>
          <span>मार्गदर्शिका</span>
        </button>

        {/* Choose Preset Button */}
        <button
          onClick={onOpenPresetsModal}
          data-testid="btn-open-presets"
          title="अख़बार की शैली व प्रारूप बदलें"
          style={{
            backgroundColor: '#2d2b27',
            color: '#e8e4db',
            border: '1px solid #48453d',
            borderRadius: '4px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📰 अख़बार चुनें
        </button>

        {/* Drafts Manager Button */}
        <button
          onClick={onOpenDraftsModal}
          data-testid="btn-open-drafts"
          title="पुराने ड्राफ्ट देखें या खोलें"
          style={{
            backgroundColor: '#2d2b27',
            color: '#e8e4db',
            border: '1px solid #48453d',
            borderRadius: '4px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📁 ड्राफ्ट
        </button>

        {/* Save Draft Button */}
        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          data-testid="btn-save-draft"
          title="वर्तमान अख़बार को लोकल मेमोरी में सहेजें"
          style={{
            backgroundColor: THEME_TOKENS.accentCrimson,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {isSaving ? 'सहेजा जा रहा है...' : '💾 सहेजें'}
        </button>

        {/* Download PDF Button */}
        <button
          onClick={onExportPdf}
          disabled={isExportingPdf}
          data-testid="btn-export-pdf"
          title="प्रिंटेबल वेक्टर PDF डाउनलोड करें"
          style={{
            backgroundColor: '#1b4a24',
            color: '#e4f7e8',
            border: '1px solid #2d7a3c',
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isExportingPdf ? 'not-allowed' : 'pointer',
            opacity: isExportingPdf ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isExportingPdf ? '⏳ PDF तैयार हो रहा है...' : '📄 PDF डाउनलोड करें'}
        </button>
      </div>
    </header>
  );
};
