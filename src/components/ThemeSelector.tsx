import { THEME_LIST, type ThemeId } from "../theme/themes";

type Props = {
  selected: ThemeId;
  onChange: (id: ThemeId) => void;
};

export function ThemeSelector({ selected, onChange }: Props) {
  return (
    <div style={{ width: "100%", maxWidth: 340 }}>
      <p style={{
        fontSize: 12,
        color: "var(--color-subtle)",
        margin: "0 0 8px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        Theme
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 6,
      }}>
        {THEME_LIST.map((theme) => {
          const isSelected = theme.id === selected;
          return (
            <button
              key={theme.id}
              onClick={() => onChange(theme.id)}
              title={theme.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "8px 4px",
                background: isSelected ? "var(--color-border-filled)" : "var(--color-key-bg)",
                border: isSelected
                  ? "2px solid var(--color-correct)"
                  : "2px solid transparent",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s ease",
                transform: isSelected ? "scale(1.08)" : "scale(1)",
                boxShadow: isSelected ? "0 0 10px var(--color-correct)" : "none",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{theme.emoji}</span>
              <span style={{
                fontSize: 9,
                color: "var(--color-text)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}>
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
