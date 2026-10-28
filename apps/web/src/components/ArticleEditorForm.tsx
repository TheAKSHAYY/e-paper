import React, { useState } from 'react';
import type {
  Article,
  ArticlePriority,
  ImagePlacement,
  ImageAspect,
  ImageFit,
} from '@epaper-studio/document-schema';

export interface ArticleEditorFormProps {
  article: Article;
  maxColumns: number;
  onUpdate: (updated: Article) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

export const ArticleEditorForm: React.FC<ArticleEditorFormProps> = ({
  article,
  maxColumns,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [imageError, setImageError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [initialSnapshot] = useState<Article>({ ...article });

  const handleFieldChange = <K extends keyof Article>(field: K, value: Article[K]) => {
    onUpdate({
      ...article,
      [field]: value,
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setImageError('असमर्थित प्रारूप। कृपया JPEG, PNG, WebP या SVG चित्र चुनें।');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setImageError(
        `चित्र का आकार (${(file.size / (1024 * 1024)).toFixed(1)} MB) अधिकतम सीमा 5 MB से अधिक है।`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        handleFieldChange('imageUrl', result);
        handleFieldChange('imagePlacement', 'top');
      }
    };
    reader.onerror = () => {
      setImageError('चित्र फ़ाइल पढ़ने में विफल।');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (window.confirm('क्या आप इस खबर के परिवर्तनों को पूर्ववत (Undo) करना चाहते हैं?')) {
      onUpdate({ ...initialSnapshot });
    }
  };

  const wordCount = article.body.trim().split(/\s+/).filter(Boolean).length;
  const headlineLen = article.headline.length;

  const priorityLabels: Record<ArticlePriority, { labelHi: string; color: string; bg: string }> = {
    lead: { labelHi: 'मुख्य लीड खबर', color: '#b22222', bg: '#fde8e8' },
    major: { labelHi: 'प्रमुख खबर', color: '#1565c0', bg: '#e8f0fe' },
    minor: { labelHi: 'सामान्य खबर', color: '#2e7d32', bg: '#e8f5e9' },
    brief: { labelHi: 'संक्षिप्त समाचार', color: '#6a1b9a', bg: '#f3e5f5' },
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #d5d0c4',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontFamily: "'Noto Serif Devanagari', serif",
              color: '#111',
            }}
          >
            खबर संपादन:{' '}
            <span style={{ fontWeight: 400, color: '#666' }}>#{article.orderIndex + 1}</span>
          </h3>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: priorityLabels[article.priority].bg,
              color: priorityLabels[article.priority].color,
              fontWeight: 700,
            }}
          >
            {priorityLabels[article.priority].labelHi}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleReset}
            title="किए गए बदलाव पूर्ववत करें"
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              color: '#555',
              cursor: 'pointer',
            }}
          >
            ↩️ पूर्ववत करें
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="संपादक बंद करें"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#888',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 1. Headline (शीर्षक लिखें) */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label
            htmlFor={`headline-${article.id}`}
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#222',
              fontFamily: "'Noto Serif Devanagari', serif",
            }}
          >
            शीर्षक लिखें (Headline) <span style={{ color: '#b22222' }}>*</span>
          </label>
          <span
            style={{
              fontSize: '11px',
              color: headlineLen > 80 ? '#b22222' : '#777',
            }}
          >
            {headlineLen} अक्षर {headlineLen > 80 && '(संतुलित लेआउट के लिए छोटा शीर्षक बेहतर है)'}
          </span>
        </div>
        <input
          id={`headline-${article.id}`}
          type="text"
          value={article.headline}
          onChange={(e) => handleFieldChange('headline', e.target.value)}
          placeholder="जैसे: शिखर सम्मेलन में स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता..."
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '15px',
            fontFamily: "'Noto Serif Devanagari', serif",
            fontWeight: 700,
            border: '1px solid #c5c0b5',
            borderRadius: '6px',
            boxSizing: 'border-box',
            backgroundColor: '#faf9f6',
          }}
        />
      </div>

      {/* 2. Subheadline (छोटी हेडलाइन / उप-शीर्षक) */}
      <div style={{ marginBottom: '14px' }}>
        <label
          htmlFor={`subhead-${article.id}`}
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#444',
            marginBottom: '4px',
            fontFamily: "'Noto Serif Devanagari', serif",
          }}
        >
          छोटी हेडलाइन / उप-शीर्षक (Subheadline / Deck)
        </label>
        <input
          id={`subhead-${article.id}`}
          type="text"
          value={article.subheadline || ''}
          onChange={(e) => handleFieldChange('subheadline', e.target.value)}
          placeholder="जैसे: चार महाद्वीपों में निर्बाध ऊर्जा आपूर्ति के लिए साझा मानक तय..."
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '13px',
            fontFamily: "'Noto Serif Devanagari', serif",
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* 3. Body Text (खबर का विवरण) */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label
            htmlFor={`body-${article.id}`}
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#222',
              fontFamily: "'Noto Serif Devanagari', serif",
            }}
          >
            खबर का पूरा विवरण (News Body) <span style={{ color: '#b22222' }}>*</span>
          </label>
          <span style={{ fontSize: '11px', color: '#777' }}>
            {wordCount} शब्द • {article.body.length} अक्षर (पैराग्राफ अलग करने हेतु खाली लाइन
            छोड़ें)
          </span>
        </div>
        <textarea
          id={`body-${article.id}`}
          rows={7}
          value={article.body}
          onChange={(e) => handleFieldChange('body', e.target.value)}
          placeholder="अपनी खबर का पूरा विवरण यहाँ लिखें। एक अच्छे समाचार में स्थान, तथ्य, आधिकारिक बयान और स्पष्ट संदर्भ शामिल होते हैं..."
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '13.5px',
            fontFamily: "'Noto Serif Devanagari', serif",
            lineHeight: 1.5,
            border: '1px solid #c5c0b5',
            borderRadius: '6px',
            boxSizing: 'border-box',
            resize: 'vertical',
            backgroundColor: '#faf9f6',
          }}
        />
      </div>

      {/* 4. Photo Section (फोटो लगाएँ) */}
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#fbfaf7',
          borderRadius: '6px',
          border: '1px solid #e5e1d8',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📷</span>
            <span>फोटो लगाएँ (Photo / Illustration)</span>
          </span>
          {article.imageUrl && (
            <button
              type="button"
              onClick={() => {
                handleFieldChange('imageUrl', '');
                handleFieldChange('imageCaption', '');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#b22222',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              फोटो हटाएँ
            </button>
          )}
        </div>

        {article.imageUrl ? (
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <img
                src={article.imageUrl}
                alt={article.imageCaption || 'खबर की फोटो'}
                style={{
                  width: '90px',
                  height: '65px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    value={article.imageCaption || ''}
                    onChange={(e) => handleFieldChange('imageCaption', e.target.value)}
                    placeholder="फोटो का कैप्शन (जैसे: नई दिल्ली में संवाददाताओं को संबोधित करते हुए...)"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    value={article.imageCredit || ''}
                    onChange={(e) => handleFieldChange('imageCredit', e.target.value)}
                    placeholder="छायाकार / फोटो साभार (जैसे: फोटो: पीटीआई / विशेष संवाददाता)"
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '11px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <label
                        htmlFor={`img-placement-${article.id}`}
                        style={{ fontSize: '11px', color: '#555' }}
                      >
                        स्थान:
                      </label>
                      <select
                        id={`img-placement-${article.id}`}
                        value={article.imagePlacement}
                        onChange={(e) =>
                          handleFieldChange('imagePlacement', e.target.value as ImagePlacement)
                        }
                        style={{
                          padding: '3px 6px',
                          fontSize: '11px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      >
                        <option value="top">खबर के ऊपर (Top)</option>
                        <option value="middle">शीर्षक के नीचे (Below Headline)</option>
                        <option value="side">बराबर में (Side Float)</option>
                        <option value="bottom">खबर के नीचे (Bottom)</option>
                        <option value="none">छुपाएँ (Hidden)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <label
                        htmlFor={`img-aspect-${article.id}`}
                        style={{ fontSize: '11px', color: '#555' }}
                      >
                        अनुपात:
                      </label>
                      <select
                        id={`img-aspect-${article.id}`}
                        value={article.imageAspect ?? 'standard'}
                        onChange={(e) =>
                          handleFieldChange('imageAspect', e.target.value as ImageAspect)
                        }
                        style={{
                          padding: '3px 6px',
                          fontSize: '11px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      >
                        <option value="standard">4:3 (मानक)</option>
                        <option value="wide">16:9 (वाइड)</option>
                        <option value="square">1:1 (चौकोर)</option>
                        <option value="portrait">3:4 (पोर्ट्रेट)</option>
                        <option value="original">मूल अनुपात (Original)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <label
                        htmlFor={`img-fit-${article.id}`}
                        style={{ fontSize: '11px', color: '#555' }}
                      >
                        फिट:
                      </label>
                      <select
                        id={`img-fit-${article.id}`}
                        value={article.imageFit ?? 'cover'}
                        onChange={(e) => handleFieldChange('imageFit', e.target.value as ImageFit)}
                        style={{
                          padding: '3px 6px',
                          fontSize: '11px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      >
                        <option value="cover">क्रॉप भरें (Cover)</option>
                        <option value="contain">पूरी दिखाएँ (Contain)</option>
                        <option value="fill">खिंचाव (Fill)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label
              htmlFor={`file-upload-${article.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: '7px 14px',
                backgroundColor: '#ede8dc',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#333',
                border: '1px solid #ccc',
              }}
            >
              <span>📁</span>
              <span>फ़ोन या कंप्यूटर से फोटो चुनें</span>
            </label>
            <input
              id={`file-upload-${article.id}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '11px', color: '#888' }}>(JPEG, PNG, WebP &lt; 5MB)</span>
          </div>
        )}

        {imageError && (
          <div style={{ color: '#b71c1c', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
            ⚠️ {imageError}
          </div>
        )}
      </div>

      {/* Collapsible Advanced Options (उन्नत विकल्प) */}
      <div style={{ marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          <span>उन्नत विकल्प (कॉलम चौड़ाई, लेखक, स्थान व प्राथमिकता)</span>
        </button>

        {showAdvanced && (
          <div
            style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#f5f4ef',
              borderRadius: '6px',
              border: '1px solid #e0ddd4',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
            }}
          >
            {/* Byline */}
            <div>
              <label
                htmlFor={`byline-${article.id}`}
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                संवाददाता / लेखक (Byline)
              </label>
              <input
                id={`byline-${article.id}`}
                type="text"
                value={article.byline || ''}
                onChange={(e) => handleFieldChange('byline', e.target.value)}
                placeholder="जैसे: विशेष संवाददाता"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Dateline */}
            <div>
              <label
                htmlFor={`dateline-${article.id}`}
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                स्थान / शहर (Dateline)
              </label>
              <input
                id={`dateline-${article.id}`}
                type="text"
                value={article.dateline || ''}
                onChange={(e) => handleFieldChange('dateline', e.target.value)}
                placeholder="जैसे: नई दिल्ली —"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Column Span */}
            <div>
              <label
                htmlFor={`col-span-${article.id}`}
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                कॉलम फैलाव (Column Span)
              </label>
              <select
                id={`col-span-${article.id}`}
                value={article.columnSpan}
                onChange={(e) => handleFieldChange('columnSpan', parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                }}
              >
                {Array.from({ length: maxColumns }, (_, i) => i + 1).map((cols) => (
                  <option key={cols} value={cols}>
                    {cols} {cols === 1 ? 'कॉलम' : 'कॉलम चौड़ा'}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor={`priority-${article.id}`}
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                खबर का महत्व (Priority)
              </label>
              <select
                id={`priority-${article.id}`}
                value={article.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value as ArticlePriority)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                }}
              >
                <option value="lead">मुख्य लीड खबर (Lead)</option>
                <option value="major">प्रमुख खबर (Major)</option>
                <option value="minor">सामान्य खबर (Minor)</option>
                <option value="brief">संक्षिप्त समाचार (Brief)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Delete Article Action with Confirmation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '10px',
          borderTop: '1px solid #eee',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `क्या आप सचमुच "${article.headline.slice(0, 40)}..." को हटाना चाहते हैं?`
              )
            ) {
              onDelete(article.id);
            }
          }}
          style={{
            backgroundColor: '#fee',
            color: '#b22222',
            border: '1px solid #ef9a9a',
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🗑️ खबर हटाएँ
        </button>
      </div>
    </div>
  );
};
