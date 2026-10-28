export type WritingScript = 'latin' | 'cyrillic' | 'arabic' | 'hebrew' | 'cjk' | 'devanagari';

export type FontCategory = 'classic' | 'modern' | 'bold' | 'readable';

export interface HindiFontCategoryMeta {
  id: FontCategory;
  nameHi: string;
  descriptionHi: string;
}

export const HINDI_FONT_CATEGORIES: HindiFontCategoryMeta[] = [
  { id: 'classic', nameHi: 'क्लासिक', descriptionHi: 'पारंपरिक और प्रतिष्ठित शैली' },
  { id: 'modern', nameHi: 'आधुनिक', descriptionHi: 'साफ-सुथरा और समकालीन लेआउट' },
  { id: 'bold', nameHi: 'बोल्ड', descriptionHi: 'आकर्षक और भारी हेडलाइन' },
  { id: 'readable', nameHi: 'पढ़ने में आसान', descriptionHi: 'लंबे आलेखों के लिए सहज पठनीयता' },
];

export type FontRole = 'masthead' | 'headline' | 'subheadline' | 'body' | 'ui';

export interface FontRoleMeta {
  role: FontRole;
  nameHi: string;
  descriptionHi: string;
}

export const FONT_ROLES: FontRoleMeta[] = [
  { role: 'masthead', nameHi: 'अख़बार का नाम', descriptionHi: 'मुख्य शीर्षक / मास्टहेड फॉन्ट' },
  { role: 'headline', nameHi: 'मुख्य हेडलाइन', descriptionHi: 'लीड व प्रमुख समाचारों की हेडलाइन' },
  { role: 'subheadline', nameHi: 'छोटी हेडलाइन', descriptionHi: 'उप-शीर्षक और किकर' },
  { role: 'body', nameHi: 'खबर का विवरण', descriptionHi: 'कॉलम का मूल पाठ और विस्तृत समाचार' },
  { role: 'ui', nameHi: 'इंटरफ़ेस पाठ', descriptionHi: 'टूलबार और बटन' },
];

export interface DevanagariFontDefinition {
  family: string;
  cssFamily: string;
  nameHi: string;
  weights: number[];
  categories: FontCategory[];
  suitableRoles: FontRole[];
  license: 'OFL' | 'Apache 2.0';
  sampleText: string;
  shortDescriptionHi: string;
}

export const DEVANAGARI_FONTS: DevanagariFontDefinition[] = [
  {
    family: 'Rozha One',
    cssFamily: "'Rozha One', serif",
    nameHi: 'रोज़ा वन (Rozha One)',
    weights: [400],
    categories: ['classic', 'bold'],
    suitableRoles: ['masthead', 'headline'],
    license: 'OFL',
    sampleText: 'दैनिक नवप्रभात • आज की मुख्य खबर',
    shortDescriptionHi:
      'पारंपरिक भारतीय समाचार पत्रों के मास्टहेड और मुख्य हेडलाइन के लिए सर्वोत्तम।',
  },
  {
    family: 'Yatra One',
    cssFamily: "'Yatra One', serif",
    nameHi: 'यात्रा वन (Yatra One)',
    weights: [400],
    categories: ['bold', 'classic'],
    suitableRoles: ['masthead', 'headline'],
    license: 'OFL',
    sampleText: 'स्थानीय दैनिक समाचार • प्रादेशिक संस्करण',
    shortDescriptionHi: 'भारतीय रेलवे साइनेज और शास्त्रीय देवनागरी नक्काशी से प्रेरित जीवंत फॉन्ट।',
  },
  {
    family: 'Noto Serif Devanagari',
    cssFamily: "'Noto Serif Devanagari', serif",
    nameHi: 'नोटो सेरिफ़ देवनागरी (Noto Serif Devanagari)',
    weights: [400, 500, 600, 700],
    categories: ['classic', 'readable'],
    suitableRoles: ['headline', 'subheadline', 'body'],
    license: 'OFL',
    sampleText: 'सत्यमेव जयते नानृतम् • भारत की संवैधानिक यात्रा',
    shortDescriptionHi:
      'उच्च गुणवत्ता वाली सेरिफ़ टाइपोग्राफी, समाचार पत्रों के लंबे कॉलम के लिए आदर्श।',
  },
  {
    family: 'Tiro Devanagari Hindi',
    cssFamily: "'Tiro Devanagari Hindi', serif",
    nameHi: 'तीरो देवनागरी (Tiro Devanagari)',
    weights: [400],
    categories: ['classic', 'readable'],
    suitableRoles: ['headline', 'body'],
    license: 'OFL',
    sampleText: 'साहित्य, संस्कृति और गंभीर संपादकीय विश्लेषण',
    shortDescriptionHi: 'परंपरागत पुस्तक व अख़बार मुद्रण का परिष्कृत सेरिफ़ फॉन्ट।',
  },
  {
    family: 'Poppins',
    cssFamily: "'Poppins', sans-serif",
    nameHi: 'पॉपिन्स (Poppins)',
    weights: [400, 500, 600, 700, 800],
    categories: ['modern', 'bold'],
    suitableRoles: ['masthead', 'headline', 'subheadline', 'ui'],
    license: 'OFL',
    sampleText: 'डिजिटल क्रांति और आत्मनिर्भर भारत का नया युग',
    shortDescriptionHi: 'ज्यामितीय आधुनिक संस-सेरिफ़, आधुनिक दैनिकों और विज्ञापनों के लिए उपयुक्त।',
  },
  {
    family: 'Mukta',
    cssFamily: "'Mukta', sans-serif",
    nameHi: 'मुक्ता (Mukta)',
    weights: [400, 500, 600, 700, 800],
    categories: ['modern', 'bold', 'readable'],
    suitableRoles: ['headline', 'subheadline', 'body', 'ui'],
    license: 'OFL',
    sampleText: 'देश-विदेश की ताज़ा घटनाएँ और खेल समाचार',
    shortDescriptionHi: 'अखबारी संस-सेरिफ़ जो कम जगह में अधिक समाचार स्पष्टता से प्रस्तुत करता है।',
  },
  {
    family: 'Hind',
    cssFamily: "'Hind', sans-serif",
    nameHi: 'हिन्द (Hind)',
    weights: [400, 500, 600, 700],
    categories: ['modern', 'readable'],
    suitableRoles: ['subheadline', 'body', 'ui'],
    license: 'OFL',
    sampleText: 'सुलभ, स्पष्ट और संतुलित पठन अनुभव',
    shortDescriptionHi:
      'भारतीय भाषाओं के लिए विशेष रूप से डिज़ाइन किया गया कॉम्पैक्ट और स्वच्छ फॉन्ट।',
  },
  {
    family: 'Gotu',
    cssFamily: "'Gotu', serif",
    nameHi: 'गोतु (Gotu)',
    weights: [400],
    categories: ['classic'],
    suitableRoles: ['masthead', 'headline'],
    license: 'OFL',
    sampleText: 'ऐतिहासिक धरोहर और साहित्यिक विमर्श',
    shortDescriptionHi: 'पारंपरिक सुलेख (कैलीग्राफी) के घुमावदार रूपों वाला आकर्षक फॉन्ट।',
  },
];

