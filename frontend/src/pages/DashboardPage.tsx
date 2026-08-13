import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCharacters, getEvents, getHouses, getStatistics } from "../api";
import PageState from "../components/PageState";
import { useResource } from "../hooks/useResource";
import type { House } from "../types";
import { fallbackAssetUrl, heraldryUrl, portraitUrl } from "../lib/assetPaths";

const markerPositions: Record<string, { left: string; top: string }> = {
  Stark: { left: "39%", top: "18%" }, Lannister: { left: "28%", top: "53%" },
  Targaryen: { left: "57%", top: "58%" }, Baratheon: { left: "64%", top: "67%" },
  Greyjoy: { left: "25%", top: "45%" }, Tyrell: { left: "49%", top: "72%" },
  Martell: { left: "58%", top: "87%" }, Tully: { left: "42%", top: "43%" }, Arryn: { left: "70%", top: "43%" },
  "Free Folk": { left: "14%", top: "9%" }, "Night’s Watch": { left: "21%", top: "22%" }, Unaffiliated: { left: "84%", top: "78%" }
};

const allFilters = [
  ["houses", "Houses", "castle.svg"], ["people", "People", "person.svg"], ["battles", "Battles", "swords.svg"],
  ["castles", "Castles", "castle.svg"], ["locations", "Locations", "compass.svg"], ["events", "Events", "snowflake.svg"]
] as const;

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
function heraldry(house: string) { return heraldryUrl(house); }

