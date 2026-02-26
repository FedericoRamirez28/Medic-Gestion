import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/app/(tabs)/context';
import RatingPromptProvider from '@/components/ui/RatingPromptProvider';
import { AppThemeProvider, useAppTheme } from '@/components/theme/AppThemeProvider';

function NavThemeBridge() {
  const { theme } = useAppTheme();

  const navTheme = theme.isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.bg,
          card: theme.colors.headerBg,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.tabActive,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.bg,
          card: theme.colors.headerBg,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.tabActive,
        },
      };

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tabs group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Not found */}
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Si usás Roboto por nombre (Roboto-Regular / Roboto-SemiBold),
    // lo ideal es registrarlas acá también:
    // 'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    // 'Roboto-SemiBold': require('../assets/fonts/Roboto-SemiBold.ttf'),
  });

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RatingPromptProvider isOnRootScreen>
        <AuthProvider>
          <AppThemeProvider>
            <NavThemeBridge />
          </AppThemeProvider>
        </AuthProvider>
      </RatingPromptProvider>
    </GestureHandlerRootView>
  );
}
