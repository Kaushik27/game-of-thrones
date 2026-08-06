# Game of Thrones Relations Explorer — Design

## Purpose

Single-file, offline-runnable interactive website that lets a user explore every major relation (family, marriage, allegiance, conflict, bond) between Game of Thrones (TV canon) characters. No hosting, no build, no server — open `index.html` in a browser and it works.

## Delivery

- One file: `index.html`.
- All CSS and JS inlined in that file except two CDN includes: D3.js v7 (`https://d3js.org/d3.v7.min.js`) and a Google Fonts stylesheet for a serif display font (Cinzel or similar), with a system-serif fallback if the font fails to load.
- Character/relation dataset is a JS object embedded directly in the file (no separate JSON fetch, so it also works from `file://`).
- Requires internet only for the two CDN includes on first load; everything else runs fully offline.

## Content scope

- TV show canon (HBO series through its ending).
- ~200+ characters spanning major and minor houses: Stark, Lannister, Targaryen, Baratheon, Greyjoy, Tyrell, Martell, Arryn, Tully, plus Night's Watch, wildlings/free folk, and notable unaffiliated characters.

## Data model

```js
characters = [
  {
    id: "jon-snow",
    name: "Jon Snow",
    house: "Stark", // or "Targaryen", "Night's Watch", etc — primary affiliation
    status: "alive" | "dead",
    actor: "Kit Harington",
    bio: "short 1-2 sentence summary",
    sigilColor: "#..." // house color, precomputed per character
  },
  ...
]

relations = [
  {
    source: "ned-stark",
    target: "jon-snow",
    type: "family" | "marriage" | "allegiance" | "conflict" | "bond",
    subtype: "parent" | "sibling" | "child" | "spouse" | "betrothed" |
             "liege" | "sworn" | "bannerman" | "enemy" | "killed" |
             "mentor" | "protector" | "friend",
    label: "raised as brother" // human-readable, shown in UI
  },
  ...
]
```

- Family relations carry direction (`parent`→`child`) so the tree view can build hierarchies; graph view treats them as undirected for rendering.
- `killed` subtype implies a `conflict` type edge and also drives the "status: dead" styling.

## Views

Two views, switchable via a toggle in the top bar. Both share the same filter/search/detail-panel state.

### 1. Force-directed graph (default)

- D3 force simulation (`forceLink`, `forceManyBody`, `forceCollide`, `forceCenter`).
- Node fill = character's house sigil color; dead characters rendered dimmed/desaturated with a small skull glyph.
- Node size scales lightly with relation count (more connected = slightly larger).
- Edges colored and dash-patterned by relation type (e.g. solid gold = family, dashed pink = marriage, solid grey = allegiance, dashed red = conflict, dotted blue = bond).
- Pan and zoom (D3 zoom behavior), drag individual nodes to reposition.
- Click a node: highlights that node and its direct edges/neighbors at full opacity, dims everything else, opens the detail panel.
- Click empty canvas: clears highlight/selection.

### 2. House tree view

- Collapsible hierarchical tree per house (D3 `tree()` layout), house selectable via tabs or a dropdown.
- Parent/child/sibling family edges form the tree structure.
- Marriages, allegiances spanning houses, and conflicts are overlaid as curved cross-links between trees/nodes, styled the same as in graph view (color/dash by type), toggleable independently via the relation-type filter.
- Same click-to-select/detail-panel behavior as graph view.

## Controls (persist across both views)

- **Search bar with autocomplete**: type a name, matching characters appear in a dropdown; selecting one pans/zooms to that node (or switches tree view to their house) and selects it.
- **House filter**: checkboxes per house to show/hide its characters and edges.
- **Relation-type filter**: checkboxes for family / marriage / allegiance / conflict / bond to show/hide those edges.
- **Shortest-path finder**: two search inputs (character A, character B) plus a "find path" button. Runs BFS over the full relation graph (all types, ignoring current filters) and highlights the path's nodes/edges in both views, plus prints the relation chain as text (e.g. "Jon Snow → sibling → Sansa Stark → allegiance → ... ").
- **Detail side panel** (opens on node click): character name, house color swatch, status badge, actor name, short bio, and a list of their relations (each with a type icon and target name); clicking a listed relation jumps to that character.

## Visual theme

- Dark background (near-black/charcoal, e.g. `#0d0d0f`).
- House-colored dark theme: UI accents (active filter chips, selected tab, node fill, tree branch strokes) use each house's real sigil colors:
  - Stark: grey/white
  - Lannister: crimson/gold
  - Targaryen: black/red
  - Baratheon: black/gold
  - Greyjoy: black/gold
  - Tyrell: green/gold
  - Martell: orange/red
  - Night's Watch: black
- Headers/titles use a serif display font (Cinzel via Google Fonts, falling back to system serif); body/panel text uses a clean sans-serif.
- Layout: top bar (title, view toggle, search), left/collapsible filter panel, main canvas (graph or tree), right-side detail panel (hidden until a character is selected).

## Error handling / edge cases

- If CDN fonts/D3 fail to load (offline first run): D3 is required for rendering, so show a plain-text fallback message ("Requires internet on first load to fetch D3.js") if `d3` is undefined; font gracefully falls back to system serif via CSS `font-family` stack, no JS handling needed.
- Shortest-path finder: if no path exists between two characters, display "No connection found" instead of a chain.
- Search with no matches: show "No characters found" in the dropdown.

## Testing

- Manual verification in-browser (open `index.html` directly via `file://`, and also via a quick local static server) covering: both views render and switch cleanly, search jumps correctly, filters hide/show as expected, detail panel populates correctly for several characters across different houses, shortest-path finder returns correct chains for a couple of known relations (e.g. Jon Snow → Daenerys Targaryen) and correctly reports "no connection" for an intentionally disconnected pair, dead-character styling and cross-house marriage/conflict links render correctly in tree view.
- No automated test framework — this is a static single-file artifact; correctness of the dataset itself is spot-checked against known TV canon during authoring.
