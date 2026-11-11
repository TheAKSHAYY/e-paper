import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { EditionSummary } from '../../storage/types';
import { editionStorage } from '../../storage';
import { publisherProfileStorage } from '../../storage/PublisherProfileStorage';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { ProfileDropdownMenu } from '../auth/ProfileDropdownMenu';
import { useAuth } from '../../auth/AuthContext';
import './dashboard.css';

export interface PublisherDashboardProps {
  onOpenEditor: (editionId?: string) => void;
  onNewEdition: () => void;
  onOpenTemplates?: () => void;
  onEditProfile?: () => void;
  onBackToLanding?: () => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
}

type StatusFilter = 'all' | 'saved' | 'draft' | 'modified';
type SortOrder = 'updated' | 'title';
type LibraryView = 'cards' | 'table';

interface DashboardCopy {
  editionBadge: string;
  devMock: string;
  homeBtn: string;
  profileBtn: string;
  newEditionBtn: string;
  heroEyebrow: string;
  heroGreeting: (name: string) => string;
  heroSubtext: (date: string) => string;
  templatesBtn: string;
  openStudioBtn: string;
  continueLatestBtn: string;
  latestPanelLabel: string;
  latestPanelEmptyTitle: string;
  latestPanelEmptyHint: string;
  openNowBtn: string;
  statTotalTitle: string;
  statTotalSub: (saved: number, draft: number) => string;
  statFormatTitle: string;
  statFormatSub: string;
  statLanguageTitle: string;
  statLanguageValue: string;
  statLanguageSub: string;
  statStorageTitle: string;
  statStorageValue: string;
  statStorageSub: string;
  libraryTitle: string;
  librarySubtitle: string;
  filters: Record<StatusFilter, string>;
  searchPlaceholder: string;
  sortUpdated: string;
  sortTitle: string;
  viewCardsLabel: string;
  viewTableLabel: string;
  loadingLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
  emptyCta: string;
  filteredEmptyTitle: string;
  filteredEmptySubtitle: string;
  resetFiltersBtn: string;
  colEdition: string;
  colPublication: string;
  colFormat: string;
  colUpdated: string;
  colStatus: string;
  colActions: string;
  storiesLabel: (count: number) => string;
  statusLabels: Record<'saved' | 'draft' | 'modified', string>;
  editBtn: string;
  copyTitle: string;
  deleteTitle: string;
  deleteDialogTitle: string;
  deleteDialogBody: string;
  cancelBtn: string;
  confirmDeleteBtn: string;
  copySuffix: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
}

