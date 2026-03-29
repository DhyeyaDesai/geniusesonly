import { getTileColors, type TileColor } from "../utils/tileColors";
import { colorMap, borderMap, shadowMap } from "../theme/maps";

// CSS custom properties --tile-color and --tile-shadow are set inline here
// and consumed by @keyframes flip in index.css. Keep names in sync.

type Props = {
  guess: string;
  answer: string;
  isSubmitted: boolean;
  shake: boolean;
  winBounce?: boolean;
};

function getTileClass(isSubmitted: boolean, winBounce: boolean, shake: boolean, isTbd: boolean) {
  if (isSubmitted) return winBounce ? "tile win-tile" : "tile flip";
  if (shake)       return "tile shake";
  if (isTbd)       return "tile has-letter";
  return "tile";
}

export function TileRow({ guess, answer, isSubmitted, shake, winBounce = false }: Props) {
  const len = answer.length;
  const colors = isSubmitted ? getTileColors(guess.toLowerCase(), answer.toLowerCase()) : [];
  const guessArr = guess.split("");

  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
      {Array.from({ length: len }, (_, i) => {
        const letter = guessArr[i] ?? "";
        const status: TileColor = isSubmitted ? colors[i] : letter ? "tbd" : "empty";
        const isTbd = !isSubmitted && status === "tbd";

        return (
          <div
            key={`${i}-${letter}`}
            className={getTileClass(isSubmitted, winBounce, shake, isTbd)}
            style={{
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-text)",
              textTransform: "uppercase",
              borderRadius: 4,
              // tbd tiles: border comes from CSS rainbow-glow animation via box-shadow
              border: isTbd ? "none" : `2px solid ${borderMap[status]}`,
              // winBounce: set explicitly so background persists after flip animation ends
              backgroundColor: winBounce ? colorMap[status] : (isSubmitted ? undefined : colorMap[status]),
              boxShadow: winBounce ? shadowMap[status] : undefined,
              animationDelay:
                isSubmitted && !winBounce
                  ? `${i * 0.3}s`
                  : winBounce
                    ? `${i * 0.07}s`
                    : undefined,
              ["--tile-color"  as string]: colorMap[status],
              ["--tile-shadow" as string]: isSubmitted ? shadowMap[status] : "none",
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}
