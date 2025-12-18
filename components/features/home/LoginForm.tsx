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
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Mode = 'dni' | 'socio';

export default function LoginForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>('dni');
  const [dni, setDni] = useState('');
  const [numeroSocio, setNumeroSocio] = useState('');
  const [loading, setLoading] = useState(false);

  const dniVal = useMemo(() => dni.trim().replace(/\D/g, ''), [dni]);
  const socioVal = useMemo(() => numeroSocio.trim(), [numeroSocio]); // conservar ceros

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

  const Tab = ({ id, label }: { id: Mode; label: string }) => (
    <TouchableOpacity
      onPress={() => setMode(id)}
      style={[styles.tab, mode === id && styles.tabActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.tabText, mode === id && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={(insets.top || 0) + 8}
      style={{ alignSelf: 'stretch' }}
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
              returnKeyType="send"
              onSubmitEditing={handleLogin}
              editable={!loading}
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
              returnKeyType="send"
              onSubmitEditing={handleLogin}
              editable={!loading}
            />
          )}

          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.buttonContainer, loading && { opacity: 0.7 }]}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Ingresar"
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 12,
    alignSelf: 'center',
  },
  tabs: { flexDirection: 'row', backgroundColor: '#eef2f7', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#6b7280', fontWeight: '700' },
  tabTextActive: { color: '#111827' },
  input: { backgroundColor: '#fff' },
  buttonContainer: {
    backgroundColor: '#f89f51',
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#212121', fontSize: 16, fontWeight: '700' },
});
