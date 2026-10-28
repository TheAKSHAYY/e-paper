import React from 'react';
import type { MastheadConfig, NewspaperPage } from '@epaper-studio/document-schema';

export interface FooterTabProps {
  masthead: MastheadConfig;
  onUpdateMasthead: (config: Partial<MastheadConfig>) => void;
  currentPage: NewspaperPage;
  onUpdatePageTitle?: (title: string) => void;
}

export const FooterTab: React.FC<FooterTabProps> = ({
  masthead,
  onUpdateMasthead,
  currentPage,
  onUpdatePageTitle,
}) => {
  return (
    <div
      data-testid="mobile-footer-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
          फुटर व पृष्ठ सूचना (Footer & Page Folio)
        </h4>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
          पृष्ठ संख्या, अनुभाग शीर्षक, दिनांक व संस्करण विवरण
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '4px',
            }}
          >
            दिनांक (Publication Date)
          </label>
          <input
            type="text"
            value={masthead.date || ''}
            onChange={(e) => onUpdateMasthead({ date: e.target.value })}
            placeholder="सोमवार, 28 अक्टूबर 2026"
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontFamily: "'Noto Serif Devanagari', serif",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '4px',
            }}
          >
            संस्करण नाम (Edition)
          </label>
          <input
            type="text"
            value={masthead.edition || ''}
            onChange={(e) => onUpdateMasthead({ edition: e.target.value })}
            placeholder="राष्ट्रीय राजधानी संस्करण"
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontFamily: "'Noto Serif Devanagari', serif",
            }}
          />
        </div>

        {onUpdatePageTitle && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '4px',
              }}
            >
              इस पृष्ठ का अनुभाग (Section Title)
            </label>
            <input
              type="text"
              value={currentPage.sectionTitle || ''}
              onChange={(e) => onUpdatePageTitle(e.target.value)}
              placeholder="मुख्य पृष्ठ / प्रादेशिक / व्यापार"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
