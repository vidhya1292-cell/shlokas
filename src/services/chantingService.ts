/**
 * Per-verse Sanskrit chanting from holy-bhagavad-gita.org
 * URL pattern: /media/audios/{chapter:03d}_{verse:03d}.mp3
 * Verified: 200 OK, audio/mpeg, no CORS headers (HTML Audio works, fetch does not)
 *
 * iOS Safari autoplay fix:
 *   iOS only allows audio.play() on an element that was already activated by a user gesture.
 *   We keep ONE persistent Audio element (`persistentAudio`) for the entire app lifetime.
 *   unlockChantingAudio() plays a silent WAV on it inside the gesture handler — this activates it.
 *   All subsequent plays just change .src on the same element and call .play() again.
 *   Creating a new Audio() element after the gesture is blocked on iOS 14 and earlier.
 */

import { getSharedAudioContext } from "./sharedAudioContext";

const BASE = "https://www.holy-bhagavad-gita.org/media/audios";

// Route persistentAudio through a GainNode so the shloka MP3 volume
// matches the TTS narration (which is typically normalized louder).
let _mediaElementSource: MediaElementAudioSourceNode | null = null;
let _gainNode: GainNode | null = null;
const SHLOKA_GAIN = 1.8; // ≈ +5 dB boost

function ensureGainChain(): void {
  const ctx = getSharedAudioContext();
  if (!ctx || _mediaElementSource) return;
  try {
    _mediaElementSource = ctx.createMediaElementSource(persistentAudio);
    _gainNode = ctx.createGain();
    _gainNode.gain.value = SHLOKA_GAIN;
    _mediaElementSource.connect(_gainNode);
    _gainNode.connect(ctx.destination);
  } catch {
    // Already connected or unsupported — fall back to native HTML5 volume
    _mediaElementSource = null;
    _gainNode = null;
  }
}

// Smallest valid WAV (44 bytes, 1 sample, silence)
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

// Single persistent Audio element — created once, reused for all chanting.
const persistentAudio = new Audio(SILENT_WAV);
persistentAudio.preload = "none";

export function getVerseAudioUrl(chapter: number, verse: number): string {
  const ch = String(chapter).padStart(3, "0");
  const v = String(verse).padStart(3, "0");
  return `${BASE}/${ch}_${v}.mp3`;
}

let isPlaying = false;

export function stopChantingAudio() {
  if (isPlaying) {
    try { persistentAudio.pause(); } catch {}
    // Don't clear src here — leave it so the element stays valid.
    // Just reset the position and flag.
    try { persistentAudio.currentTime = 0; } catch {}
    isPlaying = false;
  }
}

/**
 * Must be called synchronously inside a user-gesture handler.
 * Plays a silent WAV on the persistent Audio element to unlock it for iOS Safari.
 * After this call, all future .play() calls on the same element work without a gesture.
 */
export function unlockChantingAudio(): void {
  try {
    persistentAudio.src = SILENT_WAV;
    persistentAudio.volume = 0;
    persistentAudio.play().catch(() => {});
  } catch {
    // Ignore — best-effort unlock
  }
}

/**
 * Play authentic chanting for a specific verse using the persistent Audio element.
 * Reuses the same HTMLAudioElement that was unlocked in the gesture handler.
 * @param speed - playback rate: 1.0 = normal, 0.8 = slow (third listen)
 * @param scriptureId - scripture being learned; only "bg" has audio files
 */
