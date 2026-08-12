import { useSearchParams } from "react-router-dom";

const VALID_SEASONS = new Set([1, 2, 3, 4, 5, 6, 7, 8]);

export function useSeasonQuery(): [number | undefined, (season?: number) => void] {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const parsed = Number(searchParameters.get("season"));
  const season = VALID_SEASONS.has(parsed) ? parsed : undefined;
  const setSeason = (nextSeason?: number) => {
    const next = new URLSearchParams(searchParameters);
    next.delete("page");
    if (nextSeason) next.set("season", String(nextSeason));
    else next.delete("season");
    setSearchParameters(next, { replace: true });
  };
  return [season, setSeason];
}
