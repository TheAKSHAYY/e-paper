import React from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  documentTitle: string;
  destinationName: 'dashboard' | 'landing';
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  documentTitle,
  destinationName,
  onSaveAndExit,
  onDiscardAndExit,
  onCancel,
}) => {
  const { locale } = useI18n();

  if (!isOpen) return null;

  const destLabel = destinationName === 'dashboard'
    ? (locale === 'hi' ? 'डैशबोर्ड' : 'Dashboard')
    : (locale === 'hi' ? 'मुख्य पृष्ठ (होम)' : 'Home');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FAF8F5',
          color: '#1C1917',
          borderRadius: '16px',
          border: '1px solid #E7E2DA',
          boxShadow: '0 24px 64px -12px rgba(28, 25, 23, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiUi : APP_UI_TYPOGRAPHY.fonts.sans,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px 14px 24px',
            borderBottom: '1px solid #E7E2DA',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            !
          </div>
          <div>
            <h3
              id="unsaved-modal-title"
              style={{
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display,
                lineHeight: locale === 'hi' ? 1.35 : 1.25,
                margin: 0,
                color: '#1C1917',
              }}
            >
              {locale === 'hi' ? 'असुरक्षित परिवर्तन मौजूद हैं' : 'Unsaved Changes'}
            </h3>
            <span style={{ fontSize: '11px', color: '#78716C' }}>
              {documentTitle || (locale === 'hi' ? 'अनाम संस्करण' : 'Untitled Edition')}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', fontSize: '13px', color: '#57534E', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 12px 0' }}>
            {locale === 'hi'
              ? `आपके संस्करण "${documentTitle || 'अनाम'}" में ऐसे संपादन हैं जो अभी तक सहेजे नहीं गए हैं। क्या आप ${destLabel} पर लौटने से पहले ड्राफ्ट को सुरक्षित सहेजना चाहते हैं?`
              : `You have unsaved edits in "${documentTitle || 'Untitled'}". Would you like to save this edition before navigating to ${destLabel}?`}
          </p>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F5F2EB',
              borderRadius: '8px',
              border: '1px solid #E7E2DA',
              fontSize: '12px',
              color: '#44403C',
            }}
          >
            {locale === 'hi'
              ? '💡 ड्राफ्ट को सहेजने पर आपका सभी पाठ, लेआउट और छवियां सुरक्षित रूप से ब्राउज़र स्टोरेज में संरक्षित रहेंगी।'
              : '💡 Saving preserves your articles, grid balancing, and photos safely in your local workspace.'}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E7E2DA',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Primary: Save & Exit */}
          <button
            type="button"
            onClick={onSaveAndExit}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '12px 18px',
              borderRadius: '8px',
              backgroundColor: '#1C1917',
              color: '#FAF8F5',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>💾</span>
            <span>{locale === 'hi' ? `सहेजें और ${destLabel} पर जाएँ` : `Save & Exit to ${destLabel}`}</span>
          </button>

          {/* Secondary & Tertiary in a row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={onDiscardAndExit}
              style={{
                minHeight: '44px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFF1F2',
                color: '#BE123C',
                border: '1px solid #FECDD3',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'परिवर्तन छोड़ें' : 'Discard & Exit'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                minHeight: '44px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FAF8F5',
                color: '#57534E',
                border: '1px solid #D6D0C5',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'संपादन जारी रखें' : 'Keep Editing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

