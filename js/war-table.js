// Interactive homepage relationship constellation.
//
// Depends on D3 v7 and the shared Game of Thrones datasets/helpers when they
// are available. The module also accepts those dependencies through mount
// options, which keeps it reusable in isolated previews and tests.
(function exposeWarTable(global) {
  "use strict";

  const mountedRoots = new WeakMap();
  const relationTypes = ["family", "marriage", "allegiance", "conflict", "bond"];
  const relationLabels = {
    family: "Family",
    marriage: "Marriage",
    allegiance: "Allegiance",
    conflict: "Conflict",
    bond: "Bond"
  };
  let instanceCount = 0;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function endpointId(value) {
    return value && typeof value === "object" ? value.id : value;
  }

  function seasonNumber(value) {
    const match = String(value == null ? "" : value).match(/\d+/);
    return match ? Number(match[0]) : NaN;
  }

  function validSeason(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 8) {
      throw new RangeError("WarTable season must be an integer from 1 through 8.");
    }
    return parsed;
  }

  function escapeMarkup(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function uniqueStrings(values) {
    return [...new Set(asArray(values).filter(value => typeof value === "string" && value))];
  }

  function initials(name) {
    const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function hashNumber(value) {
    let hash = 2166136261;
    const input = String(value);
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function resolveDependencies(options) {
    const characterData = options.characters ||
      (typeof CHARACTERS !== "undefined" ? CHARACTERS :
        (typeof characters !== "undefined" ? characters : global.characters));
    const relationData = options.relations ||
      (typeof RELATIONS !== "undefined" ? RELATIONS :
        (typeof relations !== "undefined" ? relations : global.relations));
    const eventData = options.events ||
      (typeof EVENTS !== "undefined" ? EVENTS :
        (typeof events !== "undefined" ? events : global.events));
    const battleData = options.battles ||
      (typeof BATTLES !== "undefined" ? BATTLES :
        (typeof battles !== "undefined" ? battles : global.battles));
    const colors = options.houseColors ||
      (typeof HOUSE_COLORS !== "undefined" ? HOUSE_COLORS : global.HOUSE_COLORS) || {};
    const styles = options.relationStyles ||
      (typeof RELATION_STYLE !== "undefined" ? RELATION_STYLE : global.RELATION_STYLE) || {};
    const photoHelper = options.actorPhotoFor ||
      (typeof actorPhotoFor === "function" ? actorPhotoFor : global.actorPhotoFor);
    const avatarHelper = options.avatarSVG ||
      (typeof generativeAvatarSVG === "function" ? generativeAvatarSVG : global.generativeAvatarSVG);
    const colorHelper = options.getHouseColor ||
      (typeof getHouseColor === "function" ? getHouseColor : global.getHouseColor);

    return {
      d3: options.d3 || global.d3,
      characters: asArray(characterData),
      relations: asArray(relationData),
      events: asArray(eventData),
      battles: asArray(battleData),
      houseColors: colors,
      relationStyles: styles,
      actorPhotoFor: typeof photoHelper === "function" ? photoHelper : null,
      avatarSVG: typeof avatarHelper === "function" ? avatarHelper : null,
      getHouseColor: typeof colorHelper === "function" ? colorHelper : null
    };
  }

  function normalizeData(dependencies) {
    const charactersById = new Map();
    dependencies.characters.forEach(character => {
      if (!character || typeof character.id !== "string" || typeof character.name !== "string") return;
      if (!charactersById.has(character.id)) charactersById.set(character.id, character);
    });

    const relations = dependencies.relations.filter(relation => {
      if (!relation || !relationTypes.includes(relation.type)) return false;
      const source = endpointId(relation.source);
      const target = endpointId(relation.target);
      return source !== target && charactersById.has(source) && charactersById.has(target);
    });

    return {
      characters: [...charactersById.values()],
      charactersById,
      relations
    };
  }

  function battleHouses(battle) {
    return uniqueStrings(asArray(battle && battle.combatants).flatMap(side => asArray(side && side.houses)));
  }

  function battleCharacters(battle) {
    return uniqueStrings([
      ...asArray(battle && battle.linkedCharacters),
      ...asArray(battle && battle.combatants).flatMap(side => asArray(side && side.characters))
    ]);
  }

  function eventScore(event) {
    const typeWeight = {
      battle: 60,
      death: 50,
      coronation: 40,
      politics: 30,
      wedding: 20,
      birth: 15,
      other: 10
    };
    return (typeWeight[event.type] || 0) + asArray(event.characters).length;
  }

  function buildDispatches(dependencies, data, preferredEventIds) {
    const dispatches = new Map();

    for (let season = 1; season <= 8; season += 1) {
      const seasonEvents = dependencies.events
        .filter(event => seasonNumber(event && event.season) === season)
        .filter(event => event && (event.title || event.summary));
      const seasonBattles = dependencies.battles
        .filter(battle => seasonNumber(battle && battle.season) === season)
        .filter(battle => battle && (battle.name || battle.outcome));

      const preferredId = preferredEventIds && preferredEventIds[season];
      const preferredEvent = preferredId
        ? seasonEvents.find(event => event.id === preferredId)
        : null;
      const matchingBattle = preferredEvent
        ? seasonBattles.find(battle => asArray(battle.linkedEvents).includes(preferredEvent.id))
        : null;
      const rankedBattles = [...seasonBattles].sort((a, b) => {
        function score(battleRecord) {
          const linkedEventScores = seasonEvents
            .filter(eventRecord => asArray(battleRecord.linkedEvents).includes(eventRecord.id))
            .map(eventScore);
          const linkedEventScore = linkedEventScores.length ? Math.max(...linkedEventScores) : 0;
          return linkedEventScore + battleCharacters(battleRecord).length * 2 + battleHouses(battleRecord).length * 2;
        }
        return score(b) - score(a) || String(a.id || "").localeCompare(String(b.id || ""));
      });
      const battle = matchingBattle || rankedBattles[0] || null;
      const linkedEvent = battle
        ? seasonEvents.find(event => asArray(battle.linkedEvents).includes(event.id))
        : null;
      const event = preferredEvent || linkedEvent || [...seasonEvents].sort((a, b) => eventScore(b) - eventScore(a))[0] || null;

      if (battle) {
        const characterIds = uniqueStrings([
          ...battleCharacters(battle),
          ...asArray(event && event.characters)
        ]).filter(id => data.charactersById.has(id));
        const houses = uniqueStrings([
          ...battleHouses(battle),
          ...asArray(event && event.houses)
        ]);
        dispatches.set(season, {
          season,
          kind: "Battle record",
          title: battle.name || (event && event.title) || `Season ${season}`,
          summary: battle.outcome || (event && event.summary) || "",
          location: battle.location || "",
          casualties: battle.casualties || "",
          houses,
          characterIds,
          sourceId: battle.id || (event && event.id) || ""
        });
      } else if (event) {
        dispatches.set(season, {
          season,
          kind: event.type ? `${String(event.type).replace(/-/g, " ")} record` : "Timeline record",
          title: event.title || `Season ${season}`,
          summary: event.summary || "",
          location: "",
          casualties: "",
          houses: uniqueStrings(event.houses),
          characterIds: uniqueStrings(event.characters).filter(id => data.charactersById.has(id)),
          sourceId: event.id || ""
        });
      } else {
        dispatches.set(season, {
          season,
          kind: "Timeline record",
          title: `Season ${season}`,
          summary: "No featured event is available in the loaded timeline.",
          location: "",
          casualties: "",
          houses: [],
          characterIds: [],
          sourceId: ""
        });
      }
    }

    return dispatches;
  }

  function selectConstellation(data, dispatches, dependencies, requestedLimit) {
    const degrees = new Map(data.characters.map(character => [character.id, 0]));
    data.relations.forEach(relation => {
      const source = endpointId(relation.source);
      const target = endpointId(relation.target);
      degrees.set(source, (degrees.get(source) || 0) + 1);
      degrees.set(target, (degrees.get(target) || 0) + 1);
    });

    const eventAppearances = new Map(data.characters.map(character => [character.id, 0]));
    dependencies.events.forEach(event => {
      uniqueStrings(event && event.characters).forEach(id => {
        if (eventAppearances.has(id)) eventAppearances.set(id, eventAppearances.get(id) + 1);
      });
    });

    function hasPhoto(character) {
      if (!dependencies.actorPhotoFor) return false;
      try {
        return Boolean(dependencies.actorPhotoFor(character.id));
      } catch (_error) {
        return false;
      }
    }

    function representativeScore(character) {
      return (eventAppearances.get(character.id) || 0) * 8 +
        (degrees.get(character.id) || 0) * 3 +
        (hasPhoto(character) ? 2 : 0);
    }

    // Keep the homepage constellation legible: reserve one high-signal person
    // per season rather than pulling every dispatch participant into the graph.
    // The remaining slots favor connectors so the result reads as a web, while
    // house highlighting still represents the full dispatch record.
    const candidatesBySeason = [...dispatches.values()].map(dispatch =>
      dispatch.characterIds
        .map(id => data.charactersById.get(id))
        .filter(Boolean)
        .sort((a, b) => representativeScore(b) - representativeScore(a) || a.name.localeCompare(b.name))
    );
    const requiredIds = new Set();
    for (let pass = 0; pass < 1 && requiredIds.size < requestedLimit; pass += 1) {
      for (const candidates of candidatesBySeason) {
        if (requiredIds.size >= requestedLimit) break;
        const representative = candidates.find(character => !requiredIds.has(character.id));
        if (representative) requiredIds.add(representative.id);
      }
    }

    const requiredConnections = new Map(data.characters.map(character => [character.id, 0]));
    data.relations.forEach(relation => {
      const source = endpointId(relation.source);
      const target = endpointId(relation.target);
      if (requiredIds.has(source)) requiredConnections.set(target, (requiredConnections.get(target) || 0) + 1);
      if (requiredIds.has(target)) requiredConnections.set(source, (requiredConnections.get(source) || 0) + 1);
    });

    const ranked = [...data.characters].sort((a, b) => {
      const scoreA = (requiredConnections.get(a.id) || 0) * 100 +
        representativeScore(a);
      const scoreB = (requiredConnections.get(b.id) || 0) * 100 +
        representativeScore(b);
      return scoreB - scoreA || a.name.localeCompare(b.name);
    });

    const selectedIds = new Set(requiredIds);
    for (const character of ranked) {
      if (selectedIds.size >= requestedLimit) break;
      selectedIds.add(character.id);
    }

    const characters = data.characters.filter(character => selectedIds.has(character.id));
    const relations = data.relations.filter(relation =>
      selectedIds.has(endpointId(relation.source)) && selectedIds.has(endpointId(relation.target))
    );
    return { characters, relations };
  }

  function mount(rootElement, rawOptions) {
    if (!(rootElement instanceof Element)) {
      throw new TypeError("WarTable.mount requires a root Element.");
    }

    const previous = mountedRoots.get(rootElement);
    if (previous) previous.destroy();

    const options = rawOptions || {};
    const dependencies = resolveDependencies(options);
    const data = normalizeData(dependencies);
    const dispatches = buildDispatches(dependencies, data, options.featuredEventIds);
    const nodeLimitValue = Number(options.nodeLimit == null ? 22 : options.nodeLimit);
    const nodeLimit = Number.isFinite(nodeLimitValue)
      ? Math.max(16, Math.min(48, Math.round(nodeLimitValue)))
      : 22;
    const constellation = selectConstellation(data, dispatches, dependencies, nodeLimit);
    const instanceId = `war-table-${++instanceCount}`;
    const titleId = `${instanceId}-title`;
    const descriptionId = `${instanceId}-description`;
    const dispatchId = `${instanceId}-dispatch`;
    const hadClass = rootElement.classList.contains("war-table");
    const previousAttribute = rootElement.getAttribute("data-war-table");
    const cleanup = [];
    const mediaQuery = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    let destroyed = false;
    let selectedId = null;
    let currentSeason = validSeason(options.season == null ? 1 : options.season);
    let featuredCharacterIds = new Set();
    let featuredHouses = new Set();
    let simulation = null;
    let resizeObserver = null;
    let resizeFrame = 0;
    let graph = null;
    let plotWidth = 0;
    let plotHeight = 0;
    let nodeRadius = 26;

    rootElement.classList.add("war-table");
    rootElement.setAttribute("data-war-table", "");

    const shell = document.createElement("section");
    shell.className = "war-table__shell";
    shell.innerHTML = `
      <header class="war-table__header">
        <div class="war-table__heading">
          <p class="war-table__eyebrow">The realm at a glance</p>
          <h2 class="war-table__title" id="${titleId}">${escapeMarkup(options.title || "Power Is a Web")}</h2>
          <p class="war-table__intro" id="${descriptionId}">Explore the shifting alliances, conflicts, and betrayals that shape the Seven Kingdoms.</p>
        </div>
        <div class="war-table__season-picker">
          <span class="war-table__season-label" id="${instanceId}-season-label">Season</span>
          <div class="war-table__season-controls" role="group" aria-labelledby="${instanceId}-season-label">
            ${Array.from({ length: 8 }, (_, index) => {
              const season = index + 1;
              return `<button class="war-table__season" type="button" data-war-table-season="${season}" aria-controls="${dispatchId}" aria-pressed="false"><span class="war-table__season-word">Season</span> <span class="war-table__season-number">${season}</span></button>`;
            }).join("")}
          </div>
        </div>
      </header>
      <div class="war-table__body">
        <div class="war-table__stage">
          <svg class="war-table__svg" role="group" aria-labelledby="${titleId} ${descriptionId}"></svg>
          <p class="war-table__status" role="status" hidden></p>
        </div>
        <div class="war-table__legend" aria-label="Relationship legend"></div>
      </div>
      <div class="war-table__story">
        <article class="war-table__dispatch" id="${dispatchId}" aria-live="polite"></article>
        <aside class="war-table__details" aria-label="Selected character" aria-live="polite"></aside>
      </div>
    `;
    rootElement.replaceChildren(shell);

    const svgElement = shell.querySelector(".war-table__svg");
    const stageElement = shell.querySelector(".war-table__stage");
    const statusElement = shell.querySelector(".war-table__status");
    const legendElement = shell.querySelector(".war-table__legend");
    const dispatchElement = shell.querySelector(".war-table__dispatch");
    const detailsElement = shell.querySelector(".war-table__details");
    const seasonButtons = [...shell.querySelectorAll("[data-war-table-season]")];

    function listen(target, type, handler, listenerOptions) {
      target.addEventListener(type, handler, listenerOptions);
      cleanup.push(() => target.removeEventListener(type, handler, listenerOptions));
    }

    function houseColor(house) {
      if (dependencies.getHouseColor) {
        try {
          const resolved = dependencies.getHouseColor(house);
          if (resolved) return resolved;
        } catch (_error) {
          // Fall back to the shared color table below.
        }
      }
      return dependencies.houseColors[house] || dependencies.houseColors.Unaffiliated || "";
    }

    function photoFor(character) {
      if (!dependencies.actorPhotoFor) return null;
      try {
        const photo = dependencies.actorPhotoFor(character.id);
        return photo && typeof photo.file === "string" ? photo : null;
      } catch (_error) {
        return null;
      }
    }

    function avatarDataUrl(character) {
      if (!dependencies.avatarSVG) return "";
      try {
        const markup = dependencies.avatarSVG(character);
        return typeof markup === "string" && markup.includes("<svg")
          ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
          : "";
      } catch (_error) {
        return "";
      }
    }

    function relationEntriesFor(characterId) {
      return data.relations
        .filter(relation => endpointId(relation.source) === characterId || endpointId(relation.target) === characterId)
        .map(relation => {
          const source = endpointId(relation.source);
          const target = endpointId(relation.target);
          const otherId = source === characterId ? target : source;
          return { relation, other: data.charactersById.get(otherId) };
        })
        .filter(entry => entry.other)
        .sort((a, b) => {
          const typeOrder = relationTypes.indexOf(a.relation.type) - relationTypes.indexOf(b.relation.type);
          return typeOrder || a.other.name.localeCompare(b.other.name);
        });
    }

    function characterHref(character) {
      const fallback = `#/character/${encodeURIComponent(character.id)}`;
      if (typeof options.characterHref !== "function") return fallback;
      const candidate = options.characterHref(character);
      if (typeof candidate !== "string" || !candidate.trim()) return fallback;
      try {
        const parsed = new URL(candidate, document.baseURI);
        return parsed.protocol === "http:" || parsed.protocol === "https:" ? candidate : fallback;
      } catch (_error) {
        return fallback;
      }
    }

    function renderLegend() {
      const visibleTypes = relationTypes.filter(type => constellation.relations.some(relation => relation.type === type));
      legendElement.innerHTML = `
        <span class="war-table__legend-title">Documented ties</span>
        <ul class="war-table__legend-list">
          ${visibleTypes.map(type => `
            <li class="war-table__legend-item war-table__legend-item--${type}">
              <span class="war-table__legend-line" aria-hidden="true"></span>
              <span>${relationLabels[type]}</span>
            </li>
          `).join("")}
        </ul>
        <p class="war-table__legend-note">Relationships span the full series; season highlights identify participants and houses in the featured record.</p>
      `;
    }

    function renderDispatch() {
      const dispatch = dispatches.get(currentSeason);
      featuredCharacterIds = new Set(dispatch ? dispatch.characterIds : []);
      featuredHouses = new Set(dispatch ? dispatch.houses : []);

      const houseMarkup = dispatch && dispatch.houses.length
        ? `<ul class="war-table__dispatch-houses" aria-label="Houses in this record">${dispatch.houses.map(house => {
            const color = houseColor(house);
            const style = color ? ` style="--war-table-house-color:${escapeMarkup(color)}"` : "";
            return `<li class="war-table__house"${style}>${escapeMarkup(house)}</li>`;
          }).join("")}</ul>`
        : "";
      const metadata = dispatch
        ? [dispatch.location, dispatch.casualties].filter(Boolean)
        : [];

      dispatchElement.innerHTML = dispatch ? `
        <p class="war-table__dispatch-kicker">Season ${currentSeason} · ${escapeMarkup(dispatch.kind)}</p>
        <h3 class="war-table__dispatch-title">${escapeMarkup(dispatch.title)}</h3>
        <p class="war-table__dispatch-summary">${escapeMarkup(dispatch.summary)}</p>
        ${metadata.length ? `<dl class="war-table__dispatch-meta">${metadata.map((value, index) => `
          <div><dt>${index === 0 && dispatch.location ? "Location" : "Casualties"}</dt><dd>${escapeMarkup(value)}</dd></div>
        `).join("")}</dl>` : ""}
        ${houseMarkup}
      ` : "";
    }

    function renderDetails(characterId) {
      if (!characterId) {
        detailsElement.hidden = true;
        detailsElement.innerHTML = `
          <p class="war-table__details-kicker">Character detail</p>
          <h3 class="war-table__details-title">Choose a portrait</h3>
          <p class="war-table__details-empty">Select a person in the constellation to inspect their documented ties.</p>
        `;
        return;
      }

      const character = data.charactersById.get(characterId);
      if (!character) return;
      detailsElement.hidden = false;
      const entries = relationEntriesFor(characterId);
      const visibleEntries = entries.slice(0, 6);
      const color = character.sigilColor || houseColor(character.house);
      const colorStyle = color ? ` style="--war-table-house-color:${escapeMarkup(color)}"` : "";
      const photo = photoFor(character);
      const avatar = photo
        ? `<img class="war-table__details-photo" src="${escapeMarkup(photo.file)}" alt="${escapeMarkup(photo.actor || character.actor || character.name)}" loading="lazy" decoding="async">`
        : `<span class="war-table__details-initials" aria-hidden="true">${escapeMarkup(initials(character.name))}</span>`;
      const href = characterHref(character);

      detailsElement.innerHTML = `
        <p class="war-table__details-kicker">Selected character</p>
        <div class="war-table__details-heading">
          <div class="war-table__details-avatar"${colorStyle}>${avatar}</div>
          <div>
            <h3 class="war-table__details-title">${escapeMarkup(character.name)}</h3>
            <p class="war-table__details-subtitle">${escapeMarkup(character.house || "Unaffiliated")} · ${escapeMarkup(character.status || "Status unknown")}</p>
            ${character.actor && String(character.actor).toLowerCase() !== "actor unknown"
              ? `<p class="war-table__details-actor">Played by ${escapeMarkup(character.actor)}</p>`
              : ""}
          </div>
        </div>
        ${character.bio ? `<p class="war-table__details-bio">${escapeMarkup(character.bio)}</p>` : ""}
        ${visibleEntries.length ? `
          <h4 class="war-table__details-relations-title">Documented ties</h4>
          <ul class="war-table__details-relations">${visibleEntries.map(entry => `
            <li class="war-table__details-relation war-table__details-relation--${entry.relation.type}">
              <button type="button" data-war-table-select="${escapeMarkup(entry.other.id)}">
                <span class="war-table__details-relation-type">${relationLabels[entry.relation.type]}</span>
                <span>${escapeMarkup(entry.relation.label || relationLabels[entry.relation.type])} · ${escapeMarkup(entry.other.name)}</span>
              </button>
            </li>
          `).join("")}</ul>
        ` : ""}
        <a class="war-table__details-link" href="${escapeMarkup(href)}">Open character</a>
      `;
    }

    function activeRelationIds() {
      if (!selectedId) return new Set();
      const connected = new Set([selectedId]);
      constellation.relations.forEach(relation => {
        const source = endpointId(relation.source);
        const target = endpointId(relation.target);
        if (source === selectedId) connected.add(target);
        if (target === selectedId) connected.add(source);
      });
      return connected;
    }

    function applyState() {
      seasonButtons.forEach(button => {
        const active = Number(button.dataset.warTableSeason) === currentSeason;
        button.classList.toggle("war-table__season--active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      if (!graph) return;
      const connectedIds = activeRelationIds();
      const hasSelection = Boolean(selectedId && graph.nodes.some(node => node.id === selectedId));
      const seasonActive = characterId => {
        const character = data.charactersById.get(characterId);
        return featuredCharacterIds.has(characterId) || Boolean(character && featuredHouses.has(character.house));
      };

      graph.node
        .classed("war-table__node--selected", node => node.id === selectedId)
        .classed("war-table__node--related", node => hasSelection && node.id !== selectedId && connectedIds.has(node.id))
        .classed("war-table__node--featured", node => featuredCharacterIds.has(node.id))
        .classed("war-table__node--house-active", node => featuredHouses.has(node.house))
        .classed("war-table__node--muted", node => {
          if (hasSelection) return !connectedIds.has(node.id);
          return featuredCharacterIds.size > 0 && !featuredCharacterIds.has(node.id) && !featuredHouses.has(node.house);
        })
        .attr("aria-pressed", node => String(node.id === selectedId));

      graph.link
        .classed("war-table__link--selected", relation => {
          const source = endpointId(relation.source);
          const target = endpointId(relation.target);
          return hasSelection && (source === selectedId || target === selectedId);
        })
        .classed("war-table__link--featured", relation => {
          const source = endpointId(relation.source);
          const target = endpointId(relation.target);
          return seasonActive(source) && seasonActive(target);
        })
        .classed("war-table__link--muted", relation => {
          const source = endpointId(relation.source);
          const target = endpointId(relation.target);
          if (hasSelection) return source !== selectedId && target !== selectedId;
          return (featuredCharacterIds.size > 0 || featuredHouses.size > 0) &&
            !(seasonActive(source) && seasonActive(target));
        });
    }

    function selectNode(characterId, notify) {
      selectedId = characterId && data.charactersById.has(characterId) ? characterId : null;
      renderDetails(selectedId);
      applyState();
      if (notify !== false && typeof options.onSelect === "function") {
        const character = selectedId ? data.charactersById.get(selectedId) : null;
        options.onSelect(character, character ? relationEntriesFor(character.id) : []);
      }
    }

    function renderGraph() {
      if (!dependencies.d3) {
        svgElement.hidden = true;
        statusElement.hidden = false;
        statusElement.textContent = "The relationship constellation requires D3.js.";
        return;
      }
      if (!constellation.characters.length) {
        svgElement.hidden = true;
        statusElement.hidden = false;
        statusElement.textContent = "No character data is available for the relationship constellation.";
        return;
      }

      const d3 = dependencies.d3;
      const svg = d3.select(svgElement);
      svg.selectAll("*").remove();
      svg.append("title").text("Power Is a Web relationship constellation");
      svg.append("desc").text("A keyboard-accessible network of documented character relationships. Season controls highlight the people and houses in one featured record per season.");
      const background = svg.append("rect")
        .attr("class", "war-table__plot-background")
        .attr("aria-hidden", "true");
      const defs = svg.append("defs");
      const layer = svg.append("g").attr("class", "war-table__plot");

      const nodes = constellation.characters.map(character => ({ ...character }));
      const links = constellation.relations.map(relation => ({
        ...relation,
        source: endpointId(relation.source),
        target: endpointId(relation.target)
      }));
      const degree = new Map(nodes.map(node => [node.id, 0]));
      links.forEach(link => {
        degree.set(link.source, (degree.get(link.source) || 0) + 1);
        degree.set(link.target, (degree.get(link.target) || 0) + 1);
      });
      const rankedNodes = [...nodes].sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0));
      rankedNodes.forEach((character, index) => {
        character.visualScale = index === 0 ? 1.38 : index < 3 ? 1.12 : 1;
      });

      const link = layer.append("g")
        .attr("class", "war-table__links")
        .attr("aria-hidden", "true")
        .selectAll("line")
        .data(links, relation => `${endpointId(relation.source)}:${endpointId(relation.target)}:${relation.type}:${relation.subtype || ""}`)
        .join("line")
        .attr("class", relation => `war-table__link war-table__link--${relation.type}`)
        .attr("data-relation", relation => relation.type)
        .each(function applySharedRelationStyle(relation) {
          const style = dependencies.relationStyles[relation.type];
          if (!style) return;
          if (style.color) this.style.setProperty("--war-table-link-color", style.color);
          if (style.dash) this.setAttribute("stroke-dasharray", style.dash);
        });

      const clip = defs.selectAll("clipPath")
        .data(nodes, node => node.id)
        .join("clipPath")
        .attr("id", node => `${instanceId}-clip-${node.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`)
        .append("circle");

      const node = layer.append("g")
        .attr("class", "war-table__nodes")
        .selectAll("g")
        .data(nodes, character => character.id)
        .join("g")
        .attr("class", character => `war-table__node${character.status === "dead" ? " war-table__node--dead" : ""}${character.visualScale > 1.3 ? " war-table__node--hub" : ""}`)
        .attr("data-character", character => character.id)
        .attr("data-house", character => character.house || "Unaffiliated")
        .attr("role", "button")
        .attr("tabindex", 0)
        .attr("aria-pressed", "false")
        .attr("aria-label", character => {
          const count = degree.get(character.id) || 0;
          const actor = character.actor && String(character.actor).toLowerCase() !== "actor unknown"
            ? ` Played by ${character.actor}.`
            : "";
          return `${character.name}. ${character.house || "Unaffiliated"} affiliation; ${character.status || "status unknown"}.${actor} ${count} documented ${count === 1 ? "tie" : "ties"}.`;
        })
        .each(function applyHouseColor(character) {
          const color = character.sigilColor || houseColor(character.house);
          if (color) this.style.setProperty("--war-table-house-color", color);
        });

      node.append("circle").attr("class", "war-table__node-halo").attr("aria-hidden", "true");
      node.append("circle").attr("class", "war-table__node-ring").attr("aria-hidden", "true");

      node.each(function addPortrait(character) {
        const group = d3.select(this);
        const photo = photoFor(character);
        const generated = photo ? "" : avatarDataUrl(character);
        const source = photo ? photo.file : generated;
        if (source) {
          group.append("image")
            .attr("class", `war-table__node-photo${photo ? " war-table__node-photo--actor" : " war-table__node-photo--generated"}`)
            .attr("href", source)
            .attr("preserveAspectRatio", photo ? "xMidYMin slice" : "xMidYMid slice")
            .attr("clip-path", `url(#${instanceId}-clip-${character.id.replace(/[^a-zA-Z0-9_-]/g, "-")})`)
            .attr("aria-hidden", "true");
        } else {
          group.append("text")
            .attr("class", "war-table__node-initials")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("aria-hidden", "true")
            .text(initials(character.name));
        }
        group.append("text")
          .attr("class", "war-table__node-name")
          .attr("text-anchor", "middle")
          .attr("aria-hidden", "true")
          .text(character.name);
      });

      node
        .on("click.warTable", function handleNodeClick(evt, character) {
          evt.stopPropagation();
          selectNode(character.id);
        })
        .on("keydown.warTable", function handleNodeKeydown(evt, character) {
          if (evt.key !== "Enter" && evt.key !== " ") return;
          evt.preventDefault();
          evt.stopPropagation();
          selectNode(character.id);
        });

      svg.on("click.warTable", function handleBackgroundClick(evt) {
        if (evt.target === svgElement || evt.target === background.node()) selectNode(null);
      });

      simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(item => item.id).distance(130).strength(0.34))
        .force("charge", d3.forceManyBody().strength(-390))
        .force("collide", d3.forceCollide().radius(character => nodeRadius * character.visualScale + 14).strength(0.92))
        .alphaDecay(0.045)
        .velocityDecay(0.34);

      if (typeof d3.randomLcg === "function" && typeof simulation.randomSource === "function") {
        simulation.randomSource(d3.randomLcg(0.427));
      }

      const drag = d3.drag()
        .on("start", function startDrag(evt, character) {
          if (!evt.active && !mediaQuery?.matches) simulation.alphaTarget(0.18).restart();
          character.fx = character.x;
          character.fy = character.y;
          d3.select(this).classed("war-table__node--dragging", true);
        })
        .on("drag", function dragNode(evt, character) {
          character.fx = evt.x;
          character.fy = evt.y;
          if (mediaQuery?.matches) {
            character.x = evt.x;
            character.y = evt.y;
            renderPositions();
          }
        })
        .on("end", function endDrag(evt, character) {
          if (!evt.active) simulation.alphaTarget(0);
          character.fx = null;
          character.fy = null;
          d3.select(this).classed("war-table__node--dragging", false);
        });
      node.call(drag);

      function renderPositions() {
        nodes.forEach(character => {
          const margin = nodeRadius * character.visualScale + 10;
          character.x = Math.max(margin, Math.min(plotWidth - margin, character.x || plotWidth / 2));
          character.y = Math.max(margin, Math.min(plotHeight - margin - 18, character.y || plotHeight / 2));
        });
        link
          .attr("x1", relation => relation.source.x)
          .attr("y1", relation => relation.source.y)
          .attr("x2", relation => relation.target.x)
          .attr("y2", relation => relation.target.y);
        node.attr("transform", character => `translate(${character.x},${character.y})`);
      }

      simulation.on("tick.warTable", renderPositions);

      graph = { svg, background, layer, nodes, links, node, link, clip };
      sizeGraph(true);
      applyState();
    }

    function sizeGraph(initial, force) {
      if (!graph || destroyed) return;
      const bounds = stageElement.getBoundingClientRect();
      const nextWidth = Math.max(320, Math.round(bounds.width || rootElement.clientWidth || 900));
      const measuredHeight = Math.round(bounds.height);
      const nextHeight = Math.max(360, measuredHeight || Math.min(620, Math.max(420, Math.round(nextWidth * 0.58))));
      if (!initial && !force && nextWidth === plotWidth && nextHeight === plotHeight) return;

      plotWidth = nextWidth;
      plotHeight = nextHeight;
      nodeRadius = nextWidth < 560 ? 26 : nextWidth < 820 ? 32 : 36;
      const radiusFor = character => nodeRadius * (character.visualScale || 1);
      graph.svg.attr("viewBox", `0 0 ${plotWidth} ${plotHeight}`);
      graph.background.attr("width", plotWidth).attr("height", plotHeight);
      graph.clip.attr("r", character => Math.max(1, radiusFor(character) - 3));
      graph.node.select(".war-table__node-halo").attr("r", character => radiusFor(character) + 7);
      graph.node.select(".war-table__node-ring").attr("r", character => radiusFor(character));
      graph.node.selectAll("image")
        .attr("x", character => -radiusFor(character) + 3)
        .attr("y", character => -radiusFor(character) + 3)
        .attr("width", character => (radiusFor(character) - 3) * 2)
        .attr("height", character => (radiusFor(character) - 3) * 2);
      graph.node.select(".war-table__node-name").attr("y", character => radiusFor(character) + 16);

      const houses = uniqueStrings(graph.nodes.map(character => character.house || "Unaffiliated"));
      const anchors = new Map();
      houses.forEach((house, index) => {
        const angle = -Math.PI / 2 + (index / Math.max(1, houses.length)) * Math.PI * 2;
        const radiusX = Math.min(plotWidth * 0.27, 240);
        const radiusY = Math.min(plotHeight * 0.24, 170);
        anchors.set(house, {
          x: plotWidth / 2 + Math.cos(angle) * radiusX,
          y: plotHeight / 2 + Math.sin(angle) * radiusY
        });
      });

      graph.nodes.forEach(character => {
        const anchor = character.visualScale > 1.3
          ? { x: plotWidth / 2, y: plotHeight / 2 }
          : anchors.get(character.house || "Unaffiliated") || { x: plotWidth / 2, y: plotHeight / 2 };
        if (!Number.isFinite(character.x) || initial) {
          const seed = hashNumber(character.id);
          const angle = (seed % 360) * Math.PI / 180;
          const spread = 18 + (seed % 42);
          character.x = anchor.x + Math.cos(angle) * spread;
          character.y = anchor.y + Math.sin(angle) * spread;
        }
      });

      simulation
        .force("center", dependencies.d3.forceCenter(plotWidth / 2, plotHeight / 2).strength(0.17))
        .force("x", dependencies.d3.forceX(character => character.visualScale > 1.3
          ? plotWidth / 2
          : anchors.get(character.house || "Unaffiliated")?.x || plotWidth / 2).strength(0.045))
        .force("y", dependencies.d3.forceY(character => character.visualScale > 1.3
          ? plotHeight / 2
          : anchors.get(character.house || "Unaffiliated")?.y || plotHeight / 2).strength(0.045))
        .force("collide").radius(character => radiusFor(character) + 14);

      if (mediaQuery?.matches) {
        simulation.stop();
        simulation.alpha(0.9);
        for (let tick = 0; tick < 220; tick += 1) simulation.tick();
        simulation.tick();
        const tickHandler = simulation.on("tick.warTable");
        if (tickHandler) tickHandler();
      } else {
        simulation.alpha(initial ? 1 : 0.42).restart();
      }
    }

    function scheduleResize() {
      if (resizeFrame || destroyed) return;
      resizeFrame = global.requestAnimationFrame(() => {
        resizeFrame = 0;
        sizeGraph(false);
      });
    }

    function setSeason(season) {
      if (destroyed) return;
      currentSeason = validSeason(season);
      selectedId = null;
      renderDispatch();
      renderDetails(null);
      applyState();
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (resizeFrame) global.cancelAnimationFrame(resizeFrame);
      cleanup.splice(0).forEach(remove => remove());
      if (resizeObserver) resizeObserver.disconnect();
      if (simulation) simulation.stop().on("tick.warTable", null);
      if (graph) {
        graph.node.on(".warTable", null).on(".drag", null);
        graph.svg.on(".warTable", null);
      }
      if (shell.parentNode === rootElement) shell.remove();
      if (!hadClass) rootElement.classList.remove("war-table");
      if (previousAttribute == null) rootElement.removeAttribute("data-war-table");
      else rootElement.setAttribute("data-war-table", previousAttribute);
      if (mountedRoots.get(rootElement) === api) mountedRoots.delete(rootElement);
    }

    seasonButtons.forEach(button => {
      listen(button, "click", () => setSeason(Number(button.dataset.warTableSeason)));
    });
    listen(detailsElement, "click", evt => {
      const target = evt.target.closest("[data-war-table-select]");
      if (!target || !detailsElement.contains(target)) return;
      selectNode(target.dataset.warTableSelect);
      const graphNode = graph && graph.node.filter(character => character.id === selectedId).node();
      if (graphNode) graphNode.focus();
    });

    if (typeof global.ResizeObserver === "function") {
      resizeObserver = new global.ResizeObserver(scheduleResize);
      resizeObserver.observe(stageElement);
    } else {
      listen(global, "resize", scheduleResize);
    }
    if (mediaQuery) {
      const handleMotionChange = () => sizeGraph(false, true);
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleMotionChange);
        cleanup.push(() => mediaQuery.removeEventListener("change", handleMotionChange));
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleMotionChange);
        cleanup.push(() => mediaQuery.removeListener(handleMotionChange));
      }
    }

    const api = { setSeason, destroy };
    mountedRoots.set(rootElement, api);
    renderLegend();
    renderDispatch();
    renderDetails(null);
    renderGraph();
    applyState();
    return api;
  }

  global.WarTable = Object.assign(global.WarTable || {}, { mount });
})(window);
