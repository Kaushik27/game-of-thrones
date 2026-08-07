// ==========================================================================
// SPA shell: hash router + route view renderers. All page logic previously
// spread across characters.html / character.html / houses.html / house.html /
// map.html / timeline.html / battles.html / quiz.html / quotes.html lives
// here as render functions that mount into #app. Depends on data.js,
// events.js, quotes.js, battles.js, map-data.js, sigils.js, common.js
// (all loaded before this file) and D3 v7 for the graph/tree/map visuals.
// ==========================================================================

const APP_ROUTES = [
  { pattern: /^\/$/, view: viewHome },
  { pattern: /^\/characters$/, view: viewCharacters },
  { pattern: /^\/character\/([^/]+)$/, view: viewCharacter },
  { pattern: /^\/houses$/, view: viewHouses },
  { pattern: /^\/house\/([^/]+)$/, view: viewHouse },
  { pattern: /^\/map$/, view: viewMap },
  { pattern: /^\/episode\/([^/]+)$/, view: viewTimeline },
  { pattern: /^\/timeline$/, view: viewTimeline },
  { pattern: /^\/battles$/, view: viewBattles },
  { pattern: /^\/quiz$/, view: viewQuiz },
  { pattern: /^\/quotes$/, view: viewQuotes },
  { pattern: /^\/lore$/, view: viewLore },
  { pattern: /^\/credits$/, view: viewCredits }
];

let activeViewHandle = null;

function registerActiveView(handle) {
  if (!handle || typeof handle.destroy !== "function") return;
  activeViewHandle = handle;
}

function destroyActiveView() {
  if (!activeViewHandle) return;
  activeViewHandle.destroy();
  activeViewHandle = null;
}

function parseHash() {
  let hash = window.location.hash || "#/";
  hash = hash.slice(1); // drop '#'
  const [path, query] = hash.split("?");
  return { path: path || "/", query: new URLSearchParams(query || "") };
}

function router() {
  const app = document.getElementById("app");
  const { path, query } = parseHash();
  destroyActiveView();
  document.body.classList.toggle("realm-journey-route", path === "/");
  document.body.classList.toggle("character-cinematic-route", /^\/character\//.test(path));
  document.body.classList.toggle("voices-route", path === "/quotes");
  document.body.classList.remove("character-cinematic-route--archive");
  for (const route of APP_ROUTES) {
    const m = path.match(route.pattern);
    if (m) {
      recordEngagement("route_view", { path, query: query.toString() });
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      route.view(app, m.slice(1), query);
      renderNav();
      observeReveals(app);
      return;
    }
  }
  app.innerHTML = `<div class="page-wrap"><div class="empty-state">Page not found. <a href="#/">Go home</a></div></div>`;
  document.title = "Not Found — Game of Thrones";
  renderNav();
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
  router();
  if (window.RavenSearch) {
    window.RavenSearch.init({ triggerSelector: "[data-raven-search-trigger]" });
  }
});

// ---------- shared small helpers ----------
function setTitle(t) { document.title = t + " — Game of Thrones"; }

function recordEngagement(eventName, detail = {}) {
  const payload = { eventName: String(eventName || "unknown"), detail, at: new Date().toISOString() };
  try {
    const key = "got-engagement-events";
    const current = JSON.parse(window.localStorage.getItem(key) || "[]");
    current.push(payload);
    window.localStorage.setItem(key, JSON.stringify(current.slice(-80)));
  } catch (error) {
    // Storage is an enhancement; route behavior must remain available in
    // private browsing and embedded previews.
  }
  window.dispatchEvent(new CustomEvent("got:engagement", { detail: payload }));
}

function rememberLastRoute(key, value) {
  try { window.sessionStorage.setItem(`got-last-${key}`, String(value || "")); } catch (error) { /* optional */ }
}

function episodeForQuote(quote) {
  if (!quote || typeof EPISODES === "undefined" || !Array.isArray(EPISODES)) return null;
  return EPISODES.find(episode => Array.isArray(episode.quoteIds) && episode.quoteIds.includes(quote.id))
    || EPISODES.find(episode => Array.isArray(episode.quotes) && episode.quotes.includes(quote.id))
    || EPISODES.find(episode => episode.season === quote.season && Array.isArray(episode.characterIds) && episode.characterIds.includes(quote.characterId))
    || null;
}

// The Explore prologue uses original in-world visual studies. Dossiers and
// quote archives intentionally keep the verified character portraits so the
// story remains grounded in the people who played these roles.
const CINEMATIC_VISUALS = Object.freeze({
  "jon-snow": "assets/characters/jon-snow-visual.png",
  "daenerys-targaryen": "assets/characters/daenerys-visual.png",
  "tyrion-lannister": "assets/characters/tyrion-visual.png",
  "arya-stark": "assets/characters/arya-visual.png",
  "jaime-lannister": "assets/characters/jaime-visual.png"
});

function cinematicVisualFor(characterId) {
  return CINEMATIC_VISUALS[characterId] || "";
}

function cinematicPortraitHTML(character, size) {
  if (!character) return "";
  const source = cinematicVisualFor(character.id);
  if (source) {
    return `<img class="cinematic-visual" src="${escapeHTML(source)}" alt="Original in-world visual study for ${escapeHTML(character.name)}" width="${size}" height="${size}" loading="lazy" decoding="async">`;
  }
  const color = character.sigilColor || getHouseColor(character.house);
  const art = typeof generativeAvatarSVG === "function" ? generativeAvatarSVG(character) : initialsFor(character.name);
  return `<span class="cinematic-visual cinematic-visual--illustration" role="img" aria-label="Original illustrated visual study for ${escapeHTML(character.name)}" style="--cinematic-visual-accent:${escapeHTML(color)}">${art}</span>`;
}

function navigateFeatureTarget(target) {
  const destination = String(target || "").trim();
  if (!destination) return;
  if (destination.startsWith("#")) {
    window.location.hash = destination;
    return;
  }
  if (destination.startsWith("/")) {
    window.location.hash = `#${destination}`;
    return;
  }
  try {
    const url = new URL(destination, window.location.href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      window.open(url.href, "_blank", "noopener,noreferrer");
    }
  } catch (_error) {
    // Ignore malformed destinations supplied by optional feature datasets.
  }
}

function replaceHashQuery(path, updates) {
  const current = parseHash();
  if (current.path !== path) return;
  Object.entries(updates || {}).forEach(([key, value]) => {
    const normalized = String(value == null ? "" : value).trim();
    if (normalized) current.query.set(key, normalized);
    else current.query.delete(key);
  });
  const encoded = current.query.toString();
  const nextHash = `#${path}${encoded ? `?${encoded}` : ""}`;
  if (window.location.hash !== nextHash) window.history.replaceState(null, "", nextHash);
}

