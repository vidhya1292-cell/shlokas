export interface BhajanVerse {
  lines: string;         // original language lines
  transliteration?: string;
  meaningEN: string;
  meaningTA?: string;
  meaningHI?: string;
}

export interface Bhajan {
  id: string;
  name: string;
  nameTA: string;
  nameHI: string;
  deity: string;
  deityTA: string;
  language: "Sanskrit" | "Hindi" | "Tamil" | "Marathi";
  tagEN: string;
  tagTA: string;
  verses: BhajanVerse[];
}

export const BHAJANS: Bhajan[] = [
  {
    id: "hare_krishna",
    name: "Hare Krishna Mahamantra",
    nameTA: "ஹரே கிருஷ்ண மஹாமந்திரம்",
    nameHI: "हरे कृष्ण महामंत्र",
    deity: "Krishna",
    deityTA: "கிருஷ்ணன்",
    language: "Sanskrit",
    tagEN: "16 sacred names · Chant aloud",
    tagTA: "16 புனித நாமங்கள் · சப்தமாக ஜபிக்கவும்",
    verses: [
      {
        lines:
          "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे\nहरे राम हरे राम राम राम हरे हरे",
        transliteration:
          "Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare\nHare Rāma Hare Rāma Rāma Rāma Hare Hare",
        meaningEN:
          "O Krishna, O Rama — this sixteen-name Mahamantra is the greatest means of liberation in the age of Kali. Chanting these names with devotion purifies the mind and liberates the soul.",
        meaningTA:
          "ஓ கிருஷ்ணா, ஓ ராமா — இந்த பதினாறு நாம மஹாமந்திரம் கலியுகத்தில் மோட்சம் பெறும் சிறந்த வழி. பக்தியுடன் ஜபிப்பது மனதை சுத்தப்படுத்தி ஆன்மாவை விடுவிக்கும்.",
        meaningHI:
          "हे कृष्ण, हे राम — यह सोलह नाम का महामंत्र कलियुग में मुक्ति का सर्वश्रेष्ठ साधन है। भक्तिपूर्वक जप से मन शुद्ध होता और आत्मा मुक्त होती है।",
      },
    ],
  },
  {
    id: "raghupati",
    name: "Raghupati Raghava Raja Ram",
    nameTA: "ரகுபதி ராகவ ராஜா ராம்",
    nameHI: "रघुपति राघव राजा राम",
    deity: "Rama",
    deityTA: "ராமன்",
    language: "Hindi",
    tagEN: "Gandhi's favourite bhajan",
    tagTA: "காந்தியின் மகிழ்ச்சியான பஜன்",
    verses: [
      {
        lines:
          "रघुपति राघव राजाराम\nपतित पावन सीताराम\nसीताराम सीताराम\nभज प्यारे तू सीताराम",
        transliteration:
          "Raghupati Rāghava Rājārām\nPatita pāvan Sītārām\nSītārām Sītārām\nBhaj pyāre tū Sītārām",
        meaningEN:
          "O Rama, scion of the Raghu dynasty, King of kings — purifier of the fallen, Sita-Rama. O dear one, worship Sita-Rama always.",
        meaningTA:
          "ரகு குலத்தின் வழித்தோன்றல் ராஜாராமா — தீயோரை தூய்மைப்படுத்தும் சீதாராமா. அன்பரே, சீதாராமனை எப்போதும் வழிபடு.",
        meaningHI:
          "रघुवंश के राजा राम, पतितों के पावन सीताराम — हे प्रियजन, सीताराम का भजन करो।",
      },
      {
        lines:
          "ईश्वर अल्लाह तेरो नाम\nसबको सन्मति दे भगवान",
        transliteration:
          "Īśvar allāh tero nām\nSabko sanmati de bhagavān",
        meaningEN:
          "God and Allah are both your names — O Lord, grant wisdom and good sense to all.",
        meaningTA:
          "ஈஸ்வரனும் அல்லாவும் உன் நாமங்கள் — இறைவனே, எல்லோருக்கும் நல்ல புத்தி கொடு.",
        meaningHI:
          "ईश्वर और अल्लाह तेरे ही नाम हैं — हे भगवान, सबको सन्मति दे।",
      },
    ],
  },
  {
    id: "vaishnava_jana",
    name: "Vaishnava Jana To",
    nameTA: "வைஷ்ணவ ஜன தோ",
    nameHI: "वैष्णव जन तो",
    deity: "Vishnu",
    deityTA: "விஷ்ணு",
    language: "Marathi",
    tagEN: "By Narsinh Mehta · A true devotee",
    tagTA: "நரசிங் மேட்டா · உண்மை பக்தன்",
    verses: [
      {
        lines:
          "वैष्णव जन तो तेने कहिए जे\nपीड परायी जाणे रे।\nपर दुखे उपकार करे तोयें\nमन अभिमान न आणे रे॥",
        transliteration:
          "Vaiṣṇava jana to tene kahiye je\nPīḍ parāyī jāṇe re\nPar dukhe upkār kare toye\nMan abhimān na āṇe re",
        meaningEN:
          "Call only those a true devotee of Vishnu who feel the pain of others as their own — who serve those in sorrow yet carry no pride in their heart.",
        meaningTA:
          "பிறரின் வலியை தன்னதாக உணர்பவரையே விஷ்ணு பக்தன் என்று கூறுங்கள் — துன்பத்தில் உதவி செய்தாலும் மனதில் அகங்காரம் இல்லாதவர்.",
        meaningHI:
          "उसे ही वैष्णव जन कहो जो दूसरों का दुख अपना समझे — दूसरों के दुख में उपकार करे पर मन में अभिमान न लाए।",
      },
      {
        lines:
          "सकल लोकमां सहुने वंदे\nनिंदा न करे केनी रे।\nवाच काछ मन निश्चल राखे\nधन धन जननी तेनी रे॥",
        transliteration:
          "Sakal lokamāṃ sahune vande\nNindā na kare kenī re\nVāc kāch man niścal rākhe\nDhan dhan jananī tenī re",
        meaningEN:
          "One who bows to all in the world, speaks ill of none — whose speech, body and mind remain steadfast — blessed is the mother who bore such a soul.",
        meaningTA:
          "உலகில் எல்லோரையும் வணங்குபவர், யாரையும் நிந்திக்காதவர் — வாய், செயல், மனம் ஒருமித்தவர் — அவரை பெற்ற தாய் பேரதிர்ஷ்டசாலி.",
        meaningHI:
          "जो सारे संसार को नमस्कार करे, किसी की निंदा न करे — वाणी, काया और मन को स्थिर रखे — उसकी माता धन्य है।",
      },
    ],
  },
  {
    id: "om_jai_jagadish",
    name: "Om Jai Jagadish Hare",
    nameTA: "ஓம் ஜய் ஜகதீஷ் ஹரே",
    nameHI: "ॐ जय जगदीश हरे",
    deity: "Vishnu",
    deityTA: "விஷ்ணு",
    language: "Hindi",
    tagEN: "Evening aarti · Most loved in India",
    tagTA: "மாலை ஆரதி · இந்தியாவில் மிகவும் விரும்பப்படும்",
    verses: [
      {
        lines:
          "ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।\nभक्त जनों के संकट, क्षण में दूर करे॥",
        transliteration:
          "Om jai jagadīś hare, svāmī jai jagadīś hare\nBhakta janon ke saṅkaṭ, kṣaṇ meṃ dūr kare",
        meaningEN:
          "Victory to the Lord of the Universe, O Swami — the troubles of your devotees, you remove in an instant.",
        meaningTA:
          "ஜகதீஷ்வரனுக்கு ஜயம், ஸ்வாமியே — உன் பக்தர்களின் துன்பங்களை ஒரு கணத்தில் தீர்க்கிறாய்.",
        meaningHI:
          "जय हो जगदीश स्वामी — भक्तों के संकट तुम पल भर में दूर करते हो।",
      },
      {
        lines:
          "मात पिता तुम मेरे, शरण गहूँ किसकी।\nतुम बिन और न दूजा, आस करूँ किसकी॥",
        transliteration:
          "Māt pitā tum mere, śaraṇ gahūṃ kisakī\nTum bin aur na dūjā, ās karūm kisakī",
        meaningEN:
          "You are my mother and father — whose refuge shall I seek? Without you there is no other — in whom shall I place my hope?",
        meaningTA:
          "நீயே என் தாயும் தந்தையும் — யாரிடம் அடைக்கலம் தேடுவேன்? உன்னையன்றி வேறில்லை — யாரிடம் நம்பிக்கை வைப்பேன்?",
        meaningHI:
          "तुम ही मेरे माता-पिता — किसकी शरण लूँ? तुम्हारे बिना कोई दूजा नहीं — किससे आस रखूँ?",
      },
    ],
  },
  {
    id: "thyagaraja",
    name: "Endaro Mahanubhavulu",
    nameTA: "என்தரோ மஹானுபாவுலு",
    nameHI: "एंदरो महानुभावुलु",
    deity: "Rama",
    deityTA: "ராமன்",
    language: "Sanskrit",
    tagEN: "Thyagaraja's Pancharatna Kriti",
    tagTA: "தியாகராஜரின் பஞ்சரத்ன கீர்த்தனை",
    verses: [
      {
        lines:
          "एंदरो महानुभावुलु अंदरिकी वंदनमुलु\nचंद्रवदना मृदुलभाषिणी चांद्रहासि\nकुचदवळ शुभ्रहार विराजितुलकू",
        transliteration:
          "Endaro mahānubhāvulu andhariki vandanamulu\nCandravadanā mṛdulabhāṣiṇī cāndrahāsi\nKucadavaḷa śubhrahāra virājitulakū",
        meaningEN:
          "Salutations to all the great souls — to those with moon-like faces, soft speech, and gentle smiles, adorned with bright pearl necklaces on their chest.",
        meaningTA:
          "எத்தனையோ மகானுபாவர்கள் — எல்லோருக்கும் வணக்கம். நிலவு போன்ற முகமும், மென்மையான பேச்சும், அழகிய நகையும் அணிந்தோருக்கு வணக்கம்.",
        meaningHI:
          "कितने ही महानुभाव हैं — सभी को वंदन। चंद्रमुखी, मृदुभाषी, मुस्कुराती, सुंदर मुक्ताहार से सुशोभित महात्माओं को प्रणाम।",
      },
      {
        lines:
          "सामगानलोल मनसिज लावण्य\nधन्यులकू श्री त्यागराज विनुता\nमानसभजनेय अनवरतमू",
        transliteration:
          "Sāmagānalola manasija lāvaṇya\nDhanyulakū śrī Tyāgarāja vinutā\nMānasabhajaneya anavaratamū",
        meaningEN:
          "To those blessed ones who delight in Sama Veda chanting and possess the beauty of Manmatha — praised by Thyagaraja — who contemplate Rama in their hearts ceaselessly.",
        meaningTA:
          "சாம கீதத்தில் மகிழ்பவர்கள், தியாகராஜரால் போற்றப்பட்டவர்கள் — மனதில் இடைவிடாது ராமனை தியானிப்பவர்களுக்கு வணக்கம்.",
        meaningHI:
          "जो सामगान में रुचि रखते हैं, जिन्हें थ्यागराज ने गाया — जो मन में निरन्तर राम का भजन करते हैं, उन धन्यजनों को नमन।",
      },
    ],
  },
];
