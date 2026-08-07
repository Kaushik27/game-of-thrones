// Cinematic People experience: spotlight portraits, relationship intelligence,
// and a searchable cast archive. Browser-global, dependency-free, and safe to
// mount repeatedly inside the hash-routed application.
(function exposePeopleIntelligence(global) {
  "use strict";

  const mountedRoots = new WeakMap();
  const MODES = ["spotlight", "constellation", "archive"];
  const RELATION_TYPES = ["family", "marriage", "allegiance", "conflict", "bond"];
  const RELATION_LABELS = {
    family: "Family",
    marriage: "Marriage",
    allegiance: "Allegiance",
    conflict: "Conflict",
    bond: "Bond"
  };
  const ICONS = {
    spotlight: "assets/icons/person.svg",
    constellation: "assets/icons/compass.svg",
    archive: "assets/icons/castle.svg"
  };
  const SPOTLIGHT_IDS = [
    "jon-snow",
    "daenerys-targaryen",
    "arya-stark",
    "tyrion-lannister",
    "cersei-lannister",
    "sansa-stark",
    "jaime-lannister",
    "bran-stark",
    "theon-greyjoy",
    "brienne-of-tarth",
    "ned-stark",
    "the-night-king"
  ];
  const SPOTLIGHT_SEASONS = {
    "jon-snow": [1, 2, 3, 4, 5, 6, 7, 8],
    "daenerys-targaryen": [1, 2, 3, 4, 5, 6, 7, 8],
    "arya-stark": [1, 2, 3, 4, 5, 6, 7, 8],
    "tyrion-lannister": [1, 2, 3, 4, 5, 6, 7, 8],
    "cersei-lannister": [1, 2, 3, 4, 5, 6, 7, 8],
    "sansa-stark": [1, 2, 3, 4, 5, 6, 7, 8],
    "jaime-lannister": [1, 2, 3, 4, 5, 6, 7, 8],
    "bran-stark": [1, 2, 3, 4, 6, 7, 8],
    "theon-greyjoy": [1, 2, 3, 4, 5, 6, 7, 8],
    "brienne-of-tarth": [2, 3, 4, 5, 6, 7, 8],
    "ned-stark": [1],
    "the-night-king": [4, 5, 6, 7, 8]
  };
  const HOUSE_CLASS = {
    Stark: "stark",
    Lannister: "lannister",
    Targaryen: "targaryen",
    Baratheon: "baratheon",
    Greyjoy: "greyjoy",
    Tyrell: "tyrell",
    Martell: "martell",
    Tully: "tully",
    Arryn: "arryn",
    "Night's Watch": "nights-watch",
    "Free Folk": "free-folk",
    Unaffiliated: "unaffiliated"
  };

  let instanceCount = 0;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeSeason(value) {
    if (Number.isInteger(value)) return value >= 1 && value <= 8 ? value : 0;
    const match = String(value == null ? "" : value).match(/(?:season\s*)?([1-8])/i);
    return match ? Number(match[1]) : 0;
  }

  function safeText(value) {
    return value == null ? "" : String(value);
  }

  function initials(name) {
    return safeText(name)
      .replace(/["'()]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("") || "?";
  }

  function resolveDependencies(options) {
    const characterData = options.characters ||
      (typeof characters !== "undefined" ? characters : global.characters);
    const relationData = options.relations ||
      (typeof relations !== "undefined" ? relations : global.relations);
    const eventData = options.events ||
      (typeof events !== "undefined" ? events : global.events);
    const quoteData = options.quotes ||
      (typeof quotes !== "undefined" ? quotes : global.quotes);
    const battleData = options.battles ||
      (typeof battles !== "undefined" ? battles : global.battles);
    const episodeData = options.episodes ||
      (typeof episodes !== "undefined" ? episodes :
        (typeof EPISODES !== "undefined" ? EPISODES : (global.episodes || global.EPISODES)));
    const chapterData = options.realmChapters ||
      (typeof REALM_CHAPTERS !== "undefined" ? REALM_CHAPTERS : global.REALM_CHAPTERS);
    const photoHelper = options.actorPhotoFor ||
      (typeof actorPhotoFor === "function" ? actorPhotoFor : global.actorPhotoFor);
    const avatarHelper = options.avatarHTML ||
      (typeof avatarHTML === "function" ? avatarHTML : global.avatarHTML);
    const colorHelper = options.getHouseColor ||
      (typeof getHouseColor === "function" ? getHouseColor : global.getHouseColor);
    const escapeHelper = options.escapeHTML ||
      (typeof escapeHTML === "function" ? escapeHTML : global.escapeHTML);

    return {
      characters: asArray(characterData),
      relations: asArray(relationData),
      events: asArray(eventData),
      quotes: asArray(quoteData),
      battles: asArray(battleData),
      episodes: asArray(episodeData),
      realmChapters: asArray(chapterData),
      actorPhotoFor: typeof photoHelper === "function" ? photoHelper : null,
      avatarHTML: typeof avatarHelper === "function" ? avatarHelper : null,
      getHouseColor: typeof colorHelper === "function" ? colorHelper : null,
      escapeHTML: typeof escapeHelper === "function" ? escapeHelper : null
    };
  }

  function normalizeData(dependencies) {
    const charactersById = new Map();
    dependencies.characters.forEach(character => {
      if (!character || typeof character.id !== "string" || typeof character.name !== "string") return;
      if (!charactersById.has(character.id)) charactersById.set(character.id, character);
    });

    const validRelations = dependencies.relations.filter(relation => {
      if (!relation) return false;
      return charactersById.has(relation.source) &&
        charactersById.has(relation.target) &&
        relation.source !== relation.target;
    });
    const relationsById = new Map([...charactersById.keys()].map(id => [id, []]));
    validRelations.forEach(relation => {
      relationsById.get(relation.source).push(relation);
      relationsById.get(relation.target).push(relation);
    });

    return {
      characters: [...charactersById.values()],
      charactersById,
      relations: validRelations,
      relationsById
    };
  }

  function buildSeasonIndex(dependencies, data) {
    const index = new Map(data.characters.map(character => [character.id, new Set()]));

    function add(characterId, season) {
      const normalized = normalizeSeason(season);
      if (normalized && index.has(characterId)) index.get(characterId).add(normalized);
    }

    function addCharacterValue(value, season) {
      if (typeof value === "string") {
        add(value, season);
        return;
      }
      if (!value || typeof value !== "object") return;
      add(value.characterId || value.character || value.id, season);
    }

    function scanRecord(record, inheritedSeason, depth) {
      if (!record || typeof record !== "object" || depth > 5) return;
      const season = normalizeSeason(record.season || record.seasonNumber || inheritedSeason);
      add(record.characterId, season);
      add(record.character, season);
      ["characters", "characterIds", "linkedCharacters", "cast"].forEach(key => {
        asArray(record[key]).forEach(value => addCharacterValue(value, season));
      });
      asArray(record.combatants).forEach(combatant => scanRecord(combatant, season, depth + 1));
      ["events", "moments", "scenes", "markers", "chapters", "episodes"].forEach(key => {
        asArray(record[key]).forEach(child => scanRecord(child, season, depth + 1));
      });
    }

    data.characters.forEach(character => {
      asArray(character.seasons).forEach(season => add(character.id, season));
      asArray(character.appearances).forEach(appearance => {
        add(character.id, appearance && typeof appearance === "object" ? appearance.season : appearance);
      });
    });

    [
      dependencies.events,
      dependencies.quotes,
      dependencies.battles,
      dependencies.episodes,
      dependencies.realmChapters
    ].forEach(records => records.forEach(record => scanRecord(record, 0, 0)));

    Object.keys(SPOTLIGHT_SEASONS).forEach(characterId => {
      asArray(SPOTLIGHT_SEASONS[characterId]).forEach(season => add(characterId, season));
    });
    return index;
  }

  function mount(root, rawOptions) {
    if (!(root instanceof Element)) {
      throw new TypeError("PeopleIntelligence.mount requires a root Element.");
    }

    const previous = mountedRoots.get(root);
    if (previous) previous.destroy();

    const options = rawOptions || {};
    const dependencies = resolveDependencies(options);
    const data = normalizeData(dependencies);
    if (!data.characters.length) {
      throw new Error("PeopleIntelligence requires at least one character record.");
    }

    const seasonIndex = buildSeasonIndex(dependencies, data);
    const id = `people-intelligence-${++instanceCount}`;
    const cleanup = [];
    const originalClass = root.getAttribute("class");
    const originalMarker = root.getAttribute("data-people-intelligence");
    const mobileSheet = typeof global.matchMedia === "function"
      ? global.matchMedia("(max-width: 760px)")
      : null;

    let destroyed = false;
    let lastFocus = null;
    let archiveLimit = 48;
    const initialSeason = normalizeSeason(options.initialSeason);
    const requestedMode = safeText(options.initialMode).toLowerCase();
    const state = {
      mode: MODES.includes(requestedMode) ? requestedMode : "spotlight",
      season: initialSeason,
      archiveQuery: "",
      archiveHouse: "",
      archiveStatus: "",
      archivePortrait: "",
      constellationHouse: "",
      constellationTypes: new Set(RELATION_TYPES),
      selectedId: null,
      detailOpen: false,
      compareIds: [],
      compareOpen: false
    };

    function escape(value) {
      if (dependencies.escapeHTML) {
        try {
          return dependencies.escapeHTML(safeText(value));
        } catch (_error) {
          // Use the local escaping path below.
        }
      }
      const node = document.createElement("div");
      node.textContent = safeText(value);
      return node.innerHTML;
    }

    function listen(target, eventName, handler, listenerOptions) {
      target.addEventListener(eventName, handler, listenerOptions);
      cleanup.push(() => target.removeEventListener(eventName, handler, listenerOptions));
    }

    function houseClass(house) {
      // Resolve the shared helper even though colors are applied through
      // predefined classes; this keeps custom datasets aligned with the
      // site's canonical house lookup without injecting inline CSS.
      if (dependencies.getHouseColor) {
        try { dependencies.getHouseColor(house); } catch (_error) { /* CSS fallback */ }
      }
      return `pi-house--${HOUSE_CLASS[house] || "unaffiliated"}`;
    }

    function photoFor(character) {
      if (!dependencies.actorPhotoFor) return null;
      try {
        const photo = dependencies.actorPhotoFor(character.id);
        return photo && typeof photo.file === "string" && photo.file.trim() ? photo : null;
      } catch (_error) {
        return null;
      }
    }

    function portraitMarkup(character, variant) {
      const photo = photoFor(character);
      const modifier = variant ? ` pi-portrait--${variant}` : "";
      const dead = character.status === "dead" ? " pi-portrait--dead" : "";
      if (photo) {
        const actor = photo.actor || character.actor || character.name;
        return `<span class="pi-portrait${modifier}${dead}"><img src="${escape(photo.file)}" alt="${escape(actor)}, who played ${escape(character.name)}" loading="lazy" decoding="async"></span>`;
      }
      return `<span class="pi-portrait pi-portrait--initials${modifier}${dead}" role="img" aria-label="Portrait unavailable for ${escape(character.name)}"><span aria-hidden="true">${escape(initials(character.name))}</span></span>`;
    }

    function hasSeason(character, season) {
      return !season || (seasonIndex.get(character.id) || new Set()).has(season);
    }

    function documentedSeasons(character) {
      return [...(seasonIndex.get(character.id) || new Set())].sort((a, b) => a - b);
    }

    function relationCount(characterId) {
      return (data.relationsById.get(characterId) || []).length;
    }

    function relationEntries(characterId, typeFilter) {
      return (data.relationsById.get(characterId) || [])
        .filter(relation => !typeFilter || typeFilter.has(relation.type))
        .map(relation => {
          const otherId = relation.source === characterId ? relation.target : relation.source;
          return { relation, other: data.charactersById.get(otherId) };
        })
        .filter(entry => entry.other)
        .sort((a, b) => {
          const countDifference = relationCount(b.other.id) - relationCount(a.other.id);
          return countDifference || a.other.name.localeCompare(b.other.name);
        });
    }

    function collapsedRelationEntries(characterId, typeFilter) {
      const grouped = new Map();
      relationEntries(characterId, typeFilter).forEach(entry => {
        const current = grouped.get(entry.other.id);
        if (!current) {
          grouped.set(entry.other.id, {
            other: entry.other,
            relation: { ...entry.relation },
            relations: [entry.relation]
          });
          return;
        }
        current.relations.push(entry.relation);
        const labels = [...new Set(current.relations.map(relation => relation.label).filter(Boolean))];
        current.relation.label = labels.join("; ");
      });
      return [...grouped.values()].sort((a, b) => {
        const tieDifference = b.relations.length - a.relations.length;
        return tieDifference || relationCount(b.other.id) - relationCount(a.other.id) || a.other.name.localeCompare(b.other.name);
      });
    }

    function rankedCharacters(filter) {
      return data.characters
        .filter(filter || (() => true))
        .sort((a, b) => {
          const photoDifference = Number(Boolean(photoFor(b))) - Number(Boolean(photoFor(a)));
          return photoDifference || relationCount(b.id) - relationCount(a.id) || a.name.localeCompare(b.name);
        });
    }

    function availableCharacters(house) {
      return rankedCharacters(character =>
        hasSeason(character, state.season) && (!house || character.house === house)
      );
    }

    function chooseSelectedCharacter() {
      const candidates = availableCharacters(state.constellationHouse);
      if (candidates.some(character => character.id === state.selectedId)) return;
      state.selectedId = candidates.length ? candidates[0].id : null;
    }

    function houses() {
      return [...new Set(data.characters.map(character => character.house).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    }

    function profileHref(character) {
      return `#/character/${encodeURIComponent(character.id)}`;
    }

    function fanMomentFor(characterId) {
      const moments = Array.isArray(global.FAN_MOMENTS) ? global.FAN_MOMENTS : [];
      return moments.find(moment => moment.characterId === characterId) || null;
    }

    function modeButtonMarkup(mode, label, description) {
      const selected = state.mode === mode;
      return `<button class="pi-mode-tab${selected ? " is-active" : ""}" type="button" role="tab" id="${id}-tab-${mode}" aria-selected="${selected}" aria-controls="${id}-panel" tabindex="${selected ? "0" : "-1"}" data-pi-mode="${mode}">
        <img src="${ICONS[mode]}" alt="" aria-hidden="true">
        <span><strong>${label}</strong><small>${description}</small></span>
      </button>`;
    }

    function seasonButtonMarkup(season, label) {
      const selected = state.season === season;
      return `<button class="pi-season${selected ? " is-active" : ""}" type="button" data-pi-season="${season}" aria-pressed="${selected}"><span>${escape(label)}</span></button>`;
    }

    root.classList.add("people-intelligence");
    root.setAttribute("data-people-intelligence", "");
    const heroCastIds = ["jon-snow", "daenerys-targaryen", "arya-stark", "tyrion-lannister", "cersei-lannister", "jaime-lannister"];
    const heroCast = heroCastIds
      .map(characterId => data.charactersById.get(characterId))
      .filter(Boolean)
      .map(character => `<button class="pi-hero-cast__person ${houseClass(character.house)}" type="button" data-pi-character="${escape(character.id)}" aria-label="Open intelligence for ${escape(character.name)}"><span class="pi-hero-cast__portrait">${portraitMarkup(character, "hero-cast")}</span><span class="pi-hero-cast__name">${escape(character.name)}</span></button>`)
      .join("");
    const heroMemory = fanMomentFor("arya-stark");
    root.innerHTML = `
      <section class="pi-shell" aria-labelledby="${id}-title">
        <header class="pi-hero">
          <div class="pi-hero__veil" aria-hidden="true"></div>
          <div class="pi-hero-cast" aria-label="Featured people from the realm">${heroCast}</div>
          <div class="pi-hero__content">
            <p class="pi-eyebrow">The people we never stopped arguing about</p>
            <h1 id="${id}-title">Lives in the fire.</h1>
            <p class="pi-hero__lede">Open the scene you return to, the choice that changed them, and the people they loved, betrayed, lost, or became.</p>
            ${heroMemory ? `<div class="pi-hero__pulse"><span>One line to carry</span><blockquote>“${escape(heroMemory.line)}”</blockquote><a href="#/quotes?quote=${encodeURIComponent(heroMemory.quoteId)}">Enter Arya's memory <span aria-hidden="true">↗</span></a></div>` : ""}
            <dl class="pi-hero__stats" aria-label="Archive coverage">
              <div><dt>${data.characters.length}</dt><dd>People</dd></div>
              <div><dt>${data.relations.length}</dt><dd>Documented ties</dd></div>
              <div><dt>${houses().length}</dt><dd>Allegiances</dd></div>
            </dl>
          </div>
        </header>

        <div class="pi-command-bar">
          <nav class="pi-mode-tabs" role="tablist" aria-label="People views">
            ${modeButtonMarkup("spotlight", "Spotlight", "Essential arcs")}
            ${modeButtonMarkup("constellation", "Constellation", "Power and kinship")}
            ${modeButtonMarkup("archive", "Archive", "Every record")}
          </nav>
          <div class="pi-season-lens">
            <div class="pi-season-lens__copy">
              <span>Season lens</span>
              <small>Filters documented records</small>
            </div>
            <div class="pi-seasons" role="group" aria-label="Filter people by documented season">
              ${seasonButtonMarkup(0, "All")}
              ${Array.from({ length: 8 }, (_, index) => seasonButtonMarkup(index + 1, String(index + 1))).join("")}
            </div>
          </div>
        </div>

        <div class="pi-content" id="${id}-panel" role="tabpanel" aria-labelledby="${id}-tab-${state.mode}" tabindex="0"></div>
        <div class="pi-compare-layer" data-pi-compare-layer></div>
        <div class="pi-detail-layer" data-pi-detail-layer></div>
        <p class="pi-announcer" data-pi-announcer aria-live="polite" aria-atomic="true"></p>
      </section>`;

    const panel = root.querySelector(`#${id}-panel`);
    const compareLayer = root.querySelector("[data-pi-compare-layer]");
    const detailLayer = root.querySelector("[data-pi-detail-layer]");
    const announcer = root.querySelector("[data-pi-announcer]");

    function announce(message) {
      announcer.textContent = "";
      const schedule = typeof global.requestAnimationFrame === "function"
        ? global.requestAnimationFrame.bind(global)
        : callback => global.setTimeout(callback, 0);
      schedule(() => {
        if (!destroyed) announcer.textContent = message;
      });
    }

    function updateModeTabs() {
      root.querySelectorAll("[data-pi-mode]").forEach(button => {
        const selected = button.dataset.piMode === state.mode;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", `${id}-tab-${state.mode}`);
    }

    function updateSeasonButtons() {
      root.querySelectorAll("[data-pi-season]").forEach(button => {
        const selected = Number(button.dataset.piSeason) === state.season;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    }

    function statusLabel(character) {
      return character.status === "alive" ? "Alive at series end" :
        (character.status === "dead" ? "Dead by series end" : "End status unrecorded");
    }

    function seasonFact(character) {
      if (state.season) return `Season ${state.season} record`;
      const seasons = documentedSeasons(character);
      return seasons.length ? `${seasons.length} documented season${seasons.length === 1 ? "" : "s"}` : "Series record";
    }

    function compareButtonMarkup(character, compact) {
      const selected = state.compareIds.includes(character.id);
      const full = state.compareIds.length >= 2 && !selected;
      return `<button class="pi-compare-toggle${compact ? " pi-compare-toggle--compact" : ""}${selected ? " is-selected" : ""}" type="button" data-pi-compare="${escape(character.id)}" aria-pressed="${selected}"${full ? " disabled" : ""}>
        ${selected ? "Selected" : "Compare"}
      </button>`;
    }

    function spotlightCardMarkup(character, index) {
      const featured = index === 0 ? " pi-spotlight-card--lead" : "";
      const memory = fanMomentFor(character.id);
      return `<article class="pi-spotlight-card ${houseClass(character.house)}${featured}">
        <button class="pi-spotlight-card__portrait" type="button" data-pi-character="${escape(character.id)}" aria-label="Open intelligence for ${escape(character.name)}">
          ${portraitMarkup(character, index === 0 ? "hero" : "feature")}
        </button>
        <div class="pi-spotlight-card__scrim" aria-hidden="true"></div>
        <div class="pi-spotlight-card__content">
          <p class="pi-card-kicker">${escape(character.house)}</p>
          <h2>${escape(character.name)}</h2>
          <p class="pi-spotlight-card__actor">${character.actor && !/^actor unknown$/i.test(character.actor) ? `Played by ${escape(character.actor)}` : "Cast credit not recorded"}</p>
          ${memory ? `<p class="pi-spotlight-card__memory"><span>The scene fans return to</span>${escape(memory.title)}</p>` : ""}
          <dl class="pi-fact-row">
            <div><dt>Season</dt><dd>${escape(seasonFact(character))}</dd></div>
            <div><dt>Fate</dt><dd>${escape(statusLabel(character))}</dd></div>
            <div><dt>Ties</dt><dd>${relationCount(character.id)}</dd></div>
          </dl>
          <div class="pi-card-actions">
            <button type="button" data-pi-character="${escape(character.id)}">Inspect ties</button>
            ${compareButtonMarkup(character, false)}
            <a href="${profileHref(character)}" data-pi-profile>Full profile</a>
          </div>
        </div>
      </article>`;
    }

    function renderSpotlight() {
      const curated = SPOTLIGHT_IDS
        .map(characterId => data.charactersById.get(characterId))
        .filter(Boolean)
        .filter(character => hasSeason(character, state.season));
      const used = new Set(curated.map(character => character.id));
      const supplements = rankedCharacters(character => hasSeason(character, state.season) && !used.has(character.id));
      const visible = [...curated, ...supplements].slice(0, 8);
      panel.innerHTML = `
        <section class="pi-section pi-spotlight" aria-labelledby="${id}-spotlight-title">
          <div class="pi-section-heading">
            <div>
              <p class="pi-eyebrow">Curated intelligence</p>
              <h2 id="${id}-spotlight-title">Lives that moved the realm</h2>
            </div>
            <p>${state.season ? `People with a documented Season ${state.season} record.` : "Central figures across all eight seasons."}</p>
          </div>
          ${visible.length ? `<div class="pi-spotlight-grid">${visible.map(spotlightCardMarkup).join("")}</div>` : `
            <div class="pi-empty"><h3>No spotlight records found</h3><p>Choose another season to continue exploring.</p></div>`}
        </section>`;
    }

    function constellationFiltersMarkup() {
      return `<div class="pi-constellation-controls">
        <label><span>Focus house</span>
          <select data-pi-constellation-house>
            <option value="">All allegiances</option>
            ${houses().map(house => `<option value="${escape(house)}"${house === state.constellationHouse ? " selected" : ""}>${escape(house)}</option>`).join("")}
          </select>
        </label>
        <fieldset>
          <legend>Relationship types</legend>
          <div class="pi-type-filters">
            ${RELATION_TYPES.map(type => `<button class="pi-type-filter pi-relation--${type}${state.constellationTypes.has(type) ? " is-active" : ""}" type="button" data-pi-type="${type}" aria-pressed="${state.constellationTypes.has(type)}">${RELATION_LABELS[type]}</button>`).join("")}
          </div>
        </fieldset>
      </div>`;
    }

    function constellationPersonMarkup(entry, index) {
      const type = RELATION_TYPES.includes(entry.relation.type) ? entry.relation.type : "bond";
      return `<li class="pi-orbit-card pi-relation--${type}">
        <button type="button" data-pi-neighbor="${escape(entry.other.id)}" aria-label="Focus ${escape(entry.other.name)}; ${escape(entry.relation.label || RELATION_LABELS[type])}">
          ${portraitMarkup(entry.other, "orbit")}
          <span class="pi-orbit-card__copy">
            <strong>${escape(entry.other.name)}</strong>
            <small>${escape(entry.relation.label || RELATION_LABELS[type])}</small>
          </span>
          <span class="pi-orbit-card__index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        </button>
      </li>`;
    }

    function renderConstellation() {
      chooseSelectedCharacter();
      const selected = state.selectedId ? data.charactersById.get(state.selectedId) : null;
      const candidates = availableCharacters(state.constellationHouse);
      const entries = selected ? collapsedRelationEntries(selected.id, state.constellationTypes)
        .filter(entry => hasSeason(entry.other, state.season))
        .filter(entry => !state.constellationHouse || entry.other.house === state.constellationHouse)
        .slice(0, 12) : [];

      panel.innerHTML = `
        <section class="pi-section pi-constellation" aria-labelledby="${id}-constellation-title">
          <div class="pi-section-heading pi-section-heading--compact">
            <div><p class="pi-eyebrow">Relationship intelligence</p><h2 id="${id}-constellation-title">Power is personal</h2></div>
            <p>Select any record to redraw the documented ties around them.</p>
          </div>
          ${constellationFiltersMarkup()}
          ${selected ? `<div class="pi-constellation-layout">
            <aside class="pi-focus-index" aria-label="Choose a focus character">
              <label for="${id}-focus-select">Focus record</label>
              <select id="${id}-focus-select" data-pi-focus-select>
                ${candidates.map(character => `<option value="${escape(character.id)}"${character.id === selected.id ? " selected" : ""}>${escape(character.name)} · ${escape(character.house)}</option>`).join("")}
              </select>
              <div class="pi-focus-index__summary">
                <span>${entries.length}</span>
                <p>visible tie${entries.length === 1 ? "" : "s"} under the current lens</p>
              </div>
              <p class="pi-key-hint">Use arrow keys between relationship cards. Press Enter to refocus.</p>
            </aside>
            <div class="pi-constellation-stage">
              <div class="pi-focus-person ${houseClass(selected.house)}">
                <button type="button" data-pi-character="${escape(selected.id)}" aria-label="Open intelligence for ${escape(selected.name)}">
                  ${portraitMarkup(selected, "focus")}
                  <span><small>${escape(selected.house)}</small><strong>${escape(selected.name)}</strong></span>
                </button>
              </div>
              ${entries.length ? `<ol class="pi-orbit" aria-label="Relationships for ${escape(selected.name)}">${entries.map(constellationPersonMarkup).join("")}</ol>` : `
                <div class="pi-empty pi-empty--constellation"><h3>No visible ties</h3><p>Broaden the house, season, or relationship filters.</p></div>`}
            </div>
            <aside class="pi-dossier pi-dossier--inline ${houseClass(selected.house)}" aria-label="Focused character details">
              ${dossierMarkup(selected, false)}
            </aside>
          </div>` : `<div class="pi-empty"><h3>No records under this lens</h3><p>Broaden the house or season filter.</p></div>`}
        </section>`;
    }

    function archiveCardMarkup(character) {
      const seasons = documentedSeasons(character);
      return `<article class="pi-archive-card ${houseClass(character.house)}">
        <button class="pi-archive-card__open" type="button" data-pi-character="${escape(character.id)}" aria-label="Open intelligence for ${escape(character.name)}">
          ${portraitMarkup(character, "archive")}
          <span class="pi-archive-card__identity">
            <span class="pi-card-kicker">${escape(character.house)}</span>
            <strong>${escape(character.name)}</strong>
            <small>${character.actor && !/^actor unknown$/i.test(character.actor) ? escape(character.actor) : "Cast credit not recorded"}</small>
          </span>
        </button>
        <div class="pi-archive-card__meta">
          <span>${escape(statusLabel(character))}</span>
          <span>${relationCount(character.id)} ties</span>
          <span>${state.season ? `Season ${state.season}` : (seasons.length ? `Seasons ${seasons.join(", ")}` : "Series record")}</span>
        </div>
        <div class="pi-archive-card__actions">
          ${compareButtonMarkup(character, true)}
          <a href="${profileHref(character)}" data-pi-profile>Profile</a>
        </div>
      </article>`;
    }

    function filteredArchiveCharacters() {
      const query = state.archiveQuery.trim().toLocaleLowerCase();
      return data.characters.filter(character => {
        const matchesQuery = !query || [character.name, character.actor, character.house, character.bio]
          .some(value => safeText(value).toLocaleLowerCase().includes(query));
        const matchesHouse = !state.archiveHouse || character.house === state.archiveHouse;
        const matchesStatus = !state.archiveStatus || character.status === state.archiveStatus;
        const hasPhoto = Boolean(photoFor(character));
        const matchesPortrait = !state.archivePortrait ||
          (state.archivePortrait === "photo" ? hasPhoto : !hasPhoto);
        return matchesQuery && matchesHouse && matchesStatus && matchesPortrait && hasSeason(character, state.season);
      }).sort((a, b) => a.name.localeCompare(b.name));
    }

    function renderArchiveResults() {
      const results = panel.querySelector("[data-pi-archive-results]");
      const count = panel.querySelector("[data-pi-result-count]");
      if (!results || !count) return;
      const filtered = filteredArchiveCharacters();
      const visible = filtered.slice(0, archiveLimit);
      count.textContent = `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;
      results.innerHTML = visible.length ? `
        <div class="pi-archive-grid">${visible.map(archiveCardMarkup).join("")}</div>
        ${visible.length < filtered.length ? `<button class="pi-load-more" type="button" data-pi-load-more>Show ${Math.min(48, filtered.length - visible.length)} more records</button>` : ""}` : `
        <div class="pi-empty"><h3>No matching people</h3><p>Clear a filter or choose another season.</p><button type="button" data-pi-clear-archive>Clear archive filters</button></div>`;
    }

    function renderArchive() {
      panel.innerHTML = `
        <section class="pi-section pi-archive" aria-labelledby="${id}-archive-title">
          <div class="pi-section-heading pi-section-heading--compact">
            <div><p class="pi-eyebrow">The complete index</p><h2 id="${id}-archive-title">The cast archive</h2></div>
            <p>Search every person, actor credit, allegiance, and documented connection.</p>
          </div>
          <div class="pi-archive-controls">
            <label class="pi-search-field"><span>Search people</span><input type="search" value="${escape(state.archiveQuery)}" placeholder="Name, actor, house, or biography" autocomplete="off" data-pi-archive-query></label>
            <label><span>House</span><select data-pi-archive-house><option value="">All allegiances</option>${houses().map(house => `<option value="${escape(house)}"${house === state.archiveHouse ? " selected" : ""}>${escape(house)}</option>`).join("")}</select></label>
            <label><span>Fate</span><select data-pi-archive-status><option value="">All end states</option><option value="alive"${state.archiveStatus === "alive" ? " selected" : ""}>Alive</option><option value="dead"${state.archiveStatus === "dead" ? " selected" : ""}>Dead</option></select></label>
            <label><span>Portrait</span><select data-pi-archive-portrait><option value="">All portraits</option><option value="photo"${state.archivePortrait === "photo" ? " selected" : ""}>Actor photos</option><option value="fallback"${state.archivePortrait === "fallback" ? " selected" : ""}>Archive initials</option></select></label>
          </div>
          <div class="pi-results-heading"><p data-pi-result-count aria-live="polite"></p><p>Season lens uses documented records, not a full appearance ledger.</p></div>
          <div data-pi-archive-results></div>
        </section>`;
      renderArchiveResults();
    }

    function renderMode() {
      if (state.mode === "constellation") renderConstellation();
      else if (state.mode === "archive") renderArchive();
      else renderSpotlight();
      updateModeTabs();
      updateCompareLayer();
      updateDetailLayer();
    }

    function dossierMarkup(character, includeClose) {
      const entries = relationEntries(character.id).slice(0, 8);
      const seasons = documentedSeasons(character);
      const memory = fanMomentFor(character.id);
      return `${includeClose ? `<button class="pi-layer-close" type="button" data-pi-close-detail aria-label="Close character intelligence">Close</button>` : ""}
        <p class="pi-card-kicker">${escape(character.house)} intelligence</p>
        <div class="pi-dossier__identity">
          ${portraitMarkup(character, "dossier")}
          <div><h3>${escape(character.name)}</h3><p>${character.actor && !/^actor unknown$/i.test(character.actor) ? `Played by ${escape(character.actor)}` : "Cast credit not recorded"}</p></div>
        </div>
        <p class="pi-dossier__bio">${escape(character.bio || "No biography is recorded yet.")}</p>
        ${memory ? `<section class="pi-memory-card" style="--pi-memory-image:url('${escape(memory.image)}')"><div class="pi-memory-card__image" aria-hidden="true"></div><div class="pi-memory-card__copy"><p class="pi-card-kicker">The scene fans return to</p><h4>${escape(memory.title)}</h4><blockquote>“${escape(memory.line)}”</blockquote><p>${escape(memory.fanNote)}</p><small>${escape(memory.location)} · ${escape(memory.consequence)}</small><a href="#/quotes?quote=${encodeURIComponent(memory.quoteId)}">Follow the line <span aria-hidden="true">↗</span></a></div></section>` : ""}
        <dl class="pi-dossier__facts">
          <div><dt>End state</dt><dd>${escape(statusLabel(character))}</dd></div>
          <div><dt>Documented seasons</dt><dd>${seasons.length ? seasons.join(", ") : "Not indexed"}</dd></div>
          <div><dt>Known ties</dt><dd>${relationCount(character.id)}</dd></div>
        </dl>
        <div class="pi-dossier__ties">
          <h4>Closest documented ties</h4>
          ${entries.length ? `<ul>${entries.map(entry => `<li><button type="button" data-pi-neighbor="${escape(entry.other.id)}"><span class="pi-relation-key pi-relation--${RELATION_TYPES.includes(entry.relation.type) ? entry.relation.type : "bond"}">${escape(RELATION_LABELS[entry.relation.type] || "Tie")}</span><strong>${escape(entry.other.name)}</strong><small>${escape(entry.relation.label || "documented tie")}</small></button></li>`).join("")}</ul>` : `<p>No direct ties are indexed.</p>`}
        </div>
        <div class="pi-dossier__actions">
          ${compareButtonMarkup(character, false)}
          <a href="${profileHref(character)}" data-pi-profile>Open full profile</a>
        </div>`;
    }

    function updateDetailLayer() {
      if (!state.detailOpen || !state.selectedId || !data.charactersById.has(state.selectedId)) {
        detailLayer.innerHTML = "";
        detailLayer.classList.remove("is-open");
        updateBodyLock();
        return;
      }
      const character = data.charactersById.get(state.selectedId);
      detailLayer.classList.add("is-open");
      detailLayer.innerHTML = `<button class="pi-layer-scrim" type="button" data-pi-close-detail tabindex="-1" aria-label="Close character intelligence"></button><aside class="pi-dossier pi-dossier--layer ${houseClass(character.house)}" role="dialog" aria-modal="true" aria-labelledby="${id}-detail-title"><span class="pi-visually-hidden" id="${id}-detail-title">Character intelligence for ${escape(character.name)}</span>${dossierMarkup(character, true)}</aside>`;
      updateBodyLock();
    }

    function findShortestPath(startId, endId) {
      if (startId === endId) return { path: [startId], edges: [] };
      const visited = new Set([startId]);
      const queue = [{ id: startId, path: [startId], edges: [] }];
      while (queue.length) {
        const current = queue.shift();
        const connected = data.relationsById.get(current.id) || [];
        for (const relation of connected) {
          const nextId = relation.source === current.id ? relation.target : relation.source;
          if (visited.has(nextId)) continue;
          const next = { id: nextId, path: [...current.path, nextId], edges: [...current.edges, relation] };
          if (nextId === endId) return { path: next.path, edges: next.edges };
          visited.add(nextId);
          queue.push(next);
        }
      }
      return null;
    }

    function commonConnectionCount(firstId, secondId) {
      const first = new Set(relationEntries(firstId).map(entry => entry.other.id));
      return relationEntries(secondId).filter(entry => first.has(entry.other.id)).length;
    }

    function pathMarkup(path) {
      if (!path) return `<p class="pi-compare__no-path">No documented relationship path connects these records.</p>`;
      return `<ol class="pi-path" aria-label="Shortest documented relationship path">${path.path.map((characterId, index) => {
        const character = data.charactersById.get(characterId);
        const edge = index < path.edges.length ? path.edges[index] : null;
        const type = edge && RELATION_TYPES.includes(edge.type) ? edge.type : "bond";
        return `<li>${portraitMarkup(character, "path")}<strong>${escape(character.name)}</strong>${edge ? `<span class="pi-path__edge pi-relation--${type}"><span>${escape(edge.label || RELATION_LABELS[type])}</span></span>` : ""}</li>`;
      }).join("")}</ol>`;
    }

    function comparisonMarkup() {
      const first = data.charactersById.get(state.compareIds[0]);
      const second = data.charactersById.get(state.compareIds[1]);
      if (!first || !second) return "";
      const path = findShortestPath(first.id, second.id);
      const direct = data.relations.filter(relation =>
        (relation.source === first.id && relation.target === second.id) ||
        (relation.source === second.id && relation.target === first.id)
      );
      const shared = commonConnectionCount(first.id, second.id);
      return `<button class="pi-layer-scrim" type="button" data-pi-close-compare tabindex="-1" aria-label="Close comparison"></button>
        <section class="pi-compare-dialog" role="dialog" aria-modal="true" aria-labelledby="${id}-compare-title">
          <button class="pi-layer-close" type="button" data-pi-close-compare aria-label="Close comparison">Close</button>
          <p class="pi-eyebrow">Relationship comparison</p>
          <h2 id="${id}-compare-title">Two lives, one realm</h2>
          <div class="pi-compare-people">
            ${[first, second].map(character => `<article class="${houseClass(character.house)}">${portraitMarkup(character, "compare")}<div><span>${escape(character.house)}</span><h3>${escape(character.name)}</h3><p>${escape(statusLabel(character))}</p><button type="button" data-pi-remove-compare="${escape(character.id)}">Remove</button></div></article>`).join("")}
          </div>
          <dl class="pi-compare-summary">
            <div><dt>Direct ties</dt><dd>${direct.length}</dd></div>
            <div><dt>Shared connections</dt><dd>${shared}</dd></div>
            <div><dt>Shortest path</dt><dd>${path ? `${path.edges.length} tie${path.edges.length === 1 ? "" : "s"}` : "Not connected"}</dd></div>
          </dl>
          <div class="pi-compare-path"><h3>How they connect</h3>${pathMarkup(path)}</div>
        </section>`;
    }

    function comparisonTrayMarkup() {
      if (!state.compareIds.length || state.compareOpen) return "";
      const selected = state.compareIds.map(characterId => data.charactersById.get(characterId)).filter(Boolean);
      if (!selected.length) return "";
      const ready = selected.length === 2;
      return `<aside class="pi-compare-tray" aria-label="Character comparison selection">
        <div class="pi-compare-tray__selection">
          <span class="pi-compare-tray__portraits">${selected.map(character => portraitMarkup(character, "tray")).join("")}</span>
          <p><strong>${ready ? "Comparison ready" : escape(selected[0].name)}</strong><span>${ready ? `${escape(selected[0].name)} and ${escape(selected[1].name)}` : "Select one more person to compare"}</span></p>
        </div>
        <div class="pi-compare-tray__actions">${ready ? `<button type="button" data-pi-open-compare>View</button>` : ""}<button type="button" data-pi-clear-compare>Clear</button></div>
      </aside>`;
    }

    function updateCompareLayer() {
      const detailCoveredByComparison = state.compareOpen && state.detailOpen;
      detailLayer.toggleAttribute("inert", detailCoveredByComparison);
      if (detailCoveredByComparison) detailLayer.setAttribute("aria-hidden", "true");
      else detailLayer.removeAttribute("aria-hidden");
      compareLayer.classList.toggle("is-open", state.compareOpen);
      compareLayer.classList.toggle("has-selection", state.compareIds.length > 0 && !state.compareOpen);
      compareLayer.innerHTML = state.compareOpen ? comparisonMarkup() : comparisonTrayMarkup();
      updateCompareButtons();
      updateBodyLock();
    }

    function updateCompareButtons() {
      root.querySelectorAll("[data-pi-compare]").forEach(button => {
        const selected = state.compareIds.includes(button.dataset.piCompare);
        const full = state.compareIds.length >= 2 && !selected;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.disabled = full;
        button.textContent = selected ? "Selected" : "Compare";
      });
    }

    function updateBodyLock() {
      const detailIsModal = state.detailOpen && mobileSheet && mobileSheet.matches;
      document.body.classList.toggle("pi-overlay-open", state.compareOpen || detailIsModal);
    }

    function setMode(mode, shouldFocus) {
      if (!MODES.includes(mode) || mode === state.mode) return;
      state.mode = mode;
      state.detailOpen = false;
      renderMode();
      announce(`${mode.charAt(0).toUpperCase()}${mode.slice(1)} view opened.`);
      if (shouldFocus) {
        const tab = root.querySelector(`[data-pi-mode="${mode}"]`);
        if (tab) tab.focus();
      }
    }

    function setSeason(season) {
      const normalized = season === 0 ? 0 : normalizeSeason(season);
      if (normalized === state.season) return;
      state.season = normalized;
      archiveLimit = 48;
      chooseSelectedCharacter();
      updateSeasonButtons();
      renderMode();
      announce(normalized ? `Showing documented Season ${normalized} records.` : "Showing records from all seasons.");
    }

    function openCharacter(characterId, trigger, preserveReturnFocus) {
      if (!data.charactersById.has(characterId)) return;
      if (!preserveReturnFocus) lastFocus = trigger || document.activeElement;
      state.selectedId = characterId;
      state.detailOpen = true;
      updateDetailLayer();
      const close = detailLayer.querySelector("[data-pi-close-detail]");
      if (close) close.focus({ preventScroll: true });
    }

    function closeDetail(restoreFocus) {
      if (!state.detailOpen) return;
      state.detailOpen = false;
      updateDetailLayer();
      if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }

    function toggleCompare(characterId, trigger) {
      if (!data.charactersById.has(characterId)) return;
      const existingIndex = state.compareIds.indexOf(characterId);
      if (existingIndex >= 0) {
        state.compareIds.splice(existingIndex, 1);
        state.compareOpen = false;
      } else if (state.compareIds.length < 2) {
        lastFocus = trigger || document.activeElement;
        state.compareIds.push(characterId);
        state.compareOpen = state.compareIds.length === 2;
      }
      updateCompareLayer();
      if (state.compareOpen) {
        const close = compareLayer.querySelector("[data-pi-close-compare]");
        if (close) close.focus({ preventScroll: true });
        announce("Comparison ready.");
      } else {
        announce(state.compareIds.length ? "One person selected for comparison." : "Comparison cleared.");
      }
    }

    function closeComparison(restoreFocus) {
      if (!state.compareOpen) return;
      state.compareOpen = false;
      updateCompareLayer();
      if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }

    function clearArchiveFilters() {
      state.archiveQuery = "";
      state.archiveHouse = "";
      state.archiveStatus = "";
      state.archivePortrait = "";
      archiveLimit = 48;
      renderArchive();
      const search = panel.querySelector("[data-pi-archive-query]");
      if (search) search.focus();
    }

    function handleClick(event) {
      const modeButton = event.target.closest("[data-pi-mode]");
      if (modeButton && root.contains(modeButton)) {
        setMode(modeButton.dataset.piMode, false);
        return;
      }
      const seasonButton = event.target.closest("[data-pi-season]");
      if (seasonButton && root.contains(seasonButton)) {
        setSeason(Number(seasonButton.dataset.piSeason));
        return;
      }
      const typeButton = event.target.closest("[data-pi-type]");
      if (typeButton && root.contains(typeButton)) {
        const type = typeButton.dataset.piType;
        if (state.constellationTypes.has(type) && state.constellationTypes.size > 1) state.constellationTypes.delete(type);
        else state.constellationTypes.add(type);
        renderConstellation();
        const replacement = panel.querySelector(`[data-pi-type="${type}"]`);
        if (replacement) replacement.focus();
        return;
      }
      const neighbor = event.target.closest("[data-pi-neighbor]");
      if (neighbor && root.contains(neighbor)) {
        const characterId = neighbor.dataset.piNeighbor;
        if (detailLayer.contains(neighbor)) {
          openCharacter(characterId, neighbor, true);
          announce(`Character intelligence updated to ${data.charactersById.get(characterId).name}.`);
          return;
        }
        state.selectedId = characterId;
        if (state.mode === "constellation") {
          renderConstellation();
          const focus = panel.querySelector(".pi-focus-person [data-pi-character]");
          if (focus) focus.focus({ preventScroll: true });
        } else {
          openCharacter(characterId, neighbor);
        }
        return;
      }
      const characterButton = event.target.closest("[data-pi-character]");
      if (characterButton && root.contains(characterButton)) {
        openCharacter(characterButton.dataset.piCharacter, characterButton);
        return;
      }
      const compareButton = event.target.closest("[data-pi-compare]");
      if (compareButton && root.contains(compareButton)) {
        toggleCompare(compareButton.dataset.piCompare, compareButton);
        return;
      }
      const removeCompare = event.target.closest("[data-pi-remove-compare]");
      if (removeCompare && root.contains(removeCompare)) {
        const removeId = removeCompare.dataset.piRemoveCompare;
        state.compareIds = state.compareIds.filter(characterId => characterId !== removeId);
        state.compareOpen = false;
        updateCompareLayer();
        let comparisonReturnTarget = null;
        if (state.detailOpen) {
          const survivingId = state.compareIds[0];
          comparisonReturnTarget = [...detailLayer.querySelectorAll("[data-pi-compare]")]
            .find(button => button.dataset.piCompare === survivingId && !button.disabled) ||
            detailLayer.querySelector(".pi-dossier--layer [data-pi-close-detail]");
        } else {
          comparisonReturnTarget = compareLayer.querySelector("[data-pi-clear-compare]");
        }
        if (comparisonReturnTarget) comparisonReturnTarget.focus({ preventScroll: true });
        announce("Person removed from comparison.");
        return;
      }
      if (event.target.closest("[data-pi-close-detail]")) {
        closeDetail(true);
        return;
      }
      if (event.target.closest("[data-pi-close-compare]")) {
        closeComparison(true);
        return;
      }
      if (event.target.closest("[data-pi-open-compare]")) {
        if (state.compareIds.length === 2) {
          lastFocus = event.target.closest("[data-pi-open-compare]");
          state.compareOpen = true;
          updateCompareLayer();
          const close = compareLayer.querySelector("[data-pi-close-compare]");
          if (close) close.focus({ preventScroll: true });
        }
        return;
      }
      if (event.target.closest("[data-pi-clear-compare]")) {
        state.compareIds = [];
        state.compareOpen = false;
        updateCompareLayer();
        announce("Comparison cleared.");
        return;
      }
      if (event.target.closest("[data-pi-load-more]")) {
        archiveLimit += 48;
        renderArchiveResults();
        const cards = panel.querySelectorAll(".pi-archive-card__open");
        if (cards.length) cards[Math.min(archiveLimit - 48, cards.length - 1)].focus({ preventScroll: true });
        return;
      }
      if (event.target.closest("[data-pi-clear-archive]")) {
        clearArchiveFilters();
        return;
      }
      const profileLink = event.target.closest("[data-pi-profile]");
      if (profileLink && root.contains(profileLink) && typeof options.onNavigate === "function") {
        event.preventDefault();
        options.onNavigate(profileLink.getAttribute("href"));
      }
    }

    function handleInput(event) {
      if (!event.target.matches("[data-pi-archive-query]")) return;
      state.archiveQuery = event.target.value;
      archiveLimit = 48;
      renderArchiveResults();
    }

    function handleChange(event) {
      if (event.target.matches("[data-pi-archive-house]")) state.archiveHouse = event.target.value;
      else if (event.target.matches("[data-pi-archive-status]")) state.archiveStatus = event.target.value;
      else if (event.target.matches("[data-pi-archive-portrait]")) state.archivePortrait = event.target.value;
      else if (event.target.matches("[data-pi-constellation-house]")) {
        state.constellationHouse = event.target.value;
        chooseSelectedCharacter();
        renderConstellation();
        const replacement = panel.querySelector("[data-pi-constellation-house]");
        if (replacement) replacement.focus();
        return;
      } else if (event.target.matches("[data-pi-focus-select]")) {
        state.selectedId = event.target.value;
        renderConstellation();
        const replacement = panel.querySelector("[data-pi-focus-select]");
        if (replacement) replacement.focus();
        return;
      } else return;
      archiveLimit = 48;
      renderArchiveResults();
    }

    function cycleFocus(elements, current, direction) {
      const index = elements.indexOf(current);
      if (index < 0 || !elements.length) return;
      elements[(index + direction + elements.length) % elements.length].focus();
    }

    function trapDialogFocus(event, layer) {
      const focusable = [...layer.querySelectorAll("a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex='-1'])")]
        .filter(element => !element.hidden && element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        if (state.compareOpen) closeComparison(true);
        else if (state.detailOpen) closeDetail(true);
        return;
      }
      if (event.key === "Tab" && state.compareOpen) {
        trapDialogFocus(event, compareLayer);
        return;
      }
      if (event.key === "Tab" && state.detailOpen) {
        trapDialogFocus(event, detailLayer);
        return;
      }
      const modeButton = event.target.closest("[data-pi-mode]");
      if (modeButton && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const tabs = [...root.querySelectorAll("[data-pi-mode]")];
        const currentIndex = tabs.indexOf(modeButton);
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 :
          (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        setMode(tabs[nextIndex].dataset.piMode, true);
        return;
      }
      const seasonButton = event.target.closest("[data-pi-season]");
      if (seasonButton && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        cycleFocus([...root.querySelectorAll("[data-pi-season]")], seasonButton, event.key === "ArrowRight" ? 1 : -1);
        return;
      }
      const neighbor = event.target.closest("[data-pi-neighbor]");
      if (neighbor && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        const orbitButtons = [...panel.querySelectorAll(".pi-orbit [data-pi-neighbor]")];
        if (!orbitButtons.length) return;
        event.preventDefault();
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        cycleFocus(orbitButtons, neighbor, direction);
      }
    }

    function handleMobileChange() {
      updateBodyLock();
    }

    listen(root, "click", handleClick);
    listen(root, "input", handleInput);
    listen(root, "change", handleChange);
    listen(root, "keydown", handleKeydown);
    if (mobileSheet) {
      if (typeof mobileSheet.addEventListener === "function") {
        mobileSheet.addEventListener("change", handleMobileChange);
        cleanup.push(() => mobileSheet.removeEventListener("change", handleMobileChange));
      } else if (typeof mobileSheet.addListener === "function") {
        mobileSheet.addListener(handleMobileChange);
        cleanup.push(() => mobileSheet.removeListener(handleMobileChange));
      }
    }

    chooseSelectedCharacter();
    renderMode();

    const handle = {
      destroy() {
        if (destroyed) return;
        destroyed = true;
        cleanup.splice(0).forEach(remove => remove());
        document.body.classList.remove("pi-overlay-open");
        if (root.querySelector(".pi-shell")) root.replaceChildren();
        if (originalClass == null) root.removeAttribute("class");
        else root.setAttribute("class", originalClass);
        if (originalMarker == null) root.removeAttribute("data-people-intelligence");
        else root.setAttribute("data-people-intelligence", originalMarker);
        mountedRoots.delete(root);
      }
    };

    mountedRoots.set(root, handle);
    return handle;
  }

  global.PeopleIntelligence = Object.assign(global.PeopleIntelligence || {}, { mount });
})(window);
