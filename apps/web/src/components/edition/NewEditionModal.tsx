import React, { useState } from 'react';
import type { PageSizePreset, PageOrientation, NewspaperPresetId, NewspaperDocument } from '@epaper-studio/document-schema';
import { PAGE_SIZE_DEFINITIONS, getPageDimensions } from '@epaper-studio/document-schema';
import { createNewspaperDocument, NEWSPAPER_PRESETS } from '@epaper-studio/template-engine';
import { publisherProfileStorage } from '../../storage/PublisherProfileStorage';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';

export interface NewEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEdition: (doc: NewspaperDocument, editionName: string) => void;
}

export const NewEditionModal: React.FC<NewEditionModalProps> = ({
  isOpen,
  onClose,
  onCreateEdition,
}) => {
  const { t, locale } = useI18n();
  const profile = publisherProfileStorage.getProfile();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Identity
  const [editionName, setEditionName] = useState(
    locale === 'en'
      ? `${profile.newspaperTitle || 'The Daily Chronicle'} — Issue ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : `${profile.newspaperTitle || 'दैनिक नवप्रभात'} — ${new Date().toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })} अंक`
  );
  const [mastheadTitle, setMastheadTitle] = useState(profile.newspaperTitle || (locale === 'en' ? 'The Daily Chronicle' : 'दैनिक नवप्रभात'));
  const [tagline, setTagline] = useState(profile.tagline || (locale === 'en' ? 'The Voice of Truth, Integrity and Public Trust' : 'सत्य, निष्पक्षता और जनसेवा का प्रतीक'));
  const [language, setLanguage] = useState<'hi' | 'en'>(locale === 'en' ? 'en' : 'hi');
  const [editionDate, setEditionDate] = useState(
    new Date().toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  // Step 2: Geometry
  const [pageSize, setPageSize] = useState<PageSizePreset>(profile.preferredPageSize || 'broadsheet');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');

  // Step 3: Template
  const [selectedPresetId, setSelectedPresetId] = useState<NewspaperPresetId>('classic-hindi-broadsheet');
  const [startBlank, setStartBlank] = useState<boolean>(false);

  if (!isOpen) return null;

  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const fonts = PUBLISHER_DESIGN_SYSTEM.fonts;
  const dimensions = getPageDimensions(pageSize, orientation);
  const pageDef = PAGE_SIZE_DEFINITIONS[pageSize];

  const handleFinish = () => {
    // Generate new document
    const doc = createNewspaperDocument({
      presetId: startBlank ? undefined : selectedPresetId,
      pageSize,
    });

    // Sync customized identity
    doc.metadata.title = editionName;
    doc.metadata.language = language;
    doc.metadata.pageSize = pageSize;
    doc.metadata.orientation = orientation;
    doc.masthead.title = mastheadTitle;
    doc.masthead.tagline = tagline;
    doc.masthead.date = editionDate;

    onCreateEdition(doc, editionName);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 23, 23, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          fontFamily: fonts.interface,
          overflow: 'hidden',
        }}
      >
        {/* Wizard Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.borderMuted}`,
            backgroundColor: '#FAF9F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: colors.pressRed, textTransform: 'uppercase' }}>
              {t.wizard.modalTitle} • {locale === 'en' ? `Step ${step} of 4` : `चरण ${step} / 4`}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: colors.inkBlack, margin: '2px 0 0 0', fontFamily: fonts.display }}>
              {step === 1 && t.wizard.step1Title}
              {step === 2 && t.wizard.step2Title}
              {step === 3 && t.wizard.step3Title}
              {step === 4 && t.wizard.step4Title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}
          >
            ✕
          </button>
        </div>

        {/* Wizard Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: colors.inkBlack, marginBottom: '4px' }}>
                  {locale === 'en' ? 'Edition / Issue Name *' : 'संस्करण का नाम *'}
                </label>
                <input
                  type="text"
                  required
                  value={editionName}
                  onChange={(e) => setEditionName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.borderMuted}`,
                    fontSize: '13.5px',
                    backgroundColor: colors.warmPaper,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: colors.inkBlack, marginBottom: '4px' }}>
                  {t.wizard.newspaperName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.wizard.newspaperNamePlaceholder}
                  value={mastheadTitle}
                  onChange={(e) => setMastheadTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.borderMuted}`,
                    fontSize: '13.5px',
                    backgroundColor: colors.warmPaper,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: colors.inkBlack, marginBottom: '4px' }}>
                  {t.wizard.tagline}
                </label>
                <input
                  type="text"
                  placeholder={t.wizard.taglinePlaceholder}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.borderMuted}`,
                    fontSize: '13.5px',
                    backgroundColor: colors.warmPaper,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: colors.inkBlack, marginBottom: '4px' }}>
                    {t.wizard.primaryLanguage}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'hi' | 'en')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${colors.borderMuted}`,
                      fontSize: '13px',
                      backgroundColor: colors.warmPaper,
                    }}
                  >
                    <option value="hi">हिंदी (Devanagari)</option>
                    <option value="en">English (Latin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: colors.inkBlack, marginBottom: '4px' }}>
                    {t.wizard.publicationDate}
                  </label>
                  <input
                    type="text"
                    value={editionDate}
                    onChange={(e) => setEditionDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${colors.borderMuted}`,
                      fontSize: '13px',
                      backgroundColor: colors.warmPaper,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAGE CONFIGURATION */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.inkBlack, marginBottom: '8px' }}>
                  {t.wizard.pageFormatTitle}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {(['broadsheet', 'berliner', 'tabloid', 'a3', 'a4'] as PageSizePreset[]).map((preset) => {
                    const def = PAGE_SIZE_DEFINITIONS[preset];
                    const isSelected = pageSize === preset;
                    return (
                      <div
                        key={preset}
                        onClick={() => setPageSize(preset)}
                        style={{
                          border: isSelected ? `2px solid ${colors.pressRed}` : `1px solid ${colors.borderMuted}`,
                          backgroundColor: isSelected ? '#FDF2F1' : colors.warmPaper,
                          borderRadius: '6px',
                          padding: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? colors.pressRed : colors.inkBlack }}>
                          {def.name}
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                          {def.widthMm}mm × {def.heightMm}mm
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: colors.inkBlack, marginBottom: '8px' }}>
                  {locale === 'en' ? 'Page Orientation' : 'अभिविन्यास'}
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '4px',
                      border: orientation === 'portrait' ? `2px solid ${colors.pressRed}` : `1px solid ${colors.borderMuted}`,
                      backgroundColor: orientation === 'portrait' ? '#FDF2F1' : '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {locale === 'en' ? 'Portrait' : 'पोर्ट्रेट (उर्ध्व)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '4px',
                      border: orientation === 'landscape' ? `2px solid ${colors.pressRed}` : `1px solid ${colors.borderMuted}`,
                      backgroundColor: orientation === 'landscape' ? '#FDF2F1' : '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {locale === 'en' ? 'Landscape' : 'लैंडस्केप (क्षैतिज)'}
                  </button>
                </div>
              </div>

              {/* Geometry Preview Callout */}
              <div style={{ backgroundColor: '#FAF9F6', border: `1px solid ${colors.borderMuted}`, borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: colors.inkBlack, marginBottom: '4px' }}>
                  {locale === 'en' ? 'Physical Geometry Summary:' : 'भौतिक ज्यामिति सारांश:'}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  • {locale === 'en' ? 'Overall Dimensions:' : 'कुल आकार:'} {dimensions.widthMm}mm × {dimensions.heightMm}mm ({dimensions.widthIn}" × {dimensions.heightIn}")<br />
                  • {locale === 'en' ? 'Print Quality: Pure vector output at plate dimensions' : 'मुद्रण गुणवत्ता: शुद्ध वेक्टर मानक'}<br />
                  • {locale === 'en' ? 'Grid Layout: 12-column physical modular grid' : 'डिफ़ॉल्ट ग्रिड: 12-कॉलम मॉड्यूलर विभाजन'}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TEMPLATE SELECTION */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStartBlank(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '4px',
                    border: !startBlank ? `2px solid ${colors.pressRed}` : `1px solid ${colors.borderMuted}`,
                    backgroundColor: !startBlank ? '#FDF2F1' : '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {locale === 'en' ? 'Use Master Preset Template' : 'तैयार टेम्पलेट से शुरू करें'}
                </button>
                <button
                  type="button"
                  onClick={() => setStartBlank(true)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '4px',
                    border: startBlank ? `2px solid ${colors.pressRed}` : `1px solid ${colors.borderMuted}`,
                    backgroundColor: startBlank ? '#FDF2F1' : '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {locale === 'en' ? 'Start with Blank Page' : 'कोरे पृष्ठ से शुरू करें'}
                </button>
              </div>

              {!startBlank && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.values(NEWSPAPER_PRESETS).slice(0, 3).map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        style={{
                          border: isSelected ? `2px solid ${colors.pressRed}` : `1px solid ${colors.borderMuted}`,
                          backgroundColor: isSelected ? '#FDF2F1' : '#FFFFFF',
                          borderRadius: '6px',
                          padding: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: colors.inkBlack }}>{preset.name}</span>
                          <span style={{ fontSize: '11px', color: colors.textMuted }}>{preset.defaultColumns} Columns</span>
                        </div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                          {preset.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {startBlank && (
                <div style={{ padding: '24px', backgroundColor: '#FAF9F6', border: `1px dashed ${colors.borderMuted}`, borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: colors.inkBlack }}>
                    {locale === 'en' ? 'Clean Blank 12-Column Canvas' : 'स्वच्छ कोरा पृष्ठ'}
                  </div>
                  <p style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                    {locale === 'en'
                      ? 'Begin with masthead and empty 12-column grid. You can place news stories, images, and ads directly in the studio.'
                      : 'मास्टहेड हेडर और कोरे 12-कॉलम ग्रिड के साथ शुरुआत करें। आप संपादक में मनचाहे समाचार, कॉलम और विज्ञापन सीधे जोड़ सकेंगे।'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FAF9F6', border: `1px solid ${colors.borderMuted}`, borderRadius: '6px', padding: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: colors.inkBlack, margin: '0 0 12px 0' }}>
                  {t.wizard.summaryTitle}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                  <div><span style={{ color: colors.textMuted }}>{t.wizard.summaryName}:</span> <strong>{editionName}</strong></div>
                  <div><span style={{ color: colors.textMuted }}>{locale === 'en' ? 'Masthead:' : 'मास्टहेड:'}</span> <strong>{mastheadTitle}</strong></div>
                  <div><span style={{ color: colors.textMuted }}>{t.wizard.summaryFormat}:</span> <strong>{pageDef.name} ({orientation})</strong></div>
                  <div><span style={{ color: colors.textMuted }}>{locale === 'en' ? 'Language:' : 'भाषा:'}</span> <strong>{language === 'hi' ? 'हिंदी' : 'English'}</strong></div>
                  <div><span style={{ color: colors.textMuted }}>{t.wizard.publicationDate}:</span> <strong>{editionDate}</strong></div>
                  <div><span style={{ color: colors.textMuted }}>{t.wizard.summaryTemplate}:</span> <strong>{startBlank ? (locale === 'en' ? 'Blank Canvas' : 'कोरा पृष्ठ') : (locale === 'en' ? 'Preset Template' : 'तैयार टेम्पलेट')}</strong></div>
                </div>
              </div>

              <p style={{ fontSize: '12.5px', color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                {locale === 'en'
                  ? 'Clicking "Create Edition" initializes the newspaper edition and launches the studio editor.'
                  : '"संस्करण बनाएं" पर क्लिक करते ही नया समाचार पत्र सुरक्षित रूप से सृजित हो जाएगा और स्टूडियो संपादक खुल जाएगा।'}
              </p>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${colors.borderMuted}`,
            backgroundColor: '#FAF9F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as typeof step)}
              style={{
                backgroundColor: '#FFFFFF',
                color: colors.textSecondary,
                border: `1px solid ${colors.borderMuted}`,
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← {t.wizard.prevStepBtn}
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#FFFFFF',
                color: colors.textMuted,
                border: `1px solid ${colors.borderMuted}`,
                borderRadius: '4px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.wizard.cancelBtn}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as typeof step)}
                style={{
                  backgroundColor: colors.pressRed,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.wizard.nextStepBtn} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                style={{
                  backgroundColor: colors.pressRed,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 24px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(158, 48, 41, 0.25)',
                }}
              >
                {t.wizard.createEditionBtn} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