export interface HindiFontCombination {
  id: string;
  nameHi: string;
  taglineHi: string;
  descriptionHi: string;
  mastheadFont: string;
  headlineFont: string;
  subheadlineFont: string;
  bodyFont: string;
  headlineWeight: number;
  bodyWeight: number;
}

export const RECOMMENDED_HINDI_FONT_COMBINATIONS: HindiFontCombination[] = [
  {
    id: 'classic-dainik',
    nameHi: 'क्लासिक हिंदी दैनिक',
    taglineHi: 'पारंपरिक राष्ट्रीय समाचार पत्र की भव्य शैली',
    descriptionHi:
      'मास्टहेड में भव्य रोज़ा वन, हेडलाइन में बोल्ड नोटो सेरिफ़, और समाचार विवरण में स्पष्ट नोटो सेरिफ़।',
    mastheadFont: "'Rozha One', serif",
    headlineFont: "'Noto Serif Devanagari', serif",
    subheadlineFont: "'Noto Serif Devanagari', serif",
    bodyFont: "'Noto Serif Devanagari', serif",
    headlineWeight: 700,
    bodyWeight: 400,
  },
  {
    id: 'modern-samachar',
    nameHi: 'आधुनिक हिंदी दैनिक',
    taglineHi: 'समकालीन, साफ-सुथरा और उच्च-प्रभावशाली लेआउट',
    descriptionHi:
      'मास्टहेड में भारी पॉपिन्स, हेडलाइन में मुक्ता, और समाचार विवरण में संतुलित हिन्द फॉन्ट।',
    mastheadFont: "'Poppins', sans-serif",
    headlineFont: "'Mukta', sans-serif",
    subheadlineFont: "'Mukta', sans-serif",
    bodyFont: "'Hind', sans-serif",
    headlineWeight: 700,
    bodyWeight: 400,
  },
  {
    id: 'local-gazette',
    nameHi: 'स्थानीय हिंदी समाचार पत्र',
    taglineHi: 'प्रादेशिक व नगर संस्करणों की पारंपरिक पहचान',
    descriptionHi:
      'मास्टहेड में यात्रा वन, हेडलाइन में नोटो सेरिफ़, और समाचार विवरण में तीरो देवनागरी।',
    mastheadFont: "'Yatra One', serif",
    headlineFont: "'Noto Serif Devanagari', serif",
    subheadlineFont: "'Mukta', sans-serif",
    bodyFont: "'Tiro Devanagari Hindi', serif",
    headlineWeight: 700,
    bodyWeight: 400,
  },
  {
    id: 'sahityik-patrika',
    nameHi: 'साहित्यिक एवं विचार मंच',
    taglineHi: 'संपादकीय, गंभीर आलेख और विचार-विमर्श के लिए',
    descriptionHi:
      'मास्टहेड में गोतु, मुख्य हेडलाइन में तीरो देवनागरी, और आलेख पाठ में नोटो सेरिफ़।',
    mastheadFont: "'Gotu', serif",
    headlineFont: "'Tiro Devanagari Hindi', serif",
    subheadlineFont: "'Noto Serif Devanagari', serif",
    bodyFont: "'Noto Serif Devanagari', serif",
    headlineWeight: 600,
    bodyWeight: 400,
  },
];

