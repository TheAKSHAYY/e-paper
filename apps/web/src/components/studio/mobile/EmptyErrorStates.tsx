import React from 'react';

export type EmptyErrorStateType =
  | 'empty-page'
  | 'no-empty-slot'
  | 'failed-image-upload'
  | 'unsupported-character'
  | 'page-overflow';

export interface EmptyErrorStateProps {
  type: EmptyErrorStateType;
  onAction?: () => void;
  actionLabel?: string;
  extraDetails?: string;
}

export const EmptyErrorState: React.FC<EmptyErrorStateProps> = ({
  type,
  onAction,
  actionLabel,
  extraDetails,
}) => {
  switch (type) {
    case 'empty-page':
      return (
        <div
          data-testid="state-empty-page"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            margin: '8px 0',
          }}
        >
          <span style={{ fontSize: '28px', marginBottom: '6px' }}>📰</span>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            इस पृष्ठ पर अभी कोई सामग्री नहीं है
          </h4>
          <p
            style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b', maxWidth: '280px' }}
          >
            Page is empty. Choose a layout row or header preset to get started.
          </p>
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              style={{
                minHeight: '44px',
                padding: '0 16px',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {actionLabel || '+ लेआउट पंक्ति जोड़ें (Add Row)'}
            </button>
          )}
        </div>
      );

    case 'no-empty-slot':
      return (
        <div
          data-testid="state-no-empty-slot"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            textAlign: 'center',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            margin: '8px 0',
          }}
        >
          <span style={{ fontSize: '24px', marginBottom: '6px' }}>⚠️</span>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
            पहले एक पंक्ति जोड़ें (Pehle ek row jodein)
          </h4>
          <p
            style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#b45309', maxWidth: '300px' }}
          >
            No empty slot available on page. Please add a layout row first to insert news blocks.
          </p>
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              data-testid="add-row-from-empty-state-btn"
              style={{
                minHeight: '44px',
                padding: '0 16px',
                backgroundColor: '#b45309',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>➕</span>
              <span>{actionLabel || 'नई पंक्ति जोड़ें (Add Row)'}</span>
            </button>
          )}
        </div>
      );

    case 'failed-image-upload':
      return (
        <div
          data-testid="state-failed-image-upload"
          style={{
            padding: '12px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>❌</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
                चित्र अपलोड विफल रहा
              </div>
              <div style={{ fontSize: '10.5px', color: '#b91c1c' }}>
                Image upload failed. Check file size (max 5MB) and format (JPG/PNG).
              </div>
            </div>
          </div>
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              style={{
                minHeight: '44px',
                padding: '0 12px',
                backgroundColor: '#ffffff',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {actionLabel || 'पुनः प्रयास'}
            </button>
          )}
        </div>
      );

    case 'unsupported-character':
      return (
        <div
          data-testid="state-unsupported-character"
          style={{
            padding: '12px 14px',
            backgroundColor: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔤</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#9a3412' }}>
                असमर्थित वर्ण (Unsupported Characters)
              </div>
              <div style={{ fontSize: '10.5px', color: '#c2410c' }}>
                Selected font may not support some special symbols or glyphs:{' '}
                {extraDetails || 'Unicode glyph mismatch'}
              </div>
            </div>
          </div>
        </div>
      );

    case 'page-overflow':
      return (
        <div
          data-testid="state-page-overflow"
          style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c' }}>
              पेज क्षमता से अधिक भरा हुआ है (Page Overflow Warning)
            </div>
            <div style={{ fontSize: '10.5px', color: '#7f1d1d' }}>
              सामग्री मुद्रण क्षेत्र से बाहर जा सकती है। कुछ ब्लॉक का आकार घटाएँ या नया पृष्ठ
              जोड़ें।
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
