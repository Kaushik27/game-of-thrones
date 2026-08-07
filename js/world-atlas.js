// Cinematic, season-aware World experience.
//
// This module intentionally builds on the site's existing, grounded records:
// LivingRealmMap owns the interactive atlas; REALM_CHAPTERS supplies editorial
// journey markers; map-data.js supplies regions and places; and events.js /
// battles.js supply the seasonal political record. It does not infer borders,
// routes, or rulers that are not present in those sources.
(function installWorldAtlas(window, document) {
  "use strict";

  const instances = new WeakMap();
  const SEASON_NUMBERS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);
  const MODES = Object.freeze(["atlas", "journeys", "power", "lore"]);
  const MODE_LABELS = Object.freeze({
    atlas: "Atlas",
    journeys: "Journeys",
    power: "Power",
    lore: "Lore"
  });
  const JOURNEY_PEOPLE = Object.freeze([
    { id: "jon-snow", label: "Jon Snow", portrait: "assets/actors/jon-snow.jpg" },
    { id: "arya-stark", label: "Arya Stark", portrait: "assets/actors/arya-stark.jpg" },
    { id: "daenerys-targaryen", label: "Daenerys Targaryen", portrait: "assets/actors/daenerys-targaryen.jpg" },
    { id: "jaime-lannister", label: "Jaime Lannister", portrait: "assets/actors/jaime-lannister.jpg" }
  ]);
  const HOUSE_TEXT_COLORS = Object.freeze({
    Stark: "#c8ced6",
    Lannister: "#d3a24c",
    Targaryen: "#df817c",
    Baratheon: "#d4af37",
    Greyjoy: "#69b8b5",
    Tyrell: "#83b878",
    Martell: "#e38c57",
    Tully: "#7fa8d1",
    Arryn: "#79b2d9",
    "Night's Watch": "#a2a2aa",
    "Free Folk": "#91a8c0",
    Unaffiliated: "#9b9ba4"
  });
  const WORLD_STOPS = Object.freeze([
    { id: "winterfell", label: "Winterfell", region: "The North", image: "assets/ui/north-journey-bg.jpg", quote: "The things we do for love.", story: "The road begins under a grey sky, where family is still a kind of power.", detail: "The Starks leave home and the realm starts to tilt.", href: "#/timeline?season=1&mode=consequences" },
    { id: "the-wall", label: "The Wall", region: "The edge of the world", image: "assets/ui/north-journey-bg.jpg", quote: "The night is dark and full of terrors.", story: "North becomes a direction, then a duty, then a warning.", detail: "The last watch keeps its promise while the living look away.", href: "#/map?season=1" },
    { id: "kings-landing", label: "King's Landing", region: "The capital", image: "assets/ui/capital-journey-bg.jpg", quote: "When you play the game of thrones, you win or you die.", story: "Every corridor has a witness. Every crown has a price.", detail: "Power changes hands long before the throne moves.", href: "#/timeline?season=2&mode=power" },
    { id: "meereen", label: "Meereen", region: "Across the Narrow Sea", image: "assets/ui/essos-journey-bg.jpg", quote: "I am not going to stop the wheel. I'm going to break the wheel.", story: "A queen crosses the world and discovers that liberation has an afterlife.", detail: "The city becomes a test of what conquest is meant to leave behind.", href: "#/character/daenerys-targaryen" },
    { id: "beyond-the-wall", label: "Beyond the Wall", region: "The long night", image: "assets/ui/north-journey-bg.jpg", quote: "There is only one war that matters, the war between the living and the dead.", story: "The map falls away. The story becomes survival.", detail: "At the end of the road, the realm remembers what it was built to protect.", href: "#/timeline?season=8&mode=consequences" }
  ]);

  let nextInstanceId = 0;

  function escapeMarkup(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeWords(value) {
    return String(value == null ? "" : value)
      .toLocaleLowerCase()
      .replace(/[’']/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizeSeason(value) {
    const match = String(value == null ? "" : value).match(/(?:^|\D)([1-8])(?:\D|$)/);
    return match ? Number(match[1]) : null;
  }

  function safeColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{3,8}$/i.test(color) ? color : "#cba85c";
  }

  function houseTextColor(house) {
    return HOUSE_TEXT_COLORS[house] || "#aaa69d";
  }

  function clampPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 50;
    return Math.max(5, Math.min(95, number));
  }

  function parseViewBox(value) {
    const parts = String(value || "-90 -60 880 1090").trim().split(/[\s,]+/).map(Number);
    if (parts.length !== 4 || parts.some(part => !Number.isFinite(part)) || parts[2] <= 0 || parts[3] <= 0) {
      return [-90, -60, 880, 1090];
    }
    return parts;
  }

  function getRuntimeData() {
    const runtime = {
      livingMap: window.LivingRealmMap,
      chapters: Array.isArray(window.REALM_CHAPTERS) ? window.REALM_CHAPTERS : [],
      viewBox: typeof MAP_VIEWBOX !== "undefined" ? MAP_VIEWBOX : "-90 -60 880 1090",
      regions: typeof MAP_REGIONS !== "undefined" && Array.isArray(MAP_REGIONS) ? MAP_REGIONS : [],
      settlements: typeof MAP_SETTLEMENTS !== "undefined" && Array.isArray(MAP_SETTLEMENTS) ? MAP_SETTLEMENTS : [],
      events: typeof events !== "undefined" && Array.isArray(events) ? events : [],
      battles: typeof battles !== "undefined" && Array.isArray(battles) ? battles : [],
      characters: typeof characters !== "undefined" && Array.isArray(characters) ? characters : [],
      houseInfo: typeof HOUSE_INFO !== "undefined" && HOUSE_INFO ? HOUSE_INFO : {},
      houseColors: typeof HOUSE_COLORS !== "undefined" && HOUSE_COLORS ? HOUSE_COLORS : {}
    };

    if (!runtime.livingMap || typeof runtime.livingMap.mount !== "function") {
      throw new Error("WorldAtlas requires LivingRealmMap.");
    }
    if (!runtime.regions.length || !runtime.settlements.length) {
      throw new Error("WorldAtlas requires MAP_REGIONS and MAP_SETTLEMENTS.");
    }
    if (!runtime.chapters.length) {
      throw new Error("WorldAtlas requires REALM_CHAPTERS.");
    }

    runtime.viewBoxParts = parseViewBox(runtime.viewBox);
    runtime.charactersById = new Map(runtime.characters.map(character => [character.id, character]));
    runtime.regionsById = new Map(runtime.regions.map(region => [region.id, region]));
    runtime.settlementsByName = new Map(runtime.settlements.map(place => [normalizeWords(place.name), place]));
    return runtime;
  }

  function asMapPercent(runtime, x, y) {
    const [vx, vy, vw, vh] = runtime.viewBoxParts;
    return {
      x: clampPercent(((Number(x) - vx) / vw) * 100),
      y: clampPercent(((Number(y) - vy) / vh) * 100)
    };
  }

  function resolveRecordLocation(runtime, sourceText) {
    const text = ` ${normalizeWords(sourceText)} `;
    if (!text.trim()) return null;

    const settlements = runtime.settlements
      .filter(place => place && place.name && Number.isFinite(place.x) && Number.isFinite(place.y))
      .slice()
      .sort((a, b) => b.name.length - a.name.length);
    const place = settlements.find(item => text.includes(` ${normalizeWords(item.name)} `));
    if (place) {
      return {
        label: place.name,
        kind: place.kind || "place",
        precision: "mapped place",
        ...asMapPercent(runtime, place.x, place.y)
      };
    }

    const aliases = [];
    runtime.regions.forEach(region => {
      aliases.push({ phrase: normalizeWords(region.name), region });
      aliases.push({ phrase: normalizeWords(region.name).replace(/^the /, ""), region });
      aliases.push({ phrase: normalizeWords(region.id.replace(/-/g, " ")), region });
    });
    aliases.sort((a, b) => b.phrase.length - a.phrase.length);
    const match = aliases.find(entry => entry.phrase.length > 2 && text.includes(` ${entry.phrase} `));
    if (!match) return null;
    const anchor = match.region.labelXY || match.region.seatXY;
    if (!Array.isArray(anchor) || anchor.length < 2) return null;
    return {
      label: match.region.name,
      kind: "region",
      precision: "regional anchor",
      ...asMapPercent(runtime, anchor[0], anchor[1])
    };
  }

  function buildJourneySteps(runtime, personId) {
    const steps = [];
    const linkedBattleEvents = new Set();

    runtime.chapters.forEach(seasonChapter => {
      const personMarkers = seasonChapter.markers.filter(marker => marker.characterId === personId);
      if (!personMarkers.length) return;
      const personMarkerIds = new Set(personMarkers.map(marker => marker.id));
      const markerById = new Map(seasonChapter.markers.map(marker => [marker.id, marker]));

      seasonChapter.chapters.forEach(storyChapter => {
        if (!storyChapter.markerIds.some(id => personMarkerIds.has(id))) return;
        const personMarker = personMarkers.find(marker => storyChapter.markerIds.includes(marker.id)) || personMarkers[0];
        const relatedMarkers = storyChapter.markerIds
          .map(id => markerById.get(id))
          .filter(marker => marker && marker.id !== personMarker.id);
        const anchor = relatedMarkers.find(marker => marker.type === "place" || marker.type === "battle") || personMarker;

        steps.push({
          id: `chapter-${seasonChapter.season}-${storyChapter.id}-${anchor.id}`,
          season: Number(seasonChapter.season),
          title: storyChapter.title,
          location: anchor.label,
          locationKind: anchor.type === "battle" ? "conflict site" : (anchor.type || "chapter marker"),
          detail: anchor.detail || personMarker.detail || seasonChapter.summary,
          context: seasonChapter.summary,
          sourceLabel: "Realm chapter marker",
          precision: "editorial scene placement",
          x: clampPercent(anchor.x),
          y: clampPercent(anchor.y),
          navigate: anchor.navigate || personMarker.navigate || `#/character/${encodeURIComponent(personId)}`,
          sourceRank: 1
        });
      });
    });

    runtime.battles.forEach(record => {
      if (!Array.isArray(record.linkedCharacters) || !record.linkedCharacters.includes(personId)) return;
      const season = normalizeSeason(record.season);
      const location = resolveRecordLocation(runtime, `${record.location || ""} ${record.name || ""}`);
      if (!season || !location) return;
      (record.linkedEvents || []).forEach(eventId => linkedBattleEvents.add(eventId));
      steps.push({
        id: `battle-${record.id}`,
        season,
        title: record.name,
        location: record.location || location.label,
        locationKind: "battle record",
        detail: record.outcome || "No outcome is recorded.",
        context: record.casualties || "",
        sourceLabel: "Battle record",
        precision: location.precision,
        x: location.x,
        y: location.y,
        navigate: `#/battles?battle=${encodeURIComponent(record.id)}`,
        sourceRank: 2
      });
    });

    runtime.events.forEach(record => {
      if (linkedBattleEvents.has(record.id)) return;
      if (!Array.isArray(record.characters) || !record.characters.includes(personId)) return;
      const season = normalizeSeason(record.season);
      const location = resolveRecordLocation(runtime, `${record.title || ""} ${record.summary || ""}`);
      if (!season || !location) return;
      steps.push({
        id: `event-${record.id}`,
        season,
        title: record.title,
        location: location.label,
        locationKind: record.type || "timeline event",
        detail: record.summary,
        context: "",
        sourceLabel: "Timeline record",
        precision: location.precision,
        x: location.x,
        y: location.y,
        navigate: `#/timeline?season=${season}&mode=consequences&event=${encodeURIComponent(record.id)}`,
        sourceRank: 3
      });
    });

    const seen = new Set();
    return steps
      .sort((a, b) => a.season - b.season || a.sourceRank - b.sourceRank || a.title.localeCompare(b.title))
      .filter(step => {
        const key = `${step.season}:${normalizeWords(step.title)}:${normalizeWords(step.location)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function seasonEvents(runtime, season) {
    return runtime.events.filter(record => normalizeSeason(record.season) === season);
  }

  function seasonBattles(runtime, season) {
    return runtime.battles.filter(record => normalizeSeason(record.season) === season);
  }

  function recordsForHouse(runtime, house, season) {
    const eventRecords = seasonEvents(runtime, season).filter(record => Array.isArray(record.houses) && record.houses.includes(house));
    const battleRecords = seasonBattles(runtime, season).filter(record =>
      (record.combatants || []).some(combatant => Array.isArray(combatant.houses) && combatant.houses.includes(house))
    );
    return { eventRecords, battleRecords };
  }

  function powerFigures(runtime, house, season) {
    const ids = new Set();
    const records = recordsForHouse(runtime, house, season);
    records.eventRecords.forEach(record => (record.characters || []).forEach(id => ids.add(id)));
    records.battleRecords.forEach(record => (record.linkedCharacters || []).forEach(id => ids.add(id)));
    const linked = Array.from(ids)
      .map(id => runtime.charactersById.get(id))
      .filter(character => character && character.house === house);
    const titled = linked.filter(character => /\b(king|queen|lord|lady|prince|princess|commander|hand)\b/i.test(character.bio || ""));
    return (titled.length ? titled : linked).slice(0, 5);
  }

  function recordMentions(record, phrase) {
    const needle = normalizeWords(phrase);
    if (!needle) return false;
    const text = normalizeWords([
      record.name,
      record.title,
      record.location,
      record.summary,
      record.outcome
    ].filter(Boolean).join(" "));
    return (` ${text} `).includes(` ${needle} `);
  }

  function sourceLink(hash, label) {
    return `<a class="wa-link" href="${escapeMarkup(hash)}" data-wa-nav="${escapeMarkup(hash)}">${escapeMarkup(label)}</a>`;
  }

  function routeLinesMarkup(steps) {
    if (steps.length < 2) return "";
    return steps.slice(1).map((step, index) => {
      const from = steps[index];
      const deltaX = step.x - from.x;
      const deltaY = step.y - from.y;
      const width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      return `<span class="wa-route-line" aria-hidden="true" style="--wa-line-x:${from.x.toFixed(2)}%;--wa-line-y:${from.y.toFixed(2)}%;--wa-line-width:${width.toFixed(2)}%;--wa-line-angle:${angle.toFixed(2)}deg"></span>`;
    }).join("");
  }

  function mount(rootElement, options) {
    if (!rootElement || rootElement.nodeType !== 1) {
      throw new TypeError("WorldAtlas.mount requires a root Element.");
    }

    const settings = options && typeof options === "object" ? options : {};
    const requestedSeason = Object.prototype.hasOwnProperty.call(settings, "initialSeason")
      ? Number(settings.initialSeason)
      : 1;
    if (!Number.isInteger(requestedSeason) || !SEASON_NUMBERS.includes(requestedSeason)) {
      throw new RangeError("WorldAtlas initialSeason must be an integer from 1 through 8.");
    }
    const requestedMode = settings.initialMode == null ? "atlas" : String(settings.initialMode).toLocaleLowerCase();
    if (!MODES.includes(requestedMode)) {
      throw new RangeError("WorldAtlas initialMode must be Atlas, Journeys, Power, or Lore.");
    }
    if (settings.onNavigate != null && typeof settings.onNavigate !== "function") {
      throw new TypeError("WorldAtlas onNavigate must be a function.");
    }

    const previous = instances.get(rootElement);
    if (previous) previous.destroy();

    const runtime = getRuntimeData();
    runtime.journeys = new Map(JOURNEY_PEOPLE.map(person => [person.id, buildJourneySteps(runtime, person.id)]));
    const instanceId = `world-atlas-${++nextInstanceId}`;
    const abortController = new AbortController();
    const signal = abortController.signal;
    let destroyed = false;
    let mapHandle = null;
    let currentMode = requestedMode;
    let currentSeason = requestedSeason;
    let selectedJourneyId = JOURNEY_PEOPLE[0].id;
    let selectedJourneyStepId = null;
    let selectedPowerRegionId = null;
    let selectedLoreType = "region";
    let selectedLoreId = runtime.regions[0].id;

    const wrapper = document.createElement("section");
    wrapper.className = "world-atlas";
    wrapper.dataset.mode = currentMode;
    wrapper.dataset.season = String(currentSeason);
    wrapper.setAttribute("aria-labelledby", `${instanceId}-title`);
    wrapper.innerHTML = `
      <header class="wa-hero">
        <div class="wa-hero__content">
          <p class="wa-eyebrow">The known world · An evidence-led atlas</p>
          <p class="wa-hero__season">Season ${currentSeason} of 8</p>
          <h1 id="${instanceId}-title">Worlds<br>in motion</h1>
          <p class="wa-hero__intro">Cross the realm through place, passage, power, and memory. Every view stays connected to this archive's map, chapter, character, event, and battle records.</p>
        </div>
        <dl class="wa-hero__facts" aria-label="World archive coverage">
          <div><dt>${runtime.regions.length}</dt><dd>charted regions</dd></div>
          <div><dt>${runtime.settlements.length}</dt><dd>mapped places</dd></div>
          <div><dt>${runtime.battles.length}</dt><dd>conflict records</dd></div>
        </dl>
      </header>

      <section class="world-journey-film" data-world-journey aria-labelledby="${instanceId}-journey-title">
        <div class="world-journey-film__stage" data-world-journey-stage data-stop="winterfell">
          <div class="world-journey-film__backdrop" data-world-journey-backdrop aria-hidden="true"></div>
          <div class="world-journey-film__veil" aria-hidden="true"></div>
          <div class="world-journey-film__grain" aria-hidden="true"></div>
          <button class="world-journey-film__sound" type="button" data-cinematic-sound aria-pressed="false">Sound off</button>
          <button class="world-journey-film__play" type="button" data-world-journey-play aria-pressed="false">Play the road</button>
          <div class="world-journey-film__copy">
            <p class="wa-eyebrow">A camera journey through the realm</p>
            <h2 id="${instanceId}-journey-title">Follow the road,<br>not the border.</h2>
            <div class="world-journey-film__story" data-world-journey-story></div>
          </div>
          <nav class="world-journey-film__stops" aria-label="World journey stops">
            ${WORLD_STOPS.map((stop, index) => `<button type="button" class="world-journey-film__stop" data-world-stop="${stop.id}" aria-current="${index === 0 ? "true" : "false"}"><span>0${index + 1}</span><strong>${escapeMarkup(stop.label)}</strong><small>${escapeMarkup(stop.region)}</small></button>`).join("")}
          </nav>
          <div class="world-journey-film__progress" aria-hidden="true"><span data-world-journey-progress></span></div>
          <p class="world-journey-film__cue" aria-hidden="true">Scroll to travel <span>↓</span></p>
        </div>
      </section>

      <div class="wa-command-bar">
        <div class="wa-command-bar__inner">
          <div class="wa-mode-switch" role="tablist" aria-label="World views">
            ${MODES.map((mode, index) => `<button id="${instanceId}-tab-${mode}" class="wa-mode-button" type="button"
              role="tab" aria-controls="${instanceId}-view" aria-selected="${String(mode === currentMode)}"
              tabindex="${mode === currentMode ? "0" : "-1"}" data-wa-mode="${mode}">
              <span class="wa-mode-button__index" aria-hidden="true">0${index + 1}</span>
              <span>${MODE_LABELS[mode]}</span>
            </button>`).join("")}
          </div>
          <fieldset class="wa-season-control">
            <legend>Season lens</legend>
            <div class="wa-season-buttons" role="group" aria-label="Choose a season">
              ${SEASON_NUMBERS.map(season => `<button class="wa-season-button" type="button" data-wa-season="${season}"
                aria-label="Season ${season}" aria-pressed="${String(season === currentSeason)}">${season}</button>`).join("")}
            </div>
          </fieldset>
        </div>
      </div>

      <div class="wa-view" id="${instanceId}-view" role="tabpanel" aria-labelledby="${instanceId}-tab-${currentMode}" tabindex="0"></div>
      <div class="wa-sr-only" aria-live="polite" aria-atomic="true"></div>`;

    rootElement.replaceChildren(wrapper);

    const viewHost = wrapper.querySelector(".wa-view");
    const announcer = wrapper.querySelector(".wa-sr-only[aria-live]");
    const heroSeason = wrapper.querySelector(".wa-hero__season");
    const journeyFilm = wrapper.querySelector("[data-world-journey]");
    const journeyStage = wrapper.querySelector("[data-world-journey-stage]");
    const journeyStory = wrapper.querySelector("[data-world-journey-story]");
    const journeyBackdrop = wrapper.querySelector("[data-world-journey-backdrop]");
    const journeyProgress = wrapper.querySelector("[data-world-journey-progress]");
    const journeyPlay = wrapper.querySelector("[data-world-journey-play]");
    const journeySound = window.CinematicSound ? window.CinematicSound.mount(journeyFilm) : null;
    let journeyFrame = 0;
    let journeyStopIndex = 0;
    let journeyTimer = 0;

    function renderJourneyStop(index, announceStop) {
      journeyStopIndex = Math.max(0, Math.min(WORLD_STOPS.length - 1, Number(index) || 0));
      const stop = WORLD_STOPS[journeyStopIndex];
      journeyStage.dataset.stop = stop.id;
      journeyBackdrop.style.backgroundImage = `url("${stop.image}")`;
      journeyStory.innerHTML = `<p class="world-journey-film__chapter">Stop 0${journeyStopIndex + 1} · ${escapeMarkup(stop.region)}</p><h3>${escapeMarkup(stop.label)}</h3><blockquote>“${escapeMarkup(stop.quote)}”</blockquote><p>${escapeMarkup(stop.story)}</p><small>${escapeMarkup(stop.detail)}</small><a class="wa-link world-journey-film__link" href="${escapeMarkup(stop.href)}" data-wa-nav="${escapeMarkup(stop.href)}">Follow this moment <span aria-hidden="true">↗</span></a>`;
      wrapper.querySelectorAll("[data-world-stop]").forEach((button, buttonIndex) => button.setAttribute("aria-current", String(buttonIndex === journeyStopIndex)));
      if (announceStop) announce(`${stop.label} journey stop selected.`);
    }

    if (typeof Image === "function") WORLD_STOPS.forEach(stop => { const image = new Image(); image.decoding = "async"; image.src = stop.image; });
    function stopJourneyPlayback() {
      if (journeyTimer) window.clearInterval(journeyTimer);
      journeyTimer = 0;
      if (journeyPlay) { journeyPlay.setAttribute("aria-pressed", "false"); journeyPlay.textContent = "Play the road"; }
    }
    function startJourneyPlayback() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { announce("Autoplay is unavailable with reduced motion enabled. Choose a stop to travel there."); return; }
      stopJourneyPlayback();
      journeyPlay?.setAttribute("aria-pressed", "true");
      if (journeyPlay) journeyPlay.textContent = "Pause the road";
      journeyTimer = window.setInterval(() => {
        const next = journeyStopIndex >= WORLD_STOPS.length - 1 ? 0 : journeyStopIndex + 1;
        renderJourneyStop(next, true);
        jumpToJourneyStop(WORLD_STOPS[next].id);
      }, 5200);
    }

    function updateJourneyFilm() {
      journeyFrame = 0;
      if (destroyed || !journeyFilm) return;
      const rect = journeyFilm.getBoundingClientRect();
      const runway = Math.max(1, journeyFilm.offsetHeight - window.innerHeight);
      const value = Math.max(0, Math.min(1, -rect.top / runway));
      const nextIndex = Math.min(WORLD_STOPS.length - 1, Math.floor(value * WORLD_STOPS.length));
      if (nextIndex !== journeyStopIndex) renderJourneyStop(nextIndex, false);
      journeyProgress.style.transform = `scaleX(${value.toFixed(4)})`;
    }
    function scheduleJourneyFilm() { if (!journeyFrame) journeyFrame = window.requestAnimationFrame(updateJourneyFilm); }
    function jumpToJourneyStop(id) {
      const index = Math.max(0, WORLD_STOPS.findIndex(stop => stop.id === id));
      const rect = journeyFilm.getBoundingClientRect();
      const runway = Math.max(1, journeyFilm.offsetHeight - window.innerHeight);
      window.scrollTo({ top: window.scrollY + rect.top + runway * ((index + 0.04) / WORLD_STOPS.length), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    wrapper.querySelectorAll("[data-world-stop]").forEach(button => button.addEventListener("click", () => jumpToJourneyStop(button.dataset.worldStop), { signal }));
    journeyPlay?.addEventListener("click", () => journeyTimer ? stopJourneyPlayback() : startJourneyPlayback(), { signal });
    window.addEventListener("scroll", scheduleJourneyFilm, { passive: true, signal });
    window.addEventListener("resize", scheduleJourneyFilm, { passive: true, signal });
    renderJourneyStop(0, false);
    scheduleJourneyFilm();

    function announce(message) {
      announcer.textContent = "";
      window.requestAnimationFrame(() => {
        if (!destroyed) announcer.textContent = message;
      });
    }

    function focusAfter(selector) {
      window.requestAnimationFrame(() => {
        if (destroyed) return;
        const node = wrapper.querySelector(selector);
        if (!node) return;
        try { node.focus({ preventScroll: true }); } catch (error) { node.focus(); }
      });
    }

    function navigate(target) {
      if (typeof settings.onNavigate === "function") settings.onNavigate(target);
      else if (String(target).startsWith("#")) window.location.hash = String(target).slice(1);
    }

    function destroyMap() {
      if (!mapHandle) return;
      mapHandle.destroy();
      mapHandle = null;
    }

    function updateSharedControls() {
      wrapper.dataset.mode = currentMode;
      wrapper.dataset.season = String(currentSeason);
      heroSeason.textContent = `Season ${currentSeason} of 8`;
      wrapper.querySelectorAll("[data-wa-mode]").forEach(button => {
        const selected = button.dataset.waMode === currentMode;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      viewHost.setAttribute("aria-labelledby", `${instanceId}-tab-${currentMode}`);
      wrapper.querySelectorAll("[data-wa-season]").forEach(button => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.waSeason) === currentSeason));
      });
    }

    function renderAtlas() {
      viewHost.innerHTML = `
        <section class="wa-panel wa-panel--atlas">
          <header class="wa-section-intro">
            <div>
              <p class="wa-eyebrow">Atlas · Season ${currentSeason}</p>
              <h2>The realm,<br>drawn from record</h2>
            </div>
            <p>Open regions, inspect location-grounded events, and move from a place to its houses and people. The season control above drives every point on the map.</p>
          </header>
          <div class="wa-map-host" data-wa-map-root></div>
          <p class="wa-disclosure"><strong>Placement note.</strong> Only records that explicitly name a mapped settlement or region are plotted. Regional anchors remain coarse by design; the map's detail panel identifies their precision.</p>
        </section>`;
      const mapRoot = viewHost.querySelector("[data-wa-map-root]");
      mapHandle = runtime.livingMap.mount(mapRoot, {
        initialSeason: currentSeason,
        onNavigate: navigate
      });
    }

    function renderJourneyDetail(step, person) {
      if (!step) {
        const allSteps = runtime.journeys.get(person.id) || [];
        const first = allSteps[0];
        return `<aside class="wa-journey-detail" aria-label="Journey detail">
          <p class="wa-eyebrow">No grounded stop yet</p>
          <h3>${escapeMarkup(person.label)}</h3>
          <p>The current archive has no location-backed step for this character through Season ${currentSeason}.</p>
          ${first ? `<p class="wa-detail-note">The first available stop appears in Season ${first.season}: ${escapeMarkup(first.title)}.</p>` : ""}
          ${sourceLink(`#/character/${encodeURIComponent(person.id)}`, "Open character dossier")}
        </aside>`;
      }
      return `<aside class="wa-journey-detail" aria-label="Selected journey stop">
        <p class="wa-eyebrow">Season ${step.season} · ${escapeMarkup(step.sourceLabel)}</p>
        <h3>${escapeMarkup(step.title)}</h3>
        <p class="wa-place-name">${escapeMarkup(step.location)}</p>
        <p>${escapeMarkup(step.detail)}</p>
        ${step.context ? `<p class="wa-detail-note">${escapeMarkup(step.context)}</p>` : ""}
        <dl class="wa-detail-ledger">
          <div><dt>Record type</dt><dd>${escapeMarkup(step.locationKind)}</dd></div>
          <div><dt>Placement</dt><dd>${escapeMarkup(step.precision)}</dd></div>
        </dl>
        <div class="wa-detail-actions">
          ${sourceLink(step.navigate || `#/character/${encodeURIComponent(person.id)}`, "Follow this record")}
          ${sourceLink(`#/character/${encodeURIComponent(person.id)}`, "Character dossier")}
        </div>
      </aside>`;
    }

    function renderJourneys() {
      const person = JOURNEY_PEOPLE.find(item => item.id === selectedJourneyId) || JOURNEY_PEOPLE[0];
      const allSteps = runtime.journeys.get(person.id) || [];
      const visibleSteps = allSteps.filter(step => step.season <= currentSeason);
      let selectedStep = visibleSteps.find(step => step.id === selectedJourneyStepId) || visibleSteps[visibleSteps.length - 1] || null;
      selectedJourneyStepId = selectedStep ? selectedStep.id : null;
      const placeNames = visibleSteps.map(step => step.location);
      const routeLabel = placeNames.length > 1
        ? `${placeNames[0]} to ${placeNames[placeNames.length - 1]}`
        : (placeNames[0] || "Awaiting a grounded stop");

      viewHost.innerHTML = `
        <section class="wa-panel wa-panel--journeys">
          <header class="wa-section-intro wa-section-intro--compact">
            <div>
              <p class="wa-eyebrow">Journeys · Through Season ${currentSeason}</p>
              <h2>Four paths.<br>One realm.</h2>
            </div>
            <p>Follow only the stops that can be tied to an existing chapter marker, mapped place, region, or conflict record.</p>
          </header>

          <div class="wa-journey-people" role="group" aria-label="Choose a character journey">
            ${JOURNEY_PEOPLE.map(item => `<button type="button" class="wa-person-button" data-wa-journey="${escapeMarkup(item.id)}"
              aria-pressed="${String(item.id === person.id)}">
              <img src="${escapeMarkup(item.portrait)}" alt="" loading="lazy">
              <span>${escapeMarkup(item.label)}</span>
            </button>`).join("")}
          </div>

          <div class="wa-journey-heading">
            <div>
              <p class="wa-eyebrow">${visibleSteps.length} recorded ${visibleSteps.length === 1 ? "stop" : "stops"}</p>
              <h3>${escapeMarkup(routeLabel)}</h3>
            </div>
            <p>Season ${currentSeason} reveals the route only as far as the selected point in the story.</p>
          </div>

          <div class="wa-journey-layout" data-journey-person="${escapeMarkup(person.id)}">
            <div class="wa-route-stage" role="group" aria-label="${escapeMarkup(person.label)} route through Season ${currentSeason}">
              <div class="wa-route-stage__grid" aria-hidden="true"></div>
              ${routeLinesMarkup(visibleSteps)}
              ${visibleSteps.map((step, index) => `<button type="button" class="wa-route-point" data-wa-step="${escapeMarkup(step.id)}"
                aria-label="Stop ${index + 1}: ${escapeMarkup(step.title)}, Season ${step.season}, ${escapeMarkup(step.location)}"
                aria-pressed="${String(selectedStep && selectedStep.id === step.id)}"
                style="--wa-point-x:${step.x.toFixed(2)}%;--wa-point-y:${step.y.toFixed(2)}%">
                <span class="wa-route-point__number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                <span class="wa-route-point__label" aria-hidden="true">S${step.season} · ${escapeMarkup(step.location)}</span>
              </button>`).join("")}
              ${visibleSteps.length ? "" : `<div class="wa-route-empty"><p>No map-backed stop is available through this season.</p></div>`}
            </div>
            ${renderJourneyDetail(selectedStep, person)}
          </div>

          <ol class="wa-route-ledger" aria-label="Complete journey record">
            ${allSteps.map((step, index) => `<li>
              <button type="button" data-wa-step="${escapeMarkup(step.id)}" class="wa-route-ledger__button${step.season > currentSeason ? " is-future" : ""}"
                aria-label="${step.season > currentSeason ? `Later stop; selecting moves the season lens to Season ${step.season}. ` : ""}${escapeMarkup(step.title)}, Season ${step.season}, ${escapeMarkup(step.location)}"
                aria-pressed="${String(selectedStep && selectedStep.id === step.id)}">
                <span class="wa-route-ledger__index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                <span><strong>${escapeMarkup(step.title)}</strong><small>S${step.season} · ${escapeMarkup(step.location)} · ${escapeMarkup(step.sourceLabel)}</small>
                  ${step.season > currentSeason ? `<span class="wa-route-ledger__future">Later season · Opens S${step.season}</span>` : ""}
                </span>
              </button>
            </li>`).join("")}
          </ol>
          <p class="wa-disclosure"><strong>Route note.</strong> This is a curated evidence trail, not a complete itinerary. Scene-marker positions are editorial; settlement and regional points reuse the site's vector map. Lines indicate sequence only and are not geographic paths or distances.</p>
        </section>`;
    }

    function renderPowerDetail(region) {
      const house = region.house;
      const info = runtime.houseInfo[house] || {};
      const records = recordsForHouse(runtime, house, currentSeason);
      const figures = powerFigures(runtime, house, currentSeason);
      const color = safeColor(runtime.houseColors[house]);
      return `<aside class="wa-power-detail" aria-label="Selected territory detail" style="--wa-house-color:${color}">
        <p class="wa-eyebrow">Territory ledger · Season ${currentSeason}</p>
        <h3>${escapeMarkup(region.name)}</h3>
        <p class="wa-place-name">House ${escapeMarkup(house)} · ${escapeMarkup(region.seat)}</p>
        <p>${escapeMarkup(region.blurb)}</p>
        ${info.words && info.words !== "—" ? `<blockquote>“${escapeMarkup(info.words)}”</blockquote>` : ""}
        <dl class="wa-detail-ledger">
          <div><dt>Timeline records</dt><dd>${records.eventRecords.length}</dd></div>
          <div><dt>Conflict records</dt><dd>${records.battleRecords.length}</dd></div>
        </dl>
        ${currentSeason === 8 && info.rulerEnd ? `<div class="wa-end-state"><span>Recorded end state</span><p>${escapeMarkup(info.rulerEnd)}</p></div>` : ""}
        <h4>Power figures in this season's records</h4>
        ${figures.length ? `<ul class="wa-figure-list">${figures.map(character => `<li>
          ${sourceLink(`#/character/${encodeURIComponent(character.id)}`, character.name)}
          <span>${escapeMarkup(character.bio)}</span>
        </li>`).join("")}</ul>` : `<p class="wa-detail-note">No character from this house is linked to a recorded event or battle in this season.</p>`}
        <h4>Recorded turning points</h4>
        ${records.eventRecords.length || records.battleRecords.length ? `<ul class="wa-record-list">
          ${records.eventRecords.map(record => `<li><span>${escapeMarkup(record.type || "event")}</span>${escapeMarkup(record.title)}</li>`).join("")}
          ${records.battleRecords.map(record => `<li><span>conflict</span>${escapeMarkup(record.name)}</li>`).join("")}
        </ul>` : `<p class="wa-detail-note">No seasonal turning point for this house is present in the available records.</p>`}
        ${sourceLink(`#/house/${encodeURIComponent(house)}`, `Open House ${house}`)}
      </aside>`;
    }

    function renderPower() {
      const eventsInSeason = seasonEvents(runtime, currentSeason);
      const battlesInSeason = seasonBattles(runtime, currentSeason);
      const chapter = runtime.chapters.find(item => Number(item.season) === currentSeason) || runtime.chapters[0];
      const activeHouses = new Set();
      eventsInSeason.forEach(record => (record.houses || []).forEach(house => activeHouses.add(house)));
      battlesInSeason.forEach(record => (record.combatants || []).forEach(side => (side.houses || []).forEach(house => activeHouses.add(house))));
      const region = runtime.regionsById.get(selectedPowerRegionId)
        || runtime.regions.find(item => activeHouses.has(item.house))
        || runtime.regions[0];
      selectedPowerRegionId = region.id;
      const activity = Array.from(activeHouses).map(house => {
        const records = recordsForHouse(runtime, house, currentSeason);
        return { house, count: records.eventRecords.length + records.battleRecords.length };
      }).sort((a, b) => b.count - a.count || a.house.localeCompare(b.house));

      viewHost.innerHTML = `
        <section class="wa-panel wa-panel--power">
          <header class="wa-power-lead">
            <div>
              <p class="wa-eyebrow">Power · ${escapeMarkup(chapter.kicker || `Season ${currentSeason}`)}</p>
              <h2>${escapeMarkup(chapter.title)}</h2>
            </div>
            <p>${escapeMarkup(chapter.summary)}</p>
          </header>

          <div class="wa-power-pulse" aria-label="Season ${currentSeason} political record">
            <div><strong>${eventsInSeason.length}</strong><span>timeline turns</span></div>
            <div><strong>${battlesInSeason.length}</strong><span>conflict records</span></div>
            <div><strong>${activeHouses.size}</strong><span>houses named</span></div>
          </div>

          <div class="wa-house-activity" aria-label="Houses present in Season ${currentSeason} records">
            ${activity.map(item => `<div style="--wa-house-color:${safeColor(runtime.houseColors[item.house])};--wa-house-text:${houseTextColor(item.house)}">
              <span>${escapeMarkup(item.house)}</span><strong>${item.count}</strong>
            </div>`).join("")}
          </div>

          <div class="wa-power-layout">
            <div class="wa-territory-grid" role="group" aria-label="Choose a territory">
              ${runtime.regions.map((item, index) => {
                const records = recordsForHouse(runtime, item.house, currentSeason);
                const count = records.eventRecords.length + records.battleRecords.length;
                return `<button type="button" class="wa-territory-card${activeHouses.has(item.house) ? " is-active" : ""}"
                  data-wa-region="${escapeMarkup(item.id)}" aria-pressed="${String(item.id === region.id)}"
                  style="--wa-house-color:${safeColor(runtime.houseColors[item.house])};--wa-house-text:${houseTextColor(item.house)}">
                  <span class="wa-territory-card__index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                  <strong>${escapeMarkup(item.name)}</strong>
                  <small>${escapeMarkup(item.house)} · ${escapeMarkup(item.seat)}</small>
                  <em>${count ? `${count} seasonal ${count === 1 ? "record" : "records"}` : "No seasonal record"}</em>
                </button>`;
              }).join("")}
            </div>
            ${renderPowerDetail(region)}
          </div>
          <p class="wa-disclosure"><strong>Power-map note.</strong> This view does not reconstruct changing borders or assign unrecorded rulers. Region-to-house links and seats come from the static atlas; seasonal activity comes from timeline and battle records. End-state leadership appears only in Season 8, where house metadata explicitly provides it.</p>
        </section>`;
    }

    function relatedPlaceRecords(place) {
      return {
        events: seasonEvents(runtime, currentSeason).filter(record => recordMentions(record, place.name)),
        battles: seasonBattles(runtime, currentSeason).filter(record => recordMentions(record, place.name)),
        region: runtime.regions.find(region => normalizeWords(region.seat) === normalizeWords(place.name)) || null
      };
    }

    function renderRegionDossier(region) {
      const records = recordsForHouse(runtime, region.house, currentSeason);
      const info = runtime.houseInfo[region.house] || {};
      const people = runtime.characters.filter(character => character.house === region.house).slice(0, 8);
      const mappedSeat = runtime.settlementsByName.get(normalizeWords(region.seat));
      const point = Array.isArray(region.labelXY) ? asMapPercent(runtime, region.labelXY[0], region.labelXY[1]) : { x: 50, y: 50 };
      return `<article class="wa-lore-dossier" aria-label="${escapeMarkup(region.name)} dossier">
        <div class="wa-lore-map" aria-label="Cartographic position of ${escapeMarkup(region.name)}">
          <span class="wa-lore-map__pin" style="--wa-point-x:${point.x.toFixed(2)}%;--wa-point-y:${point.y.toFixed(2)}%"></span>
          <span class="wa-lore-map__label" style="--wa-point-x:${point.x.toFixed(2)}%;--wa-point-y:${point.y.toFixed(2)}%">${escapeMarkup(region.name)}</span>
        </div>
        <div class="wa-lore-copy">
          <p class="wa-eyebrow">Region dossier · Season ${currentSeason}</p>
          <h3>${escapeMarkup(region.name)}</h3>
          <p class="wa-place-name">${escapeMarkup(region.house)} · ${escapeMarkup(region.seat)}</p>
          <p>${escapeMarkup(region.blurb)}</p>
          <dl class="wa-detail-ledger">
            <div><dt>Mapped seat</dt><dd>${mappedSeat ? escapeMarkup(mappedSeat.kind || "place") : "No exact place point"}</dd></div>
            <div><dt>House words</dt><dd>${escapeMarkup(info.words || "Not recorded")}</dd></div>
          </dl>
          <h4>Season record</h4>
          ${records.eventRecords.length || records.battleRecords.length ? `<ul class="wa-record-list">
            ${records.eventRecords.map(record => `<li><span>${escapeMarkup(record.type || "event")}</span>${escapeMarkup(record.title)}</li>`).join("")}
            ${records.battleRecords.map(record => `<li><span>conflict</span>${escapeMarkup(record.name)}</li>`).join("")}
          </ul>` : `<p class="wa-detail-note">No house-linked timeline event or battle is recorded here for this season.</p>`}
          <h4>People of the house record</h4>
          <div class="wa-person-links">${people.map(character => sourceLink(`#/character/${encodeURIComponent(character.id)}`, character.name)).join("")}</div>
          ${sourceLink(`#/house/${encodeURIComponent(region.house)}`, `Open House ${region.house}`)}
        </div>
      </article>`;
    }

    function renderPlaceDossier(place) {
      const related = relatedPlaceRecords(place);
      const point = asMapPercent(runtime, place.x, place.y);
      return `<article class="wa-lore-dossier" aria-label="${escapeMarkup(place.name)} dossier">
        <div class="wa-lore-map" aria-label="Cartographic position of ${escapeMarkup(place.name)}">
          <span class="wa-lore-map__pin" style="--wa-point-x:${point.x.toFixed(2)}%;--wa-point-y:${point.y.toFixed(2)}%"></span>
          <span class="wa-lore-map__label" style="--wa-point-x:${point.x.toFixed(2)}%;--wa-point-y:${point.y.toFixed(2)}%">${escapeMarkup(place.name)}</span>
        </div>
        <div class="wa-lore-copy">
          <p class="wa-eyebrow">Place dossier · Season ${currentSeason}</p>
          <h3>${escapeMarkup(place.name)}</h3>
          <p class="wa-place-name">${escapeMarkup(place.kind || "Mapped place")}${related.region ? ` · ${escapeMarkup(related.region.name)}` : ""}</p>
          <p>This place is explicitly positioned in the site's original vector atlas.</p>
          <dl class="wa-detail-ledger">
            <div><dt>Map position</dt><dd>${Number(place.x).toFixed(0)}, ${Number(place.y).toFixed(0)}</dd></div>
            <div><dt>Region link</dt><dd>${related.region ? escapeMarkup(related.region.name) : "Not explicit in place data"}</dd></div>
          </dl>
          <h4>Explicit seasonal mentions</h4>
          ${related.events.length || related.battles.length ? `<ul class="wa-record-list">
            ${related.events.map(record => `<li><span>${escapeMarkup(record.type || "event")}</span>${escapeMarkup(record.title)}</li>`).join("")}
            ${related.battles.map(record => `<li><span>conflict</span>${escapeMarkup(record.name)}</li>`).join("")}
          </ul>` : `<p class="wa-detail-note">No Season ${currentSeason} timeline or battle record explicitly names this place.</p>`}
          ${related.region ? sourceLink(`#/house/${encodeURIComponent(related.region.house)}`, `Open House ${related.region.house}`) : sourceLink("#/timeline", "Open the full timeline")}
        </div>
      </article>`;
    }

    function renderLore() {
      const items = selectedLoreType === "region" ? runtime.regions : runtime.settlements;
      const selected = selectedLoreType === "region"
        ? runtime.regionsById.get(selectedLoreId) || runtime.regions[0]
        : runtime.settlements.find(place => normalizeWords(place.name) === selectedLoreId) || runtime.settlements[0];
      selectedLoreId = selectedLoreType === "region" ? selected.id : normalizeWords(selected.name);

      viewHost.innerHTML = `
        <section class="wa-panel wa-panel--lore">
          <header class="wa-section-intro wa-section-intro--compact">
            <div>
              <p class="wa-eyebrow">Lore · Season ${currentSeason}</p>
              <h2>The geography<br>behind the story</h2>
            </div>
            <p>Open a region for its house record, or a place for exact cartographic metadata and season-specific mentions.</p>
          </header>

          <div class="wa-lore-switch" role="group" aria-label="Choose lore index">
            <button type="button" data-wa-lore-type="region" aria-pressed="${String(selectedLoreType === "region")}">Regions <span>${runtime.regions.length}</span></button>
            <button type="button" data-wa-lore-type="place" aria-pressed="${String(selectedLoreType === "place")}">Places <span>${runtime.settlements.length}</span></button>
          </div>

          <div class="wa-lore-layout">
            <nav class="wa-lore-rail" aria-label="${selectedLoreType === "region" ? "Region" : "Place"} dossiers">
              ${items.map((item, index) => {
                const id = selectedLoreType === "region" ? item.id : normalizeWords(item.name);
                const meta = selectedLoreType === "region" ? `${item.house} · ${item.seat}` : (item.kind || "mapped place");
                return `<button type="button" data-wa-lore-id="${escapeMarkup(id)}" aria-pressed="${String(id === selectedLoreId)}">
                  <span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                  <span><strong>${escapeMarkup(item.name)}</strong><small>${escapeMarkup(meta)}</small></span>
                </button>`;
              }).join("")}
            </nav>
            ${selectedLoreType === "region" ? renderRegionDossier(selected) : renderPlaceDossier(selected)}
          </div>
          <p class="wa-disclosure"><strong>Atlas-data note.</strong> Place coordinates belong to this site's original vector map and are not latitude/longitude. A region is linked to a place only when the place exactly matches its recorded seat; other associations are left unstated.</p>
        </section>`;
    }

    function renderView() {
      destroyMap();
      if (currentMode === "atlas") renderAtlas();
      else if (currentMode === "journeys") renderJourneys();
      else if (currentMode === "power") renderPower();
      else renderLore();
    }

    function setMode(mode, config) {
      const normalized = String(mode || "").toLocaleLowerCase();
      if (!MODES.includes(normalized)) throw new RangeError("Unknown WorldAtlas mode.");
      if (destroyed) return;
      currentMode = normalized;
      updateSharedControls();
      renderView();
      if (!config || config.announce !== false) announce(`${MODE_LABELS[currentMode]} view opened for Season ${currentSeason}.`);
    }

    function setSeason(season, config) {
      const number = Number(season);
      if (!Number.isInteger(number) || !SEASON_NUMBERS.includes(number)) {
        throw new RangeError("WorldAtlas season must be an integer from 1 through 8.");
      }
      if (destroyed) return;
      currentSeason = number;
      updateSharedControls();
      if (currentMode === "atlas" && mapHandle && typeof mapHandle.setSeason === "function") mapHandle.setSeason(number);
      else renderView();
      if (!config || config.announce !== false) announce(`Season ${number} selected in ${MODE_LABELS[currentMode]} view.`);
    }

    wrapper.addEventListener("click", event => {
      const modeButton = event.target.closest("[data-wa-mode]");
      if (modeButton) {
        setMode(modeButton.dataset.waMode);
        focusAfter(`[data-wa-mode="${modeButton.dataset.waMode}"]`);
        return;
      }

      const seasonButton = event.target.closest("[data-wa-season]");
      if (seasonButton) {
        setSeason(Number(seasonButton.dataset.waSeason));
        focusAfter(`[data-wa-season="${seasonButton.dataset.waSeason}"]`);
        return;
      }

      const personButton = event.target.closest("[data-wa-journey]");
      if (personButton) {
        selectedJourneyId = personButton.dataset.waJourney;
        selectedJourneyStepId = null;
        renderView();
        announce(`${JOURNEY_PEOPLE.find(person => person.id === selectedJourneyId).label} journey selected.`);
        focusAfter(`[data-wa-journey="${selectedJourneyId}"]`);
        return;
      }

      const stepButton = event.target.closest("[data-wa-step]");
      if (stepButton) {
        const steps = runtime.journeys.get(selectedJourneyId) || [];
        const step = steps.find(item => item.id === stepButton.dataset.waStep);
        if (!step) return;
        selectedJourneyStepId = step.id;
        if (step.season > currentSeason) currentSeason = step.season;
        updateSharedControls();
        renderView();
        announce(`${step.title}, Season ${step.season}, selected.`);
        focusAfter(`[data-wa-step="${step.id}"]`);
        return;
      }

      const regionButton = event.target.closest("[data-wa-region]");
      if (regionButton) {
        selectedPowerRegionId = regionButton.dataset.waRegion;
        renderView();
        const region = runtime.regionsById.get(selectedPowerRegionId);
        if (region) announce(`${region.name} territory dossier opened.`);
        focusAfter(`[data-wa-region="${selectedPowerRegionId}"]`);
        return;
      }

      const loreTypeButton = event.target.closest("[data-wa-lore-type]");
      if (loreTypeButton) {
        selectedLoreType = loreTypeButton.dataset.waLoreType;
        selectedLoreId = selectedLoreType === "region" ? runtime.regions[0].id : normalizeWords(runtime.settlements[0].name);
        renderView();
        announce(`${selectedLoreType === "region" ? "Region" : "Place"} index opened.`);
        focusAfter(`[data-wa-lore-type="${selectedLoreType}"]`);
        return;
      }

      const loreButton = event.target.closest("[data-wa-lore-id]");
      if (loreButton) {
        selectedLoreId = loreButton.dataset.waLoreId;
        renderView();
        announce(`${loreButton.textContent.trim()} dossier opened.`);
        focusAfter(`[data-wa-lore-id="${selectedLoreId}"]`);
        return;
      }

      const navLink = event.target.closest("[data-wa-nav]");
      if (navLink && typeof settings.onNavigate === "function") {
        event.preventDefault();
        navigate(navLink.dataset.waNav);
      }
    }, { signal });

    wrapper.addEventListener("keydown", event => {
      const modeButton = event.target.closest && event.target.closest("[data-wa-mode]");
      if (modeButton && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const index = MODES.indexOf(modeButton.dataset.waMode);
        let nextIndex = index;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = MODES.length - 1;
        else nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + MODES.length) % MODES.length;
        setMode(MODES[nextIndex]);
        focusAfter(`[data-wa-mode="${MODES[nextIndex]}"]`);
        return;
      }

      const seasonButton = event.target.closest && event.target.closest("[data-wa-season]");
      if (seasonButton && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const season = Number(seasonButton.dataset.waSeason);
        let nextSeason = season;
        if (event.key === "Home") nextSeason = 1;
        else if (event.key === "End") nextSeason = 8;
        else nextSeason = Math.max(1, Math.min(8, season + (event.key === "ArrowRight" ? 1 : -1)));
        setSeason(nextSeason);
        focusAfter(`[data-wa-season="${nextSeason}"]`);
      }
    }, { signal });

    const api = {
      setMode(mode) { setMode(mode); },
      setSeason(season) { setSeason(season); },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        if (journeyFrame) window.cancelAnimationFrame(journeyFrame);
        stopJourneyPlayback();
        if (journeySound) journeySound.destroy();
        destroyMap();
        abortController.abort();
        if (wrapper.parentNode === rootElement) wrapper.remove();
        instances.delete(rootElement);
      }
    };

    instances.set(rootElement, api);
    updateSharedControls();
    renderView();
    return api;
  }

  window.WorldAtlas = Object.freeze({ mount });
})(window, document);
