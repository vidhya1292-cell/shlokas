/**
 * Onboarding — shown to new users (or anyone who hasn't completed onboarding).
 * Two screens:
 *   1. Darshan splash — Om symbol, app name, auto-advances after 1.5s (or on tap)
 *   2. Language selection — Tamil / Hindi / English
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadProgress, saveProgress } from "../services/storage";
import { motion, AnimatePresence } from "framer-motion";

const P = {
  bg:      "#F5F7FF",
  primary: "#1E3A8A",
  gold:    "#C4973A",
  tint:    "#EEF2FF",
  text:    "#1E2D5A",
  border:  "#DBEAFE",
};

type Screen = "splash" | "language";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [screen, setScreen] = useState<Screen>("splash");

  // Auto-advance from splash after 1.8s
  useEffect(() => {
    const t = setTimeout(() => setScreen("language"), 1800);
    return () => clearTimeout(t);
  }, []);

  const selectLanguage = (lang: "en-IN" | "ta-IN" | "hi-IN") => {
    const progress = loadProgress();
    saveProgress({ ...progress, language: lang, hasCompletedOnboarding: true });
    navigate("/");
  };

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col items-center justify-center px-6"
      style={{ background: P.bg, color: P.text }}
    >
      <AnimatePresence mode="wait">

        {/* ── Darshan Splash ─────────────────────────────────────────────── */}
        {screen === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 cursor-pointer select-none"
            onClick={() => setScreen("language")}
          >
            {/* Krishna image — full screen */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/63/Krishna_with_cow.jpg"
              alt="Krishna"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />

            {/* Gradient overlay — bottom half */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(10,15,40,0.92) 0%, rgba(10,15,40,0.55) 45%, transparent 75%)",
              }}
            />

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 px-8 pb-14 flex flex-col items-center text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{
                  fontFamily: "'Noto Serif Devanagari', serif",
                  fontSize: 42,
                  color: "#C4973A",
                  lineHeight: 1,
                  textShadow: "0 2px 16px rgba(196,151,58,0.5)",
                }}
              >
                ॐ
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="text-4xl font-bold mt-2 mb-1 text-white"
                style={{ letterSpacing: "-0.5px" }}
              >
                Shlokas
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-sm mb-1"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Learn · Chant · Remember
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-sm font-medium"
                style={{ color: "#C4973A" }}
              >
                श्रीमद्भगवद्गीता
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-xs mt-10"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Tap to continue
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ── Language Selection ──────────────────────────────────────────── */}
        {screen === "language" && (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="text-3xl mb-3"
                style={{
                  fontFamily: "'Noto Serif Devanagari', serif",
                  color: P.gold,
                }}
              >
                ॐ
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: P.primary }}>
                How would you like to be taught?
              </h2>
              <p className="text-sm opacity-60">
                Choose your language of instruction
              </p>
            </div>

            {/* Language cards */}
            <div className="flex flex-col gap-3">

              {/* Tamil */}
              <button
                onClick={() => selectLanguage("ta-IN")}
                className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: "white",
                  border: `2px solid ${P.border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl font-bold"
                    style={{ background: P.tint, color: P.primary }}
                  >
                    த
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: P.primary }}>தமிழ்</p>
                    <p className="text-sm opacity-60">ஆசிரியர் தமிழில் பேசுவார்</p>
                    <p className="text-xs opacity-40 mt-0.5">Teacher speaks in Tamil</p>
                  </div>
                </div>
              </button>

              {/* Hindi */}
              <button
                onClick={() => selectLanguage("hi-IN")}
                className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: "white",
                  border: `2px solid ${P.border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl font-bold"
                    style={{ background: P.tint, color: P.primary }}
                  >
                    ह
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: P.primary }}>हिन्दी</p>
                    <p className="text-sm opacity-60">शिक्षक हिन्दी में बोलेंगे</p>
                    <p className="text-xs opacity-40 mt-0.5">Teacher speaks in Hindi</p>
                  </div>
                </div>
              </button>

              {/* English */}
              <button
                onClick={() => selectLanguage("en-IN")}
                className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: "white",
                  border: `2px solid ${P.border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl font-bold"
                    style={{ background: P.tint, color: P.primary }}
                  >
                    A
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: P.primary }}>English</p>
                    <p className="text-sm opacity-60">Teacher speaks in English</p>
                    <p className="text-xs opacity-40 mt-0.5">Best for global learners</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-center text-xs opacity-30 mt-6">
              You can change this anytime from the home screen
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
