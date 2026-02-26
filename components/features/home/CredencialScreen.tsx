import { useAuth } from '@/app/(tabs)/context';
import logo from '@/assets/images/logo-medic-simple.png';
import FlipCard from '@/components/ui/FlipCard';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

type CredencialData = {
  numeroSocio: string;
  nombre: string;
  dni: string;
  plan: string;
};

type CachedPayload = {
  data: CredencialData;
  cachedAt: number;
};

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

/** ===================== DEMO ===================== */
const DEMO_DNI = '22222222';
const DEMO_CRED: CredencialData = {
  numeroSocio: '00999999',
  nombre: 'Usuario Demo',
  dni: DEMO_DNI,
  plan: 'Rubí',
};

function safeParseJson<T = any>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function cacheKey(dni: string) {
  return `medic_credencial_cache_v1_${dni}`;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CredencialScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();

  // ✅ escala para responsive (móviles chicos ↔ tablets)
  const s = useMemo(() => clamp(width / 390, 0.85, 1.2), [width]);
  const isShort = height < 720;

  // ✅ DNI desde sesión
  const afiliadoDni = useMemo(() => {
    const raw = (user as any)?.dni;
    return String(raw ?? '').trim();
  }, [user]);

  const isDemo = afiliadoDni === DEMO_DNI || String((user as any)?.uid ?? '') === 'demo';

  const [credencial, setCredencial] = useState<CredencialData | null>(null);
  const [loading, setLoading] = useState(true);

  const [offline, setOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [hasCache, setHasCache] = useState(false);

  // ✅ Colores desde tu theme
  const isDark = !!theme?.isDark;
  const colors = theme?.colors;

  const C = {
    bg: colors?.surface ?? (isDark ? '#0B1220' : '#FFFFFF'),
    text: colors?.text ?? (isDark ? '#E5E7EB' : '#111111'),
    muted: colors?.muted ?? (isDark ? '#9CA3AF' : '#444444'),
    border: colors?.border ?? (isDark ? '#22324A' : '#DADADA'),

    link: colors?.tabActive ?? '#005BBF',

    medicGreen: '#2FAE3B',
    planBg: isDark ? 'rgba(47,174,59,0.16)' : '#E8F5E9',
    planText: isDark ? '#9EE6B2' : '#1B5E20',

    danger: isDark ? '#FCA5A5' : '#D71920',
    warn: isDark ? '#FBBF24' : '#9A3412',
  };

  const styles = useMemo(() => createStyles(s, isShort), [s, isShort]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setOffline(false);
      setCachedAt(null);
      setHasCache(false);

      /** ===================== DEMO: credencial hardcode ===================== */
      if (isDemo) {
        const now = Date.now();
        if (!cancelled) {
          setCredencial(DEMO_CRED);
          setHasCache(true);
          setCachedAt(now);
          setOffline(false);
          setLoading(false);
        }
        // opcional: cachear para que quede “como real”
        try {
          const payload: CachedPayload = { data: DEMO_CRED, cachedAt: now };
          await AsyncStorage.setItem(cacheKey(DEMO_DNI), JSON.stringify(payload));
        } catch {}
        return;
      }

      let cacheFound = false;

      // 1) cache primero
      if (afiliadoDni) {
        try {
          const raw = await AsyncStorage.getItem(cacheKey(afiliadoDni));
          const parsed = raw ? safeParseJson<CachedPayload>(raw) : null;

          if (!cancelled && parsed?.data) {
            cacheFound = true;
            setCredencial(parsed.data);
            setHasCache(true);
            setCachedAt(parsed.cachedAt ?? null);
            setLoading(false);
          }
        } catch {
          // ignore
        }
      }

      // si falta DNI o API, no fetch
      if (!afiliadoDni || !API_BASE) {
        if (!cancelled && !cacheFound) setLoading(false);
        return;
      }

      // 2) conexión
      try {
        const net = await Network.getNetworkStateAsync();
        const connected = !!net?.isConnected;

        if (!connected) {
          if (!cancelled) {
            setOffline(true);
            if (!cacheFound) setLoading(false);
          }
          return;
        }
      } catch {
        // si falla, intentamos igual fetch
      }

      // 3) fetch
      try {
        const res = await withTimeout(
          fetch(`${API_BASE}/api/servicios/getinfobydni`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numeroDni: afiliadoDni }),
          }),
          12000
        );

        const text = await res.text();
        const data: any = safeParseJson(text);

        if (cancelled) return;

        if (!res.ok || !data || data?.habilitado === false) {
          if (!cacheFound) setCredencial(null);
          setLoading(false);
          return;
        }

        const next: CredencialData = {
          numeroSocio: String(data.numero_contrato ?? ''),
          nombre: String(data.nombre ?? ''),
          dni: String(data.dni ?? afiliadoDni),
          plan: String(data.plan ?? ''),
        };

        setCredencial(next);
        setOffline(false);
        setHasCache(true);

        const now = Date.now();
        setCachedAt(now);

        try {
          const payload: CachedPayload = { data: next, cachedAt: now };
          await AsyncStorage.setItem(cacheKey(afiliadoDni), JSON.stringify(payload));
        } catch {
          // ignore
        }

        setLoading(false);
      } catch {
        if (!cancelled) {
          setOffline(true);
          if (!cacheFound) {
            setCredencial(null);
            setLoading(false);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [afiliadoDni, isDemo]);

  const missingDni = !afiliadoDni;

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.link} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
          <Text style={[styles.backArrow, { color: C.link }]}>‹ Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandBlock}>
        <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <Text style={[styles.planHeading, { color: C.medicGreen }]}>TU PLAN</Text>

        <View style={[styles.planBar, { backgroundColor: C.planBg, borderColor: C.border }]}>
          <Text style={[styles.planBarValue, { color: C.planText }]} numberOfLines={2}>
            {credencial?.plan || '—'}
          </Text>
        </View>

        {(offline || cachedAt) && (
          <View style={styles.offlineBox}>
            {offline ? (
              <Text style={[styles.offlineText, { color: C.warn }]}>Sin conexión. Mostrando credencial guardada.</Text>
            ) : null}

            {cachedAt ? (
              <Text style={[styles.offlineMuted, { color: C.muted }]}>
                {/* Podés mostrar fecha si querés */}
              </Text>
            ) : null}
          </View>
        )}

        {!API_BASE && !isDemo && (
          <Text style={[styles.warnText, { color: C.muted }]}>Falta configurar EXPO_PUBLIC_API_BASE_URL en el .env</Text>
        )}
      </View>

      <View style={styles.content}>
        {missingDni ? (
          <Text style={[styles.errorText, { color: C.danger }]}>
            No tengo tu DNI cargado. Iniciá sesión o consultá tu perfil para sincronizar tus datos.
          </Text>
        ) : credencial ? (
          <>
            <View style={styles.cardWrap}>
              <FlipCard numeroSocio={credencial.numeroSocio} nombre={credencial.nombre} dni={credencial.dni} />
            </View>

            <Text style={[styles.legend, { color: C.muted }]}>
              El uso de esta credencial es exclusivo de su titular y debe presentarse con el documento de identidad.
            </Text>
          </>
        ) : (
          <Text style={[styles.errorText, { color: C.danger }]}>
            {hasCache ? 'No se encontraron datos de la credencial.' : 'No se encontraron datos. Conectate a internet para cargarla por primera vez.'}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(s: number, isShort: boolean) {
  const padH = clamp(16, 14, 18);

  const backSize = clamp(16 * s, 14, 18);

  const logoW = clamp(180 * s, 140, 220);
  const logoH = clamp(140 * s, 96, 150);

  const planHeading = clamp(18 * s, 14, 20);
  const planValue = clamp(16 * s, 13, 18);

  const legendSize = clamp(12 * s, 11, 13);
  const errSize = clamp(14 * s, 12, 16);

  return StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { paddingHorizontal: padH, paddingTop: clamp(10 * s, 8, 14), paddingBottom: 4 },
    backButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 8 },
    backArrow: { fontSize: backSize, fontWeight: '900' },

    brandBlock: { alignItems: 'center', paddingHorizontal: padH, paddingBottom: 8 },
    brandLogo: { width: logoW, height: logoH, marginTop: 2 },
    divider: { height: 1, alignSelf: 'stretch', marginVertical: clamp(6 * s, 6, 10) },

    planHeading: { fontSize: planHeading, fontWeight: '900', letterSpacing: 1 },

    planBar: {
      marginTop: 8,
      borderRadius: 12,
      paddingVertical: clamp(10 * s, 8, 12),
      paddingHorizontal: clamp(14 * s, 12, 16),
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    planBarValue: { fontSize: planValue, fontWeight: '900', textAlign: 'center' },

    offlineBox: { marginTop: 10, alignSelf: 'stretch', paddingHorizontal: 2, gap: 4 },
    offlineText: { fontSize: clamp(12 * s, 10, 13), fontWeight: '900', textAlign: 'center' },
    offlineMuted: { fontSize: clamp(12 * s, 10, 13), textAlign: 'center', fontWeight: '700' },

    warnText: { marginTop: 10, fontSize: clamp(12 * s, 10, 13), textAlign: 'center', fontWeight: '700' },

    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: isShort ? 70 : 100,
      paddingHorizontal: padH,
    },

    cardWrap: {
      width: '100%',
      maxWidth: 520, // tablet friendly
      alignItems: 'center',
    },

    legend: {
      marginTop: clamp(28 * s, 20, 36),
      fontSize: legendSize,
      textAlign: 'center',
      lineHeight: clamp(18 * s, 16, 20),
      fontWeight: '700',
      maxWidth: 520,
    },

    errorText: {
      marginBottom: 16,
      textAlign: 'center',
      fontWeight: '900',
      fontSize: errSize,
      maxWidth: 520,
      lineHeight: clamp(20 * s, 18, 24),
    },
  });
}
