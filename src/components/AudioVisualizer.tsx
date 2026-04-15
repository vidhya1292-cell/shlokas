import { motion } from "framer-motion";

interface AudioVisualizerProps {
  isActive: boolean;
  isListening?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AudioVisualizer({ isActive, isListening = false, size = "md" }: AudioVisualizerProps) {
  const bars = isListening ? 5 : 4;
  const color = isListening ? "#ef4444" : "#C4631A";

  const heights = isListening
    ? [24, 40, 56, 40, 24]
    : [16, 32, 40, 32];

  const sizePx = size === "sm" ? 0.6 : size === "lg" ? 1.4 : 1;

  return (
    <div
      className="flex items-center justify-center gap-1"
      style={{ height: 60 * sizePx, width: 48 * sizePx * bars }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 6 * sizePx,
            backgroundColor: color,
            borderRadius: 4,
          }}
          animate={
            isActive
              ? {
                  height: [
                    heights[i] * sizePx,
                    heights[(i + 2) % bars] * sizePx * 1.5,
                    heights[i] * sizePx,
                  ],
                }
              : { height: 8 * sizePx }
          }
          transition={{
            duration: isListening ? 0.6 : 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function PulsingOrb({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full bg-saffron/20"
            style={{ width: 120, height: 120 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full bg-saffron/15"
            style={{ width: 96, height: 96 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </>
      )}
      <div className="relative z-10 w-16 h-16 rounded-full bg-saffron flex items-center justify-center shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
        </svg>
      </div>
    </div>
  );
}
