export default function SeasonFilter({ value, onChange }: { value: number | undefined; onChange: (season?: number) => void }) {
  return <div className="season-filter" role="group" aria-label="Filter by season"><button className={!value ? "active" : ""} onClick={() => onChange()}>All</button>{[1,2,3,4,5,6,7,8].map(season => <button className={value === season ? "active" : ""} key={season} onClick={() => onChange(season)}>S{season}</button>)}</div>;
}
