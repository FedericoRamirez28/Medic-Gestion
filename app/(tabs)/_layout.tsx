// app/_layout.tsx  ó  app/Layout.tsx
import { AuthProvider } from '@/app/(tabs)/context';
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ⬇️ NUEVO
import RatingPromptProvider from '@/components/ui/RatingPromptProvider';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RatingPromptProvider isOnRootScreen>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </RatingPromptProvider>
    </GestureHandlerRootView>
  );
}



