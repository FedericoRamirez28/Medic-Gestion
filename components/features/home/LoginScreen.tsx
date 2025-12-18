// src/components/features/home/HomeScreen.tsx
import LoginForm from '@/components/features/home/LoginForm';
import CustomBackground from '@/components/ui/Background';
import ButtonAmbulance from '@/components/ui/LlamarAmbulancia';
import Logo from '@/components/ui/Logo';
import { ThemedText } from '@/components/ui/ThemedText';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#BFD6EF').catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <CustomBackground />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={(insets.top || 0) + 8}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          <View style={styles.stepContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              Iniciar sesión
            </ThemedText>

            <LoginForm />

            <TouchableOpacity onPress={() => router.push('/Afiliacion')}>
              <Text style={styles.linkAfilliate}>Afiliate a nuestros planes</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.ambulanceContainer, { paddingBottom: (insets.bottom || 12) + 8 }]}>
            <ButtonAmbulance />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#BFD6EF',
  },
  container: {
    flex: 1,
    backgroundColor: '#BFD6EF',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    marginTop: 16,
    marginBottom: 1,
    color: '#111111',
    fontFamily: 'Roboto-SemiBold',
    textAlign: 'center',
  },
  stepContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  linkAfilliate: {
    color: '#212121',
    fontWeight: '500',
    padding: 20,
    fontSize: 18,
    textDecorationLine: 'underline',
  },
  ambulanceContainer: {
    paddingHorizontal: 16,
  },
});
