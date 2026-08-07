// Curated season chapters for the immersive Realm Journey.
// Summaries are original editorial copy. Source links point to HBO's episode
// guides so the journey remains grounded in the television canon.
(function exposeRealmChapters(global) {
  "use strict";

  const ICONS = {
    person: "assets/icons/person.svg",
    castle: "assets/icons/castle.svg",
    battle: "assets/icons/swords.svg",
    winter: "assets/icons/snowflake.svg",
    play: "assets/icons/play.svg",
    compass: "assets/icons/compass.svg"
  };

  global.REALM_CHAPTERS = Object.freeze([
    {
      season: 1,
      kicker: "Season 1 · Fire and Blood",
      title: "Born in Fire",
      summary: "Across the Narrow Sea, a frightened exile steps into the flames and emerges as a power the world can no longer ignore.",
      copy: [
        "Daenerys enters the pyre after losing the life she had built among the Dothraki.",
        "At dawn, three dragons announce that old magic has returned."
      ],
      playLabel: "Play the birth of dragons",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-1/10-fire-and-blood",
      background: "assets/ui/essos-journey-bg.jpg",
      accent: "#d77a45",
      camera: { position: [0, 7.4, 11.8], target: [0, -0.5, 0] },
      terrain: { seed: 11, snow: 0.05, fortress: 0.15 },
      chapters: [
        { id: "winterfell", title: "Winter Is Coming", icon: ICONS.winter, markerIds: ["ned", "winterfell"] },
        { id: "the-hand", title: "The Hand Falls", icon: ICONS.person, markerIds: ["ned", "kings-landing"] },
        { id: "fire-and-blood", title: "Born in Fire", icon: ICONS.play, markerIds: ["daenerys", "pyre"] }
      ],
      markers: [
        { id: "daenerys", type: "character", label: "Daenerys Targaryen", characterId: "daenerys-targaryen", x: 58, y: 45, world: [0.5, 1.1, 0], detail: "The last Targaryen princess becomes the Mother of Dragons.", navigate: "#/character/daenerys-targaryen" },
        { id: "drogo", type: "character", label: "Khal Drogo", characterId: "khal-drogo", x: 73, y: 30, world: [3.8, 0.4, -2], detail: "The khal whose death closes one life and begins another.", navigate: "#/character/khal-drogo" },
        { id: "pyre", type: "battle", label: "The Funeral Pyre", icon: ICONS.play, x: 69, y: 69, world: [3, 0, 4], detail: "The night dragons return to the known world.", sourceUrl: "https://www.hbo.com/game-of-thrones/season-1/10-fire-and-blood" },
        { id: "winterfell", type: "place", label: "Winterfell", icon: ICONS.castle, x: 36, y: 28, world: [-4, 0.8, -2], detail: "The Stark family home where the story begins." },
        { id: "ned", type: "character", label: "Eddard Stark", characterId: "ned-stark", x: 28, y: 56, world: [-5, 0.5, 1.6], detail: "The Hand whose honor collides with the capital.", navigate: "#/character/ned-stark" },
        { id: "kings-landing", type: "place", label: "King's Landing", icon: ICONS.castle, x: 43, y: 72, world: [-1.6, 0, 4.8], detail: "The capital and center of the succession crisis." }
      ]
    },
    {
      season: 2,
      kicker: "Season 2 · The War of Five Kings",
      title: "Blackwater Burns",
      summary: "The war reaches the capital as Stannis Baratheon's fleet enters Blackwater Bay and Tyrion answers with wildfire.",
      copy: [
        "The battle turns the harbor into an inferno and forces every claimant to reveal the limits of their power.",
        "Inside the walls, survival depends on courage, deception, and a last-minute alliance."
      ],
      playLabel: "Play the Battle of Blackwater",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-2/9-blackwater",
      background: "assets/ui/capital-journey-bg.jpg",
      accent: "#8abf64",
      camera: { position: [1.5, 6.5, 11.2], target: [0, -0.8, 0] },
      terrain: { seed: 22, snow: 0, fortress: 0.75 },
      chapters: [
        { id: "five-kings", title: "Five Kings", icon: ICONS.compass, markerIds: ["stannis", "tyrion"] },
        { id: "blackwater", title: "Blackwater", icon: ICONS.battle, markerIds: ["tyrion", "stannis", "bay"] },
        { id: "north-road", title: "The North Road", icon: ICONS.castle, markerIds: ["arya", "harrenhal"] }
      ],
      markers: [
        { id: "tyrion", type: "character", label: "Tyrion Lannister", characterId: "tyrion-lannister", x: 61, y: 43, world: [1, 1, 0], detail: "The acting Hand who turns wildfire into a weapon.", navigate: "#/character/tyrion-lannister" },
        { id: "stannis", type: "character", label: "Stannis Baratheon", characterId: "stannis-baratheon", x: 76, y: 29, world: [4.5, 0.5, -2], detail: "The claimant who brings his fleet to the capital.", navigate: "#/character/stannis-baratheon" },
        { id: "bay", type: "battle", label: "Battle of Blackwater", battleId: "battle-of-the-blackwater", icon: ICONS.battle, x: 73, y: 72, world: [3.6, 0, 4.3], detail: "Wildfire, chain, steel, and a city on the edge.", navigate: "#/battles" },
        { id: "arya", type: "character", label: "Arya Stark", characterId: "arya-stark", x: 36, y: 35, world: [-3.7, 0.6, -1.4], detail: "A captive learning the names and faces of power.", navigate: "#/character/arya-stark" },
        { id: "harrenhal", type: "place", label: "Harrenhal", icon: ICONS.castle, x: 44, y: 65, world: [-1.5, 0, 3.4], detail: "A ruined fortress reshaped by occupation." }
      ]
    },
    {
      season: 3,
      kicker: "Season 3 · The Rains of Castamere",
      title: "The Red Wedding",
      summary: "At the Twins, a marriage feast becomes the realm's most devastating betrayal and the map of power changes in a single night.",
      copy: [
        "Old grievances and broken promises converge beneath Walder Frey's roof.",
        "The Northern campaign ends not on a battlefield, but at a table."
      ],
      playLabel: "Play the fall of the North",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-3/9-the-rains-of-castamere",
      background: "assets/ui/north-journey-bg.jpg",
      accent: "#a94b45",
      camera: { position: [-1.2, 7, 11], target: [0, -0.5, 0] },
      terrain: { seed: 33, snow: 0.24, fortress: 0.45 },
      chapters: [
        { id: "the-climb", title: "The Climb", icon: ICONS.compass, markerIds: ["jon", "wall"] },
        { id: "red-wedding", title: "The Red Wedding", icon: ICONS.battle, markerIds: ["robb", "catelyn", "twins"] },
        { id: "mhysa", title: "Mhysa", icon: ICONS.person, markerIds: ["daenerys", "yunkai"] }
      ],
      markers: [
        { id: "robb", type: "character", label: "Robb Stark", characterId: "robb-stark", x: 54, y: 46, world: [0, 1, 0], detail: "The King in the North walks into a trap.", navigate: "#/character/robb-stark" },
        { id: "catelyn", type: "character", label: "Catelyn Stark", characterId: "catelyn-stark", x: 68, y: 31, world: [3.4, 0.5, -2], detail: "A mother who recognizes the danger a moment too late.", navigate: "#/character/catelyn-stark" },
        { id: "twins", type: "place", label: "The Twins", icon: ICONS.castle, x: 75, y: 67, world: [4.2, 0, 3.8], detail: "The Frey crossing and the scene of the betrayal." },
        { id: "jon", type: "character", label: "Jon Snow", characterId: "jon-snow", x: 34, y: 29, world: [-4.2, 0.8, -2.4], detail: "A sworn brother divided between duty and love.", navigate: "#/character/jon-snow" },
        { id: "wall", type: "place", label: "The Wall", icon: ICONS.winter, x: 23, y: 54, world: [-5, 0.2, 1.2], detail: "The impossible border climbed by the wildlings." },
        { id: "daenerys", type: "character", label: "Daenerys Targaryen", characterId: "daenerys-targaryen", x: 43, y: 74, world: [-1.8, 0, 5], detail: "A liberator acclaimed outside Yunkai.", navigate: "#/character/daenerys-targaryen" },
        { id: "yunkai", type: "place", label: "Yunkai", icon: ICONS.castle, x: 31, y: 69, world: [-4, 0, 4], detail: "The Yellow City and the next step in Daenerys's campaign." }
      ]
    },
    {
      season: 4,
      kicker: "Season 4 · Trial by Combat",
      title: "Viper vs. Mountain",
      summary: "Tyrion's fate is reduced to a duel as Oberyn Martell turns a royal trial into a personal reckoning with Gregor Clegane.",
      copy: [
        "The arena offers justice, vengeance, and spectacle in equal measure.",
        "One moment of certainty becomes one of the story's most brutal reversals."
      ],
      playLabel: "Play the trial by combat",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-4/8-the-mountain-and-the-viper",
      background: "assets/ui/capital-journey-bg.jpg",
      accent: "#d18a45",
      camera: { position: [0.8, 6.2, 10.7], target: [0, -0.5, 0] },
      terrain: { seed: 44, snow: 0.02, fortress: 0.7 },
      chapters: [
        { id: "purple-wedding", title: "The Purple Wedding", icon: ICONS.person, markerIds: ["joffrey", "margaery"] },
        { id: "trial", title: "Viper vs. Mountain", icon: ICONS.battle, markerIds: ["oberyn", "gregor", "arena"] },
        { id: "children", title: "The Children", icon: ICONS.compass, markerIds: ["bran", "tree"] }
      ],
      markers: [
        { id: "oberyn", type: "character", label: "Oberyn Martell", characterId: "oberyn-martell", x: 47, y: 40, world: [-1, 1, -0.3], detail: "The Red Viper fights for Tyrion and for his sister.", navigate: "#/character/oberyn-martell" },
        { id: "gregor", type: "character", label: "Gregor Clegane", characterId: "gregor-clegane", x: 69, y: 29, world: [3.5, 0.6, -2], detail: "The Mountain stands for the Crown.", navigate: "#/character/gregor-clegane" },
        { id: "arena", type: "battle", label: "Trial by Combat", icon: ICONS.battle, x: 71, y: 67, world: [3.8, 0, 3.8], detail: "A duel that decides Tyrion's sentence." },
        { id: "tyrion", type: "character", label: "Tyrion Lannister", characterId: "tyrion-lannister", x: 30, y: 58, world: [-4.5, 0.2, 1.5], detail: "The accused watches another man carry his fate.", navigate: "#/character/tyrion-lannister" },
        { id: "joffrey", type: "character", label: "Joffrey Baratheon", characterId: "joffrey-baratheon", x: 35, y: 25, world: [-3.3, 0.7, -2.6], detail: "A royal wedding becomes a murder scene.", navigate: "#/character/joffrey-baratheon" },
        { id: "margaery", type: "character", label: "Margaery Tyrell", characterId: "margaery-tyrell", x: 23, y: 39, world: [-5, 0.4, -0.5], detail: "A queen crowned and widowed in the same feast.", navigate: "#/character/margaery-tyrell" },
        { id: "bran", type: "character", label: "Bran Stark", characterId: "bran-stark", x: 46, y: 75, world: [-1.2, 0, 5], detail: "A seeker reaching the cave beneath the weirwood.", navigate: "#/character/bran-stark" },
        { id: "tree", type: "place", label: "The Weirwood Cave", icon: ICONS.winter, x: 58, y: 73, world: [1.2, 0, 4.8], detail: "A hidden threshold into the realm's memory." }
      ]
    },
    {
      season: 5,
      kicker: "Season 5 · The Army of the Dead",
      title: "Hardhome",
      summary: "Jon Snow's rescue mission becomes a catastrophe when the dead descend on the wildling settlement beyond the Wall.",
      copy: [
        "The political war suddenly feels small beside an enemy that can turn every casualty into a soldier.",
        "Across the water, the Night King raises the fallen."
      ],
      playLabel: "Play the fall of Hardhome",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-5/8-hardhome",
      background: "assets/ui/north-journey-bg.jpg",
      accent: "#83b8c8",
      camera: { position: [-0.8, 7.8, 12.4], target: [0, -0.6, 0] },
      terrain: { seed: 55, snow: 0.88, fortress: 0.1 },
      chapters: [
        { id: "sons", title: "Sons of the Harpy", icon: ICONS.battle, markerIds: ["daenerys", "meereen"] },
        { id: "hardhome", title: "Hardhome", icon: ICONS.winter, markerIds: ["jon", "night-king", "hardhome"] },
        { id: "mercy", title: "Mother's Mercy", icon: ICONS.person, markerIds: ["cersei", "kings-landing"] }
      ],
      markers: [
        { id: "jon", type: "character", label: "Jon Snow", characterId: "jon-snow", x: 50, y: 44, world: [0, 1, 0], detail: "The Lord Commander who sees the true scale of the dead.", navigate: "#/character/jon-snow" },
        { id: "tormund", type: "character", label: "Tormund Giantsbane", characterId: "tormund-giantsbane", x: 34, y: 31, world: [-3.6, 0.6, -2], detail: "The wildling leader trying to bring his people south.", navigate: "#/character/tormund-giantsbane" },
        { id: "night-king", type: "character", label: "The Night King", characterId: "the-night-king", x: 70, y: 27, world: [4, 0.8, -2.4], detail: "The commander who turns defeat into recruitment.", navigate: "#/character/the-night-king" },
        { id: "hardhome", type: "battle", label: "Massacre at Hardhome", battleId: "massacre-at-hardhome", icon: ICONS.winter, x: 72, y: 69, world: [4, 0, 4], detail: "A rescue collapses beneath an army that does not tire.", navigate: "#/battles" },
        { id: "daenerys", type: "character", label: "Daenerys Targaryen", characterId: "daenerys-targaryen", x: 26, y: 62, world: [-4.7, 0.2, 2.6], detail: "A queen holding an uneasy city.", navigate: "#/character/daenerys-targaryen" },
        { id: "meereen", type: "place", label: "Meereen", icon: ICONS.castle, x: 18, y: 76, world: [-5.5, 0, 5], detail: "The city where liberation becomes governance." },
        { id: "cersei", type: "character", label: "Cersei Lannister", characterId: "cersei-lannister", x: 41, y: 72, world: [-2, 0, 4.6], detail: "A queen stripped of power and dignity.", navigate: "#/character/cersei-lannister" },
        { id: "kings-landing", type: "place", label: "King's Landing", icon: ICONS.castle, x: 55, y: 76, world: [0.7, 0, 5], detail: "The capital that watches Cersei's walk." }
      ]
    },
    {
      season: 6,
      kicker: "Season 6 · The War for the North",
      title: "The North Remembers",
      summary: "Jon Snow rallies the free folk and marches on Winterfell to take back his home from Ramsay Bolton.",
      copy: [
        "In the North, loyalty is tested and bastards may become kings.",
        "Every route on the field narrows toward Winterfell."
      ],
      playLabel: "Play this chapter",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-6/9-battle-of-the-bastards",
      background: "assets/ui/north-journey-bg.jpg",
      accent: "#94bed9",
      camera: { position: [0, 7.2, 11.6], target: [0, -0.4, 0] },
      terrain: { seed: 66, snow: 0.76, fortress: 1 },
      defaultChapter: "bastards",
      chapters: [
        { id: "hardhome-memory", title: "Hardhome", icon: ICONS.winter, markerIds: ["jon", "tormund"] },
        { id: "bastards", title: "Battle of the Bastards", icon: ICONS.battle, markerIds: ["jon", "sansa", "ramsay", "winterfell", "battle"] },
        { id: "winter-comes", title: "Winter Comes", icon: ICONS.winter, markerIds: ["sansa", "winterfell"] }
      ],
      markers: [
        { id: "sansa", type: "character", label: "Sansa Stark", characterId: "sansa-stark", x: 38, y: 23, world: [-3, 1, -2], detail: "The Stark heir who understands Ramsay and secures the decisive alliance.", navigate: "#/character/sansa-stark" },
        { id: "ramsay", type: "character", label: "Ramsay Bolton", characterId: "ramsay-bolton", x: 69, y: 18, world: [3.2, 1.4, -2.7], detail: "The Bolton lord defending his hold on Winterfell.", navigate: "#/character/ramsay-bolton" },
        { id: "jon", type: "character", label: "Jon Snow", characterId: "jon-snow", x: 50, y: 47, world: [0, 1, 0], detail: "The commander at the center of the fight for the North.", navigate: "#/character/jon-snow" },
        { id: "tormund", type: "character", label: "Tormund Giantsbane", characterId: "tormund-giantsbane", x: 29, y: 52, world: [-4.4, 0.5, 0.8], detail: "The free folk's field commander and Jon's ally.", navigate: "#/character/tormund-giantsbane" },
        { id: "winterfell", type: "place", label: "Winterfell", icon: ICONS.castle, x: 78, y: 40, world: [4.8, 0.4, -0.5], detail: "The ancestral Stark seat and prize of the campaign." },
        { id: "battle", type: "battle", label: "Battle of the Bastards", battleId: "battle-of-the-bastards", icon: ICONS.battle, x: 72, y: 70, world: [3.6, 0, 4.2], detail: "A collision of Stark loyalists, free folk, Bolton forces, and the Knights of the Vale.", navigate: "#/battles" }
      ]
    },
    {
      season: 7,
      kicker: "Season 7 · Fire on the Roseroad",
      title: "The Loot Train Attack",
      summary: "Daenerys finally brings dragonfire to a Westerosi battlefield, overwhelming the Lannister column on the Roseroad.",
      copy: [
        "For the first time, the realm experiences the full force that crossed the Narrow Sea.",
        "Jaime rides toward an enemy no knight can meet on equal terms."
      ],
      playLabel: "Play the dragon attack",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-7/4-the-spoils-of-war",
      background: "assets/ui/capital-journey-bg.jpg",
      accent: "#dc7842",
      camera: { position: [1.2, 6.6, 11.5], target: [0, -0.7, 0] },
      terrain: { seed: 77, snow: 0.06, fortress: 0.3 },
      chapters: [
        { id: "dragonstone", title: "Dragonstone", icon: ICONS.castle, markerIds: ["daenerys", "dragonstone"] },
        { id: "spoils", title: "The Spoils of War", icon: ICONS.battle, markerIds: ["daenerys", "jaime", "roseroad"] },
        { id: "beyond-wall", title: "Beyond the Wall", icon: ICONS.winter, markerIds: ["jon", "frozen-lake"] }
      ],
      markers: [
        { id: "daenerys", type: "character", label: "Daenerys Targaryen", characterId: "daenerys-targaryen", x: 53, y: 40, world: [0, 1.3, -0.4], detail: "The dragon queen enters the war in person.", navigate: "#/character/daenerys-targaryen" },
        { id: "jaime", type: "character", label: "Jaime Lannister", characterId: "jaime-lannister", x: 70, y: 27, world: [3.8, 0.6, -2.3], detail: "A commander watching conventional warfare collapse.", navigate: "#/character/jaime-lannister" },
        { id: "bronn", type: "character", label: "Bronn", characterId: "bronn", x: 76, y: 52, world: [4.8, 0.3, 1], detail: "The sellsword who reaches the scorpion.", navigate: "#/character/bronn" },
        { id: "roseroad", type: "battle", label: "Loot Train Attack", battleId: "loot-train-attack", icon: ICONS.battle, x: 66, y: 72, world: [3, 0, 4.5], detail: "Dragonfire tears through the returning Lannister army.", navigate: "#/battles" },
        { id: "jon", type: "character", label: "Jon Snow", characterId: "jon-snow", x: 30, y: 31, world: [-4.3, 0.7, -2], detail: "A king seeking proof of the dead.", navigate: "#/character/jon-snow" },
        { id: "frozen-lake", type: "place", label: "Frozen Lake", icon: ICONS.winter, x: 24, y: 63, world: [-5, 0, 3], detail: "A trap beyond the Wall." },
        { id: "dragonstone", type: "place", label: "Dragonstone", icon: ICONS.castle, x: 42, y: 72, world: [-2.2, 0, 4.6], detail: "The Targaryen stronghold and base of the invasion." }
      ]
    },
    {
      season: 8,
      kicker: "Season 8 · The Long Night",
      title: "The Dead at Winterfell",
      summary: "The supernatural war reaches its final defensive stand as the living gather at Winterfell beneath an endless night.",
      copy: [
        "Old rivals share the same walls because dawn now matters more than crowns.",
        "Every northern story converges in darkness."
      ],
      playLabel: "Play the Long Night",
      sourceUrl: "https://www.hbo.com/game-of-thrones/season-8/3-the-long-night",
      background: "assets/ui/north-journey-bg.jpg",
      accent: "#82a8c2",
      camera: { position: [0, 8, 12.8], target: [0, -0.6, 0] },
      terrain: { seed: 88, snow: 1, fortress: 1 },
      chapters: [
        { id: "knight", title: "A Knight of Seven Kingdoms", icon: ICONS.person, markerIds: ["brienne", "winterfell"] },
        { id: "long-night", title: "The Long Night", icon: ICONS.winter, markerIds: ["arya", "jon", "night-king", "winterfell"] },
        { id: "iron-throne", title: "The Iron Throne", icon: ICONS.compass, markerIds: ["daenerys", "kings-landing"] }
      ],
      markers: [
        { id: "arya", type: "character", label: "Arya Stark", characterId: "arya-stark", x: 54, y: 44, world: [0, 1, 0], detail: "The assassin moving through the darkness beneath Winterfell.", navigate: "#/character/arya-stark" },
        { id: "jon", type: "character", label: "Jon Snow", characterId: "jon-snow", x: 37, y: 28, world: [-3.3, 0.9, -2.2], detail: "A commander facing the enemy he warned the realm about.", navigate: "#/character/jon-snow" },
        { id: "night-king", type: "character", label: "The Night King", characterId: "the-night-king", x: 71, y: 25, world: [3.8, 1, -2.5], detail: "The leader of the dead arrives for the Three-Eyed Raven.", navigate: "#/character/the-night-king" },
        { id: "winterfell", type: "place", label: "Winterfell", icon: ICONS.castle, x: 78, y: 45, world: [4.9, 0.4, 0], detail: "The last great fortress between the dead and the South." },
        { id: "battle", type: "battle", label: "Battle of Winterfell", battleId: "battle-of-winterfell", icon: ICONS.winter, x: 69, y: 72, world: [3.4, 0, 4.5], detail: "The armies of the living meet the dead.", navigate: "#/battles" },
        { id: "brienne", type: "character", label: "Brienne of Tarth", characterId: "brienne-of-tarth", x: 24, y: 58, world: [-5, 0.2, 1.8], detail: "A knight before the night begins.", navigate: "#/character/brienne-of-tarth" },
        { id: "daenerys", type: "character", label: "Daenerys Targaryen", characterId: "daenerys-targaryen", x: 39, y: 75, world: [-2.8, 0, 5], detail: "A liberator whose final campaign consumes the capital.", navigate: "#/character/daenerys-targaryen" },
        { id: "kings-landing", type: "place", label: "King's Landing", icon: ICONS.castle, x: 53, y: 76, world: [0, 0, 5], detail: "The city at the end of the road." }
      ]
    }
  ]);

  global.REALM_JOURNEY_ICONS = Object.freeze(ICONS);
})(window);
