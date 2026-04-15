import { Verse, Chapter } from "../types";

export const chapters: Chapter[] = [
  { number: 1, name: "Arjuna Vishada Yoga", verseCount: 47 },
  { number: 2, name: "Sankhya Yoga", verseCount: 72 },
  { number: 3, name: "Karma Yoga", verseCount: 43 },
  { number: 4, name: "Jnana Karma Sanyasa Yoga", verseCount: 42 },
  { number: 5, name: "Karma Sanyasa Yoga", verseCount: 29 },
  { number: 6, name: "Atma Samyama Yoga", verseCount: 47 },
  { number: 7, name: "Jnana Vijnana Yoga", verseCount: 30 },
  { number: 8, name: "Akshara Brahma Yoga", verseCount: 28 },
  { number: 9, name: "Raja Vidya Raja Guhya Yoga", verseCount: 34 },
  { number: 10, name: "Vibhuti Yoga", verseCount: 42 },
  { number: 11, name: "Vishwarupa Darshana Yoga", verseCount: 55 },
  { number: 12, name: "Bhakti Yoga", verseCount: 20 },
  { number: 13, name: "Kshetra Kshetrajna Vibhaga Yoga", verseCount: 35 },
  { number: 14, name: "Gunatraya Vibhaga Yoga", verseCount: 27 },
  { number: 15, name: "Purushottama Yoga", verseCount: 20 },
  { number: 16, name: "Daivasura Sampad Vibhaga Yoga", verseCount: 24 },
  { number: 17, name: "Shraddhatraya Vibhaga Yoga", verseCount: 28 },
  { number: 18, name: "Moksha Sanyasa Yoga", verseCount: 78 },
];

