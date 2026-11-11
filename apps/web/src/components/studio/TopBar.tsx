import React, { useState, useRef, useEffect } from 'react';
import type { PageSizePreset } from '@epaper-studio/document-schema';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  DownloadIcon,
  FileJsonIcon,
  FolderOpenIcon,
  InspectorRightIcon,
  LayoutGridIcon,
  MastheadIcon,
  MaximizeIcon,
  NewspaperIcon,
  PaletteIcon,
  PlusSquareIcon,
  PrinterIcon,
  RedoIcon,
  RulerIcon,
  ShieldIcon,
  SidebarLeftIcon,
  SlidersIcon,
  SparkleIcon,
  TrashIcon,
  UndoIcon,
  ZapIcon,
} from './StudioIcons';

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
  const isHi = locale === 'hi';

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

  const menuItemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '8px 10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#EDEAE4',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background-color 120ms ease',
  };

  const secondaryRow2Btn: React.CSSProperties = {
    backgroundColor: '#211E1B',
    color: '#E5DFD6',
    border: '1px solid #35302B',
    borderRadius: '6px',
    padding: '4px 10px',
    height: '28px',
    fontSize: '11.5px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  };

  const divider = (
    <div style={{ height: '16px', width: '1px', backgroundColor: '#2E2924', flexShrink: 0 }} />
  );

  return (
    <header
      data-testid="desktop-top-bar"
      style={{
        backgroundColor: '#141210',
        color: '#FAF8F5',
        borderBottom: '1px solid #2B2723',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: 50,
        position: 'relative',
        overflow: 'visible',
        flexShrink: 0,
        fontFamily: "'Poppins', 'Hind', sans-serif",
      }}
    >
      {/* ROW 1 — Brand | Sidebar | Title | Save Status | Mode | Preflight | Print & Export | Lang | Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          height: '46px',
          borderBottom: '1px solid #26221E',
          gap: '10px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {/* LEFT CLUSTER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="studio-topbar-btn"
              title={
                isSidebarOpen
                  ? isHi
                    ? 'बायाँ पैनल छिपाएँ'
                    : 'Hide sidebar'
                  : isHi
                    ? 'बायाँ पैनल खोलें'
                    : 'Show sidebar'
              }
              aria-label="Toggle sidebar"
              style={{
                backgroundColor: isSidebarOpen ? '#24211D' : 'transparent',
                border: '1px solid',
                borderColor: isSidebarOpen ? '#3A342E' : 'transparent',
                color: isSidebarOpen ? '#FAF8F5' : '#A8A29E',
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SidebarLeftIcon size={15} />
            </button>
          )}

          {/* Brand Crest */}
          <div
            onClick={() => onViewModeChange('landing')}
            title={isHi ? 'होम पेज पर जाएँ' : 'Return to Home'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#B91C1C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: fonts.hindiEditorial,
                borderRadius: '6px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              प
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#FAF8F5',
                fontFamily: `${fonts.display}, ${fonts.hindiEditorial}`,
              }}
            >
              E-Paper Studio
            </span>
          </div>

          {/* Dashboard Shortcut */}
          <button
            type="button"
            onClick={() => onViewModeChange('dashboard')}
            className="studio-topbar-btn"
            title={isHi ? 'डैशबोर्ड पर जाएँ' : 'Go to Publisher Dashboard'}
            style={{
              backgroundColor: '#211E1B',
              border: '1px solid #35302B',
              borderRadius: '6px',
              color: '#E5DFD6',
              padding: '4px 10px',
              height: '28px',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
            }}
          >
            <DashboardIcon size={13} color="#C7BFAF" />
            <span>{t.common.dashboard}</span>
          </button>

          {divider}

          {/* Editable Publication Title + Autosave Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
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
                  backgroundColor: '#24211D',
                  color: '#FFFFFF',
                  border: '1px solid #B91C1C',
                  borderRadius: '5px',
                  padding: '3px 8px',
                  fontSize: '12.5px',
                  fontFamily: fonts.hindiEditorial,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            ) : (
              <span
                onClick={() => setIsRenaming(true)}
                title={
                  isHi ? 'अख़बार का नाम बदलने के लिए क्लिक करें' : 'Click to rename publication'
                }
                style={{
                  fontSize: '13px',
                  color: '#F5F2EC',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: fonts.hindiEditorial,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                }}
              >
                {publicationTitle}
              </span>
            )}

            {hasUnsavedChanges ? (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                data-testid="autosave-status-badge"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#FCD34D',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                  }}
                />
                <span>
                  {isSaving
                    ? isHi
                      ? 'सेव हो रहा है...'
                      : 'Saving...'
                    : isHi
                      ? 'सेव करें'
                      : 'Unsaved'}
                </span>
              </button>
            ) : (
              <span
                data-testid="autosave-status-badge"
                title={isHi ? 'सब अपने आप सेव है' : 'All changes saved locally'}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#86EFAC',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span aria-hidden="true">✓</span>
                <span>{isHi ? 'सेव है' : 'Saved'}</span>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT CLUSTER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
          {onToggleEditorMode && (
            <button
              type="button"
              onClick={onToggleEditorMode}
              data-testid="topbar-btn-editor-mode"
              className="studio-topbar-btn"
              title={
                editorMode === 'simple'
                  ? isHi
                    ? 'प्रो मोड में बदलें'
                    : 'Switch to Pro Mode'
                  : isHi
                    ? 'सरल मोड में बदलें'
                    : 'Switch to Simple Mode'
              }
              style={{
                backgroundColor: editorMode === 'simple' ? '#1F2421' : '#26211E',
                color: editorMode === 'simple' ? '#BBF7D0' : '#FDE68A',
                border: '1px solid',
                borderColor: editorMode === 'simple' ? '#2F4A38' : '#4D3D2B',
                borderRadius: '999px',
                padding: '4px 10px',
                height: '28px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              {editorMode === 'simple' ? (
                <SparkleIcon size={12} color="#86EFAC" />
              ) : (
                <SlidersIcon size={12} color="#FDE68A" />
              )}
              <span>
                {editorMode === 'simple'
                  ? isHi
                    ? 'सरल मोड'
                    : 'Simple'
                  : isHi
                    ? 'प्रो मोड'
                    : 'Pro'}
              </span>
            </button>
          )}

          {onOpenPreflight && (
            <button
              type="button"
              data-testid="btn-preflight-status"
              onClick={onOpenPreflight}
              className="studio-topbar-btn"
              title={isHi ? 'प्रिंट जांच रिपोर्ट देखें' : 'Preflight validation report'}
              style={{
                backgroundColor: '#211E1B',
                color:
                  preflightStatus?.overallStatus === 'green'
                    ? '#BBF7D0'
                    : preflightStatus?.overallStatus === 'yellow'
                      ? '#FDE68A'
                      : preflightStatus?.overallStatus === 'red'
                        ? '#FECACA'
                        : '#E5DFD6',
                border: '1px solid #35302B',
                borderRadius: '6px',
                padding: '4px 10px',
                height: '28px',
                fontSize: '11.5px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor:
                    preflightStatus?.overallStatus === 'green'
                      ? '#22C55E'
                      : preflightStatus?.overallStatus === 'yellow'
                        ? '#F59E0B'
                        : preflightStatus?.overallStatus === 'red'
                          ? '#EF4444'
                          : '#9CA3AF',
                }}
              />
              <span>
                {preflightStatus?.overallStatus === 'green'
                  ? isHi
                    ? 'प्रीफ़्लाइट'
                    : 'Preflight OK'
                  : preflightStatus?.overallStatus === 'yellow'
                    ? isHi
                      ? `चेतावनी (${preflightStatus.warningCount})`
                      : `${preflightStatus.warningCount} Warnings`
                    : preflightStatus?.overallStatus === 'red'
                      ? isHi
                        ? `त्रुटि (${preflightStatus.blockerCount})`
                        : `${preflightStatus.blockerCount} Issues`
                      : isHi
                        ? 'प्रीफ़्लाइट'
                        : 'Preflight'}
              </span>
            </button>
          )}

          {onPrintPdf && (
            <button
              type="button"
              data-testid="btn-print-pdf"
              onClick={onPrintPdf}
              disabled={isPrintingPdf}
              className="studio-topbar-btn"
              title={
                isHi
                  ? 'ब्राउज़र से प्रिंट या PDF सेव करें'
                  : 'Browser Print / Save as PDF (Fallback)'
              }
              style={{
                backgroundColor: '#211E1B',
                color: '#FAF8F5',
                border: '1px solid #35302B',
                borderRadius: '6px',
                padding: '4px 10px',
                height: '30px',
                fontSize: '11.5px',
                fontWeight: 500,
                cursor: isPrintingPdf ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <PrinterIcon size={13} color="#D6CFC4" />
              <span>{isHi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>
          )}

          {/* Primary PDF Export CTA */}
          <button
            type="button"
            data-testid="btn-export-pdf"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="studio-topbar-primary"
            title={isHi ? 'प्रिंट-तैयार PDF डाउनलोड करें' : 'Download print-ready vector PDF'}
            style={{
              backgroundColor: isExportingPdf ? '#991B1B' : '#B91C1C',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px',
              padding: '4px 13px',
              height: '30px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: isExportingPdf ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(185, 28, 28, 0.35)',
            }}
          >
            <DownloadIcon size={13} />
            <span>
              {isExportingPdf
                ? isHi
                  ? 'बन रहा है...'
                  : 'Exporting...'
                : isHi
                  ? 'PDF डाउनलोड'
                  : 'PDF Download'}
            </span>
          </button>

          <LanguageSelector variant="pill" />

          {onToggleInspector && (
            <button
              type="button"
              onClick={onToggleInspector}
              className="studio-topbar-btn"
              title={
                isInspectorOpen
                  ? isHi
                    ? 'दायाँ पैनल छिपाएँ'
                    : 'Hide inspector panel'
                  : isHi
                    ? 'दायाँ पैनल दिखाएँ'
                    : 'Show inspector panel'
              }
              style={{
                backgroundColor: isInspectorOpen ? '#2B2622' : '#211E1B',
                border: '1px solid',
                borderColor: isInspectorOpen ? '#B91C1C' : '#35302B',
                color: isInspectorOpen ? '#FAF8F5' : '#A8A29E',
                borderRadius: '6px',
                cursor: 'pointer',
                padding: '4px 9px',
                height: '30px',
                fontSize: '11.5px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              <InspectorRightIcon size={13} />
              <span>{isHi ? 'पैनल' : 'Panel'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ROW 2 — Undo/Redo | Pages | Clear | Zoom | Design Library | Templates | Masthead | Page Setup | Tools */}
      <div
        className="studio-topbar-row2"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          height: '42px',
          gap: '8px',
          whiteSpace: 'nowrap',
          backgroundColor: '#191614',
          overflow: 'visible',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Undo / Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="studio-topbar-btn"
            title={`${t.common.undo} (Ctrl+Z)`}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: canUndo ? '#F5F2EC' : '#57524C',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              width: '28px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
            }}
          >
            <UndoIcon size={14} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="studio-topbar-btn"
            title={`${t.common.redo} (Ctrl+Y)`}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: canRedo ? '#F5F2EC' : '#57524C',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              width: '28px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
            }}
          >
            <RedoIcon size={14} />
          </button>
        </div>

        {divider}

        {/* Page Stepper */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#211E1B',
            border: '1px solid #35302B',
            borderRadius: '6px',
            padding: '2px 6px',
            height: '28px',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            disabled={currentPageNumber <= 1}
            onClick={() => onSelectPage(currentPageNumber - 1)}
            title={isHi ? 'पिछला पेज' : 'Previous page'}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentPageNumber <= 1 ? '#57524C' : '#E5DFD6',
              cursor: currentPageNumber <= 1 ? 'not-allowed' : 'pointer',
              padding: '2px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeftIcon size={13} />
          </button>
          <span
            style={{
              fontSize: '11.5px',
              color: '#FAF8F5',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 2px',
            }}
          >
            <span>
              {currentPageNumber} / {totalPages}
            </span>
            {isPageFull && (
              <span
                title={isHi ? 'पेज भर गया है' : 'Page is full'}
                style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: '#B91C1C',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                {isHi ? 'भरा' : 'FULL'}
              </span>
            )}
          </span>
          <button
            type="button"
            disabled={currentPageNumber >= totalPages}
            onClick={() => onSelectPage(currentPageNumber + 1)}
            title={isHi ? 'अगला पेज' : 'Next page'}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentPageNumber >= totalPages ? '#57524C' : '#E5DFD6',
              cursor: currentPageNumber >= totalPages ? 'not-allowed' : 'pointer',
              padding: '2px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <ChevronRightIcon size={13} />
          </button>
          <span
            style={{
              fontSize: '9.5px',
              color: '#B5ADA1',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 600,
              backgroundColor: '#141210',
              padding: '2px 6px',
              borderRadius: '4px',
              marginLeft: '2px',
            }}
          >
            {pageSize}
          </span>
        </div>

        {/* Clear Page */}
        {onClearPage && (
          <button
            type="button"
            data-testid="topbar-btn-clear-page"
            onClick={onClearPage}
            title={
              isHi
                ? 'इस पेज की सभी ख़बरें और ब्लॉक साफ़ करें'
                : 'Clear all stories & blocks from this page'
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(185, 28, 28, 0.12)',
              color: '#FCA5A5',
              border: '1px solid rgba(185, 28, 28, 0.35)',
              borderRadius: '6px',
              padding: '4px 9px',
              height: '28px',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 140ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.28)';
              e.currentTarget.style.color = '#FECACA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.12)';
              e.currentTarget.style.color = '#FCA5A5';
            }}
          >
            <TrashIcon size={12} />
            <span>{isHi ? 'पेज खाली करें' : 'Clear Page'}</span>
          </button>
        )}

        {divider}

        {/* Zoom Controls */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onScaleChange(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
            className="studio-topbar-btn"
            title={t.common.zoomOut}
            style={{
              backgroundColor: '#211E1B',
              border: '1px solid #35302B',
              color: '#E5DFD6',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              width: '26px',
              height: '28px',
              cursor: 'pointer',
            }}
          >
            −
          </button>
          <select
            value={roundedScale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            aria-label={isHi ? 'ज़ूम स्तर' : 'Zoom level'}
            style={{
              backgroundColor: '#211E1B',
              color: '#FAF8F5',
              border: '1px solid #35302B',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
              padding: '0 6px',
              height: '28px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '72px',
            }}
          >
            {!standardScales.includes(roundedScale) && (
              <option value={roundedScale}>
                {Math.round(scale * 100)}% ({isHi ? 'फ़िट' : 'Fit'})
              </option>
            )}
            {standardScales.map((val) => (
              <option key={val} value={val}>
                {Math.round(val * 100)}%
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onScaleChange(Math.min(3.0, Math.round((scale + 0.1) * 100) / 100))}
            className="studio-topbar-btn"
            title={t.common.zoomIn}
            style={{
              backgroundColor: '#211E1B',
              border: '1px solid #35302B',
              color: '#E5DFD6',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              width: '26px',
              height: '28px',
              cursor: 'pointer',
            }}
          >
            +
          </button>
          {onFitPage && (
            <button
              type="button"
              onClick={onFitPage}
              className="studio-topbar-btn"
              title={t.common.zoomFit}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #35302B',
                color: '#C7BFAF',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                padding: '0 8px',
                height: '28px',
                cursor: 'pointer',
              }}
            >
              {isHi ? 'फ़िट' : 'Fit'}
            </button>
          )}
          {onFitWidth && (
            <button
              type="button"
              onClick={onFitWidth}
              className="studio-topbar-btn"
              title={isHi ? 'चौड़ाई स्क्रीन पर फ़िट करें' : 'Fit width'}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #35302B',
                color: '#C7BFAF',
                borderRadius: '6px',
                padding: '0 7px',
                height: '28px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <ArrowLeftRightIcon size={13} />
            </button>
          )}
        </div>

        {/* RIGHT CLUSTER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto',
            flexShrink: 0,
          }}
        >
          {onOpenDesignLibrary && (
            <button
              type="button"
              onClick={onOpenDesignLibrary}
              data-testid="topbar-btn-design-library"
              className="studio-topbar-btn"
              title={isHi ? '278 तैयार डिज़ाइन संग्रह खोलें' : 'Open 278 Editorial Design Library'}
              style={{
                ...secondaryRow2Btn,
                backgroundColor: '#262129',
                borderColor: '#453B52',
                color: '#EDE9FE',
              }}
            >
              <LayoutGridIcon size={13} color="#C4B5FD" />
              <span>{isHi ? '278 डिज़ाइन' : '278 Designs'}</span>
            </button>
          )}

          {onOpenTemplateGallery && (
            <button
              type="button"
              onClick={onOpenTemplateGallery}
              data-testid="topbar-btn-template-gallery"
              className="studio-topbar-btn"
              title={isHi ? 'तैयार पेज टेम्पलेट चुनें' : 'Open Template Library'}
              style={secondaryRow2Btn}
            >
              <NewspaperIcon size={13} color="#C7BFAF" />
              <span>{isHi ? 'टेम्पलेट' : 'Templates'}</span>
            </button>
          )}

          {onOpenMastheadDesigner && (
            <button
              type="button"
              onClick={onOpenMastheadDesigner}
              data-testid="topbar-btn-masthead-designer"
              className="studio-topbar-btn"
              title={isHi ? 'मास्टहेड डिज़ाइनर खोलें' : 'Masthead & Header Designer'}
              style={secondaryRow2Btn}
            >
              <MastheadIcon size={13} color="#C7BFAF" />
              <span>{isHi ? 'मास्टहेड' : 'Masthead'}</span>
            </button>
          )}

          {onOpenPageSetup && (
            <button
              type="button"
              onClick={onOpenPageSetup}
              data-testid="topbar-btn-pagesetup"
              className="studio-topbar-btn"
              title={isHi ? 'कागज़ और मार्जिन सेट करें' : 'Page & Paper Setup'}
              style={secondaryRow2Btn}
            >
              <RulerIcon size={13} color="#C7BFAF" />
              <span>{isHi ? 'पेज सेटअप' : 'Page Setup'}</span>
            </button>
          )}

          {/* TOOLS DROPDOWN */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={toolsMenuRef}>
            <button
              type="button"
              onClick={() => setIsToolsOpen((prev) => !prev)}
              aria-expanded={isToolsOpen}
              aria-haspopup="true"
              className="studio-topbar-btn"
              title={
                isHi
                  ? 'प्रारूप, थीम, बैकअप और प्रिंट विकल्प'
                  : 'Presets, layout, theme, backup & print tools'
              }
              style={{
                ...secondaryRow2Btn,
                backgroundColor: isToolsOpen ? '#2E2925' : '#211E1B',
                borderColor: isToolsOpen ? colors.pressRed : '#35302B',
                color: '#FAF8F5',
              }}
            >
              <SlidersIcon size={13} color="#C7BFAF" />
              <span>{isHi ? 'टूल्स' : 'Tools'}</span>
              <span style={{ fontSize: '9px', opacity: 0.7 }}>{isToolsOpen ? '▲' : '▼'}</span>
            </button>

            {isToolsOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  backgroundColor: '#181513',
                  border: '1px solid #35302B',
                  borderRadius: '10px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.06)',
                  minWidth: '232px',
                  padding: '6px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpenTemplates();
                    setIsToolsOpen(false);
                  }}
                  data-testid="topbar-btn-presets"
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LayoutGridIcon size={14} color="#C7BFAF" />
                  <span style={{ flex: 1 }}>{isHi ? 'अख़बार प्रारूप' : 'Newspaper Presets'}</span>
                </button>

                {onOpenPageSetup && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPageSetup();
                      setIsToolsOpen(false);
                    }}
                    data-testid="topbar-tools-pagesetup"
                    style={menuItemBase}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <RulerIcon size={14} color="#C7BFAF" />
                    <span style={{ flex: 1 }}>{isHi ? 'पेज सेटअप' : 'Page Setup'}</span>
                  </button>
                )}

                {onOpenMastheadDesigner && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMastheadDesigner();
                      setIsToolsOpen(false);
                    }}
                    data-testid="topbar-tools-masthead"
                    style={menuItemBase}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <MastheadIcon size={14} color="#C7BFAF" />
                    <span style={{ flex: 1 }}>
                      {isHi ? 'मास्टहेड डिज़ाइनर' : 'Masthead Designer'}
                    </span>
                  </button>
                )}

                {onAutoFit && (
                  <button
                    type="button"
                    onClick={() => {
                      onAutoFit();
                      setIsToolsOpen(false);
                    }}
                    style={{ ...menuItemBase, color: '#93C5FD' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ZapIcon size={14} color="#93C5FD" />
                    <span className="studio-sr-only">⚡ ऑटो-फ़िट</span>
                    <span style={{ flex: 1 }}>
                      {isHi ? 'कॉलम अपने आप संतुलित करें' : 'Balance Columns'}
                    </span>
                  </button>
                )}

                {onAutoAllocateOverflow && (
                  <button
                    type="button"
                    data-testid="btn-auto-overflow"
                    onClick={() => {
                      onAutoAllocateOverflow();
                      setIsToolsOpen(false);
                    }}
                    style={{ ...menuItemBase, color: '#FCA5A5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PlusSquareIcon size={14} color="#FCA5A5" />
                    <span style={{ flex: 1 }}>
                      {isHi ? 'बाक़ी ख़बरें अगले पेज पर भेजें' : 'Auto-allocate Overflow'}
                    </span>
                  </button>
                )}

                {onClearPage && (
                  <button
                    type="button"
                    data-testid="btn-tools-clear-page"
                    onClick={() => {
                      onClearPage();
                      setIsToolsOpen(false);
                    }}
                    style={{ ...menuItemBase, color: '#FCA5A5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3F1515')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <TrashIcon size={14} color="#F87171" />
                    <span style={{ flex: 1 }}>
                      {isHi ? 'पूरा पेज खाली करें' : 'Clear Page Canvas'}
                    </span>
                  </button>
                )}

                {onOpenTheme && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTheme();
                      setIsToolsOpen(false);
                    }}
                    style={{ ...menuItemBase, color: '#DDD6FE' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PaletteIcon size={14} color="#DDD6FE" />
                    <span className="studio-sr-only">🎨 रंग / थीम</span>
                    <span style={{ flex: 1 }}>{isHi ? 'रंग व थीम' : 'Theme & Colors'}</span>
                  </button>
                )}

                {onToggleFreeLayout && (
                  <button
                    type="button"
                    data-testid="toggle-free-layout-button"
                    onClick={() => {
                      onToggleFreeLayout();
                      setIsToolsOpen(false);
                    }}
                    style={{ ...menuItemBase, color: useFreeLayout ? '#DDD6FE' : '#C7BFAF' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LayoutGridIcon size={14} color={useFreeLayout ? '#DDD6FE' : '#C7BFAF'} />
                    <span style={{ flex: 1 }}>
                      {useFreeLayout
                        ? isHi
                          ? 'लेआउट: फ्री मोड ✓'
                          : 'Layout: Free Mode ✓'
                        : isHi
                          ? 'लेआउट: ऑटो ग्रिड'
                          : 'Layout: Auto Grid'}
                    </span>
                  </button>
                )}

                {onFitWidth && (
                  <button
                    type="button"
                    onClick={() => {
                      onFitWidth();
                      setIsToolsOpen(false);
                    }}
                    style={menuItemBase}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ArrowLeftRightIcon size={14} color="#C7BFAF" />
                    <span style={{ flex: 1 }}>
                      {isHi ? 'पूरी चौड़ाई फ़िट करें' : 'Fit Page Width'}
                    </span>
                  </button>
                )}

                {onTogglePhysicalCoordinates && (
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePhysicalCoordinates();
                      setIsToolsOpen(false);
                    }}
                    style={{
                      ...menuItemBase,
                      color: usePhysicalCanvasCoordinates ? '#86EFAC' : '#FAF8F5',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <MaximizeIcon
                      size={14}
                      color={usePhysicalCanvasCoordinates ? '#86EFAC' : '#C7BFAF'}
                    />
                    <span style={{ flex: 1 }}>
                      {usePhysicalCanvasCoordinates
                        ? isHi
                          ? 'कैनवस: 1:1 mm (प्रिंट साइज) ✓'
                          : 'Canvas: 1:1 mm (WYSIWYG) ✓'
                        : isHi
                          ? 'कैनवस: 800px'
                          : 'Canvas: 800px Mode'}
                    </span>
                  </button>
                )}

                {onPrintPdf && (
                  <button
                    type="button"
                    onClick={() => {
                      onPrintPdf();
                      setIsToolsOpen(false);
                    }}
                    disabled={isPrintingPdf}
                    style={{ ...menuItemBase, cursor: isPrintingPdf ? 'wait' : 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PrinterIcon size={14} color="#C7BFAF" />
                    <span style={{ flex: 1 }}>
                      {isHi ? 'ब्राउज़र से प्रिंट करें' : 'Browser Print'}
                    </span>
                  </button>
                )}

                {onOpenPublishing && (
                  <button
                    type="button"
                    data-testid="btn-publishing-studio"
                    onClick={() => {
                      onOpenPublishing();
                      setIsToolsOpen(false);
                    }}
                    style={{ ...menuItemBase, color: '#93C5FD' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ShieldIcon size={14} color="#93C5FD" />
                    <span style={{ flex: 1 }}>
                      {isHi ? 'प्रकाशन स्टूडियो' : 'Publishing Studio'}
                    </span>
                  </button>
                )}

                <div style={{ height: '1px', backgroundColor: '#2B2723', margin: '4px 0' }} />

                {onExportProjectJson && (
                  <button
                    type="button"
                    onClick={() => {
                      onExportProjectJson();
                      setIsToolsOpen(false);
                    }}
                    style={menuItemBase}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <FileJsonIcon size={14} color="#C7BFAF" />
                    <span className="studio-sr-only">📁 बैकअप</span>
                    <span style={{ flex: 1 }}>
                      {isHi ? 'प्रोजेक्ट बैकअप (JSON)' : 'Export Project JSON'}
                    </span>
                  </button>
                )}

                {onImportProjectJson && (
                  <button
                    type="button"
                    onClick={() => {
                      jsonInputRef.current?.click();
                      setIsToolsOpen(false);
                    }}
                    style={menuItemBase}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <FolderOpenIcon size={14} color="#C7BFAF" />
                    <span className="studio-sr-only">📂 इम्पोर्ट</span>
                    <span style={{ flex: 1 }}>
                      {isHi ? 'बैकअप इम्पोर्ट करें (JSON)' : 'Import Project JSON'}
                    </span>
                  </button>
                )}

                <div style={{ height: '1px', backgroundColor: '#2B2723', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    onNewPublication();
                    setIsToolsOpen(false);
                  }}
                  style={menuItemBase}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <PlusSquareIcon size={14} color="#C7BFAF" />
                  <span style={{ flex: 1 }}>+ {t.common.create}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewModeChange('landing');
                    setIsToolsOpen(false);
                  }}
                  style={{ ...menuItemBase, color: '#A8A29E' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282420')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <ChevronLeftIcon size={14} color="#A8A29E" />
                  <span style={{ flex: 1 }}>{isHi ? 'होम पेज पर लौटें' : 'Exit to Home'}</span>
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
