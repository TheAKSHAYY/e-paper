import type { EditorialPreset } from '@epaper-studio/document-schema';

export const BUILTIN_EDITORIAL_PRESETS: EditorialPreset[] = [
  // 1. Breaking News Banners
  {
    id: 'preset-breaking-red',
    name: 'ब्रेकिंग न्यूज़ बैनर (Urgent Breaking Banner)',
    category: 'breaking-banner',
    description: 'लाल रंग की प्रमुख पट्टी, तात्कालिक घटनाक्रम और आपात सूचनाओं के लिए।',
    icon: '🚨',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'top-headline',
      headline:
        'संसद में ऐतिहासिक नीति पर मुहर: ग्रामीण विकास व किसान कल्याण के लिए विशेष आर्थिक पैकेज',
      subheadline:
        'सभी दलों के प्रतिनिधियों ने किया सर्वसम्मति से समर्थन, देश भर में नई योजनाओं का स्वागत',
      body: 'नई दिल्ली — संसद के विशेष सत्र में आज ग्रामीण अर्थव्यवस्था को नई गति देने वाले व्यापक आर्थिक पैकेज को अंतिम मंजूरी प्रदान कर दी गई। केंद्रीय मंत्रियों ने इसे आत्मनिर्भर भारत का आधार बताया।',
      byline: 'विशेष संवाददाता',
      dateline: 'नई दिल्ली —',
      kickerText: 'तात्कालिक सूचना (FLASH NEWS)',
      backgroundColor: '#b91c1c',
      textColor: '#ffffff',
      customColors: {
        headlineColor: '#ffffff',
        subheadlineColor: '#fef08a',
        bylineColor: '#fecaca',
        kickerColor: '#fef08a',
      },
      borders: {
        bottom: { width: 3, style: 'solid', color: '#7f1d1d' },
      },
      paddingPx: 10,
    },
  },
  {
    id: 'preset-breaking-black',
    name: 'डार्क ब्रेकिंग बैनर (Black Edition Flash)',
    category: 'breaking-banner',
    description: 'गंभीर व आधिकारिक समाचारों के लिए ब्लैक एंड गोल्ड ब्रेकिंग स्ट्रिप।',
    icon: '⚡',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'top-headline',
      headline: 'अंतरराष्ट्रीय शिखर सम्मेलन: 68 राष्ट्रों के बीच उच्च क्षमता ऊर्जा ग्रिड पर सहमति',
      subheadline: 'चार महाद्वीपों में निर्बाध आपूर्ति के लिए साझा मानक और डिजिटल नेटवर्क तैयार',
      kickerText: 'विशेष अंतरराष्ट्रीय घोषणा',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      customColors: {
        headlineColor: '#ffffff',
        subheadlineColor: '#e2e8f0',
        kickerColor: '#38bdf8',
      },
      borders: {
        bottom: { width: 3, style: 'solid', color: '#0284c7' },
      },
      paddingPx: 10,
    },
  },

  // 2. Main Headlines
  {
    id: 'preset-lead-headline',
    name: 'प्रमुख मुख्य सुर्खी (Lead Screamer Headline)',
    category: 'main-headline',
    description: 'पारंपरिक डबल रूल और अलंकृत बॉर्डर के साथ भव्य समाचार मुख्य सुर्खी।',
    icon: '📰',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'top-headline',
      headline:
        'वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता',
      subheadline:
        'चार महाद्वीपों में निर्बाध सौर व पवन ऊर्जा आपूर्ति के लिए साझा अंतरमहाद्वीपीय ग्रिड मानक तय',
      body: 'जिनेवा — लगातार छह दिनों तक चली गहन वार्ताओं के उपरांत 68 राष्ट्रों के ऊर्जा मंत्रियों ने अंतरराष्ट्रीय हरित ग्रिड समझौते पर ऐतिहासिक हस्ताक्षर किए। भारतीय प्रतिनिधिमंडल ने इसे ऊर्जा आत्मनिर्भरता की दिशा में क्रांतिकारी कदम बताया।',
      byline: 'विशेष संवाददाता, जिनेवा ब्यूरो',
      dateline: 'जिनेवा —',
      kickerText: 'अंतरराष्ट्रीय ऊर्जा शिखर सम्मेलन',
      priority: 'lead',
      borders: {
        top: { width: 1, style: 'solid', color: '#111111' },
        bottom: { width: 2.5, style: 'solid', color: '#111111' },
      },
      paddingPx: 8,
    },
  },

  // 3. Secondary Headlines
  {
    id: 'preset-secondary-deck',
    name: 'द्वितीयक 2-कॉलम सुर्खी (Secondary Two-Column Deck)',
    category: 'secondary-headline',
    description: 'संतुलित 2-कॉलम उप-सुर्खी, क्षेत्रीय व द्वितीयक प्रमुख समाचारों के लिए।',
    icon: '📄',
    defaultSpan: 6,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'भारतीय अंतरिक्ष अनुसंधान: गगनयान-2 मिशन के क्रायोजेनिक चरण का सफल परीक्षण',
      subheadline: 'स्वदेशी तकनीक से तैयार रॉकेट इंजन ने उच्च दबाव मानकों को प्राप्त किया',
      body: 'श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान केंद्र ने आज सुबह स्वदेशी क्रायोजेनिक इंजन के उच्च-दबाव प्रज्वलन परीक्षण को सफलतापूर्वक संपन्न किया। वैज्ञानिकों ने बताया कि इंजन का प्रदर्शन निर्धारित मापदंडों से भी अधिक सटीक रहा।',
      byline: 'विज्ञान प्रतिनिधि',
      dateline: 'श्रीहरिकोटा —',
      priority: 'major',
      columnSpan: 6,
      borders: {
        right: { width: 1, style: 'solid', color: '#cbd5e1' },
        bottom: { width: 1, style: 'solid', color: '#e2e8f0' },
      },
    },
  },

  // 4. Section Dividers
  {
    id: 'preset-divider-ornate',
    name: 'अलंकृत डबल सेक्शन डिवाइडर (Ornate Rule Divider)',
    category: 'section-divider',
    description: 'दोहरे अलंकृत नियमों के बीच सुरुचिपूर्ण श्रेणी विभाजक पट्टी।',
    icon: '➿',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: '— • — संपादकीय एवं राष्ट्रीय विचार विमर्श — • —',
      body: 'नीति, कूटनीति, समाज और जनहित से जुड़े समकालीन ज्वलंत मुद्दों पर देश के प्रतिष्ठित विचारकों और स्तंभकारों के स्तंभ।',
      backgroundColor: '#f8fafc',
      borders: {
        top: { width: 2, style: 'double', color: '#111111' },
        bottom: { width: 2, style: 'double', color: '#111111' },
      },
      paddingPx: 8,
    },
  },
  {
    id: 'preset-divider-ribbon',
    name: 'डार्क रिबन डिवाइडर (Black Ribbon Section Bar)',
    category: 'section-divider',
    description: 'काली पृष्ठभूमि पर सफेद पाठ, पृष्ठ के नए खंड को अलग दिखाने के लिए।',
    icon: '🎗️',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'व्यापार, वित्त एवं शेयर बाज़ार (BUSINESS & MARKETS)',
      body: 'सेंसेक्स, निफ्टी, कमोडिटी कीमतें और अंतरराष्ट्रीय व्यापार विश्लेषण की दैनिक समीक्षा',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      customColors: {
        headlineColor: '#ffffff',
        bodyColor: '#cbd5e1',
      },
      borders: {
        top: { width: 2, style: 'solid', color: '#e2e8f0' },
        bottom: { width: 2, style: 'solid', color: '#e2e8f0' },
      },
      paddingPx: 6,
    },
  },

  // 5. Special Reports
  {
    id: 'preset-special-investigation',
    name: 'विशेष पड़ताल / ग्राउंड रिपोर्ट (Special Ground Report)',
    category: 'special-report',
    description: 'लाल एक्सेंट बॉर्डर, एक्सक्लूसिव बैज और इन-डेप्थ खोजी पत्रकारिता बॉक्स।',
    icon: '🔍',
    defaultSpan: 6,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'ग्राउंड रिपोर्ट: बुंदेलखंड के सूखाग्रस्त गांवों में अमृत सरोवरों से लौटी हरियाली',
      subheadline: 'स्थानीय ग्रामीणों की जनभागीदारी और वर्षा जल संचयन तकनीक ने बदली खेती की तस्वीर',
      body: 'झांसी — शताब्दियों से सूखे का दंश झेल रहे इस अंचल में वर्षा जल संचयन की अनूठी पहल रंग लाई है। पिछले दो वर्षों में निर्मित जलाशयों के कारण भूजल स्तर में 4 मीटर की वृद्धि दर्ज की गई है।',
      kickerText: 'विशेष पड़ताल (EXCLUSIVE REPORT)',
      byline: 'संजय वर्मा, ग्रामीण विकास ब्यूरो',
      dateline: 'झांसी —',
      backgroundColor: '#fffbf0',
      borders: {
        left: { width: 4, style: 'solid', color: '#b91c1c' },
        bottom: { width: 1, style: 'solid', color: '#fde68a' },
      },
      paddingPx: 8,
    },
  },

  // 6. Category Labels
  {
    id: 'preset-category-ribbon',
    name: 'श्रेणी लेबल स्ट्रिप (Editorial Category Ribbon)',
    category: 'category-label',
    description: 'रंग-बिरंगी श्रेणी पट्टी (जैसे राजनीति, खेल, विज्ञान, सिनेमा)।',
    icon: '🏷️',
    defaultSpan: 4,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'राजनीति एवं संसद (POLITICS)',
      subheadline: 'सदन की कार्यवाही एवं संसदीय समितियों के ताजा निर्णय',
      body: 'नई दिल्ली — संसदीय कार्य मंत्रालय ने आगामी सत्र के विधायी कार्यों की रूपरेखा तैयार कर ली है। विभिन्न समितियों की रिपोर्ट आगामी सोमवार को पटल पर रखी जाएंगी।',
      kickerText: 'दैनिक संकलन',
      backgroundColor: '#f0fdf4',
      borders: {
        top: { width: 3, style: 'solid', color: '#16a34a' },
      },
      paddingPx: 6,
    },
  },

  // 7. Date / Location Strips
  {
    id: 'preset-dateline-strip',
    name: 'दिनांक व नगर स्ट्रिप (Dateline & Edition Strip)',
    category: 'dateline-strip',
    description: 'पृष्ठ के भीतर दिनांक, संस्करण, मौसम और वायु गुणवत्ता की पतली संदर्भ पट्टी।',
    icon: '📍',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'नई दिल्ली • मंगलवार, 28 अक्टूबर 2026 • पृष्ठ 2 • विशेष प्रादेशिक संस्करण',
      body: 'मौसम: साफ़ • तापमान 25°C • वायु गुणवत्ता सूचकांक AQI 128 (मध्यम) • पंजीकरण सं. DL-11001/2026',
      backgroundColor: '#f8fafc',
      borders: {
        top: { width: 1, style: 'solid', color: '#cbd5e1' },
        bottom: { width: 1, style: 'solid', color: '#cbd5e1' },
      },
      paddingPx: 4,
    },
  },

  // 8. Advertisement Banners
  {
    id: 'preset-commercial-banner',
    name: 'व्यावसायिक प्रचार बैनर (Commercial Display Banner Ad)',
    category: 'ad-banner',
    description: 'पूर्ण-चौड़ाई व्यावसायिक प्रचार पट्टी, संपर्क नंबर, ऑफर व वेबसाइट सहित।',
    icon: '📢',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'advertisement',
      headline: 'त्योहारी सीजन में अपने सपनों का आशियाना: 0% प्रोसेसिंग फीस पर गृह ऋण उपलब्ध',
      subheadline:
        'नजदीकी शाखा में संपर्क करें या ऑनलाइन आवेदन करें: www.bankhome.in | टोल फ्री: 1800-XXX-XXXX',
      body: 'नियम व शर्तें लागू। ऋण स्वीकृति बैंक के आंतरिक क्रेडिट मापदंडों पर निर्भर है। विशेष त्योहारी छूट सीमित समय के लिए वैध।',
      backgroundColor: '#eff6ff',
      textColor: '#1e3a8a',
      customColors: {
        headlineColor: '#1e40af',
        subheadlineColor: '#1d4ed8',
        bodyColor: '#475569',
      },
      borders: {
        top: { width: 2, style: 'dashed', color: '#2563eb' },
        bottom: { width: 2, style: 'dashed', color: '#2563eb' },
      },
      paddingPx: 10,
    },
  },
];
