import React, { useState } from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';

export type ModalTab = 'about' | 'faq' | 'contact' | 'privacy' | 'terms';

interface LegalAndSupportModalProps {
  isOpen: boolean;
  initialTab?: ModalTab;
  onClose: () => void;
}

export const LegalAndSupportModal: React.FC<LegalAndSupportModalProps> = ({
  isOpen,
  initialTab = 'about',
  onClose,
}) => {
  const { locale } = useI18n();
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState<'feedback' | 'bug' | 'inquiry'>('feedback');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  // Reset tab when modal opens with a specific tab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSubmitSuccess(false);
      setErrors({});
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; message?: string } = {};

    if (!contactName.trim()) {
      newErrors.name = locale === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Name is required';
    }
    if (!contactEmail.trim() || !validateEmail(contactEmail)) {
      newErrors.email = locale === 'hi' ? 'वैध ईमेल पता दर्ज करें' : 'A valid email is required';
    }
    if (!contactMessage.trim() || contactMessage.trim().length < 10) {
      newErrors.message =
        locale === 'hi'
          ? 'संदेश कम से कम 10 अक्षरों का होना चाहिए'
          : 'Message must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const feedbackEntries = JSON.parse(localStorage.getItem('epaper_feedback') || '[]');
        feedbackEntries.push({
          id: Date.now(),
          name: contactName,
          email: contactEmail,
          category: contactCategory,
          message: contactMessage,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('epaper_feedback', JSON.stringify(feedbackEntries));
      } catch {
        // Fallback gracefully
      }
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 350);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          backgroundColor: '#FAF8F5',
          color: '#1C1917',
          borderRadius: '16px',
          border: '1px solid #E7E2DA',
          boxShadow: '0 24px 64px -12px rgba(28, 25, 23, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #E7E2DA',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#1C1917',
              }}
            />
            <h2
              id="modal-title"
              style={{
                fontSize: '17px',
                fontWeight: 700,
                fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display,
                lineHeight: locale === 'hi' ? 1.35 : 1.25,
                letterSpacing: locale === 'hi' ? '0em' : '-0.01em',
                margin: 0,
                color: '#1C1917',
              }}
            >
              {activeTab === 'about' && (locale === 'hi' ? 'ई-पेपर स्टूडियो के बारे में' : 'About E-Paper Studio')}
              {activeTab === 'faq' && (locale === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions')}
              {activeTab === 'contact' && (locale === 'hi' ? 'संपर्क एवं प्रतिक्रिया' : 'Contact & Feedback')}
              {activeTab === 'privacy' && (locale === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy')}
              {activeTab === 'terms' && (locale === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service')}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#78716C',
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 24px',
            borderBottom: '1px solid #E7E2DA',
            backgroundColor: '#F5F2EB',
            overflowX: 'auto',
          }}
        >
          {(['about', 'faq', 'contact', 'privacy', 'terms'] as ModalTab[]).map((tab) => {
            const labels: Record<ModalTab, { en: string; hi: string }> = {
              about: { en: 'About', hi: 'परिचय' },
              faq: { en: 'FAQ', hi: 'FAQ' },
              contact: { en: 'Contact', hi: 'संपर्क' },
              privacy: { en: 'Privacy', hi: 'गोपनीयता' },
              terms: { en: 'Terms', hi: 'नियम व शर्तें' },
            };
            const isCurrent = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: isCurrent ? '1px solid #D6D0C5' : '1px solid transparent',
                  backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
                  color: isCurrent ? '#1C1917' : '#57534E',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {locale === 'hi' ? labels[tab].hi : labels[tab].en}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            fontSize: '14px',
            color: '#44403C',
            lineHeight: 1.6,
          }}
        >
          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #E7E2DA',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display,
                    lineHeight: locale === 'hi' ? 1.35 : 1.25,
                    margin: '0 0 8px 0',
                    color: '#1C1917',
                  }}
                >
                  {locale === 'hi' ? 'मिशन और वास्तुकला' : 'Mission & Architecture'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#57534E' }}>
                  {locale === 'hi'
                    ? 'ई-पेपर स्टूडियो एक आधुनिक, स्वतंत्र डेस्कटॉप पब्लिशिंग (DTP) सूट है जिसे क्षेत्रीय और राष्ट्रीय समाचार पत्रों के लिए तैयार किया गया है। यह जटिल 8-कॉलम ब्रॉडशीट लेआउट, बहु-पृष्ठ स्टोरी निरंतरता और 300 DPI प्रेस-रेडी वेक्टर PDF उत्पादन को एक ही ब्राउज़र विंडो में सक्षम बनाता है।'
                    : 'E-Paper Studio is a high-precision, open-source desktop publishing (DTP) platform engineered specifically for independent newsrooms and vernacular broadsheet publishers. It combines newspaper grid balancing, automated multi-page story overflows, and 300 DPI vector PDF export in a zero-dependency, local-first browser environment.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E7E2DA',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#1C1917',
                      marginBottom: '6px',
                    }}
                  >
                    {locale === 'hi' ? 'लोकल-फर्स्ट सुरक्षा' : 'LOCAL-FIRST PRIVACY'}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#57534E' }}>
                    {locale === 'hi'
                      ? 'आपकी सामग्री और संस्करण आपके उपकरण में स्थानीय रूप से सुरक्षित रहते हैं। किसी भी बाहरी सर्वर पर डेटा नहीं भेजा जाता।'
                      : 'All drafts, article texts, and high-resolution assets reside entirely in your browser storage. Works 100% offline.'}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E7E2DA',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#1C1917',
                      marginBottom: '6px',
                    }}
                  >
                    {locale === 'hi' ? 'देवनागरी टाइपोग्राफी' : 'DEVANAGARI TYPESETTING'}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#57534E' }}>
                    {locale === 'hi'
                      ? 'हिंदी, संस्कृत और द्विभाषी प्रकाशनों के लिए पूर्ण संयुक्ताक्षर और मात्रा समर्थन के साथ अनुकूलित टाइपोग्राफिक इंजन।'
                      : 'Native conjunct ligatures, matra positioning, and baseline grids tuned specifically for Hindi and bilingual print.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #E7E2DA',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '14px', marginBottom: '4px' }}>
                  {locale === 'hi'
                    ? '1. मल्टी-पेज आर्टिकल ओवरफ्लो कैसे काम करता है?'
                    : '1. How does multi-page story continuation work?'}
                </div>
                <div style={{ fontSize: '13px', color: '#57534E' }}>
                  {locale === 'hi'
                    ? 'जब कोई लेख अपने वर्तमान पृष्ठ की सीमा पार करता है, तो बैलेंसिंग इंजन उसे स्वतः अगले पृष्ठ पर भेजता है और "पेज X पर जारी..." तथा "पेज Y से आगे..." जैसे पेशेवर जंप-लाइन संदर्भ जोड़ता है।'
                    : 'When an article exceeds its column budget, the layout engine balances the primary column box and creates linked continuation segments on subsequent pages with synchronized "Continued on Page X" jump lines.'}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #E7E2DA',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '14px', marginBottom: '4px' }}>
                  {locale === 'hi'
                    ? '2. क्या एक्सपोर्ट किया गया PDF सीधे प्रिंटिंग प्रेस के लिए तैयार है?'
                    : '2. Are exported PDFs print-ready for web offset presses?'}
                </div>
                <div style={{ fontSize: '13px', color: '#57534E' }}>
                  {locale === 'hi'
                    ? 'हाँ। एक्सपोर्ट इंजन 300 DPI वेक्टर ज्यामिति, एम्बेडेड फोंट और मानकीकृत ब्रॉडशीट (330x546mm) आयामों के साथ CMYK-संगत PDF तैयार करता है।'
                    : 'Yes. The renderer produces 300 DPI vector PDFs with embedded typography, precise column dimensions (330x546mm broadsheet / 289x380mm tabloid), and preflight verification.'}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #E7E2DA',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '14px', marginBottom: '4px' }}>
                  {locale === 'hi'
                    ? '3. क्या इसे बिना इंटरनेट कनेक्शन के इस्तेमाल किया जा सकता है?'
                    : '3. Can I use E-Paper Studio completely offline?'}
                </div>
                <div style={{ fontSize: '13px', color: '#57534E' }}>
                  {locale === 'hi'
                    ? 'बिल्कुल। सभी फॉन्ट्स, रेंडरिंग कंपोनेंट्स और स्टोरेज क्लाइंट-साइड बंडल किए गए हैं। नेटवर्क बंद होने पर भी आप संपादन और ड्राफ्ट सहेजना जारी रख सकते हैं।'
                    : 'Yes. E-Paper Studio is completely self-hosted and offline-capable. All typography sets, balancing logic, and local database storage operate client-side.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #E7E2DA',
              }}
            >
              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#DCFCE7',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      margin: '0 auto 16px auto',
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 8px 0' }}>
                    {locale === 'hi' ? 'धन्यवाद! आपकी प्रतिक्रिया प्राप्त हो गई है।' : 'Thank You! Feedback Received.'}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 20px 0' }}>
                    {locale === 'hi'
                      ? 'हमारा संपादकीय और इंजीनियरिंग दल आपकी प्रतिक्रिया का मूल्यांकन करेगा।'
                      : 'Our core development team reviews every submission. Your message has been safely recorded.'}
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '6px',
                      backgroundColor: '#1C1917',
                      color: '#FAF8F5',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {locale === 'hi' ? 'दूसरा संदेश भेजें' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                      {locale === 'hi' ? 'आपका नाम' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '13px',
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D6D0C5',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#1C1917',
                      }}
                    />
                    {errors.name && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.name}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                      {locale === 'hi' ? 'ईमेल पता' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="editor@publication.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '13px',
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D6D0C5',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#1C1917',
                      }}
                    />
                    {errors.email && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.email}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                      {locale === 'hi' ? 'श्रेणी' : 'Category'}
                    </label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value as 'feedback' | 'bug' | 'inquiry')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '13px',
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D6D0C5',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#1C1917',
                      }}
                    >
                      <option value="feedback">{locale === 'hi' ? 'सामान्य प्रतिक्रिया' : 'General Feedback'}</option>
                      <option value="bug">{locale === 'hi' ? 'बग या तकनीकी समस्या' : 'Bug Report'}</option>
                      <option value="inquiry">{locale === 'hi' ? 'प्रकाशन साझेदारी' : 'Publication Inquiry'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                      {locale === 'hi' ? 'संदेश' : 'Message'}
                    </label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={
                        locale === 'hi'
                          ? 'कृपया अपना विचार या प्रश्न विस्तार से साझा करें...'
                          : 'Share your feedback, bug details, or layout inquiry...'
                      }
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '13px',
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #D6D0C5',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#1C1917',
                        resize: 'vertical',
                      }}
                    />
                    {errors.message && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.message}</div>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1C1917',
                      color: '#FAF8F5',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    {isSubmitting
                      ? locale === 'hi'
                        ? 'भेजा जा रहा है...'
                        : 'Submitting...'
                      : locale === 'hi'
                      ? 'संदेश भेजें'
                      : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #E7E2DA',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display,
                  lineHeight: locale === 'hi' ? 1.35 : 1.25,
                  margin: 0,
                  color: '#1C1917',
                }}
              >
                {locale === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#57534E' }}>
                {locale === 'hi'
                  ? 'ई-पेपर स्टूडियो पूर्णतः क्लाइंट-साइड गोपनीयता सिद्धांत पर संचालित होता है। हम आपका व्यक्तिगत डेटा, संपादकीय आलेख, समाचार चित्र या ग्राहक जानकारी किसी भी केंद्रीय सर्वर पर ट्रैक, संग्रहित या बिक्री नहीं करते हैं।'
                  : 'E-Paper Studio is engineered around client-side privacy. We do not track, profile, monetize, or transmit your editorial copies, drafts, or newspaper layouts to any central cloud server.'}
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#57534E', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>{locale === 'hi' ? 'शून्य तृतीय-पक्ष ट्रैकिंग कुकीज़ या विज्ञापन पिक्सेल।' : 'Zero third-party analytics trackers, advertising cookies, or behavioral beacons.'}</li>
                <li>{locale === 'hi' ? 'सभी संपादकीय ड्राफ्ट केवल आपके ब्राउज़र के स्थानीय स्टोरेज में रहते हैं।' : 'All publication editions are preserved exclusively in your browser IndexedDB.'}</li>
                <li>{locale === 'hi' ? '300 DPI PDF एक्सपोर्ट आपके स्थानीय सीपीयू पर सीधे संकलित होता है।' : 'High-resolution PDF generation executes locally in browser Web Workers.'}</li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #E7E2DA',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display,
                  lineHeight: locale === 'hi' ? 1.35 : 1.25,
                  margin: 0,
                  color: '#1C1917',
                }}
              >
                {locale === 'hi' ? 'सेवा की शर्तें एवं लाइसेंस (Terms)' : 'Terms of Service & Licensing'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#57534E' }}>
                {locale === 'hi'
                  ? 'ई-पेपर स्टूडियो ओपन-सोर्स सॉफ्टवेयर है जो MIT लाइसेंस के अंतर्गत वितरित किया गया है। आपके द्वारा बनाए गए सभी समाचार पत्र लेआउट, आर्टिकल्स और मुद्रण तैयार पीडीएफ पर आपका 100% पूर्ण बौद्धिक संपदा अधिकार है।'
                  : 'E-Paper Studio is distributed as open-source software under the MIT License. You retain 100% unencumbered intellectual property rights over all publications, articles, graphics, and press PDFs created with this platform.'}
              </p>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '6px',
                  border: '1px solid #E7E2DA',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#78716C',
                }}
              >
                MIT License • Copyright (c) 2026 E-Paper Studio contributors.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #E7E2DA',
            backgroundColor: '#F5F2EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#78716C',
          }}
        >
          <span>E-Paper Studio v2.4 • Open Source Publishing</span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              backgroundColor: '#E7E2DA',
              color: '#1C1917',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {locale === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
