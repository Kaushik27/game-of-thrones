import { lazy, Suspense } from "react";
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

function App() {
  const basename = window.location.pathname.startsWith("/app") ? "/app" : undefined;
  return <BrowserRouter basename={basename}><ApplicationShell /></BrowserRouter>;
}

function ApplicationShell() {
  return <ObservatoryShell>
      <Suspense fallback={<div className="workspace-loading" role="status"><span className="loader" />Loading project view…</div>}><Routes>
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
    </Routes></Suspense>
    <ApiJourney />
  </ObservatoryShell>;
}

export default App;
