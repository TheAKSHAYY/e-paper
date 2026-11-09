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
  // 1. राष्ट्रीय मुख्य ब्रॉडशीट (National Broadsheet)
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
        parseArticle({
          id: makeId('art-lead'),
          elementType: 'block',
          headline:
            'वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच स्वच्छ ऊर्जा गलियारे पर ऐतिहासिक समझौता',
          subheadline:
            'चार महाद्वीपों में निर्बाध सौर व पवन ऊर्जा आपूर्ति के लिए साझा अंतरमहाद्वीपीय ग्रिड मानक तैयार',
          body: 'जिनेवा — लगातार छह दिनों तक चली गहन वार्ताओं के उपरांत 68 राष्ट्रों के ऊर्जा मंत्रियों ने अंतरराष्ट्रीय हरित ग्रिड समझौते पर ऐतिहासिक हस्ताक्षर किए।\n\nइस दूरगामी समझौते के अंतर्गत उच्च वोल्टेज डायरेक्ट करंट (HVDC) गलियारों का एक अंतरमहाद्वीपीय नेटवर्क तैयार किया जाएगा। समझौते के लागू होने से सौर व पवन ऊर्जा की अतिरिक्त आपूर्ति को उन क्षेत्रों तक तत्काल भेजा जा सकेगा जहां मांग अधिक है।\n\nभारतीय प्रतिनिधिमंडल के प्रमुख ने कहा, "आज ऊर्जा आत्मनिर्भरता और जलवायु संरक्षण की दिशा में एक क्रांतिकारी शुरुआत हुई है। अब प्राकृतिक ऊर्जा स्रोतों की सीमाएं भौगोलिक बंधनों से परे होंगी।"',
          byline: 'विशेष संवाददाता, जिनेवा ब्यूरो',
          dateline: 'जिनेवा —',
          kickerText: 'ऐतिहासिक अंतरराष्ट्रीय घोषणा',
          imageUrl:
            'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
          imageCaption:
            'शिखर सम्मेलन के समापन सत्र में समझौता दस्तावेज प्रस्तुत करते अंतरराष्ट्रीय प्रतिनिधि।',
          imagePlacement: 'top',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        parseArticle({
          id: makeId('art-space'),
          elementType: 'block',
          headline: 'भारतीय अंतरिक्ष अनुसंधान: गगनयान-2 मिशन के क्रायोजेनिक चरण का सफल परीक्षण',
          subheadline: 'स्वदेशी तकनीक से तैयार रॉकेट इंजन ने उच्च दबाव मानकों को प्राप्त किया',
          body: 'श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान केंद्र ने आज सुबह स्वदेशी क्रायोजेनिक इंजन के उच्च-दबाव प्रज्वलन परीक्षण को सफलतापूर्वक संपन्न किया।\n\nइस महत्वपूर्ण चरण की सफलता से आगामी मानव अंतरिक्ष उड़ान के लिए मार्ग प्रशस्त हो गया है। वैज्ञानिकों ने बताया कि इंजन का प्रदर्शन निर्धारित मापदंडों से भी अधिक सटीक रहा।',
          byline: 'विज्ञान प्रतिनिधि',
          dateline: 'श्रीहरिकोटा —',
          kickerText: 'अंतरिक्ष में नया कीर्तिमान',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        parseArticle({
          id: makeId('art-agri'),
          elementType: 'block',
          headline: 'डिजिटल कृषि और उपग्रह मौसम निगरानी से रबी फसलों की बंपर पैदावार का अनुमान',
          subheadline: 'सटीक बारिश और तापमान पूर्वानुमान से किसानों की लागत में भारी कमी',
          body: 'नई दिल्ली — कृषि मंत्रालय द्वारा जारी ताजा आंकड़ों के अनुसार देश के उत्तरी और मध्य मैदानी भागों में गेहूं तथा दलहन की बुवाई ने पिछले सभी रिकॉर्ड तोड़ दिए हैं।\n\nसटीक मौसम पूर्वानुमान और उपग्रह आधारित सिंचाई परामर्श से किसानों की लागत में उल्लेखनीय कमी दर्ज की गई है। कृषि विशेषज्ञों का मानना है कि इस वर्ष खाद्यान्न उत्पादन में एक ऐतिहासिक नया कीर्तिमान स्थापित होगा।',
          byline: 'कृषि एवं ग्रामीण विकास डेस्क',
          dateline: 'नई दिल्ली —',
          columnSpan: 7,
          priority: 'major',
        }),
        parseArticle({
          id: makeId('art-brief'),
          elementType: 'short-news',
          headline: 'प्रादेशिक एवं नगर समाचार संक्षेप',
          subheadline: 'परिवहन, शिक्षा, संस्कृति और पर्यावरण से जुड़े संक्षिप्त समाचार',
          body: '• मेट्रो विस्तार परियोजना के तीसरे चरण को मिली अंतिम पर्यावरणीय मंजूरी; निर्माण कार्य शीघ्र प्रारंभ होगा।\n• राष्ट्रीय पुस्तक मेले में भारतीय भाषाओं की कृतियों के लिए विशेष दालान का उद्घाटन।\n• यमुना नदी के तटीय क्षेत्रों में जैव विविधता पार्क के संरक्षण हेतु नागरिकों का अनूठा श्रमदान अभियान।',
          byline: 'कार्यालय प्रतिनिधि',
          columnSpan: 5,
          priority: 'minor',
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
  // 2. जिला परिषद दैनिक (District Gazette)
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
        parseArticle({
          id: makeId('art-dist-lead'),
          elementType: 'block',
          headline:
            'जिला परिषद की वार्षिक विकास योजना मंजूर: 142 ग्राम पंचायतों में सड़क, पेयजल और सौर ऊर्जा का विस्तार',
          subheadline:
            'सदन में 180 करोड़ रुपये के बजट का अनुमोदन; ग्रामीण स्वास्थ्य केंद्रों पर नए उपकरण लगाए जाएंगे',
          body: 'जिला मुख्यालय — जिला परिषद सभागार में आयोजित त्रिमासिक साधारण सभा में वित्तीय वर्ष के विकास बजट को सर्वसम्मति से मंजूरी प्रदान कर दी गई।\n\nजिला प्रमुख ने बताया कि इस वर्ष प्राथमिकता के आधार पर दूरदराज की ढाणियों को मुख्य पक्की सड़कों से जोड़ा जाएगा और प्रत्येक गांव में हर घर नल से जल पहुंचाने के काम में तेजी लाई जाएगी। साथ ही 45 प्राथमिक विद्यालयों में स्मार्ट क्लासरूम स्थापित किए जाएंगे।',
          byline: 'प्रशासनिक संवाददाता',
          dateline: 'जिला मुख्यालय —',
          kickerText: 'विकास की नई गति',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        parseArticle({
          id: makeId('art-collector'),
          elementType: 'block',
          headline:
            'कलेक्टर का कड़ा निर्देश: समर्थन मूल्य खरीद केंद्रों पर किसानों को न हो कोई असुविधा',
          subheadline: 'बारदाने की पर्याप्त उपलब्धता और 72 घंटे में भुगतान सुनिश्चित करने के आदेश',
          body: 'जिला कलेक्ट्रेट — जिला मजिस्ट्रेट ने रबी विपणन सत्र के तहत सभी उपखंड अधिकारियों और मंडी सचिवों को खरीद केंद्रों का औचक निरीक्षण करने के सख्त आदेश दिए हैं।\n\nउन्होंने स्पष्ट किया कि तौल में किसी भी प्रकार की गड़बड़ी पाए जाने पर संबंधित फर्म व अधिकारी के खिलाफ तत्काल प्राथमिकी दर्ज कराई जाएगी।',
          byline: 'कलेक्ट्रेट प्रतिनिधि',
          dateline: 'मुख्यालय —',
          kickerText: 'प्रशासनिक समीक्षा',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        parseArticle({
          id: makeId('art-lake'),
          elementType: 'block',
          headline: 'अमृत सरोवर योजना: जिले के 34 ऐतिहासिक जलाशयों और बावड़ियों का कायाकल्प पूरा',
          subheadline: 'पारंपरिक जल स्रोतों के पुनर्जीवन से भूजल स्तर में 2 मीटर तक का सुधार दर्ज',
          body: 'भूजल संरक्षण विभाग द्वारा जारी रिपोर्ट के अनुसार जिले के ग्रामीण अंचलों में मनरेगा और जनसहयोग से विकसित किए गए अमृत सरोवरों ने इस वर्ष मानसूनी जल संचयन में उत्कृष्ट भूमिका निभाई है। ग्रामीणों ने इन सरोवरों के तट पर पौधारोपण कर पर्यावरण सुरक्षा का संकल्प लिया है।',
          byline: 'ग्रामीण विकास डेस्क',
          columnSpan: 6,
          priority: 'major',
        }),
        parseArticle({
          id: makeId('art-health'),
          elementType: 'block',
          headline: 'सामुदायिक स्वास्थ्य केंद्रों पर निःशुल्क डिजिटल टेली-मेडिसिन परामर्श कल से',
          subheadline:
            'एम्स और मेडिकल कॉलेज के विशेषज्ञ डॉक्टर ग्रामीण मरीजों को देंगे ऑनलाइन सलाह',
          body: 'मुख्य चिकित्सा एवं स्वास्थ्य अधिकारी (CMHO) ने बताया कि ग्रामीण क्षेत्रों के मरीजों को बड़े शहरों में जाने की आवश्यकता न पड़े, इसके लिए सभी 8 सामुदायिक केंद्रों को हाई-स्पीड ब्रॉडबैंड नेटवर्क से जोड़ दिया गया है।',
          byline: 'स्वास्थ्य प्रतिनिधि',
          columnSpan: 6,
          priority: 'major',
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
  // 3. प्रभात जागरण एक्सप्रेस (Morning Express)
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
        parseArticle({
          id: makeId('art-flash'),
          elementType: 'top-headline',
          headline:
            'एक्सप्रेसवे कॉरिडोर को कैबिनेट की अंतिम मंजूरी: राजधानी से व्यापारिक केंद्र की दूरी अब मात्र 4 घंटे',
          subheadline:
            '6-लेन ग्रीनफील्ड परियोजना पर अगले माह से भूमि अधिग्रहण और निर्माण शुरू होगा',
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
          paddingPx: 10,
        }),
        parseArticle({
          id: makeId('art-sports'),
          elementType: 'block',
          headline: 'राज्य स्तरीय युवा खेल महोत्सव में 4,500 एथलीटों ने दिखाया दमखम',
          subheadline: 'एथलेटिक्स और कुश्ती प्रतियोगिताओं में ग्रामीण प्रतिभाओं का शानदार प्रदर्शन',
          body: 'महानगर स्पोर्ट्स स्टेडियम — तीन दिवसीय राज्य युवा खेल महोत्सव के उद्घाटन समारोह में रंगारंग सांस्कृतिक प्रस्तुतियों के साथ खिलाड़ियों ने मार्च पास्ट किया।\n\nखेल मंत्री ने युवा खिलाड़ियों को प्रोत्साहित करते हुए कहा कि पदक विजेता युवाओं को सीधे सरकारी सेवाओं में नियुक्ति दी जाएगी।',
          byline: 'खेल डेस्क',
          dateline: 'महानगर —',
          imageUrl:
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
          imageCaption: 'उद्घाटन समारोह में मशाल प्रज्वलित कर खेल भावना की शपथ लेते युवा खिलाड़ी।',
          imagePlacement: 'top',
          columnSpan: 8,
          priority: 'major',
        }),
        parseArticle({
          id: makeId('art-metro'),
          elementType: 'block',
          headline: 'मेट्रो के भूमिगत रूट का सफल ट्रायल रन, जल्द होगा शुभारंभ',
          subheadline: 'पुराने शहर के व्यस्त बाज़ारों को मिलेगी भीषण ट्रैफिक जाम से राहत',
          body: 'मेट्रो रेल कॉर्पोरेशन ने ऐतिहासिक शहर के नीचे 8 किलोमीटर लंबे भूमिगत खंड पर 80 किमी प्रति घंटे की गति से मेट्रो ट्रेन का सफल ट्रायल पूरा कर लिया है। सुरक्षा आयुक्त की अंतिम रिपोर्ट मिलते ही आम जनता के लिए यात्री सेवाएं शुरू कर दी जाएंगी।',
          byline: 'नगर प्रतिनिधि',
          columnSpan: 4,
          priority: 'minor',
        }),
        parseArticle({
          id: makeId('art-city-briefs'),
          elementType: 'short-news',
          headline: 'आज शहर में क्या है खास (City Highlights)',
          subheadline: 'नागरिक सूचनाएं, बिजली कटौती और सांस्कृतिक कार्यक्रम',
          body: '• टाउन हॉल में अंतर-महाविद्यालय वाद-विवाद प्रतियोगिता सुबह 11 बजे से।\n• सिविल लाइंस क्षेत्र में विद्युत लाइन मरम्मत के कारण दोपहर 1 से 3 बजे तक आपूर्ति बाधित रहेगी।\n• गांधी संग्रहालय में दुर्लभ ऐतिहासिक छायाचित्रों की पांच दिवसीय प्रदर्शनी का शुभारंभ।',
          byline: 'सिटी रिपोर्टर',
          columnSpan: 12,
          priority: 'minor',
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
  // 4. कृषि एवं ग्रामीण संदेश (Agriculture & Rural Weekly)
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
        parseArticle({
          id: makeId('art-krishi-lead'),
          elementType: 'block',
          headline:
            'प्राकृतिक व जैविक खेती को महा-प्रोत्साहन: राज्य के 50,000 किसानों को मिलेगा निःशुल्क प्रमाणीकरण',
          subheadline:
            'गो-आधारित खाद बनाने और जीवामृत इकाइयों की स्थापना के लिए सीधे बैंक खाते में पहुंचेगा अनुदान',
          body: 'कृषि भवन — कृषि विभाग ने राज्य में जैविक और प्राकृतिक खेती के रकबे को दोगुना करने के लिए एक महत्वाकांक्षी कार्ययोजना की घोषणा की है।\n\nकृषि निदेशक ने बताया कि पारंपरिक रसायनों के स्थान पर जैविक खादों के उपयोग से न केवल मिट्टी की उर्वरता में सुधार हो रहा है, बल्कि उत्पादन लागत में 40% तक की भारी गिरावट आई है। किसानों के उत्पादों को सीधे महानगरों के बाजारों में प्रीमियम भाव पर बेचने के लिए विशेष किसान उत्पादक संगठन (FPO) बनाए जा रहे हैं।',
          byline: 'कृषि विशेषज्ञ, राधेश्याम शर्मा',
          dateline: 'कृषि भवन —',
          kickerText: 'खेत-खलिहान से बड़ी खबर',
          columnSpan: 8,
          priority: 'lead',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
          },
        }),
        parseArticle({
          id: makeId('art-mandi-bhav'),
          elementType: 'short-news',
          headline: 'प्रमुख कृषि मंडी भाव (आज के भाव प्रति क्विंटल)',
          subheadline: 'मंडी समिति द्वारा प्रमाणित ताजा थोक भाव',
          body: '• गेहूं (कनक): ₹2,450 – ₹2,620\n• सरसों (कंडीशन): ₹5,400 – ₹5,680\n• चना (देसी): ₹5,850 – ₹6,100\n• मूंग (चमकी): ₹7,800 – ₹8,250\n• सोयाबीन: ₹4,300 – ₹4,650\n• ग्वार: ₹4,900 – ₹5,150',
          byline: 'मंडी विश्लेषक',
          columnSpan: 4,
          priority: 'major',
          backgroundColor: '#f0fdf4',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#166534' },
          },
        }),
        parseArticle({
          id: makeId('art-irrigation'),
          elementType: 'block',
          headline:
            'ड्रिप और फव्वारा सिंचाई संयंत्रों पर 70% सरकारी सब्सिडी, ऑनलाइन आवेदन प्रक्रिया शुरू',
          subheadline:
            'भूजल संरक्षण और कम पानी में दोगुनी फसल पैदावार के लिए किसानों को विशेष प्रोत्साहन',
          body: 'उद्यानिकी विभाग ने बताया कि सौर पंप और ड्रिप सिंचाई प्रणाली लगाने के इच्छुक कृषक ई-मित्र अथवा विभागीय पोर्टल पर खतौनी और आधार कार्ड के साथ आवेदन जमा कर सकते हैं। पहले आओ-पहले पाओ के आधार पर स्वीकृति पत्र जारी होंगे।',
          byline: 'सिंचाई एवं जल संसाधन डेस्क',
          columnSpan: 6,
          priority: 'major',
        }),
        parseArticle({
          id: makeId('art-weather-alert'),
          elementType: 'block',
          headline:
            'मौसम चेतावनी: पश्चिमी विक्षोभ के चलते उत्तरी मैदानी भागों में हल्की वर्षा के आसार',
          subheadline:
            'मौसम विज्ञानियों की सलाह: कटाई के बाद खुले में रखे अनाज को सुरक्षित स्थानों पर ढकें',
          body: 'मौसम विज्ञान केंद्र ने आगामी 48 घंटों में बादलों की आवाजाही और तेज हवाओं के साथ छिटपुट बूंदाबांदी का अलर्ट जारी किया है। कृषि विशेषज्ञों ने किसानों को तैयार फसलों की थ्रेशिंग शीघ्र निपटाने और कटी हुई फसल को तिरपाल से ढकने का परामर्श दिया है।',
          byline: 'मौसम ब्यूरो',
          columnSpan: 6,
          priority: 'minor',
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
  // 5. चुनावी हलचल महा-विशेषांक (Election Special Edition)
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
        parseArticle({
          id: makeId('art-poll-flash'),
          elementType: 'top-headline',
          headline:
            'महा-ओपिनियन पोल: ग्रामीण क्षेत्रों में रोजगार और सड़क-पानी बना सबसे बड़ा निर्णायक चुनावी मुद्दा',
          subheadline:
            '50 विधानसभा क्षेत्रों के 1,20,000 मतदाताओं के विस्तृत सर्वेक्षण में विकास पर जोर; 78% नागरिक मतदान के लिए तत्पर',
          body: 'मतदाताओं की स्पष्ट राय है कि आगामी चुनाव में बुनियादी विकास और स्थानीय रोजगार ही निर्णायक सिद्ध होंगे।',
          kickerText: 'महा-सर्वेक्षण रिपोर्ट (GROUND OPINION POLL)',
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          customColors: {
            headlineColor: '#ffffff',
            subheadlineColor: '#f1f5f9',
            kickerColor: '#38bdf8',
          },
          columnSpan: 12,
          priority: 'lead',
          paddingPx: 10,
        }),
        parseArticle({
          id: makeId('art-eci-teams'),
          elementType: 'block',
          headline:
            'चुनाव आयोग की कड़ी निगरानी: निष्पक्ष मतदान के लिए 140 त्वरित प्रतिक्रिया टीमें तैनात',
          subheadline:
            'सीमावर्ती चेकपोस्ट पर 24 घंटे सघन वाहन चेकिंग और वेबकास्टिंग से जुड़े सभी संवेदनशील बूथ',
          body: 'निर्वाचन भवन — मुख्य निर्वाचन अधिकारी ने संवाददाता सम्मेलन में बताया कि आगामी मतदान को पूर्णतः शांतिपूर्ण और निष्पक्ष संपन्न कराने के लिए त्रिस्तरीय सुरक्षा व्यवस्था की गई है।\n\nसभी मतदान केंद्रों पर दिव्यांग मतदाताओं के लिए व्हीलचेयर, रैंप और पेयजल की समुचित व्यवस्था कर दी गई है। किसी भी प्रकार की शिकायत के लिए सी-विजिल (cVIGIL) मोबाइल ऐप पर 100 मिनट के भीतर कार्रवाई की जाएगी।',
          byline: 'मुख्य राजनीतिक संवाददाता',
          dateline: 'निर्वाचन भवन —',
          kickerText: 'आयोग की तैयारी',
          columnSpan: 8,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        parseArticle({
          id: makeId('art-youth-voters'),
          elementType: 'block',
          headline: 'प्रथम बार मतदान करने वाले 18 लाख युवा तय करेंगे नई सरकार की दिशा',
          subheadline: 'महाविद्यालयों में विशेष शपथ समारोह; डिजिटल अभियानों से जुड़ रहे नव-मतदाता',
          body: 'राज्य भर के युवा मतदाताओं में इस बार लोकतंत्र के महापर्व को लेकर अभूतपूर्व उत्साह देखा जा रहा है। रोजगार, उच्च शिक्षा और तकनीकी स्टार्टअप के अवसर युवाओं के प्रमुख सरोकार हैं।',
          byline: 'युवा मंच डेस्क',
          columnSpan: 4,
          priority: 'major',
          borders: {
            bottom: { width: 1.5, style: 'solid', color: '#111111' },
          },
        }),
        parseArticle({
          id: makeId('art-editorial-vote'),
          elementType: 'block',
          headline:
            'संपादकीय टिप्पणी: वोट केवल अधिकार नहीं, राष्ट्र निर्माण में सर्वोच्च नागरिक कर्तव्य है',
          subheadline:
            'जाति, धर्म और प्रलोभनों से परे रहकर योग्य एवं कर्मठ जनप्रतिनिधि का चुनाव करें',
          body: 'लोकतंत्र की वास्तविक शक्ति मतदाता की अंगुली पर लगी अमिट स्याही में निहित है। एक सजग और जागरूक मतदाता ही सशक्त राष्ट्र की नींव रखता है। अपने मत का उपयोग अवश्य करें।',
          byline: 'प्रधान संपादक',
          columnSpan: 12,
          priority: 'minor',
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
