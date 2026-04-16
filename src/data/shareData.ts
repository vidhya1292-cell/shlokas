// Daily sharing card — quotes from BG, Thirukkural, Upanishads, Ramcharitmanas.
// Rotates daily so every family member sees something "new" to forward.

export interface ShareQuote {
  id: string;
  original: string;       // Devanagari (Sanskrit) or Tamil script (Thirukkural)
  originalLang: "sa" | "ta";
  source: string;
  sourceShort: string;
  en: string;
  ta: string;
  hi: string;
}

export interface DailyDeity {
  id: string;
  name: string;
  nameTA: string;
  nameHI: string;
  gradient: string;
  symbol: string;
  dayIndex: number; // 0=Sun … 6=Sat
  dayEN: string;
  dayTA: string;
  dayHI: string;
  daySignificanceEN: string;
  daySignificanceTA: string;
  daySignificanceHI: string;
}

export const DAILY_DEITIES: DailyDeity[] = [
  {
    id: "surya",
    name: "Surya Dev",
    nameTA: "சூரியன்",
    nameHI: "सूर्य देव",
    gradient: "linear-gradient(135deg, #EA580C 0%, #FBBF24 100%)",
    symbol: "☀️",
    dayIndex: 0,
    dayEN: "Sunday",
    dayTA: "ஞாயிற்றுக்கிழமை",
    dayHI: "रविवार",
    daySignificanceEN: "Surya puja · Sun worship",
    daySignificanceTA: "சூரிய வழிபாடு · ஆதித்ய",
    daySignificanceHI: "सूर्य पूजा · आदित्य",
  },
  {
    id: "shiva",
    name: "Shiva",
    nameTA: "சிவபெருமான்",
    nameHI: "शिव",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #C4B5FD 100%)",
    symbol: "🌙",
    dayIndex: 1,
    dayEN: "Monday",
    dayTA: "திங்கட்கிழமை",
    dayHI: "सोमवार",
    daySignificanceEN: "Shiva puja · Somvar vrat",
    daySignificanceTA: "சிவ பூஜை · சோமவார விரதம்",
    daySignificanceHI: "शिव पूजा · सोमवार व्रत",
  },
  {
    id: "murugan",
    name: "Murugan",
    nameTA: "முருகன்",
    nameHI: "मुरुगन / कार्तिकेय",
    gradient: "linear-gradient(135deg, #DC2626 0%, #FB923C 100%)",
    symbol: "🪷",
    dayIndex: 2,
    dayEN: "Tuesday",
    dayTA: "செவ்வாய்க்கிழமை",
    dayHI: "मंगलवार",
    daySignificanceEN: "Murugan worship · Mangalvar",
    daySignificanceTA: "முருக வழிபாடு · செவ்வாய்",
    daySignificanceHI: "मुरुगन पूजा · मंगलवार",
  },
  {
    id: "vishnu",
    name: "Vishnu",
    nameTA: "திருமால்",
    nameHI: "विष्णु",
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)",
    symbol: "🔱",
    dayIndex: 3,
    dayEN: "Wednesday",
    dayTA: "புதன்கிழமை",
    dayHI: "बुधवार",
    daySignificanceEN: "Vishnu puja · Budhvar",
    daySignificanceTA: "விஷ்ணு பூஜை · புதன்",
    daySignificanceHI: "विष्णु पूजा · बुधवार",
  },
  {
    id: "guru",
    name: "Brihaspati / Guru",
    nameTA: "குருவாரம்",
    nameHI: "बृहस्पति / गुरु",
    gradient: "linear-gradient(135deg, #B45309 0%, #FDE68A 100%)",
    symbol: "🌼",
    dayIndex: 4,
    dayEN: "Thursday",
    dayTA: "வியாழக்கிழமை",
    dayHI: "गुरुवार",
    daySignificanceEN: "Guru / Vishnu worship · Brihaspati",
    daySignificanceTA: "குரு வழிபாடு · விஷ்ணு பூஜை",
    daySignificanceHI: "गुरु/विष्णु पूजा · बृहस्पतिवार",
  },
  {
    id: "lakshmi",
    name: "Lakshmi",
    nameTA: "லக்ஷ்மி",
    nameHI: "लक्ष्मी",
    gradient: "linear-gradient(135deg, #BE185D 0%, #FDA4AF 100%)",
    symbol: "🌸",
    dayIndex: 5,
    dayEN: "Friday",
    dayTA: "வெள்ளிக்கிழமை",
    dayHI: "शुक्रवार",
    daySignificanceEN: "Lakshmi puja · Shukravar",
    daySignificanceTA: "லக்ஷ்மி பூஜை · வெள்ளி",
    daySignificanceHI: "लक्ष्मी पूजा · शुक्रवार",
  },
  {
    id: "hanuman",
    name: "Hanuman",
    nameTA: "ஆஞ்சநேயர்",
    nameHI: "हनुमान",
    gradient: "linear-gradient(135deg, #1F2937 0%, #6B7280 100%)",
    symbol: "🙏",
    dayIndex: 6,
    dayEN: "Saturday",
    dayTA: "சனிக்கிழமை",
    dayHI: "शनिवार",
    daySignificanceEN: "Hanuman puja · Shanivar",
    daySignificanceTA: "ஆஞ்சநேயர் பூஜை · சனி",
    daySignificanceHI: "हनुमान पूजा · शनिवार",
  },
];

