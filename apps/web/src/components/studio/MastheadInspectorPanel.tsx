import React, { useState, useEffect } from 'react';
import type {
  MastheadConfig,
  MastheadRuleStyle,
  MastheadAlignment,
  MastheadEmblem,
  NewspaperPresetId,
} from '@epaper-studio/document-schema';
import { getNewspaperPreset } from '@epaper-studio/template-engine';
import { toEnglishDigits } from '../../utils/formatters';
import { ColorStrip } from './mobile/ColorStrip';

export interface MastheadInspectorPanelProps {
  masthead: MastheadConfig;
  onUpdateMasthead: (updated: MastheadConfig) => void;
  presetId?: NewspaperPresetId;
  onClose?: () => void;
  initialTab?: 'title' | 'subheaders' | 'meta' | 'rules';
  onOpenDesigner?: () => void;
  compactMode?: boolean;
  onOpenTemplateGallery?: (
    category?: 'all' | 'pages' | 'mastheads' | 'articles' | 'breaking' | 'dividers' | 'favorites'
  ) => void;
}

export const MastheadInspectorPanel: React.FC<MastheadInspectorPanelProps> = ({
  masthead,
  onUpdateMasthead,
  presetId = 'classic-hindi-broadsheet',
  onClose,
  initialTab,
  onOpenDesigner,
  compactMode = false,
  onOpenTemplateGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'title' | 'subheaders' | 'meta' | 'rules'>(initialTab || 'title');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const updateField = <K extends keyof MastheadConfig>(key: K, value: MastheadConfig[K]) => {
    let finalVal = value;
    if (typeof value === 'string') {
      finalVal = toEnglishDigits(value) as MastheadConfig[K];
    }
    onUpdateMasthead({
      ...masthead,
      [key]: finalVal,
    });
  };

  const handleResetToTemplate = () => {
    try {
      const preset = getNewspaperPreset(presetId);
      if (preset && preset.defaultMasthead) {
        onUpdateMasthead({
          ...preset.defaultMasthead,
        });
      }
    } catch (e) {
      console.warn('Could not reset masthead to preset', e);
    }
  };

  const handleClearVolumeIssue = () => {
    onUpdateMasthead({
      ...masthead,
      showVolumeIssue: false,
      issueNumber: '',
      volumeYear: '',
      issueCount: '',
    });
  };

  const handleToggleVolumeIssue = (show: boolean) => {
    if (show) {
      const vol =
        masthead.volumeYear && masthead.volumeYear.trim().length > 0
          ? masthead.volumeYear
          : 'वर्ष 78';
      const issue =
        masthead.issueCount && masthead.issueCount.trim().length > 0
          ? masthead.issueCount
          : 'अंक 142';
      const combined =
        masthead.issueNumber && masthead.issueNumber.trim().length > 0
          ? masthead.issueNumber
          : `${vol} • ${issue}`;
      onUpdateMasthead({
        ...masthead,
        showVolumeIssue: true,
        volumeYear: vol,
        issueCount: issue,
        issueNumber: combined,
      });
    } else {
      handleClearVolumeIssue();
    }
  };

  const renderVolumeIssueSection = () => {
    const isShown = masthead.showVolumeIssue !== false;
    return (
      <div
        data-testid="volume-issue-control-card"
        style={{
          backgroundColor: isShown ? '#f0fdf4' : '#f8fafc',
          border: isShown ? '1.5px solid #86efac' : '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>📅</span>
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                वर्ष व अंक (Volume & Issue)
              </span>
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: isShown ? '#dcfce7' : '#fee2e2',
                  color: isShown ? '#166534' : '#991b1b',
                }}
              >
                {isShown ? 'सक्रिय (Visible)' : 'छुपा हुआ (Hidden)'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                data-testid="toggle-show-volume-issue"
                checked={isShown}
                onChange={(e) => handleToggleVolumeIssue(e.target.checked)}
              />
              दिखाएँ
            </label>

            {isShown && (
              <button
                type="button"
                data-testid="btn-remove-volume-issue"
                onClick={handleClearVolumeIssue}
                title="वर्ष व अंक को हेडर से पूरी तरह हटाएँ"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#b91c1c',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  cursor: 'pointer',
                }}
              >
                हटाएँ ✕
              </button>
            )}
          </div>
        </div>

        {isShown ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: '2px',
                }}
              >
                संपूर्ण पाठ (Full Header Text):
              </label>
              <input
                type="text"
                data-testid="input-volume-issue-combined"
                value={masthead.issueNumber ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('issueNumber', val);
                  if (val.includes('•')) {
                    const parts = val.split('•').map((s) => s.trim());
                    if (parts[0]) updateField('volumeYear', parts[0]);
                    if (parts[1]) updateField('issueCount', parts[1]);
                  }
                }}
                placeholder="उदा. वर्ष 78 • अंक 142"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '9.5px',
                    color: '#64748b',
                    marginBottom: '2px',
                  }}
                >
                  वर्ष (Volume):
                </label>
                <input
                  type="text"
                  data-testid="input-volume-year"
                  value={masthead.volumeYear ?? ''}
                  onChange={(e) => {
                    const newVol = e.target.value;
                    updateField('volumeYear', newVol);
                    const currentIssue = masthead.issueCount ?? '';
                    const combined = [newVol, currentIssue].filter(Boolean).join(' • ');
                    updateField('issueNumber', combined);
                  }}
                  placeholder="उदा. वर्ष 78"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 7px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '9.5px',
                    color: '#64748b',
                    marginBottom: '2px',
                  }}
                >
                  अंक (Issue No):
                </label>
                <input
                  type="text"
                  data-testid="input-issue-count"
                  value={masthead.issueCount ?? ''}
                  onChange={(e) => {
                    const newIssue = e.target.value;
                    updateField('issueCount', newIssue);
                    const currentVol = masthead.volumeYear ?? '';
                    const combined = [currentVol, newIssue].filter(Boolean).join(' • ');
                    updateField('issueNumber', combined);
                  }}
                  placeholder="उदा. अंक 142"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 7px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: '10.5px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 0',
            }}
          >
            <span>वर्ष व अंक हेडर से हटा दिया गया है।</span>
            <button
              type="button"
              data-testid="btn-restore-volume-issue"
              onClick={() => handleToggleVolumeIssue(true)}
              style={{
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              + वापस दिखाएँ
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      data-testid="masthead-inspector-panel"
      style={{
        backgroundColor: '#ffffff',
        border: compactMode ? 'none' : '1px solid #e2e8f0',
        borderRadius: compactMode ? '0' : '10px',
        padding: compactMode ? '4px 0 100px 0' : '14px 14px 100px 14px',
        boxShadow: compactMode ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* ── Outer Panel Header (Suppressed in compact mobile mode) ── */}
      {!compactMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🗞️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                मास्टहेड संपादक (Masthead)
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                पारंपरिक भारतीय समाचार पत्र शीर्ष सज्जा
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {masthead.showVolumeIssue !== false ? (
              <button
                type="button"
                data-testid="btn-header-quick-clear-volume"
                onClick={handleClearVolumeIssue}
                title="कैनवास से वर्ष व अंक तुरंत हटाएँ"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>✕</span>
                <span>वर्ष/अंक हटाएँ</span>
              </button>
            ) : (
              <button
                type="button"
                data-testid="btn-header-quick-restore-volume"
                onClick={() => handleToggleVolumeIssue(true)}
                title="कैनवास पर वर्ष व अंक जोड़ें"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>+</span>
                <span>वर्ष/अंक जोड़ें</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetToTemplate}
              title="वर्तमान प्रारूप के अनुसार डिफ़ॉल्ट मान पुनर्स्थापित करें"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>↺</span>
              <span>रीसेट</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Header & Sub-header Preset Actions (Mobile & Desktop) ── */}
      {onOpenTemplateGallery && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button
            type="button"
            data-testid="btn-open-masthead-presets"
            onClick={() => onOpenTemplateGallery('mastheads')}
            style={{
              padding: '8px 10px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <span>📰</span>
            <span>हेडर टेम्पलेट्स</span>
          </button>
          <button
            type="button"
            data-testid="btn-open-breaking-presets"
            onClick={() => onOpenTemplateGallery('breaking')}
            style={{
              padding: '8px 10px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <span>📢</span>
            <span>सब-हेडर / ब्रेकिंग</span>
          </button>
        </div>
      )}

      {!compactMode && onOpenDesigner && (
        <button
          type="button"
          onClick={onOpenDesigner}
          data-testid="btn-open-masthead-designer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <span>🎨</span>
          <span>उन्नत मास्टहेड स्टूडियो खोलें (Full Designer)</span>
        </button>
      )}

      {/* ── Navigation Sub-Tabs ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          backgroundColor: '#f1f5f9',
          padding: '3px',
          borderRadius: '7px',
        }}
      >
        <button
          type="button"
          data-testid="masthead-tab-title"
          onClick={() => setActiveTab('title')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: activeTab === 'title' ? 700 : 500,
            color: activeTab === 'title' ? '#0f172a' : '#64748b',
            backgroundColor: activeTab === 'title' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'title' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          शीर्षक
        </button>
        <button
          type="button"
          data-testid="masthead-tab-subheaders"
          onClick={() => setActiveTab('subheaders')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: activeTab === 'subheaders' ? 700 : 500,
            color: activeTab === 'subheaders' ? '#991b1b' : '#64748b',
            backgroundColor: activeTab === 'subheaders' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'subheaders' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          सब-हेडर व अंक
        </button>
        <button
          type="button"
          data-testid="masthead-tab-meta"
          onClick={() => setActiveTab('meta')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: activeTab === 'meta' ? 700 : 500,
            color: activeTab === 'meta' ? '#0f172a' : '#64748b',
            backgroundColor: activeTab === 'meta' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'meta' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          मौसम व विवरण
        </button>
        <button
          type="button"
          data-testid="masthead-tab-rules"
          onClick={() => setActiveTab('rules')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: activeTab === 'rules' ? 700 : 500,
            color: activeTab === 'rules' ? '#0f172a' : '#64748b',
            backgroundColor: activeTab === 'rules' ? '#ffffff' : 'transparent',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: activeTab === 'rules' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          फॉन्ट व बॉर्डर
        </button>
      </div>

      {/* ==========================================================
       * TAB 1: TITLE, TAGLINE, DATE, EDITION, PRICE & VOLUME
       * ========================================================== */}
      {activeTab === 'title' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Newspaper Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              समाचार पत्र का नाम (Newspaper Name)
            </label>
            <input
              type="text"
              data-testid="input-masthead-title"
              value={masthead.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="उदा. जनवाणी समाचार"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: masthead.fontFamily || "'Rozha One', serif",
                outline: 'none',
              }}
            />
          </div>

          {/* Tagline / Subtitle */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                ध्येय वाक्य / टैगलाइन (Tagline / Motto)
              </label>
              <label
                style={{
                  fontSize: '10px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={masthead.showTagline !== false}
                  onChange={(e) => updateField('showTagline', e.target.checked)}
                />
                दिखाएँ
              </label>
            </div>
            <input
              type="text"
              value={masthead.tagline ?? masthead.subtitle ?? ''}
              onChange={(e) => {
                updateField('tagline', e.target.value);
                updateField('subtitle', e.target.value);
              }}
              placeholder="उदा. सत्य, निष्पक्षता और जनसेवा का प्रतीक"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '11.5px',
                outline: 'none',
                opacity: masthead.showTagline === false ? 0.5 : 1,
              }}
            />
          </div>

          {/* Logo & Emblem Controls */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                🏷️ समाचार पत्र लोगो (Newspaper Logo)
              </label>
              <label
                style={{
                  fontSize: '10.5px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  data-testid="toggle-show-center-logo"
                  checked={Boolean(masthead.showCenterLogo)}
                  onChange={(e) => updateField('showCenterLogo', e.target.checked)}
                />
                लोगो दिखाएँ
              </label>
            </div>

            {masthead.showCenterLogo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {masthead.centerLogoUrl && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '6px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <img
                      src={masthead.centerLogoUrl}
                      alt="Logo preview"
                      style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    data-testid="input-center-logo-url"
                    value={masthead.centerLogoUrl ?? ''}
                    onChange={(e) => updateField('centerLogoUrl', e.target.value)}
                    placeholder="लोगो URL (उदा. /logo.svg या https://...)"
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11px',
                    }}
                  />
                  <label
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    अपलोड 📁
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateField('centerLogoUrl', ev.target?.result as string);
                            updateField('showCenterLogo', true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
       * TAB 2: SUB-HEADERS, VOLUME & ISSUE, AND ANNOUNCEMENT STRIP
       * ========================================================== */}
      {activeTab === 'subheaders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '60px' }}>
          {/* ── 1. वर्ष व अंक नियंत्रण (Volume & Issue - "वर्ष 78 • अंक 142") ── */}
          {renderVolumeIssueSection()}

          {/* ── 2. तारीख व अंक पट्टी रंग (Date & Volume Strip Colors) ── */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
              🎨 सब-हेडर / तारीख पट्टी रंग (Date & Volume Strip Colors)
            </div>
            <ColorStrip
              selectedColor={masthead.dateStripBg || 'transparent'}
              onSelectColor={(col) => updateField('dateStripBg', col)}
              label="तारीख पट्टी पृष्ठभूमि रंग (Date Strip Background)"
            />
            <ColorStrip
              selectedColor={masthead.dateStripColor || '#222222'}
              onSelectColor={(col) => updateField('dateStripColor', col)}
              label="तारीख पट्टी टेक्स्ट रंग (Date Strip Text Color)"
            />
          </div>

          {/* ── 3. Announcement Strip / Breaking Bulletin ── */}
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🔴</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>
                  घोषणा / ब्रेकिंग न्यूज़ पट्टी (Announcement Strip)
                </span>
              </div>
              <label
                style={{
                  fontSize: '10.5px',
                  color: '#7f1d1d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={masthead.showAnnouncementStrip === true}
                  onChange={(e) => updateField('showAnnouncementStrip', e.target.checked)}
                />
                पट्टी दिखाएँ
              </label>
            </div>

            {masthead.showAnnouncementStrip && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea
                  rows={2}
                  value={masthead.announcementStripText ?? ''}
                  onChange={(e) => updateField('announcementStripText', e.target.value)}
                  placeholder="उदा. विशेष दीपावली विशेषांक : आज ही अपने हॉकर से निःशुल्क प्राप्त करें"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #fca5a5',
                    fontSize: '11.5px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#991b1b' }}>
                      त्वरित संदेश चुनें (Tap to fill):
                    </span>
                    {onOpenTemplateGallery && (
                      <button
                        type="button"
                        data-testid="btn-open-subheader-gallery"
                        onClick={() => onOpenTemplateGallery('breaking')}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fca5a5',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          cursor: 'pointer',
                        }}
                      >
                        🎨 गैलरी से चुनें ➔
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {[
                      'विशेष दीपावली विशेषांक : आज ही अपने हॉकर से निःशुल्क प्राप्त करें',
                      '🔴 ब्रेकिंग न्यूज़ : आज की सबसे बड़ी हलचल और विशेष ग्राउंड रिपोर्ट',
                      'विशेष संपादकीय परिशिष्ट : देश-दुनिया की 10 बड़ी खबरें',
                      '🌾 कृषि व ग्रामीण विकास विशेष बुलेटिन',
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('announcementStripText', sample)}
                        style={{
                          fontSize: '10px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#ffffff',
                          color: '#7f1d1d',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {sample.slice(0, 36)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Announcement Strip Color Pickers */}
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <ColorStrip
                    selectedColor={masthead.announcementStripBg || '#b91c1c'}
                    onSelectColor={(col) => updateField('announcementStripBg', col)}
                    label="घोषणा पट्टी पृष्ठभूमि रंग (Announcement Background)"
                  />
                  <ColorStrip
                    selectedColor={masthead.announcementStripColor || '#ffffff'}
                    onSelectColor={(col) => updateField('announcementStripColor', col)}
                    label="घोषणा पट्टी टेक्स्ट रंग (Announcement Text Color)"
                    allowTransparent={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 4. Secondary Header / Sub-Edition Strip ── */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🏛️</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  द्वितीयक हेडर (2nd Header / Sub-Edition)
                </span>
              </div>
              <label
                style={{
                  fontSize: '10.5px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={masthead.showSecondaryHeader === true}
                  onChange={(e) => updateField('showSecondaryHeader', e.target.checked)}
                />
                दिखाएँ
              </label>
            </div>

            {masthead.showSecondaryHeader && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '10px',
                      color: '#64748b',
                      marginBottom: '2px',
                    }}
                  >
                    द्वितीयक शीर्षक (Sub-Edition Title)
                  </label>
                  <input
                    type="text"
                    value={masthead.secondaryHeaderTitle ?? ''}
                    onChange={(e) => updateField('secondaryHeaderTitle', e.target.value)}
                    placeholder="उदा. प्रादेशिक एवं राष्ट्रीय राजधानी संस्करण"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '5px 8px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11.5px',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '10px',
                      color: '#64748b',
                      marginBottom: '2px',
                    }}
                  >
                    नगर सूची व उप-विवरण (Cities / Sub-Details)
                  </label>
                  <input
                    type="text"
                    value={masthead.secondaryHeaderSubtitle ?? ''}
                    onChange={(e) => updateField('secondaryHeaderSubtitle', e.target.value)}
                    placeholder="उदा. दिल्ली • लखनऊ • पटना • भोपाल • जयपुर • मुंबई"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '5px 8px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      fontSize: '11.5px',
                    }}
                  />
                </div>

                {/* Secondary Header Color Pickers */}
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <ColorStrip
                    selectedColor={masthead.secondaryHeaderBg || '#f8fafc'}
                    onSelectColor={(col) => updateField('secondaryHeaderBg', col)}
                    label="द्वितीयक हेडर पट्टी का रंग (Secondary Header Color)"
                  />
                  <ColorStrip
                    selectedColor={masthead.secondaryHeaderColor || '#0f172a'}
                    onSelectColor={(col) => updateField('secondaryHeaderColor', col)}
                    label="द्वितीयक हेडर टेक्स्ट रंग (Secondary Header Text Color)"
                    allowTransparent={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 5. Website / E-Paper URL ── */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              वेबसाइट / ई-पेपर लिंक (Website URL)
            </label>
            <input
              type="text"
              value={masthead.websiteUrl ?? ''}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
              placeholder="उदा. epaper.dainiksamachar.com"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '11.5px',
              }}
            />
          </div>

          {/* ── 6. Browse Ready-made Sub-Headers ── */}
          {onOpenTemplateGallery && (
            <button
              type="button"
              onClick={() => onOpenTemplateGallery('breaking')}
              style={{
                padding: '10px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>📑</span>
              <span>30+ सब-हेडर व विभाजक शैलियाँ ब्राउज़ करें</span>
            </button>
          )}

          {/* ── 5. Left Ear Advertisement (बायां कान विज्ञापन) ── */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                📢 बायां कान विज्ञापन (Left Ear Ad / Slot)
              </div>
              <label style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="toggle-left-slot"
                  checked={Boolean(masthead.leftSlot?.enabled)}
                  onChange={(e) => {
                    const current = masthead.leftSlot || { enabled: false, type: 'text' };
                    updateField('leftSlot', { ...current, enabled: e.target.checked, type: current.type === 'none' ? 'text' : current.type });
                  }}
                />
                सक्रिय (Enable)
              </label>
            </div>

            {masthead.leftSlot?.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <input
                    type="text"
                    data-testid="input-left-slot-title"
                    value={masthead.leftSlot.title ?? ''}
                    onChange={(e) => {
                      updateField('leftSlot', { ...masthead.leftSlot!, title: e.target.value });
                    }}
                    placeholder="शीर्षक (उदा. विशेष रिपोर्ट)"
                    style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                  <input
                    type="text"
                    data-testid="input-left-slot-subtitle"
                    value={masthead.leftSlot.subtitle ?? ''}
                    onChange={(e) => {
                      updateField('leftSlot', { ...masthead.leftSlot!, subtitle: e.target.value });
                    }}
                    placeholder="उप-शीर्षक (उदा. ताज़ा अपडेट)"
                    style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                </div>
                <input
                  type="text"
                  data-testid="input-left-slot-text"
                  value={masthead.leftSlot.text ?? ''}
                  onChange={(e) => {
                    updateField('leftSlot', { ...masthead.leftSlot!, text: e.target.value });
                  }}
                  placeholder="विवरण या फ़ोन (उदा. संपर्क: 0751-2456789)"
                  style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={masthead.leftSlot.imageUrl ?? ''}
                    onChange={(e) => {
                      updateField('leftSlot', { ...masthead.leftSlot!, type: 'image', imageUrl: e.target.value });
                    }}
                    placeholder="छवि URL या लोगो"
                    style={{ flex: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                  <label style={{ padding: '5px 10px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    अपलोड 📁
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateField('leftSlot', { ...masthead.leftSlot!, type: 'image', imageUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ── 6. Right Ear Advertisement (दायां कान विज्ञापन) ── */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                📢 दायां कान विज्ञापन (Right Ear Ad / Slot)
              </div>
              <label style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="toggle-right-slot"
                  checked={Boolean(masthead.rightSlot?.enabled)}
                  onChange={(e) => {
                    const current = masthead.rightSlot || { enabled: false, type: 'text' };
                    updateField('rightSlot', { ...current, enabled: e.target.checked, type: current.type === 'none' ? 'text' : current.type });
                  }}
                />
                सक्रिय (Enable)
              </label>
            </div>

            {masthead.rightSlot?.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <input
                    type="text"
                    data-testid="input-right-slot-title"
                    value={masthead.rightSlot.title ?? ''}
                    onChange={(e) => {
                      updateField('rightSlot', { ...masthead.rightSlot!, title: e.target.value });
                    }}
                    placeholder="शीर्षक (उदा. विज्ञापन संपर्क)"
                    style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                  <input
                    type="text"
                    data-testid="input-right-slot-subtitle"
                    value={masthead.rightSlot.subtitle ?? ''}
                    onChange={(e) => {
                      updateField('rightSlot', { ...masthead.rightSlot!, subtitle: e.target.value });
                    }}
                    placeholder="उप-शीर्षक (उदा. दैनिक सेवा)"
                    style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                </div>
                <input
                  type="text"
                  data-testid="input-right-slot-text"
                  value={masthead.rightSlot.text ?? ''}
                  onChange={(e) => {
                    updateField('rightSlot', { ...masthead.rightSlot!, text: e.target.value });
                  }}
                  placeholder="विवरण या फ़ोन (उदा. फोन: 0751-2456789)"
                  style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={masthead.rightSlot.imageUrl ?? ''}
                    onChange={(e) => {
                      updateField('rightSlot', { ...masthead.rightSlot!, type: 'image', imageUrl: e.target.value });
                    }}
                    placeholder="छवि URL या लोगो"
                    style={{ flex: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                  />
                  <label style={{ padding: '5px 10px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    अपलोड 📁
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateField('rightSlot', { ...masthead.rightSlot!, type: 'image', imageUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
       * TAB 3: WEATHER, DATE, EDITION, PRICE & REGISTRATION DETAILS
       * ========================================================== */}
      {activeTab === 'meta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* ── 1. वर्ष व अंक नियंत्रण (Volume & Issue - "वर्ष 78 • अंक 142") ── */}
          {renderVolumeIssueSection()}

          {/* Weather Section */}
          <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                🌤️ मौसम व तापमान (Weather Strip)
              </span>
              <label
                style={{
                  fontSize: '10px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={masthead.showWeather !== false}
                  onChange={(e) => updateField('showWeather', e.target.checked)}
                />
                मौसम दिखाएँ
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  शहर (City)
                </label>
                <input
                  type="text"
                  value={masthead.weatherCity ?? 'नई दिल्ली'}
                  onChange={(e) => updateField('weatherCity', e.target.value)}
                  placeholder="नई दिल्ली"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  तापमान (Temp)
                </label>
                <input
                  type="text"
                  value={masthead.temperature ?? '25°C'}
                  onChange={(e) => updateField('temperature', e.target.value)}
                  placeholder="25°C"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                  स्थिति (Sky)
                </label>
                <input
                  type="text"
                  value={masthead.weatherCondition ?? 'साफ़ आसमान'}
                  onChange={(e) => updateField('weatherCondition', e.target.value)}
                  placeholder="साफ़ आसमान"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 6px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                  }}
                />
              </div>
            </div>

            {/* AQI */}
            <div style={{ marginTop: '6px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label style={{ fontSize: '10px', color: '#64748b' }}>
                  वायु गुणवत्ता (Air Quality / AQI)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showAirQuality !== false}
                    onChange={(e) => updateField('showAirQuality', e.target.checked)}
                  />
                  AQI दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.airQuality ?? 'AQI 128 • मध्यम'}
                onChange={(e) => updateField('airQuality', e.target.value)}
                placeholder="AQI 128 • मध्यम"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '5px 6px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                }}
              />
            </div>
          </div>

          {/* Date & Day of Week */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '8px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                वार (Day)
              </label>
              <input
                type="text"
                value={masthead.dayOfWeek ?? 'बुधवार'}
                onChange={(e) => updateField('dayOfWeek', e.target.value)}
                placeholder="बुधवार"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  दिनांक (Date)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showDate !== false}
                    onChange={(e) => updateField('showDate', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.date ?? '28 अक्टूबर 2026'}
                onChange={(e) => updateField('date', e.target.value)}
                placeholder="28 अक्टूबर 2026"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                  opacity: masthead.showDate === false ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          {/* Edition & Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  संस्करण (Edition)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showEdition !== false}
                    onChange={(e) => updateField('showEdition', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.edition ?? 'प्रातःकालीन मुख्य संस्करण'}
                onChange={(e) => updateField('edition', e.target.value)}
                placeholder="प्रातःकालीन मुख्य संस्करण"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                  opacity: masthead.showEdition === false ? 0.5 : 1,
                }}
              />
            </div>

            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  मूल्य (Price)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showPrice !== false}
                    onChange={(e) => updateField('showPrice', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.price ?? 'मूल्य ₹5.00'}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="मूल्य ₹5.00"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                  opacity: masthead.showPrice === false ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          {/* Establishment Year & Registration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  स्थापना वर्ष (Est. Year)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showEstablishment !== false}
                    onChange={(e) => updateField('showEstablishment', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.establishmentYear ?? '1947'}
                onChange={(e) => updateField('establishmentYear', e.target.value)}
                placeholder="1947"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                  opacity: masthead.showEstablishment === false ? 0.5 : 1,
                }}
              />
            </div>

            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  पंजीयन (Reg. No.)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showPostalReg !== false}
                    onChange={(e) => updateField('showPostalReg', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <input
                type="text"
                value={masthead.postalRegNumber ?? 'पंजीयन सं. DL-11001/2026'}
                onChange={(e) => updateField('postalRegNumber', e.target.value)}
                placeholder="DL-11001/2026"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                  opacity: masthead.showPostalReg === false ? 0.5 : 1,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
       * TAB 4: FONTS, ALIGNMENT & BORDER RULES
       * ========================================================== */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Font Family & Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                मास्टहेड फॉन्ट (Font Family)
              </label>
              <select
                value={masthead.fontFamily || "'Rozha One', serif"}
                onChange={(e) => updateField('fontFamily', e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11.5px',
                  outline: 'none',
                }}
              >
                <option value="'Rozha One', serif">रोज़ा वन (Rozha One - पारंपरिक)</option>
                <option value="'Yatra One', serif">यात्रा वन (Yatra One - बोल्ड स्लैब)</option>
                <option value="'Tiro Devanagari Hindi', serif">
                  टिरो देवनागरी (Tiro Devanagari)
                </option>
                <option value="'Noto Serif Devanagari', serif">नोतो सेरिफ़ (Noto Serif)</option>
                <option value="'Poppins', sans-serif">पॉपिन्स (Poppins - समकालीन)</option>
                <option value="'Mukta', sans-serif">मुक्ता (Mukta - आधुनिक)</option>
                <option value="'Playfair Display', serif">Playfair Display (क्लासिक)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                आकार (Size): {masthead.fontSizePt || 52}pt
              </label>
              <input
                type="range"
                min="32"
                max="72"
                step="1"
                value={masthead.fontSizePt || 52}
                onChange={(e) => updateField('fontSizePt', parseInt(e.target.value, 10))}
                style={{ width: '100%', marginTop: '6px' }}
              />
            </div>
          </div>

          {/* Alignment & Emblem */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                संरेखण (Alignment)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'left', label: 'बायाँ' },
                  { id: 'center', label: 'मध्य' },
                  { id: 'justified', label: 'समान' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField('alignment', item.id as MastheadAlignment)}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      fontSize: '11px',
                      fontWeight: (masthead.alignment || 'center') === item.id ? 700 : 500,
                      backgroundColor:
                        (masthead.alignment || 'center') === item.id ? '#0f172a' : '#f1f5f9',
                      color: (masthead.alignment || 'center') === item.id ? '#ffffff' : '#475569',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '4px',
                  }}
                >
                  प्रतीक चिन्ह (Emblem)
                </label>
                <label
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={masthead.showEmblem === true}
                    onChange={(e) => updateField('showEmblem', e.target.checked)}
                  />
                  दिखाएँ
                </label>
              </div>
              <select
                value={masthead.emblem || 'none'}
                onChange={(e) => updateField('emblem', e.target.value as MastheadEmblem)}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                  outline: 'none',
                }}
              >
                <option value="none">कोई नहीं (None)</option>
                <option value="ashoka-chakra">अशोक चक्र (Ashoka Chakra)</option>
                <option value="sun">सूर्य (Surya Sun)</option>
                <option value="quill">कलम (Quill / Pen)</option>
                <option value="lion-capital">सिंह शीर्ष (Lion Capital)</option>
                <option value="custom">कस्टम URL (Custom)</option>
              </select>
            </div>
          </div>

          {/* Border Rule Style */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '4px',
              }}
            >
              मास्टहेड विभाजक रेखा शैली (Divider Rule Style)
            </label>
            <select
              value={masthead.ruleStyle || 'ornate-double'}
              onChange={(e) => updateField('ruleStyle', e.target.value as MastheadRuleStyle)}
              style={{
                width: '100%',
                padding: '7px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="ornate-double">पारंपरिक डबल-रूल (Ornate Double Rule)</option>
              <option value="oxford-thick-thin">ऑक्सफोर्ड थिक-थिन (Oxford Thick-Thin)</option>
              <option value="classic-double">क्लासिक समानांतर रेखा (Classic Double)</option>
              <option value="single-hairline">महीन हेयरलाइन (Single Hairline)</option>
              <option value="none">कोई विभाजक नहीं (None)</option>
            </select>
          </div>

          {/* Header & Subheader Colors */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
              🎨 मास्टहेड व सब-हेडर रंग (Header & Sub-header Colors)
            </div>
            <ColorStrip
              selectedColor={masthead.backgroundColor || '#ffffff'}
              onSelectColor={(col) => updateField('backgroundColor', col)}
              label="मास्टहेड पृष्ठभूमि रंग (Header Background)"
            />
            <ColorStrip
              selectedColor={masthead.titleColor || '#000000'}
              onSelectColor={(col) => updateField('titleColor', col)}
              label="अख़बार नाम का रंग (Title Text Color)"
            />
            <ColorStrip
              selectedColor={masthead.taglineColor || '#111111'}
              onSelectColor={(col) => updateField('taglineColor', col)}
              label="टैगलाइन / सब-हेडर रंग (Tagline Color)"
            />
            <ColorStrip
              selectedColor={masthead.borderColor || '#111111'}
              onSelectColor={(col) => updateField('borderColor', col)}
              label="विभाजक बॉर्डर का रंग (Border Rule Color)"
            />
          </div>

          {/* Section Visibility Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              backgroundColor: '#f8fafc',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              <span>ऊपरी मौसम व ध्येय पट्टी (Top Metadata Strip)</span>
              <input
                type="checkbox"
                checked={masthead.showTopStrip !== false}
                onChange={(e) => updateField('showTopStrip', e.target.checked)}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              <span>निचली दिनांक व संस्करण पट्टी (Bottom Info Strip)</span>
              <input
                type="checkbox"
                checked={masthead.showBottomStrip !== false}
                onChange={(e) => updateField('showBottomStrip', e.target.checked)}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                cursor: 'pointer',
              }}
            >
              <span>वर्ष व अंक संख्या (Volume & Issue)</span>
              <input
                type="checkbox"
                data-testid="rules-tab-volume-issue-checkbox"
                checked={masthead.showVolumeIssue !== false}
                onChange={(e) => handleToggleVolumeIssue(e.target.checked)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
