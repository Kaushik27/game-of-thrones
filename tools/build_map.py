#!/usr/bin/env python3
"""
Generate js/map-data.js — the vector cartography for the Westeros map.

WHY THIS IS GENERATED RATHER THAN HAND-TYPED
--------------------------------------------
The previous map was ~10 polygons of 6-10 vertices each, which is why it read
as a student diagram. A convincing coastline needs hundreds of points per
region, and hand-typing a thousand coordinates is neither reliable nor
reviewable. So the map is described here as a small, readable set of control
polylines and then refined into detailed geometry:

  TOPOLOGY (the important part)
    The map is a planar subdivision. Every border is defined ONCE as a named
    edge, and each region is assembled as an ordered ring of those edges
    (reversed where the region traverses them backwards). Because two adjacent
    regions literally share the same displaced point list, borders can never
    gap, overlap or drift apart — which is the failure mode that makes
    hand-drawn region maps look amateurish.

  DETAIL
    Each edge is refined by recursive midpoint displacement: repeatedly insert
    a midpoint pushed perpendicular to the segment by a random amount that
    halves at each level. This is the standard fractal-coastline construction,
    and it is what turns a 6-point control line into a 200-point coast with
    natural irregularity at every scale. Endpoints are never moved, which is
    what preserves the shared-edge guarantee above.

    Roughness is per-edge: open coastline is very rough, inland borders are
    gentle, and the Wall is nearly straight because it is a built structure.

  DETERMINISM
    Every edge seeds its own PRNG from its own name, so the map is identical
    on every run and diffs stay meaningful.

The output keeps the exact interface js/app.js already consumes — MAP_REGIONS
entries with id / name / house / seat / seatXY / blurb / path, plus
MAP_LANDMASS_OUTLINE — and extends it with terrain, settlement, islet and
sea-label data for the cartographic layers.

Usage:  python3 tools/build_map.py
"""

import math
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "js", "map-data.js")

# ===========================================================================
# NODES — the junction points of the subdivision. Named so the edge table
# below reads as geography rather than as a wall of numbers.
# ===========================================================================
N = {
    "A":  (90, 44),    # far north-west, beyond the Wall
    "P":  (624, 42),   # far north-east
    "B":  (48, 178),   # west end of the Wall
    "Q":  (658, 178),  # east end of the Wall
    "C":  (58, 212),   # north-west corner of the North
    "R":  (650, 214),  # north-east corner of the North
    # The Neck is a genuine waist: the Bite (east) and the western shore close
    # to within ~180 units of each other, so the continent reads as an
    # hourglass instead of a slab. D and E2 are its two shores.
    "D":  (250, 432),  # the Neck, west shore
    "E2": (430, 428),  # the Neck, east shore (foot of the Bite)
    "U":  (600, 566),  # east coast, Vale / Crownlands
    "V":  (556, 690),  # east coast, Crownlands / Stormlands
    "X":  (546, 840),  # east coast, Stormlands / Dorne
    "G":  (230, 812),  # west coast, Reach / Dorne
    "F":  (118, 700),  # west coast, Westerlands / Reach
    "N2": (348, 428),  # North / Riverlands / Vale
    "N4": (516, 560),  # Riverlands / Vale / Crownlands
    "N5": (430, 588),  # Riverlands / Reach / Crownlands
    "N6": (300, 610),  # Riverlands / Westerlands / Reach
    "N7": (112, 486),  # west coast, Riverlands / Westerlands
    "N10": (452, 700), # Reach / Crownlands / Stormlands
    "N11": (420, 806), # Reach / Stormlands / Dorne
}


def n(*keys):
    return [N[k] for k in keys]


# ===========================================================================
# EDGES — control polylines. `rough` is the displacement amplitude: open
# coast is jagged, inland borders are soft, the Wall is essentially straight.
# ===========================================================================
COAST, INLAND, WALL = 17.0, 6.0, 1.2