function HouseMarker({ house, selected, onSelect }: { house: House; selected: boolean; onSelect: () => void }) {
  const position = markerPositions[house.name] ?? { left: "50%", top: "50%" };
  return <button type="button" className={`map-marker${selected ? " selected" : ""}`} style={{ ...position, "--house-color": house.sigilColor } as CSSProperties} onClick={onSelect} aria-label={`Select House ${house.name}`}>
    <img src={heraldry(house.name)} alt="" aria-hidden="true" onError={event => { event.currentTarget.src = assetUrl("icons/castle.svg"); }} /><span>{house.name}</span>
  </button>;
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stats = useResource(signal => getStatistics(signal), []);
  const houses = useResource(signal => getHouses(signal), []);
  const [selectedName, setSelectedName] = useState(searchParams.get("house") || "Stark");
  const [mapStyle, setMapStyle] = useState(searchParams.get("style") || "Regions");
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState("Overview");
  const [timelinePlaying, setTimelinePlaying] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [show, setShow] = useState<Record<string, boolean>>({ houses: true, people: true, battles: true, castles: true, locations: true, events: true });
  const selected = selectedName ? houses.data?.items.find(house => house.name === selectedName) ?? houses.data?.items[0] : undefined;
  const characters = useResource(signal => selected ? getCharacters({ page: 0, pageSize: 4, house: selected.name }, signal) : Promise.resolve(undefined), [selected?.name]);
  const events = useResource(signal => getEvents(undefined, 0, 6, signal), []);
  const visibleHouses = useMemo(() => show.houses ? (houses.data?.items ?? []) : [], [houses.data, show.houses]);

  useEffect(() => {
    if (!timelinePlaying || !events.data?.items.length) return undefined;
    const timer = window.setInterval(() => setTimelineIndex(index => (index + 1) % events.data!.items.length), 2400);
    return () => window.clearInterval(timer);
  }, [timelinePlaying, events.data]);

  useEffect(() => {
    const event = events.data?.items[timelineIndex];
    if (timelinePlaying && event?.houses[0]) chooseHouse(event.houses[0]);
    return undefined;
  }, [timelineIndex, timelinePlaying, events.data]);

  const chooseHouse = (name: string) => { setSelectedName(name); setSearchParams(current => { current.set("house", name); return current; }, { replace: true }); };
  const chooseMapStyle = (style: string) => { setMapStyle(style); setSearchParams(current => { current.set("style", style); return current; }, { replace: true }); };
  const toggle = (key: string) => setShow(current => ({ ...current, [key]: !current[key] }));
  const reset = () => { setZoom(1); setMapStyle("Regions"); setSelectedName("Stark"); setSearchParams({ house: "Stark", style: "Regions" }, { replace: true }); setShow({ houses: true, people: true, battles: true, castles: true, locations: true, events: true }); };

  return <div className="map-workspace">
    <aside className="map-filter-rail" aria-label="Realm filters">
      <div className="filter-heading"><span>REALM FILTERS</span><button type="button" onClick={reset}>Reset ↻</button></div>
      <section><p className="filter-label">SHOW</p>{allFilters.map(([key, label, icon]) => <label className="filter-row" key={key}><input type="checkbox" checked={show[key]} onChange={() => toggle(key)} /><img src={assetUrl(`icons/${icon}`)} alt="" aria-hidden="true" /><span>{label}</span><b>{key === "people" ? stats.data?.characters ?? "—" : key === "houses" ? stats.data?.houses ?? "—" : key === "battles" ? stats.data?.battles ?? "—" : key === "events" ? stats.data?.events ?? "—" : "—"}</b></label>)}</section>
      <section><p className="filter-label">ALLEGIANCE</p>{houses.data?.items.map(house => <button type="button" className={`allegiance-row${selected?.name === house.name ? " selected" : ""}`} key={house.name} onClick={() => chooseHouse(house.name)}><img src={heraldry(house.name)} alt="" aria-hidden="true" /><span>{house.name}</span><b>{house.charactersCount}</b></button>)}</section>
      <section><p className="filter-label">STATUS</p>{[["ALIVE", "Alive", "#a7c792"], ["DEAD", "Deceased", "#b86a73"], ["UNKNOWN", "Unknown", "#8c929b"]].map(([value, label, color]) => <label className="filter-row" key={value}><input type="checkbox" defaultChecked /><i style={{ background: color }} /><span>{label}</span><b>—</b></label>)}</section>
      <section><p className="filter-label">DATA SOURCES</p>{["Books", "Show", "Extended Universe"].map(source => <label className="filter-row source-row" key={source}><input type="checkbox" defaultChecked={source !== "Extended Universe"} /><span>{source}</span></label>)}</section>
    </aside>
    <section className="map-canvas" aria-label="Interactive map workspace">
      <div className="map-toolbar"><div className="map-style-pills">{["Regions", "Political", "Travel"].map(style => <button type="button" className={mapStyle === style ? "active" : ""} key={style} onClick={() => chooseMapStyle(style)}>{style}</button>)}</div><select aria-label="Map style" value={mapStyle} onChange={event => chooseMapStyle(event.target.value)}><option>Regions</option><option>Political</option><option>Travel</option></select></div>
      <div className="map-zoom-controls"><button type="button" onClick={() => setZoom(value => Math.min(1.35, value + .1))} aria-label="Zoom in">+</button><button type="button" onClick={() => setZoom(value => Math.max(.85, value - .1))} aria-label="Zoom out">−</button><button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom">◎</button></div>
      <div className="map-art" data-style={mapStyle.toLowerCase()} style={{ transform: `scale(${zoom})` }}><img src={assetUrl("generated/observatory-map.png")} alt="Illustrated map of Westeros" />{visibleHouses.map(house => <HouseMarker key={house.name} house={house} selected={selected?.name === house.name} onSelect={() => chooseHouse(house.name)} />)}</div>
      <div className="map-compass">N<br /><span>✦</span><br />S</div><div className="map-thumbnail" aria-hidden="true"><img src={assetUrl("generated/observatory-map.png")} alt="" /></div>
      <div className="map-region-label north">THE NORTH</div><div className="map-region-label riverlands">THE RIVERLANDS</div><div className="map-region-label reach">THE REACH</div><div className="map-region-label dorne">DORNE</div>
    </section>
    <aside className="detail-drawer" aria-label="Selected realm detail">
      <button className="drawer-close" type="button" onClick={() => { setSelectedName(""); setSearchParams(current => { current.delete("house"); return current; }, { replace: true }); }} aria-label="Clear selected house">×</button>
      {selected ? <><div className="drawer-identity"><img className="drawer-sigil" src={heraldry(selected.name)} alt={`${selected.name} sigil`} onError={event => { event.currentTarget.src = assetUrl("icons/castle.svg"); }} /><div><p className="eyebrow">HOUSE {selected.name.toUpperCase()}</p><h1>{selected.words}</h1></div></div><dl className="drawer-facts"><div><dt>REGION</dt><dd>{selected.region}</dd></div><div><dt>SEAT</dt><dd>{selected.seat}</dd></div><div><dt>WORDS</dt><dd>{selected.words}</dd></div><div><dt>PEOPLE</dt><dd>{selected.charactersCount}</dd></div></dl><nav className="drawer-tabs" aria-label="House detail tabs">{["Overview", "People", "History", "Relations"].map(tab => <button type="button" className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>{activeTab === "Overview" && <p className="drawer-copy">House {selected.name} of {selected.seat} is a recorded realm domain. Its people and relationships are queried from the Spring Data JPA service.</p>}{activeTab === "History" && <p className="drawer-copy">{selected.rulerEnd}</p>}{activeTab === "Relations" && <p className="drawer-copy">Open any member below to follow a relationship query through the API.</p>}{activeTab === "People" && <p className="drawer-copy">{selected.charactersCount} people are associated with this house in the database.</p>}<div className="drawer-section"><p className="filter-label">NOTABLE MEMBERS</p><PageState loading={characters.loading} error={characters.error} onRetry={characters.retry} empty={!characters.loading && !characters.data?.items.length}/>{characters.data?.items.map(character => <Link className="member-row" to={`/people/${character.id}`} key={character.id}><img src={portraitUrl(character.portraitUrl)} alt="" onError={event => { event.currentTarget.src = fallbackAssetUrl(); }} /><span><strong>{character.name}</strong><small>{character.actor}</small></span><b>›</b></Link>)}</div><Link className="drawer-action" to={`/people?house=${encodeURIComponent(selected.name)}`}>View all {selected.charactersCount} members <span>→</span></Link></> : <div className="drawer-empty"><p className="eyebrow">NO REALM SELECTED</p><h2>Choose a house on the map.</h2></div>}
    </aside>
      <div className="timeline-strip"><button type="button" className="timeline-play" aria-label={timelinePlaying ? "Pause timeline" : "Play timeline"} aria-pressed={timelinePlaying} onClick={() => setTimelinePlaying(value => !value)}>{timelinePlaying ? "Ⅱ" : "▶"}</button><div><strong>{events.data?.items[timelineIndex]?.season ? `${events.data.items[timelineIndex].season} AC` : "— AC"}</strong><small>{events.data?.items[timelineIndex]?.title || "A Game of Thrones"}</small></div><div className="timeline-track">{events.data?.items.map((event, index) => <button type="button" key={event.id} title={event.title} className={index === timelineIndex ? "active" : ""} style={{ left: `${12 + index * 13}%` }} onClick={() => { setTimelineIndex(index); setTimelinePlaying(false); if (event.houses[0]) chooseHouse(event.houses[0]); }}><span /></button>)}</div><div className="timeline-end">{events.data?.items[events.data.items.length - 1]?.season ? `${events.data.items[events.data.items.length - 1].season} AC` : "—"}</div></div>
  </div>;
}
