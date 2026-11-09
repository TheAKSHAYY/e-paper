import React, { useState, useEffect, useCallback } from 'react';
import type { EditionSummary } from '../../storage/types';
import { editionStorage } from '../../storage';
import { publisherProfileStorage } from '../../storage/PublisherProfileStorage';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { ProfileDropdownMenu } from '../auth/ProfileDropdownMenu';
import { useAuth } from '../../auth/AuthContext';

export interface PublisherDashboardProps {
  onOpenEditor: (editionId?: string) => void;
  onNewEdition: () => void;
  onOpenTemplates?: () => void;
  onEditProfile?: () => void;
  onBackToLanding?: () => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
}

export const PublisherDashboard: React.FC<PublisherDashboardProps> = ({
  onOpenEditor,
  onNewEdition,
  onOpenTemplates,
  onEditProfile,
  onBackToLanding,
  onSignOut,
  onOpenSettings,
}) => {
  const { t, locale } = useI18n();
  const { authMode } = useAuth();
  const profile = publisherProfileStorage.getProfile();
  const [editions, setEditions] = useState<EditionSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [editionToDelete, setEditionToDelete] = useState<string | null>(null);

  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const fonts = PUBLISHER_DESIGN_SYSTEM.fonts;

  const loadEditions = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await editionStorage.listEditions();
      setEditions(list);
    } catch (e) {
      console.error('[PublisherDashboard] Error loading editions:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEditions();
  }, [loadEditions]);

  const handleDeleteEdition = async (id: string) => {
    try {
      await editionStorage.deleteEdition(id);
      setEditionToDelete(null);
      await loadEditions();
    } catch (e) {
      console.error('[PublisherDashboard] Failed to delete edition:', e);
    }
  };

  const handleDuplicateEdition = async (id: string, name: string) => {
    try {
      await editionStorage.duplicateEdition(
        id,
        `${name} (${locale === 'en' ? 'Copy' : 'प्रतिलिपि'})`
      );
      await loadEditions();
    } catch (e) {
      console.error('[PublisherDashboard] Failed to duplicate edition:', e);
    }
  };

  const filteredEditions = editions.filter((ed) => {
    if (selectedStatusFilter === 'all') return true;
    return ed.saveStatus === selectedStatusFilter;
  });

  const currentDateFormatted = new Date().toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.warmPaper,
        color: colors.inkBlack,
        fontFamily: fonts.interface,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ====================================================================
       * 1. DASHBOARD TOP BAR
       * ==================================================================== */}
      <header
        style={{
          borderBottom: `1px solid ${colors.borderMuted}`,
          backgroundColor: '#FFFFFF',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                backgroundColor: colors.pressRed,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px',
                fontFamily: fonts.hindiEditorial,
                borderRadius: '4px',
              }}
            >
              प
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: colors.inkBlack,
                    fontFamily: fonts.display,
                  }}
                >
                  {profile.newspaperTitle ||
                    (locale === 'en' ? 'The Morning Chronicle' : 'दैनिक नवप्रभात')}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: colors.mutedPaper,
                    color: colors.textSecondary,
                    padding: '2px 6px',
                    borderRadius: '3px',
                  }}
                >
                  {locale === 'hi' ? 'हिंदी संस्करण' : 'English Edition'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                {profile.publisherName} • {currentDateFormatted}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {authMode === 'mock' && (
              <span
                data-testid="dashboard-mock-indicator"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  border: '1px solid #BFDBFE',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Running in local offline development mock mode"
              >
                <span>🛠️</span>
                <span>{locale === 'hi' ? 'मॉक मोड' : 'Dev Mock'}</span>
              </span>
            )}

            <LanguageSelector variant="pill" />

            {onOpenSettings && onSignOut && (
              <ProfileDropdownMenu
                onOpenSettings={onOpenSettings}
                onSignOut={onSignOut}
                variant="light"
              />
            )}

            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '4px',
                  padding: '7px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                ← {locale === 'en' ? 'Home' : 'मुख्य पृष्ठ'}
              </button>
            )}

            {onEditProfile && (
              <button
                onClick={onEditProfile}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '4px',
                  padding: '7px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                ⚙️ {locale === 'en' ? 'Profile' : 'प्रोफ़ाइल सेटिंग्स'}
              </button>
            )}

            <button
              onClick={onNewEdition}
              style={{
                backgroundColor: colors.pressRed,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(158, 48, 41, 0.25)',
              }}
            >
              <span>{t.dashboard.newEditionBtn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
       * 2. MAIN DASHBOARD CONTENT AREA
       * ==================================================================== */}
      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {/* Welcome Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: `1px solid ${colors.borderMuted}`,
            borderRadius: '6px',
            padding: '24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                color: colors.pressRed,
                textTransform: 'uppercase',
              }}
            >
              {locale === 'en' ? 'Publisher Control Center' : 'प्रकाशक नियंत्रण केंद्र'}
            </span>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: colors.inkBlack,
                margin: '4px 0 6px 0',
                fontFamily: locale === 'hi' ? fonts.hindiEditorial : fonts.display,
                lineHeight: locale === 'hi' ? 1.35 : 1.2,
              }}
            >
              {locale === 'en'
                ? `Welcome, ${profile.publisherName}`
                : `नमस्ते, ${profile.publisherName}`}
            </h1>
            <p style={{ fontSize: '13.5px', color: colors.textSecondary, margin: 0 }}>
              {locale === 'en'
                ? `Today is ${currentDateFormatted}. Manage daily editions, newspaper templates, and physical print layouts.`
                : `आज ${currentDateFormatted} है। अपने समाचार पत्र के दैनिक संस्करणों, टेम्पलेट्स और प्रिंट लेआउट का प्रबंधन करें।`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {onOpenTemplates && (
              <button
                onClick={onOpenTemplates}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '4px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t.dashboard.openTemplatesBtn}
              </button>
            )}

            <button
              onClick={onNewEdition}
              style={{
                backgroundColor: colors.pressRed,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.dashboard.newEditionBtn}
            </button>

            {editions.length > 0 && (
              <button
                onClick={() => onOpenEditor(editions[0]?.id)}
                style={{
                  backgroundColor: colors.inkBlack,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.dashboard.continueEditing}
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.borderMuted}`,
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
              {t.dashboard.statTotalEditions}
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: colors.inkBlack,
                margin: '4px 0 2px 0',
              }}
            >
              {editions.length}
            </div>
            <div style={{ fontSize: '11.5px', color: colors.textSecondary }}>
              Local Edition Archive
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.borderMuted}`,
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
              {locale === 'en' ? 'Primary Geometry' : 'प्राथमिक मुद्रण आकार'}
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: colors.inkBlack,
                margin: '6px 0 4px 0',
                textTransform: 'capitalize',
              }}
            >
              {profile.preferredPageSize || 'Broadsheet'}
            </div>
            <div style={{ fontSize: '11.5px', color: colors.textSecondary }}>
              Vector PDF Print Standard
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.borderMuted}`,
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
              {locale === 'en' ? 'Primary Language' : 'प्रकाशन भाषा'}
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: colors.inkBlack,
                margin: '6px 0 4px 0',
              }}
            >
              {locale === 'hi' ? 'हिंदी (Devanagari)' : 'English (Latin)'}
            </div>
            <div style={{ fontSize: '11.5px', color: colors.textSecondary }}>
              41 Self-Hosted Typefaces
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.borderMuted}`,
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted }}>
              {t.dashboard.statReadyForPrint}
            </div>
            <div
              style={{ fontSize: '20px', fontWeight: 800, color: '#047857', margin: '6px 0 4px 0' }}
            >
              ✓ {locale === 'en' ? 'Active' : 'सक्रिय'}
            </div>
            <div style={{ fontSize: '11.5px', color: colors.textSecondary }}>
              Zero Silent Overflow
            </div>
          </div>
        </div>

        {/* Editions Header & Filter */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '19px',
                fontWeight: 800,
                color: colors.inkBlack,
                margin: '0 0 2px 0',
              }}
            >
              {t.dashboard.editionsTableTitle}
            </h2>
            <p style={{ fontSize: '12.5px', color: colors.textMuted, margin: 0 }}>
              {t.dashboard.editionsTableSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'saved', 'draft', 'modified'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                style={{
                  backgroundColor: selectedStatusFilter === st ? colors.inkBlack : '#FFFFFF',
                  color: selectedStatusFilter === st ? '#FFFFFF' : colors.textSecondary,
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st === 'all'
                  ? locale === 'en'
                    ? 'All'
                    : 'सभी'
                  : st === 'saved'
                    ? locale === 'en'
                      ? 'Saved'
                      : 'सहेजे गए'
                    : st === 'draft'
                      ? locale === 'en'
                        ? 'Draft'
                        : 'ड्राफ्ट'
                      : locale === 'en'
                        ? 'Modified'
                        : 'संशोधित'}
              </button>
            ))}
          </div>
        </div>

        {/* Editions List or Empty State */}
        {isLoading ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.borderMuted}`,
              borderRadius: '6px',
              padding: '48px',
              textAlign: 'center',
              color: colors.textMuted,
            }}
          >
            {t.common.loading}
          </div>
        ) : filteredEditions.length === 0 ? (
          /* ====================================================================
           * AUTHENTIC EMPTY STATE
           * ==================================================================== */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px dashed ${colors.borderMuted}`,
              borderRadius: '6px',
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: colors.inkBlack,
                margin: '0 0 8px 0',
              }}
            >
              {t.dashboard.emptyTitle}
            </h3>
            <p
              style={{
                fontSize: '13.5px',
                color: colors.textSecondary,
                maxWidth: '480px',
                margin: '0 auto 24px auto',
                lineHeight: 1.5,
              }}
            >
              {t.dashboard.emptySubtitle}
            </p>
            <button
              onClick={onNewEdition}
              style={{
                backgroundColor: colors.pressRed,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.dashboard.emptyCta}
            </button>
          </div>
        ) : (
          /* Editions Table */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.borderMuted}`,
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#FAF9F6',
                      borderBottom: `1px solid ${colors.borderMuted}`,
                      color: colors.textMuted,
                      fontSize: '11.5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <th style={{ padding: '12px 16px' }}>{t.dashboard.colTitle}</th>
                    <th style={{ padding: '12px 16px' }}>
                      {locale === 'en' ? 'Publication' : 'प्रकाशन'}
                    </th>
                    <th style={{ padding: '12px 16px' }}>{t.dashboard.colSize}</th>
                    <th style={{ padding: '12px 16px' }}>
                      {locale === 'en' ? 'Last Modified' : 'अंतिम संशोधन'}
                    </th>
                    <th style={{ padding: '12px 16px' }}>{t.dashboard.colStatus}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {t.dashboard.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEditions.map((ed) => {
                    const statusColors: Record<string, { bg: string; text: string }> = {
                      saved: { bg: '#ECFDF5', text: '#047857' },
                      draft: { bg: '#FEF3C7', text: '#92400E' },
                      modified: { bg: '#EFF6FF', text: '#1D4ED8' },
                    };
                    const badge = statusColors[ed.saveStatus] || { bg: '#F3F4F6', text: '#374151' };

                    return (
                      <tr key={ed.id} style={{ borderBottom: `1px solid #F3F4F6` }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: colors.inkBlack }}>
                            {ed.editionName}
                          </div>
                          <div style={{ fontSize: '11.5px', color: colors.textMuted }}>
                            {ed.editionDate}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: colors.textSecondary }}>
                          {ed.publicationName}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: colors.textSecondary,
                            textTransform: 'capitalize',
                          }}
                        >
                          {ed.pageSize} • {ed.articleCount} समाचार
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            color: colors.textMuted,
                            fontSize: '12px',
                          }}
                        >
                          {new Date(ed.updatedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '3px',
                              backgroundColor: badge.bg,
                              color: badge.text,
                              textTransform: 'uppercase',
                            }}
                          >
                            {ed.saveStatus}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => onOpenEditor(ed.id)}
                              style={{
                                backgroundColor: colors.inkBlack,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '3px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {locale === 'en' ? 'Edit →' : 'संपादित करें →'}
                            </button>
                            <button
                              onClick={() => handleDuplicateEdition(ed.id, ed.editionName)}
                              style={{
                                backgroundColor: '#FFFFFF',
                                color: colors.textSecondary,
                                border: `1px solid ${colors.borderMuted}`,
                                borderRadius: '3px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              title={
                                locale === 'en' ? 'Duplicate edition' : 'संस्करण की प्रति बनाएं'
                              }
                            >
                              {locale === 'en' ? 'Copy' : 'प्रतिलिपि'}
                            </button>
                            <button
                              onClick={() => setEditionToDelete(ed.id)}
                              style={{
                                backgroundColor: '#FFFFFF',
                                color: colors.pressRed,
                                border: `1px solid #FCA5A5`,
                                borderRadius: '3px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              title={locale === 'en' ? 'Delete edition' : 'संस्करण हटाएं'}
                            >
                              {locale === 'en' ? 'Delete' : 'हटाएं'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {editionToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '16px',
                fontWeight: 800,
                color: colors.pressRed,
              }}
            >
              संस्करण हटाएं (Delete Edition)
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                lineHeight: 1.5,
                margin: '0 0 20px 0',
              }}
            >
              क्या आप सुनिश्चित हैं कि आप इस संस्करण को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की
              जा सकती।
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setEditionToDelete(null)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: '4px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                रद्द करें
              </button>
              <button
                onClick={() => handleDeleteEdition(editionToDelete)}
                style={{
                  backgroundColor: colors.pressRed,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