EDGES = {
    # ---- Beyond the Wall -------------------------------------------------
    "coast-bw-n": (COAST, [(90, 44), (152, 24), (222, 38), (296, 16), (376, 32),
                           (454, 14), (532, 30), (588, 22), (624, 42)]),
    "coast-bw-e": (COAST, [(624, 42), (664, 76), (646, 112), (676, 146), (658, 178)]),
    "coast-bw-w": (COAST, [(48, 178), (30, 142), (56, 108), (34, 76), (90, 44)]),
    "e_bw_wall":  (WALL,  [(48, 178), (200, 176), (360, 179), (520, 176), (658, 178)]),

    # ---- The Wall --------------------------------------------------------
    "coast-wall-w": (WALL, [(58, 212), (48, 178)]),
    "coast-wall-e": (WALL, [(658, 178), (650, 214)]),
    "e_wall_north": (WALL, [(58, 212), (200, 210), (360, 213), (520, 210), (650, 214)]),

    # ---- The North -------------------------------------------------------
    # East coast carves out the Bite, which together with the western
    # indentation below forms the Neck's waist.
    # The Bite: a deep eastern bay that drives the coast inland to x~520 and
    # forms the eastern shore of the Neck.
    "coast-north-e": (COAST, [(650, 214), (666, 250), (636, 286), (660, 322),
                              (624, 346), (570, 362), (522, 380), (566, 394),
                              (590, 406), (534, 416), (474, 422), (430, 428)]),
    # Traversed south -> north; the zig-zag is the fjord coast, and the run up
    # from the Neck is the western shore of the waist.
    "coast-north-w": (COAST, [(250, 432), (206, 420), (232, 404), (180, 396),
                              (150, 378), (112, 366), (136, 344), (92, 326),
                              (118, 300), (78, 278), (104, 254), (70, 234),
                              (96, 222), (58, 212)]),
    "e_north_river": (INLAND, [(250, 432), (282, 438), (316, 424), (348, 428)]),
    "e_north_vale":  (INLAND, [(348, 428), (380, 436), (408, 422), (430, 428)]),

    # ---- The Vale --------------------------------------------------------
    # Flares back out east of the Neck, out to the Fingers.
    "coast-vale-e": (COAST, [(430, 428), (486, 436), (534, 452), (578, 444),
                             (620, 462), (676, 470), (646, 492), (672, 512),
                             (634, 528), (658, 546), (614, 556), (600, 566)]),
    "e_river_vale": (INLAND, [(348, 428), (392, 466), (430, 506), (470, 534), (516, 560)]),
    "e_vale_crown": (INLAND, [(516, 560), (552, 572), (578, 562), (600, 566)]),

    # ---- The Riverlands --------------------------------------------------
    # Flares back out west of the Neck.
    "coast-river-w": (COAST, [(112, 486), (142, 478), (170, 466), (198, 458),
                              (224, 444), (250, 432)]),
    "e_river_crown": (INLAND, [(516, 560), (486, 566), (456, 580), (430, 588)]),
    "e_river_reach": (INLAND, [(430, 588), (392, 604), (346, 598), (300, 610)]),
    "e_river_west":  (INLAND, [(300, 610), (258, 582), (216, 554), (180, 528),
                               (146, 504), (112, 486)]),

    # ---- The Westerlands -------------------------------------------------
    "coast-west-w": (COAST, [(118, 700), (88, 668), (106, 636), (76, 604),
                             (98, 572), (70, 540), (94, 508), (112, 486)]),
    "e_west_reach": (INLAND, [(300, 610), (256, 634), (210, 656), (164, 678), (118, 700)]),

    # ---- The Crownlands --------------------------------------------------
    # Blackwater Bay takes a deep bite inland; King's Landing sits on it.
    "coast-crown-e": (COAST, [(600, 566), (586, 592), (546, 606), (508, 626),
                              (542, 646), (586, 656), (568, 672), (556, 690)]),
    "e_reach_crown": (INLAND, [(430, 588), (452, 622), (436, 662), (452, 700)]),
    "e_crown_storm": (INLAND, [(556, 690), (520, 700), (486, 692), (452, 700)]),

    # ---- The Reach -------------------------------------------------------
    "coast-reach-w": (COAST, [(230, 812), (190, 794), (158, 766), (136, 734), (118, 700)]),
    "e_reach_storm": (INLAND, [(452, 700), (468, 736), (440, 772), (420, 806)]),
    "e_reach_dorne": (INLAND, [(420, 806), (352, 818), (288, 818), (230, 812)]),

    # ---- The Stormlands --------------------------------------------------
    "coast-storm-e": (COAST, [(556, 690), (594, 706), (614, 738), (600, 764),
                              (620, 792), (584, 812), (562, 824), (546, 840)]),
    "e_storm_dorne": (INLAND, [(546, 840), (504, 826), (462, 816), (420, 806)]),

    # ---- Dorne -----------------------------------------------------------
    "coast-dorne-s": (COAST, [(546, 840), (578, 864), (550, 890), (498, 908),
                              (440, 918), (386, 912), (334, 896), (290, 872),
                              (256, 842), (230, 812)]),
}

