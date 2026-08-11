// ==========================================================================
// Shared utilities used by every page: nav rendering, character/house
// helpers, relation graph helpers (BFS/relations lookup), avatar rendering.
// Depends on data.js (characters, relations, HOUSE_COLORS, HOUSE_INFO) and,
// where present, events.js / quotes.js / battles.js having already loaded.
// ==========================================================================

const NAV_LINKS = [
  { href: "#/", label: "Explore", matches: ["#/"] },
  { href: "#/characters", label: "People", matches: ["#/characters", "#/character/"] },
  { href: "#/timeline", label: "Memory Wall", matches: ["#/timeline", "#/battles", "#/episode/"] },
  { href: "#/quotes", label: "Voices", matches: ["#/quotes"] },
  { href: "#/map", label: "World", matches: ["#/map", "#/houses", "#/house/"] },
  { href: "#/lore", label: "Lore", matches: ["#/lore"] },
  { href: "#/what-if", label: "What If", matches: ["#/what-if"] },
  { href: "#/desk", label: "Desk", matches: ["#/desk"] }
];

function renderNav() {
  if (window.__reactShellOwned) return;
  const mount = document.getElementById("site-nav");
  if (!mount) return;
  const hash = window.location.hash || "#/";
  const activePath = hash.split("?")[0];
  const isActive = link => link.matches.some(match => match === "#/"
    ? activePath === "#/"
    : activePath === match || activePath.startsWith(match));
  mount.innerHTML = `
    <a class="brand" href="#/" aria-label="Game of Thrones home">
      <span class="brand-title">GAME <small>OF</small> <strong>THRONES</strong><small class="brand-note">A fan archive</small></span>
    </a>
    <nav class="nav-links" id="nav-links" aria-label="Primary navigation">
      ${NAV_LINKS.map(l => `<a href="${l.href}" class="${isActive(l) ? 'active' : ''}"${isActive(l) ? ' aria-current="page"' : ''}>${l.label}</a>`).join("")}
    </nav>
    <button type="button" class="nav-search" data-raven-search-trigger aria-label="Search the realm">
      <span>Search</span><kbd>/</kbd>
    </button>
    ${window.RealmCompass ? window.RealmCompass.navHTML() : ""}
    <button type="button" class="nav-raven" data-realm-raven aria-label="Let the raven choose a fragment"><img src="assets/icons/compass.svg" alt=""><span class="nav-raven__label">Raven</span></button>
    <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Open navigation" aria-controls="nav-links" aria-expanded="false">
      <span class="nav-toggle-label">Menu</span>
    </button>
  `;
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }));
  if (window.RealmCompass) window.RealmCompass.bind(mount);
  const raven = mount.querySelector("[data-realm-raven]");
  if (raven) raven.addEventListener("click", () => { window.location.hash = window.RealmCompass?.randomDestination?.() || "#/quotes"; });
}

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  const photoCount = (typeof ACTOR_PHOTOS !== "undefined") ? Object.keys(ACTOR_PHOTOS).length : 0;
  mount.innerHTML = `A fan-made field guide to HBO's Game of Thrones (TV canon) — built for the lines, betrayals, and arguments fans keep returning to. Built with a progressively migrating React shell, vanilla JS, D3.js and Three.js.
    <br>${photoCount} actor photographs used under verified open licenses —
    <a href="#/credits">credits &amp; image licensing</a>
    · <a href="https://github.com/Kaushik27/game-of-thrones" target="_blank" rel="noopener">View source on GitHub</a>`;
}

// ---------- Scroll reveal ----------
// Elements already inside the viewport at the moment they're mounted (e.g.
// the first screenful of cards on initial page load) must appear immediately
// rather than waiting on IntersectionObserver's first async callback, which
// can be delayed by web-font swaps / layout settling and otherwise leaves
// on-screen content stuck at opacity:0. So: synchronously check each new
// element's position against the viewport up front and reveal it right away;
// only elements that are genuinely off-screen get handed to the observer for
// a reveal-on-scroll-into-view later.
let revealObserver = null;
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  if (rect.width === 0 && rect.height === 0) return false;
  return rect.top < vh && rect.bottom > 0 && rect.left < vw && rect.right > 0;
}
function observeReveals(root) {
  root = root || document;
  const els = Array.from(root.querySelectorAll(".reveal:not(.in-view)"));
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in-view"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }
  let staggerIndex = 0;
  els.forEach(el => {
    if (isInViewport(el)) {
      // Already visible on load — reveal on the next frame (with a small
      // per-item stagger) instead of leaving it to the observer.
      const delay = staggerIndex++ * 40;
      el.style.transitionDelay = delay ? `${delay}ms` : "";
      requestAnimationFrame(() => el.classList.add("in-view"));
    } else {
      el.style.transitionDelay = "";
      revealObserver.observe(el);
    }
  });
}

// ---------- Character / house helpers ----------
function getCharacter(id) {
  return characters.find(c => c.id === id);
}

