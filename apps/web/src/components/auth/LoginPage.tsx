import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { validateEmail, validatePassword } from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onSuccess,
  onBackToLanding,
}) => {
  const { locale } = useI18n();
  const { signIn, isLoading: isAuthLoading, error: authError, clearError, authMode, configurationError } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    // Validate email
    const emailValidation = validateEmail(email, locale);
    if (!emailValidation.isValid) {
      setValidationError(emailValidation.error!);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password, locale);
    if (!passwordValidation.isValid) {
      setValidationError(passwordValidation.error!);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res.success) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = validationError || authError;

  return (
    <AuthLayout
      title={locale === 'hi' ? 'संपादकीय खाते में लॉग इन करें' : 'Sign in to your Newsroom'}
      subtitle={
        locale === 'hi'
          ? 'अपने प्रकाशन, संस्करणों और मुद्रण टेम्पलेट्स तक सुरक्षित पहुँचें।'
          : 'Access your publications, daily editions, and layout templates.'
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
                {locale === 'hi' ? 'क्लाउड ऑथेंटिकेशन कॉन्फ़िगर नहीं है' : 'Cloud Auth Not Configured'}
              </div>
              <div>
                {configurationError ||
                  (locale === 'hi'
                    ? 'उत्पादन वातावरण में Supabase क्रेडेंशियल्स अनुपलब्ध हैं। लॉगिन अक्षम है।'
                    : 'Supabase credentials are missing in this production environment. Sign in is disabled.')}
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
            <span>🛠️ {locale === 'hi' ? 'डेवलपमेंट मॉक ऑथ मोड (ऑफ़लाइन)' : 'DEV MOCK AUTH MODE (Offline)'}</span>
            <span style={{ fontSize: '10px', backgroundColor: '#DBEAFE', padding: '1px 5px', borderRadius: '3px' }}>
              {locale === 'hi' ? 'क्लाउड डिस्कनेक्टेड' : 'No Cloud'}
            </span>
          </div>
        )}

        {/* Error Notification Banner */}
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

        {/* Email Field */}
        <div style={{ marginBottom: '18px' }}>
          <label
            htmlFor="login-email"
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
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder={locale === 'hi' ? 'editor@hindustan-times.com' : 'editor@chronicle.com'}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              color: '#111827',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            className="focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label
              htmlFor="login-password"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {locale === 'hi' ? 'पासवर्ड' : 'Password'}
            </label>
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                color: '#57534E',
                cursor: 'pointer',
                padding: 0,
              }}
              className="hover:underline hover:text-stone-900"
            >
              {locale === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
                transition: 'border-color 0.15s ease',
              }}
              className="focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
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
        </div>

        {/* Remember Session Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#1C1917',
              cursor: 'pointer',
            }}
          />
          <label htmlFor="remember-me" style={{ fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}>
            {locale === 'hi' ? 'इस ब्राउज़र पर सत्र याद रखें' : 'Remember my session on this device'}
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
              <span>{locale === 'hi' ? 'सत्यापन हो रहा है...' : 'Signing in...'}</span>
            </>
          ) : (
            <span>{locale === 'hi' ? 'लॉग इन करें →' : 'Sign In →'}</span>
          )}
        </button>

        {/* Toggle to Sign Up */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
          <span>{locale === 'hi' ? 'खाता नहीं है?' : "Don't have an account?"} </span>
          <button
            type="button"
            onClick={onNavigateToSignUp}
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
            {locale === 'hi' ? 'नया खाता बनाएँ' : 'Create an account'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

