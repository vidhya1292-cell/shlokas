/**
 * Scripture Registry
 * Single source of truth for all available learning scriptures.
 * Add new scriptures here — the session engine, home screen, and
 * storage layer all read from this registry.
 */
import { ScriptureId } from "../types";
import { Verse, Chapter } from "../types";

import {
  chapters as bgChapters,
  verses as bgVerses,
  TOTAL_VERSES as BG_TOTAL,
} from "./bgData";

import {
  chapters as hcChapters,
  verses as hcVerses,
  TOTAL_VERSES as HC_TOTAL,
} from "./hanumanChalisaData";

export interface ScriptureMeta {
  id: ScriptureId;
  titleEN: string;
  titleTA: string;
  titleHI: string;
  subtitleEN: string;
  subtitleTA: string;
  subtitleHI: string;
  icon: string;           // emoji
  totalVerses: number;
  chapters: Chapter[];
  verses: Verse[];
  defaultChapter: number;
  defaultVerse: number;
  // archive.org audio base URL pattern (optional — falls back to TTS)
  audioUrlPattern?: (chapter: number, verse: number) => string | null;
  // Path to lazy-loaded JSON (large scriptures not bundled)
  lazyJsonPath?: string;
}

export const SCRIPTURES: Record<ScriptureId, ScriptureMeta> = {
  bg: {
    id: "bg",
    titleEN: "Bhagavad Gita",
    titleTA: "பகவத் கீதை",
    titleHI: "भगवद्गीता",
    subtitleEN: "700 verses · 18 chapters",
    subtitleTA: "700 ஸ்லோகங்கள் · 18 அத்தியாயங்கள்",
    subtitleHI: "700 श्लोक · 18 अध्याय",
    icon: "📖",
    totalVerses: BG_TOTAL,
    chapters: bgChapters,
    verses: bgVerses,
    defaultChapter: 1,
    defaultVerse: 1,
    audioUrlPattern: (ch, v) =>
      `/audio/${String(ch).padStart(3, "0")}_${String(v).padStart(3, "0")}.mp3`,
  },

  hanuman_chalisa: {
    id: "hanuman_chalisa",
    titleEN: "Hanuman Chalisa",
    titleTA: "ஹனுமான் சாலீசா",
    titleHI: "हनुमान चालीसा",
    subtitleEN: "43 verses · Tulsidas",
    subtitleTA: "43 வரிகள் · துளசிதாஸ்",
    subtitleHI: "43 पद · तुलसीदास",
    icon: "🙏",
    totalVerses: HC_TOTAL,
    chapters: hcChapters,
    verses: hcVerses,
    defaultChapter: 1,
    defaultVerse: 1,
    audioUrlPattern: () => null,  // uses TTS — no pre-recorded per-verse audio
  },

  narayaneeyam: {
    id: "narayaneeyam",
    titleEN: "Narayaneeyam",
    titleTA: "நாராயணீயம்",
    titleHI: "नारायणीयम्",
    subtitleEN: "1036 verses · 100 dasakams",
    subtitleTA: "1036 ஸ்லோகங்கள் · 100 தசகங்கள்",
    subtitleHI: "1036 श्लोक · 100 दशकम्",
    icon: "🪷",
    totalVerses: 1036,
    chapters: [],   // populated when narayaneeyamData.ts is ready
    verses: [],
    defaultChapter: 1,
    defaultVerse: 1,
    audioUrlPattern: (ch) =>
      `https://archive.org/download/srimannarayaneeyam/narayan%20${ch}.MP3`,
  },

  ramayana_sundara: {
    id: "ramayana_sundara",
    titleEN: "Sundara Kanda",
    titleTA: "சுந்தர காண்டம்",
    titleHI: "सुंदर काण्ड",
    subtitleEN: "2772 shlokas · 68 sargas · Valmiki Ramayana",
    subtitleTA: "2772 ஸ்லோகங்கள் · 68 சர்கங்கள் · வால்மீகி ராமாயணம்",
    subtitleHI: "2772 श्लोक · 68 सर्ग · वाल्मीकि रामायण",
    icon: "🐒",
    totalVerses: 2772,
    chapters: [],   // lazy-loaded from /scripture-data/sundara_kanda.json
    verses: [],
    defaultChapter: 1,
    defaultVerse: 1,
    lazyJsonPath: "/scripture-data/sundara_kanda.json",
    audioUrlPattern: () => null,  // TTS for now
  },
};

export function getScripture(id: ScriptureId): ScriptureMeta {
  return SCRIPTURES[id];
}

// Only scriptures with the full Learn flow (hear → recite → record → check)
export const LEARN_SCRIPTURES: ScriptureId[] = ["bg", "hanuman_chalisa"];

// All scriptures shown in Read / Account progress — includes puranas
export const AVAILABLE_SCRIPTURES: ScriptureId[] = ["bg", "hanuman_chalisa", "ramayana_sundara"];
