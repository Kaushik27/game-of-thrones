import { afterEach, describe, expect, it, vi } from "vitest";
import { getDatabaseTables, getStatistics } from "./api";
import type { ApiTrace, Statistics } from "./types";

describe("API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns typed JSON and publishes the complete request journey", async () => {
    const payload: Statistics = { characters: 196, houses: 12, relationships: 437, episodes: 73,
      quotes: 44, battles: 9, events: 34, database: "H2", generatedAt: "2026-08-12T00:00:00Z" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), {
      status: 200, headers: { "Content-Type": "application/json", "Archive-Data-Source": "H2" }
    })));
    const traces: ApiTrace[] = [];
    window.addEventListener("archive:api-trace", event => traces.push((event as CustomEvent<ApiTrace>).detail));

    await expect(getStatistics()).resolves.toEqual(payload);
    expect(fetch).toHaveBeenCalledWith("/api/v1/statistics", expect.objectContaining({ headers: { Accept: "application/json" } }));
    expect(traces.map(trace => trace.state)).toEqual(["loading", "complete"]);
    expect(traces[1]).toEqual(expect.objectContaining({ status: 200, database: "H2" }));
  });

  it("turns an unsuccessful HTTP response into a readable error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    await expect(getStatistics()).rejects.toThrow("The archive request failed (500).");
  });

  it("loads the allowlisted database catalog through the API", async () => {
    const payload = { items: [{ name: "character_records", displayName: "Characters", recordCount: 196, columns: [{ name: "id", type: "VARCHAR" }] }], itemsCount: 1 };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })));
    await expect(getDatabaseTables()).resolves.toEqual(payload);
    expect(fetch).toHaveBeenCalledWith("/api/v1/database/tables", expect.objectContaining({ headers: { Accept: "application/json" } }));
  });
});
