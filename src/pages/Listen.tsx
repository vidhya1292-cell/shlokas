/**
 * Listen tab — pure audio mode.
 * Mantra chanting player + scripture audio cards.
 * Read tab handles text. This tab is eyes-closed, ears-open.
 */
import { useState, useRef, useCallback } from "react";
import { loadProgress } from "../services/storage";
import { unlockAudioContext } from "../services/sarvamService";
import { unlockChantingAudio } from "../services/chantingService";
import { getMantraAudioUrl } from "../services/jiosaavnService";

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

const MANTRAS = [
  {
    id: "om",
    labelEn: "Om",
    labelTa: "ஓம்",
    symbol: "ॐ",
    tagEn: "Primordial sound · Meditation",
    tagTa: "ஆதி ஓசை · தியானம்",
    tagHi: "आदि ध्वनि · ध्यान",
  },
  {
    id: "ram",
    labelEn: "Hare Krishna Mahamantra",
    labelTa: "ஹரே கிருஷ்ண மஹாமந்திரம்",
    labelHi: "हरे कृष्ण महामंत्र",
    symbol: "हरे",
    tagEn: "ISKCON · Srila Prabhupada",
    tagTa: "ISKCON · பிரபுபாத சுவாமி",
    tagHi: "ISKCON · श्रील प्रभुपाद",
  },
  {
    id: "shiva",
    labelEn: "Om Namah Shivaya",
    labelTa: "ஓம் நமச்சிவாய",
    labelHi: "ॐ नमः शिवाय",
    symbol: "शिव",
    tagEn: "Panchakshara · Shiva mantra",
    tagTa: "பஞ்சாக்ஷர · சிவ மந்திரம்",
    tagHi: "पंचाक्षर · शिव मंत्र",
  },
];

const SCRIPTURE_AUDIO = [
  { icon: "📖", labelEn: "Bhagavad Gita",     labelTA: "பகவத் கீதை",     labelHI: "भगवद्गीता",   sub: "18 chapters · Sanskrit" },
  { icon: "🙏", labelEn: "Hanuman Chalisa",   labelTA: "ஹனுமான் சாலீசா", labelHI: "हनुमान चालीसा",sub: "43 verses · Awadhi" },
  { icon: "🪷", labelEn: "Narayaneeyam",      labelTA: "நாராயணீயம்",     labelHI: "नारायणीयम्",   sub: "100 dasakams · Sanskrit" },
  { icon: "🐒", labelEn: "Sundara Kanda",     labelTA: "சுந்தர காண்டம்", labelHI: "सुंदर काण्ड", sub: "68 sargas · Sanskrit" },
];

