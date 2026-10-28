import React from 'react';
import type { NewspaperPage, Article, NewspaperPresetId } from '@epaper-studio/document-schema';
import { getAllNewspaperPresets } from '@epaper-studio/template-engine';
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
}) => {
  const presets = getAllNewspaperPresets();

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
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
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
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
            borderBottom: activeTab === 'pages' ? '2px solid #b91c1c' : '2px solid transparent',
            background: activeTab === 'pages' ? '#ffffff' : 'transparent',
            color: activeTab === 'pages' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          पेज ({pages.length})
        </button>

        <button
          onClick={() => onTabChange('blocks')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: '11px',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'blocks' ? '2px solid #b91c1c' : '2px solid transparent',
            background: activeTab === 'blocks' ? '#ffffff' : 'transparent',
            color: activeTab === 'blocks' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          तत्व (Catalog)
        </button>

        <button
          onClick={() => onTabChange('templates')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: '11px',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'templates' ? '2px solid #b91c1c' : '2px solid transparent',
            background: activeTab === 'templates' ? '#ffffff' : 'transparent',
            color: activeTab === 'templates' ? '#0f172a' : '#64748b',
            cursor: 'pointer',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          प्रारूप (Presets)
        </button>

        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            title="Collapse sidebar (साइडबार छुपाएँ)"
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

      {/* Content Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          boxSizing: 'border-box',
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

                return (
                  <div
                    key={page.id}
                    onClick={() => onSelectPage(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#fff5f5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(185, 28, 28, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            fontFamily: "'Noto Serif Devanagari', serif",
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
                            fontFamily: "'Noto Serif Devanagari', serif",
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
