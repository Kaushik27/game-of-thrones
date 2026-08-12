// Cross-route fan controls: one spoiler lens, one daily raven, and one place
// for the realm to publish the user's current reading/watching boundary.
(function installRealmCompass(global, document) {
  "use strict";

  const STORAGE_KEY = "got-spoiler-lens";
  const OPTIONS = Object.freeze([
    { value: "all", label: "Full realm", season: 8 },
    { value: "1", label: "Through season 1", season: 1 },
    { value: "2", label: "Through season 2", season: 2 },
    { value: "3", label: "Through season 3", season: 3 },
    { value: "4", label: "Through season 4", season: 4 },
    { value: "5", label: "Through season 5", season: 5 },
    { value: "6", label: "Through season 6", season: 6 },
    { value: "7", label: "Through season 7", season: 7 }
  ]);
  let current = "all";
  const listeners = new Set();

  function read() {
    try {
      const value = global.localStorage.getItem(STORAGE_KEY);
      if (OPTIONS.some(option => option.value === value)) return value;
    } catch (_) { /* private browsing is fine */ }
    return "all";
  }

  function announce() {
    const option = OPTIONS.find(item => item.value === current) || OPTIONS[0];
    document.documentElement.dataset.spoilerLens = current;
    document.documentElement.dataset.spoilerSeason = String(option.season);
    global.dispatchEvent(new CustomEvent("got:spoiler-lens", { detail: { ...option, value: current } }));
    listeners.forEach(listener => listener(current, option));
  }

  function set(value, options) {
    const next = OPTIONS.some(option => option.value === String(value)) ? String(value) : "all";
    if (next === current && !(options && options.force)) return current;
    current = next;
    try { global.localStorage.setItem(STORAGE_KEY, current); } catch (_) { /* optional */ }
    announce();
    return current;
  }

  function season() {
    return (OPTIONS.find(option => option.value === current) || OPTIONS[0]).season;
  }

  function isVisible(record) {
    if (!record || record.season == null) return true;
    return Number(record.season) <= season();
  }

  function navHTML() {
    return `<label class="realm-lens" title="Hide spoilers beyond your current season"><img class="realm-lens__glyph" src="assets/icons/snowflake.svg" alt=""><span class="realm-lens__label">Spoiler lens</span><select data-realm-lens aria-label="Spoiler lens">${OPTIONS.map(option => `<option value="${option.value}"${option.value === current ? " selected" : ""}>${option.label}</option>`).join("")}</select></label>`;
  }

  function bind(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-realm-lens]").forEach(select => {
      if (select.dataset.realmLensBound) return;
      select.dataset.realmLensBound = "true";
      select.value = current;
      select.addEventListener("change", event => set(event.target.value));
    });
  }

  function randomDestination() {
    const candidates = [];
    try {
      if (Array.isArray(global.FAN_MOMENTS)) global.FAN_MOMENTS.forEach(item => candidates.push(`#/timeline?memory=${encodeURIComponent(item.id)}`));
      if (typeof quotes !== "undefined" && Array.isArray(quotes)) quotes.filter(isVisible).forEach(item => candidates.push(`#/quotes?quote=${encodeURIComponent(item.id)}`));
      if (typeof characters !== "undefined" && Array.isArray(characters)) characters.forEach(item => candidates.push(`#/character/${encodeURIComponent(item.id)}`));
    } catch (_) { /* optional datasets */ }
    if (!candidates.length) return "#/quotes";
    const seed = new Date().getUTCFullYear() * 372 + (new Date().getUTCMonth() + 1) * 31 + new Date().getUTCDate();
    return candidates[seed % candidates.length];
  }

  current = read();
  announce();
  global.RealmCompass = Object.freeze({
    options: OPTIONS,
    current: () => current,
    season,
    set,
    isVisible,
    navHTML,
    bind,
    randomDestination,
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      listener(current, OPTIONS.find(option => option.value === current) || OPTIONS[0]);
      return () => listeners.delete(listener);
    }
  });
})(window, document);
