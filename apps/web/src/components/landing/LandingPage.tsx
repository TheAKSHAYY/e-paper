import React, { useState } from 'react';
import type { NewspaperPresetId } from '@epaper-studio/document-schema';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { LegalAndSupportModal, type ModalTab } from '../common/LegalAndSupportModal';

export interface LandingPageProps {
  onStartCreating: () => void;
  onSelectTemplate: (presetId: NewspaperPresetId) => void;
  onOpenDashboard?: () => void;
  onOpenStudio?: () => void;
  onSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onSelectTemplate,
  onOpenDashboard,
  onOpenStudio,
  onSignIn,
}) => {
  const { t, locale } = useI18n();
  const [activeScreenshot, setActiveScreenshot] = useState<'editor' | 'continuation' | 'dashboard'>(
    'editor'
  );
  const [activeShowcaseLanguage, setActiveShowcaseLanguage] = useState<'en' | 'hi'>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal State for About, FAQ, Contact, Privacy, Terms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('about');

  const openModal = (tab: ModalTab) => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F5',
        color: '#1C1917',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.5,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ====================================================================
       * TOP ANNOUNCEMENT BANNER (Inspired by Tide Editorial Reference 1)
       * ==================================================================== */}
      <div
        style={{
          backgroundColor: '#1C1917',
          color: '#FAF8F5',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span>
          {locale === 'hi'
            ? 'द ई-पेपर स्टूडियो • संस्करण 2.4 • 300 DPI वेक्टर पीडीएफ • स्वचालित मल्टी-पेज ओवरफ्लो • पूर्ण लोकल-फर्स्ट'
            : 'THE E-PAPER STUDIO · SPRING ISSUE OUT NOW · STORIES, ESSAYS, REPORTING · 300 DPI VECTOR PDF'}
        </span>
      </div>

      {/* ====================================================================
       * SECTION 1: MINIMAL NAVIGATION (Inspired by Tide Top Nav)
       * ==================================================================== */}
      <header
        style={{
          borderBottom: '1px solid #E7E2DA',
          backgroundColor: '#FAF8F5',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Brand Identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#1C1917',
                color: '#FAF8F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '17px',
                fontFamily: "'Rozha One', 'Playfair Display', serif",
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              प
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#1C1917',
                  lineHeight: 1.1,
                }}
              >
                E-Paper Studio
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: '#78716C',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Newspaper Publishing
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Ref 1 Style) */}
          <nav
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#57534E',
            }}
            className="nav-desktop"
            aria-label="Main Navigation"
          >
            <button
              onClick={() => scrollToSection('masthead-hero')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: '#57534E',
                cursor: 'pointer',
              }}
              className="hover:text-stone-900 transition-colors"
            >
              {locale === 'hi' ? 'मुखपृष्ठ' : 'Cover'}
            </button>
            <button
              onClick={() => scrollToSection('showcase')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: '#57534E',
                cursor: 'pointer',
              }}
              className="hover:text-stone-900 transition-colors"
            >
              {t.landing.navTemplates}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: '#57534E',
                cursor: 'pointer',
              }}
              className="hover:text-stone-900 transition-colors"
            >
              {t.landing.navFeatures}
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: '#57534E',
                cursor: 'pointer',
              }}
              className="hover:text-stone-900 transition-colors"
            >
              {locale === 'hi' ? 'कार्यप्रणाली' : 'Process'}
            </button>
            <button
              onClick={() => openModal('about')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: '#57534E',
                cursor: 'pointer',
              }}
              className="hover:text-stone-900 transition-colors"
            >
              {locale === 'hi' ? 'परिचय' : 'About'}
            </button>
          </nav>

          {/* Actions & Locale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSelector />

            {onSignIn && (
              <button
                onClick={onSignIn}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#44403C',
                  cursor: 'pointer',
                  padding: '6px 10px',
                }}
                className="hidden sm:inline-block hover:text-stone-950 transition-colors"
              >
                {t.landing.signInBtn}
              </button>
            )}

            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#44403C',
                  cursor: 'pointer',
                  padding: '6px 10px',
                }}
                className="hidden sm:inline-block hover:text-stone-950 transition-colors"
              >
                {t.common.dashboard}
              </button>
            )}

            <button
              onClick={onStartCreating}
              style={{
                backgroundColor: '#1C1917',
                color: '#FAF8F5',
                border: 'none',
                borderRadius: '9999px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className="hover:bg-stone-800 transition-colors"
            >
              <span>{locale === 'hi' ? 'स्टूडियो खोलें' : 'OPEN STUDIO'}</span>
              <span>→</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'none',
                border: '1px solid #D6D0C5',
                borderRadius: '6px',
                minWidth: '44px',
                minHeight: '44px',
                fontSize: '20px',
                color: '#1C1917',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="mobile-toggle"
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E7E2DA',
              flexDirection: 'column',
              gap: '12px',
            }}
            className="mobile-menu-drawer"
          >
            <button
              onClick={() => scrollToSection('masthead-hero')}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'मुखपृष्ठ' : 'Cover Story'}
            </button>
            <button
              onClick={() => scrollToSection('showcase')}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              {t.landing.navTemplates}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              {t.landing.navFeatures}
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'कार्यप्रणाली' : 'Process'}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openModal('about');
              }}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1C1917',
                cursor: 'pointer',
              }}
            >
              {locale === 'hi' ? 'स्टूडियो परिचय' : 'About'}
            </button>
            {onOpenDashboard && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1C1917',
                  cursor: 'pointer',
                }}
              >
                {t.common.dashboard}
              </button>
            )}
          </div>
        )}
      </header>

      {/* ====================================================================
       * SECTION 2: EDITORIAL MASTHEAD STRIP (Exact Reference 1 "TIDE" Style)
       * ==================================================================== */}
      <section
        id="masthead-hero"
        style={{
          scrollMarginTop: '80px',
          borderBottom: '1px solid #1C1917',
          padding: '24px 24px 16px 24px',
          backgroundColor: '#FAF8F5',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Top Volume / Date / Pricing sub-bar with top and bottom rules */}
          <div
            style={{
              borderTop: '1px solid #1C1917',
              borderBottom: '1px solid #1C1917',
              padding: '12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#44403C',
              fontWeight: 600,
            }}
          >
            <span className="hidden sm:inline">
              {locale === 'hi' ? 'वर्ष १२ • अंक ७ • मार्च २०२६' : 'VOL. XII / NO. 7 · MARCH 2026'}
            </span>

            {/* Giant iconic editorial masthead logo (Ref 1 Tide) */}
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(38px, 6vw, 76px)',
                lineHeight: locale === 'hi' ? 1.25 : 0.95,
                fontWeight: 900,
                fontFamily:
                  locale === 'hi'
                    ? "'Rozha One', 'Noto Serif Devanagari', serif"
                    : "'Playfair Display', Georgia, serif",
                fontStyle: locale === 'hi' ? 'normal' : 'italic',
                letterSpacing: locale === 'hi' ? '0em' : '-0.04em',
                color: '#1C1917',
                textAlign: 'center',
                overflow: 'visible',
              }}
            >
              {locale === 'hi' ? 'दैनिक समाचार' : 'Tide'}
            </h1>

            <span className="hidden sm:inline">
              {locale === 'hi' ? 'वार्षिक शुल्क • ₹६८०' : 'SUBSCRIBE · $68/YR'}
            </span>
          </div>

          {/* Sub-category navigation bar (Ref 1) */}
          <div
            style={{
              padding: '10px 0 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(14px, 3vw, 32px)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#57534E',
              fontWeight: 600,
              flexWrap: 'wrap',
            }}
          >
            <span>{locale === 'hi' ? 'विशेष लेख' : 'FEATURES'}</span>
            <span>{locale === 'hi' ? 'संपादकीय' : 'ESSAYS'}</span>
            <span>{locale === 'hi' ? 'समीक्षा' : 'REVIEWS'}</span>
            <span>{locale === 'hi' ? 'व्यक्तित्व' : 'PROFILES'}</span>
            <span>{locale === 'hi' ? 'पाठक पत्र' : 'LETTERS'}</span>
            <span>{locale === 'hi' ? 'संग्रह' : 'ARCHIVE'}</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 2B: TWO-COLUMN EDITORIAL HERO (Exact Reference 1)
       * ==================================================================== */}
      <section
        style={{
          padding: '48px 24px 64px 24px',
          backgroundColor: '#FAF8F5',
          borderBottom: '1px solid #E7E2DA',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Authentic Editorial Newspaper Photo Frame (Exact Ref 1 Tide) */}
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#EDE8E1',
              boxShadow: '0 20px 48px -12px rgba(28,25,23,0.18)',
              border: '1px solid #D6D0C5',
            }}
          >
            <img
              src="/hero-newspaper-reader.jpg"
              alt="Authentic print broadsheet newspaper being read outdoors"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
                maxHeight: '480px',
              }}
              loading="eager"
            />
          </div>

          {/* Right Column: Editorial Feature Typography (Ref 1) */}
          <div>
            {/* Kicker in Burnt Coral Red (Ref 1) */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#C2410C',
                marginBottom: '16px',
              }}
            >
              {locale === 'hi'
                ? 'मुख्य आलेख • ६,८००-शब्दों का विशेष निबंध'
                : 'COVER STORY · A 6,800-WORD FEATURE'}
            </div>

            {/* Giant Editorial Serif Italic Headline (Exact Ref 1) */}
            <h2
              style={{
                fontSize: 'clamp(32px, 4.5vw, 56px)',
                fontWeight: 800,
                fontFamily:
                  locale === 'hi'
                    ? "'Noto Serif Devanagari', 'Rozha One', serif"
                    : "'Playfair Display', Georgia, serif",
                fontStyle: locale === 'hi' ? 'normal' : 'italic',
                lineHeight: locale === 'hi' ? 1.3 : 1.08,
                letterSpacing: locale === 'hi' ? '-0.01em' : '-0.03em',
                color: '#1C1917',
                margin: '0 0 20px 0',
                overflow: 'visible',
              }}
            >
              {locale === 'hi'
                ? 'नया शांत युग: जब शोर से दूर सार्थक मुद्रण की ओर लौटे पाठक।'
                : 'The new quiet: how a generation stopped shouting online.'}
            </h2>

            {/* Byline (Ref 1) */}
            <div
              style={{
                fontSize: '13px',
                color: '#78716C',
                fontWeight: 500,
                marginBottom: '28px',
                letterSpacing: '0.01em',
              }}
            >
              {locale === 'hi'
                ? 'लेखन: आर्या पार्क • फोटोग्राफी: माया पटेल • मार्च २०२६'
                : 'By Aria Park · Photography by Maya Patel · March 2026'}
            </div>

            {/* Editorial Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#44403C',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '520px',
              }}
            >
              {locale === 'hi'
                ? 'ई-पेपर स्टूडियो संपादकीय टीमों को बिना वेब के विचलित करने वाले विज्ञापनों और शोर के, प्रामाणिक 8-कॉलम ब्रॉडशीट, मल्टी-पेज फ्लो और 300 DPI प्रिंट-रेडी अखबार तैयार करने की शक्ति देता है।'
                : 'E-Paper Studio gives editors, publishers, and independent creators the deterministic power to craft authentic 8-column broadsheets, automated multi-page story jumps, and 300 DPI vector PDFs.'}
            </p>

            {/* Direct Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={onStartCreating}
                style={{
                  backgroundColor: '#1C1917',
                  color: '#FAF8F5',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '13px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
                className="hover:bg-stone-800 transition-colors"
              >
                {t.landing.openEditorBtn} →
              </button>

              <button
                onClick={() => scrollToSection('workflow')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1C1917',
                  border: '1px solid #D6D0C5',
                  borderRadius: '9999px',
                  padding: '13px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-stone-50 transition-colors"
              >
                {locale === 'hi' ? 'प्रकाशन प्रक्रिया देखें' : 'See Editorial Process'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 3: PRODUCT CENTERPIECE (Genuine Studio Screenshot Showcase)
       * ==================================================================== */}
      <section
        style={{
          padding: '64px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E7E2DA',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          {/* Subtle Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#EDE8E1',
              color: '#44403C',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '18px',
              border: '1px solid #E0DAD0',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#1C1917',
              }}
            />
            {locale === 'hi' ? 'स्टूडियो पूर्वावलोकन' : 'Interactive Studio Preview'}
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 800,
              color: '#1C1917',
              fontFamily: "'Playfair Display', Georgia, serif",
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {locale === 'hi'
              ? 'पेशेवर मुद्रण डेस्कटॉप का प्रत्यक्ष अनुभव'
              : 'Engineered for Real Newspaper Production'}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#57534E',
              maxWidth: '640px',
              margin: '0 auto 32px auto',
            }}
          >
            {locale === 'hi'
              ? '८-कॉलम ब्रॉडशीट से लेकर स्वतः पृष्ठ निरंतरता तक — बिना किसी जटिल सॉफ्टवेयर के।'
              : 'Inspect live editor modes: broadsheet grid layout, automatic multi-page jump balancing, and publication dashboard.'}
          </p>

          {/* Screenshot Switcher Tabs */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#EDE8E1',
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #E0DAD0',
            }}
          >
            <button
              onClick={() => setActiveScreenshot('editor')}
              style={{
                padding: '7px 18px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeScreenshot === 'editor' ? '#FFFFFF' : 'transparent',
                color: activeScreenshot === 'editor' ? '#1C1917' : '#78716C',
                boxShadow: activeScreenshot === 'editor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {locale === 'hi' ? '८-कॉलम संपादक' : '8-Column Editor'}
            </button>
            <button
              onClick={() => setActiveScreenshot('continuation')}
              style={{
                padding: '7px 18px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeScreenshot === 'continuation' ? '#FFFFFF' : 'transparent',
                color: activeScreenshot === 'continuation' ? '#1C1917' : '#78716C',
                boxShadow:
                  activeScreenshot === 'continuation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {locale === 'hi' ? 'स्टोरी निरंतरता' : 'Story Continuation'}
            </button>
            <button
              onClick={() => setActiveScreenshot('dashboard')}
              style={{
                padding: '7px 18px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeScreenshot === 'dashboard' ? '#FFFFFF' : 'transparent',
                color: activeScreenshot === 'dashboard' ? '#1C1917' : '#78716C',
                boxShadow: activeScreenshot === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {locale === 'hi' ? 'प्रकाशन डैशबोर्ड' : 'Publisher Dashboard'}
            </button>
          </div>

          {/* Genuine Screenshot Frame */}
          <div
            style={{
              maxWidth: '1120px',
              margin: '0 auto',
              borderRadius: '16px',
              border: '1px solid #D6D0C5',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 16px 48px -8px rgba(28,25,23,0.12)',
              overflow: 'hidden',
            }}
          >
            {/* Window chrome header */}
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: '#F5F2EB',
                borderBottom: '1px solid #E7E2DA',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#E0DAD0',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#E0DAD0',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#E0DAD0',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  color: '#78716C',
                  fontFamily: 'monospace',
                  marginLeft: '8px',
                }}
              >
                epaperstudio.app / workspace /{' '}
                {activeScreenshot === 'editor'
                  ? 'broadsheet-editor'
                  : activeScreenshot === 'continuation'
                    ? 'multipage-flow'
                    : 'editions-archive'}
              </span>
            </div>

            {/* Render selected screenshot */}
            <div style={{ position: 'relative', width: '100%', backgroundColor: '#FAF8F5' }}>
              {activeScreenshot === 'editor' && (
                <img
                  src="/screenshots/editor-preview.png"
                  alt="E-Paper Studio 8-Column Broadsheet Editor"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  loading="eager"
                />
              )}
              {activeScreenshot === 'continuation' && (
                <img
                  src="/screenshots/editor-continuation.png"
                  alt="Multi-page story continuation and overflow handling"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  loading="lazy"
                />
              )}
              {activeScreenshot === 'dashboard' && (
                <img
                  src="/screenshots/dashboard-preview.png"
                  alt="E-Paper Studio Publisher Dashboard"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 4: EDITORIAL PROCESS WORKFLOW (Exact Reference 3 "PROCESS")
       * ==================================================================== */}
      <section
        id="workflow"
        style={{
          borderBottom: '1px solid #E7E2DA',
          backgroundColor: '#FAF8F5',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          {/* Centered Spaced Kicker (Ref 3) */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#57534E',
              marginBottom: '12px',
            }}
          >
            P R O C E S S
          </div>

          {/* Heading: Bold primary + softer secondary line (Exact Ref 3) */}
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#1C1917',
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {locale === 'hi' ? 'विचार से प्रकाशन तक' : 'From idea to launch'}
          </h2>
          <div
            style={{
              fontSize: 'clamp(22px, 3.5vw, 36px)',
              fontWeight: 500,
              color: '#78716C',
              margin: '0 0 64px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {locale === 'hi' ? 'हम आपके साथ हैं' : 'I got you covered'}
          </div>

          {/* 3 Geometric Wireframe Diagram Steps (Exact Ref 3 Structure) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '56px',
            }}
          >
            {/* Step 01: Hexagonal Wireframe */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '240px',
              }}
            >
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {/* SVG Hexagonal Wireframe Diagram */}
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="90,15 155,52.5 155,127.5 90,165 25,127.5 25,52.5"
                    stroke="#D6D0C5"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line x1="90" y1="15" x2="90" y2="165" stroke="#E7E2DA" strokeWidth="1" />
                  <line x1="25" y1="52.5" x2="155" y2="127.5" stroke="#E7E2DA" strokeWidth="1" />
                  <line x1="25" y1="127.5" x2="155" y2="52.5" stroke="#E7E2DA" strokeWidth="1" />
                  <circle cx="90" cy="15" r="4" fill="#E7E2DA" />
                  <circle cx="155" cy="52.5" r="4" fill="#E7E2DA" />
                  <circle cx="155" cy="127.5" r="4" fill="#E7E2DA" />
                  <circle cx="90" cy="165" r="4" fill="#E7E2DA" />
                  <circle cx="25" cy="127.5" r="4" fill="#E7E2DA" />
                  <circle cx="25" cy="52.5" r="4" fill="#E7E2DA" />
                </svg>

                {/* Center Solid Circle 01 with White Aura (Ref 3) */}
                <div
                  style={{
                    position: 'absolute',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#1C1917',
                    color: '#FAF8F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  }}
                >
                  01
                </div>
              </div>

              <h3
                style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 4px 0' }}
              >
                {locale === 'hi' ? 'ग्रिड संतुलन' : 'Grid Balancing'}
              </h3>
              <p style={{ fontSize: '13px', color: '#78716C', lineHeight: 1.4, margin: 0 }}>
                {locale === 'hi' ? '८ और ४-कॉलम समतुल्यता' : 'Multi-column height balancing'}
              </p>
            </div>

            {/* Connecting Arrow 1 (SVG dashed arrow) */}
            <div
              style={{ color: '#A8A29E', padding: '0 8px', display: 'flex', alignItems: 'center' }}
              className="arrow-connector"
            >
              <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
                <line
                  x1="0"
                  y1="6"
                  x2="40"
                  y2="6"
                  stroke="#A8A29E"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <path
                  d="M38 3L44 6L38 9"
                  stroke="#A8A29E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Step 02: Modular Shapes Composition */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '240px',
              }}
            >
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {/* SVG Modular Geometry Wireframe */}
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="25"
                    y="25"
                    width="130"
                    height="130"
                    stroke="#D6D0C5"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="90" cy="90" r="50" stroke="#E7E2DA" strokeWidth="1" />
                  <line x1="25" y1="25" x2="155" y2="155" stroke="#E7E2DA" strokeWidth="1" />
                  <line x1="25" y1="155" x2="155" y2="25" stroke="#E7E2DA" strokeWidth="1" />
                </svg>

                {/* Center Solid Circle 02 with White Aura (Ref 3) */}
                <div
                  style={{
                    position: 'absolute',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#1C1917',
                    color: '#FAF8F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  }}
                >
                  02
                </div>
              </div>

              <h3
                style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 4px 0' }}
              >
                {locale === 'hi' ? 'स्टोरी निरंतरता' : 'Story Continuation'}
              </h3>
              <p style={{ fontSize: '13px', color: '#78716C', lineHeight: 1.4, margin: 0 }}>
                {locale === 'hi'
                  ? 'स्वतः पृष्ठ जंप और निरंतरता'
                  : 'Automated multi-page story jumps'}
              </p>
            </div>

            {/* Connecting Arrow 2 (SVG dashed arrow) */}
            <div
              style={{ color: '#A8A29E', padding: '0 8px', display: 'flex', alignItems: 'center' }}
              className="arrow-connector"
            >
              <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
                <line
                  x1="0"
                  y1="6"
                  x2="40"
                  y2="6"
                  stroke="#A8A29E"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <path
                  d="M38 3L44 6L38 9"
                  stroke="#A8A29E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Step 03: Concentric Radar Circles */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '240px',
              }}
            >
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {/* SVG Concentric Radar Grid */}
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    stroke="#D6D0C5"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="90" cy="90" r="45" stroke="#E7E2DA" strokeWidth="1" />
                  <circle cx="90" cy="90" r="22" stroke="#E7E2DA" strokeWidth="1" />
                  <line x1="90" y1="10" x2="90" y2="170" stroke="#E7E2DA" strokeWidth="1" />
                  <line x1="10" y1="90" x2="170" y2="90" stroke="#E7E2DA" strokeWidth="1" />
                </svg>

                {/* Center Solid Circle 03 with White Aura (Ref 3) */}
                <div
                  style={{
                    position: 'absolute',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#1C1917',
                    color: '#FAF8F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  }}
                >
                  03
                </div>
              </div>

              <h3
                style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 4px 0' }}
              >
                {locale === 'hi' ? '३०० DPI प्रेस पीडीएफ' : '300 DPI Vector PDF'}
              </h3>
              <p style={{ fontSize: '13px', color: '#78716C', lineHeight: 1.4, margin: 0 }}>
                {locale === 'hi' ? 'मुद्रण-योग्य वेक्टर निर्यात' : 'Press-ready vector export'}
              </p>
            </div>
          </div>

          {/* Down Arrow Indicator Circle (Exact Ref 3) */}
          <button
            onClick={() => scrollToSection('features')}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#1C1917',
              color: '#FAF8F5',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              margin: '0 auto',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            className="hover:scale-105 transition-transform"
            aria-label="Scroll to Features"
          >
            ↓
          </button>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 5: BENTO CAPABILITIES (Exact Reference 2 "Built for scale")
       * ==================================================================== */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          {/* Section Header with Pill Tag (Exact Ref 2) */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 16px',
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6B7280',
                marginBottom: '16px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {locale === 'hi' ? 'शक्तिशाली क्षमताएं' : 'Powerful Capabilities'}
            </div>

            <h2
              style={{
                fontSize: locale === 'hi' ? 'clamp(26px, 3.5vw, 38px)' : 'clamp(30px, 4.5vw, 48px)',
                fontWeight: 800,
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              {locale === 'hi'
                ? 'मुद्रण के लिए निर्मित, विश्वसनीयता के लिए इंजीनियर'
                : 'Built for scale, engineered for trust'}
            </h2>
          </div>

          {/* 5-Card Bento Grid with Diagrams (Exact Ref 2) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '20px',
            }}
          >
            {/* Bento Card 1: Omnichannel Alerts / Multi-Format Export (Ref 2 Left) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '290px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              className="bento-card-4"
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 8px 0',
                  }}
                >
                  {locale === 'hi' ? 'मल्टी-फॉर्मेट आउटपुट' : 'Omnichannel alerts'}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  {locale === 'hi'
                    ? 'प्रिंट, ई-इंक, वेब और मोबाइल सभी चैनलों पर स्वतः लेआउट सिंक्रोनाइज़ेशन।'
                    : 'Stay ahead with real-time notifications synced across your favorite publication and print channels.'}
                </p>
              </div>

              {/* Radial Arc Diagram (Ref 2) */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <svg width="240" height="95" viewBox="0 0 240 95" fill="none">
                  <line x1="120" y1="90" x2="25" y2="72" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="120" y1="90" x2="68" y2="42" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="120" y1="90" x2="120" y2="28" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="120" y1="90" x2="172" y2="42" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="120" y1="90" x2="215" y2="72" stroke="#E5E7EB" strokeWidth="1" />
                  <path
                    d="M 20 80 Q 120 10 220 80"
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx="25"
                    cy="72"
                    r="14"
                    fill="#FFFFFF"
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                  />
                  <text
                    x="25"
                    y="76"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#6B7280"
                  >
                    PDF
                  </text>
                  <circle
                    cx="68"
                    cy="42"
                    r="14"
                    fill="#FFFFFF"
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                  />
                  <text
                    x="68"
                    y="46"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#6B7280"
                  >
                    Web
                  </text>
                  <circle cx="120" cy="28" r="16" fill="#F97316" />
                  <text
                    x="120"
                    y="32"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#FFFFFF"
                  >
                    EP
                  </text>
                  <circle
                    cx="172"
                    cy="42"
                    r="14"
                    fill="#FFFFFF"
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                  />
                  <text
                    x="172"
                    y="46"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#6B7280"
                  >
                    E-Ink
                  </text>
                  <circle
                    cx="215"
                    cy="72"
                    r="14"
                    fill="#FFFFFF"
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                  />
                  <text
                    x="215"
                    y="76"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#6B7280"
                  >
                    App
                  </text>
                </svg>
              </div>
            </div>

            {/* Bento Card 2: Smart Movement / Column Balancing (Ref 2 Center) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '290px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              className="bento-card-4"
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 8px 0',
                  }}
                >
                  {locale === 'hi' ? 'स्मार्ट कॉलम संतुलन' : 'Smart movement'}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  {locale === 'hi'
                    ? 'परिवर्तनीय लंबाई के लेखों का बिना लेआउट बिखराव के स्वतः कॉलम संतुलन।'
                    : 'Automate high-volume layout balancing and column height equalization with sub-5ms deterministic engine.'}
                </p>
              </div>

              {/* Concentric Circles + Shield (Ref 2) */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <svg width="150" height="95" viewBox="0 0 150 95" fill="none">
                  <circle
                    cx="75"
                    cy="48"
                    r="42"
                    stroke="#F3F4F6"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle cx="75" cy="48" r="32" stroke="#E5E7EB" strokeWidth="1" />
                  <circle cx="75" cy="48" r="22" stroke="#F3F4F6" strokeWidth="1" />
                  <line x1="15" y1="48" x2="135" y2="48" stroke="#E5E7EB" strokeWidth="0.75" />
                  <line x1="75" y1="6" x2="75" y2="90" stroke="#E5E7EB" strokeWidth="0.75" />
                  <circle cx="75" cy="16" r="1.5" fill="#9CA3AF" />
                  <circle cx="75" cy="80" r="1.5" fill="#9CA3AF" />
                  <circle cx="43" cy="48" r="1.5" fill="#9CA3AF" />
                  <circle cx="107" cy="48" r="1.5" fill="#9CA3AF" />
                  <circle cx="75" cy="48" r="14" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1" />
                  <path
                    d="M 70 44 L 75 41 L 80 44 V 49 Q 75 54 75 54 Q 70 49 70 49 Z"
                    fill="#F97316"
                  />
                </svg>
              </div>
            </div>

            {/* Bento Card 3: Granular Permissions / Role UI Mockup (Ref 2 Right) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '290px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              className="bento-card-4"
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 8px 0',
                  }}
                >
                  {locale === 'hi' ? 'संपादकीय अधिकार' : 'Granular permissions'}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  {locale === 'hi'
                    ? 'मुख्य संपादक, लेआउट डिजाइनर से लेकर रिपोर्टर तक सभी स्तरों पर सटीक भूमिकाएं।'
                    : 'Assign precise roles from Chief Editor to Layout Artist ensuring every desk member has access they need.'}
                </p>
              </div>

              {/* Interactive Role Card UI Mockup (Exact Ref 2) */}
              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#16A34A',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    ● Invite sent!
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      fontSize: '11px',
                      color: '#6B7280',
                    }}
                  >
                    Assign a role
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#9CA3AF',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    Send Invite
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#4B5563',
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>
                        Admin
                      </div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Full account control</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#4B5563',
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>
                        Designer
                      </div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                        Typography & layout styling
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#4B5563',
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>
                        View Only
                      </div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                        Proofing & reader access
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Dynamic Typometric Grid (Ref 2 Bottom-Left) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              className="bento-card-6"
            >
              <h3
                style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}
              >
                {locale === 'hi' ? 'सटीक टाइपोमेट्रिक पैमाना' : 'Dynamic typometric scale'}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  lineHeight: 1.5,
                  margin: '0 0 16px 0',
                }}
              >
                {locale === 'hi'
                  ? 'देवनागरी संयुक्ताक्षरों और लैटिन शीर्षकों के लिए ०.२५pt सूक्ष्म-आकार ट्यूनिंग और बेसलाइन ग्रिड।'
                  : 'Monitor and control headline leading, baseline grid snapping, and bilingual font pair optical sizing in real time.'}
              </p>
              {/* Graphic line metrics */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                    Leading & Baseline Snapping
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>
                    135% · 12pt Grid
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '82%',
                      height: '100%',
                      backgroundColor: '#111827',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: '#9CA3AF',
                    marginTop: '6px',
                  }}
                >
                  <span>0pt Delta</span>
                  <span>Deterministic Auto-Balance</span>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Bank-Grade Protection (Ref 2 Bottom-Right) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              className="bento-card-6"
            >
              <h3
                style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}
              >
                {locale === 'hi' ? 'पूर्ण डेटा गोपनीयता व लोकल-फर्स्ट' : 'Bank-grade protection'}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  lineHeight: 1.5,
                  margin: '0 0 16px 0',
                }}
              >
                {locale === 'hi'
                  ? 'शून्य टेलीमेट्री — सभी मसौदे और संस्करण आपके ब्राउज़र के भीतर सुरक्षित एनक्रिप्टेड रहते हैं।'
                  : 'Secure your newspaper newsroom with zero cloud telemetry, local IndexedDB storage, and client-side PDF compilation.'}
              </p>
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#111827',
                      color: '#FAF8F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    🔒
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
                      Zero-Cloud Client Compilation
                    </div>
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>
                      100% On-Device IndexedDB · AES-GCM Encrypted
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#F0FDF4',
                    color: '#16A34A',
                    border: '1px solid #DCFCE7',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 6: INTERACTIVE NEWSPAPER TEMPLATES
       * ==================================================================== */}
      <section
        id="showcase"
        style={{
          padding: '80px 24px',
          backgroundColor: '#FAF8F5',
          borderBottom: '1px solid #E7E2DA',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#78716C',
                  marginBottom: '8px',
                }}
              >
                {locale === 'hi' ? 'मुद्रण टेम्पलेट्स' : 'PRINT TEMPLATES'}
              </div>
              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 800,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#1C1917',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {t.landing.templatesHeading}
              </h2>
            </div>

            {/* Language Switcher for Preview Samples */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#EDE8E1',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid #E0DAD0',
              }}
            >
              <button
                onClick={() => setActiveShowcaseLanguage('en')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeShowcaseLanguage === 'en' ? '#FFFFFF' : 'transparent',
                  color: activeShowcaseLanguage === 'en' ? '#1C1917' : '#78716C',
                }}
              >
                English Editions
              </button>
              <button
                onClick={() => setActiveShowcaseLanguage('hi')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeShowcaseLanguage === 'hi' ? '#FFFFFF' : 'transparent',
                  color: activeShowcaseLanguage === 'hi' ? '#1C1917' : '#78716C',
                }}
              >
                हिंदी संस्करण
              </button>
            </div>
          </div>

          {/* 3 Core Authentic Newspaper Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            {/* 1. Classic Broadsheet */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E7E2DA',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#78716C',
                      textTransform: 'uppercase',
                    }}
                  >
                    {locale === 'hi' ? '८-कॉलम राष्ट्रीय मानक' : '8-Column National'}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#F5F2EB',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    Broadsheet (600×750mm)
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: '#1C1917',
                    margin: '0 0 10px 0',
                  }}
                >
                  {activeShowcaseLanguage === 'hi'
                    ? 'दैनिक जागरण शैली ब्रॉडशीट'
                    : 'The Morning Chronicle'}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#57534E',
                    lineHeight: 1.6,
                    margin: '0 0 20px 0',
                  }}
                >
                  {activeShowcaseLanguage === 'hi'
                    ? 'राष्ट्रीय दैनिक समाचार पत्रों के लिए उपयुक्त प्रामाणिक 8-कॉलम लेआउट, देवनागरी हेडिंग और विज्ञापन स्लॉट्स।'
                    : 'The grand standard for national broadsheets with 8-column modular grid, editorial kicker, and deep lead stories.'}
                </p>
              </div>
              <button
                onClick={() => onSelectTemplate('classic-hindi-broadsheet')}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#1C1917',
                  color: '#FAF8F5',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-stone-800 transition-colors"
              >
                {locale === 'hi' ? 'यह टेम्पलेट उपयोग करें →' : 'Use Broadsheet Template →'}
              </button>
            </div>

            {/* 2. Modern Berliner */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E7E2DA',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#78716C',
                      textTransform: 'uppercase',
                    }}
                  >
                    {locale === 'hi' ? '६-कॉलम यूरोपीय प्रारूप' : '6-Column European'}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#F5F2EB',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    Berliner (315×470mm)
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: '#1C1917',
                    margin: '0 0 10px 0',
                  }}
                >
                  {activeShowcaseLanguage === 'hi'
                    ? 'नवभारत आधुनिक बर्लिनर'
                    : 'The Continental Daily'}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#57534E',
                    lineHeight: 1.6,
                    margin: '0 0 20px 0',
                  }}
                >
                  {activeShowcaseLanguage === 'hi'
                    ? 'आधुनिक पाठक के लिए संतुलित 6-कॉलम ग्रिड, जिसमें सुगम पाठन और उत्कृष्ट दृश्य पदानुक्रम शामिल है।'
                    : 'Balanced modern daily layout optimized for handheld reading with high typographic density.'}
                </p>
              </div>
              <button
                onClick={() => onSelectTemplate('modern-editorial')}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#1C1917',
                  color: '#FAF8F5',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-stone-800 transition-colors"
              >
                {locale === 'hi' ? 'यह टेम्पलेट उपयोग करें →' : 'Use Berliner Template →'}
              </button>
            </div>

            {/* 3. Compact Tabloid */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E7E2DA',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#78716C',
                      textTransform: 'uppercase',
                    }}
                  >
                    {locale === 'hi' ? '५-कॉलम स्थानीय अख़बार' : '5-Column Local Daily'}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#F5F2EB',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    Tabloid (280×430mm)
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: '#1C1917',
                    margin: '0 0 10px 0',
                  }}
                >
                  {activeShowcaseLanguage === 'hi'
                    ? 'दैनिक प्रभात टैब्लॉयड'
                    : 'City Standard Tabloid'}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#57534E',
                    lineHeight: 1.6,
                    margin: '0 0 20px 0',
                  }}
                >
                  {activeShowcaseLanguage === 'hi'
                    ? 'स्थानीय और साप्ताहिक समाचार पत्रों के लिए 5-कॉलम सघन प्रारूप, तुरंत डाउनलोड एवं प्रिंटिंग।'
                    : 'High-impact 5-column compact tabloid designed for local news, cultural bulletins, and rapid reading.'}
                </p>
              </div>
              <button
                onClick={() => onSelectTemplate('compact-local')}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#1C1917',
                  color: '#FAF8F5',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-stone-800 transition-colors"
              >
                {locale === 'hi' ? 'यह टेम्पलेट उपयोग करें →' : 'Use Tabloid Template →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 7: HIGH-CONTRAST FINAL CTA (Exact Reference 4 "Transform")
       * ==================================================================== */}
      <section style={{ padding: '64px 24px', backgroundColor: '#FAF8F5' }}>
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            backgroundColor: '#111827',
            color: '#FAF8F5',
            borderRadius: '24px',
            padding: '64px 48px',
            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'clamp(30px, 4vw, 46px)',
                  fontWeight: 800,
                  color: '#FAF8F5',
                  margin: 0,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                }}
              >
                {locale === 'hi'
                  ? 'आज ही सरलता से अपनी प्रकाशन प्रक्रिया रूपांतरित करें'
                  : 'Transform Your Workflow with Ease Starting Today'}
              </h2>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '24px',
              }}
            >
              <p
                style={{
                  fontSize: '16px',
                  color: '#9CA3AF',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '460px',
                }}
              >
                {locale === 'hi'
                  ? 'आपकी संपादकीय प्रक्रियाओं को सुव्यवस्थित करने और त्वरित परिणाम देने के लिए डिज़ाइन किया गया एक सहज समाधान।'
                  : 'Experience a seamless solution designed to streamline your processes and deliver results.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={onStartCreating}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '14px 32px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                  className="hover:bg-stone-100 transition-colors"
                >
                  {locale === 'hi' ? 'मुफ़्त में प्रकाशन शुरू करें →' : 'Book a demo'}
                </button>
                {onOpenStudio && (
                  <button
                    onClick={onOpenStudio}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#FAF8F5',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '9999px',
                      padding: '13px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    className="hover:border-white transition-colors"
                  >
                    {t.common.editor}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
       * SECTION 8: STRUCTURED MINIMAL FOOTER WITH WATERMARK (Exact Reference 4)
       * ==================================================================== */}
      <footer
        style={{
          borderTop: '1px solid #E7E2DA',
          backgroundColor: '#FFFFFF',
          padding: '64px 24px 36px 24px',
          fontSize: '13px',
          color: '#78716C',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* 3 Column Minimal Navigation Grid (Exact Ref 4) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '36px',
              marginBottom: '64px',
            }}
          >
            {/* Column 1: COMPANY (Ref 4) */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1C1917',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                COMPANY
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <li>
                  <button
                    onClick={() => openModal('about')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'हमारे बारे में (About Us)' : 'About Us'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('about')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'कैरियर' : 'Careers'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('about')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'प्रेस विज्ञप्ति' : 'Press'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('contact')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'संपर्क करें' : 'Contact'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: SUPPORT (Ref 4) */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1C1917',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                SUPPORT
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <li>
                  <button
                    onClick={() => openModal('faq')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'सहायता केंद्र' : 'Help Center'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('faq')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'FAQs'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('privacy')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('terms')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '13px',
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {locale === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: SOCIAL (Ref 4) */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1C1917',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                SOCIAL
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1C1917',
                }}
              >
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1C1917', textDecoration: 'none' }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="X Twitter"
                >
                  𝕏
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1C1917', textDecoration: 'none' }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="LinkedIn"
                >
                  in
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1C1917', textDecoration: 'none' }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Facebook"
                >
                  f
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status Line */}
          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid #F0ECE4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#A8A29E',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span>© {new Date().getFullYear()} E-Paper Studio. All rights reserved.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Local-First · Zero-Telemetry · 300 DPI Vector PDF</span>
            </div>
          </div>
        </div>

        {/* Massive Faint Watermark Background (Exact Ref 4 FlowSync Style) */}
        <div
          style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(60px, 12vw, 140px)',
            fontWeight: 900,
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'rgba(28, 25, 23, 0.03)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
            letterSpacing: '0.04em',
          }}
        >
          E-PAPER STUDIO
        </div>
      </footer>

      {/* Global Modals: About, Contact, FAQ, Privacy, Terms */}
      <LegalAndSupportModal
        isOpen={isModalOpen}
        initialTab={modalTab}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
