import { useState, useEffect, useCallback, useRef } from "react";

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
  correct: "var(--color-correct)",
  present: "var(--color-present)",
  absent:  "var(--color-absent)",
  tbd:     "transparent",
  empty:   "transparent",
};

const borderMap: Record<string, string> = {
  correct: "transparent",
  present: "transparent",
  absent:  "transparent",
  tbd:     "var(--color-border-filled)",
  empty:   "var(--color-border-empty)",
};

const shadowMap: Record<string, string> = {
  correct: "0 0 16px rgba(34, 197, 94, 0.8)",
  present: "0 0 16px rgba(245, 158, 11, 0.8)",
  absent:  "0 0 12px rgba(139, 92, 246, 0.6)",
  tbd:     "none",
  empty:   "none",
};

const ALL_KEYS = ["q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","Enter","z","x","c","v","b","n","m","⌫"];
const rainbowKeyBg: Record<string, string> = {};
ALL_KEYS.forEach((key, i) => {
  const hue = Math.round((i / (ALL_KEYS.length - 1)) * 300);
  rainbowKeyBg[key] = `hsl(${hue}, 70%, 35%)`;
});

// ---- Star Field ----
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 1.8,
      hue: Math.random() * 360,
      speed: 0.3 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
    }));
    let t = 0, animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;
      for (const s of stars) {
        const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 85%, ${pulse * 0.6})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

// ---- Fireworks ----
function Fireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    type Pt = { x: number; y: number };
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; decay: number; hue: number; size: number; trail: Pt[] };
    const particles: Particle[] = [];

    const burst = (x: number, y: number) => {
      const hue = Math.random() * 360;
      const count = 70 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const speed = 1.5 + Math.random() * 5.5;
        particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 1, decay: 0.006 + Math.random() * 0.01,
          hue: hue + Math.random() * 60 - 30,
          size: 2 + Math.random() * 2.5, trail: [],
        });
      }
    };

    let launchCount = 0;
    const launch = () => {
      burst(canvas.width * (0.1 + Math.random() * 0.8), canvas.height * (0.1 + Math.random() * 0.5));
      launchCount++;
      if (launchCount < 22) setTimeout(launch, 180 + Math.random() * 320);
    };
    setTimeout(launch, 50);

    let animId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(13,13,26,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.06; p.vx *= 0.986; p.vy *= 0.986;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        for (let j = 0; j < p.trail.length; j++) {
          const a = (j / p.trail.length) * p.life * 0.3;
          ctx.beginPath();
          ctx.arc(p.trail[j].x, p.trail[j].y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},100%,60%,${a})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,68%,${p.life})`;
        ctx.fill();
      }
      if (particles.length > 0 || launchCount < 22) animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 6 }} />;
}

// ---- Tile Row ----
function TileRow({ guess, answer, isSubmitted, shake, winBounce = false }: {
  guess: string; answer: string; isSubmitted: boolean; shake: boolean; winBounce?: boolean;
}) {
  const len = answer.length;
  const colors = isSubmitted ? getTileColors(guess.toLowerCase(), answer.toLowerCase()) : [];
  const guessArr = guess.split("");

  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
      {Array.from({ length: len }, (_, i) => {
        const letter = guessArr[i] || "";
        const status: TileColor = isSubmitted ? colors[i] : letter ? "tbd" : "empty";
        const isTbd = !isSubmitted && status === "tbd";

        let tileClass = "tile";
        if (isSubmitted)     tileClass = winBounce ? "tile win-tile" : "tile flip";
        else if (shake)      tileClass = "tile shake";
        else if (isTbd)      tileClass = "tile has-letter";

        return (
          <div
            key={`${i}-${letter}`}
            className={tileClass}
            style={{
              width: 52, height: 52,
              border: isTbd ? "none" : `2px solid ${borderMap[status]}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase",
              backgroundColor: winBounce ? colorMap[status] : (isSubmitted ? undefined : colorMap[status]),
              boxShadow: winBounce ? shadowMap[status] : undefined,
              borderRadius: 4,
              animationDelay: (isSubmitted && !winBounce) ? `${i * 0.3}s` : winBounce ? `${i * 0.07}s` : undefined,
              ["--tile-color"  as string]: colorMap[status],
              ["--tile-shadow" as string]: isSubmitted ? shadowMap[status] : "none",
            }}
          >{letter}</div>
        );
      })}
    </div>
  );
}

