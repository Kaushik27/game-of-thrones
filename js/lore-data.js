// TV-canon lore dossiers for the Living Lore Library.
//
// The copy is original editorial synthesis. Source links point to HBO's
// episode guides so the library can remain a fully local experience while
// still making its canon trail inspectable when a reader chooses to leave it.

const LORE_CATEGORIES = Object.freeze([
  Object.freeze({ id: "politics-succession", label: "Politics & Succession", shortLabel: "Politics", iconAsset: "assets/icons/castle.svg" }),
  Object.freeze({ id: "houses-factions", label: "Houses & Factions", shortLabel: "Houses", iconAsset: "assets/icons/person.svg" }),
  Object.freeze({ id: "religions", label: "Religions", shortLabel: "Faiths", iconAsset: "assets/icons/compass.svg" }),
  Object.freeze({ id: "creatures-magic", label: "Creatures & Magic", shortLabel: "Magic", iconAsset: "assets/icons/snowflake.svg" }),
  Object.freeze({ id: "weapons-artifacts", label: "Weapons & Artifacts", shortLabel: "Artifacts", iconAsset: "assets/icons/swords.svg" }),
  Object.freeze({ id: "prophecies", label: "Prophecies & Visions", shortLabel: "Prophecy", iconAsset: "assets/icons/play.svg" })
]);

