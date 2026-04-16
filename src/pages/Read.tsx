/**
 * Read tab — text browser for all scripture content.
 * Three sub-tabs:
 *   Scriptures — Bhagavad Gita + Hanuman Chalisa (text + meaning)
 *   Puranas    — Ramayana Sundara Kanda (lazy-loaded)
 *   Devotional — Deity shlokas + Bhajans
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { loadProgress } from "../services/storage";
import { getSections, type SectionEntry } from "../services/textsService";
import { getBGVerses } from "../services/versesService";
import type { Verse } from "../types";
import { chapters as bgChapters, verses as bgVerses } from "../data/bgData";
import { chapters as hcChapters, verses as hcVerses } from "../data/hanumanChalisaData";
import { SCRIPTURES } from "../data/scriptureRegistry";
import { useScripture } from "../hooks/useScripture";
import { DEITY_COLLECTIONS } from "../data/deityData";
import { BHAJANS } from "../data/bhajanData";
import {
  textToSpeech,
  playBase64Audio,
  stopCurrentAudio,
  unlockAudioContext,
  DEFAULT_VOICE,
  transliterateToTamil,
} from "../services/sarvamService";
import { unlockChantingAudio } from "../services/chantingService";

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

type Tab = "scriptures" | "puranas" | "devotional";
type ReadScripture = "bg" | "hanuman_chalisa";

const FALLBACK_BG_SECTIONS: SectionEntry[] = bgChapters.map((ch) => ({
  id: ch.number, textId: "bg", number: ch.number,
  name: ch.name, slokaCount: ch.verseCount,
}));

export default function Read() {
  const progress = loadProgress();
  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);
  const voice = progress.voice || DEFAULT_VOICE;

  const [tab, setTab] = useState<Tab>("scriptures");
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Scriptures tab state ──────────────────────────────────────────────────
  const [readScripture, setReadScripture] = useState<ReadScripture>("bg");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [bgSections, setBgSections] = useState<SectionEntry[]>([]);
  const [loadingBgSections, setLoadingBgSections] = useState(true);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [loadingChapter, setLoadingChapter] = useState(false);

  useEffect(() => {
    getSections("bg")
      .then((data) => { setBgSections(data); setLoadingBgSections(false); })
      .catch(() => setLoadingBgSections(false));
  }, []);

  const displayBgSections = bgSections.length > 0 ? bgSections : FALLBACK_BG_SECTIONS;

  const openChapter = async (n: number) => {
    setSelectedChapter(n);
    setChapterVerses([]);
    setLoadingChapter(true);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    if (readScripture === "bg") {
      const verses = await getBGVerses(n);
      if (verses.length > 0) {
        setChapterVerses(verses);
      } else {
        setChapterVerses(bgVerses.filter((v) => !v.isPlaceholder && v.chapter === n));
      }
    } else {
      // Hanuman Chalisa — all data is local
      setChapterVerses(hcVerses.filter((v) => v.chapter === n));
    }
    setLoadingChapter(false);
  };

  const switchScripture = (s: ReadScripture) => {
    setReadScripture(s);
    setSelectedChapter(null);
    setChapterVerses([]);
    contentRef.current?.scrollTo({ top: 0 });
  };

  // ── Puranas tab state ─────────────────────────────────────────────────────
  const sk = SCRIPTURES["ramayana_sundara"];
  const { data: skData, loading: skLoading, error: skError } = useScripture(sk.lazyJsonPath ?? null);
  const [selectedSarga, setSelectedSarga] = useState<number | null>(null);

  const sargaVerses = selectedSarga !== null && skData
    ? skData.verses.filter((v) => v.chapter === selectedSarga)
    : [];

  // ── Devotional tab state ──────────────────────────────────────────────────
  const [selectedDeity, setSelectedDeity] = useState<string>(DEITY_COLLECTIONS[0].id);
  const [expandedBhajan, setExpandedBhajan] = useState<string | null>(null);

  // ── Audio playback ────────────────────────────────────────────────────────
  const [playingId, setPlayingId] = useState<string | null>(null);

  const playText = useCallback(async (id: string, text: string) => {
    if (playingId === id) { stopCurrentAudio(); setPlayingId(null); return; }
    stopCurrentAudio();
    setPlayingId(id);
    try {
      const audio = await textToSpeech(text, "hi-IN", 0.85, voice);
      await playBase64Audio(audio);
    } catch {
    } finally {
      setPlayingId((cur) => (cur === id ? null : cur));
    }
  }, [playingId, voice]);

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setSelectedChapter(null);
    setSelectedSarga(null);
    setChapterVerses([]);
    contentRef.current?.scrollTo({ top: 0 });
  };

  const currentDeity = DEITY_COLLECTIONS.find((d) => d.id === selectedDeity)!;
  const bgChapterName = (n: number) => displayBgSections.find((s) => s.number === n)?.name ?? "";
  const hcChapterName = (n: number) => hcChapters.find((c) => c.number === n)?.name ?? "";

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: "linear-gradient(to bottom, transparent 0px, transparent 60px, #FDF8F0 260px)", color: P.text }}
    >
      {/* ── Header + tabs ── */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-0"
        style={{ background: "rgba(253,248,240,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${P.cardBorder}` }}
      >
        <h1 className="text-lg font-bold mb-1" style={{ color: P.primary }}>
          {t("Read", "படி", "पढ़ें")}
        </h1>
        <div className="flex gap-1 pb-0">
          {(
            [
              { id: "scriptures", en: "📖 Scriptures", ta: "📖 வேதங்கள்",   hi: "📖 शास्त्र"  },
              { id: "puranas",    en: "🐒 Puranas",    ta: "🐒 புராணங்கள்",  hi: "🐒 पुराण"    },
              { id: "devotional", en: "🪔 Devotional", ta: "🪔 பக்தி",        hi: "🪔 भक्ति"    },
            ] as const
          ).map((tabDef) => (
            <button
              key={tabDef.id}
              onClick={() => switchTab(tabDef.id)}
              className="flex-1 py-2.5 text-xs font-semibold transition-all rounded-none"
              style={{
                color: tab === tabDef.id ? P.primary : P.textMid,
                borderBottom: `3px solid ${tab === tabDef.id ? P.gold : "transparent"}`,
                background: "transparent",
                opacity: tab === tabDef.id ? 1 : 0.6,
              }}
            >
              {isTamil ? tabDef.ta : isHindi ? tabDef.hi : tabDef.en}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-24">

        {/* ════════════ SCRIPTURES TAB ════════════════════════════════════════ */}
        {tab === "scriptures" && (
          <div>
            {/* Scripture selector pills */}
            <div className="px-4 pt-4 pb-3 flex gap-2">
              {(["bg", "hanuman_chalisa"] as ReadScripture[]).map((sId) => {
                const s = SCRIPTURES[sId];
                const isActive = readScripture === sId;
                return (
                  <button
                    key={sId}
                    onClick={() => switchScripture(sId)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all active:scale-95"
                    style={{
                      background: isActive ? P.primary : "white",
                      color: isActive ? "white" : P.primary,
                      border: `1.5px solid ${isActive ? P.primary : P.cardBorder}`,
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{isTamil ? s.titleTA : isHindi ? s.titleHI : s.titleEN}</span>
                  </button>
                );
              })}
            </div>

            {/* Back button when inside a chapter */}
            {selectedChapter !== null && (
              <div
                className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
                style={{ background: P.bg, borderBottom: `1px solid ${P.cardBorder}` }}
              >
                <button
                  onClick={() => { setSelectedChapter(null); setChapterVerses([]); contentRef.current?.scrollTo({ top: 0 }); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg font-bold transition-all active:scale-90"
                  style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
                >‹</button>
                <div className="min-w-0">
                  <p className="text-xs opacity-40 uppercase tracking-widest">
                    {t(`Chapter ${selectedChapter}`, `அத்தியாயம் ${selectedChapter}`, `अध्याय ${selectedChapter}`)}
                  </p>
                  <p className="font-bold text-sm truncate" style={{ color: P.primary }}>
                    {readScripture === "bg" ? bgChapterName(selectedChapter) : hcChapterName(selectedChapter)}
                  </p>
                </div>
              </div>
            )}

            {/* Chapter list */}
            {selectedChapter === null && (
              <div className="px-4 pt-2 pb-6 flex flex-col gap-2">
                {readScripture === "bg" ? (
                  <>
                    {loadingBgSections && Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="w-full h-14 rounded-2xl animate-pulse" style={{ background: "#D4DEFF" }} />
                    ))}
                    {!loadingBgSections && displayBgSections.map((ch) => (
                      <ChapterRow key={ch.number} number={ch.number} name={ch.name} verseCount={ch.slokaCount}
                        isTamil={isTamil} isHindi={isHindi} onClick={() => openChapter(ch.number)} />
                    ))}
                  </>
                ) : (
                  hcChapters.map((ch) => (
                    <ChapterRow key={ch.number} number={ch.number} name={ch.name} verseCount={ch.verseCount}
                      isTamil={isTamil} isHindi={isHindi} onClick={() => openChapter(ch.number)} />
                  ))
                )}
              </div>
            )}

            {/* Verse list for selected chapter */}
            {selectedChapter !== null && (
              <div className="flex flex-col gap-4 px-4 py-4">
                {loadingChapter && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full h-48 rounded-2xl animate-pulse" style={{ background: "#EEF2FF" }} />
                ))}
                {!loadingChapter && chapterVerses.map((v) => (
                  <VerseCard
                    key={`${v.chapter}:${v.verse}`}
                    verse={v}
                    isTamil={isTamil}
                    isHindi={isHindi}
                    playingId={playingId}
                    onPlay={(id, text) => { unlockAudioContext(); unlockChantingAudio(); playText(id, text); }}
                  />
                ))}
                {!loadingChapter && chapterVerses.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <p className="text-2xl">🔄</p>
                    <p className="text-sm font-semibold" style={{ color: P.primary }}>
                      {t("No verses found", "ஸ்லோகங்கள் இல்லை", "श्लोक नहीं मिले")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════ PURANAS TAB ════════════════════════════════════════════ */}
        {tab === "puranas" && (
          <div>
            {/* Loading */}
            {skLoading && (
              <div className="px-4 pt-6 flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-full h-14 rounded-2xl animate-pulse" style={{ background: "#D4DEFF" }} />
                ))}
              </div>
            )}

            {/* Error */}
            {skError && !skLoading && (
              <div className="px-4 pt-8 text-center">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="font-semibold" style={{ color: P.primary }}>{t("Could not load Sundara Kanda", "சுந்தர காண்டம் ஏற்றல் தோல்வி", "सुंदर काण्ड लोड नहीं हुआ")}</p>
                <p className="text-xs opacity-50 mt-1">{skError}</p>
              </div>
            )}

            {/* Data loaded */}
            {skData && !skLoading && (
              <>
                {/* Header */}
                <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl" style={{ background: P.tint }}>🐒</div>
                  <div>
                    <p className="font-bold text-base" style={{ color: P.primary }}>
                      {isTamil ? sk.titleTA : isHindi ? sk.titleHI : sk.titleEN}
                    </p>
                    <p className="text-xs opacity-50">{isTamil ? sk.subtitleTA : isHindi ? sk.subtitleHI : sk.subtitleEN}</p>
                  </div>
                </div>

                {/* Back button inside a sarga */}
                {selectedSarga !== null && (
                  <div
                    className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
                    style={{ background: P.bg, borderBottom: `1px solid ${P.cardBorder}` }}
                  >
                    <button
                      onClick={() => { setSelectedSarga(null); contentRef.current?.scrollTo({ top: 0 }); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg font-bold transition-all active:scale-90"
                      style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
                    >‹</button>
                    <div>
                      <p className="text-xs opacity-40 uppercase tracking-widest">
                        {t(`Sarga ${selectedSarga}`, `சர்கம் ${selectedSarga}`, `सर्ग ${selectedSarga}`)}
                      </p>
                      <p className="font-bold text-sm" style={{ color: P.primary }}>
                        {skData.chapters.find((c) => c.number === selectedSarga)?.name ?? ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sarga list */}
                {selectedSarga === null && (
                  <div className="px-4 pt-2 pb-6 flex flex-col gap-2">
                    {skData.chapters.map((ch) => (
                      <ChapterRow
                        key={ch.number}
                        number={ch.number}
                        name={ch.name}
                        verseCount={ch.verseCount}
                        isTamil={isTamil}
                        isHindi={isHindi}
                        labelPrefix={t("Sarga", "சர்கம்", "सर्ग")}
                        onClick={() => { setSelectedSarga(ch.number); contentRef.current?.scrollTo({ top: 0 }); }}
                      />
                    ))}
                  </div>
                )}

                {/* Verses for selected sarga */}
                {selectedSarga !== null && (
                  <div className="flex flex-col gap-4 px-4 py-4">
                    {sargaVerses.map((v) => (
                      <VerseCard
                        key={`${v.chapter}:${v.verse}`}
                        verse={v}
                        isTamil={isTamil}
                        isHindi={isHindi}
                        playingId={playingId}
                        onPlay={(id, text) => { unlockAudioContext(); unlockChantingAudio(); playText(id, text); }}
                      />
                    ))}
                    {sargaVerses.length === 0 && (
                      <div className="text-center py-12 opacity-40">
                        <p>{t("No verses in this sarga", "இந்த சர்கத்தில் ஸ்லோகங்கள் இல்லை", "इस सर्ग में श्लोक नहीं")}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════════ DEVOTIONAL TAB ═════════════════════════════════════════ */}
        {tab === "devotional" && (
          <div>
            {/* ── Deity Shlokas ── */}
            <div>
              <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color: P.gold }}>
                {t("Deity Shlokas", "தெய்வ ஸ்லோகங்கள்", "देवता श्लोक")}
              </p>

              {/* Deity selector */}
              <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {DEITY_COLLECTIONS.map((dc) => (
                  <button
                    key={dc.id}
                    onClick={() => setSelectedDeity(dc.id)}
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

              {/* Deity shlokas */}
              <div className="flex flex-col gap-4 px-4 pb-4">
                {currentDeity.shlokas.map((sh, idx) => (
                  <div key={sh.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "white", border: `1.5px solid ${currentDeity.borderColor}` }}>
                    <div className="px-5 py-3 flex items-center gap-3"
                      style={{ background: currentDeity.bgColor, borderBottom: `1px solid ${currentDeity.borderColor}` }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: "white", color: P.primary }}>{idx + 1}</div>
                      <p className="font-bold text-sm flex-1" style={{ color: P.primary }}>
                        {isTamil && sh.nameTA ? sh.nameTA : isHindi && sh.nameHI ? sh.nameHI : sh.name}
                      </p>
                      <button
                        onClick={() => { unlockAudioContext(); unlockChantingAudio(); playText(`deity-${sh.id}`, sh.sanskrit); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-xs"
                        style={{ background: playingId === `deity-${sh.id}` ? P.primary : "white", color: playingId === `deity-${sh.id}` ? "white" : P.primary, border: `1.5px solid ${currentDeity.borderColor}` }}
                      >{playingId === `deity-${sh.id}` ? "⏸" : "▶"}</button>
                    </div>
                    <div className="p-5">
                      <p className="text-center leading-relaxed mb-3"
                        style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: 20, color: P.text, lineHeight: 2, whiteSpace: "pre-line" }}>
                        {sh.sanskrit}
                      </p>
                      <p className="text-center text-sm italic opacity-45 mb-4" style={{ fontFamily: "serif", whiteSpace: "pre-line" }}>
                        {sh.transliteration}
                      </p>
                      <div className="mb-4" style={{ height: 1, background: currentDeity.borderColor }} />
                      <div className="rounded-xl p-4" style={{ background: currentDeity.bgColor }}>
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">{t("Meaning", "பொருள்", "अर्थ")}</p>
                        <p className="text-sm leading-relaxed" style={{ color: P.text }}>
                          {isTamil && sh.meaningTA ? sh.meaningTA : isHindi && sh.meaningHI ? sh.meaningHI : sh.meaningEN}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bhajans ── */}
            <div style={{ borderTop: `1px solid ${P.cardBorder}` }}>
              <p className="px-4 pt-4 pb-3 text-xs font-bold uppercase tracking-widest" style={{ color: P.gold }}>
                {t("Bhajans", "பஜன்கள்", "भजन")}
              </p>
              <div className="flex flex-col gap-3 px-4 pb-8">
                {BHAJANS.map((bh) => {
                  const isOpen = expandedBhajan === bh.id;
                  return (
                    <div key={bh.id} className="rounded-2xl overflow-hidden"
                      style={{ background: "white", border: "1.5px solid #BBF7D0" }}>
                      <div className="p-4 flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedBhajan(isOpen ? null : bh.id)}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                          style={{ background: "#F0FDF4", color: "#15803D" }}>🎵</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: P.text }}>
                            {isTamil ? bh.nameTA : isHindi ? bh.nameHI : bh.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs opacity-50">{isTamil ? bh.deityTA : bh.deity}</span>
                            <span className="text-xs opacity-30">·</span>
                            <span className="text-xs opacity-50">{bh.language}</span>
                          </div>
                        </div>
                        <span className="text-xl transition-transform shrink-0"
                          style={{ color: "#15803D", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}>›</span>
                      </div>

                      {!isOpen && (
                        <div className="px-4 pb-3">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: "#F0FDF4", color: "#15803D" }}>{isTamil ? bh.tagTA : bh.tagEN}</span>
                        </div>
                      )}

                      {isOpen && (
                        <div style={{ borderTop: "1px solid #BBF7D0" }}>
                          <div className="px-4 py-3">
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: "#F0FDF4", color: "#15803D" }}>{isTamil ? bh.tagTA : bh.tagEN}</span>
                          </div>
                          {bh.verses.map((v, vi) => (
                            <div key={vi}>
                              {vi > 0 && <div className="mx-4 mb-4" style={{ height: 1, background: "#BBF7D0" }} />}
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
                                    style={{ background: playingId === `bhajan-${bh.id}-${vi}` ? "#15803D" : "#F0FDF4", color: playingId === `bhajan-${bh.id}-${vi}` ? "white" : "#15803D", border: "1px solid #BBF7D0" }}>
                                    {playingId === `bhajan-${bh.id}-${vi}` ? "⏸ Stop" : "▶ Play"}
                                  </button>
                                </div>
                                <p className="text-center leading-loose mb-3"
                                  style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: 19, color: P.text, lineHeight: 2.1, whiteSpace: "pre-line" }}>
                                  {v.lines}
                                </p>
                                {v.transliteration && (
                                  <p className="text-center text-sm italic opacity-40 mb-4"
                                    style={{ fontFamily: "serif", whiteSpace: "pre-line" }}>{v.transliteration}</p>
                                )}
                                <div className="rounded-xl p-4" style={{ background: "#F0FDF4" }}>
                                  <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">{t("Meaning", "பொருள்", "अर्थ")}</p>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function ChapterRow({
  number, name, verseCount, isTamil, isHindi, labelPrefix, onClick,
}: {
  number: number; name: string; verseCount: number;
  isTamil: boolean; isHindi: boolean; labelPrefix?: string; onClick: () => void;
}) {
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);
  const prefix = labelPrefix ?? t("Chapter", "அத்தியாயம்", "अध्याय");
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]"
      style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ background: P.tint, color: P.primary }}>{number}</div>
          <div className="min-w-0">
            <p className="text-xs opacity-40 uppercase tracking-widest">{prefix} {number}</p>
            <p className="font-semibold text-sm truncate" style={{ color: P.primary }}>{name}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
          style={{ background: P.tint, color: P.primary }}>
          {verseCount} {t("verses", "ஸ்லோகங்கள்", "श्लोक")} ›
        </span>
      </div>
    </button>
  );
}

function VerseCard({
  verse, isTamil, isHindi, playingId, onPlay,
}: {
  verse: Verse; isTamil: boolean; isHindi: boolean;
  playingId: string | null; onPlay: (id: string, text: string) => void;
}) {
  const [showWords, setShowWords] = useState(false);
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);
  const id = `verse-${verse.chapter}:${verse.verse}`;
  const playing = playingId === id;
  const meaning = isTamil && verse.meaningTA ? verse.meaningTA : verse.meaningEN;
  const reflection = isTamil && verse.reflectionTA ? verse.reflectionTA : verse.reflection;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: `1.5px solid ${P.cardBorder}` }}>
      {/* Header strip */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ background: P.tint, borderBottom: `1px solid ${P.cardBorder}` }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: P.primary }}>
          {verse.chapter}:{verse.verse}
        </span>
        <div className="flex items-center gap-2">
          {verse.wordByWord && verse.wordByWord.length > 0 && (
            <button
              onClick={() => setShowWords((w) => !w)}
              className="text-xs font-semibold rounded-full px-2.5 py-1 transition-all active:scale-95"
              style={{ background: showWords ? P.primary : "white", color: showWords ? "white" : P.primary, border: `1px solid ${P.cardBorder}` }}
            >
              {showWords ? t("Hide", "மூடு", "बंद") : t("Word by word", "வார்த்தை-வார்த்தை", "शब्द-शब्द")}
            </button>
          )}
          <button
            onClick={() => onPlay(id, verse.sanskrit)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all active:scale-90"
            style={{ background: playing ? P.primary : "white", color: playing ? "white" : P.primary, border: `1px solid ${P.cardBorder}` }}
          >
            {playing ? "⏸" : "▶"}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Script rendering */}
        {isTamil ? (
          <>
            <p className="text-center mb-3"
              style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: 22, color: P.text, lineHeight: 1.9, whiteSpace: "pre-line" }}>
              {transliterateToTamil(verse.sanskrit)}
            </p>
            <p className="text-center mb-5"
              style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: 15, color: P.textMid, lineHeight: 1.8, whiteSpace: "pre-line", fontStyle: "italic", opacity: 0.65 }}>
              {verse.sanskrit}
            </p>
          </>
        ) : (
          <>
            {verse.transliteration ? (
              <p className="text-center mb-3"
                style={{ fontFamily: "Georgia, serif", fontSize: 19, color: P.text, lineHeight: 1.9, whiteSpace: "pre-line", fontStyle: "italic" }}>
                {verse.transliteration}
              </p>
            ) : null}
            <p className="text-center mb-5"
              style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: verse.transliteration ? 15 : 20, color: verse.transliteration ? P.textMid : P.text, lineHeight: 1.9, whiteSpace: "pre-line", opacity: verse.transliteration ? 0.65 : 1 }}>
              {verse.sanskrit}
            </p>
          </>
        )}

        {/* Word by word */}
        {showWords && verse.wordByWord && (
          <div className="mb-4 flex flex-wrap gap-2">
            {verse.wordByWord.map((w, i) => (
              <div key={i} className="rounded-xl px-3 py-2 text-center"
                style={{ background: P.tint, border: `1px solid ${P.cardBorder}` }}>
                <p className="text-sm font-semibold mb-0.5"
                  style={{ fontFamily: "'Noto Serif Devanagari', serif", color: P.primary }}>{w.word}</p>
                <p className="text-sm" style={{ color: P.text, opacity: 0.75 }}>{w.meaning}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: P.cardBorder, marginBottom: 16 }} />

        <div className="rounded-xl p-4 mb-3" style={{ background: P.tint }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: P.primary, opacity: 0.7 }}>
            {t("Meaning", "பொருள்", "अर्थ")}
          </p>
          <p className="text-base leading-relaxed" style={{ color: P.text }}>{meaning}</p>
        </div>

        {reflection && (
          <p className="text-base italic text-center" style={{ color: P.gold, opacity: 0.9 }}>🌿 {reflection}</p>
        )}
      </div>
    </div>
  );
}
