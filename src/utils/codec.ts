import { SHIFT } from "../constants/game";

export const encode = (word: string): string =>
  btoa(
    word
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) + SHIFT))
      .join("")
  );

export const decode = (hash: string): string | null => {
  try {
    return atob(hash)
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) - SHIFT))
      .join("");
  } catch {
    return null;
  }
};
