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
    Baratheon: "gendry-baratheon",
    Greyjoy: "theon-greyjoy",
    Tyrell: "margaery-tyrell",
    Martell: "doran-martell",
    Tully: "edmure-tully",
    Arryn: "robin-arryn"
  });

  const ORBIT_POSITIONS = [
    { x: 14, y: 23, tone: "frost" }, { x: 86, y: 23, tone: "ember" },
    { x: 10, y: 53, tone: "gold" }, { x: 90, y: 53, tone: "gold" },
    { x: 17, y: 83, tone: "ember" }, { x: 83, y: 83, tone: "frost" },
    { x: 34, y: 91, tone: "gold" }, { x: 66, y: 91, tone: "ember" },
    { x: 50, y: 12, tone: "frost" }
  ];

  const REALM_VISUALS = Object.freeze({
    Stark: "assets/generated/realms/stark.png",
    Lannister: "assets/generated/realms/lannister.png",
    Targaryen: "assets/generated/realms/targaryen.png",
    Baratheon: "assets/generated/realms/baratheon.png",
    Greyjoy: "assets/generated/realms/greyjoy.png",
    Tyrell: "assets/generated/realms/tyrell.png",
    Tully: "assets/generated/realms/tully.png",
    Martell: "assets/generated/realms/martell.png",
    Arryn: "assets/generated/realms/arryn.png"
  });

  function safe(value) {
    return typeof global.escapeHTML === "function"
      ? global.escapeHTML(value == null ? "" : String(value))
      : String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
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
        position: ORBIT_POSITIONS[index] || ORBIT_POSITIONS[0]
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
    root.className = "mother-observatory";
    root.innerHTML = `
      <section class="mother-hero" aria-labelledby="mother-title">
        <div class="mother-hero__ambient" aria-hidden="true"></div>
        <div class="mother-hero__rings" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="mother-hero__portrait" data-mother-portrait><img data-mother-realm-image src="${safe(initial.visual)}" alt="${safe(initial.house)} realm visual" width="1440" height="1024" fetchpriority="high" decoding="async"></div>
        <nav class="mother-realm-rail" aria-label="Choose a realm">
          <span class="mother-realm-rail__label">Choose a realm</span>
          <div class="mother-realm-rail__items">
            ${entries.map((entry, index) => `<button type="button" class="mother-realm-rail__item${index === 0 ? " is-active" : ""}" data-mother-house="${safe(entry.house)}" aria-pressed="${index === 0}" style="--house-accent:${safe(entry.color)}"><span class="mother-realm-rail__sigil">${sigilFor(entry.house, 22)}</span><span>${safe(entry.house)}</span></button>`).join("")}
          </div>
        </nav>
        <div class="mother-hero__copy">
          <p class="mother-eyebrow">The Raven Wall · a fan-made realm</p>
          <p class="mother-kicker" data-mother-kicker>The realm observatory</p>
          <h1 id="mother-title" data-mother-title>The North<br><em>remembers.</em></h1>
          <p class="mother-hero__quote" data-mother-quote>“${safe(quoteFor(initial.character))}”</p>
          <p class="mother-hero__summary" data-mother-summary>${safe(initial.character?.bio || "Follow the people, houses, and choices that left a mark on the realm.")}</p>
          <a class="mother-hero__cta" data-mother-cta href="#/character/${safe(initial.character?.id || "jon-snow")}"><span>Open the realm</span><b aria-hidden="true">↗</b></a>
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
      realmImage.alt = `${next.house} realm visual`;
      kicker.textContent = `${next.house} · ${next.info.region}`;
      title.innerHTML = `${safe(next.house)}<br><em>${safe(next.info.words).replace(/!$/, ".")}</em>`;
      quote.textContent = `“${quoteFor(next.character)}”`;
      summary.textContent = next.character?.bio || `${next.info.seat} · ${next.info.rulerEnd}`;
      cta.href = `#/house/${encodeURIComponent(next.house)}`;
      cta.querySelector("span").textContent = `Enter House ${next.house}`;
      if (typeof recordEngagement === "function") recordEngagement("mother_house_select", { house: next.house });
    }

    const onClick = event => {
      const button = event.target.closest("[data-mother-house]");
      if (button) selectHouse(button.dataset.motherHouse);
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
        <a class="mother-rail__brand" href="#/" aria-label="Return to the Realm Observatory"><span class="mother-rail__raven">✦</span><span><b>The Raven Wall</b><small>fan-made realm</small></span></a>
        <div class="mother-rail__links">
          <a href="#/houses">Houses</a><a href="#/characters">People</a><a href="#/quotes">Voices</a><a href="#/map">Maps</a><a href="#/lore">Lore</a>
        </div>
        <a class="mother-rail__arrow" href="#/quotes" aria-label="Open Voices">→</a>
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
  global.MotherTemplate = Object.freeze({ mountHome, installRail, houseEntries });
})(window, document);
