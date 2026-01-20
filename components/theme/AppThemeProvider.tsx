import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkAppTheme, LightAppTheme, type AppTheme, type ThemeMode } from './appTheme';

const KEY = 'medic_theme_mode_v1';

type Ctx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: AppTheme;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (!alive) return;
        if (saved === 'system' || saved === 'light' || saved === 'dark') setModeState(saved);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const theme = useMemo(() => {
    const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
    return isDark ? DarkAppTheme(mode) : LightAppTheme(mode);
  }, [mode, system]);

  const value = useMemo(() => ({ mode, setMode, theme }), [mode, setMode, theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}
