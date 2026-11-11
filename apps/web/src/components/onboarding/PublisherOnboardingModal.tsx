import React, { useState } from 'react';
import {
  publisherProfileStorage,
  type PublisherProfile,
} from '../../storage/PublisherProfileStorage';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';

export interface PublisherOnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: PublisherProfile) => void;
  onCancel?: () => void;
}

export const PublisherOnboardingModal: React.FC<PublisherOnboardingModalProps> = ({
  isOpen,
  onComplete,
  onCancel,
}) => {
  const { locale, setLocale } = useI18n();
  const isHi = locale === 'hi';
  const current = publisherProfileStorage.getProfile();
  const [publisherName, setPublisherName] = useState(current.publisherName || '');
  const [newspaperTitle, setNewspaperTitle] = useState(
    current.newspaperTitle || (isHi ? 'दैनिक नवप्रभात' : 'The Morning Chronicle')
  );
  const [tagline, setTagline] = useState(
    current.tagline ||
      (isHi ? 'सत्य, निष्पक्षता और जनसेवा का प्रतीक' : 'Independent Voice of Truth')
  );
  const [primaryLanguage, setPrimaryLanguage] = useState<'hi' | 'en'>(
    current.primaryLanguage || (locale === 'en' ? 'en' : 'hi')
  );
  const [preferredPageSize, setPreferredPageSize] = useState<
    'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4'
  >(current.preferredPageSize || 'broadsheet');
  const [email, setEmail] = useState(current.email || '');

  if (!isOpen) return null;

  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publisherName.trim() || !newspaperTitle.trim()) return;

    const profile = publisherProfileStorage.completeOnboarding({
      publisherName: publisherName.trim(),
      newspaperTitle: newspaperTitle.trim(),
      tagline: tagline.trim(),
      primaryLanguage,
      preferredPageSize,
      email: email.trim() || undefined,
    });
    setLocale(primaryLanguage);

    onComplete(profile);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 23, 23, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: `1px solid ${colors.borderMuted}`,
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 24px',
          boxSizing: 'border-box',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          fontFamily: "'Poppins', 'Hind', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          letterSpacing: isHi ? '0em' : undefined,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: colors.inkBlack,
              color: '#FAF8F5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '18px',
              fontFamily: 'inherit',
              borderRadius: '10px',
              marginBottom: '12px',
            }}
          >
            प
          </div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: colors.inkBlack,
              margin: '0 0 6px 0',
              fontFamily: 'inherit',
              lineHeight: 1.35,
            }}
          >
            {isHi ? 'अपने अख़बार की जानकारी भरें' : 'Publication Profile Setup'}
          </h2>
          <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0, lineHeight: 1.55 }}>
            {isHi
              ? 'अपने अख़बार और संपादक का नाम लिखें। यही जानकारी आपके हर नए अंक के मास्टहेड पर दिखेगी।'
              : 'Set up your editor name, newspaper title, and default page format. This appears on your masthead.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Publisher Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.inkBlack,
                marginBottom: '6px',
              }}
            >
              {isHi ? 'संपादक / प्रकाशक का नाम *' : 'Editor / Publisher Name *'}
            </label>
            <input
              type="text"
              required
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              placeholder={isHi ? 'जैसे: राजेश शर्मा / मुख्य संपादक' : 'e.g. Rajesh Sharma'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Newspaper Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.inkBlack,
                marginBottom: '6px',
              }}
            >
              {isHi ? 'अख़बार का नाम *' : 'Newspaper Title *'}
            </label>
            <input
              type="text"
              required
              value={newspaperTitle}
              onChange={(e) => setNewspaperTitle(e.target.value)}
              placeholder={isHi ? 'जैसे: दैनिक नवप्रभात' : 'e.g. The Morning Chronicle'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Tagline */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.inkBlack,
                marginBottom: '6px',
              }}
            >
              {isHi ? 'अख़बार की टैगलाइन' : 'Publication Tagline'}
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={
                isHi
                  ? 'जैसे: सत्य, निष्पक्षता और जनसेवा का प्रतीक'
                  : 'e.g. Truth, Integrity and Public Trust'
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Language & Preferred Size Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.inkBlack,
                  marginBottom: '6px',
                }}
              >
                {isHi ? 'मुख्य भाषा' : 'Primary Language'}
              </label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value as 'hi' | 'en')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderMuted}`,
                  fontSize: '13px',
                  color: colors.inkBlack,
                  backgroundColor: colors.warmPaper,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                <option value="hi">हिन्दी (Devanagari)</option>
                <option value="en">English (Latin)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.inkBlack,
                  marginBottom: '6px',
                }}
              >
                {isHi ? 'डिफ़ॉल्ट पेज साइज' : 'Default Print Size'}
              </label>
              <select
                value={preferredPageSize}
                onChange={(e) => setPreferredPageSize(e.target.value as typeof preferredPageSize)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderMuted}`,
                  fontSize: '13px',
                  color: colors.inkBlack,
                  backgroundColor: colors.warmPaper,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                <option value="broadsheet">Broadsheet (15" × 22.75")</option>
                <option value="tabloid">Tabloid (11" × 17")</option>
                <option value="berliner">Berliner (12.4" × 18.5")</option>
                <option value="a3">ISO A3</option>
                <option value="a4">ISO A4</option>
              </select>
            </div>
          </div>

          {/* Email (Optional) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: colors.inkBlack,
                marginBottom: '6px',
              }}
            >
              {isHi ? 'संपादक ईमेल (अगर चाहें)' : 'Publisher Email (Optional)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@newspaper.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '10px',
              flexWrap: 'wrap',
            }}
          >
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '9999px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {isHi ? 'बंद करें' : 'Cancel'}
              </button>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: colors.pressRed,
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '10px 22px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(158, 48, 41, 0.2)',
              }}
            >
              {isHi ? 'सेव करें और डैशबोर्ड खोलें →' : 'Save & Open Dashboard →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
