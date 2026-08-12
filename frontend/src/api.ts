import type { ApiTrace, BattlesResponse, Character, CharacterPage, CharacterStatus, DatabaseRecordPage, DatabaseTablesResponse, EpisodePage, EventsResponse, HousesResponse, QuotePage, RelationshipsResponse, Statistics } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

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
  const timeoutController = new AbortController();
  let timedOut = false;
  let tracePublished = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, REQUEST_TIMEOUT_MS);
  const abort = () => timeoutController.abort();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: timeoutController.signal
    });
    const trace: ApiTrace = { method: "GET", path, status: response.status, durationMs: Math.round(performance.now() - started),
      database: response.headers.get("Archive-Data-Source") || undefined, state: response.ok ? "complete" : "error", at: Date.now() };
    publish(trace);
    tracePublished = true;
    if (!response.ok) {
      const problem = await response.json().catch(() => undefined) as { detail?: string } | undefined;
      throw new Error(problem?.detail || (response.status === 503
        ? "The archive service is temporarily unavailable."
        : `The archive request failed (${response.status}).`));
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (timedOut) throw new Error("The archive request timed out. Try again.");
    if ((error as Error).name !== "AbortError" && !tracePublished) {
      publish({ method: "GET", path, durationMs: Math.round(performance.now() - started), state: "error", at: Date.now() });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
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
export function getEpisodes(season?: number, page = 0, pageSize = 20, signal?: AbortSignal): Promise<EpisodePage> {
  const parameters = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (season) parameters.set("season", String(season));
  return getJson(`/api/v1/episodes?${parameters}`, signal);
}
export function getQuotes(season?: number, page = 0, pageSize = 20, signal?: AbortSignal): Promise<QuotePage> {
  const parameters = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (season) parameters.set("season", String(season));
  return getJson(`/api/v1/quotes?${parameters}`, signal);
}
export function getBattles(season?: number, page = 0, pageSize = 20, signal?: AbortSignal): Promise<BattlesResponse> {
  const parameters = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (season) parameters.set("season", String(season));
  return getJson(`/api/v1/battles?${parameters}`, signal);
}
export function getEvents(season?: number, page = 0, pageSize = 20, signal?: AbortSignal): Promise<EventsResponse> {
  const parameters = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (season) parameters.set("season", String(season));
  return getJson(`/api/v1/events?${parameters}`, signal);
}
export function getStatistics(signal?: AbortSignal): Promise<Statistics> { return getJson("/api/v1/statistics", signal); }
export function getDatabaseTables(signal?: AbortSignal): Promise<DatabaseTablesResponse> { return getJson("/api/v1/database/tables", signal); }
export function getDatabaseRecords(table: string, page: number, pageSize: number, signal?: AbortSignal): Promise<DatabaseRecordPage> {
  return getJson(`/api/v1/database/tables/${encodeURIComponent(table)}/records?page=${page}&pageSize=${pageSize}`, signal);
}
export { getJson };
