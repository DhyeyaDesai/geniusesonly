import type { TileColor } from "../utils/tileColors";

// These maps reference CSS custom properties defined in index.css.
// The keys "--tile-color" and "--tile-shadow" are set as inline CSS variables
// on each tile in TileRow.tsx and consumed by the @keyframes flip animation in index.css.

export const colorMap: Record<TileColor, string> = {
  correct: "var(--color-correct)",
  present: "var(--color-present)",
  absent:  "var(--color-absent)",
  tbd:     "transparent",
  empty:   "transparent",
};

export const borderMap: Record<TileColor, string> = {
  correct: "transparent",
  present: "transparent",
  absent:  "transparent",
  tbd:     "var(--color-border-filled)",
  empty:   "var(--color-border-empty)",
};

// Box-shadow values applied to tiles after their flip animation reveals the color.
// See @keyframes flip in index.css — the --tile-shadow variable is read at the 100% keyframe.
export const shadowMap: Record<TileColor, string> = {
  correct: "0 0 16px rgba(34, 197, 94, 0.8)",
  present: "0 0 16px rgba(245, 158, 11, 0.8)",
  absent:  "0 0 12px rgba(139, 92, 246, 0.6)",
  tbd:     "none",
  empty:   "none",
};

export const RAINBOW_GRADIENT =
  "linear-gradient(90deg,#ff3366,#ff8c00,#ffe600,#00e676,#00b4ff,#9c27b0)";