// ---- Keyboard ----
function Keyboard({ usedLetters, onKey }: {
  usedLetters: Record<string, TileColor>; onKey: (key: string) => void;
}) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
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
            const bg = status ? colorMap[status] : (rainbowKeyBg[k] ?? "var(--color-key-bg)");
            const isPressed = pressedKey === k;
            return (
              <button key={k}
                onClick={() => {
                  onKey(k);
                  setPressedKey(k);
                  setTimeout(() => setPressedKey(null), 120);
                }}
                style={{
                  padding: "14px 0", minWidth: k.length > 1 ? 58 : 36,
                  background: bg, color: "var(--color-text)", border: "none", borderRadius: 4,
                  fontSize: k.length > 1 ? 11 : 16, fontWeight: 700, cursor: "pointer",
                  textTransform: "uppercase",
                  transform: isPressed ? "scale(0.88)" : "scale(1)",
                  boxShadow: isPressed ? "none" : `0 3px 0 rgba(0,0,0,0.4)`,
                  transition: "transform 0.08s ease, box-shadow 0.08s ease",
                }}
              >{k}</button>
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
  const [showWinBounce, setShowWinBounce] = useState(false);
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

  useEffect(() => {
    if (won) {
      const t = setTimeout(() => setShowWinBounce(true), 900);
      return () => clearTimeout(t);
    }
  }, [won]);

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
      <>
        <StarField />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h1>GENIUSES ONLY</h1>
          <p className="subtitle">Create a wordle puzzle for your friends</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
            <input
              value={creatorWord}
              onChange={e => { setCreatorWord(e.target.value.replace(/[^a-zA-Z]/g, "")); setCreatorError(""); setShareLink(""); }}
              placeholder="Enter any word"
              className="creator-input"
              onKeyDown={e => e.key === "Enter" && handleCreate()}
            />
            <button onClick={handleCreate} disabled={validating || !creatorWord.trim()}
              className="creator-btn"
              style={{ background: validating ? "var(--color-absent)" : "linear-gradient(90deg,#ff3366,#ff8c00,#ffe600,#00e676,#00b4ff,#9c27b0)" }}
            >{validating ? "Checking..." : "Create Puzzle"}</button>
            {creatorError && <p style={{ color: "var(--color-error)", fontSize: 14, textAlign: "center" }}>{creatorError}</p>}
            {shareLink && (
              <div className="share-box">
                <p style={{ fontSize: 13, color: "var(--color-subtle)", margin: "0 0 8px" }}>Share this link:</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value={shareLink} className="share-input" />
                  <button
                    onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="copy-btn"
                    style={{ background: copied ? "var(--color-correct)" : "linear-gradient(90deg,#ff3366,#ff8c00,#ffe600,#00e676,#00b4ff,#9c27b0)" }}
                  >{copied ? "Copied!" : "Copy"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // --- Play View ---
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) return <TileRow key={i} guess={guesses[i]} answer={answer} isSubmitted shake={false} winBounce={showWinBounce} />;
    if (i === guesses.length) return <TileRow key={i} guess={currentGuess} answer={answer} isSubmitted={false} shake={shake} />;
    return <TileRow key={i} guess="" answer={answer} isSubmitted={false} shake={false} />;
  });

  return (
    <>
      <StarField />
      <Fireworks active={won} />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <h1>GENIUSES ONLY</h1>
        <p className="subtitle">{wordLen} letters · {MAX_GUESSES} guesses</p>

        {message && <div className="toast">{message}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>{rows}</div>

        {gameOver && won && (
          <button onClick={shareResults} className="share-results-btn">Share Results</button>
        )}

        <Keyboard usedLetters={usedLetters} onKey={handleKey} />

        {validatingGuess && <p style={{ color: "var(--color-subtle)", fontSize: 13, marginTop: 8 }}>Checking word...</p>}
      </div>
    </>
  );
}
