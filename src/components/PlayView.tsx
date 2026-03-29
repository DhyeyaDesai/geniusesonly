import { MAX_GUESSES } from "../constants/game";
import { useGameState } from "../hooks/useGameState";
import { useKeyHandler } from "../hooks/useKeyHandler";
import { Fireworks } from "./Fireworks";
import { TileRow } from "./TileRow";
import { Keyboard } from "./Keyboard";

type Props = { answer: string };

export function PlayView({ answer }: Props) {
  const wordLen = answer.length;
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
      <Fireworks active={won} />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <h1>GENIUSES ONLY</h1>
        <p className="subtitle">{wordLen} letters · {MAX_GUESSES} guesses</p>

        {message && <div className="toast">{message}</div>}

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
