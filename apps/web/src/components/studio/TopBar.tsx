import React, { useState, useRef, useEffect } from 'react';
import type { PageSizePreset } from '@epaper-studio/document-schema';

export type ViewMode = 'landing' | 'split' | 'preview';

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
  onOpenMastheadGallery?: () => void;
  onOpenDrafts: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onAutoFit?: () => void;
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
  onExportPdf,
  isExportingPdf,
  onAutoFit,
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
        backgroundColor: '#111827',
        color: '#f8fafc',
        height: '48px',
        borderBottom: '1px solid #1f2937',
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
            title={isSidebarOpen ? 'साइडबार छिपाएं' : 'साइडबार दिखाएं'}
            aria-label="Toggle sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
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
          title="मुख्य पृष्ठ पर लौटें (Return to Home)"
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
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '13px',
              fontFamily: "'Noto Serif Devanagari', serif",
              borderRadius: '2px',
            }}
          >
            प
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: "'Noto Serif Devanagari', 'Playfair Display', serif",
            }}
          >
            E-Paper Studio
          </span>
        </div>

        <div style={{ height: '14px', width: '1px', backgroundColor: '#374151', flexShrink: 0 }} />

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
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: '1px solid #3b82f6',
                borderRadius: '2px',
                padding: '2px 6px',
                fontSize: '12px',
                fontFamily: "'Noto Serif Devanagari', serif",
                fontWeight: 700,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsRenaming(true)}
              title="नाम बदलने के लिए क्लिक करें"
              style={{
                fontSize: '12.5px',
                color: '#e5e7eb',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Noto Serif Devanagari', serif",
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
                color: '#f59e0b',
                cursor: 'pointer',
                padding: '2px 4px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>●</span>
              <span>{isSaving ? 'सहेजा जा रहा है...' : 'अनसेव्ड'}</span>
            </button>
          ) : (
            <span
              data-testid="autosave-status-badge"
              title="सभी बदलाव स्वतः सहेजे गए हैं"
              style={{
                fontSize: '11px',
                color: '#10b981',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>✓</span>
              <span>स्वतः सहेजा गया</span>
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
          backgroundColor: '#1f2937',
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
            title="पूर्ववत करें / Undo (Ctrl+Z)"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: canUndo ? '#f3f4f6' : '#4b5563',
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
            title="फिर से करें / Redo (Ctrl+Y)"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: canRedo ? '#f3f4f6' : '#4b5563',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              padding: '2px 4px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            ↷
          </button>
        </div>

        <div style={{ height: '12px', width: '1px', backgroundColor: '#374151' }} />

        <button
          disabled={currentPageNumber <= 1}
          onClick={() => onSelectPage(currentPageNumber - 1)}
          title="पिछला पेज"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentPageNumber <= 1 ? '#4b5563' : '#d1d5db',
            cursor: currentPageNumber <= 1 ? 'not-allowed' : 'pointer',
            padding: '2px 4px',
            fontSize: '11px',
          }}
        >
          ◀
        </button>

        <span style={{ fontSize: '11.5px', color: '#f3f4f6', fontWeight: 600 }}>
          {currentPageNumber} / {totalPages}
        </span>

        <button
          disabled={currentPageNumber >= totalPages}
          onClick={() => onSelectPage(currentPageNumber + 1)}
          title="अगला पेज"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentPageNumber >= totalPages ? '#4b5563' : '#d1d5db',
            cursor: currentPageNumber >= totalPages ? 'not-allowed' : 'pointer',
            padding: '2px 4px',
            fontSize: '11px',
          }}
        >
          ▶
        </button>

        <div style={{ height: '12px', width: '1px', backgroundColor: '#374151' }} />

        <span
          style={{
            fontSize: '10.5px',
            color: '#9ca3af',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {pageSize}
        </span>

        <div style={{ height: '12px', width: '1px', backgroundColor: '#374151' }} />

        {/* Inline Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={() => onScaleChange(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
            title="ज़ूम कम करें"
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              color: '#d1d5db',
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
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 4px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {!standardScales.includes(roundedScale) && (
              <option value={roundedScale}>{Math.round(scale * 100)}% (फ़िट)</option>
            )}
            {standardScales.map((val) => (
              <option key={val} value={val}>
                {Math.round(val * 100)}%
              </option>
            ))}
          </select>

          <button
            onClick={() => onScaleChange(Math.min(3.0, Math.round((scale + 0.1) * 100) / 100))}
            title="ज़ूम बढ़ाएं"
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              color: '#d1d5db',
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
              title="पूरा पेज फ़िट करें (Fit to Page)"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                color: '#9ca3af',
                borderRadius: '2px',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '2px 5px',
                cursor: 'pointer',
                marginLeft: '2px',
              }}
            >
              पेज
            </button>
          )}

          {onFitWidth && (
            <button
              onClick={onFitWidth}
              title="पेज की चौड़ाई स्क्रीन पर फ़िट करें (Fit to Width)"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                color: '#9ca3af',
                borderRadius: '2px',
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '2px 5px',
                cursor: 'pointer',
              }}
            >
              चौड़ाई
            </button>
          )}

          {onTogglePhysicalCoordinates && (
            <button
              onClick={onTogglePhysicalCoordinates}
              title={
                usePhysicalCanvasCoordinates
                  ? 'भौतिक माप सक्रिय (1:1 Physical Canvas Mode - WYSIWYG). क्लिक करके 800px लेगसी पर स्विच करें'
                  : 'लेगसी 800px कैनवस सक्रिय. क्लिक करके 1:1 भौतिक माप (Physical Canvas) सक्रिय करें'
              }
              style={{
                backgroundColor: usePhysicalCanvasCoordinates ? '#065f46' : '#374151',
                border: usePhysicalCanvasCoordinates ? '1px solid #10b981' : '1px solid #4b5563',
                color: usePhysicalCanvasCoordinates ? '#a7f3d0' : '#9ca3af',
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
                  ? 'मुक्त लेआउट मोड सक्रिय (Free Placement Mode). क्लिक करके ऑटो-फ्लो पर स्विच करें'
                  : 'ऑटो-फ्लो मोड सक्रिय. क्लिक करके मुक्त लेआउट (Free Placement) सक्षम करें'
              }
              style={{
                backgroundColor: useFreeLayout ? '#1e1b4b' : '#374151',
                border: useFreeLayout ? '1px solid #6366f1' : '1px solid #4b5563',
                color: useFreeLayout ? '#c7d2fe' : '#9ca3af',
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
        <button
          onClick={() => onViewModeChange('landing')}
          title="मुख्य पृष्ठ पर लौटें"
          style={{
            backgroundColor: 'transparent',
            color: '#9ca3af',
            border: 'none',
            padding: '5px 8px',
            fontSize: '11.5px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← मुख्य पृष्ठ
        </button>

        <button
          onClick={onNewPublication}
          title="नया अख़बार बनाएं"
          style={{
            backgroundColor: '#1f2937',
            color: '#e5e7eb',
            border: '1px solid #374151',
            borderRadius: '2px',
            padding: '5px 8px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + नया
        </button>

        <button
          onClick={onOpenTemplates}
          title="टेम्पलेट प्रारूप"
          style={{
            backgroundColor: '#1f2937',
            color: '#e5e7eb',
            border: '1px solid #374151',
            borderRadius: '2px',
            padding: '5px 8px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          प्रारूप
        </button>

        {/* Auto Fit Button */}
        {onAutoFit && (
          <button
            onClick={onAutoFit}
            title="पेज के आर्टिकल को ऑटो-फ़िट करें और खाली जगह भरें (Auto Fit)"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
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
            ⚡ ऑटो-फ़िट
          </button>
        )}

        {/* Theme & Colors Button */}
        {onOpenTheme && (
          <button
            onClick={onOpenTheme}
            title="अख़बार का रंग व थीम बदलें (Colors & Themes)"
            style={{
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              border: 'none',
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
            🎨 रंग / थीम
          </button>
        )}

        {/* JSON Backup & Import */}
        {onExportProjectJson && (
          <button
            onClick={onExportProjectJson}
            title="प्रोजेक्ट का बैकअप JSON डाउनलोड करें (Export Project Backup)"
            style={{
              backgroundColor: '#334155',
              color: '#f8fafc',
              border: 'none',
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
            📁 बैकअप
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
              title="बैकअप JSON से प्रोजेक्ट लोड करें (Import Project JSON)"
              style={{
                backgroundColor: '#334155',
                color: '#f8fafc',
                border: 'none',
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
              📂 इम्पोर्ट
            </button>
          </>
        )}

        {/* Primary PDF Download Button */}
        <button
          data-testid="btn-export-pdf"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          title="300 DPI प्रेस-रेडी वेक्टर PDF डाउनलोड करें"
          style={{
            backgroundColor: '#b91c1c',
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
          <span>{isExportingPdf ? 'डाउनलोड...' : 'PDF'}</span>
        </button>

        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            title={isInspectorOpen ? 'पैनल छिपाएं' : 'पैनल दिखाएं'}
            style={{
              backgroundColor: isInspectorOpen ? '#1e293b' : 'transparent',
              border: '1px solid',
              borderColor: isInspectorOpen ? '#475569' : '#374151',
              color: isInspectorOpen ? '#60a5fa' : '#9ca3af',
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
            <span>पैनल</span>
          </button>
        )}
      </div>
    </header>
  );
};
