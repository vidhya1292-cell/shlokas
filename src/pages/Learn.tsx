/**
 * Learn tab — scripture selector, today's class, verse of the day.
 */
import { useLocation } from "wouter";
import { loadProgress, saveProgress, getMasteredCount, getDueVerses, getScriptureProgress } from "../services/storage";
import { TOTAL_VERSES, chapters, verses as allVerses } from "../data/bgData";
import { getBGVerseOfDay } from "../services/versesService";
import { SCRIPTURES, LEARN_SCRIPTURES } from "../data/scriptureRegistry";
import { useMemo, useState, useEffect } from "react";
import { UserProgress } from "../types";

const P = {
  bg:         "#FDF8F0",
  card:       "#FFFFFF",
  cardBorder: "#E8DCC8",
  primary:    "#1E3A8A",
  gold:       "#C4973A",
  tint:       "#FEF3DC",
  text:       "#1E2D5A",
  textMid:    "#4B6CB7",
};

function getOrderedVerses(progress: UserProgress) {
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
    if (!learnedSet.has(`${v.chapter}:${v.verse}`)) return { chapter: v.chapter, verse: v.verse };
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
    if (!learnedSet.has(`${v.chapter}:${v.verse}`) && !revisionSet.has(`${v.chapter}:${v.verse}`)) newCount++;
  }
  return Math.min(5, revisionCount + newCount);
}

