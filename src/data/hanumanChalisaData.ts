import { Verse, Chapter } from "../types";

// Hanuman Chalisa — Tulsidas (Awadhi, 16th century)
// 2 opening dohas + 40 chaupais + 1 closing doha = 43 units

export const chapters: Chapter[] = [
  { number: 1, name: "Doha",    verseCount: 3  },  // 2 opening + 1 closing
  { number: 2, name: "Chaupai", verseCount: 40 },
];

export const SCRIPTURE_ID = "hanuman_chalisa" as const;

export const verses: Verse[] = [
  {
    chapter: 1, verse: 1,
    sanskrit: "\u0936\u094d\u0930\u0940\u0917\u0941\u0930\u0941 \u091a\u0930\u0928 \u0938\u0930\u094b\u091c\u0930\u091c \u0928\u093f\u091c \u092e\u0928\u0941 \u092e\u0941\u0915\u0941\u0930\u0941 \u0938\u0941\u0927\u093e\u0930\u093f\u0964 \u092c\u0930\u0928\u0909\u0901 \u0930\u0918\u0941\u092c\u0930 \u092c\u093f\u092e\u0932 \u091c\u0938\u0941 \u091c\u094b \u0926\u093e\u092f\u0915\u0941 \u092b\u0932 \u091a\u093e\u0930\u093f\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Cleansing the mirror of my mind with the dust of my Guru's lotus feet, I describe the pure glory of Rama, bestower of the four fruits of life.",
    reflection: "",
  },
  {
    chapter: 1, verse: 2,
    sanskrit: "\u092c\u0941\u0926\u094d\u0927\u093f\u0939\u0940\u0928 \u0924\u0928\u0941 \u091c\u093e\u0928\u093f\u0915\u0947 \u0938\u0941\u092e\u093f\u0930\u094c\u0902 \u092a\u0935\u0928-\u0915\u0941\u092e\u093e\u0930\u0964 \u092c\u0932 \u092c\u0941\u0926\u094d\u0927\u093f \u092c\u093f\u0926\u094d\u092f\u093e \u0926\u0947\u0939\u0941 \u092e\u094b\u0939\u093f\u0902 \u0939\u0930\u0939\u0941 \u0915\u0932\u0947\u0938 \u092c\u093f\u0915\u093e\u0930\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Knowing myself to be ignorant, I remember you, O Son of the Wind. Grant me strength, wisdom, and knowledge, and remove my afflictions.",
    reflection: "",
  },
  {
    chapter: 2, verse: 1,
    sanskrit: "\u091c\u092f \u0939\u0928\u0941\u092e\u093e\u0928 \u091c\u094d\u091e\u093e\u0928 \u0917\u0941\u0928 \u0938\u093e\u0917\u0930\u0964 \u091c\u092f \u0915\u092a\u0940\u0938 \u0924\u093f\u0939\u0941\u0901 \u0932\u094b\u0915 \u0909\u091c\u093e\u0917\u0930\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Glory to Hanuman, ocean of wisdom and virtue. Glory to the Lord of Monkeys, illuminator of three worlds.",
    reflection: "",
  },
  {
    chapter: 2, verse: 2,
    sanskrit: "\u0930\u093e\u092e\u0926\u0942\u0924 \u0905\u0924\u0941\u0932\u093f\u0924 \u092c\u0932 \u0927\u093e\u092e\u093e\u0964 \u0905\u0902\u091c\u0928\u093f-\u092a\u0941\u0924\u094d\u0930 \u092a\u0935\u0928\u0938\u0941\u0924 \u0928\u093e\u092e\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Messenger of Rama, abode of matchless strength. Son of Anjani, known as Son of the Wind.",
    reflection: "",
  },
  {
    chapter: 2, verse: 3,
    sanskrit: "\u092e\u0939\u093e\u092c\u0940\u0930 \u092c\u093f\u0915\u094d\u0930\u092e \u092c\u091c\u0930\u0902\u0917\u0940\u0964 \u0915\u0941\u092e\u0924\u093f \u0928\u093f\u0935\u093e\u0930 \u0938\u0941\u092e\u0924\u093f \u0915\u0947 \u0938\u0902\u0917\u0940\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Great hero, mighty Bajrangi. Dispeller of evil thoughts and companion of good sense.",
    reflection: "",
  },
  {
    chapter: 2, verse: 4,
    sanskrit: "\u0915\u0902\u091a\u0928 \u092c\u0930\u0928 \u092c\u093f\u0930\u093e\u091c \u0938\u0941\u092c\u0947\u0938\u093e\u0964 \u0915\u093e\u0928\u0928 \u0915\u0941\u0902\u0921\u0932 \u0915\u0941\u0902\u091a\u093f\u0924 \u0915\u0947\u0938\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Golden-hued body, beautifully adorned. Earrings in ears and curly hair.",
    reflection: "",
  },
  {
    chapter: 2, verse: 5,
    sanskrit: "\u0939\u093e\u0925 \u092c\u091c\u094d\u0930 \u0914\u0930 \u0927\u094d\u0935\u091c\u093e \u092c\u093f\u0930\u093e\u091c\u0948\u0964 \u0915\u093e\u0901\u0927\u0947 \u092e\u0942\u0901\u091c \u091c\u0928\u0947\u090a \u0938\u093e\u091c\u0948\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Thunderbolt mace and flag adorn your hands. Sacred thread of munja grass graces your shoulder.",
    reflection: "",
  },
  {
    chapter: 2, verse: 6,
    sanskrit: "\u0936\u0902\u0915\u0930 \u0938\u0941\u0935\u0928 \u0915\u0947\u0938\u0930\u0940 \u0928\u0902\u0926\u0928\u0964 \u0924\u0947\u091c \u092a\u094d\u0930\u0924\u093e\u092a \u092e\u0939\u093e \u091c\u0917 \u092c\u0902\u0926\u0928\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Incarnation of Shiva, son of Kesari. Your radiance and valor are worshipped by the world.",
    reflection: "",
  },
  {
    chapter: 2, verse: 7,
    sanskrit: "\u0935\u093f\u0926\u094d\u092f\u093e\u0935\u093e\u0928 \u0917\u0941\u0928\u0940 \u0905\u0924\u093f \u091a\u093e\u0924\u0941\u0930\u0964 \u0930\u093e\u092e \u0915\u093e\u091c \u0915\u0930\u093f\u092c\u0947 \u0915\u094b \u0906\u0924\u0941\u0930\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Learned, virtuous, and supremely clever. Ever eager to serve Rama's purpose.",
    reflection: "",
  },
  {
    chapter: 2, verse: 8,
    sanskrit: "\u092a\u094d\u0930\u092d\u0941 \u091a\u0930\u093f\u0924\u094d\u0930 \u0938\u0941\u0928\u093f\u092c\u0947 \u0915\u094b \u0930\u0938\u093f\u092f\u093e\u0964 \u0930\u093e\u092e \u0932\u0916\u0928 \u0938\u0940\u0924\u093e \u092e\u0928 \u092c\u0938\u093f\u092f\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Lover of hearing the Lord's tales. Rama, Lakshmana, and Sita dwell in your heart.",
    reflection: "",
  },
  {
    chapter: 2, verse: 9,
    sanskrit: "\u0938\u0942\u0915\u094d\u0937\u094d\u092e \u0930\u0942\u092a \u0927\u0930\u093f \u0938\u093f\u092f\u0939\u093f\u0902 \u0926\u093f\u0916\u093e\u0935\u093e\u0964 \u092c\u093f\u0915\u091f \u0930\u0942\u092a \u0927\u0930\u093f \u0932\u0902\u0915 \u091c\u0930\u093e\u0935\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "In tiny form you appeared before Sita. In fierce form you burned Lanka.",
    reflection: "",
  },
  {
    chapter: 2, verse: 10,
    sanskrit: "\u092d\u0940\u092e \u0930\u0942\u092a \u0927\u0930\u093f \u0905\u0938\u0941\u0930 \u0938\u0902\u0939\u093e\u0930\u0947\u0964 \u0930\u093e\u092e\u091a\u0902\u0926\u094d\u0930 \u0915\u0947 \u0915\u093e\u091c \u0938\u0901\u0935\u093e\u0930\u0947\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "In fearsome form you destroyed demons. You accomplished all of Rama's tasks.",
    reflection: "",
  },
  {
    chapter: 2, verse: 11,
    sanskrit: "\u0932\u093e\u092f \u0938\u091c\u0940\u0935\u0928 \u0932\u0916\u0928 \u091c\u093f\u092f\u093e\u092f\u0947\u0964 \u0936\u094d\u0930\u0940\u0930\u0918\u0941\u092c\u0940\u0930 \u0939\u0930\u0937\u093f \u0909\u0930 \u0932\u093e\u092f\u0947\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Bringing the Sanjeevani herb, you revived Lakshmana. Overjoyed, Rama embraced you.",
    reflection: "",
  },
  {
    chapter: 2, verse: 12,
    sanskrit: "\u0930\u0918\u0941\u092a\u0924\u093f \u0915\u0940\u0928\u094d\u0939\u0940 \u092c\u0939\u0941\u0924 \u092c\u0921\u093c\u093e\u0908\u0964 \u0924\u0941\u092e \u092e\u092e \u092a\u094d\u0930\u093f\u092f \u092d\u0930\u0924\u0939\u093f \u0938\u092e \u092d\u093e\u0908\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Rama praised you greatly, saying: You are dear to me as my brother Bharata.",
    reflection: "",
  },
  {
    chapter: 2, verse: 13,
    sanskrit: "\u0938\u0939\u0938 \u092c\u0926\u0928 \u0924\u0941\u092e\u094d\u0939\u0930\u094b \u091c\u0938 \u0917\u093e\u0935\u0948\u0902\u0964 \u0905\u0938 \u0915\u0939\u093f \u0936\u094d\u0930\u0940\u092a\u0924\u093f \u0915\u0902\u0920 \u0932\u0917\u093e\u0935\u0948\u0902\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "The thousand-headed Shesha sings your glory \u2014 saying this, Lord Rama embraced you.",
    reflection: "",
  },
  {
    chapter: 2, verse: 14,
    sanskrit: "\u0938\u0928\u0915\u093e\u0926\u093f\u0915 \u092c\u094d\u0930\u0939\u094d\u092e\u093e\u0926\u093f \u092e\u0941\u0928\u0940\u0938\u093e\u0964 \u0928\u093e\u0930\u0926 \u0938\u093e\u0930\u0926 \u0938\u0939\u093f\u0924 \u0905\u0939\u0940\u0938\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Sanaka and other sages, Brahma and great saints, Narada, Saraswati, and Shesha all sing your praise.",
    reflection: "",
  },
  {
    chapter: 2, verse: 15,
    sanskrit: "\u091c\u092e \u0915\u0941\u092c\u0947\u0930 \u0926\u093f\u0917\u092a\u093e\u0932 \u091c\u0939\u093e\u0901 \u0924\u0947\u0964 \u0915\u092c\u093f \u0915\u094b\u092c\u093f\u0926 \u0915\u0939\u093f \u0938\u0915\u0947 \u0915\u0939\u093e\u0901 \u0924\u0947\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Yama, Kubera, and the guardian deities \u2014 what poet or scholar can fully describe your glory?",
    reflection: "",
  },
  {
    chapter: 2, verse: 16,
    sanskrit: "\u0924\u0941\u092e \u0909\u092a\u0915\u093e\u0930 \u0938\u0941\u0917\u094d\u0930\u0940\u0935\u0939\u093f\u0902 \u0915\u0940\u0928\u094d\u0939\u093e\u0964 \u0930\u093e\u092e \u092e\u093f\u0932\u093e\u092f \u0930\u093e\u091c \u092a\u0926 \u0926\u0940\u0928\u094d\u0939\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "You helped Sugriva \u2014 introducing him to Rama, you gave him his kingdom.",
    reflection: "",
  },
  {
    chapter: 2, verse: 17,
    sanskrit: "\u0924\u0941\u092e\u094d\u0939\u0930\u094b \u092e\u0902\u0924\u094d\u0930 \u0935\u093f\u092d\u0940\u0937\u0928 \u092e\u093e\u0928\u093e\u0964 \u0932\u0902\u0915\u0947\u0936\u094d\u0935\u0930 \u092d\u090f \u0938\u092c \u091c\u0917 \u091c\u093e\u0928\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Vibhishana heeded your counsel and became Lord of Lanka \u2014 the whole world knows this.",
    reflection: "",
  },
  {
    chapter: 2, verse: 18,
    sanskrit: "\u091c\u0941\u0917 \u0938\u0939\u0938\u094d\u0930 \u091c\u094b\u091c\u0928 \u092a\u0930 \u092d\u093e\u0928\u0942\u0964 \u0932\u0940\u0932\u094d\u092f\u094b \u0924\u093e\u0939\u093f \u092e\u0927\u0941\u0930 \u092b\u0932 \u091c\u093e\u0928\u0942\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "The sun, thousands of yojanas away \u2014 you swallowed it thinking it a sweet fruit.",
    reflection: "",
  },
  {
    chapter: 2, verse: 19,
    sanskrit: "\u092a\u094d\u0930\u092d\u0941 \u092e\u0941\u0926\u094d\u0930\u093f\u0915\u093e \u092e\u0947\u0932\u093f \u092e\u0941\u0916 \u092e\u093e\u0939\u0940\u0902\u0964 \u091c\u0932\u0927\u093f \u0932\u093e\u0901\u0918\u093f \u0917\u092f\u0947 \u0905\u091a\u0930\u091c \u0928\u093e\u0939\u0940\u0902\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Placing the Lord's ring in your mouth, you leaped across the ocean \u2014 no surprise.",
    reflection: "",
  },
  {
    chapter: 2, verse: 20,
    sanskrit: "\u0926\u0941\u0930\u094d\u0917\u092e \u0915\u093e\u091c \u091c\u0917\u0924 \u0915\u0947 \u091c\u0947\u0924\u0947\u0964 \u0938\u0941\u0917\u092e \u0905\u0928\u0941\u0917\u094d\u0930\u0939 \u0924\u0941\u092e\u094d\u0939\u0930\u0947 \u0924\u0947\u0924\u0947\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "All the impossible tasks of the world become easy by your grace.",
    reflection: "",
  },
  {
    chapter: 2, verse: 21,
    sanskrit: "\u0930\u093e\u092e \u0926\u0941\u0906\u0930\u0947 \u0924\u0941\u092e \u0930\u0916\u0935\u093e\u0930\u0947\u0964 \u0939\u094b\u0924 \u0928 \u0906\u091c\u094d\u091e\u093e \u092c\u093f\u0928\u0941 \u092a\u0948\u0938\u093e\u0930\u0947\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "You are the gatekeeper of Rama's door. None may enter without your permission.",
    reflection: "",
  },
  {
    chapter: 2, verse: 22,
    sanskrit: "\u0938\u092c \u0938\u0941\u0916 \u0932\u0939\u0948 \u0924\u0941\u092e\u094d\u0939\u093e\u0930\u0940 \u0938\u0930\u0928\u093e\u0964 \u0924\u0941\u092e \u0930\u0915\u094d\u0937\u0915 \u0915\u093e\u0939\u0942 \u0915\u094b \u0921\u0930 \u0928\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "All happiness comes in your refuge. With you as protector, there is no fear.",
    reflection: "",
  },
  {
    chapter: 2, verse: 23,
    sanskrit: "\u0906\u092a\u0928 \u0924\u0947\u091c \u0938\u092e\u094d\u0939\u093e\u0930\u094b \u0906\u092a\u0948\u0964 \u0924\u0940\u0928\u094b\u0902 \u0932\u094b\u0915 \u0939\u093e\u0901\u0915 \u0924\u0947\u0902 \u0915\u093e\u0901\u092a\u0948\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Only you can contain your own radiance. All three worlds tremble at your roar.",
    reflection: "",
  },
  {
    chapter: 2, verse: 24,
    sanskrit: "\u092d\u0942\u0924 \u092a\u093f\u0938\u093e\u091a \u0928\u093f\u0915\u091f \u0928\u0939\u093f\u0902 \u0906\u0935\u0948\u0964 \u092e\u0939\u093e\u092c\u0940\u0930 \u091c\u092c \u0928\u093e\u092e \u0938\u0941\u0928\u093e\u0935\u0948\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Evil spirits dare not come near when one chants the great hero's name.",
    reflection: "",
  },
  {
    chapter: 2, verse: 25,
    sanskrit: "\u0928\u093e\u0938\u0948 \u0930\u094b\u0917 \u0939\u0930\u0948 \u0938\u092c \u092a\u0940\u0930\u093e\u0964 \u091c\u092a\u0924 \u0928\u093f\u0930\u0902\u0924\u0930 \u0939\u0928\u0941\u092e\u0924 \u092c\u0940\u0930\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Diseases perish and all pain vanishes by constantly chanting brave Hanuman's name.",
    reflection: "",
  },
  {
    chapter: 2, verse: 26,
    sanskrit: "\u0938\u0902\u0915\u091f \u0924\u0947\u0902 \u0939\u0928\u0941\u092e\u093e\u0928 \u091b\u0941\u0921\u093e\u0935\u0948\u0964 \u092e\u0928 \u0915\u094d\u0930\u092e \u092c\u091a\u0928 \u0927\u094d\u092f\u093e\u0928 \u091c\u094b \u0932\u093e\u0935\u0948\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Hanuman frees from all troubles those who meditate on him in thought, deed, and word.",
    reflection: "",
  },
  {
    chapter: 2, verse: 27,
    sanskrit: "\u0938\u092c \u092a\u0930 \u0930\u093e\u092e \u0924\u092a\u0938\u094d\u0935\u0940 \u0930\u093e\u091c\u093e\u0964 \u0924\u093f\u0928 \u0915\u0947 \u0915\u093e\u091c \u0938\u0915\u0932 \u0924\u0941\u092e \u0938\u093e\u091c\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Above all is Rama, the ascetic king. You accomplished all his tasks.",
    reflection: "",
  },
  {
    chapter: 2, verse: 28,
    sanskrit: "\u0914\u0930 \u092e\u0928\u094b\u0930\u0925 \u091c\u094b \u0915\u094b\u0908 \u0932\u093e\u0935\u0948\u0964 \u0938\u094b\u0907 \u0905\u092e\u093f\u0924 \u091c\u0940\u0935\u0928 \u092b\u0932 \u092a\u093e\u0935\u0948\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Whoever comes with any desire receives the boundless fruit of life.",
    reflection: "",
  },
  {
    chapter: 2, verse: 29,
    sanskrit: "\u091a\u093e\u0930\u094b\u0902 \u091c\u0941\u0917 \u092a\u0930\u0924\u093e\u092a \u0924\u0941\u092e\u094d\u0939\u093e\u0930\u093e\u0964 \u0939\u0948 \u092a\u0930\u0938\u093f\u0926\u094d\u0927 \u091c\u0917\u0924 \u0909\u091c\u093f\u092f\u093e\u0930\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Your glory spans all four ages. Your fame illuminates the world.",
    reflection: "",
  },
  {
    chapter: 2, verse: 30,
    sanskrit: "\u0938\u093e\u0927\u0941-\u0938\u0902\u0924 \u0915\u0947 \u0924\u0941\u092e \u0930\u0916\u0935\u093e\u0930\u0947\u0964 \u0905\u0938\u0941\u0930 \u0928\u093f\u0915\u0902\u0926\u0928 \u0930\u093e\u092e \u0926\u0941\u0932\u093e\u0930\u0947\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Protector of saints and sages, destroyer of demons, beloved of Rama.",
    reflection: "",
  },
  {
    chapter: 2, verse: 31,
    sanskrit: "\u0905\u0937\u094d\u091f \u0938\u093f\u0926\u094d\u0927\u093f \u0928\u094c \u0928\u093f\u0927\u093f \u0915\u0947 \u0926\u093e\u0924\u093e\u0964 \u0905\u0938 \u092c\u0930 \u0926\u0940\u0928 \u091c\u093e\u0928\u0915\u0940 \u092e\u093e\u0924\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Bestower of eight siddhis and nine nidhis \u2014 this boon was given by Mother Janaki.",
    reflection: "",
  },
  {
    chapter: 2, verse: 32,
    sanskrit: "\u0930\u093e\u092e \u0930\u0938\u093e\u092f\u0928 \u0924\u0941\u092e\u094d\u0939\u0930\u0947 \u092a\u093e\u0938\u093e\u0964 \u0938\u0926\u093e \u0930\u0939\u094b \u0930\u0918\u0941\u092a\u0924\u093f \u0915\u0947 \u0926\u093e\u0938\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "You hold the elixir of Rama's devotion. May you ever remain Rama's servant.",
    reflection: "",
  },
  {
    chapter: 2, verse: 33,
    sanskrit: "\u0924\u0941\u092e\u094d\u0939\u0930\u0947 \u092d\u091c\u0928 \u0930\u093e\u092e \u0915\u094b \u092a\u093e\u0935\u0948\u0964 \u091c\u0928\u092e-\u091c\u0928\u092e \u0915\u0947 \u0926\u0941\u0916 \u092c\u093f\u0938\u0930\u093e\u0935\u0948\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Through your worship one attains Rama and forgets the sorrows of many lifetimes.",
    reflection: "",
  },
  {
    chapter: 2, verse: 34,
    sanskrit: "\u0905\u0902\u0924 \u0915\u093e\u0932 \u0930\u0918\u0941\u092c\u0930 \u092a\u0941\u0930 \u091c\u093e\u0908\u0964 \u091c\u0939\u093e\u0901 \u091c\u0928\u094d\u092e \u0939\u0930\u093f-\u092d\u0915\u094d\u0924 \u0915\u0939\u093e\u0908\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "At life's end one goes to Rama's abode, and wherever born again, is known as Hari's devotee.",
    reflection: "",
  },
  {
    chapter: 2, verse: 35,
    sanskrit: "\u0914\u0930 \u0926\u0947\u0935\u0924\u093e \u091a\u093f\u0924\u094d\u0924 \u0928 \u0927\u0930\u0908\u0964 \u0939\u0928\u0941\u092e\u0924 \u0938\u0947\u0908 \u0938\u0930\u094d\u092c \u0938\u0941\u0916 \u0915\u0930\u0908\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Even without worshipping other deities, serving Hanuman brings all happiness.",
    reflection: "",
  },
  {
    chapter: 2, verse: 36,
    sanskrit: "\u0938\u0902\u0915\u091f \u0915\u091f\u0948 \u092e\u093f\u091f\u0948 \u0938\u092c \u092a\u0940\u0930\u093e\u0964 \u091c\u094b \u0938\u0941\u092e\u093f\u0930\u0948 \u0939\u0928\u0941\u092e\u0924 \u092c\u0932\u092c\u0940\u0930\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "All troubles vanish and pain disappears for those who remember mighty Hanuman.",
    reflection: "",
  },
  {
    chapter: 2, verse: 37,
    sanskrit: "\u091c\u092f \u091c\u092f \u091c\u092f \u0939\u0928\u0941\u092e\u093e\u0928 \u0917\u094b\u0938\u093e\u0908\u0902\u0964 \u0915\u0943\u092a\u093e \u0915\u0930\u0939\u0941 \u0917\u0941\u0930\u0941\u0926\u0947\u0935 \u0915\u0940 \u0928\u093e\u0908\u0902\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Victory, victory, victory to Lord Hanuman! Bestow grace upon us like a Guru.",
    reflection: "",
  },
  {
    chapter: 2, verse: 38,
    sanskrit: "\u091c\u094b \u0938\u0924 \u092c\u093e\u0930 \u092a\u093e\u0920 \u0915\u0930 \u0915\u094b\u0908\u0964 \u091b\u0942\u091f\u0939\u093f \u092c\u0902\u0926\u093f \u092e\u0939\u093e \u0938\u0941\u0916 \u0939\u094b\u0908\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Whoever recites this a hundred times is freed from bondage and attains great bliss.",
    reflection: "",
  },
  {
    chapter: 2, verse: 39,
    sanskrit: "\u091c\u094b \u092f\u0939 \u092a\u0922\u093c\u0948 \u0939\u0928\u0941\u092e\u093e\u0928 \u091a\u093e\u0932\u0940\u0938\u093e\u0964 \u0939\u094b\u092f \u0938\u093f\u0926\u094d\u0927\u093f \u0938\u093e\u0916\u0940 \u0917\u094c\u0930\u0940\u0938\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Whoever reads this Hanuman Chalisa attains perfection \u2014 Shiva and Parvati are witness.",
    reflection: "",
  },
  {
    chapter: 2, verse: 40,
    sanskrit: "\u0924\u0941\u0932\u0938\u0940\u0926\u093e\u0938 \u0938\u0926\u093e \u0939\u0930\u093f \u091a\u0947\u0930\u093e\u0964 \u0915\u0940\u091c\u0948 \u0928\u093e\u0925 \u0939\u0943\u0926\u092f \u092e\u0939\u0901 \u0921\u0947\u0930\u093e\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "Tulsidas, ever servant of Hari, prays: O Lord, make my heart your dwelling.",
    reflection: "",
  },
  {
    chapter: 1, verse: 3,
    sanskrit: "\u092a\u0935\u0928\u0924\u0928\u092f \u0938\u0902\u0915\u091f \u0939\u0930\u0928 \u092e\u0902\u0917\u0932 \u092e\u0942\u0930\u0924\u093f \u0930\u0942\u092a\u0964 \u0930\u093e\u092e \u0932\u0916\u0928 \u0938\u0940\u0924\u093e \u0938\u0939\u093f\u0924 \u0939\u0943\u0926\u092f \u092c\u0938\u0939\u0941 \u0938\u0941\u0930 \u092d\u0942\u092a\u0965",
    transliteration: "",  // TODO: add IAST
    wordByWord: [],
    meaningEN: "O Son of Wind, remover of troubles, embodiment of auspiciousness! Along with Rama, Lakshmana, and Sita, dwell in my heart, O King of Gods!",
    reflection: "",
  },
];

export const TOTAL_VERSES = 43;