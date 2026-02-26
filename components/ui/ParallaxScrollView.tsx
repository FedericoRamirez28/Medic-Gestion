import React, { useMemo, type PropsWithChildren, type ReactElement } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { ThemedView } from '@/components/ui/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
  const colorScheme = useColorScheme() ?? 'light';

  const { width, height } = useWindowDimensions();
  const s = useMemo(() => clamp(width / 390, 0.85, 1.2), [width]);

  // ✅ Header altura: más bajo en pantallas chicas, más alto en tablets
  const HEADER_HEIGHT = useMemo(() => {
    const base = 250;
    const byHeight = height < 740 ? 210 : base;
    const byTablet = width >= 768 ? 300 : byHeight;
    return Math.round(byTablet * clamp(s, 0.9, 1.15));
  }, [width, height, s]);

  const bottom = useBottomTabOverflow();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  }, [HEADER_HEIGHT]);

  const styles = useMemo(() => createStyles(s, HEADER_HEIGHT), [s, HEADER_HEIGHT]);

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>

        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

function createStyles(s: number, headerH: number) {
  const pad = clamp(32 * s, 18, 34);
  const gap = clamp(16 * s, 12, 20);

  return StyleSheet.create({
    container: { flex: 1 },

    header: {
      height: headerH,
      overflow: 'hidden',
    },

    content: {
      flex: 1,
      padding: pad,
      gap,
      overflow: 'hidden',
    },
  });
}
