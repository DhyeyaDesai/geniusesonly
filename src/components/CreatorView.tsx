import { useState } from "react";
import { encode } from "../utils/codec";
import { validateWord } from "../utils/wordValidator";
import { ThemeProvider } from "../theme/ThemeContext";
import { ThemeSelector } from "./ThemeSelector";
import { ThemeBackground } from "./ThemeBackground";
import { DEFAULT_THEME_ID, type ThemeId } from "../theme/themes";

export function CreatorView() {
  const [word, setWord] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  const handleCreate = async () => {
    const w = word.trim().toLowerCase();
    if (!w.length) return;
    if (!/^[a-z]+$/.test(w)) { setError("Letters only."); return; }

    setValidating(true);
    setError("");
    const valid = await validateWord(w);
    setValidating(false);

    if (!valid) { setError("Not a valid English word."); return; }

    const base = window.location.origin + window.location.pathname;
    setShareLink(`${base}?h=${encode(w)}&t=${themeId}`);
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value.replace(/[^a-zA-Z]/g, ""));
    setError("");
    setShareLink("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeChange = (id: ThemeId) => {
    setThemeId(id);
    setShareLink("");
  };

  return (
    <ThemeProvider themeId={themeId}>
      <ThemeBackground />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <h1>GENIUSES ONLY</h1>
        <p className="subtitle">Create a wordle puzzle for your friends</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
          <ThemeSelector selected={themeId} onChange={handleThemeChange} />

          <input
            value={word}
            onChange={handleWordChange}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Enter any word"
            className="creator-input"
          />

          <button
            onClick={handleCreate}
            disabled={validating || !word.trim()}
            className="creator-btn"
            style={{
              background: validating ? "var(--color-absent)" : "var(--title-gradient)",
              backgroundSize: "300% auto",
              animation: validating ? "none" : "rainbow-shift 3s linear infinite",
            }}
          >
            {validating ? "Checking..." : "Create Puzzle"}
          </button>

          {error && (
            <p style={{ color: "var(--color-error)", fontSize: 14, textAlign: "center" }}>
              {error}
            </p>
          )}

          {shareLink && (
            <div className="share-box">
              <p style={{ fontSize: 13, color: "var(--color-subtle)", margin: "0 0 8px" }}>
                Share this link:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={shareLink} className="share-input" />
                <button
                  onClick={handleCopy}
                  className="copy-btn"
                  style={{
                    background: copied ? "var(--color-correct)" : "var(--title-gradient)",
                    backgroundSize: "300% auto",
                    animation: copied ? "none" : "rainbow-shift 3s linear infinite",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
