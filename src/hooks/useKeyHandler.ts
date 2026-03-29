import { useEffect } from "react";

export function useKeyHandler(handleKey: (key: string) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKey(e.key);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);
}
