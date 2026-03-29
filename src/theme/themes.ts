export type ThemeId =
  | "flowers"
  | "rainbow"
  | "love"
  | "scary"
  | "space"
  | "ocean"
  | "neon"
  | "fire"
  | "ice"
  | "spicy";

export type Theme = {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  /** CSS custom property values injected on the wrapper element */
  vars: {
    "--color-bg": string;
    "--color-text": string;
    "--color-subtle": string;
    "--color-border-empty": string;
    "--color-border-filled": string;
    "--color-correct": string;
    "--color-present": string;
    "--color-absent": string;
    "--color-error": string;
    "--color-key-bg": string;
    "--shadow-correct": string;
    "--shadow-present": string;
    "--shadow-absent": string;
    /** Gradient used for the title, buttons, and accents */
    "--title-gradient": string;
  };
  /** Per-key background for unused keyboard keys */
  keyHue: (keyIndex: number, total: number) => string;
  /** Secret word that triggers the easter egg */
  easterEgg: string;
  easterEggLabel: string;
};

const THEMES: Record<ThemeId, Theme> = {
  flowers: {
    id: "flowers",
    name: "Flowers",
    emoji: "🌸",
    tagline: "Petals in the wind",
    vars: {
      "--color-bg":           "#0a3a6a",
      "--color-text":         "#ffe8f5",
      "--color-subtle":       "#cc88bb",
      "--color-border-empty": "#1a1040",
      "--color-border-filled":"#dd66bb",
      "--color-correct":      "#ff44aa",
      "--color-present":      "#ffbb44",
      "--color-absent":       "#4a1a60",
      "--color-error":        "#ff4466",
      "--color-key-bg":       "#1a0a30",
      "--shadow-correct":     "0 0 18px rgba(255,68,170,0.85)",
      "--shadow-present":     "0 0 16px rgba(255,187,68,0.80)",
      "--shadow-absent":      "0 0 10px rgba(74,26,96,0.55)",
      "--title-gradient":     "linear-gradient(90deg,#ff44aa,#ffbb44,#ff88cc,#aa44ff,#ff44aa,#ffbb44,#ff44aa)",
    },
    keyHue: (i: number, n: number) => `hsl(${300 + Math.round((i / (n - 1)) * 60)},70%,28%)`,
    easterEgg: "bloom",
    easterEggLabel: "🌸 The garden blooms!",
  },

  rainbow: {
    id: "rainbow",
    name: "Rainbow",
    emoji: "🌈",
    tagline: "All the colors",
    vars: {
      "--color-bg":           "#0d0d1a",
      "--color-text":         "#ffffff",
      "--color-subtle":       "#8888aa",
      "--color-border-empty": "#333355",
      "--color-border-filled":"#8866cc",
      "--color-correct":      "#22c55e",
      "--color-present":      "#f59e0b",
      "--color-absent":       "#8b5cf6",
      "--color-error":        "#f87171",
      "--color-key-bg":       "#2a2a3f",
      "--shadow-correct":     "0 0 16px rgba(34,197,94,0.8)",
      "--shadow-present":     "0 0 16px rgba(245,158,11,0.8)",
      "--shadow-absent":      "0 0 12px rgba(139,92,246,0.6)",
      "--title-gradient":     "linear-gradient(90deg,#ff3366,#ff8c00,#ffe600,#00e676,#00b4ff,#9c27b0,#ff3366)",
    },
    keyHue: (i, n) => `hsl(${Math.round((i / (n - 1)) * 300)},70%,35%)`,
    easterEgg: "color",
    easterEggLabel: "🌈 True colors revealed!",
  },

  love: {
    id: "love",
    name: "Love",
    emoji: "❤️",
    tagline: "Straight from the heart",
    vars: {
      "--color-bg":           "#1a0010",
      "--color-text":         "#ffe0ec",
      "--color-subtle":       "#cc6688",
      "--color-border-empty": "#4d1030",
      "--color-border-filled":"#ff4488",
      "--color-correct":      "#ff1a6e",
      "--color-present":      "#ff8fab",
      "--color-absent":       "#a03060",
      "--color-error":        "#ff6666",
      "--color-key-bg":       "#3d0020",
      "--shadow-correct":     "0 0 18px rgba(255,26,110,0.85)",
      "--shadow-present":     "0 0 16px rgba(255,143,171,0.7)",
      "--shadow-absent":      "0 0 12px rgba(160,48,96,0.6)",
      "--title-gradient":     "linear-gradient(90deg,#ff1a6e,#ff4488,#ff8fab,#ff4488,#ff1a6e,#ff4488,#ff1a6e)",
    },
    keyHue: (i, n) => `hsl(${330 + Math.round((i / (n - 1)) * 30)},75%,32%)`,
    easterEgg: "heart",
    easterEggLabel: "💕 Love is in the air!",
  },

  scary: {
    id: "scary",
    name: "Scary",
    emoji: "🎃",
    tagline: "Things that go bump",
    vars: {
      "--color-bg":           "#0a0a00",
      "--color-text":         "#ff8c00",
      "--color-subtle":       "#886600",
      "--color-border-empty": "#2a1a00",
      "--color-border-filled":"#cc5500",
      "--color-correct":      "#ff6600",
      "--color-present":      "#cc00cc",
      "--color-absent":       "#334400",
      "--color-error":        "#ff3300",
      "--color-key-bg":       "#1a0e00",
      "--shadow-correct":     "0 0 18px rgba(255,102,0,0.85)",
      "--shadow-present":     "0 0 16px rgba(204,0,204,0.7)",
      "--shadow-absent":      "0 0 10px rgba(51,68,0,0.5)",
      "--title-gradient":     "linear-gradient(90deg,#ff6600,#cc00cc,#ff3300,#cc00cc,#ff6600,#cc00cc,#ff6600)",
    },
    keyHue: (i, n) => {
      const t = i / (n - 1);
      return t < 0.5
        ? `hsl(${Math.round(t * 2 * 30)},80%,28%)`
        : `hsl(${280 + Math.round((t - 0.5) * 2 * 20)},70%,25%)`;
    },
    easterEgg: "ghost",
    easterEggLabel: "👻 Boo! You found the ghost!",
  },

  space: {
    id: "space",
    name: "Space",
    emoji: "🚀",
    tagline: "Final frontier",
    vars: {
      "--color-bg":           "#020612",
      "--color-text":         "#c8d8ff",
      "--color-subtle":       "#4466aa",
      "--color-border-empty": "#0a1530",
      "--color-border-filled":"#2255bb",
      "--color-correct":      "#00c8ff",
      "--color-present":      "#aa44ff",
      "--color-absent":       "#224488",
      "--color-error":        "#ff4466",
      "--color-key-bg":       "#081020",
      "--shadow-correct":     "0 0 20px rgba(0,200,255,0.85)",
      "--shadow-present":     "0 0 18px rgba(170,68,255,0.8)",
      "--shadow-absent":      "0 0 12px rgba(34,68,136,0.6)",
      "--title-gradient":     "linear-gradient(90deg,#00c8ff,#aa44ff,#00c8ff,#aa44ff,#00c8ff,#aa44ff,#00c8ff)",
    },
    keyHue: (i, n) => `hsl(${210 + Math.round((i / (n - 1)) * 60)},65%,30%)`,
    easterEgg: "stars",
    easterEggLabel: "⭐ The stars align!",
  },

  ocean: {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    tagline: "Deep blue wonder",
    vars: {
      "--color-bg":           "#00080f",
      "--color-text":         "#a0e8ff",
      "--color-subtle":       "#2288aa",
      "--color-border-empty": "#001830",
      "--color-border-filled":"#0088cc",
      "--color-correct":      "#00d4aa",
      "--color-present":      "#0099ff",
      "--color-absent":       "#004466",
      "--color-error":        "#ff6655",
      "--color-key-bg":       "#001428",
      "--shadow-correct":     "0 0 18px rgba(0,212,170,0.85)",
      "--shadow-present":     "0 0 18px rgba(0,153,255,0.8)",
      "--shadow-absent":      "0 0 12px rgba(0,68,102,0.5)",
      "--title-gradient":     "linear-gradient(90deg,#00d4aa,#0099ff,#00d4aa,#0099ff,#00d4aa,#0099ff,#00d4aa)",
    },
    keyHue: (i, n) => `hsl(${185 + Math.round((i / (n - 1)) * 40)},70%,28%)`,
    easterEgg: "whale",
    easterEggLabel: "🐋 A whale appears!",
  },

  neon: {
    id: "neon",
    name: "Neon",
    emoji: "⚡",
    tagline: "Synthwave city",
    vars: {
      "--color-bg":           "#080010",
      "--color-text":         "#ff00ff",
      "--color-subtle":       "#880088",
      "--color-border-empty": "#200030",
      "--color-border-filled":"#cc00cc",
      "--color-correct":      "#00ff88",
      "--color-present":      "#ff00cc",
      "--color-absent":       "#4400aa",
      "--color-error":        "#ff2200",
      "--color-key-bg":       "#140020",
      "--shadow-correct":     "0 0 20px rgba(0,255,136,0.9)",
      "--shadow-present":     "0 0 20px rgba(255,0,204,0.9)",
      "--shadow-absent":      "0 0 14px rgba(68,0,170,0.65)",
      "--title-gradient":     "linear-gradient(90deg,#00ff88,#ff00cc,#00ff88,#ff00cc,#00ff88,#ff00cc,#00ff88)",
    },
    keyHue: (i, _n) => {
      const hue = i % 2 === 0 ? 290 : 150;
      return `hsl(${hue},90%,30%)`;
    },
    easterEgg: "cyber",
    easterEggLabel: "🤖 Welcome to the grid!",
  },


  fire: {
    id: "fire",
    name: "Fire",
    emoji: "🔥",
    tagline: "Burn it down",
    vars: {
      "--color-bg":           "#0f0200",
      "--color-text":         "#ffcc88",
      "--color-subtle":       "#884400",
      "--color-border-empty": "#2a0800",
      "--color-border-filled":"#cc3300",
      "--color-correct":      "#ff8800",
      "--color-present":      "#ff3300",
      "--color-absent":       "#441100",
      "--color-error":        "#ff1100",
      "--color-key-bg":       "#1a0500",
      "--shadow-correct":     "0 0 20px rgba(255,136,0,0.9)",
      "--shadow-present":     "0 0 18px rgba(255,51,0,0.85)",
      "--shadow-absent":      "0 0 10px rgba(68,17,0,0.5)",
      "--title-gradient":     "linear-gradient(90deg,#ff1100,#ff8800,#ffe600,#ff8800,#ff1100,#ff8800,#ff1100)",
    },
    keyHue: (i, n) => `hsl(${Math.round((i / (n - 1)) * 40)},85%,30%)`,
    easterEgg: "blaze",
    easterEggLabel: "🔥 Blazing hot!",
  },

  ice: {
    id: "ice",
    name: "Ice",
    emoji: "❄️",
    tagline: "Cool as frost",
    vars: {
      "--color-bg":           "#020810",
      "--color-text":         "#d0f4ff",
      "--color-subtle":       "#4488aa",
      "--color-border-empty": "#0a1a2a",
      "--color-border-filled":"#4499cc",
      "--color-correct":      "#88ddff",
      "--color-present":      "#aaccff",
      "--color-absent":       "#1a3a55",
      "--color-error":        "#ff6688",
      "--color-key-bg":       "#081020",
      "--shadow-correct":     "0 0 20px rgba(136,221,255,0.85)",
      "--shadow-present":     "0 0 18px rgba(170,204,255,0.8)",
      "--shadow-absent":      "0 0 12px rgba(26,58,85,0.5)",
      "--title-gradient":     "linear-gradient(90deg,#88ddff,#d0f4ff,#aaccff,#d0f4ff,#88ddff,#d0f4ff,#88ddff)",
    },
    keyHue: (i, n) => `hsl(${195 + Math.round((i / (n - 1)) * 30)},60%,28%)`,
    easterEgg: "frost",
    easterEggLabel: "❄️ Frozen in time!",
  },

  spicy: {
    id: "spicy",
    name: "Spicy",
    emoji: "🍆",
    tagline: "18+ only 🔞",
    vars: {
      "--color-bg":           "#1a0428",
      "--color-text":         "#ffddcc",
      "--color-subtle":       "#aa5533",
      "--color-border-empty": "#2a0040",
      "--color-border-filled":"#8800cc",
      "--color-correct":      "#cc2255",
      "--color-present":      "#ff9944",
      "--color-absent":       "#4a1060",
      "--color-error":        "#ff1133",
      "--color-key-bg":       "#180028",
      "--shadow-correct":     "0 0 20px rgba(204,34,85,0.9)",
      "--shadow-present":     "0 0 18px rgba(255,153,68,0.85)",
      "--shadow-absent":      "0 0 12px rgba(74,16,96,0.6)",
      "--title-gradient":     "linear-gradient(90deg,#6600cc,#cc0044,#ff8833,#cc0044,#6600cc,#cc0044,#6600cc)",
    },
    keyHue: (i, n) => {
      const t = i / (n - 1);
      return t < 0.5
        ? `hsl(${270 + Math.round(t * 2 * 30)},70%,28%)`
        : `hsl(${20 + Math.round((t - 0.5) * 2 * 20)},75%,28%)`;
    },
    easterEgg: "naked",
    easterEggLabel: "🍑 Oh my! Nothing to hide!",
  },
};

export { THEMES };
export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME_ID: ThemeId = "flowers";

export function getTheme(id: string | null | undefined): Theme {
  if (id && id in THEMES) return THEMES[id as ThemeId];
  return THEMES[DEFAULT_THEME_ID];
}
