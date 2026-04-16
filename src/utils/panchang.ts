// Approximate panchang (Hindu calendar) utilities.
// Tithi is calculated from lunar math. Tamil month from solar calendar.
// Accuracy is ±1 day — suitable for cultural display, not astrology.

export interface TithiInfo {
  index: number;       // 0–29
  nameEN: string;
  nameTA: string;
  nameHI: string;
  paksha: "shukla" | "krishna";
  isSpecial: boolean;
  specialEN?: string;
  specialTA?: string;
  specialHI?: string;
}

export interface TamilMonth {
  nameTA: string;
  nameEN: string;
  nameHI: string;
}

export interface Festival {
  date: string; // YYYY-MM-DD
  nameEN: string;
  nameTA: string;
  nameHI: string;
}

// ── Tithi names ─────────────────────────────────────────────────────────────
const SHUKLA_TITHIS = [
  { en: "Pratipada",             ta: "பிரதிபதை",              hi: "प्रतिपदा" },
  { en: "Dwitiya",               ta: "துவிதியை",              hi: "द्वितीया" },
  { en: "Tritiya",               ta: "திருதியை",              hi: "तृतीया" },
  { en: "Chaturthi",             ta: "சதுர்த்தி",             hi: "चतुर्थी" },
  { en: "Panchami",              ta: "பஞ்சமி",                hi: "पंचमी" },
  { en: "Shashthi",              ta: "ஷஷ்டி",                 hi: "षष्ठी" },
  { en: "Saptami",               ta: "சப்தமி",                hi: "सप्तमी" },
  { en: "Ashtami",               ta: "அஷ்டமி",               hi: "अष्टमी" },
  { en: "Navami",                ta: "நவமி",                  hi: "नवमी" },
  { en: "Dashami",               ta: "தசமி",                  hi: "दशमी" },
  { en: "Ekadashi",              ta: "ஏகாதசி",               hi: "एकादशी" },
  { en: "Dwadashi",              ta: "துவாதசி",               hi: "द्वादशी" },
  { en: "Pradosh Trayodashi",    ta: "பிரதோஷம்",             hi: "प्रदोष त्रयोदशी" },
  { en: "Chaturdashi",           ta: "சதுர்த்தசி",            hi: "चतुर्दशी" },
  { en: "Purnima",               ta: "பௌர்ணமி",              hi: "पूर्णिमा" },
];

const KRISHNA_TITHIS = [
  { en: "Pratipada",             ta: "பிரதிபதை",              hi: "प्रतिपदा" },
  { en: "Dwitiya",               ta: "துவிதியை",              hi: "द्वितीया" },
  { en: "Tritiya",               ta: "திருதியை",              hi: "तृतीया" },
  { en: "Chaturthi",             ta: "சதுர்த்தி",             hi: "चतुर्थी" },
  { en: "Panchami",              ta: "பஞ்சமி",                hi: "पंचमी" },
  { en: "Shashthi",              ta: "ஷஷ்டி",                 hi: "षष्ठी" },
  { en: "Saptami",               ta: "சப்தமி",                hi: "सप्तमी" },
  { en: "Ashtami",               ta: "அஷ்டமி",               hi: "अष्टमी" },
  { en: "Navami",                ta: "நவமி",                  hi: "नवमी" },
  { en: "Dashami",               ta: "தசமி",                  hi: "दशमी" },
  { en: "Ekadashi",              ta: "ஏகாதசி",               hi: "एकादशी" },
  { en: "Dwadashi",              ta: "துவாதசி",               hi: "द्वादशी" },
  { en: "Pradosh Trayodashi",    ta: "பிரதோஷம்",             hi: "प्रदोष त्रयोदशी" },
  { en: "Maha Chaturdashi",      ta: "மஹா சதுர்த்தசி",       hi: "महा चतुर्दशी" },
  { en: "Amavasya",              ta: "அமாவாசை",              hi: "अमावस्या" },
];

// Special tithis that get an extra note
const TITHI_SPECIALS: Record<number, { en: string; ta: string; hi: string }> = {
  3:  { en: "Vinayaka Chaturthi",  ta: "விநாயகர் சதுர்த்தி",   hi: "विनायक चतुर्थी" },
  7:  { en: "Durga Ashtami",       ta: "துர்கா அஷ்டமி",       hi: "दुर्गा अष्टमी" },
  10: { en: "Vishnu Ekadashi",     ta: "ஏகாதசி விரதம்",       hi: "एकादशी व्रत" },
  12: { en: "Pradosh Vrat",        ta: "பிரதோஷ விரதம்",       hi: "प्रदोष व्रत" },
  14: { en: "Purnima",             ta: "பௌர்ணமி",             hi: "पूर्णिमा" },
  18: { en: "Chaturthi",          ta: "சதுர்த்தி",            hi: "चतुर्थी" },
  25: { en: "Ekadashi",           ta: "ஏகாதசி விரதம்",       hi: "एकादशी व्रत" },
  27: { en: "Pradosh Vrat",       ta: "பிரதோஷ விரதம்",       hi: "प्रदोष व्रत" },
  29: { en: "Amavasya",           ta: "அமாவாசை",             hi: "अमावस्या" },
};