export default function Home() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [verseOfDay, setVerseOfDay] = useState(() => allVerses.find((v) => !v.isPlaceholder) ?? allVerses[0]);
  const [showChapterPicker, setShowChapterPicker] = useState(false);

  useEffect(() => {
    getBGVerseOfDay().then((v) => { if (v) setVerseOfDay(v); }).catch(() => {});
  }, []);

  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  const masteredCount = getMasteredCount(progress);
  const nextVerse = useMemo(() => getNextPracticeVerse(progress), [progress]);
  const sessionVerseCount = useMemo(() => getSessionVerseCount(progress), [progress]);
  const currentChapter = chapters.find((c) => c.number === nextVerse.chapter);
  const progressPct = Math.round((masteredCount / TOTAL_VERSES) * 100);
  const isNewLearner = Object.keys(progress.verseProgress).length === 0;
  const activeScripture = progress.currentScripture ?? "bg";

  const jumpToChapter = (n: number) => {
    const updated = { ...progress, currentChapter: n, currentVerse: 1 };
    saveProgress(updated);
    setProgress(updated);
    setShowChapterPicker(false);
  };

  const resetProgress = () => {
    const fresh: UserProgress = {
      currentChapter: 1, currentVerse: 1, streakCount: 0,
      lastPracticeDate: "", verseProgress: {}, language: progress.language, voice: progress.voice,
    };
    saveProgress(fresh);
    setProgress(fresh);
  };

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: "linear-gradient(to bottom, transparent 0px, transparent 60px, #FDF8F0 260px)", color: P.text }}
    >
      {/* ── App bar ── */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ background: "rgba(253,248,240,0.95)", borderBottom: `1px solid ${P.cardBorder}`, backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 26, lineHeight: 1 }}>🪷</span>
          <div>
            <div className="text-base font-bold" style={{ color: P.primary }}>
              {t("Shlokas", "ஸ்லோகாஸ்", "श्लोकाः")}
            </div>
            <div className="text-xs opacity-50">
              {t("Begin your sadhana", "உங்கள் ஸாதனை தொடங்குங்கள்", "अपनी साधना शुरू करें")}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/account")}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: P.tint, border: `1.5px solid ${P.cardBorder}`, fontSize: 18 }}
          aria-label="My account"
        >
          👤
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 pb-24">

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
                `${progress.streakCount} दिन की स्ट्रीक 🔥 · जारी रखें!`,
              )}
            </p>
          )}
        </div>

        {/* ── Scripture selector (Learn scriptures only) ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold" style={{ color: P.primary }}>
            {t("Choose your path", "உங்கள் பாதை தேர்வு செய்க", "अपना मार्ग चुनें")}
          </h2>

          {LEARN_SCRIPTURES.map((sId) => {
            const s = SCRIPTURES[sId];
            const sp = getScriptureProgress(progress, sId);
            const mastered = Object.values(sp.verseProgress).filter((v) => v.confidence === "mastered").length;
            const isActive = activeScripture === sId;
            return (
              <button
                key={sId}
                onClick={() => {
                  saveProgress({ ...progress, currentScripture: sId });
                  navigate("/session");
                }}
                className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
                style={{
                  background: "white",
                  border: isActive ? `2px solid ${P.primary}` : `1.5px solid ${P.cardBorder}`,
                  boxShadow: isActive ? "0 4px 20px rgba(30,58,138,0.12)" : "none",
                }}
              >
                <div className="px-5 py-4 flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
                    style={{ background: P.tint }}
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base" style={{ color: P.primary }}>
                      {isTamil ? s.titleTA : isHindi ? s.titleHI : s.titleEN}
                    </p>
                    <p className="text-sm opacity-55 mt-0.5">
                      {isTamil ? s.subtitleTA : isHindi ? s.subtitleHI : s.subtitleEN}
                    </p>
                    {mastered > 0 ? (
                      <p className="text-xs mt-1.5" style={{ color: P.gold }}>
                        {mastered} {t("mastered", "மனப்பாடம்", "याद किया")} ✓
                      </p>
                    ) : (
                      <p className="text-xs font-semibold mt-2" style={{ color: P.primary }}>
                        {t("Start Learning →", "கற்கத் தொடங்கு →", "सीखना शुरू करें →")}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: P.tint, color: P.primary }}
                    >
                      {t("Active", "தொடர்கிறது", "जारी")}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Today's Class (BG — SRS is BG-specific for now) ── */}
        {!isNewLearner && activeScripture === "bg" && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
          >
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
                    <p className="text-sm opacity-55">{currentChapter?.name}</p>
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

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs opacity-50">{t("Your progress", "உங்கள் முன்னேற்றம்", "आपकी प्रगति")}</span>
                  <span className="text-xs font-semibold" style={{ color: P.primary }}>
                    {masteredCount}/{TOTAL_VERSES} · {progressPct}%
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

            <div className="px-4 pb-4">
              <button
                onClick={() => navigate("/session")}
                className="w-full rounded-xl text-white font-bold text-lg transition-all active:scale-[0.98]"
                style={{ background: P.primary, height: 56, boxShadow: "0 4px 20px rgba(30,58,138,0.35)" }}
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
          </div>
        )}

        {/* ── Verse of the Day ── */}
        {!isNewLearner && (
          <div className="rounded-2xl p-5" style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}>
            <div className="flex items-center gap-2 mb-4">
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

            <p
              className="text-center leading-relaxed mb-3"
              style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: 20, color: P.text, lineHeight: 1.8 }}
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

            {verseOfDay.reflection && (
              <p className="text-sm italic mt-3 text-center opacity-65" style={{ color: P.gold }}>
                🌿 {isTamil && verseOfDay.reflectionTA ? verseOfDay.reflectionTA : verseOfDay.reflection}
              </p>
            )}
          </div>
        )}

      </div>

      {/* ── Chapter Picker Modal (BG) ── */}
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
            <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${P.cardBorder}` }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: P.cardBorder }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-base" style={{ color: P.text }}>
                    {t("Choose Chapter", "அத்தியாயம் தேர்வு", "अध्याय चुनें")}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5">
                    {t("Next session starts here", "இங்கிருந்து தொடங்கும்", "यहाँ से शुरू होगा")}
                  </p>
                </div>
                <button
                  onClick={() => setShowChapterPicker(false)}
                  className="text-xl opacity-30 hover:opacity-60 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>

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
                      style={{ background: isActive ? "rgba(255,255,255,0.2)" : P.tint, color: isActive ? "white" : P.primary }}
                    >
                      {ch.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: isActive ? "white" : P.text }}>
                        {ch.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: isActive ? "rgba(255,255,255,0.65)" : undefined, opacity: isActive ? 1 : 0.45 }}
                      >
                        {ch.verseCount} {t("verses", "ஸ்லோகங்கள்", "श्लोक")}
                      </p>
                    </div>
                    {isActive && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                      >
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
