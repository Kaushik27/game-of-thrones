import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const publishedContract = JSON.parse(read("realm-contract.json"));
const context = { window: {} };
vm.createContext(context);
for (const file of ["js/data.js", "js/events.js", "js/episodes.js", "js/quotes.js", "js/battles.js"]) {
  vm.runInContext(read(file), context, { filename: file });
}

const value = name => vm.runInContext(name, context);
const source = {
  characters: value("characters"),
  houses: Object.keys(value("HOUSE_COLORS")),
  episodes: value("EPISODES"),
  events: value("events"),
  quotes: value("quotes"),
  battles: value("battles")
};

const migration = ["V2__seed_character_records.sql", "V4__seed_realm_domains.sql"]
  .map(file => read(`backend/src/main/resources/db/migration/${file}`)).join("\n");
const rows = table => [...migration.matchAll(new RegExp(`INSERT INTO ${table}\\b[^;]*;`, "g"))]
  .map(match => match[0].match(/VALUES\s*\(\s*'((?:''|[^'])*)'/)?.[1]?.replace(/''/g, "'"))
  .filter(Boolean);
const projection = {
  characters: rows("character_records"),
  houses: rows("houses"),
  episodes: rows("episodes"),
  quotes: rows("quotes"),
  battles: rows("battles"),
  events: rows("story_events")
};

const ids = records => new Set(records.map(record => typeof record === "string" ? record : record.id));
const expected = {
  characters: ids(source.characters),
  houses: new Set(source.houses),
  episodes: ids(source.episodes),
  quotes: ids(source.quotes),
  battles: ids(source.battles),
  events: ids(source.events)
};

const failures = [];
for (const key of Object.keys(expected)) {
  const actual = new Set(projection[key]);
  const missing = [...expected[key]].filter(id => !actual.has(id));
  const extra = [...actual].filter(id => !expected[key].has(id));
  if (missing.length || extra.length || expected[key].size !== actual.size) {
    failures.push(`${key}: expected ${expected[key].size}, projected ${actual.size}; missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}`);
  }
}

if (failures.length) {
  console.error("Realm data contract failed");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  for (const [key, count] of Object.entries(publishedContract.collections)) {
    if (expected[key]?.size !== count) {
      console.error(`realm-contract.json count for ${key} is ${count}; expected ${expected[key]?.size}`);
      process.exitCode = 1;
    }
  }
  if (process.exitCode) process.exit(1);
  console.log(JSON.stringify({ result: "passed", counts: Object.fromEntries(Object.keys(expected).map(key => [key, expected[key].size])) }, null, 2));
}
