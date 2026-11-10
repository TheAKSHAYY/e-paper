import React, { useState, useMemo, useEffect } from 'react';
import {
  getAvailableDesignTemplates,
  type DesignLibraryItem,
  POC_DESIGN_TEMPLATES,
} from '@epaper-studio/template-engine';

export interface DesignLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertDesign: (design: DesignLibraryItem, targetPageIndex?: number) => void;
  totalPages?: number;
  currentPageIndex?: number;
  initialCategory?: string;
}

export type DesignCategoryFilter =
  | 'all'
  | 'poc'
  | 'headers'
  | 'columns'
  | 'subheaders'
  | 'rashifal'
  | 'ads'
  | 'footers'
  | 'start-decor'
  | 'calendar'
  | 'favorites';

export const DesignLibraryModal: React.FC<DesignLibraryModalProps> = ({
  isOpen,
  onClose,
  onInsertDesign,
  totalPages = 1,
  currentPageIndex = 0,
  initialCategory = 'all',
}) => {
  const [activeCategory, setActiveCategory] = useState<DesignCategoryFilter>(
    (initialCategory as DesignCategoryFilter) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(currentPageIndex);
  const [inspectingDesign, setInspectingDesign] = useState<DesignLibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'comparison'>('comparison');
  const [insertSuccessMsg, setInsertSuccessMsg] = useState<string | null>(null);

  // Responsive mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('epaper_design_library_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('epaper_design_library_favorites', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save favorites to localStorage:', err);
      }
      return next;
    });
  };

  const allTemplates = useMemo(() => getAvailableDesignTemplates(), []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let list = allTemplates;

    if (activeCategory === 'poc') {
      list = POC_DESIGN_TEMPLATES;
    } else if (activeCategory === 'favorites') {
      list = list.filter((item) => favorites.includes(item.id));
    } else if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.subcategory.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allTemplates, activeCategory, searchQuery, favorites]);

  // Handle Insertion
  const handleInsert = (design: DesignLibraryItem) => {
    onInsertDesign(design, selectedPageIndex);
    setInsertSuccessMsg(`✓ "${design.name}" को पृष्ठ ${selectedPageIndex + 1} पर जोड़ा गया!`);
    setTimeout(() => {
      setInsertSuccessMsg(null);
    }, 3500);
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectingDesign) {
          setInspectingDesign(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectingDesign, onClose]);

  const categoryList = [
    { id: 'poc', label: '★ 10 सत्यापित PoC', shortLabel: '★ 10 PoC', count: 10, highlight: true },
    { id: 'all', label: 'सभी प्रारूप (All)', shortLabel: 'सभी (147)', count: 147 },
    { id: 'headers', label: 'मास्टहेड / शीर्ष सज्जा', shortLabel: 'मास्टहेड (34)', count: 34 },
    { id: 'columns', label: 'कॉलम व समाचार लेआउट', shortLabel: 'कॉलम (78)', count: 78 },
    { id: 'subheaders', label: 'ब्रेकिंग न्यूज़ व सब-हेडर', shortLabel: 'सब-हेडर (8)', count: 8 },
    { id: 'rashifal', label: 'दैनिक राशिफल (Horoscope)', shortLabel: 'राशिफल (4)', count: 4 },
    { id: 'ads', label: 'विज्ञापन (Advertisements)', shortLabel: 'विज्ञापन (9)', count: 9 },
    { id: 'footers', label: 'पादलेख (Footers)', shortLabel: 'पादलेख (6)', count: 6 },
    { id: 'start-decor', label: 'विभाजक रेखाएँ व सज्जा', shortLabel: 'सज्जा (6)', count: 6 },
    { id: 'calendar', label: 'पंचांग व कैलेंडर', shortLabel: 'कैलेंडर (2)', count: 2 },
    { id: 'favorites', label: '♥ पसंदीदा (Favorites)', shortLabel: '♥ पसंदीदा', count: favorites.length },
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="design-library-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: isMobile ? 0 : '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? 0 : '16px',
          width: isMobile ? '100vw' : '95vw',
          maxWidth: isMobile ? '100vw' : '1280px',
          height: isMobile ? '100dvh' : '90vh',
          maxHeight: isMobile ? '100dvh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: isMobile ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div
          style={{
            padding: isMobile ? '10px 14px' : '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', minWidth: 0 }}>
            <span style={{ fontSize: isMobile ? '20px' : '24px' }}>📰</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: isMobile ? '14px' : '18px',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isMobile ? 'डिज़ाइन लाइब्रेरी' : '278 समाचार पत्र डिज़ाइन लाइब्रेरी'}
                </h2>
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMobile ? '278 डिज़ाइन' : '278 संदर्भ • 147 अद्वितीय प्रारूप'}
                </span>
              </div>
              {!isMobile && (
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  पारंपरिक एवं आधुनिक समाचार पत्र डिज़ाइनों का संपादन-योग्य संग्रह। क्लिक करके सीधे कैनवास में जोड़ें।
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px', flexShrink: 0 }}>
            {/* Target Page Selector */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {!isMobile && (
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    पृष्ठ:
                  </label>
                )}
                <select
                  value={selectedPageIndex}
                  onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
                  style={{
                    padding: isMobile ? '4px 6px' : '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 600,
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i} value={i}>
                      पृष्ठ {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              data-testid="close-design-library-btn"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: isMobile ? '22px' : '20px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px 8px',
                borderRadius: '6px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Mobile Search and Horizontal Category Pills Bar ── */}
        {isMobile && (
          <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            {/* Mobile Search Bar */}
            <div style={{ padding: '8px 12px 6px 12px', position: 'relative' }}>
              <input
                type="text"
                data-testid="input-design-search"
                placeholder="डिज़ाइन खोजें (Search)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 28px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px',
                  color: '#94a3b8',
                }}
              >
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Horizontal Scrollable Category Chips */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                padding: '0 12px 8px 12px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}
            >
              {categoryList.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    data-testid={`category-filter-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id as DesignCategoryFilter)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '999px',
                      border: isActive ? '1px solid #0f172a' : '1px solid #cbd5e1',
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#0f172a' : cat.highlight ? '#fef2f2' : '#ffffff',
                      color: isActive ? '#ffffff' : cat.highlight ? '#b91c1c' : '#334155',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <span>{cat.shortLabel || cat.label}</span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#64748b',
                      }}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Success Toast ── */}
        {insertSuccessMsg && (
          <div
            data-testid="design-insert-success-toast"
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              padding: isMobile ? '8px 14px' : '10px 20px',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span>{insertSuccessMsg}</span>
            <button
              onClick={() => setInsertSuccessMsg(null)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Main Body: Sidebar (Desktop) + Gallery (Responsive Grid) ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Left Navigation Sidebar (Desktop Only) */}
          {!isMobile && (
            <div
              style={{
                width: '240px',
                borderRight: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              {/* Desktop Search Input */}
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    data-testid="input-design-search"
                    placeholder="डिज़ाइन खोजें (Search)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      color: '#94a3b8',
                    }}
                  >
                    🔍
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#94a3b8',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop Category Navigation Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  श्रेणियाँ (Categories)
                </span>

                {categoryList.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-testid={`category-filter-${cat.id}`}
                      onClick={() => setActiveCategory(cat.id as DesignCategoryFilter)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? '#0f172a' : cat.highlight ? '#fef2f2' : 'transparent',
                        color: isActive ? '#ffffff' : cat.highlight ? '#b91c1c' : '#334155',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{cat.label}</span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                          color: isActive ? '#ffffff' : '#64748b',
                        }}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gallery Grid (Full Width on Mobile) */}
          <div
            style={{
              flex: 1,
              padding: isMobile ? '12px 10px' : '20px',
              overflowY: 'auto',
              backgroundColor: '#f1f5f9',
              minWidth: 0,
            }}
          >
            {filteredTemplates.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📂</span>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>कोई डिज़ाइन नहीं मिला</p>
                <p style={{ fontSize: '12px' }}>कृपया अलग खोज शब्द या श्रेणी चुनकर प्रयास करें।</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: isMobile ? '12px' : '16px',
                }}
              >
                {filteredTemplates.map((design) => {
                  const isFav = favorites.includes(design.id);
                  const isPoC = POC_DESIGN_TEMPLATES.some((p) => p.id === design.id);

                  return (
                    <div
                      key={design.id}
                      data-testid={`design-card-${design.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        border: isPoC ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Thumbnail Container */}
                      <div
                        style={{
                          position: 'relative',
                          height: isMobile ? '150px' : '160px',
                          backgroundColor: '#faf8f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <img
                          src={design.thumbnailUrl}
                          alt={design.name}
                          loading="lazy"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />

                        {/* Category Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            display: 'flex',
                            gap: '4px',
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.85)',
                              color: '#ffffff',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {design.category}
                          </span>
                          <span
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              fontSize: '9.5px',
                              fontWeight: 600,
                              padding: '2px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {design.subcategory}
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(design.id, e)}
                          title="पसंदीदा में जोड़ें"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        >
                          {isFav ? '❤️' : '🤍'}
                        </button>
                      </div>

                      {/* Info & Action Area */}
                      <div style={{ padding: isMobile ? '10px 12px' : '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#3b82f6' }}>
                              {design.id}
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                              {design.width} × {design.height} px
                            </span>
                          </div>
                          <h4 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                            {design.name}
                          </h4>
                          <p
                            style={{
                              margin: '4px 0 0 0',
                              fontSize: '11px',
                              color: '#64748b',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.35,
                            }}
                          >
                            {design.description}
                          </p>
                        </div>

                        {/* Action Buttons: Full Width & Touch-Friendly */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
                          <button
                            type="button"
                            data-testid={`btn-preview-design-${design.id}`}
                            onClick={() => setInspectingDesign(design)}
                            style={{
                              padding: '8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              minHeight: '36px',
                            }}
                          >
                            🔍 पूर्वावलोकन
                          </button>
                          <button
                            type="button"
                            data-testid={`btn-insert-design-${design.id}`}
                            onClick={() => handleInsert(design)}
                            style={{
                              padding: '8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: '#1d4ed8',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              minHeight: '36px',
                              boxShadow: '0 1px 2px rgba(29, 78, 216, 0.25)',
                            }}
                          >
                            + जोड़ें (Insert)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Inspection & Visual Comparison Modal Overlay ── */}
        {inspectingDesign && (
          <div
            role="dialog"
            aria-modal="true"
            data-testid="design-inspection-modal"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? 0 : '24px',
            }}
            onClick={() => setInspectingDesign(null)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: isMobile ? 0 : '14px',
                width: isMobile ? '100vw' : '90vw',
                maxWidth: isMobile ? '100vw' : '1000px',
                height: isMobile ? '100dvh' : undefined,
                maxHeight: isMobile ? '100dvh' : '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Inspection Header */}
              <div
                style={{
                  padding: isMobile ? '10px 14px' : '14px 20px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  flexShrink: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8' }}>
                      {inspectingDesign.id}
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: isMobile ? '13px' : '15px',
                        fontWeight: 800,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {inspectingDesign.name}
                    </h3>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#64748b' }}>
                    {inspectingDesign.subcategory} • {inspectingDesign.width}×{inspectingDesign.height} px
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {/* View Mode Toggle: Preview vs Comparison */}
                  <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('comparison')}
                      style={{
                        padding: '4px 8px',
                        fontSize: isMobile ? '10.5px' : '11px',
                        fontWeight: viewMode === 'comparison' ? 700 : 500,
                        backgroundColor: viewMode === 'comparison' ? '#ffffff' : 'transparent',
                        color: viewMode === 'comparison' ? '#0f172a' : '#64748b',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      तुलना
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      style={{
                        padding: '4px 8px',
                        fontSize: isMobile ? '10.5px' : '11px',
                        fontWeight: viewMode === 'preview' ? 700 : 500,
                        backgroundColor: viewMode === 'preview' ? '#ffffff' : 'transparent',
                        color: viewMode === 'preview' ? '#0f172a' : '#64748b',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      मूल संदर्भ
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectingDesign(null)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', padding: '4px', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Inspection Content */}
              <div
                style={{
                  flex: 1,
                  padding: isMobile ? '12px' : '20px',
                  overflowY: 'auto',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {viewMode === 'comparison' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px' }}>
                    {/* Left: Original Reference Image */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                        मूल संदर्भ छवि (Original Reference)
                      </span>
                      <div
                        style={{
                          width: '100%',
                          minHeight: isMobile ? '160px' : '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#faf8f5',
                          borderRadius: '6px',
                          padding: '8px',
                        }}
                      >
                        <img
                          src={inspectingDesign.referenceUrl}
                          alt="Original"
                          style={{ maxWidth: '100%', maxHeight: isMobile ? '220px' : '350px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>

                    {/* Right: Native Recreated Editable Preview */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #3b82f6',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8' }}>
                          पुनः निर्मित संपादन-योग्य तत्व
                        </span>
                        <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          100% वेक्टर व फॉन्ट
                        </span>
                      </div>

                      {/* Render Mock Preview of the Recreated Element */}
                      <div
                        style={{
                          width: '100%',
                          minHeight: isMobile ? '160px' : '220px',
                          backgroundColor: inspectingDesign.payload.article?.backgroundColor || '#ffffff',
                          borderRadius: '6px',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontFamily: "'Noto Serif Devanagari', serif",
                          boxSizing: 'border-box',
                        }}
                      >
                        {inspectingDesign.kind === 'masthead' && (
                          <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, fontFamily: "'Rozha One', serif" }}>
                              {inspectingDesign.payload.masthead?.title || 'समाचार पत्र'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                              {inspectingDesign.payload.masthead?.tagline}
                            </div>
                            <div style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000', padding: '2px 0', marginTop: '6px', fontSize: '9.5px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{inspectingDesign.payload.masthead?.dayOfWeek}, {inspectingDesign.payload.masthead?.date}</span>
                              <span>{inspectingDesign.payload.masthead?.edition}</span>
                              <span>{inspectingDesign.payload.masthead?.price}</span>
                            </div>
                          </div>
                        )}

                        {inspectingDesign.kind !== 'masthead' && inspectingDesign.payload.article && (
                          <div>
                            <h4
                              style={{
                                margin: '0 0 4px 0',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: 700,
                                fontFamily: "'Rozha One', serif",
                                color: inspectingDesign.payload.article.customColors?.headlineColor || '#0f172a',
                              }}
                            >
                              {inspectingDesign.payload.article.headline}
                            </h4>
                            {inspectingDesign.payload.article.subheadline && (
                              <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                                {inspectingDesign.payload.article.subheadline}
                              </p>
                            )}
                            <p style={{ margin: 0, fontSize: '10.5px', color: '#334155', lineHeight: 1.5 }}>
                              {(inspectingDesign.payload.article.body || '').slice(0, 160)}...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single Large Original Preview */
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={inspectingDesign.referenceUrl}
                      alt="Large Reference"
                      style={{ maxWidth: '100%', maxHeight: isMobile ? '350px' : '500px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              {/* Inspection Footer: Action Bar */}
              <div
                style={{
                  padding: isMobile ? '10px 14px' : '12px 20px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  flexShrink: 0,
                  gap: '8px',
                }}
              >
                {!isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      प्रकार: <strong>{inspectingDesign.kind}</strong> ({inspectingDesign.subcategory})
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setInspectingDesign(null)}
                    style={{
                      padding: isMobile ? '8px 12px' : '8px 16px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    बंद करें
                  </button>
                  <button
                    type="button"
                    data-testid="btn-confirm-insert-inspected-design"
                    onClick={() => {
                      handleInsert(inspectingDesign);
                      setInspectingDesign(null);
                    }}
                    style={{
                      flex: isMobile ? 1 : undefined,
                      padding: '8px 20px',
                      backgroundColor: '#1d4ed8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(29, 78, 216, 0.3)',
                      textAlign: 'center',
                    }}
                  >
                    + कैनवास में जोड़ें (Insert)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
