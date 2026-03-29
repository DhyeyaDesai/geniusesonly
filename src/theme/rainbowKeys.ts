import { ALL_KEYS } from "../constants/game";

// Assigns a unique rainbow hue to each key, spread evenly across the hue wheel (0–300°).
// Computed once at module load time — not reactive, not a hook.
export const rainbowKeyBg: Record<string, string> = Object.fromEntries(
  ALL_KEYS.map((key, i) => {
    const hue = Math.round((i / (ALL_KEYS.length - 1)) * 300);
    return [key, `hsl(${hue}, 70%, 35%)`];
  })
);
