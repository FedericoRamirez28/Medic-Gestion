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

/**
 * ✅ Normaliza el theme para que siempre existan “tokens pro”
 * (así tus screens pueden usar theme.colors.primary, etc.)
 */
function normalizeTheme(theme: AppTheme): AppTheme {
  const colors: any = (theme as any)?.colors ?? {};
  const isDark = !!(theme as any)?.isDark;

  // Base corporativa (tus tokens)
  const FALLBACK = {
    bg: '#e0e5f0',
    surface: '#ffffff',
    card: '#ffffff',
    border: '#dde2ee',
    text: '#1f2933',
    muted: '#6b7280',

    primary: '#008f6b',
    primarySoft: '#e0f4ee',

    success: '#059669',
    danger: '#e11d48',
  };

  // Preferimos lo que ya exista en tu theme actual
  const primary = colors.primary ?? colors.tabActive ?? FALLBACK.primary;

  // “soft” para backgrounds sutiles (chips, tarjetas, highlights)
  const primarySoft =
    colors.primarySoft ??
    (isDark ? 'rgba(0, 143, 107, 0.18)' : FALLBACK.primarySoft);

  const success = colors.success ?? FALLBACK.success;
  const danger = colors.danger ?? FALLBACK.danger;

  const mergedColors = {
    ...colors,

    // Aseguramos base mínima (por si alguna screen la pide)
    bg: colors.bg ?? FALLBACK.bg,
    surface: colors.surface ?? FALLBACK.surface,
    card: colors.card ?? FALLBACK.card,
    border: colors.border ?? FALLBACK.border,
    text: colors.text ?? FALLBACK.text,
    muted: colors.muted ?? FALLBACK.muted,

    // ✅ Tokens pro (nuevos)
    primary,
    primarySoft,
    success,
    danger,
  };

  return {
    ...(theme as any),
    colors: mergedColors,
  } as AppTheme;
}

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
    const base = isDark ? DarkAppTheme(mode) : LightAppTheme(mode);

    // ✅ acá “inyectamos” la paleta corporativa/tokens pro
    return normalizeTheme(base);
  }, [mode, system]);

  const value = useMemo(() => ({ mode, setMode, theme }), [mode, setMode, theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}