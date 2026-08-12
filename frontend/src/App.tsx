import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import ApiJourney from "./components/ApiJourney";
const ArchitecturePage = lazy(() => import("./pages/ArchitecturePage"));
const BattlesPage = lazy(() => import("./pages/BattlesPage"));
const CharacterPage = lazy(() => import("./pages/CharacterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const HousesPage = lazy(() => import("./pages/HousesPage"));
const PeoplePage = lazy(() => import("./pages/PeoplePage"));
const QuotesPage = lazy(() => import("./pages/QuotesPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const DatabaseExplorerPage = lazy(() => import("./pages/DatabaseExplorerPage"));

const navigation = [
  ["/", "Overview"], ["/people", "People"], ["/houses", "Houses"], ["/stories", "Stories"],
  ["/battles", "Battles"], ["/quotes", "Voices"], ["/database", "Database"], ["/architecture", "How it works"]
];

function App() {
  const basename = window.location.pathname.startsWith("/app") ? "/app" : undefined;
  return <BrowserRouter basename={basename}><ApplicationShell /></BrowserRouter>;
}

function ApplicationShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);
  return <div className="app-shell">
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Game of Thrones project home"><span className="brand-mark">✦</span><span><strong>THE RAVEN WALL</strong><small>FULL-STACK TEACHING PROJECT</small></span></NavLink>
      <nav className={menuOpen ? "open" : ""} aria-label="Primary navigation">{navigation.map(([to, label]) => <NavLink onClick={()=>setMenuOpen(false)} key={to} to={to} end={to === "/"}>{label}</NavLink>)}</nav>
      <button className="mobile-menu" aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}>{menuOpen?"Close":"Menu"}</button>
    </header>
      <Suspense fallback={<main className="page"><div className="notice" role="status">Loading project view…</div></main>}><Routes>
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
    <footer>React frontend · Spring Boot REST API · Spring Data JPA · Flyway · H2 database</footer>
  </div>;
}

export default App;