// ── Tamil solar months (approximate fixed dates) ──────────────────────────
// Format: [month (1-based), day-of-month] when the Tamil month begins
const TAMIL_MONTHS_DATA: Array<{ nameTA: string; nameEN: string; nameHI: string; startMonth: number; startDay: number }> = [
  { nameTA: "தை",         nameEN: "Thai",      nameHI: "थाई",       startMonth: 1,  startDay: 14 },
  { nameTA: "மாசி",       nameEN: "Maasi",     nameHI: "माशी",      startMonth: 2,  startDay: 13 },
  { nameTA: "பங்குனி",   nameEN: "Panguni",   nameHI: "पंगुनी",   startMonth: 3,  startDay: 15 },
  { nameTA: "சித்திரை", nameEN: "Chithirai", nameHI: "चित्रा",   startMonth: 4,  startDay: 14 },
  { nameTA: "வைகாசி",   nameEN: "Vaikasi",   nameHI: "वैशाख",    startMonth: 5,  startDay: 15 },
  { nameTA: "ஆனி",       nameEN: "Aani",      nameHI: "ज्येष्ठ",  startMonth: 6,  startDay: 15 },
  { nameTA: "ஆடி",       nameEN: "Aadi",      nameHI: "आषाढ़",     startMonth: 7,  startDay: 16 },
  { nameTA: "ஆவணி",     nameEN: "Aavani",    nameHI: "श्रावण",   startMonth: 8,  startDay: 17 },
  { nameTA: "புரட்டாசி", nameEN: "Purattasi", nameHI: "भाद्रपद",  startMonth: 9,  startDay: 17 },
  { nameTA: "ஐப்பசி",   nameEN: "Aippasi",   nameHI: "अश्विन",   startMonth: 10, startDay: 18 },
  { nameTA: "கார்த்திகை", nameEN: "Karthigai", nameHI: "कार्तिक", startMonth: 11, startDay: 16 },
  { nameTA: "மார்கழி",  nameEN: "Margazhi",  nameHI: "मार्गशीर्ष", startMonth: 12, startDay: 16 },
];

// ── 2026–2027 Hindu festivals ─────────────────────────────────────────────
export const FESTIVALS_2026: Festival[] = [
  { date: "2026-04-14", nameEN: "Tamil New Year / Ugadi",       nameTA: "தமிழ் புத்தாண்டு",           nameHI: "उगादि / तमिल नव वर्ष" },
  { date: "2026-04-23", nameEN: "Rama Navami",                  nameTA: "இராம நவமி",                  nameHI: "राम नवमी" },
  { date: "2026-04-28", nameEN: "Hanuman Jayanti",              nameTA: "ஆஞ்சநேயர் ஜெயந்தி",         nameHI: "हनुमान जयंती" },
  { date: "2026-04-30", nameEN: "Akshaya Tritiya",              nameTA: "அக்ஷய திருதியை",             nameHI: "अक्षय तृतीया" },
  { date: "2026-05-12", nameEN: "Buddha Purnima",               nameTA: "புத்த பூர்ணிமா",             nameHI: "बुद्ध पूर्णिमा" },
  { date: "2026-05-29", nameEN: "Vaikunta Ekadasi",             nameTA: "வைகுண்ட ஏகாதசி",            nameHI: "वैकुण्ठ एकादशी" },
  { date: "2026-07-10", nameEN: "Guru Purnima",                 nameTA: "குரு பூர்ணிமா",              nameHI: "गुरु पूर्णिमा" },
  { date: "2026-08-03", nameEN: "Krishna Janmashtami",          nameTA: "கண்ணன் ஜன்மாஷ்டமி",         nameHI: "कृष्ण जन्माष्टमी" },
  { date: "2026-08-22", nameEN: "Ganesh Chaturthi",             nameTA: "விநாயகர் சதுர்த்தி",          nameHI: "गणेश चतुर्थी" },
  { date: "2026-09-04", nameEN: "Onam / Thiruvonam",            nameTA: "ஓணம் / திருவோணம்",           nameHI: "ओणम" },
  { date: "2026-10-02", nameEN: "Navratri begins",              nameTA: "நவராத்திரி தொடக்கம்",        nameHI: "नवरात्रि शुरू" },
  { date: "2026-10-12", nameEN: "Dussehra / Vijayadashami",     nameTA: "தசரா / விஜயதசமி",           nameHI: "दशहरा / विजयदशमी" },
  { date: "2026-10-21", nameEN: "Diwali / Deepavali",           nameTA: "தீபாவளி",                    nameHI: "दीपावली" },
  { date: "2026-11-24", nameEN: "Karthigai Deepam",             nameTA: "கார்த்திகை தீபம்",           nameHI: "कार्तिक दीपम" },
  { date: "2027-01-14", nameEN: "Pongal / Makar Sankranti",     nameTA: "பொங்கல்",                    nameHI: "मकर संक्रांति / पोंगल" },
  { date: "2027-02-17", nameEN: "Maha Shivaratri",              nameTA: "மஹா சிவராத்திரி",            nameHI: "महा शिवरात्रि" },
  { date: "2027-03-04", nameEN: "Holi",                         nameTA: "ஹோலி",                       nameHI: "होली" },
];

