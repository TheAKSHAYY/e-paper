import React from 'react';
import type { NewspaperPage, Article, NewspaperPresetId } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';
import { PUBLISHER_DESIGN_SYSTEM } from '@epaper-studio/ui';
import { useI18n } from '../../i18n';
import { ElementsPanel } from './ElementsPanel';
import { LayoutBuilderRow } from './LayoutBuilderRow';

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
}) => {
  const [draggedOverPageIndex, setDraggedOverPageIndex] = React.useState<number | null>(null);
  const { locale } = useI18n();
  const colors = PUBLISHER_DESIGN_SYSTEM.colors;
  const presets = getAllNewspaperPresets();

  return (
    <aside
      data-testid="left-sidebar"
      style={{
        width: width ?? (isMobile ? '100%' : '280px'),
        backgroundColor: '#FFFFFF',
        borderRight: isMobile ? 'none' : `1px solid ${colors.borderMuted}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Tab Navigation & Collapse Button */}
      {!hideTabs && (
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${colors.borderMuted}`,
            backgroundColor: colors.warmPaper,
            padding: '4px 6px 0',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => onTabChange('pages')}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'pages' ? `2px solid ${colors.pressRed}` : '2px solid transparent',
              background: activeTab === 'pages' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'pages' ? colors.pressRed : colors.textMuted,
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {locale === 'en' ? 'Pages' : 'पृष्ठ'} ({pages.length})
          </button>

          <button
            onClick={() => onTabChange('blocks')}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              borderBottom: activeTab === 'blocks' ? `2px solid ${colors.pressRed}` : '2px solid transparent',
              background: activeTab === 'blocks' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'blocks' ? colors.pressRed : colors.textMuted,
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {locale === 'en' ? 'Elements' : 'तत्व'}
          </button>

          <button
            onClick={() => onTabChange('templates')}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              borderBottom:
                activeTab === 'templates' ? `2px solid ${colors.pressRed}` : '2px solid transparent',
              background: activeTab === 'templates' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'templates' ? colors.pressRed : colors.textMuted,
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {locale === 'en' ? 'Presets' : 'प्रारूप'}
          </button>

          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              title={locale === 'en' ? 'Collapse sidebar' : 'साइडबार छुपाएँ'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px 8px',
                fontSize: '13px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ◀
            </button>
          )}
        </div>
      )}

      {/* Content Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: activeTab === 'blocks' ? '0px' : isMobile ? '12px' : '16px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* ====================================================================
         * TAB 1: PAGES MANAGER
         * ==================================================================== */}
        {activeTab === 'pages' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  अख़बार के पेज
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  पेज प्रबंधित करें व क्रम बदलें
                </p>
              </div>

              <button
                data-testid="add-page-btn"
                onClick={onAddPage}
                title="नया पेज जोड़ें"
                style={{
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>+</span> नया पेज
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
                        ? '2px dashed #2563eb'
                        : isActive
                          ? '2px solid #b91c1c'
                          : '1px solid #e2e8f0',
                      backgroundColor: isDropTarget ? '#eff6ff' : isActive ? '#fff5f5' : '#ffffff',
                      cursor: 'grab',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(185, 28, 28, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Drag handle */}
                      <span
                        title="क्रम बदलने के लिए खींचें"
                        style={{
                          fontSize: '13px',
                          color: '#94a3b8',
                          cursor: 'grab',
                          userSelect: 'none',
                        }}
                      >
                        ⋮⋮
                      </span>

                      {/* Page badge */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: isActive ? '#b91c1c' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#0f172a',
                            fontFamily: PUBLISHER_DESIGN_SYSTEM.fonts.hindiEditorial,
                            lineHeight: 1.35,
                          }}
                        >
                          {page.sectionTitle || (isFirst ? 'मुख्य पृष्ठ' : `पेज ${index + 1}`)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {page.articles.length} खबरें
                          {isFirst ? ' • मास्टहेड' : ' • फोलियो'}
                        </div>
                      </div>
                    </div>

                    {/* Quick page actions */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        disabled={isFirst}
                        onClick={() => onMovePage(index, index - 1)}
                        title="पेज ऊपर करें"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isFirst ? '#cbd5e1' : '#64748b',
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          padding: '3px 4px',
                          fontSize: '11px',
                        }}
                      >
                        ▲
                      </button>

                      <button
                        disabled={isLast}
                        onClick={() => onMovePage(index, index + 1)}
                        title="पेज नीचे करें"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isLast ? '#cbd5e1' : '#64748b',
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          padding: '3px 4px',
                          fontSize: '11px',
                        }}
                      >
                        ▼
                      </button>

                      <button
                        onClick={() => onDuplicatePage(index)}
                        title="पेज की प्रति बनाएँ"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '3px 4px',
                          fontSize: '12px',
                        }}
                      >
                        📋
                      </button>

                      {pages.length > 1 && (
                        <button
                          onClick={() => onDeletePage(index)}
                          title="पेज हटाएँ"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '3px 4px',
                            fontSize: '12px',
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
         * TAB 2: ELEMENTS LIBRARY (APPLIED ELEMENTS + 5 CATEGORY PRESETS)
         * ==================================================================== */}
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
          />
        )}

        {/* ====================================================================
         * TAB 3: TEMPLATES & PRESETS (WITH 12-COL LAYOUT BUILDER)
         * ==================================================================== */}
        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {onApplyLayoutRow && <LayoutBuilderRow onApplyLayoutRow={onApplyLayoutRow} />}

            <div>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Newspaper Presets
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  Switch styles while preserving your stories
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
                        border: isSelected ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px',
                        backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#0f172a',
                            fontFamily: PUBLISHER_DESIGN_SYSTEM.fonts.hindiEditorial,
                            lineHeight: 1.35,
                          }}
                        >
                          {preset.name}
                        </span>

                        {isSelected && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              backgroundColor: '#b91c1c',
                              color: '#ffffff',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          marginBottom: '8px',
                          lineHeight: 1.35,
                        }}
                      >
                        {preset.description}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          fontSize: '10px',
                          color: '#475569',
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {preset.defaultColumns} Cols
                        </span>
                        <span
                          style={{
                            backgroundColor: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
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
    </aside>
  );
};
