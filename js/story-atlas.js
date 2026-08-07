/* ========================================================================== 
   The Episode Atlas — cinematic, data-backed story explorer
   ========================================================================== */
(function exposeStoryAtlas(global) {
  "use strict";

  const MODES = Object.freeze(["episodes", "themes", "consequences"]);
  const ROMAN = Object.freeze(["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"]);
  const ICONS = Object.freeze({
    compass: "assets/icons/compass.svg",
    person: "assets/icons/person.svg",
    battle: "assets/icons/swords.svg",
    quote: "assets/icons/play.svg"
  });
  const FALLBACK_BACKGROUNDS = Object.freeze({
    1: "assets/ui/essos-journey-bg.jpg",
    2: "assets/ui/capital-journey-bg.jpg",
    3: "assets/ui/north-journey-bg.jpg",
    4: "assets/ui/capital-journey-bg.jpg",
    5: "assets/ui/north-journey-bg.jpg",
    6: "assets/ui/north-journey-bg.jpg",
    7: "assets/ui/capital-journey-bg.jpg",
    8: "assets/ui/north-journey-bg.jpg"
  });
  const STOP_WORDS = new Set([
    "and", "are", "but", "for", "from", "has", "have", "into", "its", "not", "of",
    "on", "the", "their", "then", "this", "through", "to", "with", "after", "before",
    "battle", "season", "episode"
  ]);

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cleanString(value, fallback) {
    const text = String(value == null ? "" : value).trim();
    return text || fallback || "";
  }

  function positiveInteger(value, fallback) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  function uniqueStrings(values) {
    return [...new Set(safeArray(values).map(value => cleanString(value)).filter(Boolean))];
  }

  function tokenize(value) {
    return new Set(
      cleanString(value)
        .toLowerCase()
        .replace(/[’']/g, "")
        .split(/[^a-z0-9]+/)
        .filter(token => token.length > 2 && !STOP_WORDS.has(token))
    );
  }

  function tokenCoverage(needle, haystack) {
    const needleTokens = tokenize(needle);
    const haystackTokens = tokenize(haystack);
    if (!needleTokens.size || !haystackTokens.size) return 0;
    let intersection = 0;
    needleTokens.forEach(token => {
      if (haystackTokens.has(token)) intersection += 1;
    });
    return intersection / needleTokens.size;
  }

  function normalizedPhrase(value) {
    return cleanString(value)
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/\bbattle\b|\bof\b|\bthe\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function seasonNumber(value) {
    if (Number.isInteger(Number(value))) return Number(value);
    const match = cleanString(value).match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function formatDate(value) {
    if (!value) return "Air date not recorded";
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return cleanString(value);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function joinNames(values) {
    const names = safeArray(values).filter(Boolean);
    if (names.length < 2) return names[0] || "";
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  }

  function getGlobalDataset(optionsValue, windowName, lexicalGetter) {
    if (Array.isArray(optionsValue)) return optionsValue;
    if (Array.isArray(global[windowName])) return global[windowName];
    try {
      const lexicalValue = lexicalGetter();
      return Array.isArray(lexicalValue) ? lexicalValue : [];
    } catch (error) {
      return [];
    }
  }

  function backgroundForSeason(season) {
    const chapters = safeArray(global.REALM_CHAPTERS);
    const chapter = chapters.find(item => Number(item && item.season) === Number(season));
    return cleanString(chapter && chapter.background, FALLBACK_BACKGROUNDS[season] || FALLBACK_BACKGROUNDS[1]);
  }

  function normalizeEpisode(rawEpisode, index) {
    const raw = rawEpisode && typeof rawEpisode === "object" ? rawEpisode : {};
    const season = positiveInteger(raw.season, 1);
    const episode = positiveInteger(raw.episode, index + 1);
    const writers = Array.isArray(raw.writers)
      ? uniqueStrings(raw.writers)
      : uniqueStrings(cleanString(raw.writers).split(/\s*(?:,|&| and )\s*/));
    return {
      raw,
      id: cleanString(raw.id, `s${String(season).padStart(2, "0")}e${String(episode).padStart(2, "0")}`),
      season,
      episode,
      title: cleanString(raw.title, `Episode ${episode}`),
      airDate: cleanString(raw.airDate),
      runtime: positiveInteger(raw.runtime, 0),
      director: cleanString(raw.director, "Director not recorded"),
      writers,
      summary: cleanString(raw.summary, "No editorial summary is recorded for this episode."),
      themes: uniqueStrings(raw.themes),
      characterIds: uniqueStrings(raw.characterIds || raw.characters),
      sourceUrl: cleanString(raw.sourceUrl),
      eventIds: uniqueStrings(raw.eventIds),
      battleIds: uniqueStrings(raw.battleIds)
    };
  }

  function mount(root, options) {
    if (!root || root.nodeType !== 1) {
      throw new TypeError("StoryAtlas.mount requires a root element.");
    }

    const config = options && typeof options === "object" ? options : {};
    const episodeRecords = getGlobalDataset(config.episodes, "EPISODES", () => (
      typeof EPISODES !== "undefined" ? EPISODES : []
    )).map(normalizeEpisode).sort((a, b) => a.season - b.season || a.episode - b.episode);
    const characterRecords = getGlobalDataset(config.characters, "characters", () => (
      typeof characters !== "undefined" ? characters : []
    )).filter(record => record && record.id);
    const eventRecords = getGlobalDataset(config.events, "events", () => (
      typeof events !== "undefined" ? events : []
    )).filter(Boolean);
    const battleRecords = getGlobalDataset(config.battles, "battles", () => (
      typeof battles !== "undefined" ? battles : []
    )).filter(Boolean);
    const quoteRecords = getGlobalDataset(config.quotes, "quotes", () => (
      typeof quotes !== "undefined" ? quotes : []
    )).filter(Boolean);
    const sourceRecords = getGlobalDataset(config.sources, "EPISODE_SOURCES", () => (
      typeof EPISODE_SOURCES !== "undefined" ? EPISODE_SOURCES : []
    )).filter(source => source && source.label && source.url);
    const sourceNote = cleanString(
      config.sourceNote || global.EPISODE_SOURCE_NOTE || (
        typeof EPISODE_SOURCE_NOTE !== "undefined" ? EPISODE_SOURCE_NOTE : ""
      ),
      "This atlas follows the HBO television series. Episode metadata and original editorial summaries are kept separate from book canon."
    );

    const characterById = new Map(characterRecords.map(character => [String(character.id), character]));
    const episodeById = new Map(episodeRecords.map(episode => [episode.id, episode]));
    const seasons = [...new Set(episodeRecords.map(episode => episode.season))].sort((a, b) => a - b);
    const allThemes = [...new Set(episodeRecords.flatMap(episode => episode.themes))]
      .sort((a, b) => a.localeCompare(b));
    const totalRuntime = episodeRecords.reduce((sum, episode) => sum + episode.runtime, 0);
    const listeners = [];
    const pendingFrames = new Set();
    const motionQuery = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const bodyHadRouteClass = document.body.classList.contains("story-atlas-route");
    let destroyed = false;

    function listen(target, type, handler, listenerOptions) {
      if (!target || typeof target.addEventListener !== "function") return;
      target.addEventListener(type, handler, listenerOptions);
      listeners.push(() => target.removeEventListener(type, handler, listenerOptions));
    }

    function later(callback) {
      const frame = global.requestAnimationFrame(() => {
        pendingFrames.delete(frame);
        if (!destroyed) callback();
      });
      pendingFrames.add(frame);
    }

    function actorPhoto(character) {
      if (!character) return "";
      try {
        let result = null;
        if (typeof config.actorPhotoFor === "function") result = config.actorPhotoFor(character.id);
        else if (typeof global.actorPhotoFor === "function") result = global.actorPhotoFor(character.id);
        else if (typeof actorPhotoFor === "function") result = actorPhotoFor(character.id);
        return cleanString(result && typeof result === "object" ? result.file : result);
      } catch (error) {
        return "";
      }
      return "";
    }

    function episodeCharacters(episode) {
      return episode.characterIds.map(id => characterById.get(id)).filter(Boolean);
    }

    function episodeHouses(episode) {
      return [...new Set(episodeCharacters(episode).map(character => cleanString(character.house)).filter(Boolean))];
    }

    episodeRecords.forEach(episode => {
      const people = episodeCharacters(episode);
      const houses = episodeHouses(episode);
      episode.people = people;
      episode.houses = houses;
      episode.searchText = [
        episode.title,
        episode.summary,
        episode.director,
        ...episode.writers,
        ...episode.themes,
        ...people.flatMap(character => [character.name, character.actor]),
        ...houses
      ].join(" ").toLowerCase();
    });

    function eventMatch(episode, event) {
      if (!event || seasonNumber(event.season) !== episode.season) return 0;
      if (episode.eventIds.includes(cleanString(event.id))) return 10;
      const episodeText = `${episode.title} ${episode.summary}`;
      const eventTitle = cleanString(event.title);
      const phrase = normalizedPhrase(eventTitle);
      const normalizedEpisode = normalizedPhrase(episodeText);
      let score = 0;
      if (phrase && normalizedEpisode.includes(phrase)) score += 6;
      const coverage = tokenCoverage(eventTitle, episodeText);
      if (coverage >= 0.75) score += 5;
      else if (coverage >= 0.5) score += 3;
      const charactersInCommon = safeArray(event.characters).filter(id => episode.characterIds.includes(String(id))).length;
      if (charactersInCommon >= 3) score += 2;
      else if (charactersInCommon >= 2) score += 1;
      return score;
    }

    function relatedEvents(episode) {
      return eventRecords
        .map(event => ({ event, score: eventMatch(episode, event) }))
        .filter(item => item.score >= 5)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(item => item.event);
    }

    function battleMatch(episode, battle, episodeEvents) {
      if (!battle || seasonNumber(battle.season) !== episode.season) return 0;
      if (episode.battleIds.includes(cleanString(battle.id))) return 12;
      if (safeArray(battle.linkedEvents).some(id => episodeEvents.some(event => String(event.id) === String(id)))) return 10;
      const episodeText = `${episode.title} ${episode.summary}`;
      const name = cleanString(battle.name);
      const phrase = normalizedPhrase(name);
      const normalizedEpisode = normalizedPhrase(episodeText);
      if (phrase && normalizedEpisode.includes(phrase)) return 9;
      const coverage = tokenCoverage(name, episodeText);
      return coverage >= 0.66 ? 7 : 0;
    }

    function relatedBattles(episode, episodeEvents) {
      return battleRecords
        .map(battle => ({ battle, score: battleMatch(episode, battle, episodeEvents) }))
        .filter(item => item.score >= 7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(item => item.battle);
    }

    function quotesForSeason(season) {
      return quoteRecords
        .filter(quote => seasonNumber(quote.season) === Number(season))
        .slice(0, 3);
    }

    function adjacentEpisode(episode, offset) {
      const index = episodeRecords.findIndex(item => item.id === episode.id);
      return index < 0 ? null : episodeRecords[index + offset] || null;
    }

    function whyItMattered(episode, matchedEvents) {
      if (matchedEvents.length) {
        const event = matchedEvents[0];
        return `A related season record marks “${cleanString(event.title)}” as a turning point: ${cleanString(event.summary)}`;
      }
      const next = adjacentEpisode(episode, 1);
      const names = episode.people.slice(0, 3).map(character => character.name);
      const themeText = episode.themes.slice(0, 2).join(" and ").toLowerCase();
      const subject = names.length ? joinNames(names) : "its central characters";
      if (next && next.season === episode.season) {
        return `The episode places ${subject} inside its ${themeText || "main"} threads; the broadcast-order continuation is “${next.title}.”`;
      }
      return `The episode closes this season’s recorded chronology with ${themeText || "its central conflicts"} indexed among its defining threads.`;
    }

    const requestedMode = cleanString(config.initialMode).toLowerCase();
    const requestedEpisode = episodeById.get(cleanString(config.initialEpisodeId));
    const requestedSeason = positiveInteger(config.initialSeason, requestedEpisode ? requestedEpisode.season : seasons[0]);
    const state = {
      mode: MODES.includes(requestedMode) ? requestedMode : "episodes",
      season: seasons.includes(requestedSeason) ? requestedSeason : (seasons[0] || "all"),
      theme: allThemes.includes(cleanString(config.initialTheme)) ? cleanString(config.initialTheme) : "",
      query: "",
      selectedId: requestedEpisode ? requestedEpisode.id : ""
    };

    function filteredEpisodes(ignoreTheme) {
      const query = state.query.trim().toLowerCase();
      return episodeRecords.filter(episode => (
        (state.season === "all" || episode.season === Number(state.season)) &&
        (ignoreTheme || !state.theme || episode.themes.includes(state.theme)) &&
        (!query || episode.searchText.includes(query))
      ));
    }

    function ensureSelection() {
      const visible = filteredEpisodes(false);
      if (!visible.some(episode => episode.id === state.selectedId)) {
        state.selectedId = visible[0] ? visible[0].id : "";
      }
      return visible;
    }

    function selectedEpisode() {
      return episodeById.get(state.selectedId) || null;
    }

    function seasonLabel(season) {
      return `Season ${ROMAN[season] || season}`;
    }

    function countLabel(value, singular, plural) {
      return `${value} ${value === 1 ? singular : (plural || `${singular}s`)}`;
    }

    function sourceHTML() {
      const links = sourceRecords.map(source => `
        <li>
          <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)}</a>
          ${source.covers ? `<span>${escapeHTML(safeArray(source.covers).join(", ") || source.covers)}</span>` : ""}
        </li>`).join("");
      return `
        <section class="story-atlas__sources" aria-labelledby="story-atlas-source-title">
          <div>
            <p class="story-atlas__eyebrow">Canon &amp; provenance</p>
            <h2 id="story-atlas-source-title">The record, not the rumor</h2>
          </div>
          <div class="story-atlas__source-copy">
            <p>${escapeHTML(sourceNote)}</p>
            <p>Character, quote, battle, and event links appear only when matching local records exist. Event associations are season-level unless an episode record explicitly identifies them. Before and next threads follow broadcast order; they do not invent off-screen causality.</p>
            ${links ? `<ul>${links}</ul>` : ""}
          </div>
        </section>`;
    }

    if (!episodeRecords.length) {
      root.innerHTML = `
        <section class="story-atlas story-atlas--empty" role="alert">
          <img src="${ICONS.compass}" alt="">
          <p class="story-atlas__eyebrow">The Episode Atlas</p>
          <h1>The archive is not loaded</h1>
          <p>Episode records are required before this story can be opened.</p>
        </section>`;
      return Object.freeze({
        destroy() {
          root.replaceChildren();
        }
      });
    }

    if (!state.selectedId) {
      state.selectedId = (episodeRecords.find(episode => episode.season === Number(state.season)) || episodeRecords[0]).id;
    }

    document.body.classList.add("story-atlas-route");
    root.innerHTML = `
      <section class="story-atlas" aria-labelledby="story-atlas-title">
        <header class="story-atlas__hero">
          <img class="story-atlas__hero-image" src="assets/ui/war-table-stone.jpg" alt="">
          <div class="story-atlas__hero-scrim" aria-hidden="true"></div>
          <div class="story-atlas__hero-copy">
            <p class="story-atlas__eyebrow">Stories · The complete television chronicle</p>
            <h1 id="story-atlas-title">The Episode Atlas</h1>
            <p>Trace every chapter by season, theme, character, and consequence—from the first road south to the final choice before the throne.</p>
          </div>
          <dl class="story-atlas__facts" aria-label="Verified records loaded in the atlas">
            <div><dt>${episodeRecords.length}</dt><dd>TV episodes</dd></div>
            <div><dt>${eventRecords.length}</dt><dd>turning points</dd></div>
            <div><dt>${battleRecords.length}</dt><dd>battle records</dd></div>
            <div><dt>${quoteRecords.length}</dt><dd>curated voices</dd></div>
          </dl>
        </header>

        <div class="story-atlas__body">
          <section class="story-atlas__control-deck" aria-label="Episode Atlas controls">
            <div class="story-atlas__modes" role="tablist" aria-label="Story modes">
              ${MODES.map((mode, index) => `
                <button type="button" role="tab" id="story-mode-${mode}" aria-controls="story-atlas-workspace"
                  aria-selected="${mode === state.mode}" tabindex="${mode === state.mode ? 0 : -1}" data-mode="${mode}">
                  <span>0${index + 1}</span>${mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>`).join("")}
            </div>
            <div class="story-atlas__search-field">
              <label for="story-atlas-search">Find a character, house, or episode</label>
              <div>
                <img src="${ICONS.compass}" alt="">
                <input id="story-atlas-search" type="search" autocomplete="off" spellcheck="false"
                  placeholder="Try Arya, Stark, or Blackwater" aria-describedby="story-atlas-search-help">
                <button type="button" data-clear-search hidden>Clear</button>
              </div>
              <small id="story-atlas-search-help">Search also matches directors, writers, and indexed themes. Press / to focus.</small>
            </div>
          </section>

          <section class="story-atlas__season-section" aria-labelledby="story-atlas-season-title">
            <div class="story-atlas__section-heading">
              <div>
                <p class="story-atlas__eyebrow">Season filmstrip</p>
                <h2 id="story-atlas-season-title">Choose a chapter of the realm</h2>
              </div>
              <button class="story-atlas__reset" type="button" data-reset-filters>Show all ${episodeRecords.length} episodes</button>
            </div>
            <div class="story-atlas__season-rail" role="group" aria-label="Choose a season" data-season-rail></div>
          </section>

          <section class="story-atlas__theme-section" aria-labelledby="story-atlas-theme-title" hidden>
            <div class="story-atlas__section-heading story-atlas__section-heading--compact">
              <div>
                <p class="story-atlas__eyebrow">Theme index</p>
                <h2 id="story-atlas-theme-title">Follow an idea through the series</h2>
              </div>
            </div>
            <div class="story-atlas__theme-rail" data-theme-rail></div>
          </section>

          <section class="story-atlas__episode-section" aria-labelledby="story-atlas-episode-title">
            <div class="story-atlas__section-heading story-atlas__section-heading--compact">
              <div>
                <p class="story-atlas__eyebrow">Broadcast order</p>
                <h2 id="story-atlas-episode-title">Select an episode</h2>
              </div>
              <p class="story-atlas__result-count" role="status" aria-live="polite" data-result-count></p>
            </div>
            <div class="story-atlas__episode-rail" role="group" aria-label="Episodes" data-episode-rail></div>
          </section>

          <section id="story-atlas-workspace" class="story-atlas__workspace" role="tabpanel"
            aria-labelledby="story-mode-${state.mode}" tabindex="-1" data-workspace></section>

          ${sourceHTML()}
        </div>
        <p class="story-atlas__keyboard-note">Keyboard: use arrow keys inside mode, season, and episode rails; Home and End jump to their edges.</p>
      </section>`;

    const atlas = root.querySelector(".story-atlas");
    const searchInput = root.querySelector("#story-atlas-search");
    const clearSearchButton = root.querySelector("[data-clear-search]");
    const themeSection = root.querySelector(".story-atlas__theme-section");
    const themeRail = root.querySelector("[data-theme-rail]");
    const seasonRail = root.querySelector("[data-season-rail]");
    const episodeRail = root.querySelector("[data-episode-rail]");
    const resultCount = root.querySelector("[data-result-count]");
    const workspace = root.querySelector("[data-workspace]");

    function portraitHTML(character) {
      const photo = actorPhoto(character);
      return photo
        ? `<img class="story-atlas__portrait" src="${escapeHTML(photo)}" alt="" loading="lazy">`
        : `<img class="story-atlas__portrait story-atlas__portrait--icon" src="${ICONS.person}" alt="">`;
    }

    function characterLinkHTML(character) {
      return `
        <a class="story-atlas__person" href="#/character/${encodeURIComponent(character.id)}" data-navigate>
          ${portraitHTML(character)}
          <span><strong>${escapeHTML(character.name)}</strong><small>${escapeHTML(character.house || "No house recorded")}</small></span>
        </a>`;
    }

    function recordLinkHTML(kind, record) {
      if (kind === "battle") {
        return `
          <a class="story-atlas__record-link" href="#/battles?battle=${encodeURIComponent(record.id)}" data-navigate>
            <img src="${ICONS.battle}" alt="">
            <span><small>Battle record</small><strong>${escapeHTML(record.name)}</strong></span>
          </a>`;
      }
      const speaker = characterById.get(String(record.characterId));
      return `
        <a class="story-atlas__record-link" href="#/quotes?quote=${encodeURIComponent(record.id)}" data-navigate>
          <img src="${ICONS.quote}" alt="">
          <span><small>${speaker ? escapeHTML(speaker.name) : "Quote record"}</small><strong>“${escapeHTML(record.text)}”</strong></span>
        </a>`;
    }

    function renderEpisodeMode(episode, episodeEvents, episodeBattles, seasonQuotes) {
      const people = episode.people.slice(0, 6);
      const houses = episode.houses.slice(0, 6);
      return `
        <div class="story-atlas__aside-heading">
          <p class="story-atlas__eyebrow">Episode dossier</p>
          <h3>${countLabel(episode.people.length, "recorded perspective")}</h3>
        </div>
        ${people.length ? `<div class="story-atlas__people">${people.map(characterLinkHTML).join("")}</div>` : `<p class="story-atlas__muted">No linked character records.</p>`}
        ${houses.length ? `
          <div class="story-atlas__houses" aria-label="Linked houses">
            ${houses.map(house => `<a href="#/house/${encodeURIComponent(house)}" data-navigate>${escapeHTML(house)}</a>`).join("")}
          </div>` : ""}
        ${episodeBattles.length ? `
          <div class="story-atlas__records">
            <h4>Open connected battle records</h4>
            ${episodeBattles.map(battle => recordLinkHTML("battle", battle)).join("")}
          </div>` : ""}
        ${seasonQuotes.length ? `
          <div class="story-atlas__records">
            <h4>Voices from this season</h4>
            ${seasonQuotes.slice(0, 2).map(quote => recordLinkHTML("quote", quote)).join("")}
            <p class="story-atlas__precision-note">This is a Season ${episode.season} sampler. The local quote index records seasons, not exact episodes, so these links do not imply episode attribution.</p>
          </div>` : ""}
        ${episodeEvents.length ? `<p class="story-atlas__precision-note">${countLabel(episodeEvents.length, "related turning point")} found in this season’s records.</p>` : ""}`;
    }

    function renderThemeMode(episode) {
      const themes = episode.themes.length ? episode.themes : ["Unclassified"];
      return `
        <div class="story-atlas__aside-heading">
          <p class="story-atlas__eyebrow">Theme lens</p>
          <h3>Ideas carried by this episode</h3>
        </div>
        <div class="story-atlas__theme-cards">
          ${themes.map(theme => {
            const count = episodeRecords.filter(item => item.themes.includes(theme)).length;
            const selected = state.theme === theme;
            return `
              <button type="button" data-theme="${escapeHTML(theme)}" aria-pressed="${selected}">
                <span>${String(count).padStart(2, "0")} / ${episodeRecords.length}</span>
                <strong>${escapeHTML(theme)}</strong>
                <small>${countLabel(count, "episode")} in the complete index</small>
              </button>`;
          }).join("")}
        </div>
        <p class="story-atlas__precision-note">Themes are editorial index terms. Select one to follow it in broadcast order.</p>`;
    }

    function chainCardHTML(label, episode, current) {
      if (!episode) {
        return `<article class="story-atlas__chain-card story-atlas__chain-card--empty"><small>${escapeHTML(label)}</small><strong>No adjacent episode</strong><p>This is the edge of the ${episodeRecords.length}-episode broadcast record.</p></article>`;
      }
      return `
        <article class="story-atlas__chain-card${current ? " story-atlas__chain-card--current" : ""}">
          <small>${escapeHTML(label)} · S${episode.season} E${episode.episode}</small>
          <strong>${escapeHTML(episode.title)}</strong>
          <p>${escapeHTML(episode.summary)}</p>
          ${current ? "" : `<button type="button" data-episode-id="${escapeHTML(episode.id)}">Open this thread</button>`}
        </article>`;
    }

    function renderConsequenceMode(episode, episodeEvents, episodeBattles) {
      const previous = adjacentEpisode(episode, -1);
      const next = adjacentEpisode(episode, 1);
      return `
        <div class="story-atlas__aside-heading">
          <p class="story-atlas__eyebrow">Consequence path</p>
          <h3>Before, now, and next</h3>
        </div>
        <div class="story-atlas__chain">
          ${chainCardHTML("Before", previous, false)}
          ${chainCardHTML("Selected", episode, true)}
          ${chainCardHTML("Next thread", next, false)}
        </div>
        ${episodeEvents.length ? `
          <div class="story-atlas__season-record">
            <small>Related season record</small>
            <strong>${escapeHTML(episodeEvents[0].title)}</strong>
            <p>${escapeHTML(episodeEvents[0].summary)}</p>
          </div>` : ""}
        ${episodeBattles.length ? `<div class="story-atlas__records">${episodeBattles.map(battle => recordLinkHTML("battle", battle)).join("")}</div>` : ""}`;
    }

    function renderSeasonRail() {
      const buttons = [{ season: "all", label: "All seasons", image: "assets/ui/war-table-stone.jpg" }]
        .concat(seasons.map(season => ({ season, label: seasonLabel(season), image: backgroundForSeason(season) })));
      seasonRail.innerHTML = buttons.map(item => {
        const count = item.season === "all"
          ? episodeRecords.length
          : episodeRecords.filter(episode => episode.season === item.season).length;
        const selected = String(state.season) === String(item.season);
        return `
          <button type="button" aria-pressed="${selected}" tabindex="${selected ? 0 : -1}"
            data-season="${item.season}" aria-label="${escapeHTML(item.label)}, ${countLabel(count, "episode")}">
            <span class="story-atlas__season-image"><img src="${escapeHTML(item.image)}" alt="" loading="lazy"></span>
            <span class="story-atlas__season-copy">
              <small>${item.season === "all" ? "Complete chronicle" : `Season ${item.season}`}</small>
              <strong>${escapeHTML(item.label)}</strong>
              <span>${countLabel(count, "episode")}</span>
            </span>
          </button>`;
      }).join("");
    }

    function renderThemeRail() {
      const baseEpisodes = filteredEpisodes(true);
      const themeCounts = new Map(allThemes.map(theme => [
        theme,
        baseEpisodes.filter(episode => episode.themes.includes(theme)).length
      ]));
      const buttons = [`
        <button type="button" data-theme="" aria-pressed="${!state.theme}">
          <strong>All themes</strong><span>${baseEpisodes.length}</span>
        </button>`];
      allThemes.forEach(theme => {
        const count = themeCounts.get(theme) || 0;
        buttons.push(`
          <button type="button" data-theme="${escapeHTML(theme)}" aria-pressed="${state.theme === theme}" ${count ? "" : "disabled"}>
            <strong>${escapeHTML(theme)}</strong><span>${count}</span>
          </button>`);
      });
      themeRail.innerHTML = buttons.join("");
    }

    function renderEpisodeRail(visibleEpisodes) {
      if (!visibleEpisodes.length) {
        episodeRail.innerHTML = `
          <div class="story-atlas__no-results">
            <img src="${ICONS.compass}" alt="">
            <strong>No chapter matches this trail.</strong>
            <p>Clear the search or widen the season and theme filters.</p>
            <button type="button" data-reset-filters>Reset the atlas</button>
          </div>`;
        return;
      }
      episodeRail.innerHTML = visibleEpisodes.map((episode, index) => {
        const selected = episode.id === state.selectedId;
        return `
          <button class="story-atlas__episode-card" type="button" aria-pressed="${selected}"
            tabindex="${selected ? 0 : -1}" data-episode-id="${escapeHTML(episode.id)}">
            <span class="story-atlas__episode-number">${String(index + 1).padStart(2, "0")}</span>
            <small>S${episode.season} · E${episode.episode}</small>
            <strong>${escapeHTML(episode.title)}</strong>
            <span>${escapeHTML(formatDate(episode.airDate))}${episode.runtime ? ` · ${episode.runtime} min` : ""}</span>
            <em>${episode.themes.slice(0, 2).map(escapeHTML).join(" · ") || "Theme not indexed"}</em>
          </button>`;
      }).join("");
    }

    function renderWorkspace(episode) {
      if (!episode) {
        workspace.innerHTML = `
          <div class="story-atlas__workspace-empty">
            <img src="${ICONS.compass}" alt="">
            <h2>No episode selected</h2>
            <p>Choose a broader trail to continue.</p>
          </div>`;
        return;
      }
      const episodeEvents = relatedEvents(episode);
      const episodeBattles = relatedBattles(episode, episodeEvents);
      const seasonQuotes = quotesForSeason(episode.season);
      const previous = adjacentEpisode(episode, -1);
      const next = adjacentEpisode(episode, 1);
      const writers = joinNames(episode.writers);
      const modeContent = state.mode === "themes"
        ? renderThemeMode(episode)
        : state.mode === "consequences"
          ? renderConsequenceMode(episode, episodeEvents, episodeBattles)
          : renderEpisodeMode(episode, episodeEvents, episodeBattles, seasonQuotes);

      workspace.setAttribute("aria-labelledby", `story-mode-${state.mode}`);
      workspace.innerHTML = `
        <div class="story-atlas__feature" data-season="${episode.season}">
          <img class="story-atlas__feature-image" src="${escapeHTML(backgroundForSeason(episode.season))}" alt="">
          <div class="story-atlas__feature-scrim" aria-hidden="true"></div>
          <article class="story-atlas__story-panel">
            <p class="story-atlas__eyebrow">${escapeHTML(seasonLabel(episode.season))} · Episode ${episode.episode} of ${episodeRecords.filter(item => item.season === episode.season).length}</p>
            <h2 tabindex="-1">${escapeHTML(episode.title)}</h2>
            <p class="story-atlas__summary">${escapeHTML(episode.summary)}</p>
            <dl class="story-atlas__metadata">
              <div><dt>First aired</dt><dd>${escapeHTML(formatDate(episode.airDate))}</dd></div>
              <div><dt>Runtime</dt><dd>${episode.runtime ? `${episode.runtime} minutes` : "Not recorded"}</dd></div>
              <div><dt>Director</dt><dd>${escapeHTML(episode.director)}</dd></div>
              <div><dt>${episode.writers.length === 1 ? "Writer" : "Writers"}</dt><dd>${escapeHTML(writers || "Not recorded")}</dd></div>
            </dl>
            ${episode.themes.length ? `
              <div class="story-atlas__story-themes" aria-label="Episode themes">
                ${episode.themes.map(theme => `<button type="button" data-theme="${escapeHTML(theme)}">${escapeHTML(theme)}</button>`).join("")}
              </div>` : ""}
            <section class="story-atlas__why" aria-labelledby="story-atlas-why-title">
              <p class="story-atlas__eyebrow">Why it mattered</p>
              <h3 id="story-atlas-why-title">The thread it leaves behind</h3>
              <p>${escapeHTML(whyItMattered(episode, episodeEvents))}</p>
            </section>
            <div class="story-atlas__chapter-nav">
              <button type="button" data-episode-id="${previous ? escapeHTML(previous.id) : ""}" ${previous ? "" : "disabled"}>
                <small>Previous chapter</small><strong>${previous ? escapeHTML(previous.title) : "Beginning of the chronicle"}</strong>
              </button>
              <button type="button" data-episode-id="${next ? escapeHTML(next.id) : ""}" ${next ? "" : "disabled"}>
                <small>Next thread</small><strong>${next ? escapeHTML(next.title) : "End of the chronicle"}</strong>
              </button>
            </div>
          </article>
          <aside class="story-atlas__insight-panel" aria-label="${escapeHTML(state.mode)} mode details">
            ${modeContent}
          </aside>
        </div>`;
    }

    function updateDeepLink(episode) {
      if (!episode || config.updateUrl === false || !global.history || typeof global.history.replaceState !== "function") return;
      const hash = global.location && cleanString(global.location.hash);
      let nextHash = "";
      if (hash.startsWith("#/timeline")) {
        nextHash = `#/timeline?season=${episode.season}&episode=${encodeURIComponent(episode.id)}`;
      } else if (hash.startsWith("#/episode/")) {
        nextHash = `#/episode/${encodeURIComponent(episode.id)}`;
      }
      if (!nextHash) return;
      if (hash !== nextHash) global.history.replaceState(global.history.state, "", nextHash);
    }

    function syncModeTabs() {
      root.querySelectorAll("[data-mode]").forEach(button => {
        const selected = button.dataset.mode === state.mode;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      themeSection.hidden = state.mode !== "themes";
      workspace.setAttribute("aria-labelledby", `story-mode-${state.mode}`);
    }

    function render(optionsForRender) {
      if (destroyed) return;
      const renderOptions = optionsForRender || {};
      const visible = ensureSelection();
      const episode = selectedEpisode();
      syncModeTabs();
      renderSeasonRail();
      renderThemeRail();
      renderEpisodeRail(visible);
      renderWorkspace(episode);
      clearSearchButton.hidden = !state.query;
      const qualifiers = [];
      if (state.season !== "all") qualifiers.push(`Season ${state.season}`);
      if (state.theme) qualifiers.push(state.theme);
      if (state.query) qualifiers.push(`matching “${state.query}”`);
      resultCount.textContent = `${visible.length} of ${episodeRecords.length} episodes${qualifiers.length ? ` · ${qualifiers.join(" · ")}` : ""}`;
      atlas.classList.toggle("story-atlas--reduced-motion", Boolean(motionQuery && motionQuery.matches));
      if (episode) updateDeepLink(episode);

      if (renderOptions.focusEpisode && episode) {
        later(() => {
          const card = [...episodeRail.querySelectorAll("[data-episode-id]")]
            .find(button => button.dataset.episodeId === episode.id);
          if (card) {
            card.focus({ preventScroll: true });
            card.scrollIntoView({
              behavior: motionQuery && motionQuery.matches ? "auto" : "smooth",
              block: "nearest",
              inline: "center"
            });
          }
        });
      }
      if (renderOptions.focusHeading && episode) {
        later(() => {
          const heading = workspace.querySelector(".story-atlas__story-panel h2");
          if (heading) heading.focus({ preventScroll: true });
        });
      }
    }

    function chooseEpisode(id, focusTarget) {
      const episode = episodeById.get(cleanString(id));
      if (!episode) return;
      const currentlyVisible = filteredEpisodes(false).some(item => item.id === episode.id);
      if (!currentlyVisible) {
        state.theme = "";
        state.query = "";
        searchInput.value = "";
      }
      state.selectedId = episode.id;
      if (state.season !== "all" && episode.season !== Number(state.season)) state.season = episode.season;
      render({
        focusEpisode: focusTarget === "card",
        focusHeading: focusTarget === "heading"
      });
    }

    function resetFilters() {
      state.season = "all";
      state.theme = "";
      state.query = "";
      searchInput.value = "";
      state.selectedId = episodeRecords[0].id;
      render({ focusEpisode: true });
    }

    function chooseSeason(value, focusButton) {
      const season = value === "all" ? "all" : Number(value);
      if (season !== "all" && !seasons.includes(season)) return;
      state.season = season;
      const visible = filteredEpisodes(false);
      state.selectedId = visible[0] ? visible[0].id : "";
      render({ focusEpisode: false });
      if (focusButton) {
        later(() => {
          const button = seasonRail.querySelector(`[data-season="${season}"]`);
          if (button) {
            button.focus({ preventScroll: true });
            button.scrollIntoView({
              behavior: motionQuery && motionQuery.matches ? "auto" : "smooth",
              block: "nearest",
              inline: "center"
            });
          }
        });
      }
    }

    function chooseTheme(theme, focusButton) {
      const nextTheme = cleanString(theme);
      state.theme = allThemes.includes(nextTheme) ? nextTheme : "";
      state.mode = "themes";
      const visible = filteredEpisodes(false);
      if (!visible.some(episode => episode.id === state.selectedId)) state.selectedId = visible[0] ? visible[0].id : "";
      render({ focusEpisode: false });
      if (focusButton) {
        later(() => {
          const button = [...themeRail.querySelectorAll("[data-theme]")]
            .find(item => item.dataset.theme === state.theme);
          if (button) button.focus({ preventScroll: true });
        });
      }
    }

    function chooseMode(mode, focusTab) {
      if (!MODES.includes(mode)) return;
      state.mode = mode;
      render({ focusEpisode: false });
      if (focusTab) later(() => root.querySelector(`[data-mode="${mode}"]`).focus());
    }

    function handleRailKeys(event, selector, choose) {
      const current = event.target.closest(selector);
      if (!current) return false;
      const buttons = [...current.parentElement.querySelectorAll(`${selector}:not([disabled])`)];
      const index = buttons.indexOf(current);
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(buttons.length - 1, index + 1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(0, index - 1);
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = buttons.length - 1;
      else return false;
      event.preventDefault();
      if (nextIndex !== index) choose(buttons[nextIndex]);
      return true;
    }

    function onClick(event) {
      const modeButton = event.target.closest("button[data-mode]");
      if (modeButton && root.contains(modeButton)) {
        chooseMode(modeButton.dataset.mode, true);
        return;
      }
      const seasonButton = event.target.closest("button[data-season]");
      if (seasonButton && root.contains(seasonButton)) {
        chooseSeason(seasonButton.dataset.season, true);
        return;
      }
      const episodeButton = event.target.closest("button[data-episode-id]");
      if (episodeButton && root.contains(episodeButton) && !episodeButton.disabled) {
        chooseEpisode(
          episodeButton.dataset.episodeId,
          episodeButton.classList.contains("story-atlas__episode-card") ? "card" : "heading"
        );
        return;
      }
      const themeButton = event.target.closest("button[data-theme]");
      if (themeButton && root.contains(themeButton) && !themeButton.disabled) {
        const selectedTheme = cleanString(themeButton.dataset.theme);
        chooseTheme(state.theme === selectedTheme ? "" : selectedTheme, true);
        return;
      }
      if (event.target.closest("[data-clear-search]")) {
        state.query = "";
        searchInput.value = "";
        render({ focusEpisode: false });
        searchInput.focus();
        return;
      }
      if (event.target.closest("[data-reset-filters]")) {
        resetFilters();
        return;
      }
      const navigationLink = event.target.closest("a[data-navigate]");
      if (navigationLink && root.contains(navigationLink) && typeof config.onNavigate === "function") {
        event.preventDefault();
        config.onNavigate(navigationLink.getAttribute("href"));
      }
    }

    function onKeyDown(event) {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target;
        const editing = target && (target.matches("input, textarea, select") || target.isContentEditable);
        if (!editing) {
          event.preventDefault();
          searchInput.focus();
          return;
        }
      }
      if (handleRailKeys(event, "button[data-mode]", button => chooseMode(button.dataset.mode, true))) return;
      if (handleRailKeys(event, "button[data-season]", button => chooseSeason(button.dataset.season, true))) return;
      handleRailKeys(event, ".story-atlas__episode-card", button => chooseEpisode(button.dataset.episodeId, "card"));
    }

    function onSearchInput(event) {
      state.query = event.target.value;
      render({ focusEpisode: false });
    }

    function onSearchKeyDown(event) {
      if (event.key === "Escape" && state.query) {
        event.preventDefault();
        state.query = "";
        searchInput.value = "";
        render({ focusEpisode: false });
      }
    }

    function onMotionChange() {
      atlas.classList.toggle("story-atlas--reduced-motion", Boolean(motionQuery && motionQuery.matches));
    }

    listen(root, "click", onClick);
    listen(root, "keydown", onKeyDown);
    listen(searchInput, "input", onSearchInput);
    listen(searchInput, "keydown", onSearchKeyDown);
    if (motionQuery) {
      if (typeof motionQuery.addEventListener === "function") listen(motionQuery, "change", onMotionChange);
      else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(onMotionChange);
        listeners.push(() => motionQuery.removeListener(onMotionChange));
      }
    }

    render({ focusEpisode: false });

    return Object.freeze({
      destroy() {
        if (destroyed) return;
        destroyed = true;
        listeners.splice(0).forEach(remove => remove());
        pendingFrames.forEach(frame => global.cancelAnimationFrame(frame));
        pendingFrames.clear();
        if (!bodyHadRouteClass) document.body.classList.remove("story-atlas-route");
        root.replaceChildren();
      }
    });
  }

  global.StoryAtlas = Object.freeze({ mount });
})(window);