# Region rings: (edge name, reversed?). Assembled head-to-tail.
RINGS = {
    "beyond-wall": [("coast-bw-n", 0), ("coast-bw-e", 0), ("e_bw_wall", 1), ("coast-bw-w", 0)],
    "the-wall":    [("e_bw_wall", 0), ("coast-wall-e", 0), ("e_wall_north", 1), ("coast-wall-w", 0)],
    "the-north":   [("e_wall_north", 0), ("coast-north-e", 0), ("e_north_vale", 1),
                    ("e_north_river", 1), ("coast-north-w", 0)],
    "vale":        [("e_north_vale", 0), ("coast-vale-e", 0), ("e_vale_crown", 1),
                    ("e_river_vale", 1)],
    "riverlands":  [("e_north_river", 0), ("e_river_vale", 0), ("e_river_crown", 0),
                    ("e_river_reach", 0), ("e_river_west", 0), ("coast-river-w", 0)],
    "westerlands": [("e_river_west", 1), ("e_west_reach", 0), ("coast-west-w", 0)],
    "crownlands":  [("e_vale_crown", 0), ("coast-crown-e", 0), ("e_crown_storm", 0),
                    ("e_reach_crown", 1), ("e_river_crown", 1)],
    "reach":       [("e_river_reach", 1), ("e_reach_crown", 0), ("e_reach_storm", 0),
                    ("e_reach_dorne", 0), ("coast-reach-w", 0), ("e_west_reach", 1)],
    "stormlands":  [("coast-storm-e", 0), ("e_storm_dorne", 0), ("e_reach_storm", 1),
                    ("e_crown_storm", 1)],
    "dorne":       [("e_storm_dorne", 1), ("coast-dorne-s", 0), ("e_reach_dorne", 1)],
}

# The mainland silhouette: the outer coastal ring, in order.
COAST_RING = [
    ("coast-bw-n", 0), ("coast-bw-e", 0), ("coast-wall-e", 0), ("coast-north-e", 0),
    ("coast-vale-e", 0), ("coast-crown-e", 0), ("coast-storm-e", 0), ("coast-dorne-s", 0),
    ("coast-reach-w", 0), ("coast-west-w", 0), ("coast-river-w", 0),
    ("coast-north-w", 0), ("coast-wall-w", 0), ("coast-bw-w", 0),
]


# ===========================================================================
# Fractal refinement
# ===========================================================================
def refine(points, amp, seed, min_len=7.0, max_passes=6):
    """Recursive midpoint displacement.

    Inserts a perpendicular-displaced midpoint into every segment, halving the
    amplitude each pass, until segments are short. Endpoints are never touched,
    so an edge shared by two regions stays shared exactly.
    """
    rng = random.Random(seed)
    pts = [tuple(p) for p in points]
    a = amp
    for _ in range(max_passes):
        out = [pts[0]]
        moved = False
        for i in range(len(pts) - 1):
            (x1, y1), (x2, y2) = pts[i], pts[i + 1]
            dx, dy = x2 - x1, y2 - y1
            length = math.hypot(dx, dy)
            if length > min_len:
                # Perpendicular unit vector, scaled by amplitude and segment
                # length so long straights get more wander than short ones.
                px, py = -dy / length, dx / length
                d = (rng.random() - 0.5) * a * min(1.0, length / 60.0) * 2.0
                mx, my = (x1 + x2) / 2 + px * d, (y1 + y2) / 2 + py * d
                out.append((mx, my))
                moved = True
            out.append((x2, y2))
        pts = out
        a *= 0.55
        if not moved:
            break
    return pts


