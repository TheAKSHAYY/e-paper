import React, { useState, useEffect, useId } from 'react';
import type { Article, ElementTypography } from '@epaper-studio/document-schema';
import { DEVANAGARI_FONTS } from '@epaper-studio/typography';

export type TargetTextElement = 'headline' | 'subheadline' | 'body' | 'byline' | 'caption';

export interface TypographyControlsProps {
  article?: Article;
  selectedArticle?: Article;
  selectedParagraphIndex?: number | null;
  onSelectParagraph?: (index: number | null) => void;
  onUpdateArticle: (updated: Article) => void;
  onApplyGlobally?: (typography: ElementTypography) => void;
  onApplyToPage?: (typography: ElementTypography) => void;
  onAddParagraph?: () => void;
  isMobile?: boolean;
  initialTargetElement?: TargetTextElement;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  article: propArticle,
  selectedArticle,
  selectedParagraphIndex,
  onSelectParagraph,
  onUpdateArticle,
  onApplyGlobally,
  onApplyToPage,
  onAddParagraph,
  isMobile = false,
  initialTargetElement,
}) => {
  const article = (propArticle ?? selectedArticle)!;
  const handleApply = onApplyToPage ?? onApplyGlobally;

  const [targetElement, setTargetElement] = useState<TargetTextElement>(
    initialTargetElement ||
      (selectedParagraphIndex !== undefined && selectedParagraphIndex !== null
        ? 'body'
        : 'headline')
  );
  const [internalParaIndex, setInternalParaIndex] = useState<number | null>(
    selectedParagraphIndex !== undefined ? selectedParagraphIndex : null
  );
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  // Sync external initialTargetElement
  useEffect(() => {
    if (initialTargetElement) {
      setTargetElement(initialTargetElement);
    }
  }, [initialTargetElement]);

  // Sync external selectedParagraphIndex into local state
  useEffect(() => {
    if (selectedParagraphIndex !== undefined) {
      setInternalParaIndex(selectedParagraphIndex);
      if (selectedParagraphIndex !== null) {
        setTargetElement('body');
      }
    }
  }, [selectedParagraphIndex]);

  const currentParaIndex =
    selectedParagraphIndex !== undefined ? selectedParagraphIndex : internalParaIndex;

  const handleSelectParagraph = (idx: number | null) => {
    setInternalParaIndex(idx);
    onSelectParagraph?.(idx);
    if (idx !== null) {
      setTargetElement('body');
    }
  };

  const sliderId = useId();
  const numInputId = useId();
  const lineHeightSliderId = useId();
  const letterSpacingSliderId = useId();
  const paraSpacingSliderId = useId();
  const textIndentSliderId = useId();

  const currentTypography: ElementTypography = article.typography || {};

  // Extract individual paragraphs from article body
  const paragraphs = article.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  // Derive current font size based on target element and paragraph selection
  const getCurrentFontSize = (): number => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      const paraTypo = article.paragraphTypography?.[String(currentParaIndex)];
      if (paraTypo?.fontSizePt !== undefined) {
        return paraTypo.fontSizePt;
      }
      return currentTypography.fontSizePt ?? article.customFontSizePt ?? 14;
    }
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
        return currentTypography.fontSizePt ?? article.customFontSizePt ?? 14;
    }
  };

  const updateFontSize = (newSizePt: number) => {
    const clamped = Math.max(6, Math.min(140, Number(newSizePt.toFixed(1))));

    if (targetElement === 'body' && currentParaIndex !== null) {
      const currentParaTypo = article.paragraphTypography?.[String(currentParaIndex)] || {};
      const nextParaTypo = {
        ...(article.paragraphTypography || {}),
        [String(currentParaIndex)]: {
          ...currentParaTypo,
          fontSizePt: clamped,
        },
      };
      onUpdateArticle({
        ...article,
        paragraphTypography: nextParaTypo,
      });
      return;
    }

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
        nextTypo.bodyFontSizePt = clamped;
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

  const effectiveParaTypo =
    targetElement === 'body' && currentParaIndex !== null
      ? article.paragraphTypography?.[String(currentParaIndex)]
      : undefined;

  const updateParagraphField = <K extends keyof ElementTypography>(
    field: K,
    value: ElementTypography[K]
  ) => {
    if (currentParaIndex === null) return;
    const currentParaTypo = article.paragraphTypography?.[String(currentParaIndex)] || {};
    const nextParaTypo = {
      ...(article.paragraphTypography || {}),
      [String(currentParaIndex)]: {
        ...currentParaTypo,
        [field]: value,
      },
    };
    onUpdateArticle({
      ...article,
      paragraphTypography: nextParaTypo,
    });
  };

  const handleUpdateFontFamily = (font: string) => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      updateParagraphField('fontFamily', font);
      return;
    }
    if (targetElement === 'headline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          headlineFontFamily: font,
        },
      });
      return;
    }
    if (targetElement === 'subheadline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          subheadlineFontFamily: font,
        },
      });
      return;
    }
    if (targetElement === 'body') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          bodyFontFamily: font,
          fontFamily: font,
        },
      });
      return;
    }
    onUpdateArticle({
      ...article,
      typography: { ...currentTypography, fontFamily: font },
    });
  };

  const handleUpdateFontWeight = (weight: string) => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      updateParagraphField('fontWeight', weight);
      return;
    }
    if (targetElement === 'headline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          headlineFontWeight: weight,
        },
      });
      return;
    }
    if (targetElement === 'subheadline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          subheadlineFontWeight: weight,
        },
      });
      return;
    }
    if (targetElement === 'body') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          bodyFontWeight: weight,
          fontWeight: weight,
        },
      });
      return;
    }
    onUpdateArticle({
      ...article,
      typography: { ...currentTypography, fontWeight: weight },
    });
  };

  const handleUpdateLineHeight = (lh: number) => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      updateParagraphField('lineHeight', lh);
      return;
    }
    if (targetElement === 'headline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          headlineLineHeight: lh,
        },
      });
      return;
    }
    if (targetElement === 'subheadline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          subheadlineLineHeight: lh,
        },
      });
      return;
    }
    if (targetElement === 'body') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          bodyLineHeight: lh,
          lineHeight: lh,
        },
      });
      return;
    }
    onUpdateArticle({
      ...article,
      typography: { ...currentTypography, lineHeight: lh },
    });
  };

  const handleUpdateLetterSpacing = (ls: number) => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      updateParagraphField('letterSpacingPt', ls);
      return;
    }
    if (targetElement === 'headline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          headlineLetterSpacingPt: ls,
        },
      });
      return;
    }
    if (targetElement === 'subheadline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          subheadlineLetterSpacingPt: ls,
        },
      });
      return;
    }
    if (targetElement === 'body') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          bodyLetterSpacingPt: ls,
          letterSpacingPt: ls,
        },
      });
      return;
    }
    onUpdateArticle({
      ...article,
      typography: { ...currentTypography, letterSpacingPt: ls },
    });
  };

  const handleUpdateTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      updateParagraphField('textAlign', align);
      return;
    }
    if (targetElement === 'headline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          headlineTextAlign: align,
        },
      });
      return;
    }
    if (targetElement === 'subheadline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          subheadlineTextAlign: align,
        },
      });
      return;
    }
    if (targetElement === 'body') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          bodyTextAlign: align,
          textAlign: align,
        },
      });
      return;
    }
    onUpdateArticle({
      ...article,
      typography: { ...currentTypography, textAlign: align },
    });
  };

  const handleUpdateTextColor = (color: string) => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      updateParagraphField('textColor', color);
      return;
    }
    if (targetElement === 'headline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          headlineColor: color,
        },
        customColors: {
          ...(article.customColors || {}),
          headlineColor: color,
        },
      });
      return;
    }
    if (targetElement === 'subheadline') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          subheadlineColor: color,
        },
        customColors: {
          ...(article.customColors || {}),
          subheadlineColor: color,
        },
      });
      return;
    }
    if (targetElement === 'body') {
      onUpdateArticle({
        ...article,
        typography: {
          ...currentTypography,
          bodyColor: color,
          textColor: color,
        },
        customColors: {
          ...(article.customColors || {}),
          bodyColor: color,
        },
      });
      return;
    }
    onUpdateArticle({
      ...article,
      typography: { ...currentTypography, textColor: color },
    });
  };

  const handleResetTargetTypography = () => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      const nextParaTypo = { ...(article.paragraphTypography || {}) };
      delete nextParaTypo[String(currentParaIndex)];
      onUpdateArticle({
        ...article,
        paragraphTypography: nextParaTypo,
      });
      return;
    }
    if (targetElement === 'headline') {
      const nextTypo = { ...currentTypography };
      delete nextTypo.headlineFontSizePt;
      delete nextTypo.headlineFontFamily;
      delete nextTypo.headlineFontWeight;
      delete nextTypo.headlineLineHeight;
      delete nextTypo.headlineLetterSpacingPt;
      delete nextTypo.headlineTextAlign;
      delete nextTypo.headlineColor;
      delete nextTypo.textDecoration;
      delete nextTypo.underline;
      onUpdateArticle({
        ...article,
        typography: nextTypo,
        customHeadlineFontSizePt: undefined,
      });
      return;
    }
    if (targetElement === 'subheadline') {
      const nextTypo = { ...currentTypography };
      delete nextTypo.subheadlineFontSizePt;
      delete nextTypo.subheadlineFontFamily;
      delete nextTypo.subheadlineFontWeight;
      delete nextTypo.subheadlineLineHeight;
      delete nextTypo.subheadlineLetterSpacingPt;
      delete nextTypo.subheadlineTextAlign;
      delete nextTypo.subheadlineColor;
      onUpdateArticle({
        ...article,
        typography: nextTypo,
      });
      return;
    }
    if (targetElement === 'body') {
      const nextTypo = { ...currentTypography };
      delete nextTypo.fontSizePt;
      delete nextTypo.bodyFontFamily;
      delete nextTypo.bodyFontWeight;
      delete nextTypo.bodyLineHeight;
      delete nextTypo.bodyLetterSpacingPt;
      delete nextTypo.bodyTextAlign;
      delete nextTypo.bodyColor;
      delete nextTypo.paragraphSpacingPt;
      delete nextTypo.textIndentPt;
      onUpdateArticle({
        ...article,
        typography: nextTypo,
        customFontSizePt: undefined,
        paragraphTypography: {},
      });
      return;
    }
  };

  const currentFontSize = getCurrentFontSize();

  const currentFontFamily = (() => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      return (
        effectiveParaTypo?.fontFamily ||
        currentTypography.bodyFontFamily ||
        currentTypography.fontFamily ||
        ''
      );
    }
    if (targetElement === 'headline') {
      return currentTypography.headlineFontFamily || '';
    }
    if (targetElement === 'subheadline') {
      return currentTypography.subheadlineFontFamily || '';
    }
    if (targetElement === 'body') {
      return currentTypography.bodyFontFamily || currentTypography.fontFamily || '';
    }
    return currentTypography.fontFamily || '';
  })();

  const currentFontWeight = (() => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      return (
        effectiveParaTypo?.fontWeight ||
        currentTypography.bodyFontWeight ||
        currentTypography.fontWeight ||
        '400'
      );
    }
    if (targetElement === 'headline') {
      return currentTypography.headlineFontWeight || '700';
    }
    if (targetElement === 'subheadline') {
      return currentTypography.subheadlineFontWeight || 'normal';
    }
    if (targetElement === 'body') {
      return currentTypography.bodyFontWeight || currentTypography.fontWeight || 'normal';
    }
    return currentTypography.fontWeight || 'normal';
  })();

  const currentLineHeight = (() => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      return (
        effectiveParaTypo?.lineHeight ??
        currentTypography.bodyLineHeight ??
        currentTypography.lineHeight ??
        1.45
      );
    }
    if (targetElement === 'headline') {
      return currentTypography.headlineLineHeight ?? 1.15;
    }
    if (targetElement === 'subheadline') {
      return currentTypography.subheadlineLineHeight ?? 1.35;
    }
    if (targetElement === 'body') {
      return currentTypography.bodyLineHeight ?? currentTypography.lineHeight ?? 1.45;
    }
    return currentTypography.lineHeight ?? 1.4;
  })();

  const currentLetterSpacing = (() => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      return (
        effectiveParaTypo?.letterSpacingPt ??
        currentTypography.bodyLetterSpacingPt ??
        currentTypography.letterSpacingPt ??
        0
      );
    }
    if (targetElement === 'headline') {
      return currentTypography.headlineLetterSpacingPt ?? 0;
    }
    if (targetElement === 'subheadline') {
      return currentTypography.subheadlineLetterSpacingPt ?? 0;
    }
    if (targetElement === 'body') {
      return currentTypography.bodyLetterSpacingPt ?? currentTypography.letterSpacingPt ?? 0;
    }
    return currentTypography.letterSpacingPt ?? 0;
  })();

  const currentTextAlign = (() => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      return (
        effectiveParaTypo?.textAlign ??
        currentTypography.bodyTextAlign ??
        currentTypography.textAlign ??
        'justify'
      );
    }
    if (targetElement === 'headline') {
      return currentTypography.headlineTextAlign ?? 'left';
    }
    if (targetElement === 'subheadline') {
      return currentTypography.subheadlineTextAlign ?? 'left';
    }
    if (targetElement === 'body') {
      return currentTypography.bodyTextAlign ?? currentTypography.textAlign ?? 'justify';
    }
    return currentTypography.textAlign ?? 'left';
  })();

  const currentTextColor = (() => {
    if (targetElement === 'body' && currentParaIndex !== null) {
      return (
        effectiveParaTypo?.textColor ??
        currentTypography.bodyColor ??
        article.customColors?.bodyColor ??
        currentTypography.textColor ??
        '#111111'
      );
    }
    if (targetElement === 'headline') {
      return currentTypography.headlineColor ?? article.customColors?.headlineColor ?? '#111111';
    }
    if (targetElement === 'subheadline') {
      return (
        currentTypography.subheadlineColor ?? article.customColors?.subheadlineColor ?? '#444444'
      );
    }
    if (targetElement === 'body') {
      return (
        currentTypography.bodyColor ??
        article.customColors?.bodyColor ??
        currentTypography.textColor ??
        '#111111'
      );
    }
    return currentTypography.textColor ?? '#111111';
  })();

  const currentParaSpacing =
    effectiveParaTypo?.paragraphSpacingPt ?? currentTypography.paragraphSpacingPt ?? 6;
  const currentTextIndent = effectiveParaTypo?.textIndentPt ?? currentTypography.textIndentPt ?? 0;
  const isUnderlined =
    currentTypography.textDecoration === 'underline' || Boolean(currentTypography.underline);

  const quickSizePresets =
    targetElement === 'headline'
      ? [14, 18, 22, 28, 36, 48, 64]
      : targetElement === 'subheadline'
        ? [10, 11, 12, 13, 14, 16, 18]
        : [8, 10, 12, 14, 16, 18, 24, 32];

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
                onClick={() => {
                  setTargetElement(item.key);
                  if (item.key !== 'body') {
                    handleSelectParagraph(null);
                  }
                }}
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

        {/* Individual Paragraph Selector Chips (Available when Body is active or multiple paragraphs exist) */}
        {paragraphs.length > 0 && (
          <div
            style={{
              marginTop: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 8px',
            }}
          >
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>अनुच्छेद चुनें (Individual Paragraphs):</span>
              {currentParaIndex !== null && targetElement === 'body' && (
                <span style={{ color: '#2563eb', fontWeight: 700 }}>
                  ¶ {currentParaIndex + 1} सक्रिय (Active)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {paragraphs.map((_, pIdx) => {
                const isThisParaActive = targetElement === 'body' && currentParaIndex === pIdx;
                const paraCustomSize = article.paragraphTypography?.[String(pIdx)]?.fontSizePt;
                return (
                  <button
                    key={pIdx}
                    type="button"
                    data-testid={`target-paragraph-${pIdx}`}
                    onClick={() => {
                      setTargetElement('body');
                      handleSelectParagraph(pIdx);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '5px',
                      border: isThisParaActive ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isThisParaActive ? '#eff6ff' : '#ffffff',
                      color: isThisParaActive ? '#1d4ed8' : '#334155',
                      fontWeight: isThisParaActive ? 700 : 500,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      minHeight: isMobile ? '36px' : '26px',
                    }}
                  >
                    <span>¶</span> {pIdx + 1}
                    {paraCustomSize && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          color: isThisParaActive ? '#1d4ed8' : '#059669',
                          fontWeight: 700,
                        }}
                      >
                        ({paraCustomSize}pt)
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                data-testid="target-all-paragraphs"
                onClick={() => {
                  setTargetElement('body');
                  handleSelectParagraph(null);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border:
                    targetElement === 'body' && currentParaIndex === null
                      ? '1.5px solid #2563eb'
                      : '1px solid #cbd5e1',
                  backgroundColor:
                    targetElement === 'body' && currentParaIndex === null ? '#eff6ff' : '#ffffff',
                  color:
                    targetElement === 'body' && currentParaIndex === null ? '#1d4ed8' : '#64748b',
                  fontWeight: targetElement === 'body' && currentParaIndex === null ? 700 : 500,
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  minHeight: isMobile ? '36px' : '26px',
                }}
              >
                सभी अनुच्छेद (All)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Complete Font Size Controls (Slider + Plus/Minus + Number Input + Indicator) */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor={sliderId} style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
            फ़ॉन्ट साइज़ (Font Size)
          </label>
          <span
            data-testid="current-font-size-badge"
            style={{
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              border: '1px solid #bfdbfe',
            }}
          >
            {currentFontSize} pt ({Math.round(currentFontSize * 1.33)} px)
          </span>
        </div>

        {/* Scope Indicator */}
        <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>
          {targetElement === 'body' && currentParaIndex !== null
            ? `संपादित हो रहा है: पैरोग्राफ ${currentParaIndex + 1} (Editing: Paragraph ${currentParaIndex + 1})`
            : targetElement === 'headline'
              ? 'संपादित हो रहा है: मुख्य शीर्षक (Headline)'
              : targetElement === 'subheadline'
                ? 'संपादित हो रहा है: उप-शीर्षक (Subheadline)'
                : targetElement === 'byline'
                  ? 'संपादित हो रहा है: लेखक (Byline)'
                  : targetElement === 'caption'
                    ? 'संपादित हो रहा है: फोटो कैप्शन (Caption)'
                    : 'संपादित हो रहा है: पूरा मूल पाठ (All Body Text)'}
        </div>

        {/* Plus / Minus & Value Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <button
            type="button"
            data-testid="font-size-decrement-btn"
            onClick={() => updateFontSize(currentFontSize - 1)}
            aria-label="Decrease Font Size"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '18px',
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

          <div
            data-testid="font-size-display-center"
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '0.02em',
            }}
          >
            {currentFontSize} pt
          </div>

          <button
            type="button"
            data-testid="font-size-increment-btn"
            onClick={() => updateFontSize(currentFontSize + 1)}
            aria-label="Increase Font Size"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '18px',
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
        </div>

        {/* Slider Row: [---------●---------] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            {targetElement === 'headline' ? '10pt' : '6pt'}
          </span>
          <input
            id={sliderId}
            type="range"
            data-testid="font-size-slider"
            min={targetElement === 'headline' ? 10 : 6}
            max={targetElement === 'headline' ? 120 : 72}
            step="1"
            value={currentFontSize}
            onChange={(e) => updateFontSize(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#b91c1c', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            {targetElement === 'headline' ? '120pt' : '72pt'}
          </span>
        </div>

        {/* Custom size input: Custom size: [14] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            paddingTop: '2px',
          }}
        >
          <label
            htmlFor={numInputId}
            style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}
          >
            कस्टम साइज़ (Custom size):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              id={numInputId}
              type="number"
              data-testid="font-size-numeric-input"
              aria-label="Custom Font Size"
              min="6"
              max="140"
              step="0.5"
              value={currentFontSize}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) updateFontSize(val);
              }}
              style={{
                width: '60px',
                height: '32px',
                padding: '4px 6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>pt</span>
          </div>
        </div>

        {/* Quick Size Preset Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {quickSizePresets.map((size) => (
            <button
              key={size}
              type="button"
              data-testid={`font-size-preset-${size}`}
              onClick={() => updateFontSize(size)}
              style={{
                padding: '3px 8px',
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
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '11px',
              color: '#475569',
              marginBottom: '4px',
            }}
          >
            फॉन्ट परिवार (Font)
          </label>
          <select
            data-testid="font-family-select"
            value={currentFontFamily}
            onChange={(e) => handleUpdateFontFamily(e.target.value)}
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
            <option value="">डिफ़ॉल्ट फॉन्ट (Inherit)</option>
            {DEVANAGARI_FONTS.map((font) => (
              <option key={font.family} value={font.cssFamily}>
                {font.nameHi}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '11px',
              color: '#475569',
              marginBottom: '4px',
            }}
          >
            मोटापा (Weight)
          </label>
          <select
            data-testid="font-weight-select"
            value={currentFontWeight}
            onChange={(e) => handleUpdateFontWeight(e.target.value)}
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
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
      </div>

      {/* 4. Line Height Slider */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <label
            htmlFor={lineHeightSliderId}
            style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}
          >
            पंक्ति अंतराल (Line Height)
          </label>
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b' }}>
            {currentLineHeight}x
          </span>
        </div>
        <input
          id={lineHeightSliderId}
          type="range"
          data-testid="line-height-slider"
          min="0.9"
          max="2.5"
          step="0.05"
          value={currentLineHeight}
          onChange={(e) => handleUpdateLineHeight(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
        />
      </div>

      {/* 5. Letter Spacing Slider */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <label
            htmlFor={letterSpacingSliderId}
            style={{ fontWeight: 600, fontSize: '11px', color: '#475569' }}
          >
            अक्षर अंतराल (Letter Spacing)
          </label>
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b' }}>
            {currentLetterSpacing} pt
          </span>
        </div>
        <input
          id={letterSpacingSliderId}
          type="range"
          data-testid="letter-spacing-slider"
          min="-1"
          max="6"
          step="0.25"
          value={currentLetterSpacing}
          onChange={(e) => handleUpdateLetterSpacing(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
        />
      </div>

      {/* 6. Alignment & Text Color */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '8px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '11px',
              color: '#475569',
              marginBottom: '4px',
            }}
          >
            संरेखण (Alignment)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {(
              [
                { key: 'left', label: 'बायाँ (L)', testId: 'align-left-btn' },
                { key: 'center', label: 'मध्य (C)', testId: 'align-center-btn' },
                { key: 'right', label: 'दायाँ (R)', testId: 'align-right-btn' },
                { key: 'justify', label: 'समान (J)', testId: 'align-justify-btn' },
              ] as const
            ).map((align) => {
              const isAlignActive = currentTextAlign === align.key;
              return (
                <button
                  key={align.key}
                  type="button"
                  data-testid={align.testId}
                  onClick={() => handleUpdateTextAlign(align.key)}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '4px',
                    border: isAlignActive ? '1px solid #b91c1c' : '1px solid #cbd5e1',
                    backgroundColor: isAlignActive ? '#fef2f2' : '#ffffff',
                    color: isAlignActive ? '#b91c1c' : '#334155',
                    fontWeight: isAlignActive ? 700 : 500,
                    fontSize: '10.5px',
                    cursor: 'pointer',
                  }}
                >
                  {align.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '11px',
              color: '#475569',
              marginBottom: '4px',
            }}
          >
            रंग (Color)
          </label>
          <input
            type="color"
            data-testid="text-color-picker"
            value={currentTextColor}
            onChange={(e) => handleUpdateTextColor(e.target.value)}
            style={{
              width: '42px',
              height: '32px',
              padding: '1px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* 6.1 Text Decoration & Reset Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          paddingTop: '2px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            data-testid="text-underline-btn"
            onClick={() => {
              const nextUnderline = !isUnderlined;
              onUpdateArticle({
                ...article,
                typography: {
                  ...currentTypography,
                  underline: nextUnderline,
                  textDecoration: nextUnderline ? 'underline' : 'none',
                },
              });
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: isUnderlined ? '1px solid #b91c1c' : '1px solid #cbd5e1',
              backgroundColor: isUnderlined ? '#fef2f2' : '#ffffff',
              color: isUnderlined ? '#b91c1c' : '#475569',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            U रेखांकित (Underline)
          </button>
        </div>

        <button
          type="button"
          data-testid="reset-typography-btn"
          onClick={handleResetTargetTypography}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#64748b',
            fontSize: '10.5px',
            cursor: 'pointer',
          }}
        >
          ↺ डिफ़ॉल्ट करें (Reset)
        </button>
      </div>

      {/* 7. Paragraph Spacing & Indentation (Relevant for Body) */}
      {targetElement === 'body' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label
                htmlFor={paraSpacingSliderId}
                style={{ fontWeight: 600, fontSize: '10.5px', color: '#475569' }}
              >
                पैराग्राफ दूरी
              </label>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{currentParaSpacing}pt</span>
            </div>
            <input
              id={paraSpacingSliderId}
              type="range"
              min="0"
              max="24"
              step="1"
              value={currentParaSpacing}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (currentParaIndex !== null) {
                  updateParagraphField('paragraphSpacingPt', val);
                } else {
                  onUpdateArticle({
                    ...article,
                    typography: { ...currentTypography, paragraphSpacingPt: val },
                  });
                }
              }}
              style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label
                htmlFor={textIndentSliderId}
                style={{ fontWeight: 600, fontSize: '10.5px', color: '#475569' }}
              >
                पहली पंक्ति इंडेंट
              </label>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{currentTextIndent}pt</span>
            </div>
            <input
              id={textIndentSliderId}
              type="range"
              min="0"
              max="36"
              step="1"
              value={currentTextIndent}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (currentParaIndex !== null) {
                  updateParagraphField('textIndentPt', val);
                } else {
                  onUpdateArticle({
                    ...article,
                    typography: { ...currentTypography, textIndentPt: val },
                  });
                }
              }}
              style={{ width: '100%', accentColor: '#b91c1c', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* 8. Action Buttons: Add Paragraph & Apply to Page */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
        {onAddParagraph && (
          <button
            type="button"
            data-testid="add-paragraph-btn"
            onClick={onAddParagraph}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px dashed #94a3b8',
              backgroundColor: '#f8fafc',
              color: '#334155',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>+</span> नया अनुच्छेद जोड़ें (Add Paragraph)
          </button>
        )}

        {handleApply && !showApplyConfirm && (
          <button
            type="button"
            data-testid="apply-typography-to-page-btn"
            onClick={() => setShowApplyConfirm(true)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>📑</span> इस पेज के सभी लेखों पर लागू करें (Apply to Page)
          </button>
        )}

        {handleApply && showApplyConfirm && (
          <div
            style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>
              क्या आप इस स्टाइल को वर्तमान पेज के सभी ब्लॉक्स पर लागू करना चाहते हैं?
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                data-testid="confirm-apply-typography-btn"
                onClick={() => {
                  handleApply(article.typography || {});
                  setShowApplyConfirm(false);
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
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
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
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
    </div>
  );
};