// ==========================================================================
// HOME
// ==========================================================================
function viewHome(app, params, query) {
  setTitle("Explore");
  const requestedSeason = Number(query.get("season"));
  let rememberedSeason = 6;
  try { rememberedSeason = Number(window.sessionStorage.getItem("got-last-season")) || 6; } catch (error) { /* optional */ }
  const initialSeason = Number.isInteger(requestedSeason) && requestedSeason >= 1 && requestedSeason <= 8
    ? requestedSeason
    : (Number.isInteger(rememberedSeason) && rememberedSeason >= 1 && rememberedSeason <= 8 ? rememberedSeason : 6);

  app.innerHTML = `<div id="cinematic-realm-root" class="cinematic-realm"></div>`;
  const root = document.getElementById("cinematic-realm-root");

  const navigate = target => {
    const destination = String(target || "");
    if (!destination) return;
    if (destination.startsWith("#")) {
      window.location.hash = destination;
      return;
    }
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  if (!window.CinematicRealm) {
    root.innerHTML = `<div class="realm-journey-loading realm-journey-loading--error" role="alert"><span>The road is blocked for now.</span><a href="#/timeline">Open the season archive</a></div>`;
    return;
  }

  try {
    const cinematicHandle = window.CinematicRealm.mount(root, { initialSeason, onNavigate: navigate });
    registerActiveView(cinematicHandle);
  } catch (error) {
    console.error("The cinematic realm could not be mounted.", error);
    root.innerHTML = `<div class="realm-journey-loading realm-journey-loading--error" role="alert"><span>The road is blocked for now.</span><a href="#/timeline">Open the season archive</a></div>`;
  }
}

// ==========================================================================
// CHARACTERS DIRECTORY + RELATIONS GRAPH
// ==========================================================================
function viewCharacters(app, params, query) {
  if (!window.PeopleIntelligence) {
    viewCharactersLegacy(app, params, query);
    return;
  }

  setTitle("People");
  app.innerHTML = `<div id="people-intelligence-root" class="encyclopedia-feature-host"></div>`;
  const root = document.getElementById("people-intelligence-root");
  try {
    const handle = window.PeopleIntelligence.mount(root, {
      initialSeason: Number(query.get("season")) || 6,
      onNavigate: navigateFeatureTarget
    });
    registerActiveView(handle);
  } catch (error) {
    console.error("The People experience could not be mounted.", error);
    viewCharactersLegacy(app, params, query);
  }
}

function viewCharactersLegacy(app, params, query) {
  setTitle("Characters");
  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:10px;">
        <h1 class="display">Characters of Westeros</h1>
        <p>Every major character, searchable and filterable. Click through for a full profile with bio, relations, and personal timeline.</p>
      </div>
      <div class="tabs">
        <button class="tab-btn active" data-tab="grid">Directory</button>
        <button class="tab-btn" data-tab="graph" id="graph-tab-btn">Relations Graph</button>
      </div>
      <div class="tab-panel active" id="tab-grid">
        <div id="controls">
          <input type="text" id="search-input" placeholder="Search by name...">
          <select id="house-filter"><option value="">All Houses</option></select>
          <select id="status-filter">
            <option value="">All Statuses</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
          </select>
          <select id="portrait-filter" aria-label="Filter by portrait type">
            <option value="">All Portraits</option>
            <option value="photo">Actor Photos</option>
            <option value="illustration">Illustrated Portraits</option>
          </select>
        </div>
        <div id="result-count"></div>
        <div id="portrait-coverage" class="portrait-coverage" aria-live="polite"></div>
        <div id="char-grid" class="grid"></div>
      </div>
      <div class="tab-panel" id="tab-graph">
        <div id="graph-filters"></div>
        <div id="d3-missing-warning" style="display:none;padding:30px;text-align:center;color:var(--text-dim);">Requires internet on first load to fetch D3.js. Please connect and reload.</div>
        <div id="graph-host" style="width:100%;height:640px;background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--radius);position:relative;overflow:hidden;">
          <div id="graph-detail"></div>
        </div>
      </div>
    </div>
  `;
  if (typeof d3 === "undefined") document.getElementById("d3-missing-warning").style.display = "block";

  let activeHouse = "", activeStatus = "", activeQuery = "", activePortrait = "";
  const hasActorPhoto = c => typeof actorPhotoFor === "function" && Boolean(actorPhotoFor(c.id));

  // Relation count per character drives a "featured" larger-card treatment
  // for the most connected characters — a meaningful, data-driven signal
  // (not arbitrary) so the directory isn't a wall of identically-sized
  // tiles. Computed once since the underlying relation data is static.
  const relationCount = new Map();
  characters.forEach(c => relationCount.set(c.id, 0));
  relations.forEach(r => {
    if (relationCount.has(r.source)) relationCount.set(r.source, relationCount.get(r.source) + 1);
    if (relationCount.has(r.target)) relationCount.set(r.target, relationCount.get(r.target) + 1);
  });
  const featuredThreshold = [...relationCount.values()].sort((a, b) => b - a)[Math.min(9, relationCount.size - 1)];

  function renderGrid() {
    const q = activeQuery.toLowerCase();
    const filtered = characters.filter(c =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (!activeHouse || c.house === activeHouse) &&
      (!activeStatus || c.status === activeStatus) &&
      (!activePortrait || (activePortrait === "photo" ? hasActorPhoto(c) : !hasActorPhoto(c)))
    );
    document.getElementById("result-count").textContent = `${filtered.length} character${filtered.length === 1 ? '' : 's'}`;
    const filteredPhotos = filtered.filter(hasActorPhoto).length;
    document.getElementById("portrait-coverage").innerHTML = `
      <span><strong>${filteredPhotos}</strong> actor photos</span>
      <span><strong>${filtered.length - filteredPhotos}</strong> illustrated portraits</span>
      <span class="text-dim">Open-license photos only; illustrations fill the remaining cast.</span>
    `;
    document.getElementById("char-grid").innerHTML = filtered.map(c => {
      const featured = relationCount.get(c.id) >= featuredThreshold && relationCount.get(c.id) > 0;
      const hasPhoto = hasActorPhoto(c);
      const actor = c.actor && !/^actor unknown$/i.test(c.actor) ? `Played by ${escapeHTML(c.actor)}` : "Cast not recorded";
      return `
      <a class="card char-card reveal${featured ? ' featured' : ''}" href="#/character/${encodeURIComponent(c.id)}" style="${cardAccentStyle(c.sigilColor)}">
        ${avatarHTML(c, featured ? 72 : 48)}
        <div class="meta">
          <p class="name" style="color:${c.sigilColor}">${escapeHTML(c.name)}</p>
          <div class="sub">${escapeHTML(c.house)} · <span class="badge ${c.status}">${c.status}</span>${featured ? ` · <span class="text-dim">${relationCount.get(c.id)} relations</span>` : ''}</div>
          <div class="actor-line">${actor}</div>
          <span class="portrait-kind ${hasPhoto ? 'portrait-kind--photo' : 'portrait-kind--illustration'}">${hasPhoto ? 'Actor photo' : 'Illustrated portrait'}</span>
        </div>
      </a>
    `;
    }).join("") || `<div class="empty-state">No characters found.</div>`;
    observeReveals(document.getElementById("char-grid"));
  }

  function initControls() {
    const houseSel = document.getElementById("house-filter");
    Object.keys(HOUSE_COLORS).forEach(h => {
      const opt = document.createElement("option");
      opt.value = h; opt.textContent = h;
      houseSel.appendChild(opt);
    });
    document.getElementById("search-input").addEventListener("input", e => { activeQuery = e.target.value; renderGrid(); });
    houseSel.addEventListener("change", e => { activeHouse = e.target.value; renderGrid(); });
    document.getElementById("status-filter").addEventListener("change", e => { activeStatus = e.target.value; renderGrid(); });
    document.getElementById("portrait-filter").addEventListener("change", e => { activePortrait = e.target.value; renderGrid(); });
  }

  app.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      app.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      app.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "graph" && typeof d3 !== "undefined") renderCharGraph();
    });
  });

  // Default to a curated view — two major houses, every relation type —
  // instead of dumping all 442 relations across all houses on first paint.
  // The full unfiltered graph is still one click away: select more house
  // chips (or "Select all") to widen it back out.
  const DEFAULT_GRAPH_HOUSES = ["Stark", "Lannister"];
  const graphState = {
    houseFilter: new Set(DEFAULT_GRAPH_HOUSES),
    typeFilter: new Set(["family", "marriage", "allegiance", "conflict", "bond"]),
    highlightIds: new Set()
  };

  function initGraphFilters() {
    const mount = document.getElementById("graph-filters");
    mount.style.cssText = "display:flex;flex-direction:column;gap:8px;margin-bottom:12px;";
    const houseChips = Object.keys(HOUSE_COLORS).map(h =>
      `<span class="chip${graphState.houseFilter.has(h) ? ' active' : ''}" data-house="${h}"><span class="swatch" style="background:${HOUSE_COLORS[h]}"></span>${h}</span>`).join("");
    const typeChips = Object.keys(RELATION_STYLE).map(t =>
      `<span class="chip active" data-type="${t}"><span class="swatch" style="background:${RELATION_STYLE[t].color}"></span>${t}</span>`).join("");
    mount.innerHTML = `
      <div class="text-dim" style="font-size:0.82rem;">Showing <strong style="color:var(--text);">${DEFAULT_GRAPH_HOUSES.join(" &amp; ")}</strong> by default — select more houses below (or "Select all") to widen the graph.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="btn" id="graph-select-all" style="font-size:0.78rem;padding:5px 12px;min-height:0;">Select all houses</button>
        <button type="button" class="btn" id="graph-select-default" style="font-size:0.78rem;padding:5px 12px;min-height:0;">Reset to default</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${houseChips}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${typeChips}</div>
    `;
    document.getElementById("graph-select-all").addEventListener("click", () => {
      graphState.houseFilter = new Set(Object.keys(HOUSE_COLORS));
      mount.querySelectorAll("[data-house]").forEach(chip => chip.classList.add("active"));
      renderCharGraph();
    });
    document.getElementById("graph-select-default").addEventListener("click", () => {
      graphState.houseFilter = new Set(DEFAULT_GRAPH_HOUSES);
      mount.querySelectorAll("[data-house]").forEach(chip => chip.classList.toggle("active", graphState.houseFilter.has(chip.dataset.house)));
      renderCharGraph();
    });
    mount.querySelectorAll("[data-house]").forEach(chip => chip.addEventListener("click", () => {
      const h = chip.dataset.house;
      chip.classList.toggle("active");
      chip.classList.contains("active") ? graphState.houseFilter.add(h) : graphState.houseFilter.delete(h);
      renderCharGraph();
    }));
    mount.querySelectorAll("[data-type]").forEach(chip => chip.addEventListener("click", () => {
      const t = chip.dataset.type;
      chip.classList.toggle("active");
      chip.classList.contains("active") ? graphState.typeFilter.add(t) : graphState.typeFilter.delete(t);
      renderCharGraph();
    }));
  }

  function graphVisibleCharacters() { return characters.filter(c => graphState.houseFilter.has(c.house)); }
  function graphVisibleRelations() {
    const ids = new Set(graphVisibleCharacters().map(c => c.id));
    return relations.filter(r => graphState.typeFilter.has(r.type) && ids.has(r.source) && ids.has(r.target));
  }

  function showGraphDetail(id) {
    const panel = document.getElementById("graph-detail");
    panel.style.cssText = "position:absolute;top:12px;right:12px;width:260px;max-height:calc(100% - 24px);overflow-y:auto;background:var(--panel-bg-alt);border:1px solid var(--panel-border);border-radius:var(--radius);padding:14px;font-size:0.85rem;" + (id ? "" : "display:none;");
    if (!id) { graphState.highlightIds = new Set(); applyGraphHighlight(); return; }
    const c = getCharacter(id);
    const rels = relationsFor(id);
    graphState.highlightIds = new Set([id, ...rels.map(r => r.other.id)]);
    applyGraphHighlight();
    panel.innerHTML = `
      <h3 class="display" style="color:${c.sigilColor}">${c.name}</h3>
      <div class="sub text-dim">${c.house} · ${c.status}</div>
      <p>${c.bio}</p>
      <a class="cta-pill" style="margin-top:10px;" href="#/character/${c.id}">View full profile <span class="arrow">&#8594;</span></a>
      <ul style="list-style:none;padding:0;margin:8px 0 0;">${rels.map(r => `<li data-jump="${r.other.id}" style="padding:5px 0;border-bottom:1px solid var(--panel-border);cursor:pointer;">${TYPE_ICON[r.rel.type]} ${r.rel.label} — <strong>${r.other.name}</strong></li>`).join("")}</ul>
    `;
    panel.querySelectorAll("[data-jump]").forEach(el => el.addEventListener("click", () => showGraphDetail(el.dataset.jump)));
  }

  function applyGraphHighlight() {
    const svg = d3.select("#graph-host svg");
    if (svg.empty()) return;
    const hasHighlight = graphState.highlightIds.size > 0;
    svg.selectAll("circle").attr("opacity", d => !hasHighlight ? (d.status === "dead" ? 0.4 : 1) : (graphState.highlightIds.has(d.id) ? 1 : 0.1));
    svg.selectAll("line").attr("opacity", d => {
      const sId = d.source.id || d.source, tId = d.target.id || d.target;
      return !hasHighlight ? 0.6 : (graphState.highlightIds.has(sId) && graphState.highlightIds.has(tId) ? 0.9 : 0.04);
    });
  }

  function renderCharGraph() {
    const host = document.getElementById("graph-host");
    host.querySelectorAll("svg").forEach(s => s.remove());
    const width = host.clientWidth || 800, height = host.clientHeight || 640;
    const svg = d3.select(host).insert("svg", ":first-child").attr("width", width).attr("height", height);
    const zoomLayer = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.2, 4]).on("zoom", e => zoomLayer.attr("transform", e.transform)));

    const nodes = graphVisibleCharacters().map(c => ({ ...c }));
    const nodeById = new Map(nodes.map(n => [n.id, n]));
    const links = graphVisibleRelations().filter(r => nodeById.has(r.source) && nodeById.has(r.target)).map(r => ({ ...r }));

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(70))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(18));

    const link = zoomLayer.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", d => RELATION_STYLE[d.type].color)
      .attr("stroke-dasharray", d => RELATION_STYLE[d.type].dash)
      .attr("stroke-width", 1.5).attr("opacity", 0.6);

    const node = zoomLayer.append("g").selectAll("circle").data(nodes).join("circle")
      .attr("r", d => 6 + Math.min(6, links.filter(l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id).length))
      .attr("fill", d => d.sigilColor)
      .attr("opacity", d => d.status === "dead" ? 0.4 : 1)
      .attr("stroke", "#000").attr("stroke-width", 1)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("title").text(d => d.name);
    node.on("click", (e, d) => { e.stopPropagation(); showGraphDetail(d.id); });
    svg.on("click", () => showGraphDetail(null));

    sim.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("cx", d => d.x).attr("cy", d => d.y);
    });
    applyGraphHighlight();
  }

  initControls();
  renderGrid();
  observeReveals(app);
  if (typeof d3 !== "undefined") {
    initGraphFilters();
    if (query.get("graph") === "1") {
      document.getElementById("graph-tab-btn").click();
    }
    window.addEventListener("resize", () => {
      if (document.getElementById("tab-graph") && document.getElementById("tab-graph").classList.contains("active")) renderCharGraph();
    }, { once: false });
  }
}

// ==========================================================================
// CHARACTER PROFILE
// ==========================================================================
function viewCharacter(app, params, query) {
  const id = params[0];
  const c = getCharacter(id);
  if (!c) {
    app.innerHTML = `<div class="page-wrap"><div class="empty-state">Character not found. <a href="#/characters">Back to Characters</a></div></div>`;
    setTitle("Not Found");
    return;
  }
  setTitle(c.name);
  const rels = relationsFor(c.id);
  const cq = quotesFor(c.id);
  const evs = eventsFor(c.id);
  const cinematicTaglines = {
    "jon-snow": "The reluctant heir",
    "daenerys-targaryen": "The breaker of chains",
    "arya-stark": "No one. Everyone.",
    "tyrion-lannister": "The mind behind the throne",
    "sansa-stark": "The north remembers",
    "jaime-lannister": "The kingslayer who came home"
  };
  const cinematicTagline = cinematicTaglines[c.id] || "A life written in fire and ice";
  const cinematicBackdrop = ["Stark", "Night's Watch", "Free Folk"].includes(c.house)
    ? "assets/ui/north-journey-bg.jpg"
    : ["Targaryen", "Martell", "Greyjoy"].includes(c.house)
      ? "assets/ui/essos-journey-bg.jpg"
      : "assets/ui/capital-journey-bg.jpg";
  const cinematicQuote = cq[0] || { text: "The story remembers.", speaker: c.name };
  const fanMoment = (Array.isArray(window.FAN_MOMENTS) ? window.FAN_MOMENTS : []).find(moment => moment.characterId === c.id) || null;
  const requestedChapter = query && ["title", "quote", "turn", "archive"].includes(query.get("chapter")) ? query.get("chapter") : "";
  rememberLastRoute("character", c.id);
  recordEngagement("character_open", { characterId: c.id });

  app.innerHTML = `
    <div class="character-profile" style="--character-accent:${c.sigilColor};">
      <section class="character-film" data-character-film aria-labelledby="character-film-title" style="--character-backdrop:url('${cinematicBackdrop}');">
        <div class="character-film__stage" data-character-film-stage data-scene="title">
          <img class="character-film__backdrop" src="${escapeHTML(cinematicBackdrop)}" alt="" aria-hidden="true">
          <div class="character-film__veil" aria-hidden="true"></div>
          <div class="character-film__frame" aria-hidden="true"></div>
          <div class="character-film__transition" data-film-transition aria-hidden="true"></div>
          <button class="character-film__sound" type="button" data-cinematic-sound aria-pressed="false">Sound off</button>
          <div class="character-film__scene character-film__scene--title" data-film-scene="title">
            <p class="character-film__eyebrow">A living portrait <span aria-hidden="true">·</span> ${escapeHTML(c.house)}</p>
            <p class="character-film__chapter">Chapter 01 <span aria-hidden="true">/</span> The first impression</p>
            <h1 id="character-film-title">${escapeHTML(c.name)}</h1>
            <p class="character-film__tagline">${escapeHTML(cinematicTagline)}</p>
          </div>
          <div class="character-film__scene character-film__scene--quote" data-film-scene="quote" aria-hidden="true">
            <p class="character-film__chapter">Chapter 02 <span aria-hidden="true">/</span> A line that remains</p>
            ${fanMoment ? `<p class="character-film__memory-kicker">${escapeHTML(fanMoment.title)} · ${escapeHTML(fanMoment.location)}</p>` : ""}
            <blockquote>
              <span class="character-film__quote-mark" aria-hidden="true">“</span>
              <p>${escapeHTML(cinematicQuote.text)}</p>
              <cite>— ${escapeHTML(cinematicQuote.speaker || c.name)}</cite>
            </blockquote>
          </div>
          <div class="character-film__scene character-film__scene--turn" data-film-scene="turn" aria-hidden="true">
            <p class="character-film__chapter">Chapter 03 <span aria-hidden="true">/</span> The turning point</p>
            ${fanMoment ? `<p class="character-film__memory-note">${escapeHTML(fanMoment.fanNote)}</p>` : ""}
            <p class="character-film__season">Season ${escapeHTML((evs[0] && evs[0].season) || "—")}</p>
            <h2>${escapeHTML((evs[0] && evs[0].title) || "The story shifts")}</h2>
            <p>${escapeHTML((evs[0] && evs[0].summary) || c.bio)}</p>
            ${evs[0] ? `<a class="character-film__event-link" href="#/timeline?season=${encodeURIComponent(evs[0].season)}&mode=consequences&event=${encodeURIComponent(evs[0].id)}">Follow this moment <span aria-hidden="true">↗</span></a>` : ""}
          </div>
          <div class="character-film__scene character-film__scene--archive" data-film-scene="archive" aria-hidden="true">
            <p class="character-film__chapter">Chapter 04 <span aria-hidden="true">/</span> The living dossier</p>
            <h2>${escapeHTML(c.name)}</h2>
            <p>${escapeHTML(c.bio)}</p>
            <button type="button" class="character-film__enter" data-character-film-enter>Open the dossier <span aria-hidden="true">↓</span></button>
          </div>
          <figure class="character-film__portrait">
            <div class="character-film__portrait-frame">${avatarHTML(c, 250)}</div>
            <figcaption>${escapeHTML(c.actor || "Character portrait")} <span aria-hidden="true">·</span> on screen</figcaption>
          </figure>
          <nav class="character-film__chapters" aria-label="Character story chapters">
            <button type="button" data-film-jump="title" aria-current="true"><span>01</span> Entrance</button>
            <button type="button" data-film-jump="quote" aria-current="false"><span>02</span> Voice</button>
            <button type="button" data-film-jump="turn" aria-current="false"><span>03</span> Turning point</button>
            <button type="button" data-film-jump="archive" aria-current="false"><span>04</span> Dossier</button>
          </nav>
          <div class="character-film__progress" aria-hidden="true"><span data-film-progress></span></div>
          <p class="character-film__scroll" aria-hidden="true"><span></span> Scroll to play the story</p>
          <p class="character-film__status" data-character-film-status role="status" aria-live="polite"></p>
        </div>
      </section>
      <div class="character-profile__inner">
        <a class="character-profile__back" href="#/characters"><span aria-hidden="true">←</span> People Intelligence</a>
        <header id="profile-header" class="character-profile__hero">
          <div class="character-profile__portrait">${avatarHTML(c, 112)}</div>
          <div class="character-profile__identity">
            <div class="character-profile__kicker">Character dossier · ${escapeHTML(c.house)}</div>
            <h1 class="character-profile__title">${escapeHTML(c.name)}</h1>
            <div class="character-profile__meta">
              <a class="character-profile__house" href="#/house/${encodeURIComponent(c.house)}">${sigilSVG(houseSigilId(c.house), { size: 13 })} ${escapeHTML(c.house)}</a>
              <span class="character-profile__status character-profile__status--${c.status}">${c.status === 'alive' ? 'Alive' : 'Dead'}</span>
              <span class="character-profile__actor">Played by ${escapeHTML(c.actor)}</span>
            </div>
            <p class="character-profile__bio">${escapeHTML(c.bio)}</p>
          </div>
          <div class="character-profile__signal" aria-hidden="true"><span></span><span></span><span></span></div>
        </header>

        <nav class="tabs character-profile__tabs" aria-label="Character dossier sections">
          <button class="tab-btn active" data-tab="overview">Overview <span>01</span></button>
          <button class="tab-btn" data-tab="graph">Relations Graph <span>02</span></button>
          <button class="tab-btn" data-tab="timeline">Timeline <span>03</span></button>
        </nav>

        <div class="tab-panel active character-profile__panel" id="tab-overview">
          <div class="character-profile__section-head"><div><span class="character-profile__eyebrow">The web around them</span><h2>Relations</h2></div><span class="character-profile__section-count">${rels.length} recorded ties</span></div>
          <div class="character-profile__relations">${rels.length ? rels.map(r => `
            <a class="character-profile__relation" href="#/character/${r.other.id}">
              <span class="character-profile__relation-avatar">${avatarHTML(r.other, 42)}</span>
              <span class="character-profile__relation-copy"><strong>${escapeHTML(r.other.name)}</strong><small>${TYPE_ICON[r.rel.type]} ${escapeHTML(r.rel.label)}</small></span>
              <span class="character-profile__relation-arrow" aria-hidden="true">↗</span>
            </a>`).join("") : `<div class="character-profile__empty">No recorded relations.</div>`}</div>
          ${cq.length ? `<section class="character-profile__quotes"><div class="character-profile__section-head"><div><span class="character-profile__eyebrow">In their own words</span><h2>Quotes</h2></div><a href="#/quotes?quote=${encodeURIComponent(cq[0].id)}">Open quote archive <span aria-hidden="true">↗</span></a></div>${cq.map(q => `<a class="character-profile__quote" href="#/quotes?quote=${encodeURIComponent(q.id)}"><span aria-hidden="true">“</span><span>${escapeHTML(q.text)}</span><small>Season ${q.season} · Open line ↗</small></a>`).join("")}</section>` : ""}
        </div>

        <div class="tab-panel character-profile__panel" id="tab-graph">
          <div class="character-profile__section-head"><div><span class="character-profile__eyebrow">One degree of separation</span><h2>Relations Graph</h2></div><span class="character-profile__section-count">Drag nodes · double-click to open</span></div>
          <p class="character-profile__helper" id="mini-graph-hint">Showing ${escapeHTML(c.name)} and their direct connections. Click a node to re-center the graph on them.</p>
          <div id="mini-graph-host" class="character-profile__graph"></div>
          <p id="mini-graph-profile-link" class="character-profile__graph-link"></p>
        </div>

        <div class="tab-panel character-profile__panel" id="tab-timeline">
          <div class="character-profile__section-head"><div><span class="character-profile__eyebrow">Across eight seasons</span><h2>Timeline</h2></div><span class="character-profile__section-count">${evs.length} recorded moments</span></div>
          <div id="char-timeline" class="character-profile__timeline">${evs.length ? evs.map(e => `
            <article class="character-profile__event"><div class="character-profile__event-season">S${e.season}</div><div><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.summary)}</p></div></article>`).join("") : `<div class="character-profile__empty">No major timeline events recorded for this character.</div>`}</div>
        </div>
      </div>
    </div>
  `;

  const film = app.querySelector("[data-character-film]");
  const filmStage = app.querySelector("[data-character-film-stage]");
  const filmScenes = [...app.querySelectorAll("[data-film-scene]")];
  const filmJumps = [...app.querySelectorAll("[data-film-jump]")];
  const filmProgress = app.querySelector("[data-film-progress]");
  const filmStatus = app.querySelector("[data-character-film-status]");
  const cinematicEnter = app.querySelector("[data-character-film-enter]");
  const filmFx = window.CharacterFilmFX && typeof window.CharacterFilmFX.mount === "function"
    ? window.CharacterFilmFX.mount(filmStage, { reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches })
    : null;
  const filmSound = window.CinematicSound ? window.CinematicSound.mount(filmStage) : null;
  const profileHeader = app.querySelector("#profile-header");
  let filmFrame = 0;
  let filmDestroyed = false;
  const filmOrder = ["title", "quote", "turn", "archive"];
  let previousFilmScene = "title";
  const updateFilm = () => {
    filmFrame = 0;
    if (filmDestroyed || !film) return;
    const rect = film.getBoundingClientRect();
    const runway = Math.max(1, film.offsetHeight - window.innerHeight);
    const progressValue = Math.max(0, Math.min(1, -rect.top / runway));
    const sceneIndex = Math.min(filmOrder.length - 1, Math.floor(progressValue * filmOrder.length));
    const sceneId = filmOrder[sceneIndex];
    filmStage.dataset.scene = sceneId;
    if (sceneId !== previousFilmScene) {
      previousFilmScene = sceneId;
      filmFx?.transition(sceneId);
      filmStage.dataset.cut = String(Date.now());
      window.setTimeout(() => filmStage.removeAttribute("data-cut"), 720);
    }
    filmStage.style.setProperty("--film-progress", progressValue.toFixed(4));
    if (filmProgress) filmProgress.style.transform = `scaleX(${progressValue})`;
    filmScenes.forEach(scene => scene.setAttribute("aria-hidden", scene.dataset.filmScene === sceneId ? "false" : "true"));
    filmJumps.forEach(button => button.setAttribute("aria-current", button.dataset.filmJump === sceneId ? "true" : "false"));
  };
  const scheduleFilm = () => {
    if (!filmFrame) filmFrame = requestAnimationFrame(updateFilm);
  };
  const jumpToFilmScene = sceneId => {
    const index = Math.max(0, filmOrder.indexOf(sceneId));
    const rect = film.getBoundingClientRect();
    const runway = Math.max(1, film.offsetHeight - window.innerHeight);
    window.scrollTo({ top: window.scrollY + rect.top + runway * (index / filmOrder.length + 0.012), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    window.history.replaceState(null, "", `#/character/${encodeURIComponent(c.id)}?chapter=${encodeURIComponent(filmOrder[index])}`);
    recordEngagement("character_chapter", { characterId: c.id, chapter: filmOrder[index] });
  };
  filmJumps.forEach(button => button.addEventListener("click", () => jumpToFilmScene(button.dataset.filmJump)));
  window.addEventListener("scroll", scheduleFilm, { passive: true });
  window.addEventListener("resize", scheduleFilm, { passive: true });
  scheduleFilm();
  if (requestedChapter) window.setTimeout(() => jumpToFilmScene(requestedChapter), 80);
  if (cinematicEnter && profileHeader) {
    cinematicEnter.addEventListener("click", () => {
      jumpToFilmScene("archive");
      if (filmStatus) filmStatus.textContent = "Dossier chapter selected";
      window.setTimeout(() => profileHeader.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 500);
    });
  }
  if (film) {
    const chromeObserver = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (!document.body.contains(film)) { chromeObserver.disconnect(); filmDestroyed = true; filmFx?.destroy(); filmSound?.destroy(); return; }
      document.body.classList.toggle("character-cinematic-route--archive", !entry.isIntersecting || entry.boundingClientRect.top < 0);
    }, { threshold: 0.08 });
    chromeObserver.observe(film);
    film.addEventListener("pointermove", event => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
      const bounds = filmStage.getBoundingClientRect();
      filmStage.style.setProperty("--film-pointer-x", (((event.clientX - bounds.left) / bounds.width) * 2 - 1).toFixed(3));
      filmStage.style.setProperty("--film-pointer-y", (((event.clientY - bounds.top) / bounds.height) * 2 - 1).toFixed(3));
    }, { passive: true });
  }

  // The mini-graph defaults to the profile's own character + their direct
  // (1-hop) connections. Clicking a neighboring node re-centers the graph
  // on them (fetching *their* 1-hop connections) instead of immediately
  // navigating away, so exploring the family/allegiance web doesn't mean
  // leaving the page on every click — a double-click (or the explicit link
  // under the graph) opens that character's full profile.
  function renderMiniGraph(centerId) {
    const center = getCharacter(centerId) || c;
    const centerRels = center.id === c.id ? rels : relationsFor(center.id);

    const hint = document.getElementById("mini-graph-hint");
    if (hint) hint.innerHTML = `Showing <strong style="color:${center.sigilColor}">${escapeHTML(center.name)}</strong> and their direct connections. Click a node to re-center the graph on them — double-click (or the link below) to open their full profile.`;
    const profileLink = document.getElementById("mini-graph-profile-link");
    if (profileLink) profileLink.innerHTML = center.id === c.id ? "" : `<a class="cta-pill" href="#/character/${center.id}">View ${escapeHTML(center.name)}'s profile <span class="arrow">&#8594;</span></a>`;

    const host = document.getElementById("mini-graph-host");
    host.innerHTML = "";
    const width = host.clientWidth || 700, height = host.clientHeight || 480;
    const svg = d3.select(host).append("svg").attr("width", width).attr("height", height);
    const zoomLayer = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.3, 4]).on("zoom", e => zoomLayer.attr("transform", e.transform)));

    const nodes = [{ ...center }, ...centerRels.map(r => ({ ...r.other }))];
    const links = centerRels.map(r => ({ source: center.id, target: r.other.id, type: r.rel.type, label: r.rel.label }));

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(110))
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(30));

    const link = zoomLayer.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", d => RELATION_STYLE[d.type].color)
      .attr("stroke-dasharray", d => RELATION_STYLE[d.type].dash)
      .attr("stroke-width", 1.6).attr("opacity", 0.75);
    link.append("title").text(d => d.label);

    const node = zoomLayer.append("g").selectAll("circle").data(nodes).join("circle")
      .attr("r", d => d.id === center.id ? 16 : 10)
      .attr("fill", d => d.sigilColor)
      .attr("opacity", d => d.status === "dead" ? 0.5 : 1)
      .attr("stroke", d => d.id === center.id ? "var(--accent)" : "#000")
      .attr("stroke-width", d => d.id === center.id ? 2.5 : 1)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
    node.append("title").text(d => d.id === center.id ? d.name : `${d.name} — click to re-center, double-click to open profile`);
    node.on("click", (e, d) => { if (d.id !== center.id) renderMiniGraph(d.id); });
    node.on("dblclick", (e, d) => { window.location.hash = "#/character/" + d.id; });

    const label = zoomLayer.append("g").selectAll("text").data(nodes).join("text")
      .text(d => d.name).attr("font-size", 10).attr("fill", "var(--text)")
      .attr("dx", 14).attr("dy", 4).style("pointer-events", "none");

    sim.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      label.attr("x", d => d.x).attr("y", d => d.y);
    });
  }

  app.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      app.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      app.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "graph" && typeof d3 !== "undefined") renderMiniGraph();
    });
  });
}

