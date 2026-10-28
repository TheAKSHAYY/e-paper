import React, { useState, useEffect } from 'react';
import type {
  PageSizePreset,
  PageOrientation,
  NewspaperPresetId,
} from '@epaper-studio/document-schema';
import { PAGE_SIZE_DEFINITIONS } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';
import { draftStorage, type DraftSummary } from '../../storage';

export interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (options: {
    title: string;
    subtitle: string;
    edition: string;
    date: string;
    language: string;
    direction: 'ltr' | 'rtl';
    pageSize: PageSizePreset;
    orientation: PageOrientation;
    presetId: NewspaperPresetId;
    pageCount: number;
    startBlank: boolean;
  }) => void;
  onLoadDraft?: (id: string) => void;
  onSelectPresetDirect?: (presetId: NewspaperPresetId) => void;
}

type SetupTab = 'templates' | 'custom' | 'drafts';

export const ProjectSetupModal: React.FC<ProjectSetupModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onLoadDraft,
  onSelectPresetDirect,
}) => {
  const presets = getAllNewspaperPresets();
  const [activeTab, setActiveTab] = useState<SetupTab>('templates');
  const [savedDrafts, setSavedDrafts] = useState<DraftSummary[]>([]);

  // Form Fields
  const [title, setTitle] = useState('जनवाणी समाचार');
  const [subtitle, setSubtitle] = useState('सत्य, निष्पक्षता और जनसेवा का प्रतीक • स्थापना 1947');
  const [edition, setEdition] = useState('प्रातःकालीन मुख्य संस्करण');
  const [date, setDate] = useState('मंगलवार, 27 अक्टूबर 2026');
  const [language, setLanguage] = useState<'hi' | 'en' | 'bilingual'>('hi');
  const [pageSize, setPageSize] = useState<PageSizePreset>('broadsheet');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [presetId] = useState<NewspaperPresetId>('classic-hindi-broadsheet');
  const [pageCount, setPageCount] = useState<number>(1);
  const [startBlank, setStartBlank] = useState<boolean>(false);

  // Load existing drafts on open
  useEffect(() => {
    if (isOpen) {
      draftStorage.listDrafts().then(setSavedDrafts).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      subtitle: subtitle.trim(),
      edition: edition.trim() || 'मुख्य संस्करण',
      date: date.trim() || '27 अक्टूबर 2026',
      language: language === 'en' ? 'en' : 'hi',
      direction: 'ltr',
      pageSize,
      orientation,
      presetId,
      pageCount,
      startBlank,
    });
    onClose();
  };

  const handlePickTemplate = (pId: NewspaperPresetId) => {
    if (onSelectPresetDirect) {
      onSelectPresetDirect(pId);
      onClose();
    } else {
      const selected = presets.find((p) => p.id === pId);
      onCreate({
        title: selected ? selected.defaultMasthead.title : 'जनवाणी समाचार',
        subtitle: selected ? selected.defaultMasthead.subtitle : '',
        edition: 'मुख्य संस्करण',
        date: 'मंगलवार, 27 अक्टूबर 2026',
        language: 'hi',
        direction: 'ltr',
        pageSize: selected?.recommendedPageSize || 'broadsheet',
        orientation: 'portrait',
        presetId: pId,
        pageCount: 1,
        startBlank: false,
      });
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          border: '1px solid #111827',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '2px solid #111827',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px',
                fontFamily: "'Noto Serif Devanagari', serif",
              }}
            >
              प
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#111827',
                  fontFamily: "'Noto Serif Devanagari', serif",
                }}
              >
                नया समाचार पत्र प्रकाशन आरंभ करें
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Start a New Publication • Broadsheet, Tabloid or Custom Setup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="संवाद बंद करें"
            style={{
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: '2px',
              fontSize: '16px',
              color: '#475569',
              cursor: 'pointer',
              padding: '4px 10px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* 3 Step Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderBottom:
                activeTab === 'templates' ? '3px solid #b91c1c' : '3px solid transparent',
              backgroundColor: activeTab === 'templates' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'templates' ? '#111827' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>1. पेशेवर प्रारूप चुनें (Templates)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'custom' ? '3px solid #b91c1c' : '3px solid transparent',
              backgroundColor: activeTab === 'custom' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'custom' ? '#111827' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>2. कस्टम विन्यास (Custom Setup)</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderBottom: activeTab === 'drafts' ? '3px solid #b91c1c' : '3px solid transparent',
              backgroundColor: activeTab === 'drafts' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'drafts' ? '#111827' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>3. सहेजे गए ड्राफ्ट ({savedDrafts.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* ========================================================
           * TAB 1: TEMPLATES (One-click launch with realistic previews)
           * ======================================================== */}
          {activeTab === 'templates' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                  एक क्लिक में प्रमाणित समाचार पत्र शैली से शुरुआत करें
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  किसी भी टेम्पलेट पर क्लिक करके सीधे संपादक में जाएं—मास्टहेड, हेडिंग्स और ग्रिड
                  पहले से तैयार मिलेंगे।
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '16px',
                }}
              >
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handlePickTemplate(preset.id)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '2px',
                      padding: '16px',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#111827';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      {/* Mini Preview Header */}
                      <div
                        style={{
                          borderBottom: '2px solid #111827',
                          paddingBottom: '8px',
                          marginBottom: '10px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 900,
                            color: '#b91c1c',
                            fontFamily: "'Noto Serif Devanagari', serif",
                          }}
                        >
                          {preset.defaultMasthead.title}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
                          {preset.recommendedPageSize.toUpperCase()} • {preset.defaultColumns}{' '}
                          COLUMNS
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#111827',
                          marginBottom: '4px',
                        }}
                      >
                        {preset.name}
                      </div>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: '#4b5563',
                          lineHeight: 1.5,
                          margin: '0 0 12px 0',
                        }}
                      >
                        {preset.description}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePickTemplate(preset.id);
                      }}
                      style={{
                        backgroundColor: '#111827',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      यह प्रारूप लोड करें →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
           * TAB 2: CUSTOM SETUP (Fine-grained control)
           * ======================================================== */}
          {activeTab === 'custom' && (
            <form onSubmit={handleSubmitCustom}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Publication Title */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '6px',
                    }}
                  >
                    अख़बार का नाम (Publication Masthead Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '2px',
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: "'Noto Serif Devanagari', serif",
                      color: '#111827',
                      boxSizing: 'border-box',
                    }}
                    placeholder="उदा. जनवाणी समाचार / The Daily Gazette"
                  />
                </div>

                {/* Subtitle & Tagline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      उप-शीर्षक / ध्येय वाक्य (Tagline)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      संस्करण विवरण (Edition)
                    </label>
                    <input
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Date & Language */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      प्रकाशन तिथि (Date)
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      प्रकाशन भाषा (Language)
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'hi' | 'en' | 'bilingual')}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="hi">हिंदी (Hindi Daily)</option>
                      <option value="en">English (English Daily)</option>
                      <option value="bilingual">द्विभाषी (Bilingual / Hindi + English)</option>
                    </select>
                  </div>
                </div>

                {/* Page Size & Orientation */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      पृष्ठ आकार (Physical Newspaper Standard)
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as PageSizePreset)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      {Object.entries(PAGE_SIZE_DEFINITIONS).map(([key, def]) => (
                        <option key={key} value={key}>
                          {def.name} ({def.widthMm} × {def.heightMm} mm)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '4px',
                      }}
                    >
                      दिशानिर्देश (Orientation)
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        fontSize: '13px',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="portrait">पोर्ट्रेट (Portrait)</option>
                      <option value="landscape">लैंडस्केप (Landscape)</option>
                    </select>
                  </div>
                </div>

                {/* Starting Content Mode */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '12px 16px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                      पूर्णतः खाली पृष्ठ से आरंभ करें (Start from Blank Page)
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      यदि चेक किया गया, तो कोई नमूना समाचार लोड नहीं होगा।
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={startBlank}
                    onChange={(e) => setStartBlank(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                {/* Page Count */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '4px',
                    }}
                  >
                    प्रारंभिक पृष्ठ संख्या (Initial Pages)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 4, 8].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setPageCount(num)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: pageCount === num ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                          backgroundColor: pageCount === num ? '#fee2e2' : '#ffffff',
                          color: pageCount === num ? '#991b1b' : '#374151',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        {num} {num === 1 ? 'पेज' : 'पेज'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '12px',
                  }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '2px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    रद्द करें
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#b91c1c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '2px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(185, 28, 28, 0.3)',
                    }}
                  >
                    <span>अख़बार शुरू करें (Create Newspaper)</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================
           * TAB 3: SAVED DRAFTS (Resume previous session)
           * ======================================================== */}
          {activeTab === 'drafts' && (
            <div>
              {savedDrafts.length === 0 ? (
                <div
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '2px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '4px',
                    }}
                  >
                    कोई सुरक्षित ड्राफ्ट नहीं मिला
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                    जब आप समाचार पत्र में काम करेंगे, वह स्वतः आपके ब्राउज़र में सुरक्षित हो जाएगा।
                  </div>
                  <button
                    onClick={() => setActiveTab('templates')}
                    style={{
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    टेम्पलेट से शुरुआत करें →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {savedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '2px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                          {draft.title || 'अनाम समाचार पत्र'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          अंतिम संशोधन: {new Date(draft.updatedAt).toLocaleString('en-IN')} •{' '}
                          {draft.articleCount} समाचार • {draft.pageSize.toUpperCase()}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onLoadDraft) {
                            onLoadDraft(draft.id);
                            onClose();
                          }
                        }}
                        style={{
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '2px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ड्राफ्ट खोलें →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
