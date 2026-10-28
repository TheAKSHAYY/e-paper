import React from 'react';
import type { Article, ArticlePriority } from '@epaper-studio/document-schema';

export interface ArticlesListDrawerProps {
  articles: Article[];
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
  onAddArticle: () => void;
  onMoveArticle: (index: number, direction: 'up' | 'down') => void;
  onDeleteArticle: (id: string) => void;
}

export const ArticlesListDrawer: React.FC<ArticlesListDrawerProps> = ({
  articles,
  selectedArticleId,
  onSelectArticle,
  onAddArticle,
  onMoveArticle,
  onDeleteArticle,
}) => {
  const sortedArticles = [...articles].sort((a, b) => a.orderIndex - b.orderIndex);

  const priorityLabels: Record<ArticlePriority, { labelHi: string; color: string; bg: string }> = {
    lead: { labelHi: 'मुख्य लीड', color: '#fff', bg: '#b22222' },
    major: { labelHi: 'प्रमुख खबर', color: '#1565c0', bg: '#e3f2fd' },
    minor: { labelHi: 'सामान्य', color: '#2e7d32', bg: '#e8f5e9' },
    brief: { labelHi: 'संक्षेप', color: '#4a148c', bg: '#f3e5f5' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '13px',
            fontFamily: "'Noto Serif Devanagari', serif",
            fontWeight: 700,
            color: '#333',
          }}
        >
          अख़बार की खबरें ({articles.length})
        </h4>
        <button
          onClick={onAddArticle}
          data-testid="btn-add-article"
          style={{
            backgroundColor: '#1b5e20',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>➕</span>
          <span>खबर जोड़ें</span>
        </button>
      </div>

      {sortedArticles.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: '#666',
            fontSize: '13px',
            border: '2px dashed #d5d0c5',
            borderRadius: '6px',
            backgroundColor: '#fbfaf7',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>📝</div>
          <div>अख़बार में अभी कोई खबर नहीं है।</div>
          <div style={{ fontSize: '11.5px', color: '#888', marginTop: '4px' }}>
            ऊपर दिए गए &apos;+ खबर जोड़ें&apos; बटन को दबाकर शुरुआत करें।
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedArticles.map((article, index) => {
            const isSelected = article.id === selectedArticleId;
            const priorityInfo = priorityLabels[article.priority];

            return (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article.id)}
                data-testid={`article-list-item-${article.id}`}
                style={{
                  backgroundColor: isSelected ? '#fff9f9' : '#ffffff',
                  border: isSelected ? '2px solid #b22222' : '1px solid #dcd7cc',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: isSelected
                    ? '0 2px 6px rgba(178,34,34,0.15)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: priorityInfo.bg,
                        color: priorityInfo.color,
                      }}
                    >
                      {priorityInfo.labelHi}
                    </span>
                    <span style={{ fontSize: '11px', color: '#777' }}>
                      {article.columnSpan} {article.columnSpan === 1 ? 'कॉलम' : 'कॉलम चौड़ा'}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#b22222',
                          fontWeight: 700,
                        }}
                      >
                        • चयनित
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      fontFamily: "'Noto Serif Devanagari', serif",
                      color: '#111',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {article.headline || '(शीर्षकहीन खबर)'}
                  </div>
                </div>

                {/* Reordering & Delete Controls */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMoveArticle(index, 'up')}
                    title="खबर को ऊपर ले जाएँ"
                    aria-label={`खबर ${article.headline} को ऊपर ले जाएँ`}
                    style={{
                      background: '#eee',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      padding: '3px 7px',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      opacity: index === 0 ? 0.3 : 1,
                      fontSize: '11px',
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={index === sortedArticles.length - 1}
                    onClick={() => onMoveArticle(index, 'down')}
                    title="खबर को नीचे ले जाएँ"
                    aria-label={`खबर ${article.headline} को नीचे ले जाएँ`}
                    style={{
                      background: '#eee',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      padding: '3px 7px',
                      cursor: index === sortedArticles.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === sortedArticles.length - 1 ? 0.3 : 1,
                      fontSize: '11px',
                    }}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `क्या आप सचमुच "${article.headline.slice(0, 35)}..." को हटाना चाहते हैं?`
                        )
                      ) {
                        onDeleteArticle(article.id);
                      }
                    }}
                    title="खबर हटाएँ"
                    aria-label={`खबर ${article.headline} हटाएँ`}
                    style={{
                      background: '#ffebee',
                      border: '1px solid #ffcdd2',
                      borderRadius: '3px',
                      padding: '3px 7px',
                      color: '#c62828',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
