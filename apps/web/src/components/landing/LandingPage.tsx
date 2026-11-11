import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { NewspaperPresetId } from '@epaper-studio/document-schema';
import { useI18n } from '../../i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { LegalAndSupportModal, type ModalTab } from '../common/LegalAndSupportModal';
import './landing.css';

export interface LandingPageProps {
  onStartCreating: () => void;
  onSelectTemplate: (presetId: NewspaperPresetId) => void;
  onOpenDashboard?: () => void;
  onOpenStudio?: () => void;
  onSignIn?: () => void;
}

type PreviewMode = 'broadsheet' | 'grid' | 'pdf';

interface LocalizedCopy {
  skipToContent: string;
  brandName: string;
  brandTag: string;
  navOverview: string;
  navBenefits: string;
  navTemplates: string;
  navProcess: string;
  navFaq: string;
  signIn: string;
  dashboard: string;
  openStudio: string;
  startCreating: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSecondaryCta: string;
  previewTabs: { id: PreviewMode; label: string }[];
  previewMeta: string;
  benefitsHeading: string;
  benefitsSubheading: string;
  benefits: {
    id: string;
    title: string;
    description: string;
  }[];
  taglineEyebrow: string;
  taglineWords: string;
  processHeading: string;
  processSubheading: string;
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
  templatesHeading: string;
  templatesSubheading: string;
  useTemplateBtn: string;
  templates: {
    presetId: NewspaperPresetId;
    name: string;
    format: string;
    columns: string;
    description: string;
    highlights: string[];
  }[];
  metrics: {
    value: string;
    label: string;
  }[];
  faqHeading: string;
  faqSubheading: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  finalHeading: string;
  finalSubtitle: string;
  finalGuarantee: string;
  footerDesc: string;
  footerNavHeading: string;
  footerLegalHeading: string;
  footerLinks: { label: string; tab: ModalTab }[];
  footerCopyright: string;
  footerSpec: string;
  menuLabel: string;
  closeMenuLabel: string;
}

