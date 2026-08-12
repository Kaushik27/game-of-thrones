import { getBattles } from "../api";
import PageState from "../components/PageState";
import SeasonFilter from "../components/SeasonFilter";
import { useResource } from "../hooks/useResource";
import { useSeasonQuery } from "../hooks/useSeasonQuery";
import { usePageQuery } from "../hooks/usePageQuery";

export default function BattlesPage() {
  const [season, setSeason] = useSeasonQuery();
  const [page, setPage] = usePageQuery();
  const result = useResource(signal => getBattles(season, page, 20, signal), [season, page]);

  return <main className="page">
    <div className="page-hero"><p className="eyebrow">BATTLE SERVICE</p><h1>Wars that changed the realm</h1><p>Complex combatant arrays are stored as JSON inside H2 records, then decoded into typed Java and TypeScript objects.</p></div>
    <SeasonFilter value={season} onChange={value => { setSeason(value); setPage(0); }} />
    <PageState loading={result.loading} error={result.error} onRetry={result.retry} empty={!result.loading && !result.data?.items.length} />
    <div className="battle-list">{result.data?.items.map(battle => <article key={battle.id}><header><div><p className="eyebrow">SEASON {battle.season} · {battle.location}</p><h2>{battle.name}</h2></div><strong>{battle.combatants.length} sides</strong></header><div className="combatants">{battle.combatants.map(side => <div key={side.side}><strong>{side.side}</strong><span>{side.houses.join(" · ")}</span></div>)}</div><p>{battle.outcome}</p><footer><span>Recorded casualties</span>{battle.casualties}</footer></article>)}</div>
    {result.data && result.data.pagesCount > 1 && <nav className="pagination" aria-label="Battle pages"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><span aria-live="polite">Page {result.data.page + 1} of {result.data.pagesCount}</span><button type="button" disabled={page + 1 >= result.data.pagesCount} onClick={() => setPage(value => value + 1)}>Next</button></nav>}
  </main>;
}