// ==========================================================================
// HOUSES DIRECTORY
// ==========================================================================
function viewHouses(app) {
  setTitle("Houses");
  const houses = Object.keys(HOUSE_COLORS);
  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:10px;">
        <h1 class="display">The Great Houses</h1>
        <p>Sigils, words, seats, and family trees for every house of Westeros — plus the Night's Watch and the Free Folk beyond the Wall.</p>
      </div>
      <div class="grid grid-narrow" id="house-grid"></div>
    </div>
  `;
  document.getElementById("house-grid").innerHTML = houses.map(h => {
    const info = HOUSE_INFO[h];
    const color = HOUSE_COLORS[h];
    const count = charactersByHouse(h).length;
    return `
    <a class="card house-card reveal" href="#/house/${encodeURIComponent(h)}" style="${cardAccentStyle(color)}">
      <div class="house-sigil" style="border-color:${color};background:${color}1c;color:${color};">${sigilSVG(info.sigil, { size: 34 })}</div>
      <h3 class="display" style="color:${color}">${h}</h3>
      <div class="words">"${info.words}"</div>
      <div class="seat">${info.seat}</div>
      <div class="count">${count} character${count === 1 ? '' : 's'}</div>
    </a>`;
  }).join("");
  observeReveals(app);
}

// ==========================================================================
// HOUSE PROFILE (family tree, timeline, members)
// ==========================================================================
function viewHouse(app, params) {
  const houseName = decodeURIComponent(params[0]);
  if (!houseName || !HOUSE_COLORS[houseName]) {
    app.innerHTML = `<div class="page-wrap"><div class="empty-state">House not found. <a href="#/houses">Back to Houses</a></div></div>`;
    setTitle("Not Found");
    return;
  }
  const color = HOUSE_COLORS[houseName];
  const info = HOUSE_INFO[houseName];
  setTitle("House " + houseName);

  const members = charactersByHouse(houseName);
  const evs = eventsForHouse(houseName);

  app.innerHTML = `
    <div class="page-wrap">
      <div id="house-header" class="hero illustrated ambient-glow" style="text-align:left;display:flex;gap:22px;align-items:center;padding:56px 0 26px;flex-wrap:wrap;--glow-color:${color};">
        <div class="hero-scene">${houseSceneSVG(color, info.sigil)}</div>
        <div id="house-sigil-big" style="width:92px;height:92px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid ${color};background:${color}1c;color:${color};flex-shrink:0;">${sigilSVG(info.sigil, { size: 46 })}</div>
        <div>
          <h1 class="display" style="color:${color}">House ${escapeHTML(houseName)}</h1>
          <div class="script-accent" style="text-align:left;color:${color};">"${escapeHTML(info.words)}"</div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:10px;font-size:0.85rem;color:var(--text-dim);">
            <span><strong style="color:var(--text);">Seat:</strong> ${escapeHTML(info.seat)}</span>
            <span><strong style="color:var(--text);">Region:</strong> ${escapeHTML(info.region)}</span>
            <span><strong style="color:var(--text);">By series end:</strong> ${escapeHTML(info.rulerEnd)}</span>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="tree">Family Tree</button>
        <button class="tab-btn" data-tab="timeline">Timeline</button>
        <button class="tab-btn" data-tab="members">Members</button>
      </div>

      <div class="tab-panel active" id="tab-tree">
        <p class="text-dim">Solid gold lines = family. Dashed pink = marriage. Grey = allegiance. Dashed red = conflict. Dotted blue = bond. Scroll/drag to pan, pinch or wheel to zoom.</p>
        <div id="tree-host" style="width:100%;height:560px;background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--radius);overflow:hidden;"></div>
        <div id="tree-unlinked"></div>
      </div>

      <div class="tab-panel" id="tab-timeline">
        <div id="house-timeline">${evs.length ? evs.map(e => `
          <div class="timeline-item" style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--panel-border);">
            <div class="season-badge" style="flex-shrink:0;font-family:'Cinzel',serif;color:var(--accent);font-size:0.8rem;width:62px;">S${e.season}</div>
            <div><h4 style="margin:0 0 4px;">${escapeHTML(e.title)}</h4><p style="margin:0;color:var(--text-dim);font-size:0.88rem;">${escapeHTML(e.summary)}</p></div>
          </div>`).join("") : `<div class="empty-state">No major timeline events recorded for this house.</div>`}</div>
      </div>

      <div class="tab-panel" id="tab-members">
        <div class="grid grid-narrow" id="member-grid">${members.map(mc => `
          <a class="card member-card" href="#/character/${mc.id}" style="display:flex;gap:10px;align-items:center;padding:12px;${cardAccentStyle(mc.sigilColor)}">
            ${avatarHTML(mc, 42)}
            <div>
              <div class="name" style="font-family:'Cinzel',serif;font-size:0.9rem;color:${mc.sigilColor}">${escapeHTML(mc.name)}</div>
              <span class="badge ${mc.status}">${mc.status}</span>
            </div>
          </a>
        `).join("") || `<div class="empty-state">No known members.</div>`}</div>
      </div>
    </div>
  `;

  app.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      app.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      app.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "tree" && typeof d3 !== "undefined") renderFamilyTree(houseName, color);
    });
  });

  if (typeof d3 !== "undefined") renderFamilyTree(houseName, color);
}

// ---------- Family tree (fixed): only build branches from characters that
// actually have a recorded parent/child link — fully isolated members (no
// family-subtype edge at all) are excluded from the tree layout and listed
// separately instead, so the tree no longer degenerates into dozens of
// single-node spokes fanning off one root. ----------
function buildFamilyHierarchy(house) {
  const houseChars = charactersByHouse(house);
  const houseIds = new Set(houseChars.map(c => c.id));
  const parentSubtypeEdges = relations.filter(r => r.type === "family" && r.subtype === "parent" && houseIds.has(r.source) && houseIds.has(r.target));
  const childSubtypeEdges = relations.filter(r => r.type === "family" && r.subtype === "child" && houseIds.has(r.source) && houseIds.has(r.target))
    .map(r => ({ source: r.target, target: r.source }));
  const parentEdges = [...parentSubtypeEdges, ...childSubtypeEdges];
  const childIds = new Set(parentEdges.map(e => e.target));
  const parentIds = new Set(parentEdges.map(e => e.source));
  const linkedIds = new Set([...childIds, ...parentIds]);
  const roots = houseChars.filter(c => !childIds.has(c.id) && parentIds.has(c.id));

  function buildNode(char) {
    const children = parentEdges.filter(e => e.source === char.id).map(e => getCharacter(e.target)).filter(Boolean);
    return { ...char, children: children.map(buildNode) };
  }

  const unlinked = houseChars.filter(c => !linkedIds.has(c.id));

  if (roots.length === 0) return { hierarchy: null, unlinked };
  if (roots.length === 1) return { hierarchy: buildNode(roots[0]), unlinked };
  return {
    hierarchy: { id: "__root", name: house, house, sigilColor: HOUSE_COLORS[house], virtual: true, children: roots.map(buildNode) },
    unlinked
  };
}

function renderFamilyTree(houseName, color) {
  const host = document.getElementById("tree-host");
  const unlinkedMount = document.getElementById("tree-unlinked");
  host.innerHTML = "";
  const { hierarchy, unlinked } = buildFamilyHierarchy(houseName);

  if (unlinkedMount) {
    unlinkedMount.innerHTML = unlinked.length ? `
      <div class="section-title" style="font-size:1rem;margin-top:20px;">Other Members (no recorded parent/child link)</div>
      <div class="chip-row">${unlinked.map(c => `<a class="chip" href="#/character/${c.id}" style="color:${c.sigilColor};"><span class="swatch" style="background:${c.sigilColor}"></span>${escapeHTML(c.name)}</a>`).join("")}</div>
    ` : "";
  }

  if (!hierarchy) {
    host.innerHTML = `<div class="empty-state">No family tree data available for this house.</div>`;
    return;
  }
  const root = d3.hierarchy(hierarchy);
  const hostWidth = host.clientWidth || 900, hostHeight = host.clientHeight || 560;
  const svg = d3.select(host).append("svg").attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${hostWidth} ${hostHeight}`);
  const zoomLayer = svg.append("g");
  const zoomBehavior = d3.zoom().scaleExtent([0.3, 3]).on("zoom", e => zoomLayer.attr("transform", e.transform));
  svg.call(zoomBehavior);

  // Fixed per-sibling / per-generation spacing (not scaled by total node
  // count) so the layout doesn't balloon into a huge coordinate space —
  // then fit-to-view zoom centers whatever the tree's real extent is.
  d3.tree().nodeSize([34, 190])(root);

  const xExtent = d3.extent(root.descendants(), d => d.x);
  const yExtent = d3.extent(root.descendants(), d => d.y);
  const treeW = (yExtent[1] - yExtent[0]) + 160;
  const treeH = (xExtent[1] - xExtent[0]) + 60;
  const scale = Math.min(1, hostWidth / treeW, hostHeight / treeH);
  const tx = 70 - yExtent[0] * scale;
  const ty = (hostHeight / 2) - ((xExtent[0] + xExtent[1]) / 2) * scale;
  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

  zoomLayer.selectAll(".tree-link").data(root.links()).join("path")
    .attr("fill", "none").attr("stroke", "var(--panel-border)").attr("stroke-width", 1.6)
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

  const node = zoomLayer.selectAll(".tree-node").data(root.descendants()).join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .style("cursor", d => d.data.virtual ? "default" : "pointer");

  node.append("circle").attr("r", d => d.data.virtual ? 7 : 9).attr("fill", d => d.data.sigilColor)
    .attr("opacity", d => d.data.status === "dead" ? 0.45 : 1)
    .attr("stroke", "#000");
  node.append("text").attr("dy", 4).attr("x", 14).attr("fill", "var(--text)").style("font-size", "0.82rem").style("font-family", "Inter, sans-serif").text(d => d.data.name);
  node.filter(d => !d.data.virtual).on("click", (e, d) => { window.location.hash = "#/character/" + d.data.id; });

  const drawnIds = new Set(root.descendants().filter(d => !d.data.virtual).map(d => d.data.id));
  const posById = new Map(root.descendants().filter(d => !d.data.virtual).map(d => [d.data.id, d]));
  const crossLinks = relations.filter(r => r.type !== "family" && drawnIds.has(r.source) && drawnIds.has(r.target));
  zoomLayer.selectAll(".cross-link").data(crossLinks).join("path")
    .attr("fill", "none")
    .attr("stroke", d => RELATION_STYLE[d.type].color)
    .attr("stroke-dasharray", d => RELATION_STYLE[d.type].dash)
    .attr("stroke-width", 1.5).attr("opacity", 0.7)
    .attr("d", d => {
      const s = posById.get(d.source), t = posById.get(d.target);
      if (!s || !t) return "";
      return `M${s.y},${s.x} Q${(s.y + t.y) / 2},${(s.x + t.x) / 2 - 30} ${t.y},${t.x}`;
    })
    .append("title").text(d => d.label);
}

