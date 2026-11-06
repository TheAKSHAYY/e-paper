import React from 'react';
import { useI18n, type Locale } from '../../i18n';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';

export interface LanguageSelectorProps {
  variant?: 'pill' | 'select' | 'compact';
  style?: React.CSSProperties;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'pill', style }) => {
  const { locale, setLocale, t } = useI18n();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;

  if (variant === 'select') {
    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t.common.language}
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid ${colors.borderMuted}`,
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: 600,
          color: colors.inkBlack,
          cursor: 'pointer',
          outline: 'none',
          ...style,
        }}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
    );
  }

  return (
    <div
      role="group"
      aria-label={t.common.language}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: colors.mutedPaper,
        border: `1px solid ${colors.borderMuted}`,
        borderRadius: '4px',
        padding: '2px',
        gap: '2px',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        style={{
          padding: '4px 12px',
          minHeight: '44px',
          minWidth: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: locale === 'en' ? 700 : 500,
          color: locale === 'en' ? colors.inkBlack : colors.textMuted,
          backgroundColor: locale === 'en' ? '#FFFFFF' : 'transparent',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: locale === 'en' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('hi')}
        style={{
          padding: '4px 12px',
          minHeight: '44px',
          minWidth: '48px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: locale === 'hi' ? 700 : 500,
          color: locale === 'hi' ? colors.pressRed : colors.textMuted,
          backgroundColor: locale === 'hi' ? '#FFFFFF' : 'transparent',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: locale === 'hi' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        हिन्दी
      </button>
    </div>
  );
};
