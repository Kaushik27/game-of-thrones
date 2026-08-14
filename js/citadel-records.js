// Map-first fan record: places, bloodlines, chronology, voices, claims, and
// clearly labelled book/show differences in one navigable surface.
(function installCitadelRecords(global, document) {
  "use strict";

  const esc = value => typeof global.escapeHTML === "function" ? global.escapeHTML(value == null ? "" : String(value)) : String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const byId = id => typeof characters !== "undefined" && characters.find(person => person.id === id);
  const houseInfo = house => typeof HOUSE_INFO !== "undefined" ? HOUSE_INFO[house] || {} : {};
  const houseColor = house => typeof HOUSE_COLORS !== "undefined" ? HOUSE_COLORS[house] || "#c9ad70" : "#c9ad70";
  const navigate = target => { if (typeof global.navigateFeatureTarget === "function") global.navigateFeatureTarget(target); else global.location.hash = target; };

  function mapMarkup(selectedId) {
    const regions = typeof MAP_REGIONS !== "undefined" && Array.isArray(MAP_REGIONS) ? MAP_REGIONS : [];
    const stops = global.CITADEL_LOCATIONS || [];
    return `<div class="citadel-map" data-citadel-map role="application" aria-label="Interactive map of the realm">
      <div class="citadel-map__sky" aria-hidden="true"></div>
      <svg class="citadel-map__svg" viewBox="-90 -60 880 1090" role="img" aria-label="Stylized map of Westeros">
        <defs><filter id="citadel-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        ${regions.map(region => `<path class="citadel-map__region" d="${region.path}" style="--region-color:${esc(houseColor(region.house))}" aria-hidden="true"></path>`).join("")}
        <path class="citadel-map__outline" d="${typeof MAP_LANDMASS_OUTLINE !== "undefined" ? MAP_LANDMASS_OUTLINE : ""}" aria-hidden="true"></path>
      </svg>
      <div class="citadel-map__routes" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="citadel-map__pins">${stops.map(stop => `<button class="citadel-pin${stop.id === selectedId ? " is-selected" : ""}" type="button" data-stop-id="${esc(stop.id)}" style="--pin-x:${stop.x}%;--pin-y:${stop.y}%;--pin-color:${esc(houseColor(stop.house))}" aria-label="Open ${esc(stop.name)}"><span class="citadel-pin__ring"></span><span class="citadel-pin__dot"></span><span class="citadel-pin__label">${esc(stop.name)}</span></button>`).join("")}</div>
      <div class="citadel-map__compass" aria-hidden="true"><span>N</span><i></i><small>WESTEROS / ESSOS</small></div>
      <p class="citadel-map__hint">Select a place to open its record · pins are narrative anchors, not a survey map</p>
    </div>`;
  }

  function renderPlaceDetail(stop) {
    if (!stop) return `<div class="citadel-detail citadel-detail--empty"><p class="citadel-kicker">THE MAP IS WAITING</p><h2>Choose a place.</h2><p>Follow a road, a bloodline, or a battle. Every pin opens a connected record.</p></div>`;
    const person = byId(stop.characterId);
    const quote = typeof quotes !== "undefined" ? quotes.find(item => item.characterId === stop.characterId) : null;
    return `<div class="citadel-detail" data-citadel-detail style="--detail-color:${esc(houseColor(stop.house))}">
      <p class="citadel-kicker">${esc(stop.region)} · PLACE RECORD</p><h2>${esc(stop.name)}</h2><p class="citadel-detail__summary">${esc(stop.summary)}</p>
      <div class="citadel-detail__rule"></div><dl class="citadel-facts"><div><dt>ALIGNED WITH</dt><dd>${esc(stop.house)}</dd></div><div><dt>THE LINE</dt><dd>${esc(stop.line)}</dd></div></dl>
      ${person ? `<button class="citadel-person" type="button" data-character-id="${esc(person.id)}"><span class="citadel-person__avatar">${typeof avatarHTML === "function" ? avatarHTML(person, 48) : esc(person.name.slice(0,2))}</span><span><small>PERSON AT THE CENTRE</small><strong>${esc(person.name)}</strong><em>${esc(person.bio || "A figure in the record.")}</em></span><b aria-hidden="true">↗</b></button>` : ""}
      ${quote ? `<blockquote class="citadel-voice">“${esc(quote.text)}”<cite>${esc(person?.name || "A voice from the realm")} · Season ${quote.season}</cite></blockquote>` : ""}
      <a class="citadel-action" href="#/map?season=1">Open the living map <span aria-hidden="true">↗</span></a>
    </div>`;
  }

  function renderHouse(house) {
    const info = houseInfo(house); const people = typeof characters !== "undefined" ? characters.filter(person => person.house === house).slice(0, 7) : [];
    return `<section class="citadel-panel citadel-house-panel" data-panel="houses" aria-labelledby="citadel-house-title"><div class="citadel-panel__heading"><p class="citadel-kicker">BANNERS AND BLOODLINES</p><h2 id="citadel-house-title">Choose a house.</h2><p>Open a banner to see its words, seat, people, and the show/book record around it.</p></div><div class="citadel-house-tabs" role="tablist">${Object.keys(typeof HOUSE_INFO !== "undefined" ? HOUSE_INFO : {}).filter(h => !["Night's Watch","Free Folk","Unaffiliated"].includes(h)).map(name => `<button type="button" class="citadel-house-tab${name === house ? " is-selected" : ""}" data-house-id="${esc(name)}" role="tab" aria-selected="${name === house}"><span style="--tab-color:${esc(houseColor(name))}"></span>${esc(name)}</button>`).join("")}</div><div class="citadel-house-feature"><div class="citadel-sigil" style="--sigil-color:${esc(houseColor(house))}">${typeof sigilSVG === "function" ? sigilSVG(info.sigil || "none", { size: 74 }) : ""}</div><div><p class="citadel-kicker">${esc(info.region || "Realm")}</p><h3>${esc(house)}</h3><p class="citadel-words">“${esc(info.words || "—")}”</p><p class="citadel-house-seat">Seat: ${esc(info.seat || "—")} · ${esc(info.rulerEnd || "Record open")}</p></div></div><div class="citadel-member-rail">${people.map(person => `<button type="button" class="citadel-member" data-character-id="${esc(person.id)}"><span>${typeof avatarHTML === "function" ? avatarHTML(person, 38) : ""}</span><strong>${esc(person.name)}</strong><small>${person.status === "dead" ? "Fallen" : "Living"}</small></button>`).join("")}</div></section>`;
  }

  function renderGenealogy(house) {
    const people = typeof characters !== "undefined" ? characters.filter(person => person.house === house).slice(0, 12) : [];
    const center = people[0]; const nodes = people.slice(1).map((person, index) => ({ person, x: 24 + (index % 4) * 24, y: 34 + Math.floor(index / 4) * 25 }));
    return `<section class="citadel-panel citadel-genealogy" data-panel="bloodlines" aria-labelledby="citadel-bloodline-title"><div class="citadel-panel__heading citadel-panel__heading--split"><div><p class="citadel-kicker">SUCCESSION / KINSHIP / OATH</p><h2 id="citadel-bloodline-title">Bloodline constellation.</h2></div><p>Click a name to open the living dossier. Lines show family, allegiance, or the kind of tie that survives a war.</p></div><div class="citadel-constellation" aria-label="${esc(house)} family constellation">${center ? `<div class="citadel-node citadel-node--root" style="--node-x:50%;--node-y:50%" data-character-id="${esc(center.id)}"><span>${typeof avatarHTML === "function" ? avatarHTML(center, 54) : ""}</span><strong>${esc(center.name)}</strong></div>` : ""}${nodes.map(({ person, x, y }) => `<span class="citadel-constellation-line" style="--line-x:${x}%;--line-y:${y}%"></span><button type="button" class="citadel-node" style="--node-x:${x}%;--node-y:${y}%" data-character-id="${esc(person.id)}"><span>${typeof avatarHTML === "function" ? avatarHTML(person, 40) : ""}</span><strong>${esc(person.name)}</strong><small>${person.status === "dead" ? "FALLEN" : "LIVING"}</small></button>`).join("")}</div></section>`;
  }

  function renderChronicle() {
    const records = typeof events !== "undefined" ? events.slice(0, 16) : [];
    return `<section class="citadel-panel citadel-chronicle-panel" data-panel="chronicle" aria-labelledby="citadel-chronicle-title"><div class="citadel-panel__heading citadel-panel__heading--split"><div><p class="citadel-kicker">THE TURNING POINTS</p><h2 id="citadel-chronicle-title">Chronicle of the realm.</h2></div><div class="citadel-filter-row"><button class="is-selected" type="button" data-season-filter="all">All seasons</button>${[1,2,3,4,5,6,7,8].map(season => `<button type="button" data-season-filter="${season}">S${season}</button>`).join("")}</div></div><div class="citadel-event-list">${records.map(record => `<article class="citadel-event" data-season="${record.season}"><span class="citadel-event__season">S${record.season}</span><div><p class="citadel-kicker">${esc(record.type || "record")}</p><h3>${esc(record.title)}</h3><p>${esc(record.summary)}</p></div><span class="citadel-badge citadel-badge--canon">TV CANON</span></article>`).join("")}</div></section>`;
  }

  function renderDivergences() {
    return `<section class="citadel-panel citadel-divergence-panel" data-panel="divergences" aria-labelledby="citadel-divergence-title"><div class="citadel-panel__heading"><p class="citadel-kicker">READ WITH BOTH EYES OPEN</p><h2 id="citadel-divergence-title">Canon, then the divergence.</h2><p>The show is the visible record here. Book-only threads are marked plainly so a reader can explore without confusing adaptation with publication.</p></div><div class="citadel-divergence-grid">${(global.CITADEL_DIVERGENCES || []).map(item => `<article class="citadel-divergence"><div><span class="citadel-badge citadel-badge--${esc(item.tone)}">${esc(item.status)}</span><h3>${esc(item.label)}</h3></div><p><strong>SHOW</strong> ${esc(item.show)}</p><p><strong>BOOKS</strong> ${esc(item.book)}</p></article>`).join("")}</div></section>`;
  }

  function renderVoices() {
    const featured = typeof quotes !== "undefined" ? quotes.slice(0, 8) : [];
    return `<section class="citadel-panel citadel-voices-panel" data-panel="voices" aria-labelledby="citadel-voices-title"><div class="citadel-panel__heading"><p class="citadel-kicker">WORDS THAT ALTERED THE WAR</p><h2 id="citadel-voices-title">Voices from the record.</h2></div><div class="citadel-voices-grid">${featured.map(quote => { const person = byId(quote.characterId); return `<button class="citadel-quote" type="button" data-quote-id="${esc(quote.id)}"><span>“</span><blockquote>${esc(quote.text)}</blockquote><cite>${esc(person?.name || "Unknown speaker")} · S${quote.season}</cite></button>`; }).join("")}</div></section>`;
  }

  function renderClaimants() {
    return `<section class="citadel-panel citadel-claims-panel" data-panel="claims" aria-labelledby="citadel-claims-title"><div class="citadel-panel__heading citadel-panel__heading--split"><div><p class="citadel-kicker">THE QUESTION NO COUNCIL CAN AVOID</p><h2 id="citadel-claims-title">Who should sit the throne?</h2></div><p>Change the weight of bloodline, conquest, and merit. The result is a fan argument, not a canon verdict.</p></div><div class="citadel-claim-controls"><label>Bloodline <input type="range" min="0" max="100" value="40" data-claim-weight="bloodline"><output>40</output></label><label>Conquest <input type="range" min="0" max="100" value="30" data-claim-weight="conquest"><output>30</output></label><label>Merit <input type="range" min="0" max="100" value="30" data-claim-weight="merit"><output>30</output></label></div><div class="citadel-claim-list" data-claim-list></div></section>`;
  }

  function renderMysteries() {
    return `<section class="citadel-panel citadel-mysteries-panel" data-panel="mysteries" aria-labelledby="citadel-mysteries-title"><div class="citadel-panel__heading"><p class="citadel-kicker">THE THREADS THE MAESTERS NEVER CLOSED</p><h2 id="citadel-mysteries-title">Unresolved mysteries.</h2><p>Some are show canon, some are book clues, and some are deliberately left as fan theory.</p></div><div class="citadel-mystery-grid">${(global.CITADEL_MYSTERIES || []).map(item => `<article class="citadel-mystery"><span class="citadel-badge citadel-badge--${esc(item.tone)}">${esc(item.badge)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></section>`;
  }

  function mount(root, options = {}) {
    if (!root) throw new Error("CitadelRecords.mount requires a root element.");
    const settings = { onNavigate: navigate, ...options };
    let selectedStop = (global.CITADEL_LOCATIONS || [])[0];
    let selectedHouse = "Stark";
    root.innerHTML = `<main class="citadel-records" data-citadel-records><header class="citadel-hero"><div class="citadel-hero__grid" aria-hidden="true"></div><div class="citadel-hero__copy"><p class="citadel-kicker">A MAP-FIRST FAN RECORD</p><h1>The Citadel<br><em>Records.</em></h1><p class="citadel-hero__dek">A living atlas of places, bloodlines, battles, and the words that survived them. The show canon leads; the book divergences are marked in plain sight.</p><div class="citadel-hero__stats"><span><b>09</b> map stops</span><span><b>06</b> divergences</span><span><b>05</b> claims</span></div></div><div class="citadel-hero__seal" aria-hidden="true"><span>W</span><small>THE REALM<br>IS A STORY<br>OF CHOICES</small></div></header><nav class="citadel-section-nav" aria-label="Citadel records sections">${[["atlas","Atlas"],["houses","Houses"],["bloodlines","Bloodlines"],["chronicle","Chronicle"],["divergences","Divergences"],["voices","Voices"],["claims","Claims"],["mysteries","Mysteries"]].map(([id,label], index) => `<button type="button" class="${index === 0 ? "is-selected" : ""}" data-panel-target="${id}">${label}</button>`).join("")}</nav><section class="citadel-atlas" data-panel="atlas" aria-labelledby="citadel-atlas-title"><div class="citadel-atlas__intro"><p class="citadel-kicker">THE ROAD IS THE RECORD</p><h2 id="citadel-atlas-title">Begin at the border.<br><em>Follow the consequences.</em></h2><p>Choose a place and the detail rail will connect it to a person, a voice, and the season that changed its meaning.</p></div><div class="citadel-atlas__layout">${mapMarkup(selectedStop.id)}<div id="citadel-place-detail">${renderPlaceDetail(selectedStop)}</div></div></section>${renderHouse(selectedHouse)}${renderGenealogy(selectedHouse)}${renderChronicle()}${renderDivergences()}${renderVoices()}${renderClaimants()}${renderMysteries()}<footer class="citadel-footer"><span>Fan-made · show canon foregrounded · books clearly separated</span><a href="#/">Return to the realms ↗</a></footer><div class="citadel-status" aria-live="polite"></div></main>`;

    const status = root.querySelector(".citadel-status");
    const announce = message => { if (status) status.textContent = message; };
    const selectStop = id => { selectedStop = (global.CITADEL_LOCATIONS || []).find(stop => stop.id === id) || selectedStop; root.querySelector("[data-citadel-map]").outerHTML = mapMarkup(selectedStop.id); root.querySelector("#citadel-place-detail").innerHTML = renderPlaceDetail(selectedStop); bindMap(); announce(`${selectedStop.name} opened.`); };
    const bindMap = () => root.querySelectorAll("[data-stop-id]").forEach(button => button.addEventListener("click", () => selectStop(button.dataset.stopId)));
    const selectHouse = house => { selectedHouse = house; const oldHouse = root.querySelector("[data-panel=houses]"); oldHouse.outerHTML = renderHouse(selectedHouse); const oldBlood = root.querySelector("[data-panel=bloodlines]"); oldBlood.outerHTML = renderGenealogy(selectedHouse); bindHouse(); bindPeople(); announce(`${selectedHouse} record opened.`); };
    const bindHouse = () => root.querySelectorAll("[data-house-id]").forEach(button => button.addEventListener("click", () => selectHouse(button.dataset.houseId)));
    const bindPeople = () => root.querySelectorAll("[data-character-id]").forEach(button => { if (button.dataset.bound === "1") return; button.dataset.bound = "1"; button.addEventListener("click", () => settings.onNavigate(`#/character/${encodeURIComponent(button.dataset.characterId)}`)); });
    const claimList = root.querySelector("[data-claim-list]"); const claimWeights = { bloodline: 40, conquest: 30, merit: 30 };
    const renderClaims = () => { const total = Object.values(claimWeights).reduce((sum, value) => sum + value, 0) || 1; const rows = (global.CITADEL_CLAIMANTS || []).map(claimant => ({ ...claimant, score: Math.round((claimant.bloodline * claimWeights.bloodline + claimant.conquest * claimWeights.conquest + claimant.merit * claimWeights.merit) / total) })).sort((a,b) => b.score - a.score); claimList.innerHTML = rows.map((row, index) => `<button type="button" class="citadel-claim-row" data-character-id="${esc(row.id)}"><span class="citadel-claim-row__rank">0${index + 1}</span><span class="citadel-claim-row__name"><strong>${esc(row.name)}</strong><small>${esc(row.house)} · ${esc(row.note)}</small></span><span class="citadel-claim-row__bar"><i style="width:${row.score}%"></i></span><b>${row.score}</b></button>`).join(""); bindPeople(); };
    root.querySelectorAll("[data-claim-weight]").forEach(input => input.addEventListener("input", () => { claimWeights[input.dataset.claimWeight] = Number(input.value); input.nextElementSibling.value = input.value; renderClaims(); }));
    root.querySelectorAll("[data-panel-target]").forEach(button => button.addEventListener("click", () => { const target = root.querySelector(`[data-panel="${button.dataset.panelTarget}"]`); if (!target) return; root.querySelectorAll("[data-panel-target]").forEach(item => item.classList.toggle("is-selected", item === button)); target.scrollIntoView({ behavior: "smooth", block: "start" }); }));
    root.querySelectorAll("[data-season-filter]").forEach(button => button.addEventListener("click", () => { const season = button.dataset.seasonFilter; root.querySelectorAll("[data-season-filter]").forEach(item => item.classList.toggle("is-selected", item === button)); root.querySelectorAll(".citadel-event").forEach(item => { item.hidden = season !== "all" && item.dataset.season !== season; }); }));
    root.querySelectorAll("[data-quote-id]").forEach(button => button.addEventListener("click", () => settings.onNavigate(`#/quotes?quote=${encodeURIComponent(button.dataset.quoteId)}`)));
    bindMap(); bindHouse(); bindPeople(); renderClaims();
    return { destroy() { root.innerHTML = ""; } };
  }
  global.CitadelRecords = Object.freeze({ mount });
})(window, document);
