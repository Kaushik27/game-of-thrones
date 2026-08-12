import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import ApiJourney from "./components/ApiJourney";
import ArchitecturePage from "./pages/ArchitecturePage";
import BattlesPage from "./pages/BattlesPage";
import CharacterPage from "./pages/CharacterPage";
import DashboardPage from "./pages/DashboardPage";
import HousesPage from "./pages/HousesPage";
import PeoplePage from "./pages/PeoplePage";
import QuotesPage from "./pages/QuotesPage";
import StoriesPage from "./pages/StoriesPage";
import DatabaseExplorerPage from "./pages/DatabaseExplorerPage";

const navigation = [
  ["/", "Overview"], ["/people", "People"], ["/houses", "Houses"], ["/stories", "Stories"],
  ["/battles", "Battles"], ["/quotes", "Voices"], ["/database", "Database"], ["/architecture", "How it works"]
];

function App() {
  return <BrowserRouter><ApplicationShell /></BrowserRouter>;
}

function ApplicationShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);
  return <div className="app-shell">
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Game of Thrones archive home"><span className="brand-mark">✦</span><span><strong>THE RAVEN WALL</strong><small>FULL-STACK TEACHING ARCHIVE</small></span></NavLink>
      <nav className={menuOpen ? "open" : ""} aria-label="Primary navigation">{navigation.map(([to, label]) => <NavLink onClick={()=>setMenuOpen(false)} key={to} to={to} end={to === "/"}>{label}</NavLink>)}</nav>
      <button className="mobile-menu" aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}>{menuOpen?"Close":"Menu"}</button>
    </header>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/people/:characterId" element={<CharacterPage />} />
      <Route path="/houses" element={<HousesPage />} />
      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/battles" element={<BattlesPage />} />
      <Route path="/quotes" element={<QuotesPage />} />
      <Route path="/database" element={<DatabaseExplorerPage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="*" element={<main className="page"><p className="eyebrow">404</p><h1>The raven lost this path.</h1><NavLink to="/">Return to the archive</NavLink></main>} />
    </Routes>
    <ApiJourney />
    <footer>React frontend · Spring Boot REST API · Spring Data JPA · Flyway · H2 database</footer>
  </div>;
}

export default App;
