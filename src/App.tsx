import { useState, useEffect, useCallback } from "react";

const SHIFT = 7;
const MAX_GUESSES = 6;

const encode = (word: string): string =>
  btoa(word.split("").map(c => String.fromCharCode(c.charCodeAt(0) + SHIFT)).join(""));

const decode = (hash: string): string | null => {
  try {
    return atob(hash).split("").map(c => String.fromCharCode(c.charCodeAt(0) - SHIFT)).join("");
  } catch {
    return null;
  }
};

const validateWord = async (word: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return res.ok;
  } catch {
    return false;
  }
};

type TileColor = "correct" | "present" | "absent" | "tbd" | "empty";

const getTileColors = (guess: string, answer: string): TileColor[] => {
  const answerArr = answer.split("");
  const guessArr = guess.split("");
  const colors: TileColor[] = Array(answer.length).fill("absent");
  const remaining = [...answerArr];

  guessArr.forEach((l, i) => {
    if (l === answerArr[i]) {
      colors[i] = "correct";
      remaining[remaining.indexOf(l)] = "";
    }
  });
  guessArr.forEach((l, i) => {
    if (colors[i] !== "correct" && remaining.includes(l)) {
      colors[i] = "present";
      remaining[remaining.indexOf(l)] = "";
    }
  });
  return colors;
};

const colorMap: Record<string, string> = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
  tbd: "transparent",
  empty: "transparent",
};

const borderMap: Record<string, string> = {
  correct: "transparent",
  present: "transparent",
  absent: "transparent",
  tbd: "#565656",
  empty: "#3a3a3c",
};

