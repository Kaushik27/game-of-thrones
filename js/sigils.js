// ==========================================================================
// Original, simple line-art SVG sigil marks per house (not official HBO art).
// Each entry is the *inner* markup for a 0 0 100 100 viewBox, stroke-based,
// single-color (currentColor) so callers can tint via CSS `color`.
// ==========================================================================

const SIGIL_PATHS = {
  direwolf: `
    <path d="M50 14 L38 34 L20 30 L28 46 L14 56 L30 60 L26 78 L44 68 L50 86 L56 68 L74 78 L70 60 L86 56 L72 46 L80 30 L62 34 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <circle cx="42" cy="46" r="2.6" fill="currentColor"/>
    <circle cx="58" cy="46" r="2.6" fill="currentColor"/>
  `,
  lion: `
    <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width="3.2"/>
    <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M50 16 L50 30"/><path d="M50 84 L50 70"/>
      <path d="M16 50 L30 50"/><path d="M84 50 L70 50"/>
      <path d="M25 25 L35 35"/><path d="M75 75 L65 65"/>
      <path d="M75 25 L65 35"/><path d="M25 75 L35 65"/>
    </g>
    <circle cx="44" cy="47" r="2.2" fill="currentColor"/>
    <circle cx="56" cy="47" r="2.2" fill="currentColor"/>
    <path d="M45 55 Q50 59 55 55" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  `,
  dragon: `
    <path d="M18 62 Q30 30 50 26 Q70 30 82 62" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M50 26 L50 14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M30 40 Q20 34 14 38" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M70 40 Q80 34 86 38" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M28 62 Q50 78 72 62" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M40 62 L40 72 M50 65 L50 76 M60 62 L60 72" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  `,
  stag: `
    <path d="M50 82 L50 46" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M50 60 Q35 55 30 40 M30 40 Q26 40 22 34 M30 40 Q34 32 32 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M50 60 Q65 55 70 40 M70 40 Q74 40 78 34 M70 40 Q66 32 68 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="50" cy="46" r="6" fill="none" stroke="currentColor" stroke-width="3"/>
  `,
  kraken: `
    <circle cx="50" cy="42" r="12" fill="none" stroke="currentColor" stroke-width="3.2"/>
    <path d="M40 50 Q20 55 22 72 Q24 84 34 78" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M46 54 Q38 68 44 82" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M54 54 Q62 68 56 82" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M60 50 Q80 55 78 72 Q76 84 66 78" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  `,
  rose: `
    <circle cx="50" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="50" cy="32" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="50" cy="68" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="32" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="68" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="50" cy="50" r="4" fill="currentColor"/>
  `,
  "sun-spear": `
    <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" stroke-width="3.2"/>
    <path d="M50 18 L50 82" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M42 26 L50 18 L58 26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  trout: `
    <path d="M20 50 Q40 30 68 44 Q80 50 68 56 Q40 70 20 50 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <path d="M68 44 L84 34 L80 50 L84 66 L68 56" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="32" cy="47" r="2" fill="currentColor"/>
  `,
  "falcon-moon": `
    <path d="M62 20 A24 24 0 1 0 62 80 A19 19 0 1 1 62 20 Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M22 62 L34 50 L22 42 L30 50 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M18 52 Q26 46 34 50" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  `,
  "crossed-swords": `
    <path d="M22 22 L78 78 M30 22 L22 30 M70 78 L78 70" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M78 22 L22 78 M70 22 L78 30 M30 78 L22 70" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="3.4" fill="currentColor"/>
  `,
  none: `
    <g fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
      <path d="M50 14 L50 86"/><path d="M14 50 L86 50"/>
      <path d="M25 25 L75 75"/><path d="M75 25 L25 75"/>
      <path d="M50 14 L44 24 M50 14 L56 24"/>
      <path d="M50 86 L44 76 M50 86 L56 76"/>
    </g>
  `
};

function sigilSVG(sigilId, opts) {
  opts = opts || {};
  const size = opts.size || 24;
  const cls = opts.className || "";
  const inner = SIGIL_PATHS[sigilId] || SIGIL_PATHS.none;
  return `<svg class="sigil-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
}

function houseSigilId(house) {
  const info = (typeof HOUSE_INFO !== "undefined" && HOUSE_INFO[house]) || null;
  return info ? info.sigil : "none";
}

// ---------- Small structural glyphs (relation-type marks, status marks) ----
// Same stroke-based, single-color language as the house sigils above — used
// in place of emoji so meaning never depends on the local platform's emoji
// font (and stays flat, uniform-weight, on-theme).
const GLYPH_PATHS = {
  "blood-drop": `<path d="M50 16 C50 16 26 46 26 62 A24 24 0 0 0 74 62 C74 46 50 16 50 16 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>`,
  rings: `<circle cx="38" cy="54" r="16" fill="none" stroke="currentColor" stroke-width="3.2"/><circle cx="62" cy="54" r="16" fill="none" stroke="currentColor" stroke-width="3.2"/>`,
  shield: `<path d="M50 16 L78 26 L78 50 C78 68 66 80 50 86 C34 80 22 68 22 50 L22 26 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>`,
  "crossed-swords-sm": SIGIL_PATHS["crossed-swords"],
  "clasped-hands": `<path d="M18 46 L40 46 L52 38 L60 44 L48 54 L36 54" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M82 46 L60 46" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="46" r="4" fill="currentColor"/><circle cx="82" cy="46" r="4" fill="currentColor"/>`,
  skull: `<path d="M50 18 C32 18 20 32 20 48 C20 58 25 65 30 70 L30 80 L70 80 L70 70 C75 65 80 58 80 48 C80 32 68 18 50 18 Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><circle cx="38" cy="48" r="5" fill="currentColor"/><circle cx="62" cy="48" r="5" fill="currentColor"/><path d="M42 66 L58 66 M46 72 L54 72" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`
};
const RELATION_GLYPH = { family: "blood-drop", marriage: "rings", allegiance: "shield", conflict: "crossed-swords-sm", bond: "clasped-hands" };

function glyphSVG(glyphId, opts) {
  opts = opts || {};
  const size = opts.size || 16;
  const cls = opts.className || "";
  const inner = GLYPH_PATHS[glyphId] || "";
  return `<svg class="sigil-icon glyph-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
}
