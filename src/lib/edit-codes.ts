import crypto from "node:crypto";

const editCodeWords = [
  "able", "acid", "aide", "airy", "ajar", "aloe", "alto", "amen", "apex", "aqua",
  "arch", "atom", "aunt", "avon", "axis", "baby", "bake", "balm",
  "band", "bank", "barn", "bash", "beam", "bear", "beet", "bell", "bend", "berg",
  "bird", "blue", "boat", "bold", "bolt", "book", "bowl", "brim", "brow",
  "buck", "bulb", "burl", "bush", "cafe", "calm", "cape", "card", "care", "cart",
  "cash", "cede", "cell", "chap", "char", "chef", "chin", "clam", "clay", "clio",
  "club", "coal", "coda", "coil", "coin", "cove", "crag", "crop",
  "crow", "dahl", "dare", "dawn", "dean", "deck", "deer", "dell", "denn", "dime",
  "dive", "dock", "dove", "drum", "duck", "dune", "echo", "edge", "elan", "envy",
  "etch", "ever", "fair", "farm", "fern", "fife", "film", "firn",
  "fish", "flax", "flor", "foal", "foam", "fond", "font",
  "ford", "fork", "fret", "gale", "game", "garn", "gate", "gear", "glad", "glee",
  "glen", "glow", "goal", "goat", "gold", "golf", "grit", "grow", "gust", "gyro",
  "hail", "halo", "harp", "haze", "heap", "heml", "herb", "hide", "hill", "hive",
  "holm", "home", "hook", "hope", "iris", "jade", "jazz", "jolt", "june",
  "keen", "kelp", "kent", "kest", "kiln", "kind", "kite", "kiwi", "knob", "lace",
  "lake", "lamb", "land", "lark", "lava", "leaf", "lens", "lime", "lint",
  "lion", "loft", "loom", "lore", "luna", "lyra", "mace",
  "mare", "marl", "mash", "mead", "mesa", "mica", "mint", "mira", "miso", "mist",
  "mole", "moss", "moth", "muse", "myth", "navy", "nest", "nick", "nova", "oaky",
  "oath", "oats", "onyx", "opal", "orch", "oval", "palm", "park", "path", "pear",
  "peat", "penn", "perk", "pine", "pink", "plum", "poem", "pond", "port",
  "pose", "puff", "puma", "quay", "rain", "reef", "reed", "rest", "rhea", "rind",
  "rift", "ring", "rise", "roam", "roan", "rook", "root", "rose", "ruby", "rust",
  "sage", "sail", "salt", "sand", "scar", "scot", "seed", "self", "silk", "skye", "smok", "snow",
  "soar", "soil", "song", "spar", "spot", "spry", "star", "stem", "stew", "stoa",
  "surf", "swan", "tale", "teal", "temp", "tern", "thaw", "tide",
  "tile", "time", "toad", "torc", "toss", "trap", "tree", "turf",
  "turn", "twig", "vale", "veil", "vent", "verb", "vine", "vise", "wave", "weft",
  "whim", "will", "wind", "wing", "wisp", "wolf", "wood", "wren", "yarn",
  "yoke", "zeal", "zest", "zinc", "zone"
];

export function normalizeEditCode(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEditCode(value: string) {
  return /^[a-z]{4}$/.test(value);
}

export function generateUniqueEditCode(existingCodes: Iterable<string>) {
  const taken = new Set(Array.from(existingCodes, normalizeEditCode));

  if (taken.size >= editCodeWords.length) {
    throw new Error("No edit codes available.");
  }

  for (let attempt = 0; attempt < editCodeWords.length * 2; attempt += 1) {
    const candidate = editCodeWords[crypto.randomInt(editCodeWords.length)];
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  for (const candidate of editCodeWords) {
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("No edit codes available.");
}