const EN_COPY: LocalizedCopy = {
  skipToContent: 'Skip to main content',
  brandName: 'ePaper Studio',
  brandTag: 'Newspaper Press Suite',
  navOverview: 'Overview',
  navBenefits: 'Capabilities',
  navProcess: 'Process',
  navTemplates: 'Formats',
  navFaq: 'FAQ',
  signIn: 'Sign In',
  dashboard: 'Dashboard',
  openStudio: 'Open Studio',
  startCreating: 'Start Creating',
  eyebrow: 'Local First Newspaper Publishing Studio',
  heroTitle: 'Publish print ready newspapers straight from your browser',
  heroSubtitle:
    'Compose Hindi and English broadsheets with authentic column grids, linked story continuations, and sharp vector PDF output on your own device.',
  heroSecondaryCta: 'Explore Paper Formats',
  previewTabs: [
    { id: 'broadsheet', label: 'Front Page' },
    { id: 'grid', label: '12 Column Grid' },
    { id: 'pdf', label: 'Print PDF' },
  ],
  previewMeta: '300 DPI Physical Press Geometry',
  benefitsHeading: 'Purpose built for regional editorial teams',
  benefitsSubheading:
    'Every control follows real broadsheet typography, column balance, and press verification without bloated desktop software.',
  benefits: [
    {
      id: 'typography',
      title: 'Native Devanagari & Latin Type',
      description:
        'Balanced line metrics and self hosted typefaces ensure Hindi headlines and body copy stay legible across newsprint.',
    },
    {
      id: 'continuation',
      title: 'Linked Story Continuations',
      description:
        'Route long reports across pages with synchronized jump references that update automatically as you edit.',
    },
    {
      id: 'vectorpdf',
      title: 'Sharp 300 DPI Vector PDF',
      description:
        'Export exact broadsheet and tabloid dimensions with crisp hairlines, clean gutters, and press ready pages.',
    },
    {
      id: 'localfirst',
      title: 'Private Offline Storage',
      description:
        'Editions save continuously inside browser storage with fast undo history and zero cloud upload queues.',
    },
  ],
  taglineEyebrow: 'Editorial Philosophy',
  taglineWords:
    'Independent newspapers deserve crisp print typography, predictable column grids, and direct ownership of every page they publish.',
  processHeading: 'From draft stories to press sheets in three steps',
  processSubheading:
    'Set your page size, compose columns with reusable editorial blocks, and verify geometry before printing.',
  steps: [
    {
      number: '01',
      title: 'Pick a calibrated paper format',
      description:
        'Select Broadsheet, Modern Editorial, or Compact Local tabloid dimensions with preset margins and column rules.',
    },
    {
      number: '02',
      title: 'Compose stories and visual blocks',
      description:
        'Arrange mastheads, multi column articles, classifieds, horoscopes, and advertisements with snap alignment.',
    },
    {
      number: '03',
      title: 'Verify and export clean PDFs',
      description:
        'Inspect preflight checks for margins, font sizing, and overflows before exporting press ready vector files.',
    },
  ],
  templatesHeading: 'Ready formats calibrated for real print presses',
  templatesSubheading:
    'Start directly inside any edition geometry and adjust mastheads, colors, and columns at any time.',
  useTemplateBtn: 'Open Format',
  templates: [
    {
      presetId: 'classic-hindi-broadsheet',
      name: 'Classic Hindi Broadsheet',
      format: '410 × 560 mm • 8 Columns',
      columns: 'Traditional Daily',
      description:
        'Designed for regional morning dailies featuring bold vermilion banners, dense local columns, and front page briefs.',
      highlights: ['8 Column Press Grid', 'Devanagari Display Rhythm', 'Balanced Gutter Spacing'],
    },
    {
      presetId: 'modern-editorial',
      name: 'Modern Editorial',
      format: '330 × 510 mm • 6 Columns',
      columns: 'Weekly Magazine',
      description:
        'Wide breathable gutters ideal for investigative features, weekend supplements, opinion spreads, and photo essays.',
      highlights: ['6 Column Feature Layout', 'Generous Whitespace', 'Dual Language Ready'],
    },
    {
      presetId: 'compact-local',
      name: 'Compact Local Tabloid',
      format: '280 × 410 mm • 5 Columns',
      columns: 'District Bulletin',
      description:
        'Fast turnaround layout tailored for city editions, community bulletins, civic notices, and district circulars.',
      highlights: ['5 Column Tabloid', 'Quick Ad Placement', 'Compact Print Cost'],
    },
  ],
  metrics: [
    { value: '300 DPI', label: 'Vector Print Precision' },
    { value: '147', label: 'Editable Press Elements' },
    { value: '12 Col', label: 'Snap Layout Architecture' },
    { value: '100%', label: 'Local Browser Ownership' },
  ],
  faqHeading: 'Frequently asked questions',
  faqSubheading:
    'Everything newsrooms and independent publishers ask before moving editions into ePaper Studio.',
  faqs: [
    {
      question: 'Does ePaper Studio support Hindi Devanagari and English together?',
      answer:
        'Yes. You can write headlines, subheaders, classifieds, and multi column stories in Hindi, English, or mixed bilingual editions with calibrated line heights and self hosted fonts.',
    },
    {
      question: 'How does story continuation across pages work?',
      answer:
        'Long articles automatically link across destination pages with synchronized continuation markers. When pages move or reflow, references stay accurate.',
    },
    {
      question: 'Are exported PDFs suitable for commercial offset and digital printers?',
      answer:
        'Yes. Exports preserve exact physical millimeter dimensions, crisp vector typography, and 300 DPI layout geometry without rasterizing body text.',
    },
    {
      question: 'Do I need an internet connection to design or edit editions?',
      answer:
        'No. Drafts, undo history, and custom templates stay inside your browser IndexedDB storage so your workflow keeps running offline.',
    },
    {
      question: 'Can I clear a page or customize header strip colors quickly?',
      answer:
        'Yes. You can customize masthead strip colors with exact color pickers or reset a page with one click and undo immediately if needed.',
    },
    {
      question: 'How much does it cost for small publishers?',
      answer:
        'ePaper Studio is free to use directly in your browser with local document ownership and full PDF export capabilities.',
    },
  ],
  finalHeading: 'Your next edition starts here',
  finalSubtitle:
    'Open the layout workspace directly in your browser with instant autosave and zero installation.',
  finalGuarantee: 'No credit card required • Works offline • Export anytime',
  footerDesc:
    'Precision browser desktop publishing crafted for Hindi, English, and regional newspaper publishers.',
  footerNavHeading: 'Explore',
  footerLegalHeading: 'Information',
  footerLinks: [
    { label: 'About Studio', tab: 'about' },
    { label: 'Questions', tab: 'faq' },
    { label: 'Contact', tab: 'contact' },
    { label: 'Privacy Policy', tab: 'privacy' },
    { label: 'Terms of Use', tab: 'terms' },
  ],
  footerCopyright: 'Copyright 2026 ePaper Studio. All rights reserved.',
  footerSpec: 'Local First Storage • Bilingual Editorial Grids • Vector PDF',
  menuLabel: 'Open navigation menu',
  closeMenuLabel: 'Close navigation menu',
};

