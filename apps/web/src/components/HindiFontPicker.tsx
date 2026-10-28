import React, { useState, useMemo } from 'react';
import {
  DEVANAGARI_FONTS,
  HINDI_FONT_CATEGORIES,
  FONT_ROLES,
  RECOMMENDED_HINDI_FONT_COMBINATIONS,
  type FontCategory,
  type FontRole,
  type DevanagariFontDefinition,
  type HindiFontCombination,
} from '@epaper-studio/typography';

export interface HindiFontPickerProps {
  currentMastheadFont?: string;
  currentHeadlineFont: string;
  currentSubheadlineFont?: string;
  currentBodyFont: string;
  currentHeadlineWeight?: number;
  onUpdateFonts: (fonts: {
    mastheadFont?: string;
    headlineFont?: string;
    subheadlineFont?: string;
    bodyFont?: string;
    headlineWeight?: number;
  }) => void;
}

export const HindiFontPicker: React.FC<HindiFontPickerProps> = ({
  currentMastheadFont = "'Rozha One', serif",
  currentHeadlineFont = "'Noto Serif Devanagari', serif",
  currentSubheadlineFont = "'Noto Serif Devanagari', serif",
  currentBodyFont = "'Noto Serif Devanagari', serif",
  currentHeadlineWeight = 700,
  onUpdateFonts,
}) => {
  const [activeRole, setActiveRole] = useState<FontRole>('headline');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Determine currently active font family for the selected role
  const currentFontForRole = useMemo(() => {
    switch (activeRole) {
      case 'masthead':
        return currentMastheadFont;
      case 'headline':
        return currentHeadlineFont;
      case 'subheadline':
        return currentSubheadlineFont;
      case 'body':
        return currentBodyFont;
      default:
        return currentHeadlineFont;
    }
  }, [
    activeRole,
    currentMastheadFont,
    currentHeadlineFont,
    currentSubheadlineFont,
    currentBodyFont,
  ]);

  // Filter fonts by search query and category
  const filteredFonts = useMemo(() => {
    return DEVANAGARI_FONTS.filter((font) => {
      const matchesCategory =
        selectedCategory === 'all' || font.categories.includes(selectedCategory);
      const matchesSearch =
        searchQuery === '' ||
        font.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.nameHi.includes(searchQuery) ||
        font.shortDescriptionHi.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectFont = (font: DevanagariFontDefinition) => {
    switch (activeRole) {
      case 'masthead':
        onUpdateFonts({ mastheadFont: font.cssFamily });
        break;
      case 'headline':
        onUpdateFonts({
          headlineFont: font.cssFamily,
          headlineWeight: font.weights[font.weights.length - 1] ?? 700,
        });
        break;
      case 'subheadline':
        onUpdateFonts({ subheadlineFont: font.cssFamily });
        break;
      case 'body':
        onUpdateFonts({ bodyFont: font.cssFamily });
        break;
    }
  };

  const handleApplyCombo = (combo: HindiFontCombination) => {
    onUpdateFonts({
      mastheadFont: combo.mastheadFont,
      headlineFont: combo.headlineFont,
      subheadlineFont: combo.subheadlineFont,
      bodyFont: combo.bodyFont,
      headlineWeight: combo.headlineWeight,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #e0ded9',
      }}
    >
      {/* Recommended Font Combinations */}
      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>✨</span>
          <span>एक-क्लिक अनुशंसित फॉन्ट संयोजन (Recommended Combos)</span>
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
          शुरुआती उपयोगकर्ताओं के लिए विशेष रूप से तैयार किए गए प्रामाणिक हिंदी फॉन्ट जोड़े:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '8px',
          }}
        >
          {RECOMMENDED_HINDI_FONT_COMBINATIONS.map((combo) => (
            <button
              key={combo.id}
              onClick={() => handleApplyCombo(combo)}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d5d1c8',
                backgroundColor: '#faf8f5',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.backgroundColor = '#f0ece1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d5d1c8';
                e.currentTarget.style.backgroundColor = '#faf8f5';
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#121212',
                  marginBottom: '2px',
                }}
              >
                {combo.nameHi}
              </div>
              <div style={{ fontSize: '10.5px', color: '#777', marginBottom: '4px' }}>
                {combo.taglineHi}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontFamily: combo.headlineFont,
                  color: '#990000',
                  fontWeight: combo.headlineWeight,
                  lineHeight: 1.2,
                }}
              >
                दैनिक नवप्रभात
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#e5e2db' }} />

      {/* Role Selector Tabs */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: '#333',
            marginBottom: '6px',
          }}
        >
          किस भाग का फॉन्ट बदलना है? (Font Role)
        </label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          {FONT_ROLES.filter((r) => r.role !== 'ui').map((role) => {
            const isSelected = activeRole === role.role;
            return (
              <button
                key={role.role}
                onClick={() => setActiveRole(role.role)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isSelected ? '2px solid #1a1a1a' : '1px solid #ccc',
                  backgroundColor: isSelected ? '#1a1a1a' : '#f8f7f4',
                  color: isSelected ? '#fff' : '#333',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {role.nameHi}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="देवनागरी फॉन्ट खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '160px',
            padding: '7px 10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '12px',
            backgroundColor: '#fafafa',
          }}
        />

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: selectedCategory === 'all' ? '1px solid #1a1a1a' : '1px solid #ddd',
              backgroundColor: selectedCategory === 'all' ? '#e5e2da' : '#fff',
              cursor: 'pointer',
              fontWeight: selectedCategory === 'all' ? 700 : 400,
            }}
          >
            सभी
          </button>
          {HINDI_FONT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                borderRadius: '4px',
                border: selectedCategory === cat.id ? '1px solid #1a1a1a' : '1px solid #ddd',
                backgroundColor: selectedCategory === cat.id ? '#e5e2da' : '#fff',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.id ? 700 : 400,
              }}
            >
              {cat.nameHi}
            </button>
          ))}
        </div>
      </div>

      {/* Font Cards Grid with Real Devanagari Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px',
          maxHeight: '380px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {filteredFonts.map((font) => {
          const isSelected = currentFontForRole.includes(font.family);
          return (
            <div
              key={font.family}
              onClick={() => handleSelectFont(font)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: isSelected ? '2px solid #b22222' : '1px solid #dedede',
                backgroundColor: isSelected ? '#fff9f9' : '#fff',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 0 0 1px #b22222' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  {font.nameHi}
                </div>
                {isSelected && (
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#b22222',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    सक्रिय
                  </span>
                )}
              </div>

              {/* Real Devanagari Live Preview */}
              <div
                style={{
                  fontFamily: font.cssFamily,
                  fontSize: '18px',
                  color: '#121212',
                  lineHeight: 1.3,
                  margin: '6px 0',
                  padding: '8px',
                  backgroundColor: '#fbfaf7',
                  borderRadius: '4px',
                  border: '1px solid #eae7e1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {font.sampleText}
              </div>

              {/* Character glyph check for matras and conjoints */}
              <div
                style={{
                  fontFamily: font.cssFamily,
                  fontSize: '11px',
                  color: '#666',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                अ आ इ ई उ ऊ ऋ ए ऐ ओ औ • क ख ग घ ङ • क्ष् त्र ज्ञ श्र
              </div>

              <div style={{ fontSize: '10.5px', color: '#777', lineHeight: 1.35 }}>
                {font.shortDescriptionHi}
              </div>

              {/* Available weights */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '8px',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '9.5px', color: '#999' }}>उपलब्ध भार:</span>
                {font.weights.map((w) => (
                  <span
                    key={w}
                    style={{
                      fontSize: '9.5px',
                      padding: '1px 5px',
                      backgroundColor: '#eee',
                      borderRadius: '3px',
                      fontWeight: isSelected && currentHeadlineWeight === w ? 700 : 400,
                      color: isSelected && currentHeadlineWeight === w ? '#b22222' : '#555',
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
