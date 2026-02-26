import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useMenu } from './MenuProvider';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function HeaderWithMenu({ nombre }: { nombre: string }) {
  const { open } = useMenu();
  const { width } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.9, 1.25), [width]);
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1}>
        Bienvenido, {nombre}
      </Text>

      <TouchableOpacity
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.burger}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(s: number) {
  const padH = clamp(16 * s, 14, 22);
  const padV = clamp(12 * s, 10, 16);
  const titleSize = clamp(18 * s, 16, 22);

  const burgerW = clamp(28 * s, 24, 34);
  const burgerH = clamp(22 * s, 18, 26);
  const barH = clamp(3 * s, 2.5, 4);

  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: padH,
      paddingVertical: padV,
      backgroundColor: '#6FA7D9',
    },
    title: {
      color: '#fff',
      fontWeight: '800',
      fontSize: titleSize,
      flex: 1,
      marginRight: 12,
    },
    burger: {
      width: burgerW,
      height: burgerH,
      justifyContent: 'space-between',
      paddingVertical: 2,
    },
    bar: {
      height: barH,
      borderRadius: barH,
      backgroundColor: '#fff',
      opacity: 0.95,
    },
  });
}
