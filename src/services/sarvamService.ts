import Sanscript from "@indic-transliteration/sanscript";
import { setSharedAudioContext } from "./sharedAudioContext";
import { stopChantingAudio } from "./chantingService";

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY as string;

/**
 * Transliterate Devanagari Sanskrit to IAST Roman script for display.
 * Removes Devanagari punctuation markers (।॥) and normalises whitespace.
 */
export function transliterateToRoman(devanagari: string): string {
  const cleaned = devanagari
    .replace(/।/g, " | ")
    .replace(/॥/g, " || ")
    .replace(/\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  try {
    return Sanscript.t(cleaned, "devanagari", "iast");
  } catch {
    return cleaned;
  }
}

/**
 * Transliterate Devanagari Sanskrit to Tamil script for display in Tamil mode.
 */
export function transliterateToTamil(devanagari: string): string {
  const cleaned = devanagari
    .replace(/।/g, " | ")
    .replace(/॥/g, " || ")
    .replace(/\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  try {
    return Sanscript.t(cleaned, "devanagari", "tamil");
  } catch {
    return cleaned;
  }
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: "female" | "male";
  tagline: string;
  kidsDefault?: boolean;  // auto-selected when ageGroup === "kids"
}

// bulbul:v3 voices
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "priya",  name: "Priya",  gender: "female", tagline: "Warm & gentle",   kidsDefault: true },
  { id: "kavya",  name: "Kavya",  gender: "female", tagline: "Calm & expressive" },
  { id: "kabir",  name: "Kabir",  gender: "male",   tagline: "Warm & smooth" },
];

export const DEFAULT_VOICE = "kabir";
export const DEFAULT_KIDS_VOICE = "priya";

const ttsCache = new Map<string, string>();

function getCacheKey(text: string, language: string, pace: number, voice: string): string {
  return `${language}|${pace}|${voice}|${text}`;
}

/**
 * Clean text before TTS - remove newlines, pipe chars, and compress whitespace.
 * This is critical for Sanskrit text which has embedded \n in the verses.
 */
function cleanTextForTTS(text: string): string {
  return text
    .replace(/\n/g, " ")
    .replace(/\|+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function textToSpeech(
  text: string,
  language: string = "en-IN",
  pace: number = 1.0,
  voice: string = DEFAULT_VOICE
): Promise<string> {
  const cleaned = cleanTextForTTS(text);
  const key = getCacheKey(cleaned, language, pace, voice);
  if (ttsCache.has(key)) {
    return ttsCache.get(key)!;
  }

  // bulbul:v3 supports up to 2500 chars; truncate conservatively
  const maxLen = 2000;
  const input = cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;

  // bulbul:v3 uses "text" (string), not "inputs" (array like v2).
  // enable_preprocessing is auto-enabled in v3 — do not send it.
  const body: Record<string, unknown> = {
    text: input,
    target_language_code: language,
    speaker: voice,
    model: "bulbul:v3",
    pace: pace,
  };

  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`TTS failed ${response.status}: ${err}`);
  }

  const data = await response.json();
  const base64 = data.audios?.[0];
  if (!base64) throw new Error("No audio in TTS response");

  ttsCache.set(key, base64);
  return base64;
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "saaras:v3");
  formData.append("language_code", "sa-IN");

  const response = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: {
      "api-subscription-key": API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`STT failed: ${response.status}`);
  }

  const data = await response.json();
  return data.transcript || "";
}

let currentAudioContext: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

export function stopCurrentAudio() {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
    } catch {}
    currentSourceNode = null;
  }
}

/** Returns the shared AudioContext so other audio services can use it for GainNode boosting. */
export function getAudioContext(): AudioContext | null {
  return currentAudioContext;
}

/**
 * Must be called synchronously inside a user-gesture handler (tap/click).
 * Creates and unlocks the Web Audio API AudioContext on iOS Safari and Android,
 * which otherwise blocks audio until a direct user gesture is in the call stack.
 */
export function unlockAudioContext(): void {
  try {
    if (!currentAudioContext || currentAudioContext.state === "closed") {
      currentAudioContext = new AudioContext();
      setSharedAudioContext(currentAudioContext);
    }
    if (currentAudioContext.state === "suspended") {
      currentAudioContext.resume();
    }
    // Play a 1-frame silent buffer — required by iOS Safari to fully unlock
    const buf = currentAudioContext.createBuffer(1, 1, 22050);
    const src = currentAudioContext.createBufferSource();
    src.buffer = buf;
    src.connect(currentAudioContext.destination);
    src.start(0);
  } catch {
    // Unsupported environment — audio will attempt to play anyway
  }
}

export async function playBase64Audio(base64: string): Promise<void> {
  stopCurrentAudio();
  stopChantingAudio();

  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const arrayBuffer = bytes.buffer;

  if (!currentAudioContext || currentAudioContext.state === "closed") {
    currentAudioContext = new AudioContext();
    setSharedAudioContext(currentAudioContext);
  }
  if (currentAudioContext.state === "suspended") {
    await currentAudioContext.resume();
  }

  const audioBuffer = await currentAudioContext.decodeAudioData(arrayBuffer);
  const source = currentAudioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(currentAudioContext.destination);
  currentSourceNode = source;

  return new Promise((resolve) => {
    source.onended = () => {
      currentSourceNode = null;
      resolve();
    };
    source.start(0);
  });
}

