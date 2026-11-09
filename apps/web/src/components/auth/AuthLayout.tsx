import React from 'react';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBackToLanding?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  onBackToLanding,
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
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E7E2DA',
          backgroundColor: '#FAF8F5',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={onBackToLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
              backgroundColor: '#1C1917',
              color: '#FAF8F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '17px',
              fontFamily: "'Rozha One', 'Playfair Display', serif",
              borderRadius: '6px',
            }}
          >
            प
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#1C1917',
                lineHeight: 1.1,
              }}
            >
              E-Paper Studio
            </span>
            <span
              style={{
                fontSize: '10px',
                color: '#78716C',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {locale === 'hi' ? 'समाचार पत्र प्रकाशन' : 'Newspaper Publishing'}
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageSelector />
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: '#57534E',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
              className="hover:text-stone-900 transition-colors"
            >
              ← {locale === 'hi' ? 'मुखपृष्ठ' : 'Return to Website'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Form Card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E7E2DA',
            boxShadow: '0 8px 30px rgba(28,25,23,0.06)',
            padding: '36px 32px',
            boxSizing: 'border-box',
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: colors.inkBlack,
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em',
                fontFamily:
                  locale === 'hi'
                    ? "'Noto Serif Devanagari', 'Rozha One', serif"
                    : "'Playfair Display', Georgia, serif",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '14px', color: '#57534E', margin: 0, lineHeight: 1.5 }}>
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
          padding: '20px 24px',
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
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span>© {new Date().getFullYear()} E-Paper Studio</span>
          <span>·</span>
          <span>
            {locale === 'hi'
              ? 'लोकल-फर्स्ट एवं सुरक्षित एन्क्रिप्शन'
              : 'Local-First · Zero-Telemetry · Encrypted'}
          </span>
        </div>
      </footer>
    </div>
  );
};
