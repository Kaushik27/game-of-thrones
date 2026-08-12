import { useState } from "react";
import { Link } from "react-router-dom";
import { getQuotes } from "../api";
import PageState from "../components/PageState";
import SeasonFilter from "../components/SeasonFilter";
import { useResource } from "../hooks/useResource";

export default function QuotesPage(){const [season,setSeason]=useState<number>();const {data,loading,error}=useResource(s=>getQuotes(season,s),[season]);return <main className="page"><div className="page-hero"><p className="eyebrow">QUOTE + CHARACTER JOIN</p><h1>Voices of the realm</h1><p>Every quote row references a character. JPA joins those tables so the API can return the speaker, house, text, and season together.</p></div><SeasonFilter value={season} onChange={setSeason}/><PageState loading={loading} error={error}/><div className="quote-grid">{data?.items.map((quote,index)=><blockquote className={index%7===0?"wide":""} key={quote.id}><span>“</span><p>{quote.text}</p><footer><Link to={`/people/${quote.characterId}`}>{quote.characterName}</Link><small>{quote.house} · Season {quote.season}</small></footer></blockquote>)}</div></main>}
