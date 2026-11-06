import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { maskEmail } from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface VerifyEmailPageProps {
  email: string;
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  email,
  onNavigateToLogin,
  onBackToLanding,
}) => {
  const { locale } = useI18n();
  const { resendVerificationEmail } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setResendStatus(
          locale === 'hi'
            ? 'एक नया सत्यापन लिंक भेजा गया है।'
            : 'A new verification link has been sent to your email.'
        );
        setCooldown(60);
      } else {
        setResendStatus(res.error || 'Failed to resend email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const masked = maskEmail(email);

  return (
    <AuthLayout
      title={locale === 'hi' ? 'ईमेल सत्यापित करें' : 'Verify your Email'}
      subtitle={
        locale === 'hi'
          ? 'हमने आपके इनबॉक्स पर एक पुष्टिकरण लिंक भेजा है।'
          : 'We have dispatched a verification link to your newsroom inbox.'
      }
      onBackToLanding={onBackToLanding}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Envelope Graphic */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          ✉️
        </div>

        {/* Email Notification */}
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, marginBottom: '20px' }}>
          {locale === 'hi' ? (
            <>
              कृपया <strong>{masked}</strong> पर भेजे गए लिंक पर क्लिक करके अपना संपादकीय खाता सक्रिय करें।
            </>
          ) : (
            <>
              Please click the link sent to <strong>{masked}</strong> to activate your publishing account.
            </>
          )}
        </p>

        {/* Resend Status Banner */}
        {resendStatus && (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              marginBottom: '20px',
            }}
          >
            {resendStatus}
          </div>
        )}

        {/* Resend Button with Cooldown */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: cooldown > 0 ? '#9CA3AF' : '#1C1917',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className={cooldown === 0 ? 'hover:bg-stone-50' : ''}
          >
            {isResending ? (
              <span>{locale === 'hi' ? 'भेजा जा रहा है...' : 'Sending...'}</span>
            ) : cooldown > 0 ? (
              <span>
                {locale === 'hi' ? `पुनः भेजें (${cooldown}s)` : `Resend verification (${cooldown}s)`}
              </span>
            ) : (
              <span>{locale === 'hi' ? 'सत्यापन लिंक पुनः भेजें' : 'Resend verification email'}</span>
            )}
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '24px 0' }} />

        {/* Return to Login */}
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{
            backgroundColor: colors.inkBlack,
            color: '#FAF8F5',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
          className="hover:bg-stone-800 transition-colors"
        >
          {locale === 'hi' ? 'लॉग इन पर वापस जाएँ →' : 'Return to Sign In →'}
        </button>
      </div>
    </AuthLayout>
  );
};
