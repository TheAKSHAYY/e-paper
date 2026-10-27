import React from 'react';

export interface UIThemeTokens {
  einkBackground: '#f8f8f6';
  einkTextPrimary: '#111111';
  einkTextMuted: '#555555';
  borderPaper: '#d8d8d4';
}

export const THEME_TOKENS: UIThemeTokens = {
  einkBackground: '#f8f8f6',
  einkTextPrimary: '#111111',
  einkTextMuted: '#555555',
  borderPaper: '#d8d8d4',
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
