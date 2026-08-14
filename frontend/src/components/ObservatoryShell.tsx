import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getStatistics } from "../api";
import { useResource } from "../hooks/useResource";

type NavItem = { to: string; label: string; icon: string; group: string };

const navigation: NavItem[] = [
  { to: "/", label: "Overview", icon: "/assets/icons/compass.svg", group: "" },
  { to: "/people", label: "People", icon: "/assets/icons/person.svg", group: "PEOPLE & HOUSES" },
  { to: "/houses", label: "Houses", icon: "/assets/icons/castle.svg", group: "PEOPLE & HOUSES" },
  { to: "/stories", label: "Timeline", icon: "/assets/icons/snowflake.svg", group: "STORY & TIMELINE" },
  { to: "/quotes", label: "Chronicles", icon: "/assets/icons/compass.svg", group: "STORY & TIMELINE" },
  { to: "/battles", label: "Battles", icon: "/assets/icons/swords.svg", group: "THE REALM" },
  { to: "/database", label: "Database", icon: "/assets/icons/castle.svg", group: "DATA & API" },
  { to: "/architecture", label: "How it works", icon: "/assets/icons/compass.svg", group: "DATA & API" }
];

const commands = [
  ["Open the realm map", "/"], ["Find a person", "/people"], ["Browse noble houses", "/houses"],
  ["Read the timeline", "/stories"], ["Open the database explorer", "/database"], ["Learn the architecture", "/architecture"]
] as const;

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function Logo({ compact = false }: { compact?: boolean }) {
  return <NavLink className={`observatory-logo${compact ? " compact" : ""}`} to="/" aria-label="The Raven Wall home">
    <img src={assetUrl("generated/raven-mark.png")} alt="" aria-hidden="true" />
    {!compact && <span><strong>THE RAVEN WALL</strong><small>A GAME OF THRONES PROJECT</small></span>}
  </NavLink>;
}

export default function ObservatoryShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const stats = useResource(signal => getStatistics(signal), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement)?.tagName)) { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredCommands = useMemo(() => commands.filter(([label]) => label.toLowerCase().includes(search.toLowerCase())), [search]);
  const counts = stats.data;
  const sectionFor = (item: NavItem, index: number) => item.group && (index === 1 || navigation[index - 1]?.group !== item.group) ? <p className="rail-label" key={`${item.group}-label`}>{item.group}</p> : null;

  return <div className="observatory-shell">
    <header className="observatory-topbar">
      <button className="mobile-rail-toggle" type="button" onClick={() => setMobileOpen(value => !value)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>☰</button>
      <Logo />
      <nav className="topbar-links" aria-label="Primary navigation">
        <NavLink to="/" end>Realms</NavLink><NavLink to="/houses">Houses</NavLink><NavLink to="/people">People</NavLink><NavLink to="/battles">Battles</NavLink><NavLink to="/stories">Chronicles</NavLink><NavLink to="/database">Maps</NavLink><NavLink to="/quotes">Lore</NavLink>
      </nav>
      <div className="topbar-actions"><button type="button" className="command-trigger" onClick={() => setPaletteOpen(true)}><kbd>⌘ K</kbd><span>Command palette</span></button><button className="bookmark-button" type="button" aria-label="Save this view" onClick={() => window.localStorage.setItem("raven-last-view", location.pathname)}>♡</button><Logo compact /></div>
    </header>
    <aside className={`observatory-rail${mobileOpen ? " open" : ""}`} aria-label="Realm navigation">
      <div className="rail-brand"><Logo compact /></div>
      <div className="rail-nav">{navigation.map((item, index) => <div key={item.to}>{sectionFor(item, index)}<NavLink to={item.to} end={item.to === "/"} className={({ isActive }) => isActive ? "rail-link active" : "rail-link"}><img src={assetUrl(item.icon.replace("/assets/", ""))} alt="" aria-hidden="true" /><span>{item.label}</span>{item.to === "/people" && <b>{counts?.characters ?? "—"}</b>}{item.to === "/houses" && <b>{counts?.houses ?? "—"}</b>}{item.to === "/battles" && <b>{counts?.battles ?? "—"}</b>}</NavLink></div>)}</div>
      <div className="rail-footer"><span className="rail-status-dot" /> LIVE · H2 DATABASE</div>
    </aside>
    <main className="observatory-content">{children}</main>
    <footer className="observatory-status"><span><i className="status-dot" /> LIVE</span><span>Data synced {counts ? "just now" : "waiting"}</span><span>API: Westeros JPA v1</span><span>{counts?.characters ?? "—"} people</span><span>{counts?.houses ?? "—"} houses</span><span>{counts?.battles ?? "—"} battles</span><span className="status-spacer" /><a href="../" aria-label="Open the cinematic public experience">Public realm</a><a href="../realm-contract.json">Data contract</a><span>Source: H2 · Flyway</span><button type="button" onClick={() => setPaletteOpen(true)}>⌘K commands</button></footer>
    {paletteOpen && <div className="palette-backdrop" role="presentation" onMouseDown={() => setPaletteOpen(false)}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title" onMouseDown={event => event.stopPropagation()}><div className="palette-heading"><h2 id="command-title">Command palette</h2><button type="button" onClick={() => setPaletteOpen(false)} aria-label="Close command palette">×</button></div><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search people, houses, places…" aria-label="Search commands" />{filteredCommands.map(([label, to]) => <button type="button" className="palette-command" key={to} onClick={() => { setPaletteOpen(false); setSearch(""); navigate(to); }}><span>{label}</span><kbd>↵</kbd></button>)}{!filteredCommands.length && <p className="palette-empty">No command matches that search.</p>}<small>Press Esc to close · navigation state is preserved in the URL</small></section></div>}
  </div>;
}
