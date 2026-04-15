/**
 * Onboarding — shown to new users (once only).
 * Two screens:
 *   1. Age group — Kids / Adults
 *   2. Language — Tamil / Hindi / English
 *
 * The Baby Krishna splash is handled in App.tsx and shows on every launch.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { loadProgress, saveProgress } from "../services/storage";
import { DEFAULT_KIDS_VOICE, DEFAULT_VOICE } from "../services/sarvamService";
import { motion, AnimatePresence } from "framer-motion";

const P = {
  bg:      "#F5F7FF",
  primary: "#1E3A8A",
  gold:    "#C4973A",
  tint:    "#EEF2FF",
  text:    "#1E2D5A",
  border:  "#DBEAFE",
};

type Screen = "age" | "language";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [screen, setScreen] = useState<Screen>("age");
  const [ageGroup, setAgeGroup] = useState<"kids" | "adults" | null>(null);

  const selectAge = (age: "kids" | "adults") => {
    setAgeGroup(age);
    setScreen("language");
  };

  const selectLanguage = (lang: "en-IN" | "ta-IN" | "hi-IN") => {
    const progress = loadProgress();
    const age = ageGroup ?? "adults";
    saveProgress({
      ...progress,
      language: lang,
      ageGroup: age,
      voice: age === "kids" ? DEFAULT_KIDS_VOICE : DEFAULT_VOICE,
      hasCompletedOnboarding: true,
    });
    navigate("/");
  };

  return (
    <div
      className="min-h-screen w-full max-w-[480px] mx-auto flex flex-col items-center justify-center px-6"
      style={{ background: P.bg, color: P.text }}
    >
      <AnimatePresence mode="wait">

        {/* ── Age Group ──────────────────────────────────────────────────── */}
        {screen === "age" && (
          <motion.div
            key="age"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="text-center mb-8">
              <div
                className="text-3xl mb-3"
                style={{ fontFamily: "'Noto Serif Devanagari', serif", color: P.gold }}
              >
                ॐ
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: P.primary }}>
                Who is learning?
              </h2>
              <p className="text-sm opacity-60">
                We'll tailor the experience for you
              </p>
            </div>

            <div className="flex flex-col gap-3">

              {/* Kids */}
              <button
                onClick={() => selectAge("kids")}
                className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: "white",
                  border: `2px solid ${P.border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl"
                    style={{ background: P.tint }}
                  >
                    🧒
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: P.primary }}>Kids</p>
                    <p className="text-sm opacity-60">Ages 6 – 14</p>
                    <p className="text-xs opacity-40 mt-0.5">Fun, simple & step-by-step</p>
                  </div>
                </div>
              </button>

              {/* Adults */}
              <button
                onClick={() => selectAge("adults")}
                className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: "white",
                  border: `2px solid ${P.border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl"
                    style={{ background: P.tint }}
                  >
                    🧘
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: P.primary }}>Adults</p>
                    <p className="text-sm opacity-60">Ages 15 & above</p>
                    <p className="text-xs opacity-40 mt-0.5">Deep Sanskrit & philosophy</p>
                  </div>
                </div>
              </button>

            </div>

            <p className="text-center text-xs opacity-30 mt-6">
              You can change this anytime from the home screen
            </p>
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
            <div className="text-center mb-8">
              <div
                className="text-3xl mb-3"
                style={{ fontFamily: "'Noto Serif Devanagari', serif", color: P.gold }}
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
