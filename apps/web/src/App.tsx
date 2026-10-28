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
} from '@epaper-studio/document-schema';
import {
  getPublicationPages,
  createNewBlankPage,
  getPageDimensions,
  resolvePageColumnCount,
} from '@epaper-studio/document-schema';
import {
  createNewspaperDocument,
  getNewspaperPreset,
  getPhysicalPageMetrics,
} from '@epaper-studio/template-engine';

import { TopBar, type ViewMode } from './components/studio/TopBar';
import { LeftSidebar, type SidebarTab } from './components/studio/LeftSidebar';
import { ContextualInspector } from './components/studio/ContextualInspector';
import { NewspaperCanvas } from './components/studio/NewspaperCanvas';
import { MobileBottomNav, type MobileDrawerMode } from './components/studio/MobileBottomNav';
import { ProjectSetupModal } from './components/studio/ProjectSetupModal';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { MastheadGalleryModal } from './components/studio/MastheadGalleryModal';
import { DraftsManagerModal } from './components/DraftsManagerModal';
import { LandingPage } from './components/landing/LandingPage';
import { draftStorage } from './storage';
import { exportDocumentToPdf } from './utils/pdfExport';
import { createArticleFromPreset } from './utils/presetPlacement';

export const App: React.FC = () => {
  // Main publication state initialized with authentic classic Hindi broadsheet preset
  const [document, setDocument] = useState<NewspaperDocument>(() =>
    createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' })
  );

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
  const [scale, setScale] = useState<number>(0.7);
  // Feature flag for physical canvas coordinates (default OFF until parity tests pass, then ON)
  const [usePhysicalCanvasCoordinates, setUsePhysicalCanvasCoordinates] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('physicalCanvas') === 'true' ||
        params.get('usePhysicalCanvasCoordinates') === 'true'
      ) {
        return true;
      }
      if (
        params.get('physicalCanvas') === 'false' ||
        params.get('usePhysicalCanvasCoordinates') === 'false'
      ) {
        return false;
      }
    }
    return false;
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const hasInitializedFit = useRef<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((cur) => (cur === msg ? null : cur));
    }, 3000);
  }, []);

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
      availableW = Math.max(260, rect.width - 32);
    } else if (typeof window !== 'undefined') {
      availableW = window.innerWidth - (isSidebarOpen ? 280 : 48) - (isInspectorOpen ? 300 : 0) - 32;
    }
    const scaleW = availableW / widthPx;
    return Math.max(0.25, Math.min(3.0, Math.round(scaleW * 100) / 100));
  }, [getCanvasBaseDimensions, isSidebarOpen, isInspectorOpen]);

  // Fit to Page (fits both width and height within viewport)
  const calculateFitPageScale = useCallback(() => {
    const { widthPx, heightPx } = getCanvasBaseDimensions();
    let availableW = 1200;
    let availableH = 800;
    if (canvasViewportRef.current) {
      const rect = canvasViewportRef.current.getBoundingClientRect();
      availableW = Math.max(260, rect.width - 32);
      availableH = Math.max(260, rect.height - 32);
    } else if (typeof window !== 'undefined') {
      availableW = window.innerWidth - (isSidebarOpen ? 280 : 48) - (isInspectorOpen ? 300 : 0) - 32;
      availableH = Math.max(300, window.innerHeight - 120);
    }
    const scaleW = availableW / widthPx;
    const scaleH = availableH / heightPx;
    const bestFit = Math.min(scaleW, scaleH);
    return Math.max(0.25, Math.min(3.0, Math.round(bestFit * 100) / 100));
  }, [getCanvasBaseDimensions, isSidebarOpen, isInspectorOpen]);

  const handleFitPage = useCallback(() => {
    const fit = calculateFitPageScale();
    setScale(fit);
    showNotification(`पेज फ़िट: ${Math.round(fit * 100)}%`);
  }, [calculateFitPageScale, showNotification]);

  const handleFitWidth = useCallback(() => {
    const fit = calculateFitWidthScale();
    setScale(fit);
    showNotification(`चौड़ाई फ़िट: ${Math.round(fit * 100)}%`);
  }, [calculateFitWidthScale, showNotification]);

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
          return Math.max(0.25, Math.min(3.0, Math.round((current + delta) * 100) / 100));
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
            0.25,
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

  // Delete page
  const handleDeletePage = useCallback(
    (pageIndex: number) => {
      if (pages.length <= 1) {
        alert('अख़बार में कम से कम एक पेज होना आवश्यक है।');
        return;
      }

      if (
        !window.confirm(
          `क्या आप पेज ${pageIndex + 1} हटाना चाहते हैं? इस पेज की सभी खबरें हट जाएँगी।`
        )
      ) {
        return;
      }

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
      showNotification(`पेज ${pageIndex + 1} हटाया गया`);
    },
    [pages.length, showNotification]
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
    [document.layout.columnCount, currentPage.articles.length, safePageIndex, showNotification]
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
      const idx = currentPage.articles.findIndex((a) => a.id === articleId);
      if (idx <= 0) return;

      const sorted = [...currentPage.articles].sort((a, b) => a.orderIndex - b.orderIndex);
      const curr = sorted[idx];
      const prev = sorted[idx - 1];
      if (!curr || !prev) return;

      curr.orderIndex = idx - 1;
      prev.orderIndex = idx;

      setDocument((pDoc) => {
        const currentPages = getPublicationPages(pDoc);
        const updatedPages = currentPages.map((p, pIdx) =>
          pIdx === safePageIndex ? { ...p, articles: [...sorted] } : p
        );

        return {
          ...pDoc,
          pages: updatedPages,
          articles: safePageIndex === 0 ? sorted : pDoc.articles,
          metadata: { ...pDoc.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
    },
    [currentPage.articles, safePageIndex]
  );

  // Move article down
  const handleMoveArticleDown = useCallback(
    (articleId: string) => {
      const idx = currentPage.articles.findIndex((a) => a.id === articleId);
      if (idx < 0 || idx >= currentPage.articles.length - 1) return;

      const sorted = [...currentPage.articles].sort((a, b) => a.orderIndex - b.orderIndex);
      const curr = sorted[idx];
      const next = sorted[idx + 1];
      if (!curr || !next) return;

      curr.orderIndex = idx + 1;
      next.orderIndex = idx;

      setDocument((pDoc) => {
        const currentPages = getPublicationPages(pDoc);
        const updatedPages = currentPages.map((p, pIdx) =>
          pIdx === safePageIndex ? { ...p, articles: [...sorted] } : p
        );

        return {
          ...pDoc,
          pages: updatedPages,
          articles: safePageIndex === 0 ? sorted : pDoc.articles,
          metadata: { ...pDoc.metadata, updatedAt: new Date().toISOString() },
        };
      });
      setHasUnsavedChanges(true);
    },
    [currentPage.articles, safePageIndex]
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

  // Export PDF
  const handleExportPdf = useCallback(async () => {
    setIsExportingPdf(true);
    showNotification('प्रिंट-रेडी PDF तैयार हो रहा है...');
    try {
      const result = await exportDocumentToPdf(document);
      showNotification(
        `✓ डाउनलोड संपन्न: ${result.filename} (${(result.byteLength / 1024).toFixed(1)} KB)`
      );
    } catch (err) {
      console.error('PDF export error:', err);
      showNotification(`PDF डाउनलोड विफल: ${err instanceof Error ? err.message : 'अज्ञात त्रुटि'}`);
    } finally {
      setIsExportingPdf(false);
    }
  }, [document, showNotification]);

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
          {/* 1. TOP APPLICATION BAR */}
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
            usePhysicalCanvasCoordinates={usePhysicalCanvasCoordinates}
            onTogglePhysicalCoordinates={() => setUsePhysicalCanvasCoordinates((prev) => !prev)}
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

          {/* Status Notification Toast */}
          {statusMessage && (
            <div
              role="status"
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
                gap: '8px',
              }}
            >
              <span>ℹ️</span> {statusMessage}
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
                paddingTop: '24px',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingBottom: isMobile ? '80px' : '76px',
                position: 'relative',
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
                    zIndex: 90,
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
                      maxHeight: '75vh',
                      overflowY: 'auto',
                      padding: '16px',
                      boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {mobileDrawer === 'pages'
                          ? 'Pages Manager'
                          : mobileDrawer === 'blocks'
                            ? 'Add Newspaper Block'
                            : selectedArticle
                              ? 'Edit Article'
                              : 'Page Layout & Settings'}
                      </span>
                      <button
                        onClick={() => setMobileDrawer('none')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '16px',
                          color: '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {mobileDrawer === 'pages' && (
                      <LeftSidebar
                        activeTab="pages"
                        onTabChange={() => {}}
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
                        onAddBlock={handleAddBlock}
                        currentPresetId={document.layout.presetId}
                        onSelectPreset={() => {}}
                      />
                    )}

                    {mobileDrawer === 'blocks' && (
                      <LeftSidebar
                        activeTab="blocks"
                        onTabChange={() => {}}
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
                      />
                    )}

                    {mobileDrawer === 'inspector' && (
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
                        isMastheadSelected={isMastheadSelected && safePageIndex === 0}
                        onSelectMasthead={() => {
                          setIsMastheadSelected(true);
                          setSelectedArticleId(null);
                        }}
                        onCloseMasthead={() => setIsMastheadSelected(false)}
                      />
                    )}
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
    </div>
  );
};
