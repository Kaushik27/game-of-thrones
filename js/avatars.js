// ==========================================================================
// Generative character portraits — original, procedurally-generated inline
// SVG art per character. Not a photo, not initials-in-a-circle: each
// character gets a deterministic (seeded by their id string) painterly
// bust silhouette in their house color, layered with a unique geometric
// accent pattern and a faint watermark of their house sigil behind it.
// Same id always renders the same art; every id renders visually distinct
// art. Pure inline SVG, no external assets, no build step. Depends on
// sigils.js (SIGIL_PATHS / houseSigilId) already being loaded.
// ==========================================================================

function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic PRNG (mulberry32) — same seed always produces the same
// sequence, so a given character id always renders identical art.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shadeHex(hex, percent) {
  const c = (hex || "#888888").replace("#", "");
  const full = c.length === 3 ? c.split("").map(ch => ch + ch).join("") : c;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return hex;
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const amt = Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

function sanitizeId(str) {
  return String(str).replace(/[^a-zA-Z0-9_-]/g, "");
}

// Small library of accent-shape drawers, seeded by the PRNG so the mix of
// shapes/positions/rotations differs per character while staying within a
// restrained, thematic palette (no random hues — always tints of the
// house color, white, or near-black).
function accentShapes(rand, palette, count) {
  const drawers = [
    (cx, cy, r, fill, op, rot) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`,
    (cx, cy, r, fill, op, rot) => `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${fill}" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`,
    (cx, cy, r, fill, op, rot) => `<polygon points="${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}" fill="${fill}" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`
  ];
  let out = "";
  for (let i = 0; i < count; i++) {
    const drawer = drawers[Math.floor(rand() * drawers.length)];
    const cx = 12 + rand() * 76;
    const cy = 8 + rand() * 60;
    const r = 6 + rand() * 16;
    const fill = palette[Math.floor(rand() * palette.length)];
    const op = (0.08 + rand() * 0.22).toFixed(2);
    const rot = Math.floor(rand() * 360);
    out += drawer(cx, cy, r, fill, op, rot);
  }
  return out;
}

// Main entry: returns a self-contained SVG string, viewBox 0 0 100 100,
// meant to fill a circular avatar frame. `character` needs .id, .house,
// and ideally .sigilColor; `opts.dead` mutes the palette slightly extra
// on top of the existing CSS grayscale filter applied to the wrapper.
function generativeAvatarSVG(character, opts) {
  opts = opts || {};
  const id = character.id || character.name || "unknown";
  const color = character.sigilColor || (typeof getHouseColor === "function" ? getHouseColor(character.house) : "#8a8a93");
  const seed = hashStringToSeed(id + "|" + (character.house || ""));
  const rand = mulberry32(seed);
  const darker = shadeHex(color, -34);
  const deepest = shadeHex(color, -55);
  const lighter = shadeHex(color, 30);
  const uid = sanitizeId(id) + "-" + seed;
  const sigilId = (typeof houseSigilId === "function" ? houseSigilId(character.house) : "none");
  const sigilInner = (typeof SIGIL_PATHS !== "undefined" && SIGIL_PATHS[sigilId]) || "";

  const shapeCount = 4 + Math.floor(rand() * 4);
  const palette = [lighter, "#ffffff", deepest, color];
  const shapes = accentShapes(rand, palette, shapeCount);

  // Bust silhouette: a head + shoulders form, with per-character variance
  // in head size / shoulder width / tilt so the same base shape never
  // looks perfectly identical across characters.
  const headR = 14 + rand() * 3;
  const headCy = 36 + rand() * 4;
  const shoulderW = 30 + rand() * 8;
  const tilt = (rand() - 0.5) * 6;

  return `
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" class="generative-avatar">
      <defs>
        <radialGradient id="ag-grad-${uid}" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="${lighter}"/>
          <stop offset="55%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${deepest}"/>
        </radialGradient>
        <clipPath id="ag-clip-${uid}"><circle cx="50" cy="50" r="50"/></clipPath>
      </defs>
      <g clip-path="url(#ag-clip-${uid})" transform="rotate(${tilt} 50 50)">
        <rect x="0" y="0" width="100" height="100" fill="url(#ag-grad-${uid})"/>
        <g opacity="0.16" fill="${lighter}" transform="translate(50 52) scale(1.9) translate(-50 -50)">${sigilInner}</g>
        ${shapes}
        <path d="M${50 - shoulderW} 98 Q50 ${64 - shoulderW * 0.25} ${50 + shoulderW} 98 Z" fill="${deepest}" opacity="0.75"/>
        <circle cx="50" cy="${headCy}" r="${headR}" fill="${deepest}" opacity="0.8"/>
        <circle cx="50" cy="${headCy}" r="${headR}" fill="none" stroke="${lighter}" stroke-width="0.8" opacity="0.5"/>
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.6"/>
    </svg>
  `;
}
