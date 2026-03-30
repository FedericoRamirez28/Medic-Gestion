export type ThemeMode = 'system' | 'light' | 'dark';

export type AppTheme = {
  isDark: boolean;
  mode: ThemeMode;
  colors: {
    // base
    bg: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;

    // ✅ tokens nuevos (para alinear con todos tus sistemas)
    primary: string;
    primarySoft: string;
    success: string;
    danger: string;

    // navigation
    headerBg: string;
    headerText: string;

    tabBg: string;
    tabBorder: string;
    tabActive: string;
    tabInactive: string;

    // menu/chat
    drawerBg: string;
    overlay: string;
    chipBg: string;
    chipText: string;
    inputBg: string;
    bubbleBotBg: string;
    bubbleUserBg: string;

    // buttons (compat)
    buttonBg: string;
    buttonText: string;
  };
};

export const LightAppTheme = (mode: ThemeMode): AppTheme => ({
  isDark: false,
  mode,
  colors: {
    // base (tomado de tus tokens globales)
    bg: '#e0e5f0',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#1f2933',
    muted: '#6b7280',
    border: '#dde2ee',

    // ✅ nuevos
    primary: '#008f6b',
    primarySoft: '#e0f4ee',
    success: '#059669',
    danger: '#e11d48',

    // navigation (más “pro”, menos celeste saturado)
    headerBg: '#ffffff',
    headerText: '#1f2933',

    tabBg: '#ffffff',
    tabBorder: '#dde2ee',
    tabActive: '#008f6b',
    tabInactive: '#6b7280',

    // menu/chat
    drawerBg: '#ffffff',
    overlay: 'rgba(0,0,0,0.35)',
    chipBg: '#ffffff',
    chipText: '#1f2933',
    inputBg: '#ffffff',
    bubbleBotBg: '#ffffff',
    bubbleUserBg: '#e0f4ee',

    // buttons (compat)
    buttonBg: '#008f6b',
    buttonText: '#ffffff',
  },
});

export const DarkAppTheme = (mode: ThemeMode): AppTheme => ({
  isDark: true,
  mode,
  colors: {
    // base (dark consistente con la misma identidad)
    bg: '#0b1220',
    surface: '#0f172a',
    card: '#111c2e',
    text: '#e5e7eb',
    muted: '#94a3b8',
    border: '#23324a',

    // ✅ nuevos (mantenemos el “verde Medic” pero más luminoso)
    primary: '#34d399',
    primarySoft: 'rgba(52,211,153,0.14)',
    success: '#22c55e',
    danger: '#fb7185',

    // navigation
    headerBg: '#0e1a2f',
    headerText: '#e5e7eb',

    tabBg: '#0e1a2f',
    tabBorder: '#23324a',
    tabActive: '#34d399',
    tabInactive: '#94a3b8',

    // menu/chat
    drawerBg: '#0e1a2f',
    overlay: 'rgba(0,0,0,0.55)',
    chipBg: '#111c2e',
    chipText: '#e5e7eb',
    inputBg: '#111c2e',
    bubbleBotBg: '#111c2e',
    bubbleUserBg: 'rgba(52,211,153,0.18)',

    // buttons (compat)
    buttonBg: '#34d399',
    buttonText: '#0b1220',
  },
});