const LORE_ENTRIES = Object.freeze([
  {
    id: "iron-throne",
    title: "The Iron Throne",
    category: "politics-succession",
    deck: "A royal seat, a weapon of memory, and the object that turns private ambitions into a continental war.",
    body: [
      "The Iron Throne is the seat from which the Targaryen dynasty joined most of Westeros under one crown. By the opening of the series, its meaning has outgrown the chair itself: whoever occupies it can command the institutions, taxes, armies, and symbols of the realm, but only while enough powerful houses accept the claim.",
      "Robert's death exposes how fragile that acceptance is. Joffrey, Stannis, Renly, Daenerys, Cersei, and Jon each represent a different theory of rule—inheritance, conquest, popular backing, or revealed identity. Drogon finally destroys the throne after Daenerys dies, ending the physical prize even as the work of governing continues."
    ],
    relatedCharacterIds: ["robert-baratheon", "joffrey-baratheon", "stannis-baratheon", "cersei-lannister", "daenerys-targaryen", "jon-snow", "bran-stark"],
    relatedHouses: ["Baratheon", "Lannister", "Targaryen", "Stark"],
    seasons: [1, 2, 6, 7, 8],
    iconAsset: "assets/icons/castle.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/7-you-win-or-you-die", "https://www.hbo.com/game-of-thrones/season-8/6-the-iron-throne"],
    featured: true
  },
  {
    id: "claims-to-the-crown",
    title: "Claims to the Crown",
    category: "politics-succession",
    deck: "Blood, law, conquest, and political recognition rarely point to the same ruler.",
    body: [
      "Westerosi succession favors legitimate children, but the series repeatedly shows that a legal claim matters only when people can prove it and defend it. Joffrey appears to be Robert's eldest son; Ned and Stannis know he is not. Renly argues that support and capability can outweigh birth order, while Daenerys treats Targaryen ancestry and conquest as twin sources of legitimacy.",
      "Jon's parentage gives him the strongest surviving Targaryen blood claim, yet he neither campaigns for it nor controls the institutions needed to use it. The final council abandons hereditary selection for that moment and chooses Bran, demonstrating that succession is ultimately a political agreement backed by those present."
    ],
    relatedCharacterIds: ["ned-stark", "joffrey-baratheon", "stannis-baratheon", "renly-baratheon", "daenerys-targaryen", "jon-snow", "bran-stark"],
    relatedHouses: ["Baratheon", "Lannister", "Targaryen", "Stark"],
    seasons: [1, 2, 6, 7, 8],
    iconAsset: "assets/icons/person.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/7-you-win-or-you-die", "https://www.hbo.com/game-of-thrones/season-8/6-the-iron-throne"]
  },
  {
    id: "small-council",
    title: "The Small Council",
    category: "politics-succession",
    deck: "The machinery of the crown: money, law, secrets, ships, and policy gathered around one table.",
    body: [
      "The monarch's Small Council turns royal intent into administration. Offices such as Hand, master of coin, master of laws, master of ships, grand maester, and master of whisperers distribute expertise—and give their holders extraordinary access to power.",
      "Council meetings reveal the difference between ruling and merely wearing a crown. Robert avoids detail, Joffrey lashes out, Tywin dominates through authority, and Cersei reshapes the table around loyalists. Bran's closing council suggests that routine governance survives every dynasty because roads, grain, ships, and accounts still require decisions."
    ],
    relatedCharacterIds: ["ned-stark", "tywin-lannister", "tyrion-lannister", "cersei-lannister", "varys", "petyr-baelish", "bran-stark", "samwell-tarly"],
    relatedHouses: ["Stark", "Lannister", "Baratheon"],
    seasons: [1, 2, 3, 4, 6, 8],
    iconAsset: "assets/icons/person.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/3-lord-snow", "https://www.hbo.com/game-of-thrones/season-8/6-the-iron-throne"]
  },
  {
    id: "six-kingdoms-settlement",
    title: "The Six Kingdoms Settlement",
    category: "politics-succession",
    deck: "After the capital burns, Westeros chooses a king while the North chooses itself.",
    body: [
      "With Daenerys dead and the Unsullied holding King's Landing, the surviving leaders meet to prevent another succession war. Tyrion proposes Bran Stark, and the assembled lords and representatives accept him rather than searching for the nearest hereditary claimant.",
      "Sansa withholds the North from the new realm and is recognized as its queen. The settlement does not create a modern democracy; it creates an elective precedent among elites, a separate northern crown, and a rebuilt council charged with repairing the consequences of war."
    ],
    relatedCharacterIds: ["bran-stark", "sansa-stark", "tyrion-lannister", "jon-snow", "grey-worm", "edmure-tully", "yara-greyjoy"],
    relatedHouses: ["Stark", "Lannister", "Tully", "Greyjoy"],
    seasons: [8],
    iconAsset: "assets/icons/compass.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-8/6-the-iron-throne"]
  },
  {
    id: "house-stark",
    title: "House Stark",
    category: "houses-factions",
    deck: "An ancient northern house scattered by violence and remade through survival.",
    body: [
      "House Stark begins as the ruling family of the North, bound to Winterfell, the old gods, and a culture that values duty and plain dealing. Ned's execution breaks the household apart and turns a family tragedy into the War of the Five Kings.",
      "The surviving children develop different forms of power: Sansa learns statecraft, Arya gains the skills of an assassin, Bran becomes the Three-Eyed Raven, and Jon becomes a commander whose parentage bridges Stark and Targaryen histories. By the end, Stark influence extends over both an independent North and the Six Kingdoms."
    ],
    relatedCharacterIds: ["ned-stark", "catelyn-stark", "robb-stark", "sansa-stark", "arya-stark", "bran-stark", "jon-snow"],
    relatedHouses: ["Stark", "Tully", "Targaryen"],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/snowflake.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/1-winter-is-coming", "https://www.hbo.com/game-of-thrones/season-6/9-battle-of-the-bastards"]
  },
  {
    id: "house-lannister",
    title: "House Lannister",
    category: "houses-factions",
    deck: "Wealth and reputation keep the lions ascendant—until control becomes isolation.",
    body: [
      "The Lannisters convert the gold and prestige of Casterly Rock into influence over Robert's court. Tywin treats the family's public name as a political asset more important than any member's private happiness, while Cersei, Jaime, and Tyrion each struggle against the role he assigns them.",
      "Their victories depend on loans, alliances, and fear as much as battlefield success. The family's hold on the capital peaks under Cersei, but the destruction of rivals and allies leaves her with fewer people willing to defend the regime when Daenerys attacks. Tyrion survives to serve a new king, carrying the name into a different political order."
    ],
    relatedCharacterIds: ["tywin-lannister", "cersei-lannister", "jaime-lannister", "tyrion-lannister", "joffrey-baratheon", "tommen-baratheon"],
    relatedHouses: ["Lannister", "Baratheon", "Tyrell"],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/castle.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-2/9-blackwater", "https://www.hbo.com/game-of-thrones/season-3/9-the-rains-of-castamere"]
  },
  {
    id: "house-targaryen",
    title: "House Targaryen",
    category: "houses-factions",
    deck: "A deposed dragon dynasty returns through the last exiles—and divides around two heirs.",
    body: [
      "The Targaryens ruled the united realm until Robert's Rebellion. Viserys and Daenerys grow up in exile carrying the memory of a lost dynasty, but the rebirth of dragons gives Daenerys a source of power that no other claimant can match.",
      "The revelation that Jon is the son of Rhaegar Targaryen and Lyanna Stark complicates Daenerys's identity as the last heir. Their alliance defeats the dead, yet distrust over lineage and Daenerys's destruction of King's Landing ends the restoration before a new Targaryen reign can begin."
    ],
    relatedCharacterIds: ["aerys-targaryen", "rhaegar-targaryen", "viserys-targaryen", "daenerys-targaryen", "jon-snow"],
    relatedHouses: ["Targaryen", "Stark", "Baratheon"],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/play.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/10-fire-and-blood", "https://www.hbo.com/game-of-thrones/season-7/7-the-dragon-and-the-wolf"]
  },
  {
    id: "nights-watch",
    title: "The Night's Watch",
    category: "houses-factions",
    deck: "A sworn brotherhood created to guard the realm, long after the realm forgets why.",
    body: [
      "The Night's Watch holds the Wall and gives recruits a new identity outside inheritance and family allegiance. By Jon's arrival, it is undermanned, politically neglected, and focused on conflict with the free folk rather than the older threat beyond them.",
      "Jon's command changes its mission from guarding against people to organizing the living. His decision to shelter the free folk provokes mutiny, but the alliance later becomes essential at Winterfell. The fall of part of the Wall ends the illusion that isolation alone can keep the south safe."
    ],
    relatedCharacterIds: ["jon-snow", "samwell-tarly", "jeor-mormont", "alliser-thorne", "eddison-tollett", "tormund-giantsbane"],
    relatedHouses: ["Night's Watch", "Free Folk", "Stark"],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/snowflake.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/8-hardhome", "https://www.hbo.com/game-of-thrones/season-8/3-the-long-night"]
  },
  {
    id: "old-gods-and-weirwoods",
    title: "The Old Gods & Weirwoods",
    category: "religions",
    deck: "A northern faith without priests, practiced before carved faces that also preserve memory.",
    body: [
      "Worship of the old gods survives most strongly in the North and beyond the Wall. Its sacred spaces are godswoods centered on weirwood heart trees; prayer is private, quiet, and not governed by a centralized clergy.",
      "Bran's training reveals that the weirwood network is more than symbolic. Greenseers can use it to witness moments held in the past, linking religious landscape to the magical memory of Westeros. The Starks' faith therefore intersects directly with the struggle against the Night King."
    ],
    relatedCharacterIds: ["ned-stark", "catelyn-stark", "bran-stark", "bloodraven", "leaf"],
    relatedHouses: ["Stark", "Free Folk"],
    seasons: [1, 3, 4, 6, 7, 8],
    iconAsset: "assets/icons/castle.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/1-winter-is-coming", "https://www.hbo.com/game-of-thrones/season-6/5-the-door"]
  },
  {
    id: "faith-of-the-seven",
    title: "The Faith of the Seven",
    category: "religions",
    deck: "The dominant southern religion becomes a mass movement and then a rival center of state power.",
    body: [
      "The Faith presents one divinity through seven aspects associated with different human needs. Septons, septas, royal weddings, trials, and public rituals make it closely entwined with law and legitimacy across the southern kingdoms.",
      "Cersei restores the Faith Militant to use it against the Tyrells, but the High Sparrow applies its authority to the crown as well. Her destruction of the Great Sept eliminates the movement's leadership and many rivals at once, replacing religious judgment with fear."
    ],
    relatedCharacterIds: ["high-sparrow", "cersei-lannister", "margaery-tyrell", "tommen-baratheon", "septa-unella"],
    relatedHouses: ["Lannister", "Tyrell", "Baratheon"],
    seasons: [2, 3, 4, 5, 6],
    iconAsset: "assets/icons/castle.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/10-mothers-mercy", "https://www.hbo.com/game-of-thrones/season-6/10-the-winds-of-winter"]
  },
  {
    id: "lord-of-light",
    title: "The Lord of Light",
    category: "religions",
    deck: "A faith of flame, visions, sacrifice, and resurrections whose meaning remains contested.",
    body: [
      "Red priests describe existence as a struggle between light and darkness. Melisandre reads fire for signs, identifies Stannis and later Jon with a promised savior, and treats sacrifice as a means of serving a cosmic war she believes is already underway.",
      "The faith produces events that cannot be dismissed as politics alone: Beric returns repeatedly through Thoros, and Melisandre restores Jon. Yet visions are incomplete and interpretations fail. The story leaves the power real while refusing to certify every conclusion drawn by its servants."
    ],
    relatedCharacterIds: ["melisandre", "stannis-baratheon", "shireen-baratheon", "beric-dondarrion", "thoros-of-myr", "jon-snow"],
    relatedHouses: ["Baratheon", "Stark"],
    seasons: [2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/play.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-3/5-kissed-by-fire", "https://www.hbo.com/game-of-thrones/season-6/2-home"]
  },
  {
    id: "many-faced-god",
    title: "The Many-Faced God",
    category: "religions",
    deck: "In Braavos, death is worshiped as the single gift offered under countless names.",
    body: [
      "The Faceless Men serve the Many-Faced God from the House of Black and White. Their discipline demands observation, impersonation, poisoncraft, and the surrender of personal identity so that a killing is treated as service rather than private revenge.",
      "Arya learns their methods but cannot erase her history or her list of names. She ultimately leaves as Arya Stark, taking skill from the institution without accepting its claim over who she is."
    ],
    relatedCharacterIds: ["arya-stark", "jaqen-hghar", "the-waif"],
    relatedHouses: ["Stark", "Unaffiliated"],
    seasons: [2, 5, 6],
    iconAsset: "assets/icons/person.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-2/10-valar-morghulis", "https://www.hbo.com/game-of-thrones/season-6/8-no-one"]
  },
  {
    id: "dragons",
    title: "Dragons",
    category: "creatures-magic",
    deck: "The return of living dragons changes Daenerys, warfare, and the balance between life and death.",
    body: [
      "Drogon, Rhaegal, and Viserion hatch on Drogo's funeral pyre after dragons have been gone from the world for generations. Their growth tracks Daenerys's rise: they begin as vulnerable dependents, then become the unmatched force behind conquest and liberation.",
      "Dragons are powerful but not invulnerable. The Night King kills and raises Viserion, while Qyburn's scorpions kill Rhaegal. Drogon's destruction of King's Landing demonstrates that a weapon capable of ending armies can also erase the boundary between victory and atrocity."
    ],
    relatedCharacterIds: ["daenerys-targaryen", "jon-snow", "the-night-king", "qyburn"],
    relatedHouses: ["Targaryen"],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/play.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/10-fire-and-blood", "https://www.hbo.com/game-of-thrones/season-7/4-the-spoils-of-war"],
    featured: true
  },
  {
    id: "white-walkers-and-wights",
    title: "White Walkers & Wights",
    category: "creatures-magic",
    deck: "One enemy creates the other: commanders of ice and the dead bodies they add to their army.",
    body: [
      "White Walkers are magical beings led by the Night King. Wights are corpses animated under their power, allowing every battlefield loss among the living to strengthen the dead. Hardhome makes this arithmetic visible when the newly killed rise before Jon's eyes.",
      "Dragonglass and Valyrian steel can destroy Walkers, while fire is effective against many wights. The army is also structurally dependent on its makers: when Arya kills the Night King, the Walkers and the dead bound to them collapse."
    ],
    relatedCharacterIds: ["the-night-king", "jon-snow", "arya-stark", "samwell-tarly", "tormund-giantsbane"],
    relatedHouses: ["Night's Watch", "Free Folk", "Stark"],
    seasons: [1, 2, 3, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/snowflake.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/8-hardhome", "https://www.hbo.com/game-of-thrones/season-8/3-the-long-night"]
  },
  {
    id: "children-of-the-forest",
    title: "The Children of the Forest",
    category: "creatures-magic",
    deck: "The oldest known people of Westeros create a defense that becomes an existential enemy.",
    body: [
      "The Children lived in Westeros before the First Men and remain connected to weirwoods and old magic. In a vision, Bran sees them create the Night King by driving dragonglass into a captive man's chest during their war with humanity.",
      "Their weapon escapes its original purpose and eventually threatens every living people. Leaf and the remaining Children protect the Three-Eyed Raven's cave, then die buying Bran time to escape the very force their ancestors made."
    ],
    relatedCharacterIds: ["leaf", "bran-stark", "bloodraven", "the-night-king", "meera-reed"],
    relatedHouses: ["Stark", "Unaffiliated"],
    seasons: [4, 6],
    iconAsset: "assets/icons/person.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-6/5-the-door"]
  },
  {
    id: "greenseeing-and-three-eyed-raven",
    title: "Greenseeing & the Three-Eyed Raven",
    category: "creatures-magic",
    deck: "Memory becomes a form of power when Bran learns to see through animals, trees, and time.",
    body: [
      "Bran's gifts begin with prophetic dreams and warging, the ability to enter another creature's mind. Under the Three-Eyed Raven, he learns to move through visions preserved by weirwoods and to observe scenes no living witness can now report.",
      "The visions are not always passive. Bran's contact with young Wylis contributes to the event that shapes Hodor's life, while the Night King can perceive and mark Bran inside a vision. The power gives the living strategic memory, but it also changes Bran's relationship to ordinary identity and time."
    ],
    relatedCharacterIds: ["bran-stark", "bloodraven", "hodor", "meera-reed", "jojen-reed", "the-night-king"],
    relatedHouses: ["Stark", "Unaffiliated"],
    seasons: [1, 3, 4, 6, 7, 8],
    iconAsset: "assets/icons/compass.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-6/5-the-door", "https://www.hbo.com/game-of-thrones/season-7/7-the-dragon-and-the-wolf"]
  },
  {
    id: "valyrian-steel",
    title: "Valyrian Steel",
    category: "weapons-artifacts",
    deck: "Rare blades of lost craft become some of the living's few answers to the dead.",
    body: [
      "Valyrian steel is lighter, stronger, and more sharply patterned than ordinary steel, but the knowledge needed to make it has been lost. Great houses preserve surviving blades as heirlooms, turning each sword into both a weapon and a claim about family history.",
      "At Hardhome, Longclaw destroys a White Walker, revealing that Valyrian steel shares dragonglass's supernatural effectiveness. Widow's Wail, Oathkeeper, Heartsbane, and Arya's dagger later bring the old material into the war for the living."
    ],
    relatedCharacterIds: ["jon-snow", "jaime-lannister", "brienne-of-tarth", "samwell-tarly", "arya-stark", "tywin-lannister"],
    relatedHouses: ["Stark", "Lannister", "Targaryen", "Night's Watch"],
    seasons: [1, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/swords.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/8-hardhome", "https://www.hbo.com/game-of-thrones/season-8/3-the-long-night"]
  },
  {
    id: "dragonglass",
    title: "Dragonglass",
    category: "weapons-artifacts",
    deck: "Obsidian links the creation of the Night King to the means of destroying his kind.",
    body: [
      "Dragonglass is volcanic glass found in major deposits beneath Dragonstone. Sam discovers that a dragonglass dagger can kill a White Walker, transforming an old substance dismissed by many into a strategic resource.",
      "The Children used dragonglass when they made the Night King, giving the material a double role in the same magical history. Jon's alliance with Daenerys opens the Dragonstone mines, and the northern forges turn the glass into weapons before the Battle of Winterfell."
    ],
    relatedCharacterIds: ["samwell-tarly", "jon-snow", "daenerys-targaryen", "gendry-baratheon", "the-night-king", "leaf"],
    relatedHouses: ["Night's Watch", "Stark", "Targaryen", "Baratheon"],
    seasons: [2, 3, 5, 6, 7, 8],
    iconAsset: "assets/icons/snowflake.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/8-hardhome", "https://www.hbo.com/game-of-thrones/season-8/3-the-long-night"]
  },
  {
    id: "wildfire",
    title: "Wildfire",
    category: "weapons-artifacts",
    deck: "An unstable green fire hidden beneath the capital outlives the king who stockpiled it.",
    body: [
      "Wildfire is a volatile alchemical substance that burns with exceptional intensity. The Mad King placed caches around King's Landing, intending to destroy the city rather than lose it; Jaime kills him before the order can be carried out.",
      "Tyrion uses wildfire defensively against Stannis's fleet at Blackwater. Years later, Cersei detonates the cache below the Great Sept to kill the High Sparrow, the Tyrell leadership, and her political opponents, making the capital's buried past the instrument of her rule."
    ],
    relatedCharacterIds: ["aerys-targaryen", "jaime-lannister", "tyrion-lannister", "cersei-lannister", "high-sparrow", "margaery-tyrell"],
    relatedHouses: ["Targaryen", "Lannister", "Tyrell", "Baratheon"],
    seasons: [2, 3, 6, 8],
    iconAsset: "assets/icons/play.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-2/9-blackwater", "https://www.hbo.com/game-of-thrones/season-6/10-the-winds-of-winter"]
  },
  {
    id: "longclaw",
    title: "Longclaw",
    category: "weapons-artifacts",
    deck: "A disgraced house's ancestral sword becomes the weapon of a new kind of northern leader.",
    body: [
      "Longclaw is the Valyrian steel sword of House Mormont. Jeor Mormont gives it to Jon after Jon saves him from a wight, replacing the bear pommel with a white direwolf and turning an heirloom into recognition earned through service.",
      "The sword follows Jon from the Night's Watch to Hardhome, the Battle of the Bastards, the expedition beyond the Wall, and Winterfell. Its value is practical against White Walkers, but its journey also records Jon's movement across family, oath, command, and kingship."
    ],
    relatedCharacterIds: ["jon-snow", "jeor-mormont", "jorah-mormont", "the-night-king"],
    relatedHouses: ["Night's Watch", "Stark"],
    seasons: [1, 4, 5, 6, 7, 8],
    iconAsset: "assets/icons/swords.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/8-hardhome", "https://www.hbo.com/game-of-thrones/season-6/9-battle-of-the-bastards"]
  },
  {
    id: "prince-that-was-promised",
    title: "The Prince That Was Promised",
    category: "prophecies",
    deck: "A promised champion is pursued through signs, translations, and repeated misidentification.",
    body: [
      "Melisandre connects the coming war against darkness to a prophesied savior and initially names Stannis. After his defeat, she turns toward Jon, whose resurrection and role in uniting armies appear to fit parts of her interpretation.",
      "Missandei notes that the Valyrian title is not limited by gender, leaving Daenerys within the prophecy's possibilities. The series never gives one character a formal confirmation. Jon, Daenerys, Arya, and their allies each perform an indispensable part in defeating the dead."
    ],
    relatedCharacterIds: ["melisandre", "stannis-baratheon", "jon-snow", "daenerys-targaryen", "arya-stark", "missandei"],
    relatedHouses: ["Baratheon", "Stark", "Targaryen"],
    seasons: [2, 3, 5, 6, 7, 8],
    iconAsset: "assets/icons/compass.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-6/2-home", "https://www.hbo.com/game-of-thrones/season-8/3-the-long-night"],
    featured: true
  },
  {
    id: "maggys-prophecy",
    title: "Maggy's Prophecy",
    category: "prophecies",
    deck: "A childhood prediction becomes the pattern through which Cersei interprets every rival and loss.",
    body: [
      "Maggy tells the young Cersei that she will become queen, be displaced by someone younger and more beautiful, and see her children crowned and buried. The prediction gives Cersei knowledge without clarity about how events will occur.",
      "Her attempts to prevent the future help create it. Suspicion of Margaery strengthens the Faith, violence isolates Tommen, and the pursuit of control destroys alliances she needs. The prophecy matters not only because events resemble it, but because Cersei allows it to shape her choices."
    ],
    relatedCharacterIds: ["maggy-the-frog", "cersei-lannister", "joffrey-baratheon", "myrcella-baratheon", "tommen-baratheon", "margaery-tyrell"],
    relatedHouses: ["Lannister", "Baratheon", "Tyrell"],
    seasons: [5, 6],
    iconAsset: "assets/icons/person.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-5/1-the-wars-to-come", "https://www.hbo.com/game-of-thrones/season-6/10-the-winds-of-winter"]
  },
  {
    id: "house-of-the-undying-visions",
    title: "Visions in the House of the Undying",
    category: "prophecies",
    deck: "Snow, ash, a ruined throne room, and a family beyond reach foreshadow Daenerys's destination.",
    body: [
      "Inside the House of the Undying, Daenerys sees the throne room damaged and open to a pale fall, then turns away from the Iron Throne to find Drogo and their child. The sequence presents desire, warning, and temptation without explaining which images are literal.",
      "Her final arrival in the ruined throne room echoes the vision after King's Landing burns. Whether the fall is read as snow or ash, the image connects the pursuit of the throne to devastation and to the personal attachments Daenerys has lost along the way."
    ],
    relatedCharacterIds: ["daenerys-targaryen", "khal-drogo", "pyat-pree", "jon-snow"],
    relatedHouses: ["Targaryen"],
    seasons: [2, 8],
    iconAsset: "assets/icons/compass.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-2/10-valar-morghulis", "https://www.hbo.com/game-of-thrones/season-8/6-the-iron-throne"]
  },
  {
    id: "stallion-who-mounts-the-world",
    title: "The Stallion Who Mounts the World",
    category: "prophecies",
    deck: "A Dothraki prophecy promised conquest through Daenerys's son; her own rise transforms its meaning.",
    body: [
      "The dosh khaleen proclaim that Daenerys's unborn son will be a khal who unites the Dothraki and reaches across the world. Rhaego dies before birth, apparently closing the direct path by which the prophecy was expected to be fulfilled.",
      "Daenerys later unites the khals under her own command and carries the Dothraki across the Narrow Sea. The parallel does not prove that she is the foretold stallion, but it shows how prophecy in the series can survive through an outcome its first interpreters never considered."
    ],
    relatedCharacterIds: ["daenerys-targaryen", "khal-drogo", "mirri-maz-duur"],
    relatedHouses: ["Targaryen", "Unaffiliated"],
    seasons: [1, 6, 7, 8],
    iconAsset: "assets/icons/compass.svg",
    sourceUrls: ["https://www.hbo.com/game-of-thrones/season-1/6-a-golden-crown", "https://www.hbo.com/game-of-thrones/season-6/6-blood-of-my-blood"]
  }
].map((entry) => Object.freeze({
  ...entry,
  body: Object.freeze(entry.body.slice()),
  relatedCharacterIds: Object.freeze(entry.relatedCharacterIds.slice()),
  relatedHouses: Object.freeze(entry.relatedHouses.slice()),
  seasons: Object.freeze(entry.seasons.slice()),
  sourceUrls: Object.freeze(entry.sourceUrls.slice())
})));

window.LORE_CATEGORIES = LORE_CATEGORIES;
window.LORE_ENTRIES = LORE_ENTRIES;
