import fs from "node:fs";
import vm from "node:vm";

const context = vm.createContext({});
const evaluate = (relativePath, exports) => {
  const source = fs.readFileSync(new URL(relativePath, import.meta.url), "utf8");
  vm.runInContext(`${source}\n${exports}`, context);
};

evaluate("../js/data.js", "globalThis.seedCharacters = characters; globalThis.seedRelations = relations; globalThis.seedHouseInfo = HOUSE_INFO; globalThis.seedHouseColors = HOUSE_COLORS;");
evaluate("../js/episodes.js", "globalThis.seedEpisodes = EPISODES;");
evaluate("../js/quotes.js", "globalThis.seedQuotes = quotes;");
evaluate("../js/battles.js", "globalThis.seedBattles = battles;");
evaluate("../js/events.js", "globalThis.seedEvents = events;");

const escapeSql = (value) => String(value ?? "").replaceAll("'", "''");
const rows = context.seedCharacters.map((character) => {
  const status = ["alive", "dead"].includes(character.status) ? character.status.toUpperCase() : "UNKNOWN";
  const values = [
    character.id,
    character.name,
    character.house,
    status,
    character.actor,
    character.bio,
    character.sigilColor
  ].map((value) => `'${escapeSql(value)}'`).join(", ");
  return `INSERT INTO character_records (id, name, house, status, actor, biography, sigil_color) VALUES (${values});`;
});

const heading = "-- Generated from js/data.js by tools/generate-h2-character-seed.mjs.\n";
const destination = new URL("../backend/src/main/resources/db/migration/V2__seed_character_records.sql", import.meta.url);
fs.writeFileSync(destination, `${heading}${rows.join("\n")}\n`);

const sql = (value) => `'${escapeSql(value)}'`;
const json = (value) => sql(JSON.stringify(value ?? []));
const domainRows = [];

Object.entries(context.seedHouseInfo).forEach(([name, house]) => {
  domainRows.push(`INSERT INTO houses (name, words, seat, region, sigil, animal, ruler_end, sigil_color) VALUES (${[
    name, house.words, house.seat, house.region, house.sigil, house.animal, house.rulerEnd, context.seedHouseColors[name]
  ].map(sql).join(", ")});`);
});

context.seedRelations.forEach((relationship) => {
  domainRows.push(`INSERT INTO relationships (source_id, target_id, relationship_type, subtype, label) VALUES (${[
    relationship.source, relationship.target, relationship.type, relationship.subtype, relationship.label
  ].map(sql).join(", ")});`);
});

context.seedEpisodes.forEach((episode) => {
  domainRows.push(`INSERT INTO episodes (id, season_number, episode_number, title, air_date, runtime_minutes, director, writers_json, summary, themes_json, character_ids_json, event_ids_json) VALUES (${[
    sql(episode.id), episode.season, episode.episode, sql(episode.title), sql(episode.airDate), episode.runtime,
    sql(episode.director), json(episode.writers), sql(episode.summary), json(episode.themes),
    json(episode.characterIds), json(episode.eventIds)
  ].join(", ")});`);
});

context.seedQuotes.forEach((quote) => {
  domainRows.push(`INSERT INTO quotes (id, character_id, quote_text, season_number) VALUES (${[
    sql(quote.id), sql(quote.characterId), sql(quote.text), quote.season
  ].join(", ")});`);
});

context.seedBattles.forEach((battle) => {
  const season = Number(String(battle.season).match(/\d+/)?.[0]);
  domainRows.push(`INSERT INTO battles (id, name, season_number, location, combatants_json, outcome, casualties, linked_character_ids_json, linked_event_ids_json) VALUES (${[
    sql(battle.id), sql(battle.name), season, sql(battle.location), json(battle.combatants), sql(battle.outcome),
    sql(battle.casualties), json(battle.linkedCharacters), json(battle.linkedEvents)
  ].join(", ")});`);
});

context.seedEvents.forEach((event) => {
  domainRows.push(`INSERT INTO story_events (id, season_number, title, event_date, event_type, houses_json, character_ids_json, summary) VALUES (${[
    sql(event.id), event.season, sql(event.title), sql(event.date), sql(event.type), json(event.houses),
    json(event.characters), sql(event.summary)
  ].join(", ")});`);
});

const domainDestination = new URL("../backend/src/main/resources/db/migration/V4__seed_archive_domains.sql", import.meta.url);
fs.writeFileSync(domainDestination, `-- Generated from the curated legacy JavaScript datasets.\n${domainRows.join("\n")}\n`);

console.log(`Generated ${rows.length} characters, ${Object.keys(context.seedHouseInfo).length} houses, ${context.seedRelations.length} relationships, ${context.seedEpisodes.length} episodes, ${context.seedQuotes.length} quotes, ${context.seedBattles.length} battles, and ${context.seedEvents.length} events.`);
