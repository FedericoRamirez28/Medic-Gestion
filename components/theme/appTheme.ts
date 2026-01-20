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
    buttonBg: string;
    buttonText: string;
  };
};

export const LightAppTheme = (mode: ThemeMode): AppTheme => ({
  isDark: false,
  mode,
  colors: {
    bg: '#FFFFFF',
    surface: '#F3F6FA',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#6b7280',
    border: '#E5E7EB',

    headerBg: '#7FADDF',
    headerText: '#FFFFFF',

    tabBg: '#7FADDF',
    tabBorder: '#7FADDF',
    tabActive: '#1E5631',
    tabInactive: '#FFFFFF',

    drawerBg: '#FFFFFF',
    overlay: '#0008',
    chipBg: '#FFFFFF',
    chipText: '#0F172A',
    inputBg: '#FFFFFF',
    bubbleBotBg: '#FFFFFF',
    bubbleUserBg: '#DDEBFA',
    buttonBg: '#6FA7D9',
    buttonText: '#FFFFFF',
  },
});

export const DarkAppTheme = (mode: ThemeMode): AppTheme => ({
  isDark: true,
  mode,
  colors: {
    bg: '#0B1220',
    surface: '#0F172A',
    card: '#111C2E',
    text: '#E5E7EB',
    muted: '#94A3B8',
    border: '#23324A',

    headerBg: '#0E1A2F',
    headerText: '#E5E7EB',

    tabBg: '#0E1A2F',
    tabBorder: '#0E1A2F',
    tabActive: '#34D399',
    tabInactive: '#94A3B8',

    drawerBg: '#0E1A2F',
    overlay: '#000A',
    chipBg: '#111C2E',
    chipText: '#E5E7EB',
    inputBg: '#111C2E',
    bubbleBotBg: '#111C2E',
    bubbleUserBg: '#1E2A44',
    buttonBg: '#2563EB',
    buttonText: '#FFFFFF',
  },
});
