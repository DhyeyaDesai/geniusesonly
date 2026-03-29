import { useState, useEffect, useCallback } from "react";
import { MAX_GUESSES } from "../constants/game";
import { validateWord } from "../utils/wordValidator";
import { getTileColors, type TileColor } from "../utils/tileColors";

export function useGameState(answer: string) {
  const wordLen = answer.length;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showWinBounce, setShowWinBounce] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [usedLetters, setUsedLetters] = useState<Record<string, TileColor>>({});
  const [validatingGuess, setValidatingGuess] = useState(false);

  useEffect(() => {
    if (!won) return;
    // Wait until the last tile's flip animation finishes before starting win bounce/celebration.
    // Last tile starts flipping at (wordLen-1)*0.3s after guess submit, flip takes 0.5s.
    // won is set revealDelay=(wordLen*150+500)ms after submit.
    // So delay needed after won = max(300, wordLen*150 - 200) ms.
    const delay = Math.max(300, wordLen * 150 - 200);
    const timer = setTimeout(() => setShowWinBounce(true), delay);
    return () => clearTimeout(timer);
  }, [won, wordLen]);

  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  }, []);

  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== wordLen) {
      showMessage(`Must be ${wordLen} letters`);
      triggerShake();
      return;
    }

    setValidatingGuess(true);
    const valid = await validateWord(currentGuess);
    setValidatingGuess(false);

    if (!valid) {
      showMessage("Not a valid word");
      triggerShake();
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    const colors = getTileColors(currentGuess, answer);
    setUsedLetters((prev) => {
      const next = { ...prev };
      currentGuess.split("").forEach((letter, i) => {
        const color = colors[i];
        if (color === "correct") next[letter] = "correct";
        else if (color === "present" && next[letter] !== "correct") next[letter] = "present";
        else if (!next[letter]) next[letter] = "absent";
      });
      return next;
    });

    setCurrentGuess("");

    const revealDelay = wordLen * 150 + 500;

    if (currentGuess === answer) {
      setTimeout(() => {
        setWon(true);
        setGameOver(true);
        showMessage("Brilliant! 🎉", 3000);
      }, revealDelay);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => {
        setGameOver(true);
        showMessage(answer.toUpperCase(), 5000);
      }, revealDelay);
    }
  }, [currentGuess, guesses, answer, wordLen, showMessage, triggerShake]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver || validatingGuess) return;
      if (key === "⌫" || key === "Backspace") {
        setCurrentGuess((p) => p.slice(0, -1));
        return;
      }
      if (key === "Enter") {
        submitGuess();
        return;
      }
      if (/^[a-zA-Z]$/.test(key) && currentGuess.length < wordLen) {
        setCurrentGuess((p) => p + key.toLowerCase());
      }
    },
    [gameOver, validatingGuess, currentGuess, wordLen, submitGuess]
  );

  const shareResults = useCallback(() => {
    const emoji = guesses
      .map((g) => {
        const colors = getTileColors(g, answer);
        return colors
          .map((c) => (c === "correct" ? "🟩" : c === "present" ? "🟨" : "⬛"))
          .join("");
      })
      .join("\n");
    const text = `Custom Wordle (${wordLen} letters) ${won ? guesses.length : "X"}/${MAX_GUESSES}\n\n${emoji}`;
    navigator.clipboard.writeText(text);
    showMessage("Copied results!");
  }, [guesses, answer, wordLen, won, showMessage]);

  return {
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
  };
}
