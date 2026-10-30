import React, { useState, useId } from 'react';
import type { Article, ElementTypography } from '@epaper-studio/document-schema';
import { DEVANAGARI_FONTS } from '@epaper-studio/typography';

export type TargetTextElement = 'headline' | 'subheadline' | 'body' | 'byline' | 'caption';

export interface TypographyControlsProps {
  article?: Article;
  selectedArticle?: Article;
  onUpdateArticle: (updated: Article) => void;
  onApplyGlobally?: (typography: ElementTypography) => void;
  onApplyToPage?: (typography: ElementTypography) => void;
  onAddParagraph?: () => void;
  isMobile?: boolean;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  article: propArticle,
  selectedArticle,
  onUpdateArticle,
  onApplyGlobally,
  onApplyToPage,
  onAddParagraph,
  isMobile = false,
}) => {
  const article = (propArticle ?? selectedArticle)!;
  const handleApply = onApplyToPage ?? onApplyGlobally;
  const [targetElement, setTargetElement] = useState<TargetTextElement>('headline');
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const sliderId = useId();
  const numInputId = useId();
  const lineHeightSliderId = useId();
  const letterSpacingSliderId = useId();
  const paraSpacingSliderId = useId();
  const textIndentSliderId = useId();

  const currentTypography: ElementTypography = article.typography || {};

  // Derive current values based on selected target element
  const getCurrentFontSize = (): number => {
    switch (targetElement) {
      case 'headline':
        return currentTypography.headlineFontSizePt ?? article.customHeadlineFontSizePt ?? 22;
      case 'subheadline':
        return currentTypography.subheadlineFontSizePt ?? 12;
      case 'byline':
        return currentTypography.bylineFontSizePt ?? 8;
      case 'caption':
        return currentTypography.captionFontSizePt ?? 7.5;
      case 'body':
      default:
        return currentTypography.fontSizePt ?? article.customFontSizePt ?? 9.5;
    }
  };

  const updateFontSize = (newSizePt: number) => {
    const clamped = Math.max(6, Math.min(140, Number(newSizePt.toFixed(1))));
    const nextTypo: ElementTypography = { ...currentTypography };

    switch (targetElement) {
      case 'headline':
        nextTypo.headlineFontSizePt = clamped;
        break;
      case 'subheadline':
        nextTypo.subheadlineFontSizePt = clamped;
        break;
      case 'byline':
        nextTypo.bylineFontSizePt = clamped;
        break;
      case 'caption':
        nextTypo.captionFontSizePt = clamped;
        break;
      case 'body':
      default:
        nextTypo.fontSizePt = clamped;
        break;
    }

    onUpdateArticle({
      ...article,
      typography: nextTypo,
      ...(targetElement === 'headline' ? { customHeadlineFontSizePt: clamped } : {}),
      ...(targetElement === 'body' ? { customFontSizePt: clamped } : {}),
    });
  };

  const updateTypographyField = <K extends keyof ElementTypography>(
    field: K,
    value: ElementTypography[K]
  ) => {
    const nextTypo: ElementTypography = {
      ...currentTypography,
      [field]: value,
    };
    onUpdateArticle({
      ...article,
      typography: nextTypo,
    });
  };

  const currentFontSize = getCurrentFontSize();
  const currentFontFamily = currentTypography.fontFamily || '';
  const currentFontWeight = currentTypography.fontWeight || 'normal';
  const currentHeadlineWeight = currentTypography.headlineFontWeight || currentFontWeight;
  const currentLineHeight = currentTypography.lineHeight ?? 1.25;
  const currentLetterSpacing = currentTypography.letterSpacingPt ?? 0;
  const currentTextAlign = currentTypography.textAlign || (targetElement === 'body' ? 'justify' : 'left');
  const currentTextColor = currentTypography.textColor || article.customColors?.headlineColor || '#111111';
  const currentParaSpacing = currentTypography.paragraphSpacingPt ?? 6;
  const currentTextIndent = currentTypography.textIndentPt ?? 0;

  const quickSizePresets = targetElement === 'headline'
    ? [14, 18, 22, 28, 36, 48, 64]
    : [7.5, 8.5, 9.5, 10.5, 12, 14, 16];

  return (
    <div
      data-testid="typography-controls"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        fontSize: '12px',
        color: '#1e293b',
      }}
    >
      {/* 1. Target Sub-Element Selector */}
      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 700,
            fontSize: '11px',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '6px',
          }}
        >
          स्वरूपण लक्ष्य (Select Element)
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
            gap: '4px',
            backgroundColor: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
          }}
        >
          {(
            [
              { key: 'headline', label: 'शीर्षक' },
              { key: 'subheadline', label: 'उप-शीर्षक' },
              { key: 'body', label: 'मूल पाठ' },
              { key: 'byline', label: 'लेखक' },
              { key: 'caption', label: 'कैप्शन' },
            ] as const
          ).map((item) => {
            const isActive = targetElement === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTargetElement(item.key)}
                data-testid={`target-element-${item.key}`}
                style={{
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f172a' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  minHeight: isMobile ? '40px' : '30px',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Complete Font Size Controls (Slider + Plus/Minus + Number Input + Indicator) */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor={sliderId} style={{ fontWeight: 700, fontSize: '11px', color: '#334155' }}>
            अक्षर आकार (Font Size)
          </label>
          <span
            data-testid="current-font-size-badge"
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
            }}
          >
            {currentFontSize} pt ({Math.round(currentFontSize * 1.33)} px)
          </span>
        </div>

        {/* Plus / Minus & Slider Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            data-testid="font-size-decrement-btn"
            onClick={() => updateFontSize(currentFontSize - 0.5)}
            aria-label="Decrease Font Size"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            −
          </button>

          <input
            id={sliderId}
            type="range"
            data-testid="font-size-slider"
            min={targetElement === 'headline' ? 10 : 6}
            max={targetElement === 'headline' ? 96 : 36}
            step="0.5"
            value={currentFontSize}
            onChange={(e) => updateFontSize(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#b91c1c', cursor: 'pointer' }}
          />

          <button
            type="button"
            data-testid="font-size-increment-btn"
            onClick={() => updateFontSize(currentFontSize + 0.5)}
            aria-label="Increase Font Size"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            +
          </button>

          <input
            id={numInputId}
            type="number"
            data-testid="font-size-numeric-input"
            aria-label="Exact Font Size in pt"
            min="6"
            max="140"
            step="0.5"
            value={currentFontSize}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateFontSize(val);
            }}
            style={{
              width: '54px',
              height: '34px',
              padding: '4px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'center',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Quick Size Preset Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {quickSizePresets.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateFontSize(size)}
              style={{
                padding: '3px 7px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: currentFontSize === size ? '#b91c1c' : '#ffffff',
                color: currentFontSize === size ? '#ffffff' : '#334155',
                fontSize: '10.5px',
                fontWeight: currentFontSize === size ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {size}pt
            </button>
          ))}
        </div>
      </div>

      {/* 3. Font Family & Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
            फॉन्ट परिवार (Font)
          </label>
          <select
            data-testid="font-family-select"
            value={currentFontFamily}
            onChange={(e) => updateTypographyField('fontFamily', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">डिफ़ॉल्ट अखबार फॉन्ट</option>
            {DEVANAGARI_FONTS.map((f) => (
              <option key={f.family} value={`'${f.family}', serif`}>
                {f.family} ({f.nameHi})
              </option>
            ))}
            <option value="'Playfair Display', serif">Playfair Display (English)</option>
            <option value="'Source Serif 4', serif">Source Serif 4</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
            मोटाई (Weight)
          </label>
          <select
            data-testid="font-weight-select"
            value={targetElement === 'headline' ? currentHeadlineWeight : currentFontWeight}
            onChange={(e) => {
              if (targetElement === 'headline') {
                updateTypographyField('headlineFontWeight', e.target.value);
              } else {
                updateTypographyField('fontWeight', e.target.value);
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="400">नॉर्मल (Regular 400)</option>
            <option value="500">मध्यम (Medium 500)</option>
            <option value="600">अर्ध-बोल्ड (SemiBold 600)</option>
            <option value="700">बोल्ड (Bold 700)</option>
            <option value="900">ब्लैक (Black 900)</option>
          </select>
        </div>
      </div>

      {/* 4. Line Height & Letter Spacing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label htmlFor={lineHeightSliderId} style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}>
              पंक्ति अंतराल (Line Height)
            </label>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>{currentLineHeight}x</span>
          </div>
          <input
            id={lineHeightSliderId}
            type="range"
            data-testid="line-height-slider"
            min="0.9"
            max="2.5"
            step="0.05"
            value={currentLineHeight}
            onChange={(e) => updateTypographyField('lineHeight', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label htmlFor={letterSpacingSliderId} style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}>
              अक्षर अंतर (Spacing)
            </label>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>{currentLetterSpacing}pt</span>
          </div>
          <input
            id={letterSpacingSliderId}
            type="range"
            data-testid="letter-spacing-slider"
            min="-1"
            max="5"
            step="0.1"
            value={currentLetterSpacing}
            onChange={(e) => updateTypographyField('letterSpacingPt', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 5. Text Alignment */}
      <div>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
          संरेखण (Text Alignment)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {(
            [
              { key: 'left', label: 'बायें ⯇' },
              { key: 'center', label: 'मध्य ☰' },
              { key: 'right', label: 'दायें ⯈' },
              { key: 'justify', label: 'समान ⯏' },
            ] as const
          ).map((align) => {
            const isActive = currentTextAlign === align.key;
            return (
              <button
                key={align.key}
                type="button"
                data-testid={`align-${align.key}-btn`}
                onClick={() => updateTypographyField('textAlign', align.key)}
                style={{
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  minHeight: isMobile ? '38px' : '30px',
                }}
              >
                {align.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Paragraph Spacing & Indentation (for Body) */}
      {targetElement === 'body' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label htmlFor={paraSpacingSliderId} style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}>
                पैराग्राफ अंतराल (Spacing)
              </label>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>{currentParaSpacing}pt</span>
            </div>
            <input
              id={paraSpacingSliderId}
              type="range"
              data-testid="para-spacing-slider"
              min="0"
              max="24"
              step="1"
              value={currentParaSpacing}
              onChange={(e) => updateTypographyField('paragraphSpacingPt', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label htmlFor={textIndentSliderId} style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}>
                प्रथम पंक्ति हाशिया (Indent)
              </label>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>{currentTextIndent}pt</span>
            </div>
            <input
              id={textIndentSliderId}
              type="range"
              data-testid="text-indent-slider"
              min="0"
              max="36"
              step="1"
              value={currentTextIndent}
              onChange={(e) => updateTypographyField('textIndentPt', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* 7. Text Color */}
      <div>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
          रंग (Text Color)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="color"
            data-testid="text-color-picker"
            value={currentTextColor}
            onChange={(e) => updateTypographyField('textColor', e.target.value)}
            style={{
              width: '36px',
              height: '32px',
              padding: '0',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['#111111', '#334155', '#b91c1c', '#1d4ed8', '#15803d', '#b45309'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateTypographyField('textColor', c)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: currentTextColor === c ? '2px solid #0f172a' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 8. Add Paragraph Helper */}
      {onAddParagraph && (
        <button
          type="button"
          data-testid="add-paragraph-btn"
          onClick={onAddParagraph}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px dashed #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            fontWeight: 600,
            fontSize: '11.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: isMobile ? '44px' : '36px',
          }}
        >
          <span>✚ नया पैराग्राफ जोड़ें (Add Paragraph)</span>
        </button>
      )}

      {/* 9. Apply to all articles on page toggle / button */}
      {handleApply && (
        <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
          {!showApplyConfirm ? (
            <button
              type="button"
              data-testid="apply-typography-globally-btn"
              onClick={() => setShowApplyConfirm(true)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🌐 यह टाइपोग्राफी पूरे पेज पर लागू करें (Apply to Page)
            </button>
          ) : (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>
                क्या आप यह फॉन्ट शैली पेज के सभी लेखों पर लागू करना चाहते हैं?
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleApply(currentTypography);
                    setShowApplyConfirm(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#b45309',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  हाँ, लागू करें
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #d97706',
                    backgroundColor: '#ffffff',
                    color: '#92400e',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  रद्द करें
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
