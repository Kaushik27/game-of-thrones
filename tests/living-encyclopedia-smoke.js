"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(root, relativePath), "utf8");

const context = { window: {} };
vm.createContext(context);
[
  "js/data.js", "js/events.js", "js/episodes.js", "js/battles.js", "js/quotes.js",
  "js/quote-curation.js", "js/fan-moments.js", "js/lore-data.js", "js/chronicle-data.js", "js/what-if-data.js"
]
  .forEach(relativePath => vm.runInContext(read(relativePath), context, { filename: relativePath }));

const value = name => vm.runInContext(name, context);
const characters = value("characters");
const events = value("events");
const episodes = value("EPISODES");
const battles = value("battles");
const quotes = value("quotes");
const featuredQuoteIds = value("window.FEATURED_QUOTE_IDS");
const quoteCollections = value("window.QUOTE_COLLECTIONS");
const loreEntries = value("LORE_ENTRIES");
const fanMoments = value("window.FAN_MOMENTS");
const chronicle = value("window.REALM_CHRONICLE");
const whatIfs = value("window.WHAT_IFS");

assert.equal(characters.length, 196, "character catalogue changed unexpectedly");
assert.equal(episodes.length, 73, "episode catalogue must contain all 73 episodes");
assert.deepEqual(
  Array.from({ length: 8 }, (_, index) => episodes.filter(episode => episode.season === index + 1).length),
  [10, 10, 10, 10, 10, 10, 7, 6],
  "episode season counts must stay canonical"
);
assert.equal(loreEntries.length, 24, "lore library must retain all 24 dossiers");
assert.equal(new Set(loreEntries.map(entry => entry.category)).size, 6, "lore library must retain six categories");
assert.equal(fanMoments.length, 7, "fan memory reel must retain its seven editorial anchors");
assert.equal(chronicle.length, 15, "realm chronicle must retain its fifteen illustrated moments");
assert.equal(whatIfs.length, 6, "what-if chamber must retain its six fan branches");
whatIfs.forEach(record => {
  assert.ok(record.id && record.title && record.premise, "what-if branches need stable identity and premise");
  assert.ok(record.branches.length >= 3, `${record.id} needs multiple consequences`);
  record.relatedCharacters.forEach(characterId => assert.ok(characterIdsPlaceholder(characterId), `${record.id} references unknown character ${characterId}`));
});
assert.equal(new Set(chronicle.map(record => record.id)).size, chronicle.length, "chronicle IDs must be unique");
chronicle.forEach(record => {
  assert.ok(record.title && record.period && record.image, "chronicle records need title, period, and image");
  assert.ok(fs.existsSync(path.join(root, record.image)), `${record.id} image must exist locally`);
  assert.ok(Object.isFrozen(record.bullets), `${record.id} bullets must remain immutable`);
});
fanMoments.forEach(moment => {
  assert.ok(moment.id && moment.title && moment.image, "fan moments need stable identity, title, and imagery");
  assert.ok(characterIdsPlaceholder(moment.characterId), `${moment.id} must reference a known character`);
  assert.ok(fs.existsSync(path.join(root, moment.image)), `${moment.id} image must exist locally`);
});

function characterIdsPlaceholder(characterId) {
  return characters.some(character => character.id === characterId);
}

const eventsById = new Map(events.map(event => [event.id, event]));
const eventLinks = episodes.flatMap(episode => episode.eventIds.map(eventId => ({ eventId, episode })));
assert.equal(eventLinks.length, events.length, "every timeline event must map to exactly one episode");
assert.equal(new Set(eventLinks.map(link => link.eventId)).size, events.length, "timeline event mappings must be unique");
eventLinks.forEach(({ eventId, episode }) => {
  const event = eventsById.get(eventId);
  assert.ok(event, `episode ${episode.id} references unknown event ${eventId}`);
  assert.equal(event.season, episode.season, `${eventId} must map within its recorded season`);
  assert.ok(Object.isFrozen(episode.eventIds), `${episode.id} eventIds must remain immutable`);
});

