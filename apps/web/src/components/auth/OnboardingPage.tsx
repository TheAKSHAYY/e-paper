import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { NewspaperIcon } from './AuthIcons';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface OnboardingPageProps {
  onComplete: () => void;
  onBackToLanding: () => void;
  onOpenLegalModal?: (tab: 'privacy' | 'terms' | 'contact' | 'faq') => void;
}

const ONBOARDING_STEP_KEY = 'epaper_studio_onboarding_step';

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
  onBackToLanding,
  onOpenLegalModal,
}) => {
  const { locale, setLocale } = useI18n();
  const { user, profile, completeOnboarding } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  // Persist current step in session storage so page refresh retains progress
  const [step, setStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_STEP_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const goToStep = (s: number) => {
    setStep(s);
    try {
      sessionStorage.setItem(ONBOARDING_STEP_KEY, s.toString());
    } catch {
      // Ignored
    }
  };

  // Form state
  const [fullName, setFullName] = useState(user?.fullName || profile?.fullName || '');
  const [publicationName, setPublicationName] = useState(
    profile?.publicationName || (locale === 'hi' ? 'दैनिक नवप्रभात' : 'The Morning Chronicle')
  );
  const [publicationTagline, setPublicationTagline] = useState(
    profile?.publicationTagline ||
      (locale === 'hi' ? 'सत्य, निष्पक्षता और जनसेवा का प्रतीक' : 'Independent Voice of Truth')
  );
  const [primaryLanguage, setPrimaryLanguage] = useState<'en' | 'hi'>(locale);
  const [preferredPageSize, setPreferredPageSize] = useState<
    'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4'
  >('broadsheet');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!publicationName.trim()) {
      setError(
        locale === 'hi' ? 'कृपया प्रकाशन का नाम दर्ज करें।' : 'Please enter your publication name.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeOnboarding({
        fullName: fullName.trim() || user?.fullName || 'Editor in Chief',
        publicationName: publicationName.trim(),
        publicationTagline: publicationTagline.trim(),
        primaryLanguage,
        preferredPageSize,
      });

      if (res.success) {
        sessionStorage.removeItem(ONBOARDING_STEP_KEY);
        onComplete();
      } else {
        setError(res.error || 'Failed to complete onboarding');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? locale === 'hi'
            ? 'आपकी पहचान'
            : 'Editor Profile'
          : step === 2
            ? locale === 'hi'
              ? 'अख़बार का नाम'
              : 'Publication Setup'
            : step === 3
              ? locale === 'hi'
                ? 'भाषा और पेज साइज'
                : 'Print Preferences'
              : locale === 'hi'
                ? 'सब तैयार है!'
                : 'Welcome to your Newsroom!'
      }
      subtitle={
        step === 1
          ? locale === 'hi'
            ? 'स्टेप 1 / 4: अपना नाम और ईमेल चेक करें।'
            : 'Step 1 of 4: Setup your editorial identity.'
          : step === 2
            ? locale === 'hi'
              ? 'स्टेप 2 / 4: अपने अख़बार का नाम और टैगलाइन लिखें।'
              : 'Step 2 of 4: Configure your primary newspaper title.'
            : step === 3
              ? locale === 'hi'
                ? 'स्टेप 3 / 4: अपनी भाषा और पेज का आकार चुनें।'
                : 'Step 3 of 4: Choose your default broadsheet or tabloid geometry.'
              : locale === 'hi'
                ? 'स्टेप 4 / 4: आपका अख़बार स्टूडियो काम करने के लिए तैयार है।'
                : 'Step 4 of 4: Your editorial workspace is ready.'
      }
      onBackToLanding={onBackToLanding}
      onOpenLegalModal={onOpenLegalModal}
    >
      {/* Step Progress Bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: s <= step ? colors.inkBlack : '#E5E7EB',
              transition: 'background-color 0.25s ease',
            }}
          />
        ))}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '12px',
            marginBottom: '18px',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* STEP 1: Profile */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="onboarding-name"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'आपका नाम (मुख्य संपादक)' : 'Your Name (Chief Editor)'}
            </label>
            <input
              id="onboarding-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={locale === 'hi' ? 'राजेश शर्मा' : 'Aria Park'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="onboarding-email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'आपका ईमेल' : 'Account Email'}
            </label>
            <input
              id="onboarding-email"
              type="email"
              disabled
              value={user?.email || ''}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#6B7280',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!fullName.trim()) {
                setError(locale === 'hi' ? 'कृपया अपना नाम लिखें।' : 'Please enter your name.');
                return;
              }
              setError(null);
              goToStep(2);
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: colors.inkBlack,
              color: '#FAF8F5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="hover:bg-stone-800 transition-colors"
          >
            {locale === 'hi' ? 'आगे बढ़ें: अख़बार का नाम →' : 'Next: Publication Setup →'}
          </button>
        </div>
      )}

      {/* STEP 2: Publication Setup */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="pub-name"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'अख़बार का नाम' : 'Newspaper Title'}
            </label>
            <input
              id="pub-name"
              type="text"
              required
              value={publicationName}
              onChange={(e) => setPublicationName(e.target.value)}
              placeholder={locale === 'hi' ? 'दैनिक नवप्रभात' : 'The Morning Chronicle'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="pub-tagline"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'टैगलाइन (अगर चाहें)' : 'Publication Tagline (Optional)'}
            </label>
            <input
              id="pub-tagline"
              type="text"
              value={publicationTagline}
              onChange={(e) => setPublicationTagline(e.target.value)}
              placeholder={
                locale === 'hi'
                  ? 'सत्य, निष्पक्षता और जनसेवा का प्रतीक'
                  : 'Voice of the Independent Newsroom'
              }
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => goToStep(1)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              ← {locale === 'hi' ? 'पीछे' : 'Back'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!publicationName.trim()) {
                  setError(
                    locale === 'hi'
                      ? 'कृपया अपने अख़बार का नाम लिखें।'
                      : 'Please enter your publication name.'
                  );
                  return;
                }
                setError(null);
                goToStep(3);
              }}
              style={{
                flex: 2,
                padding: '12px',
                backgroundColor: colors.inkBlack,
                color: '#FAF8F5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="hover:bg-stone-800 transition-colors"
            >
              {locale === 'hi' ? 'आगे: भाषा व पेज साइज →' : 'Next: Preferences →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preferences */}
      {step === 3 && (
        <div>
          {/* Language Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="pref-language"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              {locale === 'hi' ? 'अख़बार की मुख्य भाषा' : 'Primary Editorial Language'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setPrimaryLanguage('en');
                  setLocale('en');
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${primaryLanguage === 'en' ? colors.inkBlack : '#E5E7EB'}`,
                  backgroundColor: primaryLanguage === 'en' ? '#FAF8F5' : '#FFFFFF',
                  color: '#111827',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrimaryLanguage('hi');
                  setLocale('hi');
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${primaryLanguage === 'hi' ? colors.inkBlack : '#E5E7EB'}`,
                  backgroundColor: primaryLanguage === 'hi' ? '#FAF8F5' : '#FFFFFF',
                  color: '#111827',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Page Size Preset Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="pref-pagesize"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              {locale === 'hi' ? 'डिफ़ॉल्ट पेज साइज' : 'Default Print Geometry'}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                {
                  id: 'broadsheet',
                  name: 'Broadsheet (600×750mm)',
                  sub: locale === 'hi' ? '8 कॉलम वाला बड़ा अख़बार' : '8-Column Classic Daily',
                },
                {
                  id: 'tabloid',
                  name: 'Tabloid (280×430mm)',
                  sub: locale === 'hi' ? '4 कॉलम वाला कॉम्पैक्ट अख़बार' : '4-Column Compact Local',
                },
                {
                  id: 'berliner',
                  name: 'Berliner (315×470mm)',
                  sub: locale === 'hi' ? 'मीडियम साइज अख़बार फॉर्मेट' : 'European Editorial Format',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setPreferredPageSize(item.id as 'broadsheet' | 'tabloid' | 'berliner')
                  }
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${preferredPageSize === item.id ? colors.inkBlack : '#E5E7EB'}`,
                    backgroundColor: preferredPageSize === item.id ? '#FAF8F5' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280' }}>{item.sub}</div>
                  </div>
                  <input
                    type="radio"
                    name="page_size"
                    checked={preferredPageSize === item.id}
                    onChange={() =>
                      setPreferredPageSize(item.id as 'broadsheet' | 'tabloid' | 'berliner')
                    }
                    style={{ accentColor: colors.inkBlack }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => goToStep(2)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              ← {locale === 'hi' ? 'पीछे' : 'Back'}
            </button>
            <button
              type="button"
              onClick={() => goToStep(4)}
              style={{
                flex: 2,
                padding: '12px',
                backgroundColor: colors.inkBlack,
                color: '#FAF8F5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="hover:bg-stone-800 transition-colors"
            >
              {locale === 'hi' ? 'एक नज़र चेक करें →' : 'Review & Finish →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Completion */}
      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <NewspaperIcon size={26} color="#059669" />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 6px 0' }}>
            {publicationName}
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 24px 0' }}>
            {publicationTagline}
          </p>

          <div
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              padding: '16px',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#4B5563',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#6B7280' }}>
                {locale === 'hi' ? 'मुख्य संपादक:' : 'Editor in Chief:'}
              </span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{fullName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#6B7280' }}>{locale === 'hi' ? 'भाषा:' : 'Language:'}</span>
              <span style={{ fontWeight: 600, color: '#111827' }}>
                {primaryLanguage === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#6B7280' }}>
                {locale === 'hi' ? 'पेज साइज:' : 'Geometry:'}
              </span>
              <span style={{ fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>
                {preferredPageSize}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: colors.inkBlack,
              color: '#FAF8F5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            className="hover:bg-stone-800 transition-colors"
          >
            {isSubmitting
              ? locale === 'hi'
                ? 'शुरू हो रहा है...'
                : 'Completing setup...'
              : locale === 'hi'
                ? 'डैशबोर्ड खोलें →'
                : 'Enter Publisher Dashboard →'}
          </button>
        </div>
      )}
    </AuthLayout>
  );
};
