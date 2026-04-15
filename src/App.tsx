import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import LiveSession from "@/pages/LiveSession";
import Onboarding from "@/pages/Onboarding";
import Read from "@/pages/Read";
import NotFound from "@/pages/not-found";
import BottomNav from "@/components/BottomNav";
import { loadProgress } from "@/services/storage";

const queryClient = new QueryClient();

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
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
