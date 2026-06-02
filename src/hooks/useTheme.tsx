import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'noir';

const THEME_CLASSES: Record<Theme, string[]> = {
  light: [],
  dark:  ['dark'],
  noir:  ['noir'],
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('wx-theme') as Theme | null;
    if (saved && ['light', 'dark', 'noir'].includes(saved)) return saved;
    return 'light'; // Always default to light — OS dark mode should not auto-enable dark
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes, then apply the current one
    root.classList.remove('dark', 'noir');
    THEME_CLASSES[theme].forEach(cls => root.classList.add(cls));
    localStorage.setItem('wx-theme', theme);
  }, [theme]);

  // Sync with OS preference changes (only if user hasn't manually overridden)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('wx-theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
