import React, { useMemo } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Logo() {
  const { width } = useWindowDimensions();
  const s = useMemo(() => clamp(width / 390, 0.85, 1.25), [width]);

  const size = useMemo(() => {
    // Logo grande pero contenido: en teléfono ~220-260, en tablet sube un poco.
    const base = 250 * s;
    const maxByScreen = width * 0.62;
    return Math.round(clamp(base, 160, maxByScreen));
  }, [width, s]);

  const pad = useMemo(() => Math.round(clamp(36 * s, 18, 44)), [s]);

  return (
    <View style={[styles.container, { padding: pad }]}>
      <Image
        source={require('@/assets/images/logo-medic-simple.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
