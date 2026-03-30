import { useAuth } from '@/app/(tabs)/context';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Mode = 'dni' | 'socio';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ✅ Paleta nueva
const COLORS = {
  bg: '#e0e5f0',
  surface: '#ffffff',
  primary: '#008f6b',
  primarySoft: '#e0f4ee',
  border: '#dde2ee',
  ink: '#1f2933',
  inkSoft: '#6b7280',
};

export default function LoginForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const { width } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);
  const styles = useMemo(() => createStyles(s), [s]);

  const [mode, setMode] = useState<Mode>('dni');
  const [dni, setDni] = useState('');
  const [numeroSocio, setNumeroSocio] = useState('');
  const [loading, setLoading] = useState(false);

  const dniVal = useMemo(() => dni.trim().replace(/\D/g, ''), [dni]);
  const socioVal = useMemo(() => numeroSocio.trim(), [numeroSocio]);

  const handleLogin = async () => {
    if (loading) return;

    if (mode === 'dni') {
      if (!dniVal) return Alert.alert('Campo vacío', 'Ingresá tu DNI.');
      if (dniVal.length < 7) return Alert.alert('DNI inválido', 'Revisá el DNI e intentá de nuevo.');
    } else {
      if (!socioVal) return Alert.alert('Campo vacío', 'Ingresá tu N° de afiliado.');
    }

    setLoading(true);
    try {
      const r = await login(mode === 'dni' ? { dni: dniVal } : { numeroSocio: socioVal });

      if (r.ok) {
        try {
          router.replace('/(tabs)/Principal');
        } catch {}
      } else {
        Alert.alert('No pudimos iniciar sesión', r.message ?? 'Revisá tus datos e intentá de nuevo.');
      }
    } catch {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const Tab = ({ id, label }: { id: Mode; label: string }) => {
    const active = mode === id;
    return (
      <TouchableOpacity
        onPress={() => setMode(id)}
        style={[
          styles.tab,
          active && styles.tabActive,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.9}
      >
        <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const keyboardOffset = (insets.top || 0) + (Platform.OS === 'ios' ? 8 : 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
      style={styles.kav}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.tabs}>
            <Tab id="dni" label="Ingresar con DNI" />
            <Tab id="socio" label="Ingresar con N° Afiliado" />
          </View>

          {mode === 'dni' ? (
            <TextInput
              label="DNI"
              value={dni}
              onChangeText={(t) => setDni(t.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              mode="outlined"
              placeholder="Ej: 45318128"
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.outline}
              theme={{
                colors: {
                  primary: COLORS.primary,
                  outline: COLORS.border,
                  background: COLORS.surface,
                  text: COLORS.ink,
                  placeholder: COLORS.inkSoft,
                },
              }}
              returnKeyType="send"
              onSubmitEditing={handleLogin}
              editable={!loading}
              dense
            />
          ) : (
            <TextInput
              label="N° de Afiliado"
              value={numeroSocio}
              onChangeText={(t) => setNumeroSocio(t.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              mode="outlined"
              placeholder="Ej: 00509026"
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.outline}
              theme={{
                colors: {
                  primary: COLORS.primary,
                  outline: COLORS.border,
                  background: COLORS.surface,
                  text: COLORS.ink,
                  placeholder: COLORS.inkSoft,
                },
              }}
              returnKeyType="send"
              onSubmitEditing={handleLogin}
              editable={!loading}
              dense
            />
          )}

          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.buttonContainer, loading && { opacity: 0.75 }]}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Ingresar"
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function createStyles(s: number) {
  const maxWidth = 520;
  const radiusLg = clamp(16 * s, 14, 18);
  const radiusMd = clamp(12 * s, 10, 14);

  return StyleSheet.create({
    kav: {
      alignSelf: 'stretch',
      width: '100%',
    },
    container: {
      width: '100%',
      maxWidth,
      alignSelf: 'center',
      gap: clamp(12 * s, 10, 14),
    },

    tabs: {
      flexDirection: 'row',
      backgroundColor: COLORS.primarySoft,
      borderRadius: 999,
      padding: 4,
      gap: 4,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    tab: {
      flex: 1,
      paddingVertical: clamp(10 * s, 8, 14),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    tabText: {
      color: COLORS.inkSoft,
      fontWeight: '900',
      fontSize: clamp(13 * s, 12, 15),
      textAlign: 'center',
    },
    tabTextActive: { color: COLORS.ink },

    input: {
      backgroundColor: COLORS.surface,
    },
    inputContent: {
      fontSize: clamp(16 * s, 14, 18),
      color: COLORS.ink,
    },
    outline: {
      borderRadius: radiusMd,
      borderWidth: 1,
    },

    buttonContainer: {
      backgroundColor: COLORS.primary,
      borderRadius: 999,
      paddingVertical: clamp(12 * s, 10, 16),
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.primary,
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      marginTop: 2,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: clamp(16 * s, 14, 18),
      fontWeight: '900',
      letterSpacing: 0.5,
    },
  });
}