const characterIds = new Set(characters.map(character => character.id));
episodes.forEach(episode => episode.characterIds.forEach(characterId => {
  assert.ok(characterIds.has(characterId), `${episode.id} references unknown character ${characterId}`);
}));
loreEntries.forEach(entry => entry.relatedCharacterIds.forEach(characterId => {
  assert.ok(characterIds.has(characterId), `${entry.id} references unknown character ${characterId}`);
}));

const appSource = read("js/app.js");
const portalSource = read("js/cinematic-portal.js");
const cinematicSource = read("js/cinematic-realm.js");
const ravenSource = read("js/raven-search.js");
const storySource = read("js/story-atlas.js");
const worldSource = read("js/world-atlas.js");
const loreSource = read("js/lore-library.js");
const peopleSource = read("js/people-intelligence.js");
const ravenWallSource = read("js/raven-wall.js");
const atmosphereSource = read("js/global-atmosphere.js");
const navSource = read("src/react-nav-entry.jsx");
const realmShellSource = read("css/realm-shell.css");
const chronicleSource = read("js/chronicle-timeline.js");
const compassSource = read("js/realm-compass.js");
const whatIfSource = read("js/what-if.js");
const deskSource = read("js/maesters-desk.js");

const contracts = [
  [appSource.includes('initialEventId: query.get("event") || ""'), "app must pass event deep links to StoryAtlas"],
  [appSource.includes("window.CinematicRealm.mount"), "Explore must mount the cinematic realm shell"],
  [portalSource.includes("CinematicPortal") && portalSource.includes("destination-out"), "Explore must provide a canvas portal handoff"],
  [cinematicSource.includes("portalHandle.enter") && cinematicSource.includes("onDone"), "Explore must route the entry CTA through the portal"],
  [appSource.includes('query.get("battle") || ""'), "Battles must consume exact battle IDs"],
  [appSource.includes('query.get("quote") || ""'), "Quotes must consume exact quote IDs"],
  [cinematicSource.includes("cinematic-prologue") && cinematicSource.includes("scrollToProgress"), "Cinematic Explore must expose a scroll-driven prologue"],
  [cinematicSource.includes("data-cinematic-focus-image") && cinematicSource.includes("data-cinematic-moments"), "Cinematic Explore must expose a focal character and story moments"],
  [cinematicSource.includes("data-cinematic-quote-text") && cinematicSource.includes("quoteId"), "Cinematic Explore must surface a featured quote per chapter"],
  [cinematicSource.includes("data-cinematic-navigate") && cinematicSource.includes("#/battles?battle=red-wedding"), "Cinematic moments must link into living realm routes"],
  [cinematicSource.includes("global.RealmJourney.mount"), "Cinematic Explore must hand off to RealmJourney"],
  [appSource.includes("onEntryChange: entry => replaceHashQuery"), "Lore entry state must stay in the URL"],
  [appSource.includes("onCategoryChange: category => replaceHashQuery"), "Lore category state must stay in the URL"],
  [ravenSource.includes('mode: "consequences"') && ravenSource.includes("eventQuery.set"), "Raven event results must include their StoryAtlas context"],
  [storySource.includes("config.initialEventId") && storySource.includes("episode.eventIds.includes"), "StoryAtlas must resolve explicit event-to-episode links"],
  [worldSource.includes('#/battles?battle=${encodeURIComponent(record.id)}'), "World battle stops must target exact records"],
  [worldSource.includes('&event=${encodeURIComponent(record.id)}'), "World event stops must target exact records"],
  [loreSource.includes("settings.onEntryChange") && loreSource.includes("settings.onCategoryChange"), "Lore must publish drawer and category changes"],
  [loreSource.includes("drawer.contains(document.activeElement)"), "Lore must not close when a higher modal owns focus"],
  [peopleSource.includes('detailLayer.toggleAttribute("inert", detailCoveredByComparison)'), "People must inert a dossier beneath comparison"],
  [ravenWallSource.includes("global.RavenWall") && ravenWallSource.includes("data-rw-remember"), "Memory Wall must expose a remembered fan-fragment interaction"],
  [ravenWallSource.includes("data-rw-share") && ravenWallSource.includes("data-rw-personal-note"), "Memory Wall must expose shareable fragments and private fan notes"],
  [ravenWallSource.includes("data-rw-submit-form") && ravenWallSource.includes("pending-review"), "Memory Wall must expose a moderated fan fragment draft flow"],
  [atmosphereSource.includes("global.GotAtmosphere") && atmosphereSource.includes("AudioContext"), "Atmosphere must remain opt-in and locally synthesized"],
  [appSource.includes("got:route-change") && appSource.includes("route-enter"), "route changes must publish a shared cinematic transition state"],
  [!appSource.includes("RealmCompass") && !navSource.includes("realm-lens"), "the retired spoiler lens must not remain in the active shell"],
  [navSource.includes("data-atmosphere-control") && navSource.includes("GotAtmosphere"), "React shell must own the persistent atmosphere control"],
  [realmShellSource.includes("body.realm-route") && realmShellSource.includes("--realm-gold"), "realm routes must share a visual shell token system"],
  [appSource.includes("window.RavenWall.mount") && appSource.includes("atlasRequested"), "Timeline must route plain navigation to the Memory Wall and preserve the Episode Atlas"]
  , [appSource.includes("viewChronicle") && appSource.includes("window.RealmChronicle.mount"), "Chronicle must have a dedicated route and mount"]
  , [chronicleSource.includes("data-chronicle-filter") && chronicleSource.includes("data-chronicle-random"), "Chronicle must expose filter and surprise interactions"]
  , [chronicleSource.includes("IntersectionObserver") && chronicleSource.includes("updateProgress"), "Chronicle must respond to scroll with reveal and progress states"]
  , [chronicleSource.includes("dustHTML") && chronicleSource.includes("onPointerMove"), "Chronicle must provide ambient and pointer-driven life"]
  , [chronicleSource.includes("const spoilerVisible = records"), "Chronicle must show the complete fan realm"]
  , [chronicleSource.includes("function entryButton") && chronicleSource.includes("Open moment"), "Chronicle cards must expose a resilient click target and visible action cue"]
  , [realmShellSource.includes("realm-horizon-drift") && realmShellSource.includes("north-journey-bg.jpg") && realmShellSource.includes("capital-journey-bg.jpg"), "realm routes must share a fluid atmospheric backdrop"]
  , [realmShellSource.includes("overflow: clip") && realmShellSource.includes("body.realm-route #app"), "realm atmosphere must stay inside the page frame"]
  , [peopleSource.includes("observeSpotlightCards") && peopleSource.includes("handleSpotlightPointerMove"), "People spotlight must provide scroll and pointer interaction"]
  , [appSource.includes("houses-page") && appSource.includes("data-house-card"), "Houses must use the cinematic banner directory"]
  , [compassSource.includes("randomDestination"), "the realm compass module remains available for legacy imports"]
  , [ravenSource.includes('key: "what-if"') && ravenSource.includes("getWhatIfs"), "global search must index fan counterfactual branches"]
  , [whatIfSource.includes("WhatIfChamber") && whatIfSource.includes("Fan speculation"), "realm must provide a clearly labeled counterfactual chamber"]
  , [deskSource.includes("MaestersDesk") && deskSource.includes("Image provenance"), "realm must provide a source and provenance desk"]
];
contracts.forEach(([condition, message]) => assert.ok(condition, message));

