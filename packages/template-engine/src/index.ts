import {
  PAGE_SIZE_DEFINITIONS,
  type MinimalDocument,
  type SupportedDevice,
  type NewspaperDocument,
  type NewspaperPresetId,
  type PageSizePreset,
  type PageOrientation,
  type Article,
  type MastheadConfig,
  type NewspaperLayoutConfig,
  type NewspaperPage,
  type SpacingDensity,
  createNewBlankPage,
  getImageObjectPosition,
  getImageAspectRatio,
  resolvePageColumnCount,
} from '@epaper-studio/document-schema';
import {
  GOOGLE_FONTS_DEVANAGARI_CSS_URL,
  RECOMMENDED_HINDI_FONT_COMBINATIONS,
  DEVANAGARI_FONTS,
  SELF_HOSTED_FONTS_CSS,
} from '@epaper-studio/typography';

export {
  resolvePageColumnCount,
  GOOGLE_FONTS_DEVANAGARI_CSS_URL,
  RECOMMENDED_HINDI_FONT_COMBINATIONS,
  DEVANAGARI_FONTS,
  SELF_HOSTED_FONTS_CSS,
};

export * from './freeLayout.js';

/* ====================================================================
 * Legacy Template Engine Interfaces (Backward Compatibility)
 * ==================================================================== */

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'newspaper' | 'digest' | 'dashboard' | 'planner' | 'crossword';
  targetDevice: SupportedDevice;
  defaultOrientation: 'portrait' | 'landscape';
}

