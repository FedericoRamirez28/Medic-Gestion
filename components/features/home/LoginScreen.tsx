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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Escala suave para tamaños/espacios (mejor consistencia entre devices)
  const s = useMemo(() => {
    const base = width / 390; // ~ ancho típico
    return clamp(base, 0.85, 1.15);
  }, [width]);

  const styles = useMemo(() => createStyles(s), [s]);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#BFD6EF').catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
  }, []);

  // Para evitar cortes con teclados distintos/gestures
  const keyboardOffset = (insets.top || 0) + (Platform.OS === 'ios' ? 8 : 0);

  // Padding inferior real para botón, respetando gestures
  const bottomPad = Math.max(insets.bottom || 0, 10);

  return (
    <SafeAreaView style={styles.safe}>
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
          <View style={styles.stepContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              Iniciar sesión
            </ThemedText>

            <LoginForm />

            <TouchableOpacity
              onPress={() => router.push('/Afiliacion')}
              accessibilityRole="button"
              accessibilityLabel="Afiliate a nuestros planes"
              style={styles.linkWrap}
            >
              <Text style={styles.linkAfilliate}>Afiliate a nuestros planes</Text>
            </TouchableOpacity>
          </View>

          {/* BOTTOM */}
          <View style={[styles.ambulanceContainer, { paddingBottom: bottomPad }]}>
            <ButtonAmbulance />
          </View>

          {/* “colchón” extra para pantallas MUY bajas */}
          {height < 700 ? <View style={{ height: 12 }} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(s: number) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safe: {
      flex: 1,
      backgroundColor: '#BFD6EF',
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 10,
      justifyContent: 'space-between',
    },
    logoContainer: {
      marginTop: 10 * s,
      alignItems: 'center',
    },
    stepContainer: {
      alignItems: 'center',
      paddingHorizontal: 8,
      gap: 10 * s,
    },
    title: {
      fontSize: clamp(34 * s, 24, 38),
      marginTop: 10 * s,
      marginBottom: 2,
      color: '#111111',
      fontFamily: 'Roboto-SemiBold',
      textAlign: 'center',
      lineHeight: clamp(38 * s, 28, 44),
    },
    linkWrap: {
      paddingVertical: 8 * s,
      paddingHorizontal: 8,
    },
    linkAfilliate: {
      color: '#212121',
      fontWeight: '600',
      fontSize: clamp(18 * s, 14, 20),
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
    ambulanceContainer: {
      paddingHorizontal: 8,
      paddingTop: 10 * s,
    },
  });
}
