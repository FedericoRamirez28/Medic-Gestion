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

type CredencialData = {
  numeroSocio: string;
  nombre: string;
  dni: string;
  plan: string;
};

type CachedPayload = {
  data: CredencialData;
  cachedAt: number; // ms
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

  const afiliadoDni = useMemo(() => String(user?.dni ?? '').trim(), [user?.dni]);

  const [credencial, setCredencial] = useState<CredencialData | null>(null);

  // loading SOLO si no hay cache y estamos intentando traer data
  const [loading, setLoading] = useState(true);

  // modo offline: no hay red y estamos mostrando cache (o no hay cache)
  const [offline, setOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [hasCache, setHasCache] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setOffline(false);
      setCachedAt(null);
      setHasCache(false);

      // 1) Intentar cargar cache primero (modo rápido)
      let cacheFound = false;

      if (afiliadoDni) {
        try {
          const raw = await AsyncStorage.getItem(cacheKey(afiliadoDni));
          const parsed = raw ? safeParseJson<CachedPayload>(raw) : null;

          if (!cancelled && parsed?.data) {
            cacheFound = true;
            setCredencial(parsed.data);
            setHasCache(true);
            setCachedAt(parsed.cachedAt ?? null);

            // ✅ si hay cache, NO mostramos loader “duro”
            setLoading(false);
          }
        } catch {
          // ignore
        }
      }

      // Si no tenemos DNI o API_BASE, no podemos buscar online.
      if (!afiliadoDni || !API_BASE) {
        if (!cancelled) {
          // si no había cache, terminamos loading acá
          if (!cacheFound) setLoading(false);
        }
        return;
      }

      // 2) Si no hay conexión, usar cache y marcar offline
      try {
        const net = await Network.getNetworkStateAsync();
        const connected = !!net?.isConnected;

        if (!connected) {
          if (!cancelled) {
            setOffline(true);
            // si no hay cache, dejamos el estado como esté (null) y cortamos loading
            if (!cacheFound) setLoading(false);
          }
          return;
        }
      } catch {
        // si falla el check, igual intentamos fetch
      }

      // 3) Fetch online (con timeout). Si tarda o falla, nos quedamos con cache.
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
          // si ya había cache, lo dejamos; si no, null
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
        // fallo/timeout: si hay cache, offline; si no, mostramos vacío
        if (!cancelled) {
          setOffline(true);
          if (!cacheFound) {
            setCredencial(null);
            setLoading(false);
          }
          // si había cache, ya estamos mostrando algo (loading ya estaba false)
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [afiliadoDni]);

  const missingDni = !afiliadoDni;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#005BBF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹ Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandBlock}>
        <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
        <View style={styles.divider} />
        <Text style={styles.planHeading}>TU PLAN</Text>

        <View style={styles.planBar}>
          <Text style={styles.planBarValue}>{credencial?.plan || '—'}</Text>
        </View>

        {/* ✅ Estado offline/cache (sin romper UI) */}
        {(offline || cachedAt) && (
          <View style={styles.offlineBox}>
            {offline ? (
              <Text style={styles.offlineText}>
                Sin conexión. Mostrando credencial guardada.
              </Text>
            ) : null}

            {cachedAt ? (
              <Text style={styles.offlineMuted}>
                Última actualización: {formatDateTime(cachedAt)}
              </Text>
            ) : null}
          </View>
        )}

        {!API_BASE && (
          <Text style={styles.warnText}>
            Falta configurar EXPO_PUBLIC_API_BASE_URL en el .env
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {missingDni ? (
          <Text style={styles.errorText}>
            No tengo tu DNI cargado. Iniciá sesión o consultá tu perfil para sincronizar tus datos.
          </Text>
        ) : credencial ? (
          <>
            <FlipCard
              numeroSocio={credencial.numeroSocio}
              nombre={credencial.nombre}
              dni={credencial.dni}
            />
            <Text style={styles.legend}>
              El uso de esta credencial es exclusivo de su titular y debe presentarse con el documento
              de identidad.
            </Text>
          </>
        ) : hasCache ? (
          // Caso raro: cache flag true pero credencial null, lo dejamos como mensaje normal
          <Text style={styles.errorText}>No se encontraron datos de la credencial.</Text>
        ) : (
          <Text style={styles.errorText}>
            No se encontraron datos de la credencial. Conectate a internet para cargarla por primera vez.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  medicBlue: '#005BBF',
  medicGreen: '#2FAE3B',
  planBg: '#E8F5E9',
  planText: '#1B5E20',
  divider: '#DADADA',
  muted: '#444444',
  danger: '#D71920',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingHorizontal: 12, paddingTop: 15, paddingBottom: 4 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 8 },
  backArrow: { fontSize: 16, color: COLORS.medicBlue },

  brandBlock: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  brandLogo: { width: 180, height: 140, marginTop: 4 },
  divider: { height: 1, alignSelf: 'stretch', backgroundColor: COLORS.divider, marginVertical: 6 },
  planHeading: { fontSize: 18, fontWeight: '700', color: COLORS.medicGreen, letterSpacing: 1 },

  planBar: {
    marginTop: 8,
    backgroundColor: COLORS.planBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'stretch',
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBarValue: { fontSize: 16, fontWeight: '800', color: COLORS.planText },

  offlineBox: { marginTop: 10, alignSelf: 'stretch', paddingHorizontal: 16, gap: 4 },
  offlineText: { fontSize: 12, fontWeight: '800', color: '#9A3412', textAlign: 'center' },
  offlineMuted: { fontSize: 12, color: COLORS.muted, textAlign: 'center' },

  warnText: { marginTop: 10, fontSize: 12, color: COLORS.muted, textAlign: 'center' },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  legend: { marginTop: 48, fontSize: 12, textAlign: 'center', color: COLORS.muted, lineHeight: 18 },
  errorText: { color: COLORS.danger, marginBottom: 16, textAlign: 'center' },
});
