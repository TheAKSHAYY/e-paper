import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { MastheadConfig, MastheadSlot } from '@epaper-studio/document-schema';
import {
  BUILTIN_MASTHEAD_PRESETS,
  type MastheadPresetItem,
  getMastheadEmblemSvg,
} from '@epaper-studio/template-engine';
import { editorialPresetsStorage } from '../../storage/LocalStorageEditorialPresetsAdapter';

export interface MastheadDesignerModalProps {
  isOpen: boolean;
  initialMasthead: MastheadConfig;
  onSave: (updatedMasthead: MastheadConfig) => void;
  onClose: () => void;
}

type DesignerTab = 'presets' | 'branding' | 'slots' | 'metadata' | 'styling' | 'visibility';

export const MastheadDesignerModal: React.FC<MastheadDesignerModalProps> = ({
  isOpen,
  initialMasthead,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<MastheadConfig>(() => ({ ...initialMasthead }));
  const [activeTab, setActiveTab] = useState<DesignerTab>('presets');
  const [activeSlotEdit, setActiveSlotEdit] = useState<'left' | 'right'>('left');
  const [showComparison, setShowComparison] = useState(false);
  const [customPresets, setCustomPresets] = useState<MastheadPresetItem[]>([]);
  const [presetSearch, setPresetSearch] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadTarget, setPendingUploadTarget] = useState<
    'center' | 'left' | 'right' | null
  >(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig({ ...initialMasthead });
      void loadCustomPresets();
    }
  }, [isOpen, initialMasthead]);

  const loadCustomPresets = async () => {
    const list = await editorialPresetsStorage.getCustomMastheadPresets();
    setCustomPresets(list);
  };

  const allPresets = useMemo(() => {
    const combined = [...BUILTIN_MASTHEAD_PRESETS, ...customPresets];
    if (!presetSearch.trim()) return combined;
    const q = presetSearch.toLowerCase();
    return combined.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [customPresets, presetSearch]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: MastheadPresetItem) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
      title: preset.config.title || prev.title,
    }));
  };

  const handleSaveAsCustomPreset = async () => {
    if (!newPresetName.trim()) return;
    const newPreset: MastheadPresetItem = {
      id: `custom-masthead-${Date.now()}`,
      name: newPresetName.trim(),
      category: 'regional',
      description: 'उपयोगकर्ता द्वारा सहेजा गया कस्टम मास्टहेड प्रीसेट।',
      isBuiltIn: false,
      config: { ...config },
    };
    await editorialPresetsStorage.saveCustomMastheadPreset(newPreset);
    setNewPresetName('');
    setShowSavePresetInput(false);
    await loadCustomPresets();
  };

  const handleDeleteCustomPreset = async (id: string) => {
    await editorialPresetsStorage.deleteCustomMastheadPreset(id);
    await loadCustomPresets();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadTarget) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (pendingUploadTarget === 'center') {
        setConfig((prev) => ({
          ...prev,
          centerLogoUrl: dataUrl,
          showCenterLogo: true,
        }));
      } else if (pendingUploadTarget === 'left') {
        setConfig((prev) => ({
          ...prev,
          leftSlot: {
            ...prev.leftSlot,
            enabled: true,
            type: 'image',
            imageUrl: dataUrl,
          },
        }));
      } else if (pendingUploadTarget === 'right') {
        setConfig((prev) => ({
          ...prev,
          rightSlot: {
            ...prev.rightSlot,
            enabled: true,
            type: 'image',
            imageUrl: dataUrl,
          },
        }));
      }
      setPendingUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (target: 'center' | 'left' | 'right') => {
    setPendingUploadTarget(target);
    fileInputRef.current?.click();
  };

  const updateSlot = (slotKey: 'leftSlot' | 'rightSlot', updates: Partial<MastheadSlot>) => {
    setConfig((prev) => ({
      ...prev,
      [slotKey]: {
        ...(prev[slotKey] || {
          enabled: true,
          type: 'none',
          widthPx: 110,
          heightPx: 65,
          border: true,
          borderColor: '#cbd5e1',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          objectFit: 'contain',
          objectPosition: 'center',
        }),
        ...updates,
      },
    }));
  };

  const activeSlotData: MastheadSlot =
    activeSlotEdit === 'left'
      ? config.leftSlot || {
          enabled: false,
          type: 'none',
          widthPx: 110,
          heightPx: 65,
          border: true,
          borderColor: '#cbd5e1',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          objectFit: 'contain',
          objectPosition: 'center',
        }
      : config.rightSlot || {
          enabled: false,
          type: 'none',
          widthPx: 110,
          heightPx: 65,
          border: true,
          borderColor: '#cbd5e1',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
          objectFit: 'contain',
          objectPosition: 'center',
        };

  // Live preview element renderer
  const renderPreviewBox = (targetConfig: MastheadConfig) => {
    const emblemSvg = getMastheadEmblemSvg(targetConfig.emblem, targetConfig.customEmblemUrl);
    const renderSlot = (slot?: MastheadSlot) => {
      if (!slot || !slot.enabled || slot.type === 'none') return null;
      const w = Math.min(130, slot.widthPx || 110);
      const h = Math.min(75, slot.heightPx || 65);

      return (
        <div
          style={{
            width: `${w}px`,
            height: `${h}px`,
            border: slot.border ? `1px solid ${slot.borderColor || '#cbd5e1'}` : 'none',
            backgroundColor: slot.backgroundColor || '#f8fafc',
            color: slot.textColor || '#1e293b',
            overflow: 'hidden',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '9px',
          }}
        >
          {slot.type === 'image' && slot.imageUrl && (
            <img
              src={slot.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: slot.objectFit || 'contain',
                objectPosition: slot.objectPosition || 'center',
                display: 'block',
              }}
            />
          )}
          {slot.type === 'ad' && (
            <div style={{ padding: '3px', textAlign: 'center' }}>
              {slot.imageUrl && (
                <img
                  src={slot.imageUrl}
                  alt=""
                  style={{
                    maxHeight: '28px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    margin: '0 auto 2px auto',
                  }}
                />
              )}
              {slot.title && (
                <div style={{ fontWeight: 700, fontSize: '9px', lineHeight: 1.1 }}>
                  {slot.title}
                </div>
              )}
              {slot.text && <div style={{ fontSize: '8px', opacity: 0.8 }}>{slot.text}</div>}
            </div>
          )}
          {slot.type === 'emblem' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {slot.imageUrl ? (
                <img
                  src={slot.imageUrl}
                  alt=""
                  style={{ maxHeight: '40px', maxWidth: '40px', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '20px' }}>🛡️</span>
              )}
            </div>
          )}
          {slot.type === 'text' && (
            <div style={{ padding: '3px', textAlign: 'center' }}>
              {slot.title && <div style={{ fontWeight: 700, fontSize: '9.5px' }}>{slot.title}</div>}
              {slot.subtitle && (
                <div style={{ fontSize: '8px', opacity: 0.8 }}>{slot.subtitle}</div>
              )}
              {slot.text && <div style={{ fontSize: '7.5px', marginTop: '1px' }}>{slot.text}</div>}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        style={{
          backgroundColor: targetConfig.backgroundColor || '#ffffff',
          borderTop: `${targetConfig.borderTopWidth ?? 1}px solid ${targetConfig.borderColor || '#111111'}`,
          borderBottom: `${targetConfig.borderBottomWidth ?? 3}px ${targetConfig.ruleStyle === 'single-hairline' ? 'solid' : 'double'} ${targetConfig.borderColor || '#111111'}`,
          paddingTop: `${targetConfig.paddingTopPt ?? 4}px`,
          paddingBottom: `${targetConfig.paddingBottomPt ?? 6}px`,
          minHeight: targetConfig.headerMinHeightPt
            ? `${targetConfig.headerMinHeightPt}px`
            : undefined,
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Top Strip */}
        {targetConfig.showTopStrip !== false && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #111111',
              paddingBottom: '3px',
              marginBottom: '6px',
              fontSize: '10px',
              color: '#333333',
              fontFamily: "'Hind', 'Noto Serif Devanagari', sans-serif",
            }}
          >
            <div>
              {targetConfig.showWeather !== false && (
                <span>
                  <strong>मौसम:</strong> {targetConfig.weatherCity} {targetConfig.temperature}
                </span>
              )}
              {targetConfig.showAirQuality !== false && targetConfig.airQuality && (
                <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 600 }}>
                  • {targetConfig.airQuality}
                </span>
              )}
            </div>
            <div style={{ textAlign: 'center', color: targetConfig.taglineColor || '#475569' }}>
              {targetConfig.showTagline !== false && (
                <span>{targetConfig.tagline || targetConfig.subtitle}</span>
              )}
              {targetConfig.showEstablishment !== false && targetConfig.establishmentYear && (
                <span style={{ marginLeft: '4px' }}>• स्था. {targetConfig.establishmentYear}</span>
              )}
            </div>
            <div>
              {targetConfig.showPrice !== false && (
                <strong style={{ color: '#b91c1c' }}>{targetConfig.price}</strong>
              )}
              {targetConfig.showPostalReg !== false && targetConfig.postalRegNumber && (
                <span style={{ marginLeft: '6px', fontSize: '9px', color: '#64748b' }}>
                  {targetConfig.postalRegNumber}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Announcement Strip */}
        {targetConfig.showAnnouncementStrip && targetConfig.announcementStripText && (
          <div
            style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                backgroundColor: '#ffffff',
                color: '#b91c1c',
                padding: '0 4px',
                borderRadius: '2px',
                fontSize: '8px',
              }}
            >
              विशेष
            </span>
            <span>{targetConfig.announcementStripText}</span>
          </div>
        )}

        {/* Main Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            width: '100%',
          }}
        >
          {renderSlot(targetConfig.leftSlot)}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: targetConfig.alignment === 'left' ? 'flex-start' : 'center',
              justifyContent: 'center',
              textAlign: targetConfig.alignment === 'left' ? 'left' : 'center',
            }}
          >
            {targetConfig.showCenterLogo && targetConfig.centerLogoUrl && (
              <div style={{ marginBottom: '4px' }}>
                <img
                  src={targetConfig.centerLogoUrl}
                  alt=""
                  style={{
                    maxWidth: `${Math.min(240, targetConfig.centerLogoWidthPx || 240)}px`,
                    maxHeight: `${Math.min(55, targetConfig.centerLogoHeightPx || 55)}px`,
                    objectFit: targetConfig.centerLogoObjectFit || 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {targetConfig.showEmblem && emblemSvg && (
                <div
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
                  dangerouslySetInnerHTML={{ __html: emblemSvg }}
                />
              )}
              <h1
                style={{
                  fontFamily: targetConfig.fontFamily || "'Rozha One', serif",
                  fontSize: `${Math.min(46, targetConfig.fontSizePt || 42)}px`,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  margin: 0,
                  color: targetConfig.titleColor || '#111111',
                  letterSpacing: '-0.02em',
                }}
              >
                {targetConfig.title}
              </h1>
            </div>
          </div>

          {renderSlot(targetConfig.rightSlot)}
        </div>

        {/* Bottom Folio Strip */}
        {targetConfig.showBottomStrip !== false && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #111111',
              paddingTop: '3px',
              marginTop: '4px',
              fontSize: '10px',
              color: '#222222',
              fontWeight: 600,
            }}
          >
            <div>
              {targetConfig.showVolumeIssue !== false &&
                (() => {
                  const volStr =
                    targetConfig.issueNumber !== undefined
                      ? targetConfig.issueNumber.trim()
                      : [targetConfig.volumeYear, targetConfig.issueCount]
                          .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
                          .join(' • ');
                  return volStr.length > 0 ? <span>{volStr}</span> : null;
                })()}
            </div>
            <div>
              {targetConfig.showDate !== false && (
                <span>
                  {targetConfig.dayOfWeek ? `${targetConfig.dayOfWeek}, ` : ''}
                  {targetConfig.date || '28 अक्टूबर 2026'}
                </span>
              )}
            </div>
            <div>
              {targetConfig.showEdition !== false && (
                <span>{targetConfig.edition || 'मुख्य संस्करण'}</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1020px',
          height: '90vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🗞️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                मास्टहेड डिज़ाइनर एवं प्रीसेट स्टूडियो (Masthead & Header Designer)
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                शीर्षक, लोगो, कान विज्ञापन (Ear Slots), मौसम व संपादकीय विन्यास को अनुकूलित करें।
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              style={{
                backgroundColor: showComparison ? '#2563eb' : '#f1f5f9',
                color: showComparison ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {showComparison ? '👁️ एकल दृश्य (Single View)' : '⚖️ मूल बनाम संपादित (Compare)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '20px',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Preview Strip */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
          >
            {showComparison
              ? 'तुलनात्मक पूर्वावलोकन (Original vs Edited Parity)'
              : 'लाइव पूर्वावलोकन (Real-Time WYSIWYG Header Preview)'}
          </div>

          {showComparison ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  मूल (Original)
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  {renderPreviewBox(initialMasthead)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#2563eb',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  संपादित (Edited)
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #93c5fd',
                  }}
                >
                  {renderPreviewBox(config)}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {renderPreviewBox(config)}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            padding: '0 20px',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'presets', label: '📚 प्रीसेट लाइब्रेरी', icon: '🎨' },
            { id: 'branding', label: '📰 नाम व लोगो', icon: '🖋️' },
            { id: 'slots', label: '📢 कान विज्ञापन (Ear Slots)', icon: '🖼️' },
            { id: 'metadata', label: '🌤️ मौसम व तारीख', icon: '📅' },
            { id: 'styling', label: '📐 स्पेसिंग व रंग', icon: '🎨' },
            { id: 'visibility', label: '👁️ तत्व दृश्यता', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DesignerTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                fontSize: '12.5px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#b91c1c' : '#475569',
                borderBottom:
                  activeTab === tab.id ? '2.5px solid #b91c1c' : '2.5px solid transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#f8fafc',
          }}
        >
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  gap: '12px',
                }}
              >
                <input
                  type="text"
                  placeholder="प्रीसेट खोजें (उदा: Hindi, Minimal, Ad-focused)..."
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSavePresetInput(!showSavePresetInput)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⭐ वर्तमान को कस्टम प्रीसेट सहेजें
                </button>
              </div>

              {showSavePresetInput && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="कस्टम प्रीसेट का नाम लिखें..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #94a3b8',
                      fontSize: '12.5px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveAsCustomPreset}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    सहेजें (Save)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSavePresetInput(false)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    रद्द करें
                  </button>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '14px',
                }}
              >
                {allPresets.map((preset) => (
                  <div
                    key={preset.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {preset.name}
                        </span>
                        {!preset.isBuiltIn && (
                          <span
                            style={{
                              fontSize: '10px',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            Custom
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: '#64748b',
                          margin: '0 0 12px 0',
                          lineHeight: 1.4,
                        }}
                      >
                        {preset.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '10px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={{
                          flex: 1,
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✓ लागू करें (Apply)
                      </button>
                      {!preset.isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomPreset(preset.id)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '7px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          हटाएं
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING (NAME, LOGO, EMBLEM) */}
          {activeTab === 'branding' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>
                  शीर्षक व टैगलाइन (Title & Tagline)
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    समाचार पत्र का नाम (Newspaper Title):
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    टैगलाइन (Motto / Tagline):
                  </label>
                  <input
                    type="text"
                    value={config.tagline || ''}
                    onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    स्थापना वर्ष (Establishment Year):
                  </label>
                  <input
                    type="text"
                    value={config.establishmentYear || ''}
                    onChange={(e) => setConfig({ ...config, establishmentYear: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    फ़ॉन्ट शैली (Masthead Typography):
                  </label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  >
                    <option value="'Rozha One', serif">
                      रोज़ा वन (Rozha One — Classic Broadsheet)
                    </option>
                    <option value="'Mukta', sans-serif">मुक्ता (Mukta — Modern Clean)</option>
                    <option value="'Noto Serif Devanagari', serif">नोटो सेरिफ़ (Noto Serif)</option>
                    <option value="'Poppins', sans-serif">पॉपिन्स (Poppins — Contemporary)</option>
                    <option value="'Playfair Display', serif">
                      Playfair Display (English Chronicle)
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>
                  केंद्रीय लोगो व प्रतीक (Center Logo & Emblem)
                </h3>

                {/* Center Logo Upload */}
                <div
                  style={{
                    marginBottom: '14px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      मध्य लोगो छवि (Center Logo Graphic)
                    </span>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(config.showCenterLogo)}
                        onChange={(e) => setConfig({ ...config, showCenterLogo: e.target.checked })}
                      />
                      सक्रिय करें
                    </label>
                  </div>

                  {config.centerLogoUrl ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '8px',
                      }}
                    >
                      <img
                        src={config.centerLogoUrl}
                        alt=""
                        style={{ height: '40px', maxWidth: '140px', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        onClick={() => triggerUpload('center')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        बदलें
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfig({ ...config, centerLogoUrl: '', showCenterLogo: false })
                        }
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          cursor: 'pointer',
                        }}
                      >
                        हटाएं
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerUpload('center')}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#2563eb',
                        cursor: 'pointer',
                      }}
                    >
                      📤 लोगो छवि अपलोड करें (PNG/SVG)
                    </button>
                  )}
                </div>

                {/* Emblem Selection */}
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    राष्ट्रीय / संपादकीय प्रतीक (Emblem):
                  </label>
                  <select
                    value={config.emblem}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emblem: e.target.value as MastheadConfig['emblem'],
                        showEmblem: e.target.value !== 'none',
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  >
                    <option value="none">कोई नहीं (None)</option>
                    <option value="ashoka-chakra">अशोक चक्र (Ashoka Chakra)</option>
                    <option value="sun">सूर्य उदय (Rising Sun)</option>
                    <option value="quill">लेखनी (Quill Pen)</option>
                    <option value="lion-capital">सिंह स्तम्भ (Lion Capital)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      संरेखण (Alignment):
                    </label>
                    <select
                      value={config.alignment}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          alignment: e.target.value as MastheadConfig['alignment'],
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    >
                      <option value="center">मध्य (Center)</option>
                      <option value="left">बायाँ (Left)</option>
                      <option value="justified">विस्तारित (Justified)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      फ़ॉन्ट आकार ({config.fontSizePt || 52}pt):
                    </label>
                    <input
                      type="range"
                      min="32"
                      max="72"
                      value={config.fontSizePt || 52}
                      onChange={(e) => setConfig({ ...config, fontSizePt: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SLOTS (EAR ADS & LOGOS) */}
          {activeTab === 'slots' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSlotEdit('left')}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: activeSlotEdit === 'left' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: activeSlotEdit === 'left' ? '#eff6ff' : '#ffffff',
                    color: activeSlotEdit === 'left' ? '#1d4ed8' : '#334155',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  ◀ बायाँ कान स्लॉट (Left Ear Slot)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlotEdit('right')}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: activeSlotEdit === 'right' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: activeSlotEdit === 'right' ? '#eff6ff' : '#ffffff',
                    color: activeSlotEdit === 'right' ? '#1d4ed8' : '#334155',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  दायाँ कान स्लॉट (Right Ear Slot) ▶
                </button>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(activeSlotData.enabled)}
                      onChange={(e) =>
                        updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                          enabled: e.target.checked,
                          type: activeSlotData.type === 'none' ? 'ad' : activeSlotData.type,
                        })
                      }
                    />
                    इस स्लॉट को मास्टहेड में प्रदर्शित करें
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>प्रकार (Type):</span>
                    <select
                      value={activeSlotData.type}
                      onChange={(e) =>
                        updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                          type: e.target.value as MastheadSlot['type'],
                          enabled: true,
                        })
                      }
                      style={{
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                      }}
                    >
                      <option value="none">कोई नहीं (Disabled)</option>
                      <option value="ad">विज्ञापन पट्टी (Advertisement)</option>
                      <option value="image">फोटो / लोगो (Image / Logo)</option>
                      <option value="text">संदेश / घोषणा (Custom Text)</option>
                      <option value="emblem">विशेष बैज (Emblem)</option>
                    </select>
                  </div>
                </div>

                {activeSlotData.enabled && activeSlotData.type !== 'none' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <div style={{ marginBottom: '10px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '4px',
                          }}
                        >
                          शीर्षक / ब्रांड नाम (Slot Title):
                        </label>
                        <input
                          type="text"
                          value={activeSlotData.title || ''}
                          onChange={(e) =>
                            updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                              title: e.target.value,
                            })
                          }
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12.5px',
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '4px',
                          }}
                        >
                          उप-शीर्षक / संपर्क (Subtitle):
                        </label>
                        <input
                          type="text"
                          value={activeSlotData.subtitle || ''}
                          onChange={(e) =>
                            updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                              subtitle: e.target.value,
                            })
                          }
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12.5px',
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '4px',
                          }}
                        >
                          विवरण / ऑफर टेक्स्ट (Offer Details):
                        </label>
                        <input
                          type="text"
                          value={activeSlotData.text || ''}
                          onChange={(e) =>
                            updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                              text: e.target.value,
                            })
                          }
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12.5px',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '4px',
                          }}
                        >
                          छवि / लोगो (Image Upload):
                        </label>
                        {activeSlotData.imageUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={activeSlotData.imageUrl}
                              alt=""
                              style={{ height: '36px', maxWidth: '100px', objectFit: 'contain' }}
                            />
                            <button
                              type="button"
                              onClick={() => triggerUpload(activeSlotEdit)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              बदलें
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                                  imageUrl: '',
                                })
                              }
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                cursor: 'pointer',
                              }}
                            >
                              हटाएं
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerUpload(activeSlotEdit)}
                            style={{
                              width: '100%',
                              padding: '7px',
                              backgroundColor: '#f8fafc',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#2563eb',
                              cursor: 'pointer',
                            }}
                          >
                            📤 स्लॉट हेतु फोटो अपलोड करें
                          </button>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginBottom: '10px',
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            चौड़ाई ({activeSlotData.widthPx || 110}px):
                          </label>
                          <input
                            type="number"
                            min="60"
                            max="200"
                            value={activeSlotData.widthPx || 110}
                            onChange={(e) =>
                              updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                                widthPx: Number(e.target.value),
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            ऊंचाई ({activeSlotData.heightPx || 65}px):
                          </label>
                          <input
                            type="number"
                            min="40"
                            max="120"
                            value={activeSlotData.heightPx || 65}
                            onChange={(e) =>
                              updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                                heightPx: Number(e.target.value),
                              })
                            }
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            पृष्ठभूमि रंग:
                          </label>
                          <input
                            type="color"
                            value={activeSlotData.backgroundColor || '#f8fafc'}
                            onChange={(e) =>
                              updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                                backgroundColor: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              height: '32px',
                              padding: 0,
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              color: '#64748b',
                              marginBottom: '2px',
                            }}
                          >
                            बॉर्डर रंग:
                          </label>
                          <input
                            type="color"
                            value={activeSlotData.borderColor || '#cbd5e1'}
                            onChange={(e) =>
                              updateSlot(activeSlotEdit === 'left' ? 'leftSlot' : 'rightSlot', {
                                borderColor: e.target.value,
                              })
                            }
                            style={{
                              width: '100%',
                              height: '32px',
                              padding: 0,
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: METADATA & WEATHER */}
          {activeTab === 'metadata' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>
                  मौसम व वायु गुणवत्ता (Weather & AQI)
                </h3>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    शहर (City):
                  </label>
                  <input
                    type="text"
                    value={config.weatherCity || ''}
                    onChange={(e) => setConfig({ ...config, weatherCity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      तापमान (Temp):
                    </label>
                    <input
                      type="text"
                      value={config.temperature || ''}
                      onChange={(e) => setConfig({ ...config, temperature: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      स्थिति (Weather):
                    </label>
                    <input
                      type="text"
                      value={config.weatherCondition || ''}
                      onChange={(e) => setConfig({ ...config, weatherCondition: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    वायु गुणवत्ता (AQI):
                  </label>
                  <input
                    type="text"
                    value={config.airQuality || ''}
                    onChange={(e) => setConfig({ ...config, airQuality: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>
                  संस्करण, मूल्य व पंजीयन (Edition & Price)
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      मूल्य (Price):
                    </label>
                    <input
                      type="text"
                      value={config.price || ''}
                      onChange={(e) => setConfig({ ...config, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      संस्करण (Edition):
                    </label>
                    <input
                      type="text"
                      value={config.edition || ''}
                      onChange={(e) => setConfig({ ...config, edition: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    पंजीयन संख्या (Postal Reg):
                  </label>
                  <input
                    type="text"
                    value={config.postalRegNumber || ''}
                    onChange={(e) => setConfig({ ...config, postalRegNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      दिन (Day):
                    </label>
                    <input
                      type="text"
                      value={config.dayOfWeek || ''}
                      onChange={(e) => setConfig({ ...config, dayOfWeek: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '4px',
                      }}
                    >
                      तारीख (Date):
                    </label>
                    <input
                      type="text"
                      value={config.date || ''}
                      onChange={(e) => setConfig({ ...config, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STYLING & SPACING */}
          {activeTab === 'styling' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>
                  रंग विन्यास (Color Scheme)
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        color: '#475569',
                        marginBottom: '4px',
                      }}
                    >
                      शीर्षक का रंग:
                    </label>
                    <input
                      type="color"
                      value={config.titleColor || '#111111'}
                      onChange={(e) => setConfig({ ...config, titleColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        color: '#475569',
                        marginBottom: '4px',
                      }}
                    >
                      टैगलाइन का रंग:
                    </label>
                    <input
                      type="color"
                      value={config.taglineColor || '#475569'}
                      onChange={(e) => setConfig({ ...config, taglineColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        color: '#475569',
                        marginBottom: '4px',
                      }}
                    >
                      मास्टहेड बैकग्राउंड:
                    </label>
                    <input
                      type="color"
                      value={config.backgroundColor || '#ffffff'}
                      onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11.5px',
                        color: '#475569',
                        marginBottom: '4px',
                      }}
                    >
                      बॉर्डर रंग:
                    </label>
                    <input
                      type="color"
                      value={config.borderColor || '#111111'}
                      onChange={(e) => setConfig({ ...config, borderColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    बॉर्डर शैली (Rule Border Style):
                  </label>
                  <select
                    value={config.ruleStyle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ruleStyle: e.target.value as MastheadConfig['ruleStyle'],
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                    }}
                  >
                    <option value="ornate-double">अलंकृत डबल नियम (Ornate Double)</option>
                    <option value="classic-double">क्लासिक डबल (Classic Double)</option>
                    <option value="single-hairline">सिंगल हेयरलाइन (Single Hairline)</option>
                    <option value="oxford-thick-thin">ऑक्सफोर्ड थिक-थिन (Oxford)</option>
                    <option value="none">कोई नहीं (No Border)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>
                  पैडिंग व ऊंचाई (Padding & Spacing)
                </h3>
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    शीर्ष पैडिंग ({config.paddingTopPt ?? 4}pt):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={config.paddingTopPt ?? 4}
                    onChange={(e) => setConfig({ ...config, paddingTopPt: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    तली पैडिंग ({config.paddingBottomPt ?? 6}pt):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={config.paddingBottomPt ?? 6}
                    onChange={(e) =>
                      setConfig({ ...config, paddingBottomPt: Number(e.target.value) })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      color: '#475569',
                      marginBottom: '4px',
                    }}
                  >
                    न्यूनतम ऊंचाई ({config.headerMinHeightPt || 0}pt):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    value={config.headerMinHeightPt || 0}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        headerMinHeightPt: Number(e.target.value) || undefined,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VISIBILITY CONTROLS */}
          {activeTab === 'visibility' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: 700 }}>
                तत्व दृश्यता टॉगल (Element Visibility Toggles)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                {(
                  [
                    { key: 'showTopStrip', label: 'शीर्ष पट्टी (Top Strip)' },
                    { key: 'showWeather', label: 'मौसम विवरण (Weather)' },
                    { key: 'showAirQuality', label: 'वायु गुणवत्ता (AQI)' },
                    { key: 'showTagline', label: 'टैगलाइन (Tagline)' },
                    { key: 'showEstablishment', label: 'स्थापना वर्ष (Est. Year)' },
                    { key: 'showPrice', label: 'अखबार का मूल्य (Price)' },
                    { key: 'showPostalReg', label: 'डाक पंजीयन (Postal Reg)' },
                    { key: 'showBottomStrip', label: 'निचली फोलियो पट्टी (Bottom Strip)' },
                    { key: 'showVolumeIssue', label: 'वर्ष व अंक संख्या (Volume / Issue)' },
                    { key: 'showDate', label: 'प्रकाशन दिनांक (Date)' },
                    { key: 'showEdition', label: 'संस्करण नाम (Edition)' },
                    { key: 'showAnnouncementStrip', label: 'विशेष घोषणा पट्टी (Announcement)' },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={config[item.key] !== false}
                      onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked })}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => setConfig({ ...initialMasthead })}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↺ मूल स्थिति पर रीसेट करें (Reset)
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(config);
                onClose();
              }}
              style={{
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(185,28,28,0.2)',
              }}
            >
              ✓ परिवर्तन सहेजें (Save Changes)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
