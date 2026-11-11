import React from 'react';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBackToLanding?: () => void;
  onOpenLegalModal?: (tab: 'privacy' | 'terms' | 'contact' | 'faq') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  onBackToLanding,
  onOpenLegalModal,
}) => {
  const { locale } = useI18n();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F5',
        color: '#1C1917',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Poppins', 'Hind', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        letterSpacing: locale === 'hi' ? '0em' : undefined,
      }}
    >
      <style>{`
        .auth-header {
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #E7E2DA;
          background-color: #FAF8F5;
        }
        .auth-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 16px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          background-color: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E7E2DA;
          box-shadow: 0 8px 30px rgba(28, 25, 23, 0.06);
          padding: 32px 28px;
          box-sizing: border-box;
        }
        .auth-footer-btn {
          background: none;
          border: none;
          padding: 4px 6px;
          font-size: 12px;
          font-family: inherit;
          color: #57534E;
          cursor: pointer;
          border-radius: 6px;
          transition: color 0.15s ease;
        }
        .auth-footer-btn:hover {
          color: #1C1917;
          text-decoration: underline;
        }
        @media (max-width: 520px) {
          .auth-header {
            padding: 12px 14px;
          }
          .auth-brand-sub {
            display: none;
          }
          .auth-brand-title {
            font-size: 15px !important;
          }
          .auth-main {
            padding: 20px 12px;
            align-items: flex-start;
          }
          .auth-card {
            padding: 24px 18px;
            border-radius: 14px;
          }
          .auth-back-text-full {
            display: none;
          }
          .auth-back-text-short {
            display: inline !important;
          }
        }
      `}</style>
      {/* Top Header */}
      <header className="auth-header">
        {/* Brand Logo */}
        <div
          onClick={onBackToLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
            cursor: onBackToLanding ? 'pointer' : 'default',
          }}
          role={onBackToLanding ? 'button' : undefined}
          tabIndex={onBackToLanding ? 0 : undefined}
          onKeyDown={(e) => {
            if (onBackToLanding && (e.key === 'Enter' || e.key === ' ')) {
              onBackToLanding();
            }
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              flexShrink: 0,
              backgroundColor: '#1C1917',
              color: '#FAF8F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '15px',
              fontFamily: 'inherit',
              borderRadius: '8px',
            }}
          >
            प
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              className="auth-brand-title"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: locale === 'hi' ? '0em' : '-0.02em',
                fontFamily: 'inherit',
                color: '#1C1917',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              E-Paper Studio
            </span>
            <span
              className="auth-brand-sub"
              style={{
                fontSize: '11px',
                color: '#78716C',
                fontWeight: 400,
              }}
            >
              {locale === 'hi' ? 'अख़बार प्रकाशन स्टूडियो' : 'Newspaper Publishing'}
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <LanguageSelector />
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              style={{
                background: 'none',
                border: '1px solid #E7E2DA',
                fontSize: '12.5px',
                fontWeight: 500,
                fontFamily: 'inherit',
                color: '#57534E',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
              }}
              className="hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <span className="auth-back-text-full">
                ← {locale === 'hi' ? 'मुख्य पेज' : 'Back to Home'}
              </span>
              <span className="auth-back-text-short" style={{ display: 'none' }}>
                ← {locale === 'hi' ? 'होम' : 'Home'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Form Card */}
      <main className="auth-main">
        <div className="auth-card">
          {/* Card Header */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h1
              style={{
                fontSize: locale === 'hi' ? '22px' : '24px',
                fontWeight: 600,
                color: colors.inkBlack,
                margin: '0 0 6px 0',
                letterSpacing: locale === 'hi' ? '0em' : '-0.02em',
                lineHeight: 1.3,
                fontFamily: 'inherit',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#57534E',
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 400,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer
        style={{
          padding: '16px 20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#78716C',
          borderTop: '1px solid #E7E2DA',
          backgroundColor: '#FAF8F5',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px 16px',
            flexWrap: 'wrap',
          }}
        >
          <span>
            © {new Date().getFullYear()} E-Paper Studio ·{' '}
            {locale === 'hi'
              ? 'सब कुछ आपके डिवाइस पर सुरक्षित'
              : 'Local-First · Private · Encrypted'}
          </span>
          {onOpenLegalModal && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <button
                type="button"
                className="auth-footer-btn"
                onClick={() => onOpenLegalModal('privacy')}
              >
                {locale === 'hi' ? 'गोपनीयता' : 'Privacy'}
              </button>
              <button
                type="button"
                className="auth-footer-btn"
                onClick={() => onOpenLegalModal('terms')}
              >
                {locale === 'hi' ? 'नियम व शर्तें' : 'Terms'}
              </button>
              <button
                type="button"
                className="auth-footer-btn"
                onClick={() => onOpenLegalModal('faq')}
              >
                {locale === 'hi' ? 'मदद' : 'Help'}
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
