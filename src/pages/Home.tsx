import { useLocation } from "wouter";
import { loadProgress, saveProgress, getMasteredCount, getDueVerses } from "../services/storage";
import { getRandomVerse, TOTAL_VERSES, chapters, verses as allVerses } from "../data/bgData";
import { DEITY_COLLECTIONS } from "../data/deityData";
import { BHAJANS } from "../data/bhajanData";
import { useMemo, useState, useRef, useCallback } from "react";
import { UserProgress } from "../types";
import {
  VOICE_OPTIONS,
  DEFAULT_VOICE,
  textToSpeech,
  playBase64Audio,
  stopCurrentAudio,
  unlockAudioContext,
} from "../services/sarvamService";
import { unlockChantingAudio } from "../services/chantingService";
import { getMantraAudioUrl } from "../services/jiosaavnService";

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:         "#F5F7FF",
  card:       "#FFFFFF",
  cardBorder: "#DBEAFE",
  primary:    "#1E3A8A",
  gold:       "#C4973A",
  tint:       "#EEF2FF",
  text:       "#1E2D5A",
  textMid:    "#4B6CB7",
};

// ── Mantras for chanting player ───────────────────────────────────────────────
const MANTRAS = [
  {
    id: "om",
    labelEn: "Om",
    labelTa: "ஓம்",
    symbol: "ॐ",
    tagEn: "Primordial sound · Meditation",
    tagTa: "ஆதி ஓசை · தியானம்",
  },
  {
    id: "ram",
    labelEn: "Hare Krishna Mahamantra",
    labelTa: "ஹரே கிருஷ்ண மஹாமந்திரம்",
    symbol: "हरे",
    tagEn: "ISKCON · Srila Prabhupada",
    tagTa: "ISKCON · பிரபுபாத சுவாமி",
  },
  {
    id: "shiva",
    labelEn: "Om Namah Shivaya",
    labelTa: "ஓம் நமச்சிவாய",
    symbol: "शिव",
    tagEn: "Panchakshara · Shiva mantra",
    tagTa: "பஞ்சாக்ஷர · சிவ மந்திரம்",
  },
];


// ── Helpers ───────────────────────────────────────────────────────────────────
function getOrderedVerses(progress: UserProgress) {
  // Scan new verses starting from the user's chosen chapter:verse, wrap around
  const startIdx = allVerses.findIndex(
    (v) => !v.isPlaceholder && v.chapter === progress.currentChapter && v.verse >= progress.currentVerse
  );
  const from = startIdx >= 0 ? startIdx : 0;
  return [...allVerses.slice(from), ...allVerses.slice(0, from)];
}

function getNextPracticeVerse(progress: UserProgress): { chapter: number; verse: number } {
  const due = getDueVerses(progress);
  if (due.length > 0) return { chapter: due[0].chapter, verse: due[0].verse };
  const learnedSet = new Set(Object.keys(progress.verseProgress));
  for (const v of getOrderedVerses(progress)) {
    if (v.isPlaceholder) continue;
    const key = `${v.chapter}:${v.verse}`;
    if (!learnedSet.has(key)) return { chapter: v.chapter, verse: v.verse };
  }
  return { chapter: progress.currentChapter, verse: progress.currentVerse };
}

