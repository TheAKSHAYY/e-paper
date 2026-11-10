import React, { useState, useEffect, useMemo } from 'react';
import type { NewspaperDocument, EditorialPreset } from '@epaper-studio/document-schema';
import {
  COMPLETE_PAGE_TEMPLATES,
  type CompletePageTemplate,
  BUILTIN_MASTHEAD_PRESETS,
  type MastheadPresetItem,
  ARTICLE_LAYOUT_PRESETS,
  BUILTIN_EDITORIAL_PRESETS,
} from '@epaper-studio/template-engine';

export interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCompleteTemplate: (template: CompletePageTemplate, replaceArticles: boolean) => void;
  onApplyMastheadPreset: (preset: MastheadPresetItem) => void;
  onApplyArticleLayout: (preset: EditorialPreset) => void;
  onApplyEditorialPreset: (
    preset: EditorialPreset,
    placement?: 'masthead' | 'top' | 'bottom'
  ) => void;
  currentDoc?: NewspaperDocument;
  initialCategory?: GalleryCategory;
}

export type GalleryCategory =
  'all' | 'pages' | 'mastheads' | 'articles' | 'breaking' | 'dividers' | 'favorites';

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onApplyCompleteTemplate,
  onApplyMastheadPreset,
  onApplyArticleLayout,
  onApplyEditorialPreset,
  initialCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>(initialCategory || 'all');

  useEffect(() => {
    if (isOpen && initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSizeFilter, setPageSizeFilter] = useState<'all' | 'broadsheet' | 'tabloid'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('epaper_template_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Safe application confirmation dialog state
  const [pendingTemplate, setPendingTemplate] = useState<CompletePageTemplate | null>(null);
  const [replaceArticlesOption, setReplaceArticlesOption] = useState<boolean>(true);

  // Preview inspection modal state
  const [inspectingItem, setInspectingItem] = useState<{
    type: 'page' | 'masthead' | 'article' | 'editorial';
    data: CompletePageTemplate | MastheadPresetItem | EditorialPreset;
  } | null>(null);

  // Sync favorites to localStorage
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('epaper_template_favorites', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save favorites to localStorage:', err);
      }
      return next;
    });
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingTemplate) {
          setPendingTemplate(null);
        } else if (inspectingItem) {
          setInspectingItem(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pendingTemplate, inspectingItem, onClose]);

  // Filtered lists
  const filteredPages = useMemo(() => {
    return COMPLETE_PAGE_TEMPLATES.filter((tpl) => {
      if (pageSizeFilter !== 'all' && tpl.pageSize !== pageSizeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.tagline.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, pageSizeFilter]);

  const filteredMastheads = useMemo(() => {
    return BUILTIN_MASTHEAD_PRESETS.filter((mstd) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        mstd.name.toLowerCase().includes(q) ||
        mstd.description.toLowerCase().includes(q) ||
        (mstd.config.title && mstd.config.title.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    return ARTICLE_LAYOUT_PRESETS.filter((art) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        art.name.toLowerCase().includes(q) ||
        art.description.toLowerCase().includes(q) ||
        (art.data.headline && art.data.headline.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const filteredBreaking = useMemo(() => {
    return BUILTIN_EDITORIAL_PRESETS.filter((p) => p.category === 'breaking-banner').filter(
      (brk) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          brk.name.toLowerCase().includes(q) ||
          brk.description.toLowerCase().includes(q) ||
          (brk.data.headline && brk.data.headline.toLowerCase().includes(q))
        );
      }
    );
  }, [searchQuery]);

  const filteredDividers = useMemo(() => {
    return BUILTIN_EDITORIAL_PRESETS.filter(
      (p) =>
        p.category === 'section-divider' ||
        p.category === 'category-label' ||
        p.category === 'special-report' ||
        p.category === 'dateline-strip' ||
        p.category === 'ad-banner'
    ).filter((div) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        div.name.toLowerCase().includes(q) ||
        div.description.toLowerCase().includes(q) ||
        (div.data.headline && div.data.headline.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="template-gallery-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Noto Serif Devanagari', 'Hind', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1180px',
          height: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* MODAL HEADER */}
        {/* ================================================================= */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>📰</span>
              <h2
                style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}
              >
                हिंदी समाचार पत्र टेम्पलेट पुस्तकालय (Template Library)
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                50+ रेडीमेड डिज़ाइन
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
              तैयार समाचार पत्र प्रारूप चुनें, अपनी खबरें व फोटो बदलें और तुरंत पेशेवर PDF प्रकाशित
              करें।
            </p>
          </div>

          <button
            onClick={onClose}
            data-testid="template-gallery-close"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* ================================================================= */}
        {/* TOOLBAR: SEARCH, CATEGORIES & FILTERS */}
        {/* ================================================================= */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'सभी (All)', count: 50 },
              { id: 'pages', label: 'पूरे अखबार पृष्ठ (Full Pages)', count: 5 },
              { id: 'mastheads', label: 'मास्टहेड (Mastheads)', count: 10 },
              { id: 'articles', label: 'आर्टिकल लेआउट (Articles)', count: 10 },
              { id: 'breaking', label: 'ब्रेकिंग न्यूज़ (Breaking)', count: 10 },
              { id: 'dividers', label: 'सब-हेडर व डिवाइडर (Dividers)', count: 15 },
              {
                id: 'favorites',
                label: `⭐ पसंदीदा (${favorites.length})`,
                count: favorites.length,
              },
            ].map((cat) => (
              <button
                key={cat.id}
                data-testid={`category-tab-${cat.id}`}
                onClick={() => setActiveCategory(cat.id as GalleryCategory)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeCategory === cat.id ? '1px solid #b91c1c' : '1px solid #cbd5e1',
                  backgroundColor: activeCategory === cat.id ? '#b91c1c' : '#ffffff',
                  color: activeCategory === cat.id ? '#ffffff' : '#334155',
                  transition: 'all 0.15s ease',
                  boxShadow:
                    activeCategory === cat.id ? '0 2px 4px rgba(185, 28, 28, 0.2)' : 'none',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box & Format Dropdown */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <input
                type="text"
                placeholder="खोजें (जैसे राष्ट्रीय, किसान, ब्रेकिंग)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '9px',
                  top: '7px',
                  fontSize: '13px',
                  color: '#94a3b8',
                }}
              >
                🔍
              </span>
            </div>

            {activeCategory === 'pages' && (
              <select
                value={pageSizeFilter}
                onChange={(e) =>
                  setPageSizeFilter(e.target.value as 'all' | 'broadsheet' | 'tabloid')
                }
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <option value="all">सभी आकार (All Sizes)</option>
                <option value="broadsheet">ब्रॉडशीट (Broadsheet)</option>
                <option value="tabloid">टैब्लॉइड (Tabloid)</option>
              </select>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* TEMPLATE CARDS GRID AREA */}
        {/* ================================================================= */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#f1f5f9' }}>
          {/* CATEGORY: FULL PAGES */}
          {(activeCategory === 'all' ||
            activeCategory === 'pages' ||
            activeCategory === 'favorites') && (
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  पूरे समाचार पत्र पृष्ठ (Complete Newspaper Pages)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredPages.length} टेम्पलेट उपलब्ध
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '18px',
                }}
              >
                {filteredPages.map((tpl) => {
                  const isFav = favorites.includes(tpl.id);
                  if (activeCategory === 'favorites' && !isFav) return null;

                  return (
                    <div
                      key={tpl.id}
                      data-testid={`template-card-${tpl.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      {/* Visual SVG Miniature */}
                      <div
                        style={{
                          height: '140px',
                          backgroundColor: '#faf8f5',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* Broadsheet miniature SVG */}
                        <svg viewBox="0 0 120 150" width="80" height="100" fill="none">
                          <rect
                            width="120"
                            height="150"
                            rx="3"
                            fill="#FFFFFF"
                            stroke="#D1D5DB"
                            strokeWidth="1.5"
                          />
                          {/* Masthead */}
                          <rect x="8" y="8" width="104" height="20" fill="#1E293B" rx="1" />
                          <line x1="8" y1="32" x2="112" y2="32" stroke="#1E293B" strokeWidth="1" />
                          {/* Lead story */}
                          <rect x="8" y="36" width="68" height="32" fill="#E2E8F0" rx="1" />
                          <rect x="8" y="72" width="32" height="40" fill="#F1F5F9" rx="1" />
                          <rect x="44" y="72" width="32" height="40" fill="#F1F5F9" rx="1" />
                          {/* Right side column */}
                          <rect x="80" y="36" width="32" height="76" fill="#F1F5F9" rx="1" />
                          {/* Bottom banner */}
                          <rect
                            x="8"
                            y="116"
                            width="104"
                            height="24"
                            fill="#F8FAFC"
                            stroke="#E2E8F0"
                            rx="1"
                          />
                        </svg>

                        {/* Badges */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {tpl.pageSize === 'broadsheet'
                            ? 'ब्रॉडशीट (Broadsheet)'
                            : 'टैब्लॉइड (Tabloid)'}
                        </span>

                        <button
                          onClick={(e) => toggleFavorite(tpl.id, e)}
                          title="पसंदीदा में जोड़ें"
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            cursor: 'pointer',
                            color: isFav ? '#eab308' : '#94a3b8',
                          }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>

                      {/* Content details */}
                      <div
                        style={{
                          padding: '14px',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#0f172a',
                          }}
                        >
                          {tpl.name}
                        </h4>
                        <p
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: '11.5px',
                            color: '#b91c1c',
                            fontWeight: 600,
                          }}
                        >
                          {tpl.tagline}
                        </p>
                        <p
                          style={{
                            margin: '0 0 14px 0',
                            fontSize: '11.5px',
                            color: '#64748b',
                            lineHeight: 1.4,
                            flex: 1,
                          }}
                        >
                          {tpl.description}
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setPendingTemplate(tpl)}
                            style={{
                              flex: 1,
                              backgroundColor: '#b91c1c',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>✓</span> लागू करें (Apply)
                          </button>
                          <button
                            onClick={() => setInspectingItem({ type: 'page', data: tpl })}
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            पूर्वावलोकन
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY: MASTHEADS */}
          {(activeCategory === 'all' ||
            activeCategory === 'mastheads' ||
            activeCategory === 'favorites') && (
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  अखबार मास्टहेड टेम्पलेट्स (Authentic Masthead Designs)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredMastheads.length} टेम्पलेट उपलब्ध
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                {filteredMastheads.map((mstd) => {
                  const isFav = favorites.includes(mstd.id);
                  if (activeCategory === 'favorites' && !isFav) return null;

                  return (
                    <div
                      key={mstd.id}
                      data-testid={`template-card-${mstd.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '13.5px', fontWeight: 700 }}>
                            {mstd.name}
                          </h4>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {mstd.category}
                          </span>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(mstd.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            color: isFav ? '#eab308' : '#cbd5e1',
                          }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>

                      {/* Masthead miniature preview */}
                      <div
                        style={{
                          padding: '12px',
                          backgroundColor: '#faf8f5',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>
                          मौसम: 25°C • नई दिल्ली | मूल्य ₹5.00
                        </div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            fontFamily: mstd.config.fontFamily || "'Rozha One', serif",
                            color: mstd.config.titleColor || '#0f172a',
                            borderBottom: '1.5px double #0f172a',
                            paddingBottom: '4px',
                            marginBottom: '4px',
                          }}
                        >
                          {mstd.config.title || mstd.name}
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#475569' }}>
                          {mstd.config.tagline || 'सत्य, निष्पक्षता और जनसेवा का प्रतीक'}
                        </div>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '11.5px',
                          color: '#64748b',
                          lineHeight: 1.35,
                        }}
                      >
                        {mstd.description}
                      </p>

                      <button
                        onClick={() => {
                          onApplyMastheadPreset(mstd);
                          onClose();
                        }}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginTop: 'auto',
                        }}
                      >
                        यह मास्टहेड लागू करें
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY: ARTICLE LAYOUTS */}
          {(activeCategory === 'all' ||
            activeCategory === 'articles' ||
            activeCategory === 'favorites') && (
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  आर्टिकल लेआउट शैलियां (Article Layout Structures)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredArticles.length} टेम्पलेट उपलब्ध
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '14px',
                }}
              >
                {filteredArticles.map((art) => {
                  const isFav = favorites.includes(art.id);
                  if (activeCategory === 'favorites' && !isFav) return null;

                  return (
                    <div
                      key={art.id}
                      data-testid={`template-card-${art.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{art.icon}</span>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                            {art.name}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(art.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '15px',
                            cursor: 'pointer',
                            color: isFav ? '#eab308' : '#cbd5e1',
                          }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>

                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                        {art.description}
                      </p>

                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '8px 10px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        {art.data.headline}
                      </div>

                      <button
                        onClick={() => {
                          onApplyArticleLayout(art);
                          onClose();
                        }}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginTop: 'auto',
                        }}
                      >
                        पेज पर जोड़ें (+ Add Block)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY: BREAKING NEWS */}
          {(activeCategory === 'all' ||
            activeCategory === 'breaking' ||
            activeCategory === 'favorites') && (
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  ब्रेकिंग न्यूज़ बैनर शैलियां (Breaking News Banners)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredBreaking.length} टेम्पलेट उपलब्ध
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '14px',
                }}
              >
                {filteredBreaking.map((brk) => {
                  const isFav = favorites.includes(brk.id);
                  if (activeCategory === 'favorites' && !isFav) return null;

                  return (
                    <div
                      key={brk.id}
                      data-testid={`template-card-${brk.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{brk.icon}</span>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                            {brk.name}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(brk.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '15px',
                            cursor: 'pointer',
                            color: isFav ? '#eab308' : '#cbd5e1',
                          }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>

                      {/* Live preview banner snippet */}
                      <div
                        style={{
                          backgroundColor: brk.data.backgroundColor || '#b91c1c',
                          color: brk.data.textColor || '#ffffff',
                          padding: '8px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        <div style={{ fontSize: '9px', opacity: 0.9, marginBottom: '2px' }}>
                          {brk.data.kickerText || 'ब्रेकिंग'}
                        </div>
                        {brk.data.headline}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                          marginTop: 'auto',
                        }}
                      >
                        <button
                          type="button"
                          data-testid={`btn-apply-masthead-sub-${brk.id}`}
                          onClick={() => {
                            onApplyEditorialPreset(brk, 'masthead');
                            onClose();
                          }}
                          style={{
                            backgroundColor: '#991b1b',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 4px',
                            borderRadius: '5px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                          }}
                          title="मास्टहेड की सब-हेडर घोषणा पट्टी में लगाएँ"
                        >
                          📢 मास्टहेड पट्टी
                        </button>
                        <button
                          type="button"
                          data-testid={`btn-apply-top-banner-${brk.id}`}
                          onClick={() => {
                            onApplyEditorialPreset(brk, 'top');
                            onClose();
                          }}
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 4px',
                            borderRadius: '5px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                          }}
                          title="पेज के शीर्ष पर मुख्य बैनर की तरह जोड़ें"
                        >
                          📰 पेज शीर्ष पर
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CATEGORY: DIVIDERS & SUB-HEADERS */}
          {(activeCategory === 'all' ||
            activeCategory === 'dividers' ||
            activeCategory === 'favorites') && (
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  सब-हेडर व अनुभाग विभाजक (Sub-headers & Section Dividers)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredDividers.length} टेम्पलेट उपलब्ध
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '14px',
                }}
              >
                {filteredDividers.map((div) => {
                  const isFav = favorites.includes(div.id);
                  if (activeCategory === 'favorites' && !isFav) return null;

                  return (
                    <div
                      key={div.id}
                      data-testid={`template-card-${div.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{div.icon}</span>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                            {div.name}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(div.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '15px',
                            cursor: 'pointer',
                            color: isFav ? '#eab308' : '#cbd5e1',
                          }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                      </div>

                      {/* Divider snippet */}
                      <div
                        style={{
                          backgroundColor: div.data.backgroundColor || '#f8fafc',
                          color: div.data.textColor || '#0f172a',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {div.data.headline}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                          marginTop: 'auto',
                        }}
                      >
                        <button
                          type="button"
                          data-testid={`btn-apply-masthead-div-${div.id}`}
                          onClick={() => {
                            onApplyEditorialPreset(div, 'masthead');
                            onClose();
                          }}
                          style={{
                            backgroundColor: '#0369a1',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 4px',
                            borderRadius: '5px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                          }}
                          title="मास्टहेड की सब-हेडर घोषणा पट्टी में लगाएँ"
                        >
                          📢 मास्टहेड पट्टी
                        </button>
                        <button
                          type="button"
                          data-testid={`btn-apply-top-divider-${div.id}`}
                          onClick={() => {
                            onApplyEditorialPreset(div, 'top');
                            onClose();
                          }}
                          style={{
                            backgroundColor: '#334155',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 4px',
                            borderRadius: '5px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                          }}
                          title="पेज के शीर्ष पर विभाजक पट्टी जोड़ें"
                        >
                          📰 पेज शीर्ष पर
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SAFE APPLICATION CONFIRMATION DIALOG (PREVENT DATA LOSS) */}
        {/* ================================================================= */}
        {pendingTemplate && (
          <div
            data-testid="template-apply-confirm-modal"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setPendingTemplate(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
              >
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  टेम्पलेट लागू करें (Apply Template)
                </h3>
              </div>

              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                आप <strong>"{pendingTemplate.name}"</strong> लागू करने जा रहे हैं। कृपया चुनें कि आप
                अपनी मौजूदा सामग्री का क्या करना चाहते हैं:
              </p>

              {/* Options */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: replaceArticlesOption ? '#fff1f2' : '#f8fafc',
                    borderRadius: '8px',
                    border: replaceArticlesOption ? '1.5px solid #b91c1c' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="apply_mode"
                    value="replace"
                    checked={replaceArticlesOption}
                    onChange={() => setReplaceArticlesOption(true)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      सभी सामग्री नई टेम्पलेट से बदलें (अनुशंसित)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      नया मास्टहेड, हेडिंग, लेआउट व सैंपल समाचार लोड होंगे।
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: !replaceArticlesOption ? '#eff6ff' : '#f8fafc',
                    borderRadius: '8px',
                    border: !replaceArticlesOption ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="apply_mode"
                    value="preserve"
                    checked={!replaceArticlesOption}
                    onChange={() => setReplaceArticlesOption(false)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      मेरे मौजूदा समाचार व आलेख सुरक्षित रखें (Preserve Articles)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      केवल अखबार का आकार, मास्टहेड स्टाइल व लेआउट ग्रिड बदलेगा।
                    </div>
                  </div>
                </label>
              </div>

              {/* Dialog action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setPendingTemplate(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  data-testid="template-confirm-apply-btn"
                  onClick={() => {
                    onApplyCompleteTemplate(pendingTemplate, replaceArticlesOption);
                    setPendingTemplate(null);
                    onClose();
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  हाँ, लागू करें (Confirm)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* INSPECTION PREVIEW MODAL */}
        {/* ================================================================= */}
        {inspectingItem && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              zIndex: 1150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setInspectingItem(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '650px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {inspectingItem.data.name}
                </h3>
                <button
                  onClick={() => setInspectingItem(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {'description' in inspectingItem.data && (
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
                  {inspectingItem.data.description}
                </p>
              )}

              <div
                style={{
                  backgroundColor: '#faf8f5',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                }}
              >
                {inspectingItem.type === 'page' && (
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        color: '#b91c1c',
                      }}
                    >
                      {(inspectingItem.data as CompletePageTemplate).tagline}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      • पृष्ठ आकार:{' '}
                      {(inspectingItem.data as CompletePageTemplate).pageSize.toUpperCase()}
                      <br />• कॉलम संख्या:{' '}
                      {(inspectingItem.data as CompletePageTemplate).columnCount} कॉलम
                      <br />• वास्तविक समाचार, फोटो व बॉर्डर लेआउट शामिल।
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setInspectingItem(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  बंद करें
                </button>
                {inspectingItem.type === 'page' && (
                  <button
                    data-testid="template-preview-apply"
                    onClick={() => {
                      const tpl = inspectingItem.data as CompletePageTemplate;
                      setInspectingItem(null);
                      setPendingTemplate(tpl);
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#b91c1c',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    यह टेम्पलेट लागू करें
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
