import React, { useState } from 'react';
import type { MastheadConfig } from '@epaper-studio/document-schema';
import { ColorStrip } from './ColorStrip';

export interface SubHeaderTabProps {
  currentConfig: MastheadConfig;
  onUpdateMasthead: (config: Partial<MastheadConfig>) => void;
  onOpenTemplateGallery?: (
    category?: 'all' | 'pages' | 'mastheads' | 'articles' | 'breaking' | 'dividers' | 'favorites'
  ) => void;
}

const PRESET_SUBHEADERS = [
  {
    icon: '📢',
    title: 'विशेष बुलेटिन',
    text: 'विशेष बुलेटिन : आज की सबसे बड़ी हलचल और विशेष ग्राउंड रिपोर्ट',
  },
  {
    icon: '🚨',
    title: 'रेड अलर्ट ब्रेकिंग',
    text: 'संसद में ऐतिहासिक नीति पर मुहर: ग्रामीण विकास व किसान कल्याण पैकेज स्वीकृत',
  },
  {
    icon: '🗳️',
    title: 'चुनावी हलचल',
    text: 'मतगणना रुझान: 240 सीटों पर मतगणना प्रारंभ, शुरुआती राउंड में कड़ा मुकाबला',
  },
  {
    icon: '⚠️',
    title: 'आपदा व मौसम',
    text: 'अतिवृष्टि चेतावनी: नदी का जलस्तर खतरे के निशान के करीब, तटीय बस्तियां सतर्क',
  },
  {
    icon: '🏛️',
    title: 'शासकीय विज्ञप्ति',
    text: 'शासकीय विज्ञप्ति: राज्य भर में सार्वजनिक अवकाश एवं विशेष सुरक्षा व्यवस्था के आदेश',
  },
  {
    icon: '📈',
    title: 'व्यापार व बाज़ार',
    text: 'व्यापार संदेश : सेंसेक्स 850 अंक उछला, अंतरराष्ट्रीय व्यापार समझौते पर मुहर',
  },
];

const PRESET_VOLUME_ISSUES = [
  'वर्ष 78 • अंक 142',
  'वर्ष 1 • अंक 1',
  'दैनिक संस्करण • अंक 245',
  'विशेष अंक 9',
  'साप्ताहिक विशेषांक • भाग 1',
];

