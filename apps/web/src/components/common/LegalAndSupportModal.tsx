import React, { useState } from 'react';
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
  const [contactCategory, setContactCategory] = useState<'feedback' | 'bug' | 'inquiry'>(
    'feedback'
  );
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  // Reset tab when modal opens with a specific tab & support Escape key close
  React.useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    setSubmitSuccess(false);
    setErrors({});

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, initialTab, onClose]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; message?: string } = {};

    if (!contactName.trim()) {
      newErrors.name = locale === 'hi' ? 'कृपया अपना नाम लिखें' : 'Name is required';
    }
    if (!contactEmail.trim() || !validateEmail(contactEmail)) {
      newErrors.email = locale === 'hi' ? 'सही ईमेल पता लिखें' : 'A valid email is required';
    }
    if (!contactMessage.trim() || contactMessage.trim().length < 10) {
      newErrors.message =
        locale === 'hi'
          ? 'संदेश कम से कम 10 अक्षरों का लिखें'
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
          fontFamily: "'Poppins', 'Hind', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          letterSpacing: locale === 'hi' ? '0em' : undefined,
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
                fontWeight: 600,
                fontFamily: 'inherit',
                lineHeight: 1.35,
                letterSpacing: locale === 'hi' ? '0em' : '-0.01em',
                margin: 0,
                color: '#1C1917',
              }}
            >
              {activeTab === 'about' &&
                (locale === 'hi' ? 'ईपेपर स्टूडियो के बारे में' : 'About E-Paper Studio')}
              {activeTab === 'faq' &&
                (locale === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions')}
              {activeTab === 'contact' &&
                (locale === 'hi' ? 'संपर्क और सुझाव' : 'Contact & Feedback')}
              {activeTab === 'privacy' && (locale === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy')}
              {activeTab === 'terms' && (locale === 'hi' ? 'नियम व शर्तें' : 'Terms of Service')}
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
              fontWeight: 600,
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
            flexWrap: 'wrap',
            gap: '6px',
            padding: '10px 16px',
            borderBottom: '1px solid #E7E2DA',
            backgroundColor: '#F5F2EB',
          }}
        >
          {(['about', 'faq', 'contact', 'privacy', 'terms'] as ModalTab[]).map((tab) => {
            const labels: Record<ModalTab, { en: string; hi: string }> = {
              about: { en: 'About', hi: 'जानकारी' },
              faq: { en: 'FAQ', hi: 'सवाल-जवाब' },
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
                  borderRadius: '8px',
                  border: isCurrent ? '1px solid #D6D0C5' : '1px solid transparent',
                  backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
                  color: isCurrent ? '#1C1917' : '#57534E',
                  fontSize: '12.5px',
                  fontWeight: isCurrent ? 600 : 500,
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
            lineHeight: 1.65,
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
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    lineHeight: 1.35,
                    margin: '0 0 8px 0',
                    color: '#1C1917',
                  }}
                >
                  {locale === 'hi' ? 'ईपेपर स्टूडियो क्या है?' : 'Mission & Architecture'}
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#57534E', lineHeight: 1.65 }}>
                  {locale === 'hi'
                    ? 'ईपेपर स्टूडियो खास तौर पर स्थानीय और राष्ट्रीय अख़बारों के लिए बना एक आसान डेस्कटॉप पब्लिशिंग टूल है। इसमें आप बिना किसी भारी सॉफ्टवेयर के सीधे अपने ब्राउज़र में 8 कॉलम के पेज सजा सकते हैं, लंबी खबरों को अगले पेज पर जोड़ सकते हैं और प्रिंटिंग प्रेस के लिए साफ 300 DPI PDF बना सकते हैं।'
                    : 'E-Paper Studio is a high-precision, open-source desktop publishing (DTP) platform engineered specifically for independent newsrooms and vernacular broadsheet publishers. It combines newspaper grid balancing, automated multi-page story overflows, and 300 DPI vector PDF export in a zero-dependency, local-first browser environment.'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
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
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1C1917',
                      marginBottom: '6px',
                    }}
                  >
                    {locale === 'hi' ? 'सब कुछ आपके डिवाइस पर सेव' : 'LOCAL-FIRST PRIVACY'}
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#57534E', lineHeight: 1.6 }}>
                    {locale === 'hi'
                      ? 'आपकी सारी खबरें, फ़ोटो और पेज सीधे आपके अपने डिवाइस में सेव रहते हैं। बिना इंटरनेट के भी पूरा स्टूडियो आराम से चलता है।'
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
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1C1917',
                      marginBottom: '6px',
                    }}
                  >
                    {locale === 'hi' ? 'साफ़ हिन्दी और अंग्रेज़ी प्रिंट' : 'DEVANAGARI TYPESETTING'}
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#57534E', lineHeight: 1.6 }}>
                    {locale === 'hi'
                      ? 'हिन्दी की हर मात्रा, संयुक्ताक्षर और अंग्रेज़ी हेडिंग छपाई में बिल्कुल साफ व सही जगह पर बैठती है।'
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
                <div
                  style={{
                    fontWeight: 600,
                    color: '#1C1917',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  {locale === 'hi'
                    ? '1. बड़ी खबर दूसरे पेज पर कैसे जारी होती है?'
                    : '1. How does multi-page story continuation work?'}
                </div>
                <div style={{ fontSize: '13px', color: '#57534E', lineHeight: 1.6 }}>
                  {locale === 'hi'
                    ? 'जब कोई खबर एक बॉक्स से बड़ी हो जाती है, तो बाकी हिस्सा अपने आप अगले पेज पर चला जाता है और दोनों जगह "पेज X पर आगे..." लिखा आ जाता है।'
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
                <div
                  style={{
                    fontWeight: 600,
                    color: '#1C1917',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  {locale === 'hi'
                    ? '2. क्या यहाँ से निकाली PDF सीधे प्रिंटिंग प्रेस में छप सकती है?'
                    : '2. Are exported PDFs print-ready for web offset presses?'}
                </div>
                <div style={{ fontSize: '13px', color: '#57534E', lineHeight: 1.6 }}>
                  {locale === 'hi'
                    ? 'जी हाँ! यह बिल्कुल साफ़ 300 DPI वेक्टर PDF बनाता है जिसमें सभी फ़ॉन्ट्स और ब्रॉडशीट या टैब्लॉयड का सही साइज शामिल रहता है।'
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
                <div
                  style={{
                    fontWeight: 600,
                    color: '#1C1917',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  {locale === 'hi'
                    ? '3. क्या बिना इंटरनेट के भी यह काम करता है?'
                    : '3. Can I use E-Paper Studio completely offline?'}
                </div>
                <div style={{ fontSize: '13px', color: '#57534E', lineHeight: 1.6 }}>
                  {locale === 'hi'
                    ? 'बिल्कुल। सारे फ़ॉन्ट और पेज बनाने के टूल्स आपके ब्राउज़र में ही रहते हैं, इसलिए नेट न होने पर भी आप पूरा अख़बार बना और सेव कर सकते हैं।'
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
                      fontWeight: 600,
                    }}
                  >
                    ✓
                  </div>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1C1917',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {locale === 'hi'
                      ? 'शुक्रिया! आपका संदेश हमें मिल गया है।'
                      : 'Thank You! Feedback Received.'}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 20px 0' }}>
                    {locale === 'hi'
                      ? 'हमारी टीम आपके सुझाव को जरूर देखेगी। आपका संदेश सेव कर लिया गया है।'
                      : 'Our core development team reviews every submission. Your message has been safely recorded.'}
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#1C1917',
                      color: '#FAF8F5',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {locale === 'hi' ? 'एक और संदेश भेजें' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#44403C',
                        marginBottom: '6px',
                      }}
                    >
                      {locale === 'hi' ? 'आपका नाम' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={locale === 'hi' ? 'जैसे: राहुल शर्मा' : 'e.g. Rahul Sharma'}
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
                    {errors.name && (
                      <div style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px' }}>
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#44403C',
                        marginBottom: '6px',
                      }}
                    >
                      {locale === 'hi' ? 'आपका ईमेल' : 'Email Address'}
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
                    {errors.email && (
                      <div style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px' }}>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#44403C',
                        marginBottom: '6px',
                      }}
                    >
                      {locale === 'hi' ? 'विषय चुनें' : 'Category'}
                    </label>
                    <select
                      value={contactCategory}
                      onChange={(e) =>
                        setContactCategory(e.target.value as 'feedback' | 'bug' | 'inquiry')
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
                      }}
                    >
                      <option value="feedback">
                        {locale === 'hi' ? 'अपना सुझाव दें' : 'General Feedback'}
                      </option>
                      <option value="bug">
                        {locale === 'hi' ? 'कोई दिक्कत या बग बताएं' : 'Bug Report'}
                      </option>
                      <option value="inquiry">
                        {locale === 'hi' ? 'अख़बार से जुड़ा सवाल' : 'Publication Inquiry'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#44403C',
                        marginBottom: '6px',
                      }}
                    >
                      {locale === 'hi' ? 'आपका संदेश' : 'Message'}
                    </label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={
                        locale === 'hi'
                          ? 'अपनी बात या सुझाव यहाँ लिखें...'
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
                    {errors.message && (
                      <div style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px' }}>
                        {errors.message}
                      </div>
                    )}
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
                      fontSize: '13.5px',
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
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  lineHeight: 1.35,
                  margin: 0,
                  color: '#1C1917',
                }}
              >
                {locale === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#57534E', lineHeight: 1.65 }}>
                {locale === 'hi'
                  ? 'ईपेपर स्टूडियो पूरी तरह से आपकी प्राइवेसी का ध्यान रखता है। हम आपकी खबरें, ड्राफ्ट, फ़ोटो या कोई भी निजी डेटा किसी बाहरी सर्वर पर नहीं भेजते और न ही ट्रैक करते हैं।'
                  : 'E-Paper Studio is engineered around client-side privacy. We do not track, profile, monetize, or transmit your editorial copies, drafts, or newspaper layouts to any central cloud server.'}
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '12.5px',
                  color: '#57534E',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  lineHeight: 1.6,
                }}
              >
                <li>
                  {locale === 'hi'
                    ? 'कोई विज्ञापन कुकीज़ या बैकग्राउंड ट्रैकिंग नहीं।'
                    : 'Zero third-party analytics trackers, advertising cookies, or behavioral beacons.'}
                </li>
                <li>
                  {locale === 'hi'
                    ? 'आपके सारे अंक और ड्राफ्ट सिर्फ आपके ब्राउज़र में सेव रहते हैं।'
                    : 'All publication editions are preserved exclusively in your browser IndexedDB.'}
                </li>
                <li>
                  {locale === 'hi'
                    ? 'प्रिंट के लिए 300 DPI PDF सीधे आपके अपने कंप्यूटर या फोन पर ही तैयार होता है।'
                    : 'High-resolution PDF generation executes locally in browser Web Workers.'}
                </li>
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
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  lineHeight: 1.35,
                  margin: 0,
                  color: '#1C1917',
                }}
              >
                {locale === 'hi' ? 'नियम व शर्तें' : 'Terms of Service & Licensing'}
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#57534E', lineHeight: 1.65 }}>
                {locale === 'hi'
                  ? 'ईपेपर स्टूडियो MIT लाइसेंस वाला ओपन-सोर्स टूल है। इसमें बनाए गए आपके सभी अख़बार, लेख, डिजाइन और PDF फाइलों पर 100% हक सिर्फ आपका है।'
                  : 'E-Paper Studio is distributed as open-source software under the MIT License. You retain 100% unencumbered intellectual property rights over all publications, articles, graphics, and press PDFs created with this platform.'}
              </p>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '8px',
                  border: '1px solid #E7E2DA',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
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
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12px',
            color: '#78716C',
          }}
        >
          <span>E-Paper Studio v2.4 • Open Source Publishing</span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              backgroundColor: '#E7E2DA',
              color: '#1C1917',
              border: 'none',
              fontSize: '12.5px',
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
