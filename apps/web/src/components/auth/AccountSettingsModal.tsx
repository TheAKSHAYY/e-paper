import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../i18n';
import { validatePassword, validatePasswordMatch } from '../../auth/authValidation';
import { AlertTriangleIcon, CloudIcon, WrenchIcon } from './AuthIcons';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onSignOut,
}) => {
  const { locale, setLocale } = useI18n();
  const { user, profile, isCloudConnected, authMode, updateProfile, changePassword } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || profile?.fullName || '');
  const [publicationName, setPublicationName] = useState(profile?.publicationName || '');
  const [tagline, setTagline] = useState(profile?.publicationTagline || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        publicationName: publicationName.trim(),
        publicationTagline: tagline.trim(),
      });

      if (res.success) {
        setProfileMessage({
          type: 'success',
          text:
            locale === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक सहेजी गई।' : 'Profile updated successfully.',
        });
      } else {
        setProfileMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    const passCheck = validatePassword(newPassword, locale);
    if (!passCheck.isValid) {
      setPasswordMessage({ type: 'error', text: passCheck.error! });
      return;
    }

    const matchCheck = validatePasswordMatch(newPassword, confirmPassword, locale);
    if (!matchCheck.isValid) {
      setPasswordMessage({ type: 'error', text: matchCheck.error! });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setPasswordMessage({
          type: 'success',
          text:
            locale === 'hi'
              ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है।'
              : 'Password updated successfully.',
        });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E7E2DA',
          boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          fontFamily: "'Poppins', 'Hind', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          letterSpacing: locale === 'hi' ? '0em' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E7E2DA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAF8F5',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: colors.inkBlack,
                margin: '0 0 2px 0',
              }}
            >
              {locale === 'hi' ? 'खाता और सुरक्षा सेटिंग्स' : 'Account & Security Settings'}
            </h2>
            <p style={{ fontSize: '12px', color: '#78716C', margin: 0 }}>{user?.email}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#78716C',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Cloud Connection Status Indicator */}
        <div
          data-testid="account-connection-status"
          style={{
            padding: '10px 24px',
            backgroundColor:
              authMode === 'cloud' ? '#F0FDF4' : authMode === 'mock' ? '#EFF6FF' : '#FFFBEB',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            {authMode === 'cloud' ? (
              <CloudIcon size={15} color="#166534" />
            ) : authMode === 'mock' ? (
              <WrenchIcon size={15} color="#1E40AF" />
            ) : (
              <AlertTriangleIcon size={15} color="#92400E" />
            )}
            <span
              style={{
                fontWeight: 600,
                color:
                  authMode === 'cloud' ? '#166534' : authMode === 'mock' ? '#1E40AF' : '#92400E',
              }}
            >
              {authMode === 'cloud'
                ? locale === 'hi'
                  ? 'क्लाउड से सुरक्षित रूप से जुड़ा है'
                  : 'Connected to Supabase Cloud'
                : authMode === 'mock'
                  ? locale === 'hi'
                    ? 'लोकल टेस्ट मोड (ऑफ़लाइन)'
                    : 'Development Mock Auth Mode (Offline Test Harness)'
                  : locale === 'hi'
                    ? 'क्लाउड लॉगिन अभी सेटअप नहीं है'
                    : 'Cloud Credentials Not Configured'}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>
            ID: {user?.id ? user.id.slice(0, 16) + '...' : 'none'}
          </span>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            padding: '0 24px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'profile' ? '#111827' : '#6B7280',
              borderBottom:
                activeTab === 'profile' ? `2px solid ${colors.inkBlack}` : '2px solid transparent',
            }}
          >
            {locale === 'hi' ? 'मेरी प्रोफ़ाइल' : 'Editorial Profile'}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'security' ? '#111827' : '#6B7280',
              borderBottom:
                activeTab === 'security' ? `2px solid ${colors.inkBlack}` : '2px solid transparent',
            }}
          >
            {locale === 'hi' ? 'सुरक्षा और लॉगिन' : 'Security & Session'}
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              {profileMessage && (
                <div
                  style={{
                    backgroundColor: profileMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    color: profileMessage.type === 'success' ? '#166534' : '#991B1B',
                    border: `1px solid ${profileMessage.type === 'success' ? '#BBF7D0' : '#FCA5A5'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  {profileMessage.text}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {locale === 'hi' ? 'संपादक का नाम' : 'Editor Name'}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {locale === 'hi' ? 'अख़बार का नाम' : 'Publication Title'}
                </label>
                <input
                  type="text"
                  value={publicationName}
                  onChange={(e) => setPublicationName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {locale === 'hi' ? 'टैगलाइन' : 'Tagline'}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {locale === 'hi' ? 'वेबसाइट की भाषा' : 'Interface Language'}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale('en');
                      updateProfile({ primaryLanguage: 'en' });
                    }}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '8px',
                      border: `1.5px solid ${locale === 'en' ? colors.inkBlack : '#E5E7EB'}`,
                      backgroundColor: locale === 'en' ? '#FAF8F5' : '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale('hi');
                      updateProfile({ primaryLanguage: 'hi' });
                    }}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '8px',
                      border: `1.5px solid ${locale === 'hi' ? colors.inkBlack : '#E5E7EB'}`,
                      backgroundColor: locale === 'hi' ? '#FAF8F5' : '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                style={{
                  padding: '10px 20px',
                  backgroundColor: colors.inkBlack,
                  color: '#FAF8F5',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                }}
              >
                {isSavingProfile
                  ? locale === 'hi'
                    ? 'सेव हो रहा है...'
                    : 'Saving...'
                  : locale === 'hi'
                    ? 'बदलाव सेव करें'
                    : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div>
              {/* Cloud Connection Badge */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {locale === 'hi' ? 'लॉगिन मोड' : 'Auth Mode'}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: isCloudConnected ? '#ECFDF5' : '#FEF3C7',
                      color: isCloudConnected ? '#059669' : '#B45309',
                    }}
                  >
                    {isCloudConnected
                      ? locale === 'hi'
                        ? 'क्लाउड से जुड़ा'
                        : 'Cloud Supabase RBAC'
                      : locale === 'hi'
                        ? 'सिर्फ आपके डिवाइस पर'
                        : 'Local-First Desktop'}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '11.5px',
                    color: '#6B7280',
                    margin: '6px 0 0 0',
                    lineHeight: 1.5,
                  }}
                >
                  {locale === 'hi'
                    ? isCloudConnected
                      ? 'आपका खाता क्लाउड बैकएंड से सुरक्षित रूप से जुड़ा है।'
                      : 'अभी लोकल मोड चालू है। आपके सारे अंक और डेटा 100% इसी डिवाइस पर रहते हैं।'
                    : isCloudConnected
                      ? 'Connected to live Supabase backend with encrypted cloud session management.'
                      : 'Running in air-gapped local-first mode. All drafts and publisher profile stay 100% on this machine.'}
                </p>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleSavePassword} style={{ marginBottom: '28px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: '0 0 12px 0',
                  }}
                >
                  {locale === 'hi' ? 'पासवर्ड बदलें' : 'Change Password'}
                </h3>

                {passwordMessage && (
                  <div
                    style={{
                      backgroundColor: passwordMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                      color: passwordMessage.type === 'success' ? '#166534' : '#991B1B',
                      border: `1px solid ${passwordMessage.type === 'success' ? '#BBF7D0' : '#FCA5A5'}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: '#4B5563',
                      marginBottom: '4px',
                    }}
                  >
                    {locale === 'hi' ? 'नया पासवर्ड' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: '#4B5563',
                      marginBottom: '4px',
                    }}
                  >
                    {locale === 'hi' ? 'पासवर्ड दोबारा लिखें' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPassword || !newPassword}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: colors.inkBlack,
                    color: '#FAF8F5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: isSavingPassword || !newPassword ? 'not-allowed' : 'pointer',
                    opacity: isSavingPassword || !newPassword ? 0.6 : 1,
                  }}
                >
                  {isSavingPassword
                    ? locale === 'hi'
                      ? 'सेव हो रहा है...'
                      : 'Updating...'
                    : locale === 'hi'
                      ? 'पासवर्ड बदलें'
                      : 'Update Password'}
                </button>
              </form>

              <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />

              {/* Sign Out Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                    {locale === 'hi' ? 'खाते से बाहर निकलें' : 'Sign Out'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                    {locale === 'hi'
                      ? 'इस डिवाइस से अपने खाते को लॉग आउट करें।'
                      : 'Log out of your session on this device.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {locale === 'hi' ? 'लॉग आउट' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
