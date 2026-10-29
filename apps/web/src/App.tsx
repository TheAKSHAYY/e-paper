import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  NewspaperDocument,
  Article,
  MastheadConfig,
  NewspaperLayoutConfig,
  PageSizePreset,
  PageOrientation,
  NewspaperPresetId,
  NewspaperPage,
  FrameMm,
  NewspaperThemeConfig,
} from '@epaper-studio/document-schema';
import {
  getPublicationPages,
  createNewBlankPage,
  getPageDimensions,
  resolvePageColumnCount,
  NewspaperDocumentSchema,
} from '@epaper-studio/document-schema';
import {
  createNewspaperDocument,
  getNewspaperPreset,
  getPhysicalPageMetrics,
  autoToFree,
  freeToAuto,
  swapFrames,
  findNearestFreeSlot,
} from '@epaper-studio/template-engine';

import { TopBar, type ViewMode } from './components/studio/TopBar';
import { MobileTopBar } from './components/studio/mobile/MobileTopBar';
import { LeftSidebar, type SidebarTab } from './components/studio/LeftSidebar';
import { ContextualInspector } from './components/studio/ContextualInspector';
import { NewspaperCanvas } from './components/studio/NewspaperCanvas';
import { MobileBottomNav, type MobileDrawerMode } from './components/studio/MobileBottomNav';
import { ProjectSetupModal } from './components/studio/ProjectSetupModal';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { MastheadGalleryModal } from './components/studio/MastheadGalleryModal';
import { DraftsManagerModal } from './components/DraftsManagerModal';
import { ThemeModal } from './components/studio/ThemeModal';
import { LandingPage } from './components/landing/LandingPage';
import { draftStorage } from './storage';
import { exportDocumentToPdf } from './utils/pdfExport';
import { createArticleFromPreset } from './utils/presetPlacement';

declare global {
  interface Window {
    __setDocument?: (doc: NewspaperDocument) => void;
    __setScale?: (s: number) => void;
    __setPhysicalCanvas?: (v: boolean) => void;
    __setFreeLayout?: (v: boolean) => void;
  }
}