// ─── Phonetic normalisation helpers ────────────────────────────────────────

/**
 * Convert Devanagari or Tamil transcript → IAST Roman for phonetic matching.
 * Tamil script is used when STT runs in Tamil mode on Sanskrit recitation.
 */
function devanagariToIast(text: string): string {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasTamil = /[\u0B80-\u0BFF]/.test(text);
  if (!hasDevanagari && !hasTamil) return text;
  try {
    const cleaned = text.replace(/।/g, " ").replace(/॥/g, " ");
    if (hasDevanagari) return Sanscript.t(cleaned, "devanagari", "iast");
    if (hasTamil)     return Sanscript.t(cleaned, "tamil",      "iast");
  } catch {}
  return text;
}

/**
 * Reduce an IAST (or casual Roman) word to a simplified phonetic key:
 * - NFC-normalise so precomposed and decomposed forms are equal
 * - lowercase
 * - strip diacritics: ā→a  ī→i  ū→u  ṛ→r  ṝ→r  ṃ→m  ḥ→h  ṭ→t  ḍ→d  ṇ→n  ś→s  ṣ→s  ñ→n
 * - strip final 'a' (inherent vowel often dropped in speech)
 * - strip final 'h' (visarga often silent)
 * - collapse any doubled consonants
 *
 * This lets "dharmakshetre" from casual STT match "dharmakṣetre" from stored IAST,
 * and lets a dropped visarga still count as a match.
 */
function phoneticKey(word: string): string {
  return word
    .normalize("NFC")
    .toLowerCase()
    // diacritic strip
    .replace(/[āÂ]/g, "a")
    .replace(/[īÎ]/g, "i")
    .replace(/[ūÛ]/g, "u")
    .replace(/[ṛṝ]/g, "r")
    .replace(/ḷ/g, "l")
    .replace(/ṃ/g, "m")
    .replace(/ḥ/g, "h")
    .replace(/[ṭṭ]/g, "t")
    .replace(/[ḍ]/g, "d")
    .replace(/ṇ/g, "n")
    .replace(/[śṣ]/g, "s")
    .replace(/ñ/g, "n")
    // common casual spelling normalisation
    .replace(/ksh/g, "ks")
    .replace(/shri/g, "sri")
    .replace(/sh/g, "s")
    .replace(/th/g, "t")
    .replace(/ph/g, "p")
    .replace(/bh/g, "b")
    .replace(/gh/g, "g")
    .replace(/dh/g, "d")
    .replace(/ch/g, "c")
    .replace(/jh/g, "j")
    // strip non-alpha
    .replace(/[^a-z]/g, "")
    // collapse doubled consonants
    .replace(/(.)\1+/g, "$1")
    // strip trailing inherent 'a' or 'h' (often silent)
    .replace(/[ah]$/, "");
}

/**
 * Levenshtein distance between two strings (capped at 4 for speed).
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length, n = b.length;
  const dp: number[] = Array(n + 1).fill(0).map((_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

/**
 * True if two phonetic keys are "close enough" to count as a match.
 * Allows ~30% edit distance (roughly 70% similarity) so recitations
 * don't need to be perfect — small accent/ending differences still pass.
 */
function fuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const len = Math.max(a.length, b.length);
  const maxEdits = Math.max(1, Math.round(len * 0.40));
  return levenshtein(a, b) <= maxEdits;
}

/**
 * Tokenise a (potentially mixed script) transcript or transliteration string
 * into lower-case Roman words, stripping Sanskrit punctuation.
 * Hyphens are REMOVED (not split on) because they mark sandhi within a
 * compound word — "dharma-kṣetre" is one word, not two.
 */
function tokenize(raw: string): string[] {
  return devanagariToIast(raw)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[।॥|।]/g, " ")   // Sanskrit dandas → word separator
    .replace(/-/g, "")          // sandhi hyphens → join the parts
    .replace(/[^\wāīūṛṝḷēōṃḥṭḍṇśṣña-z\s]/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the expected words annotated with whether the user said each one correctly.
 * Uses phonetic fuzzy matching so minor diacritic/visarga differences count as correct.
 */
export function getWordFeedback(
  transcript: string,
  expected: string
): Array<{ word: string; matched: boolean }> {
  const transcriptWords = tokenize(transcript);
  const expectedWords = tokenize(expected);

  const transcriptKeys = transcriptWords.map(phoneticKey);
  const usedTranscriptIndices = new Set<number>();

  return expectedWords.map((ew) => {
    const ek = phoneticKey(ew);
    const idx = transcriptKeys.findIndex(
      (tk, i) => !usedTranscriptIndices.has(i) && fuzzyMatch(ek, tk)
    );
    if (idx !== -1) {
      usedTranscriptIndices.add(idx);
      return { word: ew, matched: true };
    }
    return { word: ew, matched: false };
  });
}

export function calculateAccuracy(transcript: string, expected: string): number {
  if (!transcript.trim()) return 0;

  const feedback = getWordFeedback(transcript, expected);
  if (feedback.length === 0) return 0;
  const matches = feedback.filter((f) => f.matched).length;
  return Math.round((matches / feedback.length) * 100);
}

export async function preGenerateAudio(
  texts: Array<{ text: string; language: string; pace: number; voice?: string }>
): Promise<void> {
  await Promise.allSettled(
    texts.map(({ text, language, pace, voice }) => textToSpeech(text, language, pace, voice))
  );
}
