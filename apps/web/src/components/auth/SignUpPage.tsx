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
import { AlertTriangleIcon, EyeIcon, EyeOffIcon, WrenchIcon } from './AuthIcons';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onNavigateToVerifyEmail: (email: string) => void;
  onSuccessDirect: () => void;
  onBackToLanding: () => void;
  onOpenLegalModal?: (tab: 'privacy' | 'terms' | 'contact' | 'faq') => void;
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
        locale === 'hi' ? 'कृपया अपना पूरा नाम लिखें।' : 'Please enter your full name.'
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
          ? 'आगे बढ़ने के लिए कृपया नियम व शर्तें और गोपनीयता नीति मानें।'
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
      title={locale === 'hi' ? 'नया खाता बनाएँ' : 'Create your Publisher Account'}
      subtitle={
        locale === 'hi'
          ? 'अपने अख़बार और रोज़ के ई-पेपर बनाने की शुरुआत करें।'
          : 'Start composing print-ready broadsheets and digital editions.'
      }
      onBackToLanding={onBackToLanding}
      onOpenLegalModal={onOpenLegalModal}
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
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '12.5px',
              lineHeight: 1.5,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <span style={{ marginTop: '2px', display: 'inline-flex' }}>
              <AlertTriangleIcon size={16} color="#B45309" />
            </span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                {locale === 'hi' ? 'क्लाउड साइनअप अभी सेटअप नहीं है' : 'Cloud Auth Not Configured'}
              </div>
              <div>
                {configurationError ||
                  (locale === 'hi'
                    ? 'अभी क्लाउड क्रेडेंशियल नहीं जुड़े हैं, इसलिए नया खाता बनाना बंद है।'
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
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <WrenchIcon size={14} color="#1E40AF" />
              {locale === 'hi' ? 'लोकल टेस्ट मोड (ऑफ़लाइन)' : 'DEV MOCK AUTH MODE (Offline)'}
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 500,
                backgroundColor: '#DBEAFE',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {locale === 'hi' ? 'ऑफ़लाइन' : 'No Cloud'}
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
              fontWeight: 500,
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
              fontWeight: 500,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {locale === 'hi' ? 'आपका ईमेल' : 'Email Address'}
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
              fontWeight: 500,
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
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
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
                <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                  {locale === 'hi' ? 'पासवर्ड कैसा है:' : 'Strength:'}
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: strength.color }}>
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
              fontWeight: 500,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {locale === 'hi' ? 'पासवर्ड दोबारा लिखें' : 'Confirm Password'}
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
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
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
            style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.55, cursor: 'pointer' }}
          >
            {locale === 'hi' ? (
              <>
                मैं E-Paper Studio की{' '}
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
                  नियम व शर्तें
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
                मानता हूँ।
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
              <span>{locale === 'hi' ? 'खाता बन रहा है...' : 'Creating account...'}</span>
            </>
          ) : (
            <span>{locale === 'hi' ? 'खाता बनाएँ →' : 'Create Account →'}</span>
          )}
        </button>

        {/* Toggle to Sign In */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
          <span>
            {locale === 'hi' ? 'क्या आपका पहले से खाता है?' : 'Already have an account?'}{' '}
          </span>
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