const HI_COPY: LocalizedCopy = {
  skipToContent: 'सीधे मुख्य हिस्से पर जाएँ',
  brandName: 'ईपेपर स्टूडियो',
  brandTag: 'अख़बार डिज़ाइन स्टूडियो',
  navOverview: 'शुरुआत',
  navBenefits: 'खूबियाँ',
  navProcess: 'कैसे बनेगा',
  navTemplates: 'पेपर साइज',
  navFaq: 'सवाल जवाब',
  signIn: 'साइन इन',
  dashboard: 'डैशबोर्ड',
  openStudio: 'स्टूडियो खोलें',
  startCreating: 'अख़बार बनाना शुरू करें',
  eyebrow: 'सीधे आपके ब्राउज़र में चलने वाला अख़बार स्टूडियो',
  heroTitle: 'सीधे ब्राउज़र से प्रिंट तैयार अख़बार बनाइए',
  heroSubtitle:
    'अपने कंप्यूटर या फ़ोन पर हिंदी और अंग्रेज़ी अख़बार के पेज तैयार करें। साफ़ कॉलम, अगले पेज पर ऑटो लिंक और प्रिंट प्रेस के लिए साफ़ PDF एक ही जगह।',
  heroSecondaryCta: 'पेपर साइज देखें',
  previewTabs: [
    { id: 'broadsheet', label: 'पहला पेज' },
    { id: 'grid', label: '12 कॉलम ग्रिड' },
    { id: 'pdf', label: 'प्रिंट PDF' },
  ],
  previewMeta: '300 DPI असली प्रिंट साइज',
  benefitsHeading: 'असली अख़बार और लोकल न्यूज़ टीमों के हिसाब से बना',
  benefitsSubheading:
    'भारी भरकम सॉफ़्टवेयर की झंझट के बिना सीधे साफ़ कॉलम, बढ़िया हिंदी फ़ॉन्ट और प्रिंट साइज की पूरी सुविधा।',
  benefits: [
    {
      id: 'typography',
      title: 'साफ़ हिंदी और अंग्रेज़ी फ़ॉन्ट',
      description:
        'बड़ी हेडिंग से लेकर छोटी ख़बर तक हर अक्षर काग़ज़ पर बिल्कुल साफ़ और पढ़ने में आसान दिखता है।',
    },
    {
      id: 'continuation',
      title: 'अगले पेज पर खबर अपने आप जुड़े',
      description:
        'लंबी ख़बर को दूसरे पेज पर भेजें, पेज बदलने पर शेष पृष्ठ की संख्या अपने आप सही रहती है।',
    },
    {
      id: 'vectorpdf',
      title: 'प्रिंट के लिए साफ़ 300 DPI PDF',
      description:
        'ऑफ़सेट और डिजिटल प्रिंटिंग के लिए सही पेपर साइज, साफ़ बॉर्डर और तुरंत छपने लायक PDF निकालें।',
    },
    {
      id: 'localfirst',
      title: 'बिना इंटरनेट भी काम सेव रहे',
      description:
        'आपकी पूरी फ़ाइल और अनडू हिस्ट्री ब्राउज़र में ही सेव रहती है, काम खोने या अपलोड होने का कोई झंझट नहीं।',
    },
  ],
  taglineEyebrow: 'हमारा मक़सद',
  taglineWords:
    'हर छोटे और बड़े अख़बार के पास महँगे सॉफ़्टवेयर के बिना ही साफ़ प्रिंट क्वालिटी, सही कॉलम और अपने काम पर पूरा हक़ होना चाहिए।',
  processHeading: 'बस तीन आसान कदम में ख़बर से प्रिंट तक',
  processSubheading:
    'अपना पेपर साइज चुनें, ख़बरें व डिज़ाइन बॉक्स सजाएँ और छपाई के लिए PDF सेव कर लें।',
  steps: [
    {
      number: '01',
      title: 'अपना अख़बार साइज चुनें',
      description:
        'दैनिक ब्रॉडशीट, वीकली मैगज़ीन या ज़िले का छोटा पेपर साइज पहले से सेट मार्जिन के साथ चुनें।',
    },
    {
      number: '02',
      title: 'ख़बरें, हेडर और विज्ञापन लगाएँ',
      description:
        'ग्रिड पर आसानी से हेडर बैनर, ख़बरों के कॉलम, राशिफल, पंचांग और विज्ञापन बॉक्स सेट करें।',
    },
    {
      number: '03',
      title: 'पेज जाँचें और PDF डाउनलोड करें',
      description:
        'छपाई से पहले मार्जिन और कटी हुई लाइनें जाँचें और तुरंत प्रिंट वाली साफ़ PDF सेव करें।',
    },
  ],
  templatesHeading: 'प्रिंट प्रेस के हिसाब से तैयार पेपर साइज',
  templatesSubheading:
    'किसी भी डिज़ाइन से तुरंत शुरू करें और बाद में हेडर का रंग, नाम और कॉलम अपनी मर्ज़ी से बदलें।',
  useTemplateBtn: 'यह साइज खोलें',
  templates: [
    {
      presetId: 'classic-hindi-broadsheet',
      name: 'क्लासिक हिंदी अख़बार',
      format: '410 × 560 मिमी • 8 कॉलम',
      columns: 'दैनिक पेपर',
      description:
        'सुबह के दैनिक अख़बारों के लिए गहरे लाल हेडर, ज़्यादा ख़बरों वाले कॉलम और फ़्रंट पेज स्टाइल के साथ।',
      highlights: ['8 कॉलम ग्रिड', 'साफ़ हिंदी हेडिंग', 'सही कॉलम गैप'],
    },
    {
      presetId: 'modern-editorial',
      name: 'मॉडर्न न्यूज़ पेपर',
      format: '330 × 510 मिमी • 6 कॉलम',
      columns: 'साप्ताहिक अंक',
      description:
        'रविवार विशेषांक, बड़ी रिपोर्ट, संपादकीय लेख और फ़ोटो स्टोरी के लिए खुला और साफ़ लेआउट।',
      highlights: ['6 कॉलम लेआउट', 'खुली और साफ़ जगह', 'हिंदी व अंग्रेज़ी'],
    },
    {
      presetId: 'compact-local',
      name: 'लोकल ज़िला टैब्लॉयड',
      format: '280 × 410 मिमी • 5 कॉलम',
      columns: 'शहर व ज़िला अंक',
      description:
        'शहर, कस्बे और स्थानीय सूचनाओं वाले छोटे अख़बारों के लिए तेज़ और कम खर्च वाला पेपर साइज।',
      highlights: ['5 कॉलम साइज', 'आसान विज्ञापन बॉक्स', 'कम छपाई खर्च'],
    },
  ],
  metrics: [
    { value: '300 DPI', label: 'साफ़ प्रिंट क्वालिटी' },
    { value: '147', label: 'तैयार डिज़ाइन बॉक्स' },
    { value: '12 कॉलम', label: 'आसान ग्रिड सिस्टम' },
    { value: '100%', label: 'आपके ब्राउज़र में सेव' },
  ],
  faqHeading: 'अक्सर पूछे जाने वाले सवाल',
  faqSubheading: 'अख़बार शुरू करने से पहले संपादकों और डिज़ाइनरों के मन में आने वाले ज़रूरी सवाल।',
  faqs: [
    {
      question: 'क्या इसमें हिंदी और अंग्रेज़ी दोनों एक साथ लिख सकते हैं?',
      answer:
        'हाँ, बिल्कुल। आप एक ही पेज पर हिंदी और अंग्रेज़ी में हेडिंग, सबहेड और ख़बरें साफ़ फ़ॉन्ट के साथ लिख सकते हैं।',
    },
    {
      question: 'अगर कोई ख़बर एक पेज पर पूरी न आए तो अगले पेज पर कैसे जाएगी?',
      answer:
        'लंबी ख़बर अपने आप दूसरे पेज से जुड़ जाती है। अगर आप पेज आगे पीछे करें तब भी शेष पृष्ठ का नंबर अपने आप सही रहता है।',
    },
    {
      question: 'क्या यहाँ से निकली PDF ऑफ़सेट और डिजिटल प्रिंट मशीन पर छप जाएगी?',
      answer:
        'हाँ। फाइल एकदम सही मिलीमीटर साइज और 300 DPI क्वालिटी में बनती है ताकि कागज़ पर हर अक्षर साफ़ छपे।',
    },
    {
      question: 'क्या काम करने के लिए हर समय इंटरनेट ज़रूरी है?',
      answer:
        'नहीं। आपका काम और अनडू हिस्ट्री ब्राउज़र में ही सेव रहती है, इसलिए नेटवर्क न होने पर भी आप काम जारी रख सकते हैं।',
    },
    {
      question: 'क्या हेडर पट्टी का रंग बदलना या एक बार में पूरा पेज साफ़ करना मुमकिन है?',
      answer:
        'जी हाँ। आप कलर पिकर से हेडर का कोई भी रंग चुन सकते हैं और एक क्लिक में पूरा पेज साफ़ या वापस अनडू कर सकते हैं।',
    },
    {
      question: 'छोटे अख़बार वालों के लिए इसकी क्या फ़ीस है?',
      answer:
        'ईपेपर स्टूडियो ब्राउज़र में इस्तेमाल करने के लिए पूरी तरह मुफ़्त है और आपकी सभी फ़ाइलें आपके ही कंप्यूटर पर सुरक्षित रहती हैं।',
    },
  ],
  finalHeading: 'अपना अगला अंक आज ही तैयार करें',
  finalSubtitle: 'बिना कुछ डाउनलोड किए सीधे ब्राउज़र में खोलें, आपका काम अपने आप सेव होता रहेगा।',
  finalGuarantee: 'कोई फ़ीस नहीं • ऑफ़लाइन भी चलेगा • तुरंत PDF निकालें',
  footerDesc:
    'हिंदी, अंग्रेज़ी और क्षेत्रीय अख़बार बनाने वालों के लिए बना आसान और तेज़ ब्राउज़र स्टूडियो।',
  footerNavHeading: 'सेक्शन',
  footerLegalHeading: 'ज़रूरी लिंक',
  footerLinks: [
    { label: 'स्टूडियो के बारे में', tab: 'about' },
    { label: 'सवाल जवाब', tab: 'faq' },
    { label: 'संपर्क करें', tab: 'contact' },
    { label: 'प्राइवेसी पॉलिसी', tab: 'privacy' },
    { label: 'नियम व शर्तें', tab: 'terms' },
  ],
  footerCopyright: 'कॉपीराइट 2026 ईपेपर स्टूडियो। सभी अधिकार सुरक्षित।',
  footerSpec: 'ब्राउज़र में सेव • हिंदी और अंग्रेज़ी • प्रिंट PDF',
  menuLabel: 'मेनू खोलें',
  closeMenuLabel: 'मेनू बंद करें',
};

