import { useState } from "react";
import { SHARE_QUOTES, DAILY_DEITIES } from "../data/shareData";
import { getTithi, getTamilMonth, getTodayFestival, getDayIndex } from "../utils/panchang";

// Rotating AI-generated Baby Krishna images (Pollinations.ai / local)
const KRISHNA_IMAGES = [
  "/krishna/day0_sun.jpg",  // Sunday  — Yashoda adorning Krishna
  "/krishna/day1_mon.jpg",  // Monday  — Baby Krishna crawling
  "/krishna/day2_tue.jpg",  // Tuesday — Butter thief
  "/krishna/day3_wed.jpg",  // Wednesday — Yashoda & Krishna
  "/krishna/day4_thu.jpg",  // Thursday — Baby Krishna with flute
  "/krishna/day5_fri.jpg",  // Friday  — Dancing Krishna
  "/krishna/day6_sat.jpg",  // Saturday — Krishna on lotus
];

interface Props {
  language: string;
}

// ── Canvas card generator (no external deps, no CORS issues) ─────────────────
// Generates a standalone PNG "Good Morning" style card with gradient + text.
// We deliberately don't embed the photo in the canvas to avoid CORS taint issues.
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  maxWidth: number,
  lineHeight: number,
  startY: number,
): number {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trimEnd(), x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trimEnd(), x, y);
  return y + lineHeight;
}

async function buildShareCard(params: {
  quote: (typeof SHARE_QUOTES)[0];
  deity: (typeof DAILY_DEITIES)[0];
  tithi: ReturnType<typeof getTithi>;
  month: ReturnType<typeof getTamilMonth>;
  festival: ReturnType<typeof getTodayFestival>;
  language: string;
  krishnaImg: string;
}): Promise<Blob | null> {
  const { quote, deity, tithi, month, festival, language, krishnaImg } = params;
  const isTamil = language === "ta-IN";
  const isHindi = language === "hi-IN";

  const W = 540, H = 760;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await document.fonts.ready;

  // ── Load image (same-origin) ──
  const loadImage = (src: string): Promise<HTMLImageElement | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  // ── Draw god image full-bleed (cover crop entire canvas) ──
  const godImg = await loadImage(krishnaImg);
  if (godImg) {
    const srcAspect = godImg.naturalWidth / godImg.naturalHeight;
    const dstAspect = W / H;
    let sx = 0, sy = 0, sw = godImg.naturalWidth, sh = godImg.naturalHeight;
    if (srcAspect > dstAspect) {
      sw = sh * dstAspect;
      sx = (godImg.naturalWidth - sw) / 2;
    } else {
      sh = sw / dstAspect;
    }
    ctx.drawImage(godImg, sx, sy, sw, sh, 0, 0, W, H);
  } else {
    // Fallback: deep blue gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#1E3A8A");
    bgGrad.addColorStop(1, "#2D52C4");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Top scrim (for OM + app name) ──
  const topScrim = ctx.createLinearGradient(0, 0, 0, 160);
  topScrim.addColorStop(0, "rgba(5,10,30,0.72)");
  topScrim.addColorStop(1, "rgba(5,10,30,0)");
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, W, 160);

  // ── Bottom scrim (for panchang + quote) ──
  const bottomScrim = ctx.createLinearGradient(0, H - 280, 0, H);
  bottomScrim.addColorStop(0, "rgba(5,10,30,0)");
  bottomScrim.addColorStop(0.25, "rgba(5,10,30,0.65)");
  bottomScrim.addColorStop(1, "rgba(5,10,30,0.96)");
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, H - 280, W, 280);

  // ── TOP: OM + App name ──
  ctx.textAlign = "center";
  ctx.font = "bold 56px 'Noto Serif Devanagari', serif";
  ctx.fillStyle = "#C4973A";
  ctx.fillText("ॐ", W / 2, 72);

  ctx.font = "bold 17px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText("Shlokas.in", W / 2, 104);

  // ── BOTTOM: Panchang ──
  const monthLabel = isTamil ? month.nameTA : isHindi ? month.nameHI : month.nameEN;
  const tithiLabel = isTamil ? tithi.nameTA : isHindi ? tithi.nameHI : tithi.nameEN;
  const deityName  = isTamil ? deity.nameTA : isHindi ? deity.nameHI : deity.name;
  const dayLabel   = isTamil ? deity.dayTA  : isHindi ? deity.dayHI  : deity.dayEN;

  // Panchang line
  ctx.textAlign = "left";
  ctx.font = "bold 22px 'Noto Serif Devanagari', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "#FFD87A";
  ctx.fillText(`${monthLabel}  ·  ${tithiLabel}`, 32, H - 188);

  // Deity line
  ctx.font = "15px 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText(`${deity.symbol} ${deityName}  ·  ${dayLabel}`, 32, H - 162);

  // Festival (right-aligned)
  if (festival) {
    const festName = isTamil ? festival.nameTA : isHindi ? festival.nameHI : festival.nameEN;
    ctx.textAlign = "right";
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#FFD87A";
    ctx.fillText(`🎉 ${festName}`, W - 32, H - 162);
  }

  // Gold thin divider
  ctx.strokeStyle = "rgba(196,151,58,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, H - 144); ctx.lineTo(W - 32, H - 144);
  ctx.stroke();

  // ── Quote (italic, white) — max 3 lines ──
  const quoteText = isTamil ? quote.ta : isHindi ? quote.hi : quote.en;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "italic 17px 'Noto Serif Devanagari', 'Noto Sans Tamil', Georgia, serif";
  ctx.textAlign = "center";
  wrapText(ctx, `"${quoteText}"`, W / 2, W - 80, 28, H - 124);

  // Source
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = "#FFD87A";
  ctx.fillText(`— ${quote.sourceShort}`, W / 2, H - 26);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.92));
}

