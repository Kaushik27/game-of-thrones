// Accessible global search for the Game of Thrones SPA.
// Depends only on the datasets and optional helpers loaded by the existing
// classic scripts. The module is opt-in through RavenSearch.init().
(function () {
  "use strict";

  const ROOT_ID = "raven-search";
  const INPUT_ID = "raven-search-input";
  const LISTBOX_ID = "raven-search-results";
  const TITLE_ID = "raven-search-title";
  const HELP_ID = "raven-search-help";
  const DEFAULT_TRIGGER_SELECTOR = ".raven-search-trigger";
  const MAX_RESULTS_PER_GROUP = 8;
  const GROUPS = [
    { key: "characters", label: "Characters" },
    { key: "episodes", label: "Episodes" },
    { key: "lore", label: "Lore" },
    { key: "what-if", label: "What-if branches" },
    { key: "houses", label: "Houses" },
    { key: "events", label: "Timeline events" },
    { key: "battles", label: "Battles" },
    { key: "quotes", label: "Quotes" }
  ];

  let initialized = false;
  let open = false;
  let triggerSelector = DEFAULT_TRIGGER_SELECTOR;
  let root = null;
  let dialog = null;
  let input = null;
  let listbox = null;
  let emptyState = null;
  let status = null;
  let searchIndex = [];
  let visibleResults = [];
  let activeIndex = -1;
  let previouslyFocused = null;
  let focusFrame = 0;
  let triggerObserver = null;
  let domReadyHandler = null;
  const enhancedTriggers = new Map();

  function getCharacters() {
    if (typeof characters !== "undefined" && Array.isArray(characters)) return characters;
    if (typeof CHARACTERS !== "undefined" && Array.isArray(CHARACTERS)) return CHARACTERS;
    if (Array.isArray(window.characters)) return window.characters;
    if (Array.isArray(window.CHARACTERS)) return window.CHARACTERS;
    return [];
  }

  function getEvents() {
    if (typeof events !== "undefined" && Array.isArray(events)) return events;
    if (typeof EVENTS !== "undefined" && Array.isArray(EVENTS)) return EVENTS;
    if (Array.isArray(window.events)) return window.events;
    if (Array.isArray(window.EVENTS)) return window.EVENTS;
    return [];
  }

  function getBattles() {
    if (typeof battles !== "undefined" && Array.isArray(battles)) return battles;
    if (typeof BATTLES !== "undefined" && Array.isArray(BATTLES)) return BATTLES;
    if (Array.isArray(window.battles)) return window.battles;
    if (Array.isArray(window.BATTLES)) return window.BATTLES;
    return [];
  }

  function getQuotes() {
    if (typeof quotes !== "undefined" && Array.isArray(quotes)) return quotes;
    if (typeof QUOTES !== "undefined" && Array.isArray(QUOTES)) return QUOTES;
    if (Array.isArray(window.quotes)) return window.quotes;
    if (Array.isArray(window.QUOTES)) return window.QUOTES;
    return [];
  }

  function getEpisodes() {
    if (typeof EPISODES !== "undefined" && Array.isArray(EPISODES)) return EPISODES;
    if (Array.isArray(window.EPISODES)) return window.EPISODES;
    return [];
  }

  function getLoreEntries() {
    if (typeof LORE_ENTRIES !== "undefined" && Array.isArray(LORE_ENTRIES)) return LORE_ENTRIES;
    if (Array.isArray(window.LORE_ENTRIES)) return window.LORE_ENTRIES;
    return [];
  }

  function getWhatIfs() {
    if (Array.isArray(window.WHAT_IFS)) return window.WHAT_IFS;
    return [];
  }

  function getHouseRecords() {
    let source = null;
    if (typeof HOUSE_INFO !== "undefined" && HOUSE_INFO) source = HOUSE_INFO;
    else if (typeof HOUSES !== "undefined" && HOUSES) source = HOUSES;
    else source = window.HOUSE_INFO || window.HOUSES || null;

    if (Array.isArray(source)) {
      return source.map((house) => {
        if (typeof house === "string") return { name: house, info: {} };
        return { name: house.name || house.id || "", info: house };
      }).filter((house) => house.name);
    }

    if (source && typeof source === "object") {
      return Object.keys(source).map((name) => ({ name: name, info: source[name] || {} }));
    }

    return [];
  }

  function text(value) {
    return value == null ? "" : String(value);
  }

  function normalize(value) {
    return text(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeMarkup(value) {
    if (typeof escapeHTML === "function") return escapeHTML(value);
    const element = document.createElement("div");
    element.textContent = text(value);
    return element.innerHTML;
  }

  function avatarMarkup(character) {
    if (!character || typeof avatarHTML !== "function") return "";
    return avatarHTML(character, 40);
  }

  function titleCase(value) {
    return text(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function makeItem(group, id, label, meta, hash, fields, character) {
    const searchableFields = [label].concat(fields || []).map(normalize).filter(Boolean);
    return {
      group: group,
      id: text(id),
      label: text(label),
      meta: text(meta),
      hash: hash,
      character: character || null,
      normalizedLabel: normalize(label),
      searchText: searchableFields.join(" ")
    };
  }

  function buildSearchIndex() {
    const characterRecords = getCharacters();
    const charactersById = new Map(characterRecords.map((character) => [character.id, character]));
    const characterNames = (ids) => (ids || [])
      .map((id) => charactersById.get(id))
      .filter(Boolean)
      .map((character) => character.name);
    const items = [];

    characterRecords.forEach((character) => {
      items.push(makeItem(
        "characters",
        character.id,
        character.name,
        [character.house, character.actor].filter(Boolean).join(" \u00b7 "),
        "#/character/" + encodeURIComponent(character.id),
        [character.id, character.house, character.status, character.actor, character.bio],
        character
      ));
    });

    getEpisodes().forEach((episode) => {
      const season = Number(episode.season) || 0;
      const number = Number(episode.episode) || 0;
      const code = season && number ? `S${season}E${String(number).padStart(2, "0")}` : "Episode";
      items.push(makeItem(
        "episodes",
        episode.id,
        episode.title,
        [code, episode.airDate].filter(Boolean).join(" \u00b7 "),
        "#/episode/" + encodeURIComponent(episode.id),
        [episode.id, episode.summary, episode.director]
          .concat(episode.writers || [], episode.themes || [], characterNames(episode.characterIds))
      ));
    });

    getLoreEntries().forEach((entry) => {
      items.push(makeItem(
        "lore",
        entry.id,
        entry.title,
        [titleCase(entry.category), entry.deck].filter(Boolean).join(" \u00b7 "),
        "#/lore?entry=" + encodeURIComponent(entry.id),
        [entry.id, entry.category, entry.deck]
          .concat(entry.body || [], entry.relatedHouseNames || entry.relatedHouses || [], characterNames(entry.relatedCharacterIds))
      ));
    });

    getWhatIfs().forEach((record) => {
      items.push(makeItem(
        "what-if",
        record.id,
        record.title,
        [record.kicker, "Fan speculation"].filter(Boolean).join(" · "),
        "#/what-if?branch=" + encodeURIComponent(record.id),
        [record.id, record.title, record.premise, record.divergence].concat(record.branches || [], record.relatedCharacters || [])
      ));
    });

    getHouseRecords().forEach((house) => {
      const info = house.info;
      const seat = info.seat ? "Seat: " + info.seat : "";
      items.push(makeItem(
        "houses",
        house.name,
        "House " + house.name,
        [info.words, seat].filter(Boolean).join(" \u00b7 "),
        "#/house/" + encodeURIComponent(house.name),
        [house.name, info.words, info.seat, info.region, info.sigil, info.animal, info.rulerEnd]
      ));
    });

    getEvents().forEach((event) => {
      const eventQuery = new URLSearchParams({
        mode: "consequences",
        event: String(event.id || "")
      });
      if (Number(event.season) >= 1 && Number(event.season) <= 8) {
        eventQuery.set("season", String(Number(event.season)));
      }
      items.push(makeItem(
        "events",
        event.id,
        event.title,
        [event.date || (event.season ? "Season " + event.season : ""), titleCase(event.type)].filter(Boolean).join(" \u00b7 "),
        "#/timeline?" + eventQuery.toString(),
        [event.id, event.summary, event.type].concat(event.houses || [], characterNames(event.characters))
      ));
    });

    getBattles().forEach((battle) => {
      const combatants = (battle.combatants || []).reduce((parts, side) => {
        return parts.concat(side.side || "", side.houses || [], characterNames(side.characters));
      }, []);
      items.push(makeItem(
        "battles",
        battle.id,
        battle.name,
        [battle.season, battle.location].filter(Boolean).join(" \u00b7 "),
        "#/battles?battle=" + encodeURIComponent(battle.id),
        [battle.id, battle.location, battle.season, battle.outcome, battle.casualties]
          .concat(combatants, characterNames(battle.linkedCharacters))
      ));
    });

    getQuotes().forEach((quote) => {
      const character = charactersById.get(quote.characterId);
      const speaker = character ? character.name : quote.characterId;
      const season = quote.season ? "Season " + quote.season : "";
      items.push(makeItem(
        "quotes",
        quote.id,
        "\u201c" + quote.text + "\u201d",
        [speaker, season].filter(Boolean).join(" \u00b7 "),
        "#/quotes?quote=" + encodeURIComponent(quote.id),
        [quote.id, quote.text, speaker, character && character.house, season]
      ));
    });

    searchIndex = items;
  }

  function itemScore(item, query, tokens) {
    if (!tokens.every((token) => item.searchText.includes(token))) return null;

    let score = 0;
    if (item.normalizedLabel === query) score -= 1000;
    else if (item.normalizedLabel.startsWith(query)) score -= 500;
    else if (item.normalizedLabel.split(/\s+/).some((word) => word.startsWith(query))) score -= 250;

    tokens.forEach((token) => {
      const labelPosition = item.normalizedLabel.indexOf(token);
      score += labelPosition >= 0 ? labelPosition : 100 + item.searchText.indexOf(token);
    });
    return score;
  }

  function setEmptyState(title, detail) {
    const heading = document.createElement("div");
    const copy = document.createElement("p");
    heading.className = "raven-search__empty-title";
    copy.className = "raven-search__empty-copy";
    heading.textContent = title;
    copy.textContent = detail;
    emptyState.replaceChildren(heading, copy);
    emptyState.hidden = false;
    listbox.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    visibleResults = [];
    activeIndex = -1;
  }

  function renderResults() {
    const query = normalize(input.value);
    const tokens = query.split(" ").filter(Boolean);

    if (!query) {
      setEmptyState(
        "Send a raven across the Seven Kingdoms",
        "Search characters, episodes, lore, houses, events, battles, and memorable quotes."
      );
      status.textContent = "Enter a search term.";
      return;
    }

    const ranked = searchIndex.map((item) => ({ item: item, score: itemScore(item, query, tokens) }))
      .filter((result) => result.score !== null)
      .sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label));

    if (!ranked.length) {
      setEmptyState(
        "No ravens returned for \u201c" + input.value.trim() + "\u201d",
        "Try a character, house, place, battle, season, or a few words from a quote."
      );
      status.textContent = "No search results.";
      return;
    }

    visibleResults = [];
    const markup = GROUPS.map((group) => {
      const matches = ranked.filter((result) => result.item.group === group.key);
      if (!matches.length) return "";
      const shown = matches.slice(0, MAX_RESULTS_PER_GROUP);
      const groupId = "raven-search-group-" + group.key;
      const options = shown.map((result) => {
        const index = visibleResults.length;
        const item = result.item;
        const optionId = "raven-search-option-" + index;
        visibleResults.push(item);
        return `
          <button class="raven-search__option" id="${optionId}" type="button" role="option"
            aria-selected="false" tabindex="-1" data-raven-result-index="${index}">
            ${item.character ? `<span class="raven-search__option-media" aria-hidden="true">${avatarMarkup(item.character)}</span>` : ""}
            <span class="raven-search__option-copy">
              <span class="raven-search__option-title">${escapeMarkup(item.label)}</span>
              ${item.meta ? `<span class="raven-search__option-meta">${escapeMarkup(item.meta)}</span>` : ""}
            </span>
          </button>`;
      }).join("");
      const count = matches.length > shown.length ? `${shown.length} of ${matches.length}` : String(matches.length);
      return `
        <div class="raven-search__group" role="group" aria-labelledby="${groupId}">
          <div class="raven-search__group-title" id="${groupId}">${escapeMarkup(group.label)} <span>${count}</span></div>
          ${options}
        </div>`;
    }).join("");

    listbox.innerHTML = markup;
    listbox.hidden = false;
    emptyState.hidden = true;
    input.setAttribute("aria-expanded", "true");
    setActiveIndex(0, false);

    const shownCount = visibleResults.length;
    const totalCount = ranked.length;
    status.textContent = shownCount === totalCount
      ? totalCount + (totalCount === 1 ? " result." : " results.")
      : "Showing " + shownCount + " of " + totalCount + " results.";
  }

  function setActiveIndex(index, shouldScroll) {
    if (!visibleResults.length) {
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }

    activeIndex = (index + visibleResults.length) % visibleResults.length;
    const options = Array.from(listbox.querySelectorAll("[role='option']"));
    options.forEach((option, optionIndex) => {
      option.setAttribute("aria-selected", optionIndex === activeIndex ? "true" : "false");
    });
    const activeOption = options[activeIndex];
    if (!activeOption) return;
    input.setAttribute("aria-activedescendant", activeOption.id);
    if (shouldScroll) activeOption.scrollIntoView({ block: "nearest" });
  }

  function activateResult(index) {
    const result = visibleResults[index];
    if (!result) return;
    closeSearch(true);
    window.location.hash = result.hash;
  }

  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
  }

  function getFocusableElements() {
    if (!dialog) return [];
    return Array.from(dialog.querySelectorAll(
      "a[href], button:not([disabled]):not([tabindex='-1']), input:not([disabled]), " +
      "select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
  }

  function trapFocus(event) {
    const focusable = getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (event.shiftKey && (current === first || !dialog.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !dialog.contains(current))) {
      event.preventDefault();
      first.focus();
    }
  }

  function onDocumentKeydown(event) {
    if (!open) {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey &&
          !event.defaultPrevented && !isEditableTarget(event.target)) {
        event.preventDefault();
        openSearch();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch(true);
      return;
    }
    if (event.key === "Tab") {
      trapFocus(event);
      return;
    }
    if (event.target !== input) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(activeIndex + 1, true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(activeIndex < 0 ? visibleResults.length - 1 : activeIndex - 1, true);
    } else if (event.key === "Home" && visibleResults.length) {
      event.preventDefault();
      setActiveIndex(0, true);
    } else if (event.key === "End" && visibleResults.length) {
      event.preventDefault();
      setActiveIndex(visibleResults.length - 1, true);
    } else if (event.key === "Enter" && !event.isComposing && activeIndex >= 0) {
      event.preventDefault();
      activateResult(activeIndex);
    }
  }

  function onDocumentClick(event) {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest(triggerSelector);
    if (!trigger || (root && root.contains(trigger)) || trigger.disabled ||
        trigger.getAttribute("aria-disabled") === "true") return;
    event.preventDefault();
    openSearch(trigger);
  }

  function onRootClick(event) {
    if (!(event.target instanceof Element)) return;
    const option = event.target.closest("[data-raven-result-index]");
    if (option && root.contains(option)) {
      activateResult(Number(option.dataset.ravenResultIndex));
      return;
    }
    if (event.target.closest("[data-raven-search-close]")) closeSearch(true);
  }

  function onRootPointerMove(event) {
    if (!(event.target instanceof Element)) return;
    const option = event.target.closest("[data-raven-result-index]");
    if (!option || !root.contains(option)) return;
    const index = Number(option.dataset.ravenResultIndex);
    if (index !== activeIndex) setActiveIndex(index, false);
  }

  function rememberAttribute(element, name) {
    return { present: element.hasAttribute(name), value: element.getAttribute(name) };
  }

  function enhanceTriggers() {
    if (!initialized || !document.body) return;
    document.querySelectorAll(triggerSelector).forEach((trigger) => {
      if (!enhancedTriggers.has(trigger)) {
        enhancedTriggers.set(trigger, {
          haspopup: rememberAttribute(trigger, "aria-haspopup"),
          controls: rememberAttribute(trigger, "aria-controls"),
          expanded: rememberAttribute(trigger, "aria-expanded"),
          keyshortcuts: rememberAttribute(trigger, "aria-keyshortcuts")
        });
      }
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", ROOT_ID);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      trigger.setAttribute("aria-keyshortcuts", "/");
    });
  }

  function restoreAttribute(element, name, previous) {
    if (previous.present) element.setAttribute(name, previous.value);
    else element.removeAttribute(name);
  }

  function restoreTriggers() {
    enhancedTriggers.forEach((previous, trigger) => {
      restoreAttribute(trigger, "aria-haspopup", previous.haspopup);
      restoreAttribute(trigger, "aria-controls", previous.controls);
      restoreAttribute(trigger, "aria-expanded", previous.expanded);
      restoreAttribute(trigger, "aria-keyshortcuts", previous.keyshortcuts);
    });
    enhancedTriggers.clear();
  }

  function openSearch(source) {
    if (!root || !initialized) return;
    if (open) {
      input.focus();
      return;
    }

    previouslyFocused = source || document.activeElement;
    buildSearchIndex();
    input.value = "";
    open = true;
    root.hidden = false;
    root.classList.add("raven-search--open");
    document.body.classList.add("raven-search-open");
    enhanceTriggers();
    renderResults();
    focusFrame = requestAnimationFrame(() => {
      focusFrame = 0;
      if (open) input.focus({ preventScroll: true });
    });
  }

  function closeSearch(restoreFocus) {
    if (!root || !open) return;
    open = false;
    root.classList.remove("raven-search--open");
    root.hidden = true;
    document.body.classList.remove("raven-search-open");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    enhanceTriggers();
    if (focusFrame) {
      cancelAnimationFrame(focusFrame);
      focusFrame = 0;
    }

    const focusTarget = previouslyFocused;
    previouslyFocused = null;
    if (restoreFocus && focusTarget && focusTarget.isConnected && typeof focusTarget.focus === "function") {
      focusTarget.focus({ preventScroll: true });
    }
  }

  function createOverlay() {
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "raven-search";
    root.hidden = true;
    root.innerHTML = `
      <div class="raven-search__backdrop" data-raven-search-close></div>
      <div class="raven-search__dialog" role="dialog" aria-modal="true" aria-labelledby="${TITLE_ID}">
        <div class="raven-search__header">
          <div>
            <div class="raven-search__eyebrow">The realms of Westeros</div>
            <h2 class="raven-search__title" id="${TITLE_ID}">Search the Seven Kingdoms</h2>
          </div>
          <button class="raven-search__close" type="button" data-raven-search-close aria-label="Close search">
            <span aria-hidden="true">Esc</span><span class="raven-search__close-label">Close</span>
          </button>
        </div>
        <div class="raven-search__field">
          <label class="raven-search__label" for="${INPUT_ID}">Search all records</label>
          <input class="raven-search__input" id="${INPUT_ID}" type="search" role="combobox"
            aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false"
            aria-controls="${LISTBOX_ID}" aria-describedby="${HELP_ID}"
            autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"
            placeholder="Search names, houses, places, battles, or quotes">
          <span class="raven-search__shortcut" aria-hidden="true">/</span>
        </div>
        <div class="raven-search__body">
          <div class="raven-search__results" id="${LISTBOX_ID}" role="listbox" aria-label="Search results" hidden></div>
          <div class="raven-search__empty"></div>
        </div>
        <p class="raven-search__help" id="${HELP_ID}">Use the arrow keys to choose a result, Enter to open it, and Escape to close.</p>
        <div class="raven-search__status" role="status" aria-live="polite" aria-atomic="true"></div>
      </div>`;

    document.body.appendChild(root);
    dialog = root.querySelector("[role='dialog']");
    input = root.querySelector("#" + INPUT_ID);
    listbox = root.querySelector("#" + LISTBOX_ID);
    emptyState = root.querySelector(".raven-search__empty");
    status = root.querySelector(".raven-search__status");

    input.addEventListener("input", renderResults);
    root.addEventListener("click", onRootClick);
    root.addEventListener("pointermove", onRootPointerMove);
  }

  function mount() {
    if (!initialized || root || !document.body) return;
    const staleRoot = document.getElementById(ROOT_ID);
    if (staleRoot) staleRoot.remove();
    createOverlay();
    document.addEventListener("keydown", onDocumentKeydown);
    document.addEventListener("click", onDocumentClick);
    window.addEventListener("hashchange", onHashChange);
    enhanceTriggers();

    if (typeof MutationObserver === "function") {
      triggerObserver = new MutationObserver(enhanceTriggers);
      triggerObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  function onHashChange() {
    if (open) closeSearch(true);
    enhanceTriggers();
  }

  function init(options) {
    destroy();
    const requestedSelector = options && options.triggerSelector;
    triggerSelector = requestedSelector || DEFAULT_TRIGGER_SELECTOR;
    if (typeof triggerSelector !== "string" || !triggerSelector.trim()) {
      throw new TypeError("RavenSearch.init requires a valid triggerSelector string.");
    }
    try {
      document.querySelectorAll(triggerSelector);
    } catch (error) {
      throw new TypeError("RavenSearch.init received an invalid triggerSelector: " + error.message);
    }

    initialized = true;
    if (document.body) {
      mount();
    } else {
      domReadyHandler = mount;
      document.addEventListener("DOMContentLoaded", domReadyHandler, { once: true });
    }
    return api;
  }

  function destroy() {
    if (domReadyHandler) {
      document.removeEventListener("DOMContentLoaded", domReadyHandler);
      domReadyHandler = null;
    }
    if (open) closeSearch(true);
    initialized = false;
    document.removeEventListener("keydown", onDocumentKeydown);
    document.removeEventListener("click", onDocumentClick);
    window.removeEventListener("hashchange", onHashChange);
    if (triggerObserver) {
      triggerObserver.disconnect();
      triggerObserver = null;
    }
    restoreTriggers();
    document.body && document.body.classList.remove("raven-search-open");
    if (root) root.remove();
    root = null;
    dialog = null;
    input = null;
    listbox = null;
    emptyState = null;
    status = null;
    searchIndex = [];
    visibleResults = [];
    activeIndex = -1;
    previouslyFocused = null;
    focusFrame = 0;
  }

  const api = { init: init, destroy: destroy };
  window.RavenSearch = api;
})();
