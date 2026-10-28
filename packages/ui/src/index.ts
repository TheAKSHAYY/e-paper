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
};

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
