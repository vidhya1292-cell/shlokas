/**
 * Account tab — streak, per-scripture progress, language & voice settings.
 */
import { useState, useRef } from "react";
import {
  loadProgress,
  saveProgress,
  getMasteredCount,
  getScriptureProgress,
} from "../services/storage";
import { SCRIPTURES, AVAILABLE_SCRIPTURES } from "../data/scriptureRegistry";
import {
  VOICE_OPTIONS,
  DEFAULT_VOICE,
  textToSpeech,
  playBase64Audio,
  stopCurrentAudio,
  unlockAudioContext,
} from "../services/sarvamService";
import { unlockChantingAudio } from "../services/chantingService";
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

const PREVIEW_TEXTS = {
  en: "Namaste. I am your Shlokas teacher. Let us begin today's class with reverence.",
  ta: "நமஸ்காரம். நான் உங்கள் ஸ்லோக ஆசிரியர். இன்று நாம் பக்தியுடன் தொடங்குவோம்.",
  hi: "नमस्ते। मैं आपका श्लोक शिक्षक हूँ। आज का पाठ भक्ति के साथ शुरू करते हैं।",
};

export default function Account() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [nameInput, setNameInput] = useState(() => loadProgress().name ?? "");
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const previewAbortRef = useRef(false);

  const saveName = () => {
    const trimmed = nameInput.trim();
    const updated = { ...progress, name: trimmed || undefined };
    saveProgress(updated);
    setProgress(updated);
  };

  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  const currentVoice = progress.voice || DEFAULT_VOICE;
  const masteredBG = getMasteredCount(progress);

  const cycleLanguage = () => {
    const order: Array<"en-IN" | "ta-IN" | "hi-IN"> = ["en-IN", "ta-IN", "hi-IN"];
    const idx = order.indexOf(progress.language as "en-IN" | "ta-IN" | "hi-IN");
    const next = order[(idx + 1) % order.length];
    const updated = { ...progress, language: next };
    saveProgress(updated);
    setProgress(updated);
  };

  const cycleAgeGroup = () => {
    const next: "kids" | "adults" = progress.ageGroup === "kids" ? "adults" : "kids";
    const updated = { ...progress, ageGroup: next };
    saveProgress(updated);
    setProgress(updated);
  };

  const selectVoice = (voiceId: string) => {
    const updated = { ...progress, voice: voiceId };
    saveProgress(updated);
    setProgress(updated);
  };

  const previewVoice = async (voiceId: string) => {
    if (previewingVoice === voiceId) return;
    previewAbortRef.current = true;
    stopCurrentAudio();
    previewAbortRef.current = false;
    setPreviewingVoice(voiceId);
    try {
      unlockAudioContext();
      unlockChantingAudio();
      const lang = isTamil ? "ta-IN" : isHindi ? "hi-IN" : "en-IN";
      const text = isTamil ? PREVIEW_TEXTS.ta : isHindi ? PREVIEW_TEXTS.hi : PREVIEW_TEXTS.en;
      const audio = await textToSpeech(text, lang, 1.0, voiceId);
      if (!previewAbortRef.current) await playBase64Audio(audio);
    } catch {
    } finally {
      setPreviewingVoice(null);
    }
  };

  const langLabel = isTamil ? "தமிழ்" : isHindi ? "हिंदी" : "English";
  const ageLabel = progress.ageGroup === "kids"
    ? t("Kids", "குழந்தைகள்", "बच्चे")
    : t("Adults", "பெரியவர்கள்", "वयस्क");

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
          {t("My Sadhana", "என் சாதனை", "मेरी साधना")}
        </h1>
        <p className="text-xs opacity-50">
          {t("Progress · Settings · Voice", "முன்னேற்றம் · அமைப்புகள் · குரல்", "प्रगति · सेटिंग्स · आवाज़")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-5 flex flex-col gap-5">

        {/* ── Streak ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2D4FA3 100%)" }}
        >
          <div className="text-4xl">🔥</div>
          <div>
            <p className="text-3xl font-bold text-white leading-none">{progress.streakCount}</p>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("day streak", "நாள் தொடர்ச்சி", "दिन की स्ट्रीक")}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-white leading-none">{masteredBG}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("verses learned", "ஸ்லோகங்கள்", "श्लोक सीखे")}
            </p>
          </div>
        </div>

        {/* ── Per-scripture progress ─────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            {t("Scripture Progress", "ஸ்லோக முன்னேற்றம்", "शास्त्र प्रगति")}
          </p>
          <div className="flex flex-col gap-2">
            {AVAILABLE_SCRIPTURES.map((sid) => {
              const meta = SCRIPTURES[sid];
              const sp = getScriptureProgress(progress, sid);
              const learnedCount = Object.keys(sp.verseProgress).length;
              const pct = meta.totalVerses > 0 ? Math.round((learnedCount / meta.totalVerses) * 100) : 0;
              return (
                <div
                  key={sid}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: P.card, border: `1.5px solid ${P.cardBorder}` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: P.tint, fontSize: 20 }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: P.primary }}>
                      {isTamil ? meta.titleTA : isHindi ? meta.titleHI : meta.titleEN}
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: P.tint }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.max(2, pct)}%`, background: P.gold }}
                      />
                    </div>
                    <p className="text-xs opacity-40 mt-1">
                      {learnedCount} / {meta.totalVerses} {t("verses", "ஸ்லோகங்கள்", "श्लोक")}
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: P.gold }}>{pct}%</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Settings ─────────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            {t("Settings", "அமைப்புகள்", "सेटिंग्स")}
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1.5px solid ${P.cardBorder}` }}
          >
            {/* Name */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: `1px solid ${P.cardBorder}` }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {t("Your Name", "உங்கள் பெயர்", "आपका नाम")}
                </p>
                <p className="text-xs opacity-45 mt-0.5">
                  {t("Used in your greeting", "வாழ்த்தில் பயன்படும்", "अभिवादन में उपयोग होगा")}
                </p>
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                placeholder={t("e.g. Vidhya", "எ.கா. வித்யா", "जैसे विद्या")}
                className="rounded-xl px-3 py-1.5 text-sm text-right outline-none w-32"
                style={{
                  background: P.tint,
                  border: `1.5px solid ${P.cardBorder}`,
                  color: P.primary,
                }}
              />
            </div>

            {/* Language */}
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: `1px solid ${P.cardBorder}` }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {t("Language", "மொழி", "भाषा")}
                </p>
                <p className="text-xs opacity-45 mt-0.5">
                  {t("UI & narration language", "UI & விளக்க மொழி", "UI और वर्णन भाषा")}
                </p>
              </div>
              <button
                onClick={cycleLanguage}
                className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all active:scale-95"
                style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
              >
                {langLabel} ›
              </button>
            </div>

            {/* Age group */}
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {t("Learning mode", "கற்றல் முறை", "शिक्षा मोड")}
                </p>
                <p className="text-xs opacity-45 mt-0.5">
                  {t("Affects pace & storytelling style", "வேகம் & கதை பாணி", "गति और कहानी शैली")}
                </p>
              </div>
              <button
                onClick={cycleAgeGroup}
                className="rounded-xl px-3 py-1.5 text-sm font-bold transition-all active:scale-95"
                style={{ background: P.tint, color: P.primary, border: `1.5px solid ${P.cardBorder}` }}
              >
                {ageLabel} ›
              </button>
            </div>
          </div>
        </section>

        {/* ── Voice picker ──────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.gold }}>
            {t("Teacher Voice", "ஆசிரியர் குரல்", "शिक्षक की आवाज़")}
          </p>
          <div className="flex flex-col gap-2">
            {VOICE_OPTIONS.map((v) => {
              const isSelected = currentVoice === v.id;
              const isPreviewing = previewingVoice === v.id;
              return (
                <div
                  key={v.id}
                  className="rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all active:scale-[0.98]"
                  style={{
                    background: isSelected ? P.primary : P.card,
                    border: `1.5px solid ${isSelected ? P.primary : P.cardBorder}`,
                    cursor: "pointer",
                  }}
                  onClick={() => selectVoice(v.id)}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
                    style={{ background: isSelected ? "rgba(255,255,255,0.15)" : P.tint }}
                  >
                    {v.gender === "female" ? "👩" : "👨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: isSelected ? "white" : P.text }}>
                      {v.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.6)" : P.textMid, opacity: isSelected ? 1 : 0.7 }}>
                      {v.tagline}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-white text-lg shrink-0">✓</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); previewVoice(v.id); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs transition-all active:scale-90"
                    style={{
                      background: isPreviewing ? P.gold : isSelected ? "rgba(255,255,255,0.15)" : P.tint,
                      color: isSelected ? "white" : P.primary,
                      border: `1px solid ${isSelected ? "transparent" : P.cardBorder}`,
                    }}
                  >
                    {isPreviewing ? "⏸" : "▶"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
