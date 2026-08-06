# Game of Thrones Relations Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained `index.html` that renders an interactive, dark house-colored network graph and switchable house-tree view of Game of Thrones (TV canon) character relations, with search, filters, detail panel, and shortest-path finder.

**Architecture:** One HTML file. D3.js v7 (CDN) drives two renderers (force graph, tree) that both read from one in-memory dataset (`characters`, `relations` arrays) and share filter/selection state. No build step, no test framework — verification is manual, done by opening the file in a browser and checking documented behaviors after each task.

**Tech Stack:** Vanilla JS (ES2020+), D3.js v7 via `https://d3js.org/d3.v7.min.js`, Google Fonts CDN for Cinzel (serif display font, system-serif fallback), plain CSS (no framework).

## Global Constraints

- Single file: `index.html`. No other source files (data lives inline in a `<script>` block in the same file).
- Must open and run via `file://` (double-click) after the two CDN resources have loaded once — no local server, no build tooling, no npm.
- TV show canon only, ~200+ characters across Stark, Lannister, Targaryen, Baratheon, Greyjoy, Tyrell, Martell, Arryn, Tully, Night's Watch, wildlings/free folk, and notable unaffiliated characters.
- Relation types: `family` (subtypes `parent`/`child`/`sibling`), `marriage` (subtypes `spouse`/`betrothed`), `allegiance` (subtypes `liege`/`sworn`/`bannerman`), `conflict` (subtypes `enemy`/`killed`), `bond` (subtypes `mentor`/`protector`/`friend`).
- Dark theme, house sigil colors used for house-colored UI accents (see palette in Task 1).
- No automated tests exist for this project — every task's verification step is a manual browser check; describe exactly what to click/see.

---

### Task 1: HTML shell, theme, fonts, CDN wiring

**Files:**
- Create: `index.html`

**Interfaces:**
- Produces: page `<head>` with D3 v7 and Cinzel font loaded; CSS custom properties for house colors (`--house-stark`, `--house-lannister`, `--house-targaryen`, `--house-baratheon`, `--house-greyjoy`, `--house-tyrell`, `--house-martell`, `--house-nightswatch`) and base theme (`--bg`, `--panel-bg`, `--text`, `--text-dim`); top bar layout containing `#app-title`, `#view-toggle`, `#search-container`; a fallback message element `#d3-missing-warning` (hidden by default).

- [ ] **Step 1: Create `index.html` with head, CDN includes, and CSS variables**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Game of Thrones — Relations Explorer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://d3js.org/d3.v7.min.js"></script>
<style>
  :root {
    --bg: #0d0d0f;
    --panel-bg: #17171b;
    --panel-border: #2a2a30;
    --text: #e8e6df;
    --text-dim: #8a8a93;
    --house-stark: #c8ced6;
    --house-lannister: #b8862e;
    --house-lannister-red: #8f1d21;
    --house-targaryen: #8f1d21;
    --house-targaryen-black: #14141a;
    --house-baratheon: #d4af37;
    --house-greyjoy: #d4af37;
    --house-tyrell: #4c7a3f;
    --house-martell: #d16a2e;
    --house-nightswatch: #45454d;
    --house-tully: #3f6ea5;
    --house-arryn: #6fa9d1;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; height: 100%;
    background: var(--bg); color: var(--text);
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  h1, h2, h3, .display {
    font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  }
  #top-bar {
    display: flex; align-items: center; gap: 24px;
    padding: 12px 20px; background: var(--panel-bg);
    border-bottom: 1px solid var(--panel-border);
  }
  #app-title { margin: 0; font-size: 1.4rem; letter-spacing: 1px; }
  #d3-missing-warning {
    display: none; padding: 40px; text-align: center; color: var(--text-dim);
  }
