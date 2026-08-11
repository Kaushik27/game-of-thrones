/* ========================================================================== 
   The Realm Chronicle — a fan-made, interactive timeline of the long story
   ========================================================================== */
(function exposeRealmChronicleModule(global) {
  "use strict";

  const ICONS = Object.freeze({
    compass: "assets/icons/compass.svg",
    battle: "assets/icons/swords.svg",
    crown: "assets/icons/castle.svg",
    fire: "assets/icons/play.svg",
    snow: "assets/icons/snowflake.svg"
  });
  const FILTERS = Object.freeze([
    { id: "all", label: "All eras" },
    { id: "dawn", label: "The dawn" },
    { id: "dragon", label: "The dragons" },
    { id: "crown", label: "The crowns" },
    { id: "war", label: "The wars" },
    { id: "betrayal", label: "The betrayals" },
    { id: "fire", label: "The fires" }
  ]);

  function safeArray(value) { return Array.isArray(value) ? value : []; }
  function clean(value, fallback) {
    const result = String(value == null ? "" : value).trim();
    return result || fallback || "";
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function chronicleRecords(options) {
    const configured = options && Array.isArray(options.records) ? options.records : null;
    if (configured) return configured.filter(record => record && record.id && record.title);
    return Array.isArray(global.REALM_CHRONICLE) ? global.REALM_CHRONICLE : [];
  }
  function iconFor(record) {
    if (record.type === "dawn") return ICONS.snow;
    if (record.type === "dragon" || record.type === "fire") return ICONS.fire;
    if (record.type === "crown") return ICONS.crown;
    return ICONS.battle;
  }

  function mount(root, options) {
    if (!root || root.nodeType !== 1) throw new TypeError("RealmChronicle.mount requires a root element.");
    const config = options && typeof options === "object" ? options : {};
    const records = chronicleRecords(config);
    if (!records.length) {
      root.innerHTML = `<section class="realm-chronicle realm-chronicle--empty" role="alert"><img src="${ICONS.compass}" alt=""><p>Chronicle unavailable</p><h1>The old records are missing.</h1></section>`;
      return Object.freeze({ destroy() { root.replaceChildren(); } });
    }

    const recordById = new Map(records.map(record => [String(record.id), record]));
    const listeners = [];
    const reducedMotion = typeof global.matchMedia === "function" && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let revealObserver = null;
    let readingObserver = null;
    let state = {
      filter: "all",
      selectedId: clean(config.initialEntryId, records[0].id)
    };
    if (!recordById.has(state.selectedId)) state.selectedId = records[0].id;

    function listen(target, type, handler, listenerOptions) {
      target.addEventListener(type, handler, listenerOptions);
      listeners.push(() => target.removeEventListener(type, handler, listenerOptions));
    }
    function visibleRecords() {
      const spoilerVisible = global.RealmCompass ? records.filter(record => global.RealmCompass.isVisible(record)) : records;
      return state.filter === "all" ? spoilerVisible : spoilerVisible.filter(record => record.type === state.filter);
    }
    function currentRecord() {
      return recordById.get(state.selectedId) || records[0];
    }
    function updateHash(record) {
      if (!record || !global.history || !global.location) return;
      const nextHash = `#/chronicle?entry=${encodeURIComponent(record.id)}`;
      if (global.location.hash !== nextHash && typeof global.history.replaceState === "function") {
        global.history.replaceState(global.history.state, "", nextHash);
      }
    }
    function navigate(hash) {
      if (!hash) return;
      if (typeof config.onNavigate === "function") config.onNavigate(hash);
      else global.location.hash = hash;
    }
    function entryButton(id) {
      return [...root.querySelectorAll("[data-chronicle-entry]")]
        .find(button => button.dataset.chronicleEntry === String(id));
    }
    function cardHTML(record, index) {
      const selected = record.id === state.selectedId;
      const imageStyle = `--chronicle-image:url('../${escapeHTML(record.image)}');--chronicle-position:${escapeHTML(record.imagePosition || "center")}`;
      return `
        <li class="realm-chronicle__item${selected ? " is-selected" : ""}" data-chronicle-item="${escapeHTML(record.id)}">
          <span class="realm-chronicle__node" aria-hidden="true"><span>${String(index + 1).padStart(2, "0")}</span></span>
          <button class="realm-chronicle__card" type="button" data-chronicle-entry="${escapeHTML(record.id)}" aria-pressed="${selected}" aria-label="Open ${escapeHTML(record.title)}">
            <span class="realm-chronicle__card-media" style="${imageStyle}" aria-hidden="true"></span>
            <span class="realm-chronicle__card-veil" aria-hidden="true"></span>
            <span class="realm-chronicle__card-copy">
              <span class="realm-chronicle__period">${escapeHTML(record.period)} <span class="archive-badge archive-badge--fan">Fan chronology</span></span>
              <strong>${escapeHTML(record.title)}</strong>
              <span class="realm-chronicle__marker">${escapeHTML(record.marker)}</span>
              <span class="realm-chronicle__bullets">${safeArray(record.bullets).map(bullet => `<span><img src="${iconFor(record)}" alt="">${escapeHTML(bullet)}</span>`).join("")}</span>
              <span class="realm-chronicle__card-cta" aria-hidden="true">Open moment <span>↗</span></span>
            </span>
            <span class="realm-chronicle__card-index">${String(index + 1).padStart(2, "0")}</span>
          </button>
        </li>`;
    }
    function dustHTML() {
      return Array.from({ length: 18 }, (_, index) => {
        const x = (index * 47) % 100;
        const y = (index * 31) % 100;
        const delay = (index % 6) * 1.4;
        const duration = 10 + (index % 5) * 2;
        return `<i style="--dust-x:${x}%;--dust-y:${y}%;--dust-delay:${delay}s;--dust-duration:${duration}s" aria-hidden="true"></i>`;
      }).join("");
    }
    function detailHTML(record) {
      return `
        <aside class="realm-chronicle__detail" aria-live="polite" aria-labelledby="chronicle-detail-title">
          <div class="realm-chronicle__detail-top"><span>${escapeHTML(record.era)}</span><span>${escapeHTML(record.period)} <span class="archive-badge archive-badge--fan">Fan chronology</span></span></div>
          <p class="realm-chronicle__detail-kicker">${escapeHTML(record.marker)}</p>
          <h2 id="chronicle-detail-title">${escapeHTML(record.title)}</h2>
          <p class="realm-chronicle__detail-summary">${escapeHTML(record.summary)}</p>
          <ul>${safeArray(record.bullets).map(bullet => `<li><img src="${iconFor(record)}" alt=""><span>${escapeHTML(bullet)}</span></li>`).join("")}</ul>
          <div class="realm-chronicle__detail-actions">
            <button type="button" class="realm-chronicle__random" data-chronicle-random>Surprise me <span aria-hidden="true">↗</span></button>
            <button type="button" class="realm-chronicle__follow" data-chronicle-follow="${escapeHTML(record.route || "")}" ${record.route ? "" : "disabled"}>Follow this thread <span aria-hidden="true">↗</span></button>
          </div>
          <p class="realm-chronicle__detail-note">Fan chronology · dates are approximate where canon leaves room for debate.</p>
        </aside>`;
    }
    function render() {
      const visible = visibleRecords();
      if (!visible.some(record => record.id === state.selectedId)) state.selectedId = visible[0] ? visible[0].id : records[0].id;
      const selected = currentRecord();
      root.innerHTML = `
        <section class="realm-chronicle${reducedMotion ? " realm-chronicle--reduced-motion" : ""}" aria-labelledby="chronicle-title">
          <header class="realm-chronicle__hero">
            <span class="realm-chronicle__hero-art" aria-hidden="true"></span>
            <span class="realm-chronicle__grain" aria-hidden="true"></span>
            <span class="realm-chronicle__dust" aria-hidden="true">${dustHTML()}</span>
            <div class="realm-chronicle__hero-copy">
              <p class="realm-chronicle__eyebrow">A fan-made chronology · before and beyond the episodes</p>
              <h1 id="chronicle-title">The Realm<br><em>remembers.</em></h1>
              <p class="realm-chronicle__dek">A living timeline of the fires, promises, and betrayals that made Westeros feel older than any one king.</p>
            </div>
            <div class="realm-chronicle__hero-mark" aria-hidden="true"><span>AC</span><strong>01</strong><small>the first<br>page</small></div>
            <dl class="realm-chronicle__facts" aria-label="Chronicle summary"><div><dt>${records.length}</dt><dd>kept moments</dd></div><div><dt>8k+</dt><dd>years of memory</dd></div><div><dt>1</dt><dd>realm in pieces</dd></div></dl>
          </header>
          <div class="realm-chronicle__toolbar" aria-label="Chronicle filters">
            <div class="realm-chronicle__toolbar-label"><span>Read the long story</span><small data-chronicle-reading>Chapter ${String(Math.max(1, visible.findIndex(record => record.id === selected.id) + 1)).padStart(2, "0")} of ${records.length} · Scroll to travel</small></div>
            <div class="realm-chronicle__filters" role="group" aria-label="Chronicle eras">${FILTERS.map(filter => `<button type="button" data-chronicle-filter="${filter.id}" aria-pressed="${filter.id === state.filter}">${escapeHTML(filter.label)}</button>`).join("")}</div>
          </div>
          <div class="realm-chronicle__body">
            <div class="realm-chronicle__timeline-wrap">
              <div class="realm-chronicle__timeline-intro"><span>01 — 15</span><p>Moments fans carry<br><em>long after the credits.</em></p></div>
              <ol class="realm-chronicle__timeline" aria-label="Chronological moments" style="--chronicle-progress:0%">${visible.map((record, index) => cardHTML(record, index)).join("")}</ol>
            </div>
            ${detailHTML(selected)}
          </div>
          <footer class="realm-chronicle__footer"><span>Not an official guide · built for the moments we refuse to forget</span><button type="button" data-chronicle-top>Return to the beginning <span aria-hidden="true">↑</span></button></footer>
        </section>`;
      observeTimeline();
      updateHash(selected);
    }
    function updateProgress() {
      const timeline = root.querySelector(".realm-chronicle__timeline");
      if (!timeline || !global.innerHeight) return;
      const bounds = timeline.getBoundingClientRect();
      const start = global.innerHeight * .52;
      const progress = Math.max(0, Math.min(1, (start - bounds.top) / Math.max(bounds.height, 1)));
      timeline.style.setProperty("--chronicle-progress", `${(progress * 100).toFixed(2)}%`);
    }
    function observeTimeline() {
      if (revealObserver) revealObserver.disconnect();
      if (readingObserver) readingObserver.disconnect();
      const items = [...root.querySelectorAll(".realm-chronicle__item")];
      const timeline = root.querySelector(".realm-chronicle__timeline");
      if (!items.length || !timeline) return;
      if (typeof global.IntersectionObserver !== "function" || reducedMotion) {
        items.forEach(item => item.classList.add("is-inview", "is-reading"));
        updateProgress();
        return;
      }
      revealObserver = new global.IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle("is-inview", entry.isIntersecting));
      }, { threshold: .18, rootMargin: "0px 0px -8% 0px" });
      readingObserver = new global.IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          items.forEach(item => item.classList.toggle("is-reading", item === entry.target));
          const index = items.indexOf(entry.target);
          const status = root.querySelector("[data-chronicle-reading]");
          if (status && index >= 0) status.textContent = `Chapter ${String(index + 1).padStart(2, "0")} of ${records.length} · ${entry.target.querySelector(".realm-chronicle__period")?.textContent || "the realm"}`;
        });
      }, { threshold: .52, rootMargin: "-18% 0px -42% 0px" });
      items.forEach(item => { revealObserver.observe(item); readingObserver.observe(item); });
      updateProgress();
    }
    function onPointerMove(event) {
      const hero = root.querySelector(".realm-chronicle__hero");
      if (!hero || reducedMotion) return;
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - .5) * 10;
      const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - .5) * 7;
      hero.style.setProperty("--chronicle-pointer-x", `${x.toFixed(2)}px`);
      hero.style.setProperty("--chronicle-pointer-y", `${y.toFixed(2)}px`);
    }
    function onPointerLeave() {
      const hero = root.querySelector(".realm-chronicle__hero");
      if (!hero) return;
      hero.style.setProperty("--chronicle-pointer-x", "0px");
      hero.style.setProperty("--chronicle-pointer-y", "0px");
    }
    function choose(id, focusCard) {
      if (!recordById.has(id)) return;
      state.selectedId = id;
      render();
      const card = entryButton(id);
      if (card) {
        card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
        if (focusCard) card.focus({ preventScroll: true });
      }
    }
    function randomRecord() {
      const pool = visibleRecords().filter(record => record.id !== state.selectedId);
      const next = pool[Math.floor(Math.random() * Math.max(pool.length, 1))] || currentRecord();
      choose(next.id, true);
    }
    function onClick(event) {
      const entry = event.target.closest("[data-chronicle-entry]");
      if (entry && root.contains(entry)) { choose(entry.dataset.chronicleEntry, false); return; }
      const filter = event.target.closest("[data-chronicle-filter]");
      if (filter && root.contains(filter)) {
        state.filter = FILTERS.some(item => item.id === filter.dataset.chronicleFilter) ? filter.dataset.chronicleFilter : "all";
        render();
        return;
      }
      if (event.target.closest("[data-chronicle-random]")) { randomRecord(); return; }
      const follow = event.target.closest("[data-chronicle-follow]");
      if (follow && follow.dataset.chronicleFollow) { navigate(follow.dataset.chronicleFollow); return; }
      if (event.target.closest("[data-chronicle-top]")) root.querySelector(".realm-chronicle__hero")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
    function onKeyDown(event) {
      const current = event.target.closest("[data-chronicle-entry]");
      if (!current || !root.contains(current)) return;
      const buttons = [...root.querySelectorAll("[data-chronicle-entry]")];
      const index = buttons.indexOf(current);
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      const next = buttons[Math.max(0, Math.min(buttons.length - 1, index + direction))];
      if (next) choose(next.dataset.chronicleEntry, true);
    }
    document.body.classList.add("chronicle-route");
    listen(root, "click", onClick);
    listen(root, "keydown", onKeyDown);
    listen(root, "pointermove", onPointerMove, { passive: true });
    listen(root, "pointerleave", onPointerLeave, { passive: true });
    listen(global, "scroll", updateProgress, { passive: true });
    render();
    return Object.freeze({
      setFilter(filter) { state.filter = FILTERS.some(item => item.id === filter) ? filter : "all"; render(); },
      destroy() { if (revealObserver) revealObserver.disconnect(); if (readingObserver) readingObserver.disconnect(); listeners.splice(0).forEach(remove => remove()); document.body.classList.remove("chronicle-route"); root.replaceChildren(); }
    });
  }

  global.RealmChronicle = Object.freeze({ mount });
})(window);
