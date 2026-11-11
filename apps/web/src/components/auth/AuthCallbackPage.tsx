import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../auth/supabaseClient';
import { sanitizeRedirectUrl } from '../../auth/authValidation';
import { useI18n } from '../../i18n';
import { AuthLayout } from './AuthLayout';
import { AlertTriangleIcon, CheckCircleIcon } from './AuthIcons';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface AuthCallbackPageProps {
  onSuccess: (destination: string) => void;
  onNavigateToLogin: () => void;
  onOpenLegalModal?: (tab: 'privacy' | 'terms' | 'contact' | 'faq') => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onOpenLegalModal,
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
              ? 'यह लिंक गलत है या इसकी वैलिडिटी खत्म हो चुकी है।'
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
            ? 'कन्फर्मेशन नहीं हो पाया'
            : 'Verification Failed'
          : locale === 'hi'
            ? 'आपका खाता चेक हो रहा है...'
            : 'Completing Verification...'
      }
      subtitle={
        status === 'error'
          ? locale === 'hi'
            ? 'यह लिंक गलत है या अब काम नहीं कर रहा है।'
            : 'Your verification token is invalid or has expired.'
          : locale === 'hi'
            ? 'बस थोड़ा इंतज़ार करें, हम आपका खाता शुरू कर रहे हैं।'
            : 'Please wait while we verify your editorial credentials.'
      }
      onOpenLegalModal={onOpenLegalModal}
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
            <p style={{ fontSize: '13.5px', color: '#6B7280' }}>
              {locale === 'hi'
                ? 'आपका सेशन शुरू किया जा रहा है...'
                : 'Establishing newsroom session...'}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircleIcon size={26} color="#059669" />
            </div>
            <p
              style={{ fontSize: '14.5px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}
            >
              {locale === 'hi' ? 'खाता कन्फर्म हो गया!' : 'Verification Complete!'}
            </p>
            <p style={{ fontSize: '12.5px', color: '#6B7280' }}>
              {locale === 'hi'
                ? 'आपको डैशबोर्ड पर ले जा रहे हैं...'
                : 'Redirecting to your dashboard...'}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <AlertTriangleIcon size={26} color="#DC2626" />
            </div>
            <p
              style={{ fontSize: '13px', color: '#991B1B', margin: '0 0 20px 0', lineHeight: 1.5 }}
            >
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
                fontSize: '13.5px',
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
