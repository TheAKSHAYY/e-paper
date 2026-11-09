import type { EditorialPreset } from '@epaper-studio/document-schema';

export const ARTICLE_LAYOUT_PRESETS: EditorialPreset[] = [
  // 1. Hero Screamer 12-Column
  {
    id: 'art-hero-screamer-12',
    name: '12-कॉलम मुख्य महा-सुर्खी (Hero Screamer 12-Col)',
    category: 'block',
    description:
      'पूरे पृष्ठ की चौड़ाई वाला भव्य मुख्य समाचार, शीर्ष तस्वीर, किकर और बहु-कॉलम पाठ प्रवाह के साथ।',
    icon: '📰',
    defaultSpan: 12,
    isCustom: false,
    data: {
      elementType: 'block',
      headline:
        'संसद में ऐतिहासिक नीति पर मुहर: ग्रामीण विकास व किसान कल्याण के लिए विशेष आर्थिक पैकेज स्वीकृत',
      subheadline:
        'सभी वर्गों के प्रतिनिधियों ने किया सर्वसम्मति से समर्थन, देश भर में नई योजनाओं का व्यापक स्वागत',
      kickerText: 'ऐतिहासिक घोषणा • संसद विशेष',
      body: 'नई दिल्ली — संसद के विशेष सत्र में आज ग्रामीण भारत की अर्थव्यवस्था को गति देने के लिए एक ऐतिहासिक विधेयक पारित किया गया। इस योजना के तहत सिंचाई, कृषि उपकरण, और न्यूनतम समर्थन मूल्य की सुदृढ़ व्यवस्था सुनिश्चित की जाएगी।\n\nकेंद्रीय मंत्रियों ने सदन को संबोधित करते हुए कहा कि यह निर्णय देश के अन्नदाताओं की आय को सशक्त करने की दिशा में मील का पत्थर साबित होगा। उपग्रह आधारित मौसम पूर्वानुमान को भी इस योजना का अभिन्न हिस्सा बनाया गया है।',
      byline: 'विशेष संवाददाता',
      dateline: 'नई दिल्ली —',
      imageUrl:
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      imageCaption:
        'संसद भवन के बाहर नई नीति के पारित होने के बाद मीडिया से बातचीत करते केंद्रीय मंत्री व प्रतिनिधि।',
      imageCredit: 'छायाचित्र: विशेष छायाकार',
      imagePlacement: 'top',
      columnSpan: 12,
      priority: 'lead',
      borders: {
        bottom: { width: 1.5, style: 'solid', color: '#111111' },
      },
    },
  },

  // 2. Two-Column Anchor
  {
    id: 'art-two-col-anchor',
    name: '2-कॉलम संतुलित एंकर (Two-Column Anchor)',
    category: 'block',
    description:
      'मध्यम आकार की विस्तृत रिपोर्ट, पार्श्व तस्वीर (Side Photo) और संतुलित पैराग्राफ संरचना।',
    icon: '📑',
    defaultSpan: 6,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'भारतीय अंतरिक्ष अनुसंधान: गगनयान-2 मिशन के क्रायोजेनिक चरण का सफल परीक्षण',
      subheadline: 'स्वदेशी तकनीक से तैयार रॉकेट इंजन ने निर्धारित मानकों को प्राप्त किया',
      body: 'श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान केंद्र ने आज सुबह स्वदेशी क्रायोजेनिक इंजन के उच्च-दबाव प्रज्वलन परीक्षण को सफलतापूर्वक संपन्न किया।\n\nवैज्ञानिकों ने बताया कि इंजन का प्रदर्शन निर्धारित मापदंडों से भी अधिक सटीक रहा। इस परीक्षण से आगामी मानव मिशन की तैयारियां पूर्ण हो गई हैं।',
      byline: 'विज्ञान प्रतिनिधि',
      dateline: 'श्रीहरिकोटा —',
      kickerText: 'विज्ञान एवं तकनीक',
      imageUrl:
        'https://images.unsplash.com/photo-1517976487502-5f60bf512e02?auto=format&fit=crop&w=800&q=80',
      imageCaption: 'परीक्षण स्थल पर प्रज्वलित होता रॉकेट इंजन।',
      imagePlacement: 'side',
      columnSpan: 6,
      priority: 'major',
      borders: {
        bottom: { width: 1, style: 'solid', color: '#cbd5e1' },
      },
    },
  },

  // 3. Three-Column Standard
  {
    id: 'art-three-col-standard',
    name: '3-कॉलम मानक समाचार (Three-Column Standard)',
    category: 'block',
    description:
      'ब्रॉडशीट का सबसे लोकप्रिय मानक समाचार प्रारूप, स्पष्ट सुर्खी, उप-सुर्खी व विस्तृत विवरण।',
    icon: '📄',
    defaultSpan: 8,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'डिजिटल कृषि और उपग्रह मौसम निगरानी से रबी फसलों की बंपर पैदावार का अनुमान',
      subheadline: 'सटीक बारिश और तापमान पूर्वानुमान से किसानों की लागत में भारी कमी दर्ज',
      body: 'नई दिल्ली — कृषि मंत्रालय द्वारा जारी ताजा आंकड़ों के अनुसार देश के उत्तरी और मध्य मैदानी भागों में गेहूं तथा दलहन की बुवाई ने पिछले सभी रिकॉर्ड तोड़ दिए हैं।\n\nसटीक मौसम पूर्वानुमान और उपग्रह आधारित सिंचाई परामर्श से किसानों की लागत में उल्लेखनीय कमी दर्ज की गई है। कृषि विशेषज्ञों का मानना है कि इस वर्ष खाद्यान्न उत्पादन में नया कीर्तिमान बनेगा।',
      byline: 'कृषि एवं ग्रामीण विकास डेस्क',
      dateline: 'नई दिल्ली —',
      columnSpan: 8,
      priority: 'major',
    },
  },

  // 4. Side Column Analysis
  {
    id: 'art-side-column-analysis',
    name: 'साइड कॉलम विशेष विश्लेषण (Side Column Analysis)',
    category: 'block',
    description: 'ऊर्ध्वाधर स्तंभ लेआउट, गंभीर राजनीतिक व आर्थिक विश्लेषण के लिए उपयुक्त।',
    icon: '📊',
    defaultSpan: 4,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'आर्थिक समीक्षा: महंगाई दर में गिरावट से औद्योगिक उत्पादन को मिली नई गति',
      subheadline: 'कच्चे तेल की कीमतों में नरमी और उपभोक्ता मांग बढ़ने से बाजार में उत्साह',
      body: 'रिजर्व बैंक की मौद्रिक नीति समिति की आगामी बैठक से पूर्व औद्योगिक उत्पादन सूचकांक में 6.2% की उत्साहजनक वृद्धि दर्ज की गई है। पूंजीगत सामान और बुनियादी ढांचा क्षेत्र में नए निवेश से रोजगार के अवसर बढ़ रहे हैं।',
      byline: 'आर्थिक संपादक',
      dateline: 'मुंबई —',
      kickerText: 'विशेष आर्थिक स्तंभ',
      columnSpan: 4,
      priority: 'minor',
      borders: {
        left: { width: 1, style: 'solid', color: '#cbd5e1' },
        right: { width: 1, style: 'solid', color: '#cbd5e1' },
      },
    },
  },

  // 5. Interview Q&A Layout
  {
    id: 'art-interview-qa',
    name: 'विशेष साक्षात्कार संवाद (Interview Q&A Box)',
    category: 'block',
    description:
      'प्रश्न-उत्तर शैली का विशेष साक्षात्कार प्रारूप, साक्षात्कारकर्ता परिचय व हाइलाइट बॉक्स सहित।',
    icon: '🎙️',
    defaultSpan: 6,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'साक्षात्कार: "ग्रामीण युवाओं के कौशल विकास से ही आत्मनिर्भर बनेगा भारत"',
      subheadline: 'केंद्रीय कौशल विकास मंत्री से विशेष बातचीत में भविष्य की रणनीतियों पर चर्चा',
      body: 'सवाल: ग्रामीण क्षेत्रों में रोजगार सृजन के लिए सरकार की क्या प्राथमिकता है?\nजवाब: हमने ब्लॉक स्तर पर डिजिटल कौशल केंद्र शुरू किए हैं ताकि युवाओं को स्थानीय स्तर पर ही रोजगार मिल सके।\n\nसवाल: स्टार्टअप्स के लिए ग्रामीण अंचलों में क्या सुविधाएं दी जा रही हैं?\nजवाब: कृषि-तकनीक और स्थानीय हस्तशिल्प से जुड़े स्टार्टअप्स को बिना गारंटी ऋण और निःशुल्क मेंटरशिप उपलब्ध कराई जा रही है।',
      byline: 'विशेष साक्षात्कार, आलोक कुमार',
      columnSpan: 6,
      priority: 'major',
      backgroundColor: '#f8fafc',
      paddingPx: 12,
      borders: {
        left: { width: 3, style: 'solid', color: '#0284c7' },
      },
    },
  },

  // 6. Photo Story
  {
    id: 'art-photo-story',
    name: 'तस्वीरनामा समाचार (Photojournalism Story)',
    category: 'block',
    description:
      'बड़ी आकर्षक छायाचित्र आधारित स्टोरी, विस्तृत कैप्शन और संक्षिप्त सारगर्भित रिपोर्ट।',
    icon: '📸',
    defaultSpan: 8,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'लोक संस्कृति का अनुपम उत्सव: पुष्कर मेले में उमड़ा देश-विदेश के पर्यटकों का सैलाब',
      subheadline: 'पारंपरिक लोक नृत्य, ऊंटों का भव्य शृंगार और सांस्कृतिक संध्या ने मोहा सबका मन',
      imageUrl:
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      imageCaption:
        'मेले के प्रथम दिवस पर पारंपरिक राजस्थानी वेशभूषा में लोक कलाकारों द्वारा प्रस्तुत घूमर नृत्य।',
      imageCredit: 'छायाचित्र: विशेष फोटो जर्नलिस्ट',
      imagePlacement: 'top',
      body: 'पुष्कर — पवित्र सरोवर के घाटों पर महाआरती के साथ विश्व प्रसिद्ध पशु व सांस्कृतिक मेले का विधिवत शुभारंभ हुआ। देश भर से आए लोक कलाकारों ने अपनी प्रस्तुतियों से दर्शकों को मंत्रमुग्ध कर दिया।',
      byline: 'सांस्कृतिक ब्यूरो',
      dateline: 'पुष्कर —',
      columnSpan: 8,
      priority: 'minor',
    },
  },

  // 7. Opinion Column
  {
    id: 'art-opinion-column',
    name: 'संपादकीय दृष्टिकोण / विचार स्तंभ (Opinion Op-Ed)',
    category: 'block',
    description:
      'हस्ताक्षरित विचार स्तंभ, प्रतिष्ठित लेखकों के गंभीर आलेखों के लिए सुरुचिपूर्ण लेआउट।',
    icon: '✍️',
    defaultSpan: 4,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'दृष्टिकोण: डिजिटल क्रांति के दौर में मानवीय संवेदनाओं का संरक्षण',
      subheadline: 'आर्टिफिशियल इंटेलिजेंस और तकनीक के बीच समाज के नैतिक मूल्यों की पड़ताल',
      body: 'तकनीकी प्रगति ने जीवन को सुगम अवश्य बनाया है, लेकिन संवाद की आत्मीयता कम हुई है। हमें यह सुनिश्चित करना होगा कि नवाचार मानवीय करुणा और परस्पर सद्भाव को कमजोर न करे। ज्ञान और संवेदना का संतुलन ही श्रेष्ठ समाज का आधार है।',
      byline: 'डॉ. रमेश चंद्र विद्यालंकार (वरिष्ठ विचारक)',
      kickerText: 'संपादकीय विचार',
      columnSpan: 4,
      priority: 'minor',
      borders: {
        top: { width: 2, style: 'solid', color: '#1e293b' },
        bottom: { width: 1, style: 'solid', color: '#cbd5e1' },
      },
    },
  },

  // 8. Compact News Roundup / Bulletin List
  {
    id: 'art-bulletin-list',
    name: 'संक्षिप्त प्रादेशिक बुलेटिन (Compact News Roundup)',
    category: 'short-news',
    description:
      'बुलेट पॉइंट्स में संक्षिप्त समाचारों का संकलन, प्रादेशिक व नगर हलचलों के लिए त्वरित प्रारूप।',
    icon: '📌',
    defaultSpan: 4,
    isCustom: false,
    data: {
      elementType: 'short-news',
      headline: 'प्रादेशिक एवं नगर समाचार संक्षेप',
      subheadline: 'परिवहन, शिक्षा, संस्कृति और पर्यावरण से जुड़े संक्षिप्त समाचार',
      body: '• मेट्रो विस्तार परियोजना के तीसरे चरण को मिली अंतिम पर्यावरणीय मंजूरी; निर्माण कार्य शीघ्र प्रारंभ होगा।\n• राष्ट्रीय पुस्तक मेले में भारतीय भाषाओं की कृतियों के लिए विशेष दालान का उद्घाटन।\n• यमुना नदी के तटीय क्षेत्रों में जैव विविधता पार्क के संरक्षण हेतु नागरिकों का अनूठा श्रमदान अभियान।\n• राज्य स्तरीय चित्रकला प्रतियोगिता के विजेताओं को कल राज्यपाल द्वारा सम्मानित किया जाएगा।',
      byline: 'कार्यालय प्रतिनिधि',
      columnSpan: 4,
      priority: 'minor',
      backgroundColor: '#f8fafc',
      paddingPx: 10,
    },
  },

  // 9. Factbox Sidebar
  {
    id: 'art-factbox-sidebar',
    name: 'आंकड़े व तथ्य बॉक्स (Key Factbox Sidebar)',
    category: 'block',
    description:
      'महत्वपूर्ण सांख्यिकी, योजना के लाभ और त्वरित आंकड़ों को रेखांकित करने वाला बॉक्स।',
    icon: '🔢',
    defaultSpan: 4,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: 'योजना के मुख्य आंकड़े एक नज़र में',
      subheadline: 'ग्रामीण विकास पैकेज की प्रमुख उपलब्धियां और आवंटन विवरण',
      body: '• ₹18,500 करोड़: कुल बजटीय प्रावधान\n• 45 लाख: लाभान्वित होने वाले लघु एवं सीमांत किसान\n• 1,200: नए जल संचयन अमृत सरोवरों का निर्माण\n• 100%: डीबीटी के माध्यम से सीधे खाते में भुगतान\n• 72 घंटे: फसल क्षति मुआवजे का निपटान समय',
      byline: 'डेटा विश्लेषण प्रकोष्ठ',
      columnSpan: 4,
      priority: 'minor',
      backgroundColor: '#f1f5f9',
      paddingPx: 10,
      borders: {
        left: { width: 3, style: 'solid', color: '#0f172a' },
      },
    },
  },

  // 10. Quote Pullout Deck
  {
    id: 'art-quote-deck',
    name: 'प्रमुख उद्धरण हाइलाइट (Quote Pullout Deck)',
    category: 'block',
    description:
      'विशिष्ट व्यक्तियों के महत्वपूर्ण वक्तव्यों और उद्बोधनों को बड़े फॉन्ट में उभारने वाला लेआउट।',
    icon: '💬',
    defaultSpan: 6,
    isCustom: false,
    data: {
      elementType: 'block',
      headline: '"सत्य और निष्पक्षता ही पत्रकारिता का सच्चा प्राण है, इससे समझौता नहीं हो सकता"',
      subheadline:
        'प्रेस काउंसिल संगोष्ठी में वरिष्ठ संपादकों ने दोहराया स्वतंत्र पत्रकारिता का संकल्प',
      body: 'संगोष्ठी को संबोधित करते हुए वक्ताओं ने कहा कि पाठकों का विश्वास ही समाचार पत्र की सबसे बड़ी पूंजी है। सूचनाओं के इस त्वरित युग में विश्वसनीयता बनाए रखना प्रत्येक पत्रकार का नैतिक दायित्व है।',
      byline: 'विशेष रिपोर्टर',
      kickerText: 'विशेष वक्तव्य',
      columnSpan: 6,
      priority: 'major',
      backgroundColor: '#fffbeb',
      paddingPx: 12,
      borders: {
        left: { width: 4, style: 'solid', color: '#f59e0b' },
      },
    },
  },
];
