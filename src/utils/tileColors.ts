export type TileColor = "correct" | "present" | "absent" | "tbd" | "empty";

export const getTileColors = (guess: string, answer: string): TileColor[] => {
  const answerArr = answer.split("");
  const guessArr = guess.split("");
  const colors: TileColor[] = Array(answer.length).fill("absent");
  const remaining = [...answerArr];

  guessArr.forEach((letter, i) => {
    if (letter === answerArr[i]) {
      colors[i] = "correct";
      remaining[remaining.indexOf(letter)] = "";
    }
  });

  guessArr.forEach((letter, i) => {
    if (colors[i] !== "correct" && remaining.includes(letter)) {
      colors[i] = "present";
      remaining[remaining.indexOf(letter)] = "";
    }
  });

  return colors;
};
