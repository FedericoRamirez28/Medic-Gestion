import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Image, StyleSheet, useWindowDimensions } from 'react-native';

interface SplashProps {
  onFinish: () => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const { width, height } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.25), [width]);

  const logoSize = useMemo(() => {
    // En phones suele ser 140-180, en tablet no más de 240 aprox.
    const byWidth = width * 0.38;
    const byHeight = height * 0.22;
    const base = Math.min(byWidth, byHeight) * clamp(s, 0.9, 1.15);
    return Math.round(clamp(base, 120, 260));
  }, [width, height, s]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        SplashScreen.hideAsync();
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [fadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#e3f2fd', '#ffffff']} style={styles.gradient}>
        <Image
          source={require('@/assets/images/logo-medic-simple.png')}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default Splash;
