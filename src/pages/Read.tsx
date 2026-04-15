/**
 * Read — scripture library reader.
 * Three tabs: Bhagavad Gita | Deity Shlokas | Bhajans
 * Each tab allows browsing and reading full texts with Sanskrit,
 * transliteration, and meaning in the user's language.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { loadProgress } from "../services/storage";
import { getSections, type SectionEntry } from "../services/textsService";
import { getBGVerses } from "../services/versesService";
import type { Verse } from "../types";
import { chapters as bgChapters, verses as bgVerses } from "../data/bgData";
import { DEITY_COLLECTIONS } from "../data/deityData";
import { BHAJANS } from "../data/bhajanData";
import {
  textToSpeech,
  playBase64Audio,
  stopCurrentAudio,
  unlockAudioContext,
  DEFAULT_VOICE,
} from "../services/sarvamService";
import { unlockChantingAudio } from "../services/chantingService";

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

type Tab = "gita" | "deity" | "bhajans";

// Fallback chapter list from local data — always shows all 18 chapters
// even when Supabase is unreachable (e.g. env vars missing in build)
const FALLBACK_SECTIONS: SectionEntry[] = bgChapters.map((ch) => ({
  id: ch.number,
  textId: "bg",
  number: ch.number,
  name: ch.name,
  slokaCount: ch.verseCount,
}));

export default function Read() {
  useLocation();
  const progress = loadProgress();
  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  const [tab, setTab] = useState<Tab>("gita");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedDeity, setSelectedDeity] = useState<string>(DEITY_COLLECTIONS[0].id);
  const [expandedBhajan, setExpandedBhajan] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // DB data
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Resolved chapter list: DB data when available, local fallback otherwise
  const displaySections = sections.length > 0 ? sections : FALLBACK_SECTIONS;

  // Load BG sections on mount
  useEffect(() => {
    getSections("bg")
      .then((data) => { setSections(data); setLoadingSections(false); })
      .catch(() => { setLoadingSections(false); });
  }, []);

  // Audio state — tracks which item is currently playing
  const [playingId, setPlayingId] = useState<string | null>(null);
  const voice = progress.voice || DEFAULT_VOICE;

  const playText = useCallback(async (id: string, text: string) => {
    // Unlock synchronously (called from onClick before await)
    if (playingId === id) {
      stopCurrentAudio();
      setPlayingId(null);
      return;
    }
    stopCurrentAudio();
    setPlayingId(id);
    try {
      // Use Hindi for Sanskrit/Devanagari, user language for meaning
      const lang = "hi-IN";
      const audio = await textToSpeech(text, lang, 0.85, voice);
      await playBase64Audio(audio);
    } catch {
    } finally {
      setPlayingId((cur) => (cur === id ? null : cur));
    }
  }, [playingId, voice]);

  const changeDeity = (id: string) => {
    setSelectedDeity(id);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openChapter = async (n: number) => {
    setSelectedChapter(n);
    setChapterVerses([]);
    setLoadingChapter(true);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    const verses = await getBGVerses(n);
    if (verses.length > 0) {
      setChapterVerses(verses);
    } else {
      // Fallback: use local bgData verses for chapters that have them
      const local = bgVerses.filter((v) => !v.isPlaceholder && v.chapter === n);
      setChapterVerses(local);
    }
    setLoadingChapter(false);
  };

  const currentDeity = DEITY_COLLECTIONS.find((d) => d.id === selectedDeity)!;

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: P.bg, color: P.text }}
    >
      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-0"
        style={{ background: P.bg, borderBottom: `1px solid ${P.cardBorder}` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div>
            <h1 className="text-lg font-bold" style={{ color: P.primary }}>
              {t("Reading", "வாசிப்பு", "पठन")}
            </h1>
            <p className="text-xs opacity-50">
              {t("Read · Reflect · Remember", "படி · சிந்தி · நினை", "पढ़ें · विचारें · याद करें")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {(
            [
              { id: "gita",    labelEn: "📖 Gita",    labelTa: "📖 கீதை",    labelHi: "📖 गीता" },
              { id: "deity",   labelEn: "🪔 Deities",  labelTa: "🪔 தெய்வம்", labelHi: "🪔 देवता" },
              { id: "bhajans", labelEn: "🎵 Bhajans",  labelTa: "🎵 பஜன்",    labelHi: "🎵 भजन" },
            ] as const
          ).map((tabDef) => (
            <button
              key={tabDef.id}
              onClick={() => { setTab(tabDef.id); setSelectedChapter(null); contentRef.current?.scrollTo({ top: 0 }); }}
              className="flex-1 py-2.5 text-sm font-semibold transition-all rounded-none"
              style={{
                color: tab === tabDef.id ? P.primary : P.textMid,
                borderBottom: `3px solid ${tab === tabDef.id ? P.gold : "transparent"}`,
                background: "transparent",
                opacity: tab === tabDef.id ? 1 : 0.6,
              }}
            >
              {isTamil ? tabDef.labelTa : isHindi ? tabDef.labelHi : tabDef.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-24">

        {/* ════════════════ BHAGAVAD GITA TAB ════════════════════════════════ */}
        {tab === "gita" && (
          <div>
            {/* ── Level 1: Chapter list ───────────────────────────────────────── */}
            {selectedChapter === null && (
              <div className="px-4 pt-4 pb-6 flex flex-col gap-2">
                {/* Skeleton only while DB query is in-flight */}
                {loadingSections && Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full h-14 rounded-2xl animate-pulse"
                    style={{ background: "#D4DEFF" }} />
                ))}

                {/* Chapter list — DB data when available, local fallback otherwise */}
                {!loadingSections && displaySections.map((ch) => (
                  <button
                    key={ch.number}
                    onClick={() => openChapter(ch.number)}
                    className="w-full rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]"
                    style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{ background: P.tint, color: P.primary }}
                        >
                          {ch.number}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs opacity-40 uppercase tracking-widest">
                            {t(`Chapter ${ch.number}`, `அத்தியாயம் ${ch.number}`, `अध्याय ${ch.number}`)}
                          </p>
                          <p className="font-semibold text-sm truncate" style={{ color: P.primary }}>
                            {isTamil && ch.nameTa ? ch.nameTa : isHindi && ch.nameHi ? ch.nameHi : ch.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                        style={{ background: P.tint, color: P.primary }}>
                        {ch.slokaCount} {t("verses", "ஸ்லோகங்கள்", "श्लोक")} ›
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Level 2: Verses for selected chapter ───────────────────────── */}
            {selectedChapter !== null && (
              <div>
                {/* Back bar */}
                <div
                  className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
                  style={{ background: P.bg, borderBottom: `1px solid ${P.cardBorder}` }}
                >
                  <button
                    onClick={() => { setSelectedChapter(null); contentRef.current?.scrollTo({ top: 0 }); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg font-bold transition-all active:scale-90"
                    style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
                  >
                    ‹
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs opacity-40 uppercase tracking-widest">
                      {t(`Chapter ${selectedChapter}`, `அத்தியாயம் ${selectedChapter}`, `अध्याय ${selectedChapter}`)}
                    </p>
                    <p className="font-bold text-sm truncate" style={{ color: P.primary }}>
                      {displaySections.find((c) => c.number === selectedChapter)?.name ?? ""}
                    </p>
                  </div>
                </div>

                {/* Verses */}
                <div className="flex flex-col gap-4 px-4 py-4">
                  {loadingChapter && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-full h-48 rounded-2xl animate-pulse"
                      style={{ background: "#EEF2FF" }} />
                  ))}
                  {!loadingChapter && chapterVerses.map((v) => (
                    <VerseCard
                      key={`${v.chapter}:${v.verse}`}
                      verse={v}
                      isTamil={isTamil}
                      isHindi={isHindi}
                    />
                  ))}
                  {!loadingChapter && chapterVerses.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
                      <p className="text-2xl">🔄</p>
                      <p className="text-sm font-semibold" style={{ color: P.primary }}>
                        {t("Syncing verse content…", "ஸ்லோகங்கள் ஏற்றப்படுகின்றன…", "श्लोक लोड हो रहे हैं…")}
                      </p>
                      <p className="text-xs opacity-40">
                        {t(
                          "Please check your internet connection and try again.",
                          "இணைய இணைப்பை சரிபார்க்கவும்.",
                          "इंटरनेट कनेक्शन जांचें।",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ DEITY SHLOKAS TAB ════════════════════════════════ */}
        {tab === "deity" && (
          <div>
            {/* Deity tabs — horizontal scroll */}
            <div
              className="sticky z-10 px-4 py-3"
              style={{ top: 0, background: P.bg, borderBottom: `1px solid ${P.cardBorder}` }}
            >
              <p className="text-xs opacity-50 mb-2">
                {t("Select deity", "தெய்வம் தேர்வு செய்க", "देवता चुनें")}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {DEITY_COLLECTIONS.map((dc) => (
                  <button
                    key={dc.id}
                    onClick={() => changeDeity(dc.id)}
                    className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                    style={{
                      background: selectedDeity === dc.id ? P.primary : "white",
                      color: selectedDeity === dc.id ? "white" : P.primary,
                      border: `1.5px solid ${selectedDeity === dc.id ? P.primary : P.cardBorder}`,
                    }}
                  >
                    <span>{dc.icon}</span>
                    <span>{isTamil ? dc.deityTA : isHindi ? dc.deityHI : dc.deity}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deity header */}
            <div className="px-4 pt-4 pb-2">
              <div
                className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{ background: currentDeity.bgColor, border: `1.5px solid ${currentDeity.borderColor}` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "white", fontSize: 32 }}
                >
                  {currentDeity.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: P.primary }}>
                    {isTamil ? currentDeity.deityTA : isHindi ? currentDeity.deityHI : currentDeity.deity}
                  </h2>
                  <p className="text-sm opacity-55">
                    {currentDeity.shlokas.length} {t("shlokas", "ஸ்லோகங்கள்", "श्लोक")}
                  </p>
                </div>
              </div>
            </div>

            {/* Deity shlokas */}
            <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
              {currentDeity.shlokas.map((sh, idx) => (
                <div
                  key={sh.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: `1.5px solid ${currentDeity.borderColor}` }}
                >
                  {/* Shloka number + name + play button */}
                  <div
                    className="px-5 py-3 flex items-center gap-3"
                    style={{ background: currentDeity.bgColor, borderBottom: `1px solid ${currentDeity.borderColor}` }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: "white", color: P.primary }}
                    >
                      {idx + 1}
                    </div>
                    <p className="font-bold text-sm flex-1" style={{ color: P.primary }}>
                      {isTamil && sh.nameTA ? sh.nameTA : isHindi && sh.nameHI ? sh.nameHI : sh.name}
                    </p>
                    <button
                      onClick={() => { unlockAudioContext(); unlockChantingAudio(); playText(`deity-${sh.id}`, sh.sanskrit); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-xs"
                      style={{
                        background: playingId === `deity-${sh.id}` ? P.primary : "white",
                        color: playingId === `deity-${sh.id}` ? "white" : P.primary,
                        border: `1.5px solid ${currentDeity.borderColor}`,
                      }}
                      aria-label="Play shloka"
                    >
                      {playingId === `deity-${sh.id}` ? "⏸" : "▶"}
                    </button>
                  </div>

                  <div className="p-5">
                    {/* Sanskrit */}
                    <p
                      className="text-center leading-relaxed mb-3"
                      style={{
                        fontFamily: "'Noto Serif Devanagari', serif",
                        fontSize: 20,
                        color: P.text,
                        lineHeight: 2,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {sh.sanskrit}
                    </p>

                    {/* Transliteration */}
                    <p
                      className="text-center text-sm italic opacity-45 mb-4"
                      style={{ fontFamily: "serif", whiteSpace: "pre-line" }}
                    >
                      {sh.transliteration}
                    </p>

                    {/* Divider */}
                    <div className="mb-4" style={{ height: 1, background: currentDeity.borderColor }} />

                    {/* Meaning */}
                    <div className="rounded-xl p-4" style={{ background: currentDeity.bgColor }}>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                        {t("Meaning", "பொருள்", "अर्थ")}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: P.text }}>
                        {isTamil && sh.meaningTA ? sh.meaningTA : isHindi && sh.meaningHI ? sh.meaningHI : sh.meaningEN}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ BHAJANS TAB ═══════════════════════════════════════ */}
        {tab === "bhajans" && (
          <div className="flex flex-col gap-3 p-4 pb-8">
            {BHAJANS.map((bh) => {
              const isOpen = expandedBhajan === bh.id;
              return (
                <div
                  key={bh.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: "1.5px solid #BBF7D0" }}
                >
                  {/* Bhajan header — always visible, tap to expand */}
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedBhajan(isOpen ? null : bh.id)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold"
                      style={{ background: "#F0FDF4", color: "#15803D" }}
                    >
                      🎵
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: P.text }}>
                        {isTamil ? bh.nameTA : isHindi ? bh.nameHI : bh.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs opacity-50">
                          {isTamil ? bh.deityTA : bh.deity}
                        </span>
                        <span className="text-xs opacity-30">·</span>
                        <span className="text-xs opacity-50">{bh.language}</span>
                        <span className="text-xs opacity-30">·</span>
                        <span className="text-xs opacity-50">
                          {bh.verses.length} {t("verse(s)", "பகுதி(கள்)", "पद")}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xl transition-transform shrink-0"
                      style={{
                        color: "#15803D",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ›
                    </span>
                  </div>

                  {/* Tag line */}
                  {!isOpen && (
                    <div className="px-4 pb-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: "#F0FDF4", color: "#15803D" }}
                      >
                        {isTamil ? bh.tagTA : bh.tagEN}
                      </span>
                    </div>
                  )}

                  {/* Expanded full text */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid #BBF7D0" }}>
                      <div className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: "#F0FDF4", color: "#15803D" }}
                        >
                          {isTamil ? bh.tagTA : bh.tagEN}
                        </span>
                      </div>

                      {bh.verses.map((v, vi) => (
                        <div key={vi}>
                          {vi > 0 && (
                            <div className="mx-4 mb-4" style={{ height: 1, background: "#BBF7D0" }} />
                          )}
                          <div className="px-4 pb-4">
                            <div className="flex items-center justify-between mb-3">
                              {bh.verses.length > 1 ? (
                                <p className="text-xs font-semibold uppercase tracking-widest opacity-40">
                                  {t(`Verse ${vi + 1}`, `பகுதி ${vi + 1}`, `पद ${vi + 1}`)}
                                </p>
                              ) : <div />}
                              <button
                                onClick={() => { unlockAudioContext(); unlockChantingAudio(); playText(`bhajan-${bh.id}-${vi}`, v.lines); }}
                                className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all active:scale-95"
                                style={{
                                  background: playingId === `bhajan-${bh.id}-${vi}` ? "#15803D" : "#F0FDF4",
                                  color: playingId === `bhajan-${bh.id}-${vi}` ? "white" : "#15803D",
                                  border: "1px solid #BBF7D0",
                                }}
                              >
                                {playingId === `bhajan-${bh.id}-${vi}` ? "⏸ Stop" : "▶ Play"}
                              </button>
                            </div>

                            {/* Lyrics */}
                            <p
                              className="text-center leading-loose mb-3"
                              style={{
                                fontFamily: "'Noto Serif Devanagari', serif",
                                fontSize: 19,
                                color: P.text,
                                lineHeight: 2.1,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {v.lines}
                            </p>

                            {/* Transliteration */}
                            {v.transliteration && (
                              <p
                                className="text-center text-sm italic opacity-40 mb-4"
                                style={{ fontFamily: "serif", whiteSpace: "pre-line" }}
                              >
                                {v.transliteration}
                              </p>
                            )}

                            {/* Meaning */}
                            <div className="rounded-xl p-4" style={{ background: "#F0FDF4" }}>
                              <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                                {t("Meaning", "பொருள்", "अर्थ")}
                              </p>
                              <p className="text-sm leading-relaxed" style={{ color: P.text }}>
                                {isTamil && v.meaningTA ? v.meaningTA : isHindi && v.meaningHI ? v.meaningHI : v.meaningEN}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Verse card for Gita reading ───────────────────────────────────────────────
function VerseCard({
  verse,
  isTamil,
  isHindi,
}: {
  verse: {
    chapter: number;
    verse: number;
    sanskrit: string;
    transliteration: string;
    meaningEN: string;
    meaningTA?: string;
    reflection?: string;
    reflectionTA?: string;
    wordByWord?: Array<{ word: string; meaning: string }>;
  };
  isTamil: boolean;
  isHindi: boolean;
}) {
  const [showWords, setShowWords] = useState(false);
  const [playing, setPlaying] = useState(false);
  const voice = loadProgress().voice || DEFAULT_VOICE;
  const meaning = isTamil && (verse as { meaningTA?: string }).meaningTA
    ? (verse as { meaningTA?: string }).meaningTA!
    : verse.meaningEN;
  const reflection = isTamil && (verse as { reflectionTA?: string }).reflectionTA
    ? (verse as { reflectionTA?: string }).reflectionTA
    : verse.reflection;

  const playVerse = async () => {
    if (playing) { stopCurrentAudio(); setPlaying(false); return; }
    setPlaying(true);
    try {
      const audio = await textToSpeech(verse.sanskrit, "hi-IN", 0.8, voice);
      await playBase64Audio(audio);
    } catch {
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
    >
      {/* Verse number strip */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: P.tint, borderBottom: `1px solid ${P.cardBorder}` }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: P.primary }}>
          {verse.chapter}:{verse.verse}
        </span>
        <div className="flex items-center gap-2">
          {verse.wordByWord && verse.wordByWord.length > 0 && (
            <button
              onClick={() => setShowWords((w) => !w)}
              className="text-xs font-semibold rounded-full px-2.5 py-1 transition-all active:scale-95"
              style={{
                background: showWords ? P.primary : "white",
                color: showWords ? "white" : P.primary,
                border: `1px solid ${P.cardBorder}`,
              }}
            >
              {showWords
                ? (isTamil ? "மூடு" : isHindi ? "बंद करें" : "Hide words")
                : (isTamil ? "வார்த்தை-வார்த்தை" : isHindi ? "शब्द-शब्द" : "Word by word")}
            </button>
          )}
          <button
            onClick={() => { unlockAudioContext(); unlockChantingAudio(); playVerse(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all active:scale-90"
            style={{
              background: playing ? P.primary : "white",
              color: playing ? "white" : P.primary,
              border: `1px solid ${P.cardBorder}`,
            }}
            aria-label="Play verse"
          >
            {playing ? "⏸" : "▶"}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Sanskrit — larger for comfortable reading */}
        <p
          className="text-center mb-3"
          style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: 22,
            color: P.text,
            lineHeight: 2.1,
            whiteSpace: "pre-line",
          }}
        >
          {verse.sanskrit}
        </p>

        {/* Transliteration — only shown for English users; Tamil/Hindi readers
            cannot use Latin IAST script and it just clutters the view */}
        {!isTamil && !isHindi && (
          <p
            className="text-center text-sm italic mb-4"
            style={{ fontFamily: "serif", whiteSpace: "pre-line", color: P.textMid, opacity: 0.65 }}
          >
            {verse.transliteration}
          </p>
        )}

        {/* Word-by-word breakdown */}
        {showWords && verse.wordByWord && (
          <div className="mb-4 flex flex-wrap gap-2">
            {verse.wordByWord.map((w, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-2 text-center"
                style={{ background: P.tint, border: `1px solid ${P.cardBorder}` }}
              >
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ fontFamily: "'Noto Serif Devanagari', serif", color: P.primary }}
                >
                  {w.word}
                </p>
                <p className="text-sm" style={{ color: P.text, opacity: 0.75 }}>{w.meaning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="mb-4" style={{ height: 1, background: P.cardBorder }} />

        {/* Meaning — larger, darker text for easy reading */}
        <div className="rounded-xl p-4 mb-3" style={{ background: P.tint }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: P.primary, opacity: 0.7 }}>
            {isTamil ? "பொருள்" : isHindi ? "अर्थ" : "Meaning"}
          </p>
          <p className="text-base leading-relaxed" style={{ color: P.text }}>{meaning}</p>
        </div>

        {/* Reflection */}
        {reflection && (
          <p className="text-base italic text-center" style={{ color: P.gold, opacity: 0.9 }}>
            🌿 {reflection}
          </p>
        )}
      </div>
    </div>
  );
}