_cache = {}


def edge_points(name):
    """Refined points for an edge, computed once and memoised (shared borders)."""
    if name not in _cache:
        amp, ctrl = EDGES[name]
        _cache[name] = refine(ctrl, amp, seed=name)
    return _cache[name]


def ring_points(ring):
    pts = []
    for name, rev in ring:
        seg = edge_points(name)
        if rev:
            seg = seg[::-1]
        if pts:
            # Drop the duplicated junction node.
            seg = seg[1:]
        pts.extend(seg)
    return pts


def fmt(pts, close=True):
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return d + " Z" if close else d


def check_rings():
    """Fail loudly if any ring does not close or has a discontinuity."""
    for rid, ring in RINGS.items():
        pts = ring_points(ring)
        gap = math.dist(pts[0], pts[-1])
        assert gap < 0.01, f"{rid}: ring does not close (gap {gap:.3f})"
        for i in range(len(pts) - 1):
            step = math.dist(pts[i], pts[i + 1])
            assert step < 40, f"{rid}: discontinuity of {step:.1f} at point {i}"
    pts = ring_points(COAST_RING)
    assert math.dist(pts[0], pts[-1]) < 0.01, "coastline ring does not close"


# ===========================================================================
# Islands — separate landmasses, not part of the subdivision.
# ===========================================================================
def blob(cx, cy, rx, ry, seed, wobble=0.28, steps=40):
    """A closed, irregular island outline."""
    rng = random.Random(seed)
    offs = [rng.uniform(1 - wobble, 1 + wobble) for _ in range(6)]
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        # Sum a few harmonics so the outline has both broad lobes and fine
        # crenellation rather than reading as a circle.
        r = 1.0
        for h, o in enumerate(offs, start=1):
            r += (o - 1) * math.cos(h * t + o * 9) / h
        pts.append((cx + math.cos(t) * rx * r, cy + math.sin(t) * ry * r))
    pts.append(pts[0])
    return refine(pts, 3.0, seed=f"blob{seed}", min_len=5, max_passes=3)


# Kept clear of the mainland's western shore (which runs about x=70-118 at
# these latitudes) so the archipelago reads as offshore rather than fused on.
IRON_ISLANDS = [
    (28, 516, 27, 21, "pyke"), (4, 570, 19, 15, "harlaw"),
    (46, 584, 15, 12, "orkmont"), (16, 616, 13, 10, "blacktyde"),
    (40, 478, 12, 9, "saltcliffe"),
]
DRAGONSTONE = [(664, 636, 26, 22, "dragonstone"), (690, 668, 11, 9, "driftmark")]

# Decorative islets that are not clickable regions.
ISLETS = [
    (44, 330, 18, 13, "bear-island"), (688, 268, 22, 16, "skagos"),
    (700, 214, 12, 9, "skagos2"), (628, 878, 16, 11, "stepstone1"),
    (668, 906, 13, 9, "stepstone2"), (704, 872, 10, 8, "stepstone3"),
    (592, 906, 11, 8, "stepstone4"), (36, 690, 13, 10, "shield"),
    (150, 838, 12, 9, "arbor"),
]


