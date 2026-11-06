import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../auth/supabaseClient';
import { sanitizeRedirectUrl } from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface AuthCallbackPageProps {
  onSuccess: (destination: string) => void;
  onNavigateToLogin: () => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const { locale } = useI18n();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  useEffect(() => {
    async function handleAuthCallback() {
      // Extract URL search parameters and hash
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      // Check for error parameters
      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription =
        searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(
          errorDescription ||
            (locale === 'hi'
              ? 'सत्यापन लिंक अमान्य या समाप्त हो चुका है।'
              : 'The authentication or verification link is invalid or has expired.')
        );
        return;
      }

      // Check for recovery mode
      const type = searchParams.get('type') || hashParams.get('type');
      if (type === 'recovery') {
        setStatus('success');
        setTimeout(() => {
          onSuccess('/reset-password');
        }, 1000);
        return;
      }

      // If Supabase is configured, process the session exchange
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (data.session) {
            setStatus('success');
            const returnUrl = sanitizeRedirectUrl(searchParams.get('redirect_to') || '/dashboard');
            setTimeout(() => {
              onSuccess(returnUrl);
            }, 1000);
            return;
          }
        } catch (e: unknown) {
          console.warn('[AuthCallback] Session check notice:', e);
        }
      }

      // Default success redirect
      setStatus('success');
      const safeDest = sanitizeRedirectUrl(searchParams.get('redirect_to') || '/dashboard');
      setTimeout(() => {
        onSuccess(safeDest);
      }, 1000);
    }

    handleAuthCallback();
  }, [locale, onSuccess]);

  return (
    <AuthLayout
      title={
        status === 'error'
          ? locale === 'hi'
            ? 'सत्यापन विफल'
            : 'Verification Failed'
          : locale === 'hi'
            ? 'सत्यापन संपन्न हो रहा है...'
            : 'Completing Verification...'
      }
      subtitle={
        status === 'error'
          ? locale === 'hi'
            ? 'सत्यापन टोकन अमान्य है या उसकी अवधि समाप्त हो गई है।'
            : 'Your verification token is invalid or has expired.'
          : locale === 'hi'
            ? 'कृपया प्रतीक्षा करें, आपकी क्रेडेंशियल्स सत्यापित की जा रही हैं।'
            : 'Please wait while we verify your editorial credentials.'
      }
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        {status === 'processing' && (
          <div>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #E5E7EB',
                borderTopColor: colors.inkBlack,
                borderRadius: '50%',
                margin: '0 auto 20px auto',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {locale === 'hi' ? 'सत्र स्थापित किया जा रहा है...' : 'Establishing newsroom session...'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
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
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
              {locale === 'hi' ? 'सत्यापन सफल!' : 'Verification Complete!'}
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>
              {locale === 'hi' ? 'आपको रीडायरेक्ट किया जा रहा है...' : 'Redirecting to your dashboard...'}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              ⚠️
            </div>
            <p style={{ fontSize: '13px', color: '#991B1B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              {errorMessage}
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
              {locale === 'hi' ? 'लॉग इन पर वापस जाएँ →' : 'Return to Sign In →'}
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

