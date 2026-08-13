const baseUrl = import.meta.env.BASE_URL;

const actorAssets = new Set([
  "aerys-targaryen.jpg", "alliser-thorne.jpg", "archmaester-ebrose.jpg", "arthur-dayne.jpg", "arya-stark.jpg",
  "balon-greyjoy.jpg", "barristan-selmy.jpg", "benjen-stark.jpg", "beric-dondarrion.jpg", "black-walder-frey.jpg",
  "bloodraven.jpg", "bowen-marsh.jpg", "bran-stark.jpg", "brienne-of-tarth.jpg", "bronn.jpg", "brynden-tully.jpg",
  "catelyn-stark.jpg", "cersei-lannister.jpg", "daario-naharis.jpg", "daenerys-targaryen.jpg", "dagmer-cleftjaw.jpg",
  "davos-seaworth.jpg", "dickon-tarly.jpg", "dontos-hollard.jpg", "doran-martell.jpg", "doreah.jpg", "eddison-tollett.jpg",
  "edmure-tully.jpg", "ellaria-sand.jpg", "euron-greyjoy.jpg", "gendry-baratheon.jpg", "gilly.jpg", "gregor-clegane.jpg",
  "grey-worm.jpg", "harry-strickland.jpg", "high-sparrow.jpg", "hizdahr-zo-loraq.jpg", "hodor.jpg", "illyrio-mopatis.jpg",
  "ilyn-payne.jpg", "irri.jpg", "izembaro.jpg", "jaime-lannister.jpg", "janos-slynt.jpg", "jaqen-hghar.jpg",
  "jeor-mormont.jpg", "joffrey-baratheon.jpg", "jojen-reed.jpg", "jon-snow.jpg", "jorah-mormont.jpg", "karl-tanner.jpg",
  "karsi.jpg", "khal-drogo.jpg", "kinvara.jpg", "lady-crane.jpg", "lancel-lannister.jpg", "leaf.jpg", "locke.jpg",
  "loras-tyrell.jpg", "lothar-frey.jpg", "lyanna-mormont.jpg", "lyanna-stark.jpg", "lysa-arryn.jpg", "mace-tyrell.jpg",
  "maester-cressen.jpg", "maester-luwin.jpg", "maggy-the-frog.jpg", "mance-rayder.jpg", "margaery-tyrell.jpg", "meera-reed.jpg",
  "melisandre.jpg", "meryn-trant.jpg", "missandei.jpg", "myrcella-baratheon.jpg", "ned-stark.jpg", "nymeria-sand.jpg",
  "obara-sand.jpg", "oberyn-martell.jpg", "olenna-tyrell.jpg", "orell.jpg", "osha.jpg", "petyr-baelish.jpg", "podrick-payne.jpg",
  "pyat-pree.jpg", "pycelle.jpg", "pyp.jpg", "qyburn.jpg", "rakharo.jpg", "ramsay-bolton.jpg", "randyll-tarly.jpg",
  "renly-baratheon.jpg", "rhaegar-targaryen.jpg", "rickon-stark.jpg", "robb-stark.jpg", "robert-baratheon.jpg", "robett-glover.jpg",
  "robin-arryn.jpg", "rodrik-cassel.jpg", "roose-bolton.jpg", "ros.jpg", "salladhor-saan.jpg", "samwell-tarly.jpg", "sandor-clegane.jpg",
  "sansa-stark.jpg", "selyse-baratheon.jpg", "septa-unella.jpg", "septon-ray.jpg", "shae.jpg", "shireen-baratheon.jpg",
  "stannis-baratheon.jpg", "styr.jpg", "syrio-forel.jpg", "talisa-stark.jpg", "the-night-king.jpg", "the-waif.jpg", "theon-greyjoy.jpg",
  "thoros-of-myr.jpg", "tommen-baratheon.jpg", "tormund-giantsbane.jpg", "trystane-martell.jpg", "tycho-nestoris.jpg", "tyene-sand.jpg",
  "tyrion-lannister.jpg", "tywin-lannister.jpg", "varys.jpg", "viserys-targaryen.jpg", "walda-bolton.jpg", "walder-frey.jpg",
  "wun-wun.jpg", "xaro-xhoan-daxos.jpg", "yara-greyjoy.jpg", "yezzan.jpg", "ygritte.jpg", "yohn-royce.jpg"
]);

const fallbackPortrait = `${baseUrl}generated/northern-guardian-wide.png`;
const fallbackHeraldry = `${baseUrl}generated/heraldry/unaffiliated.png`;

function fileName(value: string | undefined) {
  if (!value) return "";
  try { return decodeURIComponent(value).split(/[\\/]/).pop()?.toLowerCase() || ""; } catch { return value.split(/[\\/]/).pop()?.toLowerCase() || ""; }
}

export function portraitUrl(value?: string) {
  const name = fileName(value);
  return actorAssets.has(name) ? `${baseUrl}actors/${name}` : fallbackPortrait;
}

function houseSlug(value: string) {
  return value.trim().toLowerCase().replace(/[’']s?\b/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function heraldryUrl(value?: string) {
  const slug = houseSlug(value || "");
  const known = slug === "night-watch" || slug === "nights-watch" ? "night-watch" : slug;
  const supported = new Set(["arryn", "baratheon", "free-folk", "greyjoy", "lannister", "martell", "night-watch", "stark", "targaryen", "tully", "tyrell", "unaffiliated"]);
  return supported.has(known) ? `${baseUrl}generated/heraldry/${known}.png` : fallbackHeraldry;
}

export function fallbackAssetUrl() { return fallbackPortrait; }
