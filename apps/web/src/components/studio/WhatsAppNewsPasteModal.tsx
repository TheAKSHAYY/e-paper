import React, { useState } from 'react';
import type { Article } from '@epaper-studio/document-schema';
import { parseWhatsAppDispatch, type ParsedWhatsAppStory } from '../../utils/whatsappParser';

export interface WhatsAppNewsPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertStories: (stories: Array<Partial<Article>>) => void;
  isMobile?: boolean;
}

export const WhatsAppNewsPasteModal: React.FC<WhatsAppNewsPasteModalProps> = ({
  isOpen,
  onClose,
  onInsertStories,
  isMobile = false,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedStories, setParsedStories] = useState<ParsedWhatsAppStory[]>([]);
  const [hasParsed, setHasParsed] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showRawText, setShowRawText] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawText.trim()) return;
    const results = parseWhatsAppDispatch(rawText);
    setParsedStories(results);
    setHasParsed(true);
    setSelectedIndex(0);
  };

  const handleUpdateStory = (index: number, updated: Partial<ParsedWhatsAppStory>) => {
    setParsedStories((prev) => prev.map((s, idx) => (idx === index ? { ...s, ...updated } : s)));
  };

  const handleInsertSelected = () => {
    const current = parsedStories[selectedIndex];
    if (!current) return;

    const block: Partial<Article> = {
      headline: current.headline,
      subheadline: current.subheadline || '',
      body: current.body,
      byline: current.byline || 'विशेष संवाददाता',
      dateline: current.dateline || '',
      priority: 'major',
    };

    onInsertStories([block]);
    onClose();
  };

  const handleInsertAll = () => {
    if (parsedStories.length === 0) return;

    const blocks: Array<Partial<Article>> = parsedStories.map((s) => ({
      headline: s.headline,
      subheadline: s.subheadline || '',
      body: s.body,
      byline: s.byline || 'विशेष संवाददाता',
      dateline: s.dateline || '',
      priority: 'major',
    }));

    onInsertStories(blocks);
    onClose();
  };

  const handleReset = () => {
    setRawText('');
    setParsedStories([]);
    setHasParsed(false);
    setSelectedIndex(0);
    setShowRawText(false);
  };

  const currentStory = parsedStories[selectedIndex];

  return (
    <div
      data-testid="whatsapp-news-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="whatsapp-news-modal-content"
        style={{
          width: isMobile ? '100%' : '680px',
          maxHeight: isMobile ? '92vh' : '88vh',
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '16px 16px 0 0' : '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#166534',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #15803d',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📲</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                त्वरित व्हाट्सएप समाचार पेस्ट (Quick News Intake)
              </h3>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>
                कच्ची खबर पेस्ट करें — ऑटोमैटिक शीर्षक व मूल पाठ अलग करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="btn-close-whatsapp-modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body content */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {!hasParsed ? (
            /* Input View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>व्हाट्सएप या रिपोर्टर का कच्चा समाचार यहाँ पेस्ट करें:</span>
              </label>

              <textarea
                data-testid="whatsapp-raw-textarea"
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="व्हाट्सएप से कॉपी किया गया संदेश यहाँ पेस्ट करें...&#10;&#10;उदाहरण:&#10;*सड़क दुर्घटना में 4 घायल, राहत कार्य जारी*&#10;विशेष संवाददाता: कुलदीप अवस्थी&#10;लखनऊ — लखनऊ-कानपुर हाईवे पर आज सुबह घना कोहरा होने से..."
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  fontFamily: "'Noto Serif Devanagari', serif",
                  outline: 'none',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11.5px',
                  color: '#64748b',
                }}
              >
                <span>💡 एक साथ कई खबरें (--- या *** से अलग) भी पेस्ट कर सकते हैं।</span>
                <span>{rawText.length} वर्ण</span>
              </div>

              {/* Sample loader button for quick preview / testing */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  data-testid="btn-load-sample-dispatch"
                  onClick={() =>
                    setRawText(
                      `[11:30 AM, 11/10/2026] Reporter Ramesh: Forwarded\n*ऐतिहासिक नीति पर मुहर: ग्रामीण विकास के लिए 500 करोड़ स्वीकृत*\nविशेष संवाददाता: राजेश वर्मा\nलखनऊ — प्रदेश सरकार ने ग्रामीण बुनियादी ढांचे के विस्तार के लिए 500 करोड़ रुपये की नई परियोजना को स्वीकृति दे दी है। इस योजना से 1500 से अधिक ग्राम पंचायतों को सीधे लाभ मिलेगा।\n\n---\n\n*जिले में मूसलाधार बारिश: 40 गांवों का संपर्क टूटा*\nसंवाददाता: सुनील यादव\nगोरखपुर — पिछले 24 घंटों में हुई भारी बारिश से राप्ती नदी का जलस्तर खतरे के निशान के पार पहुंच गया है। प्रशासन ने राहत और बचाव कार्य तेज कर दिया है।`
                    )
                  }
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: '#166534',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  📋 उदाहरण समाचार भरें (Load Sample)
                </button>
              </div>
            </div>
          ) : (
            /* Review & Edit View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Multi-story switcher if > 1 stories */}
              {parsedStories.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    overflowX: 'auto',
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                    पहचानी गई खबरें ({parsedStories.length}):
                  </span>
                  {parsedStories.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      data-testid={`story-tab-${idx}`}
                      onClick={() => setSelectedIndex(idx)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedIndex === idx ? '#166534' : '#e2e8f0',
                        color: selectedIndex === idx ? '#ffffff' : '#475569',
                      }}
                    >
                      खबर {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Editable Fields for selected story */}
              {currentStory && (
                <div
                  data-testid="parsed-story-preview"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {/* Headline */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '3px',
                      }}
                    >
                      📌 मुख्य शीर्षक (Headline) *
                    </label>
                    <input
                      type="text"
                      data-testid="input-parsed-headline"
                      value={currentStory.headline}
                      onChange={(e) =>
                        handleUpdateStory(selectedIndex, { headline: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        fontFamily: "'Noto Serif Devanagari', serif",
                      }}
                    />
                  </div>

                  {/* Subheadline (Optional) */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#475569',
                        marginBottom: '3px',
                      }}
                    >
                      उप-शीर्षक (Subheadline - वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      data-testid="input-parsed-subheadline"
                      value={currentStory.subheadline || ''}
                      onChange={(e) =>
                        handleUpdateStory(selectedIndex, { subheadline: e.target.value })
                      }
                      placeholder="उप-शीर्षक यदि हो..."
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Dateline & Byline */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        स्थान / डेटलाइन (Dateline)
                      </label>
                      <input
                        type="text"
                        data-testid="input-parsed-dateline"
                        value={currentStory.dateline || ''}
                        onChange={(e) =>
                          handleUpdateStory(selectedIndex, { dateline: e.target.value })
                        }
                        placeholder="उदा. लखनऊ —"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: '#475569',
                          marginBottom: '3px',
                        }}
                      >
                        रिपोर्टर / लेखक (Byline)
                      </label>
                      <input
                        type="text"
                        data-testid="input-parsed-byline"
                        value={currentStory.byline || ''}
                        onChange={(e) =>
                          handleUpdateStory(selectedIndex, { byline: e.target.value })
                        }
                        placeholder="उदा. विशेष संवाददाता"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Body Text */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '3px',
                      }}
                    >
                      📄 समाचार मूल पाठ (Body Text) *
                    </label>
                    <textarea
                      rows={5}
                      data-testid="input-parsed-body"
                      value={currentStory.body}
                      onChange={(e) => handleUpdateStory(selectedIndex, { body: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        lineHeight: '1.5',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        fontFamily: "'Noto Serif Devanagari', serif",
                      }}
                    />
                  </div>

                  {/* Source Metadata & Verification Guarantee */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#475569',
                      backgroundColor: '#f8fafc',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span>
                      स्रोत: <strong>{currentStory.source}</strong> ({currentStory.date})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRawText(!showRawText)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        textDecoration: 'underline',
                      }}
                    >
                      {showRawText ? 'मूल पाठ छिपाएँ ▲' : 'मूल व्हाट्सएप संदेश देखें ▼'}
                    </button>
                  </div>

                  {/* Accordion showing unedited raw text */}
                  {showRawText && (
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        color: '#334155',
                        maxHeight: '100px',
                        overflowY: 'auto',
                      }}
                    >
                      {currentStory.rawText}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {!hasParsed ? (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                data-testid="btn-parse-whatsapp"
                onClick={handleParse}
                disabled={!rawText.trim()}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: rawText.trim() ? '#166534' : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: rawText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🔍 समाचार विश्लेषित करें (Parse News)</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                ↺ नया टेक्स्ट पेस्ट करें
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                {parsedStories.length > 1 && (
                  <button
                    type="button"
                    data-testid="btn-insert-all-stories"
                    onClick={handleInsertAll}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #166534',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    सभी {parsedStories.length} खबरें जोड़ें
                  </button>
                )}
                <button
                  type="button"
                  data-testid="btn-insert-story-to-page"
                  onClick={handleInsertSelected}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#166534',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>✓ पेज पर जोड़ें (Insert to Page)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
