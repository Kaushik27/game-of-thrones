// Scroll-driven opening sequence for the Explore route.
// This is intentionally a progressive layer: the existing Realm Journey
// remains the destination, while this controller turns the approach into a
// cinematic chapter instead of a static landing screen.
(function installCinematicRealm(global, document) {
  "use strict";

  const mountedRoots = new WeakMap();
  const scenes = Object.freeze([
    {
      id: "ice",
      eyebrow: "Act I · The cold remembers",
      title: "First, the ice",
      body: "Before crowns, there is a border. Before the war, there is a warning.",
      label: "The cold",
      focus: { name: "Jon Snow", role: "The reluctant heir", image: "assets/actors/jon-snow.jpg", characterId: "jon-snow" },
      quote: { text: "Winter is coming.", speaker: "Eddard Stark", quoteId: "q1" },
      moments: [
        { eyebrow: "Winterfell", title: "The warning", text: "A household hears the first truth of the long night.", href: "#/timeline?season=1&mode=consequences" },
        { eyebrow: "The Wall", title: "The last watch", text: "The edge of the world is not as empty as it looks.", href: "#/map?season=1" },
        { eyebrow: "A bastard's path", title: "The heir in exile", text: "Jon Snow leaves the only home he has known.", href: "#/character/jon-snow" }
      ]
    },
    {
      id: "fire",
      eyebrow: "Act II · Fire wakes",
      title: "Then, the fire",
      body: "Old magic returns to the world, and every promise begins to burn.",
      label: "The fire",
      focus: { name: "Daenerys Targaryen", role: "The breaker of chains", image: "assets/actors/daenerys-targaryen.jpg", characterId: "daenerys-targaryen" },
      quote: { text: "Dracarys.", speaker: "Daenerys Targaryen", quoteId: "q8" },
      moments: [
        { eyebrow: "The Dothraki Sea", title: "A crown in ash", text: "A widow walks into the fire and comes out changed.", href: "#/timeline?season=1&mode=consequences" },
        { eyebrow: "Astapor", title: "The unsullied rise", text: "A queen turns a transaction into a revolution.", href: "#/episode/s03e04" },
        { eyebrow: "The dragon queen", title: "Break the wheel", text: "Liberation and conquest begin to share a shadow.", href: "#/character/daenerys-targaryen" }
      ]
    },
    {
      id: "realm",
      eyebrow: "Act III · The realm remembers",
      title: "A story of power",
      body: "Follow the people, places, and battles that turned a map into a memory.",
      label: "The realm",
      focus: { name: "Tyrion Lannister", role: "The mind behind the throne", image: "assets/actors/tyrion-lannister.jpg", characterId: "tyrion-lannister" },
      quote: { text: "Chaos isn't a pit. Chaos is a ladder.", speaker: "Petyr Baelish", quoteId: "q13" },
      moments: [
        { eyebrow: "King's Landing", title: "The game begins", text: "Every alliance is a door. Every door has a price.", href: "#/timeline?season=1&mode=power" },
        { eyebrow: "The Red Wedding", title: "A feast remembered", text: "One evening redraws the map of Westeros.", href: "#/battles?battle=red-wedding" },
        { eyebrow: "The small council", title: "Words as weapons", text: "The clever survive by seeing the room differently.", href: "#/character/tyrion-lannister" }
      ]
    },
    {
      id: "arrival",
      eyebrow: "Act IV · Enter the living realm",
      title: "The map is waiting",
      body: "Choose a season. Open a chapter. Move through Westeros at your own pace.",
      label: "Enter",
      focus: { name: "Arya Stark", role: "No one. Everyone.", image: "assets/actors/arya-stark.jpg", characterId: "arya-stark" },
      quote: { text: "What do we say to the god of death? Not today.", speaker: "Arya Stark", quoteId: "q10" },
      moments: [
        { eyebrow: "The living archive", title: "73 episodes", text: "Trace every turning point from the first raven to the last crown.", href: "#/timeline" },
        { eyebrow: "The war table", title: "9 battles", text: "See the collisions that changed the fate of the realm.", href: "#/battles" },
        { eyebrow: "The people", title: "196 lives", text: "Open a dossier and follow the ties beneath the story.", href: "#/characters" }
      ]
    }
  ]);

  function datasetQuotes() {
    try { return typeof quotes !== "undefined" && Array.isArray(quotes) ? quotes : []; } catch (error) { return []; }
  }

  function escapeText(value) {
    return String(value == null ? "" : value).replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function createShell(root) {
    root.innerHTML = `
      <section class="cinematic-prologue" id="cinematic-prologue" aria-labelledby="cinematic-prologue-title">
        <div class="cinematic-prologue__stage" data-cinematic-stage data-scene="ice">
          <div class="cinematic-prologue__layers" aria-hidden="true">
            <img class="cinematic-prologue__layer cinematic-prologue__layer--north" src="assets/ui/north-journey-bg.jpg" alt="">
            <img class="cinematic-prologue__layer cinematic-prologue__layer--fire" src="assets/ui/essos-journey-bg.jpg" alt="">
            <img class="cinematic-prologue__layer cinematic-prologue__layer--realm" src="assets/ui/capital-journey-bg.jpg" alt="">
          </div>
          <div class="cinematic-prologue__veil" aria-hidden="true"></div>
          <div class="cinematic-prologue__grain" aria-hidden="true"></div>
          <div class="cinematic-prologue__copy">
            <p class="cinematic-prologue__eyebrow" data-cinematic-eyebrow></p>
            <h1 class="cinematic-prologue__title" id="cinematic-prologue-title" data-cinematic-title></h1>
            <p class="cinematic-prologue__body" data-cinematic-body></p>
            <div class="cinematic-prologue__quote" data-cinematic-quote aria-label="Featured quote">
              <span class="cinematic-prologue__quote-mark" aria-hidden="true">“</span>
              <blockquote data-cinematic-quote-text></blockquote>
              <cite data-cinematic-quote-speaker></cite>
            </div>
            <button class="cinematic-prologue__skip" type="button" data-cinematic-skip>Enter the living realm</button>
          </div>
          <aside class="cinematic-prologue__focus" data-cinematic-focus aria-label="Featured character">
            <div class="cinematic-prologue__focus-image-wrap"><img data-cinematic-focus-image class="cinematic-prologue__focus-image" src="assets/actors/jon-snow.jpg" alt=""></div>
            <div class="cinematic-prologue__focus-copy"><span data-cinematic-focus-role></span><strong data-cinematic-focus-name></strong><a data-cinematic-focus-link href="#/character/jon-snow">Open dossier <span aria-hidden="true">↗</span></a></div>
          </aside>
          <div class="cinematic-prologue__moments" aria-label="Story moments" data-cinematic-moments></div>
          <p class="cinematic-prologue__counter"><span data-cinematic-counter>01</span><i aria-hidden="true"></i>04</p>
          <nav class="cinematic-prologue__chapters" aria-label="Cinematic opening chapters">
            ${scenes.map((scene, index) => `<button type="button" class="cinematic-prologue__chapter" data-cinematic-scene="${scene.id}" aria-current="${index === 0 ? "true" : "false"}"><span>${String(index + 1).padStart(2, "0")}</span>${scene.label}</button>`).join("")}
          </nav>
          <div class="cinematic-prologue__progress" aria-hidden="true"><span data-cinematic-progress></span></div>
          <p class="cinematic-prologue__cue"><img src="assets/icons/compass.svg" alt="">Scroll to travel through the opening</p>
          <p class="cinematic-prologue__status" role="status" aria-live="polite" data-cinematic-status></p>
        </div>
      </section>
      <section class="cinematic-handoff" id="cinematic-realm-destination" aria-labelledby="cinematic-handoff-title">
        <div class="cinematic-handoff__copy">
          <p class="cinematic-handoff__eyebrow">The living realm</p>
          <h2 id="cinematic-handoff-title">Every season leaves a scar.</h2>
          <p>Now step inside the interactive journey. Rotate the terrain, open a marker, and follow the story from the Wall to the Narrow Sea.</p>
        </div>
        <a class="cinematic-handoff__link" href="#realm-journey-root">Open the season journey</a>
      </section>
      <div id="realm-journey-root" class="realm-journey-host cinematic-realm__journey-host">
        <div class="realm-journey-loading" role="status"><img src="assets/icons/compass.svg" alt=""><span>Opening the realm…</span></div>
      </div>
    `;
  }

  function mount(root, options) {
    if (!root || mountedRoots.has(root)) return mountedRoots.get(root) || null;
    const config = options && typeof options === "object" ? options : {};
    const initialSeason = Number.isInteger(config.initialSeason) && config.initialSeason >= 1 && config.initialSeason <= 8
      ? config.initialSeason
      : 6;
    createShell(root);

    const prologue = root.querySelector("#cinematic-prologue");
    const stage = root.querySelector("[data-cinematic-stage]");
    const eyebrow = root.querySelector("[data-cinematic-eyebrow]");
    const title = root.querySelector("[data-cinematic-title]");
    const body = root.querySelector("[data-cinematic-body]");
    const quote = root.querySelector("[data-cinematic-quote]");
    const quoteText = root.querySelector("[data-cinematic-quote-text]");
    const quoteSpeaker = root.querySelector("[data-cinematic-quote-speaker]");
    const focus = root.querySelector("[data-cinematic-focus]");
    const focusImage = root.querySelector("[data-cinematic-focus-image]");
    const focusName = root.querySelector("[data-cinematic-focus-name]");
    const focusRole = root.querySelector("[data-cinematic-focus-role]");
    const focusLink = root.querySelector("[data-cinematic-focus-link]");
    const moments = root.querySelector("[data-cinematic-moments]");
    const counter = root.querySelector("[data-cinematic-counter]");
    const progress = root.querySelector("[data-cinematic-progress]");
    const status = root.querySelector("[data-cinematic-status]");
    const reducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let currentScene = 0;
    let frame = 0;
    let pointerFrame = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let destroyed = false;
    let journeyHandle = null;

    function setScene(index, announce) {
      const nextIndex = clamp(Number(index) || 0, 0, scenes.length - 1);
      if (nextIndex === currentScene && eyebrow.textContent) return;
      currentScene = nextIndex;
      const scene = scenes[currentScene];
      stage.dataset.scene = scene.id;
      eyebrow.textContent = scene.eyebrow;
      title.textContent = scene.title;
      body.textContent = scene.body;
      counter.textContent = String(currentScene + 1).padStart(2, "0");
      focusImage.src = scene.focus.image;
      focusImage.alt = scene.focus.name;
      focusName.textContent = scene.focus.name;
      focusRole.textContent = scene.focus.role;
      focusLink.href = `#/character/${scene.focus.characterId}`;
      const matchingQuote = datasetQuotes().find(item => item.id === scene.quote.quoteId) || scene.quote;
      quoteText.textContent = matchingQuote.text;
      quoteSpeaker.textContent = `— ${scene.quote.speaker}`;
      quote.dataset.quoteId = scene.quote.quoteId;
      moments.innerHTML = scene.moments.map((moment, index) => `<a class="cinematic-prologue__moment" href="${escapeText(moment.href)}" data-cinematic-navigate="${escapeText(moment.href)}"><span class="cinematic-prologue__moment-index">0${index + 1}</span><span class="cinematic-prologue__moment-eyebrow">${escapeText(moment.eyebrow)}</span><strong>${escapeText(moment.title)}</strong><span class="cinematic-prologue__moment-text">${escapeText(moment.text)}</span><span class="cinematic-prologue__moment-arrow" aria-hidden="true">↗</span></a>`).join("");
      root.querySelectorAll("[data-cinematic-scene]").forEach(button => {
        const active = button.dataset.cinematicScene === scene.id;
        button.setAttribute("aria-current", active ? "true" : "false");
      });
      if (announce) status.textContent = `${scene.label} chapter`;
    }

    function update() {
      frame = 0;
      if (destroyed) return;
      const rect = prologue.getBoundingClientRect();
      const runway = Math.max(1, prologue.offsetHeight - global.innerHeight);
      const value = clamp(-rect.top / runway, 0, 1);
      const nextScene = value < 0.24 ? 0 : value < 0.52 ? 1 : value < 0.78 ? 2 : 3;
      setScene(nextScene, false);
      stage.style.setProperty("--cinematic-progress", value.toFixed(4));
      stage.style.setProperty("--ice-opacity", clamp(1 - value * 4.2, 0, 1).toFixed(3));
      stage.style.setProperty("--fire-opacity", clamp((value - 0.18) * 3.2, 0, 0.88).toFixed(3));
      stage.style.setProperty("--realm-opacity", clamp((value - 0.48) * 2.8, 0, 0.78).toFixed(3));
      progress.style.transform = `scaleX(${value})`;
    }

    function scheduleUpdate() {
      if (frame || destroyed) return;
      frame = global.requestAnimationFrame(update);
    }

    function updatePointer() {
      pointerFrame = 0;
      if (destroyed || reducedMotion) return;
      pointerX += (pointerTargetX - pointerX) * 0.08;
      pointerY += (pointerTargetY - pointerY) * 0.08;
      stage.style.setProperty("--pointer-x", pointerX.toFixed(3));
      stage.style.setProperty("--pointer-y", pointerY.toFixed(3));
      if (Math.abs(pointerTargetX - pointerX) > 0.002 || Math.abs(pointerTargetY - pointerY) > 0.002) {
        pointerFrame = global.requestAnimationFrame(updatePointer);
      }
    }

    function handlePointerMove(event) {
      if (reducedMotion || (global.matchMedia && global.matchMedia("(pointer: coarse)").matches)) return;
      const bounds = stage.getBoundingClientRect();
      pointerTargetX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
      pointerTargetY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
      if (!pointerFrame) pointerFrame = global.requestAnimationFrame(updatePointer);
    }

    function scrollToProgress(value) {
      const rect = prologue.getBoundingClientRect();
      const runway = Math.max(1, prologue.offsetHeight - global.innerHeight);
      global.scrollTo({ top: global.scrollY + rect.top + runway * clamp(value, 0, 1), behavior: reducedMotion ? "auto" : "smooth" });
    }

    root.querySelectorAll("[data-cinematic-scene]").forEach((button, index) => {
      button.addEventListener("click", () => scrollToProgress(index / (scenes.length - 1)));
    });
    root.querySelector("[data-cinematic-skip]").addEventListener("click", () => scrollToProgress(1));
    root.addEventListener("click", event => {
      const navigation = event.target.closest("[data-cinematic-navigate]");
      if (!navigation) return;
      const target = navigation.dataset.cinematicNavigate;
      if (typeof config.onNavigate === "function" && target) {
        event.preventDefault();
        config.onNavigate(target);
      }
    });
    root.querySelector(".cinematic-handoff__link").addEventListener("click", event => {
      event.preventDefault();
      root.querySelector("#realm-journey-root").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    });
    global.addEventListener("scroll", scheduleUpdate, { passive: true });
    global.addEventListener("resize", scheduleUpdate, { passive: true });
    stage.addEventListener("pointermove", handlePointerMove, { passive: true });
    stage.addEventListener("pointerleave", () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
      if (!pointerFrame && !reducedMotion) pointerFrame = global.requestAnimationFrame(updatePointer);
    }, { passive: true });
    setScene(0, false);
    update();

    const journeyRoot = root.querySelector("#realm-journey-root");
    if (global.RealmJourney) {
      journeyHandle = global.RealmJourney.mount(journeyRoot, {
        initialSeason,
        onNavigate: config.onNavigate
      });
    } else {
      journeyRoot.innerHTML = `<div class="realm-journey-loading realm-journey-loading--error" role="alert"><span>The road is blocked for now.</span><a href="#/timeline">Open the season archive</a></div>`;
    }

    const handle = {
      destroy() {
        destroyed = true;
        if (frame) global.cancelAnimationFrame(frame);
        if (pointerFrame) global.cancelAnimationFrame(pointerFrame);
        global.removeEventListener("scroll", scheduleUpdate);
        global.removeEventListener("resize", scheduleUpdate);
        stage.removeEventListener("pointermove", handlePointerMove);
        if (journeyHandle) journeyHandle.destroy();
        root.replaceChildren();
        mountedRoots.delete(root);
      },
      scrollToProgress
    };
    mountedRoots.set(root, handle);
    return handle;
  }

  global.CinematicRealm = Object.freeze({ mount });
})(window, document);
