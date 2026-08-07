// ==========================================================================
// Original illustrated atmospheric backgrounds — inline SVG "scenes" used
// behind hero sections. No photography, no external assets: layered
// gradients, silhouette shapes and a light grain filter, in the same
// spirit as a produced travel-brand hero image but achieved entirely with
// vector/gradient art. Depends on nothing else (safe to load early).
// ==========================================================================

// Shared grain filter (subtle noise texture) + starfield, reused by every
// scene so the atmosphere reads as one consistent illustrated style.
function sceneDefs(idSuffix) {
  return `
    <filter id="grain-${idSuffix}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0"/>
    </filter>
  `;
}

function starsSVG(count, seedOffset, width, height) {
  const rand = mulberry32(hashStringToSeed("stars-" + seedOffset));
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = rand() * width, y = rand() * height * 0.6, r = 0.4 + rand() * 1.1, op = 0.25 + rand() * 0.5;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${op.toFixed(2)}"/>`;
  }
  return out;
}

// ---------- Home hero: fantasy skyline scene (Wall + distant mountains) --
function homeSceneSVG() {
  const w = 1600, h = 640;
  return `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${sceneDefs("home")}
        <linearGradient id="home-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#050408"/>
          <stop offset="45%" stop-color="#0d0d16"/>
          <stop offset="78%" stop-color="#161221"/>
          <stop offset="100%" stop-color="#050506"/>
        </linearGradient>
        <linearGradient id="home-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4af37" stop-opacity="0"/>
          <stop offset="100%" stop-color="#d4af37" stop-opacity="0.16"/>
        </linearGradient>
        <linearGradient id="home-ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#cfe6ea"/>
          <stop offset="100%" stop-color="#7f9aa3"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#home-sky)"/>
      <ellipse cx="${w * 0.78}" cy="${h * 0.22}" rx="420" ry="420" fill="url(#home-glow)"/>
      ${starsSVG(90, "home", w, h)}
      <!-- distant mountains -->
      <path d="M0 420 L120 330 L230 400 L340 300 L470 410 L600 320 L740 400 L880 310 L1020 405 L1170 330 L1300 410 L1440 340 L${w} 400 L${w} ${h} L0 ${h} Z" fill="#141221" opacity="0.85"/>
      <path d="M0 470 L160 400 L300 460 L460 380 L640 465 L820 390 L1000 470 L1180 400 L1360 465 L${w} 410 L${w} ${h} L0 ${h} Z" fill="#0c0a14" opacity="0.9"/>
      <!-- the Wall -->
      <rect x="0" y="500" width="${w}" height="70" fill="url(#home-ice)" opacity="0.9"/>
      <rect x="0" y="500" width="${w}" height="70" fill="#050506" opacity="0.55"/>
      ${Array.from({ length: 22 }).map((_, i) => `<rect x="${i * (w / 22)}" y="492" width="${w / 22 - 6}" height="14" fill="url(#home-ice)" opacity="0.85"/>`).join("")}
      <rect x="0" y="565" width="${w}" height="${h - 565}" fill="#050506"/>
      <filter id="soft-home"><feGaussianBlur stdDeviation="0.6"/></filter>
      <rect width="${w}" height="${h}" filter="url(#grain-home)" opacity="0.5"/>
    </svg>
  `;
}

// ---------- House hero: per-house atmospheric color wash --------------
function houseSceneSVG(color, sigilId) {
  const w = 1600, h = 420;
  const dark = shadeHex(color, -60);
  const mid = shadeHex(color, -25);
  const light = shadeHex(color, 25);
  const sigilInner = (typeof SIGIL_PATHS !== "undefined" && SIGIL_PATHS[sigilId]) || "";
  const uid = sanitizeId(color) + Math.floor(Math.random() * 1e6);
  return `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${sceneDefs("house-" + uid)}
        <radialGradient id="house-glow-${uid}" cx="50%" cy="15%" r="85%">
          <stop offset="0%" stop-color="${light}" stop-opacity="0.35"/>
          <stop offset="45%" stop-color="${mid}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#050506" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="house-base-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#050506"/>
          <stop offset="60%" stop-color="${dark}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#050506"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#house-base-${uid})"/>
      <rect width="${w}" height="${h}" fill="url(#house-glow-${uid})"/>
      <g opacity="0.09" fill="${light}" transform="translate(${w / 2} ${h / 2}) scale(9) translate(-50 -50)">${sigilInner}</g>
      ${starsSVG(50, "house-" + uid, w, h)}
      <rect width="${w}" height="${h}" filter="url(#grain-house-${uid})" opacity="0.4"/>
    </svg>
  `;
}

// ---------- Map atmosphere: subtle vignette/fog behind the map panel ----
function mapSceneSVG() {
  const w = 1400, h = 500;
  return `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${sceneDefs("map")}
        <radialGradient id="map-fog" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stop-color="#12241f" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#050506" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#map-fog)"/>
      ${starsSVG(40, "map", w, h)}
      <rect width="${w}" height="${h}" filter="url(#grain-map)" opacity="0.35"/>
    </svg>
  `;
}
