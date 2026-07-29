import { useCallback, useEffect, useState } from "react";

const KEY = "malaca-mail:theme";
export type Theme = "light" | "dark";

export function useTheme() {
  // Default to "dark" theme, fallback to localStorage if explicitly set by user
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const stored = window.localStorage.getItem(KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch {
      // ignore localStorage errors
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const setThemeExplicit = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return { theme, toggle, setTheme: setThemeExplicit };
}
