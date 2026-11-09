import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  validatePassword,
  validatePasswordMatch,
  evaluatePasswordStrength,
} from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface ResetPasswordPageProps {
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onNavigateToLogin,
  onBackToLanding,
}) => {
  const { locale } = useI18n();
  const { resetPassword, error: authError, clearError } = useAuth();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

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

    setIsSubmitting(true);
    try {
      const res = await resetPassword(password);
      if (res.success) {
        setIsSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = validationError || authError;

  return (
    <AuthLayout
      title={locale === 'hi' ? 'नया पासवर्ड निर्धारित करें' : 'Set New Password'}
      subtitle={
        locale === 'hi'
          ? 'अपने खाते की सुरक्षा के लिए एक मजबूत पासवर्ड चुनें।'
          : 'Choose a strong, unique password to secure your publication account.'
      }
      onBackToLanding={onBackToLanding}
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
            {locale === 'hi' ? 'पासवर्ड सफलतापूर्वक अपडेट हुआ' : 'Password Successfully Updated'}
          </h2>
          <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6, marginBottom: '24px' }}>
            {locale === 'hi'
              ? 'आपका नया पासवर्ड सक्रिय हो गया है। अब आप नए पासवर्ड से लॉगिन कर सकते हैं।'
              : 'Your new password is now active. You may now proceed to sign in.'}
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
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="hover:bg-stone-800 transition-colors"
          >
            {locale === 'hi' ? 'लॉग इन करें →' : 'Sign In Now →'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
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
              <span>⚠️</span>
              <span>{displayedError}</span>
            </div>
          )}

          {/* New Password */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="new-password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'नया पासवर्ड' : 'New Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="new-password"
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

            {/* Strength meter */}
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

          {/* Confirm New Password */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="confirm-new-password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              {locale === 'hi' ? 'नए पासवर्ड की पुष्टि करें' : 'Confirm New Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm-new-password"
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
                ? 'अपडेट हो रहा है...'
                : 'Updating password...'
              : locale === 'hi'
                ? 'पासवर्ड अपडेट करें →'
                : 'Update Password →'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