export function playVerseShloka(
  chapter: number,
  verse: number,
  speed = 1.0,
  scriptureId = "bg"
): Promise<void> {
  if (scriptureId !== "bg") {
    return Promise.reject(new Error(`No chanting audio for scripture: ${scriptureId}`));
  }
  stopChantingAudio();

  // Prefer local file (fast, guaranteed) — fall back to external CDN.
  // Local files live in /public/audio/ and are served by the dev/prod server.
  const ch = String(chapter).padStart(3, "0");
  const v  = String(verse).padStart(3, "0");
  const localUrl    = `/audio/${ch}_${v}.mp3`;
  const externalUrl = getVerseAudioUrl(chapter, verse);

  console.log("[shloka] chapter:", chapter, "verse:", verse, "→ trying local first");

  return new Promise<void>((resolve, reject) => {
    isPlaying = true;

    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(loadTimeout);
      clearTimeout(failTimeout);
      isPlaying = false;
      fn();
    };

    const loadTimeout = setTimeout(() => settle(resolve), 5 * 60 * 1000);
    const failTimeout = setTimeout(() => settle(() => reject(new Error("Audio load timeout"))), 30_000);

    // Use property assignment (not addEventListener) so each new call REPLACES
    // the previous handler. addEventListener with { once: true } accumulates stale
    // handlers when audio is paused (not ended), causing multiple advance chains
    // to fire when audio eventually ends.
    let usedExternal = false;

    persistentAudio.oncanplay = () => {
      console.log("[shloka] canplay ✓", persistentAudio.src);
      clearTimeout(failTimeout);
    };
    persistentAudio.onended = () => {
      console.log("[shloka] ended ✓");
      settle(resolve);
    };
    persistentAudio.onerror = () => {
      const code = persistentAudio.error?.code ?? "?";
      console.warn("[shloka] error", code, "on", persistentAudio.src);
      if (!usedExternal) {
        usedExternal = true;
        console.log("[shloka] falling back to external:", externalUrl);
        // Replace handlers for the retry attempt
        persistentAudio.onerror = () => {
          console.error("[shloka] external also failed");
          settle(() => reject(new Error(`Audio error ${persistentAudio.error?.code ?? "?"}`)));
        };
        persistentAudio.src = externalUrl;
        persistentAudio.playbackRate = speed;
        persistentAudio.volume = 1.0;
        persistentAudio.play().catch((err) => settle(() => reject(err)));
        return;
      }
      settle(() => reject(new Error(`Audio error ${code}`)));
    };

    // Connect through GainNode for volume boost (first time only)
    ensureGainChain();

    // IMPORTANT: Do NOT call .load() — may revoke iOS Safari autoplay permission.
    persistentAudio.src = localUrl;
    persistentAudio.playbackRate = speed;
    persistentAudio.volume = 1.0;

    persistentAudio.play().then(() => console.log("[shloka] play() accepted")).catch((err) => {
      console.error("[shloka] play() rejected:", err);
      settle(() => reject(err));
    });
  });
}

// ─── Segment playback ─────────────────────────────────────────────────────────
// Created fresh inside the click handler (user gesture context) so iOS Safari
// allows play(). Completely separate from persistentAudio — no shared state.

let _segmentAudio: HTMLAudioElement | null = null;

export function stopSegmentAudio(): void {
  if (_segmentAudio) {
    try { _segmentAudio.pause(); } catch {}
    _segmentAudio = null;
  }
}

export function playVerseSegment(
  chapter: number,
  verse: number,
  partIndex: number,
  totalParts: number = 5
): Promise<void> {
  stopSegmentAudio();

  const ch = String(chapter).padStart(3, "0");
  const v = String(verse).padStart(3, "0");
  const audio = new Audio(`/audio/${ch}_${v}.mp3`);
  _segmentAudio = audio;

  return new Promise<void>((resolve) => {
    const done = () => { _segmentAudio = null; resolve(); };

    audio.addEventListener("loadedmetadata", () => {
      const partDur = audio.duration / totalParts;
      const startSec = partIndex * partDur;
      const endSec   = startSec + partDur;
      audio.currentTime = startSec;

      const onTick = () => {
        if (audio.currentTime >= endSec) {
          audio.pause();
          audio.removeEventListener("timeupdate", onTick);
          done();
        }
      };
      audio.addEventListener("timeupdate", onTick);
      audio.play().catch(done);
    }, { once: true });

    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", done, { once: true }); // fail silently
  });
}