// ── Build WhatsApp text share ─────────────────────────────────────────────────
function buildShareText(params: {
  quote: (typeof SHARE_QUOTES)[0];
  deity: (typeof DAILY_DEITIES)[0];
  tithi: ReturnType<typeof getTithi>;
  month: ReturnType<typeof getTamilMonth>;
  festival: ReturnType<typeof getTodayFestival>;
  language: string;
}): string {
  const { quote, deity, tithi, month, festival, language } = params;
  const isTamil = language === "ta-IN";
  const isHindi = language === "hi-IN";
  const monthLabel = isTamil ? month.nameTA : isHindi ? month.nameHI : month.nameEN;
  const tithiLabel = isTamil ? tithi.nameTA : isHindi ? tithi.nameHI : tithi.nameEN;
  const deityName  = isTamil ? deity.nameTA : isHindi ? deity.nameHI : deity.name;
  const dayLabel   = isTamil ? deity.dayTA : isHindi ? deity.dayHI : deity.dayEN;
  const quoteText  = isTamil ? quote.ta : isHindi ? quote.hi : quote.en;
  const pakshaLabel = isTamil
    ? tithi.paksha === "shukla" ? "சுக்ல பக்ஷம்" : "கிருஷ்ண பக்ஷம்"
    : isHindi
    ? tithi.paksha === "shukla" ? "शुक्ल पक्ष" : "कृष्ण पक्ष"
    : tithi.paksha === "shukla" ? "Shukla Paksha" : "Krishna Paksha";
  const festivalLine = festival
    ? `\n🎉 *${isTamil ? festival.nameTA : isHindi ? festival.nameHI : festival.nameEN}*`
    : "";
  const footer = isTamil
    ? "💫 *Shlokas.in* — தமிழில் கற்றுக்கொள்ளுங்கள்"
    : isHindi
    ? "💫 *Shlokas.in* — हिंदी में सीखें"
    : "💫 *Shlokas.in* — Learn & Grow";
  return (
    `🕉️🌸 *${monthLabel} | ${tithiLabel}* (${pakshaLabel})` +
    `\n━━━━━━━━━━━━━━━━━━━` +
    `\n${deity.symbol} *${deityName}* — ${dayLabel}` +
    festivalLine +
    `\n\n✨ _"${quoteText}"_` +
    `\n\n🕉️ ${quote.original.split("\n")[0]}` +
    `\n📖 ${quote.sourceShort}` +
    `\n━━━━━━━━━━━━━━━━━━━` +
    `\n${footer}`
  );
}

