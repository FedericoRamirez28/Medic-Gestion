import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Application from 'expo-application';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type RemoteVersionPayload = {
  latestVersion: string;
  minimumVersion?: string;
  playStoreUrl?: string;
  message?: string;
};

const FALLBACK_PLAYSTORE_URL =
  'https://play.google.com/store/apps/details?id=ar.medic.gestion';

// ✅ mientras no tengas backend listo, cambiá esta versión manualmente
// cuando subas una nueva app a Play Store.
// Ejemplo: si hoy la instalada es 1.1.0 y subís 1.1.1, poné 1.1.1 acá.
const FALLBACK_REMOTE_CONFIG: RemoteVersionPayload = {
  latestVersion: '1.1.1',
  minimumVersion: '1.1.0',
  playStoreUrl: FALLBACK_PLAYSTORE_URL,
  message: 'Hay una nueva versión disponible con mejoras y correcciones.',
};

// ✅ si después querés usar backend, reemplazá esta URL por tu endpoint real
// por ejemplo: `${process.env.EXPO_PUBLIC_API_BASE_URL}/app/version`
const REMOTE_VERSION_URL = '';

function normalizeVersion(v: string) {
  return String(v || '')
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((x) => Number.parseInt(x, 10) || 0);
}

function compareVersions(a: string, b: string) {
  const av = normalizeVersion(a);
  const bv = normalizeVersion(b);
  const len = Math.max(av.length, bv.length);

  for (let i = 0; i < len; i++) {
    const x = av[i] ?? 0;
    const y = bv[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

async function safeOpenStore(url?: string) {
  const playUrl = url || FALLBACK_PLAYSTORE_URL;
  const marketUrl = 'market://details?id=ar.medic.gestion';

  try {
    if (Platform.OS === 'android') {
      const canOpenMarket = await Linking.canOpenURL(marketUrl);
      if (canOpenMarket) {
        await Linking.openURL(marketUrl);
        return;
      }
    }

    await Linking.openURL(playUrl);
  } catch {
    Alert.alert('Error', 'No se pudo abrir Google Play en este dispositivo.');
  }
}

async function fetchVersionConfig(): Promise<RemoteVersionPayload> {
  if (REMOTE_VERSION_URL) {
    try {
      const res = await fetch(REMOTE_VERSION_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const json = (await res.json()) as RemoteVersionPayload;
        if (json?.latestVersion) return json;
      }
    } catch {}
  }

  return FALLBACK_REMOTE_CONFIG;
}

export default function UpdateChecker() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);
  const styles = useMemo(() => createStyles(s), [s]);

  const [visible, setVisible] = useState(false);
  const [required, setRequired] = useState(false);
  const [message, setMessage] = useState('Hay una nueva versión disponible.');
  const [storeUrl, setStoreUrl] = useState(FALLBACK_PLAYSTORE_URL);
  const [latestVersion, setLatestVersion] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const installedVersion = Application.nativeApplicationVersion || '0.0.0';

        const remote = await fetchVersionConfig();
        if (!alive) return;

        const latest = remote.latestVersion || installedVersion;
        const minimum = remote.minimumVersion || installedVersion;

        const hasUpdate = compareVersions(latest, installedVersion) === 1;
        const forceUpdate = compareVersions(minimum, installedVersion) === 1;

        if (hasUpdate) {
          setLatestVersion(latest);
          setRequired(forceUpdate);
          setStoreUrl(remote.playStoreUrl || FALLBACK_PLAYSTORE_URL);
          setMessage(
            remote.message || 'Hay una nueva versión disponible con mejoras y correcciones.'
          );
          setVisible(true);
        }
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!required) setVisible(false);
      }}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Actualización disponible
          </Text>

          <Text style={[styles.body, { color: theme.colors.muted }]}>
            {message}
          </Text>

          {!!latestVersion ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                Nueva versión: {latestVersion}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {!required ? (
              <Pressable
                onPress={() => setVisible(false)}
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>
                  Más tarde
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => safeOpenStore(storeUrl)}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
                required ? { flex: 1 } : null,
              ]}
            >
              <Text style={styles.primaryBtnText}>Actualizar ahora</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(s: number) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 18,
      borderWidth: 1,
      padding: clamp(18 * s, 16, 22),
    },
    title: {
      fontSize: clamp(22 * s, 18, 26),
      fontWeight: '900',
      textAlign: 'center',
    },
    body: {
      marginTop: 10,
      fontSize: clamp(15 * s, 13, 17),
      lineHeight: clamp(22 * s, 18, 24),
      textAlign: 'center',
      fontWeight: '700',
    },
    badge: {
      marginTop: 14,
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    badgeText: {
      fontSize: clamp(13 * s, 12, 14),
      fontWeight: '900',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
    },
    secondaryBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      fontSize: clamp(15 * s, 13, 16),
      fontWeight: '900',
    },
    primaryBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      color: '#fff',
      fontSize: clamp(15 * s, 13, 16),
      fontWeight: '900',
    },
  });
}