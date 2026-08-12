import { useState } from "react";
import { getBattles } from "../api";
import PageState from "../components/PageState";
import SeasonFilter from "../components/SeasonFilter";
import { useResource } from "../hooks/useResource";

export default function BattlesPage(){const [season,setSeason]=useState<number>();const {data,loading,error}=useResource(s=>getBattles(season,s),[season]);return <main className="page"><div className="page-hero"><p className="eyebrow">BATTLE SERVICE</p><h1>Wars that changed the realm</h1><p>Complex combatant arrays are stored as JSON inside H2 records, then decoded into typed Java and TypeScript objects.</p></div><SeasonFilter value={season} onChange={setSeason}/><PageState loading={loading} error={error} empty={!loading&&!data?.items.length}/><div className="battle-list">{data?.items.map(battle=><article key={battle.id}><header><div><p className="eyebrow">SEASON {battle.season} · {battle.location}</p><h2>{battle.name}</h2></div><strong>{battle.combatants.length} sides</strong></header><div className="combatants">{battle.combatants.map(side=><div key={side.side}><strong>{side.side}</strong><span>{side.houses.join(" · ")}</span></div>)}</div><p>{battle.outcome}</p><footer><span>Recorded casualties</span>{battle.casualties}</footer></article>)}</div></main>}
