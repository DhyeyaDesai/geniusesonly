import { useEffect, useRef, useCallback } from "react";

/**
 * Listens to physical key presses and calls onTrigger when the user
 * types the secret word (case-insensitive). Resets after each trigger.
 */
export function useEasterEgg(secret: string, onTrigger: () => void) {
  const bufferRef = useRef("");
  const callbackRef = useRef(onTrigger);
  callbackRef.current = onTrigger;

  const reset = useCallback(() => { bufferRef.current = ""; }, []);

  useEffect(() => {
    if (!secret) return;
    const lower = secret.toLowerCase();

    const handler = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) {
        bufferRef.current = "";
        return;
      }
      bufferRef.current += e.key.toLowerCase();
      if (bufferRef.current.length > lower.length) {
        bufferRef.current = bufferRef.current.slice(-lower.length);
      }
      if (bufferRef.current === lower) {
        bufferRef.current = "";
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [secret]);

  return reset;
}
