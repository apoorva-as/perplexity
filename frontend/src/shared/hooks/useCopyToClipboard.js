import { useCallback, useEffect, useRef, useState } from "react";

/* Copies text and exposes a short-lived `copied` flag for button feedback. */
export function useCopyToClipboard(resetAfter = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text) => {
      if (!text || !navigator?.clipboard) return false;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), resetAfter);
        return true;
      } catch {
        return false;
      }
    },
    [resetAfter]
  );

  const reset = useCallback(() => setCopied(false), []);

  return { copied, copy, reset };
}