export const SubHeaderTab: React.FC<SubHeaderTabProps> = ({
  currentConfig,
  onUpdateMasthead,
  onOpenTemplateGallery,
}) => {
  const [subTab, setSubTab] = useState<'announcement' | 'volume' | 'colors' | 'secondary'>('announcement');

  const isAnnouncementEnabled = currentConfig.showAnnouncementStrip ?? false;
  const isVolumeIssueShown = currentConfig.showVolumeIssue !== false && (
    (currentConfig.issueNumber && currentConfig.issueNumber.trim().length > 0) ||
    (currentConfig.volumeYear && currentConfig.volumeYear.trim().length > 0)
  );

  const handleToggleAnnouncement = (enabled: boolean) => {
    onUpdateMasthead({
      showAnnouncementStrip: enabled,
      announcementStripText:
        currentConfig.announcementStripText ||
        'विशेष दीपावली परिशिष्ट : आज ही अपने हॉकर से निःशुल्क प्राप्त करें',
    });
  };

  const handleRemoveAnnouncement = () => {
    onUpdateMasthead({
      showAnnouncementStrip: false,
    });
  };

  const handleSelectAnnouncementPreset = (text: string) => {
    onUpdateMasthead({
      showAnnouncementStrip: true,
      announcementStripText: text,
    });
  };

  const handleClearVolumeIssue = () => {
    onUpdateMasthead({
      showVolumeIssue: false,
      issueNumber: '',
      volumeYear: '',
      issueCount: '',
    });
  };

  const handleToggleVolumeIssue = (show: boolean) => {
    if (show) {
      const vol = currentConfig.volumeYear || 'वर्ष 78';
      const issue = currentConfig.issueCount || 'अंक 142';
      const combined = currentConfig.issueNumber || `${vol} • ${issue}`;
      onUpdateMasthead({
        showVolumeIssue: true,
        volumeYear: vol,
        issueCount: issue,
        issueNumber: combined,
      });
    } else {
      handleClearVolumeIssue();
    }
  };

  return (
    <div
      data-testid="mobile-sub-header-tab"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      {/* Tab Navigation for Sub-Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '8px',
        }}
      >
        <button
          type="button"
          data-testid="subheader-subtab-announcement"
          onClick={() => setSubTab('announcement')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: subTab === 'announcement' ? 700 : 500,
            color: subTab === 'announcement' ? '#991b1b' : '#64748b',
            backgroundColor: subTab === 'announcement' ? '#ffffff' : 'transparent',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: subTab === 'announcement' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          📢 घोषणा पट्टी
        </button>
        <button
          type="button"
          data-testid="subheader-subtab-volume"
          onClick={() => setSubTab('volume')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: subTab === 'volume' ? 700 : 500,
            color: subTab === 'volume' ? '#0f172a' : '#64748b',
            backgroundColor: subTab === 'volume' ? '#ffffff' : 'transparent',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: subTab === 'volume' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          📅 वर्ष व अंक
        </button>
        <button
          type="button"
          data-testid="subheader-subtab-colors"
          onClick={() => setSubTab('colors')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: subTab === 'colors' ? 700 : 500,
            color: subTab === 'colors' ? '#0f172a' : '#64748b',
            backgroundColor: subTab === 'colors' ? '#ffffff' : 'transparent',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: subTab === 'colors' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          🎨 पट्टी रंग
        </button>
        <button
          type="button"
          data-testid="subheader-subtab-secondary"
          onClick={() => setSubTab('secondary')}
          style={{
            padding: '6px 2px',
            fontSize: '11px',
            fontWeight: subTab === 'secondary' ? 700 : 500,
            color: subTab === 'secondary' ? '#0f172a' : '#64748b',
            backgroundColor: subTab === 'secondary' ? '#ffffff' : 'transparent',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: subTab === 'secondary' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          🏛️ 2nd हेडर
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. ANNOUNCEMENT STRIP TAB                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'announcement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                घोषणा / ब्रेकिंग पट्टी (Announcement Strip)
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                मास्टहेड के नीचे लाल या रंगीन विशेष समाचार पट्टी
              </p>
            </div>

            {isAnnouncementEnabled && (
              <button
                type="button"
                onClick={handleRemoveAnnouncement}
                data-testid="remove-sub-header-btn"
                style={{
                  minHeight: '40px',
                  padding: '0 12px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                हटाएँ (Remove)
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
              घोषणा पट्टी दिखाएँ (Show Announcement Strip)
            </span>
            <button
              type="button"
              onClick={() => handleToggleAnnouncement(!isAnnouncementEnabled)}
              data-testid="toggle-sub-header-btn"
              style={{
                minHeight: '40px',
                minWidth: '56px',
                backgroundColor: isAnnouncementEnabled ? '#16a34a' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {isAnnouncementEnabled ? 'चालू' : 'बंद'}
            </button>
          </div>

          {isAnnouncementEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  घोषणा संदेश (Announcement Text)
                </label>
                <textarea
                  rows={2}
                  value={currentConfig.announcementStripText || ''}
                  onChange={(e) => onUpdateMasthead({ announcementStripText: e.target.value })}
                  placeholder="विशेष बुलेटिन : ताजा समाचार यहाँ लिखें..."
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontFamily: "'Noto Serif Devanagari', serif",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>त्वरित सब-हेडर चुनें:</span>
                  {onOpenTemplateGallery && (
                    <button
                      type="button"
                      onClick={() => onOpenTemplateGallery('breaking')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#b91c1c',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      गैलरी से 25+ शैलियाँ देखें ➔
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px',
                  }}
                >
                  {PRESET_SUBHEADERS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAnnouncementPreset(item.text)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '14px', lineHeight: 1 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: '9.5px',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '120px',
                          }}
                        >
                          {item.text}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <ColorStrip
                selectedColor={currentConfig.announcementStripBg || '#b91c1c'}
                onSelectColor={(col) => onUpdateMasthead({ announcementStripBg: col })}
                label="घोषणा पट्टी पृष्ठभूमि रंग (Background Color)"
              />
              <ColorStrip
                selectedColor={currentConfig.announcementStripColor || '#ffffff'}
                onSelectColor={(col) => onUpdateMasthead({ announcementStripColor: col })}
                label="घोषणा पट्टी टेक्स्ट रंग (Text Color)"
                allowTransparent={false}
              />
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. VOLUME & ISSUE TAB ("वर्ष 78 • अंक 142")                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'volume' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                वर्ष व अंक सब-हेडर (Volume & Issue)
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                तारीख पट्टी के बाईं ओर का "वर्ष व अंक"
              </p>
            </div>

            {isVolumeIssueShown && (
              <button
                type="button"
                data-testid="btn-remove-volume-issue-subheader"
                onClick={handleClearVolumeIssue}
                style={{
                  minHeight: '40px',
                  padding: '0 12px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>✕</span> वर्ष व अंक हटाएँ
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: isVolumeIssueShown ? '#f0fdf4' : '#f8fafc',
              border: isVolumeIssueShown ? '1.5px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                वर्ष व अंक दिखाएँ (Show Volume & Issue)
              </span>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                स्थिति: {isVolumeIssueShown ? 'सक्रिय (Visible)' : 'हटाया हुआ (Hidden)'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleVolumeIssue(!isVolumeIssueShown)}
              data-testid="toggle-volume-issue-btn"
              style={{
                minHeight: '40px',
                minWidth: '56px',
                backgroundColor: isVolumeIssueShown ? '#16a34a' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {isVolumeIssueShown ? 'चालू' : 'बंद'}
            </button>
          </div>

          {isVolumeIssueShown && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  वर्ष व अंक संपूर्ण पाठ (उदा. वर्ष 78 • अंक 142)
                </label>
                <input
                  type="text"
                  data-testid="input-volume-issue-subheader"
                  value={currentConfig.issueNumber ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateMasthead({ issueNumber: val });
                    if (val.includes('•')) {
                      const parts = val.split('•').map((s) => s.trim());
                      if (parts[0]) onUpdateMasthead({ volumeYear: parts[0] });
                      if (parts[1]) onUpdateMasthead({ issueCount: parts[1] });
                    }
                  }}
                  placeholder="वर्ष 78 • अंक 142"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    fontFamily: "'Noto Serif Devanagari', serif",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  त्वरित विकल्प (Tap to set):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PRESET_VOLUME_ISSUES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onUpdateMasthead({ issueNumber: preset, showVolumeIssue: true })}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. SUB-HEADER COLORS TAB                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'colors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              सब-हेडर पट्टी रंग (Sub-Header Strip Colors)
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
              तारीख पट्टी और घोषणा पट्टी का रंग अनुकूलित करें
            </p>
          </div>

          <ColorStrip
            selectedColor={currentConfig.dateStripBg || 'transparent'}
            onSelectColor={(col) => onUpdateMasthead({ dateStripBg: col })}
            label="तारीख व अंक पट्टी पृष्ठभूमि रंग (Date Strip Background)"
          />

          <ColorStrip
            selectedColor={currentConfig.dateStripColor || '#222222'}
            onSelectColor={(col) => onUpdateMasthead({ dateStripColor: col })}
            label="तारीख व अंक पट्टी टेक्स्ट रंग (Date Strip Text Color)"
          />

          <ColorStrip
            selectedColor={currentConfig.announcementStripBg || '#b91c1c'}
            onSelectColor={(col) => onUpdateMasthead({ announcementStripBg: col })}
            label="घोषणा पट्टी पृष्ठभूमि रंग (Announcement Strip Background)"
          />

          <ColorStrip
            selectedColor={currentConfig.announcementStripColor || '#ffffff'}
            onSelectColor={(col) => onUpdateMasthead({ announcementStripColor: col })}
            label="घोषणा पट्टी टेक्स्ट रंग (Announcement Strip Text Color)"
            allowTransparent={false}
          />

          <ColorStrip
            selectedColor={currentConfig.secondaryHeaderBg || '#f8fafc'}
            onSelectColor={(col) => onUpdateMasthead({ secondaryHeaderBg: col })}
            label="द्वितीयक हेडर पट्टी रंग (Secondary Header Background)"
          />

          <ColorStrip
            selectedColor={currentConfig.secondaryHeaderColor || '#0f172a'}
            onSelectColor={(col) => onUpdateMasthead({ secondaryHeaderColor: col })}
            label="द्वितीयक हेडर टेक्स्ट रंग (Secondary Header Text Color)"
            allowTransparent={false}
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. SECONDARY HEADER TAB                                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      {subTab === 'secondary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              द्वितीयक हेडर (Secondary Header / Regional Banner)
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
              मास्टहेड के नीचे विशेष क्षेत्रीय या संपादकीय सब-हेडर
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
              द्वितीयक हेडर दिखाएँ (Show Secondary Header)
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateMasthead({
                  showSecondaryHeader: !(currentConfig.showSecondaryHeader ?? false),
                  secondaryHeaderTitle:
                    currentConfig.secondaryHeaderTitle || 'विशेष क्षेत्रीय संस्करण',
                })
              }
              style={{
                minHeight: '40px',
                minWidth: '56px',
                backgroundColor: currentConfig.showSecondaryHeader ? '#16a34a' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {currentConfig.showSecondaryHeader ? 'चालू' : 'बंद'}
            </button>
          </div>

          {currentConfig.showSecondaryHeader && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                  शीर्षक (Title)
                </label>
                <input
                  type="text"
                  value={currentConfig.secondaryHeaderTitle || ''}
                  onChange={(e) => onUpdateMasthead({ secondaryHeaderTitle: e.target.value })}
                  placeholder="उदा. विशेष क्षेत्रीय संस्करण"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                  उप-शीर्षक (Subtitle)
                </label>
                <input
                  type="text"
                  value={currentConfig.secondaryHeaderSubtitle || ''}
                  onChange={(e) => onUpdateMasthead({ secondaryHeaderSubtitle: e.target.value })}
                  placeholder="उदा. राज्य व जिला समाचार विशेषांक"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <ColorStrip
                selectedColor={currentConfig.secondaryHeaderBg || '#f8fafc'}
                onSelectColor={(col) => onUpdateMasthead({ secondaryHeaderBg: col })}
                label="द्वितीयक हेडर पृष्ठभूमि रंग (Background Color)"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
