import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCharacters, getHouses } from "../api";
import PageState from "../components/PageState";
import type { CharacterPage, CharacterStatus, House } from "../types";

const EMPTY: CharacterPage = { items: [], itemsCount: 0, page: 0, pageSize: 24, pagesCount: 0, links: { self: "/api/v1/characters" } };
export default function PeoplePage() {
  const [searchParameters] = useSearchParams();
  const [result,setResult]=useState(EMPTY); const [houses,setHouses]=useState<House[]>([]); const [page,setPage]=useState(0);
  const [house,setHouse]=useState(searchParameters.get("house") || ""); const [status,setStatus]=useState<CharacterStatus|"">(""); const [input,setInput]=useState(""); const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{const c=new AbortController();getHouses(c.signal).then(r=>setHouses(r.items));return()=>c.abort()},[]);
  useEffect(()=>{const c=new AbortController();setLoading(true);setError("");getCharacters({page,pageSize:24,house,status:status||undefined,query},c.signal).then(setResult).catch((e:Error)=>{if(e.name!=="AbortError")setError(e.message)}).finally(()=>setLoading(false));return()=>c.abort()},[page,house,status,query]);
  const submit=(event:FormEvent)=>{event.preventDefault();setPage(0);setQuery(input.trim())};
  return <main className="page"><div className="page-hero"><p className="eyebrow">PEOPLE SERVICE · DATABASE-BACKED</p><h1>People of Westeros</h1><p>Search 196 persisted records, filter them on the server, and open a profile to query its relationships.</p></div>
    <form className="filters" onSubmit={submit}><label><span>Search</span><input aria-label="Search" value={input} onChange={e=>setInput(e.target.value)} placeholder="Name or actor" /></label><label><span>Allegiance</span><select aria-label="Allegiance" value={house} onChange={e=>{setPage(0);setHouse(e.target.value)}}><option value="">All houses</option>{houses.map(h=><option key={h.name}>{h.name}</option>)}</select></label><label><span>Status</span><select aria-label="Status" value={status} onChange={e=>{setPage(0);setStatus(e.target.value as CharacterStatus|"")}}><option value="">All fates</option><option value="ALIVE">Alive</option><option value="DEAD">Dead</option><option value="UNKNOWN">Unknown</option></select></label><button>Search API</button></form>
    <div className="result-summary"><strong>{result.itemsCount}</strong> records matched by Spring Data JPA</div><PageState loading={loading} error={error} empty={!loading&&!result.items.length}/>
    <div className="character-grid">{result.items.map((character,index)=><Link to={`/people/${character.id}`} className={`character-card${index===0&&page===0?" featured":""}`} key={character.id} style={{"--house-color":character.sigilColor} as React.CSSProperties}><div className="portrait"><img src={character.portraitUrl} alt={`Actor portrait for ${character.name}`} loading="lazy" onError={e=>{e.currentTarget.style.display="none"}}/><span className="initials">{character.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</span><em>{character.status}</em></div><div className="card-copy"><p>{character.house}</p><h3>{character.name}</h3><span>Portrayed by {character.actor}</span>{index===0&&<blockquote>{character.biography}</blockquote>}</div></Link>)}</div>
    {result.pagesCount>1&&<nav className="pagination" aria-label="Character pages"><button disabled={!page} onClick={()=>setPage(v=>v-1)}>Previous</button><span>Page {page+1} of {result.pagesCount}</span><button disabled={page+1>=result.pagesCount} onClick={()=>setPage(v=>v+1)}>Next</button></nav>}
  </main>;
}
