/**
 * Home tab — daily dashboard.
 * Krishna image + daily share, plus "continue where you left off"
 * cards for Learn, Read, and Listen.
 */
import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { loadProgress, saveProgress, getMasteredCount, getDueVerses, getScriptureProgress } from "../services/storage";
import { SCRIPTURES } from "../data/scriptureRegistry";
import DailyCard from "../components/DailyCard";
import { getMantraAudioUrl } from "../services/jiosaavnService";

const QUICK_MANTRAS = [
  { id: "om",    symbol: "ॐ",   en: "Om",           ta: "ஓம்",          hi: "ॐ"         },
  { id: "ram",   symbol: "हरे", en: "Hare Krishna", ta: "ஹரே கிருஷ்ண", hi: "हरे कृष्ण" },
  { id: "shiva", symbol: "शिव", en: "Om Namah Shivaya", ta: "நம சிவாய",  hi: "नमः शिवाय" },
];

function getGreeting(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

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

export default function Home() {
  const [, navigate] = useLocation();
  const [activeJapa, setActiveJapa] = useState<string | null>(null);
  const [japaCount, setJapaCount] = useState(0);
  const japaAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopJapa = useCallback(() => {
    if (japaAudioRef.current) {
      japaAudioRef.current.pause();
      japaAudioRef.current.src = "";
      japaAudioRef.current = null;
    }
    setActiveJapa(null);
    setJapaCount(0);
  }, []);

  const handleQuickJapa = useCallback(async (mantraId: string) => {
    if (activeJapa === mantraId) { stopJapa(); return; }
    stopJapa();
    setActiveJapa(mantraId);
    setJapaCount(0);
    const url = await getMantraAudioUrl(mantraId);
    if (!url) { setActiveJapa(null); return; }
    const audio = new Audio(url);
    japaAudioRef.current = audio;
    let count = 0;
    audio.onended = () => {
      count++;
      setJapaCount(count);
      if (count >= 3) { setActiveJapa(null); japaAudioRef.current = null; }
      else { audio.currentTime = 0; audio.play().catch(() => setActiveJapa(null)); }
    };
    audio.onerror = () => setActiveJapa(null);
    audio.play().catch(() => setActiveJapa(null));
  }, [activeJapa, stopJapa]);

  const progress = loadProgress();
  const [lang, setLang] = useState<"en-IN" | "ta-IN" | "hi-IN">(progress.language ?? "en-IN");
  const isTamil = lang === "ta-IN";
  const isHindi = lang === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  const cycleLanguage = () => {
    const order: Array<"en-IN" | "ta-IN" | "hi-IN"> = ["en-IN", "ta-IN", "hi-IN"];
    const next = order[(order.indexOf(lang) + 1) % order.length];
    saveProgress({ ...loadProgress(), language: next });
    setLang(next);
  };
  const langShort = isTamil ? "த" : isHindi ? "हि" : "EN";

  const activeScripture = progress.currentScripture ?? "bg";
  const activeMeta = SCRIPTURES[activeScripture] ?? SCRIPTURES["bg"];
  const sp = getScriptureProgress(progress, activeScripture);
  const masteredCount = getMasteredCount(progress);
  const dueCount = getDueVerses(progress).length;
  const hasStartedLearning = Object.keys(sp.verseProgress).length > 0;
  const isNewUser = !progress.hasCompletedOnboarding || (!hasStartedLearning && progress.streakCount === 0);

  const currentChapter = sp.currentChapter ?? 1;

  const name = progress.name?.trim() || "";
  const ji = {
    en: name ? `, ${name} ji` : "",
    ta: name ? `, ${name} ஜி` : "",
    hi: name ? `, ${name} जी` : "",
  };

  const tod = getGreeting();
  const greeting = {
    en: tod === "morning" ? "Good morning 🌅" : tod === "afternoon" ? "Good afternoon ☀️" : "Good evening 🌙",
    ta: tod === "morning" ? "காலை வணக்கம் 🌅" : tod === "afternoon" ? "மதிய வணக்கம் ☀️" : "மாலை வணக்கம் 🌙",
    hi: tod === "morning" ? "शुभ प्रभात 🌅" : tod === "afternoon" ? "शुभ दोपहर ☀️" : "शुभ संध्या 🌙",
  };
  const welcome = {
    en: isNewUser
      ? "Welcome to your daily sadhana. Where would you like to begin?"
      : `Namaste${ji.en} 🙏 ${progress.streakCount > 0 ? `${progress.streakCount} day streak 🔥` : ""}`,
    ta: isNewUser
      ? "உங்கள் தினசரி ஸாதனைக்கு வரவேற்கிறோம். எங்கிருந்து தொடங்க விரும்புகிறீர்கள்?"
      : `நமஸ்காரம்${ji.ta} 🙏 ${progress.streakCount > 0 ? `${progress.streakCount} நாள் தொடர்ச்சி 🔥` : ""}`,
    hi: isNewUser
      ? "आपकी दैनिक साधना में आपका स्वागत है। कहाँ से शुरू करना चाहेंगे?"
      : `नमस्ते${ji.hi} 🙏 ${progress.streakCount > 0 ? `${progress.streakCount} दिन की स्ट्रीक 🔥` : ""}`,
  };

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col"
      style={{ background: "linear-gradient(to bottom, transparent 0px, transparent 60px, #FDF8F0 260px)", color: P.text }}
    >
      {/* App bar */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={cycleLanguage}
            className="h-9 px-3 rounded-full flex items-center justify-center transition-all active:scale-95 font-bold"
            style={{ background: P.tint, border: `1.5px solid ${P.cardBorder}`, fontSize: 13, color: P.primary, minWidth: 36 }}
            aria-label="Change language"
          >
            {langShort}
          </button>
          <button
            onClick={() => navigate("/account")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: P.tint, border: `1.5px solid ${P.cardBorder}`, fontSize: 18 }}
            aria-label="My account"
          >
            👤
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 pb-24">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: P.primary }}>
            {isTamil ? greeting.ta : isHindi ? greeting.hi : greeting.en}
          </h1>
          <p className="text-sm opacity-65 mt-1 leading-snug">
            {isTamil ? welcome.ta : isHindi ? welcome.hi : welcome.en}
          </p>
        </div>

        {/* Daily card — Krishna image + panchang + WhatsApp share */}
        <DailyCard language={progress.language ?? "en-IN"} />

        {/* ── Quick Japa ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            🕉️ {t("Japa", "ஜபம்", "जप")}
          </p>
          <div className="flex gap-2">
            {QUICK_MANTRAS.map((m) => {
              const isActive = activeJapa === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleQuickJapa(m.id)}
                  className="flex-1 rounded-2xl py-4 flex flex-col items-center gap-1 transition-all active:scale-[0.96]"
                  style={{
                    background: isActive ? P.primary : P.card,
                    border: `1.5px solid ${isActive ? P.primary : P.cardBorder}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Noto Serif Devanagari', serif",
                      fontSize: 28,
                      lineHeight: 1.1,
                      color: isActive ? P.gold : P.primary,
                    }}
                  >
                    {m.symbol}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? "rgba(255,255,255,0.75)" : P.textMid }}>
                    {isTamil ? m.ta : isHindi ? m.hi : m.en}
                  </span>
                  {isActive && japaCount > 0 && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                      {japaCount}/3
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-center opacity-35 mt-2">
            {t("Tap · chants × 3", "தட்டவும் · 3 முறை ஜபம்", "टैप करें · × 3 जप")}
          </p>
        </div>

        {/* Continue / Start section */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            {isNewUser
              ? t("Begin your sadhana", "உங்கள் ஸாதனை தொடங்குங்கள்", "अपनी साधना शुरू करें")
              : t("Continue where you left off", "தொடர்ந்து படிக்க", "जहाँ छोड़ा वहाँ से शुरू करें")}
          </p>
          <div className="flex flex-col gap-3">

            {/* ── Continue Learning ── */}
            <button
              onClick={() => navigate(hasStartedLearning ? "/session" : "/learn")}
              className="w-full rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: P.card, border: `1.5px solid ${P.cardBorder}` }}
            >
              <div className="px-4 py-3.5 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                  style={{ background: P.tint }}
                >
                  {activeMeta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: P.primary }}>
                      {t("Learn", "கற்க", "सीखें")} · {isTamil ? activeMeta.titleTA : isHindi ? activeMeta.titleHI : activeMeta.titleEN}
                    </p>
                    {dueCount > 0 && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "#FEE2E2", color: "#DC2626" }}
                      >
                        {dueCount} {t("due", "நிலுவை", "बाकी")}
                      </span>
                    )}
                  </div>
                  {hasStartedLearning ? (
                    <p className="text-xs opacity-55">
                      {t(
                        `Ch. ${currentChapter} · ${masteredCount} verses mastered`,
                        `அத்தியாயம் ${currentChapter} · ${masteredCount} மனப்பாடம்`,
                        `अध्याय ${currentChapter} · ${masteredCount} याद किया`,
                      )}
                    </p>
                  ) : (
                    <p className="text-xs opacity-55">
                      {t("Start your learning journey →", "கற்கத் தொடங்கு →", "सीखना शुरू करें →")}
                    </p>
                  )}
                </div>
                <span style={{ color: P.primary, fontSize: 20, opacity: 0.5 }}>›</span>
              </div>
              {hasStartedLearning && (
                <div className="px-4 pb-3.5">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: P.tint }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, Math.round((masteredCount / (activeMeta.totalVerses || 1)) * 100))}%`,
                        background: P.gold,
                      }}
                    />
                  </div>
                </div>
              )}
            </button>

            {/* ── Continue Reading ── */}
            <button
              onClick={() => navigate("/read")}
              className="w-full rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: P.card, border: `1.5px solid ${P.cardBorder}` }}
            >
              <div className="px-4 py-3.5 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                  style={{ background: "#EEF2FF" }}
                >
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: P.primary }}>
                    {t("Read", "படி", "पढ़ें")}
                  </p>
                  <p className="text-xs opacity-55 mt-0.5">
                    {t(
                      "Scriptures · Sundara Kanda · Devotional",
                      "வேதங்கள் · சுந்தர காண்டம் · பக்தி",
                      "शास्त्र · सुंदर काण्ड · भक्ति",
                    )}
                  </p>
                </div>
                <span style={{ color: P.primary, fontSize: 20, opacity: 0.5 }}>›</span>
              </div>
            </button>

            {/* ── Continue Listening ── */}
            <button
              onClick={() => navigate("/listen")}
              className="w-full rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: P.card, border: `1.5px solid ${P.cardBorder}` }}
            >
              <div className="px-4 py-3.5 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                  style={{ background: "#F0FDF4" }}
                >
                  🎧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: P.primary }}>
                    {t("Listen", "கேள்", "सुनें")}
                  </p>
                  <p className="text-xs opacity-55 mt-0.5">
                    {t(
                      "Mantra chanting · Scripture audio",
                      "மந்திர ஜபம் · வேத ஆடியோ",
                      "मंत्र जप · शास्त्र ऑडियो",
                    )}
                  </p>
                </div>
                <span style={{ color: P.primary, fontSize: 20, opacity: 0.5 }}>›</span>
              </div>
            </button>

          </div>
        </div>

        {/* Streak nudge (only if active) */}
        {progress.streakCount > 0 && (
          <div
            className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2D4FA3 100%)" }}
          >
            <span style={{ fontSize: 28 }}>🔥</span>
            <div>
              <p className="font-bold text-white text-sm">
                {progress.streakCount} {t("day streak", "நாள் தொடர்ச்சி", "दिन की स्ट्रीक")}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("Keep your practice alive", "உங்கள் ஸாதனையை தொடரவும்", "अपनी साधना जारी रखें")}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
