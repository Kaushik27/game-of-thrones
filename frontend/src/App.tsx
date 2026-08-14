import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import ApiJourney from "./components/ApiJourney";
import ObservatoryShell from "./components/ObservatoryShell";
const ArchitecturePage = lazy(() => import("./pages/ArchitecturePage"));
const BattlesPage = lazy(() => import("./pages/BattlesPage"));
const CharacterPage = lazy(() => import("./pages/CharacterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const HousesPage = lazy(() => import("./pages/HousesPage"));
const PeoplePage = lazy(() => import("./pages/PeoplePage"));
const QuotesPage = lazy(() => import("./pages/QuotesPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const DatabaseExplorerPage = lazy(() => import("./pages/DatabaseExplorerPage"));

const routeMeta: Record<string, { title: string; description: string }> = {
  "/": { title: "Realms · The Raven Wall", description: "Explore the houses, people, battles, and turning points of Westeros through a living fan-made realm." },
  "/people": { title: "People · The Raven Wall", description: "Search the people of Westeros, their allegiances, fates, and relationships." },
  "/houses": { title: "Houses · The Raven Wall", description: "Trace the great houses, words, seats, sigils, and people of Westeros." },
  "/stories": { title: "Chronicles · The Raven Wall", description: "Browse the episodes and turning points that shaped the realm." },
  "/quotes": { title: "Voices · The Raven Wall", description: "Return to the lines, warnings, promises, and last words fans carry with them." },
  "/battles": { title: "Battles · The Raven Wall", description: "Follow the major battles, combatants, outcomes, and costs of the realm." },
  "/database": { title: "Maps · The Raven Wall", description: "Inspect the structured records and API-backed map workspace." },
  "/architecture": { title: "How it works · The Raven Wall", description: "See how the React client, Spring Boot API, and database connect." }
};

function RouteMetadata() {
  const location = useLocation();
  useEffect(() => {
    const metadata = routeMeta[location.pathname] ?? routeMeta["/"];
    document.title = metadata.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", metadata.description);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const basePath = window.location.pathname.startsWith("/app") ? "/app" : "";
    canonical?.setAttribute("href", `${window.location.origin}${basePath}${location.pathname}`);
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    ogTitle?.setAttribute("content", metadata.title);
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    ogDescription?.setAttribute("content", metadata.description);
  }, [location.pathname]);
  return null;
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Route rendering failed", error, info.componentStack); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="page route-error" role="alert"><p className="eyebrow">THE RAVEN LOST THE THREAD</p><h1>This view could not be opened.</h1><p>Try returning to the realm or reload this route.</p><NavLink to="/">Return to the realm</NavLink></main>;
  }
}

function App() {
  const basename = window.location.pathname.startsWith("/app") ? "/app" : undefined;
  return <BrowserRouter basename={basename}><ApplicationShell /></BrowserRouter>;
}

function ApplicationShell() {
  return <ObservatoryShell>
      <RouteMetadata /><RouteErrorBoundary><Suspense fallback={<div className="workspace-loading" role="status" aria-busy="true"><span className="loader" />Loading project view…</div>}><Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/people/:characterId" element={<CharacterPage />} />
      <Route path="/houses" element={<HousesPage />} />
      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/battles" element={<BattlesPage />} />
      <Route path="/quotes" element={<QuotesPage />} />
      <Route path="/database" element={<DatabaseExplorerPage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="*" element={<main className="page"><p className="eyebrow">404</p><h1>The raven lost this path.</h1><NavLink to="/">Return to the project</NavLink></main>} />
    </Routes></Suspense></RouteErrorBoundary>
    <ApiJourney />
  </ObservatoryShell>;
}

export default App;