# ===========================================================================
# Terrain glyph scatter — clusters of hand-drawn-style marks.
# ===========================================================================
TERRAIN_CLUSTERS = [
    # (kind, cx, cy, rx, ry, count, seed)
    ("forest",   320,  92, 205, 42, 30, "haunted"),
    ("mountain", 132,  92,  72, 38, 13, "frostfangs"),
    ("mountain", 560,  95,  80, 34, 12, "beyond-e"),
    ("forest",   205, 300,  88, 62, 20, "wolfswood"),
    ("mountain", 440, 278, 120, 52, 16, "north-hills"),
    ("forest",   540, 300,  62, 44, 12, "north-e-wood"),
    ("swamp",    336, 440,  70, 16, 11, "neck"),
    ("mountain", 574, 474,  66, 56, 17, "moon"),
    ("mountain", 168, 572,  68, 62, 14, "westerlands"),
    ("forest",   330, 520, 110, 52, 17, "riverlands"),
    ("forest",   478, 660,  58, 44, 12, "kingswood"),
    ("forest",   256, 700,  98, 52, 16, "reach"),
    ("forest",   532, 758,  54, 44, 12, "rainwood"),
    ("mountain", 396, 802, 132, 28, 17, "red-mtns"),
    ("dune",     384, 862, 128, 32, 15, "dorne"),
]


def scatter(kind, cx, cy, rx, ry, count, seed):
    rng = random.Random("terrain" + seed)
    out = []
    for _ in range(count):
        # Rejection-sample inside the ellipse for an even, non-gridded spread.
        while True:
            u, v = rng.uniform(-1, 1), rng.uniform(-1, 1)
            if u * u + v * v <= 1:
                break
        out.append({
            "t": kind,
            "x": round(cx + u * rx, 1),
            "y": round(cy + v * ry, 1),
            "s": round(rng.uniform(0.78, 1.35), 2),
        })
    # Painter's algorithm: draw back-to-front so glyphs overlap convincingly.
    out.sort(key=lambda g: g["y"])
    return out


# ===========================================================================
# Settlements and labels
# ===========================================================================
SETTLEMENTS = [
    ("Castle Black", 352, 196, "castle"),
    ("Winterfell", 322, 302, "castle"),
    ("The Dreadfort", 470, 268, "keep"),
    ("Karhold", 566, 246, "keep"),
    ("Last Hearth", 500, 228, "keep"),
    ("Deepwood Motte", 152, 330, "keep"),
    ("White Harbor", 534, 392, "city"),
    ("Barrowton", 258, 382, "keep"),
    ("Moat Cailin", 300, 430, "keep"),
    ("Pyke", 28, 516, "castle"),
    ("Seagard", 152, 492, "keep"),
    ("The Twins", 286, 476, "keep"),
    ("Riverrun", 248, 524, "castle"),
    ("Harrenhal", 398, 502, "castle"),
    ("The Eyrie", 578, 478, "castle"),
    ("Gulltown", 626, 522, "city"),
    ("Casterly Rock", 124, 586, "castle"),
    ("Lannisport", 104, 612, "city"),
    ("King's Landing", 516, 634, "city"),
    ("Duskendale", 566, 594, "keep"),
    ("Dragonstone", 664, 636, "castle"),
    ("Highgarden", 252, 688, "castle"),
    ("Old Oak", 186, 648, "keep"),
    ("Horn Hill", 268, 758, "keep"),
    ("Oldtown", 172, 764, "city"),
    ("Storm's End", 558, 728, "castle"),
    ("Sunspear", 498, 862, "castle"),
    ("Starfall", 306, 848, "keep"),
]

SEA_LABELS = [
    ("The Shivering Sea", 360, -26, 0, 15),
    ("The Sunset Sea", -46, 470, -90, 15),
    ("The Narrow Sea", 748, 430, 90, 15),
    ("The Summer Sea", 340, 972, 0, 15),
    ("The Bite", 566, 372, -14, 9),
    ("Blackwater Bay", 542, 628, -8, 9),
    ("Sea of Dorne", 566, 826, 12, 9),
    ("Ironman's Bay", 150, 446, -20, 9),
    ("Bay of Ice", 62, 356, -72, 9),
]

