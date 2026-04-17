import { useState, useRef, useCallback, useEffect } from "react";
import {
  textToSpeech,
  playBase64Audio,
  stopCurrentAudio,
  preGenerateAudio,
  speechToText,
  calculateAccuracy,
  transliterateToRoman,
  transliterateToTamil,
  DEFAULT_VOICE,
} from "../services/sarvamService";
import { playVerseShloka, stopChantingAudio } from "../services/chantingService";
import { SessionState, SessionVerse, SessionStats, UserProgress } from "../types";
import { updateVerseProgress } from "../services/storage";

function getGreetingPart(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Ordered step progression for Skip button */
const STEP_AFTER: Partial<Record<SessionState, SessionState>> = {
  NARRATE_OPENING: "NARRATE_INTRO",
  NARRATE_INTRO: "PLAY_SHLOKA",
  PLAY_SHLOKA: "PLAY_SHLOKA_2",
  PLAY_SHLOKA_2: "NARRATE_YOUR_TURN",
  NARRATE_YOUR_TURN: "PLAY_SHLOKA_SLOW",
  PLAY_SHLOKA_SLOW: "RECORD_RECITE",
  RECORD_RECITE: "SHOW_MEANING",
  SHOW_MEANING: "RATE_VERSE",
  NARRATE_TRANSITION: "NARRATE_INTRO",
};

export function useSessionEngine(
  verses: SessionVerse[],
  progress: UserProgress,
  language: "en-IN" | "ta-IN" | "hi-IN",
  dayNumber: number,
  onProgressUpdate: (p: UserProgress) => void,
  onComplete: (stats: SessionStats) => void
) {
  const [state, setState] = useState<SessionState>("LOADING");
  const [verseIndex, setVerseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Preparing your class...");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [sttResult, setSttResult] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const prevStateRef = useRef<SessionState>("NARRATE_OPENING");
  const pausedRef = useRef(false);
  const advanceIdRef = useRef(0); // Incremented on every advance() call; old chains bail when stale
  const progressRef = useRef(progress);
  // Refs so playShlokaStep (a button handler) always sees the current state/index
  const stateRef = useRef<SessionState>("LOADING");
  const verseIndexRef = useRef(0);
  progressRef.current = progress;

  const voiceId = progress.voice || DEFAULT_VOICE;

  // Keep refs in sync so stable callbacks can read current values
  stateRef.current = state;
  verseIndexRef.current = verseIndex;

  const languageRef = useRef(language);
  languageRef.current = language;

  const revisionCount = verses.filter((v) => !v.isNew).length;
  const newCount = verses.filter((v) => v.isNew).length;
  const totalVersesCount = Object.values(progress.verseProgress).filter(
    (vp) => vp.timesCorrect >= 1
  ).length;

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!pausedRef.current) setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── TTS helper ────────────────────────────────────────────────────────────

  const safePlay = useCallback(
    async (text: string, lang: string = language, pace = 1.0, advId?: number): Promise<void> => {
      try {
        // 15-second timeout covers BOTH the Sarvam API call AND the actual audio playback.
        // If either hangs (network stall, AudioContext suspended), the session moves on.
        let aborted = false;
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => { aborted = true; reject(new Error("TTS timeout")); }, 15_000)
        );
        await Promise.race([
          (async () => {
            const audio = await textToSpeech(text, lang, pace, voiceId);
            if (aborted || pausedRef.current) return;
            if (advId !== undefined && advanceIdRef.current !== advId) return;
            await playBase64Audio(audio);
          })(),
          timeout,
        ]);
      } catch (err) {
        console.warn("TTS skipped:", err instanceof Error ? err.message : err);
      }
    },
    [language, voiceId]
  );

  // ─── Session advance ────────────────────────────────────────────────────────

  const advance = useCallback(
    async (nextState: SessionState, currentVerseIndex: number) => {
      if (pausedRef.current) return;
      // Each advance() call gets a unique ID. If a newer call starts (e.g. via Skip),
      // all awaits in this call bail immediately via ok().
      const myId = ++advanceIdRef.current;
      const ok = () => !pausedRef.current && advanceIdRef.current === myId;

      setState(nextState);

      const verse = verses[currentVerseIndex];
      const isEnglish = languageRef.current === "en-IN";
      const isHindi = languageRef.current === "hi-IN";
      const tl = languageRef.current;

      // ── Welcome ──────────────────────────────────────────────────────────────
      if (nextState === "NARRATE_OPENING") {
        // Invocation — spoken alone, reverently
        await safePlay("Om Namo Bhagavate Vasudevaya", "en-IN", 1.0, myId);
        if (!ok()) return;
        await new Promise((r) => setTimeout(r, 600));
        if (!ok()) return;
        // Welcome message
        const greeting = getGreetingPart();
        const welcome = isEnglish
          ? `${greeting}! Welcome to Day ${dayNumber}. We will cover ${revisionCount > 0 ? `${revisionCount} revision` + (revisionCount > 1 ? "s" : "") + " and " : ""}${newCount} new verse${newCount !== 1 ? "s" : ""} today. Let's begin.`
          : isHindi
          ? `${greeting}! दिन ${dayNumber} में आपका स्वागत है। आज हम ${revisionCount > 0 ? `${revisionCount} पुनरावृत्ति और ` : ""}${newCount} नए श्लोक सीखेंगे।`
          : `${greeting}! Day ${dayNumber}-க்கு வரவேற்கிறோம். ${revisionCount > 0 ? `${revisionCount} revision-உம் ` : ""}${newCount} புது verse${newCount !== 1 ? "கள்" : ""} இன்னைக்கு practice பண்ணலாம்.`;
        await safePlay(welcome, tl, 1.0, myId);
        if (ok()) advance("NARRATE_INTRO", 0);

      // ── Verse intro ───────────────────────────────────────────────────────────
      } else if (nextState === "NARRATE_INTRO") {
        const tag = verse.isNew
          ? (isEnglish ? "New verse" : isHindi ? "नया श्लोक" : "புது verse")
          : (isEnglish ? "Revision" : isHindi ? "पुनरावृत्ति" : "மறுபயிற்சி");
        const text = isEnglish
          ? `Chapter ${verse.chapter}, Verse ${verse.verse}. ${tag}. Listen carefully.`
          : isHindi
          ? `अध्याय ${verse.chapter}, श्लोक ${verse.verse}। ${tag}। ध्यान से सुनें।`
          : `Chapter ${verse.chapter}, Verse ${verse.verse}. ${tag}. கவனமா கேளுங்க.`;
        await safePlay(text, tl, 1.0, myId);
        if (ok()) advance("PLAY_SHLOKA", currentVerseIndex);

      // ── Step 1: First listen ──────────────────────────────────────────────────
      // State is set to PLAY_SHLOKA above; UI shows "▶ Hear Shloka" button.
      // playShlokaStep() (called from the button tap) plays the audio and advances.
      } else if (nextState === "PLAY_SHLOKA") {
        // nothing — wait for user tap

      // ── Step 2: Second listen ─────────────────────────────────────────────────
      } else if (nextState === "PLAY_SHLOKA_2") {
        // nothing — wait for user tap

      // ── Step 3: Recite along prompt ───────────────────────────────────────────
      } else if (nextState === "NARRATE_YOUR_TURN") {
        const text = isEnglish
          ? "Now recite along with the chanting."
          : isHindi
          ? "अब पाठ के साथ मिलकर बोलें।"
          : "இப்போ சேர்ந்து சொல்லுங்க.";
        await safePlay(text, tl, 1.0, myId);
        if (ok()) advance("PLAY_SHLOKA_SLOW", currentVerseIndex);

      // ── Step 4: Slow listen — user recites along ──────────────────────────────
      } else if (nextState === "PLAY_SHLOKA_SLOW") {
        // nothing — wait for user tap

      // ── Step 5: Record + check ────────────────────────────────────────────────
      } else if (nextState === "RECORD_RECITE") {
        // Reset recording state
        setSttResult("");
        setAccuracy(null);
        setIsRecording(false);
        setSttLoading(false);
        // Prompt to record
        const recitePrompt = isEnglish
          ? "Now record yourself reciting the shloka and check your corrections."
          : isHindi
          ? "अब श्लोक बोलते हुए रिकॉर्ड करें और अपनी गलतियाँ जाँचें।"
          : "இப்போ ஸ்லோகத்தை record பண்ணி உங்கள் திருத்தங்களை சரிபாருங்க.";
        await safePlay(recitePrompt, tl, 1.0, myId);
        // Stays here until user taps "Record" or "Continue to Meaning"

      // ── Step 6: Meaning ───────────────────────────────────────────────────────
      } else if (nextState === "SHOW_MEANING") {
        const hasTamilMeaning = !isEnglish && !!verse.meaningTA;
        const meaningText = hasTamilMeaning ? verse.meaningTA! : verse.meaningEN;
        const meaningLang = hasTamilMeaning ? tl : "en-IN";
        if (ok()) await safePlay(meaningText, meaningLang, 1.0, myId);
        if (ok() && verse.reflection) {
          const hasTamilReflection = !isEnglish && !!verse.reflectionTA;
          const reflectionText = hasTamilReflection ? verse.reflectionTA! : verse.reflection;
          const reflectionLang = hasTamilReflection ? tl : "en-IN";
          if (ok()) await safePlay(reflectionText, reflectionLang, 1.0, myId);
        }
        if (ok()) {
          await new Promise((r) => setTimeout(r, 800));
          if (ok()) advance("RATE_VERSE", currentVerseIndex);
        }

      // ── Step 7: Rate ──────────────────────────────────────────────────────────
      } else if (nextState === "RATE_VERSE") {
        const text = isEnglish
          ? "How well did you know this verse?"
          : isHindi
          ? "यह श्लोक आपको कितना आता था?"
          : "இந்த verse எவ்வளவு தெரிஞ்சிருந்துச்சு?";
        await safePlay(text, tl, 1.0, myId);

      // ── Transition to next verse ──────────────────────────────────────────────
      } else if (nextState === "NARRATE_TRANSITION") {
        const opts = isEnglish
          ? ["Wonderful! Next verse.", "Very good! Moving on.", "Great effort! Let's continue."]
          : isHindi
          ? ["बहुत अच्छा! अगला श्लोक।", "बहुत बढ़िया! आगे बढ़ते हैं।", "शाबाश! जारी रखते हैं।"]
          : ["அருமை! அடுத்த verse.", "நல்லா இருந்தது! தொடர்வோம்.", "சரி! next verse பாக்கலாம்."];
        await safePlay(opts[Math.floor(Math.random() * opts.length)], tl, 1.0, myId);
        const next = currentVerseIndex + 1;
        if (ok()) {
          setVerseIndex(next);
          advance("NARRATE_INTRO", next);
        }

      // ── Closing ───────────────────────────────────────────────────────────────
      } else if (nextState === "NARRATE_CLOSING") {
        const streak = progressRef.current.streakCount;
        const text = isEnglish
          ? `Today's class is complete! You practiced ${verses.length} verse${verses.length !== 1 ? "s" : ""}. Streak: ${streak} days. Om Shanti.`
          : isHindi
          ? `आज की कक्षा पूरी हुई! आपने ${verses.length} श्लोक का अभ्यास किया। लकीर: ${streak} दिन। ॐ शान्ति।`
          : `இன்னைக்கு class முடிஞ்சுடுச்சு! ${verses.length} verses practice பண்ணீங்க. Streak ${streak} days. Om Shanti.`;
        await safePlay(text, tl, 1.0, myId);
        if (ok()) advance("SESSION_COMPLETE", currentVerseIndex);

      // ── Complete ──────────────────────────────────────────────────────────────
      } else if (nextState === "SESSION_COMPLETE") {
        onComplete({
          revised: revisionCount,
          newLearned: newCount,
          total: totalVersesCount,
          streak: progressRef.current.streakCount,
          elapsedSeconds,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [verses, dayNumber, revisionCount, newCount, safePlay]
  );

  // ─── Chanting (user-triggered) ──────────────────────────────────────────────
  // play() MUST be called from a direct user gesture (button tap) — never from an
  // async chain — so that iOS Safari and Android Chrome allow audio without restrictions.

  /** Play the shloka for the current scripture. Falls back to TTS for non-BG scriptures. */
  const playShlokaAudio = useCallback(async (
    verse: { chapter: number; verse: number; sanskrit: string },
    speed: number,
    myId: number
  ): Promise<void> => {
    const scriptureId = progressRef.current.currentScripture ?? "bg";
    if (scriptureId === "bg") {
      await playVerseShloka(verse.chapter, verse.verse, speed, "bg");
    } else {
      // Non-BG scripture: read the text via TTS (hi-IN handles Awadhi/Sanskrit Devanagari)
      const ttsLang = (scriptureId === "hc" || scriptureId === "vs") ? "hi-IN" : languageRef.current;
      await safePlay(verse.sanskrit, ttsLang, speed === 0.8 ? 0.7 : 1.0, myId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePlay]);

  const playShlokaStep = useCallback(async () => {
    const myId = ++advanceIdRef.current;
    const ok = () => !pausedRef.current && advanceIdRef.current === myId;

    const curState = stateRef.current;
    const curIdx = verseIndexRef.current;
    const verse = verses[curIdx];
    const speed = curState === "PLAY_SHLOKA_SLOW" ? 0.8 : 1.0;

    stopCurrentAudio();
    stopChantingAudio();

    try {
      await playShlokaAudio(verse, speed, myId);
    } catch (err) {
      console.warn("Shloka audio error:", err instanceof Error ? err.message : err);
    }

    if (!ok()) return;

    if (curState === "PLAY_SHLOKA") {
      // Auto-play a second time so user hears it twice from one tap
      await new Promise((r) => setTimeout(r, 500));
      if (!ok()) return;
      try {
        await playShlokaAudio(verse, 1.0, myId);
      } catch {}
      if (ok()) advance("NARRATE_YOUR_TURN", curIdx);
    } else if (curState === "PLAY_SHLOKA_2") {
      // Reached via Skip — just advance
      if (ok()) advance("NARRATE_YOUR_TURN", curIdx);
    } else if (curState === "PLAY_SHLOKA_SLOW") {
      if (ok()) advance("RECORD_RECITE", curIdx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, advance, playShlokaAudio]);

  // ─── Recording ──────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setSttResult("");
    setAccuracy(null);
    setMicDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start(200);
      setIsRecording(true);
    } catch {
      setMicDenied(true);
    }
  }, []);

  /**
   * Stop recording, run STT, then play teacher feedback.
   * - Accuracy ≥ 70%: appreciation → auto-advance to SHOW_MEANING
   * - Accuracy < 70%: "not strong, try again" → stay so user can retry
   * - STT failed (null): silently advance
   */
  const submitRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    setIsRecording(false);
    setSttLoading(true);

    const myId = ++advanceIdRef.current;
    const ok = () => !pausedRef.current && advanceIdRef.current === myId;
    const isEnglish = languageRef.current === "en-IN";
    const isHindi = languageRef.current === "hi-IN";
    const tl = languageRef.current;

    return new Promise<void>((resolve) => {
      mr.onstop = async () => {
        let acc: number | null = null;
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          mr.stream.getTracks().forEach((t) => t.stop());
          const transcript = await speechToText(blob);
          const verse = verses[verseIndexRef.current];
          const expectedText = tl === "ta-IN"
            ? transliterateToTamil(verse.sanskrit)
            : transliterateToRoman(verse.sanskrit);
          acc = calculateAccuracy(transcript, expectedText);
          setSttResult(transcript);
          setAccuracy(acc);
        } catch (err) {
          console.warn("STT failed:", err);
          setSttResult("");
          setAccuracy(null);
        } finally {
          setSttLoading(false);
        }

        if (!ok()) { resolve(); return; }

        if (acc === null) {
          // STT failed — advance silently
          if (ok()) advance("SHOW_MEANING", verseIndexRef.current);
        } else if (acc >= 70) {
          // Good recitation — appreciate and auto-advance
          const praise = isEnglish
            ? "Excellent! That was very well done."
            : isHindi
            ? "शाबाश! बहुत अच्छा बोला।"
            : "மிகவும் அருமை! சரியாக சொன்னீங்க.";
          await safePlay(praise, tl, 1.0, myId);
          if (ok()) advance("SHOW_MEANING", verseIndexRef.current);
        } else {
          // Needs more practice — encourage retry, stay in RECORD_RECITE
          const nudge = isEnglish
            ? "This one isn't strong yet. Try listening once more and recite again."
            : isHindi
            ? "यह अभी मजबूत नहीं है। एक बार और सुनकर फिर से बोलें।"
            : "இது இன்னும் வலுவாக இல்லை. ஒரு தடவை கேட்டு மீண்டும் சொல்லுங்க.";
          await safePlay(nudge, tl, 1.0, myId);
          // Stay — UI shows "Try Again" and "Meaning →" buttons
        }
        resolve();
      };
      mr.stop();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, safePlay, advance]);

  // ─── Session control ────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    setLoadingMessage("Preparing your class...");
    const isEnglish = language === "en-IN";
    const isHindi = language === "hi-IN";
    const tl = language;

    // Fixed prompts — same for all verses, cache once each
    const reciteAlongText = isEnglish
      ? "Now recite along with the chanting."
      : isHindi
      ? "अब पाठ के साथ मिलकर बोलें।"
      : "இப்போ சேர்ந்து சொல்லுங்க.";
    const recordPromptText = isEnglish
      ? "Now record yourself reciting the shloka and check your corrections."
      : isHindi
      ? "अब श्लोक बोलते हुए रिकॉर्ड करें और अपनी गलतियाँ जाँचें।"
      : "இப்போ ஸ்லோகத்தை record பண்ணி உங்கள் திருத்தங்களை சரிபாருங்க.";
    const praiseText = isEnglish
      ? "Excellent! That was very well done."
      : isHindi ? "शाबाश! बहुत अच्छा बोला।"
      : "மிகவும் அருமை! சரியாக சொன்னீங்க.";
    const nudgeText = isEnglish
      ? "This one isn't strong yet. Try listening once more and recite again."
      : isHindi ? "यह अभी मजबूत नहीं है। एक बार और सुनकर फिर से बोलें।"
      : "இது இன்னும் வலுவாக இல்லை. ஒரு தடவை கேட்டு மீண்டும் சொல்லுங்க.";

    const toGenerate: Array<{ text: string; language: string; pace: number; voice: string }> = [
      { text: reciteAlongText, language: tl, pace: 1.0, voice: voiceId },
      { text: recordPromptText, language: tl, pace: 1.0, voice: voiceId },
      { text: praiseText, language: tl, pace: 1.0, voice: voiceId },
      { text: nudgeText, language: tl, pace: 1.0, voice: voiceId },
    ];

    for (const v of verses) {
      // Per-verse intro (NARRATE_INTRO)
      const tag = v.isNew
        ? (isEnglish ? "New verse" : isHindi ? "नया श्लोक" : "புது verse")
        : (isEnglish ? "Revision" : isHindi ? "पुनरावृत्ति" : "மறுபயிற்சி");
      const introText = isEnglish
        ? `Chapter ${v.chapter}, Verse ${v.verse}. ${tag}. Listen carefully.`
        : isHindi
        ? `अध्याय ${v.chapter}, श्लोक ${v.verse}। ${tag}। ध्यान से सुनें।`
        : `Chapter ${v.chapter}, Verse ${v.verse}. ${tag}. கவனமா கேளுங்க.`;
      toGenerate.push({ text: introText, language: tl, pace: 1.0, voice: voiceId });

      // Meaning + reflection (SHOW_MEANING)
      const hasTamilMeaning = !isEnglish && !!v.meaningTA;
      const meaningText = hasTamilMeaning ? v.meaningTA! : v.meaningEN;
      const meaningLang = hasTamilMeaning ? language : "en-IN";
      toGenerate.push({ text: meaningText, language: meaningLang, pace: 1.0, voice: voiceId });

      if (v.reflection) {
        const hasTamilReflection = !isEnglish && !!v.reflectionTA;
        const reflectionText = hasTamilReflection ? v.reflectionTA! : v.reflection;
        const reflectionLang = hasTamilReflection ? language : "en-IN";
        toGenerate.push({ text: reflectionText, language: reflectionLang, pace: 1.0, voice: voiceId });
      }
    }

    // Fire pre-generation in background — do NOT await it.
    // If Sarvam API is slow/rate-limited, awaiting it would block the entire session start.
    preGenerateAudio(toGenerate).catch(() => {});
    if (!pausedRef.current) {
      setState("NARRATE_OPENING");
      advance("NARRATE_OPENING", 0);
    }
  }, [verses, advance, voiceId, language]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
    stopCurrentAudio();
    stopChantingAudio();
    prevStateRef.current = state;
  }, [state]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
    const s = prevStateRef.current;
    advance(s === "PAUSED" ? "NARRATE_INTRO" : s, verseIndex);
  }, [advance, verseIndex]);

  /** Skip the current step — stops audio and jumps to the next logical step. */
  const skipStep = useCallback(() => {
    stopCurrentAudio();
    stopChantingAudio();
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    // RATE_VERSE is not in STEP_AFTER (user should rate, but Skip moves to next verse)
    if (state === "RATE_VERSE") {
      if (verseIndex + 1 < verses.length) {
        advance("NARRATE_TRANSITION", verseIndex);
      } else {
        advance("NARRATE_CLOSING", verseIndex);
      }
      return;
    }
    const next = STEP_AFTER[state];
    if (next === "NARRATE_INTRO") {
      const nextVerseIdx = verseIndex + 1;
      if (nextVerseIdx < verses.length) {
        setVerseIndex(nextVerseIdx);
        advance("NARRATE_INTRO", nextVerseIdx);
      } else {
        advance("NARRATE_CLOSING", verseIndex);
      }
    } else if (next) {
      advance(next, verseIndex);
    }
  }, [state, verseIndex, verses.length, advance, isRecording]);

  /** Rate the current verse and advance */
  const rateVerse = useCallback(
    (rating: "need_more" | "getting_there" | "got_it") => {
      const verse = verses[verseIndex];
      const updatedProgress = updateVerseProgress(
        progressRef.current,
        verse.chapter,
        verse.verse,
        rating
      );
      onProgressUpdate(updatedProgress);

      if (verseIndex + 1 < verses.length) {
        advance("NARRATE_TRANSITION", verseIndex);
      } else {
        advance("NARRATE_CLOSING", verseIndex);
      }
    },
    [verses, verseIndex, advance, onProgressUpdate]
  );

  /** Replay the shloka audio manually (called from replay button in meaning/rate states). */
  const replayShloka = useCallback(() => {
    stopCurrentAudio();
    stopChantingAudio();
    const verse = verses[verseIndexRef.current];
    const scriptureId = progressRef.current.currentScripture ?? "bg";
    if (scriptureId === "bg") {
      playVerseShloka(verse.chapter, verse.verse).catch(() => {});
    } else {
      const ttsLang = (scriptureId === "hc" || scriptureId === "vs") ? "hi-IN" : languageRef.current;
      safePlay(verse.sanskrit, ttsLang, 1.0).catch(() => {});
    }
  }, [verses, safePlay]);

  /** Replay the meaning TTS. */
  const replayMeaning = useCallback(() => {
    stopCurrentAudio();
    const verse = verses[verseIndex];
    const meaningText = language !== "en-IN" && verse.meaningTA ? verse.meaningTA : verse.meaningEN;
    import("../services/sarvamService").then(({ textToSpeech, playBase64Audio }) => {
      textToSpeech(meaningText, language, 1.0, voiceId)
        .then(playBase64Audio)
        .catch(() => {});
    });
  }, [verses, verseIndex, language, voiceId]);

  /**
   * Replay the slow chanting for the current verse, then go back to RECORD_RECITE.
   * This way "Try Again" re-plays the audio first so the user can listen before recording.
   */
  const retryRecording = useCallback(() => {
    setSttResult("");
    setAccuracy(null);
    setIsRecording(false);
    setSttLoading(false);
    stopCurrentAudio();
    stopChantingAudio();
    advance("PLAY_SHLOKA_SLOW", verseIndex);
  }, [advance, verseIndex]);

  /**
   * Go back to the previous verse and restart from NARRATE_INTRO.
   * Does nothing if already on the first verse.
   */
  const goToPreviousVerse = useCallback(() => {
    if (verseIndex === 0) return;
    const prev = verseIndex - 1;
    stopCurrentAudio();
    stopChantingAudio();
    setSttResult("");
    setAccuracy(null);
    setIsRecording(false);
    setSttLoading(false);
    setVerseIndex(prev);
    advance("NARRATE_INTRO", prev);
  }, [verseIndex, advance]);

  return {
    state,
    verseIndex,
    isPaused,
    isRecording,
    sttResult,
    accuracy,
    micDenied,
    sttLoading,
    elapsedSeconds,
    loadingMessage,
    startSession,
    pause,
    resume,
    rateVerse,
    replayShloka,
    replayMeaning,
    playShlokaStep,
    skipVerse: skipStep,
    skipStep,
    startRecording,
    stopRecording: submitRecording,  // alias kept for any future callers
    submitRecording,
    retryRecording,
    goToPreviousVerse,
    stopListening: () => {},
    isListening: false,
    listenTimer: 0,
  };
}
