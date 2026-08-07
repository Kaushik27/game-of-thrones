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
      label: "The cold"
    },
    {
      id: "fire",
      eyebrow: "Act II · Fire wakes",
      title: "Then, the fire",
      body: "Old magic returns to the world, and every promise begins to burn.",
      label: "The fire"
    },
    {
      id: "realm",
      eyebrow: "Act III · The realm remembers",
      title: "A story of power",
      body: "Follow the people, places, and battles that turned a map into a memory.",
      label: "The realm"
    },
    {
      id: "arrival",
      eyebrow: "Act IV · Enter the living realm",
      title: "The map is waiting",
      body: "Choose a season. Open a chapter. Move through Westeros at your own pace.",
      label: "Enter"
    }
  ]);

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
            <button class="cinematic-prologue__skip" type="button" data-cinematic-skip>Enter the living realm</button>
          </div>
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
    const progress = root.querySelector("[data-cinematic-progress]");
    const status = root.querySelector("[data-cinematic-status]");
    const reducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let currentScene = 0;
    let frame = 0;
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

    function scrollToProgress(value) {
      const rect = prologue.getBoundingClientRect();
      const runway = Math.max(1, prologue.offsetHeight - global.innerHeight);
      global.scrollTo({ top: global.scrollY + rect.top + runway * clamp(value, 0, 1), behavior: reducedMotion ? "auto" : "smooth" });
    }

    root.querySelectorAll("[data-cinematic-scene]").forEach((button, index) => {
      button.addEventListener("click", () => scrollToProgress(index / (scenes.length - 1)));
    });
    root.querySelector("[data-cinematic-skip]").addEventListener("click", () => scrollToProgress(1));
    root.querySelector(".cinematic-handoff__link").addEventListener("click", event => {
      event.preventDefault();
      root.querySelector("#realm-journey-root").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    });
    global.addEventListener("scroll", scheduleUpdate, { passive: true });
    global.addEventListener("resize", scheduleUpdate, { passive: true });
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
        global.removeEventListener("scroll", scheduleUpdate);
        global.removeEventListener("resize", scheduleUpdate);
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