function TileRow({ guess, answer, isSubmitted, shake }: {
  guess: string; answer: string; isSubmitted: boolean; shake: boolean;
}) {
  const len = answer.length;
  const colors = isSubmitted ? getTileColors(guess.toLowerCase(), answer.toLowerCase()) : [];
  const guessArr = guess.split("");

  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
      {Array.from({ length: len }, (_, i) => {
        const letter = guessArr[i] || "";
        const status: TileColor = isSubmitted ? colors[i] : letter ? "tbd" : "empty";
        return (
          <div key={i} style={{
            width: 52, height: 52,
            border: `2px solid ${borderMap[status]}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, color: "#fff", textTransform: "uppercase",
            backgroundColor: colorMap[status],
            borderRadius: 4,
            animation: isSubmitted ? `flip 0.5s ease ${i * 0.15}s both` : shake ? "shake 0.3s ease" : "none",
          }}>{letter}</div>
        );
      })}
    </div>
  );
}

function Keyboard({ usedLetters, onKey }: {
  usedLetters: Record<string, TileColor>; onKey: (key: string) => void;
}) {
  const rows = [
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["Enter","z","x","c","v","b","n","m","⌫"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", marginTop: 16 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 5 }}>
          {row.map(k => {
            const status = usedLetters[k];
            const bg = status ? colorMap[status] : "#818384";
            return (
              <button key={k} onClick={() => onKey(k)} style={{
                padding: "14px 0", minWidth: k.length > 1 ? 58 : 36,
                backgroundColor: bg, color: "#fff", border: "none", borderRadius: 4,
                fontSize: k.length > 1 ? 11 : 16, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase",
              }}>{k}</button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get("h");
  const decodedWord = hash ? decode(hash) : null;
  const isPlayMode = !!decodedWord;

  // Creator state
  const [creatorWord, setCreatorWord] = useState("");
  const [validating, setValidating] = useState(false);
  const [creatorError, setCreatorError] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Player state
  const answer = decodedWord ? decodedWord.toLowerCase() : "";
  const wordLen = answer.length || 5;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [usedLetters, setUsedLetters] = useState<Record<string, TileColor>>({});
  const [validatingGuess, setValidatingGuess] = useState(false);

  const showMessage = (msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  // Creator
  const handleCreate = async () => {
    const w = creatorWord.trim().toLowerCase();
    if (!w.length) return;
    if (!/^[a-z]+$/.test(w)) { setCreatorError("Letters only."); return; }
    setValidating(true); setCreatorError("");
    const valid = await validateWord(w);
    setValidating(false);
    if (!valid) { setCreatorError("Not a valid English word."); return; }
    const encoded = encode(w);
    const base = window.location.origin + window.location.pathname;
    setShareLink(`${base}?h=${encoded}`);
  };

  // Player
  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== wordLen) {
      showMessage(`Must be ${wordLen} letters`);
      triggerShake();
      return;
    }
    setValidatingGuess(true);
    const valid = await validateWord(currentGuess);
    setValidatingGuess(false);
    if (!valid) { showMessage("Not a valid word"); triggerShake(); return; }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    const newUsed = { ...usedLetters };
    const colors = getTileColors(currentGuess, answer);
    currentGuess.split("").forEach((l, i) => {
      const c = colors[i];
      if (c === "correct") newUsed[l] = "correct";
      else if (c === "present" && newUsed[l] !== "correct") newUsed[l] = "present";
      else if (!newUsed[l]) newUsed[l] = "absent";
    });
    setUsedLetters(newUsed);
    setCurrentGuess("");

    if (currentGuess === answer) {
      setTimeout(() => { setWon(true); setGameOver(true); showMessage("Brilliant! 🎉", 3000); }, wordLen * 150 + 500);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => { setGameOver(true); showMessage(answer.toUpperCase(), 5000); }, wordLen * 150 + 500);
    }
  }, [currentGuess, guesses, answer, wordLen, usedLetters]);

  const handleKey = useCallback((key: string) => {
    if (gameOver || validatingGuess) return;
    if (key === "⌫" || key === "Backspace") { setCurrentGuess(p => p.slice(0, -1)); return; }
    if (key === "Enter") { submitGuess(); return; }
    if (/^[a-zA-Z]$/.test(key) && currentGuess.length < wordLen) {
      setCurrentGuess(p => p + key.toLowerCase());
    }
  }, [gameOver, validatingGuess, currentGuess, wordLen, submitGuess]);

  useEffect(() => {
    if (!isPlayMode) return;
    const handler = (e: KeyboardEvent) => handleKey(e.key);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlayMode, handleKey]);

  const shareResults = () => {
    const emoji = guesses.map(g => {
      const colors = getTileColors(g, answer);
      return colors.map(c => c === "correct" ? "🟩" : c === "present" ? "🟨" : "⬛").join("");
    }).join("\n");
    const text = `Custom Wordle (${wordLen} letters) ${won ? guesses.length : "X"}/${MAX_GUESSES}\n\n${emoji}`;
    navigator.clipboard.writeText(text);
    showMessage("Copied results!");
  };

  // --- Creator View ---
  if (!isPlayMode) {
    return (
      <div className="container">
        <h1>GENIUSES ONLY</h1>
        <p className="subtitle">Create a wordle puzzle for your friends</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
          <input
            value={creatorWord}
            onChange={e => { setCreatorWord(e.target.value.replace(/[^a-zA-Z]/g, "")); setCreatorError(""); setShareLink(""); }}
            placeholder="Enter any word"
            style={{
              padding: "14px 16px", fontSize: 18, borderRadius: 8, border: "2px solid #3a3a3c",
              backgroundColor: "#1a1a1b", color: "#fff", outline: "none", textAlign: "center",
              letterSpacing: 4, textTransform: "uppercase", fontWeight: 700,
            }}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
          />
          <button onClick={handleCreate} disabled={validating || !creatorWord.trim()}
            style={{
              padding: "14px", fontSize: 16, fontWeight: 700, borderRadius: 8, border: "none",
              backgroundColor: validating ? "#3a3a3c" : "#538d4e", color: "#fff", cursor: "pointer",
            }}
          >{validating ? "Checking..." : "Create Puzzle"}</button>
          {creatorError && <p style={{ color: "#e04040", fontSize: 14, textAlign: "center" }}>{creatorError}</p>}
          {shareLink && (
            <div style={{ backgroundColor: "#1a1a1b", borderRadius: 8, padding: 16, marginTop: 8 }}>
              <p style={{ fontSize: 13, color: "#818384", margin: "0 0 8px" }}>Share this link:</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={shareLink} style={{
                  flex: 1, padding: "10px 12px", fontSize: 13, borderRadius: 6,
                  border: "1px solid #3a3a3c", backgroundColor: "#121213", color: "#fff",
                }} />
                <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{
                    padding: "10px 16px", borderRadius: 6, border: "none",
                    backgroundColor: copied ? "#538d4e" : "#818384", color: "#fff",
                    fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >{copied ? "Copied!" : "Copy"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Play View ---
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) return <TileRow key={i} guess={guesses[i]} answer={answer} isSubmitted shake={false} />;
    if (i === guesses.length) return <TileRow key={i} guess={currentGuess} answer={answer} isSubmitted={false} shake={shake} />;
    return <TileRow key={i} guess="" answer={answer} isSubmitted={false} shake={false} />;
  });

  return (
    <div className="container">
      <h1>GENIUSES ONLY</h1>
      <p className="subtitle">{wordLen} letters · {MAX_GUESSES} guesses</p>

      {message && <div className="toast">{message}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>{rows}</div>

      {gameOver && won && (
        <button onClick={shareResults} style={{
          marginTop: 12, padding: "12px 24px", backgroundColor: "#538d4e", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>Share Results</button>
      )}

      <Keyboard usedLetters={usedLetters} onKey={handleKey} />

      {validatingGuess && <p style={{ color: "#818384", fontSize: 13, marginTop: 8 }}>Checking word...</p>}
    </div>
  );
}