export const App: React.FC = () => {
  // Main publication state initialized with authentic classic Hindi broadsheet preset or URL param
  const [document, setDocument] = useState<NewspaperDocument>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const presetParam = params.get('preset');
      if (presetParam) {
        return createNewspaperDocument({ presetId: presetParam as NewspaperPresetId });
      }
    }
    return createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
  });

  // Active page & selection state
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isMastheadSelected, setIsMastheadSelected] = useState<boolean>(false);

  // UI state
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('pages');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#editor') {
        return 'split';
      }
      if (window.location.hash === '#landing' || window.location.search.includes('view=landing')) {
        return 'landing';
      }
    }
    return 'landing';
  });
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scaleParam = params.get('scale');
      if (scaleParam) {
        const parsed = parseFloat(scaleParam);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return 0.7;
  });
  // Feature flag for physical canvas coordinates (default ON now that parity tests pass)
  const [usePhysicalCanvasCoordinates, setUsePhysicalCanvasCoordinates] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('physicalCanvas') === 'false' ||
        params.get('usePhysicalCanvasCoordinates') === 'false'
      ) {
        return false;
      }
      if (
        params.get('physicalCanvas') === 'true' ||
        params.get('usePhysicalCanvasCoordinates') === 'true'
      ) {
        return true;
      }
    }
    return true;
  });

  // Feature flag for free placement layout mode (default OFF / false)
  const [useFreeLayout, setUseFreeLayout] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('freeLayout') === 'true' || params.get('useFreeLayout') === 'true') {
        return true;
      }
    }
    return false;
  });

  // Modals for page full and export preflight
  const [showPageFullModal, setShowPageFullModal] = useState<boolean>(false);
  const [preflightWarnings, setPreflightWarnings] = useState<Array<{
    pageIndex: number;
    articleId: string;
    headline: string;
  }> | null>(null);

  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const hasInitializedFit = useRef<boolean>(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('scale')
  );

  // Expose test automation hooks in dev / test mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__setDocument = (doc: NewspaperDocument) => {
        setDocument(doc);
        setCurrentPageIndex(0);
      };
      window.__setScale = (s: number) => setScale(s);
      window.__setPhysicalCanvas = (v: boolean) => setUsePhysicalCanvasCoordinates(v);
      window.__setFreeLayout = (v: boolean) => setUseFreeLayout(v);
    }
  }, []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<{
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback(
    (msg: string, action?: { label: string; onClick: () => void }) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setStatusToast({ message: msg, action });
      toastTimerRef.current = setTimeout(
        () => {
          setStatusToast(null);
        },
        action ? 6000 : 3000
      );
    },
    []
  );

  // Mobile drawer state
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawerMode>('none');
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  // Hash-based routing for landing vs editor
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#landing') {
        setViewMode('landing');
      } else if (window.location.hash === '#editor') {
        setViewMode('split');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      if (mode === 'landing') {
        window.location.hash = '#landing';
      } else {
        window.location.hash = '#editor';
      }
    }
  }, []);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState<boolean>(false);
  const [isMastheadGalleryOpen, setIsMastheadGalleryOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Undo / Redo history state stack
  const [history, setHistory] = useState<NewspaperDocument[]>([document]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isHistoryNavigating = useRef<boolean>(false);
  const historyRef = useRef<NewspaperDocument[]>([document]);
  const historyIndexRef = useRef<number>(0);

  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  useEffect(() => {
    if (isHistoryNavigating.current) {
      isHistoryNavigating.current = false;
      return;
    }
    setHistory((prevHistory) => {
      const currentHead = prevHistory[historyIndex];
      if (currentHead === document) return prevHistory;
      const truncated = prevHistory.slice(0, historyIndex + 1);
      const nextHistory = [...truncated, document].slice(-50);
      const nextIndex = nextHistory.length - 1;
      setHistoryIndex(nextIndex);
      historyRef.current = nextHistory;
      historyIndexRef.current = nextIndex;
      return nextHistory;
    });
  }, [document, historyIndex]);

  const handleUndo = useCallback(() => {
    const curIdx = historyIndexRef.current;
    if (curIdx > 0) {
      isHistoryNavigating.current = true;
      const prevIndex = curIdx - 1;
      const targetDoc = historyRef.current[prevIndex];
      if (targetDoc) {
        historyIndexRef.current = prevIndex;
        setHistoryIndex(prevIndex);
        setDocument(targetDoc);
        showNotification('पूर्ववत किया गया (Undo)');
      }
    }
  }, [showNotification]);

  const handleRedo = useCallback(() => {
    const curIdx = historyIndexRef.current;
    if (curIdx < historyRef.current.length - 1) {
      isHistoryNavigating.current = true;
      const nextIndex = curIdx + 1;
      const targetDoc = historyRef.current[nextIndex];
      if (targetDoc) {
        historyIndexRef.current = nextIndex;
        setHistoryIndex(nextIndex);
        setDocument(targetDoc);
        showNotification('फिर से लागू किया गया (Redo)');
      }
    }
  }, [showNotification]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing inside an input, textarea, or contenteditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleApplyTheme = useCallback(
    (theme: NewspaperThemeConfig) => {
      setDocument((prev) => ({
        ...prev,
        theme,
        layout: {
          ...prev.layout,
          theme,
        },
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
        },
      }));
      setHasUnsavedChanges(true);
      showNotification('थीम सफलतापूर्वक लागू की गई (Theme applied)');
    },
    [showNotification]
  );

  // Responsive window resize tracking
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Resolves the layout canvas base dimensions (physical vs legacy 800px)
  const getCanvasBaseDimensions = useCallback(() => {
    if (usePhysicalCanvasCoordinates) {
      const metrics = getPhysicalPageMetrics(
        document.metadata.pageSize,
        document.metadata.orientation,
        document.layout.spacingDensity,
        document.layout.bodyFontSizePt
      );
      return { widthPx: metrics.widthPx, heightPx: metrics.heightPx };
    }
    const dims = getPageDimensions(document.metadata.pageSize, document.metadata.orientation);
    const aspect = dims.aspectRatio ?? dims.widthPt / dims.heightPt;
    const baseW = document.metadata.orientation === 'landscape' ? 1080 : 800;
    return { widthPx: baseW, heightPx: Math.round(baseW / aspect) };
  }, [
    usePhysicalCanvasCoordinates,
    document.metadata.pageSize,
    document.metadata.orientation,
    document.layout.spacingDensity,
    document.layout.bodyFontSizePt,
  ]);

  // Fit to Width (default on mobile phones so the entire page width is visible)
  const calculateFitWidthScale = useCallback(() => {
    const { widthPx } = getCanvasBaseDimensions();
    let availableW = 1200;
    if (canvasViewportRef.current) {
      const rect = canvasViewportRef.current.getBoundingClientRect();
      availableW = Math.max(200, rect.width - (isMobile ? 16 : 32));
    } else if (typeof window !== 'undefined') {
      availableW = isMobile
        ? window.innerWidth - 16
        : window.innerWidth - (isSidebarOpen ? 280 : 48) - (isInspectorOpen ? 300 : 0) - 32;
    }
    const scaleW = availableW / widthPx;
    return Math.max(0.1, Math.min(3.0, Math.round(scaleW * 100) / 100));
  }, [getCanvasBaseDimensions, isSidebarOpen, isInspectorOpen, isMobile]);

  // Fit to Page (fits both width and height within viewport)
  const calculateFitPageScale = useCallback(() => {
    const { widthPx, heightPx } = getCanvasBaseDimensions();
    let availableW = 1200;
    let availableH = 800;
    if (canvasViewportRef.current) {
      const rect = canvasViewportRef.current.getBoundingClientRect();
      availableW = Math.max(200, rect.width - (isMobile ? 16 : 32));
      availableH = Math.max(200, rect.height - (isMobile ? 80 : 32));
    } else if (typeof window !== 'undefined') {
      availableW = isMobile
        ? window.innerWidth - 16
        : window.innerWidth - (isSidebarOpen ? 280 : 48) - (isInspectorOpen ? 300 : 0) - 32;
      availableH = Math.max(200, window.innerHeight - (isMobile ? 120 : 120));
    }
    const scaleW = availableW / widthPx;
    const scaleH = availableH / heightPx;
    const bestFit = Math.min(scaleW, scaleH);
    return Math.max(0.1, Math.min(3.0, Math.round(bestFit * 100) / 100));
  }, [getCanvasBaseDimensions, isSidebarOpen, isInspectorOpen, isMobile]);

  const handleFitPage = useCallback(() => {
    const fit = calculateFitPageScale();
    setScale(fit);
    showNotification(`पेज फ़िट: ${Math.round(fit * 100)}%`);
  }, [calculateFitPageScale, showNotification]);

  const handleFitWidth = useCallback(() => {
    const fit = calculateFitWidthScale();
    if (isMobile) {
      if (scale <= fit + 0.05) {
        setScale(0.85);
        showNotification('पढ़ने योग्य ज़ूम: 85%');
      } else {
        setScale(fit);
        showNotification(`चौड़ाई फ़िट: ${Math.round(fit * 100)}%`);
      }
    } else {
      setScale(fit);
      showNotification(`चौड़ाई फ़िट: ${Math.round(fit * 100)}%`);
    }
  }, [calculateFitWidthScale, isMobile, scale, showNotification]);

  // Automatically fit on initial mount or when view transitions to studio
  useEffect(() => {
    if (!hasInitializedFit.current && canvasViewportRef.current && viewMode !== 'landing') {
      hasInitializedFit.current = true;
      const initialFit = isMobile ? calculateFitWidthScale() : calculateFitPageScale();
      setScale(initialFit);
    }
  }, [calculateFitWidthScale, calculateFitPageScale, isMobile, viewMode]);

  // Pinch-zoom (touch) & wheel-zoom (Ctrl + Wheel) clamped 25% - 300%
  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setScale((current) => {
          const delta = -e.deltaY * 0.002;
          return Math.max(0.1, Math.min(3.0, Math.round((current + delta) * 100) / 100));
        });
      }
    };

    let touchStartDist = 0;
    let touchStartScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        if (t0 && t1) {
          touchStartDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
          touchStartScale = scale;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault();
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        if (t0 && t1) {
          const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
          const factor = dist / touchStartDist;
          const newScale = Math.max(
            0.1,
            Math.min(3.0, Math.round(touchStartScale * factor * 100) / 100)
          );
          setScale(newScale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartDist = 0;
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale]);

  // Compute pages list from publication
  const pages: NewspaperPage[] = useMemo(() => {
    return getPublicationPages(document);
  }, [document]);

  // Ensure valid active page index
  const safePageIndex = Math.max(0, Math.min(currentPageIndex, pages.length - 1));
  const currentPage: NewspaperPage = pages[safePageIndex] ?? {
    id: 'page-1',
    pageNumber: 1,
    sectionTitle: 'मुख्य पृष्ठ',
    layoutMode: 'auto',
    articles: [],
  };

  // Find currently selected article on current page
  const selectedArticle: Article | null = useMemo(() => {
    if (!selectedArticleId) return null;
    return currentPage.articles.find((a) => a.id === selectedArticleId) ?? null;
  }, [selectedArticleId, currentPage.articles]);

  // Auto-load most recent draft or save initial preset on mount (clean view, no aggressive auto-select)
  useEffect(() => {
    let mounted = true;
    const initializeDrafts = async () => {
      try {
        const drafts = await draftStorage.listDrafts();
        if (drafts.length > 0 && drafts[0]) {
          const latestDoc = await draftStorage.getDraft(drafts[0].id);
          if (latestDoc && mounted) {
            setDocument(latestDoc);
            return;
          }
        }
        // If no drafts exist, create and save initial document
        const initial = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
        await draftStorage.saveDraft(initial);
        if (mounted) {
          setDocument(initial);
        }
      } catch (err) {
        console.warn('Draft initialization error:', err);
      }
    };

    void initializeDrafts();
    return () => {
      mounted = false;
    };
  }, []);

  // Before-unload warning for unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Debounced Autosave (1.5 seconds)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        await draftStorage.saveDraft(document);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.warn('Autosave error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [document, hasUnsavedChanges]);

  // ============================================================================
  // PUBLICATION & PAGE OPERATIONS
  // ============================================================================

  // Rename publication
  const handleRenameTitle = useCallback(
    (newTitle: string) => {
      setDocument((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, title: newTitle, updatedAt: new Date().toISOString() },
        masthead: { ...prev.masthead, title: newTitle },
      }));
      setHasUnsavedChanges(true);
      showNotification(`अख़बार का नाम बदलकर "${newTitle}" किया गया`);
    },
    [showNotification]
  );

  // Select page
  const handleSelectPage = useCallback((pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
    setSelectedArticleId(null);
  }, []);

  // Add new page
  const handleAddPage = useCallback(() => {
    setDocument((prev) => {
      const currentPages = getPublicationPages(prev);
      const newPageNumber = currentPages.length + 1;
      const newPage = createNewBlankPage(newPageNumber, { language: prev.metadata.language });
      const updatedPages = [...currentPages, newPage];

      return {
        ...prev,
        pages: updatedPages,
        metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
      };
    });

    setCurrentPageIndex(pages.length);
    setSelectedArticleId(null);
    setHasUnsavedChanges(true);
    showNotification(`नया पेज ${pages.length + 1} जोड़ा गया`);
  }, [pages.length, showNotification]);

  // Duplicate page
  const handleDuplicatePage = useCallback(
    (pageIndex: number) => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const sourcePage = currentPages[pageIndex];
        if (!sourcePage) return prev;

        const duplicatedArticles: Article[] = sourcePage.articles.map((art) => ({
          ...art,
          id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        }));

        const newPage: NewspaperPage = {
          id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          pageNumber: currentPages.length + 1,
          sectionTitle: `${sourcePage.sectionTitle ?? 'पृष्ठ'} (प्रति)`,
          layoutMode: sourcePage.layoutMode ?? 'auto',
          articles: duplicatedArticles,
          columnCount: sourcePage.columnCount,
        };

        const updatedPages = [...currentPages, newPage];
        return {
          ...prev,
          pages: updatedPages,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setCurrentPageIndex(pages.length);
      setHasUnsavedChanges(true);
      showNotification(`पेज ${pageIndex + 1} की प्रति बनाई गई`);
    },
    [pages.length, showNotification]
  );

  // Delete page with confirmation & undo
  const handleDeletePage = useCallback(
    (pageIndex: number) => {
      if (pages.length <= 1) {
        showNotification('अख़बार में कम से कम एक पेज होना आवश्यक है।');
        return;
      }
      setPageToDelete(pageIndex);
    },
    [pages.length, showNotification]
  );

  const handleExecuteDeletePage = useCallback(
    (pageIndex: number) => {
      setPageToDelete(null);
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const filtered = currentPages.filter((_, idx) => idx !== pageIndex);
        const renumbered = filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

        return {
          ...prev,
          pages: renumbered,
          articles: renumbered[0]?.articles ?? [],
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setCurrentPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 2)));
      setSelectedArticleId(null);
      setHasUnsavedChanges(true);
      showNotification(`पेज ${pageIndex + 1} हटाया गया`, {
        label: 'पूर्ववत करें (Undo)',
        onClick: () => handleUndo(),
      });
    },
    [pages.length, showNotification, handleUndo]
  );

  // Export project as JSON backup
  const handleExportProjectJson = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2));
    const downloadAnchor = window.document.createElement('a');
    const safeTitle = (document.metadata.title || 'samachar-live-24')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${safeTitle}-backup.json`);
    window.document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('प्रोजेक्ट JSON सफलतापूर्वक डाउनलोड किया गया (Project exported)');
  }, [document, showNotification]);

  // Import project from JSON backup
  const handleImportProjectJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const validated = NewspaperDocumentSchema.safeParse(parsed);
          if (!validated.success) {
            showNotification('अमान्य प्रोजेक्ट फ़ाइल: JSON स्कीमा सत्यापन विफल रहा');
            console.error('Validation errors:', validated.error);
            return;
          }
          setDocument(validated.data);
          setCurrentPageIndex(0);
          setSelectedArticleId(null);
          await draftStorage.saveDraft(validated.data);
          showNotification('प्रोजेक्ट बैकअप सफलतापूर्वक लोड किया गया (Project restored)');
        } catch (err) {
          showNotification('प्रोजेक्ट JSON फ़ाइल पढ़ने में त्रुटि');
          console.error('Import error:', err);
        }
      };
      reader.readAsText(file);
    },
    [draftStorage, showNotification]
  );

  // Reorder pages
  const handleMovePage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= pages.length || toIndex >= pages.length)
        return;

      setDocument((prev) => {
        const currentPages = [...getPublicationPages(prev)];
        const [moved] = currentPages.splice(fromIndex, 1);
        if (!moved) return prev;
        currentPages.splice(toIndex, 0, moved);

        const renumbered = currentPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
        return {
          ...prev,
          pages: renumbered,
          articles: renumbered[0]?.articles ?? [],
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setCurrentPageIndex(toIndex);
      setHasUnsavedChanges(true);
    },
    [pages.length]
  );

  // ============================================================================
  // ARTICLE & BLOCK OPERATIONS
  // ============================================================================

  // Add block to current page
  const handleAddBlock = useCallback(
    (blockTemplate: Partial<Article>) => {
      const newId = `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const resolvedColumnCount = resolvePageColumnCount(document, currentPage);
      const newArticle = createArticleFromPreset(blockTemplate, {
        newId,
        defaultColumnCount: resolvedColumnCount,
        orderIndex: currentPage.articles.length,
      });

      // Free placement: find nearest free rectangular module (4mm)
      if (useFreeLayout && currentPage.layoutMode === 'free') {
        const blockW = newArticle.frame?.w ?? 90;
        const blockH = newArticle.frame?.h ?? 60;
        const slotResult = findNearestFreeSlot(currentPage, document, blockW, blockH, 4);

        if (!slotResult.found || !slotResult.slot) {
          setShowPageFullModal(true);
          return;
        }
        newArticle.frame = slotResult.slot;
      }

      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        const updatedPageArticles = [...targetPage.articles, newArticle];
        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? { ...p, articles: updatedPageArticles } : p
        );

        return {
          ...prev,
          pages: updatedPages,
          articles: safePageIndex === 0 ? updatedPageArticles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setSelectedArticleId(newId);
      setHasUnsavedChanges(true);
      showNotification(
        `Added "${newArticle.headline.slice(0, 25)}..." to Page ${safePageIndex + 1}`
      );
    },
    [document, currentPage, useFreeLayout, safePageIndex, showNotification]
  );

  // Update article frame (free placement)
  const handleUpdateArticleFrame = useCallback(
    (articleId: string, frame: FrameMm) => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        const updatedArticles = targetPage.articles.map((a) =>
          a.id === articleId ? { ...a, frame } : a
        );
        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? { ...p, articles: updatedArticles } : p
        );

        return {
          ...prev,
          pages: updatedPages,
          articles: safePageIndex === 0 ? updatedArticles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
    },
    [safePageIndex]
  );

  // Swap articles (works seamlessly in both free placement and auto-grid)
  const handleSwapArticles = useCallback(
    (idA: string, idB: string) => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        if (targetPage.layoutMode === 'free') {
          const swapRes = swapFrames(targetPage, prev, idA, idB);
          if (!swapRes.success) {
            showNotification(swapRes.message ?? 'ब्लॉक की स्थिति आपस में नहीं बदली जा सकी।');
            return prev;
          }

          const updatedPages = currentPages.map((p, idx) =>
            idx === safePageIndex ? swapRes.page : p
          );

          return {
            ...prev,
            pages: updatedPages,
            articles: safePageIndex === 0 ? swapRes.page.articles : prev.articles,
            metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
          };
        } else {
          const idxA = targetPage.articles.findIndex((a) => a.id === idA);
          const idxB = targetPage.articles.findIndex((a) => a.id === idB);
          if (idxA === -1 || idxB === -1) return prev;

          const updatedArticles = [...targetPage.articles];
          const artA = updatedArticles[idxA];
          const artB = updatedArticles[idxB];
          if (!artA || !artB) return prev;
          updatedArticles[idxA] = artB;
          updatedArticles[idxB] = artA;

          const reindexedArticles = updatedArticles.map((art, i) => ({
            ...art,
            orderIndex: i,
          }));

          const updatedPages = currentPages.map((p, idx) =>
            idx === safePageIndex ? { ...p, articles: reindexedArticles } : p
          );

          return {
            ...prev,
            pages: updatedPages,
            articles: safePageIndex === 0 ? reindexedArticles : prev.articles,
            metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
          };
        }
      });
      setHasUnsavedChanges(true);
      showNotification('खबरों का स्थान आपस में बदला गया (Swapped)');
    },
    [safePageIndex, showNotification]
  );

  // Auto-fit layout calculation for page: balances column spans, fills remaining space, and handles overflow
  const handleAutoFitPage = useCallback(
    (targetPageIndex: number = safePageIndex) => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[targetPageIndex];
        if (!targetPage) return prev;

        const columnCount = resolvePageColumnCount({ layout: prev.layout }, targetPage);
        const articles = [...targetPage.articles];
        if (articles.length === 0) return prev;

        const pageSize = prev.metadata.pageSize;
        const orientation = prev.metadata.orientation;
        const wordBudget =
          pageSize === 'broadsheet'
            ? orientation === 'landscape'
              ? 2800
              : 3500
            : pageSize === 'berliner'
              ? 2600
              : pageSize === 'a3'
                ? 2800
                : 1800;
        const maxArticlesPerPage = pageSize === 'broadsheet' ? 8 : 6;

        let accumulatedWords = 0;
        let overflowSplitIndex = articles.length;
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          if (!article) continue;
          const artWords = article.body.trim().split(/\s+/).filter(Boolean).length;
          accumulatedWords += artWords;
          if ((accumulatedWords > wordBudget || i >= maxArticlesPerPage) && i > 0) {
            overflowSplitIndex = i;
            break;
          }
        }

        const fittingArticles = articles.slice(0, overflowSplitIndex);
        const overflowArticles = articles.slice(overflowSplitIndex);

        const packedArticles = fittingArticles.map((art, idx) => {
          let span = art.columnSpan;
          if (idx === 0 && (art.priority === 'lead' || fittingArticles.length <= 2)) {
            span = columnCount;
          } else if (columnCount === 12) {
            if (fittingArticles.length === 2) {
              span = 6;
            } else if (fittingArticles.length === 3) {
              span = idx === 0 ? 12 : 6;
            } else if (fittingArticles.length === 4) {
              span = idx === 0 ? 12 : 4;
            } else {
              span = art.priority === 'lead' ? 12 : art.priority === 'major' ? 6 : 4;
            }
          }
          const isTrailing = idx === fittingArticles.length - 1;
          return {
            ...art,
            columnSpan: Math.min(columnCount, Math.max(1, span)),
            heightMode: 'auto' as const,
            customHeight: undefined,
            fillSpace: isTrailing,
          };
        });

        const updatedPages = [...currentPages];
        updatedPages[targetPageIndex] = {
          ...targetPage,
          layoutMode: 'auto',
          articles: packedArticles,
        };

        if (overflowArticles.length > 0) {
          const nextPageIndex = targetPageIndex + 1;
          const existingNextPage = updatedPages[nextPageIndex];
          if (existingNextPage) {
            updatedPages[nextPageIndex] = {
              ...existingNextPage,
              articles: [...existingNextPage.articles, ...overflowArticles],
            };
          } else {
            const newPage = createNewBlankPage(updatedPages.length + 1, {
              sectionTitle: `पेज ${updatedPages.length + 1}`,
            });
            newPage.articles = overflowArticles;
            updatedPages.push(newPage);
          }
          showNotification(
            `ऑटो-फ़िट: ${overflowArticles.length} अतिरिक्त खबर(ें) अगले पेज पर भेजी गईं`,
            {
              label: 'पूर्ववत करें (Undo)',
              onClick: () => handleUndo(),
            }
          );
        } else {
          showNotification('ऑटो-फ़िट लागू: खबरें ग्रिड में संतुलित की गईं', {
            label: 'पूर्ववत करें (Undo)',
            onClick: () => handleUndo(),
          });
        }

        return {
          ...prev,
          pages: updatedPages,
          articles: targetPageIndex === 0 ? packedArticles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
    },
    [safePageIndex, showNotification]
  );

  // Toggle page layout mode between 'auto' and 'free'
  const handleTogglePageLayoutMode = useCallback(
    (mode: 'auto' | 'free') => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage || targetPage.layoutMode === mode) return prev;

        let updatedPage: NewspaperPage;
        if (mode === 'free') {
          updatedPage = autoToFree(targetPage, prev);
          showNotification('पेज को मुक्त लेआउट (Free Placement) में बदल दिया गया।');
        } else {
          const res = freeToAuto(targetPage, prev);
          updatedPage = res.page;
          if (res.lossyWarnings.length > 0) {
            showNotification(
              `ऑटो ग्रिड में बदला गया (चेतावनी: ${res.lossyWarnings.length} स्थिति स्वतः समायोजित)`
            );
          } else {
            showNotification('पेज को ऑटो-ग्रिड लेआउट में बदल दिया गया।');
          }
        }

        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? updatedPage : p
        );

        return {
          ...prev,
          pages: updatedPages,
          articles: safePageIndex === 0 ? updatedPage.articles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
    },
    [safePageIndex, showNotification]
  );

  // Update article on current page
  const handleUpdateArticle = useCallback(
    (updated: Article) => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        const updatedArticles = targetPage.articles.map((a) => (a.id === updated.id ? updated : a));
        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? { ...p, articles: updatedArticles } : p
        );

        return {
          ...prev,
          pages: updatedPages,
          articles: safePageIndex === 0 ? updatedArticles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
    },
    [safePageIndex]
  );

  // Delete article from current page
  const handleDeleteArticle = useCallback(
    (articleId: string) => {
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        const filtered = targetPage.articles.filter((a) => a.id !== articleId);
        const reindexed = filtered.map((a, idx) => ({ ...a, orderIndex: idx }));
        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? { ...p, articles: reindexed } : p
        );

        return {
          ...prev,
          pages: updatedPages,
          articles: safePageIndex === 0 ? reindexed : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setSelectedArticleId(null);
      setHasUnsavedChanges(true);
      showNotification('Removed article');
    },
    [safePageIndex, showNotification]
  );

  // Move article up
  const handleMoveArticleUp = useCallback(
    (articleId: string) => {
      setDocument((pDoc) => {
        const currentPages = getPublicationPages(pDoc);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return pDoc;

        const articles = [...targetPage.articles];
        const idx = articles.findIndex((a) => a.id === articleId);
        if (idx <= 0) return pDoc;

        // Swap positions in array
        const temp = articles[idx]!;
        articles[idx] = articles[idx - 1]!;
        articles[idx - 1] = temp;

        // Re-index orderIndex
        articles.forEach((a, i) => {
          a.orderIndex = i;
        });

        const updatedPages = currentPages.map((p, pIdx) =>
          pIdx === safePageIndex ? { ...p, articles } : p
        );

        return {
          ...pDoc,
          pages: updatedPages,
          articles: safePageIndex === 0 ? articles : pDoc.articles,
          metadata: { ...pDoc.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
      showNotification('खबर ऊपर स्थानांतरित की गई (Moved up)');
    },
    [safePageIndex, showNotification]
  );

  // Move article down
  const handleMoveArticleDown = useCallback(
    (articleId: string) => {
      setDocument((pDoc) => {
        const currentPages = getPublicationPages(pDoc);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return pDoc;

        const articles = [...targetPage.articles];
        const idx = articles.findIndex((a) => a.id === articleId);
        if (idx < 0 || idx >= articles.length - 1) return pDoc;

        // Swap positions in array
        const temp = articles[idx]!;
        articles[idx] = articles[idx + 1]!;
        articles[idx + 1] = temp;

        // Re-index orderIndex
        articles.forEach((a, i) => {
          a.orderIndex = i;
        });

        const updatedPages = currentPages.map((p, pIdx) =>
          pIdx === safePageIndex ? { ...p, articles } : p
        );

        return {
          ...pDoc,
          pages: updatedPages,
          articles: safePageIndex === 0 ? articles : pDoc.articles,
          metadata: { ...pDoc.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
      showNotification('खबर नीचे स्थानांतरित की गई (Moved down)');
    },
    [safePageIndex, showNotification]
  );

  // Adjust column span
  const handleAdjustColumnSpan = useCallback(
    (articleId: string, delta: number) => {
      const art = currentPage.articles.find((a) => a.id === articleId);
      if (!art) return;

      const maxCols = resolvePageColumnCount(document, currentPage);
      const newSpan = Math.max(1, Math.min(maxCols, art.columnSpan + delta));
      if (newSpan === art.columnSpan) return;

      handleUpdateArticle({ ...art, columnSpan: newSpan });
    },
    [currentPage, document, handleUpdateArticle]
  );

  // Move article to another page
  const handleMoveArticleToPage = useCallback(
    (articleId: string, targetPageIndex: number) => {
      if (
        targetPageIndex === safePageIndex ||
        targetPageIndex < 0 ||
        targetPageIndex >= pages.length
      )
        return;

      const art = currentPage.articles.find((a) => a.id === articleId);
      if (!art) return;

      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const sourcePage = currentPages[safePageIndex];
        const destPage = currentPages[targetPageIndex];
        if (!sourcePage || !destPage) return prev;

        const updatedSourceArticles = sourcePage.articles
          .filter((a) => a.id !== articleId)
          .map((a, i) => ({ ...a, orderIndex: i }));

        const updatedDestArticles = [
          ...destPage.articles,
          { ...art, orderIndex: destPage.articles.length },
        ];

        const updatedPages = currentPages.map((p, idx) => {
          if (idx === safePageIndex) return { ...p, articles: updatedSourceArticles };
          if (idx === targetPageIndex) return { ...p, articles: updatedDestArticles };
          return p;
        });

        return {
          ...prev,
          pages: updatedPages,
          articles: updatedPages[0]?.articles ?? [],
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setSelectedArticleId(null);
      setHasUnsavedChanges(true);
      showNotification(`Moved story to Page ${targetPageIndex + 1}`);
    },
    [safePageIndex, pages.length, currentPage.articles, showNotification]
  );

  // Duplicate article on current page
  const handleDuplicateArticle = useCallback(
    (articleId: string) => {
      const art = currentPage.articles.find((a) => a.id === articleId);
      if (!art) return;

      const newId = `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duplicated: Article = {
        ...art,
        id: newId,
        headline: `${art.headline} (प्रति)`,
        orderIndex: currentPage.articles.length,
      };

      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        const updatedArticles = [...targetPage.articles, duplicated];
        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? { ...p, articles: updatedArticles } : p
        );

        return {
          ...prev,
          pages: updatedPages,
          articles: safePageIndex === 0 ? updatedArticles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setSelectedArticleId(newId);
      setHasUnsavedChanges(true);
      showNotification(`खबर की प्रति बनाई गई`);
    },
    [currentPage.articles, safePageIndex, showNotification]
  );

  // Apply 12-column layout row
  const handleApplyLayoutRow = useCallback(
    (columns: number[]) => {
      // Set grid row layout and add placeholder stories matching columns
      setDocument((prev) => {
        const currentPages = getPublicationPages(prev);
        const targetPage = currentPages[safePageIndex];
        if (!targetPage) return prev;

        const newArticles: Article[] = columns.map((colSpan, cIdx) => ({
          id: `art-col-${Date.now()}-${cIdx}-${Math.random().toString(36).slice(2, 6)}`,
          headline: `कॉलम ${cIdx + 1} समाचार शीर्षक (${colSpan} Cols)`,
          subheadline: 'संक्षिप्त विवरण यहाँ दर्ज करें',
          body: 'इस कॉलम का समाचार विवरण यहाँ लिखा जाएगा। आप दाईं ओर के इंस्पेक्टर से टेक्स्ट और फोटो बदल सकते हैं।',
          byline: 'डेस्क रिपोर्ट',
          dateline: 'नई दिल्ली —',
          imageCaption: '',
          imagePlacement: 'none',
          columnSpan: colSpan,
          priority: colSpan >= 8 ? 'lead' : colSpan >= 4 ? 'major' : 'minor',
          orderIndex: targetPage.articles.length + cIdx,
        }));

        const updatedArticles = [...targetPage.articles, ...newArticles];
        const updatedPages = currentPages.map((p, idx) =>
          idx === safePageIndex ? { ...p, columnCount: 12, articles: updatedArticles } : p
        );

        return {
          ...prev,
          layout: { ...prev.layout, columnCount: 12 },
          pages: updatedPages,
          articles: safePageIndex === 0 ? updatedArticles : prev.articles,
          metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
        };
      });

      setHasUnsavedChanges(true);
      showNotification(`12-कॉलम संयोजन (${columns.join(' + ')}) लागू किया गया`);
    },
    [safePageIndex, showNotification]
  );

  // Select masthead preset from visual gallery
  const handleSelectMastheadPreset = useCallback(
    (presetConfig: Partial<MastheadConfig>) => {
      setDocument((prev) => ({
        ...prev,
        masthead: {
          ...prev.masthead,
          ...presetConfig,
        },
        metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
      }));
      setHasUnsavedChanges(true);
      showNotification('मास्टहेड प्रारूप सफलतापूर्वक लागू किया गया');
    },
    [showNotification]
  );

  // Masthead & Layout updates
  const handleUpdateMasthead = useCallback((masthead: MastheadConfig) => {
    setDocument((prev) => ({
      ...prev,
      masthead,
      metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleUpdateLayout = useCallback((layout: NewspaperLayoutConfig) => {
    setDocument((prev) => ({
      ...prev,
      layout,
      metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handlePageSizeChange = useCallback((pageSize: PageSizePreset) => {
    setDocument((prev) => {
      const dimensions = getPageDimensions(pageSize, prev.metadata.orientation);
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          pageSize,
          dimensions,
          updatedAt: new Date().toISOString(),
        },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleOrientationChange = useCallback((orientation: PageOrientation) => {
    setDocument((prev) => {
      const dimensions = getPageDimensions(prev.metadata.pageSize, orientation);
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          orientation,
          dimensions,
          updatedAt: new Date().toISOString(),
        },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save draft manually
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      await draftStorage.saveDraft(document);
      setHasUnsavedChanges(false);
      showNotification(`"${document.metadata.title}" ड्राफ़्ट सेव हो गया।`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'ड्राफ़्ट सेव नहीं हो सका।');
    } finally {
      setIsSaving(false);
    }
  }, [document, showNotification]);

  // Export PDF with Preflight Overflow Guard (Task 4)
  const handleExportPdf = useCallback(
    async (bypassPreflight = false) => {
      if (!bypassPreflight) {
        // Preflight overflow detection: find any blocks whose content exceeds capacity
        const overflows: Array<{ pageIndex: number; articleId: string; headline: string }> = [];
        pages.forEach((pg, pIdx) => {
          if (pg.layoutMode === 'free') {
            pg.articles.forEach((art) => {
              if (art.frame) {
                const areaMm2 = art.frame.w * art.frame.h;
                const words = art.body.trim().split(/\s+/).filter(Boolean).length;
                // Roughly 1 word takes ~18mm2 in 10pt text
                if (words * 18 > areaMm2 * 1.35) {
                  overflows.push({ pageIndex: pIdx, articleId: art.id, headline: art.headline });
                }
              }
            });
          }
        });

        if (overflows.length > 0) {
          setPreflightWarnings(overflows);
          return;
        }
      }

      setIsExportingPdf(true);
      showNotification('प्रिंट-रेडी PDF तैयार हो रहा है...');
      try {
        const result = await exportDocumentToPdf(document);
        showNotification(
          `✓ डाउनलोड संपन्न: ${result.filename} (${(result.byteLength / 1024).toFixed(1)} KB)`
        );
      } catch (err) {
        console.error('PDF export error:', err);
        showNotification(
          `PDF डाउनलोड विफल: ${err instanceof Error ? err.message : 'अज्ञात त्रुटि'}`
        );
      } finally {
        setIsExportingPdf(false);
      }
    },
    [document, pages, showNotification]
  );

  // Create new newspaper from setup modal
  const handleCreateNewspaper = useCallback(
    async (options: {
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
    }) => {
      const newDoc = createNewspaperDocument({
        title: options.title,
        presetId: options.presetId,
        pageSize: options.pageSize,
        language: options.language,
        direction: options.direction,
        startBlank: options.startBlank,
        pageCount: options.pageCount,
      });

      newDoc.masthead.subtitle = options.subtitle;
      newDoc.masthead.edition = options.edition;
      newDoc.masthead.date = options.date;
      newDoc.metadata.orientation = options.orientation;

      setDocument(newDoc);
      setCurrentPageIndex(0);
      setSelectedArticleId(newDoc.pages?.[0]?.articles[0]?.id ?? null);
      setHasUnsavedChanges(false);
      await draftStorage.saveDraft(newDoc);
      showNotification(
        `Created new newspaper: ${options.title} (${options.pageCount} ${options.pageCount === 1 ? 'page' : 'pages'})`
      );
    },
    [showNotification]
  );

  // Apply preset
  const handleApplyPreset = useCallback(
    (presetId: NewspaperPresetId, replaceArticles: boolean) => {
      const preset = getNewspaperPreset(presetId);
      setDocument((prev) => {
        const next: NewspaperDocument = {
          ...prev,
          masthead: {
            ...prev.masthead,
            title: preset.defaultMasthead.title,
            subtitle: preset.defaultMasthead.subtitle,
            issueNumber: preset.defaultMasthead.issueNumber,
            price: preset.defaultMasthead.price,
            weatherNotice: preset.defaultMasthead.weatherNotice,
          },
          layout: {
            ...prev.layout,
            presetId,
            columnCount: preset.defaultColumns,
            columnRule: preset.columnRule,
            headlineFont: preset.headlineFont,
            bodyFont: preset.bodyFont,
            bodyFontSizePt: preset.bodyFontSizePt,
            spacingDensity: preset.spacingDensity,
          },
          articles: replaceArticles
            ? preset.seedArticles.map((art, i) => ({ ...art, id: `art-${presetId}-${i + 1}` }))
            : prev.articles,
        };
        return next;
      });
      setHasUnsavedChanges(true);
      showNotification(`Applied "${preset.name}" preset.`);
    },
    [showNotification]
  );

  // Load draft
  const handleLoadDraft = useCallback(
    async (id: string) => {
      try {
        const loaded = await draftStorage.getDraft(id);
        if (loaded) {
          setDocument(loaded);
          setCurrentPageIndex(0);
          const loadedPages = getPublicationPages(loaded);
          setSelectedArticleId(loadedPages[0]?.articles[0]?.id ?? null);
          setHasUnsavedChanges(false);
          showNotification(`Loaded draft: ${loaded.metadata.title}`);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load selected draft.');
      }
    },
    [showNotification]
  );

  // Delete draft
  const handleDeleteDraft = useCallback(
    async (id: string) => {
      await draftStorage.deleteDraft(id);
      showNotification('Draft removed.');
      if (id === document.id) {
        const drafts = await draftStorage.listDrafts();
        if (drafts.length > 0 && drafts[0]) {
          await handleLoadDraft(drafts[0].id);
        } else {
          const fresh = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
          setDocument(fresh);
          setCurrentPageIndex(0);
          setSelectedArticleId(fresh.articles[0]?.id ?? null);
          setHasUnsavedChanges(false);
        }
      }
    },
    [document.id, handleLoadDraft, showNotification]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#0f172a',
        overflow: viewMode === 'landing' ? 'auto' : 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* VIEWPORT ROUTING: LANDING PAGE vs STUDIO WORKSPACE */}
      {viewMode === 'landing' ? (
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <LandingPage
            onStartCreating={() => setIsSetupOpen(true)}
            onSelectTemplate={(presetId) => {
              handleApplyPreset(presetId, true);
              handleViewModeChange('split');
            }}
            onOpenStudio={() => handleViewModeChange('split')}
          />
        </div>
      ) : (
        <>
          {/* 1. TOP APPLICATION BAR (Responsive Mobile vs Desktop) */}
          {isMobile ? (
            <MobileTopBar
              documentTitle={document.metadata.title}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onSave={handleSaveDraft}
              onExportPdf={() => handleExportPdf(false)}
              isExportingPdf={isExportingPdf}
              isFullscreen={Boolean(
                typeof window !== 'undefined' && window.document.fullscreenElement
              )}
              onToggleFullscreen={() => {
                if (typeof window !== 'undefined') {
                  if (!window.document.fullscreenElement) {
                    window.document.documentElement.requestFullscreen?.().catch(() => {});
                  } else {
                    window.document.exitFullscreen?.().catch(() => {});
                  }
                }
              }}
              onBack={() => handleViewModeChange('landing')}
              currentPageNumber={safePageIndex + 1}
              totalPages={pages.length}
              onPrevPage={() => {
                if (safePageIndex > 0) handleSelectPage(safePageIndex - 1);
              }}
              onNextPage={() => {
                if (safePageIndex < pages.length - 1) handleSelectPage(safePageIndex + 1);
              }}
              onFitWidth={handleFitWidth}
              onAutoFit={() => handleAutoFitPage(safePageIndex)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onOpenTheme={() => setIsThemeModalOpen(true)}
            />
          ) : (
            <TopBar
              publicationTitle={document.metadata.title}
              onRenameTitle={handleRenameTitle}
              currentPageNumber={safePageIndex + 1}
              totalPages={pages.length}
              onSelectPage={(pageNum) => handleSelectPage(pageNum - 1)}
              pageSize={document.metadata.pageSize}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onSaveDraft={handleSaveDraft}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              scale={scale}
              onScaleChange={setScale}
              onFitPage={handleFitPage}
              onFitWidth={handleFitWidth}
              onAutoFit={() => handleAutoFitPage(safePageIndex)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onOpenTheme={() => setIsThemeModalOpen(true)}
              onExportProjectJson={handleExportProjectJson}
              onImportProjectJson={handleImportProjectJson}
              usePhysicalCanvasCoordinates={usePhysicalCanvasCoordinates}
              onTogglePhysicalCoordinates={() => setUsePhysicalCanvasCoordinates((prev) => !prev)}
              useFreeLayout={useFreeLayout}
              onToggleFreeLayout={() => setUseFreeLayout((prev) => !prev)}
              onNewPublication={() => setIsSetupOpen(true)}
              onOpenTemplates={() => setIsPresetsOpen(true)}
              onOpenMastheadGallery={() => setIsMastheadGalleryOpen(true)}
              onOpenDrafts={() => setIsDraftsOpen(true)}
              onExportPdf={handleExportPdf}
              isExportingPdf={isExportingPdf}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              isInspectorOpen={isInspectorOpen}
              onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
            />
          )}

          {/* Status Notification Toast with Undo Support */}
          {statusToast && (
            <div
              role="status"
              data-testid="status-notification-toast"
              style={{
                position: 'fixed',
                bottom: isMobile ? '70px' : '24px',
                right: '24px',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                padding: '10px 18px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                fontSize: '13px',
                fontWeight: 500,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span>ℹ️</span> <span>{statusToast.message}</span>
              {statusToast.action && (
                <button
                  onClick={() => {
                    statusToast.action?.onClick();
                    setStatusToast(null);
                  }}
                  data-testid="toast-undo-btn"
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {statusToast.action.label}
                </button>
              )}
            </div>
          )}

          {/* 2. MAIN PUBLISHING WORKSPACE */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#e2e8f0',
            }}
          >
            {/* Left Activity Sidebar (Desktop & Tablet) */}
            {!isMobile && isSidebarOpen && viewMode !== 'preview' && (
              <LeftSidebar
                activeTab={activeSidebarTab}
                onTabChange={setActiveSidebarTab}
                pages={pages}
                currentPageIndex={safePageIndex}
                onSelectPage={handleSelectPage}
                onAddPage={handleAddPage}
                onDuplicatePage={handleDuplicatePage}
                onDeletePage={handleDeletePage}
                onMovePage={handleMovePage}
                onMoveArticleToPage={handleMoveArticleToPage}
                onAddBlock={handleAddBlock}
                currentPresetId={document.layout.presetId}
                onSelectPreset={(pId) => handleApplyPreset(pId, false)}
                onCloseSidebar={() => setIsSidebarOpen(false)}
                selectedArticleId={selectedArticleId}
                onSelectArticle={setSelectedArticleId}
                onDuplicateArticle={handleDuplicateArticle}
                onDeleteArticle={handleDeleteArticle}
                onMoveArticleUp={handleMoveArticleUp}
                onMoveArticleDown={handleMoveArticleDown}
                onApplyLayoutRow={handleApplyLayoutRow}
              />
            )}

            {/* Collapsed Left Icon Rail (Desktop & Tablet) */}
            {!isMobile && !isSidebarOpen && viewMode !== 'preview' && (
              <div
                style={{
                  width: '48px',
                  backgroundColor: '#ffffff',
                  borderRight: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '10px',
                  gap: '8px',
                  flexShrink: 0,
                  zIndex: 30,
                }}
              >
                <button
                  onClick={() => {
                    setActiveSidebarTab('pages');
                    setIsSidebarOpen(true);
                  }}
                  title="पेज सूची (Pages)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    padding: '6px 4px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '15px', lineHeight: 1 }}>▤</span>
                  <span style={{ fontSize: '9px', fontWeight: 600 }}>पेज</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSidebarTab('blocks');
                    setIsSidebarOpen(true);
                  }}
                  title="तत्व सूची (Elements)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    padding: '6px 4px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '15px', lineHeight: 1 }}>✚</span>
                  <span style={{ fontSize: '9px', fontWeight: 600 }}>तत्व</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSidebarTab('templates');
                    setIsSidebarOpen(true);
                  }}
                  title="प्रारूप (Presets)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    padding: '6px 4px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '15px', lineHeight: 1 }}>❖</span>
                  <span style={{ fontSize: '9px', fontWeight: 600 }}>प्रारूप</span>
                </button>
              </div>
            )}

            {/* Center Canvas Area with Ref for Smart Auto-Fit */}
            <div
              ref={canvasViewportRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                backgroundColor: '#cbd5e1',
                paddingTop: isMobile ? '12px' : '24px',
                paddingLeft: isMobile ? '8px' : '16px',
                paddingRight: isMobile ? '8px' : '16px',
                paddingBottom: isMobile ? '70px' : '76px',
                position: 'relative',
                touchAction: 'pan-x pan-y pinch-zoom',
                WebkitOverflowScrolling: 'touch',
              }}
              onClick={(e) => {
                // Deselect article if clicking directly on background
                if (e.target === e.currentTarget) {
                  setSelectedArticleId(null);
                  setIsMastheadSelected(false);
                }
              }}
            >
              <NewspaperCanvas
                page={currentPage}
                pageIndex={safePageIndex}
                totalPages={pages.length}
                masthead={document.masthead}
                layout={document.layout}
                pageSize={document.metadata.pageSize}
                orientation={document.metadata.orientation}
                scale={scale}
                usePhysicalCanvasCoordinates={usePhysicalCanvasCoordinates}
                useFreeLayout={useFreeLayout}
                doc={document}
                selectedArticleId={selectedArticleId}
                onSelectArticle={(id) => {
                  setSelectedArticleId(id);
                  setIsMastheadSelected(false);
                  if (isMobile) {
                    setMobileDrawer('inspector');
                  } else {
                    setIsInspectorOpen(true);
                  }
                }}
                isMastheadSelected={isMastheadSelected && safePageIndex === 0}
                onSelectMasthead={() => {
                  setIsMastheadSelected(true);
                  setSelectedArticleId(null);
                  if (isMobile) {
                    setMobileDrawer('inspector');
                  } else {
                    setIsInspectorOpen(true);
                  }
                }}
                onMoveArticleUp={handleMoveArticleUp}
                onMoveArticleDown={handleMoveArticleDown}
                onAdjustColumnSpan={handleAdjustColumnSpan}
                onAddBlock={handleAddBlock}
                onAddPage={handleAddPage}
                onUpdateArticleFrame={handleUpdateArticleFrame}
                onSwapArticles={handleSwapArticles}
                onMoveArticleToPage={handleMoveArticleToPage}
                onTogglePageLayoutMode={handleTogglePageLayoutMode}
              />
            </div>

            {/* Right Contextual Inspector (Desktop) */}
            {!isMobile && !isTablet && isInspectorOpen && viewMode !== 'preview' && (
              <ContextualInspector
                selectedArticle={selectedArticle}
                currentPage={currentPage}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onMoveArticleUp={handleMoveArticleUp}
                onMoveArticleDown={handleMoveArticleDown}
                onMoveArticleToPage={handleMoveArticleToPage}
                totalPages={pages.length}
                currentPageIndex={safePageIndex}
                masthead={document.masthead}
                onUpdateMasthead={handleUpdateMasthead}
                layout={document.layout}
                onUpdateLayout={handleUpdateLayout}
                pageSize={document.metadata.pageSize}
                onPageSizeChange={handlePageSizeChange}
                orientation={document.metadata.orientation}
                onOrientationChange={handleOrientationChange}
                onDeselect={() => {
                  setSelectedArticleId(null);
                  setIsMastheadSelected(false);
                }}
                onCloseInspector={() => setIsInspectorOpen(false)}
                isMastheadSelected={isMastheadSelected && safePageIndex === 0}
                onSelectMasthead={() => {
                  setIsMastheadSelected(true);
                  setSelectedArticleId(null);
                }}
                onCloseMasthead={() => setIsMastheadSelected(false)}
              />
            )}
          </div>

          {/* 3. MOBILE TOUCH BOTTOM BAR & DRAWER SHEETS */}
          {isMobile && (
            <>
              <MobileBottomNav
                activeDrawer={mobileDrawer}
                onSelectDrawer={setMobileDrawer}
                currentPageNumber={safePageIndex + 1}
                totalPages={pages.length}
                hasSelectedArticle={Boolean(selectedArticle)}
                onExportPdf={handleExportPdf}
                isExportingPdf={isExportingPdf}
              />

              {/* Mobile Slide-Up Drawer */}
              {mobileDrawer !== 'none' && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 95,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                  onClick={() => setMobileDrawer('none')}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                      maxHeight: '80vh',
                      marginBottom: '52px',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Fixed Top Header with Title and Close Button */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                        {mobileDrawer === 'pages'
                          ? `अख़बार के पेज (${pages.length})`
                          : mobileDrawer === 'blocks'
                            ? `तत्व व ब्लॉक जोड़ें (पेज ${safePageIndex + 1})`
                            : mobileDrawer === 'presets'
                              ? 'प्रारूप व टेम्पलेट्स (Presets)'
                              : selectedArticle
                                ? `खबर संपादक: ${selectedArticle.headline || 'अनाम खबर'}`
                                : isMastheadSelected
                                  ? 'मास्टहेड व पेज सेटिंग्स'
                                  : `पेज ${safePageIndex + 1} सेटिंग्स`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileDrawer('none')}
                        aria-label="बंद करें (Close)"
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '18px',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Scrollable Content Container */}
                    <div
                      style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        width: '100%',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {mobileDrawer === 'pages' && (
                        <LeftSidebar
                          activeTab="pages"
                          onTabChange={(tab) => {
                            if (tab === 'pages') setMobileDrawer('pages');
                            else if (tab === 'blocks') setMobileDrawer('blocks');
                            else if (tab === 'templates') setMobileDrawer('presets');
                          }}
                          pages={pages}
                          currentPageIndex={safePageIndex}
                          onSelectPage={(idx) => {
                            handleSelectPage(idx);
                            setMobileDrawer('none');
                          }}
                          onAddPage={handleAddPage}
                          onDuplicatePage={handleDuplicatePage}
                          onDeletePage={handleDeletePage}
                          onMovePage={handleMovePage}
                          onMoveArticleToPage={handleMoveArticleToPage}
                          onAddBlock={(tmpl) => {
                            handleAddBlock(tmpl);
                            setMobileDrawer('none');
                          }}
                          currentPresetId={document.layout.presetId}
                          onSelectPreset={(pId) => {
                            handleApplyPreset(pId, false);
                            setMobileDrawer('none');
                          }}
                          isMobile={true}
                          hideTabs={true}
                          width="100%"
                        />
                      )}

                      {mobileDrawer === 'blocks' && (
                        <LeftSidebar
                          activeTab="blocks"
                          onTabChange={(tab) => {
                            if (tab === 'pages') setMobileDrawer('pages');
                            else if (tab === 'blocks') setMobileDrawer('blocks');
                            else if (tab === 'templates') setMobileDrawer('presets');
                          }}
                          pages={pages}
                          currentPageIndex={safePageIndex}
                          onSelectPage={() => {}}
                          onAddPage={() => {}}
                          onDuplicatePage={() => {}}
                          onDeletePage={() => {}}
                          onMovePage={() => {}}
                          onAddBlock={(tmpl) => {
                            handleAddBlock(tmpl);
                            setMobileDrawer('none');
                          }}
                          currentPresetId={document.layout.presetId}
                          onSelectPreset={() => {}}
                          isMobile={true}
                          hideTabs={true}
                          width="100%"
                        />
                      )}

                      {mobileDrawer === 'presets' && (
                        <LeftSidebar
                          activeTab="templates"
                          onTabChange={(tab) => {
                            if (tab === 'pages') setMobileDrawer('pages');
                            else if (tab === 'blocks') setMobileDrawer('blocks');
                            else if (tab === 'templates') setMobileDrawer('presets');
                          }}
                          pages={pages}
                          currentPageIndex={safePageIndex}
                          onSelectPage={() => {}}
                          onAddPage={() => {}}
                          onDuplicatePage={() => {}}
                          onDeletePage={() => {}}
                          onMovePage={() => {}}
                          onAddBlock={() => {}}
                          currentPresetId={document.layout.presetId}
                          onSelectPreset={(pId) => {
                            handleApplyPreset(pId, false);
                            setMobileDrawer('none');
                          }}
                          onApplyLayoutRow={(cols) => {
                            handleApplyLayoutRow(cols);
                            setMobileDrawer('none');
                          }}
                          isMobile={true}
                          hideTabs={true}
                          width="100%"
                        />
                      )}

                      {mobileDrawer === 'inspector' && (
                        <ContextualInspector
                          selectedArticle={selectedArticle}
                          currentPage={currentPage}
                          onUpdateArticle={handleUpdateArticle}
                          onDeleteArticle={(id) => {
                            handleDeleteArticle(id);
                            setMobileDrawer('none');
                          }}
                          onMoveArticleUp={handleMoveArticleUp}
                          onMoveArticleDown={handleMoveArticleDown}
                          onMoveArticleToPage={handleMoveArticleToPage}
                          totalPages={pages.length}
                          currentPageIndex={safePageIndex}
                          masthead={document.masthead}
                          onUpdateMasthead={handleUpdateMasthead}
                          layout={document.layout}
                          onUpdateLayout={handleUpdateLayout}
                          pageSize={document.metadata.pageSize}
                          onPageSizeChange={handlePageSizeChange}
                          orientation={document.metadata.orientation}
                          onOrientationChange={handleOrientationChange}
                          onDeselect={() => {
                            setSelectedArticleId(null);
                            setIsMastheadSelected(false);
                            setMobileDrawer('none');
                          }}
                          isMastheadSelected={isMastheadSelected && safePageIndex === 0}
                          onSelectMasthead={() => {
                            setIsMastheadSelected(true);
                            setSelectedArticleId(null);
                          }}
                          onCloseMasthead={() => setIsMastheadSelected(false)}
                          isMobile={true}
                          width="100%"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 4. MODALS */}
      <ProjectSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onCreate={(options) => {
          handleCreateNewspaper(options);
          handleViewModeChange('split');
        }}
        onLoadDraft={(id) => {
          handleLoadDraft(id);
          setIsSetupOpen(false);
          handleViewModeChange('split');
        }}
        onSelectPresetDirect={(presetId) => {
          handleApplyPreset(presetId, true);
          setIsSetupOpen(false);
          handleViewModeChange('split');
        }}
      />

      <PresetSelectorModal
        isOpen={isPresetsOpen}
        currentPresetId={document.layout.presetId}
        onClose={() => setIsPresetsOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      <MastheadGalleryModal
        isOpen={isMastheadGalleryOpen}
        currentConfig={document.masthead}
        onClose={() => setIsMastheadGalleryOpen(false)}
        onApplyPreset={handleSelectMastheadPreset}
      />

      <DraftsManagerModal
        isOpen={isDraftsOpen}
        activeDraftId={document.id}
        onClose={() => setIsDraftsOpen(false)}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onNewDraft={() => {
          setIsDraftsOpen(false);
          setIsSetupOpen(true);
        }}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        theme={document.layout.theme}
        onUpdateTheme={handleApplyTheme}
      />

      {/* Page Deletion Confirmation Dialog */}
      {pageToDelete !== null && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="delete-page-confirm-dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={() => setPageToDelete(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '16px',
                fontWeight: 700,
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ⚠️ पेज हटाएं (Confirm Page Deletion)
            </h3>
            <p
              style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}
            >
              क्या आप वाकई पृष्ठ {pageToDelete + 1} हटाना चाहते हैं? इस पृष्ठ की सभी सामग्री व लेआउट
              हटा दिए जाएंगे।
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                data-testid="cancel-delete-page-btn"
                onClick={() => setPageToDelete(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                data-testid="confirm-delete-page-btn"
                onClick={() => handleExecuteDeletePage(pageToDelete)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#ffffff',
                }}
              >
                पेज हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PAGE FULL ALERT MODAL (TASK 3) */}
      {showPageFullModal && (
        <div
          data-testid="page-full-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄⚠️</div>
            <h3
              style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#111827' }}
            >
              Page bhar gaya - naya page jodein?
            </h3>
            <p
              style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}
            >
              इस पृष्ठ पर और नया ब्लॉक जोड़ने के लिए पर्याप्त खाली जगह नहीं बची है। क्या आप अगला
              पृष्ठ जोड़ना चाहते हैं?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowPageFullModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                रद्द करें
              </button>
              <button
                onClick={() => {
                  setShowPageFullModal(false);
                  handleAddPage();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#b91c1c',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + नया पेज जोड़ें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PREFLIGHT OVERFLOW WARNING MODAL (TASK 4) */}
      {preflightWarnings && (
        <div
          data-testid="preflight-overflow-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
            >
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#991b1b' }}>
                एक्सपोर्ट प्रीफ़्लाइट: टेक्स्ट कटने की चेतावनी (Text Overflow)
              </h3>
            </div>
            <p
              style={{
                margin: '0 0 14px 0',
                fontSize: '12.5px',
                color: '#4b5563',
                lineHeight: 1.4,
              }}
            >
              निम्नलिखित समाचार ब्लॉकों में पाठ्य सामग्री उनके निर्धारित फ़्रेम से अधिक है और प्रिंट
              में कट सकती है:
            </p>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '18px',
              }}
            >
              {preflightWarnings.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ marginRight: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b' }}>
                      पृष्ठ {item.pageIndex + 1}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1f2937', fontWeight: 500 }}>
                      {item.headline || 'समाचार ब्लॉक'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPageIndex(item.pageIndex);
                      setSelectedArticleId(item.articleId);
                      setPreflightWarnings(null);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ब्लॉक पर जाएं →
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setPreflightWarnings(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                संपादित करने के लिए वापस जाएं
              </button>
              <button
                onClick={() => {
                  setPreflightWarnings(null);
                  handleExportPdf(true);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#b91c1c',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                फिर भी PDF डाउनलोड करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
