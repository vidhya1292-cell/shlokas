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
}): Promise<Blob | null> {
  const { quote, deity, tithi, month, festival, language } = params;
  const isTamil = language === "ta-IN";
  const isHindi = language === "hi-IN";

  const W = 540, H = 760;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await document.fonts.ready;

  // ── Background ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#1E3A8A");
  bgGrad.addColorStop(0.42, "#2D52C4");
  bgGrad.addColorStop(0.55, "#FFFFFF");
  bgGrad.addColorStop(1, "#F5F7FF");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Top: OM + App name ──
  ctx.textAlign = "center";
  ctx.font = "bold 62px 'Noto Serif Devanagari', serif";
  ctx.fillStyle = "#C4973A";
  ctx.fillText("ॐ", W / 2, 90);

  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("Shlokas.in", W / 2, 128);

  // ── Gold divider ──
  ctx.strokeStyle = "rgba(196,151,58,0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 148); ctx.lineTo(W - 80, 148);
  ctx.stroke();

  // ── Panchang info ──
  const monthLabel = isTamil ? month.nameTA : isHindi ? month.nameHI : month.nameEN;
  const tithiLabel = isTamil ? tithi.nameTA : isHindi ? tithi.nameHI : tithi.nameEN;
  ctx.font = "bold 20px 'Noto Serif Devanagari', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "#FFD87A";
  ctx.fillText(`${monthLabel}  ·  ${tithiLabel}`, W / 2, 178);

  const deityName = isTamil ? deity.nameTA : isHindi ? deity.nameHI : deity.name;
  const dayLabel = isTamil ? deity.dayTA : isHindi ? deity.dayHI : deity.dayEN;
  ctx.font = "16px 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText(`${deity.symbol} ${deityName}  ·  ${dayLabel}`, W / 2, 206);

  // ── Festival badge if any ──
  if (festival) {
    const festName = isTamil ? festival.nameTA : isHindi ? festival.nameHI : festival.nameEN;
    ctx.font = "bold 15px 'Noto Sans Tamil', sans-serif";
    ctx.fillStyle = "#FFD87A";
    ctx.fillText(`🎉 ${festName}`, W / 2, 232);
  }

  // ── White card area ──
  const cardY = 260;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  (ctx as any).roundRect?.(20, cardY, W - 40, H - cardY - 20, 20)
    ?? ctx.rect(20, cardY, W - 40, H - cardY - 20);
  ctx.fill();

  // Gold top border on card
  ctx.strokeStyle = "#C4973A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, cardY + 2); ctx.lineTo(W - 60, cardY + 2);
  ctx.stroke();

  // ── Quote ──
  const quoteText = isTamil ? quote.ta : isHindi ? quote.hi : quote.en;
  ctx.fillStyle = "#1E2D5A";
  ctx.font = "italic 18px 'Noto Serif Devanagari', 'Noto Sans Tamil', Georgia, serif";
  ctx.textAlign = "center";
  const quoteEndY = wrapText(ctx, `"${quoteText}"`, W / 2, W - 100, 30, cardY + 52);

  // ── Original line ──
  ctx.font = "15px 'Noto Serif Devanagari', serif";
  ctx.fillStyle = "#4B6CB7";
  const origLine = quote.original.split("\n")[0];
  wrapText(ctx, origLine, W / 2, W - 100, 24, quoteEndY + 6);

  // Source
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#C4973A";
  ctx.fillText(`— ${quote.sourceShort}`, W / 2, quoteEndY + 54);

  // ── Gold divider ──
  ctx.strokeStyle = "rgba(196,151,58,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H - 70); ctx.lineTo(W - 60, H - 70);
  ctx.stroke();

  // ── Footer ──
  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "#1E3A8A";
  ctx.fillText("🕉️  Learn Sanskrit · Shlokas.in", W / 2, H - 42);

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
    const shareParams = { quote, deity, tithi, month, festival, language };
    try {
      // Try to generate canvas image and share as file
      if (typeof navigator.share === "function" && navigator.canShare) {
        const blob = await buildShareCard(shareParams);
        if (blob) {
          const file = new File([blob], "shlokas-daily.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              text: buildShareText(shareParams),
            });
            setDone(true);
            setTimeout(() => setDone(false), 3000);
            return;
          }
        }
      }
    } catch {
      // User cancelled or share failed — fall through to text
    } finally {
      setSharing(false);
    }
    // Fallback: WhatsApp text link
    const text = buildShareText(shareParams);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setDone(true);
    setTimeout(() => setDone(false), 3000);
    setSharing(false);
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

        {/* Original text (Sanskrit / Tamil) */}
        <p
          style={{
            fontFamily: quote.originalLang === "ta"
              ? "'Noto Sans Tamil', sans-serif"
              : "'Noto Serif Devanagari', serif",
            fontSize: 12,
            color: "#4B6CB7",
            lineHeight: 1.6,
            marginBottom: 3,
          }}
        >
          {quote.original.split("\n")[0]}
        </p>
        <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>
          — {quote.sourceShort}
        </p>
      </div>

      {/* ── Share button ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 14px 14px" }}>
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
            : t("📲 Share on WhatsApp", "📲 WhatsApp-ல் பகிர்", "📲 WhatsApp पर शेयर करें")}
        </button>
        <p className="text-center mt-1.5" style={{ fontSize: 10, color: "#9CA3AF" }}>
          {t(
            "New message every day · Share with family",
            "தினமும் புதிய செய்தி · குடும்பத்துடன் பகிரவும்",
            "हर दिन नया संदेश · परिवार के साथ साझा करें",
          )}
        </p>
      </div>
    </div>
  );
}