const EN_DB: DashboardCopy = {
  editionBadge: 'Press Desk',
  devMock: 'Local Mode',
  homeBtn: 'Home',
  profileBtn: 'Profile Setup',
  newEditionBtn: 'New Edition',
  heroEyebrow: 'Publisher Workspace',
  heroGreeting: (name) => `Welcome back, ${name}`,
  heroSubtext: (date) =>
    `${date}. Start a fresh newspaper issue, reopen saved pages, or switch paper sizes.`,
  templatesBtn: 'Paper Formats',
  openStudioBtn: 'Open Blank Studio',
  continueLatestBtn: 'Continue Latest Issue',
  latestPanelLabel: 'Latest Saved Issue',
  latestPanelEmptyTitle: 'No saved issues yet',
  latestPanelEmptyHint: 'Create your first newspaper issue or pick a calibrated broadsheet preset.',
  openNowBtn: 'Open in Studio',
  statTotalTitle: 'Saved Editions',
  statTotalSub: (saved, draft) =>
    `${saved} finalized • ${draft} ${draft === 1 ? 'draft' : 'drafts'}`,
  statFormatTitle: 'Default Page Size',
  statFormatSub: '300 DPI Vector PDF Ready',
  statLanguageTitle: 'Publishing Script',
  statLanguageValue: 'English & Hindi',
  statLanguageSub: '41 Self Hosted Fonts Ready',
  statStorageTitle: 'Browser Storage',
  statStorageValue: 'Offline Safe',
  statStorageSub: 'Instant Autosave Active',
  libraryTitle: 'Saved Editions',
  librarySubtitle: 'Every newspaper edition saved locally inside your browser.',
  filters: {
    all: 'All',
    saved: 'Saved',
    draft: 'Drafts',
    modified: 'Updated',
  },
  searchPlaceholder: 'Search edition name or date',
  sortUpdated: 'Newest first',
  sortTitle: 'Name A to Z',
  viewCardsLabel: 'Card Grid',
  viewTableLabel: 'Compact Table',
  loadingLabel: 'Loading your saved newspaper editions...',
  emptyTitle: 'Your newsroom archive is empty',
  emptySubtitle:
    'Start your first edition to lay out stories, customize headers, and export press ready PDF files.',
  emptyCta: 'Create First Edition',
  filteredEmptyTitle: 'No editions match this filter',
  filteredEmptySubtitle: 'Clear your search text or switch status filters to view all editions.',
  resetFiltersBtn: 'Show All Editions',
  colEdition: 'Edition & Date',
  colPublication: 'Newspaper Name',
  colFormat: 'Format & Stories',
  colUpdated: 'Last Updated',
  colStatus: 'Status',
  colActions: 'Actions',
  storiesLabel: (count) => `${count} ${count === 1 ? 'story' : 'stories'}`,
  statusLabels: {
    saved: 'Saved',
    draft: 'Draft',
    modified: 'Updated',
  },
  editBtn: 'Open',
  copyTitle: 'Duplicate edition',
  deleteTitle: 'Delete edition',
  deleteDialogTitle: 'Delete this edition?',
  deleteDialogBody:
    'This removes the selected newspaper issue permanently from browser storage and cannot be undone.',
  cancelBtn: 'Cancel',
  confirmDeleteBtn: 'Yes, Delete',
  copySuffix: 'Copy',
  menuOpenLabel: 'Open navigation menu',
  menuCloseLabel: 'Close navigation menu',
};

const HI_DB: DashboardCopy = {
  editionBadge: 'संपादक डेस्क',
  devMock: 'लोकल मोड',
  homeBtn: 'मुख्य पेज',
  profileBtn: 'अख़बार सेटिंग्स',
  newEditionBtn: 'नया अंक बनाएँ',
  heroEyebrow: 'अख़बार प्रबंधन केंद्र',
  heroGreeting: (name) => `नमस्ते, ${name}`,
  heroSubtext: (date) =>
    `आज ${date} है। यहीं से नया अख़बार बनाएँ, पुराने अंक खोलें या पेपर साइज बदलें।`,
  templatesBtn: 'तैयार पेपर साइज',
  openStudioBtn: 'सादा स्टूडियो खोलें',
  continueLatestBtn: 'आख़िरी अंक खोलें',
  latestPanelLabel: 'सबसे ताज़ा सेव अंक',
  latestPanelEmptyTitle: 'अभी कोई अंक सेव नहीं है',
  latestPanelEmptyHint: 'अपना पहला अख़बार बनाना शुरू करें या तैयार पेपर साइज चुनें।',
  openNowBtn: 'स्टूडियो में खोलें',
  statTotalTitle: 'कुल सेव अंक',
  statTotalSub: (saved, draft) => `${saved} तैयार • ${draft} ड्राफ़्ट`,
  statFormatTitle: 'मुख्य पेपर साइज',
  statFormatSub: '300 DPI प्रिंट PDF तैयार',
  statLanguageTitle: 'अख़बार भाषा',
  statLanguageValue: 'हिंदी व अंग्रेज़ी',
  statLanguageSub: '41 साफ़ फ़ॉन्ट पहले से तैयार',
  statStorageTitle: 'ब्राउज़र सेव सिस्टम',
  statStorageValue: 'ऑफ़लाइन सुरक्षित',
  statStorageSub: 'काम अपने आप सेव होता है',
  libraryTitle: 'आपके बनाए हुए अंक',
  librarySubtitle: 'आपके ब्राउज़र में सेव सभी अख़बार और ड्राफ़्ट यहाँ दिखेंगे।',
  filters: {
    all: 'सभी',
    saved: 'सेव किए',
    draft: 'ड्राफ़्ट',
    modified: 'बदले गए',
  },
  searchPlaceholder: 'अंक का नाम या तारीख़ खोजें',
  sortUpdated: 'नए पहले',
  sortTitle: 'नाम के अनुसार',
  viewCardsLabel: 'कार्ड व्यू',
  viewTableLabel: 'लिस्ट व्यू',
  loadingLabel: 'आपके सेव किए अंक लोड हो रहे हैं...',
  emptyTitle: 'अभी तक कोई अख़बार सेव नहीं है',
  emptySubtitle:
    'पहला अंक बनाकर ख़बरें सजाएँ, हेडर रंग बदलें और प्रिंट के लिए साफ़ PDF डाउनलोड करें।',
  emptyCta: 'पहला अंक बनाएँ',
  filteredEmptyTitle: 'खोज के हिसाब से कोई अंक नहीं मिला',
  filteredEmptySubtitle: 'खोज हटाएँ या सभी अंक देखने के लिए फ़िल्टर रीसेट करें।',
  resetFiltersBtn: 'सभी अंक दिखाएँ',
  colEdition: 'अंक और तारीख़',
  colPublication: 'अख़बार का नाम',
  colFormat: 'पेपर साइज व ख़बरें',
  colUpdated: 'आख़िरी बदलाव',
  colStatus: 'स्थिति',
  colActions: 'विकल्प',
  storiesLabel: (count) => `${count} ख़बरें`,
  statusLabels: {
    saved: 'सेव है',
    draft: 'ड्राफ़्ट',
    modified: 'अपडेटेड',
  },
  editBtn: 'खोलें',
  copyTitle: 'इसकी दूसरी कॉपी बनाएँ',
  deleteTitle: 'अंक हटाएँ',
  deleteDialogTitle: 'क्या यह अंक हटा दें?',
  deleteDialogBody:
    'यह अख़बार अंक आपके ब्राउज़र से हमेशा के लिए हट जाएगा और बाद में वापस नहीं मिलेगा।',
  cancelBtn: 'रहने दें',
  confirmDeleteBtn: 'हाँ, हटा दें',
  copySuffix: 'कॉपी',
  menuOpenLabel: 'मेनू खोलें',
  menuCloseLabel: 'मेनू बंद करें',
};

