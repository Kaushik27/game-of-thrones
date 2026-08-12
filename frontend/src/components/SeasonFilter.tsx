export default function SeasonFilter({ value, onChange }: { value: number | undefined; onChange: (season?: number) => void }) {
  return <div className="season-filter" role="group" aria-label="Filter by season"><button type="button" className={!value ? "active" : ""} aria-pressed={!value} onClick={() => onChange()}>All</button>{[1,2,3,4,5,6,7,8].map(season => <button type="button" className={value === season ? "active" : ""} aria-pressed={value === season} key={season} onClick={() => onChange(season)}>S{season}</button>)}</div>;
}