// ==========================================================================
// MAP
// ==========================================================================
function viewLegacyMap(app) {
  setTitle("Map of Westeros");

  const VB = (typeof MAP_VIEWBOX === "string") ? MAP_VIEWBOX : "-90 -60 880 1090";

  // ---- Parchment palette --------------------------------------------------
  // The map is deliberately a light object inside a dark site. Rather than
  // pretend that isn't a contrast, it is framed like a physical artefact: an
  // inked border, a gold hairline inset, and a vignette that darkens the
  // parchment towards its own edges so it settles into the page instead of
  // glaring out of it. See #map-frame in the stylesheet.
  const PAPER = "#e9dcbd", PAPER_DEEP = "#dccca6";
  const SEA = "#cbbd98", SEA_INK = "#a08a5f";
  const INK = "#4a3a24", INK_SOFT = "#6d5836";

  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero illustrated ambient-glow" style="padding-top:90px;padding-bottom:16px;">
        <div class="hero-scene">${mapSceneSVG()}</div>
        <h1 class="display">Map of Westeros</h1>
        <p>Drag to pan, scroll or pinch to zoom. Hover a region to see its ruling house, click to open its characters and history.</p>
      </div>
      <div id="map-layout">
        <div id="map-host">
          <div id="map-frame">
            <svg id="map-svg" viewBox="${VB}" role="img" aria-label="Map of the Seven Kingdoms of Westeros"></svg>
            <div id="map-controls">
              <button type="button" data-z="in" title="Zoom in" aria-label="Zoom in">+</button>
              <button type="button" data-z="out" title="Zoom out" aria-label="Zoom out">&minus;</button>
              <button type="button" data-z="reset" title="Reset view" aria-label="Reset view">&#8634;</button>
            </div>
            <div id="map-hint">Scroll to zoom &middot; drag to pan</div>
          </div>
        </div>
        <div id="map-side">
          <div id="region-detail">
            <div class="empty-state">Click a region on the map to explore it.</div>
          </div>
        </div>
      </div>
    </div>
    <div id="map-tooltip"></div>
  `;

  const svg = document.getElementById("map-svg");

  // ---- Terrain / settlement glyphs ---------------------------------------
  // Original line-art in the same spare, inked idiom as the site's sigils —
  // no emoji, no clip-art. Each is drawn around its own origin so it can be
  // dropped at a coordinate and scaled.
  const GLYPHS = `
    <g id="g-mountain" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round" fill="none" vector-effect="non-scaling-stroke">
      <path d="M-7,4 L-2.2,-5.4 L1,-0.6 L3,-3.4 L7,4 Z" fill="${PAPER_DEEP}"/>
      <path d="M-2.2,-5.4 L-0.4,4" stroke-width="0.5" opacity="0.65"/>
      <path d="M-4.6,-0.7 L-2.2,-2.2 L-0.2,-0.9" stroke-width="0.45" opacity="0.8"/>
    </g>
    <g id="g-forest" stroke="${INK}" stroke-width="0.6" stroke-linejoin="round" fill="none" vector-effect="non-scaling-stroke">
      <path d="M0,4.6 L0,1.6"/>
      <path d="M-3.4,2 L0,-4.8 L3.4,2 Z" fill="${PAPER_DEEP}"/>
      <path d="M-2.4,-0.4 L0,-2.6 L2.4,-0.4" stroke-width="0.45" opacity="0.75"/>
    </g>
    <g id="g-swamp" stroke="${INK_SOFT}" stroke-width="0.65" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke">
      <path d="M-5,2 q2.4,-1.8 4.8,0 q2.4,1.8 4.8,0"/>
      <path d="M-3.4,4 q2.4,-1.8 4.8,0"/>
      <path d="M-1.6,1.2 L-1.6,-3.4 M0.8,1.2 L0.8,-4.4 M3,1.2 L3,-2.8"/>
    </g>
    <g id="g-dune" stroke="${INK_SOFT}" stroke-width="0.6" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke">
      <path d="M-6,2.4 q3,-4.4 6,-1 q2.2,2.5 5,-0.6"/>
      <path d="M-3.6,4.4 q2.6,-2.6 5.4,-0.4"/>
    </g>
    <g id="g-keep" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round" fill="${PAPER}" vector-effect="non-scaling-stroke">
      <path d="M-2.6,3.2 L-2.6,-2 L-1.2,-2 L-1.2,-3.4 L0.2,-3.4 L0.2,-2 L2.6,-2 L2.6,3.2 Z"/>
    </g>
    <g id="g-castle" stroke="${INK}" stroke-width="0.75" stroke-linejoin="round" fill="${PAPER}" vector-effect="non-scaling-stroke">
      <path d="M-4.6,3.6 L-4.6,-1.6 L-3.4,-1.6 L-3.4,-3 L-2.2,-3 L-2.2,-1.6 L-0.6,-1.6 L-0.6,-3 L0.6,-3 L0.6,-1.6 L2.2,-1.6 L2.2,-3 L3.4,-3 L3.4,-1.6 L4.6,-1.6 L4.6,3.6 Z"/>
      <path d="M-1.1,3.6 L-1.1,0.8 L1.1,0.8 L1.1,3.6" stroke-width="0.5" fill="none"/>
    </g>
    <g id="g-city" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round" fill="${PAPER}" vector-effect="non-scaling-stroke">
      <path d="M-6,4 L-6,-1 L-4.2,-1 L-4.2,-2.6 L-2.6,-2.6 L-2.6,-1 L-1,-1 L-1,4 Z"/>
      <path d="M-0.4,4 L-0.4,-3.6 L1.2,-5.4 L2.8,-3.6 L2.8,4 Z"/>
      <path d="M3.2,4 L3.2,-0.4 L6,-0.4 L6,4 Z"/>
    </g>`;

  // ---- Defs ---------------------------------------------------------------
  // feTurbulence supplies the paper grain and the slight tremble on the ink
  // coastline, which is what stops the generated vectors from looking
  // machine-plotted.
  const defs = `
    <defs>
      <filter id="paper-grain" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="11" result="n"/>
        <feColorMatrix in="n" type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
      </filter>
      <filter id="paper-blotch" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="3" seed="4" result="n"/>
        <feColorMatrix in="n" type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.42"/></feComponentTransfer>
      </filter>
      <filter id="ink-wobble" x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <pattern id="sea-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(34)">
        <line x1="0" y1="0" x2="0" y2="9" stroke="${SEA_INK}" stroke-width="0.6" opacity="0.30"/>
      </pattern>
      <pattern id="sea-hatch-fine" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="${SEA_INK}" stroke-width="0.35" opacity="0.16"/>
      </pattern>
      <radialGradient id="map-vignette" cx="50%" cy="47%" r="72%">
        <stop offset="55%" stop-color="#000" stop-opacity="0"/>
        <stop offset="82%" stop-color="#1a1206" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#0b0703" stop-opacity="0.72"/>
      </radialGradient>
      <clipPath id="land-clip"><path d="${MAP_LANDMASS_OUTLINE}"/></clipPath>
      ${GLYPHS}
    </defs>`;

  // ---- Layers -------------------------------------------------------------
  const [vx, vy, vw, vh] = VB.split(/\s+/).map(Number);

  const seaLayer = `
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${SEA}"/>
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#sea-hatch)"/>
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#sea-hatch-fine)"/>`;

  // Concentric offset strokes just outside the coast read as the drawn
  // "shore lines" of an engraved map.
  const shoreLines = [5, 10, 16].map((w, i) =>
    `<path d="${MAP_LANDMASS_OUTLINE}" fill="none" stroke="${SEA_INK}" stroke-width="${w * 2}"
       opacity="${0.13 - i * 0.035}" filter="url(#ink-wobble)"/>`).join("");

  const regionPaths = MAP_REGIONS.map(r => {
    const c = getHouseColor(r.house);
    return `<path class="region-poly" data-id="${r.id}" d="${r.path}"
      fill="${c}" fill-opacity="0.26" stroke="${INK_SOFT}" stroke-width="0.7"
      stroke-dasharray="3.5 2.5" vector-effect="non-scaling-stroke"/>`;
  }).join("");

  const terrainLayer = `<g id="map-terrain" clip-path="url(#land-clip)">` +
    MAP_TERRAIN.map(g =>
      `<use href="#g-${g.t}" transform="translate(${g.x} ${g.y}) scale(${g.s})"/>`).join("") +
    `</g>`;

  // The Wall is built, not natural, so it gets a ruled crenellated band
  // rather than the hand-wobbled terrain treatment.
  const wallLayer = `
    <g id="map-wall">
      <line x1="52" y1="195" x2="654" y2="195" stroke="#dceaf1" stroke-width="8.5" opacity="0.95"/>
      <line x1="52" y1="195" x2="654" y2="195" stroke="#7ea7bd" stroke-width="8.5"
            stroke-dasharray="2.2 6" opacity="0.55"/>
      <line x1="52" y1="190.8" x2="654" y2="190.8" stroke="${INK}" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
      <line x1="52" y1="199.2" x2="654" y2="199.2" stroke="${INK}" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
    </g>`;

  const settlementLayer = `<g id="map-settlements">` + MAP_SETTLEMENTS.map(s => `
    <g class="settlement" data-kind="${s.kind}">
      <use href="#g-${s.kind}" transform="translate(${s.x} ${s.y}) scale(${s.kind === 'city' ? 1 : 1.1})"/>
      <text class="settlement-label" x="${s.x + (s.kind === 'city' ? 8 : 6)}" y="${s.y + 3.4}">${escapeHTML(s.name)}</text>
    </g>`).join("") + `</g>`;

  const regionLabelLayer = `<g id="map-region-labels">` + MAP_REGIONS.map(r => {
    const [lx, ly] = r.labelXY || r.seatXY;
    return `<text class="region-label" data-base="${r.labelSize || 13}" x="${lx}" y="${ly}"
      font-size="${r.labelSize || 13}">${escapeHTML(r.name.toUpperCase())}</text>`;
  }).join("") + `</g>`;

  const seaLabelLayer = `<g id="map-sea-labels">` + MAP_SEA_LABELS.map(s =>
    `<text class="sea-label" x="${s.x}" y="${s.y}" font-size="${s.size}"
       transform="rotate(${s.rot} ${s.x} ${s.y})">${escapeHTML(s.name)}</text>`).join("") + `</g>`;

  svg.innerHTML = `
    ${defs}
    <g id="map-zoom">
      ${seaLayer}
      ${shoreLines}
      <path d="${MAP_LANDMASS_OUTLINE}" fill="#000" opacity="0.16" transform="translate(4 6)"/>
      <path d="${MAP_ISLETS}" fill="${PAPER}" stroke="${INK}" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
      <path d="${MAP_LANDMASS_OUTLINE}" fill="${PAPER}"/>
      <g id="map-regions">${regionPaths}</g>
      ${terrainLayer}
      ${wallLayer}
      <path d="${MAP_LANDMASS_OUTLINE}" fill="none" stroke="${INK}" stroke-width="1.6"
            filter="url(#ink-wobble)" vector-effect="non-scaling-stroke" pointer-events="none"/>
      ${settlementLayer}
      ${seaLabelLayer}
      ${regionLabelLayer}
      <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" filter="url(#paper-blotch)"
            style="mix-blend-mode:multiply" opacity="0.30" pointer-events="none"/>
      <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" filter="url(#paper-grain)"
            style="mix-blend-mode:multiply" opacity="0.16" pointer-events="none"/>
    </g>
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#map-vignette)" pointer-events="none"/>
  `;

  // ---- Zoom & pan ---------------------------------------------------------
  // Labels are counter-scaled as you zoom in so they stay a readable size on
  // screen instead of ballooning, and settlement names only appear once
  // there is room for them — the standard cartographic decluttering trick.
  const zoomG = d3.select("#map-zoom");
  const svgSel = d3.select(svg);
  const zoom = d3.zoom()
    .scaleExtent([1, 9])
    .translateExtent([[vx, vy], [vx + vw, vy + vh]])
    .on("zoom", (event) => {
      const k = event.transform.k;
      zoomG.attr("transform", event.transform);
      svg.classList.toggle("zoomed-in", k >= 1.7);
      document.querySelectorAll("#map-region-labels .region-label").forEach(t => {
        const base = Number(t.dataset.base) || 13;
        t.setAttribute("font-size", (base / Math.pow(k, 0.72)).toFixed(2));
        t.style.opacity = k > 4.2 ? "0.25" : "";
      });
      document.querySelectorAll(".settlement-label").forEach(t => {
        t.setAttribute("font-size", (6.4 / Math.pow(k, 0.85)).toFixed(2));
      });
      document.querySelectorAll(".sea-label").forEach(t => {
        t.style.opacity = k > 3 ? "0" : "";
      });
    });
  svgSel.call(zoom);

  document.getElementById("map-controls").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.z === "reset") svgSel.transition().duration(420).call(zoom.transform, d3.zoomIdentity);
    else svgSel.transition().duration(260).call(zoom.scaleBy, btn.dataset.z === "in" ? 1.6 : 1 / 1.6);
  });

  // ---- Interaction (unchanged behaviour: hover tooltip, click to open) ----
  const tip = document.getElementById("map-tooltip");
  function showTooltip(e, region) {
    tip.innerHTML = `<strong style="color:${getHouseColor(region.house)}">${escapeHTML(region.name)}</strong><br>Seat: ${escapeHTML(region.seat)}<br>Controlled by House ${escapeHTML(region.house)}`;
    tip.style.display = "block";
    moveTooltip(e);
  }
  function moveTooltip(e) {
    const pad = 16;
    const w = tip.offsetWidth || 200;
    tip.style.left = Math.min(e.clientX + pad, window.innerWidth - w - 10) + "px";
    tip.style.top = (e.clientY + 12) + "px";
  }
  function hideTooltip() { tip.style.display = "none"; }

  svg.querySelectorAll(".region-poly").forEach(poly => {
    const region = MAP_REGIONS.find(r => r.id === poly.dataset.id);
    poly.addEventListener("mouseenter", (e) => { poly.classList.add("hovered"); showTooltip(e, region); });
    poly.addEventListener("mousemove", moveTooltip);
    poly.addEventListener("mouseleave", () => { poly.classList.remove("hovered"); hideTooltip(); });
    poly.addEventListener("click", () => selectRegion(region.id));
  });

  function selectRegion(id) {
    svg.querySelectorAll(".region-poly").forEach(p => p.classList.toggle("selected", p.dataset.id === id));
    const region = MAP_REGIONS.find(r => r.id === id);
    if (!region) return;
    const rcolor = getHouseColor(region.house);
    const members = charactersByHouse(region.house).slice(0, 12);
    const evs = eventsForHouse(region.house).slice(0, 6);

    document.getElementById("region-detail").innerHTML = `
      <h2 class="display" style="color:${rcolor};display:flex;align-items:center;gap:10px;">${sigilSVG(houseSigilId(region.house), { size: 24 })} ${escapeHTML(region.name)}</h2>
      <div class="sub text-dim" style="margin-bottom:10px;">Seat: ${escapeHTML(region.seat)} · House ${escapeHTML(region.house)}</div>
      <p class="text-dim" style="font-size:0.88rem;">${escapeHTML(region.blurb)}</p>
      <a class="cta-pill" style="margin:8px 0;" href="#/house/${encodeURIComponent(region.house)}">View House ${escapeHTML(region.house)} <span class="arrow">&#8594;</span></a>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;max-height:260px;overflow-y:auto;">
        ${members.map(c => `
          <a style="display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text);" href="#/character/${c.id}">
            ${avatarHTML(c, 30)}
            <span style="font-size:0.85rem;">${escapeHTML(c.name)}</span>
          </a>`).join("") || `<div class="text-dim">No notable characters recorded.</div>`}
      </div>
      <div style="margin-top:14px;">
        <h3 style="font-size:1rem;">Notable Events</h3>
        ${evs.length ? evs.map(e => `
          <div class="timeline-item" style="padding:8px 0;">
            <div class="season-badge" style="color:var(--accent);font-family:'Cinzel',serif;font-size:0.75rem;">S${e.season}</div>
            <div><strong>${escapeHTML(e.title)}</strong><p style="margin:2px 0 0;color:var(--text-dim);font-size:0.82rem;">${escapeHTML(e.summary)}</p></div>
          </div>`).join("") : `<div class="text-dim" style="font-size:0.85rem;">No major events recorded.</div>`}
      </div>
    `;
  }
}

