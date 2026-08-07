# Game of Thrones — Relations Explorer

An interactive, single-page visualization of every major relationship between Game of Thrones (TV canon) characters — family ties, marriages, allegiances, conflicts, and bonds — rendered as a force-directed graph or a per-house family tree.

**[Live demo →](https://kaushik27.github.io/game-of-thrones/)**

![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?logo=d3.js&logoColor=white)

## Features

- **Force-directed relation graph** — pan, zoom, and drag nodes; node size scales with connection count; dead characters render dimmed with a skull glyph
- **House tree view** — collapsible family trees per house, with marriages/allegiances/conflicts overlaid as cross-links
- **Search with autocomplete** — jump straight to any character
- **House and relation-type filters** — isolate the houses or relationship types you care about
- **Shortest-path finder** — BFS between any two characters, with the relation chain printed out (e.g. `Jon Snow → sibling → Sansa Stark → allegiance → ...`)
- **Detail panel** — click any character for their house, status, actor, bio, and full relation list

Covers 200+ characters across Stark, Lannister, Targaryen, Baratheon, Greyjoy, Tyrell, Martell, Arryn, Tully, the Night's Watch, wildlings/free folk, and notable unaffiliated characters.

## Running locally

No build step, no dependencies to install — it's a single static HTML file.

```bash
open index.html
```

or serve it:

```bash
python3 -m http.server 8000
```

Everything runs offline after first load, aside from two CDN includes (D3.js and a Google Fonts stylesheet).

## Tech stack

- Vanilla JS + [D3.js v7](https://d3js.org/) (force simulation, tree layout, zoom/drag behaviors)
- Plain CSS, no framework
- Character/relation dataset embedded directly in `index.html`

## Deployment

Pushes to `master` auto-deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Design docs

Implementation plan and design spec live under [`docs/superpowers/`](docs/superpowers/).
