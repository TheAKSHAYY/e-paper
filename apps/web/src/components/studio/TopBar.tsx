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
}) => {
  const { t, locale } = useI18n();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const fonts = PUBLISHER_DESIGN_SYSTEM.fonts;

  const [isRenaming, setIsRenaming] = useState(false);
  const [editedTitle, setEditedTitle] = useState(publicationTitle);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(publicationTitle);
  }, [publicationTitle]);

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
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* ========================================================
       * LEFT: Brand, Sidebar Toggle, Document Title & Save Status
       * ======================================================== */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}
      >
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarOpen ? (locale === 'en' ? 'Hide sidebar' : 'साइडबार छिपाएं') : (locale === 'en' ? 'Show sidebar' : 'साइडबार दिखाएं')}
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
              <span>{isSaving ? (locale === 'en' ? 'Saving...' : 'सहेजा जा रहा है...') : (locale === 'en' ? 'Unsaved' : 'अनसेव्ड')}</span>
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

        <span style={{ fontSize: '11.5px', color: '#FAF8F5', fontWeight: 600 }}>
          {currentPageNumber} / {totalPages}
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
            fontSize: '10.5px',
            color: '#A8A29E',
            textTransform: 'uppercase',
            fontWeight: 700,
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
              <option value={roundedScale}>{Math.round(scale * 100)}% ({locale === 'en' ? 'Fit' : 'फ़िट'})</option>
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

          {onFitWidth && (
            <button
              onClick={onFitWidth}
              title={locale === 'en' ? 'Fit page width' : 'पेज की चौड़ाई स्क्रीन पर फ़िट करें'}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #3D3835',
                color: '#A8A29E',
                borderRadius: '2px',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '2px 5px',
                cursor: 'pointer',
              }}
            >
              {locale === 'en' ? 'Width' : 'चौड़ाई'}
            </button>
          )}

          {onTogglePhysicalCoordinates && (
            <button
              onClick={onTogglePhysicalCoordinates}
              title={
                usePhysicalCanvasCoordinates
                  ? (locale === 'en' ? '1:1 Physical Canvas (WYSIWYG) active. Click to switch to legacy 800px' : 'भौतिक माप सक्रिय (1:1 Physical Canvas Mode). क्लिक करके 800px लेगसी पर स्विच करें')
                  : (locale === 'en' ? 'Legacy 800px canvas active. Click to switch to 1:1 physical mm' : 'लेगसी 800px कैनवस सक्रिय. क्लिक करके 1:1 भौतिक माप सक्रिय करें')
              }
              style={{
                backgroundColor: usePhysicalCanvasCoordinates ? '#143522' : '#262422',
                border: usePhysicalCanvasCoordinates ? '1px solid #166534' : '1px solid #3D3835',
                color: usePhysicalCanvasCoordinates ? '#86EFAC' : '#A8A29E',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              {usePhysicalCanvasCoordinates ? '📐 1:1 mm' : '800px'}
            </button>
          )}

          {onToggleFreeLayout && (
            <button
              data-testid="toggle-free-layout-button"
              onClick={onToggleFreeLayout}
              title={
                useFreeLayout
                  ? (locale === 'en' ? 'Free placement mode active. Click to switch to auto-flow' : 'मुक्त लेआउट मोड सक्रिय. क्लिक करके ऑटो-फ्लो पर स्विच करें')
                  : (locale === 'en' ? 'Auto-flow mode active. Click to enable free placement' : 'ऑटो-फ्लो मोड सक्रिय. क्लिक करके मुक्त लेआउट सक्षम करें')
              }
              style={{
                backgroundColor: useFreeLayout ? '#2A1B3D' : '#262422',
                border: useFreeLayout ? '1px solid #7C3AED' : '1px solid #3D3835',
                color: useFreeLayout ? '#D8B4FE' : '#A8A29E',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              {useFreeLayout ? '🔲 Free' : 'Auto'}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
       * RIGHT: Return to Home, Templates, Export PDF & Inspector
       * ======================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Language Selector */}
        <LanguageSelector variant="pill" />

        <button
          onClick={() => onViewModeChange('landing')}
          title={locale === 'en' ? 'Return to Home' : 'मुख्य पृष्ठ पर लौटें'}
          style={{
            backgroundColor: 'transparent',
            color: '#A8A29E',
            border: 'none',
            padding: '5px 8px',
            fontSize: '11.5px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← {locale === 'en' ? 'Home' : 'मुख्य पृष्ठ'}
        </button>

        <button
          onClick={onNewPublication}
          title={locale === 'en' ? 'Create new edition' : 'नया अख़बार बनाएं'}
          style={{
            backgroundColor: '#262422',
            color: '#E6E0D5',
            border: '1px solid #3D3835',
            borderRadius: '2px',
            padding: '5px 8px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + {t.common.create}
        </button>

        {/* Publishing Studio: Master Templates & Daily Editions */}
        {onOpenPublishing && (
          <button
            data-testid="btn-publishing-studio"
            onClick={onOpenPublishing}
            title={locale === 'en' ? 'Master templates and daily editions' : 'मास्टर टेम्पलेट एवं दैनिक संस्करण प्रबंधन'}
            style={{
              backgroundColor: '#262422',
              color: '#38BDF8',
              border: '1px solid #0369A1',
              borderRadius: '2px',
              padding: '5px 8px',
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

        {onOpenPageSetup && (
          <button
            onClick={onOpenPageSetup}
            data-testid="topbar-btn-pagesetup"
            title={locale === 'en' ? 'Page & Paper Setup' : 'कागज़ आकार व विन्यास'}
            style={{
              backgroundColor: '#262422',
              color: '#FAF8F5',
              border: '1px solid #3D3835',
              borderRadius: '4px',
              padding: '5px 9px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📐</span>
            <span>{locale === 'en' ? 'Page Setup' : 'कागज़ आकार'}</span>
          </button>
        )}

        <button
          onClick={onOpenTemplates}
          data-testid="topbar-btn-presets"
          title={locale === 'en' ? 'Newspaper Presets' : 'टेम्पलेट प्रारूप'}
          style={{
            backgroundColor: '#262422',
            color: '#E6E0D5',
            border: '1px solid #3D3835',
            borderRadius: '4px',
            padding: '5px 8px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {locale === 'en' ? 'Presets' : 'प्रारूप'}
        </button>

        {/* Auto Fit Button */}
        {onAutoFit && (
          <button
            onClick={onAutoFit}
            title={locale === 'en' ? 'Balance columns on this page' : 'पेज के कॉलम संतुलित करें'}
            style={{
              backgroundColor: '#262422',
              color: '#38BDF8',
              border: '1px solid #0284C7',
              borderRadius: '2px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ⚡ {locale === 'en' ? 'Balance' : 'संतुलन'}
          </button>
        )}

        {/* Multi-Page Story Auto-Allocation Engine Button */}
        {onAutoAllocateOverflow && (
          <button
            data-testid="btn-auto-overflow"
            onClick={onAutoAllocateOverflow}
            title={locale === 'en' ? 'Auto-allocate story overflow across multiple pages' : 'अतिप्रवाहित खबरों को स्वतः अगले पृष्ठों पर प्रवाहित करें'}
            style={{
              backgroundColor: '#262422',
              color: '#FCA5A5',
              border: `1px solid ${colors.pressRed}`,
              borderRadius: '2px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📄+</span>
            <span>{locale === 'en' ? 'Auto Overflow' : 'ऑटो-फ्लो'}</span>
          </button>
        )}

        {/* Theme & Colors Button */}
        {onOpenTheme && (
          <button
            onClick={onOpenTheme}
            title={locale === 'en' ? 'Customize theme and colors' : 'अख़बार का रंग व थीम बदलें'}
            style={{
              backgroundColor: '#262422',
              color: '#D8B4FE',
              border: '1px solid #7C3AED',
              borderRadius: '2px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🎨 {locale === 'en' ? 'Theme' : 'थीम'}
          </button>
        )}

        {/* JSON Backup & Import */}
        {onExportProjectJson && (
          <button
            onClick={onExportProjectJson}
            title={locale === 'en' ? 'Export project backup JSON' : 'प्रोजेक्ट का बैकअप JSON डाउनलोड करें'}
            style={{
              backgroundColor: '#262422',
              color: '#E6E0D5',
              border: '1px solid #3D3835',
              borderRadius: '2px',
              padding: '5px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            📁 {locale === 'en' ? 'Backup' : 'बैकअप'}
          </button>
        )}

        {onImportProjectJson && (
          <>
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
            <button
              onClick={() => jsonInputRef.current?.click()}
              title={locale === 'en' ? 'Import project from JSON backup' : 'बैकअप JSON से प्रोजेक्ट लोड करें'}
              style={{
                backgroundColor: '#262422',
                color: '#E6E0D5',
                border: '1px solid #3D3835',
                borderRadius: '2px',
                padding: '5px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              📂 {locale === 'en' ? 'Import' : 'इम्पोर्ट'}
            </button>
          </>
        )}

        {/* Preflight Validation Status Pill */}
        {onOpenPreflight && (
          <button
            data-testid="btn-preflight-status"
            onClick={onOpenPreflight}
            title={locale === 'en' ? 'Open preflight validation report' : 'प्रीफ़्लाइट जांच रिपोर्ट खोलें'}
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
              borderRadius: '2px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
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
                ? (locale === 'en' ? 'Preflight OK' : 'प्रीफ़्लाइट OK')
                : preflightStatus?.overallStatus === 'yellow'
                  ? `${locale === 'en' ? 'Preflight' : 'प्रीफ़्लाइट'} (${preflightStatus.warningCount})`
                  : preflightStatus?.overallStatus === 'red'
                    ? `${locale === 'en' ? 'Preflight' : 'प्रीफ़्लाइट'} (${preflightStatus.blockerCount})`
                    : (locale === 'en' ? 'Preflight' : 'प्रीफ़्लाइट')}
            </span>
          </button>
        )}

        {/* Primary PDF Download Button */}
        <button
          data-testid="btn-export-pdf"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          title={locale === 'en' ? 'Download print-ready vector PDF' : 'प्रेस-रेडी वेक्टर PDF डाउनलोड करें'}
          style={{
            backgroundColor: colors.pressRed,
            color: '#ffffff',
            border: 'none',
            borderRadius: '2px',
            padding: '5px 12px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: isExportingPdf ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>📥</span>
          <span>{isExportingPdf ? (locale === 'en' ? 'Exporting...' : 'डाउनलोड...') : 'PDF'}</span>
        </button>

        {/* Fallback Browser Print / Save as PDF Button */}
        {onPrintPdf && (
          <button
            data-testid="btn-print-pdf"
            onClick={onPrintPdf}
            disabled={isPrintingPdf}
            title={locale === 'en' ? 'Browser print / Save as PDF' : 'ब्राउज़र प्रिंट / PDF के रूप में सहेजें'}
            style={{
              backgroundColor: '#262422',
              color: '#FAF8F5',
              border: '1px solid #3D3835',
              borderRadius: '2px',
              padding: '5px 10px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: isPrintingPdf ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🖨️</span>
            <span>{isPrintingPdf ? (locale === 'en' ? 'Preparing...' : 'तैयार...') : (locale === 'en' ? 'Print' : 'प्रिंट')}</span>
          </button>
        )}

        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            title={isInspectorOpen ? (locale === 'en' ? 'Hide inspector' : 'पैनल छिपाएं') : (locale === 'en' ? 'Show inspector' : 'पैनल दिखाएं')}
            style={{
              backgroundColor: isInspectorOpen ? '#36322E' : 'transparent',
              border: '1px solid',
              borderColor: isInspectorOpen ? colors.pressRed : '#3D3835',
              color: isInspectorOpen ? '#FAF8F5' : '#A8A29E',
              borderRadius: '2px',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚙</span>
            <span>{locale === 'en' ? 'Panel' : 'पैनल'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