export const SELF_HOSTED_FONT_FAMILIES = [
  'Gotu',
  'Hind',
  'Mukta',
  'Noto Serif Devanagari',
  'Poppins',
  'Rozha One',
  'Tiro Devanagari Hindi',
  'Yatra One',
] as const;

export const SELF_HOSTED_FONTS_CSS = `/* Gotu [devanagari 400] */
@font-face {
  font-family: 'Gotu';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/gotu-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Gotu [latin 400] */
@font-face {
  font-family: 'Gotu';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/gotu-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Hind [devanagari 400] */
@font-face {
  font-family: 'Hind';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/hind-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Hind [latin 400] */
@font-face {
  font-family: 'Hind';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/hind-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Hind [devanagari 700] */
@font-face {
  font-family: 'Hind';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/hind-devanagari-700.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Hind [latin 700] */
@font-face {
  font-family: 'Hind';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/hind-latin-700.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Mukta [devanagari 400] */
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/mukta-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Mukta [latin 400] */
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/mukta-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Mukta [devanagari 700] */
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/mukta-devanagari-700.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Mukta [latin 700] */
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/mukta-latin-700.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Noto Serif Devanagari [devanagari 400] */
@font-face {
  font-family: 'Noto Serif Devanagari';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  font-display: swap;
  src: url(/fonts/noto-serif-devanagari-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Noto Serif Devanagari [latin 400] */
@font-face {
  font-family: 'Noto Serif Devanagari';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  font-display: swap;
  src: url(/fonts/noto-serif-devanagari-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Noto Serif Devanagari [devanagari 700] */
@font-face {
  font-family: 'Noto Serif Devanagari';
  font-style: normal;
  font-weight: 700;
  font-stretch: 100%;
  font-display: swap;
  src: url(/fonts/noto-serif-devanagari-devanagari-700.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Noto Serif Devanagari [latin 700] */
@font-face {
  font-family: 'Noto Serif Devanagari';
  font-style: normal;
  font-weight: 700;
  font-stretch: 100%;
  font-display: swap;
  src: url(/fonts/noto-serif-devanagari-latin-700.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Poppins [devanagari 400] */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/poppins-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Poppins [latin 400] */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/poppins-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Poppins [devanagari 700] */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/poppins-devanagari-700.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Poppins [latin 700] */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/poppins-latin-700.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Rozha One [devanagari 400] */
@font-face {
  font-family: 'Rozha One';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/rozha-one-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Rozha One [latin 400] */
@font-face {
  font-family: 'Rozha One';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/rozha-one-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Tiro Devanagari Hindi [devanagari 400] */
@font-face {
  font-family: 'Tiro Devanagari Hindi';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/tiro-devanagari-hindi-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Tiro Devanagari Hindi [latin 400] */
@font-face {
  font-family: 'Tiro Devanagari Hindi';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/tiro-devanagari-hindi-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Yatra One [devanagari 400] */
@font-face {
  font-family: 'Yatra One';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/yatra-one-devanagari-400.woff2) format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A;
}

/* Yatra One [latin 400] */
@font-face {
  font-family: 'Yatra One';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/fonts/yatra-one-latin-400.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`;

/**
 * @deprecated Google Fonts CDN link has been replaced by self-hosted fonts in apps/web/public/fonts
 */
export const GOOGLE_FONTS_DEVANAGARI_CSS_URL = '';

export interface FontDefinition {
  family: string;
  sourceUrl?: string;
  weights: number[];
  optimalDpiRange: [number, number];
  scripts: WritingScript[];
}

export interface FontCascadeConfig {
  primarySerif: string;
  primarySans: string;
  fallbackMono: string;
  scriptOverrides: Partial<Record<WritingScript, string>>;
}

export const DEFAULT_EPAPER_FONTS: FontDefinition[] = [
  {
    family: 'Literata',
    weights: [400, 600, 700],
    optimalDpiRange: [200, 300],
    scripts: ['latin', 'cyrillic'],
  },
  {
    family: 'Newsreader',
    weights: [400, 500, 700],
    optimalDpiRange: [220, 300],
    scripts: ['latin'],
  },
  {
    family: 'Noto Sans CJK',
    weights: [400, 700],
    optimalDpiRange: [200, 300],
    scripts: ['cjk'],
  },
  {
    family: 'Noto Naskh Arabic',
    weights: [400, 700],
    optimalDpiRange: [200, 300],
    scripts: ['arabic'],
  },
  {
    family: 'Noto Serif Devanagari',
    weights: [400, 600, 700],
    optimalDpiRange: [200, 300],
    scripts: ['devanagari'],
  },
];

export function resolveFontFallback(script: WritingScript): string {
  const matched = DEFAULT_EPAPER_FONTS.find((f) => f.scripts.includes(script));
  return matched ? matched.family : 'serif';
}
