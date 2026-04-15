import { useLocation } from "wouter";
import { loadProgress } from "../services/storage";

const P = {
  primary: "#1E3A8A",
  gold:    "#C4973A",
};

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const progress = loadProgress();
  const isTamil = progress.language === "ta-IN";
  const isHindi = progress.language === "hi-IN";
  const t = (en: string, ta: string, hi: string) => isTamil ? ta : isHindi ? hi : en;

  const tabs = [
    {
      path: "/",
      icon: "🏠",
      label: t("Home", "முகப்பு", "होम"),
    },
    {
      path: "/session",
      icon: "🎓",
      label: t("Learning", "கற்றல்", "सीखें"),
    },
    {
      path: "/read",
      icon: "📖",
      label: t("Reading", "வாசிப்பு", "पठन"),
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-[480px] mx-auto"
      style={{
        background: "white",
        borderTop: "1px solid #DBEAFE",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all active:scale-95"
              style={{ color: isActive ? P.primary : "#9CA3AF" }}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 400,
                  borderBottom: isActive ? `2px solid ${P.gold}` : "none",
                  paddingBottom: isActive ? 1 : 0,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
