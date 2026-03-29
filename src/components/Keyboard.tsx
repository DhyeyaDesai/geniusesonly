import { useState } from "react";
import { KEYBOARD_ROWS } from "../constants/game";
import { colorMap } from "../theme/maps";
import { rainbowKeyBg } from "../theme/rainbowKeys";
import type { TileColor } from "../utils/tileColors";

type Props = {
  usedLetters: Record<string, TileColor>;
  onKey: (key: string) => void;
};

export function Keyboard({ usedLetters, onKey }: Props) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handlePress = (key: string) => {
    onKey(key);
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 120);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginTop: 16 }}>
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 5 }}>
          {row.map((key) => {
            const status = usedLetters[key];
            const background = status ? colorMap[status] : (rainbowKeyBg[key] ?? "var(--color-key-bg)");
            const isPressed = pressedKey === key;

            return (
              <button
                key={key}
                onClick={() => handlePress(key)}
                style={{
                  padding: "14px 0",
                  minWidth: key.length > 1 ? 58 : 36,
                  background,
                  color: "var(--color-text)",
                  border: "none",
                  borderRadius: 4,
                  fontSize: key.length > 1 ? 11 : 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transform: isPressed ? "scale(0.88)" : "scale(1)",
                  boxShadow: isPressed ? "none" : "0 3px 0 rgba(0,0,0,0.4)",
                  transition: "transform 0.08s ease, box-shadow 0.08s ease",
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
