import React from 'react';

export interface PrintInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  pageSize: string;
  orientation: string;
  isMobile: boolean;
  errorMessage?: string | null;
  isPreparing?: boolean;
}

export const PrintInstructionsModal: React.FC<PrintInstructionsModalProps> = ({
  isOpen,
  onClose,
  onConfirmPrint,
  pageSize,
  orientation,
  isMobile,
  errorMessage,
  isPreparing = false,
}) => {
  if (!isOpen) return null;

  const pageSizeLabel = pageSize.toUpperCase();
  const orientationLabel = orientation === 'landscape' ? 'क्षैतिज (Landscape)' : 'लंबवत (Portrait)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
      data-testid="print-instructions-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPreparing) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #334155',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🖨️</span>
            <h2
              id="print-modal-title"
              style={{
                fontSize: '16px',
                fontWeight: 700,
                margin: 0,
                color: '#f1f5f9',
              }}
            >
              प्रिंट / PDF के रूप में सहेजें (Print / Save as PDF)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPreparing}
            aria-label="बंद करें"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '18px',
              cursor: isPreparing ? 'not-allowed' : 'pointer',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontSize: '13.5px',
            lineHeight: 1.6,
          }}
        >
          {/* Renderer Failure Alert Banner (if opened due to server failure) */}
          {errorMessage && (
            <div
              data-testid="renderer-failure-alert"
              style={{
                backgroundColor: '#450a0a',
                border: '1px solid #991b1b',
                color: '#fecaca',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
              }}
            >
              <strong>⚠️ सर्वर रेंडरर अनुपलब्ध:</strong> {errorMessage}
              <div style={{ marginTop: '4px', color: '#fed7aa', fontSize: '12px' }}>
                चिंता न करें! आप बिना किसी सर्वर या इंटरनेट कनेक्शन के सीधे अपने ब्राउज़र से अखबार को PDF के रूप में सहेज सकते हैं।
              </div>
            </div>
          )}

          {/* Mobile Warning Banner */}
          {isMobile && (
            <div
              data-testid="mobile-print-warning"
              style={{
                backgroundColor: '#422006',
                border: '1px solid #a16207',
                color: '#fef08a',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '3px' }}>
                📱 मोबाइल उपयोगकर्ताओं के लिए महत्वपूर्ण सूचना:
              </div>
              <div>
                मोबाइल ब्राउज़र (Chrome/Safari) में प्रिंट-टू-पीडीएफ पृष्ठ के भौतिक ग्रिड और मार्जिन को स्वचालित रूप से समायोजित कर सकता है, जिससे लेआउट प्रभावित हो सकता है।
              </div>
              <div style={{ marginTop: '4px', fontWeight: 600 }}>
                👉 सर्वोत्तम परिणाम के लिए मुख्य '📥 PDF' (सर्वर रेंडरर) का उपयोग करें या डेस्कटॉप कंप्यूटर से प्रिंट करें।
              </div>
            </div>
          )}

          {/* Instructions Box */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '8px', fontSize: '13px' }}>
              ⚙️ प्रिंट डायलॉग में ये सेटिंग्स चुनें (Recommended Settings):
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                color: '#e2e8f0',
              }}
            >
              <li>
                <strong>गंतव्य (Destination):</strong>{' '}
                <span style={{ color: '#4ade80', fontWeight: 600 }}>'Save as PDF'</span> (पीडीएफ के रूप में सहेजें)
              </li>
              <li>
                <strong>मार्जिन (Margins):</strong>{' '}
                <span style={{ color: '#4ade80', fontWeight: 600 }}>'None'</span> (कोई नहीं / न्यूनतम शून्य मार्जिन)
              </li>
              <li>
                <strong>पृष्ठभूमि ग्राफिक्स (Background graphics):</strong>{' '}
                <span style={{ color: '#4ade80', fontWeight: 600 }}>'On' / चेक करें</span> (ताकि अखबार का बैकग्राउंड और थीम रंग दिखें)
              </li>
              <li>
                <strong>पेज आकार (Paper Size):</strong>{' '}
                <span>{pageSizeLabel}</span> — {orientationLabel}
              </li>
            </ul>
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            ℹ️ यह विकल्प स्थानीय देवनागरी फॉन्ट (Gotu, Hind, Rozha One आदि) को सीधे लोड करता है। इसमें किसी तीसरे पक्ष या बाहरी सर्वर पर डेटा नहीं भेजा जाता।
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#0f172a',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPreparing}
            data-testid="btn-cancel-print"
            style={{
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isPreparing ? 'not-allowed' : 'pointer',
            }}
          >
            रद्द करें (Cancel)
          </button>

          <button
            type="button"
            onClick={onConfirmPrint}
            disabled={isPreparing}
            data-testid="btn-confirm-print"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isPreparing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🖨️</span>
            <span>{isPreparing ? 'तैयार किया जा रहा है...' : 'प्रिंट डायलॉग खोलें (Print)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

