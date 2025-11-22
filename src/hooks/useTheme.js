import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'quiz-app-theme';

/**
 * Custom hook to manage theme preference (light/dark mode)
 * Persists theme selection to localStorage
 *
 * @returns {Object} { theme, setTheme, toggleTheme }
 *   - theme: 'light' | 'dark' - Current theme
 *   - setTheme: (theme) => void - Set theme explicitly
 *   - toggleTheme: () => void - Toggle between light and dark
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) return stored;

    // Otherwise, detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Persist theme changes to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Apply theme class to document root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
};