function viewMap(app, params, query) {
  if (!window.WorldAtlas) {
    viewMapLegacy(app, params, query);
    return;
  }

  setTitle("World");
  app.innerHTML = `<div id="world-atlas-root" class="encyclopedia-feature-host"></div>`;
  const root = document.getElementById("world-atlas-root");
  let rememberedSeason = 1;
  try { rememberedSeason = Number(window.sessionStorage.getItem("got-last-season")) || 1; } catch (error) { /* optional */ }
  try {
    const handle = window.WorldAtlas.mount(root, {
      initialSeason: Number(query.get("season")) || (Number.isInteger(rememberedSeason) && rememberedSeason >= 1 && rememberedSeason <= 8 ? rememberedSeason : 1),
      initialMode: query.get("mode") || "atlas",
      onNavigate: navigateFeatureTarget
    });
    registerActiveView(handle);
  } catch (error) {
    console.error("The World experience could not be mounted.", error);
    viewMapLegacy(app, params, query);
  }
}

function viewMapLegacy(app) {
  setTitle("Living Realm");
  if (!window.LivingRealmMap) {
    viewLegacyMap(app);
    return;
  }

  app.innerHTML = `
    <div class="living-map-page page-wrap">
      <header class="living-map-hero">
        <p class="living-map-hero__eyebrow">The realm remembers</p>
        <div>
          <h1>The Living Realm</h1>
          <p>Move through all eight seasons to see where power shifted, armies collided, and the story changed course. Every plotted point is tied to an explicit place in the site's records.</p>
        </div>
        <dl class="living-map-hero__facts" aria-label="Map features">
          <div><dt>8</dt><dd>seasons</dd></div>
          <div><dt>${MAP_REGIONS.length}</dt><dd>regions</dd></div>
          <div><dt>${battles.length}</dt><dd>battle records</dd></div>
        </dl>
      </header>
      <div id="living-realm-root"></div>
    </div>
  `;

  registerActiveView(window.LivingRealmMap.mount(document.getElementById("living-realm-root"), {
    initialSeason: 1,
    onNavigate(hash) { window.location.hash = hash; }
  }));
}
// ==========================================================================
// TIMELINE
// ==========================================================================
function viewTimeline(app, params, query) {
  if (!window.StoryAtlas) {
    viewTimelineLegacy(app, params, query);
    return;
  }

  setTitle("Stories");
  app.innerHTML = `<div id="story-atlas-root" class="encyclopedia-feature-host"></div>`;
  const root = document.getElementById("story-atlas-root");
  try {
    const handle = window.StoryAtlas.mount(root, {
      initialSeason: Number(query.get("season")) || undefined,
      initialEpisodeId: params[0] || query.get("episode") || "",
      initialEventId: query.get("event") || "",
      initialMode: query.get("mode") || "",
      onNavigate: navigateFeatureTarget
    });
    registerActiveView(handle);
  } catch (error) {
    console.error("The Stories experience could not be mounted.", error);
    viewTimelineLegacy(app, params, query);
  }
}

