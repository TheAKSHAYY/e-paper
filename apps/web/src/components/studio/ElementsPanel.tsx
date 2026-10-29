import React, { useState } from 'react';
import type { Article, ElementType } from '@epaper-studio/document-schema';

export interface ElementsPanelProps {
  articles: Article[];
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
  onAddElement: (elementData: Partial<Article>) => void;
  onDuplicateArticle: (id: string) => void;
  onDeleteArticle: (id: string) => void;
  onMoveArticleUp: (id: string) => void;
  onMoveArticleDown: (id: string) => void;
  pageNumber: number;
}

export interface ElementPreset {
  id: string;
  name: string;
  category: ElementType;
  description: string;
  icon: string;
  defaultSpan: number;
  data: Partial<Article>;
}

export const ELEMENT_PRESETS: ElementPreset[] = [
  // ==========================================
  // 1. BLOCKS (आर्टिकल ब्लॉक)
  // ==========================================
  {
    id: 'block-lead-hero',
    name: 'मुख्य समाचार (Hero Lead Story)',
    category: 'block',
    description: 'बड़ा मुख्य समाचार, आकर्षक शीर्षक और शीर्ष फोटोग्राफ के साथ।',
    icon: '📰',
    defaultSpan: 12,
    data: {
      elementType: 'block',
      headline:
        'संसद में ऐतिहासिक नीति पर मुहर: ग्रामीण विकास व किसान कल्याण के लिए विशेष आर्थिक पैकेज',
      subheadline:
        'सभी वर्गों के प्रतिनिधियों ने किया सर्वसम्मति से समर्थन, देश भर में स्वागत की लहर',
      body: 'नई दिल्ली — संसद के विशेष सत्र में आज ग्रामीण भारत की अर्थव्यवस्था को गति देने के लिए एक ऐतिहासिक विधेयक पारित किया गया। इस योजना के तहत सिंचाई, कृषि उपकरण, और न्यूनतम समर्थन मूल्य की सुदृढ़ व्यवस्था सुनिश्चित की जाएगी।\n\nकेंद्रीय कृषि मंत्री ने सदन को संबोधित करते हुए कहा कि यह निर्णय देश के अन्नदाताओं की आय को दोगुना करने की दिशा में मील का पत्थर साबित होगा। उन्होंने स्पष्ट किया कि आधुनिक तकनीक और उपग्रह आधारित मौसम पूर्वानुमान को भी इस योजना का अभिन्न हिस्सा बनाया गया है।',
      byline: 'विशेष संवाददाता',
      dateline: 'नई दिल्ली —',
      imageUrl:
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      imageCaption:
        'संसद भवन के बाहर नई नीति के पारित होने के बाद मीडिया से बातचीत करते केंद्रीय मंत्री।',
      imageCredit: 'छायाचित्र: विशेष छायाकार',
      imagePlacement: 'top',
      columnSpan: 12,
      priority: 'lead',
      borders: {
        bottom: { width: 2, style: 'solid', color: '#111111' },
      },
    },
  },
  {
    id: 'block-two-col-report',
    name: '2-कॉलम मानक समाचार (Standard Report)',
    category: 'block',
    description: 'संतुलित 2-कॉलम समाचार रिपोर्ट, स्थानीय व प्रादेशिक खबरों के लिए।',
    icon: '📄',
    defaultSpan: 6,
    data: {
      elementType: 'block',
      headline: 'ग्रामीण भारत में उपग्रह मौसम परामर्श से रबी फसलों की बंपर पैदावार की उम्मीद',
      subheadline: 'सटीक बारिश और तापमान पूर्वानुमान से किसानों की लागत में भारी कमी',
      body: 'कृषि मंत्रालय द्वारा जारी ताजा समीक्षा के अनुसार मैदानी भागों में गेहूं और दलहन की बुवाई ने नया कीर्तिमान बनाया है।\n\nमोबाइल आधारित कृषि परामर्श से किसानों को समय रहते कीट नियंत्रण और सिंचाई की सटीक जानकारी मिल रही है, जिससे उत्पादन लागत में उल्लेखनीय बचत हुई है।',
      byline: 'कृषि एवं ग्रामीण विकास डेस्क',
      dateline: 'लखनऊ —',
      imageUrl: '',
      imagePlacement: 'none',
      columnSpan: 6,
      priority: 'major',
      borders: {
        right: { width: 1, style: 'solid', color: '#cbd5e1' },
        bottom: { width: 1, style: 'solid', color: '#e2e8f0' },
      },
    },
  },
  {
    id: 'block-photo-feature',
    name: 'फोटो फीचर एवं आलेख (Photo Feature)',
    category: 'block',
    description: 'बड़ा विजुअल फोटो और विस्तृत कहानी के साथ रचनात्मक लेआउट।',
    icon: '🖼️',
    defaultSpan: 6,
    data: {
      elementType: 'block',
      headline: 'ऐतिहासिक धरोहरों के संरक्षण का महाभियान: पुरातत्व विभाग ने शुरू किया जीर्णोद्धार',
      subheadline: 'प्राचीन वास्तुकla को सहेजने के लिए आधुनिक लेजर तकनीक का उपयोग',
      body: 'शताब्दियों पुराने स्मारकों को प्राकृतिक क्षरण से बचाने के लिए विशेषज्ञों की टीम ने विशेष रासायनिक उपचार और थ्री-डी मैपिंग का कार्य प्रारंभ किया है। पर्यटकों के लिए नए सूचना केंद्र भी स्थापित किए जा रहे हैं।',
      byline: 'छायाचित्र: विशेष छायाकार',
      dateline: 'वाराणसी —',
      imageUrl:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      imageCaption: 'संरक्षण कार्य के दौरान प्राचीन नक्काशी का सूक्ष्म निरीक्षण करते विशेषज्ञ।',
      imageCredit: 'छाया: पुरातत्व विभाग',
      imagePlacement: 'top',
      columnSpan: 6,
      priority: 'major',
    },
  },
  {
    id: 'block-editorial-essay',
    name: 'संपादकीय व विचार (Editorial & Opinion)',
    category: 'block',
    description: 'गंभीर संपादकीय आलेख, औपचारिक भाषा और विमर्श के लिए।',
    icon: '✍️',
    defaultSpan: 6,
    data: {
      elementType: 'block',
      headline: 'संपादकीय: डिजिटल शिक्षा और भावी पीढ़ी के समक्ष नए अवसर',
      subheadline: 'ज्ञान के लोकतंत्रीकरण में भाषा की बाधाओं को पार करना अनिवार्य',
      body: 'शिक्षा केवल पाठ्यपुस्तकों की सीमाओं में बंधी नहीं रह सकती। आज जब डिजिटल संसाधन सुदूर गांवों तक पहुंच रहे हैं, तब आवश्यक है कि गुणवत्तापूर्ण अध्ययन सामग्री प्रत्येक भारतीय भाषा में उपलब्ध कराई जाए।\n\nजब तक मातृभाषा में उच्च स्तरीय वैज्ञानिक और तकनीकी शिक्षा सुलभ नहीं होगी, तब तक वास्तविक ज्ञान क्रांति अधूरी रहेगी। नीति निर्धारकों को इस दिशा में ठोस पहल करनी होगी।',
      byline: 'आलेख: प्रधान संपादक',
      dateline: '',
      imagePlacement: 'none',
      columnSpan: 6,
      priority: 'major',
      borders: {
        left: { width: 3, style: 'solid', color: '#b91c1c' },
        bottom: { width: 1, style: 'solid', color: '#e2e8f0' },
      },
    },
  },

  // ==========================================
  // 2. TOP HEADLINES (मुख्य सुर्खियाँ)
  // ==========================================
  {
    id: 'top-headline-breaking-banner',
    name: 'ब्रेकिंग न्यूज़ बैनर (Breaking News Banner)',
    category: 'top-headline',
    description: 'लाल रंग की पट्टी, बोल्ड हेडलाइन और पूरे पृष्ठ पर खिंची प्रमुख सुर्खी।',
    icon: '🚨',
    defaultSpan: 12,
    data: {
      elementType: 'top-headline',
      kickerText: '🚨 ब्रेकिंग न्यूज़ / विशेष बुलेटिन',
      headline:
        'राष्ट्रीय आपदा प्रबंधन दल ने शुरू किया राहत अभियान: 10 हजार नागरिकों को सुरक्षित स्थानों पर पहुँचाया',
      subheadline:
        'प्रधानमंत्री ने प्रभावित राज्यों के मुख्यमंत्रियों से की सीधी बातचीत, हरसंभव केंद्र सहायता का भरोसा',
      body: 'नई दिल्ली — भारी वर्षा और आकस्मिक बाढ़ की स्थिति को देखते हुए सेना और एनडीआरएफ की 15 अतिरिक्त बटालियनें तैनात कर दी गई हैं। वायुसेना के हेलीकॉप्टर खाद्य सामग्री और दवाइयाँ पहुँचाने में निरंतर लगे हुए हैं।',
      byline: 'विशेष रिपोर्टर',
      dateline: 'नई दिल्ली —',
      imagePlacement: 'none',
      columnSpan: 12,
      priority: 'lead',
      backgroundColor: '#fff5f5',
      borders: {
        top: { width: 3, style: 'solid', color: '#b91c1c' },
        bottom: { width: 3, style: 'double', color: '#b91c1c' },
        left: { width: 4, style: 'solid', color: '#b91c1c' },
      },
    },
  },
  {
    id: 'top-headline-ornate-double',
    name: 'क्लासिक डबल-डेकर सुर्खी (Ornate Screamer)',
    category: 'top-headline',
    description: 'पारंपरिक डबल रूल और अलंकृत बॉर्डर के साथ भव्य समाचार शीर्षक।',
    icon: '⚡',
    defaultSpan: 12,
    data: {
      elementType: 'top-headline',
      kickerText: '• राष्ट्रीय परिप्रेक्ष्य •',
      headline: 'अंतरिक्ष अनुसंधान में भारत की एक और छलांग: नए उपग्रह का सफल प्रक्षेपण',
      subheadline:
        'पर्यावरण निगरानी, मौसम पूर्वानुमान और समुद्री सुरक्षा में मील का पत्थर साबित होगा नया मिशन',
      body: 'श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने आज सुबह ठीक 6:30 बजे अपनी नवीनतम निगरानी उपग्रह श्रृंखला को सफलतापूर्वक कक्षा में स्थापित किया।',
      byline: 'विज्ञान प्रतिनिधि',
      dateline: 'श्रीहरिकोटा —',
      imagePlacement: 'none',
      columnSpan: 12,
      priority: 'lead',
      borders: {
        top: { width: 3.5, style: 'double', color: '#111111' },
        bottom: { width: 3.5, style: 'double', color: '#111111' },
      },
    },
  },
  {
    id: 'top-headline-underlined-lead',
    name: 'अंडरलाइन्ड टॉप लीड (Underlined Lead Header)',
    category: 'top-headline',
    description: '8-कॉलम चौड़ा प्रभावशाली शीर्षक, नीचे मोटी स्याही रेखा के साथ।',
    icon: '📢',
    defaultSpan: 8,
    data: {
      elementType: 'top-headline',
      kickerText: 'विशेष पड़ताल',
      headline:
        'देश के 500 शहरों में स्वच्छ वायु का लक्ष्य: पर्यावरण मंत्रालय ने जारी की वार्षिक रिपोर्ट',
      subheadline:
        'प्रदूषण स्तर में 18 प्रतिशत की कमी दर्ज, इलेक्ट्रिक वाहनों के विस्तार को मिली गति',
      body: 'पर्यावरण एवं वन मंत्रालय द्वारा आज जारी राष्ट्रीय स्वच्छ वायु समीक्षा में उत्साहजनक परिणाम सामने आए हैं।',
      byline: 'पर्यावरण डेस्क',
      dateline: 'नई दिल्ली —',
      imagePlacement: 'none',
      columnSpan: 8,
      priority: 'major',
      borders: {
        bottom: { width: 2, style: 'solid', color: '#111111' },
      },
    },
  },

  // ==========================================
  // 3. SHORT NEWS (संक्षिप्त समाचार / ब्रीफ्स)
  // ==========================================
  {
    id: 'short-news-regional-digest',
    name: 'प्रादेशिक एवं नगर समाचार संक्षेप (3-Bullet Digest)',
    category: 'short-news',
    description: '3 बुलेट बिंदुओं में शहर व आसपास की मुख्य घटनाओं का संकलन।',
    icon: '📌',
    defaultSpan: 6,
    data: {
      elementType: 'short-news',
      headline: 'प्रादेशिक एवं नगर समाचार संक्षेप',
      subheadline: 'परिवहन, शिक्षा, संस्कृति और पर्यावरण से जुड़े संक्षिप्त समाचार',
      body: '• मेट्रो विस्तार परियोजना के तीसरे चरण को मिली अंतिम पर्यावरणीय मंजूरी; निर्माण कार्य शीघ्र प्रारंभ होगा।\n• राष्ट्रीय पुस्तक मेले में भारतीय भाषाओं की कृतियों के लिए विशेष दालान का उद्घाटन।\n• यमुना नदी के तटीय क्षेत्रों में जैव विविधता पार्क के संरक्षण हेतु नागरिकों का अनूठा श्रमदान अभियान।',
      byline: 'कार्यालय प्रतिनिधि',
      dateline: '',
      imagePlacement: 'none',
      columnSpan: 6,
      priority: 'minor',
      shortNewsItems: [
        {
          title: 'मेट्रो विस्तार',
          snippet: 'तीसरे चरण को मिली अंतिम मंजूरी, 14 नए स्टेशन जुड़ेंगे।',
        },
        {
          title: 'राष्ट्रीय पुस्तक मेला',
          snippet: 'भारतीय भाषाओं के अनुवाद मंच का भव्य शुभारंभ।',
        },
        {
          title: 'स्वच्छता महाभियान',
          snippet: 'नागरिकों ने 50 टन प्लास्टिक कचरे का किया निस्तारण।',
        },
      ],
      borders: {
        top: { width: 1, style: 'solid', color: '#cbd5e1' },
        right: { width: 1, style: 'solid', color: '#cbd5e1' },
        bottom: { width: 1, style: 'solid', color: '#cbd5e1' },
        left: { width: 3, style: 'solid', color: '#2563eb' },
      },
      backgroundColor: '#f8fafc',
    },
  },
  {
    id: 'short-news-factoid-box',
    name: 'तथ्य एवं आंकड़े बॉक्स (Factoid & Numbers Box)',
    category: 'short-news',
    description: 'आंकड़ों और प्रतिशत पर केंद्रित संक्षिप्त तथ्यात्मक समाचार बॉक्स।',
    icon: '📊',
    defaultSpan: 4,
    data: {
      elementType: 'short-news',
      headline: 'आंकड़ों में आज: भारत की डिजिटल अर्थव्यवस्था',
      subheadline: 'यूपीआई लेन-देन ने रचा नया इतिहास',
      body: '• 14 अरब: अक्टूबर माह में कुल डिजिटल भुगतान\n• 48%: ग्रामीण क्षेत्रों से दर्ज हुआ हिस्सा\n• 99.8%: लेन-देन की तकनीकी सफलता दर',
      byline: 'आर्थिक डेस्क',
      dateline: 'मुंबई —',
      imagePlacement: 'none',
      columnSpan: 4,
      priority: 'minor',
      borders: {
        top: { width: 2, style: 'solid', color: '#15803d' },
        bottom: { width: 2, style: 'solid', color: '#15803d' },
      },
      backgroundColor: '#f0fdf4',
    },
  },
  {
    id: 'short-news-compact-ticker',
    name: 'समाचार बुलेटिन पट्टी (Compact News Ticker)',
    category: 'short-news',
    description: 'एक पंक्ति में त्वरित समाचारों की क्षैतिज पट्टी।',
    icon: '📜',
    defaultSpan: 12,
    data: {
      elementType: 'short-news',
      headline: 'संक्षिप्त खबरें : एक नज़र में',
      subheadline: '',
      body: 'सोने के भाव में ₹250 की गिरावट • शेयर बाजार 340 अंक चढ़कर बंद • उत्तर भारत में तापमान में हल्की गिरावट • रेलवे ने चलाईं 50 नई पूजा स्पेशल ट्रेनें',
      byline: '',
      dateline: '',
      imagePlacement: 'none',
      columnSpan: 12,
      priority: 'brief',
      borders: {
        top: { width: 1, style: 'solid', color: '#111111' },
        bottom: { width: 1, style: 'solid', color: '#111111' },
      },
    },
  },

  // ==========================================
  // 4. ADVERTISEMENT (विज्ञापन बॉक्स)
  // ==========================================
  {
    id: 'ad-commercial-banner',
    name: 'व्यावसायिक विज्ञापन बैनर (Commercial Banner Ad)',
    category: 'advertisement',
    description: 'पूर्ण-चौड़ाई व्यावसायिक प्रचार पट्टी, संपर्क नंबर व वेबसाइट सहित।',
    icon: '📢',
    defaultSpan: 12,
    data: {
      elementType: 'advertisement',
      headline: 'राजधानी ज्वेलर्स — शुद्धता व विश्वास की 75 वर्षों की अटूट परंपरा',
      subheadline: 'धनतेरस व दीवाली के पावन अवसर पर मेकिंग चार्ज पर 25% की विशेष छूट',
      body: 'हमारे यहाँ 100% हॉलमार्क प्रमाणित स्वर्ण एवं डायमंड आभूषणों का अनुपम संग्रह उपलब्ध है। आज ही पधारें और आकर्षक उपहार योजना का लाभ उठाएँ।',
      byline: 'प्रायोजित विज्ञापन',
      dateline: 'कनॉट प्लेस, नई दिल्ली',
      imagePlacement: 'none',
      columnSpan: 12,
      priority: 'brief',
      advertisementData: {
        sponsor: 'राजधानी ज्वेलर्स लिमिटेड',
        callToAction: 'नजदीकी शोरूम पर संपर्क करें',
        phone: '1800-123-4567',
        website: 'www.rajdhanijewellers.in',
      },
      backgroundColor: '#fffbeb',
      borders: {
        top: { width: 2, style: 'dashed', color: '#b45309' },
        right: { width: 2, style: 'dashed', color: '#b45309' },
        bottom: { width: 2, style: 'dashed', color: '#b45309' },
        left: { width: 2, style: 'dashed', color: '#b45309' },
      },
    },
  },
  {
    id: 'ad-classified-quarter',
    name: 'वर्गीकृत विज्ञापन बॉक्स (Classified Box Ad)',
    category: 'advertisement',
    description: 'कॉम्पैक्ट 4-कॉलम विज्ञापन बॉक्स, कानूनी सूचना या संस्थागत प्रचार के लिए।',
    icon: '🏷️',
    defaultSpan: 4,
    data: {
      elementType: 'advertisement',
      headline: 'प्रवेश सूचना: सत्र 2026-27 के लिए आवेदन आमंत्रित',
      subheadline: 'राष्ट्रीय प्रबंधन एवं प्रौद्योगिकी संस्थान',
      body: 'बीटेक, एमबीए एवं एमसीए पाठ्यक्रमों में सीमित सीटें उपलब्ध। योग्य अभ्यर्थियों के लिए 100% छात्रवृत्ति का अवसर।',
      byline: 'प्रवेश प्रकोष्ठ',
      dateline: '',
      imagePlacement: 'none',
      columnSpan: 4,
      priority: 'brief',
      advertisementData: {
        sponsor: 'NIMT विश्वविद्यालय',
        callToAction: 'ऑनलाइन आवेदन करें',
        phone: '011-23456789',
        website: 'www.nimt.edu.in',
      },
      borders: {
        top: { width: 1.5, style: 'solid', color: '#1e293b' },
        right: { width: 1.5, style: 'solid', color: '#1e293b' },
        bottom: { width: 1.5, style: 'solid', color: '#1e293b' },
        left: { width: 1.5, style: 'solid', color: '#1e293b' },
      },
      backgroundColor: '#f8fafc',
    },
  },
  {
    id: 'ad-real-estate-feature',
    name: 'रियल एस्टेट प्रचार (Property Ad)',
    category: 'advertisement',
    description: 'तस्वीर सहित प्रीमियम हाउसिंग प्रोजेक्ट प्रचार बॉक्स।',
    icon: '🏢',
    defaultSpan: 6,
    data: {
      elementType: 'advertisement',
      headline: 'ग्रीन मीडोज हाइट्स: सपनों का घर अब आपके बजट में',
      subheadline: 'एक्सप्रेसवे के निकट 2 व 3 बीएचके लक्ज़री फ्लैट्स',
      body: 'क्लब हाउस, स्विमिंग पूल, 24 घंटे सुरक्षा और खुला हरित क्षेत्र। बुकिंग मात्र ₹1 लाख से प्रारंभ। तुरंत रजिस्ट्री व कब्जा।',
      byline: 'प्रायोजक: ग्रीन इंफ्राटेक',
      dateline: 'नोएडा —',
      imageUrl:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
      imageCaption: 'सैंपल फ्लैट का वास्तविक दृश्य',
      imagePlacement: 'side',
      columnSpan: 6,
      priority: 'brief',
      advertisementData: {
        sponsor: 'ग्रीन इंफ्राटेक डेवलपर्स',
        callToAction: 'साइट विजिट के लिए संपर्क करें',
        phone: '+91-9876543210',
        website: 'www.greenmeadows.com',
      },
      borders: {
        top: { width: 1, style: 'solid', color: '#d97706' },
        bottom: { width: 1, style: 'solid', color: '#d97706' },
      },
    },
  },

  // ==========================================
  // 5. RASHIFAL (दैनिक राशिफल / 12 ZODIAC)
  // ==========================================
  {
    id: 'rashifal-12-zodiac-grid',
    name: 'दैनिक राशिफल (12 Rashis Horoscope Grid)',
    category: 'rashifal',
    description: '12 राशियों (मेष से मीन) का संपूर्ण दैनिक फलादेश, पारंपरिक पंचांग शैली में।',
    icon: '✨',
    defaultSpan: 12,
    data: {
      elementType: 'rashifal',
      kickerText: 'ज्योतिष एवं पंचांग',
      headline: 'आज का दैनिक राशिफल : जानें कैसा रहेगा आपका दिन',
      subheadline: 'पंडित रविशंकर शास्त्री द्वारा ग्रह-गोचर पर आधारित सटीक फलादेश',
      body: 'आज का दिन कई राशियों के लिए शुभ संयोग लेकर आया है। व्यवसाय में नए अनुबंध और पारिवारिक जीवन में शांति बनी रहेगी।',
      byline: 'ज्योतिष केंद्र',
      dateline: '',
      imagePlacement: 'none',
      columnSpan: 12,
      priority: 'major',
      rashifalItems: [
        {
          rashi: 'मेष (Aries)',
          sign: '♈',
          prediction: 'कार्यक्षेत्र में प्रगति होगी। नए मित्रों का सहयोग मिलेगा।',
        },
        {
          rashi: 'वृषभ (Taurus)',
          sign: '♉',
          prediction: 'आर्थिक मामलों में सावधानी बरतें। पारिवारिक सुख बढ़ेगा।',
        },
        {
          rashi: 'मिथुन (Gemini)',
          sign: '♊',
          prediction: 'रचनात्मक कार्यों में रुचि बढ़ेगी। यात्रा के योग बन रहे हैं।',
        },
        {
          rashi: 'कर्क (Cancer)',
          sign: '♋',
          prediction: 'मानसिक शांति का अनुभव होगा। अटके हुए काम पूरे होंगे।',
        },
        {
          rashi: 'सिंह (Leo)',
          sign: '♌',
          prediction: 'व्यापार में लाभ के अवसर मिलेंगे। आत्मविश्वास में वृद्धि होगी।',
        },
        {
          rashi: 'कन्या (Virgo)',
          sign: '♍',
          prediction: 'स्वास्थ्य का ध्यान रखें। वाणी पर संयम रखना लाभकारी रहेगा।',
        },
        {
          rashi: 'तुला (Libra)',
          sign: '♎',
          prediction: 'साझेदारी के काम में सफलता। घर में मांगलिक कार्य के योग।',
        },
        {
          rashi: 'वृश्चिक (Scorpio)',
          sign: '♏',
          prediction: 'पराक्रम में वृद्धि होगी। विरोधी शांत रहेंगे, उन्नति होगी।',
        },
        {
          rashi: 'धनु (Sagittarius)',
          sign: '♐',
          prediction: 'विद्यार्थियों के लिए उत्तम समय। धन लाभ के नए स्रोत खुलेंगे।',
        },
        {
          rashi: 'मकर (Capricorn)',
          sign: '♑',
          prediction: 'परिश्रम का पूरा फल मिलेगा। अचल संपत्ति से लाभ संभव।',
        },
        {
          rashi: 'कुंभ (Aquarius)',
          sign: '♒',
          prediction: 'सामाजिक प्रतिष्ठा में वृद्धि। संतान पक्ष से शुभ समाचार।',
        },
        {
          rashi: 'मीन (Pisces)',
          sign: '♓',
          prediction: 'धार्मिक कार्यों में मन लगेगा। रुका हुआ धन प्राप्त होने के योग।',
        },
      ],
      borders: {
        top: { width: 2, style: 'solid', color: '#b45309' },
        bottom: { width: 2, style: 'solid', color: '#b45309' },
      },
      backgroundColor: '#fffdf5',
    },
  },
  {
    id: 'rashifal-6-zodiac-compact',
    name: 'राशिफल संक्षिप्त बॉक्स (Half-Page Horoscope)',
    category: 'rashifal',
    description: '6 प्रमुख राशियों का कॉम्पैक्ट राशिफल बॉक्स।',
    icon: '🔮',
    defaultSpan: 6,
    data: {
      elementType: 'rashifal',
      kickerText: 'ग्रह दशा',
      headline: 'आज का भाग्यफल',
      subheadline: 'दिन विशेष की शुभता व सावधानी',
      body: 'ग्रहों की अनुकूलता से आज का दिन शुभ फलदायी रहेगा।',
      byline: 'ज्योतिष विमर्श',
      dateline: '',
      imagePlacement: 'none',
      columnSpan: 6,
      priority: 'minor',
      rashifalItems: [
        { rashi: 'मेष', sign: '♈', prediction: 'रुके कार्य बनेंगे, धन लाभ।' },
        { rashi: 'वृषभ', sign: '♉', prediction: 'परिजनों का पूरा सहयोग मिलेगा।' },
        { rashi: 'मिथुन', sign: '♊', prediction: 'यात्रा सुखद और लाभकारी रहेगी।' },
        { rashi: 'कर्क', sign: '♋', prediction: 'मन शांत रखें, विवाद टालें।' },
        { rashi: 'सिंह', sign: '♌', prediction: 'कारोबार में मनचाही प्रगति होगी।' },
        { rashi: 'कन्या', sign: '♍', prediction: 'निवेश के नए अवसर प्राप्त होंगे।' },
      ],
      borders: {
        left: { width: 3, style: 'solid', color: '#b45309' },
        bottom: { width: 1, style: 'solid', color: '#fde68a' },
      },
    },
  },
];

