/*
 * The Raven Wall mother template.
 *
 * This is intentionally a small, dependency-free visual shell. It owns the
 * observatory home composition and the shared lower realm rail while the
 * existing archive modules continue to own their domain interactions.
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
    Arryn: "robin-arryn",
    "Night's Watch": "samwell-tarly",
    "Free Folk": "tormund-giantsbane"
  });

  const ORBIT_POSITIONS = [
    { x: 17, y: 25, tone: "frost" },
    { x: 83, y: 25, tone: "ember" },
    { x: 12, y: 58, tone: "gold" },
    { x: 88, y: 58, tone: "gold" },
    { x: 22, y: 83, tone: "ember" },
    { x: 78, y: 83, tone: "frost" }
  ];

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
        position: ORBIT_POSITIONS[index] || ORBIT_POSITIONS[0]
      }))
      .slice(0, ORBIT_POSITIONS.length);
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
        <div class="mother-hero__portrait" data-mother-portrait>${portraitFor(initial.character)}</div>
        <div class="mother-hero__orbit" aria-label="Houses and allegiances">
          ${entries.map(entry => {
            const dx = entry.position.x - 50;
            const dy = entry.position.y - 50;
            return `<span class="mother-connector mother-connector--${entry.position.tone}" style="--line-length:${Math.hypot(dx, dy)}%;--line-angle:${Math.atan2(dy, dx) * 180 / Math.PI}deg" aria-hidden="true"></span>`;
          }).join("")}
          ${entries.map((entry, index) => `
            <button class="mother-orbit-node mother-orbit-node--${entry.position.tone}${index === 0 ? " is-active" : ""}" type="button" data-mother-house="${safe(entry.house)}" style="--node-x:${entry.position.x}%;--node-y:${entry.position.y}%;--house-accent:${safe(entry.color)}" aria-pressed="${index === 0}">
              <span class="mother-orbit-node__halo" aria-hidden="true"></span>
              <span class="mother-orbit-node__sigil">${sigilFor(entry.house, 48)}</span>
              <span class="mother-orbit-node__label">${safe(entry.house)}</span>
            </button>`).join("")}
        </div>
        <div class="mother-hero__copy">
          <p class="mother-eyebrow">The Raven Wall · a fan-made archive</p>
          <p class="mother-kicker" data-mother-kicker>The realm observatory</p>
          <h1 id="mother-title" data-mother-title>The North<br><em>remembers.</em></h1>
          <p class="mother-hero__quote" data-mother-quote>“${safe(quoteFor(initial.character))}”</p>
          <p class="mother-hero__summary" data-mother-summary>${safe(initial.character?.bio || "Follow the people, houses, and choices that left a mark on the realm.")}</p>
          <a class="mother-hero__cta" data-mother-cta href="#/character/${safe(initial.character?.id || "jon-snow")}"><span>Open the archive</span><b aria-hidden="true">↗</b></a>
        </div>
        <div class="mother-hero__meta" aria-label="Archive facts">
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
      portrait.innerHTML = portraitFor(next.character);
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
      <div class="mother-rail" aria-label="Archive shortcuts">
        <a class="mother-rail__brand" href="#/" aria-label="Return to the Realm Observatory"><span class="mother-rail__raven">✦</span><span><b>The Raven Wall</b><small>fan-made archive</small></span></a>
        <div class="mother-rail__links">
          <a href="#/houses">Houses</a><a href="#/characters">People</a><a href="#/quotes">Voices</a><a href="#/map">Maps</a><a href="#/lore">Lore</a>
        </div>
        <a class="mother-rail__arrow" href="#/quotes" aria-label="Open Voices">→</a>
      </div>`);
  }

  global.MOTHER_VISUALS = Object.freeze({
    "jon-snow": "assets/generated/northern-guardian-wide.png",
    "tyrion-lannister": "assets/generated/tyrion-lannister-wide.png",
    "daenerys-targaryen": "assets/characters/daenerys-visual.png",
    "theon-greyjoy": "assets/generated/houses/greyjoy-realm-wide.png",
    "gendry-baratheon": "assets/generated/baratheon-realm-wide-v2.png",
    "margaery-tyrell": "assets/generated/houses/tyrell-realm-wide.png"
  });
  global.MotherTemplate = Object.freeze({ mountHome, installRail, houseEntries });
})(window, document);
