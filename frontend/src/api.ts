import type { ApiTrace, BattlesResponse, Character, CharacterPage, CharacterStatus, EpisodePage, EventsResponse, HousesResponse, QuotePage, RelationshipsResponse, Statistics } from "./types";

export interface CharacterFilters {
  page: number;
  pageSize: number;
  house?: string;
  status?: CharacterStatus;
  query?: string;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const started = performance.now();
  publish({ method: "GET", path, state: "loading", at: Date.now() });
  try {
    const response = await fetch(path, { headers: { Accept: "application/json" }, signal });
    const trace: ApiTrace = { method: "GET", path, status: response.status, durationMs: Math.round(performance.now() - started),
      database: response.headers.get("Grainger-Archive-Data-Source") || undefined, state: response.ok ? "complete" : "error", at: Date.now() };
    publish(trace);
    if (!response.ok) {
      throw new Error(response.status === 503
        ? "The archive service is temporarily unavailable."
        : `The archive request failed (${response.status}).`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      publish({ method: "GET", path, durationMs: Math.round(performance.now() - started), state: "error", at: Date.now() });
    }
    throw error;
  }
}

function publish(trace: ApiTrace) { window.dispatchEvent(new CustomEvent<ApiTrace>("archive:api-trace", { detail: trace })); }

export function getCharacters(filters: CharacterFilters, signal?: AbortSignal): Promise<CharacterPage> {
  const parameters = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize)
  });
  if (filters.house) parameters.set("house", filters.house);
  if (filters.status) parameters.set("status", filters.status);
  if (filters.query) parameters.set("query", filters.query);
  return getJson(`/api/v1/characters?${parameters}`, signal);
}

export function getHouses(signal?: AbortSignal): Promise<HousesResponse> {
  return getJson("/api/v1/houses", signal);
}

export function getCharacter(id: string, signal?: AbortSignal): Promise<Character> { return getJson(`/api/v1/characters/${encodeURIComponent(id)}`, signal); }
export function getRelationships(id: string, signal?: AbortSignal): Promise<RelationshipsResponse> { return getJson(`/api/v1/characters/${encodeURIComponent(id)}/relationships`, signal); }
export function getEpisodes(season?: number, signal?: AbortSignal): Promise<EpisodePage> { return getJson(`/api/v1/episodes?pageSize=100${season ? `&season=${season}` : ""}`, signal); }
export function getQuotes(season?: number, signal?: AbortSignal): Promise<QuotePage> { return getJson(`/api/v1/quotes?pageSize=100${season ? `&season=${season}` : ""}`, signal); }
export function getBattles(season?: number, signal?: AbortSignal): Promise<BattlesResponse> { return getJson(`/api/v1/battles${season ? `?season=${season}` : ""}`, signal); }
export function getEvents(season?: number, signal?: AbortSignal): Promise<EventsResponse> { return getJson(`/api/v1/events${season ? `?season=${season}` : ""}`, signal); }
export function getStatistics(signal?: AbortSignal): Promise<Statistics> { return getJson("/api/v1/statistics", signal); }
export { getJson };
