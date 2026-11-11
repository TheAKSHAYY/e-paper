import React from 'react';

/* ====================================================================
 * Design System Tokens: E-Ink & Newspaper Aesthetics
 * ==================================================================== */

export interface UIThemeTokens {
  einkBackground: string;
  einkTextPrimary: string;
  einkTextMuted: string;
  borderPaper: string;
  // Newspaper Authentic Print Palette
  newsprintBackground: string;
  newsprintAged: string;
  newsprintDark: string;
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;
  inkRule: string;
  inkRuleLight: string;
  accentCrimson: string;
  accentNavy: string;
  accentGold: string;
  surfacePanel: string;
  surfaceHover: string;
  // Product Design Direction Tokens (Phase 3+)
  warmPaper: string;
  inkBlack: string;
  pressRed: string;
  mutedPaper: string;
  pageWhite: string;
}

export const THEME_TOKENS: UIThemeTokens = {
  einkBackground: '#f8f8f6',
  einkTextPrimary: '#111111',
  einkTextMuted: '#555555',
  borderPaper: '#d8d8d4',
  // Newspaper Authentic Print Palette - Pure White Printable Paper
  newsprintBackground: '#ffffff',
  newsprintAged: '#f6f3eb',
  newsprintDark: '#eae5d8',
  inkPrimary: '#111111',
  inkSecondary: '#333333',
  inkMuted: '#666666',
  inkRule: '#111111',
  inkRuleLight: '#d5d0c4',
  accentCrimson: '#8b0000',
  accentNavy: '#104e8b',
  accentGold: '#9c6f19',
  surfacePanel: '#ffffff',
  surfaceHover: '#f0ede6',
  // Product Design Direction Tokens
  warmPaper: '#F4F0E7',
  inkBlack: '#171717',
  pressRed: '#9E3029',
  mutedPaper: '#E6E0D5',
  pageWhite: '#FFFFFF',
};

export type TypographyRole =
  | 'display'
  | 'pageTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'subhead'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button'
  | 'navigation'
  | 'formInput'
  | 'helper';

