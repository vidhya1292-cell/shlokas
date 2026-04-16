/**
 * ElevenLabs TTS service — used for ALL languages (EN/TA/HI/Sanskrit).
 * eleven_turbo_v2_5 is multilingual (32 languages); same voices work across all.
 *
 * Add to .env:  VITE_ELEVENLABS_API_KEY=your_key_here
 */

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
const BASE_URL = "https://api.elevenlabs.io/v1";

// Voice IDs — change these to swap voices without touching the rest of the code
export const ELEVEN_VOICES = {
  // Adults English teacher — warm, calm, authoritative
  adults: "21m00Tcm4TlvDq8ikWAM",   // Rachel
  // Kids English teacher — gentle, storytelling warmth
  kids: "EXAVITQu4vr4xnSDxMaL",     // Sarah
} as const;

const elevenCache = new Map<string, string>();

function getCacheKey(text: string, voiceId: string, pace: number): string {
  return `el|${voiceId}|${pace}|${text}`;
}

/**
 * Convert text to speech via ElevenLabs.
 * Returns base64-encoded MP3 audio — same contract as sarvamService.textToSpeech.
 */
export async function elevenLabsTTS(
  text: string,
  voiceId: string,
  pace: number = 1.0
): Promise<string> {
  const key = getCacheKey(text, voiceId, pace);
  if (elevenCache.has(key)) return elevenCache.get(key)!;

  if (!API_KEY) throw new Error("VITE_ELEVENLABS_API_KEY not set");

  // ElevenLabs stability: lower = more expressive, higher = more consistent
  // For teaching, use moderate stability + high similarity
  const stability = pace < 0.9 ? 0.65 : 0.50;

  const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",   // fast + cheap + high quality
      voice_settings: {
        stability,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`ElevenLabs TTS failed ${response.status}: ${err}`);
  }

  // Convert binary MP3 → base64
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  elevenCache.set(key, base64);
  return base64;
}

export function isElevenLabsAvailable(): boolean {
  return !!API_KEY;
}