/* Geometric SVG Icons matching LandingPage stroke language */
const IconNewspaper: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
    <line x1="15" y1="14" x2="16" y2="14" />
  </svg>
);

const IconPlus: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSearch: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

const IconCopy: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconTrash: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconArrowRight: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconGrid: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconList: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconMenu: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const IconClose: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

function getStatusPillStyle(status: EditionSummary['saveStatus']) {
  if (status === 'saved') {
    return {
      backgroundColor: 'var(--db-success-soft)',
      color: 'var(--db-success)',
      borderColor: '#A7F3D0',
    };
  }
  if (status === 'draft') {
    return {
      backgroundColor: 'var(--db-warn-soft)',
      color: 'var(--db-warn)',
      borderColor: '#FDE68A',
    };
  }
  return {
    backgroundColor: 'var(--db-info-soft)',
    color: 'var(--db-info)',
    borderColor: '#BFDBFE',
  };
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
  const { locale } = useI18n();
  const copy = locale === 'hi' ? HI_DB : EN_DB;
  const { authMode } = useAuth();
  const profile = publisherProfileStorage.getProfile();

  const [editions, setEditions] = useState<EditionSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('updated');
  const [libraryView, setLibraryView] = useState<LibraryView>('cards');
  const [editionToDelete, setEditionToDelete] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (!editionToDelete && !mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditionToDelete(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editionToDelete, mobileMenuOpen]);

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
      await editionStorage.duplicateEdition(id, `${name} (${copy.copySuffix})`);
      await loadEditions();
    } catch (e) {
      console.error('[PublisherDashboard] Failed to duplicate edition:', e);
    }
  };

  const counts = useMemo(() => {
    let saved = 0;
    let draft = 0;
    let modified = 0;
    for (const ed of editions) {
      if (ed.saveStatus === 'saved') saved += 1;
      else if (ed.saveStatus === 'draft') draft += 1;
      else modified += 1;
    }
    return { all: editions.length, saved, draft, modified };
  }, [editions]);

  const filteredEditions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = editions.filter((ed) => {
      const matchesStatus =
        selectedStatusFilter === 'all' || ed.saveStatus === selectedStatusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      return (
        ed.editionName.toLowerCase().includes(query) ||
        ed.publicationName.toLowerCase().includes(query) ||
        ed.editionDate.toLowerCase().includes(query)
      );
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'title') {
        return a.editionName.localeCompare(b.editionName);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [editions, searchQuery, selectedStatusFilter, sortOrder]);

  const latestEdition = editions[0] || null;

  const currentDateFormatted = new Date().toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const newspaperDisplayTitle =
    profile.newspaperTitle || (locale === 'hi' ? 'दैनिक नवप्रभात' : 'The Morning Chronicle');

  const formatLabel = (size: string) => {
    const normalized = size.trim().toLowerCase();
    if (!normalized) return locale === 'hi' ? 'ब्रॉडशीट' : 'Broadsheet';
    if (locale === 'hi') {
      if (normalized === 'broadsheet') return 'ब्रॉडशीट';
      if (normalized === 'tabloid') return 'टैब्लॉयड';
      if (normalized === 'berliner') return 'बर्लिनर';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  return (
    <div className="db-root" data-locale={locale}>
      {/* Floating Frosted Newsroom Header */}
      <div className="db-header-wrap">
        <header className="db-header">
          <div className="db-brand-group">
            <div className="db-brand-mark">
              <IconNewspaper size={18} />
            </div>
            <div className="db-brand-text">
              <div className="db-brand-title-row">
                <span className="db-brand-title">{newspaperDisplayTitle}</span>
                <span className="db-pill db-desktop-only">{copy.editionBadge}</span>
              </div>
              <span
                className="db-desktop-only"
                style={{ fontSize: '12px', color: 'var(--db-ink-muted)' }}
              >
                {profile.publisherName} • {currentDateFormatted}
              </span>
            </div>
          </div>

          <div className="db-header-actions">
            {authMode === 'mock' && (
              <span
                data-testid="dashboard-mock-indicator"
                className="db-pill db-desktop-only"
                style={{
                  backgroundColor: 'var(--db-info-soft)',
                  color: 'var(--db-info)',
                  borderColor: '#BFDBFE',
                }}
              >
                {copy.devMock}
              </span>
            )}

            <div className="db-desktop-only">
              <LanguageSelector
                variant="compact"
                style={{ borderRadius: '10px', overflow: 'hidden' }}
              />
            </div>

            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="db-btn-ghost db-desktop-only"
              >
                {copy.homeBtn}
              </button>
            )}

            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="db-btn-secondary db-desktop-only"
              >
                {copy.profileBtn}
              </button>
            )}

            {onOpenSettings && onSignOut && (
              <ProfileDropdownMenu
                onOpenSettings={onOpenSettings}
                onSignOut={onSignOut}
                variant="light"
              />
            )}

            <button type="button" onClick={onNewEdition} className="db-btn-primary db-desktop-only">
              <IconPlus size={16} />
              <span>{copy.newEditionBtn}</span>
            </button>

            <button
              type="button"
              className="db-mobile-menu-btn"
              aria-label={mobileMenuOpen ? copy.menuCloseLabel : copy.menuOpenLabel}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </header>
      </div>

      {/* Full-Screen Mobile Action Drawer */}
      <div
        className={`db-mobile-drawer${mobileMenuOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="db-brand-mark">
                <IconNewspaper size={18} />
              </span>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>{newspaperDisplayTitle}</span>
            </div>
            <button
              type="button"
              className="db-mobile-menu-btn"
              aria-label={copy.menuCloseLabel}
              onClick={() => setMobileMenuOpen(false)}
            >
              <IconClose />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '32px',
            }}
          >
            {onBackToLanding && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToLanding();
                }}
                className="db-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                {copy.homeBtn}
              </button>
            )}
            {onEditProfile && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEditProfile();
                }}
                className="db-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                {copy.profileBtn}
              </button>
            )}
            {onOpenTemplates && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTemplates();
                }}
                className="db-btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                {copy.templatesBtn}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LanguageSelector />
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onNewEdition();
            }}
            className="db-btn-primary"
            style={{ width: '100%' }}
          >
            <IconPlus />
            <span>{copy.newEditionBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="db-main">
        {/* Hero Command Card + Latest Issue Spotlight */}
        <section className="db-hero-card">
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--db-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {copy.heroEyebrow}
            </span>
            <h1
              style={{
                fontSize: 'clamp(26px, 3vw, 36px)',
                fontWeight: 600,
                color: 'var(--db-ink)',
                margin: '8px 0 12px 0',
                letterSpacing: '-0.02em',
                textWrap: 'balance',
              }}
            >
              {copy.heroGreeting(profile.publisherName)}
            </h1>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--db-ink-secondary)',
                margin: 0,
                maxWidth: '560px',
                textWrap: 'pretty',
              }}
            >
              {copy.heroSubtext(currentDateFormatted)}
            </p>

            <div className="db-hero-actions">
              <button type="button" onClick={onNewEdition} className="db-btn-accent">
                <IconPlus size={16} />
                <span>{copy.newEditionBtn}</span>
              </button>

              {onOpenTemplates && (
                <button type="button" onClick={onOpenTemplates} className="db-btn-secondary">
                  {copy.templatesBtn}
                </button>
              )}

              <button type="button" onClick={() => onOpenEditor()} className="db-btn-secondary">
                {copy.openStudioBtn}
              </button>
            </div>
          </div>

          {/* Latest Issue Quick Resume Panel */}
          <div className="db-latest-panel">
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--db-ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {copy.latestPanelLabel}
            </span>

            {latestEdition ? (
              <>
                <div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--db-ink)',
                      marginBottom: '4px',
                    }}
                  >
                    {latestEdition.editionName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--db-ink-secondary)' }}>
                    {latestEdition.editionDate} • {copy.storiesLabel(latestEdition.articleCount)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginTop: '8px',
                  }}
                >
                  <span className="db-pill" style={getStatusPillStyle(latestEdition.saveStatus)}>
                    {copy.statusLabels[latestEdition.saveStatus]}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenEditor(latestEdition.id)}
                    className="db-btn-primary"
                  >
                    <span>{copy.continueLatestBtn}</span>
                    <IconArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--db-ink)' }}>
                  {copy.latestPanelEmptyTitle}
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'var(--db-ink-secondary)',
                    margin: 0,
                  }}
                >
                  {copy.latestPanelEmptyHint}
                </p>
                <button
                  type="button"
                  onClick={onNewEdition}
                  className="db-btn-primary"
                  style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                >
                  <span>{copy.openNowBtn}</span>
                  <IconArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* 4 Summary Metrics Cards */}
        <section className="db-stats-grid" aria-label="Workspace Summary">
          <div className="db-stat-card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--db-ink-muted)' }}>
              {copy.statTotalTitle}
            </span>
            <span style={{ fontSize: '30px', fontWeight: 600, color: 'var(--db-ink)' }}>
              {editions.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--db-ink-secondary)' }}>
              {copy.statTotalSub(counts.saved, counts.draft)}
            </span>
          </div>

          <div className="db-stat-card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--db-ink-muted)' }}>
              {copy.statFormatTitle}
            </span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--db-ink)' }}>
              {formatLabel(profile.preferredPageSize || 'broadsheet')}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--db-ink-secondary)' }}>
              {copy.statFormatSub}
            </span>
          </div>

          <div className="db-stat-card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--db-ink-muted)' }}>
              {copy.statLanguageTitle}
            </span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--db-ink)' }}>
              {copy.statLanguageValue}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--db-ink-secondary)' }}>
              {copy.statLanguageSub}
            </span>
          </div>

          <div className="db-stat-card">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--db-ink-muted)' }}>
              {copy.statStorageTitle}
            </span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--db-success)' }}>
              {copy.statStorageValue}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--db-ink-secondary)' }}>
              {copy.statStorageSub}
            </span>
          </div>
        </section>

        {/* Saved Editions Library */}
        <section className="db-library-shell">
          <div className="db-library-head">
            <div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  color: 'var(--db-ink)',
                  margin: '0 0 4px 0',
                }}
              >
                {copy.libraryTitle}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--db-ink-secondary)', margin: 0 }}>
                {copy.librarySubtitle}
              </p>
            </div>

            <div className="db-desktop-only" style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                aria-label={copy.viewCardsLabel}
                aria-pressed={libraryView === 'cards'}
                onClick={() => setLibraryView('cards')}
                className="db-icon-action"
                style={{
                  backgroundColor: libraryView === 'cards' ? 'var(--db-ink)' : 'var(--db-surface)',
                  color: libraryView === 'cards' ? '#FFFFFF' : 'var(--db-ink-secondary)',
                  borderColor: libraryView === 'cards' ? 'var(--db-ink)' : 'var(--db-border)',
                }}
              >
                <IconGrid size={16} />
              </button>
              <button
                type="button"
                aria-label={copy.viewTableLabel}
                aria-pressed={libraryView === 'table'}
                onClick={() => setLibraryView('table')}
                className="db-icon-action"
                style={{
                  backgroundColor: libraryView === 'table' ? 'var(--db-ink)' : 'var(--db-surface)',
                  color: libraryView === 'table' ? '#FFFFFF' : 'var(--db-ink-secondary)',
                  borderColor: libraryView === 'table' ? 'var(--db-ink)' : 'var(--db-border)',
                }}
              >
                <IconList size={16} />
              </button>
            </div>
          </div>

          {/* Filters, Search & Sort Toolbar */}
          <div className="db-toolbar-row">
            <div className="db-filter-pills" role="tablist" aria-label="Status Filters">
              {(['all', 'saved', 'draft', 'modified'] as StatusFilter[]).map((statusKey) => {
                const active = selectedStatusFilter === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedStatusFilter(statusKey)}
                    className={`db-filter-btn${active ? ' is-active' : ''}`}
                  >
                    {copy.filters[statusKey]} ({counts[statusKey]})
                  </button>
                );
              })}
            </div>

            <div className="db-search-tools">
              <div className="db-search-box">
                <span style={{ color: 'var(--db-ink-muted)', display: 'inline-flex' }}>
                  <IconSearch size={15} />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  aria-label={copy.searchPlaceholder}
                  className="db-search-input"
                />
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                aria-label="Sort editions"
                className="db-select"
              >
                <option value="updated">{copy.sortUpdated}</option>
                <option value="title">{copy.sortTitle}</option>
              </select>
            </div>
          </div>

          {/* Content State: Loading / Empty / Cards Grid / Compact Table */}
          {isLoading ? (
            <div className="db-empty-state">
              <span style={{ fontSize: '14px', color: 'var(--db-ink-secondary)' }}>
                {copy.loadingLabel}
              </span>
            </div>
          ) : editions.length === 0 ? (
            <div className="db-empty-state">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--db-surface)',
                  border: '1px solid var(--db-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--db-accent)',
                }}
              >
                <IconNewspaper size={26} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--db-ink)' }}>
                {copy.emptyTitle}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'var(--db-ink-secondary)',
                  maxWidth: '460px',
                }}
              >
                {copy.emptySubtitle}
              </p>
              <button type="button" onClick={onNewEdition} className="db-btn-accent">
                <IconPlus size={16} />
                <span>{copy.emptyCta}</span>
              </button>
            </div>
          ) : filteredEditions.length === 0 ? (
            <div className="db-empty-state">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--db-ink)' }}>
                {copy.filteredEmptyTitle}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--db-ink-secondary)' }}>
                {copy.filteredEmptySubtitle}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatusFilter('all');
                  setSearchQuery('');
                }}
                className="db-btn-secondary"
              >
                {copy.resetFiltersBtn}
              </button>
            </div>
          ) : libraryView === 'cards' ? (
            <div className="db-cards-grid">
              {filteredEditions.map((ed) => {
                const pillStyle = getStatusPillStyle(ed.saveStatus);
                return (
                  <article key={ed.id} className="db-edition-card">
                    {/* Miniature Newspaper Wireframe Preview */}
                    <div className="db-edition-thumb">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span className="db-pill" style={pillStyle}>
                          {copy.statusLabels[ed.saveStatus]}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--db-ink-muted)' }}>
                          {formatLabel(ed.pageSize)}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          paddingTop: '8px',
                          borderTop: '2px solid var(--db-ink)',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div
                            style={{
                              height: '10px',
                              borderRadius: '2px',
                              backgroundColor: 'var(--db-ink)',
                              width: '90%',
                            }}
                          />
                          <div
                            style={{
                              height: '5px',
                              borderRadius: '2px',
                              backgroundColor: 'var(--db-border)',
                            }}
                          />
                          <div
                            style={{
                              height: '5px',
                              borderRadius: '2px',
                              backgroundColor: 'var(--db-border)',
                              width: '75%',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            borderRadius: '4px',
                            backgroundColor: 'var(--db-surface-subtle)',
                            border: '1px solid var(--db-border)',
                            height: '32px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Edition Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--db-ink)',
                        }}
                      >
                        {ed.editionName}
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--db-ink-secondary)' }}>
                        {ed.publicationName} • {ed.editionDate}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--db-ink-muted)' }}>
                        {copy.storiesLabel(ed.articleCount)} •{' '}
                        {new Date(ed.updatedAt).toLocaleDateString(
                          locale === 'hi' ? 'hi-IN' : 'en-US'
                        )}
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="db-edition-actions">
                      <button
                        type="button"
                        onClick={() => onOpenEditor(ed.id)}
                        className="db-btn-primary"
                        style={{ flex: 1 }}
                      >
                        <span>{copy.editBtn}</span>
                        <IconArrowRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateEdition(ed.id, ed.editionName)}
                        className="db-icon-action"
                        title={copy.copyTitle}
                        aria-label={copy.copyTitle}
                      >
                        <IconCopy size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditionToDelete(ed.id)}
                        className="db-icon-action is-danger"
                        title={copy.deleteTitle}
                        aria-label={copy.deleteTitle}
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>{copy.colEdition}</th>
                    <th>{copy.colPublication}</th>
                    <th>{copy.colFormat}</th>
                    <th>{copy.colUpdated}</th>
                    <th>{copy.colStatus}</th>
                    <th style={{ textAlign: 'right' }}>{copy.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEditions.map((ed) => {
                    const pillStyle = getStatusPillStyle(ed.saveStatus);
                    return (
                      <tr key={ed.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--db-ink)' }}>
                            {ed.editionName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--db-ink-muted)' }}>
                            {ed.editionDate}
                          </div>
                        </td>
                        <td style={{ color: 'var(--db-ink-secondary)' }}>{ed.publicationName}</td>
                        <td style={{ color: 'var(--db-ink-secondary)' }}>
                          {formatLabel(ed.pageSize)} • {copy.storiesLabel(ed.articleCount)}
                        </td>
                        <td style={{ color: 'var(--db-ink-muted)', fontSize: '12px' }}>
                          {new Date(ed.updatedAt).toLocaleDateString(
                            locale === 'hi' ? 'hi-IN' : 'en-US'
                          )}
                        </td>
                        <td>
                          <span className="db-pill" style={pillStyle}>
                            {copy.statusLabels[ed.saveStatus]}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => onOpenEditor(ed.id)}
                              className="db-btn-primary"
                            >
                              {copy.editBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateEdition(ed.id, ed.editionName)}
                              className="db-icon-action"
                              title={copy.copyTitle}
                              aria-label={copy.copyTitle}
                            >
                              <IconCopy size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditionToDelete(ed.id)}
                              className="db-icon-action is-danger"
                              title={copy.deleteTitle}
                              aria-label={copy.deleteTitle}
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Accessible Delete Confirmation Modal */}
      {editionToDelete && (
        <div
          className="db-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="db-delete-title"
          onClick={() => setEditionToDelete(null)}
        >
          <div className="db-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3
              id="db-delete-title"
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--db-accent)',
              }}
            >
              {copy.deleteDialogTitle}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--db-ink-secondary)',
              }}
            >
              {copy.deleteDialogBody}
            </p>
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}
            >
              <button
                type="button"
                onClick={() => setEditionToDelete(null)}
                className="db-btn-secondary"
              >
                {copy.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEdition(editionToDelete)}
                className="db-btn-accent"
              >
                {copy.confirmDeleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
