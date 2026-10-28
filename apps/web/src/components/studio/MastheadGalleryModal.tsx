import React, { useState } from 'react';
import type { MastheadConfig } from '@epaper-studio/document-schema';

export interface MastheadPresetItem {
  id: string;
  name: string;
  category: 'hindi-daily' | 'monochrome' | 'accented' | 'regional';
  description: string;
  config: Partial<MastheadConfig>;
}

export const MASTHEAD_GALLERY_PRESETS: MastheadPresetItem[] = [
  {
    id: 'classic-hindi-double',
    name: 'पारंपरिक राष्ट्रीय दैनिक (Classic Hindi Broadsheet)',
    category: 'hindi-daily',
    description: 'अलंकृत डबल रूल, अशोक चक्र प्रतीक, संपूर्ण मौसम, वायु गुणवत्ता और स्थापना वर्ष।',
    config: {
      title: 'जनवाणी समाचार',
      tagline: 'सत्य, निष्पक्षता और जनसेवा का प्रतीक',
      establishmentYear: '1947',
      fontFamily: "'Rozha One', serif",
      fontSizePt: 54,
      alignment: 'center',
      ruleStyle: 'ornate-double',
      emblem: 'ashoka-chakra',
      showEmblem: true,
      price: 'मूल्य ₹5.00',
      postalRegNumber: 'पंजीयन सं. DL-11001/2026',
      weatherCity: 'नई दिल्ली',
      temperature: '25°C',
      airQuality: 'AQI 128 • मध्यम',
      announcementStripText: 'विशेष दीपावली परिशिष्ट : आज ही अपने हॉकर से निःशुल्क प्राप्त करें',
      showAnnouncementStrip: true,
      showSecondaryHeader: false,
    },
  },
  {
    id: 'modern-hindi-bold',
    name: 'आधुनिक हिंदी दैनिक (Modern Hindi Gazette)',
    category: 'hindi-daily',
    description: 'बोल्ड यात्रा वन फॉन्ट, ऑक्सफ़ोर्ड रूल, लाल एक्सेंट और द्वितीयक हेडर पट्टी।',
    config: {
      title: 'दैनिक नवप्रभात',
      tagline: 'राष्ट्र की सशक्त आवाज़ एवं प्रगतिशील विचार',
      establishmentYear: '1972',
      fontFamily: "'Yatra One', serif",
      fontSizePt: 50,
      alignment: 'center',
      ruleStyle: 'oxford-thick-thin',
      emblem: 'sun',
      showEmblem: true,
      price: 'मूल्य ₹4.50',
      postalRegNumber: 'पंजीयन सं. UP-42001/2026',
      weatherCity: 'लखनऊ',
      temperature: '27°C',
      airQuality: 'AQI 142 • मध्यम',
      secondaryHeaderTitle: 'प्रादेशिक एवं राष्ट्रीय राजधानी संस्करण',
      secondaryHeaderSubtitle: 'दिल्ली • लखनऊ • पटना • भोपाल • जयपुर • चंडीगढ़',
      showSecondaryHeader: true,
      announcementStripText: '',
      showAnnouncementStrip: false,
    },
  },
  {
    id: 'monochrome-broadsheet',
    name: 'शास्त्रीय ब्लैक & व्हाइट ब्रॉडशीट (Monochrome Heritage)',
    category: 'monochrome',
    description:
      'प्योर ब्लैक इंक, सिंगल हेयरलाइन रूल, कलम का प्रतीक और सुरुचिपूर्ण सेरिफ़ टाइपोग्राफी।',
    config: {
      title: 'THE CHRONICLE',
      tagline: 'Founded on Truth, Independent in Discourse',
      establishmentYear: '1888',
      fontFamily: "'Playfair Display', serif",
      fontSizePt: 52,
      alignment: 'center',
      ruleStyle: 'single-hairline',
      emblem: 'quill',
      showEmblem: true,
      price: '$2.50',
      postalRegNumber: 'ISSN 0971-8257',
      weatherCity: 'New Delhi',
      temperature: '24°C',
      airQuality: 'AQI 65 • Moderate',
      showSecondaryHeader: false,
      showAnnouncementStrip: false,
    },
  },
  {
    id: 'color-accented-lead',
    name: 'कलर एक्सेंटेड मेट्रो न्यूज़ (Accented Metro Daily)',
    category: 'accented',
    description: 'रॉयल ब्लू व लीड रेड एक्सेंट, ऊपर ब्रेकिंग अनाउंसमेंट स्ट्रिप और वेबसाइट हाइलाइट।',
    config: {
      title: 'मेट्रो संध्या समाचार',
      tagline: 'राजधानी का सबसे तेज़ और विश्वसनीय सांध्य दैनिक',
      establishmentYear: '2005',
      fontFamily: "'Rozha One', serif",
      fontSizePt: 48,
      alignment: 'left',
      ruleStyle: 'classic-double',
      emblem: 'lion-capital',
      showEmblem: true,
      price: 'मूल्य ₹3.00',
      weatherCity: 'मुंबई',
      temperature: '29°C',
      airQuality: 'AQI 88 • संतोषजनक',
      announcementStripText: 'लाइव अपडेट्स के लिए विजिट करें: www.metrosandhya.in',
      showAnnouncementStrip: true,
      secondaryHeaderTitle: 'व्यापार, शेयर बाज़ार एवं नगर संस्करण',
      secondaryHeaderSubtitle: 'विशेष कवरेज: सेंसेक्स और अंतरराष्ट्रीय व्यापार समाचार',
      showSecondaryHeader: true,
    },
  },
  {
    id: 'regional-gazette-local',
    name: 'क्षेत्रीय संदेश पत्रिका (Regional District Gazette)',
    category: 'regional',
    description: 'जिला व कस्बाई स्तर के पाठकों के लिए घनीभूत 3-रो हेडर और डाक पंजीयन सूचना।',
    config: {
      title: 'जनसंदेश पत्रिका',
      tagline: 'क्षेत्रीय समस्याएं, जनचेतना और ग्रामीण विकास का मुखपत्र',
      establishmentYear: '1998',
      fontFamily: "'Noto Serif Devanagari', serif",
      fontSizePt: 46,
      alignment: 'center',
      ruleStyle: 'ornate-double',
      emblem: 'none',
      showEmblem: false,
      price: 'मूल्य ₹3.50',
      postalRegNumber: 'पंजीयन सं. RJ-2026/0491',
      weatherCity: 'वाराणसी',
      temperature: '26°C',
      airQuality: 'AQI 110 • मध्यम',
      showSecondaryHeader: false,
      showAnnouncementStrip: false,
    },
  },
];