assert.equal(new Set(battles.map(battle => battle.id)).size, battles.length, "exact battle destinations require unique IDs");
assert.equal(new Set(quotes.map(quote => quote.id)).size, quotes.length, "exact quote destinations require unique IDs");
const quoteIds = new Set(quotes.map(quote => quote.id));
assert.ok(featuredQuoteIds.length >= 8, "the Voices realm must keep a meaningful featured set");
assert.ok(Object.isFrozen(featuredQuoteIds), "featured quote IDs must remain immutable");
featuredQuoteIds.forEach(quoteId => assert.ok(quoteIds.has(quoteId), `featured quote ${quoteId} must exist in quotes.js`));
assert.ok(quoteCollections.length >= 4, "the Voices realm must keep multiple editorial collections");
assert.ok(Object.isFrozen(quoteCollections), "quote collections must remain immutable");
quoteCollections.forEach(collection => {
  assert.ok(collection.id && collection.label, "quote collections need stable IDs and labels");
  assert.ok(Object.isFrozen(collection.quoteIds), `${collection.id} quote IDs must remain immutable`);
  collection.quoteIds.forEach(quoteId => assert.ok(quoteIds.has(quoteId), `${collection.id} references unknown quote ${quoteId}`));
});

const indexSource = read("index.html");
const scripts = [...indexSource.matchAll(/<script[^>]+src="([^"]+)"/g)]
  .map(match => match[1].split("?")[0]);
