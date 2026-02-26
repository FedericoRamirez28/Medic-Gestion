import React, { useMemo } from 'react';
import { StyleSheet, Text, type TextProps, useWindowDimensions } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const { width, height } = useWindowDimensions();
  const s = useMemo(() => clamp(width / 390, 0.9, 1.25), [width]);
  const isShort = height < 740;

  const styles = useMemo(() => createStyles(s, isShort), [s, isShort]);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

function createStyles(s: number, isShort: boolean) {
  const base = clamp(16 * s, 14, 18);
  const lh = clamp(24 * s, 20, 28);

  const title = clamp(32 * s, 24, 40);
  const titleLH = clamp((isShort ? 34 : 36) * s, 28, 44);

  const sub = clamp(20 * s, 16, 26);

  const link = clamp(16 * s, 14, 18);
  const linkLH = clamp(30 * s, 24, 34);

  return StyleSheet.create({
    default: {
      fontSize: base,
      lineHeight: lh,
    },
    defaultSemiBold: {
      fontSize: base,
      lineHeight: lh,
      fontWeight: '600',
    },
    title: {
      fontSize: title,
      fontWeight: 'bold',
      lineHeight: titleLH,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: sub,
      fontWeight: 'bold',
      lineHeight: clamp(26 * s, 22, 30),
    },
    link: {
      lineHeight: linkLH,
      fontSize: link,
      color: '#0a7ea4',
      fontWeight: '700',
    },
  });
}
