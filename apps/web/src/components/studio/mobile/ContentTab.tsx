import React, { useState } from 'react';
import type { Article } from '@epaper-studio/document-schema';
import { ELEMENT_PRESETS } from '../ElementsPanel';
import { EmptyErrorState } from './EmptyErrorStates';

export interface ContentTabProps {
  hasEmptySlot: boolean;
  onAddPresetToSlot: (elementData: Partial<Article>) => void;
  onAddRow: () => void;
}

export type ContentCategoryTab =
  'block' | 'top-headline' | 'short-news' | 'advertisement' | 'rashifal';

export const ContentTab: React.FC<ContentTabProps> = ({
  hasEmptySlot,
  onAddPresetToSlot,
  onAddRow,
}) => {
  const [activeCategory, setActiveCategory] = useState<ContentCategoryTab>('block');

  const categories: Array<{ id: ContentCategoryTab; label: string; icon: string }> = [
    { id: 'block', label: 'ब्लॉक (Blocks)', icon: '📰' },
    { id: 'top-headline', label: 'सुर्खियाँ (Headlines)', icon: '🚨' },
    { id: 'short-news', label: 'संक्षिप्त (Short News)', icon: '📌' },
    { id: 'advertisement', label: 'विज्ञापन (Ads)', icon: '📢' },
    { id: 'rashifal', label: 'राशिफल (Horoscope)', icon: '✨' },
  ];

  const filteredPresets = ELEMENT_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div
      data-testid="mobile-content-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            समाचार सामग्री जोड़ें (Add Content)
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
            चयनित खाली स्लॉट में जोड़ने के लिए किसी भी समाचार ब्लॉक पर टैप करें
          </p>
        </div>

        <button
          type="button"
          onClick={onAddRow}
          data-testid="content-add-row-btn"
          style={{
            minHeight: '44px',
            padding: '0 12px',
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + पंक्ति जोड़ें
        </button>
      </div>

      {/* Category Horizontal Pill Selector */}
      <div
        data-testid="content-category-pills"
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`content-cat-${cat.id}`}
              style={{
                minHeight: '44px',
                padding: '0 12px',
                borderRadius: '22px',
                fontSize: '11.5px',
                fontWeight: 600,
                border: isSelected ? '1px solid #b91c1c' : '1px solid #cbd5e1',
                backgroundColor: isSelected ? '#b91c1c' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Check if any empty slot exists */}
      {!hasEmptySlot ? (
        <EmptyErrorState
          type="no-empty-slot"
          onAction={onAddRow}
          actionLabel="पहले एक पंक्ति जोड़ें (Add Row)"
        />
      ) : (
        /* Presets list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onAddPresetToSlot(preset.data)}
              data-testid={`content-preset-${preset.id}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: '52px',
                boxSizing: 'border-box',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>
                {preset.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {preset.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      backgroundColor: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {preset.defaultSpan} कॉलम
                  </span>
                </div>
                <p
                  style={{
                    margin: '3px 0 0 0',
                    fontSize: '11px',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
