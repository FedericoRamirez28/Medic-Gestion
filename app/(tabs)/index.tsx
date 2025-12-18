// src/screens/IndexScreen.tsx (sin cambios estructurales)
import { AuthProvider } from '@/app/(tabs)/context';
import HomeScreen from '@/components/features/home/LoginScreen';
import Splash from '@/components/ui/SplashScreen';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';

export default function IndexScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Roboto-Regular': require('@/assets/fonts/Roboto-Regular.ttf'),
          'Roboto-SemiBold': require('@/assets/fonts/Roboto-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Error cargando fuentes:', e);
      }
    };
    loadFonts();
  }, []);

  const handleSplashFinish = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.warn('Error ocultando splash nativa:', e);
    }
    setSplashFinished(true);
  }, []);

  if (!fontsLoaded) return null;
  if (!splashFinished) return <Splash onFinish={handleSplashFinish} />;

  return (
    <AuthProvider>
      <HomeScreen />
    </AuthProvider>
  );
}
