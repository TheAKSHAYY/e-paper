import React from 'react';

export interface FirstUseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStep?: (step: 'choose' | 'write' | 'format' | 'download') => void;
}

export const FirstUseGuideModal: React.FC<FirstUseGuideModalProps> = ({
  isOpen,
  onClose,
  onStartStep,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          maxWidth: '620px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #d5cfc5',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: '#1c1b18',
            color: '#f4f1ea',
            padding: '20px 24px',
            borderBottom: '3px solid #b22222',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#d4af37',
              fontWeight: 700,
              marginBottom: '4px',
            }}
          >
            ई-पेपर स्टूडियो • E-Paper Studio
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '22px',
              fontFamily: "'Rozha One', 'Noto Serif Devanagari', serif",
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.25,
            }}
          >
            अपना हिंदी अख़बार कैसे बनाएँ — त्वरित मार्गदर्शिका
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#ccc', lineHeight: 1.4 }}>
            4 आसान चरणों में पेशेवर और प्रिंटेबल हिंदी समाचार पत्र तैयार करें:
          </p>
        </div>

        {/* 4 Workflow Steps */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Step 1 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              padding: '12px',
              backgroundColor: '#faf8f5',
              borderRadius: '8px',
              border: '1px solid #ebe6dd',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#b22222',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <div
                style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}
              >
                चुनें (प्रारूप व आकार)
              </div>
              <div style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.45 }}>
                राष्ट्रीय ब्रॉडशीट, आधुनिक दैनिक या स्थानीय टैब्लॉयड में से अपनी पसंद का प्रारूप
                चुनें। अख़बार का नाम, संस्करण और दिनांक सेट करें।
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              padding: '12px',
              backgroundColor: '#faf8f5',
              borderRadius: '8px',
              border: '1px solid #ebe6dd',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div>
              <div
                style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}
              >
                लिखें (खबरें व फोटो)
              </div>
              <div style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.45 }}>
                अख़बार की मुख्य लीड खबर, उप-शीर्षक और विस्तृत विवरण लिखें। फोटो का लिंक जोड़ें और
                आवश्यकतानुसार नई खबरें जोड़ें या हटाएँ।
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              padding: '12px',
              backgroundColor: '#faf8f5',
              borderRadius: '8px',
              border: '1px solid #ebe6dd',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div>
              <div
                style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}
              >
                सजाएँ (फॉन्ट व रूप-सज्जा)
              </div>
              <div style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.45 }}>
                प्रामाणिक देवनागरी टाइपोग्राफी (रोज़ा वन, नोटो सेरिफ़, मुक्ता) चुनें। कॉलम की संख्या
                और विभाजक रेखाएँ सेट करें।
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              padding: '12px',
              backgroundColor: '#faf8f5',
              borderRadius: '8px',
              border: '1px solid #ebe6dd',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#2e7d32',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '15px',
                flexShrink: 0,
              }}
            >
              4
            </div>
            <div>
              <div
                style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}
              >
                डाउनलोड करें (प्रिंटेबल PDF)
              </div>
              <div style={{ fontSize: '12.5px', color: '#555', lineHeight: 1.45 }}>
                पूर्वावलोकन देखें और &apos;PDF डाउनलोड करें&apos; बटन दबाकर प्रिंटिंग प्रेस अथवा
                डिजिटल शेयरिंग हेतु वास्तविक वेक्टर PDF प्राप्त करें।
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#f5f3ee',
            borderTop: '1px solid #e2ddd5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '11.5px', color: '#777' }}>
            💡 यह मार्गदर्शिका टूलबार के &apos;मार्गदर्शिका&apos; बटन से कभी भी खोली जा सकती है।
          </div>
          <button
            onClick={() => {
              onClose();
              if (onStartStep) onStartStep('write');
            }}
            style={{
              padding: '10px 22px',
              backgroundColor: '#b22222',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(178,34,34,0.35)',
            }}
          >
            समझ गया, शुरू करें →
          </button>
        </div>
      </div>
    </div>
  );
};