function getSessionVerseCount(progress: UserProgress): number {
  const dueKeys = getDueVerses(progress);
  const revisionCount = Math.min(3, dueKeys.length);
  const revisionSet = new Set(dueKeys.slice(0, 3).map((v) => `${v.chapter}:${v.verse}`));
  const learnedSet = new Set(Object.keys(progress.verseProgress));
  const maxNew = Math.max(2, 5 - revisionCount);
  let newCount = 0;
  for (const v of getOrderedVerses(progress)) {
    if (newCount >= maxNew) break;
    if (v.isPlaceholder) continue;
    const key = `${v.chapter}:${v.verse}`;
    if (!learnedSet.has(key) && !revisionSet.has(key)) newCount++;
  }
  return Math.min(5, revisionCount + newCount);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const verseOfDay = useMemo(() => getRandomVerse(), []);
  const masteredCount = getMasteredCount(progress);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const previewAbortRef = useRef(false);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedDeity, setExpandedDeity] = useState<string | null>(null);
  const [showChapterPicker, setShowChapterPicker] = useState(false);

  // Chanting player state
  const [chantIdx, setChantIdx] = useState(0);
  const [mantraPlaying, setMantraPlaying] = useState(false);
  const [mantraLoading, setMantraLoading] = useState(false);
  const [mantraTarget, setMantraTarget] = useState(0);   // 0 = ∞
  const [mantraPlayCount, setMantraPlayCount] = useState(0);
  const mantraAudioRef = useRef<HTMLAudioElement | null>(null);
  const mantraTargetRef = useRef(0);

  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  const nextVerse = useMemo(() => getNextPracticeVerse(progress), [progress]);
  const sessionVerseCount = useMemo(() => getSessionVerseCount(progress), [progress]);
  const currentChapter = chapters.find((c) => c.number === nextVerse.chapter);
  const chapterName = currentChapter?.name || "Arjuna Vishada Yoga";
  const currentVoice = progress.voice || DEFAULT_VOICE;
  const progressPct = Math.round((masteredCount / TOTAL_VERSES) * 100);
  const isNewLearner = Object.keys(progress.verseProgress).length === 0;

  const cycleLanguage = () => {
    const order: Array<"en-IN" | "ta-IN" | "hi-IN"> = ["en-IN", "ta-IN", "hi-IN"];
    const idx = order.indexOf(progress.language as "en-IN" | "ta-IN" | "hi-IN");
    const newLang = order[(idx + 1) % order.length];
    const updated = { ...progress, language: newLang };
    saveProgress(updated);
    setProgress(updated);
  };

  const langLabel = isTamil ? "தமிழ்" : isHindi ? "हिं" : "EN";

  const selectVoice = (voiceId: string) => {
    const updated = { ...progress, voice: voiceId };
    saveProgress(updated);
    setProgress(updated);
  };

  const PREVIEW_TEXTS = {
    en: "Namaste. I am your Gita teacher. Let us begin today's class with reverence.",
    ta: "நமஸ்காரம். நான் உங்கள் கீதை ஆசிரியர். இன்று நாம் பக்தியுடன் தொடங்குவோம்.",
    hi: "नमस्ते। मैं आपका गीता शिक्षक हूँ। आज का पाठ भक्ति के साथ शुरू करते हैं।",
  };

  const previewVoice = async (voiceId: string) => {
    if (previewingVoice === voiceId) return;
    // Stop any in-flight preview immediately (no delay)
    previewAbortRef.current = true;
    stopCurrentAudio();
    previewAbortRef.current = false;
    setPreviewingVoice(voiceId);
    try {
      const lang = isTamil ? "ta-IN" : isHindi ? "hi-IN" : "en-IN";
      const text = isTamil ? PREVIEW_TEXTS.ta : isHindi ? PREVIEW_TEXTS.hi : PREVIEW_TEXTS.en;
      const audio = await textToSpeech(text, lang, 1.0, voiceId);
      if (!previewAbortRef.current) await playBase64Audio(audio);
    } catch {
    } finally {
      setPreviewingVoice(null);
    }
  };

  const currentVoiceOption = VOICE_OPTIONS.find((v) => v.id === currentVoice);

  // ── Chanting player ──────────────────────────────────────────────────────────
  const stopMantra = useCallback(() => {
    if (mantraAudioRef.current) {
      mantraAudioRef.current.pause();
      mantraAudioRef.current.src = "";
      mantraAudioRef.current = null;
    }
    setMantraPlaying(false);
    setMantraLoading(false);
    setMantraPlayCount(0);
  }, []);

  const selectTarget = (n: number) => {
    setMantraTarget(n);
    mantraTargetRef.current = n;
  };

  const playChant = useCallback(async () => {
    if (mantraPlaying) { stopMantra(); return; }
    setMantraLoading(true);
    setMantraPlayCount(0);
    let localCount = 0;
    try {
      const url = await getMantraAudioUrl(MANTRAS[chantIdx].id);
      if (!url) throw new Error("no url");
      const audio = new Audio(url);
      mantraAudioRef.current = audio;
      audio.onended = () => {
        localCount++;
        setMantraPlayCount(localCount);
        const target = mantraTargetRef.current;
        if (target > 0 && localCount >= target) {
          setMantraPlaying(false);
          mantraAudioRef.current = null;
        } else {
          audio.currentTime = 0;
          audio.play().catch(() => setMantraPlaying(false));
        }
      };
      audio.onerror = () => { setMantraPlaying(false); setMantraLoading(false); };
      await audio.play();
      setMantraPlaying(true);
    } catch {
      setMantraPlaying(false);
    } finally {
      setMantraLoading(false);
    }
  }, [mantraPlaying, chantIdx, stopMantra]);

  const prevChant = () => { stopMantra(); setChantIdx((i) => (i + MANTRAS.length - 1) % MANTRAS.length); };
  const nextChant = () => { stopMantra(); setChantIdx((i) => (i + 1) % MANTRAS.length); };

  // ── Share verse ──────────────────────────────────────────────────────────────
  const shareVerse = async () => {
    const shareText =
      `${verseOfDay.sanskrit.split("\n")[0]}\n\n` +
      `${verseOfDay.transliteration.split("\n")[0]}\n\n` +
      `"${verseOfDay.meaningEN}"\n\n` +
      `— Bhagavad Gita ${verseOfDay.chapter}:${verseOfDay.verse} · Shlokas.in`;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ text: shareText }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopiedVerse(true);
      setTimeout(() => setCopiedVerse(false), 2000);
    }
  };

  const resetProgress = () => {
    const fresh: UserProgress = {
      currentChapter: 1, currentVerse: 1, streakCount: 0,
      lastPracticeDate: "", verseProgress: {},
      language: progress.language, voice: progress.voice,
    };
    saveProgress(fresh);
    setProgress(fresh);
  };

  const jumpToChapter = (chapterNumber: number) => {
    const updated = { ...progress, currentChapter: chapterNumber, currentVerse: 1 };
    saveProgress(updated);
    setProgress(updated);
    setShowChapterPicker(false);
  };

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: P.bg, color: P.text }}
    >
      {/* ── App Bar ──────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ background: P.bg, borderBottom: `1px solid ${P.cardBorder}` }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Noto Serif Devanagari', serif",
              fontSize: 28,
              color: P.gold,
              lineHeight: 1,
            }}
          >
            ॐ
          </span>
          <div>
            <div className="text-base font-bold" style={{ color: P.primary }}>Shlokas</div>
            <div className="text-xs opacity-50">{t("Your Sanskrit teacher", "உங்கள் ஆசிரியர்", "आपके शिक्षक")}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoicePicker((v) => !v)}
            className="flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              width: 40, height: 40,
              background: showVoicePicker ? P.primary : "white",
              color: showVoicePicker ? "white" : P.primary,
              border: `2px solid ${P.primary}`,
            }}
            aria-label="Choose voice"
          >
            <span style={{ fontSize: 16 }}>🎙</span>
          </button>

          <button
            onClick={cycleLanguage}
            className="flex items-center gap-1 rounded-full px-3 transition-all active:scale-95"
            style={{
              height: 40,
              background: (isTamil || isHindi) ? P.primary : "white",
              color: (isTamil || isHindi) ? "white" : P.primary,
              border: `2px solid ${P.primary}`,
              fontSize: 13, fontWeight: 700,
            }}
            aria-label="Change language"
          >
            <span style={{ fontSize: 14 }}>🌐</span>
            <span>{langLabel}</span>
          </button>
        </div>
      </div>

      {/* ── Content scroll area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: P.primary }}>
            {t("Namaste 🙏", "நமஸ்காரம் 🙏", "नमस्ते 🙏")}
          </h1>
          {progress.streakCount > 0 && (
            <p className="text-sm opacity-60 mt-0.5">
              {t(
                `${progress.streakCount} day streak 🔥 · Keep it going!`,
                `${progress.streakCount} நாள் தொடர்ச்சி 🔥 · தொடரும்!`,
                `${progress.streakCount} दिन की लकीर 🔥 · जारी रखें!`,
              )}
            </p>
          )}
        </div>

        {/* ── Voice picker panel ──────────────────────────────────────────────── */}
        {showVoicePicker && (
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm" style={{ color: P.text }}>
                  {t("Choose Teacher Voice", "ஆசிரியர் குரல் தேர்வு", "शिक्षक की आवाज़ चुनें")}
                </p>
                <p className="text-xs opacity-50 mt-0.5">
                  {t("Tap ▶ to preview", "▶ அழுத்தி கேளுங்கள்", "▶ सुनने के लिए दबाएं")}
                </p>
              </div>
              <button
                onClick={() => setShowVoicePicker(false)}
                className="text-xl opacity-30 hover:opacity-60 transition-opacity leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {VOICE_OPTIONS.map((v) => {
                const isSelected = currentVoice === v.id;
                const isPreviewing = previewingVoice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => selectVoice(v.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && selectVoice(v.id)}
                    className="rounded-xl p-3 flex items-center gap-3 cursor-pointer select-none transition-all"
                    style={{
                      border: `2px solid ${isSelected ? P.primary : P.cardBorder}`,
                      background: isSelected ? P.tint : "white",
                    }}
                  >
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold shrink-0"
                      style={{
                        background: v.gender === "female" ? "#F3E8FF" : "#E8F0FF",
                        color: v.gender === "female" ? "#7C3AED" : "#1D4ED8",
                      }}
                    >
                      {v.gender === "female" ? "♀" : "♂"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: P.text }}>{v.name}</p>
                      <p className="text-xs opacity-55">{v.tagline}</p>
                    </div>
                    {isSelected && <span className="font-bold text-sm shrink-0" style={{ color: P.primary }}>✓</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); unlockAudioContext(); unlockChantingAudio(); previewVoice(v.id); }}
                      disabled={isPreviewing}
                      className="text-xs rounded-lg px-2 py-1 font-semibold transition-all active:scale-95 disabled:opacity-50 shrink-0"
                      style={{ background: P.tint, color: P.primary, border: `1px solid ${P.gold}` }}
                    >
                      {isPreviewing ? "⏳" : "▶"}
                    </button>
                  </div>
                );
              })}
            </div>
            {currentVoiceOption && (
              <div className="mt-3 rounded-xl px-3 py-2 text-xs" style={{ background: P.tint, color: P.primary }}>
                {t("Selected:", "தேர்ந்தெடுக்கப்பட்டது:", "चुना गया:")}{" "}
                <strong>{currentVoiceOption.name}</strong> · {currentVoiceOption.tagline}
              </div>
            )}
          </div>
        )}

        {/* ── New learner discovery ─────────────────────────────────────────── */}
        {isNewLearner && (
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: P.primary }}>
                {t("What would you like to explore?", "என்ன கற்க விரும்புகிறீர்கள்?", "क्या सीखना चाहेंगे?")}
              </h2>
              <p className="text-sm opacity-50 mt-0.5">
                {t("Pick a path to get started", "ஒரு பாதையை தேர்வு செய்யுங்கள்", "शुरू करने के लिए एक रास्ता चुनें")}
              </p>
            </div>

            {/* BG card */}
            <button
              onClick={() => navigate("/session")}
              className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
              style={{ background: "white", border: `2px solid ${P.primary}`, boxShadow: "0 4px 20px rgba(30,58,138,0.12)" }}
            >
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
                  style={{ background: P.tint }}>📖</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base" style={{ color: P.primary }}>
                      {t("Bhagavad Gita", "பகவத் கீதை", "भगवद्गीता")}
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "#DCFCE7", color: "#15803D" }}>
                      {t("AI Teacher", "AI ஆசிரியர்", "AI शिक्षक")}
                    </span>
                  </div>
                  <p className="text-sm opacity-55 mt-0.5">
                    {t("700 verses · 18 chapters · Learn with voice", "700 ஸ்லோகங்கள் · குரலில் கற்க", "700 श्लोक · 18 अध्याय · आवाज़ से सीखें")}
                  </p>
                  <p className="text-xs font-semibold mt-2" style={{ color: P.primary }}>
                    {t("Start Learning →", "கற்கத் தொடங்கு →", "सीखना शुरू करें →")}
                  </p>
                </div>
              </div>
            </button>

            {/* Mantras card */}
            <div
              className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
                style={{ background: "#FFF7ED" }}>🕉️</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base" style={{ color: P.text }}>
                  {t("Mantra Chanting", "மந்திர ஜபம்", "मंत्र जप")}
                </p>
                <p className="text-sm opacity-55 mt-0.5">
                  {t("Om · Hare Krishna · Om Namah Shivaya", "ஓம் · ஹரே கிருஷ்ண · நமச்சிவாய", "ॐ · हरे कृष्ण · नमः शिवाय")}
                </p>
                <p className="text-xs opacity-40 mt-1">{t("Available below ↓", "கீழே உள்ளது ↓", "नीचे उपलब्ध ↓")}</p>
              </div>
            </div>

            {/* Deity shlokas card */}
            <div
              className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
                style={{ background: "#FDF4FF" }}>🪔</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base" style={{ color: P.text }}>
                  {t("Deity Shlokas & Bhajans", "தெய்வ ஸ்லோகங்கள்", "देवता श्लोक")}
                </p>
                <p className="text-sm opacity-55 mt-0.5">
                  {t("Prayers for Ganesha, Shiva, Devi & more", "கணேஷ், சிவன், தேவி மற்றும் பலர்", "गणेश, शिव, देवी और अधिक")}
                </p>
                <p className="text-xs opacity-40 mt-1">{t("Available below ↓", "கீழே உள்ளது ↓", "नीचे उपलब्ध ↓")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Today's Class card ──────────────────────────────────────────────── */}
        {!isNewLearner && <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
        >
          {/* Blue top strip */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: P.tint, color: P.primary }}
                >
                  {t("Today's Class", "இன்றைய வகுப்பு", "आज की कक्षा")}
                </span>
                <h2 className="text-xl font-bold mt-2.5" style={{ color: P.text }}>
                  {t(
                    `Chapter ${nextVerse.chapter} · Verse ${nextVerse.verse}`,
                    `அத்தியாயம் ${nextVerse.chapter} · ஸ்லோகம் ${nextVerse.verse}`,
                    `अध्याय ${nextVerse.chapter} · श्लोक ${nextVerse.verse}`,
                  )}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm opacity-55">{chapterName}</p>
                  <button
                    onClick={() => setShowChapterPicker(true)}
                    className="text-xs font-semibold rounded-full px-2 py-0.5 transition-all active:scale-95"
                    style={{ background: P.tint, color: P.primary, border: `1px solid ${P.cardBorder}` }}
                  >
                    {t("Change", "மாற்று", "बदलें")}
                  </button>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: P.tint }}
              >
                <span style={{ fontSize: 28 }}>📖</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs opacity-50">{t("Your progress", "உங்கள் முன்னேற்றம்", "आपकी प्रगति")}</span>
                <span className="text-xs font-semibold" style={{ color: P.primary }}>
                  {masteredCount}/{TOTAL_VERSES} {t("verses", "ஸ்லோகங்கள்", "श्लोक")} · {progressPct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: P.tint }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(2, progressPct)}%`, background: P.gold }}
                />
              </div>
            </div>
          </div>

          {/* CTA button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => navigate("/session")}
              className="w-full rounded-xl text-white font-bold text-lg transition-all active:scale-[0.98]"
              style={{
                background: P.primary,
                height: 56,
                boxShadow: "0 4px 20px rgba(30,58,138,0.35)",
              }}
            >
              {t("▶  Start Today's Class", "▶  இன்றைய வகுப்பை தொடங்கு", "▶  आज की कक्षा शुरू करें")}
            </button>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs opacity-40">
                {t(
                  `~${sessionVerseCount * 2} mins · ${sessionVerseCount} verses`,
                  `~${sessionVerseCount * 2} நிமிடம் · ${sessionVerseCount} ஸ்லோகங்கள்`,
                  `~${sessionVerseCount * 2} मिनट · ${sessionVerseCount} श्लोक`,
                )}
              </p>
              {masteredCount > 0 && (
                <button
                  onClick={resetProgress}
                  className="text-xs opacity-30 hover:opacity-60 underline transition-opacity"
                  style={{ color: P.text }}
                >
                  {t("Reset progress", "மீட்டமை", "रीसेट करें")}
                </button>
              )}
            </div>
          </div>
        </div>}

        {/* ── Mantra Chanting Player ──────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>🕉️</span>
              <span className="font-bold text-sm" style={{ color: P.gold }}>
                {t("Mantra Chanting", "மந்திர ஜபம்", "मंत्र जप")}
              </span>
            </div>
            {mantraPlaying && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#DCFCE7", color: "#15803D" }}>
                {t("Playing", "இயங்குகிறது", "चल रहा है")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Prev */}
            <button
              onClick={prevChant}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-lg font-bold"
              style={{ background: P.tint, color: P.primary, border: `1px solid ${P.cardBorder}` }}
              aria-label="Previous mantra"
            >
              ‹
            </button>

            {/* Center — mantra symbol + label + tag */}
            <div className="flex-1 text-center">
              <div
                style={{
                  fontFamily: "'Noto Serif Devanagari', serif",
                  fontSize: 28,
                  color: P.primary,
                  lineHeight: 1.2,
                }}
              >
                {MANTRAS[chantIdx].symbol}
              </div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: P.text }}>
                {isTamil ? MANTRAS[chantIdx].labelTa : MANTRAS[chantIdx].labelEn}
              </div>
              <div className="text-xs opacity-45 mt-0.5">
                {isTamil ? MANTRAS[chantIdx].tagTa : MANTRAS[chantIdx].tagEn}
              </div>
            </div>

            {/* Play / Pause / Loading */}
            <button
              onClick={() => { unlockAudioContext(); unlockChantingAudio(); playChant(); }}
              disabled={mantraLoading}
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-70"
              style={{
                background: mantraPlaying ? "#15803D" : P.primary,
                color: "white",
                boxShadow: `0 4px 16px ${mantraPlaying ? "rgba(21,128,61,0.35)" : "rgba(30,58,138,0.30)"}`,
              }}
              aria-label={mantraPlaying ? "Stop mantra" : "Play mantra"}
            >
              <span style={{ fontSize: 22 }}>
                {mantraLoading ? "⏳" : mantraPlaying ? "⏸" : "▶"}
              </span>
            </button>

            {/* Next */}
            <button
              onClick={nextChant}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-lg font-bold"
              style={{ background: P.tint, color: P.primary, border: `1px solid ${P.cardBorder}` }}
              aria-label="Next mantra"
            >
              ›
            </button>
          </div>

          {/* Mantra dots */}
          <div className="flex justify-center gap-2 mt-3">
            {MANTRAS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === chantIdx ? 20 : 6,
                  height: 6,
                  background: i === chantIdx ? P.gold : P.cardBorder,
                }}
              />
            ))}
          </div>

          {/* Repeat count selector */}
          <div className="mt-3">
            <p className="text-xs text-center opacity-45 mb-1.5">
              {t("Repeat", "மீண்டும்", "दोहराएं")}
            </p>
            <div className="flex justify-center gap-2">
              {([26, 51, 108, 0] as const).map((n) => {
                const isActive = mantraTarget === n;
                return (
                  <button
                    key={n}
                    onClick={() => selectTarget(n)}
                    className="rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95"
                    style={{
                      background: isActive ? P.gold : P.tint,
                      color: isActive ? "white" : P.textMid,
                      border: `1.5px solid ${isActive ? P.gold : P.cardBorder}`,
                    }}
                  >
                    {n === 0 ? "∞" : `×${n}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Play count progress */}
          {mantraPlaying && mantraTarget > 0 && (
            <div className="mt-2 text-center">
              <span className="text-xs font-bold" style={{ color: "#15803D" }}>
                {mantraPlayCount}
              </span>
              <span className="text-xs opacity-40"> / {mantraTarget}</span>
            </div>
          )}

          {/* Stop button — always visible when playing */}
          {(mantraPlaying || mantraLoading) && (
            <button
              onClick={stopMantra}
              className="mt-3 w-full rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                height: 40,
                background: "#FEE2E2",
                color: "#DC2626",
                border: "1.5px solid #FECACA",
              }}
            >
              {t("■ Stop Chanting", "■ ஜபம் நிறுத்து", "■ जप रोकें")}
            </button>
          )}
        </div>

        {/* ── Verse of the Day ──────────────────────────────────────────────────── */}
        {!isNewLearner && <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>✨</span>
              <span className="font-bold text-sm" style={{ color: P.gold }}>
                {t("Verse of the Day", "இன்றைய ஸ்லோகம்", "आज का श्लोक")}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: P.tint, color: P.textMid }}
              >
                {verseOfDay.chapter}:{verseOfDay.verse}
              </span>
            </div>

            {/* Share button */}
            <button
              onClick={shareVerse}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all active:scale-95"
              style={{
                background: copiedVerse ? "#DCFCE7" : P.tint,
                color: copiedVerse ? "#15803D" : P.primary,
                border: `1px solid ${copiedVerse ? "#BBF7D0" : P.cardBorder}`,
              }}
            >
              {copiedVerse ? "✓ Copied" : "↑ Share"}
            </button>
          </div>

          <p
            className="text-center leading-relaxed mb-3"
            style={{
              fontFamily: "'Noto Serif Devanagari', 'Noto Sans Devanagari', sans-serif",
              fontSize: 22,
              color: P.text,
              lineHeight: 1.8,
            }}
          >
            {verseOfDay.sanskrit.split("\n")[0]}
          </p>

          <p className="text-center text-sm italic opacity-50 mb-4" style={{ fontFamily: "serif" }}>
            {verseOfDay.transliteration.split("\n")[0]}
          </p>

          <div className="rounded-xl p-4" style={{ background: P.tint }}>
            <p className="text-sm leading-relaxed" style={{ color: P.text }}>
              {isTamil && verseOfDay.meaningTA ? verseOfDay.meaningTA : verseOfDay.meaningEN}
            </p>
          </div>

          {(isTamil ? verseOfDay.reflectionTA || verseOfDay.reflection : verseOfDay.reflection) && (
            <p className="text-sm italic mt-3 text-center opacity-65" style={{ color: P.gold }}>
              🌿 {isTamil && verseOfDay.reflectionTA ? verseOfDay.reflectionTA : verseOfDay.reflection}
            </p>
          )}
        </div>}

        {/* ── Explore & Learn ───────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 18 }}>🎓</span>
              <h2 className="font-bold text-base" style={{ color: P.text }}>
                {t("Explore & Learn", "கற்க & ஆராய்க", "सीखें और खोजें")}
              </h2>
            </div>
            <button
              onClick={() => navigate("/read")}
              className="flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-1.5 transition-all active:scale-95"
              style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
            >
              <span>📚</span>
              <span>{t("Read All", "படி", "पढ़ें")}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">

            {/* ── Bhagavad Gita — active track ─────────────────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#EEF2FF", border: `1.5px solid ${P.cardBorder}` }}
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => navigate("/session")}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "white", fontSize: 28 }}>📖</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base" style={{ color: P.text }}>
                      {t("Bhagavad Gita", "பகவத் கீதை", "भगवद्गीता")}
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "#DCFCE7", color: "#15803D" }}>
                      {t("Active", "செயலில்", "सक्रिय")}
                    </span>
                  </div>
                  <p className="text-sm opacity-55 mt-0.5">
                    {t("700 verses · 18 chapters", "700 ஸ்லோகங்கள் · 18 அத்தியாயங்கள்", "700 श्लोक · 18 अध्याय")}
                  </p>
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: P.cardBorder }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.max(1, progressPct)}%`, background: P.primary }} />
                    </div>
                    <p className="text-xs opacity-40 mt-1">
                      {masteredCount} / {TOTAL_VERSES} {t("verses", "ஸ்லோகங்கள்", "श्लोक")}
                    </p>
                  </div>
                </div>
                <span className="text-2xl shrink-0" style={{ color: P.primary }}>›</span>
              </div>
            </div>

            {/* ── Deity Collections ─────────────────────────────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#FDF4FF", border: "1.5px solid #E9D5FF" }}
            >
              {/* Header — always visible */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === "deity" ? null : "deity")}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "white", fontSize: 28 }}>🪔</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: P.text }}>
                    {t("Deity Collections", "தெய்வ தொகுப்புகள்", "देवता संग्रह")}
                  </p>
                  <p className="text-sm opacity-55 mt-0.5">
                    {t(
                      `${DEITY_COLLECTIONS.length} deities · ${DEITY_COLLECTIONS.reduce((s, d) => s + d.shlokas.length, 0)} shlokas`,
                      `${DEITY_COLLECTIONS.length} தெய்வங்கள் · ${DEITY_COLLECTIONS.reduce((s, d) => s + d.shlokas.length, 0)} ஸ்லோகங்கள்`,
                      `${DEITY_COLLECTIONS.length} देवता · ${DEITY_COLLECTIONS.reduce((s, d) => s + d.shlokas.length, 0)} श्लोक`,
                    )}
                  </p>
                </div>
                <span className="text-xl transition-transform shrink-0" style={{
                  color: "#7C3AED",
                  transform: expandedSection === "deity" ? "rotate(90deg)" : "rotate(0deg)",
                }}>›</span>
              </div>

              {/* Expanded content */}
              {expandedSection === "deity" && (
                <div style={{ borderTop: "1px solid #E9D5FF" }}>
                  {/* Deity selector tabs */}
                  <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {DEITY_COLLECTIONS.map((dc) => (
                      <button
                        key={dc.id}
                        onClick={() => setExpandedDeity(expandedDeity === dc.id ? null : dc.id)}
                        className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-all active:scale-95"
                        style={{
                          background: expandedDeity === dc.id ? "#7C3AED" : "white",
                          color: expandedDeity === dc.id ? "white" : "#7C3AED",
                          border: "1.5px solid #E9D5FF",
                        }}
                      >
                        {dc.icon} {isTamil ? dc.deityTA : isHindi ? dc.deityHI : dc.deity}
                      </button>
                    ))}
                  </div>

                  {/* Shlokas for selected deity */}
                  {expandedDeity && (() => {
                    const dc = DEITY_COLLECTIONS.find((d) => d.id === expandedDeity);
                    if (!dc) return null;
                    return (
                      <div className="flex flex-col gap-3 px-4 pb-4">
                        {dc.shlokas.map((sh) => (
                          <div
                            key={sh.id}
                            className="rounded-xl p-4"
                            style={{ background: "white", border: "1px solid #E9D5FF" }}
                          >
                            <p className="font-bold text-sm mb-2" style={{ color: "#7C3AED" }}>
                              {isTamil && sh.nameTA ? sh.nameTA : isHindi && sh.nameHI ? sh.nameHI : sh.name}
                            </p>
                            <p
                              className="text-center leading-relaxed mb-2"
                              style={{
                                fontFamily: "'Noto Serif Devanagari', serif",
                                fontSize: 17,
                                color: P.text,
                                lineHeight: 1.9,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {sh.sanskrit}
                            </p>
                            <p className="text-xs italic opacity-50 mb-3 text-center" style={{ whiteSpace: "pre-line" }}>
                              {sh.transliteration}
                            </p>
                            <div className="rounded-lg p-3" style={{ background: "#FDF4FF" }}>
                              <p className="text-sm leading-relaxed" style={{ color: P.text }}>
                                {isTamil && sh.meaningTA ? sh.meaningTA : isHindi && sh.meaningHI ? sh.meaningHI : sh.meaningEN}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* ── Bhajans ───────────────────────────────────────────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === "bhajans" ? null : "bhajans")}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "white", fontSize: 28 }}>🎵</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: P.text }}>
                    {t("Bhajans", "பஜன்கள்", "भजन")}
                  </p>
                  <p className="text-sm opacity-55 mt-0.5">
                    {t(
                      `${BHAJANS.length} bhajans · Sanskrit · Hindi · Marathi`,
                      `${BHAJANS.length} பஜன்கள் · Tamil உட்பட`,
                      `${BHAJANS.length} भजन · संस्कृत · हिंदी · मराठी`,
                    )}
                  </p>
                </div>
                <span className="text-xl transition-transform shrink-0" style={{
                  color: "#15803D",
                  transform: expandedSection === "bhajans" ? "rotate(90deg)" : "rotate(0deg)",
                }}>›</span>
              </div>

              {/* Expanded bhajans */}
              {expandedSection === "bhajans" && (
                <div style={{ borderTop: "1px solid #BBF7D0" }}>
                  <div className="flex flex-col gap-3 p-4">
                    {BHAJANS.map((bh) => (
                      <div key={bh.id} className="rounded-xl overflow-hidden"
                        style={{ background: "white", border: "1px solid #BBF7D0" }}>
                        {/* Bhajan header */}
                        <div className="px-4 pt-4 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm" style={{ color: "#15803D" }}>
                                {isTamil ? bh.nameTA : isHindi ? bh.nameHI : bh.name}
                              </p>
                              <p className="text-xs opacity-50 mt-0.5">
                                {isTamil ? bh.deityTA : bh.deity} · {bh.language}
                              </p>
                            </div>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                              style={{ background: "#DCFCE7", color: "#15803D" }}
                            >
                              {isTamil ? bh.tagTA : bh.tagEN}
                            </span>
                          </div>
                        </div>
                        {/* Verses */}
                        {bh.verses.map((v, vi) => (
                          <div key={vi} className="px-4 pb-4">
                            {vi > 0 && <div className="mb-3" style={{ height: 1, background: "#BBF7D0" }} />}
                            <p
                              className="text-center leading-relaxed mb-2"
                              style={{
                                fontFamily: "'Noto Serif Devanagari', serif",
                                fontSize: 17,
                                color: P.text,
                                lineHeight: 2,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {v.lines}
                            </p>
                            {v.transliteration && (
                              <p className="text-xs italic opacity-45 mb-3 text-center" style={{ whiteSpace: "pre-line" }}>
                                {v.transliteration}
                              </p>
                            )}
                            <div className="rounded-lg p-3" style={{ background: "#F0FDF4" }}>
                              <p className="text-sm leading-relaxed" style={{ color: P.text }}>
                                {isTamil && v.meaningTA ? v.meaningTA : isHindi && v.meaningHI ? v.meaningHI : v.meaningEN}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Vishnu Sahasranamam — coming soon ────────────────────────── */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", opacity: 0.72 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "white", fontSize: 28 }}>🙏</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base" style={{ color: P.text }}>
                      {t("Vishnu Sahasranamam", "விஷ்ணு சஹஸ்ரநாமம்", "विष्णु सहस्रनाम")}
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: P.gold, color: "white" }}>
                      {t("Coming Soon", "விரைவில்", "जल्द आ रहा है")}
                    </span>
                  </div>
                  <p className="text-sm opacity-55 mt-0.5">
                    {t("1000 names of Vishnu · Full audio", "விஷ்ணுவின் 1000 நாமங்கள்", "विष्णु के 1000 नाम · पूर्ण ऑडियो")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs opacity-30 pb-2">
          {t(
            "AI teacher speaks in English · Sanskrit shlokas chanted authentically",
            "AI ஆசிரியர் தமிழில் பேசுவார் · Sanskrit ஸ்லோகம் உச்சரிக்கப்படும்",
            "AI शिक्षक हिन्दी में बोलेंगे · संस्कृत श्लोक का पाठ होगा",
          )}
        </p>
      </div>

      {/* ── Chapter Picker Modal ─────────────────────────────────────────────── */}
      {showChapterPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowChapterPicker(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-t-3xl flex flex-col"
            style={{ background: P.bg, maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle + Header */}
            <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${P.cardBorder}` }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: P.cardBorder }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-base" style={{ color: P.text }}>
                    {t("Choose Chapter", "அத்தியாயம் தேர்வு", "अध्याय चुनें")}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5">
                    {t("Your next session will start from this chapter", "இந்த அத்தியாயத்திலிருந்து தொடங்கும்", "इस अध्याय से सत्र शुरू होगा")}
                  </p>
                </div>
                <button
                  onClick={() => setShowChapterPicker(false)}
                  className="text-xl opacity-30 hover:opacity-60 transition-opacity"
                >✕</button>
              </div>
            </div>

            {/* Chapter list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2 pb-8">
              {chapters.map((ch) => {
                const isActive = progress.currentChapter === ch.number;
                return (
                  <button
                    key={ch.number}
                    onClick={() => jumpToChapter(ch.number)}
                    className="w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                    style={{
                      background: isActive ? P.primary : "white",
                      border: `1.5px solid ${isActive ? P.primary : P.cardBorder}`,
                    }}
                  >
                    <span
                      className="text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0"
                      style={{
                        background: isActive ? "rgba(255,255,255,0.2)" : P.tint,
                        color: isActive ? "white" : P.primary,
                      }}
                    >
                      {ch.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: isActive ? "white" : P.text }}>
                        {ch.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: isActive ? "rgba(255,255,255,0.65)" : undefined, opacity: isActive ? 1 : 0.45 }}>
                        {ch.verseCount} {t("verses", "ஸ்லோகங்கள்", "श्लोक")}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                        {t("Current", "தற்போது", "वर्तमान")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