export interface MastheadGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle?: string;
  currentConfig?: MastheadConfig;
  onSelectPreset?: (config: Partial<MastheadConfig>) => void;
  onApplyPreset?: (config: Partial<MastheadConfig>) => void;
}

export const MastheadGalleryModal: React.FC<MastheadGalleryModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  currentConfig,
  onSelectPreset,
  onApplyPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'hindi-daily' | 'monochrome' | 'accented' | 'regional'
  >('all');

  const handleApply = (cfg: Partial<MastheadConfig>) => {
    onSelectPreset?.(cfg);
    onApplyPreset?.(cfg);
  };

  if (!isOpen) return null;

  const filtered = MASTHEAD_GALLERY_PRESETS.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              🗞️ समाचार पत्र हेडर व मास्टहेड शैलियाँ (Masthead Presets)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              पारंपरिक हिंदी दैनिक, क्लासिक ब्रॉडशीट और आधुनिक हेडर लेआउट चुनें
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div
          style={{
            padding: '10px 20px',
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          {[
            { id: 'all', label: 'सभी शैलियाँ (All)' },
            { id: 'hindi-daily', label: 'हिंदी दैनिक (Hindi Dailies)' },
            { id: 'monochrome', label: 'क्लासिक मोनोक्रोम (Monochrome)' },
            { id: 'accented', label: 'कलर एक्सेंटेड (Accented)' },
            { id: 'regional', label: 'क्षेत्रीय पत्रिका (Regional)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setSelectedCategory(
                  cat.id as 'all' | 'hindi-daily' | 'monochrome' | 'accented' | 'regional'
                )
              }
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 600,
                border: selectedCategory === cat.id ? '1px solid #b91c1c' : '1px solid #cbd5e1',
                backgroundColor: selectedCategory === cat.id ? '#b91c1c' : '#ffffff',
                color: selectedCategory === cat.id ? '#ffffff' : '#334155',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Presets List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {item.name}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleApply({
                      ...item.config,
                      // Preserve current publication title if user already customized it
                      title: currentTitle || currentConfig?.title || item.config.title,
                    });
                    onClose();
                  }}
                  style={{
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  लागू करें (Apply)
                </button>
              </div>

              {/* Header Visual Simulation Box */}
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                }}
              >
                {item.config.showAnnouncementStrip && (
                  <div
                    style={{
                      backgroundColor: '#b91c1c',
                      color: '#ffffff',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      marginBottom: '4px',
                      borderRadius: '2px',
                    }}
                  >
                    {item.config.announcementStripText || 'विशेष बुलेटिन'}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    color: '#475569',
                    borderBottom: '1px solid #111111',
                    paddingBottom: '2px',
                    marginBottom: '4px',
                  }}
                >
                  <span>
                    मौसम: {item.config.weatherCity || 'नई दिल्ली'}{' '}
                    {item.config.temperature || '25°C'}
                  </span>
                  <span style={{ fontStyle: 'italic' }}>{item.config.tagline}</span>
                  <span>{item.config.price || 'मूल्य ₹5.00'}</span>
                </div>

                <div
                  style={{
                    fontFamily: item.config.fontFamily || "'Rozha One', serif",
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#111111',
                    margin: '2px 0',
                    textAlign:
                      (item.config.alignment as React.CSSProperties['textAlign']) || 'center',
                  }}
                >
                  {item.config.title}
                </div>

                {item.config.showSecondaryHeader && item.config.secondaryHeaderTitle && (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#2563eb',
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: '2px',
                      marginTop: '2px',
                    }}
                  >
                    {item.config.secondaryHeaderTitle}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
