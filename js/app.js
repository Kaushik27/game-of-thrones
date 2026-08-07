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
  { pattern: /^\/timeline$/, view: viewTimeline },
  { pattern: /^\/battles$/, view: viewBattles },
  { pattern: /^\/quiz$/, view: viewQuiz },
  { pattern: /^\/quotes$/, view: viewQuotes },
  { pattern: /^\/credits$/, view: viewCredits }
];

function parseHash() {
  let hash = window.location.hash || "#/";
  hash = hash.slice(1); // drop '#'
  const [path, query] = hash.split("?");
  return { path: path || "/", query: new URLSearchParams(query || "") };
}

function router() {
  const app = document.getElementById("app");
  const { path, query } = parseHash();
  for (const route of APP_ROUTES) {
    const m = path.match(route.pattern);
    if (m) {
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
});

// ---------- shared small helpers ----------
function setTitle(t) { document.title = t + " — Game of Thrones"; }

// ==========================================================================
// HOME
// ==========================================================================
function viewHome(app) {
  setTitle("Home");
  const majorHouses = Object.keys(HOUSE_COLORS).filter(h => h !== "Unaffiliated");
  app.innerHTML = `
    <div class="hero illustrated ambient-glow">
      <div class="hero-scene">${homeSceneSVG()}</div>
      <h1 class="display">Game of Thrones</h1>
      <div class="script-accent">Winter is coming, and so is everything after it.</div>
      <p>A complete interactive reference for the Seven Kingdoms — every character, every house, the war for the Iron Throne, and everything that happened along the way.</p>
      <div class="stat-row" id="stat-row"></div>
    </div>
    <div class="page-wrap">
      <div class="section">
        <div class="section-title">Explore Westeros</div>
        <div class="feature-grid">
          <a class="card feature-card spotlight reveal" href="#/characters" style="${cardAccentStyle('#d4af37')}">
            <div class="icon">${sigilSVG('direwolf', { size: 42 })}</div>
            <div>
              <h3 class="display">Characters</h3>
              <p>Browse all ${characters.length}+ characters with search and house/status filters — original generative portraits, bios, relations, and personal timelines for every one of them.</p>
            </div>
          </a>
          <a class="card feature-card reveal" href="#/houses" style="${cardAccentStyle('#b8862e')}">
            <div class="icon">${sigilSVG('lion', { size: 30 })}</div>
            <h3 class="display">Houses</h3>
            <p>Sigils, words, seats, full family trees, and the rise and fall of each great house across the show.</p>
          </a>
          <a class="card feature-card reveal" href="#/map" style="${cardAccentStyle('#4c7a3f')}">
            <div class="icon">${sigilSVG('sun-spear', { size: 30 })}</div>
            <h3 class="display">Map of Westeros</h3>
            <p>An interactive map of the Seven Kingdoms — click a region to see who ruled it and what happened there.</p>
          </a>
          <a class="card feature-card reveal" href="#/timeline" style="${cardAccentStyle('#3f6ea5')}">
            <div class="icon">${sigilSVG('falcon-moon', { size: 30 })}</div>
            <h3 class="display">Timeline</h3>
            <p>Scrub through all eight seasons — battles, deaths, weddings, and the political shifts that moved the story.</p>
          </a>
          <a class="card feature-card reveal" href="#/battles" style="${cardAccentStyle('#8f1d21')}">
            <div class="icon">${sigilSVG('crossed-swords', { size: 30 })}</div>
            <h3 class="display">Battles &amp; Events</h3>
            <p>Combatants, outcomes, and casualties for the Red Wedding, the Battle of the Bastards, and more.</p>
          </a>
          <a class="card feature-card reveal" href="#/quiz" style="${cardAccentStyle('#2a7f7f')}">
            <div class="icon">${sigilSVG('kraken', { size: 30 })}</div>
            <h3 class="display">Quiz</h3>
            <p>Test your knowledge — who said it, match the sigil, or trace a family tree. Keep score, play again.</p>
          </a>
          <a class="card feature-card reveal" href="#/quotes" style="${cardAccentStyle('#d16a2e')}">
            <div class="icon">${sigilSVG('trout', { size: 30 })}</div>
            <h3 class="display">Quote Wall</h3>
            <p>Searchable, shareable-styled cards of the show's most memorable lines.</p>
          </a>
          <a class="card feature-card reveal" href="#/characters?graph=1" style="${cardAccentStyle('#6fa9d1')}">
            <div class="icon">${sigilSVG('rose', { size: 30 })}</div>
            <h3 class="display">Relations Graph</h3>
            <p>The original force-directed relationship graph — now available on every character's profile page.</p>
          </a>
        </div>
      </div>
      <div class="section">
        <div class="section-title">The Great Houses</div>
        <div class="house-strip" id="house-strip"></div>
      </div>
    </div>
  `;
  document.getElementById("stat-row").innerHTML = `
    <div class="stat"><div class="num">${characters.length}+</div><div class="label">Characters</div></div>
    <div class="stat"><div class="num">${majorHouses.length}</div><div class="label">Houses</div></div>
    <div class="stat"><div class="num">${relations.length}+</div><div class="label">Relations</div></div>
    <div class="stat"><div class="num">${battles.length}</div><div class="label">Major Battles</div></div>
    <div class="stat"><div class="num">8</div><div class="label">Seasons</div></div>
  `;
  document.getElementById("house-strip").innerHTML = majorHouses.map(h =>
    `<a href="#/house/${encodeURIComponent(h)}" style="border-color:${HOUSE_COLORS[h]}55;color:${HOUSE_COLORS[h]}">${sigilSVG(houseSigilId(h), { size: 14 })} ${h}</a>`
  ).join("");
}

// ==========================================================================
// CHARACTERS DIRECTORY + RELATIONS GRAPH
// ==========================================================================
function viewCharacters(app, params, query) {
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
        </div>
        <div id="result-count"></div>
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

  let activeHouse = "", activeStatus = "", activeQuery = "";

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
      (!activeStatus || c.status === activeStatus)
    );
    document.getElementById("result-count").textContent = `${filtered.length} character${filtered.length === 1 ? '' : 's'}`;
    document.getElementById("char-grid").innerHTML = filtered.map(c => {
      const featured = relationCount.get(c.id) >= featuredThreshold && relationCount.get(c.id) > 0;
      return `
      <a class="card char-card reveal${featured ? ' featured' : ''}" href="#/character/${encodeURIComponent(c.id)}" style="${cardAccentStyle(c.sigilColor)}">
        ${avatarHTML(c, featured ? 72 : 48)}
        <div class="meta">
          <p class="name" style="color:${c.sigilColor}">${escapeHTML(c.name)}</p>
          <div class="sub">${escapeHTML(c.house)} · <span class="badge ${c.status}">${c.status}</span>${featured ? ` · <span class="text-dim">${relationCount.get(c.id)} relations</span>` : ''}</div>
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
function viewCharacter(app, params) {
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

  app.innerHTML = `
    <div class="page-wrap">
      <div id="profile-header" class="ambient-glow" style="display:flex;gap:22px;align-items:center;padding:30px 0 10px;flex-wrap:wrap;--glow-color:${c.sigilColor};">
        ${avatarHTML(c, 96)}
        <div>
          <h1 class="display" style="color:${c.sigilColor}">${escapeHTML(c.name)}</h1>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px;">
            <a class="badge house" href="#/house/${encodeURIComponent(c.house)}" style="color:${c.sigilColor};border-color:${c.sigilColor}66;">${sigilSVG(houseSigilId(c.house), { size: 12 })} ${escapeHTML(c.house)}</a>
            <span class="badge ${c.status}">${c.status === 'alive' ? 'Alive' : 'Dead'}</span>
            <span class="text-dim" style="font-size:0.85rem;">Played by ${escapeHTML(c.actor)}</span>
          </div>
          <p style="max-width:760px;color:var(--text-dim);line-height:1.6;margin-top:14px;">${escapeHTML(c.bio)}</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="graph">Relations Graph</button>
        <button class="tab-btn" data-tab="timeline">Timeline</button>
      </div>

      <div class="tab-panel active" id="tab-overview">
        <div class="section">
          <div class="section-title">Relations</div>
          <ul style="list-style:none;padding:0;">${rels.length ? rels.map(r => `
            <li style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--panel-border);">
              ${avatarHTML(r.other, 34)}
              <div>
                <a href="#/character/${r.other.id}" style="color:var(--text);font-weight:600;">${escapeHTML(r.other.name)}</a>
                <div class="text-dim" style="font-size:0.85rem;">${TYPE_ICON[r.rel.type]} ${escapeHTML(r.rel.label)}</div>
              </div>
            </li>`).join("") : `<li class="text-dim">No recorded relations.</li>`}</ul>
        </div>
        ${cq.length ? `<div class="section"><div class="section-title">Quotes</div>${cq.map(q => `<div class="quote-mini" style="border-left:3px solid var(--accent);padding:10px 14px;margin:10px 0;font-style:italic;color:var(--text-dim);background:var(--panel-bg);border-radius:0 6px 6px 0;">"${escapeHTML(q.text)}"</div>`).join("")}</div>` : ""}
      </div>

      <div class="tab-panel" id="tab-graph">
        <p class="text-dim" id="mini-graph-hint">Showing ${escapeHTML(c.name)} and their direct connections. Click a node to re-center the graph on them — double-click (or the link below) to open their full profile.</p>
        <div id="mini-graph-host" style="width:100%;height:480px;background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--radius);"></div>
        <p style="margin-top:10px;" id="mini-graph-profile-link"></p>
      </div>

      <div class="tab-panel" id="tab-timeline">
        <div id="char-timeline">${evs.length ? evs.map(e => `
          <div class="timeline-item" style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--panel-border);">
            <div class="season-badge" style="flex-shrink:0;font-family:'Cinzel',serif;color:var(--accent);font-size:0.8rem;width:62px;">S${e.season}</div>
            <div><h4 style="margin:0 0 4px;">${escapeHTML(e.title)}</h4><p style="margin:0;color:var(--text-dim);font-size:0.88rem;">${escapeHTML(e.summary)}</p></div>
          </div>`).join("") : `<div class="empty-state">No major timeline events recorded for this character.</div>`}</div>
      </div>
    </div>
  `;

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
function viewMap(app) {
  setTitle("Map of Westeros");
  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero illustrated ambient-glow" style="padding-top:90px;padding-bottom:16px;">
        <div class="hero-scene">${mapSceneSVG()}</div>
        <h1 class="display">Map of Westeros</h1>
        <p>A stylized map of the Seven Kingdoms. Hover a region to see its ruling house, click to see its characters and history.</p>
      </div>
      <div id="map-layout" style="display:flex;gap:20px;margin-top:16px;flex-wrap:wrap;">
        <div id="map-host" style="flex:1 1 480px;min-width:300px;background:radial-gradient(ellipse at 50% 20%, #0f1e1c, #060a09 75%);border:1px solid var(--panel-border);border-radius:var(--radius);overflow:hidden;">
          <svg id="map-svg" viewBox="0 0 700 950" style="width:100%;height:auto;display:block;"></svg>
        </div>
        <div id="map-side" style="width:320px;flex-shrink:0;">
          <div id="region-detail" style="background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:var(--radius);padding:18px;min-height:200px;">
            <div class="empty-state">Click a region on the map to explore it.</div>
          </div>
        </div>
      </div>
    </div>
    <div id="map-tooltip" style="position:fixed;pointer-events:none;background:var(--panel-bg-alt);border:1px solid var(--panel-border);padding:8px 12px;border-radius:6px;font-size:0.82rem;display:none;z-index:50;max-width:220px;"></div>
  `;

  const ns = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  const svg = document.getElementById("map-svg");
  svg.appendChild(svgEl("path", { d: MAP_LANDMASS_OUTLINE, fill: "#06110f", opacity: "0.5" }));

  MAP_REGIONS.forEach(region => {
    const rcolor = getHouseColor(region.house);
    const poly = svgEl("path", { d: region.path, fill: rcolor, class: "region-poly" });
    poly.style.stroke = "#060a09"; poly.style.strokeWidth = "2.5"; poly.style.cursor = "pointer"; poly.style.opacity = "0.82"; poly.style.transition = "opacity .18s, filter .18s";
    poly.dataset.id = region.id;
    svg.appendChild(poly);

    const label = svgEl("text", { x: region.seatXY[0], y: region.seatXY[1] - 12 });
    label.setAttribute("font-family", "Cinzel, serif");
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "#f2efe6");
    label.setAttribute("text-anchor", "middle");
    label.style.pointerEvents = "none";
    label.textContent = region.name;
    svg.appendChild(label);

    const iconGroup = svgEl("g", { transform: `translate(${region.seatXY[0] - 9},${region.seatXY[1] - 2})` });
    iconGroup.style.pointerEvents = "none";
    iconGroup.style.color = "#f2efe6";
    iconGroup.innerHTML = `<svg width="18" height="18" viewBox="0 0 100 100">
      <path d="M20 90 L20 45 L10 45 L30 20 L50 45 L40 45 L40 60 L60 60 L60 45 L50 45 L70 20 L90 45 L80 45 L80 90 Z" fill="currentColor" opacity="0.9"/>
    </svg>`;
    svg.appendChild(iconGroup);

    poly.addEventListener("mouseenter", (e) => showTooltip(e, region));
    poly.addEventListener("mousemove", (e) => moveTooltip(e));
    poly.addEventListener("mouseleave", hideTooltip);
    poly.addEventListener("mouseenter", () => poly.style.opacity = "1");
    poly.addEventListener("mouseleave", () => { if (!poly.classList.contains("selected")) poly.style.opacity = "0.82"; });
    poly.addEventListener("click", () => selectRegion(region.id));
  });

  function showTooltip(e, region) {
    const tip = document.getElementById("map-tooltip");
    tip.innerHTML = `<strong style="color:${getHouseColor(region.house)}">${region.name}</strong><br>Seat: ${region.seat}<br>Controlled by House ${region.house}`;
    tip.style.display = "block";
    moveTooltip(e);
  }
  function moveTooltip(e) {
    const tip = document.getElementById("map-tooltip");
    tip.style.left = (e.clientX + 16) + "px";
    tip.style.top = (e.clientY + 12) + "px";
  }
  function hideTooltip() { document.getElementById("map-tooltip").style.display = "none"; }

  function selectRegion(id) {
    document.querySelectorAll(".region-poly").forEach(p => {
      const sel = p.dataset.id === id;
      p.classList.toggle("selected", sel);
      p.style.opacity = sel ? "1" : "0.82";
      p.style.stroke = sel ? "var(--accent)" : "#060a09";
      p.style.strokeWidth = sel ? "3" : "2.5";
    });
    const region = MAP_REGIONS.find(r => r.id === id);
    if (!region) return;
    const rcolor = getHouseColor(region.house);
    const members = charactersByHouse(region.house).slice(0, 12);
    const evs = eventsForHouse(region.house).slice(0, 6);

    document.getElementById("region-detail").innerHTML = `
      <h2 class="display" style="color:${rcolor};display:flex;align-items:center;gap:10px;">${sigilSVG(houseSigilId(region.house), { size: 24 })} ${region.name}</h2>
      <div class="sub text-dim" style="margin-bottom:10px;">Seat: ${region.seat} · House ${region.house}</div>
      <p class="text-dim" style="font-size:0.88rem;">${region.blurb}</p>
      <a class="cta-pill" style="margin:8px 0;" href="#/house/${encodeURIComponent(region.house)}">View House ${region.house} <span class="arrow">&#8594;</span></a>
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

// ==========================================================================
// TIMELINE
// ==========================================================================
function viewTimeline(app) {
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
function viewBattles(app) {
  setTitle("Battles & Events");
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
        ${battles.map(b => `
          <div class="card battle-card reveal" style="padding:22px;${cardAccentStyle('#c23b3b')}">
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
          </div>
        `).join("")}
      </div>
    </div>
  `;
  observeReveals(app);
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
// QUOTE WALL
// ==========================================================================
function viewQuotes(app) {
  setTitle("Quote Wall");
  let activeQuery = "", activeHouse = "";

  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:10px;">
        <h1 class="display">Quote Wall</h1>
        <p>The lines Westeros never forgot. Search by character or browse the whole wall.</p>
      </div>
      <div id="controls" style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0;">
        <input type="text" id="search-input" style="width:260px;" placeholder="Search quotes or characters...">
        <select id="house-filter"><option value="">All Houses</option></select>
      </div>
      <div id="quote-count" class="text-dim" style="margin-bottom:14px;font-size:0.85rem;"></div>
      <div class="grid grid-wide" id="quote-grid"></div>
    </div>
  `;

  function render() {
    const q = activeQuery.toLowerCase();
    const filtered = quotes.filter(qt => {
      const c = getCharacter(qt.characterId);
      if (!c) return false;
      if (activeHouse && c.house !== activeHouse) return false;
      if (q && !qt.text.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
    document.getElementById("quote-count").textContent = `${filtered.length} quote${filtered.length === 1 ? '' : 's'}`;
    document.getElementById("quote-grid").innerHTML = filtered.map(qt => {
      const c = getCharacter(qt.characterId);
      return `
      <div class="card quote-card reveal" style="padding:26px 22px 18px;background:linear-gradient(160deg, var(--panel-bg), var(--panel-bg-alt));position:relative;overflow:hidden;${cardAccentStyle(c.sigilColor)}">
        <div class="season-badge" style="position:absolute;top:12px;right:14px;font-size:0.7rem;color:var(--text-faint);">S${qt.season}</div>
        <blockquote style="margin:0 0 16px;font-family:'Cinzel',serif;font-size:1.05rem;line-height:1.5;position:relative;z-index:1;">"${escapeHTML(qt.text)}"</blockquote>
        <a style="display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;" href="#/character/${c.id}">
          ${avatarHTML(c, 34)}
          <div>
            <div style="font-size:0.88rem;color:${c.sigilColor}">${escapeHTML(c.name)}</div>
            <div style="font-size:0.75rem;color:var(--text-dim);">${escapeHTML(c.house)}</div>
          </div>
        </a>
      </div>`;
    }).join("") || `<div class="empty-state">No quotes match your search.</div>`;
    observeReveals(document.getElementById("quote-grid"));
  }

  const houseSel = document.getElementById("house-filter");
  Object.keys(HOUSE_COLORS).forEach(h => {
    const opt = document.createElement("option");
    opt.value = h; opt.textContent = h;
    houseSel.appendChild(opt);
  });
  document.getElementById("search-input").addEventListener("input", e => { activeQuery = e.target.value; render(); });
  houseSel.addEventListener("change", e => { activeHouse = e.target.value; render(); });
  render();
}

// ==========================================================================
// CREDITS
//
// Not decorative: the actor photographs are CC BY / CC BY-SA, which legally
// require crediting the photographer and naming the license. This page is
// where that obligation is discharged, so it lists every single photo with
// its author, its license, and a link back to the Commons file page. It is
// linked from the site footer on every route.
// ==========================================================================
function viewCredits(app) {
  setTitle("Credits & Image Licensing");
  const entries = (typeof ACTOR_PHOTOS !== "undefined")
    ? Object.entries(ACTOR_PHOTOS).map(([id, p]) => ({ id, ...p, character: getCharacter(id) }))
        .filter(e => e.character)
        .sort((a, b) => a.character.name.localeCompare(b.character.name))
    : [];

  // Group by license so a reader can see the licence mix at a glance.
  const byLicense = {};
  entries.forEach(e => { (byLicense[e.license] = byLicense[e.license] || []).push(e); });

  app.innerHTML = `
    <div class="page-wrap">
      <div class="hero ambient-glow" style="padding-top:76px;padding-bottom:6px;">
        <h1 class="display">Credits &amp; Image Licensing</h1>
        <p>Every actor photograph on this site is a freely-licensed photograph sourced from
        Wikimedia Commons. None are publicity stills and none are scraped from IMDb. Each one is
        listed below with its photographer, its license, and a link to its Commons file page —
        the attribution that CC BY and CC BY-SA require.</p>
      </div>

      <div class="card" style="padding:20px;margin-top:8px;">
        <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;">
          <div><div style="font-family:'Cinzel',serif;font-size:1.7rem;color:var(--accent);line-height:1;">${entries.length}</div>
            <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-dim);margin-top:4px;">Photographs</div></div>
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
                <a href="${escapeHTML(e.source)}" target="_blank" rel="noopener" style="color:var(--text-dim);">Commons</a>
              </div>
            </div>
          </div>`).join("") || `<div class="empty-state">No photographs are in use.</div>`}
      </div>
    </div>
  `;
}
