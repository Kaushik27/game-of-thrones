import { getEpisodes, getEvents } from "../api";
import PageState from "../components/PageState";
import SeasonFilter from "../components/SeasonFilter";
import { useResource } from "../hooks/useResource";
import { useSeasonQuery } from "../hooks/useSeasonQuery";
import { usePageQuery } from "../hooks/usePageQuery";

export default function StoriesPage() {
  const [season, setSeason] = useSeasonQuery();
  const [page, setPage] = usePageQuery();
  const episodes = useResource(signal => getEpisodes(season, page, 20, signal), [season, page]);
  const events = useResource(signal => getEvents(season, page, 20, signal), [season, page]);
  const retry = () => { episodes.retry(); events.retry(); };
  return <main className="page"><div className="page-hero"><p className="eyebrow">EPISODE + EVENT SERVICES</p><h1>The story, season by season</h1><p>Filtering changes the URL parameters sent to Spring Boot. The backend queries H2 and returns only the requested season.</p></div><SeasonFilter value={season} onChange={value => { setSeason(value); setPage(0); }}/><PageState loading={episodes.loading || events.loading} error={episodes.error || events.error} onRetry={retry}/><div className="story-layout"><section><div className="section-heading"><div><p className="eyebrow">{episodes.data?.itemsCount || 0} EPISODES</p><h2>Episode catalogue</h2></div></div><div className="episode-list">{episodes.data?.items.map(episode => <article key={episode.id}><div className="episode-number"><strong>S{episode.season}</strong><span>E{episode.episode}</span></div><div><p className="eyebrow">{episode.airDate} · {episode.runtimeMinutes} MINUTES</p><h3>{episode.title}</h3><p>{episode.summary}</p><div className="tags">{episode.themes.map(theme => <span key={theme}>{theme}</span>)}</div><small>Directed by {episode.director}</small></div></article>)}</div></section><aside><div className="section-heading"><div><p className="eyebrow">{events.data?.itemsCount || 0} TURNING POINTS</p><h2>Event timeline</h2></div></div><div className="event-timeline">{events.data?.items.map(event => <article key={event.id}><span className={`event-type ${event.type}`}>{event.type}</span><strong>{event.title}</strong><p>{event.summary}</p></article>)}</div></aside></div>{episodes.data && episodes.data.pagesCount > 1 && <nav className="pagination" aria-label="Story pages"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><span aria-live="polite">Page {episodes.data.page + 1} of {episodes.data.pagesCount}</span><button type="button" disabled={page + 1 >= episodes.data.pagesCount} onClick={() => setPage(value => value + 1)}>Next</button></nav>}</main>;
}
