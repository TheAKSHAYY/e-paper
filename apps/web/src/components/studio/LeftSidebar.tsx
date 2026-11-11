import React from 'react';
import type { NewspaperPage, Article, NewspaperPresetId } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';
import { ElementsPanel } from './ElementsPanel';
import { LayoutBuilderRow } from './LayoutBuilderRow';
import { ChevronLeftIcon, CopyIcon, DownloadIcon, TrashIcon } from './StudioIcons';

export type SidebarTab = 'pages' | 'blocks' | 'templates';

export interface LeftSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  pages: NewspaperPage[];
  currentPageIndex: number;
  onSelectPage: (pageIndex: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onMoveArticleToPage?: (articleId: string, targetPageIndex: number) => void;
  onAddBlock: (blockTemplate: Partial<Article>) => void;
  currentPresetId: NewspaperPresetId;
  onSelectPreset: (presetId: NewspaperPresetId) => void;
  onCloseSidebar?: () => void;
  selectedArticleId?: string | null;
  onSelectArticle?: (id: string) => void;
  onDuplicateArticle?: (id: string) => void;
  onDeleteArticle?: (id: string) => void;
  onMoveArticleUp?: (id: string) => void;
  onMoveArticleDown?: (id: string) => void;
  onApplyLayoutRow?: (columns: number[]) => void;
  isMobile?: boolean;
  hideTabs?: boolean;
  width?: string | number;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
  isPageFull?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onMoveArticleToPage,
  onAddBlock,
  currentPresetId,
  onSelectPreset,
  onCloseSidebar,
  selectedArticleId = null,
  onSelectArticle = () => {},
  onDuplicateArticle = () => {},
  onDeleteArticle = () => {},
  onMoveArticleUp = () => {},
  onMoveArticleDown = () => {},
  onApplyLayoutRow,
  isMobile = false,
  hideTabs = false,
  width,
  onExportPdf,
  isExportingPdf = false,
  isPageFull = false,
}) => {
  const [draggedOverPageIndex, setDraggedOverPageIndex] = React.useState<number | null>(null);
  const { locale } = useI18n();
  const isHi = locale === 'hi';
  const fonts = PUBLISHER_DESIGN_SYSTEM.fonts;
  const presets = getAllNewspaperPresets();

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '9px 6px',
    fontSize: '12px',
    fontWeight: isActive ? 600 : 500,
    border: 'none',
    borderBottom: isActive ? '2px solid #B91C1C' : '2px solid transparent',
    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
    color: isActive ? '#991B1B' : '#6B645C',
    cursor: 'pointer',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 120ms ease, background-color 120ms ease',
  });

  return (
    <aside
      data-testid="left-sidebar"
      style={{
        width: width ?? (isMobile ? '100%' : '292px'),
        backgroundColor: '#FFFFFF',
        borderRight: isMobile ? 'none' : '1px solid #E3DCD0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
        fontFamily: "'Poppins', 'Hind', sans-serif",
      }}
    >
      {/* Tab Navigation & Collapse Button */}
      {!hideTabs && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E3DCD0',
            backgroundColor: '#FAF8F5',
            padding: '6px 8px 0',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => onTabChange('pages')}
            style={tabButtonStyle(activeTab === 'pages')}
          >
            {isHi ? 'पेज' : 'Pages'} ({pages.length})
          </button>

          <button
            type="button"
            onClick={() => onTabChange('blocks')}
            style={tabButtonStyle(activeTab === 'blocks')}
          >
            {isHi ? 'तत्व' : 'Elements'}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('templates')}
            style={tabButtonStyle(activeTab === 'templates')}
          >
            {isHi ? 'प्रारूप' : 'Presets'}
          </button>

          {onCloseSidebar && (
            <button
              type="button"
              onClick={onCloseSidebar}
              className="studio-rail-btn"
              title={isHi ? 'साइडबार बंद करें' : 'Collapse sidebar'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#78716C',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2px',
              }}
            >
              <ChevronLeftIcon size={14} />
            </button>
          )}
        </div>
      )}

      {/* Content Container */}
      <div
        className="studio-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: activeTab === 'blocks' ? '0px' : isMobile ? '12px' : '16px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* TAB 1: PAGES MANAGER */}
        {activeTab === 'pages' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#1C1917' }}>
                  {isHi ? 'अख़बार के पेज' : 'Newspaper Pages'}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#6B645C' }}>
                  {isHi ? 'पेज जोड़ें या क्रम बदलें' : 'Manage & reorder pages'}
                </p>
              </div>

              <button
                type="button"
                data-testid="add-page-btn"
                onClick={onAddPage}
                title={isHi ? 'नया पेज जोड़ें' : 'Add new page'}
                style={{
                  backgroundColor: '#B91C1C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 11px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(185, 28, 28, 0.22)',
                }}
              >
                <span>+</span> {isHi ? 'नया पेज' : 'New Page'}
              </button>
            </div>

            {/* Pages Thumbnail List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pages.map((page, index) => {
                const isActive = index === currentPageIndex;
                const isFirst = index === 0;
                const isLast = index === pages.length - 1;
                const isDropTarget = draggedOverPageIndex === index;

                return (
                  <div
                    key={page.id}
                    data-testid={`page-thumbnail-card-${page.id}`}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/epaper-page-index', String(index));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggedOverPageIndex !== index) {
                        setDraggedOverPageIndex(index);
                      }
                    }}
                    onDragLeave={() => {
                      if (draggedOverPageIndex === index) {
                        setDraggedOverPageIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggedOverPageIndex(null);
                      const articleId = e.dataTransfer.getData('application/epaper-article-id');
                      if (articleId && onMoveArticleToPage) {
                        onMoveArticleToPage(articleId, index);
                        return;
                      }
                      const fromPageIndexStr = e.dataTransfer.getData(
                        'application/epaper-page-index'
                      );
                      if (fromPageIndexStr) {
                        const fromPageIndex = parseInt(fromPageIndexStr, 10);
                        if (!isNaN(fromPageIndex) && fromPageIndex !== index) {
                          onMovePage(fromPageIndex, index);
                        }
                      }
                    }}
                    onClick={() => onSelectPage(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isDropTarget
                        ? '1.5px dashed #1C1917'
                        : isActive
                          ? '1.5px solid #B91C1C'
                          : '1px solid #E3DCD0',
                      backgroundColor: isDropTarget ? '#F3EFE8' : isActive ? '#FFF8F6' : '#FFFFFF',
                      cursor: 'grab',
                      transition: 'all 140ms ease',
                      boxShadow: isActive ? '0 2px 8px rgba(185, 28, 28, 0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                      <span
                        title={isHi ? 'ऊपर-नीचे खींचकर क्रम बदलें' : 'Drag to reorder'}
                        style={{
                          fontSize: '12px',
                          color: '#A8A29E',
                          cursor: 'grab',
                          userSelect: 'none',
                        }}
                      >
                        ⋮⋮
                      </span>

                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: isActive ? '#B91C1C' : '#F3EFE8',
                          color: isActive ? '#FFFFFF' : '#44403C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          fontVariantNumeric: 'tabular-nums',
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#1C1917',
                            fontFamily: fonts.hindiEditorial,
                            lineHeight: 1.35,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {page.sectionTitle ||
                            (isFirst
                              ? isHi
                                ? 'पहला पेज'
                                : 'Front Page'
                              : isHi
                                ? `पेज ${index + 1}`
                                : `Page ${index + 1}`)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#6B645C' }}>
                          {page.articles.length} {isHi ? 'ख़बरें' : 'stories'} ·{' '}
                          {isFirst
                            ? isHi
                              ? 'मास्टहेड'
                              : 'Masthead'
                            : isHi
                              ? 'अंदर का पेज'
                              : 'Inside'}
                        </div>
                      </div>
                    </div>

                    {/* Quick page actions */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => onMovePage(index, index - 1)}
                        title={isHi ? 'पेज ऊपर करें' : 'Move up'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isFirst ? '#D6CFC4' : '#78716C',
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          padding: '4px',
                          fontSize: '10px',
                        }}
                      >
                        ▲
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => onMovePage(index, index + 1)}
                        title={isHi ? 'पेज नीचे करें' : 'Move down'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isLast ? '#D6CFC4' : '#78716C',
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          padding: '4px',
                          fontSize: '10px',
                        }}
                      >
                        ▼
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicatePage(index)}
                        title={isHi ? 'पेज की कॉपी बनाएँ' : 'Duplicate page'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6B645C',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        <CopyIcon size={13} />
                      </button>

                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeletePage(index)}
                          title={isHi ? 'पेज हटाएँ' : 'Delete page'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ELEMENTS LIBRARY */}
        {activeTab === 'blocks' && (
          <ElementsPanel
            articles={pages[currentPageIndex]?.articles ?? []}
            selectedArticleId={selectedArticleId}
            onSelectArticle={onSelectArticle}
            onAddElement={onAddBlock}
            onDuplicateArticle={onDuplicateArticle}
            onDeleteArticle={onDeleteArticle}
            onMoveArticleUp={onMoveArticleUp}
            onMoveArticleDown={onMoveArticleDown}
            pageNumber={currentPageIndex + 1}
            isPageFull={isPageFull}
          />
        )}

        {/* TAB 3: TEMPLATES & PRESETS */}
        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {onApplyLayoutRow && <LayoutBuilderRow onApplyLayoutRow={onApplyLayoutRow} />}

            <div>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#1C1917' }}>
                  {isHi ? 'अख़बार के प्रारूप' : 'Newspaper Presets'}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#6B645C' }}>
                  {isHi
                    ? 'आपकी ख़बरें वैसी ही रहेंगी, बस स्टाइल बदलेगा'
                    : 'Switch styles while preserving your stories'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {presets.map((preset) => {
                  const isSelected = preset.id === currentPresetId;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => onSelectPreset(preset.id)}
                      style={{
                        border: isSelected ? '1.5px solid #B91C1C' : '1px solid #E3DCD0',
                        borderRadius: '8px',
                        padding: '12px',
                        backgroundColor: isSelected ? '#FFF8F6' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 140ms ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1C1917',
                            fontFamily: fonts.hindiEditorial,
                            lineHeight: 1.35,
                          }}
                        >
                          {preset.name}
                        </span>

                        {isSelected && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              backgroundColor: '#B91C1C',
                              color: '#FFFFFF',
                              padding: '2px 7px',
                              borderRadius: '999px',
                            }}
                          >
                            {isHi ? 'चालू' : 'ACTIVE'}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '11.5px',
                          color: '#6B645C',
                          marginBottom: '8px',
                          lineHeight: 1.4,
                        }}
                      >
                        {preset.description}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          fontSize: '10.5px',
                          color: '#57524C',
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: '#F3EFE8',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontWeight: 500,
                          }}
                        >
                          {preset.defaultColumns} {isHi ? 'कॉलम' : 'Cols'}
                        </span>
                        <span
                          style={{
                            backgroundColor: '#F3EFE8',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                          }}
                        >
                          {preset.recommendedPageSize}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {onExportPdf && (
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid #E3DCD0',
            backgroundColor: '#FAF8F5',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            data-testid="sidebar-btn-export-pdf"
            style={{
              width: '100%',
              backgroundColor: isExportingPdf ? '#991B1B' : '#B91C1C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '7px',
              padding: '9px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: isExportingPdf ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              boxShadow: '0 2px 6px rgba(185, 28, 28, 0.25)',
            }}
          >
            <DownloadIcon size={14} />
            <span>
              {isExportingPdf
                ? isHi
                  ? 'PDF बन रहा है...'
                  : 'Generating PDF...'
                : isHi
                  ? 'प्रिंट PDF डाउनलोड करें'
                  : 'Download Print PDF'}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};
