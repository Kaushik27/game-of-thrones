// Accessible, season-aware map of Westeros.
//
// Runtime dependencies are intentionally limited to the classic-script globals
// loaded by index.html: D3, map-data.js, data.js, events.js, battles.js, and
// common.js. The module owns every node and style it adds to the supplied root.
(function installLivingRealmMap(window, document) {
  "use strict";

  const instances = new WeakMap();
  let nextInstanceId = 0;

  const FALLBACK_SEASONS = [1, 2, 3, 4, 5, 6, 7, 8];
  const EVENT_COLORS = {
    battle: "#a62f32",
    death: "#733238",
    wedding: "#a14972",
    coronation: "#9b7723",
    politics: "#326b91",
    birth: "#477044",
    other: "#675f56"
  };

  function escapeMarkup(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeSeason(value) {
    const match = String(value == null ? "" : value).match(/(?:^|\D)([1-8])(?:\D|$)/);
    return match ? Number(match[1]) : null;
  }

  function normalizeWords(value) {
    return String(value == null ? "" : value)
      .toLocaleLowerCase()
      .replace(/[’']/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function containsPhrase(text, phrase) {
    const haystack = ` ${normalizeWords(text)} `;
    const needle = normalizeWords(phrase);
    return needle.length > 1 && haystack.includes(` ${needle} `);
  }

  function containsLocatedPhrase(text, phrase) {
    const haystack = normalizeWords(text);
    const needle = normalizeWords(phrase);
    if (needle.length < 2) return false;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prepositions = "at|in|inside|outside|near|from|beneath|across|through|within|beyond|around|under";
    return new RegExp(`(?:^| )(?:(?:${prepositions}) )(?:a |an |the )?${escaped}(?: |$)`).test(haystack);
  }

  function getRuntimeData() {
    const runtime = {
      d3: window.d3,
      viewBox: typeof MAP_VIEWBOX !== "undefined" ? MAP_VIEWBOX : null,
      regions: typeof MAP_REGIONS !== "undefined" ? MAP_REGIONS : null,
      outline: typeof MAP_LANDMASS_OUTLINE !== "undefined" ? MAP_LANDMASS_OUTLINE : null,
      islets: typeof MAP_ISLETS !== "undefined" ? MAP_ISLETS : "",
      terrain: typeof MAP_TERRAIN !== "undefined" ? MAP_TERRAIN : [],
      settlements: typeof MAP_SETTLEMENTS !== "undefined" ? MAP_SETTLEMENTS : [],
      seaLabels: typeof MAP_SEA_LABELS !== "undefined" ? MAP_SEA_LABELS : [],
      events: typeof events !== "undefined" ? events : [],
      battles: typeof battles !== "undefined" ? battles : [],
      characters: typeof characters !== "undefined" ? characters : [],
      houseColors: typeof HOUSE_COLORS !== "undefined" ? HOUSE_COLORS : {},
      houseInfo: typeof HOUSE_INFO !== "undefined" ? HOUSE_INFO : {},
      seasons: typeof SEASONS !== "undefined" ? SEASONS : FALLBACK_SEASONS
    };

    if (!runtime.d3 || typeof runtime.d3.zoom !== "function") {
      throw new Error("LivingRealmMap requires D3 v7 or a compatible D3 zoom implementation.");
    }
    if (!Array.isArray(runtime.regions) || !runtime.regions.length || !runtime.outline) {
      throw new Error("LivingRealmMap requires MAP_REGIONS and MAP_LANDMASS_OUTLINE from js/map-data.js.");
    }

    runtime.terrain = Array.isArray(runtime.terrain) ? runtime.terrain : [];
    runtime.settlements = Array.isArray(runtime.settlements) ? runtime.settlements : [];
    runtime.seaLabels = Array.isArray(runtime.seaLabels) ? runtime.seaLabels : [];
    runtime.events = Array.isArray(runtime.events) ? runtime.events : [];
    runtime.battles = Array.isArray(runtime.battles) ? runtime.battles : [];
    runtime.characters = Array.isArray(runtime.characters) ? runtime.characters : [];
    runtime.seasons = Array.isArray(runtime.seasons) ? runtime.seasons : FALLBACK_SEASONS;
    return runtime;
  }

  function parseViewBox(value) {
    const parts = String(value || "-90 -60 880 1090").trim().split(/[\s,]+/).map(Number);
    if (parts.length !== 4 || parts.some(number => !Number.isFinite(number)) || parts[2] <= 0 || parts[3] <= 0) {
      return [-90, -60, 880, 1090];
    }
    return parts;
  }

  function makeLocationResolver(runtime) {
    const settlements = runtime.settlements
      .filter(item => item && item.name && Number.isFinite(item.x) && Number.isFinite(item.y))
      .slice()
      .sort((a, b) => b.name.length - a.name.length);

    const regionAliases = [];
    runtime.regions.forEach(region => {
      const aliases = [region.name, region.id && region.id.replace(/-/g, " ")];
      if (region.name) aliases.push(region.name.replace(/^the\s+/i, ""));
      aliases.filter(Boolean).forEach(alias => {
        regionAliases.push({ alias, region });
      });
    });
    regionAliases.sort((a, b) => b.alias.length - a.alias.length);

    function matchedRegion(text, settlement) {
      const explicit = regionAliases.find(entry => containsPhrase(text, entry.alias));
      if (explicit) return explicit.region;
      if (!settlement) return null;
      return runtime.regions.find(region => normalizeWords(region.seat) === normalizeWords(settlement.name)) || null;
    }

    return function resolveLocation(sourceText, qualifiedOnly, regionAtStartOnly) {
      const text = String(sourceText || "");
      const matcher = qualifiedOnly ? containsLocatedPhrase : containsPhrase;
      const settlement = settlements.find(item => matcher(text, item.name));
      const normalizedText = normalizeWords(text);
      const explicitRegion = regionAliases.find(entry => {
        if (!matcher(text, entry.alias)) return false;
        if (!regionAtStartOnly) return true;
        const normalizedAlias = normalizeWords(entry.alias);
        return normalizedText === normalizedAlias || normalizedText.startsWith(`${normalizedAlias} `);
      });
      const region = explicitRegion
        ? explicitRegion.region
        : matchedRegion(qualifiedOnly || regionAtStartOnly ? "" : text, settlement);

      if (settlement) {
        return {
          x: settlement.x,
          y: settlement.y,
          anchorName: settlement.name,
          precision: "settlement",
          regionId: region ? region.id : null
        };
      }

      if (region) {
        const anchor = region.labelXY || region.seatXY;
        if (Array.isArray(anchor) && anchor.length >= 2) {
          return {
            x: Number(anchor[0]),
            y: Number(anchor[1]),
            anchorName: region.name,
            precision: "region",
            regionId: region.id
          };
        }
      }
      return null;
    };
  }

  function buildHotspots(runtime) {
    const resolveLocation = makeLocationResolver(runtime);
    const eventById = new Map(runtime.events.map(event => [event.id, event]));
    const linkedEventIds = new Set();
    const markers = [];

    runtime.battles.forEach(record => {
      const season = normalizeSeason(record.season);
      const location = resolveLocation(`${record.location || ""} ${record.name || ""}`);
      if (!season || !location) return;

      const linkedEvents = (record.linkedEvents || []).map(id => eventById.get(id)).filter(Boolean);
      (record.linkedEvents || []).forEach(id => linkedEventIds.add(id));
      const linkedType = linkedEvents.length ? linkedEvents[0].type : null;
      const isBattle = linkedType === "battle" || /^battle\b/i.test(record.name || "") || /loot train battle/i.test(record.name || "");
      markers.push({
        id: `record:${record.id}`,
        sourceId: record.id,
        sourceKind: "battle-record",
        kind: isBattle ? "battle" : "event",
        eventType: linkedType || (isBattle ? "battle" : "other"),
        season,
        title: record.name,
        locationLabel: record.location || location.anchorName,
        detail: record,
        linkedEvents,
        ...location
      });
    });

    runtime.events.forEach(event => {
      if (linkedEventIds.has(event.id)) return;
      const season = normalizeSeason(event.season);
      // A place name in prose can be a destination or comparison rather than
      // the event site (for example, "aboard ship to Winterfell"). Titles are
      // safe direct matches; summaries require a locative preposition.
      const location = resolveLocation(event.title || "", false, true) || resolveLocation(event.summary || "", true);
      if (!season || !location) return;
      markers.push({
        id: `event:${event.id}`,
        sourceId: event.id,
        sourceKind: "event",
        kind: event.type === "battle" ? "battle" : "event",
        eventType: event.type || "other",
        season,
        title: event.title,
        locationLabel: location.anchorName,
        detail: event,
        ...location
      });
    });

    // Events at the same named place are offset around their real anchor so
    // each remains clickable. The source anchor is retained for disclosure.
    FALLBACK_SEASONS.forEach(season => {
      const byAnchor = new Map();
      markers.filter(marker => marker.season === season).forEach(marker => {
        const key = `${marker.x.toFixed(2)}:${marker.y.toFixed(2)}`;
        if (!byAnchor.has(key)) byAnchor.set(key, []);
        byAnchor.get(key).push(marker);
      });
      byAnchor.forEach(group => {
        group.forEach((marker, index) => {
          marker.anchorX = marker.x;
          marker.anchorY = marker.y;
          if (group.length === 1) return;
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / group.length;
          const radius = group.length > 4 ? 18 : 13;
          marker.x += Math.cos(angle) * radius;
          marker.y += Math.sin(angle) * radius;
        });
      });
    });

    return markers.sort((a, b) => {
      const seasonOrder = a.season - b.season;
      if (seasonOrder) return seasonOrder;
      const kindOrder = Number(b.kind === "battle") - Number(a.kind === "battle");
      return kindOrder || a.title.localeCompare(b.title);
    });
  }

  function styleText() {
    return `
      .living-realm-map {
        --lrm-gold: var(--accent, #d4af37);
        --lrm-text: var(--text, #eee9df);
        --lrm-dim: var(--text-dim, #b9b2a7);
        --lrm-faint: var(--text-faint, #858077);
        --lrm-panel: var(--panel-bg, #17171b);
        --lrm-panel-alt: var(--panel-bg-alt, #202025);
        --lrm-border: var(--panel-border, rgba(255,255,255,.14));
        --lrm-paper: #eadfbe;
        --lrm-paper-deep: #d9c79e;
        --lrm-ink: #493921;
        --lrm-sea: #c8ba94;
        color: var(--lrm-text);
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .living-realm-map *, .living-realm-map *::before, .living-realm-map *::after { box-sizing: border-box; }
      .lrm-sr-only {
        position: absolute !important; width: 1px !important; height: 1px !important;
        padding: 0 !important; margin: -1px !important; overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;
      }
      .lrm-toolbar {
        display: flex; align-items: end; justify-content: space-between; gap: 16px;
        flex-wrap: wrap; margin: 0 0 14px;
      }
      .lrm-season-field { min-width: 0; margin: 0; padding: 0; border: 0; }
      .lrm-season-field legend, .lrm-region-control span {
        display: block; margin-bottom: 7px; color: var(--lrm-dim); font-size: .72rem;
        font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
      }
      .lrm-season-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
      .lrm-season-button, .lrm-icon-button, .lrm-mode-button, .lrm-list-button {
        appearance: none; border: 1px solid var(--lrm-border); background: var(--lrm-panel);
        color: var(--lrm-text); border-radius: 2px; cursor: pointer; font: inherit;
      }
      .lrm-season-button {
        min-width: 42px; min-height: 40px; padding: 8px 10px; font-weight: 700;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
      }
      .lrm-season-button:hover { border-color: color-mix(in srgb, var(--lrm-gold) 70%, transparent); transform: translateY(-1px); }
      .lrm-season-button[aria-pressed="true"] { background: var(--lrm-gold); border-color: var(--lrm-gold); color: #17130a; }
      .lrm-region-control { min-width: min(100%, 250px); }
      .lrm-region-select {
        width: 100%; min-height: 40px; border: 1px solid var(--lrm-border); border-radius: 2px;
        padding: 8px 34px 8px 11px; background: var(--lrm-panel); color: var(--lrm-text); font: inherit;
      }
      .lrm-summary-row {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        margin-bottom: 12px; color: var(--lrm-dim); font-size: .84rem;
      }
      .lrm-summary { margin: 0; }
      .lrm-legend { display: inline-flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; }
      .lrm-legend span { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
      .lrm-legend-shape { width: 10px; height: 10px; display: inline-block; background: #9a3335; transform: rotate(45deg); }
      .lrm-legend-shape.event { border-radius: 50%; background: #a9812d; transform: none; }
      .lrm-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 340px); gap: 20px; align-items: start; }
      .lrm-map-column { min-width: 0; }
      .lrm-frame {
        position: relative; isolation: isolate; padding: 8px; overflow: hidden; border-radius: 2px;
        border: 1px solid rgba(212,175,55,.35);
        background: #15110c;
        box-shadow: 0 18px 48px rgba(0,0,0,.45), 0 0 70px rgba(212,175,55,.05);
      }
      .lrm-svg {
        width: 100%; height: auto; max-height: 82vh; display: block; border-radius: 1px;
        background: var(--lrm-sea); cursor: grab; touch-action: pan-y pinch-zoom;
      }
      .lrm-svg:active { cursor: grabbing; }
      .lrm-interaction-active .lrm-svg { touch-action: none; }
      .lrm-region {
        cursor: pointer; fill-opacity: .32; stroke: #6d5836; stroke-width: .75;
        stroke-dasharray: 3.5 2.5; vector-effect: non-scaling-stroke;
        transition: fill-opacity 150ms ease, stroke 150ms ease;
      }
      .lrm-region:hover, .lrm-region:focus-visible { fill-opacity: .5; stroke: #24190e; outline: none; }
      .lrm-region[aria-pressed="true"] { fill-opacity: .62; stroke: #211608; stroke-width: 2; stroke-dasharray: none; }
      .lrm-region:focus-visible { stroke: #fff2bb; stroke-width: 3; }
      .lrm-region-label {
        fill: #3f301c; font-family: Cinzel, Georgia, serif; font-weight: 700;
        letter-spacing: .18em; text-anchor: middle; paint-order: stroke fill;
        stroke: rgba(238,224,190,.82); stroke-width: 2.2px; stroke-linejoin: round; pointer-events: none;
      }
      .lrm-sea-label {
        fill: #77613a; font-family: "Cormorant Garamond", Georgia, serif; font-style: italic;
        letter-spacing: .22em; text-anchor: middle; opacity: .82; pointer-events: none;
      }
      .lrm-terrain { color: #69583a; opacity: .46; pointer-events: none; }
      .lrm-settlement { color: #352718; pointer-events: none; }
      .lrm-settlement-label {
        fill: #493921; font-family: Cinzel, Georgia, serif; font-size: 6.4px; opacity: 0;
        paint-order: stroke fill; stroke: rgba(238,224,190,.9); stroke-width: 1.7px; pointer-events: none;
        transition: opacity 150ms ease;
      }
      .lrm-is-zoomed .lrm-settlement-label { opacity: 1; }
      .lrm-is-deep-zoom .lrm-sea-label { opacity: 0; }
      .lrm-hotspot { cursor: pointer; color: #9a3335; outline: none; }
      .lrm-hotspot[data-kind="event"] { color: #9b7723; }
      .lrm-hotspot .lrm-hotspot-halo { fill: transparent; stroke: currentColor; stroke-width: 1.2; opacity: .52; vector-effect: non-scaling-stroke; }
      .lrm-hotspot .lrm-hotspot-core { fill: currentColor; stroke: #fff0c4; stroke-width: 1.25; vector-effect: non-scaling-stroke; }
      .lrm-hotspot:hover .lrm-hotspot-halo, .lrm-hotspot:focus-visible .lrm-hotspot-halo,
      .lrm-hotspot[aria-pressed="true"] .lrm-hotspot-halo { fill: color-mix(in srgb, currentColor 18%, transparent); stroke-width: 3; opacity: 1; }
      .lrm-hotspot:focus-visible .lrm-hotspot-core { stroke: #fff; stroke-width: 3; }
      .lrm-detail {
        min-height: 300px; padding: 20px; border: 1px solid var(--lrm-border); border-radius: 2px;
        background: rgba(6,9,10,.92);
      }
      .lrm-detail h2 { margin: 0 0 6px; color: var(--lrm-gold); font-family: Cinzel, Georgia, serif; font-size: clamp(1.2rem, 2vw, 1.65rem); line-height: 1.25; }
      .lrm-detail h3 { margin: 18px 0 7px; font-family: Cinzel, Georgia, serif; font-size: .93rem; }
      .lrm-detail p { margin: 8px 0; color: var(--lrm-dim); font-size: .88rem; line-height: 1.55; }
      .lrm-kicker { color: var(--lrm-faint) !important; font-size: .72rem !important; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      .lrm-meta { color: var(--lrm-dim); font-size: .82rem; }
      .lrm-precision { padding: 8px 10px; border-left: 2px solid var(--lrm-gold); background: rgba(212,175,55,.07); }
      .lrm-detail-list, .lrm-character-list { display: grid; gap: 7px; margin: 8px 0 0; padding: 0; list-style: none; }
      .lrm-list-button {
        width: 100%; padding: 9px 10px; text-align: left; color: var(--lrm-text); line-height: 1.35;
      }
      .lrm-list-button:hover { border-color: var(--lrm-gold); background: var(--lrm-panel-alt); }
      .lrm-list-button small { display: block; margin-top: 2px; color: var(--lrm-faint); }
      .lrm-character-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lrm-character-list a, .lrm-cta {
        color: var(--lrm-text); text-decoration: none; border-radius: 2px;
      }
      .lrm-character-list a { min-width: 0; padding: 5px 7px; border: 1px solid transparent; font-size: .82rem; overflow-wrap: anywhere; }
      .lrm-character-list a:hover, .lrm-character-list a:focus-visible { border-color: var(--lrm-border); color: var(--lrm-gold); }
      .lrm-cta { display: inline-flex; margin-top: 10px; padding: 8px 11px; border: 1px solid var(--lrm-gold); color: var(--lrm-gold); font-size: .82rem; font-weight: 700; }
      .lrm-cta:hover { background: var(--lrm-gold); color: #17130a; }
      .lrm-map-buttons { position: absolute; z-index: 3; top: 18px; right: 18px; display: grid; gap: 6px; }
      .lrm-icon-button { width: auto; min-width: 48px; height: 38px; padding: 0 8px; font-size: .62rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; background: rgba(245,231,195,.94); color: #392a17; border-color: rgba(58,43,24,.6); }
      .lrm-icon-button:hover { background: #fff4d4; }
      .lrm-mode-button {
        position: absolute; z-index: 3; left: 18px; bottom: 18px; min-height: 38px; padding: 8px 11px;
        background: rgba(36,27,18,.92); color: #fff1c8; border-color: rgba(255,241,200,.5); font-size: .77rem; font-weight: 700;
      }
      .lrm-mode-button[aria-pressed="true"] { background: #fff1c8; color: #2d2113; }
      .lrm-hint {
        position: absolute; z-index: 2; left: 50%; bottom: 18px; transform: translateX(-50%);
        max-width: calc(100% - 250px); padding: 6px 9px; border-radius: 2px;
        background: rgba(47,35,20,.78); color: #f5e8c1; font-size: .69rem; text-align: center; pointer-events: none;
      }
      .lrm-tooltip {
        position: absolute; z-index: 5; max-width: min(250px, calc(100% - 24px)); padding: 8px 10px;
        border: 1px solid rgba(255,239,194,.45); border-radius: 2px; background: rgba(28,20,12,.96);
        color: #fff2cf; font-size: .78rem; line-height: 1.4; box-shadow: 0 8px 25px rgba(0,0,0,.35); pointer-events: none;
      }
      .lrm-tooltip[hidden] { display: none; }
      .lrm-season-button:focus-visible, .lrm-icon-button:focus-visible, .lrm-mode-button:focus-visible,
      .lrm-list-button:focus-visible, .lrm-region-select:focus-visible, .lrm-cta:focus-visible,
      .lrm-character-list a:focus-visible { outline: 3px solid color-mix(in srgb, var(--lrm-gold) 75%, white); outline-offset: 2px; }
      @media (max-width: 860px) {
        .lrm-layout { grid-template-columns: 1fr; }
        .lrm-detail { min-height: 0; }
      }
      @media (max-width: 600px) {
        .lrm-toolbar { align-items: stretch; }
        .lrm-season-field, .lrm-region-control { width: 100%; }
        .lrm-season-buttons { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px; }
        .lrm-season-button { min-width: 0; min-height: 38px; padding: 7px 2px; }
        .lrm-summary-row { align-items: flex-start; flex-direction: column; }
        .lrm-legend { justify-content: flex-start; }
        .lrm-frame { padding: 5px; }
        .lrm-map-buttons { top: 12px; right: 12px; }
        .lrm-mode-button { left: 12px; bottom: 12px; }
        .lrm-hint { display: none; }
      }
      @media (max-width: 380px) {
        .lrm-season-button { font-size: .78rem; }
        .lrm-character-list { grid-template-columns: 1fr; }
      }
      @media (prefers-reduced-motion: reduce) {
        .living-realm-map *, .living-realm-map *::before, .living-realm-map *::after {
          scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `;
  }

  function mapMarkup(runtime, instanceId, viewBox) {
    const [vx, vy, vw, vh] = viewBox;
    const clipId = `${instanceId}-land-clip`;
    const seaPatternId = `${instanceId}-sea-lines`;
    const paperPatternId = `${instanceId}-paper-lines`;
    const terrainGlyphs = `
      <g id="${instanceId}-mountain" fill="none" stroke="currentColor" stroke-width=".72" stroke-linejoin="round" vector-effect="non-scaling-stroke">
        <path d="M-7,4 -2.1,-5.2 1,-.6 3,-3.3 7,4Z" fill="#d9c79e"/><path d="M-4.5,-.6 -2.1,-2.2 -.2,-.8"/>
      </g>
      <g id="${instanceId}-forest" fill="none" stroke="currentColor" stroke-width=".65" stroke-linejoin="round" vector-effect="non-scaling-stroke">
        <path d="M0,4.6V1.6M-3.4,2 0,-4.8 3.4,2Z" fill="#d9c79e"/><path d="M-2.3,-.3 0,-2.6 2.3,-.3"/>
      </g>
      <g id="${instanceId}-swamp" fill="none" stroke="currentColor" stroke-width=".65" stroke-linecap="round" vector-effect="non-scaling-stroke">
        <path d="M-5,2q2.4,-1.8 4.8,0t4.8,0M-3.4,4q2.4,-1.8 4.8,0M-1.6,1.2v-4.6M.8,1.2v-5.6M3,1.2v-4"/>
      </g>
      <g id="${instanceId}-dune" fill="none" stroke="currentColor" stroke-width=".65" stroke-linecap="round" vector-effect="non-scaling-stroke">
        <path d="M-6,2.4q3,-4.4 6,-1 2.2,2.5 5,-.6M-3.6,4.4q2.6,-2.6 5.4,-.4"/>
      </g>`;

    const regionPaths = runtime.regions.map(region => {
      const fallback = runtime.houseColors[region.house] || "#82745b";
      let color = fallback;
      if (typeof getHouseColor === "function") {
        color = getHouseColor(region.house) || fallback;
      }
      const label = `${region.name}. Seat: ${region.seat}. House ${region.house}. Press Enter or Space for details.`;
      return `<path class="lrm-region" data-region-id="${escapeMarkup(region.id)}" d="${escapeMarkup(region.path)}"
        fill="${escapeMarkup(color)}" role="button" tabindex="0" focusable="true" aria-label="${escapeMarkup(label)}" aria-pressed="false"/>`;
    }).join("");

    const terrain = runtime.terrain.map(item => {
      if (!item || !["mountain", "forest", "swamp", "dune"].includes(item.t)) return "";
      const x = Number(item.x), y = Number(item.y), scale = Number(item.s);
      if (![x, y, scale].every(Number.isFinite)) return "";
      return `<use href="#${instanceId}-${item.t}" transform="translate(${x} ${y}) scale(${scale})"/>`;
    }).join("");

    const settlements = runtime.settlements.map(item => {
      const x = Number(item.x), y = Number(item.y);
      if (![x, y].every(Number.isFinite)) return "";
      const radius = item.kind === "city" ? 3.2 : item.kind === "castle" ? 2.7 : 2.1;
      return `<g class="lrm-settlement">
        <circle cx="${x}" cy="${y}" r="${radius}" fill="#eadfbe" stroke="currentColor" stroke-width=".8" vector-effect="non-scaling-stroke"/>
        <circle cx="${x}" cy="${y}" r=".8" fill="currentColor"/>
        <text class="lrm-settlement-label" x="${x + 6}" y="${y + 2.5}">${escapeMarkup(item.name)}</text>
      </g>`;
    }).join("");

    const regionLabels = runtime.regions.map(region => {
      const anchor = region.labelXY || region.seatXY;
      if (!Array.isArray(anchor)) return "";
      return `<text class="lrm-region-label" x="${Number(anchor[0])}" y="${Number(anchor[1])}"
        font-size="${Number(region.labelSize) || 13}">${escapeMarkup(String(region.name).toUpperCase())}</text>`;
    }).join("");

    const seaLabels = runtime.seaLabels.map(item => {
      const x = Number(item.x), y = Number(item.y), rotation = Number(item.rot) || 0, size = Number(item.size) || 12;
      if (![x, y].every(Number.isFinite)) return "";
      return `<text class="lrm-sea-label" x="${x}" y="${y}" font-size="${size}"
        transform="rotate(${rotation} ${x} ${y})">${escapeMarkup(item.name)}</text>`;
    }).join("");

    return `
      <title id="${instanceId}-map-title">Westeros by season</title>
      <desc id="${instanceId}-map-description">An interactive map of Westeros. Regions and season hotspots are keyboard selectable. Use the Explore map control before touch panning or pinching.</desc>
      <defs aria-hidden="true">
        <clipPath id="${clipId}"><path d="${escapeMarkup(runtime.outline)}"/></clipPath>
        <pattern id="${seaPatternId}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(34)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#9d875c" stroke-width=".6" opacity=".28"/>
        </pattern>
        <pattern id="${paperPatternId}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <line x1="0" y1="0" x2="8" y2="0" stroke="#8d7445" stroke-width=".35" opacity=".1"/>
        </pattern>
        ${terrainGlyphs}
      </defs>
      <g class="lrm-zoom-layer">
        <g aria-hidden="true">
          <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#c8ba94"/>
          <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#${seaPatternId})"/>
          ${runtime.islets ? `<path d="${escapeMarkup(runtime.islets)}" fill="#eadfbe" stroke="#493921" stroke-width=".9" vector-effect="non-scaling-stroke"/>` : ""}
          <path d="${escapeMarkup(runtime.outline)}" fill="#eadfbe"/>
          <path d="${escapeMarkup(runtime.outline)}" fill="url(#${paperPatternId})"/>
        </g>
        <g class="lrm-regions">${regionPaths}</g>
        <g class="lrm-terrain" clip-path="url(#${clipId})" aria-hidden="true">${terrain}</g>
        <g aria-hidden="true">
          <line x1="52" y1="195" x2="654" y2="195" stroke="#dceaf1" stroke-width="8" opacity=".9"/>
          <line x1="52" y1="195" x2="654" y2="195" stroke="#769db2" stroke-width="8" stroke-dasharray="2 6" opacity=".5"/>
          <path d="${escapeMarkup(runtime.outline)}" fill="none" stroke="#493921" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
          <g class="lrm-settlements">${settlements}</g>
          <g class="lrm-sea-labels">${seaLabels}</g>
          <g class="lrm-region-labels">${regionLabels}</g>
        </g>
        <g class="lrm-hotspots" aria-label="Season hotspots"></g>
      </g>`;
  }

  function mount(rootElement, options) {
    if (!rootElement || rootElement.nodeType !== 1) {
      throw new TypeError("LivingRealmMap.mount requires a root Element.");
    }

    const settings = options && typeof options === "object" ? options : {};
    const hasInitialSeason = Object.prototype.hasOwnProperty.call(settings, "initialSeason");
    const requestedInitialSeason = hasInitialSeason && settings.initialSeason != null
      ? normalizeSeason(settings.initialSeason)
      : 1;
    if (!requestedInitialSeason) {
      throw new RangeError("LivingRealmMap initialSeason must be an integer from 1 through 8.");
    }
    if (settings.onNavigate != null && typeof settings.onNavigate !== "function") {
      throw new TypeError("LivingRealmMap onNavigate must be a function.");
    }
    const runtime = getRuntimeData();
    const previous = instances.get(rootElement);
    if (previous) previous.destroy();
    const d3 = runtime.d3;
    const viewBox = parseViewBox(runtime.viewBox);
    const instanceId = `lrm-${++nextInstanceId}`;
    const hotspots = buildHotspots(runtime);
    const hotspotsById = new Map(hotspots.map(marker => [marker.id, marker]));
    const regionsById = new Map(runtime.regions.map(region => [region.id, region]));
    const abortController = new AbortController();
    const signal = abortController.signal;
    const motionQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    let reducedMotion = Boolean(motionQuery && motionQuery.matches);
    let destroyed = false;
    let currentSeason = requestedInitialSeason;
    let selectedRegionId = null;
    let selectedHotspotId = null;
    let interactionMode = false;

    const wrapper = document.createElement("section");
    wrapper.className = "living-realm-map";
    wrapper.setAttribute("aria-label", "Living map of Westeros");
    wrapper.innerHTML = `
      <style>${styleText()}</style>
      <div class="lrm-toolbar">
        <fieldset class="lrm-season-field">
          <legend>Choose a season</legend>
          <div class="lrm-season-buttons" role="group" aria-label="Game of Thrones seasons">
            ${FALLBACK_SEASONS.map(season => `<button class="lrm-season-button" type="button" data-season="${season}"
              aria-label="Season ${season}" aria-pressed="false">S${season}</button>`).join("")}
          </div>
        </fieldset>
        <label class="lrm-region-control"><span>Find a region</span>
          <select class="lrm-region-select">
            <option value="">Choose a region</option>
            ${runtime.regions.map(region => `<option value="${escapeMarkup(region.id)}">${escapeMarkup(region.name)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="lrm-summary-row">
        <p class="lrm-summary"></p>
        <div class="lrm-legend" aria-label="Map legend">
          <span><i class="lrm-legend-shape" aria-hidden="true"></i> Battle</span>
          <span><i class="lrm-legend-shape event" aria-hidden="true"></i> Other event</span>
        </div>
      </div>
      <div class="lrm-layout">
        <div class="lrm-map-column">
          <div class="lrm-frame">
            <svg class="lrm-svg" viewBox="${viewBox.join(" ")}" preserveAspectRatio="xMidYMid meet"
              role="group" tabindex="0" aria-labelledby="${instanceId}-map-title" aria-describedby="${instanceId}-map-description ${instanceId}-hint">
              ${mapMarkup(runtime, instanceId, viewBox)}
            </svg>
            <div class="lrm-map-buttons" role="group" aria-label="Map zoom controls">
              <button class="lrm-icon-button" type="button" data-map-action="zoom-in" aria-label="Zoom in">In</button>
              <button class="lrm-icon-button" type="button" data-map-action="zoom-out" aria-label="Zoom out">Out</button>
              <button class="lrm-icon-button" type="button" data-map-action="reset" aria-label="Reset map view">Reset</button>
            </div>
            <button class="lrm-mode-button" type="button" data-map-action="interaction" aria-pressed="false">Explore map</button>
            <div class="lrm-hint" id="${instanceId}-hint">Drag to pan · Use controls to zoom · Enable Explore map for touch or wheel zoom</div>
            <div class="lrm-tooltip" role="tooltip" hidden></div>
          </div>
        </div>
        <aside class="lrm-detail" aria-label="Map details"></aside>
      </div>
      <div class="lrm-sr-only" aria-live="polite" aria-atomic="true"></div>`;

    rootElement.replaceChildren(wrapper);

    const svg = wrapper.querySelector(".lrm-svg");
    const zoomLayer = wrapper.querySelector(".lrm-zoom-layer");
    const hotspotLayer = wrapper.querySelector(".lrm-hotspots");
    const detailPanel = wrapper.querySelector(".lrm-detail");
    const summary = wrapper.querySelector(".lrm-summary");
    const regionSelect = wrapper.querySelector(".lrm-region-select");
    const tooltip = wrapper.querySelector(".lrm-tooltip");
    const announcer = wrapper.querySelector(".lrm-sr-only[aria-live]");
    const modeButton = wrapper.querySelector('[data-map-action="interaction"]');
    const svgSelection = d3.select(svg);
    const zoomSelection = d3.select(zoomLayer);
    const [vx, vy, vw, vh] = viewBox;

    function announce(message) {
      announcer.textContent = "";
      window.requestAnimationFrame(() => {
        if (!destroyed) announcer.textContent = message;
      });
    }

    function getHouseColorSafe(house) {
      if (typeof getHouseColor === "function") return getHouseColor(house);
      return runtime.houseColors[house] || "#d4af37";
    }

    function charactersForHouse(house) {
      if (typeof charactersByHouse === "function") return charactersByHouse(house);
      return runtime.characters.filter(character => character.house === house);
    }

    function eventsForHouseSafe(house) {
      if (typeof eventsForHouse === "function") return eventsForHouse(house);
      return runtime.events.filter(event => Array.isArray(event.houses) && event.houses.includes(house));
    }

    function characterForId(id) {
      if (typeof getCharacter === "function") return getCharacter(id);
      return runtime.characters.find(character => character.id === id);
    }

    function navigationLink(hash, label, className) {
      return `<a class="${className || "lrm-cta"}" href="${escapeMarkup(hash)}" data-lrm-nav="${escapeMarkup(hash)}">${escapeMarkup(label)}</a>`;
    }

    function markerPlacementNote(marker) {
      if (marker.precision === "region") {
        return `The source names ${marker.anchorName} but no exact mapped settlement, so this marker uses the region label as a coarse anchor.`;
      }
      return `Placed at ${marker.anchorName}, which is named in the source record and present in the map data.`;
    }

    function renderOverview() {
      const seasonMarkers = hotspots.filter(marker => marker.season === currentSeason);
      const totalEvents = runtime.events.filter(event => normalizeSeason(event.season) === currentSeason).length;
      detailPanel.innerHTML = `
        <p class="lrm-kicker">Season ${currentSeason}</p>
        <h2>Mapped chronicle</h2>
        <p>${seasonMarkers.length
          ? `${seasonMarkers.length} location-grounded ${seasonMarkers.length === 1 ? "hotspot is" : "hotspots are"} shown from ${totalEvents} timeline ${totalEvents === 1 ? "entry" : "entries"}.`
          : `No timeline entry for this season names a location represented by the available Westeros map data.`}</p>
        <p class="lrm-precision">Only records with an explicit settlement or region in their source text are plotted. Regional markers are deliberately shown as coarse placements.</p>
        ${seasonMarkers.length ? `<h3>Hotspots in this season</h3><ul class="lrm-detail-list">
          ${seasonMarkers.map(marker => `<li><button class="lrm-list-button" type="button" data-hotspot-id="${escapeMarkup(marker.id)}">
            ${escapeMarkup(marker.title)}<small>${escapeMarkup(marker.locationLabel)} · ${marker.kind === "battle" ? "Battle" : "Event"}</small>
          </button></li>`).join("")}</ul>` : ""}
        ${navigationLink("#/timeline", "Open the full timeline")}`;
    }

    function renderRegion(region) {
      const color = getHouseColorSafe(region.house);
      const members = charactersForHouse(region.house).slice(0, 10);
      const seasonEvents = eventsForHouseSafe(region.house).filter(event => normalizeSeason(event.season) === currentSeason);
      const houseInfo = runtime.houseInfo[region.house] || null;
      detailPanel.innerHTML = `
        <p class="lrm-kicker">Region · Season ${currentSeason}</p>
        <h2 style="color:${escapeMarkup(color)}">${escapeMarkup(region.name)}</h2>
        <div class="lrm-meta">Seat: ${escapeMarkup(region.seat)} · House ${escapeMarkup(region.house)}</div>
        <p>${escapeMarkup(region.blurb)}</p>
        ${houseInfo && houseInfo.words && houseInfo.words !== "—" ? `<p><strong>Words:</strong> “${escapeMarkup(houseInfo.words)}”</p>` : ""}
        ${navigationLink(`#/house/${encodeURIComponent(region.house)}`, `View House ${region.house}`)}
        <h3>House ${escapeMarkup(region.house)} in Season ${currentSeason}</h3>
        ${seasonEvents.length ? `<ul class="lrm-detail-list">${seasonEvents.map(event => `<li>
          <button class="lrm-list-button" type="button" data-event-id="${escapeMarkup(event.id)}">${escapeMarkup(event.title)}
            <small>${escapeMarkup(event.type || "event")}</small></button></li>`).join("")}</ul>` : `<p>No house-linked timeline event is recorded for this season.</p>`}
        <h3>Notable characters</h3>
        ${members.length ? `<ul class="lrm-character-list">${members.map(character => `<li>${navigationLink(
          `#/character/${encodeURIComponent(character.id)}`,
          character.name,
          "lrm-character-link"
        )}</li>`).join("")}</ul>` : `<p>No notable characters are recorded for this house.</p>`}`;
    }

    function renderHotspotDetail(marker) {
      const placement = markerPlacementNote(marker);
      if (marker.sourceKind === "battle-record") {
        const record = marker.detail;
        const characterLinks = (record.linkedCharacters || []).map(characterForId).filter(Boolean).slice(0, 8);
        const sides = (record.combatants || []).map(item => item.side).filter(Boolean);
        detailPanel.innerHTML = `
          <p class="lrm-kicker">Season ${marker.season} · ${marker.kind === "battle" ? "Battle" : "Major event"}</p>
          <h2>${escapeMarkup(marker.title)}</h2>
          <div class="lrm-meta">${escapeMarkup(record.location || marker.anchorName)}</div>
          ${marker.linkedEvents.length > 1 ? `<p><strong>Timeline entries represented:</strong> ${escapeMarkup(marker.linkedEvents.map(event => event.title).join(" · "))}</p>` : ""}
          ${sides.length ? `<p><strong>Sides:</strong> ${escapeMarkup(sides.join(" · "))}</p>` : ""}
          <h3>Outcome</h3><p>${escapeMarkup(record.outcome || "No outcome recorded.")}</p>
          ${record.casualties ? `<h3>Casualties</h3><p>${escapeMarkup(record.casualties)}</p>` : ""}
          <p class="lrm-precision">${escapeMarkup(placement)}</p>
          ${characterLinks.length ? `<h3>Linked characters</h3><ul class="lrm-character-list">${characterLinks.map(character => `<li>${navigationLink(
            `#/character/${encodeURIComponent(character.id)}`,
            character.name,
            "lrm-character-link"
          )}</li>`).join("")}</ul>` : ""}
          ${navigationLink("#/battles", "Open all battles")}`;
        return;
      }

      const event = marker.detail;
      detailPanel.innerHTML = `
        <p class="lrm-kicker">Season ${marker.season} · ${escapeMarkup(event.type || "Event")}</p>
        <h2>${escapeMarkup(event.title)}</h2>
        <p>${escapeMarkup(event.summary)}</p>
        ${Array.isArray(event.houses) && event.houses.length ? `<p><strong>Houses:</strong> ${escapeMarkup(event.houses.join(" · "))}</p>` : ""}
        <p class="lrm-precision">${escapeMarkup(placement)}</p>
        ${navigationLink("#/timeline", "Open the full timeline")}`;
    }

    function updateRegionSelection() {
      wrapper.querySelectorAll(".lrm-region").forEach(path => {
        path.setAttribute("aria-pressed", String(path.dataset.regionId === selectedRegionId));
      });
      regionSelect.value = selectedRegionId || "";
    }

    function updateHotspotSelection() {
      hotspotLayer.querySelectorAll(".lrm-hotspot").forEach(node => {
        node.setAttribute("aria-pressed", String(node.dataset.hotspotId === selectedHotspotId));
      });
    }

    function selectRegion(regionId, config) {
      const region = regionsById.get(regionId);
      if (!region || destroyed) return;
      selectedRegionId = region.id;
      selectedHotspotId = null;
      updateRegionSelection();
      updateHotspotSelection();
      renderRegion(region);
      if (!config || config.announce !== false) announce(`${region.name} selected. Details updated.`);
      if (config && config.center) centerOnRegion(region);
    }

    function selectHotspot(hotspotId, shouldAnnounce) {
      const marker = hotspotsById.get(hotspotId);
      if (!marker || marker.season !== currentSeason || destroyed) return;
      selectedHotspotId = marker.id;
      selectedRegionId = marker.regionId || null;
      updateRegionSelection();
      updateHotspotSelection();
      renderHotspotDetail(marker);
      if (shouldAnnounce !== false) announce(`${marker.title} selected. Details updated.`);
    }

    function hotspotMarkup(marker) {
      const label = `${marker.title}, ${marker.kind === "battle" ? "battle" : "event"}, Season ${marker.season}, ${marker.locationLabel}. Press Enter or Space for details.`;
      const color = marker.kind === "battle" ? EVENT_COLORS.battle : (EVENT_COLORS[marker.eventType] || EVENT_COLORS.other);
      const core = marker.kind === "battle"
        ? `<path class="lrm-hotspot-core" d="M0,-8 L8,0 L0,8 L-8,0 Z"/>`
        : `<circle class="lrm-hotspot-core" cx="0" cy="0" r="7"/>`;
      const stem = marker.x !== marker.anchorX || marker.y !== marker.anchorY
        ? `<line x1="0" y1="0" x2="${marker.anchorX - marker.x}" y2="${marker.anchorY - marker.y}" stroke="currentColor" stroke-width=".8" opacity=".55" vector-effect="non-scaling-stroke"/>`
        : "";
      return `<g class="lrm-hotspot" data-hotspot-id="${escapeMarkup(marker.id)}" data-kind="${marker.kind}"
        transform="translate(${marker.x} ${marker.y})" style="color:${escapeMarkup(color)}" role="button" tabindex="0" focusable="true"
        aria-label="${escapeMarkup(label)}" aria-pressed="${String(marker.id === selectedHotspotId)}">
        ${stem}<circle cx="0" cy="0" r="19" fill="transparent"/><circle class="lrm-hotspot-halo" cx="0" cy="0" r="12"/>${core}
      </g>`;
    }

    function renderHotspots() {
      const visible = hotspots.filter(marker => marker.season === currentSeason);
      hotspotLayer.innerHTML = visible.map(hotspotMarkup).join("");
      hotspotLayer.setAttribute("aria-label", `Season ${currentSeason} hotspots`);
      const totalEvents = runtime.events.filter(event => normalizeSeason(event.season) === currentSeason).length;
      summary.textContent = `Season ${currentSeason}: ${visible.length} mapped ${visible.length === 1 ? "hotspot" : "hotspots"} from ${totalEvents} timeline ${totalEvents === 1 ? "entry" : "entries"}.`;
    }

    function setSeason(value, config) {
      const season = normalizeSeason(value);
      if (!season || !FALLBACK_SEASONS.includes(season)) {
        throw new RangeError("LivingRealmMap season must be an integer from 1 through 8.");
      }
      if (destroyed) return;
      currentSeason = season;
      selectedHotspotId = null;
      wrapper.querySelectorAll(".lrm-season-button").forEach(button => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.season) === season));
      });
      renderHotspots();
      updateHotspotSelection();
      if (selectedRegionId && regionsById.has(selectedRegionId)) renderRegion(regionsById.get(selectedRegionId));
      else renderOverview();
      if (!config || config.announce !== false) {
        const count = hotspots.filter(marker => marker.season === season).length;
        announce(`Season ${season} selected. ${count} mapped ${count === 1 ? "hotspot" : "hotspots"}.`);
      }
    }

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[vx, vy], [vx + vw, vy + vh]])
      .filter(event => {
        if (event.type === "wheel") return interactionMode || event.ctrlKey || event.metaKey;
        if (event.type.indexOf("touch") === 0) return interactionMode;
        if (event.type === "mousedown") return event.button === 0;
        return interactionMode;
      })
      .on("zoom.living-realm-map", event => {
        zoomSelection.attr("transform", event.transform);
        wrapper.classList.toggle("lrm-is-zoomed", event.transform.k >= 1.65);
        wrapper.classList.toggle("lrm-is-deep-zoom", event.transform.k >= 3.2);
      });
    svgSelection.call(zoom).on("dblclick.zoom", null);

    function runZoom(operation) {
      if (destroyed) return;
      svgSelection.interrupt();
      const target = reducedMotion ? svgSelection : svgSelection.transition().duration(260);
      operation(target);
    }

    function centerOnRegion(region) {
      const anchor = region.labelXY || region.seatXY;
      if (!Array.isArray(anchor)) return;
      const scale = 2.15;
      const transform = d3.zoomIdentity
        .translate(vx + vw / 2, vy + vh / 2)
        .scale(scale)
        .translate(-Number(anchor[0]), -Number(anchor[1]));
      runZoom(target => target.call(zoom.transform, transform));
    }

    function setInteractionMode(enabled) {
      interactionMode = Boolean(enabled);
      wrapper.classList.toggle("lrm-interaction-active", interactionMode);
      modeButton.setAttribute("aria-pressed", String(interactionMode));
      modeButton.textContent = interactionMode ? "Exit map" : "Explore map";
      modeButton.setAttribute("aria-label", interactionMode
        ? "Exit map interaction mode and restore page scrolling"
        : "Enable touch gestures and wheel zoom for the map");
      announce(interactionMode
        ? "Map interaction enabled. Touch gestures and wheel zoom now control the map. Press Escape or Exit map to restore page scrolling."
        : "Map interaction disabled. Page scrolling restored.");
    }

    function tooltipTarget(target) {
      const hotspotNode = target.closest && target.closest(".lrm-hotspot");
      if (hotspotNode) {
        const marker = hotspotsById.get(hotspotNode.dataset.hotspotId);
        if (marker) return { node: hotspotNode, text: `${marker.title} · ${marker.locationLabel}` };
      }
      const regionNode = target.closest && target.closest(".lrm-region");
      if (regionNode) {
        const region = regionsById.get(regionNode.dataset.regionId);
        if (region) return { node: regionNode, text: `${region.name} · ${region.seat} · House ${region.house}` };
      }
      return null;
    }

    function moveTooltip(event) {
      const frameRect = wrapper.querySelector(".lrm-frame").getBoundingClientRect();
      const maxLeft = Math.max(8, frameRect.width - tooltip.offsetWidth - 10);
      const maxTop = Math.max(8, frameRect.height - tooltip.offsetHeight - 10);
      tooltip.style.left = `${Math.max(8, Math.min(event.clientX - frameRect.left + 14, maxLeft))}px`;
      tooltip.style.top = `${Math.max(8, Math.min(event.clientY - frameRect.top + 14, maxTop))}px`;
    }

    svg.addEventListener("pointerover", event => {
      const info = tooltipTarget(event.target);
      if (!info || (event.relatedTarget && info.node.contains(event.relatedTarget))) return;
      tooltip.textContent = info.text;
      tooltip.hidden = false;
      moveTooltip(event);
    }, { signal });
    svg.addEventListener("pointermove", event => {
      if (!tooltip.hidden) moveTooltip(event);
    }, { signal });
    svg.addEventListener("pointerout", event => {
      const info = tooltipTarget(event.target);
      if (!info || (event.relatedTarget && info.node.contains(event.relatedTarget))) return;
      tooltip.hidden = true;
    }, { signal });

    wrapper.addEventListener("click", event => {
      const seasonButton = event.target.closest(".lrm-season-button");
      if (seasonButton) {
        setSeason(Number(seasonButton.dataset.season));
        return;
      }

      const actionButton = event.target.closest("[data-map-action]");
      if (actionButton) {
        const action = actionButton.dataset.mapAction;
        if (action === "zoom-in") runZoom(target => target.call(zoom.scaleBy, 1.55));
        else if (action === "zoom-out") runZoom(target => target.call(zoom.scaleBy, 1 / 1.55));
        else if (action === "reset") runZoom(target => target.call(zoom.transform, d3.zoomIdentity));
        else if (action === "interaction") {
          setInteractionMode(!interactionMode);
          if (interactionMode) svg.focus({ preventScroll: true });
        }
        return;
      }

      const hotspotNode = event.target.closest(".lrm-hotspot, [data-hotspot-id]");
      if (hotspotNode && hotspotNode.dataset.hotspotId) {
        selectHotspot(hotspotNode.dataset.hotspotId);
        return;
      }

      const eventButton = event.target.closest("[data-event-id]");
      if (eventButton) {
        const eventId = eventButton.dataset.eventId;
        const marker = hotspots.find(item => item.season === currentSeason && (
          item.sourceId === eventId || (item.linkedEvents || []).some(linkedEvent => linkedEvent.id === eventId)
        ));
        if (marker) selectHotspot(marker.id);
        else {
          const eventRecord = runtime.events.find(item => item.id === eventId);
          if (eventRecord) {
            detailPanel.innerHTML = `<p class="lrm-kicker">Season ${currentSeason} · ${escapeMarkup(eventRecord.type || "Event")}</p>
              <h2>${escapeMarkup(eventRecord.title)}</h2><p>${escapeMarkup(eventRecord.summary)}</p>
              <p class="lrm-precision">This house-linked event does not provide a sufficiently explicit event site in the available map data, so no point is plotted.</p>
              ${navigationLink("#/timeline", "Open the full timeline")}`;
            announce(`${eventRecord.title} details opened.`);
          }
        }
        return;
      }

      const regionNode = event.target.closest(".lrm-region");
      if (regionNode) {
        selectRegion(regionNode.dataset.regionId);
        return;
      }

      const navLink = event.target.closest("[data-lrm-nav]");
      if (navLink) {
        event.preventDefault();
        const hash = navLink.dataset.lrmNav;
        if (typeof settings.onNavigate === "function") settings.onNavigate(hash);
        else window.location.hash = hash;
      }
    }, { signal });

    wrapper.addEventListener("keydown", event => {
      const isActivation = event.key === "Enter" || event.key === " " || event.key === "Spacebar";
      const regionNode = event.target.closest && event.target.closest(".lrm-region");
      const hotspotNode = event.target.closest && event.target.closest(".lrm-hotspot");
      if (isActivation && (regionNode || hotspotNode)) {
        event.preventDefault();
        if (regionNode) selectRegion(regionNode.dataset.regionId);
        else selectHotspot(hotspotNode.dataset.hotspotId);
        return;
      }

      if (regionNode && ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        const paths = Array.from(wrapper.querySelectorAll(".lrm-region"));
        const index = paths.indexOf(regionNode);
        const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        paths[(index + direction + paths.length) % paths.length].focus();
        return;
      }

      if (event.key === "Escape" && interactionMode) {
        event.preventDefault();
        setInteractionMode(false);
        modeButton.focus({ preventScroll: true });
        return;
      }

      if (event.target === svg) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          runZoom(target => target.call(zoom.scaleBy, 1.55));
        } else if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          runZoom(target => target.call(zoom.scaleBy, 1 / 1.55));
        } else if (event.key === "0") {
          event.preventDefault();
          runZoom(target => target.call(zoom.transform, d3.zoomIdentity));
        }
      }
    }, { signal });

    regionSelect.addEventListener("change", () => {
      if (regionSelect.value) selectRegion(regionSelect.value, { center: true });
      else {
        selectedRegionId = null;
        selectedHotspotId = null;
        updateRegionSelection();
        updateHotspotSelection();
        renderOverview();
        announce("Region selection cleared.");
      }
    }, { signal });

    if (motionQuery) {
      const onMotionChange = event => { reducedMotion = event.matches; };
      if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", onMotionChange, { signal });
      else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(onMotionChange);
        signal.addEventListener("abort", () => motionQuery.removeListener(onMotionChange), { once: true });
      }
    }

    const api = {
      setSeason(season) {
        setSeason(season);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        abortController.abort();
        svgSelection.interrupt().on(".zoom", null);
        if (wrapper.parentNode === rootElement) wrapper.remove();
        instances.delete(rootElement);
      }
    };

    instances.set(rootElement, api);
    setSeason(currentSeason, { announce: false });
    return api;
  }

  window.LivingRealmMap = Object.freeze({ mount });
})(window, document);