/* Clean geometric Phosphor-style SVG icon primitives (uniform stroke) */
const IconMenu: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const IconClose: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const IconArrowRight: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconChevronDown: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconNewspaper: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
    <line x1="15" y1="14" x2="16" y2="14" />
  </svg>
);

const renderBenefitIcon = (id: string) => {
  switch (id) {
    case 'typography':
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      );
    case 'continuation':
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="7" height="16" rx="1.5" />
          <rect x="14" y="4" width="7" height="16" rx="1.5" />
          <path d="M10 12h4" />
        </svg>
      );
    case 'vectorpdf':
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <polyline points="14 3 14 8 19 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      );
    default:
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
          <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
        </svg>
      );
  }
};

const BroadsheetSpecimen: React.FC<{ mode: PreviewMode; locale: string }> = ({ mode, locale }) => {
  const showGrid = mode === 'grid';
  const showPdfMarks = mode === 'pdf';
  const isHi = locale === 'hi';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5DFD3',
        borderRadius: '8px',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Trim & Crop Corner Guides in Vector PDF Mode */}
      {showPdfMarks && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #E5DFD3',
            backgroundColor: '#FAF8F5',
          }}
          className="caption-3"
        >
          <span style={{ color: '#111111', fontWeight: 600 }}>
            {isHi ? 'पेपर साइज 410 × 560 मिमी' : 'Trim Box 410 × 560 mm'}
          </span>
          <span style={{ color: '#991B1B', fontWeight: 600 }}>
            {isHi ? '300 DPI प्रिंट PDF तैयार' : '300 DPI Vector Outlines Embedded'}
          </span>
        </div>
      )}

      {/* Masthead Band */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingBottom: '16px',
          marginBottom: '16px',
          borderBottom: '2px solid #111111',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            color: '#524E48',
          }}
          className="caption-3"
        >
          <span>{isHi ? 'अंक 242 • सुबह का एडिशन' : 'Vol 14 • Issue 242 • Morning Edition'}</span>
          <span>{isHi ? 'लखनऊ व पटना • मूल्य ₹5' : 'New Delhi & Lucknow • 12 Pages'}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              lineHeight: 1.05,
              fontWeight: 600,
              color: '#111111',
              letterSpacing: '-0.02em',
            }}
          >
            {isHi ? 'दैनिक जनसंदेश' : 'THE DAILY CHRONICLE'}
          </span>
          <span
            style={{
              backgroundColor: '#991B1B',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '9999px',
            }}
            className="caption-2"
          >
            {isHi ? 'मुख्य संस्करण' : 'FRONT PAGE'}
          </span>
        </div>
      </div>

      {/* Multi-Column Newspaper Layout Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          position: 'relative',
          padding: showGrid ? '8px' : '0px',
          backgroundColor: showGrid ? '#FDFBF7' : 'transparent',
          borderRadius: showGrid ? '8px' : '0px',
          outline: showGrid ? '1px dashed #991B1B' : 'none',
        }}
      >
        {/* Lead Column Block */}
        <div
          style={{
            gridColumn: 'span 1',
            border: '1px solid #E5DFD3',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#FAF8F5',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div className="caption-2" style={{ color: '#991B1B' }}>
            {showGrid
              ? isHi
                ? 'कॉलम 01 से 04'
                : 'Columns 01 to 04'
              : isHi
                ? 'प्रमुख समाचार'
                : 'Lead Report'}
          </div>
          <div className="title-1" style={{ color: '#111111' }}>
            {isHi
              ? 'शहर और ज़िले के अख़बार अब मिनटों में तैयार हो रहे हैं'
              : 'Regional presses adopt unified digital layout workflows'}
          </div>
          <p className="body-4" style={{ color: '#524E48' }}>
            {isHi
              ? 'लोकल संपादक और डिज़ाइनर बिना किसी भारी सॉफ़्टवेयर के सीधे अपने ब्राउज़र में साफ़ कॉलम और सही मार्जिन बना रहे हैं।'
              : 'District newsrooms prepare crisp multi column pages in minutes with live grid balancing and consistent margins.'}
          </p>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E5DFD3',
              backgroundColor: '#FFFFFF',
              color: '#111111',
            }}
            className="caption-3"
          >
            {isHi ? 'आगे की ख़बर पेज 04 पर पढ़ें →' : 'Continued on Page 04 →'}
          </div>
        </div>

        {/* Center Visual Column Block */}
        <div
          style={{
            border: '1px solid #E5DFD3',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#FAF8F5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div
            style={{
              borderRadius: '4px',
              backgroundColor: '#EAE4D8',
              height: '96px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #D7CFC0',
              color: '#524E48',
            }}
            className="caption-2"
          >
            {isHi ? 'मुख्य फ़ोटो बॉक्स 16:9' : 'Lead Photo Frame 16:9'}
          </div>
          <div className="title-3" style={{ color: '#111111' }}>
            {isHi
              ? 'सुबह का अंक समय से पहले ही छपाई के लिए तैयार'
              : 'Morning editions lock hours ahead of schedule'}
          </div>
          <p className="body-4" style={{ color: '#524E48' }}>
            {isHi
              ? 'ऑटो चेक पहले ही बता देता है कि कहीं लाइन कट या मार्जिन कम तो नहीं रह गया।'
              : 'Automated geometry checks catch tight gutters and overflow lines prior to plate output.'}
          </p>
        </div>

        {/* Side Column: Rashifal / Briefs */}
        <div
          style={{
            border: '1px solid #E5DFD3',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#FAF8F5',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div className="caption-2" style={{ color: '#111111' }}>
            {showGrid
              ? isHi
                ? 'कॉलम 07 और 08'
                : 'Columns 07 & 08'
              : isHi
                ? 'शहर की मुख्य बातें'
                : 'City Briefs'}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {[
              isHi ? 'आज का पंचांग और राशिफल' : 'Daily Civic Schedule',
              isHi ? 'मंडी भाव और स्थानीय ख़बरें' : 'Market Rates Summary',
              isHi ? 'विज्ञापन बॉक्स 12 × 8 सेमी' : 'Ad Slot 120 × 80 mm',
            ].map((item) => (
              <div
                key={item}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5DFD3',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: '#524E48',
                }}
                className="caption-3"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onSelectTemplate,
  onOpenDashboard,
  onOpenStudio,
  onSignIn,
}) => {
  const { locale } = useI18n();
  const copy = locale === 'hi' ? HI_COPY : EN_COPY;

  const [previewMode, setPreviewMode] = useState<PreviewMode>('broadsheet');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('about');
  const [taglineProgress, setTaglineProgress] = useState(0.35);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLElement | null>(null);

  const taglineWordArray = useMemo(
    () => copy.taglineWords.trim().split(/\s+/),
    [copy.taglineWords]
  );

  /* Progressive scroll reveal observer for standard sections */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targets = root.querySelectorAll<HTMLElement>('.lp-reveal');
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [locale]);

  /* Scroll-linked Tagline Reveal (B11): progressive word opacity transition */
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setTaglineProgress(1);
      return;
    }

    let rafId = 0;

    const measureTaglineProgress = () => {
      rafId = 0;
      const el = taglineRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const startY = vh * 0.88;
      const endY = vh * 0.25;
      const raw = (startY - rect.top) / Math.max(1, startY - endY);
      const clamped = Math.max(0.15, Math.min(1, raw));
      setTaglineProgress(clamped);
    };

    const scheduleMeasure = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(measureTaglineProgress);
      }
    };

    measureTaglineProgress();
    window.addEventListener('scroll', scheduleMeasure, { passive: true, capture: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleMeasure, true);
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, []);

  /* Escape key closes mobile drawer cleanly */
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openModal = (tab: ModalTab) => {
    setMobileMenuOpen(false);
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const navItems = [
    { id: 'lp-overview', label: copy.navOverview },
    { id: 'lp-benefits', label: copy.navBenefits },
    { id: 'lp-process', label: copy.navProcess },
    { id: 'lp-templates', label: copy.navTemplates },
    { id: 'lp-faq', label: copy.navFaq },
  ];

  return (
    <div ref={rootRef} className="lp-root" data-locale={locale}>
      {/* Skip to Main Content */}
      <a href="#lp-main" className="lp-skip-link">
        {copy.skipToContent}
      </a>

      {/* Floating Frosted Navigation Header */}
      <div className="lp-header-wrap">
        <header className="lp-header">
          <button type="button" onClick={() => scrollToSection('lp-overview')} className="lp-brand">
            <span className="lp-brand-mark">
              <IconNewspaper size={18} />
            </span>
            <span className="title-3" style={{ color: 'var(--lp-ink)' }}>
              {copy.brandName}
            </span>
          </button>

          <nav className="lp-nav-links" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="lp-nav-link button-sm"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="lp-header-actions">
            <div className="lp-header-desktop-only">
              <LanguageSelector
                variant="compact"
                style={{ borderRadius: '10px', overflow: 'hidden' }}
              />
            </div>

            {onDashboardOrSignIn({
              onDashboard: onOpenDashboard,
              onSignIn,
              dashboardLabel: copy.dashboard,
              signInLabel: copy.signIn,
            })}

            <button
              type="button"
              onClick={onStartCreating}
              className="lp-btn-primary lp-btn-primary-sm button-md lp-header-desktop-only"
            >
              {copy.startCreating}
            </button>

            <button
              type="button"
              className="lp-mobile-menu-btn"
              aria-label={mobileMenuOpen ? copy.closeMenuLabel : copy.menuLabel}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </header>
      </div>

      {/* Full-Height Mobile Drawer with 60ms Staggered Links */}
      <div
        className={`lp-mobile-drawer${mobileMenuOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="lp-brand-mark">
                <IconNewspaper size={18} />
              </span>
              <span className="title-2">{copy.brandName}</span>
            </div>
            <button
              type="button"
              className="lp-mobile-menu-btn"
              aria-label={copy.closeMenuLabel}
              onClick={() => setMobileMenuOpen(false)}
            >
              <IconClose />
            </button>
          </div>

          <div className="lp-mobile-drawer-list">
            {navItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="lp-mobile-drawer-item lp-nav-link heading-5"
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  transitionDelay: mobileMenuOpen ? `${idx * 60}ms` : '0ms',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="lp-mobile-drawer-item"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transitionDelay: mobileMenuOpen ? `${navItems.length * 60}ms` : '0ms',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <LanguageSelector style={{ borderRadius: '10px', overflow: 'hidden' }} />
            {onOpenDashboard ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="lp-btn-text button-md"
              >
                {copy.dashboard}
              </button>
            ) : onSignIn ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignIn();
                }}
                className="lp-btn-text button-md"
              >
                {copy.signIn}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onStartCreating();
            }}
            className="lp-btn-primary button-lg"
            style={{ width: '100%' }}
          >
            {copy.startCreating}
            <IconArrowRight />
          </button>
        </div>
      </div>

      {/* Main Content Landmark */}
      <main id="lp-main">
        {/* Hero Section */}
        <section id="lp-overview" className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero-copy">
              <div className="lp-eyebrow caption-2">
                <span className="lp-eyebrow-dot" />
                <span>{copy.eyebrow}</span>
              </div>

              <h1 className="heading-2 lp-hero-gradient-title">{copy.heroTitle}</h1>

              <p className="body-2" style={{ color: 'var(--lp-ink-secondary)', maxWidth: '580px' }}>
                {copy.heroSubtitle}
              </p>

              <div className="lp-hero-actions">
                <button
                  type="button"
                  onClick={onStartCreating}
                  className="lp-btn-primary button-lg"
                >
                  {copy.startCreating}
                  <IconArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('lp-templates')}
                  className="lp-btn-secondary button-md"
                >
                  {copy.heroSecondaryCta}
                </button>
              </div>
            </div>

            {/* Interactive Broadsheet Specimen Frame */}
            <div className="lp-showcase-shell lp-reveal is-visible">
              <div className="lp-showcase-toolbar">
                <div className="lp-tab-group" role="tablist" aria-label="Workspace Preview Modes">
                  {copy.previewTabs.map((tab) => {
                    const active = previewMode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setPreviewMode(tab.id)}
                        className={`lp-tab-btn button-sm${active ? ' is-active' : ''}`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <span className="caption-3" style={{ color: 'var(--lp-ink-muted)' }}>
                  {copy.previewMeta}
                </span>
              </div>

              <div className="lp-showcase-stage">
                <BroadsheetSpecimen mode={previewMode} locale={locale} />
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities / Benefits */}
        <section id="lp-benefits" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head lp-reveal">
              <h2 className="heading-4">{copy.benefitsHeading}</h2>
              <p className="body-3" style={{ color: 'var(--lp-ink-secondary)' }}>
                {copy.benefitsSubheading}
              </p>
            </div>

            <div className="lp-grid-2">
              {copy.benefits.map((benefit) => (
                <article key={benefit.id} className="lp-card lp-reveal">
                  <div className="lp-icon-box">{renderBenefitIcon(benefit.id)}</div>
                  <h3 className="title-1">{benefit.title}</h3>
                  <p className="body-4" style={{ color: 'var(--lp-ink-secondary)' }}>
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mandatory Tagline Reveal Section (Progressive Word Opacity Reveal on Scroll) */}
        <section ref={taglineRef} className="lp-section-compact" aria-label={copy.taglineEyebrow}>
          <div className="lp-container">
            <div className="lp-tagline-section">
              <div className="lp-tagline-wrap">
                <span className="caption-2" style={{ color: 'var(--lp-accent)' }}>
                  {copy.taglineEyebrow}
                </span>
                <p className="heading-4" style={{ lineHeight: 1.32 }}>
                  {taglineWordArray.map((word, index) => {
                    const threshold = (index + 1) / Math.max(1, taglineWordArray.length);
                    const localProgress = Math.max(
                      0,
                      Math.min(1, (taglineProgress - threshold * 0.78) / 0.22)
                    );
                    const wordOpacity = Number((0.28 + localProgress * 0.72).toFixed(2));
                    return (
                      <React.Fragment key={`${word}-${index}`}>
                        <span className="lp-tagline-word" style={{ opacity: wordOpacity }}>
                          {word}
                        </span>
                        {index < taglineWordArray.length - 1 ? ' ' : null}
                      </React.Fragment>
                    );
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (3 Numbered Steps) */}
        <section id="lp-process" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head lp-reveal">
              <h2 className="heading-4">{copy.processHeading}</h2>
              <p className="body-3" style={{ color: 'var(--lp-ink-secondary)' }}>
                {copy.processSubheading}
              </p>
            </div>

            <div className="lp-grid-3">
              {copy.steps.map((step) => (
                <article key={step.number} className="lp-card lp-reveal">
                  <span className="caption-2" style={{ color: 'var(--lp-accent)' }}>
                    {step.number}
                  </span>
                  <h3 className="title-1">{step.title}</h3>
                  <p className="body-4" style={{ color: 'var(--lp-ink-secondary)' }}>
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Master Paper Formats Showcase */}
        <section id="lp-templates" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head lp-reveal">
              <h2 className="heading-4">{copy.templatesHeading}</h2>
              <p className="body-3" style={{ color: 'var(--lp-ink-secondary)' }}>
                {copy.templatesSubheading}
              </p>
            </div>

            <div className="lp-grid-3">
              {copy.templates.map((tpl, idx) => (
                <article key={tpl.presetId} className="lp-template-card lp-reveal">
                  <div className="lp-template-preview">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span className="caption-2" style={{ color: 'var(--lp-ink)' }}>
                        {tpl.columns}
                      </span>
                      <span className="caption-3" style={{ color: 'var(--lp-ink-muted)' }}>
                        {tpl.format}
                      </span>
                    </div>

                    {/* Wireframe Column Grid Visualization */}
                    <div
                      style={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns:
                          idx === 0
                            ? 'repeat(4, 1fr)'
                            : idx === 1
                              ? 'repeat(3, 1fr)'
                              : 'repeat(5, 1fr)',
                        gap: '8px',
                        paddingTop: '8px',
                      }}
                    >
                      {Array.from({ length: idx === 0 ? 4 : idx === 1 ? 3 : 5 }).map(
                        (_, colIdx) => (
                          <div
                            key={colIdx}
                            style={{
                              borderRadius: '4px',
                              border: '1px solid var(--lp-border)',
                              backgroundColor:
                                colIdx === 0 ? 'var(--lp-surface)' : 'var(--lp-surface-subtle)',
                              padding: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div
                              style={{
                                height: '8px',
                                borderRadius: '2px',
                                backgroundColor: colIdx === 0 ? '#991B1B' : '#CFC7B8',
                              }}
                            />
                            <div
                              style={{
                                height: '4px',
                                borderRadius: '2px',
                                backgroundColor: '#E5DFD3',
                              }}
                            />
                            <div
                              style={{
                                height: '4px',
                                width: '72%',
                                borderRadius: '2px',
                                backgroundColor: '#E5DFD3',
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="lp-template-body">
                    <h3 className="title-1">{tpl.name}</h3>
                    <p className="body-4" style={{ color: 'var(--lp-ink-secondary)' }}>
                      {tpl.description}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: 'auto',
                        paddingTop: '8px',
                      }}
                    >
                      {tpl.highlights.map((item) => (
                        <span
                          key={item}
                          className="caption-3"
                          style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            border: '1px solid var(--lp-border)',
                            backgroundColor: 'var(--lp-bg)',
                            color: 'var(--lp-ink-secondary)',
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTemplate(tpl.presetId)}
                      className="lp-btn-secondary button-md"
                      style={{ width: '100%', marginTop: '12px' }}
                    >
                      {copy.useTemplateBtn}
                      <IconArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Proof Metrics Row */}
        <section className="lp-section-compact" aria-label="Technical Metrics">
          <div className="lp-container">
            <div className="lp-grid-4">
              {copy.metrics.map((metric) => (
                <div key={metric.label} className="lp-card lp-reveal">
                  <span className="heading-4" style={{ color: 'var(--lp-ink)' }}>
                    {metric.value}
                  </span>
                  <span className="body-4" style={{ color: 'var(--lp-ink-secondary)' }}>
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section id="lp-faq" className="lp-section">
          <div className="lp-container-narrow">
            <div className="lp-section-head lp-section-head-center lp-reveal">
              <h2 className="heading-4">{copy.faqHeading}</h2>
              <p className="body-3" style={{ color: 'var(--lp-ink-secondary)' }}>
                {copy.faqSubheading}
              </p>
            </div>

            <div className="lp-faq-list">
              {copy.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.question}
                    className={`lp-faq-item lp-reveal${isOpen ? ' is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="lp-faq-trigger"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    >
                      <span className="title-3">{faq.question}</span>
                      <IconChevronDown className="lp-faq-chevron" />
                    </button>
                    {isOpen && (
                      <div className="lp-faq-answer body-4">
                        <p style={{ margin: 0 }}>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="lp-section-compact">
          <div className="lp-container">
            <div className="lp-cta-banner lp-reveal">
              <h2 className="heading-3" style={{ color: '#FFFFFF', maxWidth: '640px' }}>
                {copy.finalHeading}
              </h2>
              <p className="body-2" style={{ color: '#D6D3D1', maxWidth: '580px' }}>
                {copy.finalSubtitle}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '16px',
                  paddingTop: '8px',
                }}
              >
                <button type="button" onClick={onStartCreating} className="lp-btn-light button-lg">
                  {copy.startCreating}
                  <IconArrowRight />
                </button>
                {onOpenStudio && (
                  <button
                    type="button"
                    onClick={onOpenStudio}
                    className="lp-btn-secondary button-md"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#FFFFFF',
                      borderColor: '#57534E',
                    }}
                  >
                    {copy.openStudio}
                  </button>
                )}
              </div>
              <span className="caption-3" style={{ color: '#A8A29E' }}>
                {copy.finalGuarantee}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-card">
            <div className="lp-footer-grid">
              <div className="lp-footer-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="lp-brand-mark">
                    <IconNewspaper size={18} />
                  </span>
                  <span className="title-2">{copy.brandName}</span>
                </div>
                <p
                  className="body-4"
                  style={{ color: 'var(--lp-ink-secondary)', maxWidth: '340px' }}
                >
                  {copy.footerDesc}
                </p>
              </div>

              <div className="lp-footer-col">
                <span className="caption-2" style={{ color: 'var(--lp-ink)' }}>
                  {copy.footerNavHeading}
                </span>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="lp-footer-link body-4"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="lp-footer-col">
                <span className="caption-2" style={{ color: 'var(--lp-ink)' }}>
                  {copy.footerLegalHeading}
                </span>
                {copy.footerLinks.map((link) => (
                  <button
                    key={link.tab}
                    type="button"
                    onClick={() => openModal(link.tab)}
                    className="lp-footer-link body-4"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lp-footer-meta caption-3">
              <span>{copy.footerCopyright}</span>
              <span>{copy.footerSpec}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Shared Support, About, FAQ, Privacy & Terms Modal */}
      <LegalAndSupportModal
        isOpen={isModalOpen}
        initialTab={modalTab}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

function onDashboardOrSignIn({
  onDashboard,
  onSignIn,
  dashboardLabel,
  signInLabel,
}: {
  onDashboard?: () => void;
  onSignIn?: () => void;
  dashboardLabel: string;
  signInLabel: string;
}) {
  if (onDashboard) {
    return (
      <button
        type="button"
        onClick={onDashboard}
        className="lp-btn-text button-sm lp-header-desktop-only"
      >
        {dashboardLabel}
      </button>
    );
  }
  if (onSignIn) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        className="lp-btn-text button-sm lp-header-desktop-only"
      >
        {signInLabel}
      </button>
    );
  }
  return null;
}
