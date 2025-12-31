import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  // Initialize state lazily so we read from localStorage immediately on mount
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing classes to avoid conflicts
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');
      
      const applySystemTheme = () => {
        const isDark = systemMedia.matches;
        root.classList.remove('light', 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
      };

      // Apply immediately
      applySystemTheme();

      // Listen for OS changes in real-time
      systemMedia.addEventListener('change', applySystemTheme);

      return () => systemMedia.removeEventListener('change', applySystemTheme);
    } else {
      root.classList.add(theme);
    }

    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  return { theme, setTheme };
}