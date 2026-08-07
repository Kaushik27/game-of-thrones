// Shared battles/major-events database.
const battles = [
  {
    id: "battle-blackwater",
    name: "Battle of the Blackwater",
    season: "Season 2",
    location: "King's Landing",
    combatants: [
      { side: "House Lannister / House Tyrell", houses: ["Lannister", "Tyrell"], characters: ["tyrion-lannister", "cersei-lannister", "sandor-clegane"] },
      { side: "House Baratheon (Stannis)", houses: ["Baratheon"], characters: ["stannis-baratheon", "davos-seaworth", "matthos-seaworth"] }
    ],
    outcome: "Lannister/Tyrell victory. Tyrion's wildfire ambush devastates Stannis's fleet; Tywin and Loras Tyrell's relief force routs the remaining attackers.",
    casualties: "Most of Stannis's fleet and army destroyed; Matthos Seaworth killed.",
    linkedCharacters: ["tyrion-lannister", "stannis-baratheon", "davos-seaworth", "matthos-seaworth", "cersei-lannister", "sandor-clegane"],
    linkedEvents: ["ev-s2-blackwater"]
  },
  {
    id: "red-wedding",
    name: "The Red Wedding",
    season: "Season 3",
    location: "The Twins, Riverlands",
    combatants: [
      { side: "House Stark / House Tully", houses: ["Stark", "Tully"], characters: ["robb-stark", "catelyn-stark", "talisa-stark"] },
      { side: "House Frey / House Bolton", houses: ["Tully", "Stark"], characters: ["walder-frey", "roose-bolton"] }
    ],
    outcome: "Frey/Bolton massacre. Under guest right, Walder Frey and Roose Bolton ambush and slaughter the Stark host during a wedding feast.",
    casualties: "Robb Stark, Catelyn Stark, Talisa Stark, and most of the Northern army killed.",
    linkedCharacters: ["robb-stark", "catelyn-stark", "talisa-stark", "walder-frey", "roose-bolton", "arya-stark"],
    linkedEvents: ["ev-s3-redwedding"]
  },
  {
    id: "trial-mountain-viper",
    name: "Trial by Combat: The Mountain vs. The Red Viper",
    season: "Season 4",
    location: "King's Landing",
    combatants: [
      { side: "House Lannister (champion: Gregor Clegane)", houses: ["Lannister"], characters: ["gregor-clegane", "cersei-lannister"] },
      { side: "House Martell (champion: Oberyn Martell) for Tyrion", houses: ["Martell", "Lannister"], characters: ["oberyn-martell", "tyrion-lannister"] }
    ],
    outcome: "Gregor Clegane wins after a brutal fight, crushing Oberyn's skull; Tyrion is condemned to death (and later flees the city).",
    casualties: "Oberyn Martell killed.",
    linkedCharacters: ["gregor-clegane", "oberyn-martell", "tyrion-lannister", "ellaria-sand"],
    linkedEvents: ["ev-s4-mountain-viper"]
  },
  {
    id: "battle-hardhome",
    name: "Battle of Hardhome",
    season: "Season 5",
    location: "Hardhome, beyond the Wall",
    combatants: [
      { side: "Night's Watch / Free Folk", houses: ["Night's Watch", "Free Folk"], characters: ["jon-snow", "tormund-giantsbane", "karsi"] },
      { side: "The Army of the Dead", houses: ["Free Folk"], characters: ["the-night-king"] }
    ],
    outcome: "Crushing defeat for the living. The Night King's army overwhelms Hardhome; Jon Snow and a fraction of the wildlings barely escape by boat.",
    casualties: "Thousands of wildlings killed and raised as wights; Karsi killed.",
    linkedCharacters: ["jon-snow", "tormund-giantsbane", "karsi", "the-night-king"],
    linkedEvents: ["ev-s5-hardhome"]
  },
  {
    id: "battle-bastards",
    name: "Battle of the Bastards",
    season: "Season 6",
    location: "Winterfell",
    combatants: [
      { side: "House Stark / Free Folk / Knights of the Vale", houses: ["Stark", "Free Folk", "Arryn"], characters: ["jon-snow", "sansa-stark", "tormund-giantsbane", "yohn-royce"] },
      { side: "House Bolton", houses: ["Stark"], characters: ["ramsay-bolton", "smalljon-umber"] }
    ],
    outcome: "Stark victory. Jon's forces are nearly annihilated until Sansa's secret alliance with the Knights of the Vale arrives to crush the Bolton flank; Ramsay is fed to his own hounds.",
    casualties: "Smalljon Umber and Wun Wun killed; House Bolton wiped out.",
    linkedCharacters: ["jon-snow", "sansa-stark", "ramsay-bolton", "wun-wun", "smalljon-umber", "tormund-giantsbane"],
    linkedEvents: ["ev-s6-bastards"]
  },
  {
    id: "sept-of-baelor",
    name: "Destruction of the Great Sept of Baelor",
    season: "Season 6",
    location: "King's Landing",
    combatants: [
      { side: "House Lannister (Cersei)", houses: ["Lannister"], characters: ["cersei-lannister", "qyburn"] },
      { side: "The Faith Militant / House Tyrell", houses: ["Tyrell"], characters: ["high-sparrow", "margaery-tyrell", "loras-tyrell", "mace-tyrell"] }
    ],
    outcome: "Cersei detonates wildfire beneath the Sept during Loras and Cersei's trials, annihilating the Faith Militant leadership and House Tyrell's ruling line in one stroke.",
    casualties: "High Sparrow, Margaery Tyrell, Loras Tyrell, Mace Tyrell, Kevan Lannister, Lancel Lannister all killed.",
    linkedCharacters: ["cersei-lannister", "margaery-tyrell", "loras-tyrell", "mace-tyrell", "high-sparrow", "tommen-baratheon"],
    linkedEvents: ["ev-s6-sept-explosion"]
  },
  {
    id: "loot-train",
    name: "The Loot Train Battle",
    season: "Season 7",
    location: "The Roseroad, Reach",
    combatants: [
      { side: "House Targaryen (Dothraki)", houses: ["Targaryen"], characters: ["daenerys-targaryen"] },
      { side: "House Lannister", houses: ["Lannister"], characters: ["jaime-lannister", "bronn", "randyll-tarly"] }
    ],
    outcome: "Targaryen victory. Drogon and the Dothraki bloodriders annihilate the Lannister supply train; Jaime nearly dies charging Daenerys before Bronn pulls him from the river.",
    casualties: "Heavy Lannister losses; Randyll Tarly's forces routed.",
    linkedCharacters: ["daenerys-targaryen", "jaime-lannister", "bronn"],
    linkedEvents: ["ev-s7-loot-castamere"]
  },
  {
    id: "battle-winterfell",
    name: "Battle of Winterfell (The Long Night)",
    season: "Season 8",
    location: "Winterfell",
    combatants: [
      { side: "The Living: House Stark, House Targaryen, Free Folk, Night's Watch", houses: ["Stark", "Targaryen", "Free Folk", "Night's Watch"], characters: ["jon-snow", "daenerys-targaryen", "arya-stark", "theon-greyjoy", "jorah-mormont", "lyanna-mormont"] },
      { side: "The Army of the Dead", houses: ["Free Folk"], characters: ["the-night-king"] }
    ],
    outcome: "Victory for the living. After catastrophic losses, Arya Stark assassinates the Night King with a Valyrian steel dagger, instantly destroying the entire army of the dead.",
    casualties: "Jorah Mormont, Theon Greyjoy, Lyanna Mormont, Edd Tollett, Beric Dondarrion, Melisandre (later) among the dead.",
    linkedCharacters: ["arya-stark", "the-night-king", "jon-snow", "theon-greyjoy", "jorah-mormont", "lyanna-mormont", "daenerys-targaryen"],
    linkedEvents: ["ev-s8-winterfell"]
  },
  {
    id: "battle-kings-landing",
    name: "Battle of King's Landing",
    season: "Season 8",
    location: "King's Landing",
    combatants: [
      { side: "House Targaryen", houses: ["Targaryen"], characters: ["daenerys-targaryen", "grey-worm", "missandei"] },
      { side: "House Lannister / Iron Fleet (Euron)", houses: ["Lannister", "Greyjoy"], characters: ["cersei-lannister", "jaime-lannister", "euron-greyjoy"] }
    ],
    outcome: "Targaryen military victory, but a moral catastrophe. Euron's scorpions cripple Daenerys's fleet first, but after the city surrenders she burns King's Landing to the ground regardless.",
    casualties: "Missandei executed beforehand; tens of thousands of civilians killed; Cersei and Jaime Lannister die together beneath the Red Keep; Euron Greyjoy killed by Jaime.",
    linkedCharacters: ["daenerys-targaryen", "cersei-lannister", "jaime-lannister", "euron-greyjoy", "missandei", "jon-snow"],
    linkedEvents: ["ev-s8-kingslanding", "ev-s8-cersei-jaime-death"]
  }
];
