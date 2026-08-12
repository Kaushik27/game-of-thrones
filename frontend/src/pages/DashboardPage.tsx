import { Link } from "react-router-dom";
import { getStatistics } from "../api";
import PageState from "../components/PageState";
import { useResource } from "../hooks/useResource";

export default function DashboardPage() {
  const { data, loading, error, retry } = useResource(signal => getStatistics(signal), []);
  const stats = data ? [
    [data.characters, "People", "/people"], [data.houses, "Houses", "/houses"], [data.relationships, "Relationships", "/people/jon-snow"],
    [data.episodes, "Episodes", "/stories"], [data.quotes, "Quotes", "/quotes"], [data.battles, "Battles", "/battles"], [data.events, "Story events", "/stories"]
  ] as const : [];
  return <main>
    <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">A FULL-STACK JOURNEY THROUGH WESTEROS</p><h1 id="hero-title">See the story.<br />See the system.</h1><p className="hero-intro">Explore the realm while learning how React, REST APIs, Java services, repositories, SQL migrations, and an embedded database work together.</p><div className="hero-actions"><Link className="primary-action" to="/people">Enter the realm</Link><Link to="/architecture">Teach me the architecture</Link></div></div><div className="hero-art" role="img" aria-label="A wintry road through Westeros"><span>THE NORTH REMEMBERS</span></div></section>
    <section className="page dashboard-section"><div className="section-heading"><div><p className="eyebrow">LIVE DATABASE INVENTORY</p><h2>Every number comes from H2.</h2></div><p>Loaded through `GET /api/v1/statistics`</p></div><PageState loading={loading} error={error} onRetry={retry} />{data && <div className="stat-grid">{stats.map(([value,label,to]) => <Link to={to} key={label}><strong>{value}</strong><span>{label}</span></Link>)}</div>}</section>
    <section className="page teaching-intro"><div><p className="eyebrow">LEARN BY EXPLORING</p><h2>One click crosses every application layer.</h2></div><div className="architecture-flow"><span>Browser event</span><b>→</b><span>React component</span><b>→</b><span>HTTP request</span><b>→</b><span>Spring service</span><b>→</b><span>H2 query</span></div><p>Open the live request panel at the bottom-right of any page to watch this journey happen.</p></section>
  </main>;
}
