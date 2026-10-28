import React from 'react';
import type {
  NewspaperPage,
  PageSizePreset,
  PageOrientation,
  NewspaperLayoutConfig,
} from '@epaper-studio/document-schema';

export interface MobilePageMeterProps {
  page: NewspaperPage;
  pageSize: PageSizePreset;
  orientation: PageOrientation;
  layout?: NewspaperLayoutConfig;
}

/**
 * Computes estimated page capacity fullness from content and layout metrics.
 */
export function computePageFullness(
  page: NewspaperPage,
  pageSize: PageSizePreset,
  orientation: PageOrientation
): number {
  if (!page.articles || page.articles.length === 0) {
    return 0;
  }

  // Filter out pure placeholder empty slots when measuring word count
  const realArticles = page.articles.filter(
    (a) => !a.id.startsWith('slot-') && a.headline !== 'यहाँ खबर जोड़ें'
  );

  if (realArticles.length === 0) {
    // If only empty slots exist, calculate based on reserved grid column slots
    const totalSlotsSpan = page.articles.reduce((acc, a) => acc + (a.columnSpan || 6), 0);
    // Typical page holds about 36 to 48 column-spans worth of rows
    return Math.min(100, Math.round((totalSlotsSpan / 36) * 100));
  }

  const totalWords = realArticles.reduce(
    (acc, art) => acc + art.body.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  const wordBudget =
    pageSize === 'broadsheet'
      ? orientation === 'landscape'
        ? 2800
        : 3500
      : pageSize === 'berliner'
        ? 2600
        : pageSize === 'a3'
          ? 2800
          : 1800;

  // Visual block weight: articles, photos, headlines take vertical space regardless of words
  const structuralWeight = realArticles.reduce((acc, art) => {
    let weight = (art.columnSpan || 6) * 20; // 12-col article ~ 240 word equivalent
    if (art.imageUrl && art.imagePlacement !== 'none') weight += 180;
    if (art.elementType === 'top-headline') weight += 120;
    if (art.elementType === 'advertisement') weight += 140;
    if (art.elementType === 'rashifal') weight += 200;
    return acc + weight;
  }, 0);

  const effectiveLoad = totalWords + structuralWeight;
  const percentage = Math.round((effectiveLoad / wordBudget) * 100);

  return Math.max(5, percentage);
}

export const MobilePageMeter: React.FC<MobilePageMeterProps> = ({
  page,
  pageSize,
  orientation,
}) => {
  const percentage = computePageFullness(page, pageSize, orientation);
  const isOverflow = percentage > 100;
  const meterColor = isOverflow ? '#dc2626' : percentage > 85 ? '#f59e0b' : '#16a34a';

  return (
    <div
      data-testid="mobile-page-meter"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '11.5px',
        zIndex: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '12px' }}
      >
        <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
          पेज {percentage}% भरा
        </span>
        <span style={{ color: '#64748b', fontSize: '10.5px' }}>
          ({isOverflow ? 'Overflow Warning' : `${percentage}% capacity`})
        </span>

        {/* Progress Bar */}
        <div
          style={{
            flex: 1,
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden',
            minWidth: '60px',
          }}
        >
          <div
            data-testid="page-meter-bar"
            style={{
              width: `${Math.min(100, percentage)}%`,
              height: '100%',
              backgroundColor: meterColor,
              borderRadius: '3px',
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        </div>
      </div>

      {isOverflow && (
        <span
          data-testid="page-overflow-warning"
          style={{
            color: '#dc2626',
            fontWeight: 700,
            fontSize: '10.5px',
            backgroundColor: '#fef2f2',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #fecaca',
            whiteSpace: 'nowrap',
          }}
        >
          ⚠️ पेज क्षमता से अधिक भरा (Overflow)
        </span>
      )}
    </div>
  );
};