# Region name label anchors, kept clear of the terrain clusters above.
REGION_LABELS = {
    "beyond-wall": (352, 148, 15),
    "the-wall": (352, 168, 11),
    "the-north": (322, 350, 19),
    "iron-islands": (18, 468, 11),
    "riverlands": (300, 560, 14),
    "vale": (582, 540, 14),
    "westerlands": (150, 640, 13),
    "crownlands": (470, 604, 12),
    "dragonstone": (668, 596, 10),
    "reach": (280, 736, 16),
    "stormlands": (548, 762, 12),
    "dorne": (376, 872, 17),
}

REGION_META = {
    "beyond-wall": ("Beyond the Wall", "Free Folk", "—",
                    "Home of the Free Folk and, before the Long Night, the White Walkers. Ruled by no king but the King-Beyond-the-Wall."),
    "the-wall": ("The Wall", "Night's Watch", "Castle Black",
                 "A 700-foot wall of ice guarded by the Night's Watch, defending the realm from what lies beyond."),
    "the-north": ("The North", "Stark", "Winterfell",
                  "The largest of the Seven Kingdoms, ruled by House Stark from Winterfell. Independent again after the war for the dawn."),
    "iron-islands": ("The Iron Islands", "Greyjoy", "Pyke",
                     "A cluster of rocky islands west of the mainland, home to the ironborn reavers of House Greyjoy."),
    "riverlands": ("The Riverlands", "Tully", "Riverrun",
                   "Fertile lands crossed by three great rivers, ruled from Riverrun by House Tully — site of the Red Wedding."),
    "vale": ("The Vale", "Arryn", "The Eyrie",
             "A mountainous, near-impregnable kingdom ruled by House Arryn from the Eyrie high above the Vale."),
    "westerlands": ("The Westerlands", "Lannister", "Casterly Rock",
                    "Gold-rich lands on the western coast, seat of House Lannister — the wealthiest house in Westeros."),
    "crownlands": ("The Crownlands", "Targaryen", "King's Landing",
                   "Surrounding the capital, King's Landing — seat of the Iron Throne and site of its final destruction."),
    "dragonstone": ("Dragonstone", "Targaryen", "Dragonstone",
                    "An island fortress built on a volcanic mountain, ancestral seat of House Targaryen in Westeros."),
    "reach": ("The Reach", "Tyrell", "Highgarden",
              "The most fertile and populous kingdom, ruled from Highgarden by House Tyrell until its destruction."),
    "stormlands": ("The Stormlands", "Baratheon", "Storm's End",
                   "A rugged coastal kingdom, birthplace of House Baratheon and its founder Storm King ancestors."),
    "dorne": ("Dorne", "Martell", "Sunspear",
              "The southernmost kingdom, hot and independent-minded, ruled by House Martell from Sunspear."),
}

SEAT_XY = {
    "beyond-wall": (352, 118), "the-wall": (352, 196), "the-north": (322, 302),
    "iron-islands": (28, 516), "riverlands": (248, 524), "vale": (578, 478),
    "westerlands": (124, 586), "crownlands": (516, 634), "dragonstone": (664, 636),
    "reach": (252, 688), "stormlands": (558, 728), "dorne": (498, 862),
}

ORDER = ["beyond-wall", "the-wall", "the-north", "iron-islands", "riverlands", "vale",
         "westerlands", "crownlands", "dragonstone", "reach", "stormlands", "dorne"]


def js(v):
    if isinstance(v, str):
        return '"' + v.replace("\\", "\\\\").replace('"', '\\"') + '"'
    if isinstance(v, float):
        return f"{v:g}"
    return str(v)


