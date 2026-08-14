// Curated editorial layer for the map-first Citadel Records experience.
// The underlying show records remain the source of truth; these records add
// clear book/show context without pretending that unpublished book outcomes
// are settled canon.
(function installCitadelRecordsData(global) {
  "use strict";

  const freeze = value => Object.freeze(value);

  const STOPS = freeze([
    { id: "winterfell", name: "Winterfell", region: "The North", x: 33, y: 25, house: "Stark", characterId: "jon-snow", line: "The North remembers.", summary: "The first seat of the story: duty, blood, and the cost of keeping a promise." },
    { id: "the-wall", name: "The Wall", region: "The North", x: 37, y: 12, house: "Night's Watch", characterId: "samwell-tarly", line: "The night is dark and full of terrors.", summary: "A border made of ice, where the old stories become immediate again." },
    { id: "harrenhal", name: "Harrenhal", region: "The Riverlands", x: 42, y: 43, house: "Unaffiliated", characterId: "arya-stark", line: "A girl has no name.", summary: "A ruin that keeps changing hands, and a place where identities are shed." },
    { id: "riverrun", name: "Riverrun", region: "The Riverlands", x: 31, y: 49, house: "Tully", characterId: "catelyn-stark", line: "Family, duty, honor.", summary: "The riverlands carry every war downstream, from oath to reprisal." },
    { id: "kings-landing", name: "King's Landing", region: "The Crownlands", x: 56, y: 59, house: "Lannister", characterId: "tyrion-lannister", line: "Power resides where men believe it resides.", summary: "The capital: a city of bells, wildfire, and people trying to survive the throne." },
    { id: "dragonstone", name: "Dragonstone", region: "The Crownlands", x: 68, y: 60, house: "Targaryen", characterId: "daenerys-targaryen", line: "I will take what is mine.", summary: "A volcanic seat and the launch point for a claim carried across the sea." },
    { id: "highgarden", name: "Highgarden", region: "The Reach", x: 28, y: 66, house: "Tyrell", characterId: "margaery-tyrell", line: "Growing strong.", summary: "Beauty and leverage, cultivated until the garden becomes a target." },
    { id: "meereen", name: "Meereen", region: "Slaver's Bay", x: 82, y: 42, house: "Targaryen", characterId: "daenerys-targaryen", line: "Dracarys.", summary: "Across the world, a liberator learns that breaking chains is easier than governing." },
    { id: "hardhome", name: "Hardhome", region: "Beyond the Wall", x: 48, y: 7, house: "Free Folk", characterId: "jon-snow", line: "The dead do not rest.", summary: "The night stops being a legend and becomes an army." }
  ]);

  const DIVERGENCES = freeze([
    { id: "stoneheart", label: "Lady Stoneheart", status: "BOOK DIVERGENCE", tone: "book", show: "The show never introduces Catelyn Stark's post-Red Wedding resurrection.", book: "In the published novels, an undead Catelyn leads the Brotherhood Without Banners as Lady Stoneheart." },
    { id: "young-griff", label: "Young Griff", status: "BOOK DIVERGENCE", tone: "book", show: "The show omits the Aegon / Young Griff claim and its invasion of Westeros.", book: "A claimant calling himself Aegon Targaryen becomes a major late-book power in A Dance with Dragons." },
    { id: "dorne", label: "Dorne's succession", status: "ADAPTATION DIFFERENCE", tone: "fan", show: "The televised Sand Snakes and coup compress Dorne into a very different political arc.", book: "The novels retain a slower, more conspiratorial Dornish plot with different players and objectives." },
    { id: "sansa-jeyne", label: "Sansa and Jeyne Poole", status: "BOOK DIVERGENCE", tone: "book", show: "The show places Sansa in Winterfell for the Bolton marriage plot.", book: "The novels give that identity and marriage pressure to Jeyne Poole, presented as Arya Stark." },
    { id: "jon-return", label: "Jon Snow's return", status: "UNRESOLVED IN BOOKS", tone: "theory", show: "The show confirms Jon's resurrection and later resolves his parentage.", book: "The published novels end after Jon's stabbing; his fate and the timing of any return remain open." },
    { id: "tyrion-temper", label: "Tyrion's darker road", status: "ADAPTATION DIFFERENCE", tone: "fan", show: "The show softens several of Tyrion's post-escape impulses and relationships.", book: "The novels give Tyrion a more bitter, violent inner journey after leaving King's Landing." }
  ]);

  const CLAIMANTS = freeze([
    { id: "jon", name: "Jon Snow", house: "Stark / Targaryen", bloodline: 95, conquest: 62, merit: 88, note: "A hidden claim, proven leadership, and no appetite for the crown." },
    { id: "dany", name: "Daenerys Targaryen", house: "Targaryen", bloodline: 92, conquest: 90, merit: 68, note: "The strongest conquering claim, shadowed by the cost of rule." },
    { id: "sansa", name: "Sansa Stark", house: "Stark", bloodline: 76, conquest: 44, merit: 94, note: "A survivor who turns political fluency into northern independence." },
    { id: "bran", name: "Bran Stark", house: "Stark", bloodline: 72, conquest: 38, merit: 79, note: "Chosen by a council after the old order breaks apart." },
    { id: "gendry", name: "Gendry Baratheon", house: "Baratheon", bloodline: 83, conquest: 31, merit: 70, note: "A legitimized bloodline with a seat, a hammer, and little interest in ceremony." }
  ]);

  const MYSTERIES = freeze([
    { id: "azor-ahai", title: "Azor Ahai", badge: "BOOK + SHOW THREAD", tone: "theory", text: "The promised hero is named differently by different traditions, and the clues never settle into one clean answer." },
    { id: "three-eyed-raven", title: "The Three-Eyed Raven", badge: "SHOW CANON", tone: "canon", text: "The show confirms a succession of memory-keepers; the books leave the identity, cost, and purpose more fluid." },
    { id: "prince-promised", title: "The Prince That Was Promised", badge: "UNRESOLVED", tone: "theory", text: "A prophecy can be a signal, a mistranslation, or a story people use to justify the next war." },
    { id: "valonqar", title: "The valonqar", badge: "BOOK PROPHECY", tone: "book", text: "Cersei's book prophecy includes a younger sibling; the show leaves this thread unspoken and takes a different route." }
  ]);

  global.CITADEL_LOCATIONS = STOPS;
  global.CITADEL_DIVERGENCES = DIVERGENCES;
  global.CITADEL_CLAIMANTS = CLAIMANTS;
  global.CITADEL_MYSTERIES = MYSTERIES;
})(window);