function viewTimelineLegacy(app) {
  setTitle("Timeline");
  const TYPE_COLOR = { battle: "#c23b3b", death: "#8a2f2f", wedding: "#d97ba0", coronation: "#d4af37", politics: "#4a90d9", birth: "#4c7a3f", other: "#8a8a93" };
  let activeSeason = "all", activeHouse = "", activeType = "";

  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:6px;">
        <h1 class="display">Timeline of Westeros</h1>
        <p>Scrub through the seasons and filter by house or event type to trace how the War of the Five Kings became the war for the dawn — and the war for the throne.</p>
      </div>
      <div id="season-scrubber" style="display:flex;gap:6px;flex-wrap:wrap;margin:20px 0;"></div>
      <div id="tl-filters" style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;align-items:center;">
        <label class="text-dim" style="font-size:0.85rem;">House:
          <select id="house-filter"><option value="">All</option></select>
        </label>
        <label class="text-dim" style="font-size:0.85rem;">Type:
          <select id="type-filter">
            <option value="">All</option>
            <option value="battle">Battle</option>
            <option value="death">Death</option>
            <option value="wedding">Wedding</option>
            <option value="coronation">Coronation</option>
            <option value="politics">Politics</option>
            <option value="other">Other</option>
          </select>
        </label>
        <span id="tl-count" class="text-dim" style="font-size:0.85rem;"></span>
      </div>
      <div id="tl-track" style="position:relative;margin-top:30px;padding-left:26px;border-left:2px solid var(--panel-border);"></div>
    </div>
  `;

  function initScrubber() {
    const mount = document.getElementById("season-scrubber");
    mount.innerHTML = `<button class="season-btn active" data-season="all">All Seasons</button>` +
      SEASONS.map(s => `<button class="season-btn" data-season="${s}">Season ${s}</button>`).join("");
    mount.querySelectorAll(".season-btn").forEach(btn => btn.addEventListener("click", () => {
      mount.querySelectorAll(".season-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSeason = btn.dataset.season;
      render();
    }));
  }

  function initFilters() {
    const houseSel = document.getElementById("house-filter");
    Object.keys(HOUSE_COLORS).forEach(h => {
      const opt = document.createElement("option");
      opt.value = h; opt.textContent = h;
      houseSel.appendChild(opt);
    });
    houseSel.addEventListener("change", e => { activeHouse = e.target.value; render(); });
    document.getElementById("type-filter").addEventListener("change", e => { activeType = e.target.value; render(); });
  }

  function render() {
    const filtered = events.filter(e =>
      (activeSeason === "all" || e.season === Number(activeSeason)) &&
      (!activeHouse || e.houses.includes(activeHouse)) &&
      (!activeType || e.type === activeType)
    ).sort((a, b) => a.season - b.season);

    document.getElementById("tl-count").textContent = `${filtered.length} event${filtered.length === 1 ? '' : 's'}`;
    document.getElementById("tl-track").innerHTML = filtered.map(e => `
      <div class="tl-event reveal" style="position:relative;margin-bottom:26px;padding-left:20px;">
        <div class="season-tag" style="color:var(--accent);font-family:'Cinzel',serif;font-size:0.78rem;">SEASON ${e.season}</div>
        <h3 style="margin:4px 0 6px;">${escapeHTML(e.title)}</h3>
        <p style="margin:0;color:var(--text-dim);font-size:0.92rem;line-height:1.5;">${escapeHTML(e.summary)}</p>
        <span class="type-tag" style="display:inline-block;margin-top:6px;font-size:0.72rem;padding:2px 8px;border-radius:999px;border:1px solid var(--panel-border);color:${TYPE_COLOR[e.type]};border-color:${TYPE_COLOR[e.type]}66;">${e.type}</span>
        <div class="houses" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
          ${e.houses.map(h => `<a href="#/house/${encodeURIComponent(h)}" style="font-size:0.75rem;padding:2px 8px;border-radius:999px;border:1px solid;text-decoration:none;color:${getHouseColor(h)};border-color:${getHouseColor(h)}66;">${h}</a>`).join("")}
        </div>
      </div>
    `).join("") || `<div class="empty-state">No events match these filters.</div>`;
    document.querySelectorAll("#tl-track .tl-event::before").length; // no-op keep parity
    observeReveals(document.getElementById("tl-track"));
  }

  initScrubber(); initFilters(); render();
}

// ==========================================================================
// BATTLES
// ==========================================================================
function viewBattles(app, params, query) {
  setTitle("Battles & Events");
  const requestedBattleId = query.get("battle") || "";
  function pill(id) {
    const c = getCharacter(id);
    if (!c) return "";
    return `<a class="char-pill" style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 3px;border-radius:999px;background:var(--bg);border:1px solid var(--panel-border);font-size:0.76rem;text-decoration:none;color:var(--text);" href="#/character/${c.id}">${avatarHTML(c, 20)}${escapeHTML(c.name)}</a>`;
  }
  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:10px;">
        <h1 class="display">Battles &amp; Major Events</h1>
        <p>The turning points of the war for the Iron Throne — and the war for the dawn.</p>
      </div>
      <div class="grid grid-wide" id="battle-grid">
        ${battles.map(b => {
          const selected = b.id === requestedBattleId;
          return `
          <div class="card battle-card reveal" data-battle-id="${escapeHTML(b.id)}"${selected ? ` tabindex="-1"` : ""} style="padding:22px;${cardAccentStyle('#c23b3b')}${selected ? "border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);" : ""}">
            <h3 class="display" style="margin:0 0 4px;">${escapeHTML(b.name)}</h3>
            <div class="text-dim" style="font-size:0.82rem;margin-bottom:12px;">${escapeHTML(b.season)} · ${escapeHTML(b.location)}</div>
            ${b.combatants.map(c => `
              <div style="margin:10px 0;">
                <div class="text-dim" style="font-size:0.8rem;margin-bottom:4px;">${escapeHTML(c.side)}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">${c.characters.map(pill).join("")}</div>
              </div>
            `).join("")}
            <div style="margin-top:10px;font-size:0.88rem;">
              <strong style="color:var(--text);display:block;margin-bottom:2px;font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.5px;">Outcome</strong>
              <p style="margin:0;color:var(--text-dim);">${escapeHTML(b.outcome)}</p>
            </div>
            <div style="margin-top:8px;font-size:0.88rem;">
              <strong style="color:var(--text);display:block;margin-bottom:2px;font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.5px;">Casualties</strong>
              <p style="margin:0;color:var(--text-dim);">${escapeHTML(b.casualties)}</p>
            </div>
            <div style="margin-top:8px;font-size:0.88rem;">
              <strong style="color:var(--text);display:block;margin-bottom:2px;font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.5px;">Linked Characters</strong>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">${b.linkedCharacters.map(pill).join("")}</div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
  observeReveals(app);
  const requestedCard = [...app.querySelectorAll("[data-battle-id]")]
    .find(card => card.dataset.battleId === requestedBattleId);
  if (requestedCard) {
    window.requestAnimationFrame(() => {
      requestedCard.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      requestedCard.focus({ preventScroll: true });
    });
  }
}

// ==========================================================================
// QUIZ
// ==========================================================================
function viewQuiz(app) {
  setTitle("Quiz");
  const QUIZ_LENGTH = 10;
  let mode = "quote", questions = [], qIndex = 0, score = 0, answered = false;

  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
  function sample(arr, n) { return shuffle(arr).slice(0, n); }

  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:6px;">
        <h1 class="display">Test Your Knowledge</h1>
        <p>Ten questions per round. Pick a mode and see how well you truly know Westeros.</p>
      </div>
      <div id="mode-select" style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0 30px;">
        <div class="card mode-card active" data-mode="quote" style="flex:1 1 220px;padding:20px;text-align:center;cursor:pointer;">
          <div class="icon">${sigilSVG('trout', { size: 26 })}</div>
          <h3 class="display">Who Said It?</h3>
          <p class="text-dim" style="font-size:0.85rem;margin:0;">Match famous quotes to the character who said them.</p>
        </div>
        <div class="card mode-card" data-mode="sigil" style="flex:1 1 220px;padding:20px;text-align:center;cursor:pointer;">
          <div class="icon">${sigilSVG('crossed-swords', { size: 26 })}</div>
          <h3 class="display">Match the Sigil</h3>
          <p class="text-dim" style="font-size:0.85rem;margin:0;">Match a house's words and seat to its name.</p>
        </div>
        <div class="card mode-card" data-mode="tree" style="flex:1 1 220px;padding:20px;text-align:center;cursor:pointer;">
          <div class="icon">${sigilSVG('direwolf', { size: 26 })}</div>
          <h3 class="display">Family Tree</h3>
          <p class="text-dim" style="font-size:0.85rem;margin:0;">Identify how two characters are actually related.</p>
        </div>
      </div>
      <div id="quiz-area" style="max-width:640px;margin:0 auto;">
        <div id="quiz-hud" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;font-weight:600;">
          <span id="question-counter">Question 1 / 10</span>
          <span class="score">Score: <span id="score-display">0</span></span>
        </div>
        <div id="progress-bar" style="height:5px;background:var(--panel-border);border-radius:999px;overflow:hidden;margin-bottom:24px;"><div id="progress-fill" style="height:100%;background:var(--accent);width:0%;transition:width 0.25s;"></div></div>
        <div id="question-card" style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--radius);padding:26px;text-align:center;"></div>
        <div id="quiz-result" style="display:none;text-align:center;padding:40px 20px;"></div>
      </div>
    </div>
  `;

  function buildQuoteQuestions() {
    const pool = quotes.filter(q => getCharacter(q.characterId));
    return sample(pool, QUIZ_LENGTH).map(q => {
      const correct = getCharacter(q.characterId);
      const distractors = sample(characters.filter(c => c.id !== correct.id), 3);
      const options = shuffle([correct, ...distractors]);
      return { quote: q.text, prompt: "Who said this?", options: options.map(c => ({ label: c.name, correct: c.id === correct.id })) };
    });
  }
  function buildSigilQuestions() {
    const houseNames = Object.keys(HOUSE_COLORS).filter(h => HOUSE_INFO[h].words !== "—");
    return sample(houseNames, QUIZ_LENGTH).map(h => {
      const info = HOUSE_INFO[h];
      const distractors = sample(houseNames.filter(x => x !== h), 3);
      const options = shuffle([h, ...distractors]);
      return { prompt: `Whose house words are "${info.words}" and whose seat is ${info.seat}?`, options: options.map(name => ({ label: name, correct: name === h })) };
    });
  }
  function buildTreeQuestions() {
    const familyRels = relations.filter(r => r.type === "family" && getCharacter(r.source) && getCharacter(r.target));
    const pool = sample(familyRels, Math.min(QUIZ_LENGTH, familyRels.length));
    const allLabels = [...new Set(relations.map(r => r.label))];
    return pool.map(r => {
      const a = getCharacter(r.source), b = getCharacter(r.target);
      const distractors = sample(allLabels.filter(l => l !== r.label), 3);
      const options = shuffle([r.label, ...distractors]);
      return { prompt: `How is ${a.name} related to ${b.name}?`, options: options.map(l => ({ label: l, correct: l === r.label })) };
    });
  }

  function startQuiz() {
    score = 0; qIndex = 0; answered = false;
    questions = mode === "quote" ? buildQuoteQuestions() : mode === "sigil" ? buildSigilQuestions() : buildTreeQuestions();
    document.getElementById("quiz-result").style.display = "none";
    document.getElementById("question-card").style.display = "block";
    document.getElementById("quiz-hud").style.display = "flex";
    document.getElementById("progress-bar").style.display = "block";
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    const q = questions[qIndex];
    document.getElementById("question-counter").textContent = `Question ${qIndex + 1} / ${questions.length}`;
    document.getElementById("score-display").textContent = score;
    document.getElementById("progress-fill").style.width = `${(qIndex / questions.length) * 100}%`;

    document.getElementById("question-card").innerHTML = `
      ${q.quote ? `<div id="question-quote" style="font-family:'Cinzel',serif;font-style:italic;font-size:1.15rem;margin-bottom:20px;">"${escapeHTML(q.quote)}"</div>` : ""}
      <div id="question-prompt" style="font-size:1.1rem;margin-bottom:22px;line-height:1.5;">${escapeHTML(q.prompt)}</div>
      <div id="answer-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${q.options.map((o, i) => `<button class="answer-btn" style="padding:14px;font-size:0.92rem;text-align:left;" data-i="${i}">${escapeHTML(o.label)}</button>`).join("")}
      </div>
    `;
    document.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => selectAnswer(Number(btn.dataset.i)));
    });
  }

  function selectAnswer(i) {
    if (answered) return;
    answered = true;
    const q = questions[qIndex];
    const correctIndex = q.options.findIndex(o => o.correct);
    if (i === correctIndex) {
      score++;
      const sd = document.getElementById("score-display");
      sd.textContent = score;
      sd.classList.remove("score-bump"); void sd.offsetWidth; sd.classList.add("score-bump");
    }
    document.querySelectorAll(".answer-btn").forEach((btn, idx) => {
      if (idx === correctIndex) btn.classList.add("correct");
      else if (idx === i) btn.classList.add("wrong");
      btn.disabled = true;
    });
    setTimeout(() => {
      qIndex++;
      if (qIndex >= questions.length) finishQuiz();
      else renderQuestion();
    }, 900);
  }

  function finishQuiz() {
    document.getElementById("progress-fill").style.width = "100%";
    document.getElementById("question-card").style.display = "none";
    const pct = Math.round((score / questions.length) * 100);
    const verdict = pct === 100 ? "A true student of the Citadel." : pct >= 70 ? "You know your Westeros." : pct >= 40 ? "You've watched it at least once." : "Winter came for you.";
    document.getElementById("quiz-result").style.display = "block";
    document.getElementById("quiz-result").innerHTML = `
      <div class="text-dim">Round complete</div>
      <div class="big-score" style="font-family:'Cinzel',serif;font-size:3rem;color:var(--accent);margin:10px 0;">${score} / ${questions.length}</div>
      <p class="text-dim">${verdict}</p>
      <button class="primary" id="replay-btn">Play Again</button>
    `;
    document.getElementById("replay-btn").addEventListener("click", startQuiz);
  }

  app.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
      app.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      mode = card.dataset.mode;
      startQuiz();
    });
  });

  startQuiz();
}

