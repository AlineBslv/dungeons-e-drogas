'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type VisualTheme = 'default' | 'horror';

interface ThemeContextType {
  visualTheme: VisualTheme;
  toggleTheme: () => void;
  setTheme: (theme: VisualTheme) => void;
  isHalloween: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'dungeons-drogas-visual-theme';

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [visualTheme, setVisualTheme] = useState<VisualTheme>('default');

  // Carrega tema do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as VisualTheme | null;
    if (stored === 'horror' || stored === 'default') {
      setVisualTheme(stored);
      console.log('🎨 [ThemeContext] Tema carregado do localStorage:', stored);
    }
  }, []);

  // Persiste tema no localStorage quando muda
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, visualTheme);
    console.log('💾 [ThemeContext] Tema salvo no localStorage:', visualTheme);
  }, [visualTheme]);

  const toggleTheme = () => {
    setVisualTheme((prev) => {
      const newTheme = prev === 'default' ? 'horror' : 'default';
      console.log('🔄 [ThemeContext] Alternando tema:', prev, '→', newTheme);
      return newTheme;
    });
  };

  const setTheme = (theme: VisualTheme) => {
    console.log('🎨 [ThemeContext] Definindo tema:', theme);
    setVisualTheme(theme);
  };

  const isHalloween = visualTheme === 'horror';

  return (
    <ThemeContext.Provider value={{ visualTheme, toggleTheme, setTheme, isHalloween }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de ThemeContextProvider');
  }
  return context;
}
