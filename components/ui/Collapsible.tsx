import React, { PropsWithChildren, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, useWindowDimensions, ViewStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const { width } = useWindowDimensions();
  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={Math.round(18 * s)}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={[styles.chevron, { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }]}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

function createStyles(s: number) {
  const gap = clamp(6 * s, 5, 10);
  const mt = clamp(6 * s, 5, 10);
  const ml = clamp(24 * s, 18, 30);

  return StyleSheet.create({
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap,
      paddingVertical: clamp(6 * s, 5, 10),
    } as ViewStyle,

    chevron: {
      marginTop: 1,
    },

    content: {
      marginTop: mt,
      marginLeft: ml,
    },
  });
}
