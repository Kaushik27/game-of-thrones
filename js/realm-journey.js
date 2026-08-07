// Cinematic, season-aware journey through the realm.
//
// RealmJourney owns every node it adds to the supplied root. Its WebGL scene
// is progressive enhancement: the story, chapters, markers, and navigation
// remain fully usable when Three.js or a WebGL context is unavailable.
(function installRealmJourney(global, document) {
  "use strict";

  const mountedRoots = new WeakMap();
  const seasonNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const iconPaths = Object.freeze({
    character: "assets/icons/person.svg",
    place: "assets/icons/castle.svg",
    battle: "assets/icons/swords.svg",
    winter: "assets/icons/snowflake.svg",
    play: "assets/icons/play.svg",
    compass: "assets/icons/compass.svg"
  });
  const markerPositions = Object.freeze([
    [46, 48],
    [35, 22],
    [69, 17],
    [80, 38],
    [73, 72]
  ]);
  const markerWorldPositions = Object.freeze([
    [-1.1, 0.2, 1.7],
    [-4.0, 0.2, -1.7],
    [1.1, 0.2, -3.0],
    [3.5, 0.2, -0.8],
    [2.5, 0.2, 3.8]
  ]);
  let instanceNumber = 0;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function seasonNumber(value) {
    const match = String(value == null ? "" : value).match(/(?:^|\D)([1-8])(?:\D|$)/);
    return match ? Number(match[1]) : NaN;
  }

  function validSeason(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 8) {
      throw new RangeError("RealmJourney season must be an integer from 1 through 8.");
    }
    return parsed;
  }

  function finiteNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function safeAssetPath(value, fallback) {
    const path = typeof value === "string" ? value.trim() : "";
    if (!path || /^(?:javascript|vbscript):/i.test(path)) return fallback || "";
    return path;
  }

  function safeAccent(value) {
    const color = typeof value === "string" ? value.trim() : "";
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color) ? color : "#94bed9";
  }

  function uniqueStrings(values) {
    return [...new Set(asArray(values).filter(value => typeof value === "string" && value.trim()))];
  }

  function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }

  function iconImage(path, className) {
    const image = element("img", className);
    image.src = safeAssetPath(path, iconPaths.compass);
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.decoding = "async";
    return image;
  }

  function resolveRuntime(options) {
    const characterRecords = options.characters ||
      (typeof characters !== "undefined" ? characters : global.characters);
    const eventRecords = options.events ||
      (typeof events !== "undefined" ? events : global.events);
    const battleRecords = options.battles ||
      (typeof battles !== "undefined" ? battles : global.battles);
    const photoHelper = options.actorPhotoFor ||
      (typeof actorPhotoFor === "function" ? actorPhotoFor : global.actorPhotoFor);
    const escapeHelper = options.escapeHTML ||
      (typeof escapeHTML === "function" ? escapeHTML : global.escapeHTML);
    const journeyRecords = options.chapters || global.REALM_CHAPTERS ||
      (typeof REALM_CHAPTERS !== "undefined" ? REALM_CHAPTERS : null);

    return {
      THREE: options.THREE || global.THREE,
      characters: asArray(characterRecords),
      events: asArray(eventRecords),
      battles: asArray(battleRecords),
      actorPhotoFor: typeof photoHelper === "function" ? photoHelper : null,
      escapeHTML: typeof escapeHelper === "function" ? escapeHelper : null,
      journeyRecords: asArray(journeyRecords)
    };
  }

  function recordsForSeason(records, season) {
    return asArray(records).filter(record => seasonNumber(record && record.season) === season);
  }

  function fallbackSeasonModel(season, runtime) {
    const seasonBattles = recordsForSeason(runtime.battles, season);
    const seasonEvents = recordsForSeason(runtime.events, season);
    const primary = seasonBattles[0] || seasonEvents[0] || null;
    const chapterSources = [...seasonBattles, ...seasonEvents]
      .filter(record => record && (record.name || record.title))
      .slice(0, 3);
    const chapters = chapterSources.length ? chapterSources.map((record, index) => ({
      id: record.id || `season-${season}-chapter-${index + 1}`,
      title: record.name || record.title,
      summary: record.outcome || record.summary || "",
      icon: record.name ? iconPaths.battle : iconPaths.compass,
      battleId: record.name ? record.id : null,
      eventId: record.title ? record.id : null
    })) : [{
      id: `season-${season}`,
      title: `Season ${season}`,
      icon: season >= 5 ? iconPaths.winter : iconPaths.compass
    }];

    return {
      season,
      kicker: `Season ${season}`,
      title: primary ? primary.name || primary.title : `The Realm in Season ${season}`,
      summary: primary ? primary.outcome || primary.summary || "" : "Explore the people and turning points that changed the realm.",
      copy: [],
      playLabel: "Play this chapter",
      chapters,
      markers: [],
      route: null,
      terrain: {}
    };
  }

  function normalizeCopy(value) {
    if (Array.isArray(value)) return value.filter(item => item != null).map(String);
    if (value == null || value === "") return [];
    return [String(value)];
  }

  function normalizeChapter(rawChapter, index, season) {
    const source = rawChapter && typeof rawChapter === "object" ? rawChapter : {};
    const type = source.type || (source.battleId ? "battle" : source.eventId ? "event" : "chapter");
    return Object.assign({}, source, {
      id: String(source.id || `season-${season}-chapter-${index + 1}`),
      title: String(source.title || source.label || `Chapter ${index + 1}`),
      icon: safeAssetPath(source.icon, type === "battle" ? iconPaths.battle : iconPaths.compass),
      markerIds: uniqueStrings(source.markerIds)
    });
  }

  function buildSeasonModel(season, runtime) {
    const fallback = fallbackSeasonModel(season, runtime);
    const supplied = runtime.journeyRecords.find(record => seasonNumber(record && record.season) === season) || {};
    const chapterSource = asArray(supplied.chapters).length ? supplied.chapters : fallback.chapters;
    const chapters = chapterSource.map((chapter, index) => normalizeChapter(chapter, index, season));
    const title = supplied.title || supplied.headline || fallback.title;
    const defaultChapter = supplied.defaultChapterId != null
      ? supplied.defaultChapterId
      : supplied.defaultChapter != null
        ? supplied.defaultChapter
        : supplied.activeChapter;

    return Object.assign({}, fallback, supplied, {
      season,
      kicker: supplied.kicker || supplied.eyebrow || fallback.kicker,
      title,
      summary: supplied.summary || supplied.description || fallback.summary,
      copy: normalizeCopy(supplied.copy != null ? supplied.copy : supplied.body),
      playLabel: supplied.playLabel || fallback.playLabel,
      chapters,
      markers: asArray(supplied.markers),
      defaultChapter
    });
  }

  function defaultChapterIndex(model) {
    const configured = model.defaultChapter;
    if (configured != null) {
      const idIndex = model.chapters.findIndex(chapter => chapter.id === String(configured));
      if (idIndex >= 0) return idIndex;
      const numeric = Number(configured);
      if (Number.isInteger(numeric) && numeric >= 0 && numeric < model.chapters.length) return numeric;
    }
    const featured = model.chapters.findIndex(chapter => chapter.featured === true || chapter.active === true);
    return featured >= 0 ? featured : 0;
  }

  function findCharacter(runtime, characterId) {
    return runtime.characters.find(character => character && character.id === characterId) || null;
  }

  function findBattle(runtime, battleId) {
    return runtime.battles.find(battle => battle && battle.id === battleId) || null;
  }

  function findEvent(runtime, eventId) {
    return runtime.events.find(event => event && event.id === eventId) || null;
  }

  function photoPathFor(runtime, characterId) {
    if (!runtime.actorPhotoFor || !characterId) return "";
    try {
      const value = runtime.actorPhotoFor(characterId);
      if (typeof value === "string") return safeAssetPath(value, "");
      if (value && typeof value.file === "string") return safeAssetPath(value.file, "");
    } catch (error) {
      return "";
    }
    return "";
  }

  function normalizedScreenPosition(source, index) {
    const pair = asArray(source.screen).length >= 2
      ? source.screen
      : asArray(source.position).length >= 2
        ? source.position
        : markerPositions[index % markerPositions.length];
    return [
      clamp(finiteNumber(source.x, finiteNumber(pair[0], markerPositions[index % markerPositions.length][0])), 6, 94),
      clamp(finiteNumber(source.y, finiteNumber(pair[1], markerPositions[index % markerPositions.length][1])), 6, 92)
    ];
  }

  function normalizedWorldPosition(source, index) {
    const pair = asArray(source.world).length >= 2
      ? source.world
      : asArray(source.worldPosition).length >= 2
        ? source.worldPosition
        : markerWorldPositions[index % markerWorldPositions.length];
    if (pair.length === 2) return [finiteNumber(pair[0], 0), 0.2, finiteNumber(pair[1], 0)];
    return [
      finiteNumber(pair[0], 0),
      finiteNumber(pair[1], 0.2),
      finiteNumber(pair[2], 0)
    ];
  }

  function normalizeMarker(rawMarker, index, runtime) {
    const source = rawMarker && typeof rawMarker === "object" ? rawMarker : {};
    const characterId = source.characterId || (source.type === "character" ? source.sourceId : null);
    const battleId = source.battleId || (source.type === "battle" ? source.sourceId : null);
    const eventId = source.eventId || (source.type === "event" ? source.sourceId : null);
    const character = findCharacter(runtime, characterId);
    const battle = findBattle(runtime, battleId);
    const eventRecord = findEvent(runtime, eventId);
    const type = source.type || (character ? "character" : battle ? "battle" : source.location ? "place" : "event");
    const label = source.label || source.name || (character && character.name) ||
      (battle && battle.name) || (eventRecord && eventRecord.title) || source.location || "Realm marker";
    const position = normalizedScreenPosition(source, index);
    const world = normalizedWorldPosition(source, index);
    const details = source.detail || source.description || (character && character.bio) ||
      (battle && battle.outcome) || (eventRecord && eventRecord.summary) || source.location || "";
    const id = String(source.id || characterId || battleId || eventId || `marker-${index + 1}`);
    let icon = source.icon;
    if (!icon) {
      if (type === "character") icon = iconPaths.character;
      else if (type === "battle") icon = iconPaths.battle;
      else if (type === "place") icon = iconPaths.castle;
      else icon = iconPaths.compass;
    }

    return Object.assign({}, source, {
      id,
      type,
      label: String(label),
      detail: String(details || ""),
      characterId: character ? character.id : characterId || null,
      battleId: battle ? battle.id : battleId || null,
      eventId: eventRecord ? eventRecord.id : eventId || null,
      character,
      battle,
      event: eventRecord,
      photo: source.photo || photoPathFor(runtime, characterId),
      icon: safeAssetPath(icon, iconPaths.compass),
      x: position[0],
      y: position[1],
      world
    });
  }

  function deriveMarkers(model, chapter, runtime) {
    const seasonBattles = recordsForSeason(runtime.battles, model.season);
    const seasonEvents = recordsForSeason(runtime.events, model.season);
    const battle = findBattle(runtime, chapter.battleId) || seasonBattles[0] || null;
    const eventRecord = findEvent(runtime, chapter.eventId) || seasonEvents[0] || null;
    const characterIds = uniqueStrings([
      ...asArray(chapter.characterIds),
      ...asArray(chapter.characters),
      ...asArray(battle && battle.linkedCharacters),
      ...asArray(eventRecord && eventRecord.characters)
    ]).slice(0, 3);
    const derived = [];

    characterIds.forEach((characterId, index) => {
      const character = findCharacter(runtime, characterId);
      if (!character) return;
      derived.push({
        id: character.id,
        type: "character",
        characterId: character.id,
        x: markerPositions[index][0],
        y: markerPositions[index][1],
        world: markerWorldPositions[index]
      });
    });

    const location = chapter.location || (battle && battle.location);
    if (location) {
      derived.push({
        id: `place-${model.season}-${String(location).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        type: "place",
        label: location,
        location,
        detail: battle ? `The setting of ${battle.name}.` : `A pivotal place in season ${model.season}.`,
        x: markerPositions[3][0],
        y: markerPositions[3][1],
        world: markerWorldPositions[3]
      });
    }

    if (battle) {
      derived.push({
        id: battle.id,
        type: "battle",
        battleId: battle.id,
        x: markerPositions[4][0],
        y: markerPositions[4][1],
        world: markerWorldPositions[4]
      });
    } else if (eventRecord) {
      derived.push({
        id: eventRecord.id,
        type: "event",
        eventId: eventRecord.id,
        x: markerPositions[4][0],
        y: markerPositions[4][1],
        world: markerWorldPositions[4]
      });
    }

    return derived;
  }

  function markersForView(model, chapter, runtime) {
    const chapterMarkers = asArray(chapter.markers);
    let markerSource;
    if (chapterMarkers.length) {
      const byId = new Map(model.markers.map(marker => [String(marker && marker.id), marker]));
      markerSource = chapterMarkers.map(marker => typeof marker === "string" ? byId.get(marker) : marker).filter(Boolean);
    } else if (chapter.markerIds.length) {
      const wanted = new Set(chapter.markerIds);
      markerSource = model.markers.filter(marker => marker && wanted.has(String(marker.id)));
    } else {
      markerSource = model.markers;
    }
    if (!markerSource.length) markerSource = deriveMarkers(model, chapter, runtime);

    const seen = new Set();
    return markerSource
      .map((marker, index) => normalizeMarker(marker, index, runtime))
      .filter(marker => {
        if (seen.has(marker.id)) return false;
        seen.add(marker.id);
        return true;
      });
  }

  function viewFor(model, chapter) {
    const terrain = Object.assign({}, model.terrain || {}, chapter.terrain || {});
    const fortress = Object.assign(
      { strength: terrain.fortress },
      model.fortress || {},
      chapter.fortress || {}
    );
    return {
      season: model.season,
      chapterId: chapter.id,
      kicker: chapter.kicker || chapter.eyebrow || model.kicker,
      title: chapter.headline || model.title,
      summary: chapter.summary || chapter.description || model.summary,
      copy: normalizeCopy(chapter.copy != null ? chapter.copy : chapter.body != null ? chapter.body : model.copy),
      playLabel: chapter.playLabel || model.playLabel,
      navigate: chapter.navigate || chapter.href || chapter.sourceUrl ||
        model.navigate || model.href || model.sourceUrl || "#/timeline",
      sourceUrl: chapter.sourceUrl || model.sourceUrl || "",
      background: chapter.background || model.background || "assets/ui/war-table-stone.jpg",
      accent: safeAccent(chapter.accent || model.accent),
      route: chapter.route || model.route,
      camera: chapter.camera || model.camera,
      terrain,
      fortress,
      chapter
    };
  }

  function createDom(instanceId) {
    const shell = element("section", "realm-journey");
    shell.dataset.realmJourney = instanceId;
    shell.dataset.webgl = "pending";

    const titleId = `${instanceId}-title`;
    const hintId = `${instanceId}-hint`;
    shell.setAttribute("aria-labelledby", titleId);
    shell.setAttribute("aria-describedby", hintId);

    const scene = element("div", "realm-journey__scene");
    const fallback = element("div", "realm-journey__fallback");
    fallback.hidden = true;
    const fallbackImage = element("img", "realm-journey__fallback-landscape");
    fallbackImage.src = "assets/ui/war-table-stone.jpg";
    fallbackImage.alt = "A cinematic landscape of the realm.";
    fallbackImage.decoding = "async";
    fallback.appendChild(fallbackImage);
    scene.appendChild(fallback);
    scene.appendChild(element("div", "realm-journey__veil"));

    const story = element("div", "realm-journey__story");
    const kicker = element("p", "realm-journey__kicker");
    const title = element("h1", "realm-journey__title");
    title.id = titleId;
    const rule = element("div", "realm-journey__rule");
    rule.setAttribute("aria-hidden", "true");
    const summary = element("p", "realm-journey__summary");
    const copy = element("div", "realm-journey__copy");
    const play = element("button", "realm-journey__play");
    play.type = "button";
    play.appendChild(iconImage(iconPaths.play, "realm-journey__play-icon"));
    play.appendChild(element("span", "realm-journey__play-label"));
    story.append(kicker, title, rule, summary, copy, play);

    const markers = element("div", "realm-journey__markers");
    markers.setAttribute("role", "group");

    const detail = element("aside", "realm-journey__detail");
    detail.id = `${instanceId}-detail`;
    detail.hidden = true;
    detail.setAttribute("aria-live", "polite");
    detail.setAttribute("aria-atomic", "true");

    const seasonNav = element("nav", "realm-journey__season-nav");
    seasonNav.setAttribute("aria-label", "Choose a season");
    seasonNav.appendChild(element("span", "realm-journey__season-label", "Season"));
    seasonNumbers.forEach(season => {
      const button = element("button", "realm-journey__season", `S${season}`);
      button.type = "button";
      button.dataset.season = String(season);
      button.setAttribute("aria-label", `Season ${season}`);
      seasonNav.appendChild(button);
    });

    const hint = element("p", "realm-journey__hint");
    hint.id = hintId;
    hint.appendChild(iconImage(iconPaths.compass, "realm-journey__hint-icon"));
    hint.appendChild(element("span", "", "Move the pointer to look around. Use the season and chapter controls to travel through the story."));

    const chapters = element("nav", "realm-journey__chapters");
    chapters.setAttribute("aria-label", "Choose a chapter");

    const status = element("p", "realm-journey__status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    scene.append(story, markers, detail, seasonNav, hint, chapters, status);
    shell.appendChild(scene);

    return {
      shell,
      scene,
      fallback,
      story,
      kicker,
      title,
      summary,
      copy,
      play,
      playLabel: play.querySelector(".realm-journey__play-label"),
      fallbackImage,
      markers,
      detail,
      seasonNav,
      hint,
      chapters,
      status
    };
  }

  function seededRandom(seedValue) {
    let seed = (Math.floor(seedValue) || 1) >>> 0;
    return function nextRandom() {
      seed += 0x6d2b79f5;
      let value = seed;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function terrainHeight(x, z, seed) {
    const phase = (seed % 37) * 0.17;
    const rolling = Math.sin(x * 0.53 + phase) * 0.32 + Math.cos(z * 0.67 - phase) * 0.27;
    const detail = Math.sin((x + z) * 1.41 + phase * 2) * 0.11 + Math.cos((x - z) * 1.87) * 0.07;
    const northernRise = Math.pow(clamp((-z - 0.8) / 6.2, 0, 1), 1.65) * 3.0;
    return rolling + detail + northernRise - 0.22;
  }

  function disposeObject(object) {
    if (!object) return;
    const geometries = new Set();
    const materials = new Set();
    object.traverse(child => {
      if (child.geometry) geometries.add(child.geometry);
      if (child.material) {
        asArray(Array.isArray(child.material) ? child.material : [child.material]).forEach(material => materials.add(material));
      }
    });
    geometries.forEach(geometry => {
      if (geometry && typeof geometry.dispose === "function") geometry.dispose();
    });
    materials.forEach(material => {
      if (!material) return;
      Object.keys(material).forEach(key => {
        const value = material[key];
        if (value && value.isTexture && typeof value.dispose === "function") value.dispose();
      });
      if (typeof material.dispose === "function") material.dispose();
    });
  }

  function createWebGLController(sceneElement, runtime, onUnavailable) {
    const THREE = runtime.THREE;
    const required = [
      "WebGLRenderer", "Scene", "PerspectiveCamera", "Group", "Mesh", "PlaneGeometry",
      "BoxGeometry", "CylinderGeometry", "SphereGeometry", "BufferGeometry",
      "Float32BufferAttribute", "MeshStandardMaterial", "MeshBasicMaterial",
      "CatmullRomCurve3", "TubeGeometry", "Vector2", "Vector3", "Color"
    ];
    if (!THREE || required.some(name => typeof THREE[name] !== "function")) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (error) {
      return null;
    }

    const canvas = renderer.domElement;
    canvas.className = "realm-journey__canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.tabIndex = -1;
    sceneElement.insertBefore(canvas, sceneElement.firstChild);

    if (THREE.SRGBColorSpace && "outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (THREE.ACESFilmicToneMapping != null) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.82;
    }
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 1.75));

    const scene = new THREE.Scene();
    scene.background = null;
    if (typeof THREE.FogExp2 === "function") scene.fog = new THREE.FogExp2(0x09131a, 0.062);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    const baseCamera = new THREE.Vector3(0, 6.5, 11.8);
    const pointer = new THREE.Vector2(0, 0);
    const pointerTarget = new THREE.Vector2(0, 0);
    const baseTarget = new THREE.Vector3(0.9, 0.1, -0.4);
    const lookTarget = baseTarget.clone();
    const focusTarget = baseTarget.clone();
    camera.position.copy(baseCamera);
    camera.lookAt(lookTarget);

    const world = new THREE.Group();
    scene.add(world);

    if (typeof THREE.HemisphereLight === "function") {
      scene.add(new THREE.HemisphereLight(0x91aabc, 0x10100f, 1.35));
    }
    if (typeof THREE.DirectionalLight === "function") {
      const moon = new THREE.DirectionalLight(0xc8e0f2, 2.4);
      moon.position.set(-5, 10, 4);
      scene.add(moon);
      const rim = new THREE.DirectionalLight(0x506a7d, 0.65);
      rim.position.set(6, 3, -8);
      scene.add(rim);
    }

    let seasonGroup = null;
    let routeCurve = null;
    let routeOrb = null;
    let routeMaterial = null;
    let snowCloud = null;
    let emberCloud = null;
    let currentSeed = 1;
    let reducedMotion = false;
    let destroyed = false;
    let contextLost = false;
    let visible = true;
    let frame = 0;
    let resizeObserver = null;
    let intersectionObserver = null;
    let lastWidth = 0;
    let lastHeight = 0;
    const cleanup = [];

    function colorAttributeForTerrain(geometry, snowAmount, seed) {
      const position = geometry.getAttribute("position");
      const colors = new Float32Array(position.count * 3);
      const low = new THREE.Color(0x17232a);
      const high = new THREE.Color(0xaebbc0);
      const rock = new THREE.Color(0x34424a);
      for (let index = 0; index < position.count; index += 1) {
        const x = position.getX(index);
        const y = position.getY(index);
        const z = position.getZ(index);
        const altitude = clamp((y + 0.3) / 3.4, 0, 1);
        const frost = clamp(snowAmount * 0.58 + altitude * 0.62 + Math.sin(x * 1.6 + z * 1.1 + seed) * 0.08, 0, 1);
        const color = rock.clone().lerp(low, 0.38).lerp(high, frost);
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
      }
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    function createTerrain(group, settings, seed) {
      const snowAmount = clamp(finiteNumber(settings.snow, settings.snowy === false ? 0.18 : 0.76), 0, 1);
      const geometry = new THREE.PlaneGeometry(22, 16, 78, 58);
      geometry.rotateX(-Math.PI / 2);
      const position = geometry.getAttribute("position");
      for (let index = 0; index < position.count; index += 1) {
        const x = position.getX(index);
        const z = position.getZ(index);
        position.setY(index, terrainHeight(x, z, seed));
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      colorAttributeForTerrain(geometry, snowAmount, seed);
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.96,
        metalness: 0.02,
        flatShading: true,
        transparent: true,
        opacity: 0.14
      });
      const terrain = new THREE.Mesh(geometry, material);
      terrain.receiveShadow = false;
      group.add(terrain);

      const riverCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.8, terrainHeight(-2.8, -4.4, seed) + 0.03, -4.4),
        new THREE.Vector3(-1.8, terrainHeight(-1.8, -1.8, seed) + 0.04, -1.8),
        new THREE.Vector3(-2.4, terrainHeight(-2.4, 0.9, seed) + 0.04, 0.9),
        new THREE.Vector3(-1.2, terrainHeight(-1.2, 4.3, seed) + 0.04, 4.3)
      ]);
      const riverGeometry = new THREE.TubeGeometry(riverCurve, 70, 0.16, 8, false);
      const riverMaterial = new THREE.MeshStandardMaterial({
        color: 0x315367,
        emissive: 0x102936,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.1
      });
      group.add(new THREE.Mesh(riverGeometry, riverMaterial));
    }

    function createForest(group, seed) {
      if (typeof THREE.InstancedMesh !== "function" || typeof THREE.ConeGeometry !== "function") return;
      const random = seededRandom(seed * 817 + 31);
      const count = 145;
      const geometry = new THREE.ConeGeometry(0.13, 0.72, 5);
      geometry.translate(0, 0.36, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x111b1d,
        roughness: 1,
        flatShading: true,
        transparent: true,
        opacity: 0.18
      });
      const forest = new THREE.InstancedMesh(geometry, material, count);
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const euler = new THREE.Euler();
      for (let index = 0; index < count; index += 1) {
        let x = random() * 20 - 10;
        let z = random() * 13 - 6.1;
        if (x > 1.7 && x < 5.4 && z > -2.8 && z < 1.4) x -= 4.3;
        const size = 0.65 + random() * 0.95;
        position.set(x, terrainHeight(x, z, seed) + 0.02, z);
        euler.set(0, random() * Math.PI * 2, (random() - 0.5) * 0.08);
        rotation.setFromEuler(euler);
        scale.set(size, size, size);
        matrix.compose(position, rotation, scale);
        forest.setMatrixAt(index, matrix);
      }
      forest.instanceMatrix.needsUpdate = true;
      group.add(forest);
    }

    function createFortress(group, settings, seed) {
      const strength = clamp(finiteNumber(settings.strength, 1), 0, 1.5);
      if (settings.hidden === true || strength <= 0.02) return;
      const fortress = new THREE.Group();
      const configured = asArray(settings.position);
      const x = finiteNumber(configured[0], 3.55);
      const z = configured.length >= 3 ? finiteNumber(configured[2], -0.75) : finiteNumber(configured[1], -0.75);
      fortress.position.set(x, terrainHeight(x, z, seed) + 0.02, z);
      fortress.rotation.y = finiteNumber(settings.rotation, -0.2);
      fortress.scale.setScalar(clamp(finiteNumber(settings.scale, 0.28 + strength * 0.18), 0.24, 1.2));

      const stone = new THREE.MeshStandardMaterial({ color: 0x29343a, roughness: 0.88, metalness: 0.04, transparent: true, opacity: 0.18 });
      const cap = new THREE.MeshStandardMaterial({ color: 0x182329, roughness: 0.92, transparent: true, opacity: 0.22 });
      const wallGeometryLong = new THREE.BoxGeometry(4.1, 0.7, 0.32);
      const wallGeometryShort = new THREE.BoxGeometry(0.32, 0.7, 3.1);
      const northWall = new THREE.Mesh(wallGeometryLong, stone);
      const southWall = new THREE.Mesh(wallGeometryLong, stone);
      const eastWall = new THREE.Mesh(wallGeometryShort, stone);
      const westWall = new THREE.Mesh(wallGeometryShort, stone);
      northWall.position.set(0, 0.38, -1.55);
      southWall.position.set(0, 0.38, 1.55);
      eastWall.position.set(2.05, 0.38, 0);
      westWall.position.set(-2.05, 0.38, 0);
      fortress.add(northWall, southWall, eastWall, westWall);

      const towerGeometry = new THREE.CylinderGeometry(0.42, 0.52, 1.35, 10);
      const roofGeometry = new THREE.CylinderGeometry(0.51, 0.51, 0.13, 10);
      [[-2.05, -1.55], [2.05, -1.55], [-2.05, 1.55], [2.05, 1.55], [0, -1.55], [0, 1.55]].forEach(pair => {
        const tower = new THREE.Mesh(towerGeometry, stone);
        tower.position.set(pair[0], 0.68, pair[1]);
        const roof = new THREE.Mesh(roofGeometry, cap);
        roof.position.set(pair[0], 1.38, pair[1]);
        fortress.add(tower, roof);
      });

      const keep = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.55, 1.05), stone);
      keep.position.set(0.15, 0.82, -0.1);
      const keepTop = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.16, 1.2), cap);
      keepTop.position.set(0.15, 1.64, -0.1);
      fortress.add(keep, keepTop);

      const merlonGeometry = new THREE.BoxGeometry(0.2, 0.22, 0.24);
      for (let index = -8; index <= 8; index += 1) {
        if (index % 2 !== 0) continue;
        const along = index * 0.23;
        const front = new THREE.Mesh(merlonGeometry, cap);
        const back = new THREE.Mesh(merlonGeometry, cap);
        front.position.set(along, 0.83, -1.55);
        back.position.set(along, 0.83, 1.55);
        fortress.add(front, back);
      }

      const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xe49a42 });
      [[-0.28, 0.92, 0.54], [0.18, 1.18, 0.54], [0.55, 0.72, 0.54]].forEach(coords => {
        const light = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.13), windowMaterial);
        light.position.set(coords[0] + 0.15, coords[1], coords[2] - 0.1);
        fortress.add(light);
      });
      if (typeof THREE.PointLight === "function") {
        const firelight = new THREE.PointLight(0xe2903d, 2.2, 4.5, 2);
        firelight.position.set(0.2, 1.2, 0.6);
        fortress.add(firelight);
      }
      group.add(fortress);
      return { x, z };
    }

    function createParticles(group, settings, seed, fortressPosition) {
      if (typeof THREE.Points !== "function" || typeof THREE.PointsMaterial !== "function") return;
      const random = seededRandom(seed * 1297 + 97);
      const snowAmount = clamp(finiteNumber(settings.snow, settings.snowy === false ? 0.18 : 0.76), 0, 1);
      const snowCount = Math.round(220 + snowAmount * 420);
      const snowPositions = new Float32Array(snowCount * 3);
      for (let index = 0; index < snowCount; index += 1) {
        snowPositions[index * 3] = random() * 22 - 11;
        snowPositions[index * 3 + 1] = random() * 8 + 0.5;
        snowPositions[index * 3 + 2] = random() * 16 - 8;
      }
      const snowGeometry = new THREE.BufferGeometry();
      snowGeometry.setAttribute("position", new THREE.Float32BufferAttribute(snowPositions, 3));
      const snowMaterial = new THREE.PointsMaterial({
        color: 0xd8e6ec,
        size: 0.035,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        sizeAttenuation: true
      });
      snowCloud = new THREE.Points(snowGeometry, snowMaterial);
      group.add(snowCloud);

      const embers = 68;
      const emberPositions = new Float32Array(embers * 3);
      const fort = fortressPosition || { x: 3.55, z: -0.75 };
      for (let index = 0; index < embers; index += 1) {
        emberPositions[index * 3] = fort.x + (random() - 0.5) * 4.2;
        emberPositions[index * 3 + 1] = terrainHeight(fort.x, fort.z, seed) + random() * 2.2;
        emberPositions[index * 3 + 2] = fort.z + (random() - 0.5) * 3.7;
      }
      const emberGeometry = new THREE.BufferGeometry();
      emberGeometry.setAttribute("position", new THREE.Float32BufferAttribute(emberPositions, 3));
      const emberMaterial = new THREE.PointsMaterial({
        color: 0xe47f36,
        size: 0.055,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      emberCloud = new THREE.Points(emberGeometry, emberMaterial);
      group.add(emberCloud);
    }

    function routePointsFor(view, markers, seed) {
      const configured = asArray(view.route);
      const source = configured.length >= 2 ? configured : markers.map(marker => marker.world).filter(position => asArray(position).length >= 2);
      const fallback = [[-5.5, 3.9], [-3.1, 2.1], [-0.8, 1.1], [1.6, 2.0], [3.55, -0.75], [4.8, 3.8]];
      return (source.length >= 2 ? source : fallback).map(position => {
        const values = asArray(position);
        const x = finiteNumber(values[0], 0);
        const hasY = values.length >= 3;
        const z = finiteNumber(hasY ? values[2] : values[1], 0);
        const y = hasY ? finiteNumber(values[1], terrainHeight(x, z, seed) + 0.18) : terrainHeight(x, z, seed) + 0.18;
        return new THREE.Vector3(x, y, z);
      });
    }

    function createRoute(group, view, markers, seed) {
      const points = routePointsFor(view, markers, seed);
      routeCurve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.38);
      const glowGeometry = new THREE.TubeGeometry(routeCurve, 100, 0.022, 8, false);
      routeMaterial = new THREE.MeshBasicMaterial({
        color: 0xa8d7ff,
        transparent: true,
        opacity: 0.74,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      group.add(new THREE.Mesh(glowGeometry, routeMaterial));
      const haloGeometry = new THREE.TubeGeometry(routeCurve, 100, 0.06, 8, false);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: 0x5da7e7,
        transparent: true,
        opacity: 0.12,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      group.add(new THREE.Mesh(haloGeometry, haloMaterial));
      routeOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xd8ecff, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      routeOrb.position.copy(routeCurve.getPointAt(0.42));
      group.add(routeOrb);
    }

    function applyCamera(view) {
      const cameraSettings = view.camera && typeof view.camera === "object" ? view.camera : {};
      const position = asArray(cameraSettings.position);
      const target = asArray(cameraSettings.target);
      baseCamera.set(
        finiteNumber(position[0], 0),
        finiteNumber(position[1], 6.5),
        finiteNumber(position[2], 11.8)
      );
      baseTarget.set(
        finiteNumber(target[0], 0.9),
        finiteNumber(target[1], 0.1),
        finiteNumber(target[2], -0.4)
      );
      focusTarget.copy(baseTarget);
      if (reducedMotion) {
        camera.position.copy(baseCamera);
        lookTarget.copy(baseTarget);
        camera.lookAt(lookTarget);
      }
    }

    function rebuild(view, markers) {
      if (destroyed || contextLost) return;
      if (seasonGroup) {
        world.remove(seasonGroup);
        disposeObject(seasonGroup);
      }
      seasonGroup = new THREE.Group();
      world.add(seasonGroup);
      currentSeed = Math.max(1, finiteNumber(
        view.terrain && view.terrain.seed,
        view.season * 1009 + String(view.chapterId).length * 43
      ));
      snowCloud = null;
      emberCloud = null;
      routeCurve = null;
      routeOrb = null;
      routeMaterial = null;
      createTerrain(seasonGroup, view.terrain || {}, currentSeed);
      createForest(seasonGroup, currentSeed);
      const fortress = createFortress(seasonGroup, view.fortress || {}, currentSeed);
      createParticles(seasonGroup, view.terrain || {}, currentSeed, fortress);
      createRoute(seasonGroup, view, markers, currentSeed);
      applyCamera(view);
      renderOnce();
      startLoop();
    }

    function resize() {
      if (destroyed || contextLost) return;
      const bounds = sceneElement.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width || sceneElement.clientWidth || 960));
      const height = Math.max(1, Math.round(bounds.height || sceneElement.clientHeight || Math.min(760, width * 0.69)));
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderOnce();
    }

    function updateFrame(time) {
      const seconds = time * 0.001;
      pointer.lerp(pointerTarget, reducedMotion ? 1 : 0.055);
      camera.position.set(
        baseCamera.x + pointer.x * 0.8,
        baseCamera.y - pointer.y * 0.34,
        baseCamera.z + Math.abs(pointer.x) * 0.18
      );
      lookTarget.lerp(focusTarget, reducedMotion ? 1 : 0.065);
      camera.lookAt(lookTarget.x + pointer.x * 0.2, lookTarget.y + pointer.y * 0.12, lookTarget.z);
      if (!reducedMotion) {
        if (routeCurve && routeOrb) routeOrb.position.copy(routeCurve.getPointAt((seconds * 0.042) % 1));
        if (routeMaterial) routeMaterial.opacity = 0.63 + Math.sin(seconds * 2.1) * 0.12;
        if (snowCloud) {
          snowCloud.rotation.y = seconds * 0.018;
          snowCloud.position.y = -((seconds * 0.12) % 0.85);
        }
        if (emberCloud) {
          emberCloud.rotation.y = -seconds * 0.09;
          emberCloud.position.y = (seconds * 0.09) % 0.35;
        }
      }
    }

    function renderOnce() {
      if (destroyed || contextLost) return;
      updateFrame(global.performance && typeof global.performance.now === "function" ? global.performance.now() : Date.now());
      renderer.render(scene, camera);
    }

    function onFrame(time) {
      frame = 0;
      if (destroyed || contextLost || reducedMotion || !visible || document.hidden) return;
      updateFrame(time);
      renderer.render(scene, camera);
      startLoop();
    }

    function startLoop() {
      if (frame || destroyed || contextLost || reducedMotion || !visible || document.hidden) return;
      frame = global.requestAnimationFrame(onFrame);
    }

    function stopLoop() {
      if (!frame) return;
      global.cancelAnimationFrame(frame);
      frame = 0;
    }

    function setReducedMotion(value) {
      reducedMotion = Boolean(value);
      if (reducedMotion) {
        pointer.set(0, 0);
        pointerTarget.set(0, 0);
        stopLoop();
        if (routeCurve && routeOrb) routeOrb.position.copy(routeCurve.getPointAt(0.5));
        renderOnce();
      } else {
        startLoop();
      }
    }

    function setPointer(x, y) {
      if (destroyed || reducedMotion) return;
      pointerTarget.set(clamp(finiteNumber(x, 0), -1, 1), clamp(finiteNumber(y, 0), -1, 1));
      startLoop();
    }

    function focusMarker(marker) {
      if (!marker || !asArray(marker.world).length) {
        focusTarget.copy(baseTarget);
      } else {
        const position = marker.world;
        focusTarget.set(finiteNumber(position[0], 0), finiteNumber(position[1], 0.2), finiteNumber(position[2], 0));
        focusTarget.lerp(baseTarget, 0.24);
      }
      if (reducedMotion) renderOnce();
      else startLoop();
    }

    function onContextLost(event) {
      event.preventDefault();
      contextLost = true;
      stopLoop();
      // A lost drawing buffer can otherwise remain as an opaque layer over
      // the authored fallback. Remove it immediately; the DOM journey stays
      // interactive and destroy() will still release the retained resources.
      if (canvas.parentNode) canvas.remove();
      onUnavailable();
    }
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    cleanup.push(() => canvas.removeEventListener("webglcontextlost", onContextLost, false));

    function onVisibilityChange() {
      if (document.hidden) stopLoop();
      else {
        renderOnce();
        startLoop();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    cleanup.push(() => document.removeEventListener("visibilitychange", onVisibilityChange));

    if (typeof global.ResizeObserver === "function") {
      resizeObserver = new global.ResizeObserver(resize);
      resizeObserver.observe(sceneElement);
    } else {
      global.addEventListener("resize", resize);
      cleanup.push(() => global.removeEventListener("resize", resize));
    }
    if (typeof global.IntersectionObserver === "function") {
      intersectionObserver = new global.IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) {
          renderOnce();
          startLoop();
        } else stopLoop();
      }, { rootMargin: "180px" });
      intersectionObserver.observe(sceneElement);
    }

    resize();

    return {
      rebuild,
      resize,
      setPointer,
      focusMarker,
      setReducedMotion,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        stopLoop();
        cleanup.splice(0).forEach(remove => remove());
        if (resizeObserver) resizeObserver.disconnect();
        if (intersectionObserver) intersectionObserver.disconnect();
        if (seasonGroup) {
          world.remove(seasonGroup);
          disposeObject(seasonGroup);
        }
        disposeObject(scene);
        renderer.dispose();
        if (typeof renderer.forceContextLoss === "function" && !contextLost) renderer.forceContextLoss();
        if (canvas.parentNode) canvas.remove();
      }
    };
  }

  function mount(rootElement, rawOptions) {
    if (!rootElement || typeof rootElement.appendChild !== "function") {
      throw new TypeError("RealmJourney.mount requires a DOM element root.");
    }

    const previous = mountedRoots.get(rootElement);
    if (previous) previous.destroy();

    const options = rawOptions || {};
    if (options.onNavigate != null && typeof options.onNavigate !== "function") {
      throw new TypeError("RealmJourney onNavigate must be a function when provided.");
    }
    const initialSeason = options.initialSeason == null ? 6 : validSeason(options.initialSeason);
    const runtime = resolveRuntime(options);
    const models = new Map(seasonNumbers.map(season => [season, buildSeasonModel(season, runtime)]));
    const instanceId = `realm-journey-${++instanceNumber}`;
    const dom = createDom(instanceId);
    const cleanup = [];
    const motionQuery = typeof global.matchMedia === "function"
      ? global.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    let reducedMotion = Boolean(motionQuery && motionQuery.matches);
    let destroyed = false;
    let currentSeason = initialSeason;
    let currentChapterIndex = 0;
    let currentMarkers = [];
    let selectedMarkerId = null;
    let pointerDown = false;
    let webgl = null;

    rootElement.appendChild(dom.shell);

    function listen(target, type, handler, settings) {
      target.addEventListener(type, handler, settings);
      cleanup.push(() => target.removeEventListener(type, handler, settings));
    }

    function showFallback() {
      dom.shell.dataset.webgl = "false";
      dom.shell.classList.add("realm-journey--fallback");
      dom.fallback.hidden = false;
    }

    function enableWebGL() {
      if (destroyed || webgl) return;
      runtime.THREE = runtime.THREE || global.THREE;
      webgl = createWebGLController(dom.scene, runtime, showFallback);
      if (!webgl) {
        showFallback();
        return;
      }
      dom.shell.dataset.webgl = "true";
      dom.shell.classList.remove("realm-journey--fallback");
      // The authored landscape remains beneath the transparent WebGL layer.
      // It gives the scene a richer horizon while the terrain, fortress,
      // particles, and route are still rendered in real time above it.
      dom.fallback.hidden = false;
      webgl.setReducedMotion(reducedMotion);
      if (dom.shell.dataset.chapter) {
        webgl.rebuild(viewFor(currentModel(), currentChapter()), currentMarkers);
      }
    }

    enableWebGL();
    // three-bootstrap.js deliberately loads after this classic script. A
    // mounted fallback upgrades in place as soon as the local Three runtime
    // is ready, with no route remount or lost keyboard state.
    listen(global, "realm-three-ready", enableWebGL);

    function announce(message) {
      dom.status.textContent = "";
      global.requestAnimationFrame(() => {
        if (!destroyed) dom.status.textContent = message;
      });
    }

    function currentModel() {
      return models.get(currentSeason);
    }

    function currentChapter() {
      const model = currentModel();
      return model.chapters[currentChapterIndex] || model.chapters[0];
    }

    function updateStory(view) {
      dom.shell.style.setProperty("--journey-accent", view.accent);
      dom.fallbackImage.src = safeAssetPath(view.background, "assets/ui/war-table-stone.jpg");
      dom.kicker.textContent = view.kicker || `Season ${view.season}`;
      dom.title.textContent = view.title || `Season ${view.season}`;
      dom.summary.textContent = view.summary || "";
      dom.summary.hidden = !view.summary;
      dom.copy.replaceChildren();
      view.copy.forEach(paragraph => dom.copy.appendChild(element("p", "", paragraph)));
      dom.copy.hidden = view.copy.length === 0;
      dom.playLabel.textContent = view.playLabel || "Play this chapter";
      dom.play.dataset.navigate = view.navigate || "#/timeline";
      dom.play.setAttribute("aria-label", `${view.playLabel || "Play this chapter"}: ${view.title}`);
    }

    function markerButton(marker) {
      const button = element("button", `realm-journey__marker realm-journey__marker--${marker.type}`);
      button.type = "button";
      button.dataset.markerId = marker.id;
      button.style.setProperty("--marker-x", `${marker.x}%`);
      button.style.setProperty("--marker-y", `${marker.y}%`);
      const selected = marker.id === selectedMarkerId;
      button.setAttribute("aria-label", `${marker.label}. ${selected ? "Close" : "Open"} details.`);
      button.setAttribute("aria-controls", dom.detail.id);
      button.setAttribute("aria-expanded", String(selected));
      button.setAttribute("aria-pressed", String(selected));
      if (selected) button.classList.add("realm-journey__marker--selected");

      if (marker.type === "character" && marker.photo) {
        const portrait = element("img", "realm-journey__marker-portrait");
        portrait.src = safeAssetPath(marker.photo, iconPaths.character);
        portrait.alt = "";
        portrait.decoding = "async";
        portrait.loading = "lazy";
        button.classList.add("realm-journey__marker--has-portrait");
        button.appendChild(portrait);
      } else {
        button.appendChild(iconImage(marker.icon, "realm-journey__marker-icon"));
      }
      button.appendChild(element("span", "realm-journey__marker-label", marker.label));
      return button;
    }

    function renderMarkers() {
      dom.markers.replaceChildren();
      dom.markers.setAttribute("aria-label", `Points of interest in season ${currentSeason}`);
      currentMarkers.forEach(marker => dom.markers.appendChild(markerButton(marker)));
    }

    function markerNavigation(marker) {
      if (marker.navigate || marker.href) {
        return { target: marker.navigate || marker.href, label: marker.actionLabel || "Open story" };
      }
      if (marker.sourceUrl) return { target: marker.sourceUrl, label: marker.actionLabel || "Episode guide" };
      if (marker.characterId) return { target: `#/character/${encodeURIComponent(marker.characterId)}`, label: "Profile" };
      if (marker.battleId) return { target: "#/battles", label: "Battle record" };
      if (marker.eventId) return { target: "#/timeline", label: "Timeline event" };
      return null;
    }

    function renderDetails() {
      dom.detail.replaceChildren();
      const marker = currentMarkers.find(item => item.id === selectedMarkerId);
      if (!marker) {
        dom.detail.hidden = true;
        dom.detail.removeAttribute("aria-labelledby");
        dom.detail.removeAttribute("style");
        if (webgl) webgl.focusMarker(null);
        return;
      }

      dom.detail.hidden = false;
      dom.detail.style.setProperty("--detail-x", `${marker.x}%`);
      dom.detail.style.setProperty("--detail-y", `${marker.y}%`);
      const kind = marker.type === "character" ? "Character" : marker.type === "battle" ? "Battle" : marker.type === "place" ? "Place" : "Event";
      dom.detail.appendChild(element("p", "realm-journey__detail-kicker", `Season ${currentSeason} · ${kind}`));
      const detailTitle = element("h2", "realm-journey__detail-title", marker.label);
      detailTitle.id = `${instanceId}-detail-title`;
      dom.detail.setAttribute("aria-labelledby", detailTitle.id);
      dom.detail.appendChild(detailTitle);
      if (marker.detail) dom.detail.appendChild(element("p", "realm-journey__detail-text", marker.detail));

      const navigation = markerNavigation(marker);
      if (navigation) {
        const actions = element("div", "realm-journey__detail-actions");
        const link = element("a", "realm-journey__detail-link", navigation.label);
        link.href = navigation.target;
        link.dataset.realmNavigate = navigation.target;
        actions.appendChild(link);
        dom.detail.appendChild(actions);
      }
      if (webgl) webgl.focusMarker(marker);
    }

    function updateMarkerSelection() {
      dom.markers.querySelectorAll(".realm-journey__marker").forEach(button => {
        const selected = button.dataset.markerId === selectedMarkerId;
        const marker = currentMarkers.find(item => item.id === button.dataset.markerId);
        button.setAttribute("aria-label", `${marker ? marker.label : "Marker"}. ${selected ? "Close" : "Open"} details.`);
        button.setAttribute("aria-expanded", String(selected));
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("realm-journey__marker--selected", selected);
      });
      renderDetails();
    }

    function selectMarker(markerId, shouldAnnounce) {
      const marker = currentMarkers.find(item => item.id === markerId);
      if (!marker) return;
      selectedMarkerId = selectedMarkerId === markerId ? null : markerId;
      updateMarkerSelection();
      if (shouldAnnounce !== false) {
        announce(selectedMarkerId ? `${marker.label} details opened.` : `${marker.label} details closed.`);
      }
    }

    function renderChapterControls() {
      const model = currentModel();
      dom.chapters.replaceChildren();
      model.chapters.forEach((chapter, index) => {
        const button = element("button", "realm-journey__chapter");
        button.type = "button";
        button.dataset.chapterIndex = String(index);
        button.dataset.chapterId = chapter.id;
        button.setAttribute("aria-pressed", String(index === currentChapterIndex));
        button.appendChild(iconImage(chapter.icon, "realm-journey__chapter-icon"));
        button.appendChild(element("span", "realm-journey__chapter-title", chapter.title));
        dom.chapters.appendChild(button);
      });
    }

    function updateSeasonControls() {
      dom.seasonNav.querySelectorAll(".realm-journey__season").forEach(button => {
        const active = Number(button.dataset.season) === currentSeason;
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
    }

    function updateChapterControls() {
      dom.chapters.querySelectorAll(".realm-journey__chapter").forEach(button => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.chapterIndex) === currentChapterIndex));
      });
    }

    function renderView() {
      const model = currentModel();
      const chapter = currentChapter();
      const view = viewFor(model, chapter);
      currentMarkers = markersForView(model, chapter, runtime);
      if (!currentMarkers.some(marker => marker.id === selectedMarkerId)) selectedMarkerId = null;
      const defaultMarker = chapter.defaultMarkerId != null ? chapter.defaultMarkerId : chapter.defaultMarker;
      if (!selectedMarkerId && defaultMarker != null && currentMarkers.some(marker => marker.id === String(defaultMarker))) {
        selectedMarkerId = String(defaultMarker);
      }
      dom.shell.dataset.season = String(currentSeason);
      dom.shell.dataset.chapter = chapter.id;
      updateStory(view);
      renderMarkers();
      renderDetails();
      if (webgl) webgl.rebuild(view, currentMarkers);
    }

    function setChapter(index, config) {
      const model = currentModel();
      const next = Number(index);
      if (!Number.isInteger(next) || next < 0 || next >= model.chapters.length) return;
      currentChapterIndex = next;
      selectedMarkerId = null;
      updateChapterControls();
      renderView();
      if (!config || config.announce !== false) {
        announce(`${model.chapters[next].title} selected for season ${currentSeason}.`);
      }
    }

    function setSeason(value, config) {
      if (destroyed) return;
      const season = validSeason(value);
      currentSeason = season;
      const model = currentModel();
      currentChapterIndex = defaultChapterIndex(model);
      selectedMarkerId = null;
      updateSeasonControls();
      renderChapterControls();
      renderView();
      if (!config || config.announce !== false) {
        announce(`Season ${season} selected. ${model.chapters.length} ${model.chapters.length === 1 ? "chapter" : "chapters"} available.`);
      }
    }

    function navigate(target, context) {
      if (!target) return;
      if (typeof options.onNavigate === "function") {
        options.onNavigate(target, context || {});
        return;
      }
      if (String(target).startsWith("#")) global.location.hash = String(target);
      else if (global.location && typeof global.location.assign === "function") global.location.assign(String(target));
    }

    function moveAmongButtons(event, selector, orientation) {
      const keys = orientation === "vertical"
        ? ["ArrowUp", "ArrowDown"]
        : orientation === "horizontal"
          ? ["ArrowLeft", "ArrowRight"]
          : ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      if (!keys.includes(event.key) && event.key !== "Home" && event.key !== "End") return false;
      const buttons = Array.from(event.currentTarget.querySelectorAll(selector));
      const current = event.target.closest(selector);
      if (!current || !buttons.length) return false;
      event.preventDefault();
      let index = buttons.indexOf(current);
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = buttons.length - 1;
      else {
        const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
        index = (index + (forward ? 1 : -1) + buttons.length) % buttons.length;
      }
      buttons[index].focus();
      buttons[index].click();
      return true;
    }

    listen(dom.shell, "click", event => {
      const seasonButton = event.target.closest && event.target.closest(".realm-journey__season");
      if (seasonButton) {
        setSeason(Number(seasonButton.dataset.season));
        return;
      }
      const chapterButton = event.target.closest && event.target.closest(".realm-journey__chapter");
      if (chapterButton) {
        setChapter(Number(chapterButton.dataset.chapterIndex));
        return;
      }
      const marker = event.target.closest && event.target.closest(".realm-journey__marker");
      if (marker) {
        selectMarker(marker.dataset.markerId);
        return;
      }
      const navigationLink = event.target.closest && event.target.closest("[data-realm-navigate]");
      if (navigationLink && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        const selected = currentMarkers.find(item => item.id === selectedMarkerId);
        navigate(navigationLink.dataset.realmNavigate, { season: currentSeason, chapter: currentChapter().id, marker: selected || null });
        return;
      }
      if (event.target.closest && event.target.closest(".realm-journey__play")) {
        const view = viewFor(currentModel(), currentChapter());
        navigate(view.navigate, { season: currentSeason, chapter: currentChapter().id });
      }
    });

    listen(dom.seasonNav, "keydown", event => {
      // The rail is vertical on wide screens and horizontal on compact ones;
      // accepting both axes keeps the control predictable at either layout.
      moveAmongButtons(event, ".realm-journey__season", "both");
    });
    listen(dom.chapters, "keydown", event => {
      moveAmongButtons(event, ".realm-journey__chapter", "horizontal");
    });
    listen(dom.shell, "keydown", event => {
      if (event.key !== "Escape" || !selectedMarkerId) return;
      const markerId = selectedMarkerId;
      selectedMarkerId = null;
      updateMarkerSelection();
      const markerButtonNode = Array.from(dom.markers.querySelectorAll(".realm-journey__marker"))
        .find(button => button.dataset.markerId === markerId);
      if (markerButtonNode) markerButtonNode.focus({ preventScroll: true });
      announce("Marker details closed.");
    });

    function pointerCoordinates(event) {
      const bounds = dom.scene.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return [0, 0];
      return [
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        ((event.clientY - bounds.top) / bounds.height) * 2 - 1
      ];
    }

    listen(dom.scene, "pointerdown", event => {
      if (reducedMotion || event.button !== 0 || (event.target.closest && event.target.closest("button, a"))) return;
      pointerDown = true;
      dom.shell.classList.add("realm-journey--dragging");
      if (typeof dom.scene.setPointerCapture === "function") dom.scene.setPointerCapture(event.pointerId);
    });
    listen(dom.scene, "pointermove", event => {
      if (reducedMotion || !webgl) return;
      const coordinates = pointerCoordinates(event);
      webgl.setPointer(coordinates[0] * (pointerDown ? 1 : 0.62), -coordinates[1] * (pointerDown ? 1 : 0.5));
    });
    const endPointer = event => {
      if (!pointerDown) return;
      pointerDown = false;
      dom.shell.classList.remove("realm-journey--dragging");
      if (event.pointerId != null && typeof dom.scene.hasPointerCapture === "function" && dom.scene.hasPointerCapture(event.pointerId)) {
        dom.scene.releasePointerCapture(event.pointerId);
      }
    };
    listen(dom.scene, "pointerup", endPointer);
    listen(dom.scene, "pointercancel", endPointer);
    listen(dom.scene, "pointerleave", event => {
      endPointer(event);
      if (webgl) webgl.setPointer(0, 0);
    });

    function applyMotionPreference() {
      reducedMotion = Boolean(motionQuery && motionQuery.matches);
      dom.shell.classList.toggle("realm-journey--reduced-motion", reducedMotion);
      dom.hint.querySelector("span").textContent = reducedMotion
        ? "Use the season and chapter controls to travel through the story."
        : "Move the pointer to look around. Use the season and chapter controls to travel through the story.";
      if (webgl) webgl.setReducedMotion(reducedMotion);
    }

    if (motionQuery) {
      if (typeof motionQuery.addEventListener === "function") {
        listen(motionQuery, "change", applyMotionPreference);
      } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(applyMotionPreference);
        cleanup.push(() => motionQuery.removeListener(applyMotionPreference));
      }
    }

    const api = {
      setSeason(season) {
        setSeason(season);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        cleanup.splice(0).forEach(remove => remove());
        if (webgl) webgl.destroy();
        if (dom.shell.parentNode === rootElement) dom.shell.remove();
        if (mountedRoots.get(rootElement) === api) mountedRoots.delete(rootElement);
      }
    };

    mountedRoots.set(rootElement, api);
    applyMotionPreference();
    setSeason(initialSeason, { announce: false });
    return api;
  }

  global.RealmJourney = Object.freeze({ mount });
})(window, document);