// ==========================================================================
// VOICES OF THE REALM
// ==========================================================================
function viewQuotes(app, params, query) {
  setTitle("Voices of the Realm");
  let activeQuery = "", activeHouse = "", activeSeason = "";
  let activeCollection = query.get("quote") ? "all" : "featured";
  let spotlightIndex = new Date().getDate();
  const requestedQuoteId = query.get("quote") || "";
  const featuredIds = new Set(Array.isArray(window.FEATURED_QUOTE_IDS) ? window.FEATURED_QUOTE_IDS : []);
  const collections = Array.isArray(window.QUOTE_COLLECTIONS) ? window.QUOTE_COLLECTIONS : [];
  const collectionByQuote = new Map();
  collections.forEach(collection => collection.quoteIds.forEach(id => {
    if (!collectionByQuote.has(id)) collectionByQuote.set(id, []);
    collectionByQuote.get(id).push(collection.label);
  }));
  const interludeIds = (Array.isArray(window.FEATURED_QUOTE_IDS) ? window.FEATURED_QUOTE_IDS : ["q5", "q13", "q2", "q7", "q10"]).slice(0, 5);
  const interludeContext = {
    q5: "The crown turns every private fear into a public game.",
    q13: "A lesson in how the room changes when everyone believes a lie.",
    q2: "Duty is not inherited. It is paid for, one sentence at a time.",
    q7: "A queen names the machine she intends to break.",
    q10: "At the edge of death, courage becomes a choice made aloud."
  };
  const fanMoments = Array.isArray(window.FAN_MOMENTS) ? window.FAN_MOMENTS : [];
  const fanMomentForQuote = quoteId => fanMoments.find(moment => moment.quoteId === quoteId) || null;

  app.innerHTML = `
    <section class="voices-film" id="voices-film" aria-labelledby="voices-film-title">
      <div class="voices-film__backdrop" aria-hidden="true"></div>
      <div class="voices-film__grain" aria-hidden="true"></div>
      <div class="voices-film__inner">
        <div class="voices-film__masthead"><span class="voices-kicker">A cinematic interlude</span><button class="voices-sound-toggle" type="button" data-cinematic-sound aria-pressed="false">Sound off</button></div>
        <p class="voices-film__eyebrow">A fan's shelf · Words That Moved the Realm</p>
        <h1 id="voices-film-title">The lines fans still carry.</h1>
        <p class="voices-film__fan-note">For the moments we quote before we remember the episode title.</p>
        <div class="voices-film__quote" data-voices-film-quote></div>
        <div class="voices-film__controls"><button type="button" class="voices-button voices-button--ghost" data-voices-prev aria-label="Previous quote">← Previous</button><div class="voices-film__dots" role="tablist" aria-label="Featured quote interludes"></div><button type="button" class="voices-button voices-button--ghost" data-voices-next aria-label="Next quote">Next →</button></div>
      </div>
    </section>
    <div class="voices-archive" id="voices-archive">
      <div class="voices-hero">
        <div class="voices-hero__eyebrow"><span class="voices-hero__rule"></span>Words carry farther than ravens</div>
        <h1 class="voices-hero__title">Voices of the Realm</h1>
        <p class="voices-hero__dek">A fan-curated wall of promises, threats, jokes, and last words. Find the line you came for, then follow the speaker, the house, and the moment that made it stick.</p>
        <div class="voices-hero__stats" aria-label="Quote archive statistics">
          <span><strong>${quotes.length}</strong> recorded lines</span>
          <span><strong>8</strong> seasons</span>
          <span><strong>${featuredIds.size || 10}</strong> featured voices</span>
        </div>
      </div>

      <section class="voices-memory-rail" aria-labelledby="voices-memory-title">
        <div class="voices-memory-rail__intro"><span class="voices-kicker">The memory behind the line</span><h2 id="voices-memory-title">A quote is never only a quote.</h2><p>Open the scene, the consequence, and the feeling that made a sentence survive the credits.</p></div>
        <div class="voices-memory-rail__cards">${fanMoments.slice(0, 4).map(moment => `<a class="voices-memory-card" href="#/quotes?quote=${escapeHTML(moment.quoteId)}" style="--voices-memory-image:url('${escapeHTML(moment.image)}')"><span class="voices-memory-card__image" aria-hidden="true"></span><span class="voices-memory-card__veil" aria-hidden="true"></span><span class="voices-memory-card__kicker">${escapeHTML(moment.kicker)}</span><strong>${escapeHTML(moment.title)}</strong><small>${escapeHTML(moment.location)}</small><span class="voices-memory-card__link">Enter the moment <span aria-hidden="true">↗</span></span></a>`).join("")}</div>
      </section>

      <section class="voices-spotlight" aria-label="Quote spotlight">
        <div class="voices-spotlight__meta"><span class="voices-kicker">The line of the night</span><button class="voices-button voices-button--ghost" type="button" id="voices-surprise">Surprise me <span aria-hidden="true">↗</span></button></div>
        <div class="voices-spotlight__body" id="voices-spotlight-body"></div>
      </section>

      <div class="voices-archive__layout">
        <aside class="voices-sidebar" aria-label="Quote archive filters">
          <div class="voices-sidebar__label">Browse by mood</div>
          <div class="voices-collections" id="voices-collections" role="group" aria-label="Quote collections"></div>
          <div class="voices-sidebar__label voices-sidebar__label--filters">Refine the archive</div>
          <label class="voices-field"><span>Search the words</span><input type="search" id="voices-search" placeholder="Try “winter” or “ladder”" autocomplete="off"></label>
          <label class="voices-field"><span>House</span><select id="voices-house"><option value="">All houses</option></select></label>
          <label class="voices-field"><span>Season</span><select id="voices-season"><option value="">All seasons</option>${Array.from({ length: 8 }, (_, i) => `<option value="${i + 1}">Season ${i + 1}</option>`).join("")}</select></label>
          <p class="voices-sidebar__note">Quotes are attributed to the season in which they appear. Episode-level context lives in the Story Atlas.</p>
        </aside>

        <section class="voices-results" aria-labelledby="voices-results-title">
          <div class="voices-results__head">
            <div><span class="voices-kicker">The archive</span><h2 id="voices-results-title">Every word leaves a mark</h2></div>
            <div id="voices-count" class="voices-count" aria-live="polite"></div>
          </div>
          <div class="voices-grid" id="voices-grid"></div>
          <div class="voices-status" id="voices-status" role="status" aria-live="polite"></div>
        </section>
      </div>
    </div>
  `;

  const root = document.getElementById("voices-archive");
  const spotlightBody = root.querySelector("#voices-spotlight-body");
  const quoteGrid = root.querySelector("#voices-grid");
  const count = root.querySelector("#voices-count");
  const status = root.querySelector("#voices-status");
  const filmRoot = document.getElementById("voices-film");
  const filmQuote = filmRoot.querySelector("[data-voices-film-quote]");
  const filmDots = filmRoot.querySelector(".voices-film__dots");
  const soundHandle = window.CinematicSound ? window.CinematicSound.mount(filmRoot) : null;
  let filmIndex = 0;

  const savedQuoteIds = new Set((() => {
    try { return JSON.parse(window.localStorage.getItem("got-saved-quotes") || "[]"); } catch (error) { return []; }
  })());
  const quoteHref = quote => {
    const episode = episodeForQuote(quote);
    const memory = fanMomentForQuote(quote.id);
    return episode ? `#/episode/${encodeURIComponent(episode.id)}` : `#/quotes?quote=${encodeURIComponent(quote.id)}`;
  };
  const toggleSavedQuote = quote => {
    if (savedQuoteIds.has(quote.id)) savedQuoteIds.delete(quote.id);
    else savedQuoteIds.add(quote.id);
    try { window.localStorage.setItem("got-saved-quotes", JSON.stringify([...savedQuoteIds])); } catch (error) { /* optional */ }
    recordEngagement("quote_saved", { quoteId: quote.id, saved: savedQuoteIds.has(quote.id) });
  };

  function renderQuoteFilm() {
    const quote = interludeIds.map(id => quotes.find(item => item.id === id)).find(Boolean) && quotes.find(item => item.id === interludeIds[filmIndex % interludeIds.length]);
    if (!quote) return;
    const c = getCharacter(quote.characterId);
    const themes = collectionByQuote.get(quote.id) || [];
    const episode = episodeForQuote(quote);
    const saved = savedQuoteIds.has(quote.id);
    filmQuote.innerHTML = `<span class="voices-film__mark" aria-hidden="true">“</span><blockquote>${escapeHTML(quote.text)}</blockquote><div class="voices-film__speaker"><div class="voices-film__portrait">${avatarHTML(c, 58)}</div><div><strong>${escapeHTML(c ? c.name : "Unknown voice")}</strong><span>${escapeHTML(c ? c.house : "The realm")} · Season ${quote.season}</span></div></div><p class="voices-film__context">${escapeHTML(memory ? memory.fanNote : (interludeContext[quote.id] || "A line remembered long after the scene has ended."))}</p><p class="voices-film__episode">${episode ? `Episode context · ${escapeHTML(episode.id.toUpperCase())} · ${escapeHTML(episode.title)}` : `Season ${quote.season} · Featured voice`} ${memory ? `· ${escapeHTML(memory.location)}` : (themes.length ? `· ${escapeHTML(themes[0])}` : "")}</p><div class="voices-film__actions"><a class="voices-button voices-button--solid" href="${escapeHTML(quoteHref(quote))}">Explore this moment <span aria-hidden="true">↗</span></a><button type="button" class="voices-button voices-button--ghost" data-save-film-quote="${escapeHTML(quote.id)}" aria-pressed="${String(saved)}">${saved ? "Saved line" : "Remember this line"}</button></div>`;
    filmRoot.dataset.quoteId = quote.id;
    filmDots.innerHTML = interludeIds.map((id, index) => `<button type="button" role="tab" class="voices-film__dot" data-voices-index="${index}" aria-label="Quote ${index + 1}" aria-selected="${String(index === filmIndex)}"><span aria-hidden="true">0${index + 1}</span></button>`).join("");
  }
  renderQuoteFilm();
  filmRoot.addEventListener("click", event => {
    const dot = event.target.closest("[data-voices-index]");
    if (dot) { filmIndex = Number(dot.dataset.voicesIndex) || 0; renderQuoteFilm(); return; }
    const saveButton = event.target.closest("[data-save-film-quote]");
    if (saveButton) {
      const quote = quotes.find(item => item.id === saveButton.dataset.saveFilmQuote);
      if (quote) { toggleSavedQuote(quote); renderQuoteFilm(); }
      return;
    }
    if (event.target.closest("[data-voices-prev]")) { filmIndex = (filmIndex - 1 + interludeIds.length) % interludeIds.length; renderQuoteFilm(); return; }
    if (event.target.closest("[data-voices-next]")) { filmIndex = (filmIndex + 1) % interludeIds.length; renderQuoteFilm(); }
  });

  function quoteMatchesCollection(qt) {
    if (activeCollection === "featured") return featuredIds.has(qt.id);
    if (activeCollection === "all") return true;
    const collection = collections.find(item => item.id === activeCollection);
    return Boolean(collection && collection.quoteIds.includes(qt.id));
  }

  function matchingQuotes() {
    const q = activeQuery.trim().toLowerCase();
    return quotes.filter(qt => {
      const c = getCharacter(qt.characterId);
      if (!c || !quoteMatchesCollection(qt)) return false;
      if (activeHouse && c.house !== activeHouse) return false;
      if (activeSeason && String(qt.season) !== activeSeason) return false;
      if (q && !qt.text.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function renderCollections() {
    const items = [{ id: "featured", label: "Featured voices", description: "The lines everyone remembers." }, { id: "all", label: "All voices", description: "Every recorded line." }, ...collections];
    root.querySelector("#voices-collections").innerHTML = items.map(item => `
      <button type="button" class="voices-collection${activeCollection === item.id ? " is-active" : ""}" data-voices-collection="${escapeHTML(item.id)}" aria-pressed="${activeCollection === item.id}">
        <span class="voices-collection__label">${escapeHTML(item.label)}</span><span class="voices-collection__description">${escapeHTML(item.description)}</span>
      </button>`).join("");
  }

  function renderSpotlight(filtered) {
    if (!filtered.length) {
      spotlightBody.innerHTML = `<div class="voices-spotlight__empty">No voice answers that search. Try another collection.</div>`;
      return;
    }
    const spotlightPool = filtered.filter(qt => featuredIds.has(qt.id));
    const pool = spotlightPool.length ? spotlightPool : filtered;
    const quote = pool[spotlightIndex % pool.length];
    const c = getCharacter(quote.characterId);
    const themes = collectionByQuote.get(quote.id) || [];
    spotlightBody.innerHTML = `
      <div class="voices-spotlight__quote"><span class="voices-spotlight__mark" aria-hidden="true">“</span><blockquote id="voices-spotlight-title">${escapeHTML(quote.text)}</blockquote><div class="voices-spotlight__tags"><span>S${quote.season}</span>${themes.slice(0, 2).map(theme => `<span>${escapeHTML(theme)}</span>`).join("")}</div></div>
      <div class="voices-spotlight__speaker">
        <div class="voices-spotlight__portrait">${avatarHTML(c, 68)}</div><div><span class="voices-kicker">Spoken by</span><a href="#/character/${c.id}">${escapeHTML(c.name)}</a><span>${escapeHTML(c.house)}</span></div>
        <a class="voices-button voices-button--solid" href="#/quotes?quote=${encodeURIComponent(quote.id)}">Open line <span aria-hidden="true">→</span></a>
      </div>`;
  }

  function renderCards(filtered) {
    count.textContent = `${filtered.length} ${filtered.length === 1 ? "line" : "lines"}`;
    quoteGrid.innerHTML = filtered.map(qt => {
      const c = getCharacter(qt.characterId);
      const selected = qt.id === requestedQuoteId;
      const themes = collectionByQuote.get(qt.id) || [];
      const memory = fanMomentForQuote(qt.id);
      return `
        <article class="voices-card${selected ? " is-selected" : ""}" data-quote-id="${escapeHTML(qt.id)}"${selected ? ` tabindex="-1"` : ""} style="${cardAccentStyle(c.sigilColor)}">
          <div class="voices-card__top"><span class="voices-card__index">${String(qt.id).replace("q", "#")}</span><span class="voices-card__season">Season ${qt.season}</span></div>
          <blockquote class="voices-card__quote">“${escapeHTML(qt.text)}”</blockquote>
          <div class="voices-card__tags">${(featuredIds.has(qt.id) ? ["Featured", ...themes] : themes).slice(0, 2).map(theme => `<span>${escapeHTML(theme)}</span>`).join("")}${memory ? `<span class="voices-card__memory-tag">${escapeHTML(memory.title)}</span>` : ""}</div>
          <div class="voices-card__footer"><a class="voices-card__speaker" href="#/character/${c.id}">${avatarHTML(c, 38)}<span><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.house)}</small></span></a><div class="voices-card__actions"><button type="button" class="voices-copy" data-copy-quote="${escapeHTML(qt.id)}" aria-label="Copy quote by ${escapeHTML(c.name)}">Copy line</button><button type="button" class="voices-copy" data-save-card-quote="${escapeHTML(qt.id)}" aria-pressed="${String(savedQuoteIds.has(qt.id))}">${savedQuoteIds.has(qt.id) ? "Saved" : "Keep"}</button></div></div>
        </article>`;
    }).join("") || `<div class="voices-empty"><strong>The archive is quiet.</strong><span>No lines match these filters. Clear one and try again.</span></div>`;
    observeReveals(quoteGrid);
  }

  function render() {
    const filtered = matchingQuotes();
    renderCollections();
    renderSpotlight(filtered);
    renderCards(filtered);
  }

  const houseSel = root.querySelector("#voices-house");
  Object.keys(HOUSE_COLORS).forEach(h => {
    const opt = document.createElement("option");
    opt.value = h; opt.textContent = h;
    houseSel.appendChild(opt);
  });
  root.querySelector("#voices-search").addEventListener("input", e => { activeQuery = e.target.value; render(); });
  houseSel.addEventListener("change", e => { activeHouse = e.target.value; render(); });
  root.querySelector("#voices-season").addEventListener("change", e => { activeSeason = e.target.value; render(); });
  root.querySelector("#voices-collections").addEventListener("click", e => {
    const button = e.target.closest("[data-voices-collection]");
    if (!button) return;
    activeCollection = button.dataset.voicesCollection;
    spotlightIndex = 0;
    render();
  });
  root.querySelector("#voices-surprise").addEventListener("click", () => {
    spotlightIndex += 1;
    renderSpotlight(matchingQuotes());
    status.textContent = "A new voice has entered the spotlight.";
  });
  root.querySelector("#voices-grid").addEventListener("click", async e => {
    const saveButton = e.target.closest("[data-save-card-quote]");
    if (saveButton) {
      const quote = quotes.find(item => item.id === saveButton.dataset.saveCardQuote);
      if (quote) { toggleSavedQuote(quote); render(); }
      return;
    }
    const button = e.target.closest("[data-copy-quote]");
    if (!button) return;
    const quote = quotes.find(item => item.id === button.dataset.copyQuote);
    if (!quote) return;
    const c = getCharacter(quote.characterId);
    const text = `“${quote.text}” — ${c ? c.name : "Unknown voice"}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text; area.setAttribute("readonly", ""); area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        if (!document.execCommand("copy")) throw new Error("copy unavailable");
        area.remove();
      }
      button.textContent = "Copied";
      status.textContent = `Copied ${c ? c.name : "the quote"} to your clipboard.`;
      window.setTimeout(() => { if (button.isConnected) button.textContent = "Copy line"; }, 1400);
    } catch (error) {
      status.textContent = "Copy is unavailable here. Select the quote text to copy it.";
    }
  });
  render();
  const requestedCard = [...root.querySelectorAll("[data-quote-id]")]
    .find(card => card.dataset.quoteId === requestedQuoteId);
  if (requestedCard) {
    window.requestAnimationFrame(() => {
      requestedCard.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      requestedCard.focus({ preventScroll: true });
    });
  }
}

// ==========================================================================
// LIVING LORE LIBRARY
// ==========================================================================
function viewLore(app, params, query) {
  setTitle("Lore");
  app.innerHTML = `<div id="lore-library-root" class="encyclopedia-feature-host"></div>`;
  const root = document.getElementById("lore-library-root");
  if (!window.LoreLibrary) {
    root.innerHTML = `<div class="page-wrap"><div class="empty-state">The archives are unavailable. <a href="#/timeline">Open the story atlas</a>.</div></div>`;
    return;
  }

  try {
    const handle = window.LoreLibrary.mount(root, {
      initialEntryId: query.get("entry") || "",
      initialCategory: query.get("category") || "",
      onEntryChange: entry => replaceHashQuery("/lore", { entry: entry ? entry.id : "" }),
      onCategoryChange: category => replaceHashQuery("/lore", { category: category === "all" ? "" : category }),
      onNavigate: navigateFeatureTarget
    });
    registerActiveView(handle);
  } catch (error) {
    console.error("The Lore library could not be mounted.", error);
    root.innerHTML = `<div class="page-wrap"><div class="empty-state">The archives are unavailable. <a href="#/timeline">Open the story atlas</a>.</div></div>`;
  }
}

// ==========================================================================
// CREDITS
//
// Not decorative: the actor photographs are CC BY / CC BY-SA, which legally
// require crediting the photographer and naming the license. This page is
// where that obligation is discharged, so it lists every single photo with
// its author, its license, and a link back to the source page. It is
// linked from the site footer on every route.
// ==========================================================================
function viewCredits(app) {
  setTitle("Credits & Image Licensing");
  const entries = (typeof ACTOR_PHOTOS !== "undefined")
    ? Object.entries(ACTOR_PHOTOS).map(([id, p]) => ({ id, ...p, character: getCharacter(id) }))
        .filter(e => e.character)
        .sort((a, b) => a.character.name.localeCompare(b.character.name))
    : [];
  const fallbackEntries = characters
    .filter(c => !(typeof actorPhotoFor === "function" && actorPhotoFor(c.id)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const castLabel = c => c.actor && !/^actor unknown$/i.test(c.actor)
    ? `Played by ${escapeHTML(c.actor)}`
    : "Actor not recorded";

  // Group by license so a reader can see the licence mix at a glance.
  const byLicense = {};
  entries.forEach(e => { (byLicense[e.license] = byLicense[e.license] || []).push(e); });

  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:6px;">
        <h1 class="display">Credits &amp; Image Licensing</h1>
        <p>Every actor photograph on this site uses a verified open license. 133 are sourced from
        Wikimedia Commons and one is a rights-holder YouTube frame published under CC BY. None are
        publicity stills or scraped IMDb images. Each is listed below with its creator, license, and
        source link — the attribution that CC BY and CC BY-SA require.</p>
      </div>

      <div class="card" style="padding:20px;margin-top:8px;">
        <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;">
          <div><div style="font-family:'Cinzel',serif;font-size:1.7rem;color:var(--accent);line-height:1;">${entries.length}</div>
            <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-dim);margin-top:4px;">Photographs</div></div>
          <div><div style="font-family:'Cinzel',serif;font-size:1.7rem;color:var(--text);line-height:1;">${fallbackEntries.length}</div>
            <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-dim);margin-top:4px;">Illustrated fallbacks</div></div>
          ${Object.keys(byLicense).sort().map(lic => `
            <div><div style="font-family:'Cinzel',serif;font-size:1.7rem;color:var(--text);line-height:1;">${byLicense[lic].length}</div>
              <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-dim);margin-top:4px;">${escapeHTML(lic)}</div></div>`).join("")}
        </div>
        <p class="text-dim" style="font-size:0.85rem;margin:16px 0 0;">
          Photographs remain the copyright of their photographers and are reused here under the
          terms of their respective licenses. Game of Thrones, its characters and its imagery are
          the property of HBO; this is an unofficial, non-commercial fan reference. Region maps,
          sigils, glyphs and the generative character portraits are original work created for this site.
        </p>
      </div>

      <div class="section-title" style="margin-top:28px;">Photograph Attributions</div>
      <div id="credits-list" style="display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));">
        ${entries.map(e => `
          <div class="card reveal" style="padding:12px 14px;display:flex;gap:12px;align-items:center;${cardAccentStyle(e.character.sigilColor)}">
            ${avatarHTML(e.character, 44)}
            <div style="min-width:0;flex:1;">
              <a href="#/character/${e.id}" style="font-family:'Cinzel',serif;font-size:0.9rem;color:var(--text);text-decoration:none;">${escapeHTML(e.character.name)}</a>
              <div style="font-size:0.78rem;color:var(--text-dim);">Played by ${escapeHTML(e.actor)}</div>
              <div style="font-size:0.74rem;color:var(--text-faint);margin-top:3px;">
                Photo: ${escapeHTML(e.credit)} ·
                <span style="color:var(--accent);">${escapeHTML(e.license)}</span> ·
                <a href="${escapeHTML(e.source)}" target="_blank" rel="noopener" style="color:var(--text-dim);">${e.source.includes("youtube.com") ? "YouTube" : "Commons"}</a>
              </div>
            </div>
          </div>`).join("") || `<div class="empty-state">No photographs are in use.</div>`}
      </div>

      <div class="section-title" style="margin-top:36px;">Illustrated Portraits</div>
      <p class="text-dim" style="max-width:760px;font-size:0.88rem;line-height:1.55;">
        These characters use the site's original illustrated portrait because no verified
        open-license photograph was available in the last source check. The actor names below
        come from the site's cast dataset; “Actor not recorded” means the TV credit is not yet
        identified in this reference set. This list keeps the boundary visible instead of hiding
        it behind a broken image.
      </p>
      <div class="portrait-gap-grid">
        ${fallbackEntries.map(c => `
          <div class="card portrait-gap-card" style="${cardAccentStyle(c.sigilColor)}">
            ${avatarHTML(c, 44)}
            <div style="min-width:0;flex:1;">
              <a href="#/character/${c.id}" style="font-family:'Cinzel',serif;font-size:0.86rem;color:var(--text);text-decoration:none;">${escapeHTML(c.name)}</a>
              <div style="font-size:0.74rem;color:var(--text-dim);">${castLabel(c)}</div>
              <span class="portrait-kind portrait-kind--illustration">Illustrated portrait</span>
            </div>
          </div>`).join("")}
      </div>
    </div>
  `;
}
