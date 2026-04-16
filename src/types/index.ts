export interface WordMeaning {
  word: string;
  meaning: string;
}

export interface WordTimestamp {
  word: string;  // IAST lowercase — must match tokenize() output exactly
  start: number; // seconds from start of verse MP3
  end: number;
}

export interface Verse {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  wordByWord: WordMeaning[];
  meaningEN: string;
  meaningTA?: string;
  reflection: string;
  reflectionTA?: string;
  isPlaceholder?: boolean;
  wordTimestamps?: WordTimestamp[];
}

export interface Chapter {
  number: number;
  name: string;
  verseCount: number;
}

export type Confidence = "new" | "learning" | "reviewing" | "mastered";

export interface VerseProgress {
  chapter: number;
  verse: number;
  confidence: Confidence;
  interval: number;
  nextDueDate: string;
  timesCorrect: number;
  lastPracticed: string;
}

// All supported learning scriptures
export type ScriptureId = "bg" | "hanuman_chalisa" | "narayaneeyam" | "ramayana_sundara";

export interface ScriptureProgress {
  currentChapter: number;
  currentVerse: number;
  verseProgress: Record<string, VerseProgress>;
}

export interface UserProgress {
  // BG fields kept for backward-compat (= bg scripture progress)
  currentChapter: number;
  currentVerse: number;
  verseProgress: Record<string, VerseProgress>;
  // Multi-scripture support
  currentScripture?: ScriptureId;
  scriptureProgress?: Partial<Record<ScriptureId, ScriptureProgress>>;
  // App-level
  name?: string;
  streakCount: number;
  lastPracticeDate: string;
  language: "en-IN" | "ta-IN" | "hi-IN";
  voice?: string;
  hasCompletedOnboarding?: boolean;
  ageGroup?: "kids" | "adults";
}

export type SessionState =
  | "LOADING"
  | "NARRATE_OPENING"
  | "NARRATE_INTRO"
  | "PLAY_SHLOKA"        // 1st listen (normal speed)
  | "PLAY_SHLOKA_2"      // 2nd listen (normal speed, after 1s pause)
  | "NARRATE_YOUR_TURN"  // "Now recite along"
  | "PLAY_SHLOKA_SLOW"   // 3rd listen (0.8x speed)
  | "RECORD_RECITE"      // optional self-recording & STT check
  | "PLAY_SHLOKA_REPEAT" // kept for backward compat
  | "LISTENING"          // kept for backward compat
  | "PRONUNCIATION_CHECK"// kept for backward compat
  | "SHOW_MEANING"
  | "RATE_VERSE"
  | "NARRATE_TRANSITION"
  | "NARRATE_CLOSING"
  | "SESSION_COMPLETE"
  | "PAUSED"
  | "ERROR";

export interface SessionVerse extends Verse {
  isNew: boolean;
  retryCount: number;
}

export interface SessionStats {
  revised: number;
  newLearned: number;
  total: number;
  streak: number;
  elapsedSeconds: number;
}