</style>
</head>
<body>
  <div id="top-bar">
    <h1 id="app-title">Game of Thrones — Relations Explorer</h1>
    <div id="view-toggle"></div>
    <div id="search-container"></div>
  </div>
  <div id="d3-missing-warning">Requires internet on first load to fetch D3.js. Please connect and reload.</div>
  <div id="main-layout"></div>
  <script>
    if (typeof d3 === 'undefined') {
      document.getElementById('d3-missing-warning').style.display = 'block';
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Manual verification**

Open `index.html` directly in a browser (double-click, or `open index.html` on macOS). Confirm:
- Page title bar shows "Game of Thrones — Relations Explorer"
- Top bar renders with dark background, title in serif font
- No `#d3-missing-warning` text visible (D3 loaded successfully — check browser dev tools console for no errors)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: scaffold HTML shell, theme, and CDN wiring"
```

---

### Task 2: Character and relation dataset

**Files:**
- Modify: `index.html` (append `<script>` block before `</body>`)

**Interfaces:**
- Consumes: nothing (pure data)
- Produces: global `const characters = [...]` (objects: `{id, name, house, status, actor, bio, sigilColor}`) and `const relations = [...]` (objects: `{source, target, type, subtype, label}`), both referencing IDs that must all resolve to entries in `characters`. Later tasks read these two arrays directly by name.

- [ ] **Step 1: Add dataset script block with house sigil color map and character list**

Add to `index.html`, right before `</body>`:

```html
<script>
const HOUSE_COLORS = {
  "Stark": "#c8ced6",
  "Lannister": "#b8862e",
  "Targaryen": "#8f1d21",
  "Baratheon": "#d4af37",
  "Greyjoy": "#d4af37",
  "Tyrell": "#4c7a3f",
  "Martell": "#d16a2e",
  "Tully": "#3f6ea5",
  "Arryn": "#6fa9d1",
  "Night's Watch": "#45454d",
  "Free Folk": "#7a8fa6",
  "Unaffiliated": "#6b6b73"
};

const characters = [
  { id: "ned-stark", name: "Eddard \"Ned\" Stark", house: "Stark", status: "dead", actor: "Sean Bean", bio: "Lord of Winterfell, briefly Hand of the King, beheaded by Joffrey.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "catelyn-stark", name: "Catelyn Stark", house: "Stark", status: "dead", actor: "Michelle Fairley", bio: "Lady of Winterfell, born a Tully, killed at the Red Wedding.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "robb-stark", name: "Robb Stark", house: "Stark", status: "dead", actor: "Richard Madden", bio: "King in the North, killed at the Red Wedding.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "sansa-stark", name: "Sansa Stark", house: "Stark", status: "alive", actor: "Sophie Turner", bio: "Eldest Stark daughter, becomes Queen in the North.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "arya-stark", name: "Arya Stark", house: "Stark", status: "alive", actor: "Maisie Williams", bio: "Younger Stark daughter, trained as a Faceless Man, kills the Night King.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "bran-stark", name: "Bran Stark", house: "Stark", status: "alive", actor: "Isaac Hempstead Wright", bio: "Becomes the Three-Eyed Raven, later King of the Six Kingdoms.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "rickon-stark", name: "Rickon Stark", house: "Stark", status: "dead", actor: "Art Parkinson", bio: "Youngest Stark child, killed by Ramsay Bolton.", sigilColor: HOUSE_COLORS["Stark"] },
  { id: "jon-snow", name: "Jon Snow", house: "Stark", status: "alive", actor: "Kit Harington", bio: "Raised as Ned's bastard, actually a Targaryen heir; Lord Commander then King in the North.", sigilColor: HOUSE_COLORS["Stark"] }
  // ... full ~200-character dataset continues; see authoring note below
];

const relations = [
  { source: "ned-stark", target: "catelyn-stark", type: "marriage", subtype: "spouse", label: "husband and wife" },
  { source: "ned-stark", target: "robb-stark", type: "family", subtype: "parent", label: "father of" },
  { source: "ned-stark", target: "sansa-stark", type: "family", subtype: "parent", label: "father of" },
  { source: "ned-stark", target: "arya-stark", type: "family", subtype: "parent", label: "father of" },
  { source: "ned-stark", target: "bran-stark", type: "family", subtype: "parent", label: "father of" },
  { source: "ned-stark", target: "rickon-stark", type: "family", subtype: "parent", label: "father of" },
  { source: "ned-stark", target: "jon-snow", type: "bond", subtype: "protector", label: "raised as father" },
  { source: "robb-stark", target: "sansa-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "robb-stark", target: "arya-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "robb-stark", target: "bran-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "robb-stark", target: "rickon-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "sansa-stark", target: "arya-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "sansa-stark", target: "bran-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "arya-stark", target: "bran-stark", type: "family", subtype: "sibling", label: "siblings" },
  { source: "jon-snow", target: "robb-stark", type: "bond", subtype: "friend", label: "raised as brothers" }
  // ... full relation set continues; see authoring note below
];

// Data integrity check (dev aid, runs on load, logs to console only)
(function validateDataset() {
  const ids = new Set(characters.map(c => c.id));
  const dupes = characters.map(c => c.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (dupes.length) console.error("Duplicate character ids:", dupes);
  relations.forEach(r => {
    if (!ids.has(r.source)) console.error("Relation references missing source id:", r.source);
    if (!ids.has(r.target)) console.error("Relation references missing target id:", r.target);
  });
  console.log(`Dataset loaded: ${characters.length} characters, ${relations.length} relations.`);
})();
</script>
```

**Authoring note:** the 8-character/9-relation snippet above is the seed and validation harness. Before moving to Task 3, expand `characters` to ~200+ entries and `relations` to match, covering every house listed in the Global Constraints, using the same object shape. Cross-check names, houses, actors, and status (alive/dead) against the TV series as broadcast. Every `relations` entry's `source`/`target` must be an `id` present in `characters` — the validator above will log errors in the console if not; do not proceed until the console shows zero errors.

- [ ] **Step 2: Manual verification**

Open `index.html` in a browser, open dev tools console. Confirm:
- Console prints `Dataset loaded: N characters, M relations.` with no preceding `Duplicate character ids` or `references missing` errors.
- `N` is 200+ and `M` covers all five relation types (spot check by running `relations.map(r=>r.type)` in console and confirming all of `family`, `marriage`, `allegiance`, `conflict`, `bond` appear).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add full character and relation dataset"
```

---

### Task 3: Shared state and layout containers

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `characters`, `relations` (Task 2)
- Produces: global `const state = { view: "graph", selectedId: null, houseFilter: Set<string>, typeFilter: Set<string>, highlightIds: Set<string> }` initialized with all houses/types enabled; DOM containers `#graph-view`, `#tree-view`, `#filter-panel`, `#detail-panel` inside `#main-layout`; function `function getVisibleRelations()` returning `relations` filtered by `state.houseFilter` (both endpoints' house must be enabled) and `state.typeFilter`; function `function getVisibleCharacters()` returning `characters` filtered by `state.houseFilter`.

- [ ] **Step 1: Add layout containers and state object**

Replace `<div id="main-layout"></div>` in `index.html` with:

```html
<div id="main-layout">
  <aside id="filter-panel"></aside>
  <main id="canvas-area">
    <div id="graph-view"></div>
    <div id="tree-view" style="display:none;"></div>
  </main>
  <aside id="detail-panel"></aside>
</div>
```

Add to the CSS `<style>` block:

```css
#main-layout { display: flex; height: calc(100vh - 57px); }
#filter-panel { width: 220px; background: var(--panel-bg); border-right: 1px solid var(--panel-border); overflow-y: auto; padding: 12px; }
#canvas-area { flex: 1; position: relative; }
#graph-view, #tree-view { width: 100%; height: 100%; }
#detail-panel { width: 300px; background: var(--panel-bg); border-left: 1px solid var(--panel-border); overflow-y: auto; padding: 12px; display: none; }
#detail-panel.open { display: block; }
```

Add to the dataset `<script>` block, after the `validateDataset()` call:

```js
const state = {
  view: "graph",
  selectedId: null,
  houseFilter: new Set(Object.keys(HOUSE_COLORS)),
  typeFilter: new Set(["family", "marriage", "allegiance", "conflict", "bond"]),
  highlightIds: new Set()
};

function getVisibleCharacters() {
  return characters.filter(c => state.houseFilter.has(c.house));
}

function getVisibleRelations() {
  const visibleIds = new Set(getVisibleCharacters().map(c => c.id));
  return relations.filter(r =>
    state.typeFilter.has(r.type) &&
    visibleIds.has(r.source) &&
    visibleIds.has(r.target)
  );
}
```

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm via dev tools console:
- `getVisibleCharacters().length === characters.length` (all houses enabled by default)
- `getVisibleRelations().length === relations.length` (all types enabled by default)
- Page layout shows three columns: empty left filter panel, empty center canvas, empty right detail panel (detail panel not visible since `display:none` by default — confirm `#detail-panel` exists in DOM via `document.getElementById('detail-panel')`)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add shared state and layout containers"
```

---

### Task 4: Force-directed graph rendering

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `getVisibleCharacters()`, `getVisibleRelations()`, `state` (Task 3)
- Produces: `function renderGraph()` — clears and redraws `#graph-view` as an SVG force simulation; each node `<circle>` has `data-id` attribute equal to character id; each edge `<line>` has `data-source`/`data-target` attributes. Later tasks call `renderGraph()` whenever `state` filters/selection change.

- [ ] **Step 1: Add graph rendering function**

Add to the dataset `<script>` block:

```js
const RELATION_STYLE = {
  family:     { color: "#d4af37", dash: null },
  marriage:   { color: "#d97ba0", dash: "6,3" },
  allegiance: { color: "#8a8a93", dash: null },
  conflict:   { color: "#c23b3b", dash: "4,4" },
  bond:       { color: "#4a90d9", dash: "1,3" }
};

function renderGraph() {
  const container = document.getElementById("graph-view");
  container.innerHTML = "";
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  const svg = d3.select(container).append("svg")
    .attr("width", width).attr("height", height);
  const zoomLayer = svg.append("g");
  svg.call(d3.zoom().scaleExtent([0.2, 4]).on("zoom", (event) => {
    zoomLayer.attr("transform", event.transform);
  }));

  const nodes = getVisibleCharacters().map(c => ({ ...c }));
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const links = getVisibleRelations()
    .filter(r => nodeById.has(r.source) && nodeById.has(r.target))
    .map(r => ({ ...r }));

  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(70))
    .force("charge", d3.forceManyBody().strength(-120))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(18));

  const link = zoomLayer.append("g").selectAll("line")
    .data(links).join("line")
    .attr("data-source", d => d.source.id || d.source)
    .attr("data-target", d => d.target.id || d.target)
    .attr("stroke", d => RELATION_STYLE[d.type].color)
    .attr("stroke-dasharray", d => RELATION_STYLE[d.type].dash)
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.6);

  const node = zoomLayer.append("g").selectAll("circle")
    .data(nodes).join("circle")
    .attr("data-id", d => d.id)
    .attr("r", d => 6 + Math.min(6, links.filter(l => l.source.id === d.id || l.target.id === d.id || l.source === d.id || l.target === d.id).length))
    .attr("fill", d => d.sigilColor)
    .attr("opacity", d => d.status === "dead" ? 0.4 : 1)
    .attr("stroke", "#000").attr("stroke-width", 1)
    .call(d3.drag()
      .on("start", (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.append("title").text(d => d.name);
  node.on("click", (event, d) => { event.stopPropagation(); selectCharacter(d.id); });
  svg.on("click", () => selectCharacter(null));

  sim.on("tick", () => {
    link
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("cx", d => d.x).attr("cy", d => d.y);
  });
}

// Placeholder until Task 5 defines selection/highlight behavior fully.
function selectCharacter(id) {
  state.selectedId = id;
  console.log("selected:", id);
}
</script>
<script>
  if (typeof d3 !== 'undefined') { renderGraph(); }
</script>
```

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm:
- `#graph-view` shows an SVG with circles (nodes) connected by lines (edges), auto-arranging via force layout
- Dragging a node moves it and its connected edges follow
- Scrolling/pinching over the canvas zooms in/out; click-dragging empty canvas pans
- Dead characters (e.g. Ned Stark) render visibly dimmer than alive ones
- Clicking a node logs `selected: <id>` in console; clicking empty canvas logs `selected: null`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: render force-directed relation graph"
```

---

### Task 5: Selection, highlighting, and detail panel

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `state`, `characters`, `relations`, `renderGraph()` (Tasks 2-4)
- Produces: full `function selectCharacter(id)` replacing the Task 4 placeholder (sets `state.selectedId`, computes `state.highlightIds` from direct neighbors, dims non-highlighted nodes/edges via opacity, opens/populates `#detail-panel`); `function relationsFor(id)` returning `[{other: character, rel: relation}]` for a character.

- [ ] **Step 1: Replace placeholder `selectCharacter` and add detail panel rendering**

Replace the placeholder `selectCharacter` function from Task 4 with:

```js
function relationsFor(id) {
  return relations
    .filter(r => r.source === id || r.target === id)
    .map(r => {
      const otherId = r.source === id ? r.target : r.source;
      return { other: characters.find(c => c.id === otherId), rel: r };
    })
    .filter(x => x.other);
}

const TYPE_ICON = { family: "🩸", marriage: "💍", allegiance: "🛡", conflict: "⚔", bond: "🤝" };

function selectCharacter(id) {
  state.selectedId = id;
  const panel = document.getElementById("detail-panel");

  if (!id) {
    state.highlightIds = new Set();
    panel.classList.remove("open");
    applyHighlight();
    return;
  }

  const character = characters.find(c => c.id === id);
  const rels = relationsFor(id);
  state.highlightIds = new Set([id, ...rels.map(r => r.other.id)]);
  applyHighlight();

  panel.innerHTML = `
    <h2 class="display" style="color:${character.sigilColor}">${character.name}</h2>
    <p><strong>House:</strong> ${character.house}</p>
    <p><strong>Status:</strong> ${character.status === "alive" ? "Alive" : "Dead"}</p>
    <p><strong>Actor:</strong> ${character.actor}</p>
    <p>${character.bio}</p>
    <h3>Relations</h3>
    <ul id="relation-list">
      ${rels.map(r => `<li data-jump="${r.other.id}">${TYPE_ICON[r.rel.type]} ${r.rel.label} — <strong>${r.other.name}</strong></li>`).join("")}
    </ul>
  `;
  panel.querySelectorAll("[data-jump]").forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => selectCharacter(el.getAttribute("data-jump")));
  });
  panel.classList.add("open");
}

function applyHighlight() {
  const svg = d3.select("#graph-view svg");
  if (svg.empty()) return;
  const hasHighlight = state.highlightIds.size > 0;
  svg.selectAll("circle").attr("opacity", d =>
    !hasHighlight ? (d.status === "dead" ? 0.4 : 1) : (state.highlightIds.has(d.id) ? 1 : 0.12)
  );
  svg.selectAll("line").attr("opacity", d => {
    const sId = d.source.id || d.source, tId = d.target.id || d.target;
    return !hasHighlight ? 0.6 : (state.highlightIds.has(sId) && state.highlightIds.has(tId) ? 0.9 : 0.05);
  });
}
```

Add to CSS:
```css
#relation-list { list-style: none; padding: 0; }
#relation-list li { padding: 6px 0; border-bottom: 1px solid var(--panel-border); font-size: 0.9rem; }
#relation-list li:hover { color: var(--house-baratheon); }
```

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm:
- Clicking a node opens the right detail panel with correct name, house, status, actor, bio, and a relation list
- Clicking a relation list item jumps selection to that character (panel updates)
- Selected character's node and direct neighbors stay fully visible; all other nodes/edges dim
- Clicking empty canvas clears the panel and restores full opacity to all nodes/edges

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add selection, highlighting, and detail panel"
```

---

### Task 6: Search with autocomplete

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `characters`, `selectCharacter(id)` (Task 5)
- Produces: search input + dropdown wired into `#search-container`; selecting a result calls `selectCharacter(id)` and, if a node exists in the current graph render, centers/flashes it (simple approach: re-trigger `applyHighlight()`, which already runs from `selectCharacter`).

- [ ] **Step 1: Add search markup, styling, and logic**

Replace `<div id="search-container"></div>` in the top bar with:

```html
<div id="search-container">
  <input id="search-input" type="text" placeholder="Search characters..." autocomplete="off">
  <div id="search-results"></div>
</div>
```

Add to CSS:
```css
#search-container { position: relative; margin-left: auto; }
#search-input { background: var(--bg); border: 1px solid var(--panel-border); color: var(--text); padding: 6px 10px; border-radius: 4px; width: 220px; }
#search-results { position: absolute; top: 100%; left: 0; right: 0; background: var(--panel-bg); border: 1px solid var(--panel-border); max-height: 260px; overflow-y: auto; z-index: 10; display: none; }
#search-results.open { display: block; }
#search-results div { padding: 6px 10px; cursor: pointer; font-size: 0.9rem; }
#search-results div:hover { background: var(--panel-border); }
```

Add to the dataset `<script>` block:

```js
function initSearch() {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.classList.remove("open"); results.innerHTML = ""; return; }
    const matches = characters.filter(c => c.name.toLowerCase().includes(q)).slice(0, 10);
    results.innerHTML = matches.length
      ? matches.map(c => `<div data-id="${c.id}">${c.name} <span style="color:var(--text-dim)">(${c.house})</span></div>`).join("")
      : `<div style="color:var(--text-dim)">No characters found</div>`;
    results.classList.add("open");
    results.querySelectorAll("[data-id]").forEach(el => {
      el.addEventListener("click", () => {
        selectCharacter(el.getAttribute("data-id"));
        results.classList.remove("open");
        input.value = "";
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("search-container").contains(e.target)) {
      results.classList.remove("open");
    }
  });
}
initSearch();
```

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm:
- Typing a partial name (e.g. "jon") shows a dropdown listing matching characters with house names
- Typing a nonsense string (e.g. "zzzzz") shows "No characters found"
- Clicking a result selects that character (detail panel opens, graph highlights them), clears the input, and closes the dropdown
- Clicking outside the search box closes the dropdown

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add character search with autocomplete"
```

---

### Task 7: House and relation-type filters

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `state.houseFilter`, `state.typeFilter`, `HOUSE_COLORS`, `RELATION_STYLE`, `renderGraph()` (Tasks 3, 4)
- Produces: filter checkboxes in `#filter-panel`; toggling a checkbox updates `state.houseFilter`/`state.typeFilter` and calls `renderGraph()` (and, after Task 8, the active tree renderer) to redraw with the new filter applied.

- [ ] **Step 1: Add filter panel rendering**

Add to the dataset `<script>` block:

```js
function renderFilterPanel() {
  const panel = document.getElementById("filter-panel");
  const houseItems = Object.keys(HOUSE_COLORS).map(h => `
    <label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <input type="checkbox" data-house="${h}" checked>
      <span style="color:${HOUSE_COLORS[h]}">${h}</span>
    </label>`).join("");
  const typeItems = Object.keys(RELATION_STYLE).map(t => `
    <label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <input type="checkbox" data-type="${t}" checked>
      <span style="color:${RELATION_STYLE[t].color}">${t}</span>
    </label>`).join("");

  panel.innerHTML = `
    <h3>Houses</h3>${houseItems}
    <h3>Relation Types</h3>${typeItems}
  `;

  panel.querySelectorAll("[data-house]").forEach(cb => {
    cb.addEventListener("change", () => {
      const h = cb.getAttribute("data-house");
      cb.checked ? state.houseFilter.add(h) : state.houseFilter.delete(h);
      redrawActiveView();
    });
  });
  panel.querySelectorAll("[data-type]").forEach(cb => {
    cb.addEventListener("change", () => {
      const t = cb.getAttribute("data-type");
      cb.checked ? state.typeFilter.add(t) : state.typeFilter.delete(t);
      redrawActiveView();
    });
  });
}

function redrawActiveView() {
  if (state.view === "graph") renderGraph();
  else if (typeof renderTree === "function") renderTree();
}
renderFilterPanel();
```

Update the final bootstrap script (from Task 4) to also call the filter panel setup order correctly — no change needed since `renderFilterPanel()` is called at definition time, after `renderGraph()`'s script tag; confirm load order by placing this block's `<script>` before the bootstrap `<script>` block that calls `renderGraph()`.

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm:
- Filter panel lists all houses (colored to match sigil colors) and all 5 relation types, all checked by default
- Unchecking a house removes its characters and their edges from the graph; re-checking restores them
- Unchecking a relation type removes only edges of that type; nodes remain
- Unchecking all houses results in an empty graph with no console errors

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add house and relation-type filters"
```

---

### Task 8: House tree view

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `getVisibleCharacters()`, `getVisibleRelations()`, `state`, `selectCharacter(id)`, `RELATION_STYLE` (Tasks 3-5)
- Produces: `function renderTree()` — clears and redraws `#tree-view` with a house-selector row plus a D3 `tree()` hierarchy for the selected house (built from `family`/`parent` edges) and curved cross-links for marriage/allegiance/conflict/bond edges touching visible nodes; `state.selectedHouse` (defaults to `"Stark"`).

- [ ] **Step 1: Add tree rendering function**

Add to the dataset `<script>` block:

```js
state.selectedHouse = "Stark";

function buildFamilyHierarchy(houseName) {
  const houseChars = getVisibleCharacters().filter(c => c.house === houseName);
  const houseIds = new Set(houseChars.map(c => c.id));
  const parentEdges = getVisibleRelations().filter(r => r.type === "family" && r.subtype === "parent" && houseIds.has(r.source) && houseIds.has(r.target));
  const childIds = new Set(parentEdges.map(e => e.target));
  const roots = houseChars.filter(c => !childIds.has(c.id));

  function buildNode(char) {
    const children = parentEdges.filter(e => e.source === char.id).map(e => characters.find(c => c.id === e.target)).filter(Boolean);
    return { ...char, children: children.map(buildNode) };
  }

  if (roots.length === 0) return null;
  if (roots.length === 1) return buildNode(roots[0]);
  return { id: `__root_${houseName}`, name: houseName, house: houseName, sigilColor: HOUSE_COLORS[houseName], virtual: true, children: roots.map(buildNode) };
}

function renderTree() {
  const container = document.getElementById("tree-view");
  container.innerHTML = "";

  const selector = document.createElement("div");
  selector.id = "tree-house-selector";
  selector.innerHTML = Object.keys(HOUSE_COLORS).map(h =>
    `<button data-house="${h}" style="border-color:${HOUSE_COLORS[h]}" class="${h === state.selectedHouse ? 'active' : ''}">${h}</button>`
  ).join("");
  container.appendChild(selector);
  selector.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => { state.selectedHouse = btn.getAttribute("data-house"); renderTree(); });
  });

  const svgHost = document.createElement("div");
  svgHost.id = "tree-svg-host";
  container.appendChild(svgHost);

  const width = container.clientWidth || 800;
  const height = (container.clientHeight || 600) - 50;
  const svg = d3.select(svgHost).append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", "translate(60,40)");

  const hierarchyData = buildFamilyHierarchy(state.selectedHouse);
  if (!hierarchyData) {
    g.append("text").attr("fill", "var(--text-dim)").text("No family tree data for this house under current filters.");
    return;
  }

  const root = d3.hierarchy(hierarchyData);
  d3.tree().size([height - 80, width - 160])(root);

  g.selectAll(".tree-link").data(root.links()).join("path")
    .attr("class", "tree-link")
    .attr("fill", "none").attr("stroke", "var(--panel-border)").attr("stroke-width", 1.5)
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

  const node = g.selectAll(".tree-node").data(root.descendants()).join("g")
    .attr("class", "tree-node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .style("cursor", d => d.data.virtual ? "default" : "pointer");

  node.append("circle").attr("r", 8).attr("fill", d => d.data.sigilColor)
    .attr("opacity", d => d.data.status === "dead" ? 0.4 : 1);
  node.append("text").attr("dy", 4).attr("x", 12).attr("fill", "var(--text)").style("font-size", "0.8rem").text(d => d.data.name);
  node.filter(d => !d.data.virtual).on("click", (event, d) => selectCharacter(d.data.id));

  // Cross-links: marriage/allegiance/conflict/bond touching any node currently drawn
  const drawnIds = new Set(root.descendants().filter(d => !d.data.virtual).map(d => d.data.id));
  const posById = new Map(root.descendants().filter(d => !d.data.virtual).map(d => [d.data.id, d]));
  const crossLinks = getVisibleRelations().filter(r =>
    r.type !== "family" && drawnIds.has(r.source) && drawnIds.has(r.target)
  );
  g.selectAll(".cross-link").data(crossLinks).join("path")
    .attr("class", "cross-link")
    .attr("fill", "none")
    .attr("stroke", d => RELATION_STYLE[d.type].color)
    .attr("stroke-dasharray", d => RELATION_STYLE[d.type].dash)
    .attr("stroke-width", 1.5).attr("opacity", 0.7)
    .attr("d", d => {
      const s = posById.get(d.source), t = posById.get(d.target);
      if (!s || !t) return "";
      return `M${s.y},${s.x} Q${(s.y+t.y)/2},${(s.x+t.x)/2 - 30} ${t.y},${t.x}`;
    });
}
```

Add to CSS:
```css
#tree-house-selector { padding: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
#tree-house-selector button { background: var(--panel-bg); border: 1px solid; color: var(--text); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
#tree-house-selector button.active { background: var(--panel-border); }
#tree-svg-host { width: 100%; height: calc(100% - 50px); overflow: auto; }
```

- [ ] **Step 2: Manual verification**

Open `index.html`, then in the dev console run `state.view = "tree"; document.getElementById("graph-view").style.display="none"; document.getElementById("tree-view").style.display="block"; renderTree();` (view toggle button wired in Task 9). Confirm:
- House buttons render across the top, "Stark" active by default
- A tree renders below with Ned Stark as root, children Robb/Sansa/Arya/Bran/Rickon/Jon Snow connected below
- Marriage/bond/conflict cross-links (dashed/colored curves) render between nodes when applicable within the Stark tree
- Clicking a house button switches to that house's tree
- Clicking a real (non-virtual) node opens the detail panel same as graph view

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add house tree view with cross-links"
```

---

### Task 9: View toggle wiring

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `renderGraph()`, `renderTree()`, `state.view` (Tasks 4, 8)
- Produces: toggle buttons in `#view-toggle`; switching updates `state.view`, shows/hides `#graph-view`/`#tree-view`, and calls the appropriate render function.

- [ ] **Step 1: Add toggle markup and wiring**

Replace `<div id="view-toggle"></div>` with:

```html
<div id="view-toggle">
  <button id="btn-graph-view" class="view-btn active">Graph</button>
  <button id="btn-tree-view" class="view-btn">House Tree</button>
</div>
```

Add to CSS:
```css
.view-btn { background: var(--bg); border: 1px solid var(--panel-border); color: var(--text-dim); padding: 6px 14px; cursor: pointer; }
.view-btn.active { background: var(--panel-border); color: var(--text); }
.view-btn:first-child { border-radius: 4px 0 0 4px; }
.view-btn:last-child { border-radius: 0 4px 4px 0; }
```

Add to the dataset `<script>` block, and remove the old bootstrap `<script>` block from Task 4 (replace it with this one at the end of the file):

```js
function switchView(view) {
  state.view = view;
  document.getElementById("graph-view").style.display = view === "graph" ? "block" : "none";
  document.getElementById("tree-view").style.display = view === "tree" ? "block" : "none";
  document.getElementById("btn-graph-view").classList.toggle("active", view === "graph");
  document.getElementById("btn-tree-view").classList.toggle("active", view === "tree");
  redrawActiveView();
}
document.getElementById("btn-graph-view").addEventListener("click", () => switchView("graph"));
document.getElementById("btn-tree-view").addEventListener("click", () => switchView("tree"));

if (typeof d3 !== 'undefined') { renderGraph(); }
```

Update `redrawActiveView()` from Task 7 — it already branches on `state.view` and calls `renderTree()` if defined, so no change needed there.

- [ ] **Step 2: Manual verification**

Open `index.html`. Confirm:
- "Graph" button active by default, graph view visible, tree view hidden
- Clicking "House Tree" switches view: tree renders, graph hides, button active states swap
- Clicking "Graph" switches back, graph re-renders correctly
- Filters toggled in either view persist and apply correctly after switching views

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: wire graph/tree view toggle"
```

---

### Task 10: Shortest-path finder

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `characters`, `relations`, `state.highlightIds`, `applyHighlight()`, `redrawActiveView()` (Tasks 2, 5, 9)
- Produces: `function findShortestPath(startId, endId)` returning `{path: [ids...], edges: [relations...]} | null` via BFS over the full (unfiltered) relation graph; UI block in `#filter-panel` (or a new `#path-finder` section) with two search-style inputs and a result area; highlights path nodes/edges by extending `state.highlightIds` and drawing a `state.pathEdgeIds` set that `applyHighlight()` also checks.

- [ ] **Step 1: Add BFS function**

Add to the dataset `<script>` block:

```js
function findShortestPath(startId, endId) {
  if (startId === endId) return { path: [startId], edges: [] };
  const adjacency = new Map();
  relations.forEach(r => {
    if (!adjacency.has(r.source)) adjacency.set(r.source, []);
    if (!adjacency.has(r.target)) adjacency.set(r.target, []);
    adjacency.get(r.source).push({ to: r.target, rel: r });
    adjacency.get(r.target).push({ to: r.source, rel: r });
  });

  const visited = new Set([startId]);
  const queue = [{ id: startId, path: [startId], edges: [] }];
  while (queue.length) {
    const { id, path, edges } = queue.shift();
    const neighbors = adjacency.get(id) || [];
    for (const { to, rel } of neighbors) {
      if (visited.has(to)) continue;
      const newPath = [...path, to];
      const newEdges = [...edges, rel];
      if (to === endId) return { path: newPath, edges: newEdges };
      visited.add(to);
      queue.push({ id: to, path: newPath, edges: newEdges });
    }
  }
  return null;
}
```

- [ ] **Step 2: Add path-finder UI and highlight wiring**

Add to `renderFilterPanel()`'s returned HTML (append inside the template literal, after the relation-types section, in Task 7's `renderFilterPanel` function):

```js
    <h3>Shortest Path</h3>
    <input id="path-input-a" list="path-char-list" placeholder="From..." style="width:100%;margin-bottom:6px;">
    <input id="path-input-b" list="path-char-list" placeholder="To..." style="width:100%;margin-bottom:6px;">
    <datalist id="path-char-list">
      ${characters.map(c => `<option value="${c.name}">`).join("")}
    </datalist>
    <button id="path-find-btn" style="width:100%;">Find Path</button>
    <div id="path-result" style="margin-top:8px;font-size:0.85rem;"></div>
```

Add wiring, also inside `renderFilterPanel()`, after the existing `panel.querySelectorAll("[data-type]")` block:

```js
  document.getElementById("path-find-btn").addEventListener("click", () => {
    const nameA = document.getElementById("path-input-a").value.trim().toLowerCase();
    const nameB = document.getElementById("path-input-b").value.trim().toLowerCase();
    const a = characters.find(c => c.name.toLowerCase() === nameA);
    const b = characters.find(c => c.name.toLowerCase() === nameB);
    const resultEl = document.getElementById("path-result");
    if (!a || !b) { resultEl.textContent = "Pick two valid characters from the list."; return; }

    const result = findShortestPath(a.id, b.id);
    if (!result) {
      resultEl.textContent = "No connection found.";
      state.pathEdgeIds = new Set();
      state.highlightIds = new Set();
      applyHighlight();
      return;
    }

    resultEl.innerHTML = result.path.map((id, i) => {
      const c = characters.find(ch => ch.id === id);
      if (i === 0) return `<strong>${c.name}</strong>`;
      return ` → ${result.edges[i-1].label} → <strong>${c.name}</strong>`;
    }).join("");

    state.highlightIds = new Set(result.path);
    state.pathEdgeIds = new Set(result.edges.map(e => `${e.source}|${e.target}`));
    applyHighlight();
  });
```

- [ ] **Step 3: Extend `applyHighlight()` to treat path edges as fully visible**

Modify `applyHighlight()` from Task 5:

```js
function applyHighlight() {
  const svg = d3.select("#graph-view svg");
  if (svg.empty()) return;
  const hasHighlight = state.highlightIds.size > 0;
  const pathEdgeIds = state.pathEdgeIds || new Set();
  svg.selectAll("circle").attr("opacity", d =>
    !hasHighlight ? (d.status === "dead" ? 0.4 : 1) : (state.highlightIds.has(d.id) ? 1 : 0.12)
  );
  svg.selectAll("line").attr("opacity", d => {
    const sId = d.source.id || d.source, tId = d.target.id || d.target;
    const key1 = `${sId}|${tId}`, key2 = `${tId}|${sId}`;
    if (pathEdgeIds.has(key1) || pathEdgeIds.has(key2)) return 1;
    return !hasHighlight ? 0.6 : (state.highlightIds.has(sId) && state.highlightIds.has(tId) ? 0.9 : 0.05);
  });
}
```

- [ ] **Step 4: Manual verification**

Open `index.html`. Confirm:
- Filter panel now has a "Shortest Path" section with two text inputs (autocomplete via datalist) and a "Find Path" button
- Entering "Jon Snow" and "Daenerys Targaryen" and clicking Find Path shows a relation chain and highlights the path in the graph
- Entering two characters known to be disconnected under current dataset (e.g., an obscure Free Folk character with no relations and a Martell character) shows "No connection found."
- Entering an invalid name shows "Pick two valid characters from the list."

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add shortest-path finder"
```

---

### Task 11: Full manual QA pass

**Files:**
- Modify: `index.html` (only if bugs found during QA)

**Interfaces:**
- Consumes: entire application (Tasks 1-10)
- Produces: none (verification-only task); fixes any bugs found inline.

- [ ] **Step 1: Run full checklist**

Open `index.html` via `file://` (double-click) on a clean browser profile if possible, and walk through:

1. Page loads with no console errors, dataset validator logs 200+ characters / 0 errors.
2. Graph view: nodes draggable, zoomable, pannable; dead characters visibly dimmed; clicking a node opens detail panel and highlights neighbors; clicking empty space clears selection.
3. Search: typing filters results live, selecting jumps to and highlights the character, no-match state shows correctly.
4. Filters: toggling any house or relation type immediately updates the graph; toggling back restores it.
5. Tree view: switching to it renders the currently selected house's family tree with correct parent/child structure; switching houses works; cross-links (marriage/allegiance/conflict/bond) render as curved colored/dashed lines; filters applied in graph view carry over.
6. Shortest-path finder: a known connected pair returns a correct, sensible chain; a disconnected pair returns "No connection found"; highlighted path is visually distinct in the graph.
7. Detail panel: relation list is accurate and each entry is clickable and jumps correctly; status/actor/bio populate correctly for at least 5 spot-checked characters across different houses.
8. Theme: dark background throughout, house colors visibly distinct and correctly applied to nodes/buttons/text per house.
9. Resize the browser window: layout doesn't break (columns still render, canvas fills available space — full responsiveness polish is out of scope, but nothing should be totally broken).

- [ ] **Step 2: Fix any issues found**

For each issue found in Step 1, make the minimal code change in `index.html` to fix it, then re-run the specific checklist item that failed to confirm the fix.

- [ ] **Step 3: Final commit**

```bash
git add index.html
git commit -m "fix: address issues found in full QA pass"
```

(If Step 1 finds zero issues, skip this commit — nothing to commit.)

---

## Self-Review Notes

- **Spec coverage:** delivery/offline single-file (Task 1), dataset/content scope (Task 2), force graph (Task 4), tree view (Task 8), search (Task 6), filters (Task 7), detail panel (Task 5), shortest-path (Task 10), theme (Task 1 CSS vars, applied throughout), error handling for missing D3/no-path/no-search-match (Tasks 1, 6, 10) — all covered.
- **Placeholder scan:** dataset in Task 2 ships an 8-character seed with an explicit authoring note to expand to 200+ before Task 3 — this is a scoped data-authoring instruction, not a vague TODO; every other task ships complete, runnable code.
- **Type/name consistency checked:** `selectCharacter(id)` (Task 4 placeholder → Task 5 full impl, same signature used in Tasks 6, 8), `renderGraph()`/`renderTree()`/`redrawActiveView()` (Tasks 4, 7, 8, 9 all reference the same three names), `state.houseFilter`/`state.typeFilter`/`state.highlightIds`/`state.pathEdgeIds`/`state.selectedHouse`/`state.view` (Task 3 init, consumed identically in Tasks 4-10), `HOUSE_COLORS`/`RELATION_STYLE` (Task 2/4, reused in Tasks 7, 8) all match across tasks.
