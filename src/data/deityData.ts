export interface DeityShloka {
  id: string;
  name: string;
  nameTA?: string;
  nameHI?: string;
  sanskrit: string;
  transliteration: string;
  meaningEN: string;
  meaningTA?: string;
  meaningHI?: string;
}

export interface DeityCollection {
  id: string;
  deity: string;
  deityTA: string;
  deityHI: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  shlokas: DeityShloka[];
}

export const DEITY_COLLECTIONS: DeityCollection[] = [
  {
    id: "ganesha",
    deity: "Ganesha",
    deityTA: "கணேஷ்",
    deityHI: "गणेश",
    icon: "🐘",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    shlokas: [
      {
        id: "vakratunda",
        name: "Vakratunda Mahakaya",
        nameTA: "வக்ரதுண்ட மஹாகாய",
        nameHI: "वक्रतुण्ड महाकाय",
        sanskrit:
          "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
        transliteration:
          "Vakratunda mahākāya sūryakoti samaprabha\nNirvighnam kuru me deva sarva-kāryeshu sarvadā",
        meaningEN:
          "O Lord with a curved trunk and mighty form, radiant as a crore of suns — make all my endeavours free of obstacles, always.",
        meaningTA:
          "வளைந்த துதிக்கையும் பெரும் உடலும் கொண்ட, கோடி சூரியர்களின் ஒளி கொண்ட இறைவனே — என் எல்லா செயல்களிலும் தடைகளை நீக்கு.",
        meaningHI:
          "वक्र सूँड वाले, महाकाय, करोड़ सूर्यों के समान तेजस्वी प्रभु — मेरे सभी कार्यों में सदा विघ्न को दूर करें।",
      },
      {
        id: "suklam",
        name: "Suklam Baradharam",
        nameTA: "சுக்லாம்பரதரம்",
        nameHI: "शुक्लाम्बरधरम्",
        sanskrit:
          "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्।\nप्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥",
        transliteration:
          "Śuklāmbaradharam Vishnum śaśivarnam chaturbhujam\nPrasannavadanam dhyāyet sarva-vighnopa-śāntaye",
        meaningEN:
          "Meditate on the one clad in white, all-pervading, moon-complexioned, four-armed, with a serene face — for the removal of all obstacles.",
        meaningTA:
          "வெண்ணிற ஆடை அணிந்த, எங்கும் வியாபித்த, நான்கு கரங்கள் கொண்ட, மலர்ந்த முகம் கொண்டவரை தியானிக்கவும் — எல்லா தடைகளும் நீங்க.",
        meaningHI:
          "श्वेत वस्त्रधारी, सर्वव्यापी, चन्द्रमा के वर्ण वाले, चतुर्भुज, प्रसन्न मुखवाले का ध्यान करें — सभी विघ्नों की शान्ति के लिए।",
      },
      {
        id: "gananam",
        name: "Gananam Tva",
        nameTA: "கணானாம் த்வா",
        nameHI: "गणानां त्वा",
        sanskrit:
          "गणानां त्वा गणपतिं हवामहे\nकविं कवीनामुपमश्रवस्तमम्।\nज्येष्ठराजं ब्रह्मणां ब्रह्मणस्पत\nआ नः शृण्वन्नूतिभिः सीद सादनम्॥",
        transliteration:
          "Gaṇānām tvā gaṇapatim havāmahe\nKavim kavīnām upamaśravastamam\nJyeṣṭharājam brahmaṇām brahmaṇaspata\nĀ naḥ śṛṇvannūtibhiḥ sīda sādanam",
        meaningEN:
          "We invoke you, O Ganapati, leader of all hosts, wisest among the wise, most renowned, eldest king of the sacred prayers — hear us and take your seat among us with your divine aid.",
        meaningTA:
          "எல்லா கணங்களுக்கும் தலைவரான கணபதியே, ஞானிகளில் சிறந்தவரே, மிகவும் புகழ் பெற்றவரே — எங்கள் பிரார்த்தனையை கேட்டு எங்களிடம் எழுந்தருளும்.",
        meaningHI:
          "हे सभी गणों के नेता गणपति, कवियों में श्रेष्ठ, सबसे यशस्वी, ब्रह्म के ज्येष्ठ राजन — हमारी पुकार सुनें और अपने आशीर्वाद के साथ हमारे पास आएं।",
      },
    ],
  },
  {
    id: "shiva",
    deity: "Shiva",
    deityTA: "சிவன்",
    deityHI: "शिव",
    icon: "🔱",
    bgColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    shlokas: [
      {
        id: "mahamrityunjaya",
        name: "Mahamrityunjaya Mantra",
        nameTA: "மஹாம்ருத்யுஞ்சய மந்திரம்",
        nameHI: "महामृत्युञ्जय मंत्र",
        sanskrit:
          "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥",
        transliteration:
          "Om tryambakam yajāmahe sugandhim pushtivardhanam\nUrvārukamiva bandhanān mṛtyormukshīya māmṛtāt",
        meaningEN:
          "We worship the three-eyed Lord Shiva who nourishes and nurtures all — may He liberate us from death as the cucumber is severed from its vine, and grant us immortality.",
        meaningTA:
          "மூன்று கண்களை உடைய சிவனை வழிபடுகிறோம், எல்லாவற்றையும் வளர்ப்பவனை — அவன் நமக்கு மரணத்திலிருந்து விடுதலை அளிக்கட்டும், அமரத்துவம் தரட்டும்.",
        meaningHI:
          "हम तीन नेत्रों वाले भगवान शिव की पूजा करते हैं जो सभी का पोषण करते हैं — वे हमें मृत्यु के बंधन से उसी प्रकार मुक्त करें जैसे ककड़ी लता से कट जाती है, और अमरत्व प्रदान करें।",
      },
      {
        id: "panchakshara",
        name: "Shiva Panchakshara",
        nameTA: "சிவ பஞ்சாக்ஷர ஸ்தோத்ரம்",
        nameHI: "शिव पञ्चाक्षर स्तोत्र",
        sanskrit:
          "नागेन्द्रहाराय त्रिलोचनाय\nभस्माङ्गरागाय महेश्वराय।\nनित्याय शुद्धाय दिगम्बराय\nतस्मै नकाराय नमः शिवाय॥",
        transliteration:
          "Nāgendrahārāya trilocanāya\nBhasmāṅgarāgāya maheśvarāya\nNityāya śuddhāya digambarāya\nTasmai nakārāya namaḥ śivāya",
        meaningEN:
          "To the one who wears the king of serpents as a garland, who has three eyes, whose body is smeared with sacred ash, the great Lord — eternal, pure, clad in the sky — I bow to the Na-kara of Om Namah Shivaya.",
        meaningTA:
          "நாகங்களை மாலையாக அணிந்த, மூன்று கண்களுடைய, திருநீறு அணிந்த, மகாதேவனுக்கு — நித்தியமானவர், தூயவர், ஆகாசத்தை ஆடையாக கொண்டவர் — ஓம் நமஃ சிவாயவின் 'ந'காரத்திற்கு நமஸ்காரம்.",
        meaningHI:
          "जो नागराज को हार की तरह धारण करते हैं, जिनके तीन नेत्र हैं, जो भस्म से विभूषित हैं, महेश्वर को — नित्य, शुद्ध, दिगम्बर को — ॐ नमः शिवाय के नकार को नमस्कार।",
      },
      {
        id: "shiva_tandava_1",
        name: "Shiva Tandava Stotram",
        nameTA: "சிவ தாண்டவ ஸ்தோத்ரம்",
        nameHI: "शिव तांडव स्तोत्र",
        sanskrit:
          "जटाटवीगलज्जलप्रवाहपावितस्थले\nगलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।\nडमड्डमड्डमड्डमन्निनादवड्डमर्वयं\nचकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥",
        transliteration:
          "Jaṭāṭavīgalajjala pravāhapāvitasthale\nGale'valambya lambitām bhujaṅgatuṅgamālikām\nDamaḍḍamaḍḍamaḍḍaman nināda vaḍḍamarvayam\nCakāra caṇḍatāṇḍavam tanotou naḥ śivaḥ śivam",
        meaningEN:
          "With the sacred Ganga flowing through his matted locks purifying his neck, wearing a garland of high serpents, to the resounding beat of his damaru drum — may Shiva who performs the fierce Tandava dance bestow auspiciousness on us.",
        meaningTA:
          "சடாமுடியிலிருந்து கங்கை வழியும் கழுத்துடன், உயர்ந்த நாகங்களை மாலையாக அணிந்து, டமருவின் சத்தத்துடன் கோரமான தாண்டவம் ஆடும் சிவன் — நமக்கு நன்மை செய்யட்டும்.",
        meaningHI:
          "जटाओं में बहती गंगा से पवित्र कंठ वाले, ऊँचे नागों की माला धारण किए, डमरू की गड़गड़ाहट में प्रचंड तांडव करते — शिव हमें शुभ प्रदान करें।",
      },
    ],
  },
  {
    id: "devi",
    deity: "Devi",
    deityTA: "தேவி / அம்மன்",
    deityHI: "देवी / दुर्गा",
    icon: "🌸",
    bgColor: "#FDF4FF",
    borderColor: "#E9D5FF",
    shlokas: [
      {
        id: "ya_devi",
        name: "Ya Devi Sarva Bhuteshu",
        nameTA: "யா தேவீ சர்வபூதேஷு",
        nameHI: "या देवी सर्वभूतेषु",
        sanskrit:
          "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥",
        transliteration:
          "Yā devī sarvabhūteṣu śaktirūpeṇa saṃsthitā\nNamastasyai namastasyai namastasyai namo namaḥ",
        meaningEN:
          "To that Goddess who resides in all beings as pure Shakti — salutations, salutations, salutations again and again.",
        meaningTA:
          "எல்லா உயிர்களிலும் சக்தி வடிவில் வாழும் தேவிக்கு — நமஸ்காரம், நமஸ்காரம், திரும்பவும் நமஸ்காரம்.",
        meaningHI:
          "जो देवी सभी प्राणियों में शक्ति स्वरूप विराजमान हैं — उन्हें नमन, नमन, बारम्बार नमन।",
      },
      {
        id: "sarva_mangala",
        name: "Sarva Mangala Mangalye",
        nameTA: "சர்வ மங்கல மாங்கல்யே",
        nameHI: "सर्व मंगल मांगल्ये",
        sanskrit:
          "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥",
        transliteration:
          "Sarvamaṅgalamāṅgalye śive sarvārthasādhike\nŚaraṇye tryambake gauri nārāyaṇi namo'stu te",
        meaningEN:
          "O auspicious one, fulfiller of all wishes, refuge of all, three-eyed Gauri, Narayani — I bow to you.",
        meaningTA:
          "எல்லா மங்களங்களிலும் மங்களமானவளே, சிவையே, எல்லா கோரிக்கைகளையும் நிறைவேற்றுபவளே, மூன்று கண்களுடைய கெளரியே, நாராயணியே — உனக்கு நமஸ்காரம்.",
        meaningHI:
          "सभी मंगलों की मंगलमयी, शिवा, सभी अर्थों को पूर्ण करने वाली, शरण देने वाली, त्रिनेत्री गौरी, नारायणी — आपको प्रणाम।",
      },
      {
        id: "aigiri",
        name: "Aigiri Nandini",
        nameTA: "ஐகிரி நந்தினி",
        nameHI: "अयि गिरिनन्दिनि",
        sanskrit:
          "अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दनुते\nगिरिवरविन्ध्यशिरोऽधिनिवासिनि विष्णुविलासिनि जिष्णुनुते।",
        transliteration:
          "Ayi girinandini nanditamedini viśvavinodini nandanute\nGirivara Vindhyaśiro'dhinivāsini Viṣṇuvilāsini jiṣṇunute",
        meaningEN:
          "O daughter of the mountain, who delights the earth, who entertains the universe, who is praised by Nanda — dwelling on the great Vindhya peak, beloved of Vishnu, praised by the victorious.",
        meaningTA:
          "மலையின் மகளே, பூமியை மகிழ்விப்பவளே, உலகை மகிழ்விப்பவளே, விந்திய உச்சியில் வாழ்பவளே — விஷ்ணுவால் விரும்பப்படுபவளே, உனக்கு வணக்கம்.",
        meaningHI:
          "हे पर्वतपुत्री, धरती को आनंदित करने वाली, विश्व का मनोरंजन करने वाली, विंध्याचल के शिखर पर निवास करने वाली, विष्णुप्रिया — आपको नमन।",
      },
    ],
  },
  {
    id: "murugan",
    deity: "Murugan",
    deityTA: "முருகன்",
    deityHI: "मुरुगन / कार्तिकेय",
    icon: "🌟",
    bgColor: "#FFF7ED",
    borderColor: "#FED7AA",
    shlokas: [
      {
        id: "saravanabhava",
        name: "Om Saravanabhava",
        nameTA: "ஓம் சரவணபவ",
        nameHI: "ॐ सरवणभव",
        sanskrit: "ॐ सरवणभव\nॐ सरवणभव ॐ सरवणभव",
        transliteration: "Om Saravanabhava\nOm Saravanabhava Om Saravanabhava",
        meaningEN:
          "The sacred six-syllable mantra of Lord Murugan — 'Sa-Ra-Va-Na-Bha-Va' — meaning one who is born in the sacred pond of reeds. Chanting this mantra is said to remove all obstacles and grant wisdom.",
        meaningTA:
          "முருகனின் ஆறு எழுத்து மந்திரம் — 'ச-ர-வ-ண-ப-வ' — சரவணப் பொய்கையில் அவதரித்தவர். இந்த மந்திரம் எல்லா தடைகளையும் நீக்கி ஞானம் அருளும்.",
        meaningHI:
          "भगवान मुरुगन का पवित्र षडक्षर मंत्र — जो सरवण सरोवर में जन्मे। इस मंत्र का जप सभी बाधाओं को दूर करता है और ज्ञान प्रदान करता है।",
      },
      {
        id: "skandaya",
        name: "Skandaya Namah",
        nameTA: "ஸ்கந்தாய நமஃ",
        nameHI: "स्कन्दाय नमः",
        sanskrit:
          "स्कन्दाय नमः शक्तिधराय नमः\nकुमाराय नमः गुहाय नमः।\nकार्तिकेयाय नमः सुब्रह्मण्याय\nषण्मुखाय नमो नमः॥",
        transliteration:
          "Skandāya namaḥ śaktidhārāya namaḥ\nKumārāya namaḥ guhāya namaḥ\nKārtikeyāya namaḥ subrahmaṇyāya\nṣaṇmukhāya namo namaḥ",
        meaningEN:
          "Salutations to Skanda, the wielder of Shakti, the ever-young Kumar, the cave-dweller, Kartikeya, Subrahmanya, the six-faced one — again and again I bow.",
        meaningTA:
          "ஸ்கந்தனுக்கு வணக்கம், சக்தியை ஏந்துபவருக்கு வணக்கம், குமாரனுக்கு வணக்கம், குகையில் வாழ்பவருக்கு வணக்கம் — ஆறு முகம் கொண்ட சுப்பிரமணியனுக்கு திரும்பவும் நமஸ்காரம்.",
        meaningHI:
          "स्कन्द को नमस्कार, शक्तिधारी को नमस्कार, कुमार को, गुहा को, कार्तिकेय को, सुब्रह्मण्य को — षण्मुख को बारम्बार नमन।",
      },
      {
        id: "thiruppugazh",
        name: "Thiruppugazh Opening",
        nameTA: "திருப்புகழ் தொடக்கம்",
        nameHI: "तिरुप्पुगझ प्रारंभ",
        sanskrit:
          "கைத்தல நிறைகனி அப்பமோடு\nஅட்டபுஷ்பங்கள் பலவும்,\nவைத்து உன தாளிணை போற்றி நின்று\nவழிபடும் அன்பர்கள் உய்யவே\nமுத்தமிழ் விரகன் முருகவேளே",
        transliteration:
          "Kaiththala niṟaikaniyappamoḍu\naṭṭapuṣpaṅkaḷ palavum\nVaiththu uṉa tāḷiṇai pōṟṟi niṉṟu\nvaḻipaṭum aṉparkaḷ uyyavē\nMuttamiḻ virakan murukaVēḷē",
        meaningEN:
          "Holding fruits and flowers in their hands, placing them at your twin feet with devotion and praise — for the liberation of your devoted ones — O Murugan, master of the triple Tamil arts.",
        meaningTA:
          "கைகளில் நிறை கனிகளும் அட்ட புஷ்பங்களும் வைத்து, உன் திருவடி இணையை போற்றி நின்று வழிபடும் அன்பர்கள் உய்யவே — முத்தமிழ் விரகன் முருகவேளே.",
        meaningHI:
          "हाथों में फल और अष्ट पुष्प लेकर, आपके चरण कमलों की स्तुति करते हुए — भक्तों की मुक्ति के लिए — हे त्रि-तमिल के विशेषज्ञ मुरुगवेल।",
      },
    ],
  },
  {
    id: "vishnu",
    deity: "Vishnu / Krishna",
    deityTA: "விஷ்ணு / கிருஷ்ணன்",
    deityHI: "विष्णु / कृष्ण",
    icon: "🪷",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    shlokas: [
      {
        id: "achyutam",
        name: "Achyutam Keshavam",
        nameTA: "அச்சுதம் கேசவம்",
        nameHI: "अच्युतम् केशवम्",
        sanskrit:
          "अच्युतम् केशवं कृष्णं दामोदरं राम।\nश्रीधरं माधवं गोपिकावल्लभम्॥\nजानकीनायकं रामचन्द्रं भजे\nराम राम राम सीता राम राम॥",
        transliteration:
          "Achyutam Keśavam Kṛṣṇam Dāmodaram Rāmam\nŚrīdharam Mādhavam gopikāvallabham\nJānakīnāyakam Rāmacandram bhaje\nRāma Rāma Rāma Sītā Rāma Rāma",
        meaningEN:
          "I worship Achyuta, Keshava, Krishna, Damodara, Rama — the bearer of Lakshmi, Madhava, beloved of the Gopikas — the consort of Sita, Ramachandra — Rama Rama Rama, Sita Rama Rama.",
        meaningTA:
          "அச்சுதம், கேசவம், கிருஷ்ணம், தாமோதரம், ராமம் — லட்சுமியின் கணவன், மாதவன், கோபிகைகளின் காதலன் — ஜானகிநாதன் ராமசந்திரனை வணங்குகிறேன்.",
        meaningHI:
          "अच्युत, केशव, कृष्ण, दामोदर, राम — श्रीधर, माधव, गोपिकाओं के प्रिय — जानकीनायक रामचन्द्र की वंदना करता हूँ।",
      },
      {
        id: "vsn_opening",
        name: "Vishnu Sahasranamam — Opening",
        nameTA: "விஷ்ணு சஹஸ்ரநாமம் — தொடக்கம்",
        nameHI: "विष्णु सहस्रनाम — प्रारंभ",
        sanskrit:
          "विश्वं विष्णुर्वषट्कारो भूतभव्यभवत्प्रभुः।\nभूतकृद्भूतभृद्भावो भूतात्मा भूतभावनः॥",
        transliteration:
          "Viśvam Viṣṇur vaṣaṭkāro bhūtabhavyabhavatprabhuḥ\nBhūtakṛdbhūtabhṛdbhāvo bhūtātmā bhūtabhāvanaḥ",
        meaningEN:
          "He is the universe, He is Vishnu, He is the sacred chant — Lord of what was, what is, and what will be. He creates beings, sustains them, is their nature, their soul, their nourisher.",
        meaningTA:
          "அவனே பிரபஞ்சம், அவனே விஷ்ணு, அவனே மந்திரம் — கடந்த காலம், நிகழ்காலம், எதிர்காலத்தின் ஆண்டவன். உயிர்களை படைத்து, தாங்கி, அவர்களின் ஆன்மா.",
        meaningHI:
          "वे ही विश्व हैं, वे ही विष्णु, वे ही वषट्कार — भूत, भविष्य और वर्तमान के स्वामी। वे प्राणियों को उत्पन्न करते, धारण करते, उनका भाव, आत्मा और पोषण हैं।",
      },
      {
        id: "govinda_damodara",
        name: "Govinda Damodara Stotram",
        nameTA: "கோவிந்த தாமோதர ஸ்தோத்ரம்",
        nameHI: "गोविन्द दामोदर स्तोत्र",
        sanskrit:
          "कस्तूरीतिलकं ललाटपटले वक्षःस्थले कौस्तुभं\nनासाग्रे नवमौक्तिकं करतले वेणुं करे कङ्कणम्।\nसर्वाङ्गे हरिचन्दनं च कलयन् कण्ठे च मुक्तावलिं\nगोपस्त्रीपरिवेष्टितो विजयते गोपालचूडामणिः॥",
        transliteration:
          "Kastūrītilakaṃ lalāṭapaṭale vakṣasthale kaustubhaṃ\nnāsāgre navamaauktikaṃ karatale veṇuṃ kare kaṅkaṇam\nSarvāṅge haricandanaṃ ca kalayan kaṇṭhe ca muktāvaliṃ\nGopāstrīparivesthito vijayate gopālacūḍāmaṇiḥ",
        meaningEN:
          "With kasturi tilak on his forehead, Kaustubha gem on his chest, new pearl on his nose, flute in hand, sandalwood paste on every limb, pearl necklace on his neck — surrounded by the Gopi maidens — victory to the crest jewel of cowherds, Gopala.",
        meaningTA:
          "நெற்றியில் கஸ்தூரி திலகம், மார்பில் கௌஸ்துப மணி, மூக்கில் முத்து, கையில் வேணு, எல்லா உறுப்புகளிலும் சந்தனம், கழுத்தில் முத்து மாலை — கோபிகைகளால் சூழப்பட்ட கோபாலனுக்கு ஜய்.",
        meaningHI:
          "माथे पर कस्तूरी तिलक, वक्ष पर कौस्तुभ, नाक पर नव मोती, हाथ में वेणु, सभी अंगों पर हरिचंदन, कंठ में मुक्तावली — गोपियों से घिरे गोपाल को जय हो।",
      },
    ],
  },
];
