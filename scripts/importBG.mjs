/**
 * importBG.mjs — One-time import of all 700 Bhagavad Gita verses into Supabase.
 *
 * Run: node scripts/importBG.mjs
 *
 * What this does:
 *  1. Registers 'bg' in the texts table
 *  2. Inserts all 18 chapters into sections
 *  3. Fetches all 700 verses from the open-source gita/gita repo (public domain)
 *  4. Upserts all verses with English translations (Swami Gambirananda)
 *  5. Patches the first 10 verses of Ch1 and Ch2 with handcrafted Tamil
 *     translations and reflections that already existed in the app
 *  6. Adds audio timestamps for Ch1:1 (has recorded chant)
 *
 * To add a new scripture tomorrow:
 *   - Create a similar script (e.g. importVSA.mjs) that registers 'vsa' in texts,
 *     inserts sections, and upserts slokas — zero schema changes needed.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Credentials ────────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const SUPABASE_URL = env["VITE_SUPABASE_URL"];
const SERVICE_KEY  = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${url} — ${res.status}`);
  return res.json();
}

// ── Handcrafted Tamil + reflection data for Ch1:1-10 and Ch2:1-10 ─────────
// These were written specifically for this app.
// Format: { [chapterVerseKey]: { meaning_ta, reflection_en, reflection_ta, audio_timestamps? } }
const ENRICHED = {
  "1:1": {
    meaning_ta: "திருதராஷ்டிரன் கூறினான்: ஓ சஞ்சயா, தர்மத்தளமான குருக்ஷேத்திரத்தில் கூடிய என் மகன்களும் பாண்டு மகன்களும் என்ன செய்தார்கள்?",
    reflection_en: "Before any great endeavour, we must ask ourselves — what is the field I am standing on, and what am I truly fighting for?",
    reflection_ta: "எந்த முயற்சியிலும் முதலில் இந்த கேள்வி: நான் எந்த தளத்தில் நிற்கிறேன், எதற்காக போரிடுகிறேன்?",
    audio_timestamps: [
      { word: "dhṛtarāṣṭra",  start: 0.29,  end: 2.40  },
      { word: "uvāca",         start: 2.40,  end: 3.33  },
      { word: "dharmakṣetre",  start: 5.46,  end: 7.27  },
      { word: "kurukṣetre",    start: 7.62,  end: 9.32  },
      { word: "samavetā",      start: 10.22, end: 11.74 },
      { word: "yuyutsavaḥ",    start: 11.74, end: 13.26 },
      { word: "māmakāḥ",       start: 14.57, end: 15.30 },
      { word: "pāṇḍavāścaiva", start: 15.50, end: 17.16 },
      { word: "kimakurvata",   start: 18.27, end: 21.37 },
      { word: "sañjaya",       start: 21.62, end: 22.30 },
    ],
  },
  "1:2": {
    meaning_ta: "சஞ்சயன் கூறினான்: பாண்டவ சேனையின் அணிவகுப்பை கண்ட துர்யோதனன், ஆசிரியர் திரோணரை அணுகி இவ்வாறு கூறினான்.",
    reflection_en: "Even a king needs to consult his teacher in moments of uncertainty — wisdom guides strategy.",
    reflection_ta: "சந்தேகமான தருணங்களில் ஒரு ராஜனும் ஆசிரியரின் ஆலோசனை தேவை — ஞானம் உத்திக்கு வழி காட்டுகிறது.",
  },
  "1:3": {
    meaning_ta: "ஓ ஆசிரியா, உங்கள் புத்திசாலி சிஷ்யன் திருஷ்டத்யும்னன் திறமையாக அமைத்த பாண்டவர் படையைப் பாருங்கள்.",
    reflection_en: "A student who applies the teacher's knowledge wisely brings honour to the guru — our actions reflect our upbringing.",
    reflection_ta: "ஆசிரியரின் கற்பிப்பை நுண்ணறிவுடன் பயன்படுத்தும் சீடன் குருவிற்கு பெருமை சேர்க்கிறான் — நம் செயல்கள் நம் வளர்ப்பை பிரதிபலிக்கின்றன.",
  },
  "1:4": {
    meaning_ta: "இங்கே பீமனும் அர்ஜுனனுக்கும் நிகரான வீரர்கள் பலர் உள்ளனர் — யுயுதான, விராட, துருபதன் போன்ற மகாரதர்கள்.",
    reflection_en: "Recognise the strengths of those around you — in every challenge, there are people as capable and committed as the best.",
    reflection_ta: "உங்களைச் சுற்றியுள்ளவர்களின் பலத்தை அங்கீகரியுங்கள் — ஒவ்வொரு சவாலிலும் சிறந்தவர்களுக்கு இணையான திறமையாளர்கள் உள்ளனர்.",
  },
  "1:5": {
    meaning_ta: "திருஷ்டகேது, சேகிதான, காசிராஜன், புருஜித், குந்திபோஜன், சைப்யன் போன்ற நரபுங்கவர்களும் இங்கு உள்ளனர்.",
    reflection_en: "Greatness is found in people from all walks of life — every person carries a unique strength worth acknowledging.",
    reflection_ta: "மேன்மை எல்லா தரப்பிலும் காணலாம் — ஒவ்வொருவரும் தனித்துவமான ஆற்றல் கொண்டவர்.",
  },
  "1:6": {
    meaning_ta: "வலிமையான யுதாமன்யு, உத்தமௌஜஸ், சுபத்திரையின் மகன், திரௌபதியின் மகன்கள் — இவர்கள் யாவரும் மகாரதர்கள்.",
    reflection_en: "Every generation carries forward the legacy of courage — our children and students are the warriors of tomorrow.",
    reflection_ta: "ஒவ்வொரு தலைமுறையும் தைரியத்தின் மரபைத் தொடர்கிறது — நம் பிள்ளைகளும் மாணவர்களும் நாளைய வீரர்கள்.",
  },
  "1:7": {
    meaning_ta: "ஓ பார்ப்பனச் சிறந்தவனே, என் படையை வழிநடத்தும் தலைவர்களை உங்களுக்கு சொல்கிறேன் — கவனமாக கேளுங்கள்.",
    reflection_en: "A good leader knows not just the strength of the enemy, but also celebrates the excellence within their own team.",
    reflection_ta: "நல்ல தலைவன் எதிரியின் பலத்தை மட்டுமல்ல, தன் அணியினரின் சிறப்பையும் பாராட்டுகிறான்.",
  },
  "1:8": {
    meaning_ta: "நீங்கள், பீஷ்மர், கர்ணன், கிருபர், அஸ்வத்தாமா, விகர்ணன், பூரிஷ்ரவஸ் — இவர்கள் யாவரும் வெற்றி வீரர்கள்.",
    reflection_en: "Acknowledging the greatness of those on our side gives us confidence — knowing our support system strengthens our resolve.",
    reflection_ta: "நம் பக்கத்தினரின் மாண்பை ஒப்புக்கொள்வது நம்பிக்கையை வளர்க்கும் — ஆதரவை அறிவது உறுதியை தருகிறது.",
  },
  "1:9": {
    meaning_ta: "வேறு பல வீரர்களும் என்னிடம் மிகுந்த பற்றுடன் உயிரை விட தயாராக உள்ளனர் — அனைவரும் பல்வேறு ஆயுதங்களில் தேர்ந்தவர்கள்.",
    reflection_en: "True dedication means being fully prepared and willing to give everything for a worthy cause.",
    reflection_ta: "உண்மையான அர்ப்பணிப்பு என்பது முழுமையான தயார்நிலை — தகுதியான காரணத்திற்காக எல்லாவற்றையும் கொடுக்க தயாராக இருப்பது.",
  },
  "1:10": {
    meaning_ta: "பீஷ்மரால் பாதுகாக்கப்பட்ட நம் பலம் அளவற்றது. ஆனால் பீமனால் பாதுகாக்கப்பட்ட அவர்களின் பலம் அளவானது.",
    reflection_en: "We often overestimate our own strength and underestimate those we oppose — humility brings clearer vision.",
    reflection_ta: "நாம் பெரும்பாலும் நம் வலிமையை மிகைப்படுத்துகிறோம், எதிரியை குறைத்து மதிப்பிடுகிறோம் — தாழ்மை தெளிவான பார்வையை தருகிறது.",
  },
  "2:1": {
    meaning_ta: "சஞ்சயன் கூறினான்: இரக்கத்தால் வாடி, கண்களில் கண்ணீர் நிரம்பி, துக்கமடைந்த அர்ஜுனனிடம் மதுசூதனன் இவ்வாறு கூறினான்.",
    reflection_en: "Our greatest teacher often speaks to us precisely at the moment we are most broken and most open to learning.",
    reflection_ta: "நம் பெரிய ஆசிரியர் நாம் மிகவும் உடைந்திருக்கும் தருணத்திலேயே பேசுகிறார் — அப்போதுதான் நாம் கேட்கத் தயாராக இருக்கிறோம்.",
  },
  "2:2": {
    meaning_ta: "இறைவன் கூறினான்: அர்ஜுனா, இந்த இக்கட்டான நேரத்தில் இந்த மனவேலி எங்கிருந்து வந்தது? இது உயர்ந்த மனிதனுக்கு தகாது, அவமானத்தை மட்டுமே தரும்.",
    reflection_en: "Weakness is not wrong, but yielding to it at a decisive moment defines our character — we must rise above it.",
    reflection_ta: "பலவீனம் தவறில்லை, ஆனால் முக்கியமான தருணத்தில் அதற்கு அடிபணிவது நம் குணத்தை வரையறுக்கிறது — நாம் அதை கடந்து எழ வேண்டும்.",
  },
  "2:3": {
    meaning_ta: "ஓ பிருதையின் மகனே, இந்த கீழான கோழைத்தனத்திற்கு அடிபணியாதே. இது உனக்கு தகாது. இந்த இதய பலவீனத்தை விடுத்து எழு!",
    reflection_en: "Arise — the most powerful word. When life weighs us down, we must choose to get up, one step at a time.",
    reflection_ta: "எழு — மிகவும் சக்திவாய்ந்த வார்த்தை. வாழ்க்கை நம்மை கீழே தள்ளும்போது, ஒரு ஒரு அடியாக மீண்டும் எழுந்திருக்க வேண்டும்.",
  },
  "2:4": {
    meaning_ta: "அர்ஜுனன் கூறினான்: கிருஷ்ணா, பூஜிக்கத் தகுந்த பீஷ்மரையும் திரோணரையும் அம்புகளால் எவ்வாறு எதிர்க்க முடியும்?",
    reflection_en: "Sometimes the greatest conflicts are internal — fighting against those who shaped us tests our deepest values.",
    reflection_ta: "சில நேரம் மிகப் பெரிய போராட்டங்கள் உள்ளிருந்தே வருகின்றன — நம்மை வடிவமைத்தவர்களுக்கு எதிராக போராடுவது நம் ஆழமான விழுமியங்களை சோதிக்கிறது.",
  },
  "2:5": {
    meaning_ta: "இந்த மகான்களை கொல்லாமல் பிச்சை எடுத்தாவது வாழ்வது மேலானது. அவர்களை கொன்று பெறும் சுகம் இரத்தத்தில் தோய்ந்ததாகும்.",
    reflection_en: "No success built on betrayal of those who shaped us is truly sweet — integrity has a higher value than ambition.",
    reflection_ta: "நம்மை வடிவமைத்தவர்களை காட்டிக் கொடுத்து கட்டப்பட்ட வெற்றி எப்போதும் இனிமையற்றது — நேர்மை லட்சியத்தை விட உயர்ந்தது.",
  },
  "2:6": {
    meaning_ta: "எது நல்லது என்று தெரியவில்லை — அவர்களை வெல்வதா அல்லது அவர்களால் வெல்லப்படுவதா? திருதராஷ்டிரன் மகன்களை கொன்று வாழவும் விரும்பவில்லை.",
    reflection_en: "When both paths seem wrong, we must pause and seek higher wisdom rather than act from confusion.",
    reflection_ta: "இரண்டு வழிகளும் தவறாகத் தோன்றும்போது, குழப்பத்திலிருந்து செயல்படாமல் உயர்ந்த ஞானத்தை நாட வேண்டும்.",
  },
  "2:7": {
    meaning_ta: "கோழைத்தனத்தால் என் குணம் நொந்துவிட்டது, தர்மம் பற்றி மனம் தடுமாறுகிறது. எனக்கு நல்லது என்பதை சொல்லுங்கள். நான் உங்கள் சீடன், சரணடைகிறேன்.",
    reflection_en: "The first step to wisdom is the humility to say 'I don't know — please teach me.' Surrender to a true guide is strength, not weakness.",
    reflection_ta: "ஞானத்தின் முதல் படி: 'எனக்கு தெரியவில்லை — கற்பியுங்கள்' என்று தாழ்மையுடன் சொல்வது. உண்மையான வழிகாட்டியிடம் சரணடைவது பலமே.",
  },
  "2:8": {
    meaning_ta: "என் இந்திரியங்களை வாட்டும் இந்த துக்கத்தை போக்க எந்த வழியும் தெரியவில்லை. பெரிய ராஜ்யம் கிடைத்தாலும், தேவர்களின் ஆட்சி கிடைத்தாலும் இந்த கவலை நீங்காது.",
    reflection_en: "External success cannot heal inner anguish — only wisdom and self-knowledge can truly relieve the grief of the soul.",
    reflection_ta: "வெளிப்புற வெற்றி உள்ளிருக்கும் வலியை குணப்படுத்தாது — ஆத்மாவின் துக்கத்தை ஞானமும் சுய அறிவும் மட்டுமே குணப்படுத்தும்.",
  },
  "2:9": {
    meaning_ta: "சஞ்சயன் கூறினான்: இவ்வாறு சொல்லி, 'கோவிந்தா, நான் போரிட மாட்டேன்' என்று கிருஷ்ணனிடம் சொல்லி அர்ஜுனன் அமைதியானான்.",
    reflection_en: "Sometimes we reach a point of complete stillness — and in that silence, the teacher's voice can finally be heard.",
    reflection_ta: "சில நேரம் நாம் முழு அமைதிக்கு வருகிறோம் — அந்த நிசப்தத்திலேயே ஆசிரியரின் குரல் கேட்கப்படலாம்.",
  },
  "2:10": {
    meaning_ta: "ஓ பாரத, அந்த நேரத்தில் கிருஷ்ணன் புன்னகையுடன் இரு படைகளுக்கும் நடுவில் துக்கமடைந்த அர்ஜுனனிடம் இந்த வார்த்தைகளை சொன்னான்.",
    reflection_en: "A true teacher meets us in our lowest moment with a smile — not dismissing our pain, but seeing beyond it with compassion.",
    reflection_ta: "உண்மையான ஆசிரியர் நம் கீழான நேரத்திலும் புன்னகையுடன் வருகிறார் — நம் வலியை ஒதுக்காமல், கருணையுடன் அதற்கு அப்பால் பார்க்கிறார்.",
  },
};

// ── BG chapter metadata ────────────────────────────────────────────────────
const BG_CHAPTERS = [
  { number: 1,  name: "Arjuna Vishada Yoga",            sloka_count: 47 },
  { number: 2,  name: "Sankhya Yoga",                   sloka_count: 72 },
  { number: 3,  name: "Karma Yoga",                     sloka_count: 43 },
  { number: 4,  name: "Jnana Karma Sanyasa Yoga",       sloka_count: 42 },
  { number: 5,  name: "Karma Sanyasa Yoga",             sloka_count: 29 },
  { number: 6,  name: "Atma Samyama Yoga",              sloka_count: 47 },
  { number: 7,  name: "Jnana Vijnana Yoga",             sloka_count: 30 },
  { number: 8,  name: "Akshara Brahma Yoga",            sloka_count: 28 },
  { number: 9,  name: "Raja Vidya Raja Guhya Yoga",     sloka_count: 34 },
  { number: 10, name: "Vibhuti Yoga",                   sloka_count: 42 },
  { number: 11, name: "Vishwarupa Darshana Yoga",       sloka_count: 55 },
  { number: 12, name: "Bhakti Yoga",                    sloka_count: 20 },
  { number: 13, name: "Kshetra Kshetrajna Vibhaga Yoga",sloka_count: 35 },
  { number: 14, name: "Gunatraya Vibhaga Yoga",         sloka_count: 27 },
  { number: 15, name: "Purushottama Yoga",              sloka_count: 20 },
  { number: 16, name: "Daivasura Sampad Vibhaga Yoga",  sloka_count: 24 },
  { number: 17, name: "Shraddhatraya Vibhaga Yoga",     sloka_count: 28 },
  { number: 18, name: "Moksha Sanyasa Yoga",            sloka_count: 78 },
];

// ── Parse word meanings ────────────────────────────────────────────────────
function parseWordMeanings(str) {
  if (!str) return [];
  return str.split(";").flatMap((part) => {
    const [word, ...rest] = part.split("—");
    if (!word || rest.length === 0) return [];
    return [{ word: word.trim(), meaning: rest.join("—").replace(/\n/g, " ").trim() }];
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
console.log("🕉  Shloka Guru — Bhagavad Gita Import");
console.log("─".repeat(50));

// 1. Fetch source data
console.log("\n① Fetching verse data from GitHub (gita/gita)…");
const [versesRaw, translationsRaw] = await Promise.all([
  fetchJSON("https://raw.githubusercontent.com/gita/gita/master/data/verse.json"),
  fetchJSON("https://raw.githubusercontent.com/gita/gita/master/data/translation.json"),
]);
console.log(`   ✓ ${versesRaw.length} verses, ${translationsRaw.length} translations`);

// 2. Build EN translation map (Gambirananda preferred)
const priority = { "Swami Gambirananda": 3, "Swami Sivananda": 2, "Swami Adidevananda": 1 };
const enTrans = {};
for (const t of translationsRaw) {
  if (t.lang !== "english") continue;
  const p = priority[t.authorName] ?? 0;
  if (!enTrans[t.verse_id] || p > enTrans[t.verse_id][1]) {
    enTrans[t.verse_id] = [t.description.trim().replace(/\n/g, " "), p];
  }
}

// 3. Register 'bg' in texts table
console.log("\n② Registering Bhagavad Gita in texts…");
const { error: textErr } = await supabase.from("texts").upsert({
  id:            "bg",
  name:          "Bhagavad Gita",
  name_ta:       "பகவத் கீதை",
  name_hi:       "भगवद्गीता",
  description:   "The 700-verse dialogue between Prince Arjuna and the god Krishna, forming chapters 23–40 of the Bhishma Parva of the Mahabharata.",
  description_ta:"அர்ஜுனனும் கிருஷ்ணனும் நடத்திய 700 ஸ்லோக உரையாடல் — மகாபாரதத்தின் பீஷ்ம பர்வத்தில் 23–40 அத்தியாயங்கள்.",
  cover_emoji:   "📖",
  total_slokas:  700,
  display_mode:  "chapters",
  sort_order:    1,
  is_active:     true,
}, { onConflict: "id" });
if (textErr) { console.error("❌ texts upsert failed:", textErr.message); process.exit(1); }
console.log("   ✓ texts OK");

// 4. Upsert sections (18 chapters)
console.log("\n③ Upserting 18 chapters into sections…");
const sectionRows = BG_CHAPTERS.map((ch) => ({
  text_id:     "bg",
  number:      ch.number,
  name:        ch.name,
  sloka_count: ch.sloka_count,
}));
const { error: secErr } = await supabase
  .from("sections")
  .upsert(sectionRows, { onConflict: "text_id,number" });
if (secErr) { console.error("❌ sections upsert failed:", secErr.message); process.exit(1); }
console.log("   ✓ sections OK (18 chapters)");

// 5. Build sloka rows
console.log("\n④ Building sloka rows…");
const rows = versesRaw.map((v) => {
  const key = `${v.chapter_number}:${v.verse_number}`;
  const enriched = ENRICHED[key] ?? {};
  return {
    text_id:          "bg",
    section_number:   v.chapter_number,
    position:         v.verse_number,
    sanskrit:         v.text.trim(),
    transliteration:  v.transliteration.trim(),
    word_meanings:    parseWordMeanings(v.word_meanings),
    meaning_en:       (enTrans[v.id]?.[0] ?? ""),
    meaning_ta:       enriched.meaning_ta  ?? "",
    meaning_hi:       "",
    reflection_en:    enriched.reflection_en  ?? "",
    reflection_ta:    enriched.reflection_ta  ?? "",
    audio_timestamps: enriched.audio_timestamps ?? [],
    has_audio:        !!enriched.audio_timestamps,
    is_active:        true,
  };
});
console.log(`   ✓ ${rows.length} rows ready`);

// 6. Upsert in batches of 100
console.log("\n⑤ Upserting slokas into Supabase…");
const BATCH = 100;
let done = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("slokas")
    .upsert(batch, { onConflict: "text_id,section_number,position" });
  if (error) {
    console.error(`\n❌ Error at batch ${Math.floor(i / BATCH) + 1}:`, error.message);
    process.exit(1);
  }
  done += batch.length;
  process.stdout.write(`\r   ${done}/${rows.length} slokas`);
}
console.log("\n   ✓ All slokas imported");

// 7. Verify
const { count } = await supabase
  .from("slokas")
  .select("id", { count: "exact", head: true })
  .eq("text_id", "bg");
console.log(`\n✅ Done — ${count} BG slokas in database`);
console.log("\nTo add more enriched Tamil/Hindi content later:");
console.log("  UPDATE slokas SET meaning_ta='...', reflection_ta='...'");
console.log("  WHERE text_id='bg' AND section_number=3 AND position=35;");
console.log("\nTo add a new scripture:");
console.log("  node scripts/importVSA.mjs   ← create that file following this pattern");
