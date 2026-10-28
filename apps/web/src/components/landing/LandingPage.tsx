import React, { useState } from 'react';
import type { NewspaperPresetId } from '@epaper-studio/document-schema';

export interface LandingPageProps {
  onStartCreating: () => void;
  onSelectTemplate: (presetId: NewspaperPresetId) => void;
  onOpenStudio?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onSelectTemplate,
  onOpenStudio,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'broadsheet' | 'tabloid'>('all');

  const templates = [
    {
      id: 'classic-hindi-broadsheet' as NewspaperPresetId,
      formatType: 'broadsheet',
      name: 'जनवाणी समाचार',
      englishTitle: 'National Hindi Daily',
      format: 'Broadsheet (15" × 22.75")',
      columns: '8–12 Columns',
      tag: 'राष्ट्रीय मानक',
      accentColor: '#b91c1c',
      headline: 'वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता',
      description: 'राष्ट्रीय दैनिक समाचार पत्र का प्रामाणिक विन्यास। मुख्य समाचार बैनर, उप-शीर्षक डेक, और विस्तृत संपादकीय स्तंभ।',
    },
    {
      id: 'regional-hindi-tabloid' as NewspaperPresetId,
      formatType: 'tabloid',
      name: 'प्रादेशिक प्रभात',
      englishTitle: 'Regional Morning Tabloid',
      format: 'Tabloid (11" × 17")',
      columns: '4–6 Columns',
      tag: 'कॉम्पैक्ट टैब्लॉइड',
      accentColor: '#0369a1',
      headline: 'हाईटेक एक्सप्रेसवे परियोजना के तीसरे चरण को मिली अंतिम पर्यावरणीय मंजूरी',
      description: 'सघन, सुलभ और फ़ोटो-केंद्रित लेआउट। नगर बुलेटिन और त्वरित पठन के लिए आदर्श प्रारूप।',
    },
    {
      id: 'editorial-opinion-broadsheet' as NewspaperPresetId,
      formatType: 'broadsheet',
      name: 'दैनिक विचार',
      englishTitle: 'Editorial & Opinion Broadsheet',
      format: 'Broadsheet (15" × 22.75")',
      columns: '6 Columns',
      tag: 'संपादकीय समीक्षा',
      accentColor: '#334155',
      headline: 'संपादकीय: डिजिटल युग में क्षेत्रीय भाषाओं का संरक्षण और ज्ञान का लोकतंत्रीकरण',
      description: 'गहन नीतिगत विश्लेषण, साहित्यिक स्तंभ और वैचारिक विमर्श के लिए सुरुचिपूर्ण डिज़ाइन।',
    },
  ];

