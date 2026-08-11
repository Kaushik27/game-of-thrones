/*
 * The Realm Chronicle — a fan-curated chronology that sits before the
 * broadcast episode index. Dates are approximate where the television canon
 * intentionally leaves the history soft; the cards explain the moment rather
 * than pretending every year is settled.
 */
(function exposeRealmChronicle(global) {
  "use strict";

  const records = [
    {
      id: "long-night",
      era: "Before the Iron Throne",
      period: "c. 8,000 BC",
      title: "The Long Night",
      marker: "The cold returns",
      type: "dawn",
      image: "assets/ui/north-journey-bg.jpg",
      imagePosition: "center 28%",
      bullets: ["The dead march south", "The first alliance is forged"],
      summary: "Night falls for a generation. The living learn that survival is a pact, not a victory.",
      route: "#/map"
    },
    {
      id: "pact-at-isle-of-faces",
      era: "Before the Iron Throne",
      period: "c. 6,000 BC",
      title: "The Pact",
      marker: "Old gods, older promises",
      type: "dawn",
      image: "assets/ui/war-table-stone.jpg",
      imagePosition: "center 56%",
      bullets: ["Children of the Forest and men agree", "The isle becomes a memory"],
      summary: "The first peace in Westeros is signed in the shadow of trees that remember everything.",
      route: "#/lore?entry=old-gods"
    },
    {
      id: "doom-of-valyria",
      era: "The Dragon Age",
      period: "c. 114 BC",
      title: "The Doom of Valyria",
      marker: "Fire consumes its makers",
      type: "dragon",
      image: "assets/ui/essos-journey-bg.jpg",
      imagePosition: "center 42%",
      bullets: ["The Freehold breaks", "One family survives on Dragonstone"],
      summary: "An empire of flame disappears in a single day, leaving one bloodline with a claim and a warning.",
      route: "#/chronicle?entry=doom-of-valyria"
    },
    {
      id: "aegon-conquest",
      era: "The Dragon Age",
      period: "1–2 AC",
      title: "Aegon’s Conquest",
      marker: "Six kingdoms become one",
      type: "conquest",
      image: "assets/ui/capital-journey-bg.jpg",
      imagePosition: "center 38%",
      bullets: ["The Blackwater is chosen", "The Iron Throne is forged"],
      summary: "Aegon arrives with two sisters, three dragons, and a new shape for power in Westeros.",
      route: "#/map"
    },
    {
      id: "dance-of-dragons",
      era: "The Dragon Age",
      period: "129–131 AC",
      title: "The Dance of the Dragons",
      marker: "Dragon fights dragon",
      type: "dragon",
      image: "assets/ui/essos-journey-bg.jpg",
      imagePosition: "center 35%",
      bullets: ["Family turns on family", "The dragons are nearly gone"],
      summary: "A succession dispute burns through the Targaryen family and leaves the realm afraid of its own sky.",
      route: "#/chronicle?entry=dance-of-dragons"
    },
    {
      id: "aegon-the-fifth",
      era: "The Dragon Age",
      period: "233–259 AC",
      title: "The Reign of Aegon V",
      marker: "Egg becomes king",
      type: "crown",
      image: "assets/ui/capital-journey-bg.jpg",
      imagePosition: "center 62%",
      bullets: ["Reform meets resistance", "The smallfolk enter the story"],
      summary: "A king who remembers hunger tries to make the crown answer to ordinary lives.",
      route: "#/chronicle?entry=aegon-the-fifth"
    },
    {
      id: "summerhall",
      era: "The Dragon Age",
      period: "259 AC",
      title: "Summerhall",
      marker: "A fire, a birth, a silence",
      type: "fire",
      image: "assets/ui/memory-hold-door.png",
      imagePosition: "center 44%",
      bullets: ["Aegon V dies in the flames", "Rhaegar is born the same day"],
      summary: "The dynasty loses a king and gains a child beneath the smoke of a failed resurrection.",
      route: "#/chronicle?entry=summerhall"
    },
    {
      id: "roberts-rebellion",
      era: "The Fall of the Dragon",
      period: "282–283 AC",
      title: "Robert’s Rebellion",
      marker: "The old order breaks",
      type: "war",
      image: "assets/ui/capital-journey-bg.jpg",
      imagePosition: "center 30%",
      bullets: ["Rhaegar disappears with Lyanna", "The Mad King falls"],
      summary: "A promise, a war, and a tower in the north redraw the map before the story begins.",
      route: "#/chronicle?entry=roberts-rebellion"
    },
    {
      id: "greyjoy-rebellion",
      era: "The Fall of the Dragon",
      period: "289 AC",
      title: "The Greyjoy Rebellion",
      marker: "The kraken rises",
      type: "war",
      image: "assets/ui/north-journey-bg.jpg",
      imagePosition: "center 70%",
      bullets: ["Balon crowns himself", "Theon is taken to Winterfell"],
      summary: "A child becomes a hostage, a father becomes an enemy, and the sea keeps its own counsel.",
      route: "#/chronicle?entry=greyjoy-rebellion"
    },
    {
      id: "war-of-five-kings",
      era: "The War of Five Kings",
      period: "298 AC",
      title: "The War of Five Kings",
      season: 1,
      marker: "The realm fractures",
      type: "war",
      image: "assets/ui/war-table-stone.jpg",
      imagePosition: "center 50%",
      bullets: ["The hand’s death opens the board", "Every crown spends lives"],
      summary: "One murder becomes five claims, and every road in Westeros starts leading to a battlefield.",
      route: "#/timeline?atlas=1&season=1"
    },
    {
      id: "red-wedding",
      era: "The War of Five Kings",
      period: "300 AC · Season 3",
      title: "The Red Wedding",
      season: 3,
      marker: "The doors close",
      type: "betrayal",
      image: "assets/ui/memory-red-doors.png",
      imagePosition: "center 42%",
      bullets: ["Guest right is broken", "The North loses its king"],
      summary: "A wedding feast turns into the scene fans still warn each other about before pressing play.",
      route: "#/battles?battle=red-wedding"
    },
    {
      id: "hardhome",
      era: "The War for the Dawn",
      period: "303 AC · Season 5",
      title: "Hardhome",
      season: 5,
      marker: "The dead are learning",
      type: "dawn",
      image: "assets/ui/north-journey-bg.jpg",
      imagePosition: "center 30%",
      bullets: ["Jon sees the army of the dead", "The Night King raises the fallen"],
      summary: "The threat stops being a story told at the edge of a map and becomes a wall of blue eyes.",
      route: "#/timeline?atlas=1&season=5&episode=s05e08"
    },
    {
      id: "battle-of-bastards",
      era: "The War for the Dawn",
      period: "304 AC · Season 6",
      title: "The Battle of the Bastards",
      season: 6,
      marker: "The North remembers",
      type: "war",
      image: "assets/ui/memory-ice-sword.png",
      imagePosition: "center 46%",
      bullets: ["Winterfell is reclaimed", "Sansa chooses the end of fear"],
      summary: "A field of snow becomes a reckoning for the Starks, the Boltons, and everyone who waited too long.",
      route: "#/battles?battle=battle-bastards"
    },
    {
      id: "long-night-ends",
      era: "The War for the Dawn",
      period: "305 AC · Season 8",
      title: "The Long Night Ends",
      season: 8,
      marker: "The dawn arrives",
      type: "dawn",
      image: "assets/ui/north-journey-bg.jpg",
      imagePosition: "center 25%",
      bullets: ["The dead fall at Winterfell", "Arya makes the impossible move"],
      summary: "The oldest war in the world ends in a breath, a blade, and a choice no prophecy managed to name.",
      route: "#/battles?battle=battle-winterfell"
    },
    {
      id: "iron-throne-falls",
      era: "The New Realm",
      period: "305 AC · Season 8",
      title: "The Iron Throne Falls",
      season: 8,
      marker: "No more crowns of metal",
      type: "crown",
      image: "assets/ui/memory-trial-candle.png",
      imagePosition: "center 58%",
      bullets: ["King’s Landing burns", "The throne is melted down"],
      summary: "After generations of people fighting for the chair, the chair is the thing that cannot survive.",
      route: "#/timeline?atlas=1&season=8&episode=s08e06"
    }
  ];

  global.REALM_CHRONICLE = Object.freeze(records.map(record => Object.freeze({
    ...record,
    bullets: Object.freeze(record.bullets.slice())
  })));
})(window);
