// Simplified/stylized region layout for the Seven Kingdoms map (not geographically
// precise — recognizable and functional). Coordinates are in a 600x800 viewBox,
// north at top. Each region has a polygon (the clickable territory) and a castle
// marker point. `house` = controlling house by the end of the series.
const MAP_REGIONS = [
  {
    id: "beyond-wall", name: "Beyond the Wall", house: "Free Folk", seat: "—",
    polygon: "10,10 590,10 590,90 10,90",
    marker: [300, 50],
    blurb: "Home of the Free Folk and, before the Long Night, the White Walkers. Ruled by no king but the King-Beyond-the-Wall."
  },
  {
    id: "the-wall", name: "The Wall", house: "Night's Watch", seat: "Castle Black",
    polygon: "10,95 590,95 590,140 10,140",
    marker: [300, 117],
    blurb: "A 700-foot wall of ice guarded by the Night's Watch, defending the realm from what lies beyond."
  },
  {
    id: "the-north", name: "The North", house: "Stark", seat: "Winterfell",
    polygon: "40,145 560,145 560,340 320,380 200,360 40,320",
    marker: [280, 250],
    blurb: "The largest of the Seven Kingdoms, ruled by House Stark from Winterfell. Independent again after the war for the dawn."
  },
  {
    id: "iron-islands", name: "The Iron Islands", house: "Greyjoy", seat: "Pyke",
    polygon: "20,345 160,345 160,430 20,430",
    marker: [90, 388],
    blurb: "A cluster of rocky islands west of the mainland, home to the ironborn reavers of House Greyjoy."
  },
  {
    id: "riverlands", name: "The Riverlands", house: "Tully", seat: "Riverrun",
    polygon: "170,345 400,345 400,470 170,470",
    marker: [280, 405],
    blurb: "Fertile lands crossed by three great rivers, ruled from Riverrun by House Tully — site of the Red Wedding."
  },
  {
    id: "vale", name: "The Vale", house: "Arryn", seat: "The Eyrie",
    marker: [500, 400],
    polygon: "410,345 590,345 590,470 410,470",
    blurb: "A mountainous, near-impregnable kingdom ruled by House Arryn from the Eyrie high above the Vale."
  },
  {
    id: "westerlands", name: "The Westerlands", house: "Lannister", seat: "Casterly Rock",
    polygon: "20,435 200,435 200,560 20,560",
    marker: [110, 495],
    blurb: "Gold-rich lands on the western coast, seat of House Lannister — the wealthiest house in Westeros."
  },
  {
    id: "crownlands", name: "The Crownlands", house: "Targaryen", seat: "King's Landing",
    polygon: "330,475 480,475 480,590 330,590",
    marker: [400, 530],
    blurb: "Surrounding the capital, King's Landing — seat of the Iron Throne and site of its final destruction."
  },
  {
    id: "dragonstone", name: "Dragonstone", house: "Targaryen", seat: "Dragonstone",
    polygon: "500,470 580,470 580,540 500,540",
    marker: [540, 505],
    blurb: "An island fortress built on a volcanic mountain, ancestral seat of House Targaryen in Westeros."
  },
  {
    id: "reach", name: "The Reach", house: "Tyrell", seat: "Highgarden",
    polygon: "20,565 320,565 320,690 20,690",
    marker: [160, 630],
    blurb: "The most fertile and populous kingdom, ruled from Highgarden by House Tyrell until its destruction."
  },
  {
    id: "stormlands", name: "The Stormlands", house: "Baratheon", seat: "Storm's End",
    polygon: "330,595 480,595 480,690 330,690",
    marker: [405, 645],
    blurb: "A rugged coastal kingdom, birthplace of House Baratheon and its founder Storm King ancestors."
  },
  {
    id: "dorne", name: "Dorne", house: "Martell", seat: "Sunspear",
    polygon: "60,695 540,695 540,780 60,780",
    marker: [300, 738],
    blurb: "The southernmost kingdom, hot and independent-minded, ruled by House Martell from Sunspear."
  }
];