export interface RenderContext {
  locale: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface TemplateCompileResult {
  success: boolean;
  document: MinimalDocument;
  warnings: string[];
}

export function compileTemplate(
  template: TemplateDefinition,
  context: RenderContext
): TemplateCompileResult {
  const minimalDoc: MinimalDocument = {
    schemaVersion: '1.0.0',
    metadata: {
      title: `${template.name} - ${context.timestamp}`,
      language: context.locale,
      direction: 'ltr',
      device: template.targetDevice,
      orientation: template.defaultOrientation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    pages: [],
  };

  return {
    success: true,
    document: minimalDoc,
    warnings: [],
  };
}

/* ====================================================================
 * Newspaper Publishing Presets & Engines (Phase 1)
 * ==================================================================== */

export interface NewspaperPreset {
  id: NewspaperPresetId;
  name: string;
  tagline: string;
  description: string;
  recommendedPageSize: PageSizePreset;
  defaultColumns: number;
  columnRule: boolean;
  mastheadStyle: 'ornate-double-rule' | 'clean-minimal' | 'bold-slab';
  mastheadFont?: string;
  headlineFont: string;
  subheadlineFont?: string;
  bodyFont: string;
  headlineWeight?: number;
  bodyFontSizePt: number;
  spacingDensity: 'compact' | 'normal' | 'spacious';
  accentColor: string;
  defaultMasthead: MastheadConfig;
  seedArticles: Article[];
}

export const NEWSPAPER_PRESETS: Record<NewspaperPresetId, NewspaperPreset> = {
  'classic-hindi-broadsheet': {
    id: 'classic-hindi-broadsheet',
    name: 'क्लासिक हिंदी समाचार पत्र',
    tagline: 'पारंपरिक राष्ट्रीय समाचार पत्र की भव्य एवं प्रामाणिक शैली',
    description:
      '4-कॉलम का सुव्यवस्थित लेआउट, भव्य रोज़ा वन मास्टहेड, क्लासिक डबल-रूल बॉर्डर, पंचांग व मौसम के कोने, और प्रमुख लीड समाचार।',
    recommendedPageSize: 'broadsheet',
    defaultColumns: 4,
    columnRule: true,
    mastheadStyle: 'ornate-double-rule',
    mastheadFont: "'Rozha One', serif",
    headlineFont: "'Noto Serif Devanagari', serif",
    subheadlineFont: "'Noto Serif Devanagari', serif",
    bodyFont: "'Noto Serif Devanagari', serif",
    headlineWeight: 700,
    bodyFontSizePt: 10,
    spacingDensity: 'normal',
    accentColor: '#1a1a1a',
    defaultMasthead: {
      title: 'जनवाणी समाचार',
      tagline: 'सत्य, निष्पक्षता और जनसेवा का प्रतीक',
      subtitle: 'सत्य, निष्पक्षता और जनसेवा का प्रतीक • स्थापना 1947',
      establishmentYear: '1947',
      fontFamily: "'Rozha One', serif",
      fontSizePt: 52,
      alignment: 'center',
      ruleStyle: 'ornate-double',
      emblem: 'none',
      customEmblemUrl: '',
      weatherCity: 'नई दिल्ली',
      temperature: '25°C',
      weatherCondition: 'साफ़ आसमान',
      weatherNotice: 'मौसम: साफ़ आसमान, 25°C',
      airQuality: 'AQI 128 • मध्यम',
      price: 'मूल्य ₹5.00',
      postalRegNumber: 'पंजीयन सं. DL-11001/2026',
      pageCountLabel: 'कुल पृष्ठ 8',
      dayOfWeek: 'बुधवार',
      date: '28 अक्टूबर 2026',
      volumeYear: 'वर्ष 78',
      issueCount: 'अंक 142',
      issueNumber: 'वर्ष 78 • अंक 142',
      edition: 'प्रातःकालीन मुख्य संस्करण',
      showTopStrip: true,
      showWeather: true,
      showAirQuality: true,
      showTagline: true,
      showEstablishment: true,
      showPrice: true,
      showPostalReg: true,
      showBottomStrip: true,
      showVolumeIssue: true,
      showDate: true,
      showEdition: true,
      showEmblem: false,
    },
    seedArticles: [
      {
        id: 'seed-chb-1',
        headline:
          'वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता',
        subheadline:
          'चार महाद्वीपों में निर्बाध सौर व पवन ऊर्जा आपूर्ति के लिए साझा अंतरमहाद्वीपीय ग्रिड मानक तय',
        body: 'जिनेवा — लगातार छह दिनों तक चली गहन वार्ताओं के उपरांत 68 राष्ट्रों के ऊर्जा मंत्रियों ने अंतरराष्ट्रीय हरित ग्रिड समझौते पर ऐतिहासिक हस्ताक्षर किए।\n\nइस दूरगामी समझौते के अंतर्गत उच्च वोल्टेज डायरेक्ट करंट (HVDC) गलियारों का एक अंतरमहाद्वीपीय नेटवर्क तैयार किया जाएगा। समझौते के लागू होने से सौर व पवन ऊर्जा की अतिरिक्त आपूर्ति को उन क्षेत्रों तक तत्काल भेजा जा सकेगा जहां मांग अधिक है।\n\nभारतीय प्रतिनिधिमंडल के प्रमुख ने कहा, "आज ऊर्जा आत्मनिर्भरता और जलवायु संरक्षण की दिशा में एक क्रांतिकारी शुरुआत हुई है। अब प्राकृतिक ऊर्जा स्रोतों की सीमाएं भौगोलिक बंधनों से परे होंगी।"',
        byline: 'विशेष संवाददाता, जिनेवा ब्यूरो',
        dateline: 'जिनेवा —',
        imageUrl: '',
        imageCaption:
          'जिनेवा में अंतरराष्ट्रीय ऊर्जा समझौते पर हस्ताक्षर के दौरान राष्ट्रों के प्रतिनिधि।',
        imagePlacement: 'top',
        columnSpan: 3,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'seed-chb-2',
        headline: 'भारतीय अंतरिक्ष अनुसंधान: गगनयान-2 मिशन के क्रायोजेनिक चरण का सफल परीक्षण',
        subheadline: 'स्वदेशी तकनीक से तैयार रॉकेट इंजन ने उच्च दबाव मानकों को प्राप्त किया',
        body: 'श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान केंद्र ने आज सुबह स्वदेशी क्रायोजेनिक इंजन के उच्च-दबाव प्रज्वलन परीक्षण को सफलतापूर्वक संपन्न किया।\n\nइस महत्वपूर्ण चरण की सफलता से आगामी मानव अंतरिक्ष उड़ान के लिए मार्ग प्रशस्त हो गया है। वैज्ञानिकों ने बताया कि इंजन का प्रदर्शन निर्धारित मापदंडों से भी अधिक सटीक रहा।',
        byline: 'विज्ञान प्रतिनिधि',
        dateline: 'श्रीहरिकोटा —',
        imageUrl: '',
        imageCaption: 'क्रायोजेनिक परीक्षण केंद्र पर प्रज्वलन का दृश्य।',
        imagePlacement: 'none',
        columnSpan: 1,
        priority: 'major',
        orderIndex: 1,
      },
      {
        id: 'seed-chb-3',
        headline: 'डिजिटल कृषि और उपग्रह मौसम निगरानी से रबी फसलों की बंपर पैदावार का अनुमान',
        subheadline: 'ग्रामीण भारत में उपग्रह डेटा और मृदा स्वास्थ्य कार्ड से किसानों को सीधा लाभ',
        body: 'नई दिल्ली — कृषि मंत्रालय द्वारा जारी ताजा आंकड़ों के अनुसार देश के उत्तरी और मध्य मैदानी भागों में गेहूं तथा दलहन की बुवाई ने पिछले सभी रिकॉर्ड तोड़ दिए हैं।\n\nसटीक मौसम पूर्वानुमान और उपग्रह आधारित सिंचाई परामर्श से किसानों की लागत में उल्लेखनीय कमी दर्ज की गई है। कृषि विशेषज्ञों का मानना है कि इस वर्ष खाद्यान्न उत्पादन में नया कीर्तिमान स्थापित होगा।',
        byline: 'कृषि एवं ग्रामीण विकास डेस्क',
        dateline: 'नई दिल्ली —',
        imageUrl: '',
        imageCaption: 'सिंचाई व मृदा परीक्षण की आधुनिक तकनीक।',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'minor',
        orderIndex: 2,
      },
      {
        id: 'seed-chb-4',
        headline: 'प्रादेशिक एवं नगर समाचार संक्षेप',
        subheadline: 'परिवहन, शिक्षा, संस्कृति और पर्यावरण से जुड़े संक्षिप्त समाचार',
        body: '• मेट्रो विस्तार परियोजना के तीसरे चरण को मिली अंतिम पर्यावरणीय मंजूरी; निर्माण कार्य शीघ्र प्रारंभ होगा।\n• राष्ट्रीय पुस्तक मेले में भारतीय भाषाओं की कृतियों के लिए विशेष दालान का उद्घाटन।\n• यमुना नदी के तटीय क्षेत्रों में जैव विविधता पार्क के संरक्षण हेतु नागरिकों का अनूठा श्रमदान अभियान।',
        byline: 'कार्यालय प्रतिनिधि',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'brief',
        orderIndex: 3,
      },
    ],
  },
  'modern-hindi-daily': {
    id: 'modern-hindi-daily',
    name: 'आधुनिक हिंदी दैनिक',
    tagline: 'समकालीन, साफ-सुथरा और उच्च-प्रभावशाली समाचार पत्र',
    description:
      'पॉपिन्स व मुक्ता टाइपोग्राफी, 3-कॉलम का खुला व हवादार ग्रिड, समकालीन शीर्ष सज्जा, और आकर्षक डिस्प्ले।',
    recommendedPageSize: 'berliner',
    defaultColumns: 3,
    columnRule: false,
    mastheadStyle: 'clean-minimal',
    mastheadFont: "'Poppins', sans-serif",
    headlineFont: "'Mukta', sans-serif",
    subheadlineFont: "'Mukta', sans-serif",
    bodyFont: "'Hind', sans-serif",
    headlineWeight: 700,
    bodyFontSizePt: 10.5,
    spacingDensity: 'spacious',
    accentColor: '#b22222',
    defaultMasthead: {
      title: 'प्रभात समाचार',
      tagline: 'विचार, नवाचार और समकालीन भारत की सशक्त आवाज़',
      subtitle: 'विचार, नवाचार और समकालीन भारत की सशक्त आवाज़ • स्थापना 2005',
      establishmentYear: '2005',
      fontFamily: "'Poppins', sans-serif",
      fontSizePt: 48,
      alignment: 'center',
      ruleStyle: 'single-hairline',
      emblem: 'none',
      customEmblemUrl: '',
      weatherCity: 'नई दिल्ली',
      temperature: '26°C',
      weatherCondition: 'धूप खिली',
      weatherNotice: 'अधिकतम 28°C • न्यूनतम 18°C',
      airQuality: 'AQI 115 • संतोषजनक',
      price: 'मूल्य ₹6.00',
      postalRegNumber: 'पंजीयन सं. DL-11002/2026',
      pageCountLabel: 'कुल पृष्ठ 8',
      dayOfWeek: 'बुधवार',
      date: '28 अक्टूबर 2026',
      volumeYear: 'वर्ष 21',
      issueCount: 'अंक 315',
      issueNumber: 'वर्ष 21 • अंक 315',
      edition: 'मेट्रो संध्या संस्करण',
      showTopStrip: true,
      showWeather: true,
      showAirQuality: true,
      showTagline: true,
      showEstablishment: true,
      showPrice: true,
      showPostalReg: true,
      showBottomStrip: true,
      showVolumeIssue: true,
      showDate: true,
      showEdition: true,
      showEmblem: false,
    },
    seedArticles: [
      {
        id: 'seed-mhd-1',
        headline:
          'आर्टिफिशियल इंटेलिजेंस और प्राथमिक स्वास्थ्य: दूरदराज गांवों में डिजिटल निदान का विस्तार',
        subheadline:
          'टेली-मेडिसिन और स्वचालित डायग्नोस्टिक किट्स से लाखों ग्रामीणों को समय पर चिकित्सा सहायता उपलब्ध',
        body: 'डिजिटल इंडिया मिशन के तहत अब ग्रामीण प्राथमिक स्वास्थ्य केंद्रों को अत्याधुनिक एआई डायग्नोस्टिक नेटवर्क से जोड़ा जा रहा है।\n\nविशेषज्ञ चिकित्सकों की अनुपस्थिति में भी प्राथमिक जांच रिपोर्ट मिनटों में तैयार हो जाती है, जिससे समय रहते गंभीर बीमारियों की पहचान संभव हो पा रही है। स्वास्थ्य विशेषज्ञों ने इसे जनस्वास्थ्य क्षेत्र की बड़ी क्रांति बताया है।',
        byline: 'आलेख: डॉ. रश्मि सक्सेना, स्वास्थ्य संपादक',
        dateline: 'भोपाल —',
        imageUrl: '',
        imageCaption: 'डिजिटल स्वास्थ्य केंद्र पर रोगी जांच का प्रदर्शन।',
        imagePlacement: 'top',
        columnSpan: 2,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'seed-mhd-2',
        headline: 'हरित गतिशीलता: देश के पचास नए शहरों में इलेक्ट्रिक बस कॉरिडोर का शुभारंभ',
        subheadline: 'शहरी प्रदूषण में 25 प्रतिशत की कमी का लक्ष्य लेकर शुरू की गई नई योजना',
        body: 'सार्वजनिक परिवहन को पर्यावरण के अनुकूल बनाने के लिए केंद्र सरकार ने पचास प्रमुख शहरों में समर्पित इलेक्ट्रिक बस मार्गों को मंजूरी दे दी है।\n\nइन बसों में दिव्यांगजनों के लिए विशेष रैंप, वातानुकूलित केबिन और महिला सुरक्षा हेतु सीसीटीवी कैमरे लगाए गए हैं।',
        byline: 'शहरी विकास संवाददाता',
        dateline: 'नई दिल्ली —',
        imageUrl: '',
        imageCaption: 'स्मार्ट डिपो पर चार्ज होती नई इलेक्ट्रिक बसें।',
        imagePlacement: 'none',
        columnSpan: 1,
        priority: 'major',
        orderIndex: 1,
      },
      {
        id: 'seed-mhd-3',
        headline: 'साहित्यिक उत्सव: युवा रचनाकारों के उपन्यास और अनुवादों पर केंद्रित विशेष सत्र',
        subheadline:
          'भारतीय भाषाओं के बीच पारस्परिक अनुवाद कार्यशालाओं को मिला पाठकों का भारी प्रोत्साहन',
        body: 'तीन दिवसीय राष्ट्रीय भाषा संवाद में इस बार क्षेत्रीय बोलियों और प्रमुख भारतीय भाषाओं के समकालीन साहित्य पर विस्तृत चर्चा हुई।\n\nसत्र में उपस्थित वरिष्ठ साहित्यकारों ने कहा कि अनुवाद ही भारतीय भाषाओं की समृद्ध विरासत को एक-दूसरे के निकट लाने का सबसे सशक्त सेतु है।',
        byline: 'सांस्कृतिक डेस्क',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 3,
        priority: 'minor',
        orderIndex: 2,
      },
    ],
  },
  'local-hindi-gazette': {
    id: 'local-hindi-gazette',
    name: 'स्थानीय हिंदी समाचार पत्र',
    tagline: 'प्रादेशिक, नगर व कस्बाई जनजीवन का सशक्त मंच',
    description:
      'यात्रा वन मास्टहेड, स्थानीय संस्करण पहचान, जनसमस्याओं और मोहल्ला समाचारों के लिए घनीभूत 4-कॉलम लेआउट।',
    recommendedPageSize: 'tabloid',
    defaultColumns: 4,
    columnRule: true,
    mastheadStyle: 'bold-slab',
    mastheadFont: "'Yatra One', serif",
    headlineFont: "'Noto Serif Devanagari', serif",
    subheadlineFont: "'Mukta', sans-serif",
    bodyFont: "'Tiro Devanagari Hindi', serif",
    headlineWeight: 700,
    bodyFontSizePt: 9.5,
    spacingDensity: 'compact',
    accentColor: '#1a1a1a',
    defaultMasthead: {
      title: 'जनसत्ता संदेश',
      tagline: 'क्षेत्रीय समाचार, जनआवाज़ और नागरिक अधिकार',
      subtitle: 'क्षेत्रीय समाचार, जनआवाज़ और नागरिक अधिकार • स्थापना 1995',
      establishmentYear: '1995',
      fontFamily: "'Yatra One', serif",
      fontSizePt: 50,
      alignment: 'center',
      ruleStyle: 'classic-double',
      emblem: 'none',
      customEmblemUrl: '',
      weatherCity: 'मुख्यालय',
      temperature: '24°C',
      weatherCondition: 'साफ मौसम',
      weatherNotice: 'स्थानीय मौसम: साफ आसमान, 24°C',
      airQuality: 'AQI 92 • अच्छा',
      price: 'मूल्य ₹3.00',
      postalRegNumber: 'पंजीयन सं. UP-42001/2026',
      pageCountLabel: 'कुल पृष्ठ 4',
      dayOfWeek: 'बुधवार',
      date: '28 अक्टूबर 2026',
      volumeYear: 'वर्ष 15',
      issueCount: 'अंक 28',
      issueNumber: 'वर्ष 15 • अंक 28',
      edition: 'नगर व देहात संस्करण',
      showTopStrip: true,
      showWeather: true,
      showAirQuality: true,
      showTagline: true,
      showEstablishment: true,
      showPrice: true,
      showPostalReg: true,
      showBottomStrip: true,
      showVolumeIssue: true,
      showDate: true,
      showEdition: true,
      showEmblem: false,
    },
    seedArticles: [
      {
        id: 'seed-lhg-1',
        headline:
          'नगर पालिका का ऐतिहासिक बजट: पुरानी गलियों का कायाकल्प और शुद्ध पेयजल आपूर्ति प्राथमिकता',
        subheadline: 'सभी वार्डों में नई सीवर लाइन और स्ट्रीट लाइट के लिए विशेष आवंटन स्वीकृत',
        body: 'स्थानीय नगर पालिका बोर्ड की वार्षिक बैठक में सर्वसम्मति से विकासोन्मुखी बजट पारित किया गया।\n\nनगर अध्यक्ष ने घोषणा की कि आगामी तीन माह में नगर के सभी मुख्य मार्गों पर भूमिगत जल निकासी प्रणाली का कार्य पूर्ण कर लिया जाएगा। नागरिकों ने इस निर्णय का स्वागत किया है।',
        byline: 'नगर प्रतिनिधि',
        dateline: 'मुख्यालय —',
        imageUrl: '',
        imageCaption: 'नगर पालिका सभागार में बजट प्रस्तुत करते हुए अध्यक्ष।',
        imagePlacement: 'top',
        columnSpan: 2,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'seed-lhg-2',
        headline: 'कृषि उपज मंडी में दलहन व तिलहन की रिकॉर्ड आवक, समर्थन मूल्य पर पारदर्शी खरीद',
        subheadline: 'ई-मंडी पोर्टल से किसानों के बैंक खातों में 24 घंटे में भुगतान सुनिश्चित',
        body: 'स्थानीय कृषि मंडी में रबी फसलों की भारी आवक के बीच डिजिटल वजन और त्वरित भुगतान व्यवस्था से किसान बेहद संतुष्ट हैं।\n\nमंडी सचिव ने बताया कि अब तक 40 हजार क्विंटल अनाज की खरीद बिना किसी व्यवधान के पूरी की जा चुकी है।',
        byline: 'मंडी समाचार',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 1,
        priority: 'major',
        orderIndex: 1,
      },
      {
        id: 'seed-lhg-3',
        headline:
          'नागरिक मंच: स्वच्छता अभियान में उत्कृष्ट कार्य हेतु वार्ड पार्षदों का नागरिक अभिनंदन',
        subheadline: 'जनभागीदारी से मोहल्लों में कचरा प्रबंधन का सफल मॉडल बना चर्चा का विषय',
        body: 'नागरिक कल्याण समिति की ओर से नगर के स्वच्छतम तीन वार्डों के प्रतिनिधियों को स्मृति चिन्ह देकर सम्मानित किया गया।\n\nवक्ताओं ने कहा कि जब तक प्रत्येक नागरिक अपने मोहल्ले की स्वच्छता की जिम्मेदारी नहीं लेगा, तब तक स्थायी सुधार संभव नहीं है।',
        byline: 'कार्यालय प्रतिनिधि',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 1,
        priority: 'minor',
        orderIndex: 2,
      },
      {
        id: 'seed-lhg-4',
        headline: 'कस्बा डायरी: साप्ताहिक हाट, बिजली आपूर्ति और खेलकूद प्रतियोगिताएँ',
        subheadline: 'आसपास के ग्रामीण अंचल से जुड़ी उपयोगी सूचनाएं',
        body: '• आगामी रविवार को टाउन हॉल मैदान में अंतर-विद्यालयीय कबड्डी व वॉलीबॉल प्रतियोगिता का आयोजन।\n• ग्रिड उपकेंद्र पर आवश्यक रख-रखाव के कारण कल दोपहर 12 से 3 बजे तक विद्युत आपूर्ति बंद रहेगी।\n• राजकीय महाविद्यालय में स्नातक कक्षाओं के परीक्षा प्रवेश पत्र वितरित किए जा रहे हैं।',
        byline: 'विशेष रिपोर्ट',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 4,
        priority: 'brief',
        orderIndex: 3,
      },
    ],
  },
  'classic-broadsheet': {
    id: 'classic-broadsheet',
    name: 'Classic Broadsheet',
    tagline: 'Timeless National & International Broadsheet Aesthetic',
    description:
      'Dense 4-to-5 column grid with formal double-line masthead, ornate corner ears, vertical column dividing rules, and prominent lead story hierarchy.',
    recommendedPageSize: 'broadsheet',
    defaultColumns: 4,
    columnRule: true,
    mastheadStyle: 'ornate-double-rule',
    headlineFont: "'Playfair Display', serif",
    bodyFont: "'Source Serif 4', serif",
    bodyFontSizePt: 10,
    spacingDensity: 'normal',
    accentColor: '#1a1a1a',
    defaultMasthead: {
      title: 'THE DAILY CHRONICLE',
      tagline: 'The Inviolable Record of National & International Affairs',
      subtitle: 'The Inviolable Record of National & International Affairs • Founded 1888',
      establishmentYear: '1888',
      fontFamily: "'Playfair Display', serif",
      fontSizePt: 48,
      alignment: 'center',
      ruleStyle: 'ornate-double',
      emblem: 'none',
      customEmblemUrl: '',
      weatherCity: 'National',
      temperature: '18°C',
      weatherCondition: 'Overcast',
      weatherNotice: 'Overcast, 18°C • Wind NW 12kt',
      airQuality: 'AQI 45 • Good',
      price: '$2.50',
      postalRegNumber: 'Reg. No. 24910/2026',
      pageCountLabel: '8 Pages',
      dayOfWeek: 'Wednesday',
      date: 'October 28, 2026',
      volumeYear: 'Vol. CXXXVIII',
      issueCount: 'No. 24,910',
      issueNumber: 'Vol. CXXXVIII No. 24,910',
      edition: 'National Morning Edition',
      showTopStrip: true,
      showWeather: true,
      showAirQuality: true,
      showTagline: true,
      showEstablishment: true,
      showPrice: true,
      showPostalReg: true,
      showBottomStrip: true,
      showVolumeIssue: true,
      showDate: true,
      showEdition: true,
      showEmblem: false,
    },
    seedArticles: [
      {
        id: 'seed-cb-1',
        headline: 'Global Energy Summit Reaches Unprecedented Treaty on Clean Power Grids',
        subheadline:
          'Delegates from 68 nations pledge unified international interconnectivity by 2035',
        body: 'GENEVA — In an extraordinary late-night plenary session that concluded six days of grueling negotiations, ministers representing sixty-eight nations unanimously ratified the International Grid Accord.\n\nThe framework establishes binding common standards for ultra-high voltage direct current corridors spanning four continents, creating the technical scaffolding for uninterrupted continent-scale renewable power distribution.\n\n"Today we witness the end of energy isolationism," declared chief envoy Dr. Aris Thorne during the signing ceremony. "A storm in the North Atlantic will soon illuminate homes across the Mediterranean without technical friction."',
        byline: 'By Arthur Sterling, Senior Diplomatic Correspondent',
        dateline: 'GENEVA —',
        imageUrl: '',
        imageCaption:
          'Plenary hall at the Palais des Nations following the historic vote ratification.',
        imagePlacement: 'top',
        columnSpan: 3,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'seed-cb-2',
        headline: 'Central Bank Confirms Transition to Quantum-Resistant Ledger Cryptography',
        subheadline:
          'Four-year phase-in to protect national clearing networks from algorithmic advances',
        body: 'FRANKFURT — The Governing Council this morning published definitive technical guidance mandating post-quantum cryptographic primitives across all tier-one interbank settlement mechanisms by fourth quarter.\n\nFinancial infrastructure operators must immediately commence dual-signing pilot runs. Field tests over the past year have demonstrated negligible transaction latency increases despite quadrupled key signatures.',
        byline: 'By Clara Vance, Financial Markets Bureau',
        dateline: 'FRANKFURT —',
        imageUrl: '',
        imageCaption: 'Governor addressing monetary policy committee.',
        imagePlacement: 'none',
        columnSpan: 1,
        priority: 'major',
        orderIndex: 1,
      },
      {
        id: 'seed-cb-3',
        headline:
          'Excavations in Indus Basin Reveal Uncatalogued Bronze Age Astronomical Observatory',
        subheadline:
          'Alignments with solstice and lunar standstills challenge established regional chronology',
        body: 'HARAPPA PROVINCE — Archaeologists working along the dry paleochannels of the Ghaggar-Hakra riverbed have unearthed an expansive dressed-sandstone megalithic complex exhibiting precise cardinal orientation.\n\nCarbon samples extracted from the foundation strata date the monument to approximately 2600 BCE, preceding known monumental stone observatories across the subcontinent by over a millennium.',
        byline: 'By Devashish Mukherjee, Archaeological Science Fellow',
        dateline: 'HARAPPA —',
        imageUrl: '',
        imageCaption: 'Concentric stone quadrants aligning with the vernal azimuth.',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'minor',
        orderIndex: 2,
      },
      {
        id: 'seed-cb-4',
        headline: 'Briefs From the Provinces',
        subheadline: 'Notes on regional agriculture, infrastructure, and maritime navigation',
        body: '• Northern Rail Corridor completes electrification of high-altitude mountain spur twelve weeks ahead of schedule.\n• Winter wheat acreage reports record germination rates following balanced seasonal precipitation.\n• Deepwater port expansion clears final environmental impact review with expanded artificial reef sanctuaries.',
        byline: 'Chronicle Staff Reports',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'brief',
        orderIndex: 3,
      },
    ],
  },
  'modern-editorial': {
    id: 'modern-editorial',
    name: 'Modern Editorial',
    tagline: 'Contemporary Magazine-Style Journalistic Format',
    description:
      'Asymmetric 3-column layout balancing sharp modern serif headlines with sleek sans-serif decks, generous white space, and prominent photographic feature placements.',
    recommendedPageSize: 'berliner',
    defaultColumns: 3,
    columnRule: false,
    mastheadStyle: 'clean-minimal',
    headlineFont: "'Playfair Display', serif",
    bodyFont: "'Source Serif 4', serif",
    bodyFontSizePt: 10.5,
    spacingDensity: 'spacious',
    accentColor: '#8b0000',
    defaultMasthead: {
      title: 'THE METROPOLITAN',
      tagline: 'Culture, Architecture, Ideas & Global Discourse',
      subtitle: 'Culture, Architecture, Ideas & Global Discourse • Est. 1998',
      establishmentYear: '1998',
      fontFamily: "'Playfair Display', serif",
      fontSizePt: 46,
      alignment: 'center',
      ruleStyle: 'single-hairline',
      emblem: 'none',
      customEmblemUrl: '',
      weatherCity: 'Metropolis',
      temperature: '16°C',
      weatherCondition: 'Crisp Autumn',
      weatherNotice: 'Crisp Autumn • 16°C',
      airQuality: 'AQI 32 • Excellent',
      price: '€3.50',
      postalRegNumber: 'ISSN 1842-9901',
      pageCountLabel: '12 Pages',
      dayOfWeek: 'Wednesday',
      date: 'October 28, 2026',
      volumeYear: 'Vol. 28',
      issueCount: 'Issue 412',
      issueNumber: 'Vol. 28 • Issue 412',
      edition: 'Weekend Review',
      showTopStrip: true,
      showWeather: true,
      showAirQuality: true,
      showTagline: true,
      showEstablishment: true,
      showPrice: true,
      showPostalReg: true,
      showBottomStrip: true,
      showVolumeIssue: true,
      showDate: true,
      showEdition: true,
      showEmblem: false,
    },
    seedArticles: [
      {
        id: 'seed-me-1',
        headline:
          'Architecture of Silence: Why the New Metropolises Are Rediscovering Acoustical Commons',
        subheadline:
          'From mass-timber concert halls to underground micro-parks, urbanists are prioritizing acoustic sanity over visual spectacle.',
        body: 'Urban life has long traded sonic peace for economic vitality. Yet across Rotterdam, Kyoto, and Montreal, a counter-revolution in municipal design is transforming civic architecture.\n\nEngineers are replacing concrete echo-chambers with perforated cork baffles, natural water curtains, and subterranean cloister gardens designed specifically to absorb low-frequency automotive rumble.',
        byline: 'Essay by Mara Lin, Architecture & Design Critic',
        dateline: 'ROTTERDAM —',
        imageUrl: '',
        imageCaption: 'Subsurface contemplative garden beneath the central rail terminus.',
        imagePlacement: 'top',
        columnSpan: 2,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'seed-me-2',
        headline: 'The Fermentation Renaissance',
        subheadline:
          'Ancient micro-organisms are transforming industrial biotechnology and haute cuisine alike.',
        body: 'In a modest converted brewery outside Copenhagen, microbiologists are cultivating wild yeasts capable of synthesizing complex flavor compounds from discarded agricultural biomass.\n\nThe venture reflects a growing shift among leading culinary labs toward closed-loop biological production.',
        byline: 'By Henrik Lindqvist',
        dateline: 'COPENHAGEN —',
        imageUrl: '',
        imageCaption: 'Cultivation vats in the fermentation research center.',
        imagePlacement: 'none',
        columnSpan: 1,
        priority: 'major',
        orderIndex: 1,
      },
      {
        id: 'seed-me-3',
        headline: 'Critical Review: The Ephemeral Poetics of Modernist Bookmaking',
        subheadline:
          'A new retrospective celebrates the tactile mastery of independent private press printers.',
        body: 'In an age dominated by disposable liquid-crystal pixels, the enduring weight of rag paper and letterpress impression offers an almost defiant sensory clarity.\n\nThe traveling exhibition highlights eighty remarkable volumes printed on hand-fed cylinder presses over the past three decades.',
        byline: 'Review by Simone Dubois',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 3,
        priority: 'minor',
        orderIndex: 2,
      },
    ],
  },
  'compact-local': {
    id: 'compact-local',
    name: 'Compact Local Newspaper',
    tagline: 'Energetic Community Gazette & Tabloid Herald',
    description:
      'Punchy 4-column balanced grid with bold slab-serif masthead, community notice boxes, neighborhood dispatches, and quick-reading column balance.',
    recommendedPageSize: 'tabloid',
    defaultColumns: 4,
    columnRule: true,
    mastheadStyle: 'bold-slab',
    headlineFont: "'Playfair Display', serif",
    bodyFont: "'Source Serif 4', serif",
    bodyFontSizePt: 9.5,
    spacingDensity: 'compact',
    accentColor: '#104e8b',
    defaultMasthead: {
      title: 'THE VALLEY GAZETTE',
      tagline: 'Your Independent Daily Community Voice',
      subtitle: 'Your Independent Daily Community Voice Since 1921',
      establishmentYear: '1921',
      fontFamily: "'Playfair Display', serif",
      fontSizePt: 46,
      alignment: 'center',
      ruleStyle: 'classic-double',
      emblem: 'none',
      customEmblemUrl: '',
      weatherCity: 'Valley District',
      temperature: '22°C',
      weatherCondition: 'Sunny intervals',
      weatherNotice: 'Sunny intervals, High 22°C',
      airQuality: 'AQI 38 • Good',
      price: '$1.00',
      postalRegNumber: 'Postal 105-88',
      pageCountLabel: '4 Pages',
      dayOfWeek: 'Wednesday',
      date: 'October 28, 2026',
      volumeYear: 'Vol. 105',
      issueCount: 'No. 88',
      issueNumber: 'Vol. 105 • No. 88',
      edition: 'Evening Final Edition',
      showTopStrip: true,
      showWeather: true,
      showAirQuality: true,
      showTagline: true,
      showEstablishment: true,
      showPrice: true,
      showPostalReg: true,
      showBottomStrip: true,
      showVolumeIssue: true,
      showDate: true,
      showEdition: true,
      showEmblem: false,
    },
    seedArticles: [
      {
        id: 'seed-cl-1',
        headline: 'Historic Waterfront Promenade Restoration Receives Full City Council Approval',
        subheadline:
          '3.2-mile boardwalk project includes flood barriers, night lighting and artisan stalls',
        body: 'VALLEY CENTER — Following an impassioned three-hour public hearing attended by over two hundred residents, the Municipal Council voted unanimously to allocate $14.5 million in civic improvement funds to rehabilitate the century-old harbor boardwalk.\n\nWork is scheduled to commence early next spring, with phased reopenings planned through Memorial Day weekend.\n\n"This represents the heart of our community\'s identity," stated Mayor Sarah Jenkins during the post-vote briefing.',
        byline: 'By Marcus Vance, Valley Gazette Civic Affairs',
        dateline: 'VALLEY CENTER —',
        imageUrl: '',
        imageCaption: 'Architectural rendering of the restored public pier and observation gazebo.',
        imagePlacement: 'top',
        columnSpan: 2,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'seed-cl-2',
        headline: 'High School Robotics Team Advances to National Championship in St. Louis',
        subheadline:
          'Autonomous rover design sweeps regional trials with perfect obstacle course score',
        body: 'Valley High\'s engineering club, the "Iron Hawks," earned first place honors Saturday during the tri-state STEM Invitational.\n\nTheir custom planetary rover navigated simulated Martian dunes in record time, earning praise from aerospace judges.',
        byline: 'By Jennifer Ortiz',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'major',
        orderIndex: 1,
      },
      {
        id: 'seed-cl-3',
        headline: 'Community Notice Board',
        subheadline: 'Upcoming weekend events and civic announcements',
        body: '• Farmers Market returns to Courthouse Square every Saturday, 8:00 AM – 1:00 PM.\n• Free seasonal flu vaccination clinic at Community Health Center this Thursday.\n• Volunteer arborists needed for annual Oak Grove conservation planting on Sunday.',
        byline: 'Gazette Community Desk',
        dateline: '',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'brief',
        orderIndex: 2,
      },
      {
        id: 'seed-cl-4',
        headline: 'Local Farmers Report Best Apple Harvest in Decade Following Ideal Summer Nights',
        subheadline:
          'Crisp autumn weather brings bumper Honeycrisp and Gala crop yields across the valley orchards',
        body: 'Orchard growers throughout the valley are celebrating exceptional yields this autumn, crediting warm afternoon sunlight paired with cool 10-degree night temperatures that concentrated natural sugars.',
        byline: 'By Thomas Reed, Agriculture Columnist',
        dateline: 'UPPER VALLEY —',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'minor',
        orderIndex: 3,
      },
    ],
  },
};

export function getNewspaperPreset(presetId: NewspaperPresetId): NewspaperPreset {
  const preset = NEWSPAPER_PRESETS[presetId];
  if (!preset) {
    return NEWSPAPER_PRESETS['classic-hindi-broadsheet'] ?? NEWSPAPER_PRESETS['classic-broadsheet'];
  }
  return preset;
}

export function getAllNewspaperPresets(): NewspaperPreset[] {
  return Object.values(NEWSPAPER_PRESETS);
}

export interface CreateNewspaperOptions {
  title?: string;
  presetId?: NewspaperPresetId;
  pageSize?: PageSizePreset;
  language?: string;
  direction?: 'ltr' | 'rtl';
  startBlank?: boolean;
  pageCount?: number;
}

export function createNewspaperDocument(options: CreateNewspaperOptions = {}): NewspaperDocument {
  const presetId = options.presetId ?? 'classic-hindi-broadsheet';
  const preset = getNewspaperPreset(presetId);
  const now = new Date().toISOString();
  const title = options.title ?? preset.defaultMasthead.title;
  const pageSize = options.pageSize ?? preset.recommendedPageSize;
  const language = options.language ?? (presetId.includes('hindi') ? 'hi' : 'en');
  const direction = options.direction ?? 'ltr';

  const defaultDate =
    language === 'hi'
      ? 'मंगलवार, 27 अक्टूबर 2026'
      : new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

  const defaultMastheadFont =
    language === 'hi' && !presetId.includes('hindi')
      ? "'Rozha One', 'Noto Serif Devanagari', serif"
      : preset.defaultMasthead.fontFamily;

  const masthead: MastheadConfig = {
    ...preset.defaultMasthead,
    title,
    date: defaultDate,
    fontFamily: defaultMastheadFont,
  };

  const layout: NewspaperLayoutConfig = {
    presetId,
    columnCount: preset.defaultColumns,
    columnRule: preset.columnRule,
    mastheadFont:
      preset.mastheadFont ?? (language === 'hi' ? "'Rozha One', serif" : preset.headlineFont),
    headlineFont:
      language === 'hi' && !presetId.includes('hindi')
        ? "'Noto Serif Devanagari', serif"
        : preset.headlineFont,
    subheadlineFont:
      preset.subheadlineFont ??
      (language === 'hi' && !presetId.includes('hindi')
        ? "'Noto Serif Devanagari', serif"
        : preset.headlineFont),
    bodyFont:
      language === 'hi' && !presetId.includes('hindi')
        ? "'Noto Serif Devanagari', serif"
        : preset.bodyFont,
    headlineWeight: preset.headlineWeight ?? 700,
    bodyFontSizePt: preset.bodyFontSizePt,
    spacingDensity: preset.spacingDensity,
    showFooter: true,
    footerText:
      language === 'hi'
        ? `पृष्ठ 1 • ${title} • मुख्य संस्करण`
        : `Page 1 • ${title} • Official Edition`,
  };

  const articles: Article[] = options.startBlank
    ? [
        {
          id: `art-${Date.now()}-1`,
          headline:
            language === 'hi'
              ? 'यहाँ अपनी मुख्य खबर की हेडलाइन लिखें'
              : 'Your Lead Article Headline Goes Here',
          subheadline:
            language === 'hi'
              ? 'खबर का संक्षिप्त सारांश या उप-शीर्षक यहाँ जोड़ें'
              : 'Add an engaging secondary summary of the story',
          body:
            language === 'hi'
              ? 'अपनी खबर का पूरा विवरण यहाँ लिखें। एक अच्छे समाचार में स्थान, तथ्य, आधिकारिक बयान और स्पष्ट संदर्भ शामिल होते हैं।\n\nआप ऊपर दिए गए टूलबार से फोटो लगा सकते हैं, कॉलम का आकार बदल सकते हैं और नई खबरें जोड़ सकते हैं।'
              : 'Write your story text here. Professional newspaper editors craft stories with strong opening datelines, factual paragraphs, and clear attribution.\n\nYou can upload images, adjust column spans, and reposition articles using the editor controls on the left.',
          byline: language === 'hi' ? 'विशेष संवाददाता' : 'By Your Name, Staff Writer',
          dateline: language === 'hi' ? 'नई दिल्ली —' : 'CITY DESK —',
          imagePlacement: 'top',
          imageCaption: '',
          columnSpan: layout.columnCount > 2 ? layout.columnCount - 1 : 2,
          priority: 'lead',
          orderIndex: 0,
        },
      ]
    : preset.seedArticles.map((art, index) => ({
        ...art,
        id: `seed-${presetId}-${index + 1}`,
      }));

  const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Construct discrete multi-page structure
  const page1: NewspaperPage = {
    id: `page-1`,
    pageNumber: 1,
    sectionTitle: language === 'hi' ? 'मुख्य पृष्ठ' : 'Front Page',
    layoutMode: 'auto',
    articles,
    columnCount: layout.columnCount,
  };

  const targetPageCount = Math.max(1, options.pageCount ?? 1);
  const pages: NewspaperPage[] = [page1];

  for (let p = 2; p <= targetPageCount; p++) {
    pages.push(createNewBlankPage(p, { language }));
  }

  return {
    version: '1.1.0',
    schemaVersion: '1.1.0',
    id: docId,
    metadata: {
      id: docId,
      title,
      language,
      direction,
      pageSize,
      orientation: 'portrait',
      createdAt: now,
      updatedAt: now,
    },
    masthead,
    layout,
    articles,
    pages,
  };
}

export interface OverflowEstimate {
  estimatedCharacterCount: number;
  wordCount: number;
  exceedsSinglePage: boolean;
  overflowRiskPercentage: number;
  recommendation?: string;
}

/**
 * Calculates estimated textual volume against standard single-page newspaper layout budget.
 * Sensible character limits:
 * A single broadsheet page accommodates ~3,000 to 4,500 words across all articles.
 * Tabloid/A4 accommodates ~1,500 to 2,500 words.
 */
export function estimateNewspaperContentVolume(doc: NewspaperDocument): OverflowEstimate {
  let totalChars = 0;
  let totalWords = 0;

  for (const art of doc.articles) {
    totalChars += art.headline.length + (art.subheadline?.length ?? 0) + art.body.length;
    const words = art.body.trim().split(/\s+/).filter(Boolean).length;
    totalWords += words;
  }

  // Budget based on page format
  const wordBudget =
    doc.metadata.pageSize === 'broadsheet'
      ? 4000
      : doc.metadata.pageSize === 'berliner'
        ? 3000
        : doc.metadata.pageSize === 'a3'
          ? 3200
          : 2200; // tabloid or a4

  const overflowRiskPercentage = Math.min(100, Math.round((totalWords / wordBudget) * 100));
  const exceedsSinglePage = totalWords > wordBudget;

  let recommendation: string | undefined;
  if (exceedsSinglePage) {
    recommendation = `Total word count (${totalWords}) exceeds estimated single-page capacity (${wordBudget} words). Consider reducing body text or spreading articles across additional editions.`;
  } else if (overflowRiskPercentage > 85) {
    recommendation = `Page is approaching maximum typographic density (${overflowRiskPercentage}% of page budget).`;
  }

  return {
    estimatedCharacterCount: totalChars,
    wordCount: totalWords,
    exceedsSinglePage,
    overflowRiskPercentage,
    recommendation,
  };
}

/* ====================================================================
 * Print & PDF Multi-Page Rendering Engine (Phase 2)
 * ==================================================================== */

export interface PageDimensionsResult {
  widthPt: number;
  heightPt: number;
  widthIn: number;
  heightIn: number;
}

/**
 * Calculates exact physical page geometry in typographic points and inches,
 * accurately swapping axes for landscape orientation.
 */
export function getPageDimensionsPt(
  pageSize: PageSizePreset,
  orientation: PageOrientation = 'portrait'
): PageDimensionsResult {
  const def = PAGE_SIZE_DEFINITIONS[pageSize] ?? PAGE_SIZE_DEFINITIONS.broadsheet;
  const isLandscape = orientation === 'landscape';
  const widthPt = isLandscape ? def.heightPt : def.widthPt;
  const heightPt = isLandscape ? def.widthPt : def.heightPt;
  return {
    widthPt,
    heightPt,
    widthIn: Number((widthPt / 72).toFixed(4)),
    heightIn: Number((heightPt / 72).toFixed(4)),
  };
}

export interface PhysicalPageMetrics {
  widthPt: number;
  heightPt: number;
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  paddingPt: number;
  gapPt: number;
  paddingPx: number;
  gapPx: number;
  bodyFontSizePt: number;
  headlineSizesPt: {
    lead: number;
    major: number;
    minor: number;
    brief: number;
  };
  typographyPt: {
    deckFontSizePt: number;
    kickerFontSizePt: number;
    bylineFontSizePt: number;
    captionFontSizePt: number;
    captionCreditFontSizePt: number;
    footerFontSizePt: number;
    topStripFontSizePt: number;
    bottomStripFontSizePt: number;
    weatherLabelFontSizePt: number;
    taglineFontSizePt: number;
    establishmentFontSizePt: number;
  };
  spacingPt: {
    mastheadPaddingBottomPt: number;
    mastheadMarginBottomPt: number;
    topStripPaddingBottomPt: number;
    topStripMarginBottomPt: number;
    bottomStripPaddingTopPt: number;
    bottomStripMarginTopPt: number;
    articleHeaderMarginBottomPt: number;
    deckMarginBottomPt: number;
    bylineMarginTopPt: number;
    paraMarginBottomPt: number;
    paraTextIndentPt: number;
    figureMarginBottomPt: number;
    footerPaddingTopPt: number;
  };
}

/**
 * Calculates exact physical page dimensions and spacing tokens (in points and 96-DPI CSS pixels).
 * Shared identically between renderNewspaperDocumentToHtml and NewspaperCanvas.
 */
export function getPhysicalPageMetrics(
  pageSize: PageSizePreset,
  orientation: PageOrientation = 'portrait',
  density: SpacingDensity = 'normal',
  customBodyFontSizePt?: number,
  customHeadlineFontSizePt?: number
): PhysicalPageMetrics {
  const { widthPt, heightPt } = getPageDimensionsPt(pageSize, orientation);
  // CSS pixels at standard 96 DPI: 1 pt = 96/72 px = 1.3333 px.
  // 1 mm = 96 / 25.4 px = 3.7795 px.
  const widthPx = Math.round((widthPt * 96) / 72);
  const heightPx = Math.round((heightPt * 96) / 72);

  const def = PAGE_SIZE_DEFINITIONS[pageSize] ?? PAGE_SIZE_DEFINITIONS.broadsheet;
  const isLandscape = orientation === 'landscape';
  const widthMm = isLandscape ? def.heightMm : def.widthMm;
  const heightMm = isLandscape ? def.widthMm : def.heightMm;

  const paddingPt = density === 'compact' ? 18 : density === 'spacious' ? 32 : 24;
  const gapPt = density === 'compact' ? 10 : density === 'spacious' ? 20 : 14;

  const paddingPx = (paddingPt * 96) / 72;
  const gapPx = (gapPt * 96) / 72;

  const bodyFontSizePt = Math.max(7, Math.min(24, Number(customBodyFontSizePt) || 10));

  const baseLead = customHeadlineFontSizePt
    ? Math.max(16, Math.min(72, Number(customHeadlineFontSizePt)))
    : 26;

  return {
    widthPt,
    heightPt,
    widthPx,
    heightPx,
    widthMm,
    heightMm,
    paddingPt,
    gapPt,
    paddingPx,
    gapPx,
    bodyFontSizePt,
    headlineSizesPt: {
      lead: baseLead,
      major: Math.round(baseLead * (19 / 26)),
      minor: Math.round(baseLead * (14 / 26)),
      brief: Math.round(baseLead * (11 / 26)),
    },
    typographyPt: {
      deckFontSizePt: 9.5,
      kickerFontSizePt: 8,
      bylineFontSizePt: 7.5,
      captionFontSizePt: 7.5,
      captionCreditFontSizePt: 7,
      footerFontSizePt: 7.5,
      topStripFontSizePt: 8,
      bottomStripFontSizePt: 8.5,
      weatherLabelFontSizePt: 7.5,
      taglineFontSizePt: 8.5,
      establishmentFontSizePt: 8,
    },
    spacingPt: {
      mastheadPaddingBottomPt: 6,
      mastheadMarginBottomPt: 12,
      topStripPaddingBottomPt: 3,
      topStripMarginBottomPt: 4,
      bottomStripPaddingTopPt: 3,
      bottomStripMarginTopPt: 4,
      articleHeaderMarginBottomPt: 6,
      deckMarginBottomPt: 3,
      bylineMarginTopPt: 3,
      paraMarginBottomPt: 5,
      paraTextIndentPt: 12,
      figureMarginBottomPt: 6,
      footerPaddingTopPt: 4,
    },
  };
}

/**
 * Converts a viewport/client screen coordinate into page millimeter coordinates
 * relative to the page top-left origin, taking into account container bounding rect and transform scale.
 */
export function screenToPageMm(
  screenPoint: { clientX: number; clientY: number },
  canvasBoundingRect: { left: number; top: number; width: number; height: number },
  scale: number,
  pageDimensionsMm: { widthMm: number; heightMm: number }
): { xMm: number; yMm: number; isInside: boolean } {
  const effectiveScale = scale > 0 ? scale : 1;
  const pixelX = (screenPoint.clientX - canvasBoundingRect.left) / effectiveScale;
  const pixelY = (screenPoint.clientY - canvasBoundingRect.top) / effectiveScale;

  // 1 mm = 96 / 25.4 CSS px
  const mmPerPx = 25.4 / 96;
  const xMm = pixelX * mmPerPx;
  const yMm = pixelY * mmPerPx;

  const isInside =
    xMm >= 0 && xMm <= pageDimensionsMm.widthMm && yMm >= 0 && yMm <= pageDimensionsMm.heightMm;

  return { xMm, yMm, isInside };
}

/**
 * Escapes HTML entities to prevent unescaped content rendering and script injection.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips dangerous control characters and CSS escape tokens to prevent CSS/HTML style injection.
 */
export function sanitizeCssValue(value: string | undefined, fallback: string = ''): string {
  if (!value) return fallback;
  const cleaned = value.replace(/[;{}<>"'\\]/g, '').trim();
  return cleaned || fallback;
}

/**
 * Sanitizes CSS font-family stacks against injection while preserving quotes around
 * multi-word or alphanumeric font family names (e.g. 'Source Serif 4', 'Noto Serif Devanagari').
 */
export function sanitizeCssFontFamily(value: string | undefined, fallback: string = ''): string {
  if (!value) return fallback;
  if (/[;{}<>\\]/.test(value)) return fallback;

  const parts = value
    .split(',')
    .map((part) => {
      const raw = part.trim();
      if (!raw) return '';
      const unquoted = raw.replace(/^['"]|['"]$/g, '').trim();
      if (!unquoted) return '';
      if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(unquoted)) {
        return unquoted;
      }
      return `'${unquoted}'`;
    })
    .filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : fallback;
}

/**
 * Tests whether text is predominantly composed of Devanagari Unicode characters.
 */
export function isPredominantlyDevanagari(text: string): boolean {
  if (!text) return false;
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  return devanagariCount > latinCount;
}

/**
 * Converts plain text into clean, accessible newspaper paragraphs with drop caps on lead paragraphs.
 * Drop caps are disabled for Hindi / Devanagari text to avoid severing complex consonant conjuncts.
 */
export function formatBodyParagraphsHtml(
  body: string,
  enableDropCap: boolean = false,
  language: string = 'en'
): string {
  const isHindi = language === 'hi' || isPredominantlyDevanagari(body);
  const allowDropCap = enableDropCap && !isHindi;

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return '';
  }

  return paragraphs
    .map((para, idx) => {
      const isFirst = idx === 0 && allowDropCap;
      const cls = isFirst ? 'article-para drop-cap' : 'article-para';
      return `<p class="${cls}">${escapeHtml(para).replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

/**
 * Partitions articles across multiple newspaper pages based on physical page capacity,
 * ensuring lead and front-page stories remain on Page 1 while inside pages accommodate
 * secondary features, business briefs, and continuations with inside folios.
 */
export function partitionArticlesForPages(doc: NewspaperDocument): Article[][] {
  const articles = [...doc.articles].sort((a, b) => a.orderIndex - b.orderIndex);
  if (articles.length === 0) {
    return [[]];
  }

  // Calculate capacity budgets based on page size and orientation
  const isLandscape = doc.metadata.orientation === 'landscape';
  const size = doc.metadata.pageSize;

  let page1Budget = 1800;
  let insidePageBudget = 2500;

  if (size === 'broadsheet') {
    page1Budget = isLandscape ? 1600 : 2000;
    insidePageBudget = isLandscape ? 2200 : 2800;
  } else if (size === 'berliner') {
    page1Budget = 1300;
    insidePageBudget = 1900;
  } else if (size === 'a3') {
    page1Budget = 1400;
    insidePageBudget = 2000;
  } else {
    // tabloid or a4
    page1Budget = 900;
    insidePageBudget = 1400;
  }

  const pages: Article[][] = [];
  let currentPage: Article[] = [];
  let currentWeight = 0;
  let isPage1 = true;

  for (const article of articles) {
    const wordCount = article.body.trim().split(/\s+/).filter(Boolean).length;
    const imageWeight = article.imageUrl ? 250 : 0;
    const headlineWeight = 40;
    const spanMultiplier = Math.max(1, article.columnSpan ?? 1);
    const effectiveWeight =
      (wordCount + imageWeight + headlineWeight) * (0.8 + 0.2 * spanMultiplier);

    const budget = isPage1 ? page1Budget : insidePageBudget;
    const maxArticles = isPage1 ? 5 : 7;

    // Check if adding this article exceeds budget and current page already has content
    if (
      currentPage.length > 0 &&
      (currentWeight + effectiveWeight > budget || currentPage.length >= maxArticles)
    ) {
      pages.push(currentPage);
      currentPage = [article];
      currentWeight = effectiveWeight;
      isPage1 = false;
    } else {
      currentPage.push(article);
      currentWeight += effectiveWeight;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

export interface RenderHtmlOptions {
  includePrintStyles?: boolean;
  baseUrl?: string;
}

export function getMastheadEmblemSvg(emblem?: string, customUrl?: string): string {
  if (!emblem || emblem === 'none') return '';
  if (emblem === 'ashoka-chakra') {
    const spokes = Array.from({ length: 24 })
      .map((_, i) => {
        const rad = (i * 15 * Math.PI) / 180;
        const x2 = (24 + 19 * Math.cos(rad)).toFixed(2);
        const y2 = (24 + 19 * Math.sin(rad)).toFixed(2);
        return `<line x1="24" y1="24" x2="${x2}" y2="${y2}" stroke="#111111" stroke-width="1.2" />`;
      })
      .join('');
    return `<svg class="masthead-emblem-svg" viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="none" stroke="#111111" stroke-width="2.5" />
      <circle cx="24" cy="24" r="4" fill="#111111" />
      <g>${spokes}</g>
    </svg>`;
  }
  if (emblem === 'sun') {
    const rays = Array.from({ length: 16 })
      .map((_, i) => {
        const rad = (i * 22.5 * Math.PI) / 180;
        const x1 = (24 + 13 * Math.cos(rad)).toFixed(2);
        const y1 = (24 + 13 * Math.sin(rad)).toFixed(2);
        const x2 = (24 + 21 * Math.cos(rad)).toFixed(2);
        const y2 = (24 + 21 * Math.sin(rad)).toFixed(2);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111111" stroke-width="2" stroke-linecap="round" />`;
      })
      .join('');
    return `<svg class="masthead-emblem-svg" viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="9" fill="#111111" />
      <g>${rays}</g>
    </svg>`;
  }
  if (emblem === 'quill') {
    return `<svg class="masthead-emblem-svg" viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#111111" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 6C28 8 20 16 16 26L14 36L24 34C34 30 42 22 44 12L38 6Z" fill="#111111" />
      <path d="M14 36L8 42L12 38" stroke="#111111" stroke-width="2.5" stroke-linecap="round" />
      <path d="M22 28L34 16" stroke="#ffffff" stroke-width="1.5" />
    </svg>`;
  }
  if (emblem === 'lion-capital') {
    return `<svg class="masthead-emblem-svg" viewBox="0 0 48 48" width="40" height="40" fill="#111111" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 40H36V44H12V40ZM14 36H34V38H14V36ZM16 20C16 14 20 10 24 10C28 10 32 14 32 20C32 24 30 28 24 32C18 28 16 24 16 20ZM24 6C20 6 18 8 18 10C20 10 22 8 24 8C26 8 28 10 30 10C30 8 28 6 24 6Z" />
    </svg>`;
  }
  if (emblem === 'custom' && customUrl) {
    return `<img class="masthead-emblem-img" src="${escapeHtml(customUrl)}" alt="Emblem" style="height: 40px; width: auto; object-fit: contain;" />`;
  }
  return '';
}

/**
 * Compiles a structured NewspaperDocument into a self-contained, print-ready HTML
 * document complete with embedded web typography, exact physical @page sizing,
 * multi-column grids, mastheads, folios, and print page-break rules.
 */
export function renderNewspaperDocumentToHtml(
  doc: NewspaperDocument,
  _options: RenderHtmlOptions = {}
): string {
  const theme = doc.theme ?? doc.layout.theme ?? {
    mastheadColor: '#111111',
    headlineColor: '#111111',
    subheadlineColor: '#333333',
    bodyColor: '#222222',
    bylineColor: '#555555',
    kickerColor: '#b91c1c',
    borderColor: '#c8c5bc',
    pageBackground: '#ffffff',
  };

  const metrics = getPhysicalPageMetrics(
    doc.metadata.pageSize,
    doc.metadata.orientation,
    doc.layout.spacingDensity,
    doc.layout.bodyFontSizePt
  );
  const { widthPt, heightPt, paddingPt, gapPt, bodyFontSizePt } = metrics;
  const columnCount = resolvePageColumnCount(doc);
  const columnRule = doc.layout.columnRule;
  const direction = doc.metadata.direction ?? 'ltr';

  // Sanitize CSS properties against injection attacks
  const mastheadFont = sanitizeCssFontFamily(
    doc.layout.mastheadFont || doc.layout.headlineFont,
    "'Rozha One', 'Noto Serif Devanagari', serif"
  );
  const headlineFont = sanitizeCssFontFamily(
    doc.layout.headlineFont,
    "'Noto Serif Devanagari', serif"
  );
  const subheadlineFont = sanitizeCssFontFamily(
    doc.layout.subheadlineFont || doc.layout.headlineFont,
    "'Noto Serif Devanagari', serif"
  );
  const bodyFont = sanitizeCssFontFamily(
    doc.layout.bodyFont,
    "'Noto Serif Devanagari', 'Hind', serif"
  );
  const headlineWeight = Math.max(300, Math.min(900, Number(doc.layout.headlineWeight) || 700));

  // Support explicit multi-page documents or fallback to automatic article partitioning
  interface PageRenderUnit {
    pageNumber: number;
    sectionTitle?: string;
    layoutMode?: 'auto' | 'free';
    articles: Article[];
    columnCount: number;
  }

  let pagesToRender: PageRenderUnit[];

  if (doc.pages && doc.pages.length > 1) {
    // Explicit multi-page publication
    pagesToRender = doc.pages.map((p, idx) => ({
      pageNumber: p.pageNumber ?? idx + 1,
      sectionTitle: p.sectionTitle,
      layoutMode: p.layoutMode ?? 'auto',
      articles: p.articles,
      columnCount: resolvePageColumnCount(doc, p),
    }));
  } else {
    // Single page or legacy document: use partitionArticlesForPages to partition overflow
    const firstPage = doc.pages?.[0];
    const singlePageColumnCount = resolvePageColumnCount(doc, firstPage);

    const sourceArticles =
      doc.pages && doc.pages[0] && doc.pages[0].articles.length >= doc.articles.length
        ? doc.pages[0].articles
        : doc.articles;

    const partitioned = partitionArticlesForPages({
      ...doc,
      articles: sourceArticles,
    });

    pagesToRender = partitioned.map((pageArticles, idx) => ({
      pageNumber: idx + 1,
      sectionTitle:
        idx === 0
          ? doc.metadata.language === 'hi'
            ? 'मुख्य पृष्ठ'
            : 'Front Page'
          : doc.metadata.language === 'hi'
            ? 'संपादकीय एवं विचार'
            : 'Inside News',
      layoutMode: firstPage?.layoutMode ?? 'auto',
      articles: pageArticles,
      columnCount: singlePageColumnCount,
    }));
  }

  const totalPages = pagesToRender.length;
  const isHindiDoc = doc.metadata.language === 'hi';

  const pagesHtml = pagesToRender
    .map((pageUnit, pageIndex) => {
      const isFirstPage = pageIndex === 0;
      const pageNumber = pageUnit.pageNumber;
      const effectiveColumnCount = pageUnit.columnCount;

      // Header: Authentic Indian Masthead on Page 1, Inside Folio on subsequent pages
      let headerHtml = '';
      if (isFirstPage) {
        const mh = doc.masthead;
        const weatherCity = mh.weatherCity || (isHindiDoc ? 'नई दिल्ली' : 'City');
        const temperature = mh.temperature || '25°C';
        const weatherCondition = mh.weatherCondition || (isHindiDoc ? 'साफ़ आसमान' : 'Clear');
        const airQuality = mh.airQuality || (isHindiDoc ? 'AQI 128 • मध्यम' : 'AQI 45 • Good');
        const tagline =
          mh.tagline ||
          mh.subtitle ||
          (isHindiDoc ? 'सत्य, निष्पक्षता और जनसेवा का प्रतीक' : 'The Record of Public Discourse');
        const establishmentYear = mh.establishmentYear || '1947';
        const price = mh.price || (isHindiDoc ? 'मूल्य ₹5.00' : '$2.50');
        const postalReg =
          mh.postalRegNumber || (isHindiDoc ? 'पंजीयन सं. DL-11001/2026' : 'Reg. No. 24910/2026');
        const pageCountLabel =
          mh.pageCountLabel || (isHindiDoc ? `कुल पृष्ठ ${totalPages}` : `${totalPages} Pages`);

        const volumeYear = mh.volumeYear || (isHindiDoc ? 'वर्ष 78' : 'Vol. 78');
        const issueCount = mh.issueCount || (isHindiDoc ? 'अंक 142' : 'Issue 142');
        const volumeIssue = mh.issueNumber || `${volumeYear} • ${issueCount}`;
        const dayOfWeek = mh.dayOfWeek || (isHindiDoc ? 'बुधवार' : 'Wednesday');
        const dateStr = mh.date || (isHindiDoc ? '28 अक्टूबर 2026' : 'October 28, 2026');
        const fullDate = `${dayOfWeek ? dayOfWeek + ', ' : ''}${dateStr}`;
        const edition =
          mh.edition || (isHindiDoc ? 'प्रातःकालीन मुख्य संस्करण' : 'Morning Edition');

        const alignment = mh.alignment || 'center';
        const ruleStyle = mh.ruleStyle || 'ornate-double';
        const emblemSvg = getMastheadEmblemSvg(mh.emblem, mh.customEmblemUrl);
        const emblemHtml =
          mh.showEmblem && emblemSvg ? `<div class="masthead-emblem-box">${emblemSvg}</div>` : '';
        const effectiveFont = sanitizeCssFontFamily(mh.fontFamily, mastheadFont);
        const effectiveFontSize = mh.fontSizePt || 48;

        const showTopStrip = mh.showTopStrip !== false;
        const showBottomStrip = mh.showBottomStrip !== false;

        const announcementHtml =
          mh.showAnnouncementStrip && mh.announcementStripText
            ? `
          <div class="masthead-announcement-strip" style="background-color: #b91c1c; color: #ffffff; text-align: center; font-size: 8pt; font-weight: 700; padding: 3px 8px; margin-bottom: 4px; border-radius: 2px;">
            ${escapeHtml(mh.announcementStripText)}
          </div>
        `
            : '';

        const secondaryHeaderHtml =
          mh.showSecondaryHeader && mh.secondaryHeaderTitle
            ? `
          <div class="masthead-secondary-header" style="text-align: center; font-size: 8.5pt; font-weight: 600; color: #2563eb; border-top: 1px solid #111; padding-top: 2px; margin-top: 4px;">
            <span>${escapeHtml(mh.secondaryHeaderTitle)}</span>
            ${mh.secondaryHeaderSubtitle ? ` <span style="color: #666; font-size: 7.5pt;">• ${escapeHtml(mh.secondaryHeaderSubtitle)}</span>` : ''}
          </div>
        `
            : '';

        headerHtml = `
          <header class="masthead-section rule-${ruleStyle}">
            ${announcementHtml}
            ${
              showTopStrip
                ? `
              <div class="masthead-top-strip">
                <div class="top-strip-left">
                  ${
                    mh.showWeather !== false
                      ? `
                    <div class="meta-item weather-box">
                      <span class="meta-label">${isHindiDoc ? 'मौसम' : 'WEATHER'}:</span>
                      <span class="meta-value">${escapeHtml(weatherCity)} ${escapeHtml(temperature)} • ${escapeHtml(weatherCondition)}</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    mh.showAirQuality !== false && airQuality
                      ? `
                    <div class="meta-item aqi-box">
                      <span class="meta-value">${escapeHtml(airQuality)}</span>
                    </div>
                  `
                      : ''
                  }
                </div>
                <div class="top-strip-center">
                  ${
                    mh.showTagline !== false && tagline
                      ? `
                    <span class="meta-tagline">${escapeHtml(tagline)}</span>
                  `
                      : ''
                  }
                  ${
                    mh.showTagline !== false &&
                    mh.showEstablishment !== false &&
                    tagline &&
                    establishmentYear
                      ? `
                    <span class="meta-bullet">•</span>
                  `
                      : ''
                  }
                  ${
                    mh.showEstablishment !== false && establishmentYear
                      ? `
                    <span class="meta-establishment">${isHindiDoc ? 'स्थापना' : 'Est.'} ${escapeHtml(establishmentYear)}</span>
                  `
                      : ''
                  }
                </div>
                <div class="top-strip-right">
                  ${
                    mh.showPrice !== false && price
                      ? `
                    <div class="meta-item price-box">
                      <span class="meta-value">${escapeHtml(price)}</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    mh.showPostalReg !== false && postalReg
                      ? `
                    <div class="meta-item postal-box">
                      <span class="meta-value">${escapeHtml(postalReg)}</span>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            `
                : ''
            }

            <div class="masthead-main-row align-${alignment}">
              ${emblemHtml}
              <h1 class="masthead-title" style="font-family: ${effectiveFont}; font-size: ${effectiveFontSize}pt;">
                ${escapeHtml(mh.title)}
              </h1>
            </div>

            ${
              showBottomStrip
                ? `
              <div class="masthead-bottom-strip">
                <div class="bottom-strip-left">
                  ${
                    mh.showVolumeIssue !== false
                      ? `
                    <span class="folio-item">${escapeHtml(volumeIssue)}</span>
                  `
                      : ''
                  }
                </div>
                <div class="bottom-strip-center">
                  ${
                    mh.showDate !== false
                      ? `
                    <span class="folio-item folio-date">${escapeHtml(fullDate)}</span>
                  `
                      : ''
                  }
                </div>
                <div class="bottom-strip-right">
                  ${
                    mh.showEdition !== false
                      ? `
                    <span class="folio-item">${escapeHtml(edition)}</span>
                  `
                      : ''
                  }
                  ${
                    mh.showPostalReg !== false && pageCountLabel
                      ? `
                    <span class="folio-item folio-pages">${escapeHtml(pageCountLabel)}</span>
                  `
                      : ''
                  }
                </div>
              </div>
            `
                : ''
            }
            ${secondaryHeaderHtml}
          </header>
        `;
      } else {
        const sectionPrefix = pageUnit.sectionTitle
          ? `${escapeHtml(pageUnit.sectionTitle)} • `
          : '';
        const pageFolioCenter = isHindiDoc
          ? `${sectionPrefix}पृष्ठ ${pageNumber} / ${totalPages}`
          : `${sectionPrefix}Page ${pageNumber} of ${totalPages}`;
        const rightFolioText = isHindiDoc
          ? `${escapeHtml(doc.masthead.date)} • ${escapeHtml(doc.masthead.edition || 'अंदर के पृष्ठ')}`
          : `${escapeHtml(doc.masthead.date)} • ${escapeHtml(doc.masthead.edition || 'Inside News')}`;

        headerHtml = `
          <header class="inside-folio-header">
            <div class="inside-folio-left">${escapeHtml(doc.masthead.title)}</div>
            <div class="inside-folio-center">${pageFolioCenter}</div>
            <div class="inside-folio-right">${rightFolioText}</div>
          </header>
        `;
      }

      // Articles Grid
      const articlesHtml = pageUnit.articles
        .map((art) => {
          const span = Math.min(effectiveColumnCount, Math.max(1, art.columnSpan));
          const priority = art.priority;
          const isLead = priority === 'lead';
          const hasImage = Boolean(art.imageUrl && art.imagePlacement !== 'none');

          let imageHtml = '';
          if (hasImage) {
            const objectPos = getImageObjectPosition(art);
            const aspectStyle = getImageAspectRatio(art.imageAspect);
            const fit = art.fillSpace ? 'cover' : art.imageFit ?? 'cover';
            const imgHeightStyle = art.customImageHeight
              ? `height: ${art.customImageHeight}px;`
              : art.fillSpace
                ? 'height: 100%; flex: 1;'
                : '';
            const figStyle = art.fillSpace
              ? 'style="flex: 1; display: flex; flex-direction: column;"'
              : '';

            imageHtml = `
              <figure class="article-figure placement-${art.imagePlacement} layout-${art.imageLayout ?? 'full'} aspect-${art.imageAspect ?? 'standard'}" ${figStyle}>
                <img src="${escapeHtml(art.imageUrl ?? '')}" alt="${escapeHtml(art.imageCaption ?? art.headline ?? '')}" class="article-image aspect-${art.imageAspect ?? 'standard'}" style="object-fit: ${fit}; object-position: ${objectPos}; aspect-ratio: ${art.customImageHeight ? 'auto' : aspectStyle}; ${imgHeightStyle}" onerror="this.style.display='none'" />
                ${
                  art.imageCaption || art.imageCredit
                    ? `
                  <figcaption class="article-caption">
                    ${art.imageCaption ? `<span class="caption-text">${escapeHtml(art.imageCaption)}</span>` : ''}
                    ${art.imageCredit ? `<span class="caption-credit">${escapeHtml(art.imageCredit)}</span>` : ''}
                  </figcaption>
                `
                    : ''
                }
              </figure>
            `;
          }

          const headlineColorStyle = art.customColors?.headlineColor
            ? `style="color: ${art.customColors.headlineColor};"`
            : '';
          const subheadlineColorStyle = art.customColors?.subheadlineColor
            ? `style="color: ${art.customColors.subheadlineColor};"`
            : '';
          const bylineColorStyle = art.customColors?.bylineColor
            ? `style="color: ${art.customColors.bylineColor};"`
            : '';

          const headlineHtml = `
            <div class="article-header priority-${priority}">
              ${art.subheadline ? `<p class="article-deck" ${subheadlineColorStyle}>${escapeHtml(art.subheadline)}</p>` : ''}
              <h2 class="article-headline" ${headlineColorStyle}>${escapeHtml(art.headline)}</h2>
              ${art.byline ? `<div class="article-byline" ${bylineColorStyle}>${escapeHtml(art.byline)}</div>` : ''}
            </div>
          `;

          const isHindi =
            doc.metadata.language === 'hi' ||
            Boolean(art.headline.match(/[\u0900-\u097F]/)) ||
            Boolean(art.body.match(/[\u0900-\u097F]/));
          const enableDropCap = isLead && !isHindi;

          // Specialized Element Renderers:
          let specializedExtraHtml = '';

          // 1. Kicker Badge for top-headline or custom
          const kickerColor = art.customColors?.kickerColor || 'var(--kicker-color, #b91c1c)';
          const kickerHtml = art.kickerText
            ? `
            <div class="article-kicker" style="color: ${kickerColor}; font-family: 'Hind', 'Noto Serif Devanagari', sans-serif; font-weight: 700; font-size: 8pt; text-transform: uppercase; margin-bottom: 2px;">
              ${escapeHtml(art.kickerText)}
            </div>
          `
            : '';

          // 2. Short News Items
          if (
            art.elementType === 'short-news' &&
            art.shortNewsItems &&
            art.shortNewsItems.length > 0
          ) {
            specializedExtraHtml += `
              <div class="short-news-container" style="margin-top: 6px;">
                ${art.shortNewsItems
                  .map(
                    (sn) => `
                  <div style="margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dotted #ccc;">
                    <strong style="color: #111;">• ${escapeHtml(sn.title)}: </strong>
                    <span style="color: #333;">${escapeHtml(sn.snippet)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `;
          }

          // 3. Advertisement Data
          if (art.elementType === 'advertisement') {
            const ad = art.advertisementData;
            specializedExtraHtml += `
              <div style="font-size: 6.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #888; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 2px; margin-bottom: 4px;">
                विज्ञापन / ADVERTISEMENT
              </div>
            `;
            if (ad) {
              specializedExtraHtml += `
                <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #aaa; display: flex; justify-content: space-between; font-size: 7.5pt; color: #444;">
                  ${ad.sponsor ? `<span><strong>प्रायोजक:</strong> ${escapeHtml(ad.sponsor)}</span>` : ''}
                  ${ad.callToAction ? `<span><strong>${escapeHtml(ad.callToAction)}</strong></span>` : ''}
                  ${ad.phone ? `<span><strong>फोन:</strong> ${escapeHtml(ad.phone)}</span>` : ''}
                </div>
              `;
            }
          }

          // 4. 12-Rashi Horoscope Grid
          if (art.elementType === 'rashifal' && art.rashifalItems && art.rashifalItems.length > 0) {
            specializedExtraHtml += `
              <div class="rashifal-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 6px;">
                ${art.rashifalItems
                  .map(
                    (r) => `
                  <div style="background: #fffdf5; border: 1px solid #fde68a; border-radius: 3px; padding: 4px 5px;">
                    <div style="font-weight: 700; font-size: 7.5pt; color: #b45309;">${escapeHtml(r.sign)} ${escapeHtml(r.rashi)}</div>
                    <div style="font-size: 7pt; color: #333; line-height: 1.25;">${escapeHtml(r.prediction)}</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `;
          }

          const bodyStylesList: string[] = [];
          if (art.customColors?.bodyColor) {
            bodyStylesList.push(`color: ${art.customColors.bodyColor};`);
          }
          if (art.customFontSizePt) {
            bodyStylesList.push(`font-size: ${art.customFontSizePt}pt;`);
          }
          if (art.maxLines) {
            bodyStylesList.push(
              `-webkit-line-clamp: ${art.maxLines}; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;`
            );
          }
          const bodyStyleAttr = bodyStylesList.length > 0 ? `style="${bodyStylesList.join(' ')}"` : '';

          const bodyContent = `
            <div class="article-body" ${bodyStyleAttr}>
              ${kickerHtml}
              ${art.dateline ? `<span class="article-dateline">${escapeHtml(art.dateline)} </span>` : ''}
              ${formatBodyParagraphsHtml(art.body, enableDropCap, isHindi ? 'hi' : 'en')}
              ${specializedExtraHtml}
            </div>
          `;

          let innerContent = '';
          if (art.imagePlacement === 'top') {
            innerContent = `${imageHtml}${headlineHtml}${bodyContent}`;
          } else if (art.imagePlacement === 'bottom') {
            innerContent = `${headlineHtml}${bodyContent}${imageHtml}`;
          } else if (art.imagePlacement === 'side') {
            innerContent = `${headlineHtml}<div class="article-side-wrap">${imageHtml}${bodyContent}</div>`;
          } else {
            // 'middle' or default
            innerContent = `${headlineHtml}${imageHtml}${bodyContent}`;
          }

          // Build custom 4-side border & style rules
          const isFreeLayout = pageUnit.layoutMode === 'free' && Boolean(art.frame);
          let customStyles = isFreeLayout
            ? `position: absolute; left: ${art.frame!.x}mm; top: ${art.frame!.y}mm; width: ${art.frame!.w}mm; height: ${art.frame!.h}mm; z-index: ${art.frame!.z ?? 1}; pointer-events: auto; overflow: hidden; `
            : `grid-column: span ${span}; `;

          if (art.fillSpace) {
            customStyles += 'flex: 1; height: 100%; display: flex; flex-direction: column; ';
          }
          if (art.heightMode === 'fixed' && art.customHeight) {
            customStyles += `height: ${art.customHeight}px; `;
          } else if (art.heightMode === 'min-height' && art.customHeight) {
            customStyles += `min-height: ${art.customHeight}px; `;
          }
          if (art.marginPx !== undefined && art.marginPx > 0) {
            customStyles += `margin: ${art.marginPx}px; `;
          }

          if (art.borders) {
            const bColor = art.customColors?.borderColor;
            if (art.borders.top && art.borders.top.style !== 'none' && art.borders.top.width > 0) {
              customStyles += `border-top: ${art.borders.top.width}px ${art.borders.top.style} ${bColor || art.borders.top.color}; `;
            }
            if (
              art.borders.right &&
              art.borders.right.style !== 'none' &&
              art.borders.right.width > 0
            ) {
              customStyles += `border-right: ${art.borders.right.width}px ${art.borders.right.style} ${bColor || art.borders.right.color}; `;
            }
            if (
              art.borders.bottom &&
              art.borders.bottom.style !== 'none' &&
              art.borders.bottom.width > 0
            ) {
              customStyles += `border-bottom: ${art.borders.bottom.width}px ${art.borders.bottom.style} ${bColor || art.borders.bottom.color}; `;
            }
            if (
              art.borders.left &&
              art.borders.left.style !== 'none' &&
              art.borders.left.width > 0
            ) {
              customStyles += `border-left: ${art.borders.left.width}px ${art.borders.left.style} ${bColor || art.borders.left.color}; `;
            }
          }
          if (art.customColors?.backgroundColor) {
            customStyles += `background-color: ${art.customColors.backgroundColor}; `;
          } else if (art.backgroundColor) {
            customStyles += `background-color: ${art.backgroundColor}; `;
          }
          if (art.textColor) {
            customStyles += `color: ${art.textColor}; `;
          }
          if (art.paddingPx !== undefined && art.paddingPx > 0) {
            customStyles += `padding: ${art.paddingPx}px; `;
          }

          return `
            <article class="newspaper-article priority-${priority} element-${art.elementType ?? 'block'} ${columnRule ? 'has-column-rule' : ''} ${isHindi ? 'lang-hi' : ''} ${isFreeLayout ? 'layout-free-article' : ''}" data-article-id="${art.id}" lang="${isHindi ? 'hi' : 'en'}" style="${customStyles}">
              ${innerContent}
            </article>
          `;
        })
        .join('\n');

      // Folio Footer
      const footerPageInfo = isHindiDoc
        ? `पृष्ठ ${pageNumber} / ${totalPages}`
        : `Page ${pageNumber} of ${totalPages}`;
      const footerEditionText = isHindiDoc
        ? 'जनवाणी समाचार • डिजिटल व प्रिंट संस्करण'
        : 'E-Paper Studio Professional Edition';

      const footerHtml = `
        <footer class="newspaper-folio-footer">
          <div class="footer-rule"></div>
          <div class="footer-text">
            <span>${escapeHtml(doc.metadata.title)}</span>
            <span>${footerPageInfo}</span>
            <span>${footerEditionText}</span>
          </div>
        </footer>
      `;

      if (pageUnit.layoutMode === 'free') {
        return `
        <div class="newspaper-page layout-free" data-page-number="${pageNumber}">
          ${headerHtml}
          <div class="newspaper-free-layer" style="position: absolute; inset: 0; pointer-events: none;">
            ${articlesHtml}
          </div>
          <div style="flex: 1;"></div>
          ${footerHtml}
        </div>
      `;
      }

      return `
        <div class="newspaper-page" data-page-number="${pageNumber}">
          ${headerHtml}
          <main class="newspaper-grid" style="grid-template-columns: repeat(${effectiveColumnCount}, 1fr);">
            ${articlesHtml}
          </main>
          ${footerHtml}
        </div>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(doc.metadata.language || 'en')}" dir="${direction}">
<head>
  <meta charset="utf-8" />
  <base href="${escapeHtml(_options.baseUrl ?? 'http://epaper-studio.local/')}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Self-hosted Latin + Devanagari Typography -->
  <style>
    ${SELF_HOSTED_FONTS_CSS}

    :root {
      --masthead-color: ${theme.mastheadColor || '#111111'};
      --headline-color: ${theme.headlineColor || '#111111'};
      --subheadline-color: ${theme.subheadlineColor || '#333333'};
      --body-color: ${theme.bodyColor || '#222222'};
      --byline-color: ${theme.bylineColor || '#555555'};
      --kicker-color: ${theme.kickerColor || '#b91c1c'};
      --border-color: ${theme.borderColor || '#c8c5bc'};
      --page-bg: ${theme.pageBackground || '#ffffff'};
    }

    @page {
      size: ${widthPt}pt ${heightPt}pt;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      background-color: var(--page-bg, #ffffff);
      color: var(--body-color, #121212);
      font-family: ${bodyFont}, 'Noto Serif Devanagari', 'Hind', serif;
      font-size: ${bodyFontSizePt}pt;
      line-height: 1.5;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    .newspaper-page {
      width: ${widthPt}pt;
      height: ${heightPt}pt;
      max-height: ${heightPt}pt;
      padding: ${paddingPt}pt;
      background-color: #ffffff;
      background-color: var(--page-bg, #ffffff);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }

    .newspaper-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Masthead Styles */
    .masthead-section {
      padding-bottom: 6pt;
      margin-bottom: 12pt;
      position: relative;
    }

    .masthead-section.rule-ornate-double {
      border-bottom: 3.5px double #111111;
    }

    .masthead-section.rule-oxford-thick-thin {
      border-bottom: 3px solid #111111;
      padding-bottom: 4pt;
    }
    .masthead-section.rule-oxford-thick-thin::after {
      content: '';
      display: block;
      height: 1px;
      background: #111111;
      margin-top: 2pt;
    }

    .masthead-section.rule-classic-double {
      border-bottom: 2.5px double #111111;
    }

    .masthead-section.rule-single-hairline {
      border-bottom: 1px solid #111111;
    }

    .masthead-section.rule-none {
      border-bottom: none;
    }

    .masthead-top-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #222222;
      padding-bottom: 3pt;
      margin-bottom: 4pt;
      font-size: 8pt;
      font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;
      color: #333333;
      letter-spacing: 0.2pt;
      line-height: 1.25;
    }

    .top-strip-left,
    .top-strip-right {
      display: flex;
      align-items: center;
      gap: 8pt;
    }

    .top-strip-center {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4pt;
      font-family: 'Noto Serif Devanagari', serif;
      font-size: 8.5pt;
      color: #333333;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 3pt;
    }

    .meta-label {
      font-weight: 700;
      color: #111111;
      font-size: 7.5pt;
    }

    .meta-value {
      font-weight: 600;
      color: #222222;
    }

    .meta-tagline {
      font-style: italic;
      color: #222222;
    }

    .meta-bullet {
      color: #888888;
      font-size: 7pt;
    }

    .meta-establishment {
      font-weight: 600;
      color: #111111;
    }

    .masthead-main-row {
      display: flex;
      align-items: center;
      padding: 4pt 0 6pt 0;
      gap: 14pt;
    }

    .masthead-main-row.align-center {
      justify-content: center;
      text-align: center;
    }

    .masthead-main-row.align-left {
      justify-content: flex-start;
      text-align: left;
    }

    .masthead-main-row.align-justified {
      justify-content: space-between;
      text-align: justify;
    }

    .masthead-emblem-box {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .masthead-title {
      margin: 0;
      font-weight: 900;
      letter-spacing: -0.02em;
      line-height: 1.05;
      color: var(--masthead-color, #111111);
    }

    .masthead-bottom-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #222222;
      padding-top: 3pt;
      margin-top: 4pt;
      font-size: 8.5pt;
      font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;
      font-weight: 600;
      color: #111111;
      letter-spacing: 0.3pt;
    }

    .bottom-strip-left,
    .bottom-strip-center,
    .bottom-strip-right {
      display: flex;
      align-items: center;
      gap: 8pt;
    }

    .folio-date {
      font-family: 'Noto Serif Devanagari', serif;
    }

    /* Inside Folio Header for Page 2+ */
    .inside-folio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #121212;
      padding-bottom: 4pt;
      margin-bottom: 12pt;
      font-size: 8pt;
      font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }

    /* Multi-Column Grid */
    .newspaper-grid {
      display: grid;
      grid-template-columns: repeat(${columnCount}, 1fr);
      grid-auto-flow: dense;
      gap: ${gapPt}pt;
      flex: 1;
      align-content: start;
      overflow: hidden;
    }

    /* Articles */
    .newspaper-article {
      break-inside: avoid;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .has-column-rule {
      padding-right: ${gapPt / 2}pt;
      border-right: 1px solid var(--border-color, #c8c5bc);
    }

    [dir="rtl"] .has-column-rule {
      padding-right: 0;
      padding-left: ${gapPt / 2}pt;
      border-right: none;
      border-left: 1px solid var(--border-color, #c8c5bc);
    }

    .article-header {
      margin-bottom: 6pt;
    }

    .article-deck {
      margin: 0 0 3pt 0;
      font-size: 9.5pt;
      color: var(--subheadline-color, #444);
      font-family: ${subheadlineFont}, ${bodyFont}, 'Noto Serif Devanagari', 'Hind', serif;
      line-height: 1.35;
    }

    .article-headline {
      margin: 0;
      font-family: ${headlineFont}, 'Noto Serif Devanagari', serif;
      font-weight: ${headlineWeight};
      line-height: 1.15;
      color: var(--headline-color, #121212);
    }

    .priority-lead .article-headline {
      font-size: 26pt;
      letter-spacing: -0.3pt;
    }

    .priority-major .article-headline {
      font-size: 19pt;
    }

    .priority-minor .article-headline {
      font-size: 14pt;
    }

    .priority-brief .article-headline {
      font-size: 11pt;
      font-weight: 700;
    }

    .article-byline {
      margin-top: 3pt;
      font-size: 7.5pt;
      font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      color: #666;
      font-weight: 600;
    }

    .article-body {
      font-size: ${bodyFontSizePt}pt;
      line-height: 1.45;
      text-align: justify;
      hyphens: auto;
    }

    /* Devanagari Typography: disable automatic hyphenation to prevent severing matras/conjuncts */
    :lang(hi),
    [lang="hi"],
    [lang="hi"] .article-body,
    [lang="hi"] .article-para,
    .newspaper-article.lang-hi,
    .newspaper-article.lang-hi .article-body,
    .newspaper-article.lang-hi .article-para {
      hyphens: manual;
      -webkit-hyphens: manual;
    }

    .article-dateline {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.9em;
      letter-spacing: 0.5pt;
      color: #121212;
    }

    .article-para {
      margin: 0 0 5pt 0;
      text-indent: 12pt;
    }

    .drop-cap:first-of-type::first-letter {
      float: left;
      font-size: 3.2em;
      line-height: 0.8;
      padding-right: 5pt;
      padding-top: 3pt;
      font-family: ${headlineFont}, 'Noto Serif Devanagari', serif;
      font-weight: 800;
      color: #121212;
    }

    /* Disable CSS :first-letter drop caps when element language is Hindi or Devanagari */
    :lang(hi) .drop-cap:first-of-type::first-letter,
    [lang="hi"] .drop-cap:first-of-type::first-letter,
    .newspaper-article.lang-hi .drop-cap:first-of-type::first-letter,
    [lang="hi"] p:first-of-type::first-letter {
      float: none !important;
      font-size: inherit !important;
      line-height: inherit !important;
      padding: 0 !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      color: inherit !important;
    }

    [dir="rtl"] .drop-cap:first-of-type::first-letter {
      float: right;
      padding-right: 0;
      padding-left: 5pt;
    }

    /* Images */
    .article-figure {
      margin: 0 0 6pt 0;
      width: 100%;
    }

    .article-figure.placement-side {
      float: left;
      width: 45%;
      margin: 2pt 8pt 6pt 0;
    }

    [dir="rtl"] .article-figure.placement-side {
      float: right;
      margin: 2pt 0 6pt 8pt;
    }

    .article-image {
      width: 100%;
      height: auto;
      object-fit: cover;
      display: block;
      border: 1px solid #121212;
    }

    .article-image.aspect-wide { aspect-ratio: 16 / 9; }
    .article-image.aspect-standard { aspect-ratio: 4 / 3; }
    .article-image.aspect-square { aspect-ratio: 1 / 1; }
    .article-image.aspect-portrait { aspect-ratio: 3 / 4; }

    .article-caption {
      margin-top: 3pt;
      font-size: 7.5pt;
      font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;
      color: #444;
      line-height: 1.3;
      font-style: italic;
    }

    .caption-credit {
      display: block;
      font-size: 6.5pt;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3pt;
      margin-top: 1pt;
      font-style: normal;
    }

    .article-side-wrap {
      overflow: hidden;
    }

    /* Folio Footer */
    .newspaper-folio-footer {
      margin-top: auto;
      padding-top: 6pt;
      flex-shrink: 0;
    }

    .footer-rule {
      height: 1px;
      background-color: #121212;
      margin-bottom: 4pt;
    }

    .footer-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7pt;
      font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.5pt;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}
