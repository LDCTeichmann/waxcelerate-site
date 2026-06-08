import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Theme = 'light' | 'noir';

const THEME_CLASSES: Record<Theme, string[]> = {
  light: [],
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
    if (saved && ['light', 'noir'].includes(saved)) return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('noir');
    THEME_CLASSES[theme].forEach(cls => root.classList.add(cls));
    localStorage.setItem('wx-theme', theme);
  }, [theme]);

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
