import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'messifalta_theme_mode';

const getInitialTheme = (systemScheme: ThemeMode): ThemeMode => {
  if (typeof window !== 'undefined') {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  }
  return systemScheme;
};

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const normalizedScheme: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getInitialTheme(normalizedScheme));

  // Sync with system theme initially or when system theme changes if user hasn't toggled manually
  useEffect(() => {
    if (systemScheme) {
      const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
      if (!savedTheme) {
        setThemeModeState(normalizedScheme);
      }
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
      return newTheme;
    });
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
}
