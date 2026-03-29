import { ALL_KEYS } from "../constants/game";
import type { Theme } from "./themes";

/** Returns a per-key background color map for unused keyboard keys, based on the active theme. */
export function buildKeyColors(theme: Theme): Record<string, string> {
  const total = ALL_KEYS.length;
  return Object.fromEntries(
    ALL_KEYS.map((key, i) => [key, theme.keyHue(i, total)])
  );
}
