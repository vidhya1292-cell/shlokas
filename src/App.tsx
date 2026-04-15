import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import LiveSession from "@/pages/LiveSession";
import Onboarding from "@/pages/Onboarding";
import Read from "@/pages/Read";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";
import { loadProgress } from "@/services/storage";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// ── Baby Krishna splash — shown on every app launch for 1.8 s ─────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  return (
    <div
      className="fixed inset-0 cursor-pointer select-none"
      style={{ zIndex: 9999 }}
      onClick={onDone}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Baby_thief_Krishna_%28bazaar_art%2C_c.1950%27s%29.jpg"
        alt="Baby Krishna"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,15,40,0.92) 0%, rgba(10,15,40,0.45) 40%, transparent 70%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-14 flex flex-col items-center text-center">
        <p
          style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: 42,
            color: "#C4973A",
            lineHeight: 1,
            textShadow: "0 2px 16px rgba(196,151,58,0.5)",
          }}
        >
          ॐ
        </p>
        <h1
          className="text-4xl font-bold mt-2 mb-1 text-white"
          style={{ letterSpacing: "-0.5px" }}
        >
          Shlokas
        </h1>
        <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          Learn · Chant · Remember
        </p>
        <p className="text-sm font-medium" style={{ color: "#C4973A" }}>
          श्रीमद्भगवद्गीता
        </p>
        <p className="text-xs mt-10" style={{ color: "rgba(255,255,255,0.3)" }}>
          Tap to continue
        </p>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const progress = loadProgress();

  // Synchronous check — redirect before any protected page renders
  if (location !== "/onboarding" && !progress.hasCompletedOnboarding) {
    return <Redirect to="/onboarding" />;
  }

  const showNav = location === "/" || location === "/read";

  return (
    <>
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/" component={Home} />
        <Route path="/session" component={LiveSession} />
        <Route path="/read" component={Read} />
        <Route component={NotFound} />
      </Switch>
      {showNav && <BottomNav />}
    </>
  );
}

function App() {
  // Show Baby Krishna splash on every cold launch (session-only, not persisted)
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
