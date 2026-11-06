import React, { useState, useEffect } from 'react';
import { APP_UI_TYPOGRAPHY } from '@epaper-studio/ui';
import type { MasterTemplate, DailyEdition } from '@epaper-studio/document-schema';
import {
  templateStorage,
  editionStorage,
  type TemplateSummary,
  type EditionSummary,
} from '../../storage';
import { duplicateMasterTemplate } from '@epaper-studio/template-engine';

export interface TemplateEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditionId?: string;
  onLoadEdition: (edition: DailyEdition) => Promise<void>;
  onSaveCurrentAsTemplate: (name: string, description?: string) => Promise<void>;
  onStartNewEditionFromTemplate: (template: MasterTemplate) => Promise<void>;
}

export const TemplateEditionModal: React.FC<TemplateEditionModalProps> = ({
  isOpen,
  onClose,
  activeEditionId,
  onLoadEdition,
  onSaveCurrentAsTemplate,
  onStartNewEditionFromTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'editions' | 'templates'>('editions');
  const [editions, setEditions] = useState<EditionSummary[]>([]);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New template dialog state
  const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateDesc, setNewTemplateDesc] = useState<string>('');

  const refreshData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [edList, tplList] = await Promise.all([
        editionStorage.listEditions(),
        templateStorage.listTemplates(),
      ]);
      setEditions(edList);
      setTemplates(tplList);
    } catch (err) {
      console.error(err);
      setErrorMessage('डेटाबेस से टेम्पलेट अथवा संस्करण लोड करने में त्रुटि।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenEdition = async (id: string) => {
    try {
      const edition = await editionStorage.getEdition(id);
      if (edition) {
        await onLoadEdition(edition);
        onClose();
      } else {
        setErrorMessage('यह संस्करण उपलब्ध नहीं है।');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('संस्करण लोड करने में त्रुटि।');
    }
  };

  const handleDuplicateEdition = async (id: string, name: string) => {
    try {
      await editionStorage.duplicateEdition(id, `${name} (नया संस्करण)`);
      await refreshData();
    } catch (err) {
      console.error(err);
      setErrorMessage('संस्करण डुप्लिकेट करने में त्रुटि।');
    }
  };

  const handleDeleteEdition = async (id: string) => {
    if (!confirm('क्या आप इस संस्करण को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।')) {
      return;
    }
    try {
      await editionStorage.deleteEdition(id);
      await refreshData();
    } catch (err) {
      console.error(err);
      setErrorMessage('संस्करण हटाने में त्रुटि।');
    }
  };

  const handleStartEditionFromTemplate = async (templateId: string) => {
    try {
      const template = await templateStorage.getTemplate(templateId);
      if (template) {
        await onStartNewEditionFromTemplate(template);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('टेम्पलेट से संस्करण प्रारंभ करने में त्रुटि।');
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const template = await templateStorage.getTemplate(templateId);
      if (template) {
        const copy = duplicateMasterTemplate(template);
        await templateStorage.saveTemplate(copy);
        await refreshData();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('टेम्पलेट डुप्लिकेट करने में त्रुटि।');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('क्या आप इस कस्टम मास्टर टेम्पलेट को हटाना चाहते हैं?')) {
      return;
    }
    try {
      await templateStorage.deleteTemplate(templateId);
      await refreshData();
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'टेम्पलेट हटाने में विफल।');
    }
  };

  const handleSaveTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    try {
      await onSaveCurrentAsTemplate(newTemplateName.trim(), newTemplateDesc.trim());
      setIsCreatingTemplate(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
      await refreshData();
    } catch (err) {
      console.error(err);
      setErrorMessage('टेम्पलेट सहेजने में विफल।');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publishing-manager-title"
      data-testid="template-edition-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.68)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          fontFamily: APP_UI_TYPOGRAPHY.fonts.hindiUi,
        }}
      >
        {/* Header with Navigation Tabs */}
        <div
          style={{
            padding: '16px 20px 0 20px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div>
              <h2
                id="publishing-manager-title"
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#f8fafc',
                  fontFamily: APP_UI_TYPOGRAPHY.fonts.hindiDisplay,
                  lineHeight: 1.35,
                }}
              >
                📰 प्रकाशन प्रबंधन स्टूडियो (Publishing Studio)
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                मास्टर टेम्पलेट से दैनिक समाचार पत्र बनाएं और पिछले अंक सुरक्षित रखें।
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="बंद करें"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              ✕
            </button>
          </div>

          {/* Primary View Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              data-testid="tab-editions"
              onClick={() => setActiveTab('editions')}
              style={{
                padding: '8px 16px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'editions' ? '#ffffff' : 'transparent',
                color: activeTab === 'editions' ? '#0f172a' : '#cbd5e1',
                fontSize: '12.5px',
                fontWeight: activeTab === 'editions' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              📅 दैनिक अंक (Daily Editions - {editions.length})
            </button>
            <button
              data-testid="tab-templates"
              onClick={() => setActiveTab('templates')}
              style={{
                padding: '8px 16px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
                color: activeTab === 'templates' ? '#0f172a' : '#cbd5e1',
                fontSize: '12.5px',
                fontWeight: activeTab === 'templates' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              📑 मास्टर टेम्पलेट (Master Templates - {templates.length})
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div
            style={{
              padding: '6px 16px',
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              fontSize: '11.5px',
              fontWeight: 600,
              borderBottom: '1px solid #bae6fd',
            }}
          >
            ⏳ डेटा लोड हो रहा है...
          </div>
        )}

        {/* Error Alert Bar */}
        {errorMessage && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '12px',
              fontWeight: 600,
              borderBottom: '1px solid #fecaca',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Body Content */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#f8fafc',
          }}
        >
          {/* TAB 1: DAILY EDITIONS */}
          {activeTab === 'editions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  ब्राउज़र में सहेजे गए दैनिक संस्करण। किसी भी पुराने अंक को खोलें या नया क्षेत्रीय
                  संस्करण बनाएं।
                </div>
                <button
                  onClick={() => setActiveTab('templates')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + नया दैनिक अंक बनाएं
                </button>
              </div>

              {editions.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    कोई सहेजा हुआ दैनिक अंक नहीं मिला।
                  </p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    style={{
                      marginTop: '10px',
                      padding: '6px 14px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    मास्टर टेम्पलेट से आज का अंक बनाएं →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editions.map((ed) => {
                    const isActive = activeEditionId === ed.id;
                    return (
                      <div
                        key={ed.id}
                        data-testid={`edition-card-${ed.id}`}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                          borderRadius: '6px',
                          border: `1px solid ${isActive ? '#93c5fd' : '#e2e8f0'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: isActive ? '#1d4ed8' : '#0f172a',
                              }}
                            >
                              {ed.publicationName} - {ed.editionName}
                            </span>
                            {isActive && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  fontWeight: 700,
                                }}
                              >
                                सक्रिय (Active)
                              </span>
                            )}
                            {ed.isLegacyDraft && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#64748b',
                                  border: '1px solid #cbd5e1',
                                }}
                              >
                                पूर्व ड्राफ़्ट
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '10px',
                              fontSize: '11px',
                              color: '#64748b',
                              marginTop: '3px',
                            }}
                          >
                            <span>📅 {ed.editionDate}</span>
                            <span>📐 {ed.pageSize.toUpperCase()}</span>
                            <span>📰 {ed.articleCount} लेख</span>
                            <span>
                              🕒{' '}
                              {new Date(ed.updatedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEdition(ed.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            खोलें
                          </button>
                          <button
                            onClick={() => handleDuplicateEdition(ed.id, ed.editionName)}
                            title="क्षेत्रीय संस्करण के लिए डुप्लिकेट करें"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            डुप्लिकेट
                          </button>
                          <button
                            onClick={() => handleDeleteEdition(ed.id)}
                            title="हटाएं"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            हटाएं
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MASTER TEMPLATES */}
          {activeTab === 'templates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  मास्टर टेम्पलेट में मास्टहेड स्टाइल, ग्रिड व विज्ञापन स्थान सुरक्षित रहते हैं।
                </div>
                <button
                  onClick={() => setIsCreatingTemplate(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + वर्तमान लेआउट को टेम्पलेट बनाएं
                </button>
              </div>

              {/* Create Template Form Modal Strip */}
              {isCreatingTemplate && (
                <form
                  onSubmit={handleSaveTemplateSubmit}
                  style={{
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #0284c7',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                    वर्तमान लेआउट को मास्टर टेम्पलेट के रूप में सहेजें
                  </h4>
                  <input
                    type="text"
                    placeholder="टेम्पलेट का नाम (जैसे: दैनिक जनवाणी - मुख्य 8 कॉलम)"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    required
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="विवरण (वैकल्पिक)"
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsCreatingTemplate(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#0284c7',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      सहेजें
                    </button>
                  </div>
                </form>
              )}

              {/* Templates List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    data-testid={`template-card-${tpl.id}`}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {tpl.name}
                        </span>
                        {tpl.isBuiltIn ? (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              fontWeight: 600,
                            }}
                          >
                            🔒 सिस्टम टेम्पलेट
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontWeight: 700,
                            }}
                          >
                            ⭐ कस्टम
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          fontSize: '11px',
                          color: '#64748b',
                          marginTop: '3px',
                        }}
                      >
                        <span>📐 {tpl.pageSize.toUpperCase()}</span>
                        <span>📑 {tpl.pageCount} पृष्ठ</span>
                        <span>श्रेणी: {tpl.category}</span>
                        {tpl.description && <span>• {tpl.description}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleStartEditionFromTemplate(tpl.id)}
                        title="इस मास्टर टेम्पलेट से नया दैनिक अंक बनाएं"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        + नया अंक प्रारंभ करें
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(tpl.id)}
                        title="टेम्पलेट डुप्लिकेट करें"
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        डुप्लिकेट
                      </button>
                      {!tpl.isBuiltIn && (
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          title="कस्टम टेम्पलेट हटाएं"
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
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
        </div>
      </div>
    </div>
  );
};