function getHouseColor(house) {
  return HOUSE_COLORS[house] || HOUSE_COLORS["Unaffiliated"];
}

function initialsFor(name) {
  const clean = name.replace(/["'()].*?["'()]|["'()]/g, "").replace(/\(.*?\)/g, "");
  const parts = clean.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Renders a character's avatar. Prefers a real, CC-licensed photograph of the
// actor who played them (js/actor-photos.js); characters with no free-licensed
// photo keep the generative SVG portrait art (js/avatars.js) rather than
// regressing to initials. Every other treatment — circular frame, house-colour
// border, dead-state styling, sigil badge — is identical either way, so photo
// and art characters sit together in the same grid without looking mismatched.
//
// Many Commons photos are red-carpet or podium shots where the subject's face
// sits in the upper third, so the image is cover-fitted with the focal point
// biased upward instead of dead-centre.
function avatarHTML(character, size) {
  size = size || 56;
  const color = character.sigilColor || getHouseColor(character.house);
  const isDead = character.status === "dead";
  const sigilId = houseSigilId(character.house);
  const showSigilBadge = size >= 36 && sigilId !== "none";
  const photo = (typeof actorPhotoFor === "function") ? actorPhotoFor(character.id) : null;
  const hasRecordedActor = Boolean(character.actor && !/^actor unknown$/i.test(character.actor));
  const actorName = hasRecordedActor ? character.actor : "";
  const portraitLabel = photo
    ? `${photo.actor}, who played ${character.name}`
    : hasRecordedActor
      ? `Illustrated portrait for ${character.name}; a verified open-license photo of ${actorName} is not currently available`
      : `Illustrated portrait for ${character.name}; no actor is recorded for this character`;
  let art;
  if (photo) {
    art = `<img class="avatar-photo" src="${photo.file}" loading="lazy" decoding="async"
      alt="${escapeHTML(photo.actor)}, who played ${escapeHTML(character.name)}"
      width="${size}" height="${size}">`;
  } else if (typeof generativeAvatarSVG === "function") {
    art = generativeAvatarSVG(character);
  } else {
    art = initialsFor(character.name);
  }
  return `<div class="avatar${isDead ? ' dead' : ''}${photo ? ' has-photo' : ''}" data-portrait-kind="${photo ? 'photo' : 'illustration'}"${photo ? '' : ` role="img" aria-label="${escapeHTML(portraitLabel)}" title="${escapeHTML(portraitLabel)}"`} style="width:${size}px;height:${size}px;border-color:${color}55;overflow:hidden;">
    ${art}
    ${showSigilBadge ? sigilSVG(sigilId, { size: Math.max(12, Math.round(size * 0.3)), className: "avatar-sigil" }) : ""}
    ${isDead ? `<span class="skull">${glyphSVG('skull', { size: Math.max(10, Math.round(size * 0.26)) })}</span>` : ''}
  </div>`;
}

function cardAccentStyle(color) {
  return `--card-accent:${color}; --card-accent-shadow:${color}33;`;
}

function archiveBadge(label, tone) {
  const safeTone = String(tone || "canon").replace(/[^a-z-]/g, "");
  return `<span class="archive-badge archive-badge--${safeTone}">${escapeHTML(label)}</span>`;
}

function charactersByHouse(house) {
  return characters.filter(c => c.house === house);
}

function relationsFor(id) {
  return relations
    .filter(r => r.source === id || r.target === id)
    .map(r => {
      const otherId = r.source === id ? r.target : r.source;
      return { other: getCharacter(otherId), rel: r };
    })
    .filter(x => x.other);
}

const TYPE_ICON = new Proxy({}, { get: (_, type) => glyphSVG(RELATION_GLYPH[type] || "clasped-hands", { size: 13 }) });
const RELATION_STYLE = {
  family:     { color: "#d4af37", dash: null },
  marriage:   { color: "#d97ba0", dash: "6,3" },
  allegiance: { color: "#8a8a93", dash: null },
  conflict:   { color: "#c23b3b", dash: "4,4" },
  bond:       { color: "#4a90d9", dash: "1,3" }
};

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

// ---------- Events / quotes / battles helpers (guarded — not every page loads all datasets) ----------
function eventsFor(characterId) {
  if (typeof events === "undefined") return [];
  return events.filter(e => e.characters.includes(characterId)).sort((a, b) => a.season - b.season);
}
function eventsForHouse(house) {
  if (typeof events === "undefined") return [];
  return events.filter(e => e.houses.includes(house)).sort((a, b) => a.season - b.season);
}
function quotesFor(characterId) {
  if (typeof quotes === "undefined") return [];
  return quotes.filter(q => q.characterId === characterId);
}
function battlesFor(characterId) {
  if (typeof battles === "undefined") return [];
  return battles.filter(b => b.linkedCharacters.includes(characterId));
}

// ---------- Misc ----------
function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
