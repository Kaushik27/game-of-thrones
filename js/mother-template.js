/*
 * The Raven Wall mother template.
 *
 * This is intentionally a small, dependency-free visual shell. It owns the
 * observatory home composition and the shared lower realm rail while the
 * existing realm modules continue to own their domain interactions.
 */
(function installMotherTemplate(global, document) {
  "use strict";

  const HOUSE_REPRESENTATIVES = Object.freeze({
    Stark: "jon-snow",
    Lannister: "tyrion-lannister",
    Targaryen: "daenerys-targaryen",
    Greyjoy: "theon-greyjoy",
    Tyrell: "margaery-tyrell",
    Tully: "edmure-tully",
    Baratheon: "gendry-baratheon",
    Martell: "doran-martell",
    Arryn: "robin-arryn"
  });

  // The artwork is the visual source of truth. These hotspots line up with
  // the nine medallions baked into every master plate, in rail order.
  const RAIL_POSITIONS = Object.freeze({
    Stark: { x: 13, y: 84, tone: "frost" },
    Lannister: { x: 23, y: 84, tone: "ember" },
    Targaryen: { x: 33, y: 84, tone: "ember" },
    Greyjoy: { x: 43, y: 84, tone: "frost" },
    Tyrell: { x: 53, y: 84, tone: "gold" },
    Tully: { x: 63, y: 84, tone: "frost" },
    Baratheon: { x: 73, y: 84, tone: "gold" },
    Martell: { x: 83, y: 84, tone: "ember" },
    Arryn: { x: 93, y: 84, tone: "frost" }
  });

  const REALM_VISUALS = Object.freeze({
    Stark: "assets/generated/realms/stark-scene-v1.png",
    Lannister: "assets/generated/realms/lannister-scene-v1.png",
    Targaryen: "assets/generated/realms/targaryen-scene-v1.png",
    Baratheon: "assets/generated/realms/baratheon-scene-v1.png",
    Greyjoy: "assets/generated/realms/greyjoy-scene-v1.png",
    Tyrell: "assets/generated/realms/tyrell-scene-v1.png",
    Tully: "assets/generated/realms/tully-scene-v1.png",
    Martell: "assets/generated/realms/martell-scene-v1.png",
    Arryn: "assets/generated/realms/arryn-scene-v1.png"
  });

  function safe(value) {
    return typeof global.escapeHTML === "function"
      ? global.escapeHTML(value == null ? "" : String(value))
      : String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  // CSS custom properties containing url() resolve relative to the stylesheet
  // that consumes them. Resolve realm artwork against the document instead so
  // the same path works from / locally and from the GitHub Pages project base.
  function documentAssetUrl(path) {
    try { return new URL(path, document.baseURI).href; } catch { return path; }
  }

  function houseEntries() {
    const colors = typeof HOUSE_COLORS !== "undefined" ? HOUSE_COLORS : {};
    const info = typeof HOUSE_INFO !== "undefined" ? HOUSE_INFO : {};
    const people = typeof characters !== "undefined" && Array.isArray(characters) ? characters : [];
    return Object.keys(HOUSE_REPRESENTATIVES)
      .filter(house => info[house] && colors[house])
      .map((house, index) => ({
        house,
        info: info[house],
        color: colors[house],
        character: people.find(person => person.id === HOUSE_REPRESENTATIVES[house]) || null,
        visual: REALM_VISUALS[house],
        position: RAIL_POSITIONS[house] || RAIL_POSITIONS.Stark
      }))
      .filter(entry => entry.visual);
  }

  function portraitFor(character) {
    if (!character) return "";
    const originalVisuals = global.MOTHER_VISUALS || {};
    const visual = originalVisuals[character.id]
      || (typeof cinematicVisualFor === "function" ? cinematicVisualFor(character.id) : "");
    if (visual) {
      return `<img src="${safe(visual)}" alt="Original in-world study of ${safe(character.name)}" loading="eager" decoding="async">`;
    }
    if (typeof generativeAvatarSVG === "function") {
      return `<span class="mother-avatar-art" aria-hidden="true">${generativeAvatarSVG(character)}</span>`;
    }
    return "";
  }

  function sigilFor(house, size) {
    const info = typeof HOUSE_INFO !== "undefined" ? HOUSE_INFO[house] : null;
    return typeof sigilSVG === "function" ? sigilSVG(info?.sigil || "none", { size: size || 52 }) : "";
  }

  function heraldryFor(house) {
    const slug = String(house || "").toLowerCase().replace(/[^a-z]+/g, "-");
    const fallback = {
      "Night's Watch": 'assets/generated/heraldry/night-watch.png',
      "Free Folk": 'assets/generated/heraldry/free-folk.png',
      Unaffiliated: 'assets/generated/heraldry/unaffiliated.png'
    };
    const hdHouses = new Set(['Stark', 'Lannister', 'Targaryen', 'Greyjoy', 'Tyrell', 'Tully', 'Baratheon', 'Martell', 'Arryn']);
    const source = hdHouses.has(house)
      ? `assets/generated/heraldry/hd/${slug}.png`
      : (fallback[house] || `assets/generated/heraldry/${slug}.png`);
    return `${source}?v=heraldry-hd-1`;
  }

  function quoteFor(character) {
    const quoteData = typeof quotes !== "undefined" && Array.isArray(quotes) ? quotes : [];
    const match = quoteData.find(quote => quote.characterId === character?.id) || quoteData.find(quote => /shield that guards/i.test(quote.text || ""));
    return match?.text || "The things we do for love.";
  }

  function mountHome(root, options) {
    const entries = houseEntries();
    const initial = entries[0];
    if (!root || !entries.length) return { destroy() {} };
    const active = { entry: initial };
    // Warm every realm plate before the first selection so the hero never
    // flashes, stretches, or appears to load after a house is chosen.
    if (typeof Image === "function") {
      entries.forEach(entry => {
        const preload = new Image();
        preload.decoding = "async";
        preload.src = entry.visual;
        const medallion = new Image();
        medallion.decoding = "async";
        medallion.src = heraldryFor(entry.house);
      });
    }
    root.className = "mother-observatory";
    root.innerHTML = `
      <section class="mother-hero" aria-labelledby="mother-title">
        <div class="mother-hero__ambient" aria-hidden="true"></div>
        <div class="mother-hero__rings" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="mother-hero__portrait" data-mother-portrait><img data-mother-realm-image src="${safe(initial.visual)}" alt="${safe(initial.house)} realm visual" width="1440" height="1024" fetchpriority="high" decoding="async"></div>
        <div class="mother-hero__orbit" aria-label="Choose a house">
          ${entries.map(entry => {
            const dx = entry.position.x - 50;
            const dy = entry.position.y - 50;
            return `<span class="mother-connector mother-connector--${entry.position.tone}" style="--line-length:${Math.hypot(dx, dy)}%;--line-angle:${Math.atan2(dy, dx) * 180 / Math.PI}deg" aria-hidden="true"></span>`;
          }).join("")}
          ${entries.map((entry, index) => `<button type="button" class="mother-orbit-node mother-orbit-node--${entry.position.tone}${index === 0 ? " is-active" : ""}" data-mother-house="${safe(entry.house)}" style="--node-x:${entry.position.x}%;--node-y:${entry.position.y}%;--house-accent:${safe(entry.color)}" aria-pressed="${index === 0}" aria-label="Select House ${safe(entry.house)}"><span class="mother-orbit-node__halo" aria-hidden="true"></span><span class="mother-orbit-node__seal"><img class="mother-orbit-node__heraldry" src="${heraldryFor(entry.house)}" alt="" width="128" height="128" loading="eager" decoding="async"><span class="mother-orbit-node__seal-mark" aria-hidden="true"></span></span><span class="mother-orbit-node__label">${safe(entry.house)}</span><span class="mother-orbit-node__motto">${safe(entry.info.words)}</span></button>`).join("")}
        </div>
        <div class="mother-hero__copy">
          <p class="mother-eyebrow">The Raven Wall · a fan-made realm</p>
          <p class="mother-kicker" data-mother-kicker>The realm observatory</p>
          <h1 id="mother-title" data-mother-title>The North<br><em>remembers.</em></h1>
          <p class="mother-hero__quote" data-mother-quote>“${safe(quoteFor(initial.character))}”</p>
          <p class="mother-hero__summary" data-mother-summary>${safe(initial.character?.bio || "Follow the people, houses, and choices that left a mark on the realm.")}</p>
          <a class="mother-hero__cta" data-mother-cta href="#/house/${safe(initial.house)}"><span>Enter the realm</span><b aria-hidden="true">↗</b></a>
        </div>
        <div class="mother-hero__meta" aria-label="realm facts">
          <span><strong>196</strong> people</span><span><strong>12</strong> banners</span><span><strong>8</strong> seasons</span>
        </div>
      </section>
    `;

    const title = root.querySelector("[data-mother-title]");
    const quote = root.querySelector("[data-mother-quote]");
    const summary = root.querySelector("[data-mother-summary]");
    const kicker = root.querySelector("[data-mother-kicker]");
    const cta = root.querySelector("[data-mother-cta]");
    const portrait = root.querySelector("[data-mother-portrait]");
    const realmImage = root.querySelector("[data-mother-realm-image]");
    root.style.setProperty("--mother-current-wallpaper", `url("${documentAssetUrl(initial.visual)}")`);
    document.body.style.setProperty("--mother-current-wallpaper", `url("${documentAssetUrl(initial.visual)}")`);

    function selectHouse(house) {
      const next = entries.find(entry => entry.house === house) || initial;
      active.entry = next;
      root.querySelectorAll("[data-mother-house]").forEach(button => {
        const selected = button.dataset.motherHouse === next.house;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      portrait.classList.remove("is-arriving");
      void portrait.offsetWidth;
      portrait.classList.add("is-arriving");
      realmImage.src = next.visual;
      root.style.setProperty("--mother-current-wallpaper", `url("${documentAssetUrl(next.visual)}")`);
      document.body.style.setProperty("--mother-current-wallpaper", `url("${documentAssetUrl(next.visual)}")`);
      realmImage.alt = `${next.house} realm visual`;
      kicker.textContent = `${next.house} · ${next.info.region}`;
      title.innerHTML = `${safe(next.house)}<br><em>${safe(next.info.words).replace(/!$/, ".")}</em>`;
      quote.textContent = `“${quoteFor(next.character)}”`;
      summary.textContent = next.character?.bio || `${next.info.seat} · ${next.info.rulerEnd}`;
      cta.href = `#/house/${encodeURIComponent(next.house)}`;
      cta.querySelector("span").textContent = "Enter the realm";
      if (typeof recordEngagement === "function") recordEngagement("mother_house_select", { house: next.house });
    }

    const onClick = event => {
      const button = event.target.closest("[data-mother-house]");
      if (button) return selectHouse(button.dataset.motherHouse);
      const stepButton = event.target.closest("[data-mother-step]");
      if (stepButton) {
        const index = entries.indexOf(active.entry);
        const step = Number(stepButton.dataset.motherStep) || 1;
        selectHouse(entries[(index + step + entries.length) % entries.length].house);
      }
    };
    root.addEventListener("click", onClick);
    root.querySelectorAll("[data-mother-house]").forEach(button => button.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const buttons = Array.from(root.querySelectorAll("[data-mother-house]"));
      const index = buttons.indexOf(button);
      const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      buttons[(index + delta + buttons.length) % buttons.length].focus();
    }));
    return { destroy() { root.removeEventListener("click", onClick); } };
  }

  function installRail() {
    const footer = document.getElementById("site-footer");
    if (!footer || footer.querySelector(".mother-rail")) return;
    footer.insertAdjacentHTML("afterbegin", `
      <div class="mother-rail" aria-label="realm shortcuts">
        <a class="mother-rail__brand" href="#/" aria-label="Return to the Realm Observatory"><span class="mother-rail__raven">${sigilFor("Arryn", 22)}</span><span><b>The Raven Wall</b><small>fan-made realm</small></span></a>
        <div class="mother-rail__links">
          <a href="#/houses">Houses</a><a href="#/characters">People</a><a href="#/quotes">Voices</a><a href="#/map">Maps</a><a href="#/lore">Lore</a>
        </div>
        <a class="mother-rail__arrow" href="#/quotes" aria-label="Open Voices">↗</a>
      </div>`);
  }

  global.MOTHER_VISUALS = Object.freeze({
    "jon-snow": "assets/generated/northern-guardian-wide.png",
    "tyrion-lannister": "assets/generated/tyrion-lannister-wide.png",
    "daenerys-targaryen": "assets/generated/targaryen-realm-wide-v2.png",
    "theon-greyjoy": "assets/generated/greyjoy-realm-wide-v2.png",
    "gendry-baratheon": "assets/generated/baratheon-realm-wide-v2.png",
    "margaery-tyrell": "assets/generated/tyrell-realm-wide-v2.png"
  });
  global.MotherTemplate = Object.freeze({ mountHome, installRail, houseEntries, heraldryFor });
})(window, document);