export const SHARE_QUOTES: ShareQuote[] = [
  {
    id: "bg_2_47",
    original:
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    originalLang: "sa",
    source: "Bhagavad Gita 2.47",
    sourceShort: "BG 2.47",
    en: "You have the right to perform your duties, but never to the fruits of your actions. Let not the fruits be your motive, nor let your attachment be to inaction.",
    ta: "கர்மம் செய்வதில் மட்டுமே உன் உரிமை; பலனில் அல்ல. பலனை குறிக்கோளாக கொள்ளாதே, செயலின்மையிலும் நிற்காதே.",
    hi: "कर्म करने में ही तेरा अधिकार है, फलों में नहीं। कर्म-फल की कामना मत कर, और निष्क्रियता में भी मत डूब।",
  },
  {
    id: "bg_2_20",
    original:
      "न जायते म्रियते वा कदाचिन्\nनायं भूत्वा भविता वा न भूयः।\nअजो नित्यः शाश्वतोऽयं पुराणो\nन हन्यते हन्यमाने शरीरे॥",
    originalLang: "sa",
    source: "Bhagavad Gita 2.20",
    sourceShort: "BG 2.20",
    en: "The soul is never born nor dies at any time. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain.",
    ta: "ஆத்மா எந்த காலத்திலும் பிறக்கவில்லை, மரிக்கவில்லை. இது பிறப்பற்றது, நித்தியமானது, சாசுவதமானது. உடல் அழிந்தாலும் இது அழிவதில்லை.",
    hi: "आत्मा न कभी जन्म लेती है और न कभी मरती है। यह अजन्मा, नित्य, शाश्वत और पुरातन है। शरीर के नष्ट होने पर भी यह नष्ट नहीं होती।",
  },
  {
    id: "bg_4_7",
    original:
      "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    originalLang: "sa",
    source: "Bhagavad Gita 4.7",
    sourceShort: "BG 4.7",
    en: "Whenever righteousness wanes and unrighteousness increases, I manifest Myself. For the protection of the good and the destruction of evil, I come into being age after age.",
    ta: "எப்போதெல்லாம் தர்மம் தேய்கிறதோ, அதர்மம் வளர்கிறதோ, அப்போது நான் அவதாரம் எடுக்கிறேன். நல்லோரைக் காக்கவும் தீயோரை அழிக்கவும் யுகம் தோறும் தோன்றுவேன்.",
    hi: "जब-जब धर्म की हानि होती है और अधर्म की वृद्धि होती है, तब-तब मैं प्रकट होता हूँ। साधुओं की रक्षा और दुष्टों के विनाश के लिए युग-युग में जन्म लेता हूँ।",
  },
  {
    id: "bg_9_22",
    original:
      "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
    originalLang: "sa",
    source: "Bhagavad Gita 9.22",
    sourceShort: "BG 9.22",
    en: "For those who worship Me with devotion, meditating on My form — I carry what they lack and preserve what they have.",
    ta: "என்னையே நினைத்து என்னையே வணங்கும் பக்தர்களுக்கு, அவர்களுக்கு இல்லாதவற்றை நான் அளிக்கிறேன், இருப்பதை நான் காக்கிறேன்.",
    hi: "जो लोग अनन्य भाव से मेरी उपासना करते हैं, उन नित्ययुक्त भक्तों का योगक्षेम मैं स्वयं वहन करता हूँ।",
  },
  {
    id: "bg_18_66",
    original:
      "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    originalLang: "sa",
    source: "Bhagavad Gita 18.66",
    sourceShort: "BG 18.66",
    en: "Abandon all varieties of religion and simply surrender unto Me. I shall deliver you from all sinful reaction. Do not fear.",
    ta: "எல்லா கடமைகளையும் விட்டு என்னை மட்டும் சரண் அடை. நான் உன்னை எல்லா பாவங்களிலிருந்தும் விடுவிப்பேன். பயப்படாதே.",
    hi: "सभी धर्मों को छोड़कर केवल मेरी शरण में आ। मैं तुझे सभी पापों से मुक्त कर दूँगा — शोक मत कर।",
  },
  {
    id: "bg_6_5",
    original:
      "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    originalLang: "sa",
    source: "Bhagavad Gita 6.5",
    sourceShort: "BG 6.5",
    en: "Elevate yourself through the power of your mind, and do not degrade yourself. The mind is your best friend — and your greatest enemy.",
    ta: "மனதால் உன்னை நீயே உயர்த்திக்கொள், தாழ்த்திக்கொள்ளாதே. மனமே உன் நண்பன், மனமே உன் பகைவன்.",
    hi: "अपने मन के द्वारा अपना उद्धार करो, अपने को अधोगति में मत डालो। मन ही मनुष्य का मित्र है और मन ही शत्रु।",
  },
  {
    id: "thirukkural_1",
    original: "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.",
    originalLang: "ta",
    source: "Thirukkural 1.1",
    sourceShort: "குறள் 1",
    en: "As 'A' is the first of all letters, so the Primal God is first in all the world.",
    ta: "எழுத்துக்கெல்லாம் 'அ' என்பது முதல் எழுத்து — அதுபோல, கடவுளே இந்த உலகிற்கு முதல்வன்.",
    hi: "जैसे 'अ' सभी अक्षरों का आधार है, वैसे ही आदि भगवान इस संसार का मूल हैं।",
  },
  {
    id: "thirukkural_391",
    original: "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.",
    originalLang: "ta",
    source: "Thirukkural 39.1",
    sourceShort: "குறள் 391",
    en: "Learn thoroughly what is worth learning; and having learned it, live accordingly.",
    ta: "கற்க வேண்டியதை முழுதாக கற்று, கற்றதற்கு ஏற்ப நடக்க வேண்டும்.",
    hi: "जो सीखने योग्य है उसे पूरी तरह सीखो, और जो सीखा है उसके अनुसार जियो।",
  },
  {
    id: "bg_3_21",
    original:
      "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः।\nस यत्प्रमाणं कुरुते लोकस्तदनुवर्तते॥",
    originalLang: "sa",
    source: "Bhagavad Gita 3.21",
    sourceShort: "BG 3.21",
    en: "Whatever a great person does, common people follow. The standard they set — the world pursues.",
    ta: "சிறந்தவர்கள் எதை செய்கிறார்களோ, பொதுமக்கள் அதையே பின்பற்றுகிறார்கள். அவர்கள் நிறுவும் தரத்தை உலகம் பின்பற்றும்.",
    hi: "श्रेष्ठ पुरुष जो-जो करता है, दूसरे मनुष्य वैसा ही करते हैं। वह जो प्रमाण स्थापित करता है, लोग उसी का अनुसरण करते हैं।",
  },
  {
    id: "bg_10_20",
    original:
      "अहमात्मा गुडाकेश सर्वभूताशयस्थितः।\nअहमादिश्च मध्यं च भूतानामन्त एव च॥",
    originalLang: "sa",
    source: "Bhagavad Gita 10.20",
    sourceShort: "BG 10.20",
    en: "I am the Self, seated in the hearts of all creatures. I am the beginning, the middle, and the end of all beings.",
    ta: "நான் எல்லா உயிர்களின் உள்ளத்திலும் வாழும் ஆத்மா. நான் எல்லா உயிர்களின் ஆரம்பமும், நடுவும், முடிவும்.",
    hi: "मैं समस्त प्राणियों के हृदय में स्थित आत्मा हूँ। मैं समस्त प्राणियों का आदि, मध्य और अंत भी हूँ।",
  },
  {
    id: "chandogya_tat_tvam_asi",
    original: "तत्त्वमसि॥\nसर्वं खल्विदं ब्रह्म।",
    originalLang: "sa",
    source: "Chandogya Upanishad 6.8.7",
    sourceShort: "Chandogya Up.",
    en: "Thou Art That. All this universe is Brahman. You are not separate from the divine — the divine is what you are.",
    ta: "நீயே அது — தத் த்வம் அஸி. இந்த உலகம் முழுவதும் பிரம்மம். நீ தெய்வத்திலிருந்து பிரிந்தவன் அல்ல; நீயே தெய்வம்.",
    hi: "तत् त्वम् असि — वह तू ही है। यह सारा जगत ब्रह्म है। तू दिव्यता से अलग नहीं, तू स्वयं दिव्यता है।",
  },
  {
    id: "satyam_eva_jayate",
    original:
      "सत्यमेव जयते नानृतं\nसत्येन पन्था विततो देवयानः।",
    originalLang: "sa",
    source: "Mundaka Upanishad 3.1.6",
    sourceShort: "Mundaka Up.",
    en: "Truth alone triumphs, not falsehood. Through truth the path of the gods — the path of liberation — is laid out.",
    ta: "உண்மை மட்டுமே வெற்றி பெறும், பொய் அல்ல. உண்மையால் தேவர்களின் பாதை — மோட்சத்தின் பாதை — அமைக்கப்படுகிறது.",
    hi: "सत्य की जय होती है, असत्य की नहीं। सत्य के द्वारा देवयान मार्ग — मुक्ति का मार्ग — प्रशस्त होता है।",
  },
  {
    id: "bg_2_14",
    original:
      "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥",
    originalLang: "sa",
    source: "Bhagavad Gita 2.14",
    sourceShort: "BG 2.14",
    en: "Heat and cold, pleasure and pain — these arise from sense contact, they come and go, they are fleeting. Simply endure them, O Arjuna.",
    ta: "புலன்கள் பொருளுடன் சேரும்போது சுகமும் துக்கமும் தோன்றும். இவை நிலையற்றவை — வருகின்றன, போகின்றன. இவற்றை பொறுத்துக்கொள்.",
    hi: "इन्द्रियों के विषयों का संपर्क सर्दी-गर्मी, सुख-दुःख देता है। ये आने-जाने वाले अनित्य हैं — हे भारत, इन्हें सहन कर।",
  },
  {
    id: "bg_8_7",
    original:
      "तस्मात्सर्वेषु कालेषु मामनुस्मर युध्य च।\nमय्यर्पितमनोबुद्धिर्मामेवैष्यस्यसंशयम्॥",
    originalLang: "sa",
    source: "Bhagavad Gita 8.7",
    sourceShort: "BG 8.7",
    en: "Remember Me at all times while doing your duties. With mind and intelligence fixed on Me, you will attain Me — of this there is no doubt.",
    ta: "எனவே எப்போதும் என்னை நினைத்துக்கொண்டே உன் கடமையை செய். உன் மனமும் புத்தியும் என்னிடம் அர்ப்பணிக்கப்பட்டால், நீ என்னையே அடைவாய்.",
    hi: "इसलिए सभी समयों में मुझे स्मरण कर और अपना कर्म भी कर। मुझमें अर्पित मन-बुद्धि से तू निश्चय ही मुझे प्राप्त करेगा।",
  },
  {
    id: "taittiriya_dharma",
    original: "सत्यं वद। धर्मं चर।\nस्वाध्यायान्मा प्रमदः।",
    originalLang: "sa",
    source: "Taittiriya Upanishad 1.11.1",
    sourceShort: "Taittiriya Up.",
    en: "Speak the truth. Walk the path of dharma. Do not neglect self-study and the pursuit of wisdom.",
    ta: "உண்மை பேசு. தர்ம வழியில் நட. தனக்கு தானே கற்பதை மறவாதே.",
    hi: "सत्य बोलो। धर्म का आचरण करो। स्वाध्याय से कभी प्रमाद मत करो।",
  },
  {
    id: "bg_12_15",
    original:
      "यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः।\nहर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः॥",
    originalLang: "sa",
    source: "Bhagavad Gita 12.15",
    sourceShort: "BG 12.15",
    en: "One who neither disturbs the world nor is disturbed by it — free from joy, envy, fear, and anxiety — is dear to Me.",
    ta: "யாரால் உலகம் கலங்குவதில்லையோ, யாருக்கும் உலகம் கலக்கம் தருவதில்லையோ — மகிழ்ச்சி, பொறாமை, பயம், கலக்கம் ஆகியவற்றிலிருந்து விடுபட்டவர் — அவர் எனக்கு அன்பானவர்.",
    hi: "जो न संसार को उद्विग्न करता है और न स्वयं उद्विग्न होता है — जो हर्ष, अमर्ष, भय और उद्वेग से मुक्त है — वह मुझे प्रिय है।",
  },
  {
    id: "ramacharitmanas_ram_naam",
    original:
      "राम नाम अवलम्ब बिनु परमारथ की आस।\nबरषत वारिद पवन बिनु त्यों होइ न अविनास॥",
    originalLang: "sa",
    source: "Ramcharitmanas · Tulsidas",
    sourceShort: "रामचरितमानस",
    en: "Without taking shelter in Rama's name, the hope for liberation is vain — like expecting rain without clouds or wind.",
    ta: "இராமனின் நாமத்தை சரணடையாமல் மோட்சம் கிட்டாது — மேகமும் காற்றும் இல்லாமல் மழை வராது போல.",
    hi: "राम नाम के आश्रय बिना परमार्थ की आशा वैसी ही है जैसे बादल और वायु बिना वर्षा की आशा।",
  },
  {
    id: "bg_15_15",
    original:
      "सर्वस्य चाहं हृदि सन्निविष्टो\nमत्तः स्मृतिर्ज्ञानमपोहनं च।",
    originalLang: "sa",
    source: "Bhagavad Gita 15.15",
    sourceShort: "BG 15.15",
    en: "I am seated in everyone's heart. From Me come memory, knowledge, and forgetfulness. I am the goal of all the Vedas.",
    ta: "நான் எல்லோரின் உள்ளத்திலும் வாழ்கிறேன். என்னிடமிருந்தே நினைவும், ஞானமும், மறதியும் வருகின்றன. எல்லா வேதங்களாலும் அறியப்படவேண்டியவன் நான்.",
    hi: "मैं सबके हृदय में स्थित हूँ। मुझसे ही स्मृति, ज्ञान और विस्मृति होती है। सभी वेदों द्वारा मैं जानने योग्य हूँ।",
  },
  {
    id: "bg_17_3",
    original:
      "सत्त्वानुरूपा सर्वस्य श्रद्धा भवति भारत।\nश्रद्धामयोऽयं पुरुषो यो यच्छ्रद्धः स एव सः॥",
    originalLang: "sa",
    source: "Bhagavad Gita 17.3",
    sourceShort: "BG 17.3",
    en: "Each person's faith is shaped by their own nature. As the faith, so the person — we become what we believe.",
    ta: "ஒவ்வொருவரின் நம்பிக்கையும் அவர்களின் இயல்புக்கு ஏற்றபடி இருக்கும். மனிதன் நம்பிக்கையால் ஆனவன் — எந்த நம்பிக்கை கொண்டவனோ, அவன் அதுவே.",
    hi: "प्रत्येक मनुष्य की श्रद्धा उसके स्वभाव के अनुसार होती है। यह पुरुष श्रद्धामय है — जैसी उसकी श्रद्धा, वैसा ही वह है।",
  },
  {
    id: "thirukkural_love",
    original: "அன்பிலார் எல்லாம் தமக்குரியர் அன்புடையார்\nஎன்பும் உரியர் பிறர்க்கு.",
    originalLang: "ta",
    source: "Thirukkural 7.2",
    sourceShort: "குறள் 72",
    en: "Those without love own everything for themselves; those with love give even their bones — their very self — to others.",
    ta: "அன்பில்லாதவர்கள் எல்லாவற்றையும் தமக்காகவே வைத்துக்கொள்கிறார்கள். அன்புடையவர்கள் தம் உடலையும் பிறருக்கே அர்ப்பணிக்கிறார்கள்.",
    hi: "जिनमें प्रेम नहीं वे सब कुछ अपने लिए रखते हैं; जिनमें प्रेम है, वे अपनी हड्डियाँ भी दूसरों के लिए दे देते हैं।",
  },
];