export const APP_UI_TYPOGRAPHY = {
  fonts: {
    sans: "'Poppins', 'Hind', sans-serif",
    hindiUi: "'Poppins', 'Hind', 'Mukta', sans-serif",
    display: "'Playfair Display', 'Poppins', Georgia, serif",
    hindiDisplay: "'Rozha One', 'Noto Serif Devanagari', 'Hind', Georgia, serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 700,
  },
  sizes: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    md: '17px',
    lg: '22px',
    xl: '30px',
    display: 'clamp(36px, 5.5vw, 68px)',
  },
  lineHeights: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.65,
    hindiHeading: 1.35,
    hindiBody: 1.65,
    control: 1.2,
  },
  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.04em',
    widest: '0.12em',
    kicker: '0.18em',
  },
  roles: {
    display: {
      en: {
        fontSize: 'clamp(36px, 5vw, 64px)',
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: '-0.03em',
      },
      hi: {
        fontSize: 'clamp(32px, 4.5vw, 56px)',
        fontWeight: 800,
        lineHeight: 1.3,
        letterSpacing: '0em',
      },
    },
    pageTitle: {
      en: { fontSize: '28px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
      hi: { fontSize: '28px', fontWeight: 800, lineHeight: 1.35, letterSpacing: '0em' },
    },
    sectionTitle: {
      en: { fontSize: '22px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' },
      hi: { fontSize: '22px', fontWeight: 700, lineHeight: 1.35, letterSpacing: '0em' },
    },
    cardTitle: {
      en: { fontSize: '18px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
      hi: { fontSize: '18px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0em' },
    },
    subhead: {
      en: { fontSize: '16px', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0em' },
      hi: { fontSize: '16px', fontWeight: 500, lineHeight: 1.45, letterSpacing: '0em' },
    },
    bodyLarge: {
      en: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0em' },
      hi: { fontSize: '16px', fontWeight: 400, lineHeight: 1.65, letterSpacing: '0em' },
    },
    body: {
      en: { fontSize: '14px', fontWeight: 400, lineHeight: 1.55, letterSpacing: '0em' },
      hi: { fontSize: '14px', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0em' },
    },
    bodySmall: {
      en: { fontSize: '13px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0em' },
      hi: { fontSize: '13px', fontWeight: 400, lineHeight: 1.55, letterSpacing: '0em' },
    },
    caption: {
      en: { fontSize: '11px', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.02em' },
      hi: { fontSize: '11px', fontWeight: 500, lineHeight: 1.45, letterSpacing: '0em' },
    },
    label: {
      en: { fontSize: '12px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0.02em' },
      hi: { fontSize: '12px', fontWeight: 600, lineHeight: 1.35, letterSpacing: '0em' },
    },
    button: {
      en: { fontSize: '13px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em' },
      hi: { fontSize: '13px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0em' },
    },
    navigation: {
      en: { fontSize: '13px', fontWeight: 500, lineHeight: 1.2, letterSpacing: '0em' },
      hi: { fontSize: '13px', fontWeight: 500, lineHeight: 1.25, letterSpacing: '0em' },
    },
    formInput: {
      en: { fontSize: '13px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0em' },
      hi: { fontSize: '13px', fontWeight: 400, lineHeight: 1.45, letterSpacing: '0em' },
    },
    helper: {
      en: { fontSize: '11px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0em' },
      hi: { fontSize: '11px', fontWeight: 400, lineHeight: 1.45, letterSpacing: '0em' },
    },
  },
} as const;

export function getUiTypographyStyle(
  role: TypographyRole,
  locale: 'en' | 'hi' = 'en',
  isEditorialHeading = false
) {
  const roleMetrics = APP_UI_TYPOGRAPHY.roles[role][locale];
  let fontFamily: string;

  if (isEditorialHeading) {
    fontFamily =
      locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiDisplay : APP_UI_TYPOGRAPHY.fonts.display;
  } else {
    fontFamily = locale === 'hi' ? APP_UI_TYPOGRAPHY.fonts.hindiUi : APP_UI_TYPOGRAPHY.fonts.sans;
  }

  return {
    fontFamily,
    fontSize: roleMetrics.fontSize,
    fontWeight: roleMetrics.fontWeight,
    lineHeight: roleMetrics.lineHeight,
    letterSpacing: roleMetrics.letterSpacing,
  };
}

export const NEWSPAPER_DOCUMENT_TYPOGRAPHY = {
  availableFamilies: [
    'Gotu',
    'Hind',
    'Mukta',
    'Noto Serif Devanagari',
    'Playfair Display',
    'Poppins',
    'Rozha One',
    'Source Serif 4',
    'Tiro Devanagari Hindi',
    'Yatra One',
  ] as const,
  defaultScalesPt: {
    bodyMinPt: 7,
    bodyDefaultPt: 10,
    bodyMaxPt: 24,
    deckPt: 12,
    subheadlinePt: 16,
    headlinePt: 28,
    leadHeadlinePt: 48,
    mastheadPt: 64,
  },
} as const;

export const PUBLISHER_DESIGN_SYSTEM = {
  colors: {
    warmPaper: '#F4F0E7',
    inkBlack: '#171717',
    pressRed: '#9E3029',
    pressRedHover: '#822620',
    mutedPaper: '#E6E0D5',
    pageWhite: '#FFFFFF',
    borderMuted: '#D8D1C5',
    textMuted: '#5A564F',
    textSecondary: '#33312E',
  },
  fonts: {
    display: APP_UI_TYPOGRAPHY.fonts.display,
    interface: APP_UI_TYPOGRAPHY.fonts.sans,
    hindiUi: APP_UI_TYPOGRAPHY.fonts.hindiUi,
    hindiEditorial: APP_UI_TYPOGRAPHY.fonts.hindiDisplay,
  },
  typography: APP_UI_TYPOGRAPHY,
  documentTypography: NEWSPAPER_DOCUMENT_TYPOGRAPHY,
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '3px',
    md: '6px',
    lg: '10px',
  },
} as const;

export interface DeviceBadgeProps {
  deviceName: string;
  dpi: number;
}

export const DeviceBadge: React.FC<DeviceBadgeProps> = ({ deviceName, dpi }) => {
  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
      },
    },
    `${deviceName} (${dpi} DPI)`
  );
};