// ── Tithi calculation ─────────────────────────────────────────────────────
// Reference: Mauni Amavasya, January 29, 2025 ≈ 07:00 UTC
const REFERENCE_AMAVASYA_MS = Date.UTC(2025, 0, 29, 7, 0, 0);
const LUNAR_MONTH_DAYS = 29.53059;

export function getTithi(date: Date = new Date()): TithiInfo {
  const daysSinceRef = (date.getTime() - REFERENCE_AMAVASYA_MS) / (1000 * 60 * 60 * 24);
  // Amavasya is index 0 in our reference; shift so that Amavasya → index 29
  const daysInCycle = ((daysSinceRef % LUNAR_MONTH_DAYS) + LUNAR_MONTH_DAYS) % LUNAR_MONTH_DAYS;
  // tithi 0 = first day after Amavasya (Shukla Pratipada)
  const rawTithi = Math.floor((daysInCycle / LUNAR_MONTH_DAYS) * 30);
  // Shift: our reference is Amavasya, so raw 0 = day after Amavasya
  // We want: 0-14 = Shukla, 15-29 = Krishna (29 = Amavasya)
  const tithiIdx = rawTithi % 30;

  const paksha = tithiIdx < 15 ? "shukla" : "krishna";
  const pakshaIdx = tithiIdx < 15 ? tithiIdx : tithiIdx - 15;
  const name = paksha === "shukla" ? SHUKLA_TITHIS[pakshaIdx] : KRISHNA_TITHIS[pakshaIdx];
  const special = TITHI_SPECIALS[tithiIdx];

  return {
    index: tithiIdx,
    nameEN: name.en,
    nameTA: name.ta,
    nameHI: name.hi,
    paksha,
    isSpecial: !!special,
    specialEN: special?.en,
    specialTA: special?.ta,
    specialHI: special?.hi,
  };
}

// ── Tamil solar month ─────────────────────────────────────────────────────
export function getTamilMonth(date: Date = new Date()): TamilMonth {
  const m = date.getMonth() + 1; // 1-based
  const d = date.getDate();

  // Walk backwards through months to find current Tamil month
  for (let i = TAMIL_MONTHS_DATA.length - 1; i >= 0; i--) {
    const { startMonth, startDay } = TAMIL_MONTHS_DATA[i];
    if (m > startMonth || (m === startMonth && d >= startDay)) {
      return {
        nameTA: TAMIL_MONTHS_DATA[i].nameTA,
        nameEN: TAMIL_MONTHS_DATA[i].nameEN,
        nameHI: TAMIL_MONTHS_DATA[i].nameHI,
      };
    }
  }
  // Wrap: if before Thai (Jan 14), we are in Margazhi of the previous cycle
  return {
    nameTA: TAMIL_MONTHS_DATA[11].nameTA,
    nameEN: TAMIL_MONTHS_DATA[11].nameEN,
    nameHI: TAMIL_MONTHS_DATA[11].nameHI,
  };
}

// ── Festival lookup (today ± 1 day window) ─────────────────────────────────
function toYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayFestival(date: Date = new Date()): Festival | null {
  const today = toYYYYMMDD(date);
  return FESTIVALS_2026.find((f) => f.date === today) ?? null;
}

// ── Day-of-year index for rotating quotes ─────────────────────────────────
export function getDayIndex(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