export default function DailyCard({ language }: Props) {
  const [sharing, setSharing] = useState(false);
  const [done, setDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const isTamil = language === "ta-IN";
  const isHindi = language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => (isTamil ? ta : isHindi ? hi : en);

  const now      = new Date();
  const dayIdx   = getDayIndex(now);
  const weekday  = now.getDay();
  const quote    = SHARE_QUOTES[dayIdx % SHARE_QUOTES.length];
  const deity    = DAILY_DEITIES[weekday];
  const tithi    = getTithi(now);
  const month    = getTamilMonth(now);
  const festival = getTodayFestival(now);

  const krishnaImg = KRISHNA_IMAGES[dayIdx % KRISHNA_IMAGES.length];
  const monthLabel = isTamil ? month.nameTA : isHindi ? month.nameHI : month.nameEN;
  const tithiLabel = isTamil ? tithi.nameTA : isHindi ? tithi.nameHI : tithi.nameEN;
  const deityName  = isTamil ? deity.nameTA : isHindi ? deity.nameHI : deity.name;
  const daySignif  = isTamil ? deity.daySignificanceTA : isHindi ? deity.daySignificanceHI : deity.daySignificanceEN;
  const quoteText  = isTamil ? quote.ta : isHindi ? quote.hi : quote.en;
  const festName   = festival ? (isTamil ? festival.nameTA : isHindi ? festival.nameHI : festival.nameEN) : null;

  const handleShare = async () => {
    setSharing(true);
    const shareParams = { quote, deity, tithi, month, festival, language, krishnaImg };
    const text = buildShareText({ quote, deity, tithi, month, festival, language });

    try {
      const blob = await buildShareCard(shareParams);

      // ── Path 1: native file share (iOS Safari, Android Chrome) ──
      if (blob && typeof navigator.share === "function") {
        const file = new File([blob], "shlokas-daily.png", { type: "image/png" });
        try {
          await navigator.share({ files: [file] });
          // User completed the native share sheet
          setDone(true);
          setTimeout(() => setDone(false), 3000);
          return;
        } catch (e: any) {
          // AbortError = user cancelled → don't fall through to WhatsApp
          if (e?.name === "AbortError") return;
          // Other error (unsupported) → fall through
        }
      }

      // ── Path 2: download image + open WhatsApp text ──
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shlokas-daily.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");

    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } finally {
      setSharing(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1.5px solid #DBEAFE",
        boxShadow: "0 2px 12px rgba(30,58,138,0.10)",
      }}
    >
      {/* ── Krishna photo header ────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: 260, overflow: "hidden", background: "#1E3A8A" }}>
        {!imgError && (
          <img
            src={krishnaImg}
            alt="Krishna"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        )}
        {imgError && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(160deg, #1E3A8A 0%, #3B5FC4 100%)",
              fontFamily: "'Noto Serif Devanagari', serif",
              fontSize: 64,
              color: "#C4973A",
            }}
          >
            ॐ
          </div>
        )}

        {/* Gradient overlay — bottom fade for text readability */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(10,20,60,0.88) 0%, rgba(10,20,60,0.30) 55%, transparent 85%)",
          }}
        />

        {/* Panchang overlay on photo */}
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "12px 16px",
          }}
        >
          <div className="flex items-end justify-between">
            <div>
              <div
                className="font-bold"
                style={{
                  color: "#FFD87A",
                  fontSize: 15,
                  fontFamily: "'Noto Sans Tamil', 'Noto Serif Devanagari', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {monthLabel} · {tithiLabel}
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
                {deity.symbol} {deityName} · {daySignif}
              </div>
            </div>
            {festName && (
              <div
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: "rgba(196,151,58,0.85)", color: "white", maxWidth: 120, textAlign: "right" }}
              >
                🎉 {festName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quote body ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 18px 0" }}>
        {/* Section label */}
        <div className="flex items-center gap-1.5 mb-3">
          <span style={{ fontSize: 13 }}>✨</span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#C4973A" }}>
            {t("Today's Divine Message", "இன்றைய தெய்வீக செய்தி", "आज का दिव्य संदेश")}
          </span>
        </div>

        <p
          style={{
            fontSize: 14,
            fontStyle: "italic",
            color: "#1E2D5A",
            lineHeight: 1.7,
            fontFamily: "'Noto Serif Devanagari', 'Noto Sans Tamil', Georgia, serif",
            marginBottom: 10,
          }}
        >
          "{quoteText}"
        </p>

        {/* Original text (Sanskrit / Tamil) — show full couplet */}
        <p
          style={{
            fontFamily: quote.originalLang === "ta"
              ? "'Noto Sans Tamil', sans-serif"
              : "'Noto Serif Devanagari', serif",
            fontSize: 12,
            color: "#4B6CB7",
            lineHeight: 1.7,
            marginBottom: 3,
            whiteSpace: "pre-line",
          }}
        >
          {quote.original}
        </p>
        <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>
          — {quote.sourceShort}
        </p>
      </div>

      {/* ── Share tile (accordion) ───────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #DBEAFE" }}>
        {/* Header — always visible, tap to toggle */}
        <button
          onClick={() => setShareOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 transition-all active:opacity-75"
          style={{ background: shareOpen ? "#F0FDF4" : "white" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>📲</span>
            <span className="text-sm font-semibold" style={{ color: "#16A34A" }}>
              {t("Share on WhatsApp", "WhatsApp-ல் பகிர்", "WhatsApp पर शेयर करें")}
            </span>
          </div>
          <span
            style={{
              color: "#16A34A",
              fontSize: 18,
              fontWeight: 700,
              transform: shareOpen ? "rotate(90deg)" : "rotate(0deg)",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
          >›</span>
        </button>

        {/* Expanded content */}
        {shareOpen && (
          <div style={{ padding: "0 14px 14px", background: "#F0FDF4" }}>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-full rounded-xl font-bold transition-all active:scale-[0.97] disabled:opacity-70"
              style={{
                height: 46,
                background: done ? "#16A34A" : "#25D366",
                color: "white",
                fontSize: 14,
                boxShadow: "0 2px 10px rgba(37,211,102,0.30)",
              }}
            >
              {sharing
                ? t("Generating…", "தயாரிக்கிறோம்…", "बना रहे हैं…")
                : done
                ? t("✓ Shared!", "✓ பகிரப்பட்டது!", "✓ शेयर हो गया!")
                : t("📲 Tap to Share", "📲 பகிர தட்டவும்", "📲 शेयर करें")}
            </button>
            <p className="text-center mt-1.5" style={{ fontSize: 10, color: "#6B7280" }}>
              {t(
                "Saves image · Opens WhatsApp · Share with family",
                "படம் சேமிக்கப்படும் · WhatsApp திறக்கும்",
                "छवि सेव होगी · WhatsApp खुलेगा",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
