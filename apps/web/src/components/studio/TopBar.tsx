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

  return (
    <header
      style={{
        backgroundColor: colors.inkBlack,
        color: '#FAF8F5',
        height: '50px',
        borderBottom: `1px solid #2B2825`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        boxSizing: 'border-box',
        gap: '8px',
        userSelect: 'none',
        zIndex: 50,
        position: 'relative',
        overflow: 'visible',
        whiteSpace: 'nowrap',
      }}
    >
      {/* ========================================================
       * LEFT: Brand, Sidebar Toggle, Document Title & Save Status
       * ======================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '180px',
          flexShrink: 0,
        }}
      >
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={
              isSidebarOpen
                ? locale === 'en'
                  ? 'Hide sidebar'
                  : 'साइडबार छिपाएं'
                : locale === 'en'
                  ? 'Show sidebar'
                  : 'साइडबार दिखाएं'
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

        {/* Dashboard Shortcut Button */}
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
          }}
        >
          <span>🏠</span>
          <span className="hidden sm:inline">{t.common.dashboard}</span>
        </button>

        <div style={{ height: '14px', width: '1px', backgroundColor: '#3D3835', flexShrink: 0 }} />

        {/* Editable Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
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
              title={
                locale === 'en' ? 'Click to rename publication' : 'नाम बदलने के लिए क्लिक करें'
              }
              style={{
                fontSize: '12.5px',
                color: '#E6E0D5',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: fonts.hindiEditorial,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '180px',
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
                  ? locale === 'en'
                    ? 'Saving...'
                    : 'सहेजा जा रहा है...'
                  : locale === 'en'
                    ? 'Unsaved'
                    : 'अनसेव्ड'}
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

      {/* ========================================================
       * CENTER: Page Switcher, Paper Standard & Zoom
       * ======================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#262422',
          border: '1px solid #3D3835',
          padding: '2px 8px',
          borderRadius: '3px',
          flexShrink: 0,
        }}
      >
        {/* Undo / Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title={`${t.common.undo} (Ctrl+Z)`}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: canUndo ? '#FAF8F5' : '#57534E',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              padding: '2px 4px',
              fontSize: '13px',
              fontWeight: 700,
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
              padding: '2px 4px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            ↷
          </button>
        </div>

        <div style={{ height: '12px', width: '1px', backgroundColor: '#3D3835' }} />

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
            fontSize: '11px',
          }}
        >
          ◀
        </button>

        <span
          style={{
            fontSize: '11.5px',
            color: '#FAF8F5',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>
            {currentPageNumber} / {totalPages}
          </span>
          {isPageFull && (
            <span
              title={
                locale === 'en'
                  ? 'Page is full! Add a new page for additional content.'
                  : 'पेज भर चुका है! नई सामग्री के लिए नया पेज जोड़ें।'
              }
              style={{
                fontSize: '9.5px',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                letterSpacing: '0.4px',
                lineHeight: 1.2,
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
            fontSize: '11px',
          }}
        >
          ▶
        </button>

        <div style={{ height: '12px', width: '1px', backgroundColor: '#3D3835' }} />

        <span
          style={{
            fontSize: '10px',
            color: '#A8A29E',
            textTransform: 'uppercase',
            fontWeight: 700,
            backgroundColor: '#1C1917',
            padding: '2px 5px',
            borderRadius: '2px',
          }}
        >
          {pageSize}
        </span>

        <div style={{ height: '12px', width: '1px', backgroundColor: '#3D3835' }} />

        {/* Inline Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={() => onScaleChange(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
            title={t.common.zoomOut}
            style={{
              backgroundColor: '#1C1917',
              border: '1px solid #3D3835',
              color: '#E6E0D5',
              borderRadius: '2px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '1px 6px',
              cursor: 'pointer',
              lineHeight: 1.2,
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
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 4px',
              cursor: 'pointer',
              outline: 'none',
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
              borderRadius: '2px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '1px 6px',
              cursor: 'pointer',
              lineHeight: 1.2,
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
                borderRadius: '2px',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '2px 5px',
                cursor: 'pointer',
                marginLeft: '2px',
              }}
            >
              {locale === 'en' ? 'Fit' : 'पेज'}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
       * RIGHT: MODE TOGGLE, TEMPLATE GALLERY, HERO PDF BUTTON & Tools
       * ======================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* MODE TOGGLE PILL: SIMPLE MODE vs PRO MODE */}
        {onToggleEditorMode && (
          <button
            onClick={onToggleEditorMode}
            data-testid="topbar-btn-editor-mode"
            title={
              editorMode === 'simple'
                ? 'पेशेवर संपादक पर जाएं (Switch to Professional Mode)'
                : 'सरल मोड पर जाएं (Switch to Simple Mode)'
            }
            style={{
              backgroundColor: editorMode === 'simple' ? '#166534' : '#1e293b',
              color: '#ffffff',
              border: editorMode === 'simple' ? '1px solid #22c55e' : '1px solid #475569',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: editorMode === 'simple' ? '0 1px 4px rgba(34, 197, 94, 0.3)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{editorMode === 'simple' ? '✨ सरल मोड' : '⚙️ पेशेवर मोड'}</span>
          </button>
        )}

        {/* TEMPLATE GALLERY BUTTON (DESIGN BADLEIN) */}
        {onOpenTemplateGallery && (
          <button
            onClick={onOpenTemplateGallery}
            data-testid="topbar-btn-template-gallery"
            title={locale === 'en' ? 'Open Template Library' : 'रेडीमेड अखबार टेम्पलेट चुनें'}
            style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(185, 28, 28, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            <span style={{ fontSize: '13px' }}>📰</span>
            <span>{locale === 'en' ? 'Templates' : 'डिजाइन बदलें'}</span>
          </button>
        )}

        {/* PRIMARY HERO PDF EXPORT BUTTON - POSITIONED PROMINENTLY */}
        <button
          data-testid="btn-export-pdf"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          title={
            locale === 'en'
              ? 'Download print-ready vector PDF'
              : 'प्रेस-रेडी वेक्टर PDF डाउनलोड करें'
          }
          style={{
            backgroundColor: isExportingPdf ? '#991B1B' : colors.pressRed || '#DC2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: isExportingPdf ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ fontSize: '13px' }}>{isExportingPdf ? '⏳' : '📥'}</span>
          <span>
            {isExportingPdf
              ? locale === 'en'
                ? 'Exporting...'
                : 'डाउनलोड...'
              : locale === 'en'
                ? 'Download PDF'
                : 'PDF डाउनलोड'}
          </span>
        </button>

        {/* Preflight Validation Status Button */}
        {onOpenPreflight && (
          <button
            data-testid="btn-preflight-status"
            onClick={onOpenPreflight}
            title={
              locale === 'en'
                ? 'Open preflight validation report'
                : 'प्रीफ़्लाइट जांच रिपोर्ट खोलें'
            }
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
              padding: '5px 9px',
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
                ? locale === 'en'
                  ? 'Preflight'
                  : 'प्रीफ़्लाइट'
                : preflightStatus?.overallStatus === 'yellow'
                  ? `${locale === 'en' ? 'Preflight' : 'प्रीफ़्लाइट'} (${preflightStatus.warningCount})`
                  : preflightStatus?.overallStatus === 'red'
                    ? `${locale === 'en' ? 'Preflight' : 'प्रीफ़्लाइट'} (${preflightStatus.blockerCount})`
                    : locale === 'en'
                      ? 'Preflight'
                      : 'प्रीफ़्लाइट'}
            </span>
          </button>
        )}

        {/* Publishing Studio */}
        {onOpenPublishing && (
          <button
            data-testid="btn-publishing-studio"
            onClick={onOpenPublishing}
            title={
              locale === 'en'
                ? 'Master templates and daily editions'
                : 'मास्टर टेम्पलेट एवं दैनिक संस्करण प्रबंधन'
            }
            style={{
              backgroundColor: '#1E293B',
              color: '#38BDF8',
              border: '1px solid #0284C7',
              borderRadius: '4px',
              padding: '5px 9px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📰</span>
            <span>{locale === 'en' ? 'Publishing' : 'प्रकाशन'}</span>
          </button>
        )}

        {/* Tools Dropdown Menu (Secondary & Advanced Controls) */}
        <div style={{ position: 'relative' }} ref={toolsMenuRef}>
          <button
            onClick={() => setIsToolsOpen((prev) => !prev)}
            aria-expanded={isToolsOpen}
            aria-haspopup="true"
            title={
              locale === 'en'
                ? 'Presets, layout, theme, backup & print tools'
                : 'प्रारूप, विन्यास, थीम, बैकअप एवं प्रिंट टूल्स'
            }
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
              <button
                onClick={() => {
                  onOpenTemplates();
                  setIsToolsOpen(false);
                }}
                data-testid="topbar-btn-presets"
                title={locale === 'en' ? 'Newspaper Presets' : 'टेम्पलेट प्रारूप'}
                style={{
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
                }}
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
                  onClick={() => {
                    onOpenPageSetup();
                    setIsToolsOpen(false);
                  }}
                  data-testid="topbar-btn-pagesetup"
                  title={locale === 'en' ? 'Page & Paper Setup' : 'कागज़ आकार व विन्यास'}
                  style={{
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
                  }}
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
                  onClick={() => {
                    onOpenMastheadDesigner();
                    setIsToolsOpen(false);
                  }}
                  data-testid="topbar-btn-masthead-designer"
                  title={
                    locale === 'en' ? 'Masthead & Header Designer' : 'मास्टहेड डिज़ाइनर एवं प्रीसेट'
                  }
                  style={{
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
                  }}
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
                  onClick={() => {
                    onAutoFit();
                    setIsToolsOpen(false);
                  }}
                  title={
                    locale === 'en' ? 'Balance columns on this page' : 'पेज के कॉलम संतुलित करें'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    color: '#38BDF8',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
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
                  onClick={() => {
                    onAutoAllocateOverflow();
                    setIsToolsOpen(false);
                  }}
                  title={
                    locale === 'en'
                      ? 'Auto-allocate story overflow across multiple pages'
                      : 'अतिप्रवाहित खबरों को स्वतः अगले पृष्ठों पर प्रवाहित करें'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    color: '#FCA5A5',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📄+</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {locale === 'en' ? 'Auto-allocate Overflow' : 'ऑटो-फ्लो पृष्ठ'}
                  </span>
                </button>
              )}

              {onOpenTheme && (
                <button
                  onClick={() => {
                    onOpenTheme();
                    setIsToolsOpen(false);
                  }}
                  title={
                    locale === 'en' ? 'Customize theme and colors' : 'अख़बार का रंग व थीम बदलें'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    color: '#D8B4FE',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
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
                  onClick={() => {
                    onToggleFreeLayout();
                    setIsToolsOpen(false);
                  }}
                  title={
                    useFreeLayout
                      ? locale === 'en'
                        ? 'Switch to auto-flow mode'
                        : 'ऑटो-फ्लो मोड पर स्विच करें'
                      : locale === 'en'
                        ? 'Switch to free placement mode'
                        : 'मुक्त लेआउट मोड सक्षम करें'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    color: useFreeLayout ? '#D8B4FE' : '#A8A29E',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🔲</span>
                  <span style={{ flex: 1 }}>
                    {useFreeLayout
                      ? locale === 'en'
                        ? 'Layout: Free Mode ✓'
                        : 'लेआउट: मुक्त विन्यास ✓'
                      : locale === 'en'
                        ? 'Layout: Auto Grid'
                        : 'लेआउट: ऑटो ग्रिड'}
                  </span>
                </button>
              )}

              {onFitWidth && (
                <button
                  onClick={() => {
                    onFitWidth();
                    setIsToolsOpen(false);
                  }}
                  title={locale === 'en' ? 'Fit page width' : 'पेज की चौड़ाई स्क्रीन पर फ़िट करें'}
                  style={{
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
                  }}
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
                  onClick={() => {
                    onTogglePhysicalCoordinates();
                    setIsToolsOpen(false);
                  }}
                  title={
                    usePhysicalCanvasCoordinates
                      ? locale === 'en'
                        ? 'Switch to legacy 800px'
                        : '800px लेगसी पर स्विच करें'
                      : locale === 'en'
                        ? 'Switch to 1:1 physical mm'
                        : '1:1 भौतिक माप सक्रिय करें'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    color: usePhysicalCanvasCoordinates ? '#86EFAC' : '#FAF8F5',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>📐</span>
                  <span style={{ flex: 1 }}>
                    {usePhysicalCanvasCoordinates
                      ? locale === 'en'
                        ? 'Canvas: 1:1 mm (WYSIWYG) ✓'
                        : 'कैनवस: 1:1 mm ✓'
                      : locale === 'en'
                        ? 'Canvas: 800px Mode'
                        : 'कैनवस: 800px'}
                  </span>
                </button>
              )}

              {onPrintPdf && (
                <button
                  data-testid="btn-print-pdf"
                  onClick={() => {
                    onPrintPdf();
                    setIsToolsOpen(false);
                  }}
                  disabled={isPrintingPdf}
                  title={
                    locale === 'en'
                      ? 'Browser print / Save as PDF'
                      : 'ब्राउज़र प्रिंट / PDF के रूप में सहेजें'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '11.5px',
                    color: '#FAF8F5',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isPrintingPdf ? 'wait' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '13px' }}>🖨️</span>
                  <span style={{ flex: 1 }}>
                    {locale === 'en' ? 'Browser Print' : 'ब्राउज़र प्रिंट'}
                  </span>
                </button>
              )}

              <div style={{ height: '1px', backgroundColor: '#2B2825', margin: '4px 0' }} />

              {onExportProjectJson && (
                <button
                  onClick={() => {
                    onExportProjectJson();
                    setIsToolsOpen(false);
                  }}
                  title={
                    locale === 'en'
                      ? 'Export project backup JSON'
                      : 'प्रोजेक्ट का बैकअप JSON डाउनलोड करें'
                  }
                  style={{
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
                  }}
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
                  onClick={() => {
                    jsonInputRef.current?.click();
                    setIsToolsOpen(false);
                  }}
                  title={
                    locale === 'en'
                      ? 'Import project from JSON backup'
                      : 'बैकअप JSON से प्रोजेक्ट लोड करें'
                  }
                  style={{
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
                  }}
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
                onClick={() => {
                  onNewPublication();
                  setIsToolsOpen(false);
                }}
                title={locale === 'en' ? 'Create new edition' : 'नया अख़बार बनाएं'}
                style={{
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
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262422')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '13px' }}>✚</span>
                <span style={{ flex: 1 }}>+ {t.common.create}</span>
              </button>

              <button
                onClick={() => {
                  onViewModeChange('landing');
                  setIsToolsOpen(false);
                }}
                title={locale === 'en' ? 'Return to Home' : 'मुख्य पृष्ठ पर लौटें'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '11.5px',
                  color: '#A8A29E',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
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

        {/* Language Selector */}
        <LanguageSelector variant="pill" />

        {/* Inspector Panel Toggle Button */}
        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            title={
              isInspectorOpen
                ? locale === 'en'
                  ? 'Hide inspector panel'
                  : 'पैनल छिपाएं'
                : locale === 'en'
                  ? 'Show inspector panel'
                  : 'पैनल दिखाएं'
            }
            style={{
              backgroundColor: isInspectorOpen ? '#36322E' : 'transparent',
              border: '1px solid',
              borderColor: isInspectorOpen ? colors.pressRed || '#DC2626' : '#3D3835',
              color: isInspectorOpen ? '#FAF8F5' : '#A8A29E',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '5px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <span>⚙</span>
            <span className="hidden sm:inline">{locale === 'en' ? 'Panel' : 'पैनल'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