export default function Listen() {
  const progress = loadProgress();
  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  // Chanting player state
  const [chantIdx, setChantIdx] = useState(0);
  const [mantraPlaying, setMantraPlaying] = useState(false);
  const [mantraLoading, setMantraLoading] = useState(false);
  const [mantraTarget, setMantraTarget] = useState(0);
  const [mantraPlayCount, setMantraPlayCount] = useState(0);
  const mantraAudioRef = useRef<HTMLAudioElement | null>(null);
  const mantraTargetRef = useRef(0);

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
  const selectTarget = (n: number) => { setMantraTarget(n); mantraTargetRef.current = n; };

  const mantra = MANTRAS[chantIdx];
  const mantraLabel = isTamil ? (mantra as any).labelTa : isHindi ? (mantra as any).labelHi ?? mantra.labelEn : mantra.labelEn;
  const mantraTag = isTamil ? mantra.tagTa : isHindi ? mantra.tagHi : mantra.tagEn;

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: "linear-gradient(to bottom, transparent 0px, transparent 60px, #FDF8F0 260px)", color: P.text }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-3"
        style={{ background: "rgba(253,248,240,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${P.cardBorder}` }}
      >
        <h1 className="text-lg font-bold" style={{ color: P.primary }}>
          {t("Listen", "கேள்", "सुनें")}
        </h1>
        <p className="text-xs opacity-50">
          {t("Close your eyes · Just receive", "கண்களை மூடு · ஏற்றுக்கொள்", "आंखें बंद करें · बस सुनें")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-5 flex flex-col gap-6">

        {/* ── Mantra Chanting Player ── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            🕉️ {t("Mantra Chanting", "மந்திர ஜபம்", "मंत्र जप")}
          </p>

          <div className="rounded-2xl p-5" style={{ background: P.card, border: `1.5px solid ${P.cardBorder}` }}>
            {/* Mantra display */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={prevChant}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-xl font-bold"
                style={{ background: P.tint, color: P.primary, border: `1px solid ${P.cardBorder}` }}
                aria-label="Previous mantra"
              >‹</button>

              <div className="flex-1 text-center">
                <div
                  style={{ fontFamily: "'Noto Serif Devanagari', serif", fontSize: 36, color: P.primary, lineHeight: 1.2 }}
                >
                  {mantra.symbol}
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: P.text }}>{mantraLabel}</div>
                <div className="text-xs opacity-45 mt-0.5">{mantraTag}</div>
              </div>

              <button
                onClick={nextChant}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 text-xl font-bold"
                style={{ background: P.tint, color: P.primary, border: `1px solid ${P.cardBorder}` }}
                aria-label="Next mantra"
              >›</button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mb-5">
              {MANTRAS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{ width: i === chantIdx ? 20 : 6, height: 6, background: i === chantIdx ? P.gold : P.cardBorder }}
                />
              ))}
            </div>

            {/* Play button */}
            <button
              onClick={() => { unlockAudioContext(); unlockChantingAudio(); playChant(); }}
              disabled={mantraLoading}
              className="w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
              style={{
                background: mantraPlaying ? "#15803D" : P.primary,
                color: "white",
                boxShadow: `0 4px 16px ${mantraPlaying ? "rgba(21,128,61,0.35)" : "rgba(30,58,138,0.30)"}`,
              }}
            >
              <span style={{ fontSize: 20 }}>{mantraLoading ? "⏳" : mantraPlaying ? "⏸" : "▶"}</span>
              <span>
                {mantraLoading
                  ? t("Loading…", "ஏற்றுகிறோம்…", "लोड हो रहा है…")
                  : mantraPlaying
                  ? t("Stop Chanting", "ஜபம் நிறுத்து", "जप रोकें")
                  : t("Start Chanting", "ஜபம் தொடங்கு", "जप शुरू करें")}
              </span>
              {mantraPlaying && mantraTarget > 0 && (
                <span className="text-xs opacity-75">({mantraPlayCount}/{mantraTarget})</span>
              )}
            </button>

            {/* Repeat count */}
            <div className="mt-4">
              <p className="text-xs text-center opacity-45 mb-2">
                {t("Repeat count", "திரும்ப எண்", "दोहराने की संख्या")}
              </p>
              <div className="flex justify-center gap-2">
                {([26, 51, 108, 0] as const).map((n) => {
                  const isActiveBtn = mantraTarget === n;
                  return (
                    <button
                      key={n}
                      onClick={() => selectTarget(n)}
                      className="rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95"
                      style={{
                        background: isActiveBtn ? P.gold : P.tint,
                        color: isActiveBtn ? "white" : P.textMid,
                        border: `1.5px solid ${isActiveBtn ? P.gold : P.cardBorder}`,
                      }}
                    >
                      {n === 0 ? "∞" : `×${n}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Scripture Audio ── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            {t("Scripture Audio", "வேத ஆடியோ", "शास्त्र ऑडियो")}
          </p>
          <div className="flex flex-col gap-3">
            {SCRIPTURE_AUDIO.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl px-4 py-3.5 flex items-center gap-4"
                style={{ background: P.card, border: `1.5px solid ${P.cardBorder}`, opacity: 0.7 }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: P.tint, fontSize: 22 }}
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: P.primary }}>
                    {isTamil ? s.labelTA : isHindi ? s.labelHI : s.labelEn}
                  </p>
                  <p className="text-xs opacity-45 mt-0.5">{s.sub}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: P.tint, color: P.gold }}
                >
                  {t("Soon", "விரைவில்", "जल्द")}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center opacity-40 mt-3">
            {t(
              "Full chapter playback coming — perfect for your daily 1-hour sadhana",
              "தினசரி சாதனைக்கான முழு அத்தியாய ஆடியோ விரைவில்",
              "दैनिक साधना के लिए पूर्ण अध्याय ऑडियो जल्द आ रहा है",
            )}
          </p>
        </section>

      </div>
    </div>
  );
}
