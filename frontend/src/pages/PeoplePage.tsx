import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCharacters, getHouses } from "../api";
import PageState from "../components/PageState";
import type { CharacterPage, CharacterStatus } from "../types";
import { useResource } from "../hooks/useResource";
import { fallbackAssetUrl, portraitUrl } from "../lib/assetPaths";

const EMPTY: CharacterPage = { items: [], itemsCount: 0, page: 0, pageSize: 24, pagesCount: 0, links: { self: "/api/v1/characters" } };
const statuses: CharacterStatus[] = ["ALIVE", "DEAD", "UNKNOWN"];

export default function PeoplePage() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const initialStatus = statuses.includes(searchParameters.get("status") as CharacterStatus) ? searchParameters.get("status") as CharacterStatus : "";
  const initialPage = Math.max(0, Number.parseInt(searchParameters.get("page") || "0", 10) || 0);
  const [page, setPage] = useState(initialPage);
  const [house, setHouse] = useState(searchParameters.get("house") || "");
  const [status, setStatus] = useState<CharacterStatus | "">(initialStatus);
  const [input, setInput] = useState(searchParameters.get("query") || "");
  const [query, setQuery] = useState(searchParameters.get("query") || "");
  const characterRequest = useResource(signal => getCharacters({ page, pageSize: 24, house, status: status || undefined, query }, signal), [page, house, status, query]);
  const houseRequest = useResource(signal => getHouses(signal), []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (page) next.set("page", String(page));
    if (house) next.set("house", house);
    if (status) next.set("status", status);
    if (query) next.set("query", query);
    setSearchParameters(next, { replace: true });
  }, [page, house, status, query, setSearchParameters]);

  const submit = (event: FormEvent) => { event.preventDefault(); setPage(0); setQuery(input.trim()); };
  const loading = characterRequest.loading || houseRequest.loading;
  const error = characterRequest.error || houseRequest.error;
  const result = characterRequest.data ?? EMPTY;
  const houses = houseRequest.data?.items ?? [];
  const retry = () => { characterRequest.retry(); houseRequest.retry(); };

  return <main className="page"><div className="page-hero"><p className="eyebrow">PEOPLE SERVICE · DATABASE-BACKED</p><h1>People of Westeros</h1><p>Search 196 persisted records, filter them on the server, and open a profile to query its relationships.</p></div>
    <form className="filters" onSubmit={submit}><label><span>Search</span><input aria-label="Search" value={input} onChange={event => setInput(event.target.value)} placeholder="Name or actor" /></label><label><span>Allegiance</span><select aria-label="Allegiance" value={house} onChange={event => { setPage(0); setHouse(event.target.value); }}><option value="">All houses</option>{houses.map(item => <option key={item.name}>{item.name}</option>)}</select></label><label><span>Status</span><select aria-label="Status" value={status} onChange={event => { setPage(0); setStatus(event.target.value as CharacterStatus | ""); }}><option value="">All fates</option>{statuses.map(value => <option value={value} key={value}>{value[0] + value.slice(1).toLowerCase()}</option>)}</select></label><button type="submit">Search API</button></form>
    <div className="result-summary"><strong>{result.itemsCount}</strong> records matched by Spring Data JPA</div><PageState loading={loading} error={error} onRetry={retry} empty={!loading && !result.items.length} />
    <div className="character-grid">{result.items.map((character, index) => <Link to={`/people/${character.id}`} className={`character-card${index === 0 && page === 0 ? " featured" : ""}`} key={character.id} style={{ "--house-color": character.sigilColor } as React.CSSProperties}><div className="portrait"><img src={portraitUrl(character.portraitUrl)} alt={`Actor portrait for ${character.name}`} loading="lazy" onError={event => { event.currentTarget.src = fallbackAssetUrl(); }} /><span className="initials">{character.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</span><em>{character.status}</em></div><div className="card-copy"><p>{character.house}</p><h3>{character.name}</h3><span>Portrayed by {character.actor}</span>{index === 0 && <blockquote>{character.biography}</blockquote>}</div></Link>)}</div>
    {result.pagesCount > 1 && <nav className="pagination" aria-label="Character pages"><button type="button" disabled={!page} onClick={() => setPage(value => value - 1)}>Previous</button><span aria-live="polite">Page {page + 1} of {result.pagesCount}</span><button type="button" disabled={page + 1 >= result.pagesCount} onClick={() => setPage(value => value + 1)}>Next</button></nav>}
  </main>;
}
