import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { validateEmail } from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { AlertTriangleIcon, CheckCircleIcon } from './AuthIcons';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
  onOpenLegalModal?: (tab: 'privacy' | 'terms' | 'contact' | 'faq') => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onBackToLanding,
  onOpenLegalModal,
}) => {
  const { locale } = useI18n();
  const { requestPasswordReset } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailCheck = validateEmail(email, locale);
    if (!emailCheck.isValid) {
      setValidationError(emailCheck.error!);
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={locale === 'hi' ? 'पासवर्ड नया बनाएँ' : 'Reset your Password'}
      subtitle={
        locale === 'hi'
          ? 'अपना ईमेल डालें, हम आपको नया पासवर्ड बनाने का लिंक भेज देंगे।'
          : 'Enter your registered email address to receive a secure recovery link.'
      }
      onBackToLanding={onBackToLanding}
      onOpenLegalModal={onOpenLegalModal}
    >
      {isSubmitted ? (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircleIcon size={26} color="#059669" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
            {locale === 'hi' ? 'रीसेट लिंक भेज दिया है' : 'Reset Link Dispatched'}
          </h2>
          <p
            style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.6, marginBottom: '24px' }}
          >
            {locale === 'hi'
              ? 'अगर आपका ईमेल हमारे पास रजिस्टर्ड है, तो पासवर्ड बदलने का लिंक भेज दिया गया है।'
              : 'If an account matches this email, instructions to reset your password have been delivered.'}
          </p>
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: colors.inkBlack,
              color: '#FAF8F5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="hover:bg-stone-800 transition-colors"
          >
            {locale === 'hi' ? 'लॉग इन पेज पर जाएँ →' : 'Return to Sign In →'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {validationError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                lineHeight: 1.45,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              role="alert"
            >
              <AlertTriangleIcon size={16} color="#DC2626" />
              <span>{validationError}</span>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="forgot-email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'रजिस्टर्ड ईमेल पता' : 'Registered Email Address'}
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={locale === 'hi' ? 'editor@hindustan.com' : 'editor@chronicle.com'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#111827',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: colors.inkBlack,
              color: '#FAF8F5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
            className="hover:bg-stone-800 transition-colors"
          >
            {isSubmitting
              ? locale === 'hi'
                ? 'भेजा जा रहा है...'
                : 'Sending link...'
              : locale === 'hi'
                ? 'रीसेट लिंक भेजें →'
                : 'Send Reset Link →'}
          </button>

          <div
            style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}
          >
            <button
              type="button"
              onClick={onNavigateToLogin}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: 600,
                color: '#1C1917',
                cursor: 'pointer',
                padding: 0,
              }}
              className="hover:underline"
            >
              ← {locale === 'hi' ? 'लॉग इन पर वापस जाएँ' : 'Back to Sign In'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
