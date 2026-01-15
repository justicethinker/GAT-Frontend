import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vite-ui-theme") as Theme;
      if (stored) return stored;
    }
    // Default to system preference if nothing stored, or hardcode 'dark'
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old classes to prevent conflicts
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    // Apply specific theme
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (theme: Theme) => {
    // Save to localStorage for persistence
    localStorage.setItem("vite-ui-theme", theme);
    setThemeState(theme);
  };

  return { theme, setTheme };
}