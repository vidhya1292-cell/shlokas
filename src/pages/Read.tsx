/**
 * Read tab — scripture browser.
 * Tiles view → tap a scripture → chapter/sarga list → verses.
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

type ReadView = "bg" | "hanuman_chalisa" | "ramayana_sundara" | "devotional" | null;

const FALLBACK_BG_SECTIONS: SectionEntry[] = bgChapters.map((ch) => ({
  id: ch.number, textId: "bg", number: ch.number,
  name: ch.name, slokaCount: ch.verseCount,
}));

const TILES = [
  {
    id: "bg" as ReadView,
    icon: "📖",
    en: "Bhagavad Gita",      ta: "பகவத் கீதை",       hi: "भगवद्गीता",
    subEn: "700 verses · 18 chapters",
    subTa: "700 ஸ்லோகங்கள் · 18 அத்தியாயங்கள்",
    subHi: "700 श्लोक · 18 अध्याय",
    bg: "#EEF2FF",
  },
  {
    id: "hanuman_chalisa" as ReadView,
    icon: "🙏",
    en: "Hanuman Chalisa",    ta: "ஹனுமான் சாலீசா",   hi: "हनुमान चालीसा",
    subEn: "43 verses · Tulsidas",
    subTa: "43 வரிகள் · துளசிதாஸ்",
    subHi: "43 पद · तुलसीदास",
    bg: "#FFF7ED",
  },
  {
    id: "ramayana_sundara" as ReadView,
    icon: "🐒",
    en: "Sundara Kanda",      ta: "சுந்தர காண்டம்",    hi: "सुंदर काण्ड",
    subEn: "68 sargas · 2772 shlokas · Valmiki Ramayana",
    subTa: "68 சர்கங்கள் · 2772 ஸ்லோகங்கள் · வால்மீகி ராமாயணம்",
    subHi: "68 सर्ग · 2772 श्लोक · वाल्मीकि रामायण",
    bg: "#F0FDF4",
  },
  {
    id: "devotional" as ReadView,
    icon: "🪔",
    en: "Stotras & Bhajans",  ta: "ஸ்தோத்திரங்கள் & பஜன்கள்", hi: "स्तोत्र & भजन",
    subEn: "Deity shlokas · Bhajans",
    subTa: "தெய்வ ஸ்லோகங்கள் · பஜன்கள்",
    subHi: "देवता श्लोक · भजन",
    bg: "#FFF1F2",
  },
];

export default function Read() {
  const progress = loadProgress();
  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);
  const voice = progress.voice || DEFAULT_VOICE;

  const [view, setView] = useState<ReadView>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── BG / HC drill-down state ──────────────────────────────────────────────
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
    if (view === "bg") {
      const verses = await getBGVerses(n);
      setChapterVerses(verses.length > 0 ? verses : bgVerses.filter((v) => !v.isPlaceholder && v.chapter === n));
    } else {
      setChapterVerses(hcVerses.filter((v) => v.chapter === n));
    }
    setLoadingChapter(false);
  };

  // ── Sundara Kanda state ───────────────────────────────────────────────────
  const sk = SCRIPTURES["ramayana_sundara"];
  const { data: skData, loading: skLoading, error: skError } = useScripture(sk.lazyJsonPath ?? null);
  const [selectedSarga, setSelectedSarga] = useState<number | null>(null);
  const sargaVerses = selectedSarga !== null && skData
    ? skData.verses.filter((v) => v.chapter === selectedSarga)
    : [];

  // ── Devotional state ──────────────────────────────────────────────────────
  const [expandedDeity, setExpandedDeity] = useState<string | null>(null);
  const [expandedBhajan, setExpandedBhajan] = useState<string | null>(null);

  // ── Audio ─────────────────────────────────────────────────────────────────
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

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToTiles = () => {
    setView(null);
    setSelectedChapter(null);
    setChapterVerses([]);
    setSelectedSarga(null);
    contentRef.current?.scrollTo({ top: 0 });
  };

  const bgChapterName = (n: number) => displayBgSections.find((s) => s.number === n)?.name ?? "";
  const hcChapterName = (n: number) => hcChapters.find((c) => c.number === n)?.name ?? "";

  const viewTitle = view === "bg"
    ? t("Bhagavad Gita", "பகவத் கீதை", "भगवद्गीता")
    : view === "hanuman_chalisa"
    ? t("Hanuman Chalisa", "ஹனுமான் சாலீசா", "हनुमान चालीसा")
    : view === "ramayana_sundara"
    ? t("Sundara Kanda", "சுந்தர காண்டம்", "सुंदर काण्ड")
    : t("Stotras & Bhajans", "ஸ்தோத்திரங்கள் & பஜன்கள்", "स्तोत्र & भजन");

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: "linear-gradient(to bottom, transparent 0px, transparent 60px, #FDF8F0 260px)", color: P.text }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-3 flex items-center gap-3"
        style={{ background: "rgba(253,248,240,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${P.cardBorder}` }}
      >
        {view !== null && (
          <button
            onClick={goToTiles}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg font-bold transition-all active:scale-90"
            style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
          >‹</button>
        )}
        <div>
          <h1 className="text-lg font-bold leading-tight" style={{ color: P.primary }}>
            {view === null ? t("Read", "படி", "पढ़ें") : viewTitle}
          </h1>
          {view === null && (
            <p className="text-xs opacity-50">
              {t("Browse · Explore · Reflect", "படி · ஆராய் · சிந்தி", "पढ़ें · खोजें · चिंतन करें")}
            </p>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-24">

        {/* ════════════ TILES VIEW ════════════════════════════════════════════ */}
        {view === null && (
          <div className="px-4 pt-5 pb-8 flex flex-col gap-6">

            {/* ── Scriptures ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
                📖 {t("Scriptures", "வேதங்கள்", "शास्त्र")}
              </p>
              <div className="flex gap-3">
                {TILES.slice(0, 2).map((tile) => (
                  <button
                    key={tile.id as string}
                    onClick={() => { setView(tile.id); contentRef.current?.scrollTo({ top: 0 }); }}
                    className="flex-1 rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all active:scale-[0.97]"
                    style={{ background: tile.bg, border: `1.5px solid ${P.cardBorder}` }}
                  >
                    <span style={{ fontSize: 34 }}>{tile.icon}</span>
                    <p className="font-bold text-sm leading-tight" style={{ color: P.primary }}>
                      {isTamil ? tile.ta : isHindi ? tile.hi : tile.en}
                    </p>
                    <p className="text-xs opacity-50 leading-snug">
                      {isTamil ? tile.subTa : isHindi ? tile.subHi : tile.subEn}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Puranas ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
                🐒 {t("Ramayana", "ராமாயணம்", "रामायण")}
              </p>
              <button
                onClick={() => { setView("ramayana_sundara"); contentRef.current?.scrollTo({ top: 0 }); }}
                className="w-full rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
                style={{ background: TILES[2].bg, border: `1.5px solid ${P.cardBorder}` }}
              >
                <span style={{ fontSize: 34 }}>{TILES[2].icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: P.primary }}>
                    {isTamil ? TILES[2].ta : isHindi ? TILES[2].hi : TILES[2].en}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5 leading-snug">
                    {isTamil ? TILES[2].subTa : isHindi ? TILES[2].subHi : TILES[2].subEn}
                  </p>
                </div>
                <span style={{ color: P.primary, fontSize: 20, opacity: 0.4 }}>›</span>
              </button>
            </div>

            {/* ── Other Shlokas / Bhajans ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
                🪔 {t("Stotras & Bhajans", "ஸ்தோத்திரங்கள் & பஜன்கள்", "स्तोत्र & भजन")}
              </p>
              <button
                onClick={() => { setView("devotional"); contentRef.current?.scrollTo({ top: 0 }); }}
                className="w-full rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
                style={{ background: TILES[3].bg, border: `1.5px solid ${P.cardBorder}` }}
              >
                <span style={{ fontSize: 34 }}>{TILES[3].icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: P.primary }}>
                    {isTamil ? TILES[3].ta : isHindi ? TILES[3].hi : TILES[3].en}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5 leading-snug">
                    {isTamil ? TILES[3].subTa : isHindi ? TILES[3].subHi : TILES[3].subEn}
                  </p>
                </div>
                <span style={{ color: P.primary, fontSize: 20, opacity: 0.4 }}>›</span>
              </button>
            </div>

          </div>
        )}

        {/* ════════════ BG / HC VIEW ══════════════════════════════════════════ */}
        {(view === "bg" || view === "hanuman_chalisa") && (
          <div>
            {/* Back button inside a chapter */}
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
                    {view === "bg" ? bgChapterName(selectedChapter) : hcChapterName(selectedChapter)}
                  </p>
                </div>
              </div>
            )}

            {/* Chapter list */}
            {selectedChapter === null && (
              <div className="px-4 pt-4 pb-6 flex flex-col gap-2">
                {view === "bg" ? (
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

            {/* Verses for selected chapter */}
            {selectedChapter !== null && (
              <div className="flex flex-col gap-4 px-4 py-4">
                {loadingChapter && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full h-48 rounded-2xl animate-pulse" style={{ background: "#EEF2FF" }} />
                ))}
                {!loadingChapter && chapterVerses.map((v) => (
                  <VerseCard
                    key={`${v.chapter}:${v.verse}`}
                    verse={v} isTamil={isTamil} isHindi={isHindi}
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

        {/* ════════════ SUNDARA KANDA VIEW ════════════════════════════════════ */}
        {view === "ramayana_sundara" && (
          <div>
            {skLoading && (
              <div className="px-4 pt-6 flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-full h-14 rounded-2xl animate-pulse" style={{ background: "#D4DEFF" }} />
                ))}
              </div>
            )}
            {skError && !skLoading && (
              <div className="px-4 pt-8 text-center">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="font-semibold" style={{ color: P.primary }}>
                  {t("Could not load Sundara Kanda", "சுந்தர காண்டம் ஏற்றல் தோல்வி", "सुंदर काण्ड लोड नहीं हुआ")}
                </p>
                <p className="text-xs opacity-50 mt-1">{skError}</p>
              </div>
            )}
            {skData && !skLoading && (
              <>
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
                  <div className="px-4 pt-4 pb-6 flex flex-col gap-2">
                    {skData.chapters.map((ch) => (
                      <ChapterRow
                        key={ch.number} number={ch.number} name={ch.name} verseCount={ch.verseCount}
                        isTamil={isTamil} isHindi={isHindi}
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
                        verse={v} isTamil={isTamil} isHindi={isHindi}
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

        {/* ════════════ DEVOTIONAL VIEW ═══════════════════════════════════════ */}
        {view === "devotional" && (
          <div className="px-4 pt-5 pb-8 flex flex-col gap-6">

            {/* ── Deity Shlokas ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
                🕉️ {t("Deity Shlokas", "தெய்வ ஸ்லோகங்கள்", "देवता श्लोक")}
              </p>
              <div className="flex flex-col gap-2">
                {DEITY_COLLECTIONS.map((dc) => {
                  const isOpen = expandedDeity === dc.id;
                  return (
                    <div key={dc.id} className="rounded-2xl overflow-hidden"
                      style={{ border: `1.5px solid ${isOpen ? dc.borderColor : P.cardBorder}` }}>

                      {/* Deity header tile — tap to open/close */}
                      <button
                        onClick={() => setExpandedDeity(isOpen ? null : dc.id)}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                        style={{ background: isOpen ? dc.bgColor : P.card }}
                      >
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                          style={{ background: isOpen ? "white" : dc.bgColor }}>
                          {dc.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: P.primary }}>
                            {isTamil ? dc.deityTA : isHindi ? dc.deityHI : dc.deity}
                          </p>
                          <p className="text-xs opacity-45 mt-0.5">
                            {dc.shlokas.length} {t("shlokas", "ஸ்லோகங்கள்", "श्लोक")}
                          </p>
                        </div>
                        <span
                          className="text-lg font-bold transition-transform shrink-0"
                          style={{ color: P.primary, opacity: 0.4, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}
                        >›</span>
                      </button>

                      {/* Expanded shlokas */}
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${dc.borderColor}` }}>
                          {dc.shlokas.map((sh, idx) => (
                            <div key={sh.id}>
                              {idx > 0 && <div style={{ height: 1, background: dc.borderColor }} />}
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="font-semibold text-sm" style={{ color: P.primary }}>
                                    {isTamil && sh.nameTA ? sh.nameTA : isHindi && sh.nameHI ? sh.nameHI : sh.name}
                                  </p>
                                  <button
                                    onClick={() => { unlockAudioContext(); unlockChantingAudio(); playText(`deity-${sh.id}`, sh.sanskrit); }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-xs ml-2"
                                    style={{ background: playingId === `deity-${sh.id}` ? P.primary : "white", color: playingId === `deity-${sh.id}` ? "white" : P.primary, border: `1.5px solid ${dc.borderColor}` }}
                                  >{playingId === `deity-${sh.id}` ? "⏸" : "▶"}</button>
                                </div>
                                <p className="text-center leading-relaxed mb-2"
                                  style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: 18, color: P.text, lineHeight: 2, whiteSpace: "pre-line" }}>
                                  {sh.sanskrit}
                                </p>
                                {sh.transliteration && (
                                  <p className="text-center text-sm italic opacity-40 mb-3" style={{ fontFamily: "serif", whiteSpace: "pre-line" }}>
                                    {sh.transliteration}
                                  </p>
                                )}
                                <div className="rounded-xl p-3" style={{ background: dc.bgColor }}>
                                  <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-1">{t("Meaning", "பொருள்", "अर्थ")}</p>
                                  <p className="text-sm leading-relaxed" style={{ color: P.text }}>
                                    {isTamil && sh.meaningTA ? sh.meaningTA : isHindi && sh.meaningHI ? sh.meaningHI : sh.meaningEN}
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

            {/* ── Bhajans ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
                🎵 {t("Bhajans", "பஜன்கள்", "भजन")}
              </p>
              <div className="flex flex-col gap-2">
                {BHAJANS.map((bh) => {
                  const isOpen = expandedBhajan === bh.id;
                  return (
                    <div key={bh.id} className="rounded-2xl overflow-hidden"
                      style={{ border: `1.5px solid ${isOpen ? "#BBF7D0" : P.cardBorder}` }}>

                      {/* Bhajan header tile */}
                      <button
                        className="w-full p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                        style={{ background: isOpen ? "#F0FDF4" : P.card }}
                        onClick={() => setExpandedBhajan(isOpen ? null : bh.id)}
                      >
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                          style={{ background: isOpen ? "white" : "#F0FDF4", color: "#15803D" }}>🎵</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: P.text }}>
                            {isTamil ? bh.nameTA : isHindi ? bh.nameHI : bh.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs opacity-50">{isTamil ? bh.deityTA : bh.deity}</span>
                            <span className="text-xs opacity-30">·</span>
                            <span className="text-xs opacity-50">{bh.language}</span>
                          </div>
                        </div>
                        <span
                          className="text-lg font-bold transition-transform shrink-0"
                          style={{ color: "#15803D", opacity: 0.6, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}
                        >›</span>
                      </button>

                      {/* Expanded bhajan content */}
                      {isOpen && (
                        <div style={{ borderTop: "1px solid #BBF7D0" }}>
                          {bh.verses.map((v, vi) => (
                            <div key={vi}>
                              {vi > 0 && <div className="mx-4" style={{ height: 1, background: "#BBF7D0" }} />}
                              <div className="px-4 py-4">
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
                                  <p className="text-center text-sm italic opacity-40 mb-3"
                                    style={{ fontFamily: "serif", whiteSpace: "pre-line" }}>{v.transliteration}</p>
                                )}
                                <div className="rounded-xl p-3" style={{ background: "#F0FDF4" }}>
                                  <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-1">{t("Meaning", "பொருள்", "अர्थ")}</p>
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