def main():
    check_rings()

    paths = {}
    for rid, ring in RINGS.items():
        paths[rid] = fmt(ring_points(ring))
    paths["iron-islands"] = " ".join(
        fmt(blob(cx, cy, rx, ry, sd)) for cx, cy, rx, ry, sd in IRON_ISLANDS)
    paths["dragonstone"] = " ".join(
        fmt(blob(cx, cy, rx, ry, sd)) for cx, cy, rx, ry, sd in DRAGONSTONE)

    coastline = fmt(ring_points(COAST_RING))
    islets = " ".join(fmt(blob(cx, cy, rx, ry, sd)) for cx, cy, rx, ry, sd in ISLETS)

    terrain = []
    for kind, cx, cy, rx, ry, count, seed in TERRAIN_CLUSTERS:
        terrain.extend(scatter(kind, cx, cy, rx, ry, count, seed))

    total_pts = sum(p.count(",") for p in paths.values()) + coastline.count(",")

    L = []
    L.append("// " + "=" * 71)
    L.append("// GENERATED FILE — do not edit by hand. Run tools/build_map.py.")
    L.append("//")
    L.append("// Original vector cartography for Westeros. Not traced from any official")
    L.append("// or third-party map: the coastline is generated by recursive midpoint")
    L.append("// displacement over a hand-authored control topology, so it is our own")
    L.append("// work and carries no licensing encumbrance.")
    L.append("//")
    L.append("// Regions are faces of a planar subdivision in which every border is a")
    L.append("// single shared point list, so adjacent regions meet exactly — no gaps,")
    L.append("// no overlaps. Coordinates are in the 700x950 space the app already used;")
    L.append(f"// the map now carries ~{total_pts} coastline points rather than ~90.")
    L.append("// " + "=" * 71)
    L.append("")
    L.append("// The drawing viewBox is wider than the landmass so there is open sea")
    L.append("// around Westeros for the ocean texture and the sea labels to live in.")
    L.append('const MAP_VIEWBOX = "-90 -60 880 1090";')
    L.append("")
    L.append("const MAP_REGIONS = [")
    for rid in ORDER:
        name, house, seat, blurb = REGION_META[rid]
        sx, sy = SEAT_XY[rid]
        lx, ly, ls = REGION_LABELS[rid]
        L.append("  {")
        L.append(f"    id: {js(rid)}, name: {js(name)}, house: {js(house)}, seat: {js(seat)},")
        L.append(f"    seatXY: [{sx}, {sy}], labelXY: [{lx}, {ly}], labelSize: {ls},")
        L.append(f"    blurb: {js(blurb)},")
        L.append(f"    path: {js(paths[rid])}")
        L.append("  },")
    L.append("];")
    L.append("")
    L.append("// Outer silhouette of the mainland — used for the landmass drop-shadow")
    L.append("// and the coastal ink stroke that runs unbroken around the continent.")
    L.append(f"const MAP_LANDMASS_OUTLINE = {js(coastline)};")
    L.append("")
    L.append("// Uninhabited rocks and small isles. Decorative: not clickable regions.")
    L.append(f"const MAP_ISLETS = {js(islets)};")
    L.append("")
    L.append("// Terrain marks. t = glyph kind, s = scale. Pre-sorted back-to-front so")
    L.append("// overlapping ranges stack the way a hand-drawn map would.")
    L.append("const MAP_TERRAIN = [")
    for g in terrain:
        L.append(f'  {{ t: {js(g["t"])}, x: {js(g["x"])}, y: {js(g["y"])}, s: {js(g["s"])} }},')
    L.append("];")
    L.append("")
    L.append("const MAP_SETTLEMENTS = [")
    for nm, x, y, kind in SETTLEMENTS:
        L.append(f'  {{ name: {js(nm)}, x: {x}, y: {y}, kind: {js(kind)} }},')
    L.append("];")
    L.append("")
    L.append("const MAP_SEA_LABELS = [")
    for nm, x, y, rot, size in SEA_LABELS:
        L.append(f'  {{ name: {js(nm)}, x: {x}, y: {y}, rot: {rot}, size: {size} }},')
    L.append("];")
    L.append("")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))

    print(f"wrote {OUT}")
    print(f"  regions      : {len(ORDER)}")
    print(f"  coast points : ~{total_pts}")
    print(f"  terrain marks: {len(terrain)}")
    print(f"  settlements  : {len(SETTLEMENTS)}")
    print(f"  size         : {os.path.getsize(OUT)/1024:.0f} KB")


if __name__ == "__main__":
    main()