  const filtered = selectedFormat === 'all'
    ? templates
    : templates.filter((t) => t.formatType === selectedFormat);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.5,
      }}
    >
      {/* ====================================================================
       * 1. CLEAN TOP NAVIGATION BAR
       * ==================================================================== */}
      <header
        style={{
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px',
                fontFamily: "'Noto Serif Devanagari', serif",
                borderRadius: '3px',
              }}
            >
              प
            </div>
            <div>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: '#111827',
                  fontFamily: "'Noto Serif Devanagari', 'Playfair Display', serif",
                }}
              >
                E-Paper Studio
              </span>
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  letterSpacing: '0.04em',
                }}
              >
                XROUNDER
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                style={{
                  backgroundColor: 'transparent',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                संपादक खोलें (Studio)
              </button>
            )}

            <button
              onClick={onStartCreating}
              style={{
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '3px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(185, 28, 28, 0.25)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#991b1b')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
            >
              <span>नया अख़बार बनाएं</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
       * 2. CLEAN HERO SECTION
       * ==================================================================== */}
      <section
        style={{
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: '#fafaf9',
          padding: '48px 20px 60px 20px',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Digital Newspaper Publishing System
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 42px)',
              fontWeight: 900,
              lineHeight: 1.2,
              color: '#111827',
              fontFamily: "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif",
              margin: '0 auto 16px auto',
              maxWidth: '820px',
              letterSpacing: '-0.02em',
            }}
          >
            The Complete Newspaper & E-Paper Publishing Studio
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#4b5563',
              maxWidth: '680px',
              margin: '0 auto 28px auto',
              lineHeight: 1.6,
            }}
          >
            Broadsheet और Tabloid के वास्तविक प्रिंट मानकों पर आधारित। 12-कॉलम मॉड्यूलर ग्रिड, प्रामाणिक देवनागरी मास्टहेड, और 300 DPI प्रेस-रेडी वेक्टर PDF एक्सपोर्ट।
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button
              onClick={onStartCreating}
              style={{
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '3px',
                padding: '12px 28px',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(185, 28, 28, 0.3)',
              }}
            >
              <span>नया अख़बार बनाएं</span>
              <span>→</span>
            </button>

            <a
              href="#templates"
              style={{
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>टेम्पलेट संग्रह देखें</span>
              <span>↓</span>
            </a>
          </div>

          {/* Clean Newspaper Output Preview Card */}
          <div
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              boxShadow: '0 12px 28px -10px rgba(0, 0, 0, 0.12)',
              padding: '24px 20px',
              textAlign: 'left',
              fontFamily: "'Noto Serif Devanagari', serif",
            }}
          >
            {/* Masthead */}
            <div
              style={{
                borderTop: '2px solid #111827',
                borderBottom: '3px double #111827',
                padding: '8px 0',
                textAlign: 'center',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  fontWeight: 900,
                  color: '#b91c1c',
                  lineHeight: 1.1,
                  margin: '0 0 4px 0',
                }}
              >
                जनवाणी समाचार
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.04em', marginBottom: '6px' }}>
                सत्य, निष्पक्षता और राष्ट्र सेवा का प्रतीक • स्थापना 1947
              </div>
              <div
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10.5px',
                  color: '#4b5563',
                  fontWeight: 600,
                  flexWrap: 'wrap',
                  gap: '4px',
                }}
              >
                <span>नई दिल्ली • मंगलवार, 27 अक्टूबर 2026</span>
                <span>वर्ष 78 • अंक 142</span>
                <span>मूल्य: ₹5.00</span>
              </div>
            </div>

            {/* Lead Story Headline */}
            <div style={{ borderBottom: '1px solid #111827', paddingBottom: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase' }}>
                लीड स्टोरी • राष्ट्रीय सम्मेलन
              </div>
              <div
                style={{
                  fontSize: 'clamp(15px, 2.2vw, 19px)',
                  fontWeight: 900,
                  lineHeight: 1.3,
                  color: '#111827',
                }}
              >
                वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता
              </div>
            </div>

            {/* Content snippet */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '11px', lineHeight: 1.55, color: '#374151', margin: 0, textAlign: 'justify' }}>
                  नई दिल्ली। ऊर्जा संरक्षण और हरित प्रौद्योगिकी के क्षेत्र में भारत ने आज एक नया वैश्विक मानक स्थापित किया है। अंतरराष्ट्रीय सम्मेलन में 68 देशों के प्रतिनिधियों ने सर्वसम्मति से साझा निवेश और अनुसंधान हेतु रूपरेखा तैयार की है...
                </p>
              </div>
              <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                  प्रादेशिक समाचार संक्षेप
                </div>
                <p style={{ fontSize: '10.5px', lineHeight: 1.5, color: '#4b5563', margin: 0 }}>
                  • प्रयागराज-वाराणसी सिक्स-लेन परियोजना को मिली अंतिम मंजूरी।
                  <br />
                  • कृषि विज्ञान केंद्र द्वारा रबी फसलों हेतु एडवाइजरी जारी।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * 3. TEMPLATES SHOWCASE
       * ==================================================================== */}
      <section
        id="templates"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '56px 20px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#111827',
              fontFamily: "'Noto Serif Devanagari', 'Playfair Display', serif",
              margin: '0 0 8px 0',
            }}
          >
            प्रमाणित समाचार पत्र प्रारूप (Templates)
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            एक क्लिक में वास्तविक ब्रॉडशीट या टैब्लॉइड प्रारूप से संपादन आरंभ करें
          </p>

          {/* Simple Format Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            {[
              { id: 'all', label: 'सभी प्रारूप' },
              { id: 'broadsheet', label: 'Broadsheet' },
              { id: 'tabloid', label: 'Tabloid' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFormat(f.id as 'all' | 'broadsheet' | 'tabloid')}
                style={{
                  backgroundColor: selectedFormat === f.id ? '#111827' : '#f3f4f6',
                  color: selectedFormat === f.id ? '#ffffff' : '#4b5563',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Clean Template Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {filtered.map((tmpl) => (
            <div
              key={tmpl.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '3px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: tmpl.accentColor,
                      backgroundColor: '#fef2f2',
                      padding: '2px 6px',
                      borderRadius: '2px',
                    }}
                  >
                    {tmpl.tag}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {tmpl.columns}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#111827',
                    fontFamily: "'Noto Serif Devanagari', serif",
                    margin: '0 0 2px 0',
                  }}
                >
                  {tmpl.name}
                </h3>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '10px' }}>
                  {tmpl.englishTitle} • {tmpl.format}
                </div>

                <p style={{ fontSize: '12.5px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {tmpl.description}
                </p>
              </div>

              <button
                onClick={() => onSelectTemplate(tmpl.id)}
                style={{
                  width: '100%',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '9px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tmpl.accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
              >
                <span>यह प्रारूप चुनें</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
       * 4. SIMPLE 3-STEP WORKFLOW
       * ==================================================================== */}
      <section
        style={{
          borderTop: '1px solid #f3f4f6',
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: '#fafaf9',
          padding: '48px 20px',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#111827',
                fontFamily: "'Noto Serif Devanagari', 'Playfair Display', serif",
                margin: '0 0 6px 0',
              }}
            >
              प्रकाशन प्रक्रिया (3 Simple Steps)
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b7280', margin: 0 }}>
              प्रारंभिक शीर्षक से लेकर मुद्रण योग्य प्रेस-रेडी PDF तक
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              {
                num: '1',
                title: 'मास्टहेड और आकार',
                sub: 'Configure Masthead',
                desc: 'Broadsheet या Tabloid चुनें। समाचार पत्र का शीर्षक, संस्करण, तिथि और ध्येय वाक्य सेट करें।',
              },
              {
                num: '2',
                title: '12-कॉलम लेआउट',
                sub: 'Arrange 12-Col Grid',
                desc: 'मुख्य समाचार, फोटो स्टोरी, प्रादेशिक ब्रीफ़ और विज्ञापन बॉक्स जोड़ें।',
              },
              {
                num: '3',
                title: '300 DPI PDF एक्सपोर्ट',
                sub: 'Press-Ready Vector PDF',
                desc: 'एक क्लिक में वास्तविक भौतिक आकार और शुद्ध वेक्टर गुणवत्ता वाली PDF डाउनलोड करें।',
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '3px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 900,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    marginBottom: '10px',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{step.sub}</div>
                <p style={{ fontSize: '12.5px', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
       * 5. MINIMAL CLEAN FOOTER
       * ==================================================================== */}
      <footer
        style={{
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6b7280',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ color: '#111827' }}>E-Paper Studio</strong> — XRounder Newspaper Publishing System
          </div>
          <div>Broadsheet & Tabloid Standards • Press-Ready 300 DPI PDF</div>
        </div>
      </footer>
    </div>
  );
};
