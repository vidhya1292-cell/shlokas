import { UserProgress, VerseProgress, Confidence } from "../types";

const STORAGE_KEY = "shloka_guru_progress";

const DEFAULT_PROGRESS: UserProgress = {
  currentChapter: 1,
  currentVerse: 1,
  streakCount: 0,
  lastPracticeDate: "",
  verseProgress: {},
  language: "en-IN",
  voice: "kabir",
};

// v2 voice IDs that are invalid in bulbul:v3
const V2_VOICES = new Set(["vidya", "anushka", "manisha", "arya", "abhilash", "karun", "hitesh", "neel"]);

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    const progress = { ...DEFAULT_PROGRESS, ...parsed };
    // Migrate stale v2 voice IDs to the new default
    if (progress.voice && V2_VOICES.has(progress.voice)) {
      progress.voice = DEFAULT_PROGRESS.voice;
    }
    return progress;
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

export function getVerseKey(chapter: number, verse: number): string {
  return `${chapter}:${verse}`;
}

export function getVerseProgress(
  progress: UserProgress,
  chapter: number,
  verse: number
): VerseProgress | null {
  return progress.verseProgress[getVerseKey(chapter, verse)] || null;
}

export function updateVerseProgress(
  progress: UserProgress,
  chapter: number,
  verse: number,
  rating: "need_more" | "getting_there" | "got_it"
): UserProgress {
  const key = getVerseKey(chapter, verse);
  const existing = progress.verseProgress[key];
  const today = new Date().toISOString().split("T")[0];

  let updated: VerseProgress;

  if (rating === "need_more") {
    updated = {
      chapter,
      verse,
      confidence: "learning" as Confidence,
      interval: 1,
      nextDueDate: getTomorrowDate(),
      timesCorrect: Math.max(0, (existing?.timesCorrect || 0) - 1),
      lastPracticed: today,
    };
  } else if (rating === "getting_there") {
    const prev = existing?.interval || 1;
    updated = {
      chapter,
      verse,
      confidence: "reviewing" as Confidence,
      interval: Math.max(2, prev * 2),
      nextDueDate: getFutureDate(Math.max(2, prev * 2)),
      timesCorrect: (existing?.timesCorrect || 0) + 1,
      lastPracticed: today,
    };
  } else {
    const prev = existing?.interval || 1;
    const timesCorrect = (existing?.timesCorrect || 0) + 1;
    const isMastered = timesCorrect >= 5;
    const interval = isMastered ? 21 : Math.max(3, Math.round(prev * 2.5));
    updated = {
      chapter,
      verse,
      confidence: isMastered ? ("mastered" as Confidence) : ("reviewing" as Confidence),
      interval,
      nextDueDate: getFutureDate(interval),
      timesCorrect,
      lastPracticed: today,
    };
  }

  const newProgress = {
    ...progress,
    verseProgress: { ...progress.verseProgress, [key]: updated },
  };
  saveProgress(newProgress);
  return newProgress;
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split("T")[0];
  const last = progress.lastPracticeDate;

  let streak = progress.streakCount;
  if (last === today) {
    // already practiced today
  } else if (last === getYesterdayDate()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const updated = {
    ...progress,
    streakCount: streak,
    lastPracticeDate: today,
  };
  saveProgress(updated);
  return updated;
}

export function getDueVerses(progress: UserProgress): Array<{ chapter: number; verse: number }> {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(progress.verseProgress)
    .filter(
      (vp) =>
        (vp.confidence === "learning" || vp.confidence === "reviewing") &&
        vp.nextDueDate <= today
    )
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
    .map((vp) => ({ chapter: vp.chapter, verse: vp.verse }));
}

export function getMasteredCount(progress: UserProgress): number {
  return Object.values(progress.verseProgress).filter(
    (vp) => vp.confidence === "mastered" || vp.timesCorrect >= 1
  ).length;
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function getFutureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
