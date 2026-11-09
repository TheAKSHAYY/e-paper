import React, { useState } from 'react';
import {
  publisherProfileStorage,
  type PublisherProfile,
} from '../../storage/PublisherProfileStorage';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

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
  const current = publisherProfileStorage.getProfile();
  const [publisherName, setPublisherName] = useState(current.publisherName || '');
  const [newspaperTitle, setNewspaperTitle] = useState(current.newspaperTitle || 'दैनिक नवप्रभात');
  const [tagline, setTagline] = useState(current.tagline || 'सत्य, निष्पक्षता और जनसेवा का प्रतीक');
  const [primaryLanguage, setPrimaryLanguage] = useState<'hi' | 'en'>(
    current.primaryLanguage || 'hi'
  );
  const [preferredPageSize, setPreferredPageSize] = useState<
    'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4'
  >(current.preferredPageSize || 'broadsheet');
  const [email, setEmail] = useState(current.email || '');

  if (!isOpen) return null;

  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const fonts = PUBLISHER_DESIGN_SYSTEM.fonts;

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
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          maxWidth: '560px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          fontFamily: fonts.interface,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: colors.pressRed,
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '22px',
              fontFamily: fonts.hindiEditorial,
              borderRadius: '6px',
              marginBottom: '12px',
            }}
          >
            प
          </div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: colors.inkBlack,
              margin: '0 0 6px 0',
              fontFamily: fonts.hindiEditorial,
              lineHeight: 1.35,
            }}
          >
            प्रकाशक ऑनबोर्डिंग (Publisher Setup)
          </h2>
          <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
            अपने समाचार पत्र और प्रकाशन की बुनियादी जानकारी दर्ज करें। यह जानकारी मास्टहेड और प्रिंट
            संस्करणों पर दिखाई देगी।
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
                fontSize: '12.5px',
                fontWeight: 700,
                color: colors.inkBlack,
                marginBottom: '4px',
              }}
            >
              संपादक / प्रकाशक का नाम (Editor / Publisher Name) *
            </label>
            <input
              type="text"
              required
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              placeholder="उदा. राजेश शर्मा / प्रधान संपादक"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                outline: 'none',
              }}
            />
          </div>

          {/* Newspaper Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 700,
                color: colors.inkBlack,
                marginBottom: '4px',
              }}
            >
              समाचार पत्र का नाम (Publication Title) *
            </label>
            <input
              type="text"
              required
              value={newspaperTitle}
              onChange={(e) => setNewspaperTitle(e.target.value)}
              placeholder="उदा. दैनिक नवप्रभात / National Herald"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                outline: 'none',
              }}
            />
          </div>

          {/* Tagline */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 700,
                color: colors.inkBlack,
                marginBottom: '4px',
              }}
            >
              ध्येय वाक्य / उप-शीर्षक (Tagline / Motto)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="उदा. सत्य, निष्पक्षता और जनसेवा का प्रतीक"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                outline: 'none',
              }}
            />
          </div>

          {/* Language & Preferred Size Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: colors.inkBlack,
                  marginBottom: '4px',
                }}
              >
                प्राथमिक भाषा (Language)
              </label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value as 'hi' | 'en')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.borderMuted}`,
                  fontSize: '13px',
                  color: colors.inkBlack,
                  backgroundColor: colors.warmPaper,
                  outline: 'none',
                }}
              >
                <option value="hi">हिंदी (Devanagari)</option>
                <option value="en">English (Latin)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: colors.inkBlack,
                  marginBottom: '4px',
                }}
              >
                मानक प्रिंट साइज़ (Default Size)
              </label>
              <select
                value={preferredPageSize}
                onChange={(e) => setPreferredPageSize(e.target.value as typeof preferredPageSize)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${colors.borderMuted}`,
                  fontSize: '13px',
                  color: colors.inkBlack,
                  backgroundColor: colors.warmPaper,
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
                fontSize: '12.5px',
                fontWeight: 700,
                color: colors.inkBlack,
                marginBottom: '4px',
              }}
            >
              ईमेल संपर्क (Publisher Email - Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@newspaper.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: `1px solid ${colors.borderMuted}`,
                fontSize: '13.5px',
                color: colors.inkBlack,
                backgroundColor: colors.warmPaper,
                outline: 'none',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}
          >
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                रद्द करें
              </button>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: colors.pressRed,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 22px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(158, 48, 41, 0.25)',
              }}
            >
              पूर्ण करें व डैशबोर्ड खोलें →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
