import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Home from "@/pages/Home";
import LiveSession from "@/pages/LiveSession";
import Onboarding from "@/pages/Onboarding";
import Read from "@/pages/Read";
import NotFound from "@/pages/not-found";
import { loadProgress } from "@/services/storage";

const queryClient = new QueryClient();

/** Redirect new users (who haven't completed onboarding) to /onboarding. */
function OnboardingGuard() {
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (location === "/onboarding") return; // already there
    const progress = loadProgress();
    if (!progress.hasCompletedOnboarding) {
      navigate("/onboarding");
    }
  }, []); // run once on mount
  return null;
}

function Router() {
  return (
    <>
      <OnboardingGuard />
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/" component={Home} />
        <Route path="/session" component={LiveSession} />
        <Route path="/read" component={Read} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
