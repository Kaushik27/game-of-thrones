import { Link } from "react-router-dom";
import { getQuotes } from "../api";
import PageState from "../components/PageState";
import SeasonFilter from "../components/SeasonFilter";
import { useResource } from "../hooks/useResource";
import { useSeasonQuery } from "../hooks/useSeasonQuery";
import { usePageQuery } from "../hooks/usePageQuery";

export default function QuotesPage() {
  const [season, setSeason] = useSeasonQuery();
  const [page, setPage] = usePageQuery();
  const result = useResource(signal => getQuotes(season, page, 20, signal), [season, page]);
  return <main className="page"><div className="page-hero"><p className="eyebrow">QUOTE + CHARACTER JOIN</p><h1>Voices of the realm</h1><p>Every quote row references a character. JPA joins those tables so the API can return the speaker, house, text, and season together.</p></div><SeasonFilter value={season} onChange={value => { setSeason(value); setPage(0); }}/><PageState loading={result.loading} error={result.error} onRetry={result.retry} empty={!result.loading && !result.data?.items.length}/><div className="quote-grid">{result.data?.items.map((quote, index) => <blockquote className={index % 7 === 0 ? "wide" : ""} key={quote.id}><span>“</span><p>{quote.text}</p><footer><Link to={`/people/${quote.characterId}`}>{quote.characterName}</Link><small>{quote.house} · Season {quote.season}</small></footer></blockquote>)}</div>{result.data && result.data.pagesCount > 1 && <nav className="pagination" aria-label="Quote pages"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><span aria-live="polite">Page {result.data.page + 1} of {result.data.pagesCount}</span><button type="button" disabled={page + 1 >= result.data.pagesCount} onClick={() => setPage(value => value + 1)}>Next</button></nav>}</main>;
}