export const verses: Verse[] = [
  // ── Chapter 1 ──────────────────────────────────────────
  {
    chapter: 1,
    verse: 1,
    sanskrit:
      "धृतराष्ट्र उवाच।\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥",
    transliteration:
      "dhṛtarāṣṭra uvāca\ndharma-kṣetre kuru-kṣetre samavetā yuyutsavaḥ\nmāmakāḥ pāṇḍavāś caiva kim akurvata sañjaya",
    wordByWord: [
      { word: "धर्मक्षेत्रे", meaning: "in the place of pilgrimage / dharma" },
      { word: "कुरुक्षेत्रे", meaning: "in the field of Kuru" },
      { word: "समवेताः", meaning: "assembled together" },
      { word: "युयुत्सवः", meaning: "desiring to fight" },
      { word: "मामकाः", meaning: "my sons" },
      { word: "पाण्डवाः", meaning: "the sons of Pandu" },
      { word: "किम्", meaning: "what" },
      { word: "अकुर्वत", meaning: "did they do" },
    ],
    meaningEN:
      "Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?",
    meaningTA:
      "திருதராஷ்டிரன் கூறினான்: ஓ சஞ்சயா, தர்மத்தளமான குருக்ஷேத்திரத்தில் கூடிய என் மகன்களும் பாண்டு மகன்களும் என்ன செய்தார்கள்?",
    reflection:
      "Before any great endeavour, we must ask ourselves — what is the field I am standing on, and what am I truly fighting for?",
    reflectionTA:
      "எந்த முயற்சியிலும் முதலில் இந்த கேள்வி: நான் எந்த தளத்தில் நிற்கிறேன், எதற்காக போரிடுகிறேன்?",
    // Word-level timestamps from ffmpeg silencedetect on /audio/001_001.mp3
    // Speaker intro (dhṛtarāṣṭra uvāca): 0.29–3.33s (continuous — split at midpoint)
    // Big silence / verse-number gap: 3.33–5.46s
    // Pāda 1: 5.46–9.32s  |  Pāda 2: 10.22–13.26s
    // Pāda 3: 14.57–17.16s  |  Pāda 4: 18.27–22.30s
    wordTimestamps: [
      { word: "dhṛtarāṣṭra",   start: 0.29,  end: 2.40  },
      { word: "uvāca",          start: 2.40,  end: 3.33  },
      { word: "dharmakṣetre",   start: 5.46,  end: 7.27  },
      { word: "kurukṣetre",     start: 7.62,  end: 9.32  },
      { word: "samavetā",       start: 10.22, end: 11.74 },
      { word: "yuyutsavaḥ",     start: 11.74, end: 13.26 },
      { word: "māmakāḥ",        start: 14.57, end: 15.30 },
      { word: "pāṇḍavāścaiva",  start: 15.50, end: 17.16 },
      { word: "kimakurvata",    start: 18.27, end: 21.37 },
      { word: "sañjaya",        start: 21.62, end: 22.30 },
    ],
  },
  {
    chapter: 1,
    verse: 2,
    sanskrit:
      "सञ्जय उवाच।\nदृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा।\nआचार्यमुपसङ्गम्य राजा वचनमब्रवीत्॥",
    transliteration:
      "sañjaya uvāca\ndṛṣṭvā tu pāṇḍavānīkaṃ vyūḍhaṃ duryodhanas tadā\nācāryam upasaṅgamya rājā vacanam abravīt",
    wordByWord: [
      { word: "दृष्ट्वा", meaning: "after seeing" },
      { word: "पाण्डवानीकम्", meaning: "the army of the Pandavas" },
      { word: "व्यूढम्", meaning: "arranged in military formation" },
      { word: "दुर्योधनः", meaning: "King Duryodhana" },
      { word: "आचार्यम्", meaning: "the teacher (Drona)" },
      { word: "उपसङ्गम्य", meaning: "approaching" },
      { word: "वचनम्", meaning: "words" },
      { word: "अब्रवीत्", meaning: "spoke" },
    ],
    meaningEN:
      "Sanjaya said: O King, after looking over the army arranged by the sons of Pandu, King Duryodhana went to his teacher Drona and spoke the following words.",
    meaningTA:
      "சஞ்சயன் கூறினான்: பாண்டவ சேனையின் அணிவகுப்பை கண்ட துர்யோதனன், ஆசிரியர் திரோணரை அணுகி இவ்வாறு கூறினான்.",
    reflection:
      "Even a king needs to consult his teacher in moments of uncertainty — wisdom guides strategy.",
    reflectionTA:
      "சந்தேகமான தருணங்களில் ஒரு ராஜனும் ஆசிரியரின் ஆலோசனை தேவை — ஞானம் உத்திக்கு வழி காட்டுகிறது.",
  },
  {
    chapter: 1,
    verse: 3,
    sanskrit:
      "पश्यैतां पाण्डुपुत्राणामाचार्य महतीं चमूम्।\nव्यूढां द्रुपदपुत्रेण तव शिष्येण धीमता॥",
    transliteration:
      "paśyaitāṃ pāṇḍuputrāṇām ācārya mahatīṃ camūm\nvyūḍhāṃ drupadaputreṇa tava śiṣyeṇa dhīmatā",
    wordByWord: [
      { word: "पश्य", meaning: "behold / look" },
      { word: "पाण्डुपुत्राणाम्", meaning: "of the sons of Pandu" },
      { word: "महतीम्", meaning: "great" },
      { word: "चमूम्", meaning: "army" },
      { word: "व्यूढाम्", meaning: "arranged" },
      { word: "द्रुपदपुत्रेण", meaning: "by the son of Drupada" },
      { word: "शिष्येण", meaning: "by your disciple" },
      { word: "धीमता", meaning: "intelligent" },
    ],
    meaningEN:
      "O my teacher, behold the great army of the sons of Pandu, so expertly arranged by your intelligent disciple Dhrishtadyumna, the son of Drupada.",
    meaningTA:
      "ஓ ஆசிரியா, உங்கள் புத்திசாலி சிஷ்யன் திருஷ்டத்யும்னன் திறமையாக அமைத்த பாண்டவர் படையைப் பாருங்கள்.",
    reflection:
      "A student who applies the teacher's knowledge wisely brings honour to the guru — our actions reflect our upbringing.",
    reflectionTA:
      "ஆசிரியரின் கற்பிப்பை நுண்ணறிவுடன் பயன்படுத்தும் சீடன் குருவிற்கு பெருமை சேர்க்கிறான் — நம் செயல்கள் நம் வளர்ப்பை பிரதிபலிக்கின்றன.",
  },
  {
    chapter: 1,
    verse: 4,
    sanskrit:
      "अत्र शूरा महेष्वासा भीमार्जुनसमा युधि।\nयुयुधानो विराटश्च द्रुपदश्च महारथः॥",
    transliteration:
      "atra śūrā maheṣvāsā bhīmārjuna-samā yudhi\nyuyudhāno virāṭaś ca drupadaś ca mahārathaḥ",
    wordByWord: [
      { word: "अत्र", meaning: "here" },
      { word: "शूराः", meaning: "heroes / warriors" },
      { word: "महेष्वासाः", meaning: "mighty bowmen" },
      { word: "भीमार्जुनसमाः", meaning: "equal to Bhima and Arjuna" },
      { word: "युयुधानः", meaning: "Yuyudhana (Satyaki)" },
      { word: "विराटः", meaning: "King Virata" },
      { word: "द्रुपदः", meaning: "King Drupada" },
      { word: "महारथः", meaning: "great chariot warrior" },
    ],
    meaningEN:
      "Here in this army are many heroic bowmen equal in fighting to Bhima and Arjuna — great warriors like Yuyudhana, Virata, and Drupada.",
    meaningTA:
      "இங்கே பீமனும் அர்ஜுனனுக்கும் நிகரான வீரர்கள் பலர் உள்ளனர் — யுயுதான, விராட, துருபதன் போன்ற மகாரதர்கள்.",
    reflection:
      "Recognise the strengths of those around you — in every challenge, there are people as capable and committed as the best.",
    reflectionTA:
      "உங்களைச் சுற்றியுள்ளவர்களின் பலத்தை அங்கீகரியுங்கள் — ஒவ்வொரு சவாலிலும் சிறந்தவர்களுக்கு இணையான திறமையாளர்கள் உள்ளனர்.",
  },
  {
    chapter: 1,
    verse: 5,
    sanskrit:
      "धृष्टकेतुश्चेकितानः काशिराजश्च वीर्यवान्।\nपुरुजित्कुन्तिभोजश्च शैब्यश्च नरपुङ्गवः॥",
    transliteration:
      "dhṛṣṭaketuś cekitānaḥ kāśirājaś ca vīryavān\npurujit kuntibhojaś ca śaibyaś ca narapuṃgavaḥ",
    wordByWord: [
      { word: "धृष्टकेतुः", meaning: "Dhrishtaketu" },
      { word: "चेकितानः", meaning: "Chekitana" },
      { word: "काशिराजः", meaning: "King of Kashi" },
      { word: "वीर्यवान्", meaning: "very powerful / energetic" },
      { word: "पुरुजित्", meaning: "Purujit" },
      { word: "कुन्तिभोजः", meaning: "Kuntibhoja" },
      { word: "शैब्यः", meaning: "Shaibya" },
      { word: "नरपुङ्गवः", meaning: "best among men" },
    ],
    meaningEN:
      "There are also great warriors like Dhrishtaketu, Chekitana, Kashiraja, Purujit, Kuntibhoja and Shaibya — all best among men.",
    meaningTA:
      "திருஷ்டகேது, சேகிதான, காசிராஜன், புருஜித், குந்திபோஜன், சைப்யன் போன்ற நரபுங்கவர்களும் இங்கு உள்ளனர்.",
    reflection:
      "Greatness is found in people from all walks of life — every person carries a unique strength worth acknowledging.",
    reflectionTA:
      "மேன்மை எல்லா தரப்பிலும் காணலாம் — ஒவ்வொருவரும் தனித்துவமான ஆற்றல் கொண்டவர்.",
  },
  {
    chapter: 1,
    verse: 6,
    sanskrit:
      "युधामन्युश्च विक्रान्त उत्तमौजाश्च वीर्यवान्।\nसौभद्रो द्रौपदेयाश्च सर्व एव महारथाः॥",
    transliteration:
      "yudhāmanyuś ca vikrānta uttamaujāś ca vīryavān\nsaubhadro draupadeyāś ca sarva eva mahārathāḥ",
    wordByWord: [
      { word: "युधामन्युः", meaning: "Yudhamanyu" },
      { word: "विक्रान्तः", meaning: "the mighty one" },
      { word: "उत्तमौजाः", meaning: "Uttamauja" },
      { word: "वीर्यवान्", meaning: "very powerful" },
      { word: "सौभद्रः", meaning: "Abhimanyu, son of Subhadra" },
      { word: "द्रौपदेयाः", meaning: "sons of Draupadi" },
      { word: "सर्वे", meaning: "all" },
      { word: "महारथाः", meaning: "great chariot warriors" },
    ],
    meaningEN:
      "There are the mighty Yudhamanyu, the powerful Uttamauja, the son of Subhadra and the sons of Draupadi — all great chariot fighters.",
    meaningTA:
      "வலிமையான யுதாமன்யு, உத்தமௌஜஸ், சுபத்திரையின் மகன், திரௌபதியின் மகன்கள் — இவர்கள் யாவரும் மகாரதர்கள்.",
    reflection:
      "Every generation carries forward the legacy of courage — our children and students are the warriors of tomorrow.",
    reflectionTA:
      "ஒவ்வொரு தலைமுறையும் தைரியத்தின் மரபைத் தொடர்கிறது — நம் பிள்ளைகளும் மாணவர்களும் நாளைய வீரர்கள்.",
  },
  {
    chapter: 1,
    verse: 7,
    sanskrit:
      "अस्माकं तु विशिष्टा ये तान्निबोध द्विजोत्तम।\nनायका मम सैन्यस्य संज्ञार्थं तान्ब्रवीमि ते॥",
    transliteration:
      "asmākaṃ tu viśiṣṭā ye tān nibodha dvijottama\nnāyakā mama sainyasya saṃjñārthaṃ tān bravīmi te",
    wordByWord: [
      { word: "अस्माकम्", meaning: "on our side" },
      { word: "विशिष्टाः", meaning: "especially qualified" },
      { word: "तान्", meaning: "them" },
      { word: "निबोध", meaning: "take note / know" },
      { word: "द्विजोत्तम", meaning: "O best of brahmanas" },
      { word: "नायकाः", meaning: "commanders / leaders" },
      { word: "सैन्यस्य", meaning: "of the army" },
      { word: "ब्रवीमि", meaning: "I am telling" },
    ],
    meaningEN:
      "O best of the brahmanas, let me tell you about the captains who are especially qualified to lead my military force.",
    meaningTA:
      "ஓ பார்ப்பனச் சிறந்தவனே, என் படையை வழிநடத்தும் தலைவர்களை உங்களுக்கு சொல்கிறேன் — கவனமாக கேளுங்கள்.",
    reflection:
      "A good leader knows not just the strength of the enemy, but also celebrates the excellence within their own team.",
    reflectionTA:
      "நல்ல தலைவன் எதிரியின் பலத்தை மட்டுமல்ல, தன் அணியினரின் சிறப்பையும் பாராட்டுகிறான்.",
  },
  {
    chapter: 1,
    verse: 8,
    sanskrit:
      "भवान्भीष्मश्च कर्णश्च कृपश्च समितिञ्जयः।\nअश्वत्थामा विकर्णश्च सौमदत्तिस्तथैव च॥",
    transliteration:
      "bhavān bhīṣmaś ca karṇaś ca kṛpaś ca samitiñjayaḥ\naśvatthāmā vikarṇaś ca saumadattis tathaiva ca",
    wordByWord: [
      { word: "भवान्", meaning: "yourself (Drona)" },
      { word: "भीष्मः", meaning: "Grandfather Bhishma" },
      { word: "कर्णः", meaning: "Karna" },
      { word: "कृपः", meaning: "Kripa" },
      { word: "समितिञ्जयः", meaning: "always victorious in battle" },
      { word: "अश्वत्थामा", meaning: "Ashvatthama" },
      { word: "विकर्णः", meaning: "Vikarna" },
      { word: "सौमदत्तिः", meaning: "Bhurishrava, son of Somadatta" },
    ],
    meaningEN:
      "There are personalities like you, Bhishma, Karna, Kripa, Ashvatthama, Vikarna and Bhurishrava — all always victorious in battle.",
    meaningTA:
      "நீங்கள், பீஷ்மர், கர்ணன், கிருபர், அஸ்வத்தாமா, n��ிகர்ணன், பூரிஷ்ரவஸ் — இவர்கள் யாவரும் வெற்றி வீரர்கள்.",
    reflection:
      "Acknowledging the greatness of those on our side gives us confidence — knowing our support system strengthens our resolve.",
    reflectionTA:
      "நம் பக்கத்தினரின் மாண்பை ஒப்புக்கொள்வது நம்பிக்கையை வளர்க்கும் — ஆதரவை அறிவது உறுதியை தருகிறது.",
  },
  {
    chapter: 1,
    verse: 9,
    sanskrit:
      "अन्ये च बहवः शूरा मदर्थे त्यक्तजीविताः।\nनानाशस्त्रप्रहरणाः सर्वे युद्धविशारदाः॥",
    transliteration:
      "anye ca bahavaḥ śūrā mad-arthe tyakta-jīvitāḥ\nnānā-śastra-praharaṇāḥ sarve yuddha-viśāradāḥ",
    wordByWord: [
      { word: "अन्ये", meaning: "others" },
      { word: "बहवः", meaning: "many" },
      { word: "शूराः", meaning: "heroes" },
      { word: "मदर्थे", meaning: "for my sake" },
      { word: "त्यक्तजीविताः", meaning: "ready to give up their lives" },
      { word: "नानाशस्त्रप्रहरणाः", meaning: "equipped with various weapons" },
      { word: "सर्वे", meaning: "all of them" },
      { word: "युद्धविशारदाः", meaning: "experienced in military science" },
    ],
    meaningEN:
      "There are many other heroes who are prepared to lay down their lives for my sake — all equipped with different kinds of weapons and experienced in military science.",
    meaningTA:
      "வேறு பல வீரர்களும் என்னிடம் மிகுந்த பற்றுடன் உயிரை விட தயாராக உள்ளனர் — அனைவரும் பல்வேறு ஆயுதங்களில் தேர்ந்தவர்கள்.",
    reflection:
      "True dedication means being fully prepared and willing to give everything for a worthy cause.",
    reflectionTA:
      "உண்மையான அர்ப்பணிப்பு என்பது முழுமையான தயார்நிலை — தகுதியான காரணத்திற்காக எல்லாவற்றையும் கொடுக்க தயாராக இருப்பது.",
  },
  {
    chapter: 1,
    verse: 10,
    sanskrit:
      "अपर्याप्तं तदस्माकं बलं भीष्माभिरक्षितम्।\nपर्याप्तं त्विदमेतेषां बलं भीमाभिरक्षितम्॥",
    transliteration:
      "aparyāptaṃ tad asmākaṃ balaṃ bhīṣmābhirakṣitam\nparyāptaṃ tv idam eteṣāṃ balaṃ bhīmābhirakṣitam",
    wordByWord: [
      { word: "अपर्याप्तम्", meaning: "immeasurable / unlimited" },
      { word: "तत्", meaning: "that" },
      { word: "अस्माकम्", meaning: "our" },
      { word: "बलम्", meaning: "strength" },
      { word: "भीष्माभिरक्षितम्", meaning: "perfectly protected by Bhishma" },
      { word: "पर्याप्तम्", meaning: "limited / measured" },
      { word: "इदम्", meaning: "this" },
      { word: "भीमाभिरक्षितम्", meaning: "protected by Bhima" },
    ],
    meaningEN:
      "Our strength, protected by Grandfather Bhishma, is immeasurable. But the strength of the Pandavas, protected by Bhima, is limited.",
    meaningTA:
      "பீஷ்மரால் பாதுகாக்கப்பட்ட நம் பலம் அளவற்றது. ஆனால் பீமனால் பாதுகாக்கப்பட்ட அவர்களின் பலம் அளவானது.",
    reflection:
      "We often overestimate our own strength and underestimate those we oppose — humility brings clearer vision.",
    reflectionTA:
      "நாம் பெரும்பாலும் நம் வலிமையை மிகைப்படுத்துகிறோம், எதிரியை குறைத்து மதிப்பிடுகிறோம் — தாழ்மை தெளிவான பார்வையை தருகிறது.",
  },

  // Ch1 verses 11–47 placeholder
  ...Array.from({ length: 37 }, (_, i) => ({
    chapter: 1,
    verse: i + 11,
    sanskrit: "Content to be populated",
    transliteration: "Content to be populated",
    wordByWord: [],
    meaningEN: "Content to be populated",
    reflection: "Content to be populated",
    isPlaceholder: true,
  })),

  // ── Chapter 2 ──────────────────────────────────────────
  {
    chapter: 2,
    verse: 1,
    sanskrit:
      "सञ्जय उवाच।\nतं तथा कृपयाविष्टमश्रुपूर्णाकुलेक्षणम्।\nविषीदन्तमिदं वाक्यमुवाच मधुसूदनः॥",
    transliteration:
      "sañjaya uvāca\ntaṃ tathā kṛpayāviṣṭam aśrupūrṇākulekṣaṇam\nviṣīdantam idaṃ vākyam uvāca madhusūdanaḥ",
    wordByWord: [
      { word: "कृपयाविष्टम्", meaning: "overcome by compassion" },
      {
        word: "अश्रुपूर्णाकुलेक्षणम्",
        meaning: "eyes full of tears and confused",
      },
      { word: "विषीदन्तम्", meaning: "grieving" },
      { word: "मधुसूदनः", meaning: "Krishna, killer of the demon Madhu" },
      { word: "उवाच", meaning: "spoke" },
    ],
    meaningEN:
      "Sanjaya said: Seeing Arjuna full of compassion, his mind depressed, his eyes full of tears, Krishna spoke the following words.",
    meaningTA:
      "சஞ்சயன் கூறினான்: இரக்கத்தால் வாடி, கண்களில் கண்ணீர் நிரம்பி, துக்கமடைந்த அர்ஜுனனிடம் மதுசூதனன் இவ்வாறு கூறினான்.",
    reflection:
      "Our greatest teacher often speaks to us precisely at the moment we are most broken and most open to learning.",
    reflectionTA:
      "நம் பெரிய ஆசிரியர் நாம் மிகவும் உடைந்திருக்கும் தருணத்திலேயே பேசுகிறார் — அப்போதுதான் நாம் கேட்கத் தயாராக இருக்கிறோம்.",
  },
  {
    chapter: 2,
    verse: 2,
    sanskrit:
      "श्रीभगवानुवाच।\nकुतस्त्वा कश्मलमिदं विषमे समुपस्थितम्।\nअनार्यजुष्टमस्वर्ग्यमकीर्तिकरमर्जुन॥",
    transliteration:
      "śrī-bhagavān uvāca\nkutas tvā kaśmalam idaṃ viṣame samupasthitam\nanārya-juṣṭam asvargyam akīrti-karam arjuna",
    wordByWord: [
      { word: "कुतः", meaning: "from where / how" },
      { word: "कश्मलम्", meaning: "impurity / dejection" },
      { word: "विषमे", meaning: "in a critical hour" },
      { word: "अनार्यजुष्टम्", meaning: "not fitting for a noble person" },
      { word: "अस्वर्ग्यम्", meaning: "not leading to higher realms" },
      { word: "अकीर्तिकरम्", meaning: "bringing infamy" },
    ],
    meaningEN:
      "The Supreme Lord said: My dear Arjuna, how have these impurities come upon you at this critical hour? They do not befit a man of nobility and lead only to infamy.",
    meaningTA:
      "இறைவன் கூறினான்: அர்ஜுனா, இந்த இக்கட்டான நேரத்தில் இந்த மனவேலி எங்கிருந்து வந்தது? இது உயர்ந்த மனிதனுக்கு தகாது, அவமானத்தை மட்டுமே தரும்.",
    reflection:
      "Weakness is not wrong, but yielding to it at a decisive moment defines our character — we must rise above it.",
    reflectionTA:
      "பலவீனம் தவறில்லை, ஆனால் முக்கியமான தருணத்தில் அதற்கு அடிபணிவது நம் குணத்தை வரையறுக்கிறது — நாம் அதை கடந்து எழ வேண்டும்.",
  },
  {
    chapter: 2,
    verse: 3,
    sanskrit:
      "क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते।\nक्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप॥",
    transliteration:
      "klaibyaṃ mā sma gamaḥ pārtha naitat tvayy upapadyate\nkṣudraṃ hṛdaya-daurbalyaṃ tyaktvottiṣṭha paraṃtapa",
    wordByWord: [
      { word: "क्लैब्यम्", meaning: "impotence / cowardice" },
      { word: "मा स्म गमः", meaning: "do not succumb to" },
      { word: "पार्थ", meaning: "O son of Pritha (Arjuna)" },
      { word: "क्षुद्रम्", meaning: "petty / mean" },
      { word: "हृदयदौर्बल्यम्", meaning: "weakness of heart" },
      { word: "त्यक्त्वा", meaning: "giving up" },
      { word: "उत्तिष्ठ", meaning: "arise / stand up" },
      { word: "परन्तप", meaning: "O chastiser of the enemy" },
    ],
    meaningEN:
      "O son of Pritha, do not yield to this degrading impotence. It does not become you. Give up such petty weakness of heart and arise, O chastiser of the enemy.",
    meaningTA:
      "ஓ பிருதையின் மகனே, இந்த கீழான கோழைத்தனத்திற்கு அடிபணியாதே. இது உனக்கு தகாது. இந்த இதய பலவீனத்தை விடுத்து எழு!",
    reflection:
      "Arise — the most powerful word. When life weighs us down, we must choose to get up, one step at a time.",
    reflectionTA:
      "எழு — மிகவும் சக்திவாய்ந்த வார்த்தை. வாழ்க்கை நம்மை கீழே தள்ளும்போது, ஒரு ஒரு அடியாக மீண்டும் எழுந்திருக்க வேண்டும்.",
  },
  {
    chapter: 2,
    verse: 4,
    sanskrit:
      "अर्जुन उवाच।\nकथं भीष्ममहं सङ्ख्ये द्रोणं च मधुसूदन।\nइषुभिः प्रतियोत्स्यामि पूजार्हावरिसूदन॥",
    transliteration:
      "arjuna uvāca\nkathaṃ bhīṣmam ahaṃ saṅkhye droṇaṃ ca madhusūdana\niṣubhiḥ pratiyotsyāmi pūjārhāv arisūdana",
    wordByWord: [
      { word: "कथम्", meaning: "how" },
      { word: "भीष्मम्", meaning: "Bhishma" },
      { word: "अहम्", meaning: "I" },
      { word: "सङ्ख्ये", meaning: "in battle" },
      { word: "द्रोणम्", meaning: "Drona" },
      { word: "इषुभिः", meaning: "with arrows" },
      { word: "प्रतियोत्स्यामि", meaning: "shall fight back" },
      { word: "पूजार्हौ", meaning: "worthy of worship" },
    ],
    meaningEN:
      "Arjuna said: O Krishna, how can I counterattack with arrows men like Bhishma and Drona, who are worthy of my worship?",
    meaningTA:
      "அர்ஜுனன் கூறினான்: கிருஷ்ணா, பூஜிக்கத் தகுந்த பீஷ்மரையும் திரோணரையும் அம்புகளால் எவ்வாறு எதிர்க்க முடியும்?",
    reflection:
      "Sometimes the greatest conflicts are internal — fighting against those who shaped us tests our deepest values.",
    reflectionTA:
      "சில நேரம் மிகப் பெரிய போராட்டங்கள் உள்ளிருந்தே வருகின்றன — நம்மை வடிவமைத்தவர்களுக்கு எதிராக போராடுவது நம் ஆழமான விழுமியங்களை சோதிக்கிறது.",
  },
  {
    chapter: 2,
    verse: 5,
    sanskrit:
      "गुरूनहत्वा हि महानुभावान्\nश्रेयो भोक्तुं भैक्ष्यमपीह लोके।\nहत्वार्थकामांस्तु गुरूनिहैव\nभुञ्जीय भोगान्रुधिरप्रदिग्धान्॥",
    transliteration:
      "gurūn ahatvā hi mahānubhāvān\nśreyo bhoktum bhaikṣyam apīha loke\nhatvārtha-kāmāṃs tu gurūn ihaiva\nbhuñjīya bhogān rudhira-pradigdhān",
    wordByWord: [
      { word: "गुरून्", meaning: "teachers / elders" },
      { word: "अहत्वा", meaning: "without killing" },
      { word: "महानुभावान्", meaning: "great souls" },
      { word: "श्रेयः", meaning: "it is better" },
      { word: "भैक्ष्यम्", meaning: "begging for alms" },
      { word: "भोक्तुम्", meaning: "to live on" },
      { word: "रुधिरप्रदिग्धान्", meaning: "tainted with blood" },
    ],
    meaningEN:
      "It would be better to live in this world by begging than to enjoy life by killing these great souls who are my teachers. Even desiring worldly gain, they are my superiors — killing them would taint every enjoyment with their blood.",
    meaningTA:
      "இந்த மகான்களை கொல்லாமல் பிச்சை எடுத்தாவது வாழ்வது மேலானது. அவர்களை கொன்று பெறும் சுகம் இரத்தத்தில் தோய்ந்ததாகும்.",
    reflection:
      "No success built on betrayal of those who shaped us is truly sweet — integrity has a higher value than ambition.",
    reflectionTA:
      "நம்மை வடிவமைத்தவர்களை காட்டிக் கொடுத்து கட்டப்பட்ட வெற்றி எப்போதும் இனிமையற்றது — நேர்மை லட்சியத்தை விட உயர்ந்தது.",
  },
  {
    chapter: 2,
    verse: 6,
    sanskrit:
      "न चैतद्विद्मः कतरन्नो गरीयो\nयद्वा जयेम यदि वा नो जयेयुः।\nयानेव हत्वा न जिजीविषामस्\nतेऽवस्थिताः प्रमुखे धार्तराष्ट्राः॥",
    transliteration:
      "na caitad vidmaḥ kataran no garīyo\nyad vā jayema yadi vā no jayeyuḥ\nyān eva hatvā na jijīviṣāmas\nte'vasthitāḥ pramukhe dhārtarāṣṭrāḥ",
    wordByWord: [
      { word: "न विद्मः", meaning: "we do not know" },
      { word: "कतरत्", meaning: "which of the two" },
      { word: "गरीयः", meaning: "is better" },
      { word: "जयेम", meaning: "we may conquer" },
      { word: "जयेयुः", meaning: "they may conquer us" },
      { word: "हत्वा", meaning: "after killing" },
      { word: "न जिजीविषामः", meaning: "we do not wish to live" },
    ],
    meaningEN:
      "Nor do we know which is better — conquering them or being conquered. If we kill the sons of Dhritarashtra we should not care to live — yet they now stand before us on the battlefield.",
    meaningTA:
      "எது நல்லது என்று தெரியவில்லை — அவர்களை வெல்வதா அல்லது அவர்களால் வெல்லப்படுவதா? திருதராஷ்டிரன் மகன்களை கொன்று வாழவும் விரும்பவில்லை, அவர்கள் முன்னில் நிற்கிறார்கள்.",
    reflection:
      "When both paths seem wrong, we must pause and seek higher wisdom rather than act from confusion.",
    reflectionTA:
      "இரண்டு வழிகளும் தவறாகத் தோன்றும்போது, குழப்பத்திலிருந்து செயல்படாமல் உயர்ந்த ஞானத்தை நாட வேண்டும்.",
  },
  {
    chapter: 2,
    verse: 7,
    sanskrit:
      "कार्पण्यदोषोपहतस्वभावः\nपृच्छामि त्वां धर्मसम्मूढचेताः।\nयच्छ्रेयः स्यान्निश्चितं ब्रूहि तन्मे\nशिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्॥",
    transliteration:
      "kārpaṇya-doṣopahata-svabhāvaḥ\npṛcchāmi tvāṃ dharma-sammūḍha-cetāḥ\nyac chreyaḥ syān niścitaṃ brūhi tan me\nśiṣyas te'haṃ śādhi māṃ tvāṃ prapannam",
    wordByWord: [
      {
        word: "कार्पण्यदोषोपहत",
        meaning: "afflicted by the fault of miserly weakness",
      },
      { word: "स्वभावः", meaning: "my nature" },
      { word: "पृच्छामि", meaning: "I am asking" },
      { word: "धर्मसम्मूढचेताः", meaning: "confused in mind about duty" },
      { word: "श्रेयः", meaning: "that which is best" },
      { word: "शिष्यः", meaning: "disciple" },
      { word: "शाधि", meaning: "please instruct" },
      { word: "प्रपन्नम्", meaning: "surrendered unto You" },
    ],
    meaningEN:
      "Now I am confused about my duty and have lost all composure because of weakness. I am asking You to tell me clearly what is best. I am Your disciple, surrendered unto You — please instruct me.",
    meaningTA:
      "கோழைத்தனத்தால் என் குணம் நொந்துவிட்டது, தர்மம் பற்றி மனம் தடுமாறுகிறது. எனக்கு நல்லது என்பதை சொல்லுங்கள். நான் உங்கள் சீடன், சரணடைகிறேன்.",
    reflection:
      "The first step to wisdom is the humility to say 'I don't know — please teach me.' Surrender to a true guide is strength, not weakness.",
    reflectionTA:
      "ஞானத்தின் முதல் படி: 'எனக்கு தெரியவில்லை — கற்பியுங்கள்' என்று தாழ்மையுடன் சொல்வது. உண்மையான வழிகாட்டியிடம் சரணடைவது பலமே.",
  },
  {
    chapter: 2,
    verse: 8,
    sanskrit:
      "न हि प्रपश्यामि ममापनुद्या-\nद्यच्छोकमुच्छोषणमिन्द्रियाणाम्।\nअवाप्य भूमावसपत्नमृद्धं\nराज्यं सुराणामपि चाधिपत्यम्॥",
    transliteration:
      "na hi prapaśyāmi mamāpanudyād\nyac chokam ucchoṣaṇam indriyāṇām\navāpya bhūmāv asapatnam ṛddhaṃ\nrājyaṃ surāṇām api cādhipatyam",
    wordByWord: [
      { word: "न प्रपश्यामि", meaning: "I cannot find" },
      { word: "ममापनुद्यात्", meaning: "that which could remove for me" },
      { word: "शोकम्", meaning: "grief" },
      { word: "उच्छोषणम्", meaning: "drying up / withering" },
      { word: "इन्द्रियाणाम्", meaning: "of the senses" },
      { word: "असपत्नम्", meaning: "unrivalled" },
      { word: "राज्यम्", meaning: "kingdom" },
      { word: "सुराणाम्", meaning: "of the gods" },
    ],
    meaningEN:
      "I can find no means to drive away this grief which is drying up my senses. I will not be able to dispel it even if I win an unrivalled kingdom on earth or sovereignty like the gods in heaven.",
    meaningTA:
      "என் இந்திரியங்களை வாட்டும் இந்த துக்கத்தை போக்க எந்த வழியும் தெரியவில்லை. பெரிய ராஜ்யம் கிடைத்தாலும், தேவர்களின் ஆட்சி கிடைத்தாலும் இந்த கவலை நீங்காது.",
    reflection:
      "External success cannot heal inner anguish — only wisdom and self-knowledge can truly relieve the grief of the soul.",
    reflectionTA:
      "வெளிப்புற வெற்றி உள்ளிருக்கும் வலியை குணப்படுத்தாது — ஆத்மாவின் துக்கத்தை ஞானமும் சுய அறிவும் மட்டுமே குணப்படுத்தும்.",
  },
  {
    chapter: 2,
    verse: 9,
    sanskrit:
      "सञ्जय उवाच।\nएवमुक्त्वा हृषीकेशं गुडाकेशः परन्तप।\nन योत्स्य इति गोविन्दमुक्त्वा तूष्णीं बभूव ह॥",
    transliteration:
      "sañjaya uvāca\nevam uktvā hṛṣīkeśaṃ guḍākeśaḥ paraṃtapa\nna yotsya iti govindam uktvā tūṣṇīṃ babhūva ha",
    wordByWord: [
      { word: "एवम् उक्त्वा", meaning: "having spoken thus" },
      { word: "हृषीकेशम्", meaning: "to Krishna, master of the senses" },
      { word: "गुडाकेशः", meaning: "Arjuna, conqueror of sleep" },
      { word: "परन्तप", meaning: "chastiser of the enemies" },
      { word: "न योत्स्ये", meaning: "I shall not fight" },
      { word: "गोविन्दम्", meaning: "to Govinda (Krishna)" },
      { word: "तूष्णीम्", meaning: "silent" },
      { word: "बभूव ह", meaning: "became" },
    ],
    meaningEN:
      "Sanjaya said: Having spoken thus, Arjuna told Krishna 'Govinda, I shall not fight,' and fell silent.",
    meaningTA:
      "சஞ்சயன் கூறினான்: இவ்வாறு சொல்லி, 'கோவிந்தா, நான் போரிட மாட்டேன்' என்று கிருஷ்ணனிடம் சொல்லி அர்ஜுனன் அமைதியானான்.",
    reflection:
      "Sometimes we reach a point of complete stillness — and in that silence, the teacher's voice can finally be heard.",
    reflectionTA:
      "சில நேரம் நாம் முழு அமைதிக்கு வருகிறோம் — அந்த நிசப்தத்திலேயே ஆசிரியரின் குரல் கேட்கப்படலாம்.",
  },
  {
    chapter: 2,
    verse: 10,
    sanskrit:
      "तमुवाच हृषीकेशः प्रहसन्निव भारत।\nसेनयोरुभयोर्मध्ये विषीदन्तमिदं वचः॥",
    transliteration:
      "tam uvāca hṛṣīkeśaḥ prahasanniva bhārata\nsenayorubhayormadhye viṣīdantam idaṃ vacaḥ",
    wordByWord: [
      { word: "तम्", meaning: "to him (Arjuna)" },
      { word: "उवाच", meaning: "said / spoke" },
      { word: "हृषीकेशः", meaning: "Krishna, Lord of the senses" },
      { word: "प्रहसन् इव", meaning: "as if smiling" },
      { word: "भारत", meaning: "O descendant of Bharata" },
      { word: "सेनयोः उभयोः मध्ये", meaning: "in the midst of both armies" },
      { word: "विषीदन्तम्", meaning: "to the grieving one" },
      { word: "वचः", meaning: "these words" },
    ],
    meaningEN:
      "O descendant of Bharata, at that time Krishna, smiling, spoke the following words to the grief-stricken Arjuna in the midst of both armies.",
    meaningTA:
      "ஓ பாரத, அந்த நேரத்தில் கிருஷ்ணன் புன்னகையுடன் இரு படைகளுக்கும் நடுவில் துக்கமடைந்த அர்ஜுனனிடம் இந்த வார்த்தைகளை சொன்னான்.",
    reflection:
      "A true teacher meets us in our lowest moment with a smile — not dismissing our pain, but seeing beyond it with compassion.",
    reflectionTA:
      "உண்மையான ஆசிரியர் நம் கீழான நேரத்திலும் புன்னகையுடன் வருகிறார் — நம் வலியை ஒதுக்காமல், கருணையுடன் அதற்கு அப்பால் பார்க்கிறார்.",
  },

  // Ch2 verses 11–72 placeholder
  ...Array.from({ length: 62 }, (_, i) => ({
    chapter: 2,
    verse: i + 11,
    sanskrit: "Content to be populated",
    transliteration: "Content to be populated",
    wordByWord: [],
    meaningEN: "Content to be populated",
    reflection: "Content to be populated",
    isPlaceholder: true,
  })),
];

export function getVerse(chapter: number, verse: number): Verse | undefined {
  return verses.find((v) => v.chapter === chapter && v.verse === verse);
}

export function getNextVerse(
  chapter: number,
  verse: number,
): { chapter: number; verse: number } | null {
  const ch = chapters.find((c) => c.number === chapter);
  if (!ch) return null;
  if (verse < ch.verseCount) return { chapter, verse: verse + 1 };
  const nextCh = chapters.find((c) => c.number === chapter + 1);
  if (!nextCh) return null;
  return { chapter: chapter + 1, verse: 1 };
}

export function getRandomVerse(): Verse {
  const realVerses = verses.filter((v) => !v.isPlaceholder);
  return realVerses[Math.floor(Math.random() * realVerses.length)];
}

export const TOTAL_VERSES = chapters.reduce((sum, c) => sum + c.verseCount, 0);
