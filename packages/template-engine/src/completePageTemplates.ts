import type {
  NewspaperDocument,
  PageSizePreset,
  Article,
  MastheadConfig,
} from '@epaper-studio/document-schema';
import {
  getPageDimensions,
  ArticleSchema,
  MastheadConfigSchema,
  NewspaperDocumentSchema,
} from '@epaper-studio/document-schema';
import {
  SUMMIT_PHOTO_DATA_URI,
  ROCKET_TEST_DATA_URI,
  COLLECTORATE_PHOTO_DATA_URI,
  SPORTS_ATHLETES_DATA_URI,
  METRO_TRAIN_DATA_URI,
  ORGANIC_FARM_DATA_URI,
  ELECTION_VICTORY_DATA_URI,
} from './templateAssets.js';

export interface CompletePageTemplate {
  id: string;
  name: string;
  category: 'broadsheet' | 'tabloid' | 'krishi' | 'district' | 'election';
  tagline: string;
  description: string;
  pageSize: PageSizePreset;
  columnCount: number;
  previewSvgSnippet?: string;
  createDocument: () => NewspaperDocument;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseArticle(
  data: Partial<Article> & { id: string; headline: string; body: string }
): Article {
  return ArticleSchema.parse({
    subheadline: '',
    byline: '',
    dateline: '',
    imageCaption: '',
    imagePlacement: 'top',
    columnSpan: 6,
    priority: 'major',
    orderIndex: 0,
    ...data,
  });
}

function parseMasthead(config: Partial<MastheadConfig> & { title: string }): MastheadConfig {
  return MastheadConfigSchema.parse({
    date: '28 अक्टूबर 2026',
    edition: 'मुख्य संस्करण',
    ...config,
  });
}

function makeDoc(
  id: string,
  title: string,
  editionDate: string,
  pageSize: PageSizePreset,
  masthead: MastheadConfig,
  layout: NewspaperDocument['layout'],
  articles: Article[],
  theme?: NewspaperDocument['theme']
): NewspaperDocument {
  const now = new Date().toISOString();
  const orientation = 'portrait';
  const dimensions = getPageDimensions(pageSize, orientation);

  const rawDoc = {
    id,
    version: '1.1.0',
    schemaVersion: '1.1.0',
    metadata: {
      id,
      title,
      editionDate,
      language: 'hi',
      direction: 'ltr',
      pageSize,
      orientation,
      dimensions,
      createdAt: now,
      updatedAt: now,
    },
    masthead,
    layout,
    theme,
    articles,
    pages: [
      {
        id: makeId('page'),
        pageNumber: 1,
        sectionTitle: title,
        layoutMode: 'auto',
        columnCount: layout.columnCount,
        articles,
      },
    ],
  };

  return NewspaperDocumentSchema.parse(rawDoc);
}

export const COMPLETE_PAGE_TEMPLATES: CompletePageTemplate[] = [
  // =========================================================================
  // 1. राष्ट्रीय मुख्य ब्रॉडशीट (National Broadsheet) — NP-001
  // =========================================================================
  {
    id: 'tpl-national-broadsheet',
    name: 'राष्ट्रीय मुख्य संस्करण (National Broadsheet)',
    category: 'broadsheet',
    tagline: '4-कॉलम का प्रामाणिक व प्रतिष्ठित राष्ट्रीय ब्रॉडशीट लेआउट',
    description:
      'प्रमुख राष्ट्रीय समाचार पत्र शैली: भव्य रोज़ा वन मास्टहेड, अशोक चक्र, शीर्ष लीड स्टोरी, साइड एनालिसिस एंकर और बॉटम ब्रीफ बॉक्स।',
    pageSize: 'broadsheet',
    columnCount: 4,
    createDocument: () => {
      const docId = makeId('doc-national');
      const articles: Article[] = [
        // Row 1: Lead Story (8 cols)
        parseArticle({
          id: makeId('art-lead'),
          elementType: 'block',
          headline:
            'वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता',
          subheadline:
            'चार महाद्वीपों में निर्बाध सौर व पवन ऊर्जा आपूर्ति के लिए साझा अंतरमहाद्वीपीय ग्रिड मानक तैयार',
          body: 'जिनेवा — लगातार छह दिनों तक चली गहन वार्ताओं के उपरांत 68 राष्ट्रों के ऊर्जा मंत्रियों ने अंतरराष्ट्रीय हरित ग्रिड समझौते पर ऐतिहासिक हस्ताक्षर किए।\n\nइस दूरगामी समझौते के अंतर्गत उच्च वोल्टेज डायरेक्ट करंट (HVDC) गलियारों का एक अंतरमहाद्वीपीय नेटवर्क तैयार किया जाएगा। समझौते के लागू होने से सौर व पवन ऊर्जा की अतिरिक्त आपूर्ति को उन क्षेत्रों तक तत्काल भेजा जा सकेगा जहां मांग अधिक है।\n\nभारतीय प्रतिनिधिमंडल के प्रमुख ने कहा, "आज ऊर्जा आत्मनिर्भरता और जलवायु संरक्षण की दिशा में एक क्रांतिकारी शुरुआत हुई है। अब प्राकृतिक ऊर्जा स्रोतों की सीमाएं भौगोलिक बंधनों से परे होंगी। आगामी दशक में विकासशील राष्ट्रों को रियायती दर पर स्वच्छ बिजली उपलब्ध कराई जाएगी।"',
          byline: 'विशेष संवाददाता, जिनेवा ब्यूरो',
          dateline: 'जिनेवा —',
          kickerText: 'ऐतिहासिक अंतरराष्ट्रीय घोषणा',
          imageUrl: SUMMIT_PHOTO_DATA_URI,
          imageCaption:
            'जिनेवा में आयोजित अंतरराष्ट्रीय ऊर्जा शिखर सम्मेलन में ऐतिहासिक समझौते पर हस्ताक्षर करते 68 देशों के प्रतिनिधिमंडल।',
          imageCredit: 'यूएन फोटो / एपी',
          imagePlacement: 'top',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 1: Anchor Science Story (4 cols)
        parseArticle({
          id: makeId('art-space'),
          elementType: 'block',
          headline: 'भारतीय अंतरिक्ष अनुसंधान: गगनयान-2 मिशन के क्रायोजेनिक चरण का सफल परीक्षण',
          subheadline: 'स्वदेशी तकनीक से तैयार रॉकेट इंजन ने उच्च दबाव मानकों को प्राप्त किया',
          body: 'श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान केंद्र ने आज सुबह स्वदेशी क्रायोजेनिक इंजन के उच्च-दबाव प्रज्वलन परीक्षण को सफलतापूर्वक संपन्न किया।\n\nइस महत्वपूर्ण चरण की सफलता से आगामी मानव अंतरिक्ष उड़ान के लिए मार्ग प्रशस्त हो गया है। वैज्ञानिकों ने बताया कि इंजन का प्रदर्शन निर्धारित मापदंडों से भी अधिक सटीक रहा। मिशन नियंत्रण कक्ष में जश्न का माहौल रहा।',
          byline: 'विज्ञान प्रतिनिधि',
          dateline: 'श्रीहरिकोटा —',
          kickerText: 'अंतरिक्ष में नया कीर्तिमान',
          imageUrl: ROCKET_TEST_DATA_URI,
          imageCaption:
            'श्रीहरिकोटा अंतरिक्ष केंद्र में स्वदेशी क्रायोजेनिक चरण के प्रज्वलन का सफल परीक्षण।',
          imageCredit: 'इसरो मीडिया',
          imagePlacement: 'top',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Agriculture & Climate (4 cols)
        parseArticle({
          id: makeId('art-agri'),
          elementType: 'block',
          headline: 'डिजिटल कृषि और उपग्रह निगरानी से रबी फसलों की बंपर पैदावार',
          subheadline: 'सटीक मौसम पूर्वानुमान और मृदा स्वास्थ्य कार्ड से उत्पादन लागत में भारी कमी',
          body: 'नई दिल्ली — कृषि मंत्रालय द्वारा जारी ताजा आंकड़ों के अनुसार देश के उत्तरी और मध्य मैदानी भागों में गेहूं तथा दलहन की बुवाई ने पिछले सभी रिकॉर्ड तोड़ दिए हैं।\n\nसटीक मौसम पूर्वानुमान और उपग्रह आधारित सिंचाई परामर्श से किसानों की लागत में उल्लेखनीय कमी दर्ज की गई है। कृषि विशेषज्ञों का मानना है कि इस वर्ष खाद्यान्न उत्पादन में एक ऐतिहासिक नया कीर्तिमान स्थापित होगा।',
          byline: 'कृषि एवं ग्रामीण विकास डेस्क',
          dateline: 'नई दिल्ली —',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Economy & Markets (4 cols)
        parseArticle({
          id: makeId('art-economy'),
          elementType: 'block',
          headline: 'भारतीय शेयर बाजारों में ऐतिहासिक तेजी: सेंसेक्स और निफ्टी रिकॉर्ड ऊंचाई पर',
          subheadline:
            'विदेशी संस्थागत निवेशकों की भारी लिवाली और मजबूत जीडीपी अनुमानों से बाजार में उछाल',
          body: 'मुंबई — घरेलू शेयर बाजारों में सप्ताह के तीसरे कारोबारी दिन चौतरफा खरीदारी देखने को मिली। ऑटो, बैंकिंग और आईटी शेयरों में तेजी के दम पर प्रमुख सूचकांक नए शिखर पर पहुंचे।\n\nबाजार विश्लेषकों का कहना है कि बुनियादी ढांचे में सरकारी निवेश और औद्योगिक उत्पादन के उत्साहजनक आंकड़ों ने निवेशकों के विश्वास को नई मजबूती दी है।',
          byline: 'वाणिज्य प्रतिनिधि',
          dateline: 'मुंबई —',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Cultural / Heritage (4 cols)
        parseArticle({
          id: makeId('art-culture'),
          elementType: 'block',
          headline: 'काशी-तमिल संगमम: राष्ट्रीय एकता और सांस्कृतिक सेतु का अनूठा उत्सव',
          subheadline:
            'प्राचीन ज्ञान परंपराओं और समकालीन कला का संगम; हजारों प्रतिनिधियों का दल पहुंचा',
          body: 'वाराणसी — गंगा के पावन तट पर शुरू हुए सांस्कृतिक समागम में उत्तर और दक्षिण भारत के दार्शनिकों, संगीतकारों और शिल्पकारों ने अपने साझा ऐतिहासिक बंधनों को रेखांकित किया।\n\nउत्सव के दौरान आयोजित साहित्यिक संगोष्ठियों में दोनों क्षेत्रों के प्राचीन ग्रंथों और वास्तुशिल्प तकनीकों पर गहन विचार-विमर्श हुआ।',
          byline: 'सांस्कृतिक ब्यूरो',
          dateline: 'वाराणसी —',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 3: Regional News Briefs (7 cols)
        parseArticle({
          id: makeId('art-brief'),
          elementType: 'short-news',
          headline: 'प्रादेशिक एवं नगर समाचार संक्षेप',
          subheadline:
            'परिवहन, शिक्षा, संस्कृति, पर्यावरण और नागरिक सरोकारों से जुड़े संक्षिप्त समाचार',
          body: '• मेट्रो विस्तार परियोजना के तीसरे चरण को मिली अंतिम पर्यावरणीय मंजूरी; निर्माण कार्य शीघ्र प्रारंभ होगा।\n• राष्ट्रीय पुस्तक मेले में भारतीय भाषाओं की कृतियों के लिए विशेष दालान का भव्य उद्घाटन।\n• यमुना नदी के तटीय क्षेत्रों में जैव विविधता पार्क के संरक्षण हेतु नागरिकों का अनूठा श्रमदान अभियान।\n• राज्य भर के पॉलिटेक्निक संस्थानों में रोबोटिक्स और कृत्रिम बुद्धिमत्ता के नए पाठ्यक्रमों की शुरुआत।\n• प्रमुख राजमार्गों पर इलेक्ट्रॉनिक टोल संग्रह में 100% जीपीएस आधारित प्रणाली का ट्रायल सफल रहा।',
          byline: 'कार्यालय प्रतिनिधि',
          columnSpan: 7,
          priority: 'minor',
        }),
        // Row 3: Public Procurement & Tender Notice (5 cols)
        parseArticle({
          id: makeId('art-tender-notice'),
          elementType: 'block',
          headline: 'सार्वजनिक सूचना एवं ई-निविदा आमंत्रण',
          subheadline: 'केंद्रीय लोक निर्माण विभाग • निविदा संख्या C-884/2026',
          body: 'सक्षम एवं पंजीकृत संवेदकों से राष्ट्रीय राजमार्ग चौड़ीकरण एवं सौर प्रकाश व्यवस्था अधिष्ठापन कार्य हेतु ई-प्रोक्योरमेंट पोर्टल के माध्यम से ऑनलाइन निविदाएं आमंत्रित की जाती हैं।\n\n• अनुमानित लागत: ₹14.50 करोड़\n• धरोहर राशि: ₹29.00 लाख\n• निविदा प्रपत्र डाउनलोड अंतिम तिथि: 15 नवंबर 2026\n• विस्तृत विवरण एवं शर्तें विभागीय वेबसाइट eproc.gov.in पर उपलब्ध हैं।',
          byline: 'अधीक्षण अभियंता, निर्माण मंडल-IV',
          columnSpan: 5,
          priority: 'minor',
          backgroundColor: '#f8fafc',
          borders: {
            top: { width: 1.5, style: 'solid', color: '#334155' },
            bottom: { width: 1.5, style: 'solid', color: '#334155' },
            left: { width: 1.5, style: 'solid', color: '#334155' },
            right: { width: 1.5, style: 'solid', color: '#334155' },
          },
          paddingPx: 8,
        }),
      ];

      return makeDoc(
        docId,
        'जनवाणी समाचार',
        '28 अक्टूबर 2026',
        'broadsheet',
        parseMasthead({
          title: 'जनवाणी समाचार',
          tagline: 'सत्य, निष्पक्षता और जनसेवा का प्रतीक',
          subtitle: 'सत्य, निष्पक्षता और जनसेवा का प्रतीक • स्थापना 1947',
          establishmentYear: '1947',
          fontFamily: "'Rozha One', serif",
          fontSizePt: 52,
          alignment: 'center',
          ruleStyle: 'ornate-double',
          emblem: 'ashoka-chakra',
          showEmblem: true,
          weatherCity: 'नई दिल्ली',
          temperature: '25°C',
          weatherCondition: 'साफ़ आसमान',
          airQuality: 'AQI 128 • मध्यम',
          price: 'मूल्य ₹5.00',
          postalRegNumber: 'पंजीयन सं. DL-11001/2026',
          pageCountLabel: 'कुल पृष्ठ 8',
          dayOfWeek: 'बुधवार',
          date: '28 अक्टूबर 2026',
          volumeYear: 'वर्ष 78',
          issueNumber: 'वर्ष 78 • अंक 142',
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
        }),
        {
          presetId: 'classic-hindi-broadsheet',
          columnCount: 12,
          columnRule: true,
          columnRuleStyle: 'solid',
          mastheadFont: "'Rozha One', serif",
          headlineFont: "'Noto Serif Devanagari', serif",
          subheadlineFont: "'Noto Serif Devanagari', serif",
          bodyFont: "'Noto Serif Devanagari', serif",
          headlineWeight: 700,
          bodyFontSizePt: 10,
          spacingDensity: 'normal',
          showFooter: true,
          footerText: 'जनवाणी समाचार • राष्ट्रीय संस्करण • पृष्ठ 1/1',
        },
        articles,
        {
          id: 'classic-bw',
          name: 'क्लासिक ब्लैक & वाइट',
          mastheadColor: '#111111',
          headlineColor: '#111111',
          subheadlineColor: '#333333',
          bodyColor: '#222222',
          bylineColor: '#555555',
          kickerColor: '#b91c1c',
          borderColor: '#c8c5bc',
          pageBackground: '#ffffff',
        }
      );
    },
  },

  // =========================================================================
  // 2. जिला परिषद दैनिक (District Gazette) — NP-003
  // =========================================================================
  {
    id: 'tpl-district-gazette',
    name: 'जिला परिषद दैनिक (District Gazette)',
    category: 'district',
    tagline: 'स्थानीय प्रशासन, विकास कार्य और ग्रामीण पंचायत केंद्रित समाचार पत्र',
    description:
      'कलेक्ट्रेट आदेश, ग्राम सभा निर्णय, विकास योजनाओं की स्वीकृति और नागरिक सुविधाओं के लिए विशिष्ट 3-कॉलम जिला प्रारूप।',
    pageSize: 'broadsheet',
    columnCount: 3,
    createDocument: () => {
      const docId = makeId('doc-district');
      const articles: Article[] = [
        // Row 1: District Lead Story (8 cols)
        parseArticle({
          id: makeId('art-dist-lead'),
          elementType: 'block',
          headline:
            'जिला परिषद की वार्षिक विकास योजना मंजूर: 142 ग्राम पंचायतों में सड़क, पेयजल और सौर ऊर्जा का विस्तार',
          subheadline:
            'सदन में 180 करोड़ रुपये के बजट का सर्वसम्मत अनुमोदन; ग्रामीण स्वास्थ्य केंद्रों पर नए डिजिटल उपकरण लगाए जाएंगे',
          body: 'जिला मुख्यालय — जिला परिषद सभागार में आयोजित त्रिमासिक साधारण सभा में वित्तीय वर्ष के विकास बजट को सर्वसम्मति से मंजूरी प्रदान कर दी गई।\n\nजिला प्रमुख ने बताया कि इस वर्ष प्राथमिकता के आधार पर दूरदराज की ढाणियों को मुख्य पक्की सड़कों से जोड़ा जाएगा और प्रत्येक गांव में हर घर नल से जल पहुंचाने के काम में तेजी लाई जाएगी। साथ ही 45 प्राथमिक विद्यालयों में स्मार्ट क्लासरूम स्थापित किए जाएंगे। जल जीवन मिशन के कार्यों की साप्ताहिक समीक्षा पंचायत समिति स्तर पर होगी।',
          byline: 'प्रशासनिक संवाददाता',
          dateline: 'जिला मुख्यालय —',
          kickerText: 'विकास की नई गति',
          imageUrl: COLLECTORATE_PHOTO_DATA_URI,
          imageCaption:
            'जिला परिषद सभागार में वार्षिक विकास योजना को स्वीकृति प्रदान करते जिला प्रमुख व मुख्य कार्यकारी अधिकारी।',
          imageCredit: 'जनसंपर्क विभाग',
          imagePlacement: 'top',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 1: Collector Directive (4 cols)
        parseArticle({
          id: makeId('art-collector'),
          elementType: 'block',
          headline:
            'कलेक्टर का कड़ा निर्देश: समर्थन मूल्य खरीद केंद्रों पर किसानों को न हो कोई असुविधा',
          subheadline:
            'बारदाने की पर्याप्त उपलब्धता और 72 घंटे में सीधा बैंक भुगतान सुनिश्चित करने के आदेश',
          body: 'जिला कलेक्ट्रेट — जिला मजिस्ट्रेट ने रबी विपणन सत्र के तहत सभी उपखंड अधिकारियों और मंडी सचिवों को खरीद केंद्रों का औचक निरीक्षण करने के सख्त आदेश दिए हैं।\n\nउन्होंने स्पष्ट किया कि तौल में किसी भी प्रकार की गड़बड़ी पाए जाने पर संबंधित फर्म व अधिकारी के खिलाफ तत्काल प्राथमिकी दर्ज कराई जाएगी। किसानों के लिए पेयजल व छायादार बैठक व्यवस्था अनिवार्य रहेगी।',
          byline: 'कलेक्ट्रेट प्रतिनिधि',
          dateline: 'मुख्यालय —',
          kickerText: 'प्रशासनिक समीक्षा',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Water Conservation (4 cols)
        parseArticle({
          id: makeId('art-lake'),
          elementType: 'block',
          headline: 'अमृत सरोवर योजना: जिले के 34 ऐतिहासिक जलाशयों और बावड़ियों का कायाकल्प पूरा',
          subheadline: 'पारंपरिक जल स्रोतों के पुनर्जीवन से भूजल स्तर में 2 मीटर तक का सुधार दर्ज',
          body: 'भूजल संरक्षण विभाग द्वारा जारी रिपोर्ट के अनुसार जिले के ग्रामीण अंचलों में मनरेगा और जनसहयोग से विकसित किए गए अमृत सरोवरों ने इस वर्ष मानसूनी जल संचयन में उत्कृष्ट भूमिका निभाई है। ग्रामीणों ने इन सरोवरों के तट पर सघन पौधारोपण कर पर्यावरण सुरक्षा का संकल्प लिया है।',
          byline: 'ग्रामीण विकास डेस्क',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Rural Telemedicine (4 cols)
        parseArticle({
          id: makeId('art-health'),
          elementType: 'block',
          headline: 'सामुदायिक स्वास्थ्य केंद्रों पर निःशुल्क डिजिटल टेली-मेडिसिन परामर्श शुरू',
          subheadline:
            'एम्स और मेडिकल कॉलेज के विशेषज्ञ डॉक्टर ग्रामीण मरीजों को देंगे ऑनलाइन सलाह',
          body: 'मुख्य चिकित्सा एवं स्वास्थ्य अधिकारी (CMHO) ने बताया कि ग्रामीण क्षेत्रों के मरीजों को बड़े शहरों में जाने की आवश्यकता न पड़े, इसके लिए सभी 8 सामुदायिक केंद्रों को हाई-स्पीड ब्रॉडबैंड नेटवर्क से जोड़ दिया गया है। विशेषज्ञ जांच रिपोर्ट भी उसी दिन डिजिटल प्राप्त होगी।',
          byline: 'स्वास्थ्य प्रतिनिधि',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Kasturba Model Schools (4 cols)
        parseArticle({
          id: makeId('art-education'),
          elementType: 'block',
          headline: 'कस्तूरबा आवासीय विद्यालयों में 100% परीक्षा परिणाम पर शिक्षिकाएं सम्मानित',
          subheadline:
            'ग्रामीण बालिकाओं के सशक्तिकरण और उत्कृष्ट शैक्षणिक प्रदर्शन पर जिला स्तरीय सम्मान',
          body: 'जिला शिक्षा अधिकारी कार्यालय सभागार में आयोजित समारोह में शत-प्रतिशत परीक्षा परिणाम देने वाली 24 शिक्षिकाओं को प्रशस्ति पत्र देकर सम्मानित किया गया। छात्राओं को उच्च तकनीकी शिक्षा हेतु विशेष छात्रवृत्ति प्रदान की जाएगी।',
          byline: 'शिक्षा संवाददाता',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 3: Law & Order / Women Safety (7 cols)
        parseArticle({
          id: makeId('art-police-brief'),
          elementType: 'short-news',
          headline: 'नागरिक सुरक्षा एवं शांति व्यवस्था बुलेटिन',
          subheadline: 'जिले में महिला सुरक्षा हेतु पिंक पेट्रोल दस्ता और रात्रि गश्त तेज',
          body: "• संवेदनशील चौराहों और स्कूल-कॉलेजों के आसपास महिला पुलिस का विशेष 'पिंक पेट्रोल' दस्ता सक्रिय।\n• यातायात पुलिस ने बिना हेलमेट और ओवरस्पीड वाहनों पर चलाया सघन चालान अभियान; 312 वाहनों के चालान।\n• पुलिस अधीक्षक कार्यालय में आयोजित जनसुनवाई में 48 लंबित परिवादों का मौके पर ही त्वरित निस्तारण।\n• साइबर अपराधों से बचाव हेतु ग्रामीण पंचायतों में डिजिटल सुरक्षा चौपालों का आयोजन जारी।",
          byline: 'सुरक्षा ब्यूरो',
          columnSpan: 7,
          priority: 'minor',
        }),
        // Row 3: Collectorate Public Notice & Land Records (5 cols)
        parseArticle({
          id: makeId('art-dist-notice'),
          elementType: 'block',
          headline: 'कलेक्ट्रेट सार्वजनिक विज्ञप्ति: भू-अभिलेख अद्यतनीकरण',
          subheadline: 'राजस्व विभाग • नामांतरण एवं जमाबंदी शुद्धिकरण विशेष शिविर',
          body: 'सर्वसाधारण को सूचित किया जाता है कि उपखंड की सभी तहसीलों में 01 से 10 नवंबर तक विशेष राजस्व शिविर आयोजित किए जाएंगे। खातेदार अपनी कृषि भूमि के नामांतरण, सीमांकन एवं बंटवारे हेतु आवेदन सीधे शिविर प्रभारी को प्रस्तुत कर सकते हैं।\n\n• हेल्पलाइन: 0141-2223456\n• ईमेल: collector-district@gov.in',
          byline: 'अपर जिला मजिस्ट्रेट (राजस्व)',
          columnSpan: 5,
          priority: 'minor',
          backgroundColor: '#f1f5f9',
          borders: {
            top: { width: 1.5, style: 'solid', color: '#475569' },
            bottom: { width: 1.5, style: 'solid', color: '#475569' },
            left: { width: 1.5, style: 'solid', color: '#475569' },
            right: { width: 1.5, style: 'solid', color: '#475569' },
          },
          paddingPx: 8,
        }),
      ];

      return makeDoc(
        docId,
        'जिला संदेश',
        '28 अक्टूबर 2026',
        'broadsheet',
        parseMasthead({
          title: 'जिला संदेश',
          tagline: 'जनहित, प्रशासन और ग्रामीण स्वावलंबन का सच्चा दर्पण',
          subtitle: 'अधिकृत जिला परिषद एवं पंचायती राज समाचार पत्र',
          establishmentYear: '1974',
          fontFamily: "'Rozha One', serif",
          fontSizePt: 50,
          alignment: 'center',
          ruleStyle: 'classic-double',
          emblem: 'lion-capital',
          showEmblem: true,
          weatherCity: 'जिला मुख्यालय',
          temperature: '26°C',
          weatherCondition: 'धूप खिली',
          airQuality: 'AQI 85 • उत्तम',
          price: 'मूल्य ₹3.00',
          postalRegNumber: 'पंजीयन सं. DIST-992/2026',
          pageCountLabel: 'पृष्ठ 4',
          dayOfWeek: 'बुधवार',
          date: '28 अक्टूबर 2026',
          volumeYear: 'वर्ष 52',
          issueNumber: 'अंक 88',
          leftSlot: {
            enabled: true,
            type: 'ad',
            title: 'कलेक्ट्रेट हेल्पलाइन',
            subtitle: '24x7 सेवा',
            text: 'टोल फ्री: 1800-180-2345',
            widthPx: 125,
            heightPx: 58,
            border: true,
            borderColor: '#94a3b8',
            backgroundColor: '#f1f5f9',
            textColor: '#0f172a',
          },
          rightSlot: {
            enabled: true,
            type: 'text',
            title: 'स्वच्छ गांव',
            subtitle: 'समृद्ध पंचायत',
            text: 'मिशन 2026',
            widthPx: 125,
            heightPx: 58,
            border: true,
            borderColor: '#94a3b8',
            backgroundColor: '#f1f5f9',
            textColor: '#0f172a',
          },
          showTopStrip: true,
          showWeather: true,
          showPrice: true,
          showPostalReg: true,
          showBottomStrip: true,
          showVolumeIssue: true,
          showDate: true,
          showEdition: true,
        }),
        {
          presetId: 'local-hindi-gazette',
          columnCount: 12,
          columnRule: true,
          columnRuleStyle: 'solid',
          mastheadFont: "'Rozha One', serif",
          headlineFont: "'Noto Serif Devanagari', serif",
          subheadlineFont: "'Noto Serif Devanagari', serif",
          bodyFont: "'Noto Serif Devanagari', serif",
          headlineWeight: 700,
          bodyFontSizePt: 10,
          spacingDensity: 'normal',
          showFooter: true,
          footerText: 'जिला संदेश • अधिकृत जनसंपर्क एवं पंचायती राज बुलेटिन',
        },
        articles
      );
    },
  },

  // =========================================================================
  // 3. प्रभात जागरण एक्सप्रेस (Morning Express) — NP-002
  // =========================================================================
  {
    id: 'tpl-morning-express',
    name: 'प्रभात जागरण एक्सप्रेस (Morning Express)',
    category: 'tabloid',
    tagline: 'तेज़-तर्रार, आधुनिक एवं ऊर्जावान प्रातःकालीन समाचार पत्र',
    description:
      'उच्च पठनीयता वाला आधुनिक लेआउट: शीर्ष ब्रेकिंग अलर्ट पट्टी, केंद्र में बड़ा एक्शन फोटो, और 3 संतुलित बॉटम कॉलम।',
    pageSize: 'tabloid',
    columnCount: 3,
    createDocument: () => {
      const docId = makeId('doc-morning');
      const articles: Article[] = [
        // Top Flash Banner (colSpan 12)
        parseArticle({
          id: makeId('art-flash'),
          elementType: 'top-headline',
          headline:
            'एक्सप्रेसवे कॉरिडोर को कैबिनेट की अंतिम मंजूरी: राजधानी से व्यापारिक केंद्र की दूरी अब मात्र 4 घंटे',
          subheadline:
            '6-लेन ग्रीनफील्ड परियोजना पर अगले माह से निर्माण कार्य शुरू; 8 औद्योगिक टाउनशिप भी विकसित होंगी',
          body: 'राजधानी से व्यापारिक केंद्र के मध्य यात्रा का समय घटकर चार घंटे रह जाएगा।',
          kickerText: 'प्रातःकालीन विशेष (MORNING FLASH)',
          backgroundColor: '#b91c1c',
          textColor: '#ffffff',
          customColors: {
            headlineColor: '#ffffff',
            subheadlineColor: '#fef08a',
            kickerColor: '#fef08a',
          },
          columnSpan: 12,
          priority: 'lead',
          paddingPx: 8,
        }),
        // Hero Sports Story with High-Action Photo (colSpan 7)
        parseArticle({
          id: makeId('art-sports'),
          elementType: 'block',
          headline: 'राज्य स्तरीय युवा खेल महोत्सव में 4,500 एथलीटों ने दिखाया दमखम',
          subheadline: 'एथलेटिक्स और कुश्ती प्रतियोगिताओं में ग्रामीण प्रतिभाओं का शानदार दबदबा',
          body: 'महानगर स्पोर्ट्स स्टेडियम — तीन दिवसीय राज्य युवा खेल महोत्सव के उद्घाटन समारोह में रंगारंग सांस्कृतिक प्रस्तुतियों के साथ खिलाड़ियों ने मार्च पास्ट किया।\n\nखेल मंत्री ने युवा खिलाड़ियों को प्रोत्साहित करते हुए कहा कि पदक विजेता युवाओं को सीधे सरकारी सेवाओं में नियुक्ति दी जाएगी। खेल अकादमियों में अत्याधुनिक फिजियोथेरेपी केंद्र भी स्थापित होंगे।',
          byline: 'खेल डेस्क',
          dateline: 'महानगर —',
          imageUrl: SPORTS_ATHLETES_DATA_URI,
          imageCaption:
            'राज्य स्तरीय युवा खेल महोत्सव के 400 मीटर स्प्रिंट में स्वर्ण पदक जीतते युवा धावक।',
          imageCredit: 'एक्सप्रेस खेल डेस्क',
          imagePlacement: 'top',
          columnSpan: 7,
          priority: 'major',
        }),
        // Underground Metro Report with Modern Train Graphic (colSpan 5)
        parseArticle({
          id: makeId('art-metro'),
          elementType: 'block',
          headline: 'मेट्रो के भूमिगत रूट का सफल ट्रायल रन, जल्द होगा शुभारंभ',
          subheadline: 'पुराने शहर के व्यस्त बाज़ारों को भीषण ट्रैफिक जाम से मिलेगी स्थायी मुक्ति',
          body: 'मेट्रो रेल कॉर्पोरेशन ने ऐतिहासिक शहर के नीचे 8 किलोमीटर लंबे भूमिगत खंड पर 80 किमी प्रति घंटे की गति से मेट्रो ट्रेन का सफल ट्रायल पूरा कर लिया है। सुरक्षा आयुक्त की अंतिम रिपोर्ट मिलते ही आम जनता के लिए नियमित यात्री सेवाएं शुरू कर दी जाएंगी।',
          byline: 'नगर प्रतिनिधि',
          dateline: 'सिटी ब्यूरो —',
          imageUrl: METRO_TRAIN_DATA_URI,
          imageCaption:
            'भूमिगत स्टेशन पर 80 किमी प्रति घंटे की गति से मेट्रो ट्रेन का सफल ट्रायल रन पूरा।',
          imageCredit: 'मेट्रो पीआरओ',
          imagePlacement: 'top',
          columnSpan: 5,
          priority: 'minor',
        }),
        // Tech & Campus Placement (colSpan 4)
        parseArticle({
          id: makeId('art-tech-youth'),
          elementType: 'block',
          headline: 'राज्य के तकनीकी संस्थानों में 100% कैंपस प्लेसमेंट रिकॉर्ड',
          subheadline: 'एआई, डेटा साइंस और रोबोटिक्स में शीर्ष कंपनियों ने दिए आकर्षक पैकेज',
          body: 'इंजीनियरिंग और पॉलिटेक्निक कॉलेजों के वार्षिक प्लेसमेंट ड्राइव में 8,400 छात्रों को बहुराष्ट्रीय कंपनियों से नियुक्ति पत्र प्राप्त हुए हैं।',
          byline: 'शिक्षा प्रतिनिधि',
          columnSpan: 4,
          priority: 'minor',
        }),
        // Weather Alert (colSpan 4)
        parseArticle({
          id: makeId('art-weather-metro'),
          elementType: 'block',
          headline: 'मौसम चेतावनी: पश्चिमी विक्षोभ से उत्तरी मैदानी भागों में हल्की वर्षा',
          subheadline:
            'तापमान में 3 से 4 डिग्री की गिरावट के आसार, सुबह हल्का कोहरा छाने का अनुमान',
          body: 'मौसम विभाग के अनुसार आगामी 48 घंटों में पहाड़ी क्षेत्रों में बर्फबारी और मैदानी भागों में ठंडी हवाओं का दौर चलेगा।',
          byline: 'मौसम डेस्क',
          columnSpan: 4,
          priority: 'minor',
        }),
        // City Highlights (colSpan 4)
        parseArticle({
          id: makeId('art-city-briefs'),
          elementType: 'short-news',
          headline: 'आज शहर में क्या है खास (City Highlights)',
          subheadline: 'नागरिक सूचनाएं, सांस्कृतिक कार्यक्रम एवं सेवाएं',
          body: '• टाउन हॉल में अंतर-महाविद्यालय वाद-विवाद प्रतियोगिता सुबह 11 बजे से।\n• सिविल लाइंस क्षेत्र में दोपहर 1 से 3 बजे तक विद्युत आपूर्ति रखरखाव।\n• गांधी संग्रहालय में दुर्लभ ऐतिहासिक छायाचित्रों की प्रदर्शनी।\n• सेंट्रल लाइब्रेरी में डिजिटल रीडिंग रूम का निःशुल्क पंजीकरण।',
          byline: 'सिटी रिपोर्टर',
          columnSpan: 4,
          priority: 'minor',
        }),
        // Commercial Educational Ad Banner (colSpan 12)
        parseArticle({
          id: makeId('art-commercial-ad'),
          elementType: 'block',
          headline: 'राज्य कौशल विकास एवं तकनीकी प्रशिक्षण केंद्र: निःशुल्क प्रवेश सूचना',
          subheadline:
            '10वीं व 12वीं उत्तीर्ण युवाओं के लिए उद्योग-उन्मुख सर्टिफिकेट कोर्स • 100% प्लेसमेंट सहायता',
          body: '• कंप्यूटर अकाउंटिंग, डिजिटल मार्केटिंग, सोलर पैनल इंस्टॉलेशन एवं वेल्डिंग टेक्नोलॉजी में प्रशिक्षण।\n• सरकारी छात्रवृत्ति एवं टूलकिट सुविधा उपलब्ध। संपर्क: कौशल भवन, मुख्य मार्ग • टोल फ्री: 1800-200-8899',
          byline: 'प्रायोजित संदेश',
          columnSpan: 12,
          priority: 'minor',
          backgroundColor: '#fef3c7',
          borders: {
            top: { width: 1.5, style: 'dashed', color: '#d97706' },
            bottom: { width: 1.5, style: 'dashed', color: '#d97706' },
          },
          paddingPx: 6,
        }),
      ];

      return makeDoc(
        docId,
        'प्रभात एक्सप्रेस',
        '28 अक्टूबर 2026',
        'tabloid',
        parseMasthead({
          title: 'प्रभात एक्सप्रेस',
          tagline: 'जागते शहर की सबसे तेज़ और विश्वसनीय आवाज़',
          subtitle: 'सवेरे की ताज़ा तरीन खबरें • नगर एवं प्रादेशिक दैनिक',
          establishmentYear: '1998',
          fontFamily: "'Yatra One', cursive",
          fontSizePt: 54,
          alignment: 'center',
          ruleStyle: 'single-hairline',
          emblem: 'sun',
          showEmblem: true,
          weatherCity: 'महानगर',
          temperature: '22°C',
          weatherCondition: 'हल्का कोहरा',
          airQuality: 'AQI 110 • मध्यम',
          price: 'मूल्य ₹4.00',
          postalRegNumber: 'पंजीयन सं. PRABHAT-44/2026',
          pageCountLabel: 'कुल 12 पृष्ठ',
          dayOfWeek: 'बुधवार',
          date: '28 अक्टूबर 2026',
          volumeYear: 'वर्ष 28',
          issueNumber: 'अंक 312',
          showTopStrip: true,
          showWeather: true,
          showPrice: true,
          showBottomStrip: true,
          showVolumeIssue: true,
          showDate: true,
          showEdition: true,
        }),
        {
          presetId: 'modern-hindi-daily',
          columnCount: 12,
          columnRule: true,
          columnRuleStyle: 'solid',
          mastheadFont: "'Yatra One', cursive",
          headlineFont: "'Noto Serif Devanagari', serif",
          subheadlineFont: "'Noto Serif Devanagari', serif",
          bodyFont: "'Noto Serif Devanagari', serif",
          headlineWeight: 700,
          bodyFontSizePt: 10,
          spacingDensity: 'compact',
          showFooter: true,
          footerText: 'प्रभात एक्सप्रेस • नगर का अपना सवेरा • www.prabhatexpress.in',
        },
        articles
      );
    },
  },

  // =========================================================================
  // 4. कृषि एवं ग्रामीण संदेश (Agriculture & Rural Weekly) — NP-004
  // =========================================================================
  {
    id: 'tpl-krishi-gramin',
    name: 'कृषि एवं ग्रामीण संदेश (Agriculture & Rural Weekly)',
    category: 'krishi',
    tagline: 'अन्नदाताओं की आवाज, मंडी भाव, मौसम पूर्वानुमान और नई कृषि तकनीक',
    description:
      'हरित थीम, गेहूं की बाली प्रतीक, मंडी जिंसों के भाव का सुव्यवस्थित बॉक्स, फसल सुरक्षा और पशुपालन मार्गदर्शन।',
    pageSize: 'broadsheet',
    columnCount: 4,
    createDocument: () => {
      const docId = makeId('doc-krishi');
      const articles: Article[] = [
        // Row 1: Lead Agriculture Story (colSpan 8)
        parseArticle({
          id: makeId('art-krishi-lead'),
          elementType: 'block',
          headline:
            'प्राकृतिक व जैविक खेती को महा-प्रोत्साहन: राज्य के 50,000 किसानों को मिलेगा निःशुल्क प्रमाणीकरण',
          subheadline:
            'गो-आधारित खाद बनाने और जीवामृत इकाइयों की स्थापना के लिए सीधे बैंक खाते में पहुंचेगा ₹25,000 अनुदान',
          body: 'कृषि भवन — कृषि विभाग ने राज्य में जैविक और प्राकृतिक खेती के रकबे को दोगुना करने के लिए एक महत्वाकांक्षी कार्ययोजना की घोषणा की है।\n\nकृषि निदेशक ने बताया कि पारंपरिक रसायनों के स्थान पर जैविक खादों के उपयोग से न केवल मिट्टी की उर्वरता में सुधार हो रहा है, बल्कि उत्पादन लागत में 40% तक की भारी गिरावट आई है। किसानों के उत्पादों को सीधे महानगरों के बाजारों में प्रीमियम भाव पर बेचने के लिए विशेष किसान उत्पादक संगठन (FPO) बनाए जा रहे हैं।',
          byline: 'कृषि विशेषज्ञ, राधेश्याम शर्मा',
          dateline: 'कृषि भवन —',
          kickerText: 'खेत-खलिहान से बड़ी खबर',
          imageUrl: ORGANIC_FARM_DATA_URI,
          imageCaption:
            'प्राकृतिक खेती के तहत लहलहाती फसल का निरीक्षण करते प्रगतिशील कृषक और कृषि अधिकारी।',
          imageCredit: 'कृषि संदेश छाया',
          imagePlacement: 'top',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
          },
        }),
        // Row 1: Mandi Bhav Live Wholesale Rates Box (colSpan 4)
        parseArticle({
          id: makeId('art-mandi-bhav'),
          elementType: 'short-news',
          headline: 'प्रमुख कृषि मंडी भाव (आज के भाव प्रति क्विंटल)',
          subheadline: 'मंडी समिति द्वारा प्रमाणित ताजा थोक भाव',
          body: '• गेहूं (कनक): ₹2,450 – ₹2,620\n• सरसों (कंडीशन): ₹5,400 – ₹5,680\n• चना (देसी): ₹5,850 – ₹6,100\n• मूंग (चमकी): ₹7,800 – ₹8,250\n• सोयाबीन: ₹4,300 – ₹4,650\n• ग्वार (गम): ₹4,900 – ₹5,150\n• जीरा (उंझा क्वालिटी): ₹24,000 – ₹27,500',
          byline: 'मंडी विश्लेषक',
          columnSpan: 4,
          priority: 'major',
          backgroundColor: '#f0fdf4',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
            left: { width: 1.5, style: 'solid', color: '#166534' },
            right: { width: 1.5, style: 'solid', color: '#166534' },
            top: { width: 1.5, style: 'solid', color: '#166534' },
          },
          paddingPx: 8,
        }),
        // Row 2: Irrigation Subsidy (colSpan 4)
        parseArticle({
          id: makeId('art-irrigation'),
          elementType: 'block',
          headline:
            'ड्रिप और फव्वारा सिंचाई संयंत्रों पर 70% सरकारी सब्सिडी, ऑनलाइन आवेदन प्रक्रिया शुरू',
          subheadline:
            'भूजल संरक्षण और कम पानी में दोगुनी फसल पैदावार के लिए किसानों को विशेष प्रोत्साहन',
          body: 'उद्यानिकी विभाग ने बताया कि सौर पंप और ड्रिप सिंचाई प्रणाली लगाने के इच्छुक कृषक ई-मित्र अथवा विभागीय पोर्टल पर खतौनी और आधार कार्ड के साथ आवेदन जमा कर सकते हैं। पहले आओ-पहले पाओ के आधार पर स्वीकृति पत्र जारी होंगे।',
          byline: 'सिंचाई एवं जल संसाधन डेस्क',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
          },
        }),
        // Row 2: Animal Husbandry & Dairy (colSpan 4)
        parseArticle({
          id: makeId('art-dairy'),
          elementType: 'block',
          headline: 'पशुधन विकास योजना: दुधारू पशुओं के लिए 4% रियायती ब्याज दर पर ऋण सुविधा',
          subheadline: 'पशु बीमा और निःशुल्क टीकाकरण अभियान में 1.2 लाख पशुपालकों का पंजीकरण',
          body: 'पशुपालन विभाग ने देशी नस्ल की गायों और भैंसों के संरक्षण हेतु नई क्रेडिट गारंटी योजना शुरू की है। दुग्ध उत्पादक सहकारी समितियों के माध्यम से प्रति लीटर दूध पर ₹5 बोनस भी दिया जा रहा है।',
          byline: 'पशुपालन ब्यूरो',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
          },
        }),
        // Row 2: Gram Panchayat Water Conservation (colSpan 4)
        parseArticle({
          id: makeId('art-panchayat'),
          elementType: 'block',
          headline: 'ग्राम सभा में जल संरक्षण व ठोस कचरा प्रबंधन प्रस्ताव सर्वसम्मति से पारित',
          subheadline:
            'प्रत्येक गांव में सामुदायिक वर्मीकंपोस्ट खाद गड्ढे और सोखता गड्ढों का निर्माण',
          body: 'पंचायती राज विभाग की विशेष बैठक में ग्रामीणों ने अपने-अपने गांवों को आदर्श कचरा-मुक्त पंचायत बनाने का संकल्प लिया। खेतों में फसल अवशेष न जलाने वाले किसानों को ग्राम पंचायत सम्मानित करेगी।',
          byline: 'चौपाल प्रतिनिधि',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
          },
        }),
        // Row 3: Scientist Advisory (colSpan 8)
        parseArticle({
          id: makeId('art-agro-advisory'),
          elementType: 'block',
          headline:
            'कृषि विज्ञान केंद्र द्वारा रबी फसलों में कीट नियंत्रण एवं उर्वरक प्रबंधन की विशेष सलाह',
          subheadline: 'मौसम में बदलाव को देखते हुए वैज्ञानिकों ने जारी की समसामयिक कृषि एडवाइजरी',
          body: '• गेहूं की फसल में पहली सिंचाई ताज मूल (CRI) अवस्था पर 21 दिन बाद अवश्य करें।\n• सरसों में चेपा (माहू) कीट के नियंत्रण हेतु जैविक नीम तेल (1500 पीपीएम) का 5 मिली प्रति लीटर पानी में घोल बनाकर छिड़काव करें।\n• चने की फसल में उकठा रोग की रोकथाम के लिए ट्राइकोडर्मा विरिडी जैव कवकनाशी का प्रयोग करें।\n• खेत की मेड़ों पर गेंदे के फूल लगाने से हानिकारक कीटों का प्राकृतिक नियंत्रण होता है।',
          byline: 'डॉ. एम. एल. जाट, मुख्य कृषि वैज्ञानिक',
          columnSpan: 8,
          priority: 'minor',
          backgroundColor: '#f0fdf4',
          borders: {
            top: { width: 1.5, style: 'solid', color: '#15803d' },
            bottom: { width: 1.5, style: 'solid', color: '#15803d' },
          },
          paddingPx: 8,
        }),
        // Row 3: Certified Seeds & Bio-Fertilizers Notice Box (colSpan 4)
        parseArticle({
          id: makeId('art-krishi-ad'),
          elementType: 'block',
          headline: 'प्रमाणित हाइब्रिड बीज एवं जैविक खाद भंडार',
          subheadline: 'राष्ट्रीय बीज निगम (NSC) अधिकृत डीलर',
          body: '• उन्नत किस्म के गेहूं (HD-3226, DBW-187), चना एवं सरसों बीज उपलब्ध।\n• प्रमाणित वर्मीकंपोस्ट, नीम खली एवं सूक्ष्म पोषक तत्व थोक भाव पर।\n• पता: किसान सेवा केंद्र, मुख्य अनाज मंडी परिसर।\n• मोबाइल: 94140-12345 / 98290-67890',
          byline: 'व्यावसायिक सूचना',
          columnSpan: 4,
          priority: 'minor',
          backgroundColor: '#fefce8',
          borders: {
            top: { width: 1.5, style: 'solid', color: '#ca8a04' },
            bottom: { width: 1.5, style: 'solid', color: '#ca8a04' },
            left: { width: 1.5, style: 'solid', color: '#ca8a04' },
            right: { width: 1.5, style: 'solid', color: '#ca8a04' },
          },
          paddingPx: 8,
        }),
      ];

      return makeDoc(
        docId,
        'किसान संदेश',
        '28 अक्टूबर 2026',
        'broadsheet',
        parseMasthead({
          title: 'किसान संदेश',
          tagline: 'खेत-खलिहान से चौपाल तक • अन्नदाता का सच्चा मार्गदर्शक',
          subtitle: 'कृषि तकनीक, मंडी भाव, जैविक खेती और पशुपालन साप्ताहिक',
          establishmentYear: '1985',
          fontFamily: "'Noto Serif Devanagari', serif",
          fontSizePt: 52,
          alignment: 'center',
          ruleStyle: 'classic-double',
          titleColor: '#14532d',
          taglineColor: '#166534',
          borderColor: '#15803d',
          emblem: 'quill',
          showEmblem: true,
          weatherCity: 'क्षेत्रीय मौसम केंद्र',
          temperature: '24°C',
          weatherCondition: 'हल्की धूप',
          airQuality: 'AQI 65 • शुद्ध हवा',
          price: 'मूल्य ₹3.00',
          postalRegNumber: 'पंजीयन सं. KRISHI-112/2026',
          pageCountLabel: 'पृष्ठ 8',
          dayOfWeek: 'बुधवार',
          date: '28 अक्टूबर 2026',
          volumeYear: 'वर्ष 41',
          issueNumber: 'अंक 205',
          leftSlot: {
            enabled: true,
            type: 'text',
            title: 'किसान हेल्पलाइन',
            subtitle: 'टोल फ्री',
            text: '1800-180-1551',
            widthPx: 130,
            heightPx: 58,
            border: true,
            borderColor: '#86efac',
            backgroundColor: '#f0fdf4',
            textColor: '#14532d',
          },
          rightSlot: {
            enabled: true,
            type: 'text',
            title: 'जैविक मिशन',
            subtitle: 'प्राकृतिक खेती',
            text: 'धरती बचाएं',
            widthPx: 130,
            heightPx: 58,
            border: true,
            borderColor: '#86efac',
            backgroundColor: '#f0fdf4',
            textColor: '#14532d',
          },
          showTopStrip: true,
          showWeather: true,
          showPrice: true,
          showBottomStrip: true,
          showVolumeIssue: true,
          showDate: true,
          showEdition: true,
        }),
        {
          presetId: 'classic-hindi-broadsheet',
          columnCount: 12,
          columnRule: true,
          columnRuleStyle: 'solid',
          mastheadFont: "'Noto Serif Devanagari', serif",
          headlineFont: "'Noto Serif Devanagari', serif",
          subheadlineFont: "'Noto Serif Devanagari', serif",
          bodyFont: "'Noto Serif Devanagari', serif",
          headlineWeight: 700,
          bodyFontSizePt: 10,
          spacingDensity: 'normal',
          showFooter: true,
          footerText: 'किसान संदेश • गांव-गांव खुशहाली • www.kisansandesh.org',
        },
        articles
      );
    },
  },

  // =========================================================================
  // 5. चुनावी हलचल महा-विशेषांक (Election Special Edition) — DEF-03 & NP-005
  // =========================================================================
  {
    id: 'tpl-election-special',
    name: 'चुनावी हलचल महा-विशेषांक (Election Special Edition)',
    category: 'election',
    tagline: 'मतदाता जागरूकता, चुनावी समीकरण, ओपिनियन पोल और जनमत संग्रह',
    description:
      'भव्य चुनावी रिपोर्टिंग लेआउट: राष्ट्रीय तिरंगा एक्सेंट, शीर्ष महा-सुर्खी, सीट-वार विश्लेषण और चुनाव आयोग के दिशा-निर्देश।',
    pageSize: 'broadsheet',
    columnCount: 4,
    createDocument: () => {
      const docId = makeId('doc-election');
      const articles: Article[] = [
        // Row 1: Full-width Election Mandate Header Banner (colSpan 12)
        parseArticle({
          id: makeId('art-poll-flash'),
          elementType: 'top-headline',
          headline: 'विधानसभा आम चुनाव महा-कवरेज: जनादेश 2026 (MANDATE 2026)',
          subheadline:
            '230 सदस्यीय विधानसभा के ऐतिहासिक परिणाम: जनता ने स्थिरता और सर्वांगीण विकास के पक्ष में दिया स्पष्ट जनादेश',
          body: 'मतदाताओं की स्पष्ट राय है कि बुनियादी विकास, सुशासन और रोजगार ही निर्णायक सिद्ध हुए हैं।',
          kickerText: 'विशेष चुनावी परिणाम संस्करण (ELECTION RESULT SPECIAL)',
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          customColors: {
            headlineColor: '#ffffff',
            subheadlineColor: '#fde047',
            kickerColor: '#38bdf8',
          },
          columnSpan: 12,
          priority: 'lead',
          paddingPx: 8,
        }),
        // Row 2: Victory Lead Story with Authentic Celebration Photo (colSpan 8)
        parseArticle({
          id: makeId('art-mandate-lead'),
          elementType: 'block',
          headline:
            'जनादेश 2026: विकास और सुशासन के नाम पर प्रचंड बहुमत, 148 सीटें जीतकर रचा नया इतिहास',
          subheadline:
            'सत्ताधारी गठबंधन को मिली ऐतिहासिक विजय; विपक्ष 72 सीटों पर सिमटा, निर्दलियों की झोली में गईं 10 सीटें',
          body: 'राजधानी — राज्य विधानसभा के आम चुनाव परिणामों में सत्तारूढ़ गठबंधन ने सभी राजनीतिक पंडितों के अनुमानों को पीछे छोड़ते हुए 230 में से 148 सीटों पर प्रचंड बहुमत हासिल किया है।\n\nचुनाव आयोग द्वारा घोषित अंतिम आंकड़ों के अनुसार, ग्रामीण अंचलों में भारी मतदान और महिला सशक्तिकरण की योजनाओं ने जीत की पटकथा लिखी। विजय के बाद नवनिर्वाचित विधायक दल के नेता ने प्रेस वार्ता में कहा, "यह जीत राज्य के हर एक नागरिक के भरोसे और परिश्रम की जीत है। हमारी प्राथमिकता घोषणापत्र के प्रत्येक संकल्प को समयबद्ध रूप से पूरा करने की होगी।"',
          byline: 'विशेष राजनीतिक संवाददाता',
          dateline: 'राजधानी —',
          kickerText: 'ऐतिहासिक जनादेश',
          imageUrl: ELECTION_VICTORY_DATA_URI,
          imageCaption:
            'ऐतिहासिक जीत के बाद नई दिल्ली पार्टी मुख्यालय में कार्यकर्ताओं और मीडिया का अभिवादन करते नवनिर्वाचित विधायक दल के नेता।',
          imageCredit: 'विशेष चुनावी फोटो डेस्क',
          imagePlacement: 'top',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 2: Visual Seat Tally Box (colSpan 4)
        parseArticle({
          id: makeId('art-seat-tally'),
          elementType: 'short-news',
          headline: 'विधानसभा दलीय स्थिति (Seat Tally 2026)',
          subheadline: 'कुल सीटें: 230 • बहुमत का आंकड़ा: 116',
          body: '• एनडीए (NDA): 148 सीटें [प्रचंड बहुमत (+32)]\n  वोट शेयर: 46.2% | ग्रामीण 92, शहरी 56\n\n• इंडिया गठबंधन (INDIA): 72 सीटें [प्रमुख विपक्ष (-26)]\n  वोट शेयर: 38.5% | ग्रामीण 48, शहरी 24\n\n• अन्य एवं निर्दलीय (Others): 10 सीटें [-6]\n  वोट शेयर: 15.3% | बागी उम्मीदवारों का प्रभाव',
          byline: 'चुनाव डेटा प्रकोष्ठ',
          columnSpan: 4,
          priority: 'major',
          backgroundColor: '#f8fafc',
          borders: {
            top: { width: 2, style: 'solid', color: '#1e3a8a' },
            bottom: { width: 2, style: 'solid', color: '#1e3a8a' },
            left: { width: 2, style: 'solid', color: '#1e3a8a' },
            right: { width: 2, style: 'solid', color: '#1e3a8a' },
          },
          paddingPx: 8,
        }),
        // Row 3: VIP Constituencies Trends & Shifts (colSpan 4)
        parseArticle({
          id: makeId('art-vip-seats'),
          elementType: 'block',
          headline:
            'वीआईपी सीटों के रुझान: 14 मंत्रियों की जीत, 3 पूर्व दिग्गजों की अप्रत्याशित हार',
          subheadline:
            'कड़े मुकाबलों में अंतिम राउंड तक सांसें रोके रहा रोमांच; युवा चेहरों ने दिखाया दम',
          body: 'हाई-प्रोफाइल निर्वाचन क्षेत्रों में मतदाताओं ने चौंकाने वाले फैसले दिए हैं। पुराने दिग्गज नेताओं को पछाड़ते हुए कई युवा प्रत्याशियों ने 15,000 से अधिक मतों के अंतर से जीत दर्ज की है।',
          byline: 'राजनीतिक विश्लेषक',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 3: Women Voters Record Turnout (colSpan 4)
        parseArticle({
          id: makeId('art-women-voters'),
          elementType: 'block',
          headline: 'महिला मतदाताओं ने रचा नया कीर्तिमान: 79.4% रिकॉर्ड मतदान से तय हुई जीत',
          subheadline: 'ग्रामीण महिलाओं की लंबी कतारों ने बदला सियासी समीकरण, लाडली योजनाओं का असर',
          body: 'राज्य के चुनावी इतिहास में पहली बार महिला मतदान प्रतिशत पुरुषों से 3.2% अधिक रहा। जानकारों का मानना है कि कन्या शिक्षा, पोषण और स्वयं सहायता समूहों को मिले संबल ने परिणाम में निर्णायक भूमिका निभाई।',
          byline: 'जनमत सांख्यिकी डेस्क',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 3: Election Commission Briefing (colSpan 4)
        parseArticle({
          id: makeId('art-eci-briefing'),
          elementType: 'block',
          headline: 'मुख्य निर्वाचन अधिकारी ने शांतिपूर्ण मतदान के लिए मतदाताओं का जताया आभार',
          subheadline:
            'cVIGIL ऐप पर प्राप्त 4,200 शिकायतों का औसतन 42 मिनट में हुआ त्वरित निस्तारण',
          body: 'निर्वाचन भवन में आयोजित संवाददाता सम्मेलन में आयोग ने बताया कि सभी 52,000 मतदान केंद्रों पर वेबकास्टिंग और केंद्रीय बलों की निगरानी से चुनाव पूर्णतः निष्पक्ष व पारदर्शी संपन्न हुआ।',
          byline: 'चुनाव ब्यूरो',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        // Row 4: Authoritative Editorial Perspective (colSpan 12)
        parseArticle({
          id: makeId('art-editorial-vote'),
          elementType: 'block',
          headline:
            'संपादकीय दृष्टिकोण: जनादेश का स्पष्ट संदेश — वादों की पूर्ति, पारदर्शिता और जवाबदेही की अपेक्षा',
          subheadline:
            'लोकतंत्र की वास्तविक जीत तभी संभव है जब सत्ताधारी दल और सशक्त विपक्ष जनहित में मिलकर काम करें',
          body: 'इस ऐतिहासिक चुनाव में जनता ने संकीर्ण मुद्दों और नकारात्मक राजनीति को सिरे से नकारते हुए विकास, स्थिरता और पारदर्शी शासन के पक्ष में अपना मत दिया है। अब नव-निर्वाचित सरकार का यह प्राथमिक दायित्व है कि वह युवाओं के लिए रोजगार, किसानों के लिए उपज के उचित मूल्य और आम नागरिकों के लिए सुलभ स्वास्थ्य-शिक्षा के संकल्प को धरातल पर उतारे। एक सजग नागरिक ही लोकतंत्र का सच्चा प्रहरी है।',
          byline: 'प्रधान संपादक',
          columnSpan: 12,
          priority: 'minor',
          backgroundColor: '#f1f5f9',
          borders: {
            top: { width: 1.5, style: 'solid', color: '#334155' },
            bottom: { width: 1.5, style: 'solid', color: '#334155' },
          },
          paddingPx: 8,
        }),
      ];

      return makeDoc(
        docId,
        'जनमत दर्पण',
        '28 अक्टूबर 2026',
        'broadsheet',
        parseMasthead({
          title: 'जनमत दर्पण',
          tagline: 'जनता का फैसला • लोकतंत्र की निष्पक्ष और निर्भीक पड़ताल',
          subtitle: 'विधानसभा एवं संसदीय निर्वाचन विशेष कवरेज संस्करण',
          establishmentYear: '1962',
          fontFamily: "'Rozha One', serif",
          fontSizePt: 54,
          alignment: 'center',
          ruleStyle: 'oxford-thick-thin',
          emblem: 'ashoka-chakra',
          showEmblem: true,
          weatherCity: 'मतदाता हेल्पलाइन: 1950',
          temperature: 'जागरूक नागरिक',
          weatherCondition: 'शत-प्रतिशत मतदान',
          airQuality: 'संवैधानिक दायित्व',
          price: 'मूल्य ₹5.00',
          postalRegNumber: 'पंजीयन सं. ELEC-2026/01',
          pageCountLabel: 'विशेषांक 16 पृष्ठ',
          dayOfWeek: 'बुधवार',
          date: '28 अक्टूबर 2026',
          volumeYear: 'वर्ष 64',
          issueNumber: 'विशेष अंक 9',
          showTopStrip: true,
          showWeather: true,
          showPrice: true,
          showBottomStrip: true,
          showVolumeIssue: true,
          showDate: true,
          showEdition: true,
        }),
        {
          presetId: 'classic-hindi-broadsheet',
          columnCount: 12,
          columnRule: true,
          columnRuleStyle: 'solid',
          mastheadFont: "'Rozha One', serif",
          headlineFont: "'Noto Serif Devanagari', serif",
          subheadlineFont: "'Noto Serif Devanagari', serif",
          bodyFont: "'Noto Serif Devanagari', serif",
          headlineWeight: 700,
          bodyFontSizePt: 10,
          spacingDensity: 'normal',
          showFooter: true,
          footerText: 'जनमत दर्पण • निष्पक्ष मतदान • जागरूक मतदाता • सशक्त लोकतंत्र',
        },
        articles
      );
    },
  },
];
