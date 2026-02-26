import React, { useMemo } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function safeOpenURL(url: string) {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      }
    } catch {}
  }

  if (Platform.OS === 'android') {
    try {
      if (url.startsWith('tel:')) {
        const phone = url.replace('tel:', '').trim();
        await IntentLauncher.startActivityAsync('android.intent.action.DIAL', {
          data: `tel:${phone}`,
        });
        return true;
      }
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: url });
      return true;
    } catch {}
  }

  Alert.alert('Error', 'No se pudo abrir el enlace en tu dispositivo.');
  return false;
}

function confirmCall() {
  Alert.alert(
    'Contacto de emergencias',
    '¿Deseás comunicarte con el servicio de emergencias?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Llamar',
        onPress: () => safeOpenURL('tel:+541170786200'),
      },
    ]
  );
}

export default function ButtonAmbulance() {
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => clamp(width / 390, 0.9, 1.25), [width]);
  const isShort = height < 740;

  const styles = useMemo(() => createStyles(s, isShort, width), [s, isShort, width]);

  return (
    <View style={styles.underContainer}>
      <TouchableOpacity
        style={styles.boton}
        onPress={confirmCall}
        accessibilityRole="button"
        accessibilityLabel="Contactar servicio de emergencias"
        activeOpacity={0.85}
      >
        <Text style={styles.texto}>Contactar emergencias</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(s: number, isShort: boolean, width: number) {
  const mt = isShort ? 12 : clamp(24 * s, 16, 34);

  const btnW = Math.min(width * 0.9, width >= 768 ? 520 : 420);
  const py = clamp(12 * s, 10, 16);
  const radius = clamp(10 * s, 8, 14);

  const font = clamp(18 * s, 15, 20);

  return StyleSheet.create({
    underContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: mt,
      paddingHorizontal: clamp(14 * s, 12, 20),
    },
    boton: {
      backgroundColor: '#f59e0b',
      borderRadius: radius,
      paddingVertical: py,
      width: btnW,
      elevation: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texto: {
      color: '#111111',
      fontSize: font,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}