assert.ok(scripts.indexOf("js/episodes.js") < scripts.indexOf("js/story-atlas.js"), "episodes must load before StoryAtlas");
assert.ok(scripts.indexOf("js/realm-journey.js") < scripts.indexOf("js/cinematic-realm.js"), "RealmJourney must load before cinematic Explore");
assert.ok(scripts.indexOf("js/cinematic-portal.js") < scripts.indexOf("js/cinematic-realm.js"), "Cinematic portal must load before Explore");
assert.ok(scripts.indexOf("js/cinematic-realm.js") < scripts.indexOf("js/app.js"), "cinematic Explore must load before the router");
assert.ok(scripts.indexOf("js/quotes.js") < scripts.indexOf("js/quote-curation.js"), "quotes must load before quote curation");
assert.ok(scripts.indexOf("js/fan-moments.js") < scripts.indexOf("js/app.js"), "fan moments must load before the router");
assert.ok(scripts.indexOf("js/raven-wall.js") < scripts.indexOf("js/app.js"), "Memory Wall must load before the router");
assert.ok(scripts.indexOf("js/global-atmosphere.js") < scripts.indexOf("js/app.js"), "atmosphere must load before route rendering");
assert.ok(indexSource.includes("css/realm-shell.css?v=realm-shell-4"), "shared realm shell must load in the static entrypoint");
assert.ok(indexSource.includes("css/houses.css?v=houses-9"), "houses styling must load in the static entrypoint");
assert.ok(indexSource.includes("css/what-if.css?v=what-if-1"), "what-if styling must load in the static entrypoint");
assert.ok(indexSource.includes("css/maesters-desk.css?v=maesters-desk-1"), "maesters desk styling must load in the static entrypoint");
assert.ok(scripts.indexOf("js/what-if-data.js") < scripts.indexOf("js/what-if.js"), "what-if data must load before its module");
assert.ok(scripts.indexOf("js/maesters-desk.js") < scripts.indexOf("js/app.js"), "maesters desk must load before the router");
assert.ok(scripts.indexOf("js/quote-curation.js") < scripts.indexOf("js/app.js"), "quote curation must load before the router");
assert.ok(scripts.indexOf("js/lore-data.js") < scripts.indexOf("js/lore-library.js"), "lore data must load before LoreLibrary");
assert.ok(scripts.indexOf("js/story-atlas.js") < scripts.indexOf("js/app.js"), "feature modules must load before the router");
assert.ok(scripts.indexOf("js/chronicle-data.js") < scripts.indexOf("js/chronicle-timeline.js"), "chronicle data must load before the module");
assert.ok(scripts.indexOf("js/chronicle-timeline.js") < scripts.indexOf("js/app.js"), "chronicle module must load before the router");
assert.ok(indexSource.includes("css/realm-chronicle.css?v=realm-chronicle-2"), "chronicle styling must load in the static entrypoint");

console.log(JSON.stringify({
  characters: characters.length,
  episodes: episodes.length,
  eventsMapped: eventLinks.length,
  battles: battles.length,
  quotes: quotes.length,
  loreEntries: loreEntries.length,
  routeContracts: contracts.length,
  result: "passed"
}, null, 2));
