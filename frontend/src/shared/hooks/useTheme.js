import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

const readTheme = () => {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
};

/**
 * Theme preference ("dark" | "light"), applied as <html data-theme> and
 * remembered in localStorage. index.html applies the saved value before
 * first paint so there is no flash of the wrong theme.
 */
export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f8f8f7" : "#0a0a0b");

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  return { theme, isLight: theme === "light", toggleTheme, setTheme };
}
