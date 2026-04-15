import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  loadProgress,
  saveProgress,
  getDueVerses,
  updateStreak,
} from "../services/storage";
import { verses as allVerses, getVerse } from "../data/bgData";
import { SessionVerse, SessionStats, UserProgress } from "../types";
import { useSessionEngine } from "../hooks/useSessionEngine";
import { transliterateToRoman, transliterateToTamil, unlockAudioContext, getWordFeedback, stopCurrentAudio } from "../services/sarvamService";
import { unlockChantingAudio, stopChantingAudio, playVerseSegment, stopSegmentAudio } from "../services/chantingService";
import { AudioVisualizer } from "../components/AudioVisualizer";
import { motion, AnimatePresence } from "framer-motion";

function buildSessionVerses(progress: UserProgress): SessionVerse[] {
  const dueKeys = getDueVerses(progress);

  // Up to 3 revision verses
  const revisionVerses: SessionVerse[] = dueKeys
    .slice(0, 3)
    .map(({ chapter, verse }) => {
      const v = getVerse(chapter, verse);
      return v ? { ...v, isNew: false, retryCount: 0 } : null;
    })
    .filter(Boolean) as SessionVerse[];

  const revisionSet = new Set(revisionVerses.map((v) => `${v.chapter}:${v.verse}`));
  const learnedSet = new Set(Object.keys(progress.verseProgress));

  // Start scanning for new verses from user's chosen chapter:verse, wrap around
  const startIdx = allVerses.findIndex(
    (v) => !v.isPlaceholder && v.chapter === progress.currentChapter && v.verse >= progress.currentVerse
  );
  const from = startIdx >= 0 ? startIdx : 0;
  const orderedVerses = [...allVerses.slice(from), ...allVerses.slice(0, from)];

  // Fill remaining slots with new verses so session always has up to 5 total
  const maxNew = Math.max(2, 5 - revisionVerses.length);
  const newVerses: SessionVerse[] = [];
  for (const v of orderedVerses) {
    if (newVerses.length >= maxNew) break;
    if (v.isPlaceholder) continue;
    const key = `${v.chapter}:${v.verse}`;
    if (!learnedSet.has(key) && !revisionSet.has(key)) {
      newVerses.push({ ...v, isNew: true, retryCount: 0 });
    }
  }

  // Always 5 total: pad with revision or new if needed
  const session = [...revisionVerses, ...newVerses].slice(0, 5);
  if (session.length === 0) {
    // fallback: first verse
    const first = allVerses.find((v) => !v.isPlaceholder);
    if (first) session.push({ ...first, isNew: true, retryCount: 0 });
  }

  return session;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function getDayNumber(progress: UserProgress): number {
  return Math.max(1, progress.streakCount + 1);
}

export default function LiveSession() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [sessionVerses] = useState<SessionVerse[]>(() => buildSessionVerses(progress));
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const startedRef = useRef(false);

  const handleProgressUpdate = (p: UserProgress) => {
    setProgress(p);
    saveProgress(p);
  };

  const handleComplete = (s: SessionStats) => {
    const updated = updateStreak(progress);
    setProgress(updated);
    // Update currentVerse forward
    const lastVerse = sessionVerses[sessionVerses.length - 1];
    const updatedWithVerse = {
      ...updated,
      currentChapter: lastVerse.chapter,
      currentVerse: lastVerse.verse + 1 > 47 ? lastVerse.verse : lastVerse.verse + 1,
    };
    saveProgress(updatedWithVerse);
    setStats({ ...s, streak: updated.streakCount });
  };

  const engine = useSessionEngine(
    sessionVerses,
    progress,
    progress.language,
    getDayNumber(progress),
    handleProgressUpdate,
    handleComplete
  );

  // Stop all audio, kill the async session chain, then navigate home.
  // engine.pause() sets pausedRef = true so every pending advance() chain bails immediately.
  const handleExit = () => {
    engine.pause();          // sets pausedRef — stops the async advance() loop
    stopCurrentAudio();      // stops any in-flight TTS
    stopChantingAudio();     // stops any in-flight chanting MP3 (also stops segment)
    navigate("/");
  };

  // Called synchronously from a user tap — so unlock calls are inside the gesture context
  const handleTapToBegin = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    // Unlock Web Audio API and HTML Audio for iOS Safari / Android Chrome
    unlockAudioContext();
    unlockChantingAudio();
    engine.startSession();
  };

  const currentVerse = sessionVerses[engine.verseIndex] || sessionVerses[0];

  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";

  // Helper: Tamil → Tamil string, Hindi → Hindi string, else English
  const t = (en: string, ta: string, hi: string) =>
    isTamil ? ta : isHindi ? hi : en;

  const phaseLabel = () => {
    if (isTamil) {
      switch (engine.state) {
        case "LOADING":            return "தயாராகுது...";
        case "NARRATE_OPENING":    return "வரவேற்கிறோம்";
        case "NARRATE_INTRO":      return "அறிமுகம்";
        case "PLAY_SHLOKA":        return "கேளுங்க 🎵 (1/3)";
        case "PLAY_SHLOKA_2":      return "மீண்டும் கேளுங்க 🎵 (2/3)";
        case "NARRATE_YOUR_TURN":  return "சேர்ந்து சொல்லுங்க...";
        case "PLAY_SHLOKA_SLOW":   return "மெதுவாக கேளுங்க 🎵 (3/3)";
        case "RECORD_RECITE":      return "நீங்க சொல்லுங்க 🎤";
        case "PLAY_SHLOKA_REPEAT": return "மீண்டும் 🎵";
        case "SHOW_MEANING":       return "அர்த்தம் 📖";
        case "RATE_VERSE":         return "எப்படி இருந்தது?";
        case "NARRATE_TRANSITION": return "அடுத்தது";
        case "NARRATE_CLOSING":    return "முடிவடைகிறது";
        case "SESSION_COMPLETE":   return "முடிந்தது!";
        case "PAUSED":             return "நிறுத்தப்பட்டது";
        default: return "";
      }
    }
    switch (engine.state) {
      case "LOADING":            return "Preparing...";
      case "NARRATE_OPENING":    return "Welcome";
      case "NARRATE_INTRO":      return "Introducing";
      case "PLAY_SHLOKA":        return "Listen 🎵 (1 of 3)";
      case "PLAY_SHLOKA_2":      return "Listen Again 🎵 (2 of 3)";
      case "NARRATE_YOUR_TURN":  return "Recite Along...";
      case "PLAY_SHLOKA_SLOW":   return "Slow Listen 🎵 (3 of 3)";
      case "RECORD_RECITE":      return "Your Turn 🎤";
      case "PLAY_SHLOKA_REPEAT": return "Again 🎵";
      case "SHOW_MEANING":       return "Meaning 📖";
      case "RATE_VERSE":         return "How was it?";
      case "NARRATE_TRANSITION": return "Moving on";
      case "NARRATE_CLOSING":    return "Wrapping up";
      case "SESSION_COMPLETE":   return "Complete!";
      case "PAUSED":             return "Paused";
      default: return "";
    }
  };

  const isShlokaPlaying = [
    "PLAY_SHLOKA", "PLAY_SHLOKA_2", "PLAY_SHLOKA_SLOW", "PLAY_SHLOKA_REPEAT",
  ].includes(engine.state);

  const isAudioPlaying = isShlokaPlaying || [
    "NARRATE_OPENING", "NARRATE_INTRO", "NARRATE_YOUR_TURN",
    "NARRATE_TRANSITION", "NARRATE_CLOSING", "SHOW_MEANING",
  ].includes(engine.state);

  if (engine.state === "SESSION_COMPLETE" && stats) {
    return (
      <div
        className="min-h-screen w-full max-w-[480px] mx-auto px-6 flex flex-col items-center justify-center"
        style={{ background: "#F5F7FF", color: "#1E2D5A" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: "#1E3A8A" }}
        >
          <span className="text-5xl">✓</span>
        </motion.div>

        <h1 className="text-3xl font-bold text-center mb-2">Today's Class Complete 🙏</h1>

        <div
          className="w-full rounded-2xl p-6 my-6"
          style={{ background: "white", border: "1.5px solid #DBEAFE" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Time" value={formatTime(stats.elapsedSeconds)} />
            <Stat label="Revised" value={`${stats.revised}`} />
            <Stat label="New Verses" value={`${stats.newLearned}`} />
            <Stat label="Streak" value={`${stats.streak} days 🔥`} />
          </div>
        </div>

        <button
          onClick={() => {
            const text = `I just completed my Bhagavad Gita session on Shlokas.in! Practiced ${sessionVerses.length} verses today. Streak: ${stats.streak} days 🔥 Om Shanti 🙏`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, "_blank");
          }}
          className="w-full rounded-xl text-white font-bold text-lg mb-4 flex items-center justify-center gap-2"
          style={{ background: "#25D366", height: 56 }}
        >
          📱 Share on WhatsApp
        </button>

        <button
          onClick={handleExit}
          className="w-full rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          style={{
            background: "white",
            border: "2px solid #1E3A8A",
            color: "#1E3A8A",
            height: 56,
          }}
        >
          🏠 Go Home
        </button>
      </div>
    );
  }

  // ── Tap-to-Begin screen (shown before session starts) ────────────────────────
  // Keeps us inside a user gesture so audio unlock is guaranteed on mobile.
  if (engine.state === "LOADING") {
    const newCount = sessionVerses.filter((v) => v.isNew).length;
    const revCount = sessionVerses.filter((v) => !v.isNew).length;
    return (
      <div
        className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col items-center justify-center px-6"
        style={{ background: "#F5F7FF", color: "#1E2D5A" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center w-full"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: "#EEF2FF", border: "2px solid #C4973A" }}
          >
            <span style={{ fontSize: 48 }}>🙏</span>
          </div>
          <h1 className="text-2xl font-bold mb-1 text-center" style={{ color: "#1E2D5A" }}>
            {t("Today's Class", "இன்றைய வகுப்பு", "आज की कक्षा")}
          </h1>
          <p className="text-sm opacity-50 mb-8 text-center">
            {isTamil
              ? `${sessionVerses.length} verses · ${revCount > 0 ? `${revCount} revision · ` : ""}${newCount} புது`
              : isHindi
              ? `${sessionVerses.length} श्लोक · ${revCount > 0 ? `${revCount} पुनरावृत्ति · ` : ""}${newCount} नए`
              : `${sessionVerses.length} verses · ${revCount > 0 ? `${revCount} revision · ` : ""}${newCount} new`
            }
          </p>

          <button
            onClick={handleTapToBegin}
            className="w-full rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            style={{
              height: 64,
              background: "#1E3A8A",
              boxShadow: "0 6px 24px rgba(30,58,138,0.35)",
            }}
          >
            ▶ {t("Begin Class", "தொடங்கு", "शुरू करें")}
          </button>

          <button
            onClick={handleExit}
            className="mt-4 text-sm opacity-40 hover:opacity-70 py-2"
          >
            {t("← Back", "← திரும்பு", "← वापस")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: "#F5F7FF", color: "#1E2D5A" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {/* Previous verse button — hidden on first verse */}
          {engine.verseIndex > 0 && (
            <button
              onClick={engine.goToPreviousVerse}
              className="text-sm font-semibold px-3 py-1 rounded-full transition-all active:scale-95"
              style={{ background: "#DBEAFE", color: "#1E3A8A" }}
              aria-label="Previous verse"
            >
              ← {isTamil ? "முந்தைய" : "Prev"}
            </button>
          )}
          <span className="text-sm opacity-50">
            {isTamil
              ? `ஸ்லோகம் ${engine.verseIndex + 1} / ${sessionVerses.length}`
              : `Verse ${engine.verseIndex + 1} of ${sessionVerses.length}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-50 font-mono">{formatTime(engine.elapsedSeconds)}</span>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-sm opacity-40 hover:opacity-80"
            style={{ fontSize: 20 }}
            aria-label="End session"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-4 rounded-full overflow-hidden" style={{ height: 4, background: "#DBEAFE" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#1E3A8A" }}
          animate={{ width: `${((engine.verseIndex + 1) / sessionVerses.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main content — scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-4"
        style={{ paddingBottom: engine.state === "RATE_VERSE" ? 220 : 80 }}
      >
        {/* Phase indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={engine.state}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{
                background: engine.state === "LISTENING" ? "#FEE2E2" : "#EEF2FF",
                color: engine.state === "LISTENING" ? "#ef4444" : "#1E3A8A",
              }}
            >
              {phaseLabel()}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Verse tag */}
        {currentVerse && (
          <div className="mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: currentVerse.isNew ? "#E6F4EA" : "#EEF2FF",
                color: currentVerse.isNew ? "#2d7a3d" : "#1E3A8A",
              }}
            >
              {currentVerse.isNew
                ? (isTamil ? "புது verse" : "New Verse")
                : (isTamil ? "மறுபயிற்சி" : "Revision")
              } · Ch.{currentVerse.chapter}:{currentVerse.verse}
            </span>
          </div>
        )}

        {/* Sanskrit text + Roman transliteration */}
        {currentVerse && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentVerse.chapter}-${currentVerse.verse}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center mb-4"
            >
              <div
                className="relative rounded-2xl p-6"
                style={{
                  background: "white",
                  border: isShlokaPlaying ? "2px solid #1E3A8A" : "1.5px solid #DBEAFE",
                }}
              >
                {isShlokaPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{ opacity: [0.12, 0.04, 0.12] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ background: "#1E3A8A" }}
                  />
                )}
                {/* Devanagari — 26px */}
                <p
                  className="leading-relaxed whitespace-pre-line"
                  style={{
                    fontFamily: "'Noto Serif Devanagari', 'Noto Sans Devanagari', sans-serif",
                    fontSize: 26,
                    color: "#1E2D5A",
                    lineHeight: 1.9,
                  }}
                >
                  {currentVerse.sanskrit}
                </p>
                {/* Transliteration — Tamil script in Tamil mode, Roman IAST in English mode */}
                <p
                  className="mt-3 whitespace-pre-line font-medium"
                  style={{
                    fontFamily: isTamil
                      ? "'Noto Sans Tamil', sans-serif"
                      : "'Noto Sans', system-ui, sans-serif",
                    fontSize: 16,
                    color: "#4B6CB7",
                    lineHeight: 1.8,
                  }}
                >
                  {isTamil
                    ? transliterateToTamil(currentVerse.sanskrit)
                    : transliterateToRoman(currentVerse.sanskrit)
                  }
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Shloka play button (user-triggered — guarantees iOS audio works) ─── */}
        <AnimatePresence>
          {isShlokaPlaying && (
            <motion.div
              key={engine.state}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full flex flex-col items-center gap-3 my-2"
            >
              <button
                onClick={engine.playShlokaStep}
                className="w-full rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                style={{
                  height: 64,
                  background: "#1E3A8A",
                  boxShadow: "0 4px 20px rgba(30,58,138,0.40)",
                }}
              >
                <span style={{ fontSize: 24 }}>▶</span>
                {engine.state === "PLAY_SHLOKA_SLOW"
                  ? (isTamil ? "மெதுவாக கேளுங்க (சேர்ந்து சொல்லுங்க)" : "Play slow — recite along")
                  : (isTamil ? "ஸ்லோகம் கேளுங்க" : "Hear shloka")}
              </button>
              <p className="text-xs opacity-40">
                {engine.state === "PLAY_SHLOKA"
                  ? (isTamil ? "கேட்டப் பிறகு மீண்டும் கேட்பீர்கள்" : "You'll hear it again after this")
                  : engine.state === "PLAY_SHLOKA_2"
                  ? (isTamil ? "மூன்றாவது முறை மெதுவாக கேட்பீர்கள்" : "Third listen will be slower")
                  : ""}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Misc badges */}
        <div className="flex flex-col items-center gap-2 mb-2">
          {engine.state === "NARRATE_YOUR_TURN" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "#E6F4EA", color: "#065f46", border: "1px solid #6ee7b7" }}
            >
              🗣️ {isTamil ? "இப்போ சேர்ந்து சொல்லுங்க!" : "Now recite along!"}
            </motion.div>
          )}
          {isAudioPlaying && !isShlokaPlaying && <AudioVisualizer isActive={true} />}
        </div>

        {/* ── Record-yourself card ────────────────────────────────── */}
        <AnimatePresence>
          {engine.state === "RECORD_RECITE" && currentVerse && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mb-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎤</span>
                <span className="font-bold text-base" style={{ color: "#1E2D5A" }}>
                  {isTamil ? "நீங்களும் சொல்லிப் பாருங்க" : "Recite it yourself"}
                </span>
              </div>

              {/* Verse reference */}
              <div className="rounded-2xl p-4 mb-3" style={{ background: "white", border: "1.5px solid #DBEAFE" }}>
                <p
                  className="text-center leading-relaxed"
                  style={{ fontFamily: "'Noto Serif Devanagari', 'Noto Sans Devanagari', sans-serif", fontSize: 18, color: "#1E2D5A", lineHeight: 1.9 }}
                >
                  {currentVerse.sanskrit}
                </p>
                <p
                  className="text-center font-medium mt-2 whitespace-pre-line"
                  style={{
                    fontFamily: isTamil ? "'Noto Sans Tamil', sans-serif" : "'Noto Sans', system-ui, sans-serif",
                    fontSize: 15,
                    color: "#4B6CB7",
                    lineHeight: 1.7,
                  }}
                >
                  {isTamil
                    ? transliterateToTamil(currentVerse.sanskrit)
                    : transliterateToRoman(currentVerse.sanskrit)
                  }
                </p>
              </div>

              {/* Mic denied warning */}
              {engine.micDenied && (
                <p className="text-sm text-center mb-3 opacity-70" style={{ color: "#1E3A8A" }}>
                  {isTamil ? "⚠️ Mic அனுமதி தேவை" : "⚠️ Microphone access is needed to record"}
                </p>
              )}

              {/* Record / Stop button */}
              {!engine.sttResult && !engine.sttLoading && (
                <div className="flex justify-center mb-3">
                  {!engine.isRecording ? (
                    <button
                      onClick={engine.startRecording}
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-base transition-all active:scale-95"
                      style={{ background: "#1E3A8A" }}
                    >
                      🎙️ {isTamil ? "பதிவு தொடங்கு" : "Start Recording"}
                    </button>
                  ) : (
                    <button
                      onClick={engine.stopRecording}
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-base transition-all active:scale-95"
                      style={{ background: "#B91C1C" }}
                    >
                      <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse" />
                      {isTamil ? "நிறுத்து & சரிபார்" : "Stop & Check"}
                    </button>
                  )}
                </div>
              )}

              {/* Transcribing loader */}
              {engine.sttLoading && (
                <p className="text-center text-sm opacity-60 mb-3">
                  {isTamil ? "சரிபார்க்கிறோம்..." : "Checking your recitation..."}
                </p>
              )}

              {/* Result — word-by-word diff */}
              {engine.sttResult && !engine.sttLoading && (
                <div className="rounded-2xl p-4 mb-3" style={{ background: "white", border: "1.5px solid #DBEAFE" }}>

                  {/* Score header with motivating message */}
                  {engine.accuracy !== null && (() => {
                    const acc = engine.accuracy;
                    const isGood = acc >= 70;
                    const isOk  = acc >= 40;
                    const color = isGood ? "#16a34a" : isOk ? "#d97706" : "#1E3A8A";
                    const msg = isTamil
                      ? (isGood ? "அருமை! தொடர்ந்து பயிற்சி செய்யுங்கள் 🌟" : isOk ? "நல்லா இருந்தது! இன்னும் கொஞ்சம் 💪" : "பரவாயில்லை, மீண்டும் பயிற்சி செய்யுங்கள் 🙏")
                      : (isGood ? "Excellent! That's a pass 🌟" : isOk ? "Good effort — nearly there 💪" : "Keep going, every repetition builds memory 🙏");
                    return (
                      <div className="mb-3">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="h-2 flex-1 rounded-full" style={{ background: "#DBEAFE" }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${acc}%`, background: color }}
                            />
                          </div>
                          <span className="font-bold text-sm min-w-[44px] text-right" style={{ color }}>
                            {acc}%
                          </span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color }}>{msg}</p>
                      </div>
                    );
                  })()}

                  {/* 5-part phrase feedback — each part shows pass/fail, tap red to hear */}
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-2">
                    {isTamil ? "5 பகுதி பகுப்பாய்வு" : "5-part breakdown"}
                  </p>
                  {(() => {
                    const expectedText = isTamil
                      ? transliterateToTamil(currentVerse.sanskrit)
                      : transliterateToRoman(currentVerse.sanskrit);
                    const feedback = getWordFeedback(engine.sttResult, expectedText);
                    const n = feedback.length;
                    const partSize = Math.ceil(n / 5);
                    const parts = Array.from({ length: 5 }, (_, i) =>
                      feedback.slice(i * partSize, (i + 1) * partSize)
                    ).filter((p) => p.length > 0);
                    return (
                      <div className="flex flex-col gap-2 mb-3">
                        {parts.map((part, i) => {
                          const matched = part.filter((w) => w.matched).length;
                          const isGood = matched / part.length >= 0.5;
                          return (
                            <button
                              key={i}
                              onClick={!isGood ? () => {
                                stopCurrentAudio();
                                stopSegmentAudio();
                                playVerseSegment(currentVerse.chapter, currentVerse.verse, i, parts.length);
                              } : undefined}
                              className="w-full text-left px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                              style={{
                                background: isGood ? "#dcfce7" : "#fee2e2",
                                border: `1px solid ${isGood ? "#86efac" : "#fca5a5"}`,
                                cursor: isGood ? "default" : "pointer",
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className="text-sm font-medium leading-snug"
                                  style={{ color: isGood ? "#15803d" : "#b91c1c" }}
                                >
                                  {isGood ? "✓" : "🔊"} {part.map((w) => w.word).join(" ")}
                                </span>
                                <span
                                  className="text-xs font-bold shrink-0"
                                  style={{ color: isGood ? "#15803d" : "#b91c1c" }}
                                >
                                  {Math.round((matched / part.length) * 100)}%
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <p className="text-xs opacity-40 mb-2">
                    {isTamil ? "🔊 தவறான பகுதியை தட்டி கேளுங்கள்" : "Tap 🔊 a red part to hear it from the chanting"}
                  </p>

                  {/* What we heard (raw transcript) */}
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-1">
                    {isTamil ? "நாங்கள் கேட்டது" : "What we heard"}
                  </p>
                  <p className="text-xs leading-relaxed opacity-60" style={{ color: "#1E2D5A" }}>
                    {engine.sttResult}
                  </p>
                </div>
              )}

              {/* Action buttons — two choices once result is shown, single button before */}
              {engine.sttResult && !engine.sttLoading ? (
                <div className="flex gap-3">
                  <button
                    onClick={engine.retryRecording}
                    className="flex-1 py-3 rounded-full font-bold text-base transition-all active:scale-95"
                    style={{ background: "white", border: "2px solid #1E3A8A", color: "#1E3A8A" }}
                  >
                    🔁 {isTamil ? "மீண்டும் பயிற்சி" : "Try Again"}
                  </button>
                  <button
                    onClick={() => engine.skipStep()}
                    className="flex-1 py-3 rounded-full font-bold text-base transition-all active:scale-95"
                    style={{ background: "#1E3A8A", color: "white" }}
                  >
                    {isTamil ? "அர்த்தம் →" : "Meaning →"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => engine.skipStep()}
                  className="w-full py-3 rounded-full font-bold text-base transition-all active:scale-95"
                  style={{ background: "#1E3A8A", color: "white" }}
                >
                  {isTamil ? "அர்த்தம் கேளு →" : "Continue to Meaning →"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meaning section */}
        <AnimatePresence>
          {(engine.state === "SHOW_MEANING" || engine.state === "RATE_VERSE") && currentVerse && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-4"
            >
              {/* Section header with replay button */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  <span className="font-bold text-base" style={{ color: "#1E2D5A" }}>
                    {isTamil ? "அர்த்தம்" : "Meaning"}
                  </span>
                </div>
                <button
                  onClick={engine.replayMeaning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: "#EEF2FF",
                    color: "#1E3A8A",
                    border: "1.5px solid #C4973A",
                  }}
                >
                  🔊 {isTamil ? "மீண்டும் கேளு" : "Hear again"}
                </button>
              </div>

              {/* Word by word */}
              {currentVerse.wordByWord.length > 0 && (
                <div className="rounded-2xl p-4 mb-3" style={{ background: "white", border: "1.5px solid #DBEAFE" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-3">
                    {isTamil ? "வார்த்தை வார்த்தையாக" : "Word by word"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentVerse.wordByWord.map((w, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center px-3 py-2 rounded-xl"
                        style={{ background: "#F5F7FF", border: "1px solid #DBEAFE" }}
                      >
                        <span
                          style={{
                            fontFamily: "'Noto Sans Devanagari', sans-serif",
                            fontSize: 15,
                            color: "#1E2D5A",
                            fontWeight: 600,
                          }}
                        >
                          {w.word}
                        </span>
                        <span className="text-xs opacity-60 mt-0.5">{w.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full meaning */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "white", border: "1.5px solid #DBEAFE" }}
              >
                <p className="text-base leading-relaxed" style={{ color: "#1E2D5A", lineHeight: 1.7 }}>
                  {isTamil && currentVerse.meaningTA ? currentVerse.meaningTA : currentVerse.meaningEN}
                </p>
                {currentVerse.reflection && (
                  <div
                    className="mt-4 pt-4 rounded-xl p-3"
                    style={{ background: "#F5F7FF", borderTop: "1px solid #DBEAFE" }}
                  >
                    <p className="text-sm italic leading-relaxed" style={{ color: "#1E3A8A" }}>
                      🌿 {isTamil && currentVerse.reflectionTA ? currentVerse.reflectionTA : currentVerse.reflection}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rate verse — sticky footer */}
      <AnimatePresence>
        {engine.state === "RATE_VERSE" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="sticky bottom-0 w-full max-w-[480px] mx-auto px-4 pb-8 pt-4"
            style={{ background: "linear-gradient(to bottom, transparent, #F5F7FF 30%)" }}
          >
            <p className="text-center text-sm font-semibold opacity-60 mb-3">
              {isTamil ? "இந்த verse எப்படி இருந்தது?" : "How well did you know this verse?"}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => engine.rateVerse("need_more")}
                className="w-full rounded-xl font-semibold text-base transition-all active:scale-95"
                style={{
                  height: 52,
                  background: "#FEE2E2",
                  color: "#b91c1c",
                  border: "1.5px solid #fca5a5",
                }}
              >
                😟 {isTamil ? "இன்னும் பயிற்சி வேணும்" : "Need More Practice"}
              </button>
              <button
                onClick={() => engine.rateVerse("getting_there")}
                className="w-full rounded-xl font-semibold text-base transition-all active:scale-95"
                style={{
                  height: 52,
                  background: "#FEF3C7",
                  color: "#b45309",
                  border: "1.5px solid #fcd34d",
                }}
              >
                🙂 {isTamil ? "நல்லா வருது" : "Getting There"}
              </button>
              <button
                onClick={() => engine.rateVerse("got_it")}
                className="w-full rounded-xl font-semibold text-base transition-all active:scale-95"
                style={{
                  height: 52,
                  background: "#D1FAE5",
                  color: "#065f46",
                  border: "1.5px solid #6ee7b7",
                }}
              >
                😊 {isTamil ? "கற்றுக்கொண்டேன்!" : "Got It!"} ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      {engine.state !== "SESSION_COMPLETE" && engine.state !== "RATE_VERSE" && (
        <div className="px-4 pb-8 pt-4">
          <div className="flex items-center justify-center gap-6">
            {/* Replay — only shown during RECORD_RECITE so it doesn't conflict with TTS in SHOW_MEANING/NARRATE_* states */}
            {engine.state === "RECORD_RECITE" ? (
              <button
                onClick={engine.replayShloka}
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: "white", border: "1.5px solid #DBEAFE", color: "#1E3A8A" }}
                aria-label="Replay shloka"
              >
                ⟲
              </button>
            ) : (
              <div className="w-12 h-12" />
            )}

            {/* Pause/Resume */}
            <button
              onClick={engine.isPaused ? engine.resume : engine.pause}
              className="rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2"
              style={{
                width: 140,
                height: 56,
                background: "#1E3A8A",
                boxShadow: "0 4px 16px rgba(30,58,138,0.3)",
              }}
              aria-label={engine.isPaused ? "Resume" : "Pause"}
            >
              {engine.isPaused
                ? (isTamil ? "▶ தொடர்" : "▶ Resume")
                : (isTamil ? "⏸ நிறுத்து" : "⏸ Pause")
              }
            </button>

            {/* Skip step */}
            <button
              onClick={engine.skipStep}
              className="flex items-center gap-1 px-3 h-12 rounded-full text-sm font-semibold"
              style={{ background: "white", border: "1.5px solid #DBEAFE", color: "#1E3A8A" }}
              aria-label="Skip step"
            >
              {isTamil ? "தவிர்" : "Skip"} ⏭
            </button>
          </div>
        </div>
      )}

      {/* End session confirm */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-6"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "#F5F7FF" }}
            >
              <h3 className="text-xl font-bold mb-2 text-center" style={{ color: "#1E2D5A" }}>
                {isTamil ? "Class முடிக்கணுமா?" : "End Session?"}
              </h3>
              <p className="text-center opacity-60 mb-6 text-sm">
                {isTamil ? "இதுவரை செய்த progress சேமிக்கப்படும்." : "Your progress so far will be saved."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 rounded-xl font-semibold"
                  style={{
                    height: 52,
                    background: "white",
                    border: "1.5px solid #DBEAFE",
                    color: "#1E2D5A",
                  }}
                >
                  {isTamil ? "தொடரு" : "Continue"}
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 rounded-xl font-semibold text-white"
                  style={{ height: 52, background: "#1E3A8A" }}
                >
                  {isTamil ? "Class முடி" : "End Class"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ background: "#F5F7FF" }}
    >
      <div className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>
        {value}
      </div>
      <div className="text-xs opacity-60 mt-1">{label}</div>
    </div>
  );
}