export const ElementsPanel: React.FC<ElementsPanelProps> = ({
  articles,
  selectedArticleId,
  onSelectArticle,
  onAddElement,
  onDuplicateArticle,
  onDeleteArticle,
  onMoveArticleUp,
  onMoveArticleDown,
  pageNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'applied' | 'catalog'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<ElementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = ELEMENT_PRESETS.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getElementTypeBadge = (type?: ElementType) => {
    switch (type) {
      case 'top-headline':
        return { label: 'मुख्य सुर्खी', color: '#b91c1c', bg: '#fef2f2' };
      case 'short-news':
        return { label: 'संक्षिप्त', color: '#2563eb', bg: '#eff6ff' };
      case 'advertisement':
        return { label: 'विज्ञापन', color: '#b45309', bg: '#fffbeb' };
      case 'rashifal':
        return { label: 'राशिफल', color: '#7c3aed', bg: '#f5f3ff' };
      case 'block':
      default:
        return { label: 'आर्टिकल', color: '#334155', bg: '#f1f5f9' };
    }
  };

  return (
    <div
      className="elements-panel-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top Toggle: Applied Elements vs Catalog */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '4px',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            borderRadius: '6px',
            backgroundColor: activeTab === 'catalog' ? '#ffffff' : 'transparent',
            color: activeTab === 'catalog' ? '#b91c1c' : '#64748b',
            boxShadow: activeTab === 'catalog' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>✨</span> नए तत्व जोड़ें (Catalog)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('applied')}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            borderRadius: '6px',
            backgroundColor: activeTab === 'applied' ? '#ffffff' : 'transparent',
            color: activeTab === 'applied' ? '#b91c1c' : '#64748b',
            boxShadow: activeTab === 'applied' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>📋</span> पेज {pageNumber} के तत्व ({articles.length})
        </button>
      </div>

      {/* ==============================================================
       * TAB 1: APPLIED ELEMENTS (वर्तमान पेज के लागू किए गए तत्व)
       * ============================================================== */}
      {activeTab === 'applied' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              पेज {pageNumber} पर मौजूद तत्व (Applied Elements)
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
              तत्व चुनें, क्रम बदलें (▲/▼), कॉपी करें या हटाएँ
            </p>
          </div>

          {articles.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📰</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                इस पेज पर अभी कोई तत्व नहीं है
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 14px 0' }}>
                &quot;नए तत्व जोड़ें&quot; टैब से कोई भी ब्लॉक या सुर्खी चुनें
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                style={{
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + तत्व सूची खोलें
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {articles.map((art, idx) => {
                const isSelected = selectedArticleId === art.id;
                const badge = getElementTypeBadge(art.elementType);

                return (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    style={{
                      border: isSelected ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(185,28,28,0.12)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                          कॉलम {art.columnSpan}/12
                        </span>
                      </div>

                      {/* Quick Action Icons */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveArticleUp(art.id)}
                          title="ऊपर करें (Move Up)"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: idx === 0 ? '#cbd5e1' : '#475569',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            padding: '2px',
                            fontSize: '11px',
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === articles.length - 1}
                          onClick={() => onMoveArticleDown(art.id)}
                          title="नीचे करें (Move Down)"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: idx === articles.length - 1 ? '#cbd5e1' : '#475569',
                            cursor: idx === articles.length - 1 ? 'not-allowed' : 'pointer',
                            padding: '2px',
                            fontSize: '11px',
                          }}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateArticle(art.id)}
                          title="कॉपी बनाएँ (Duplicate)"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            cursor: 'pointer',
                            padding: '2px',
                            fontSize: '12px',
                          }}
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteArticle(art.id)}
                          title="हटाएँ (Delete)"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '2px',
                            fontSize: '12px',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        lineHeight: 1.3,
                        fontFamily: "'Noto Serif Devanagari', serif",
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {art.headline}
                    </div>

                    {art.byline && (
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        {art.byline}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
       * TAB 2: SELECT ELEMENTS CATALOG (तत्व जोड़ें)
       * ============================================================== */}
      {activeTab === 'catalog' && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '8px',
              marginBottom: '10px',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
              minHeight: '44px',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'all', label: 'सभी (All)' },
              { id: 'block', label: 'आर्टिकल (Blocks)' },
              { id: 'top-headline', label: 'सुर्खियाँ (Headlines)' },
              { id: 'short-news', label: 'संक्षिप्त (Short News)' },
              { id: 'advertisement', label: 'विज्ञापन (Ads)' },
              { id: 'rashifal', label: 'राशिफल (Rashifal)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as 'all' | ElementType)}
                style={{
                  padding: '0 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  border: categoryFilter === cat.id ? '1px solid #b91c1c' : '1px solid #cbd5e1',
                  backgroundColor: categoryFilter === cat.id ? '#b91c1c' : '#ffffff',
                  color: categoryFilter === cat.id ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minHeight: '36px',
                  height: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: '12px', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="तत्व या फॉर्मेट खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px',
                height: '38px',
                fontSize: '12.5px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                outline: 'none',
              }}
            />
          </div>

          {/* Preset Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredPresets.map((preset) => {
              const badge = getElementTypeBadge(preset.category);

              return (
                <div
                  key={preset.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(preset.data));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{preset.icon}</span>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                        {preset.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color,
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                    {preset.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
                      अनुशंसित: {preset.defaultSpan}/12 कॉलम
                    </span>

                    <button
                      type="button"
                      onClick={() => onAddElement(preset.data)}
                      style={{
                        backgroundColor: '#b91c1c',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span>+</span> पेज {pageNumber} पर जोड़ें
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
