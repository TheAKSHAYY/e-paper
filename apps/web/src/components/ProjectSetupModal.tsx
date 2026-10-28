import React, { useState } from 'react';
import type {
  PageSizePreset,
  PageOrientation,
  NewspaperPresetId,
} from '@epaper-studio/document-schema';
import { PAGE_SIZE_DEFINITIONS } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';

export interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (options: {
    title: string;
    edition: string;
    date: string;
    language: string;
    direction: 'ltr' | 'rtl';
    pageSize: PageSizePreset;
    orientation: PageOrientation;
    presetId: NewspaperPresetId;
    startBlank: boolean;
  }) => void;
}

export const ProjectSetupModal: React.FC<ProjectSetupModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const presets = getAllNewspaperPresets();
  const [title, setTitle] = useState('दैनिक नवप्रभात');
  const [edition, setEdition] = useState('नगर मुख्य संस्करण');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] ?? '');
  const [language, setLanguage] = useState('hi');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [pageSize, setPageSize] = useState<PageSizePreset>('broadsheet');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [presetId, setPresetId] = useState<NewspaperPresetId>('classic-hindi-broadsheet');
  const [startBlank, setStartBlank] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      edition: edition.trim() || 'मुख्य संस्करण',
      date: date || new Date().toISOString().split('T')[0]!,
      language,
      direction,
      pageSize,
      orientation,
      presetId,
      startBlank,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          border: '1px solid #ccc',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fbfaf6',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif', color: '#111' }}>
            🗞️ नया समाचार पत्र बनाएँ (Create Newspaper)
          </h3>
          <button
            onClick={onClose}
            aria-label="संवाद बंद करें"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div>
            <label
              htmlFor="modal-pub-title"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '4px',
              }}
            >
              अख़बार का नाम (Title / Masthead) <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              id="modal-pub-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. दैनिक नवप्रभात / जनसंदेश"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '16px',
                fontWeight: 700,
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                htmlFor="modal-edition"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                संस्करण पंक्ति (Edition)
              </label>
              <input
                id="modal-edition"
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="उदा. नगर मुख्य संस्करण"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="modal-date"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                प्रकाशन तिथि (Date)
              </label>
              <input
                id="modal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                htmlFor="modal-lang"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                भाषा (Language)
              </label>
              <select
                id="modal-lang"
                value={language}
                onChange={(e) => {
                  const val = e.target.value;
                  setLanguage(val);
                  if (val === 'ur' || val === 'ar' || val === 'he') {
                    setDirection('rtl');
                  } else {
                    setDirection('ltr');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="hi">हिंदी / देवनागरी (Hindi / Devanagari)</option>
                <option value="en">English (अंग्रेजी)</option>
                <option value="ur">Urdu (उर्दू RTL)</option>
                <option value="bn">Bengali (बांग्ला)</option>
                <option value="ta">Tamil (तमिल)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-page-size"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                कागज़ का आकार (Paper Size)
              </label>
              <select
                id="modal-page-size"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSizePreset)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                {Object.entries(PAGE_SIZE_DEFINITIONS).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-orient"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#444',
                  marginBottom: '4px',
                }}
              >
                दिशानिर्देश (Orientation)
              </label>
              <select
                id="modal-orient"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="portrait">खड़ा (Portrait)</option>
                <option value="landscape">आड़ा (Landscape)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '6px',
              }}
            >
              डिज़ाइन प्रारूप चुनें (Design Preset)
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '10px',
              }}
            >
              {presets.map((preset) => {
                const isSelected = preset.id === presetId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setPresetId(preset.id)}
                    style={{
                      border: isSelected ? '2px solid #8b0000' : '1px solid #ccc',
                      backgroundColor: isSelected ? '#fff9e6' : '#fafafa',
                      borderRadius: '6px',
                      padding: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '2px', color: '#111' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.3 }}>
                      {preset.tagline}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
            <input
              id="modal-start-blank"
              type="checkbox"
              checked={startBlank}
              onChange={(e) => setStartBlank(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label
              htmlFor="modal-start-blank"
              style={{ fontSize: '13px', color: '#333', cursor: 'pointer' }}
            >
              खाली पन्ना शुरू करें (नमूना खबरें न जोड़ें)
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '10px',
              borderTop: '1px solid #eee',
              paddingTop: '14px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#eee',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              रद्द करें
            </button>
            <button
              type="submit"
              data-testid="btn-create-newspaper-submit"
              style={{
                backgroundColor: '#8b0000',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              अख़बार बनाएँ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
