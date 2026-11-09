import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  evaluatePasswordStrength,
} from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onNavigateToVerifyEmail: (email: string) => void;
  onSuccessDirect: () => void;
  onBackToLanding: () => void;
  onOpenLegalModal?: (tab: 'privacy' | 'terms') => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onNavigateToLogin,
  onNavigateToVerifyEmail,
  onSuccessDirect,
  onBackToLanding,
  onOpenLegalModal,
}) => {
  const { locale } = useI18n();
  const {
    signUp,
    isLoading: isAuthLoading,
    error: authError,
    clearError,
    authMode,
    configurationError,
  } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError(
        locale === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.'
      );
      return;
    }

    const emailCheck = validateEmail(email, locale);
    if (!emailCheck.isValid) {
      setValidationError(emailCheck.error!);
      return;
    }

    const passCheck = validatePassword(password, locale);
    if (!passCheck.isValid) {
      setValidationError(passCheck.error!);
      return;
    }

    const matchCheck = validatePasswordMatch(password, confirmPassword, locale);
    if (!matchCheck.isValid) {
      setValidationError(matchCheck.error!);
      return;
    }

    if (!acceptTerms) {
      setValidationError(
        locale === 'hi'
          ? 'जारी रखने के लिए कृपया सेवा की शर्तें और गोपनीयता नीति स्वीकार करें।'
          : 'Please accept the Terms of Service and Privacy Policy to continue.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (res.success) {
        if (res.requiresVerification) {
          onNavigateToVerifyEmail(email.trim());
        } else {
          onSuccessDirect();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = validationError || authError;

  return (
    <AuthLayout
      title={locale === 'hi' ? 'संपादकीय खाता बनाएँ' : 'Create your Publisher Account'}
      subtitle={
        locale === 'hi'
          ? 'व्यावसायिक ई-पेपर व समाचार पत्र निर्माण की शुरुआत करें।'
          : 'Start composing print-ready broadsheets and digital editions.'
      }
      onBackToLanding={onBackToLanding}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Auth Mode Status Indicator */}
        {authMode === 'unconfigured' && (
          <div
            data-testid="unconfigured-auth-banner"
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FCD34D',
              color: '#92400E',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12.5px',
              lineHeight: 1.45,
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                {locale === 'hi'
                  ? 'क्लाउड ऑथेंटिकेशन कॉन्फ़िगर नहीं है'
                  : 'Cloud Auth Not Configured'}
              </div>
              <div>
                {configurationError ||
                  (locale === 'hi'
                    ? 'उत्पादन वातावरण में Supabase क्रेडेंशियल्स अनुपलब्ध हैं। पंजीकरण अक्षम है।'
                    : 'Supabase credentials are missing in this production environment. Registration is disabled.')}
              </div>
            </div>
          </div>
        )}

        {authMode === 'mock' && (
          <div
            data-testid="dev-mock-auth-badge"
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1E40AF',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              🛠️{' '}
              {locale === 'hi' ? 'डेवलपमेंट मॉक ऑथ मोड (ऑफ़लाइन)' : 'DEV MOCK AUTH MODE (Offline)'}
            </span>
            <span
              style={{
                fontSize: '10px',
                backgroundColor: '#DBEAFE',
                padding: '1px 5px',
                borderRadius: '3px',
              }}
            >
              {locale === 'hi' ? 'क्लाउड डिस्कनेक्टेड' : 'No Cloud'}
            </span>
          </div>
        )}

        {/* Error Banner */}
        {displayedError && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              lineHeight: 1.4,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            role="alert"
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span>{displayedError}</span>
          </div>
        )}

        {/* Full Name */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="signup-name"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {locale === 'hi' ? 'पूरा नाम' : 'Full Name'}
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder={locale === 'hi' ? 'राजेश शर्मा' : 'Eleanor Vance'}
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

        {/* Email Address */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="signup-email"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {locale === 'hi' ? 'ईमेल पता' : 'Email Address'}
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder={locale === 'hi' ? 'editor@hindustan.com' : 'editor@gazette.com'}
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

        {/* Password */}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="signup-password"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {locale === 'hi' ? 'पासवर्ड' : 'Password'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#111827',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6B7280',
                padding: '4px',
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  {locale === 'hi' ? 'पासवर्ड मजबूती:' : 'Strength:'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: strength.color }}>
                  {locale === 'hi' ? strength.labelHindi : strength.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: strength.score >= step ? strength.color : '#E5E7EB',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="signup-confirm-password"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {locale === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#111827',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6B7280',
                padding: '4px',
              }}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Terms & Privacy Agreement */}
        <div
          style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px' }}
        >
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#1C1917',
              cursor: 'pointer',
              marginTop: '2px',
            }}
          />
          <label
            htmlFor="accept-terms"
            style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5, cursor: 'pointer' }}
          >
            {locale === 'hi' ? (
              <>
                मैं ई-पेपर स्टूडियो की{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalModal?.('terms')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#1C1917',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  सेवा की शर्तों
                </button>{' '}
                और{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalModal?.('privacy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#1C1917',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  गोपनीयता नीति
                </button>{' '}
                से सहमत हूँ।
              </>
            ) : (
              <>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalModal?.('terms')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#1C1917',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalModal?.('privacy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#1C1917',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Privacy Policy
                </button>
                .
              </>
            )}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isAuthLoading || authMode === 'unconfigured'}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: colors.inkBlack,
            color: '#FAF8F5',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSubmitting || isAuthLoading ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || isAuthLoading ? 0.7 : 1,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          className="hover:bg-stone-800 transition-colors"
        >
          {isSubmitting ? (
            <>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #FAF8F5',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>{locale === 'hi' ? 'खाता बनाया जा रहा है...' : 'Creating account...'}</span>
            </>
          ) : (
            <span>{locale === 'hi' ? 'खाता बनाएँ →' : 'Create Account →'}</span>
          )}
        </button>

        {/* Toggle to Sign In */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
          <span>{locale === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'} </span>
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
            {locale === 'hi' ? 'लॉग इन करें' : 'Sign In'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
