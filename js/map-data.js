// ==========================================================================
// Stylized, original map of Westeros — not geographically precise and not
// traced from any official map, but drawn as real irregular landmass shapes
// with jagged coastlines rather than plain rectangles. viewBox 0 0 700 950,
// north at top. `path` is an SVG path `d` string for the region's territory.
// `seat` marker coordinates place a small original seat icon.
// `house` = controlling house by the end of the series.
// ==========================================================================

const MAP_REGIONS = [
  {
    id: "beyond-wall", name: "Beyond the Wall", house: "Free Folk", seat: "—",
    path: "M40,40 L120,30 L200,45 L280,25 L360,42 L440,28 L520,44 L600,32 L650,50 L640,120 L560,110 L480,128 L400,108 L320,126 L240,106 L160,124 L80,112 L40,120 Z",
    seatXY: [350, 75],
    blurb: "Home of the Free Folk and, before the Long Night, the White Walkers. Ruled by no king but the King-Beyond-the-Wall."
  },
  {
    id: "the-wall", name: "The Wall", house: "Night's Watch", seat: "Castle Black",
    path: "M40,120 L660,120 L660,165 L600,172 L520,160 L440,174 L360,158 L280,174 L200,160 L120,172 L40,164 Z",
    seatXY: [350, 145],
    blurb: "A 700-foot wall of ice guarded by the Night's Watch, defending the realm from what lies beyond."
  },
  {
    id: "the-north", name: "The North", house: "Stark", seat: "Winterfell",
    path: "M60,170 L640,170 L660,260 L600,310 L620,380 L520,420 L470,460 L380,440 L320,470 L250,430 L180,450 L120,400 L140,340 L70,300 L90,230 Z",
    seatXY: [330, 290],
    blurb: "The largest of the Seven Kingdoms, ruled by House Stark from Winterfell. Independent again after the war for the dawn."
  },
  {
    id: "iron-islands", name: "The Iron Islands", house: "Greyjoy", seat: "Pyke",
    path: "M40,470 L100,455 L150,480 L170,530 L140,580 L90,600 L45,570 L30,520 Z",
    seatXY: [95, 525],
    blurb: "A cluster of rocky islands west of the mainland, home to the ironborn reavers of House Greyjoy."
  },
  {
    id: "riverlands", name: "The Riverlands", house: "Tully", seat: "Riverrun",
    path: "M180,450 L320,470 L380,440 L470,460 L460,530 L500,580 L440,620 L360,600 L300,630 L220,600 L170,560 L190,510 Z",
    seatXY: [330, 535],
    blurb: "Fertile lands crossed by three great rivers, ruled from Riverrun by House Tully — site of the Red Wedding."
  },
  {
    id: "vale", name: "The Vale", house: "Arryn", seat: "The Eyrie",
    path: "M470,460 L520,420 L600,440 L650,490 L640,560 L580,600 L520,580 L500,580 L460,530 Z",
    seatXY: [560, 500],
    blurb: "A mountainous, near-impregnable kingdom ruled by House Arryn from the Eyrie high above the Vale."
  },
  {
    id: "westerlands", name: "The Westerlands", house: "Lannister", seat: "Casterly Rock",
    path: "M90,600 L140,580 L170,560 L220,600 L260,650 L230,720 L160,740 L110,700 L100,650 Z",
    seatXY: [170, 660],
    blurb: "Gold-rich lands on the western coast, seat of House Lannister — the wealthiest house in Westeros."
  },
  {
    id: "crownlands", name: "The Crownlands", house: "Targaryen", seat: "King's Landing",
    path: "M360,600 L440,620 L500,580 L520,580 L540,640 L500,690 L430,700 L380,660 Z",
    seatXY: [455, 645],
    blurb: "Surrounding the capital, King's Landing — seat of the Iron Throne and site of its final destruction."
  },
  {
    id: "dragonstone", name: "Dragonstone", house: "Targaryen", seat: "Dragonstone",
    path: "M560,610 L610,600 L630,640 L605,675 L565,665 L550,635 Z",
    seatXY: [590, 638],
    blurb: "An island fortress built on a volcanic mountain, ancestral seat of House Targaryen in Westeros."
  },
  {
    id: "reach", name: "The Reach", house: "Tyrell", seat: "Highgarden",
    path: "M160,740 L230,720 L260,650 L380,660 L430,700 L400,760 L420,820 L330,850 L250,830 L190,790 Z",
    seatXY: [300, 760],
    blurb: "The most fertile and populous kingdom, ruled from Highgarden by House Tyrell until its destruction."
  },
  {
    id: "stormlands", name: "The Stormlands", house: "Baratheon", seat: "Storm's End",
    path: "M430,700 L500,690 L540,640 L560,610 L600,650 L590,720 L540,770 L470,780 L420,820 L400,760 Z",
    seatXY: [500, 730],
    blurb: "A rugged coastal kingdom, birthplace of House Baratheon and its founder Storm King ancestors."
  },
  {
    id: "dorne", name: "Dorne", house: "Martell", seat: "Sunspear",
    path: "M250,830 L330,850 L420,820 L470,780 L540,770 L560,830 L500,880 L420,900 L340,890 L280,870 L230,860 Z",
    seatXY: [400, 845],
    blurb: "The southernmost kingdom, hot and independent-minded, ruled by House Martell from Sunspear."
  }
];

// A rough, single continuous coastline outline used only to render a soft
// landmass silhouette/shadow beneath the region shapes so the map reads as
// one landmass rather than floating fragments.
const MAP_LANDMASS_OUTLINE =
  "M40,40 L650,50 L660,120 L660,165 L640,260 L620,380 L650,490 L640,560 L600,650 " +
  "L560,830 L500,880 L420,900 L340,890 L230,860 L90,600 L45,570 L30,520 L60,170 Z";
