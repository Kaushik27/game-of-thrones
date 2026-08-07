// The fan-owned replacement for the old Stories landing route.
(function installRavenWall(global, document) {
  "use strict";

  const instances = new WeakMap();

  function escape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function mount(root, options) {
    if (!root || instances.has(root)) return instances.get(root) || null;
    const moments = Array.isArray(global.FAN_MOMENTS) ? global.FAN_MOMENTS.slice() : [];
    let quoteDataset = [];
    try { quoteDataset = typeof quotes !== "undefined" && Array.isArray(quotes) ? quotes : []; } catch (error) { quoteDataset = []; }
    const config = options && typeof options === "object" ? options : {};
    if (!moments.length) throw new Error("RavenWall requires FAN_MOMENTS.");

    let currentIndex = Math.max(0, Math.min(moments.length - 1, Number(config.initialIndex) || 0));
    let activeTag = "all";
    let remembered = new Set();
    try { remembered = new Set(JSON.parse(global.localStorage.getItem("got-fan-memories") || "[]")); } catch (error) { /* optional */ }

    const momentQuote = moment => quoteDataset.find(quote => quote.id === moment.quoteId);
    const speaker = moment => {
      const quote = momentQuote(moment);
      try {
        const character = quote && typeof global.getCharacter === "function" ? global.getCharacter(quote.characterId) : null;
        return character ? character.name : "The realm";
      } catch (error) { return "The realm"; }
    };
    const visibleMoments = () => activeTag === "all" ? moments : moments.filter(moment => moment.tags.includes(activeTag));
    const selectedMoment = () => visibleMoments()[currentIndex % Math.max(1, visibleMoments().length)] || moments[0];

    root.className = "raven-wall-host";
    root.innerHTML = `<main class="raven-wall" aria-labelledby="raven-wall-title">
      <div class="raven-wall__texture" aria-hidden="true"></div>
      <header class="raven-wall__masthead">
        <div><p class="raven-wall__brand">The Raven Wall</p><span>A fan archive · not an official guide</span></div>
        <nav class="raven-wall__nav" aria-label="Memory Wall navigation"><a href="#/timeline" aria-current="page">Wall</a><a href="#/quotes">Voices</a><a href="#/characters">People</a><a href="#/map">World</a><a href="#/lore">Lore</a></nav>
        <p class="raven-wall__date">A wall of scenes we carried home</p>
        <button class="raven-wall__raven" type="button" data-rw-surprise aria-label="Let the raven choose a memory"><img src="assets/icons/compass.svg" alt=""></button>
      </header>
      <section class="raven-wall__intro" aria-labelledby="raven-wall-title">
        <p class="raven-wall__eyebrow">Fan edit · fragments worth keeping</p>
        <h1 id="raven-wall-title">Not the story.<br><em>What it left behind.</em></h1>
        <p class="raven-wall__intro-copy">A wall for the lines, choices, and images fans return to long after the episode has ended.</p>
      </section>
      <nav class="raven-wall__filters" aria-label="Memory moods" data-rw-filters></nav>
      <section class="raven-wall__board" aria-live="polite">
        <div class="raven-wall__scraps raven-wall__scraps--left" data-rw-scraps-left></div>
        <article class="raven-wall__note" data-rw-note tabindex="-1">
          <div class="raven-wall__pin" aria-hidden="true"></div>
          <p class="raven-wall__note-kicker" data-rw-kicker></p>
          <h2 data-rw-title></h2>
          <p class="raven-wall__location" data-rw-location></p>
          <blockquote><span aria-hidden="true">“</span><p data-rw-line></p><cite data-rw-speaker></cite></blockquote>
          <div class="raven-wall__actions"><button class="raven-wall__remember" type="button" data-rw-remember></button><a class="raven-wall__scene" data-rw-scene href="#/quotes">Explore the scene <span aria-hidden="true">↗</span></a></div>
          <p class="raven-wall__status" data-rw-status role="status" aria-live="polite"></p>
        </article>
        <div class="raven-wall__scraps raven-wall__scraps--right" data-rw-scraps-right></div>
      </section>
      <section class="raven-wall__annotation" aria-label="Fan annotation">
        <div><span class="raven-wall__annotation-label">Why it stayed</span><p data-rw-note-copy></p></div>
        <div><span class="raven-wall__annotation-label">What changed</span><p data-rw-consequence></p></div>
      </section>
      <footer class="raven-wall__footer"><span data-rw-count></span><div><a href="#/quotes">Read every voice</a><a href="#/timeline?atlas=1">Open the episode atlas</a></div></footer>
    </main>`;

    const note = root.querySelector("[data-rw-note]");
    const filters = root.querySelector("[data-rw-filters]");
    const tags = ["all", ...new Set(moments.flatMap(moment => moment.tags).slice(0, 6))];
    filters.innerHTML = tags.map(tag => `<button type="button" data-rw-tag="${escape(tag)}" aria-pressed="${String(tag === activeTag)}">${escape(tag === "all" ? "All fragments" : tag.replace(/-/g, " "))}</button>`).join("");

    function render(announce) {
      const list = visibleMoments();
      if (!list.length) return;
      currentIndex = currentIndex % list.length;
      const moment = list[currentIndex];
      const quote = momentQuote(moment);
      const rememberedNow = remembered.has(moment.id);
      root.dataset.moment = moment.id;
      root.style.setProperty("--rw-image", `url('${moment.image}')`);
      root.querySelector("[data-rw-kicker]").textContent = moment.kicker;
      root.querySelector("[data-rw-title]").textContent = moment.title;
      root.querySelector("[data-rw-location]").textContent = `${moment.location} · ${moment.episodeId.toUpperCase()}`;
      root.querySelector("[data-rw-line]").textContent = moment.line;
      root.querySelector("[data-rw-speaker]").textContent = `— ${speaker(moment)}`;
      root.querySelector("[data-rw-note-copy]").textContent = moment.fanNote;
      root.querySelector("[data-rw-consequence]").textContent = moment.consequence;
      root.querySelector("[data-rw-count]").textContent = `${currentIndex + 1} of ${list.length} fragments · ${remembered.size} remembered`;
      root.querySelector("[data-rw-remember]").textContent = rememberedNow ? "Kept in my wall" : "Add this to my memory";
      root.querySelector("[data-rw-remember]").setAttribute("aria-pressed", String(rememberedNow));
      root.querySelector("[data-rw-scene]").href = `#/quotes?quote=${encodeURIComponent(moment.quoteId)}`;
      root.querySelector("[data-rw-status]").textContent = announce || "";
      filters.querySelectorAll("[data-rw-tag]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.rwTag === activeTag)));
      const left = list[(currentIndex - 1 + list.length) % list.length];
      const right = list[(currentIndex + 1) % list.length];
      root.querySelector("[data-rw-scraps-left]").innerHTML = scrapMarkup(left, "previous");
      root.querySelector("[data-rw-scraps-right]").innerHTML = scrapMarkup(right, "next");
    }

    function scrapMarkup(moment, direction) {
      return `<button class="raven-wall__scrap raven-wall__scrap--${direction}" type="button" data-rw-open="${escape(moment.id)}" style="--scrap-image:url('../${escape(moment.image)}')"><span>${escape(moment.kicker)}</span><strong>${escape(moment.title)}</strong><small>${escape(moment.location)}</small></button>`;
    }

    function move(delta) {
      const list = visibleMoments();
      currentIndex = (currentIndex + delta + list.length) % list.length;
      render("The wall turned to another memory.");
      note.focus({ preventScroll: true });
    }

    root.addEventListener("click", event => {
      const tag = event.target.closest("[data-rw-tag]");
      if (tag) { activeTag = tag.dataset.rwTag; currentIndex = 0; render("The wall changed its mood."); return; }
      const scrap = event.target.closest("[data-rw-open]");
      if (scrap) { const index = visibleMoments().findIndex(moment => moment.id === scrap.dataset.rwOpen); if (index >= 0) { currentIndex = index; render("Memory opened."); note.focus({ preventScroll: true }); } return; }
      if (event.target.closest("[data-rw-surprise]")) { currentIndex = Math.floor(Math.random() * visibleMoments().length); render("A raven chose this fragment."); note.focus({ preventScroll: true }); return; }
      if (event.target.closest("[data-rw-remember]")) {
        const moment = selectedMoment();
        if (remembered.has(moment.id)) remembered.delete(moment.id); else remembered.add(moment.id);
        try { global.localStorage.setItem("got-fan-memories", JSON.stringify([...remembered])); } catch (error) { /* optional */ }
        render(remembered.has(moment.id) ? "Kept. The wall remembers with you." : "Removed from your wall.");
      }
    });
    root.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    });
    render();

    const handle = { destroy() { instances.delete(root); root.replaceChildren(); } };
    instances.set(root, handle);
    return handle;
  }

  global.RavenWall = Object.freeze({ mount });
})(window, document);
