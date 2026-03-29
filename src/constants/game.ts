export const SHIFT = 7;
export const MAX_GUESSES = 6;

export const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "⌫"],
] as const;

export const ALL_KEYS = KEYBOARD_ROWS.flat() as string[];
