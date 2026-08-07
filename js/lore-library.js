// Accessible, dependency-free Living Lore Library.
// Exposes: LoreLibrary.mount(root, options) -> { destroy }
(function (global) {
  "use strict";

  const ALLOWED_ICONS = new Set([
    "assets/icons/castle.svg",
    "assets/icons/compass.svg",
    "assets/icons/person.svg",
    "assets/icons/play.svg",
    "assets/icons/snowflake.svg",
    "assets/icons/swords.svg"
  ]);
  const FALLBACK_ICON = "assets/icons/compass.svg";
  const mountedRoots = new WeakMap();
  let instanceCount = 0;

  function text(value) {
    return value == null ? "" : String(value);
  }

  function escapeMarkup(value) {
    return text(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    })[character]);
  }

  function normalize(value) {
    return text(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function titleCase(value) {
    return text(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function iconPath(value) {
    return ALLOWED_ICONS.has(value) ? value : FALLBACK_ICON;
  }

  function externalUrl(value) {
    try {
      const url = new URL(text(value));
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function uniqueStrings(values) {
    return Array.from(new Set((Array.isArray(values) ? values : [])
      .map((value) => text(value).trim())
      .filter(Boolean)));
  }

  function normalizeEntries(source) {
    return (Array.isArray(source) ? source : []).map((entry, index) => {
      const sourceEntry = entry && typeof entry === "object" ? entry : {};
      const seasons = Array.from(new Set((Array.isArray(sourceEntry.seasons) ? sourceEntry.seasons : [])
        .map(Number)
        .filter((season) => Number.isInteger(season) && season >= 1 && season <= 8)))
        .sort((left, right) => left - right);
      return {
        id: text(sourceEntry.id || `lore-entry-${index + 1}`),
        title: text(sourceEntry.title || "Untitled dossier"),
        category: text(sourceEntry.category || "uncategorized"),
        deck: text(sourceEntry.deck),
        body: uniqueStrings(sourceEntry.body),
        relatedCharacterIds: uniqueStrings(sourceEntry.relatedCharacterIds),
        relatedHouses: uniqueStrings(sourceEntry.relatedHouses),
        seasons: seasons,
        iconAsset: iconPath(sourceEntry.iconAsset),
        sourceUrls: uniqueStrings(sourceEntry.sourceUrls).map(externalUrl).filter(Boolean),
        featured: Boolean(sourceEntry.featured)
      };
    }).filter((entry) => entry.id && entry.title);
  }

  function normalizeCategories(source, entries) {
    const supplied = (Array.isArray(source) ? source : []).map((category) => ({
      id: text(category && category.id),
      label: text(category && (category.label || category.id)),
      shortLabel: text(category && (category.shortLabel || category.label || category.id)),
      iconAsset: iconPath(category && category.iconAsset)
    })).filter((category) => category.id);
    const byId = new Map(supplied.map((category) => [category.id, category]));
    entries.forEach((entry) => {
      if (!byId.has(entry.category)) {
        byId.set(entry.category, {
          id: entry.category,
          label: titleCase(entry.category),
          shortLabel: titleCase(entry.category),
          iconAsset: entry.iconAsset
        });
      }
    });
    return Array.from(byId.values());
  }

  function globalCharacters() {
    if (typeof characters !== "undefined" && Array.isArray(characters)) return characters;
    if (Array.isArray(global.characters)) return global.characters;
    if (Array.isArray(global.CHARACTERS)) return global.CHARACTERS;
    return [];
  }

  function rangeLabel(seasons) {
    if (!seasons.length) return "All eras";
    const groups = [];
    let start = seasons[0];
    let previous = seasons[0];
    for (let index = 1; index <= seasons.length; index += 1) {
      const season = seasons[index];
      if (season === previous + 1) {
        previous = season;
        continue;
      }
      groups.push(start === previous ? `S${start}` : `S${start}\u2013S${previous}`);
      start = season;
      previous = season;
    }
    return groups.join(", ");
  }

  function intersectionCount(left, right) {
    const rightValues = new Set(right);
    return left.reduce((count, value) => count + (rightValues.has(value) ? 1 : 0), 0);
  }

  function sourceLabel(urlValue) {
    try {
      const url = new URL(urlValue);
      const parts = url.pathname.split("/").filter(Boolean);
      const seasonPart = parts.find((part) => /^season-\d+$/.test(part));
      const episodePart = parts[parts.length - 1] || "episode-guide";
      const episodeTitle = titleCase(episodePart.replace(/^\d+-/, ""));
      const season = seasonPart ? titleCase(seasonPart) : "Series";
      return {
        title: `${season} \u00b7 ${episodeTitle}`,
        host: url.hostname.replace(/^www\./, "")
      };
    } catch (_error) {
      return { title: "Canon source", host: "External source" };
    }
  }

  function mount(root, options) {
    if (!root || root.nodeType !== 1) {
      throw new TypeError("LoreLibrary.mount requires a DOM element root.");
    }

    const existing = mountedRoots.get(root);
    if (existing) existing();

    const settings = options && typeof options === "object" ? options : {};
    const entries = normalizeEntries(settings.entries || global.LORE_ENTRIES || []);
    const categories = normalizeCategories(settings.categories || global.LORE_CATEGORIES || [], entries);
    const entryById = new Map(entries.map((entry) => [entry.id, entry]));
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const charactersById = new Map(globalCharacters().map((character) => [character.id, character]));
    const validInitialCategory = categoryById.has(settings.initialCategory) ? settings.initialCategory : "all";
    const instanceId = `lore-library-${++instanceCount}`;
    const abortController = new AbortController();
    const motionQuery = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const state = {
      category: validInitialCategory,
      query: text(settings.initialQuery).trim(),
      activeEntryId: null,
      returnFocus: null,
      destroyed: false
    };
    let drawerTimer = 0;
    let openFrame = 0;

    const categoryButtons = [{
      id: "all",
      label: "All lore",
      shortLabel: "All lore",
      iconAsset: FALLBACK_ICON
    }].concat(categories);

    function categoryCount(categoryId) {
      return categoryId === "all"
        ? entries.length
        : entries.filter((entry) => entry.category === categoryId).length;
    }

    root.classList.add("lore-library-host");
    root.innerHTML = `
      <section class="lore-library" aria-labelledby="${instanceId}-title">
        <header class="lore-library__hero">
          <div class="lore-library__hero-orbit" aria-hidden="true">
            <img src="assets/icons/compass.svg" alt="">
          </div>
          <div class="lore-library__hero-copy">
            <p class="lore-library__eyebrow">The living archive</p>
            <h1 id="${instanceId}-title">Lore of the Realm</h1>
            <p>Trace the beliefs, bloodlines, weapons, and remembered truths that move the story beneath every battle.</p>
          </div>
          <dl class="lore-library__stats" aria-label="Library coverage">
            <div><dt>${entries.length}</dt><dd>Dossiers</dd></div>
            <div><dt>${categories.length}</dt><dd>Disciplines</dd></div>
            <div><dt>8</dt><dd>Seasons</dd></div>
          </dl>
        </header>

        <div class="lore-library__body">
          <div class="lore-library__toolbar">
            <label class="lore-library__search" for="${instanceId}-search">
              <span class="lore-library__search-label">Search the archives</span>
              <span class="lore-library__search-field">
                <img src="assets/icons/compass.svg" alt="">
                <input id="${instanceId}-search" type="search" autocomplete="off" spellcheck="false" placeholder="A house, prophecy, person, or relic" value="${escapeMarkup(state.query)}">
                <button class="lore-library__search-clear" type="button" data-lore-clear aria-label="Clear lore search" hidden>Clear</button>
              </span>
            </label>
            <nav class="lore-library__categories" aria-label="Lore categories">
              ${categoryButtons.map((category) => `
                <button type="button" class="lore-category" data-lore-category="${escapeMarkup(category.id)}" aria-pressed="false">
                  <img src="${escapeMarkup(iconPath(category.iconAsset))}" alt="">
                  <span>${escapeMarkup(category.shortLabel)}</span>
                  <small>${categoryCount(category.id)}</small>
                </button>`).join("")}
            </nav>
          </div>

          <section class="lore-featured" aria-labelledby="${instanceId}-featured-title">
            <div class="lore-section-heading">
              <div>
                <p class="lore-library__eyebrow">Begin with the forces that shape every path</p>
                <h2 id="${instanceId}-featured-title">Featured dossiers</h2>
              </div>
              <p>Three gateways into power, magic, and fate.</p>
            </div>
            <div class="lore-featured__grid"></div>
          </section>

          <section class="lore-archive" aria-labelledby="${instanceId}-archive-title">
            <div class="lore-section-heading lore-section-heading--archive">
              <div>
                <p class="lore-library__eyebrow">Indexed knowledge</p>
                <h2 id="${instanceId}-archive-title">Complete archive</h2>
              </div>
              <p class="lore-archive__status" aria-live="polite" aria-atomic="true"></p>
            </div>
            <div class="lore-archive__grid"></div>
            <div class="lore-archive__empty" hidden>
              <img src="assets/icons/compass.svg" alt="">
              <h3>No matching record</h3>
              <p>Try another name, object, house, or season.</p>
              <button type="button" data-lore-reset>Reset the archive</button>
            </div>
          </section>
        </div>

        <div class="lore-drawer" hidden>
          <button class="lore-drawer__backdrop" type="button" data-lore-close tabindex="-1" aria-label="Close dossier"></button>
          <aside class="lore-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="${instanceId}-drawer-title" tabindex="-1">
            <div class="lore-drawer__content"></div>
          </aside>
        </div>
      </section>`;

    const searchInput = root.querySelector(`#${instanceId}-search`);
    const searchClear = root.querySelector("[data-lore-clear]");
    const categoryNav = root.querySelector(".lore-library__categories");
    const featuredSection = root.querySelector(".lore-featured");
    const featuredGrid = root.querySelector(".lore-featured__grid");
    const archiveTitle = root.querySelector(`#${instanceId}-archive-title`);
    const archiveStatus = root.querySelector(".lore-archive__status");
    const archiveGrid = root.querySelector(".lore-archive__grid");
    const archiveEmpty = root.querySelector(".lore-archive__empty");
    const drawer = root.querySelector(".lore-drawer");
    const drawerPanel = root.querySelector(".lore-drawer__panel");
    const drawerContent = root.querySelector(".lore-drawer__content");

    function categoryFor(entry) {
      return categoryById.get(entry.category) || {
        id: entry.category,
        label: titleCase(entry.category),
        shortLabel: titleCase(entry.category),
        iconAsset: entry.iconAsset
      };
    }

    function characterName(characterId) {
      const character = charactersById.get(characterId);
      return character && character.name ? character.name : titleCase(characterId);
    }

    function searchableText(entry) {
      return normalize([
        entry.title,
        entry.deck,
        categoryFor(entry).label,
        entry.body.join(" "),
        entry.relatedHouses.join(" "),
        entry.relatedCharacterIds.map(characterName).join(" "),
        entry.seasons.map((season) => `season ${season} s${season}`).join(" ")
      ].join(" "));
    }

    function filteredEntries() {
      const tokens = normalize(state.query).split(" ").filter(Boolean);
      return entries.filter((entry) => {
        if (state.category !== "all" && entry.category !== state.category) return false;
        if (!tokens.length) return true;
        const haystack = searchableText(entry);
        return tokens.every((token) => haystack.includes(token));
      });
    }

    function cardMarkup(entry, featured) {
      const category = categoryFor(entry);
      const descriptionId = `${instanceId}-${featured ? "featured" : "card"}-${escapeMarkup(entry.id)}-description`;
      return `
        <article class="${featured ? "lore-feature-card" : "lore-card"}" data-lore-entry="${escapeMarkup(entry.id)}">
          <button type="button" class="${featured ? "lore-feature-card__open" : "lore-card__open"}" data-lore-open="${escapeMarkup(entry.id)}" aria-describedby="${descriptionId}">
            <span class="${featured ? "lore-feature-card__top" : "lore-card__top"}">
              <span class="lore-card__icon"><img src="${escapeMarkup(entry.iconAsset)}" alt=""></span>
              <span class="lore-card__category">${escapeMarkup(category.label)}</span>
              <span class="lore-card__index" aria-hidden="true">${String(entries.indexOf(entry) + 1).padStart(2, "0")}</span>
            </span>
            <span class="${featured ? "lore-feature-card__title" : "lore-card__title"}">${escapeMarkup(entry.title)}</span>
            <span class="${featured ? "lore-feature-card__deck" : "lore-card__deck"}" id="${descriptionId}">${escapeMarkup(entry.deck)}</span>
            <span class="lore-card__footer">
              <span>${escapeMarkup(rangeLabel(entry.seasons))}</span>
              <span>${entry.relatedCharacterIds.length + entry.relatedHouses.length} connections</span>
              <span class="lore-card__action">Open dossier</span>
            </span>
          </button>
        </article>`;
    }

    function renderFeatured() {
      const featuredEntries = entries.filter((entry) => entry.featured).slice(0, 3);
      featuredGrid.innerHTML = featuredEntries.map((entry) => cardMarkup(entry, true)).join("");
      featuredSection.hidden = featuredEntries.length === 0 || state.category !== "all" || Boolean(state.query);
    }

    function renderArchive() {
      const results = filteredEntries();
      const selectedCategory = categoryById.get(state.category);
      archiveTitle.textContent = state.query
        ? "Search results"
        : selectedCategory ? selectedCategory.label : "Complete archive";
      archiveStatus.textContent = `${results.length} ${results.length === 1 ? "dossier" : "dossiers"}`;
      archiveGrid.innerHTML = results.map((entry) => cardMarkup(entry, false)).join("");
      archiveGrid.hidden = results.length === 0;
      archiveEmpty.hidden = results.length !== 0;
      searchClear.hidden = !state.query;
      root.querySelectorAll("[data-lore-category]").forEach((button) => {
        const selected = button.dataset.loreCategory === state.category;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("is-active", selected);
      });
      renderFeatured();
    }

    function relatedEntries(entry) {
      return entries
        .filter((candidate) => candidate.id !== entry.id)
        .map((candidate) => ({
          entry: candidate,
          score: intersectionCount(entry.relatedCharacterIds, candidate.relatedCharacterIds) * 4
            + intersectionCount(entry.relatedHouses, candidate.relatedHouses) * 2
            + intersectionCount(entry.seasons, candidate.seasons) * 0.1
            + (entry.category === candidate.category ? 1 : 0)
        }))
        .filter((candidate) => candidate.score > 0)
        .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
        .slice(0, 4)
        .map((candidate) => candidate.entry);
    }

    function chipsMarkup(items, kind) {
      if (!items.length) return `<p class="lore-drawer__none">No linked records in this edition.</p>`;
      return `<div class="lore-drawer__chips">${items.map((item) => {
        if (kind === "character") {
          return `<a href="#/character/${encodeURIComponent(item)}" data-lore-navigate="#/character/${escapeMarkup(encodeURIComponent(item))}">${escapeMarkup(characterName(item))}</a>`;
        }
        return `<a href="#/house/${encodeURIComponent(item)}" data-lore-navigate="#/house/${escapeMarkup(encodeURIComponent(item))}">House ${escapeMarkup(item)}</a>`;
      }).join("")}</div>`;
    }

    function sourceMarkup(urlValue) {
      const label = sourceLabel(urlValue);
      return `
        <a class="lore-source" href="${escapeMarkup(urlValue)}" target="_blank" rel="noopener noreferrer">
          <span>${escapeMarkup(label.title)}</span>
          <small>${escapeMarkup(label.host)} \u00b7 opens in a new tab</small>
        </a>`;
    }

    function drawerMarkup(entry) {
      const category = categoryFor(entry);
      const related = relatedEntries(entry);
      return `
        <header class="lore-drawer__header">
          <div class="lore-drawer__identity">
            <span class="lore-drawer__icon"><img src="${escapeMarkup(entry.iconAsset)}" alt=""></span>
            <div>
              <p class="lore-library__eyebrow">${escapeMarkup(category.label)}</p>
              <h2 id="${instanceId}-drawer-title">${escapeMarkup(entry.title)}</h2>
            </div>
          </div>
          <button type="button" class="lore-drawer__close" data-lore-close aria-label="Close ${escapeMarkup(entry.title)} dossier">Close</button>
        </header>
        <div class="lore-drawer__scroll">
          <p class="lore-drawer__deck">${escapeMarkup(entry.deck)}</p>
          <div class="lore-drawer__meta">
            <span>${escapeMarkup(rangeLabel(entry.seasons))}</span>
            <span>TV canon</span>
            <span>${entry.sourceUrls.length} ${entry.sourceUrls.length === 1 ? "source" : "sources"}</span>
          </div>
          <div class="lore-drawer__prose">
            ${entry.body.map((paragraph) => `<p>${escapeMarkup(paragraph)}</p>`).join("")}
          </div>
          <section class="lore-drawer__section" aria-labelledby="${instanceId}-people-title">
            <p class="lore-drawer__kicker">People</p>
            <h3 id="${instanceId}-people-title">Lives connected to this lore</h3>
            ${chipsMarkup(entry.relatedCharacterIds, "character")}
          </section>
          <section class="lore-drawer__section" aria-labelledby="${instanceId}-houses-title">
            <p class="lore-drawer__kicker">Allegiances</p>
            <h3 id="${instanceId}-houses-title">Houses & factions</h3>
            ${chipsMarkup(entry.relatedHouses, "house")}
          </section>
          <section class="lore-drawer__section" aria-labelledby="${instanceId}-related-title">
            <p class="lore-drawer__kicker">Follow the thread</p>
            <h3 id="${instanceId}-related-title">Related dossiers</h3>
            <div class="lore-drawer__related">
              ${related.map((candidate) => `
                <button type="button" data-lore-open="${escapeMarkup(candidate.id)}">
                  <img src="${escapeMarkup(candidate.iconAsset)}" alt="">
                  <span><small>${escapeMarkup(categoryFor(candidate).shortLabel)}</small>${escapeMarkup(candidate.title)}</span>
                </button>`).join("")}
            </div>
          </section>
          <section class="lore-drawer__section lore-drawer__section--sources" aria-labelledby="${instanceId}-sources-title">
            <p class="lore-drawer__kicker">Canon trail</p>
            <h3 id="${instanceId}-sources-title">HBO episode guides</h3>
            <p>These links ground the dossier in the television continuity. The library itself never fetches them.</p>
            <div class="lore-drawer__sources">${entry.sourceUrls.map(sourceMarkup).join("")}</div>
          </section>
        </div>`;
    }

    function focusableElements() {
      return Array.from(drawerPanel.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
    }

    function openEntry(entryId, trigger) {
      const entry = entryById.get(entryId);
      if (!entry || state.destroyed) return;
      const wasOpen = Boolean(state.activeEntryId);
      if (!wasOpen) state.returnFocus = trigger || document.activeElement;
      state.activeEntryId = entry.id;
      global.clearTimeout(drawerTimer);
      global.cancelAnimationFrame(openFrame);
      drawerContent.innerHTML = drawerMarkup(entry);
      drawer.hidden = false;
      document.body.classList.add("lore-library-drawer-open");
      openFrame = global.requestAnimationFrame(() => drawer.classList.add("is-open"));
      const closeButton = drawerContent.querySelector("[data-lore-close]");
      if (closeButton) closeButton.focus({ preventScroll: true });
      else drawerPanel.focus({ preventScroll: true });
      if (typeof settings.onEntryChange === "function") settings.onEntryChange(entry);
    }

    function closeDrawer(restoreFocus, immediate) {
      if (!state.activeEntryId && drawer.hidden) return;
      state.activeEntryId = null;
      global.clearTimeout(drawerTimer);
      global.cancelAnimationFrame(openFrame);
      drawer.classList.remove("is-open");
      document.body.classList.remove("lore-library-drawer-open");
      const finish = () => {
        drawer.hidden = true;
        drawerContent.replaceChildren();
      };
      if (immediate || (motionQuery && motionQuery.matches)) finish();
      else drawerTimer = global.setTimeout(finish, 240);
      if (restoreFocus && state.returnFocus && typeof state.returnFocus.focus === "function" && document.contains(state.returnFocus)) {
        state.returnFocus.focus({ preventScroll: true });
      }
      state.returnFocus = null;
      if (typeof settings.onEntryChange === "function") settings.onEntryChange(null);
    }

    function notifyCategoryChange(previousCategory) {
      if (previousCategory === state.category || typeof settings.onCategoryChange !== "function") return;
      settings.onCategoryChange(state.category);
    }

    function resetLibrary() {
      const previousCategory = state.category;
      state.category = "all";
      state.query = "";
      searchInput.value = "";
      renderArchive();
      notifyCategoryChange(previousCategory);
      searchInput.focus();
    }

    root.addEventListener("click", (event) => {
      const categoryButton = event.target.closest("[data-lore-category]");
      if (categoryButton && root.contains(categoryButton)) {
        const previousCategory = state.category;
        state.category = categoryButton.dataset.loreCategory;
        renderArchive();
        notifyCategoryChange(previousCategory);
        return;
      }

      const openButton = event.target.closest("[data-lore-open]");
      if (openButton && root.contains(openButton)) {
        openEntry(openButton.dataset.loreOpen, openButton);
        return;
      }

      const closeButton = event.target.closest("[data-lore-close]");
      if (closeButton && root.contains(closeButton)) {
        closeDrawer(true, false);
        return;
      }

      const navigateLink = event.target.closest("[data-lore-navigate]");
      if (navigateLink && root.contains(navigateLink) && typeof settings.onNavigate === "function") {
        event.preventDefault();
        const target = navigateLink.dataset.loreNavigate;
        closeDrawer(false, true);
        settings.onNavigate(target);
        return;
      }

      if (event.target.closest("[data-lore-clear]")) {
        state.query = "";
        searchInput.value = "";
        renderArchive();
        searchInput.focus();
        return;
      }

      if (event.target.closest("[data-lore-reset]")) resetLibrary();
    }, { signal: abortController.signal });

    searchInput.addEventListener("input", () => {
      state.query = searchInput.value.trim();
      renderArchive();
    }, { signal: abortController.signal });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.query) {
        event.preventDefault();
        state.query = "";
        searchInput.value = "";
        renderArchive();
      }
      if (event.key === "ArrowDown") {
        const firstResult = archiveGrid.querySelector("[data-lore-open]");
        if (firstResult) {
          event.preventDefault();
          firstResult.focus();
        }
      }
    }, { signal: abortController.signal });

    categoryNav.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = Array.from(categoryNav.querySelectorAll("[data-lore-category]"));
      const currentIndex = buttons.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
      buttons[nextIndex].focus();
    }, { signal: abortController.signal });

    document.addEventListener("keydown", (event) => {
      if (!state.activeEntryId) return;
      // A global modal such as Raven Search may open above this drawer. Only
      // the overlay that currently owns focus should consume Escape or Tab.
      if (!drawer.contains(document.activeElement)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer(true, false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements();
      if (!focusable.length) {
        event.preventDefault();
        drawerPanel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }, { signal: abortController.signal });

    renderArchive();

    if (settings.initialEntryId && entryById.has(settings.initialEntryId)) {
      // A deep link has no clicked card to return to. Use the persistent search
      // control instead of the non-focusable mount root so closing the dossier
      // returns keyboard users to a meaningful route control.
      global.requestAnimationFrame(() => openEntry(settings.initialEntryId, searchInput));
    }

    function destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      abortController.abort();
      closeDrawer(false, true);
      global.clearTimeout(drawerTimer);
      global.cancelAnimationFrame(openFrame);
      root.replaceChildren();
      root.classList.remove("lore-library-host");
      mountedRoots.delete(root);
    }

    mountedRoots.set(root, destroy);
    return Object.freeze({ destroy: destroy });
  }

  global.LoreLibrary = Object.freeze({ mount: mount });
})(window);
