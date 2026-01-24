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

function formatDateTime(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
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

export default function CredencialScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useAppTheme();

  const afiliadoDni = useMemo(() => String((user as any)?.dni ?? '').trim(), [(user as any)?.dni]);

  const [credencial, setCredencial] = useState<CredencialData | null>(null);
  const [loading, setLoading] = useState(true);

  const [offline, setOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [hasCache, setHasCache] = useState(false);

  // ✅ Colores desde tu theme (sin usar `primary`)
  const isDark = !!theme?.isDark;
  const colors = theme?.colors;

  const C = {
    bg: colors?.surface ?? (isDark ? '#0B1220' : '#FFFFFF'),
    text: colors?.text ?? (isDark ? '#E5E7EB' : '#111111'),
    muted: colors?.muted ?? (isDark ? '#9CA3AF' : '#444444'),
    border: colors?.border ?? (isDark ? '#22324A' : '#DADADA'),

    // ✅ en tu tema, el “accent” útil para links suele ser tabActive
    link: colors?.tabActive ?? '#005BBF',

    medicGreen: '#2FAE3B',
    planBg: isDark ? 'rgba(47,174,59,0.16)' : '#E8F5E9',
    planText: isDark ? '#9EE6B2' : '#1B5E20',

    danger: isDark ? '#FCA5A5' : '#D71920',
    warn: isDark ? '#FBBF24' : '#9A3412',
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setOffline(false);
      setCachedAt(null);
      setHasCache(false);

      let cacheFound = false;

      // 1) cargar cache primero (modo rápido)
      if (afiliadoDni) {
        try {
          const raw = await AsyncStorage.getItem(cacheKey(afiliadoDni));
          const parsed = raw ? safeParseJson<CachedPayload>(raw) : null;

          if (!cancelled && parsed?.data) {
            cacheFound = true;
            setCredencial(parsed.data);
            setHasCache(true);
            setCachedAt(parsed.cachedAt ?? null);
            setLoading(false); // ✅ si hay cache, no spinner largo
          }
        } catch {
          // ignore
        }
      }

      // si falta DNI o API, no podemos fetch online
      if (!afiliadoDni || !API_BASE) {
        if (!cancelled && !cacheFound) setLoading(false);
        return;
      }

      // 2) si no hay conexión, usar cache y marcar offline
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
        // si falla el check, igual intentamos fetch
      }

      // 3) fetch online (con timeout)
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

        // si no ok / inválido / deshabilitado -> dejamos cache si existía
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

        // guardar cache
        try {
          const payload: CachedPayload = { data: next, cachedAt: now };
          await AsyncStorage.setItem(cacheKey(afiliadoDni), JSON.stringify(payload));
        } catch {
          // ignore
        }

        setLoading(false);
      } catch {
        // timeout/fallo: si hay cache, seguimos con cache y mostramos offline
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
  }, [afiliadoDni, API_BASE]);

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: C.link }]}>‹ Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandBlock}>
        <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
        <View style={[styles.divider, { backgroundColor: C.border }]} />
        <Text style={[styles.planHeading, { color: C.medicGreen }]}>TU PLAN</Text>

        <View style={[styles.planBar, { backgroundColor: C.planBg, borderColor: C.border }]}>
          <Text style={[styles.planBarValue, { color: C.planText }]}>
            {credencial?.plan || '—'}
          </Text>
        </View>

        {(offline || cachedAt) && (
          <View style={styles.offlineBox}>
            {offline ? (
              <Text style={[styles.offlineText, { color: C.warn }]}>
                Sin conexión. Mostrando credencial guardada.
              </Text>
            ) : null}
          </View>
        )}

        {!API_BASE && (
          <Text style={[styles.warnText, { color: C.muted }]}>
            Falta configurar EXPO_PUBLIC_API_BASE_URL en el .env
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {missingDni ? (
          <Text style={[styles.errorText, { color: C.danger }]}>
            No tengo tu DNI cargado. Iniciá sesión o consultá tu perfil para sincronizar tus datos.
          </Text>
        ) : credencial ? (
          <>
            <FlipCard
              numeroSocio={credencial.numeroSocio}
              nombre={credencial.nombre}
              dni={credencial.dni}
            />
            <Text style={[styles.legend, { color: C.muted }]}>
              El uso de esta credencial es exclusivo de su titular y debe presentarse con el documento
              de identidad.
            </Text>
          </>
        ) : (
          <Text style={[styles.errorText, { color: C.danger }]}>
            {hasCache
              ? 'No se encontraron datos de la credencial.'
              : 'No se encontraron datos. Conectate a internet para cargarla por primera vez.'}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingHorizontal: 12, paddingTop: 15, paddingBottom: 4 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 8 },
  backArrow: { fontSize: 16, fontWeight: '800' },

  brandBlock: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  brandLogo: { width: 180, height: 140, marginTop: 4 },
  divider: { height: 1, alignSelf: 'stretch', marginVertical: 6 },

  planHeading: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  planBar: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'stretch',
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  planBarValue: { fontSize: 16, fontWeight: '900' },

  offlineBox: { marginTop: 10, alignSelf: 'stretch', paddingHorizontal: 16, gap: 4 },
  offlineText: { fontSize: 12, fontWeight: '900', textAlign: 'center' },
  offlineMuted: { fontSize: 12, textAlign: 'center', fontWeight: '700' },

  warnText: { marginTop: 10, fontSize: 12, textAlign: 'center', fontWeight: '700' },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  legend: { marginTop: 48, fontSize: 12, textAlign: 'center', lineHeight: 18, fontWeight: '700' },
  errorText: { marginBottom: 16, textAlign: 'center', fontWeight: '800' },
});
