import LoginForm from '@/components/features/home/LoginForm';
import CustomBackground from '@/components/ui/Background';
import ButtonAmbulance from '@/components/ui/LlamarAmbulancia';
import Logo from '@/components/ui/Logo';
import { ThemedText } from '@/components/ui/ThemedText';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function clamp(n: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, n));
}

// ✅ Nueva paleta (equivalente a tus tokens web)
const COLORS = {
  bg: '#e0e5f0',
  surface: '#ffffff',
  primary: '#008f6b',
  primarySoft: '#e0f4ee',
  border: '#dde2ee',
  ink: '#1f2933',
  inkSoft: '#6b7280',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const s = useMemo(() => {
    const base = width / 390;
    return clamp(base, 0.85, 1.15);
  }, [width]);

  const styles = useMemo(() => createStyles(s), [s]);

  useEffect(() => {
    // ✅ Barra inferior Android alineada al nuevo fondo
    NavigationBar.setBackgroundColorAsync(COLORS.bg).catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
  }, []);

  const keyboardOffset = (insets.top || 0) + (Platform.OS === 'ios' ? 8 : 0);
  const bottomPad = Math.max(insets.bottom || 0, 10);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tu background custom sigue, pero el "safe" ya alinea a la nueva paleta */}
      <CustomBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* TOP */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* CENTER */}
          <View style={styles.centerWrap}>
            <View style={styles.card}>
              <ThemedText type="subtitle" style={styles.title}>
                Iniciar sesión
              </ThemedText>

              <View style={styles.divider} />

              <LoginForm />

              <TouchableOpacity
                onPress={() => router.push('/Afiliacion')}
                accessibilityRole="button"
                accessibilityLabel="Afiliate a nuestros planes"
                style={styles.linkWrap}
                activeOpacity={0.85}
              >
                <Text style={styles.linkAfilliate}>Afiliate a nuestros planes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTTOM */}
          <View style={[styles.ambulanceContainer, { paddingBottom: bottomPad }]}>
            <ButtonAmbulance />
          </View>

          {height < 700 ? <View style={{ height: 12 }} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(s: number) {
  const radiusLg = clamp(18 * s, 16, 22);
  const radiusMd = clamp(12 * s, 10, 14);

  return StyleSheet.create({
    flex: { flex: 1 },
    safe: {
      flex: 1,
      backgroundColor: COLORS.bg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: clamp(16 * s, 14, 18),
      paddingTop: clamp(10 * s, 8, 14),
      paddingBottom: 10,
      justifyContent: 'space-between',
    },

    logoContainer: {
      marginTop: 10 * s,
      alignItems: 'center',
    },

    centerWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: clamp(6 * s, 4, 10),
    },

    card: {
      width: '100%',
      maxWidth: 520,
      backgroundColor: COLORS.surface,
      borderRadius: radiusLg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: clamp(16 * s, 14, 20),
      shadowColor: '#0f172a',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
      gap: clamp(10 * s, 8, 14),
    },

    title: {
      fontSize: clamp(34 * s, 24, 38),
      marginTop: 2,
      marginBottom: 2,
      color: COLORS.ink,
      fontFamily: 'Roboto-SemiBold',
      textAlign: 'center',
      lineHeight: clamp(38 * s, 28, 44),
    },

    divider: {
      height: 1,
      backgroundColor: COLORS.border,
      borderRadius: 999,
      marginBottom: 2,
    },

    linkWrap: {
      paddingVertical: clamp(8 * s, 7, 10),
      paddingHorizontal: 8,
      alignSelf: 'center',
    },
    linkAfilliate: {
      color: COLORS.primary,
      fontWeight: '800',
      fontSize: clamp(16 * s, 14, 18),
      textDecorationLine: 'underline',
      textAlign: 'center',
    },

    ambulanceContainer: {
      paddingHorizontal: 8,
      paddingTop: 10 * s,
    },
  });
}