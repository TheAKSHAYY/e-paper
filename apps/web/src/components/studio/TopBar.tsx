import React, { useState, useRef, useEffect } from 'react';
import type { PageSizePreset } from '@epaper-studio/document-schema';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';

export type ViewMode = 'landing' | 'dashboard' | 'split' | 'preview';

export interface TopBarProps {
  publicationTitle: string;
  onRenameTitle: (newTitle: string) => void;
  currentPageNumber: number;
  totalPages: number;
  onSelectPage: (pageNumber: number) => void;
  pageSize: PageSizePreset;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSaveDraft: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onFitPage?: () => void;
  onFitWidth?: () => void;
  usePhysicalCanvasCoordinates?: boolean;
  onTogglePhysicalCoordinates?: () => void;
  useFreeLayout?: boolean;
  onToggleFreeLayout?: () => void;
  onNewPublication: () => void;
  onOpenTemplates: () => void;
  onOpenPageSetup?: () => void;
  onOpenMastheadDesigner?: () => void;
  onOpenMastheadGallery?: () => void;
  onOpenDrafts: () => void;
  onOpenPublishing?: () => void;
  preflightStatus?: {
    overallStatus: 'green' | 'yellow' | 'red';
    blockerCount: number;
    warningCount: number;
  } | null;
  onOpenPreflight?: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onPrintPdf?: () => void;
  isPrintingPdf?: boolean;
  onAutoFit?: () => void;
  onAutoAllocateOverflow?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenTheme?: () => void;
  onExportProjectJson?: () => void;
  onImportProjectJson?: (file: File) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onToggleInspector?: () => void;
  isInspectorOpen?: boolean;
  isPageFull?: boolean;
  editorMode?: 'simple' | 'pro';
  onToggleEditorMode?: () => void;
  onOpenTemplateGallery?: () => void;
  onOpenDesignLibrary?: () => void;
  onClearPage?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  publicationTitle,
  onRenameTitle,
  currentPageNumber,
  totalPages,
  onSelectPage,
  pageSize,
  hasUnsavedChanges,
  isSaving,
  onSaveDraft,
  onViewModeChange,
  scale,
  onScaleChange,
  onFitPage,
  onFitWidth,
  usePhysicalCanvasCoordinates = false,
  onTogglePhysicalCoordinates,
  useFreeLayout = false,
  onToggleFreeLayout,
  onNewPublication,
  onOpenTemplates,
  onOpenPageSetup,
  onOpenMastheadDesigner,
  onOpenPublishing,
  preflightStatus,
  onOpenPreflight,
  onExportPdf,
  isExportingPdf,
  onPrintPdf,
  isPrintingPdf = false,
  onAutoFit,
  onAutoAllocateOverflow,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenTheme,
  onExportProjectJson,
  onImportProjectJson,
  onToggleSidebar,
  isSidebarOpen = true,
  onToggleInspector,
  isInspectorOpen = true,
  isPageFull = false,
  editorMode = 'simple',
  onToggleEditorMode,
  onOpenTemplateGallery,
  onOpenDesignLibrary,
  onClearPage,
}) => {
  const { t, locale } = useI18n();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const fonts = PUBLISHER_DESIGN_SYSTEM.fonts;

  const [isRenaming, setIsRenaming] = useState(false);
  const [editedTitle, setEditedTitle] = useState(publicationTitle);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(publicationTitle);
  }, [publicationTitle]);

  useEffect(() => {
    if (!isToolsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsToolsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolsOpen]);

  const handleFinishRename = () => {
    setIsRenaming(false);
    if (editedTitle.trim() && editedTitle !== publicationTitle) {
      onRenameTitle(editedTitle.trim());
    } else {
      setEditedTitle(publicationTitle);
    }
  };

  const roundedScale = Math.round(scale * 100) / 100;
  const standardScales = [0.25, 0.35, 0.5, 0.65, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

  /* ─── shared menu-item style ─────────────────────────────── */
  const menuItemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    fontSize: '11.5px',
    color: '#FAF8F5',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  };

  return (
    <header
      data-testid="desktop-top-bar"
      style={{
        backgroundColor: colors.inkBlack,
        color: '#FAF8F5',
        borderBottom: `1px solid #2B2825`,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: 50,
        position: 'relative',
        overflow: 'visible',
        flexShrink: 0,
      }}
    >
      {/* ════════════════════════════════════════════════════════
       * ROW 1 — Brand | Sidebar | Title | Save Status | Lang | Panel
       * ════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          height: '44px',
          borderBottom: '1px solid #2B2825',
          gap: '8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {/* ── LEFT: Sidebar toggle + Brand + Dashboard + Title + Save ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={
                isSidebarOpen
                  ? locale === 'en' ? 'Hide sidebar' : 'साइडबार छिपाएं'
                  : locale === 'en' ? 'Show sidebar' : 'साइडबार दिखाएं'
              }
              aria-label="Toggle sidebar"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#A8A29E',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {isSidebarOpen ? '◀' : '☰'}
            </button>
          )}

          {/* Brand Crest */}
          <div
            onClick={() => onViewModeChange('landing')}
            title={locale === 'en' ? 'Return to Home' : 'मुख्य पृष्ठ पर लौटें'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: colors.pressRed,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '13px',
                fontFamily: fonts.hindiEditorial,
                borderRadius: '3px',
              }}
            >
              प
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: `${fonts.display}, ${fonts.hindiEditorial}`,
              }}
            >
              E-Paper Studio
            </span>
          </div>

          {/* Dashboard Shortcut */}
          <button
            onClick={() => onViewModeChange('dashboard')}
            title={locale === 'en' ? 'Go to Publisher Dashboard' : 'प्रकाशक डैशबोर्ड पर जाएं'}
            style={{
              background: '#262422',
              border: '1px solid #3D3835',
              borderRadius: '3px',
              color: '#E6E0D5',
              padding: '3px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <span>🏠</span>
            <span>{t.common.dashboard}</span>
          </button>

          <div style={{ height: '14px', width: '1px', backgroundColor: '#3D3835', flexShrink: 0 }} />

          {/* Editable Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
            {isRenaming ? (
              <input
                type="text"
                value={editedTitle}
                autoFocus
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename();
                  if (e.key === 'Escape') {
                    setEditedTitle(publicationTitle);
                    setIsRenaming(false);
                  }
                }}
                style={{
                  backgroundColor: '#262422',
                  color: '#ffffff',
                  border: `1px solid ${colors.pressRed}`,
                  borderRadius: '2px',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontFamily: fonts.hindiEditorial,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            ) : (
              <span
                onClick={() => setIsRenaming(true)}
                title={locale === 'en' ? 'Click to rename publication' : 'नाम बदलने के लिए क्लिक करें'}
                style={{
                  fontSize: '12.5px',
                  color: '#E6E0D5',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: fonts.hindiEditorial,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                  whiteSpace: 'nowrap',
                }}
              >
                {publicationTitle}
              </span>
            )}

            {/* Save Status Badge */}
            {hasUnsavedChanges ? (
              <button
                onClick={onSaveDraft}
                disabled={isSaving}
                data-testid="autosave-status-badge"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  color: '#F59E0B',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>●</span>
                <span>
                  {isSaving
                    ? locale === 'en' ? 'Saving...' : 'सहेजा जा रहा है...'
                    : locale === 'en' ? 'Unsaved' : 'अनसेव्ड'}
                </span>
              </button>
            ) : (
              <span
                data-testid="autosave-status-badge"
                title={locale === 'en' ? 'All changes saved locally' : 'सभी बदलाव स्वतः सहेजे गए हैं'}
                style={{
                  fontSize: '11px',
                  color: '#34D399',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>✓</span>
                <span>{locale === 'en' ? 'Saved' : 'स्वतः सहेजा गया'}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── RIGHT of Row 1: Mode | Preflight | PDF Download | Language | Panel ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Editor Mode Toggle */}
          {onToggleEditorMode && (
            <button
              onClick={onToggleEditorMode}
              data-testid="topbar-btn-editor-mode"
              title={
                editorMode === 'simple'
                  ? 'पेशेवर संपादक पर जाएं (Switch to Pro Mode)'
                  : 'सरल मोड पर जाएं (Simple Mode)'
              }
              style={{
                backgroundColor: editorMode === 'simple' ? '#14532D' : '#1e293b',
                color: '#ffffff',
                border: editorMode === 'simple' ? '1px solid #22c55e' : '1px solid #475569',
                borderRadius: '16px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <span>{editorMode === 'simple' ? '✨ सरल मोड' : '⚙️ पेशेवर मोड'}</span>
            </button>
          )}

          {/* Preflight Status */}
          {onOpenPreflight && (
            <button
              data-testid="btn-preflight-status"
              onClick={onOpenPreflight}
              title={locale === 'en' ? 'Preflight validation report' : 'प्रीफ़्लाइट जांच रिपोर्ट'}
              style={{
                backgroundColor:
                  preflightStatus?.overallStatus === 'green'
                    ? '#143522'
                    : preflightStatus?.overallStatus === 'yellow'
                      ? '#3B280A'
                      : preflightStatus?.overallStatus === 'red'
                        ? '#3D1414'
                        : '#262422',
                color:
                  preflightStatus?.overallStatus === 'green'
                    ? '#86EFAC'
                    : preflightStatus?.overallStatus === 'yellow'
                      ? '#FDE047'
                      : preflightStatus?.overallStatus === 'red'
                        ? '#FCA5A5'
                        : '#E6E0D5',
                border: `1px solid ${
                  preflightStatus?.overallStatus === 'green'
                    ? '#166534'
                    : preflightStatus?.overallStatus === 'yellow'
                      ? '#854D0E'
                      : preflightStatus?.overallStatus === 'red'
                        ? '#991B1B'
                        : '#3D3835'
                }`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <span>
                {preflightStatus?.overallStatus === 'green'
                  ? '🟢'
                  : preflightStatus?.overallStatus === 'yellow'
                    ? '🟡'
                    : preflightStatus?.overallStatus === 'red'
                      ? '🔴'
                      : '🛡️'}
              </span>
              <span>
                {preflightStatus?.overallStatus === 'green'
                  ? locale === 'en' ? 'Preflight OK' : 'प्रीफ़्लाइट'
                  : preflightStatus?.overallStatus === 'yellow'
                    ? `⚠ ${preflightStatus.warningCount}`
                    : preflightStatus?.overallStatus === 'red'
                      ? `✖ ${preflightStatus.blockerCount}`
                      : locale === 'en' ? 'Preflight' : 'प्रीफ़्लाइट'}
              </span>
            </button>
          )}

          {/* Primary CTA: PDF Download */}
          <button
            data-testid="btn-export-pdf"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            title={locale === 'en' ? 'Download print-ready vector PDF' : 'प्रेस-रेडी वेक्टर PDF डाउनलोड करें'}
            style={{
              backgroundColor: isExportingPdf ? '#991B1B' : colors.pressRed || '#DC2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 12px',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: isExportingPdf ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
            }}
          >
            <span style={{ fontSize: '12px' }}>{isExportingPdf ? '⏳' : '📥'}</span>
            <span>
              {isExportingPdf
                ? locale === 'en' ? 'Exporting...' : 'डाउनलोड...'
                : locale === 'en' ? 'PDF Download' : 'PDF डाउनलोड'}
            </span>
          </button>

          <LanguageSelector variant="pill" />

          {onToggleInspector && (
            <button
              onClick={onToggleInspector}
              title={
                isInspectorOpen
                  ? locale === 'en' ? 'Hide inspector panel' : 'पैनल छिपाएं'
                  : locale === 'en' ? 'Show inspector panel' : 'पैनल दिखाएं'
              }
              style={{
                backgroundColor: isInspectorOpen ? '#36322E' : 'transparent',
                border: '1px solid',
                borderColor: isInspectorOpen ? colors.pressRed || '#DC2626' : '#3D3835',
                color: isInspectorOpen ? '#FAF8F5' : '#A8A29E',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <span>⚙</span>
              <span>{locale === 'en' ? 'Panel' : 'पैनल'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
       * ROW 2 — Undo/Redo | Pages | Zoom | Mode | Masthead | PageSetup | Templates | 278 | Preflight | PDF | Tools▼
       * ════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          height: '40px',
          gap: '6px',
          whiteSpace: 'nowrap',
          overflowX: 'visible',
          overflowY: 'visible',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* ── Undo / Redo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title={`${t.common.undo} (Ctrl+Z)`}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: canUndo ? '#FAF8F5' : '#57534E',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              padding: '4px 6px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '4px',
            }}
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title={`${t.common.redo} (Ctrl+Y)`}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: canRedo ? '#FAF8F5' : '#57534E',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              padding: '4px 6px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '4px',
            }}
          >
            ↷
          </button>
        </div>

        <div style={{ height: '16px', width: '1px', backgroundColor: '#3D3835', flexShrink: 0 }} />

        {/* ── Page Navigation ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#262422',
            border: '1px solid #3D3835',
            borderRadius: '4px',
            padding: '2px 6px',
            flexShrink: 0,
          }}
        >
          <button
            disabled={currentPageNumber <= 1}
            onClick={() => onSelectPage(currentPageNumber - 1)}
            title={locale === 'en' ? 'Previous page' : 'पिछला पेज'}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentPageNumber <= 1 ? '#57534E' : '#E6E0D5',
              cursor: currentPageNumber <= 1 ? 'not-allowed' : 'pointer',
              padding: '2px 4px',
              fontSize: '12px',
            }}
          >
            ◀
          </button>
          <span
            style={{
              fontSize: '11.5px',
              color: '#FAF8F5',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{currentPageNumber} / {totalPages}</span>
            {isPageFull && (
              <span
                title={locale === 'en' ? 'Page is full!' : 'पेज भर चुका है!'}
                style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                FULL
              </span>
            )}
          </span>
          <button
            disabled={currentPageNumber >= totalPages}
            onClick={() => onSelectPage(currentPageNumber + 1)}
            title={locale === 'en' ? 'Next page' : 'अगला पेज'}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentPageNumber >= totalPages ? '#57534E' : '#E6E0D5',
              cursor: currentPageNumber >= totalPages ? 'not-allowed' : 'pointer',
              padding: '2px 4px',
              fontSize: '12px',
            }}
          >
            ▶
          </button>
          <span
            style={{
              fontSize: '10px',
              color: '#A8A29E',
              textTransform: 'uppercase',
              fontWeight: 700,
              backgroundColor: '#1C1917',
              padding: '2px 5px',
              borderRadius: '2px',
              marginLeft: '4px',
            }}
          >
            {pageSize}
          </span>
        </div>

        {onClearPage && (
          <button
            type="button"
            data-testid="topbar-btn-clear-page"
            onClick={onClearPage}
            title={locale === 'en' ? 'Clear all stories & blocks from this page' : 'इस पेज के सभी समाचार व ब्लॉक हटाकर खाली करें'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#262422',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#450a0a';
              e.currentTarget.style.color = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#262422';
              e.currentTarget.style.color = '#f87171';
            }}
          >
            <span style={{ fontSize: '11px' }}>🗑️</span>
            <span>{locale === 'en' ? 'Clear Page' : 'पेज खाली करें'}</span>
          </button>
        )}

        <div style={{ height: '16px', width: '1px', backgroundColor: '#3D3835', flexShrink: 0 }} />

        {/* ── Zoom Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
          <button
            onClick={() => onScaleChange(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
            title={t.common.zoomOut}
            style={{
              backgroundColor: '#1C1917',
              border: '1px solid #3D3835',
              color: '#E6E0D5',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 700,
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            −
          </button>
          <select
            value={roundedScale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            style={{
              backgroundColor: '#1C1917',
              color: '#FAF8F5',
              border: '1px solid #3D3835',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 4px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '72px',
            }}
          >
            {!standardScales.includes(roundedScale) && (
              <option value={roundedScale}>
                {Math.round(scale * 100)}% ({locale === 'en' ? 'Fit' : 'फ़िट'})
              </option>
            )}
            {standardScales.map((val) => (
              <option key={val} value={val}>
                {Math.round(val * 100)}%
              </option>
            ))}
          </select>
          <button
            onClick={() => onScaleChange(Math.min(3.0, Math.round((scale + 0.1) * 100) / 100))}
            title={t.common.zoomIn}
            style={{
              backgroundColor: '#1C1917',
              border: '1px solid #3D3835',
              color: '#E6E0D5',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 700,
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            +
          </button>
          {onFitPage && (
            <button
              onClick={onFitPage}
              title={t.common.zoomFit}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #3D3835',
                color: '#A8A29E',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '3px 7px',
                cursor: 'pointer',
              }}
            >
              {locale === 'en' ? 'Fit' : 'फ़िट'}
            </button>
          )}
          {onFitWidth && (
            <button
              onClick={onFitWidth}
              title={locale === 'en' ? 'Fit width' : 'चौड़ाई फिट'}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #3D3835',
                color: '#A8A29E',
                borderRadius: '4px',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '3px 7px',
                cursor: 'pointer',
              }}
            >
              ↔
            </button>
          )}
        </div>

        {/* ── RIGHT cluster of Row 2: Design Library | Templates | Masthead | Page Setup | Tools ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
          {/* ── 278 DESIGN LIBRARY ── */}
          {onOpenDesignLibrary && (
            <button
              onClick={onOpenDesignLibrary}
              data-testid="topbar-btn-design-library"
              title="278 संदर्भ डिज़ाइनों का संपादन-योग्य संग्रह"
              style={{
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(30, 58, 138, 0.4)',
              }}
            >
              <span>🎨</span>
              <span>278 डिज़ाइन</span>
            </button>
          )}

          {/* ── TEMPLATE GALLERY ── */}
          {onOpenTemplateGallery && (
            <button
              onClick={onOpenTemplateGallery}
              data-testid="topbar-btn-template-gallery"
              title={locale === 'en' ? 'Open Template Library' : 'रेडीमेड टेम्पलेट चुनें'}
              style={{
                backgroundColor: '#262422',
                color: '#E6E0D5',
                border: '1px solid #3D3835',
                borderRadius: '4px',
                padding: '4px 9px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              <span>📰</span>
              <span>{locale === 'en' ? 'Templates' : 'टेम्पलेट'}</span>
            </button>
          )}

          {/* ── MASTHEAD DESIGNER ── */}
          {onOpenMastheadDesigner && (
            <button
              onClick={onOpenMastheadDesigner}
              data-testid="topbar-btn-masthead-designer"
              title={locale === 'en' ? 'Masthead & Header Designer' : 'मास्टहेड डिज़ाइनर'}
              style={{
                backgroundColor: '#262422',
                color: '#E6E0D5',
                border: '1px solid #3D3835',
                borderRadius: '4px',
                padding: '4px 9px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              <span>🗞️</span>
              <span>{locale === 'en' ? 'Masthead' : 'मास्टहेड'}</span>
            </button>
          )}

          {/* ── PAGE SETUP ── */}
          {onOpenPageSetup && (
            <button
              onClick={onOpenPageSetup}
              data-testid="topbar-btn-pagesetup"
              title={locale === 'en' ? 'Page & Paper Setup' : 'कागज़ आकार'}
              style={{
                backgroundColor: '#262422',
                color: '#E6E0D5',
                border: '1px solid #3D3835',
                borderRadius: '4px',
                padding: '4px 9px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              <span>📐</span>
              <span>{locale === 'en' ? 'Page Setup' : 'पेज सेटअप'}</span>
            </button>
          )}

          {/* ── TOOLS DROPDOWN ── */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={toolsMenuRef}>
          <button
            onClick={() => setIsToolsOpen((prev) => !prev)}
            aria-expanded={isToolsOpen}
            aria-haspopup="true"
            title={locale === 'en' ? 'Presets, layout, theme, backup & print tools' : 'प्रारूप, विन्यास, थीम, बैकअप एवं प्रिंट टूल्स'}
            style={{
              backgroundColor: isToolsOpen ? '#36322E' : '#262422',
              color: isToolsOpen ? '#FAF8F5' : '#E6E0D5',
              border: isToolsOpen ? `1px solid ${colors.pressRed}` : '1px solid #3D3835',
              borderRadius: '4px',
              padding: '5px 9px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🛠️</span>
            <span>{locale === 'en' ? 'Tools' : 'टूल्स'}</span>
            <span style={{ fontSize: '8px', marginLeft: '2px', opacity: 0.7 }}>
              {isToolsOpen ? '▲' : '▼'}
            </span>
          </button>

          {isToolsOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: '#181615',
                border: '1px solid #3D3835',
                borderRadius: '6px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.15)',
                minWidth: '220px',
                padding: '6px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {/* Newspaper Presets */}
              <button
                onClick={() => { onOpenTemplates(); setIsToolsOpen(false); }}
                data-testid="topbar-btn-presets"
                style={menuItemBase}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '13px' }}>📑</span>
                <span style={{ flex: 1, fontWeight: 600 }}>
                  {locale === 'en' ? 'Newspaper Presets' : 'टेम्पलेट प्रारूप'}
                </span>
              </button>

              {onOpenPageSetup && (
                <button
                  onClick={() => { onOpenPageSetup(); setIsToolsOpen(false); }}
                  data-testid="topbar-tools-pagesetup"
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📐</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Page Setup' : 'कागज़ आकार'}
                  </span>
                </button>
              )}

              {onOpenMastheadDesigner && (
                <button
                  onClick={() => { onOpenMastheadDesigner(); setIsToolsOpen(false); }}
                  data-testid="topbar-tools-masthead"
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🗞️</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Masthead Designer' : 'मास्टहेड डिज़ाइनर'}
                  </span>
                </button>
              )}

              {onAutoFit && (
                <button
                  onClick={() => { onAutoFit(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: '#38BDF8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>⚡</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Balance Columns' : 'कॉलम संतुलन'}
                  </span>
                </button>
              )}

              {onAutoAllocateOverflow && (
                <button
                  data-testid="btn-auto-overflow"
                  onClick={() => { onAutoAllocateOverflow(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: '#FCA5A5' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📄+</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Auto-allocate Overflow' : 'ऑटो-फ्लो पृष्ठ'}
                  </span>
                </button>
              )}

              {onClearPage && (
                <button
                  data-testid="btn-tools-clear-page"
                  onClick={() => { onClearPage(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: '#F87171' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#450a0a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🗑️</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Clear Page Canvas' : 'पूरा पेज खाली करें'}
                  </span>
                </button>
              )}

              {onOpenTheme && (
                <button
                  onClick={() => { onOpenTheme(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: '#D8B4FE' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🎨</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Theme & Colors' : 'थीम व रंग'}
                  </span>
                </button>
              )}

              {onToggleFreeLayout && (
                <button
                  data-testid="toggle-free-layout-button"
                  onClick={() => { onToggleFreeLayout(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: useFreeLayout ? '#D8B4FE' : '#A8A29E' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🔲</span>
                  <span style={{ flex: 1 }}>
                    {useFreeLayout
                      ? locale === 'en' ? 'Layout: Free Mode ✓' : 'लेआउट: मुक्त विन्यास ✓'
                      : locale === 'en' ? 'Layout: Auto Grid' : 'लेआउट: ऑटो ग्रिड'}
                  </span>
                </button>
              )}

              {onFitWidth && (
                <button
                  onClick={() => { onFitWidth(); setIsToolsOpen(false); }}
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>↔️</span>
                  <span style={{ flex: 1 }}>
                    {locale === 'en' ? 'Fit Page Width' : 'चौड़ाई फ़िट करें'}
                  </span>
                </button>
              )}

              {onTogglePhysicalCoordinates && (
                <button
                  onClick={() => { onTogglePhysicalCoordinates(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: usePhysicalCanvasCoordinates ? '#86EFAC' : '#FAF8F5' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📐</span>
                  <span style={{ flex: 1 }}>
                    {usePhysicalCanvasCoordinates
                      ? locale === 'en' ? 'Canvas: 1:1 mm (WYSIWYG) ✓' : 'कैनवस: 1:1 mm ✓'
                      : locale === 'en' ? 'Canvas: 800px Mode' : 'कैनवस: 800px'}
                  </span>
                </button>
              )}

              {onPrintPdf && (
                <button
                  data-testid="btn-print-pdf"
                  onClick={() => { onPrintPdf(); setIsToolsOpen(false); }}
                  disabled={isPrintingPdf}
                  style={{ ...menuItemBase, cursor: isPrintingPdf ? 'wait' : 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🖨️</span>
                  <span style={{ flex: 1 }}>
                    {locale === 'en' ? 'Browser Print' : 'ब्राउज़र प्रिंट'}
                  </span>
                </button>
              )}

              {onOpenPublishing && (
                <button
                  data-testid="btn-publishing-studio"
                  onClick={() => { onOpenPublishing(); setIsToolsOpen(false); }}
                  style={{ ...menuItemBase, color: '#38BDF8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📰</span>
                  <span style={{ flex: 1 }}>
                    {locale === 'en' ? 'Publishing Studio' : 'प्रकाशन स्टूडियो'}
                  </span>
                </button>
              )}

              <div style={{ height: '1px', backgroundColor: '#2B2825', margin: '4px 0' }} />

              {onExportProjectJson && (
                <button
                  onClick={() => { onExportProjectJson(); setIsToolsOpen(false); }}
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📁</span>
                  <span style={{ flex: 1 }}>
                    {locale === 'en' ? 'Export Project JSON' : 'प्रोजेक्ट JSON बैकअप'}
                  </span>
                </button>
              )}

              {onImportProjectJson && (
                <button
                  onClick={() => { jsonInputRef.current?.click(); setIsToolsOpen(false); }}
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📂</span>
                  <span style={{ flex: 1 }}>
                    {locale === 'en' ? 'Import Project JSON' : 'प्रोजेक्ट JSON इम्पोर्ट'}
                  </span>
                </button>
              )}

              <div style={{ height: '1px', backgroundColor: '#2B2825', margin: '4px 0' }} />

              <button
                onClick={() => { onNewPublication(); setIsToolsOpen(false); }}
                style={menuItemBase}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '13px' }}>✚</span>
                <span style={{ flex: 1 }}>+ {t.common.create}</span>
              </button>

              <button
                onClick={() => { onViewModeChange('landing'); setIsToolsOpen(false); }}
                style={{ ...menuItemBase, color: '#A8A29E' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '13px' }}>←</span>
                <span style={{ flex: 1 }}>
                  {locale === 'en' ? 'Exit to Home' : 'मुख्य पृष्ठ पर लौटें'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Hidden File Input for JSON Backup Import */}
        {onImportProjectJson && (
          <input
            type="file"
            ref={jsonInputRef}
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                onImportProjectJson(f);
                e.target.value = '';
              }
            }}
          />
        )}
      </div>
    </header>
  );
};
