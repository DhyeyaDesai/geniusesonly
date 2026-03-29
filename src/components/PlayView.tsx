import { useState, useCallback } from "react";
import { MAX_GUESSES } from "../constants/game";
import { useGameState } from "../hooks/useGameState";
import { useKeyHandler } from "../hooks/useKeyHandler";
import { useEasterEgg } from "../hooks/useEasterEgg";
import { useTheme } from "../theme/ThemeContext";
import { ThemeBackground } from "./ThemeBackground";
import { ThemeWin } from "./ThemeWin";
import { TileRow } from "./TileRow";
import { Keyboard } from "./Keyboard";

type Props = { answer: string };

export function PlayView({ answer }: Props) {
  const wordLen = answer.length;
  const theme   = useTheme();
  const {
    guesses,
    currentGuess,
    gameOver,
    won,
    showWinBounce,
    shake,
    message,
    usedLetters,
    validatingGuess,
    handleKey,
    shareResults,
  } = useGameState(answer);

  const [easterMsg, setEasterMsg] = useState("");

  const triggerEasterEgg = useCallback(() => {
    setEasterMsg(theme.easterEggLabel);
    setTimeout(() => setEasterMsg(""), 3500);
  }, [theme.easterEggLabel]);

  useEasterEgg(theme.easterEgg, triggerEasterEgg);
  useKeyHandler(handleKey);

  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length)
      return <TileRow key={i} guess={guesses[i]} answer={answer} isSubmitted shake={false} winBounce={showWinBounce} />;
    if (i === guesses.length)
      return <TileRow key={i} guess={currentGuess} answer={answer} isSubmitted={false} shake={shake} />;
    return <TileRow key={i} guess="" answer={answer} isSubmitted={false} shake={false} />;
  });

  return (
    <>
      <ThemeBackground />
      <ThemeWin active={showWinBounce} />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <h1
          onClick={() => { window.location.href = window.location.pathname; }}
          style={{ cursor: "pointer" }}
          title="Create a puzzle"
        >
          GENIUSES ONLY
        </h1>
        <p className="subtitle">{wordLen} letters · {MAX_GUESSES} guesses</p>

        {(message || easterMsg) && (
          <div className="toast">{easterMsg || message}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
          {rows}
        </div>

        {gameOver && won && (
          <button onClick={shareResults} className="share-results-btn">
            Share Results
          </button>
        )}

        <Keyboard usedLetters={usedLetters} onKey={handleKey} />

        {validatingGuess && (
          <p style={{ color: "var(--color-subtle)", fontSize: 13, marginTop: 8 }}>
            Checking word...
          </p>
        )}
      </div>
    </>
  );
}
