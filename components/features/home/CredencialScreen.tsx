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

type CredencialData = {
  numeroSocio: string;
  nombre: string;
  dni: string;
  plan: string;
};

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

function safeParseJson<T = any>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

export default function CredencialScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const afiliadoDni = useMemo(() => String(user?.dni ?? '').trim(), [user?.dni]);

  const [credencial, setCredencial] = useState<CredencialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        if (!afiliadoDni || !API_BASE) {
          if (!cancelled) setCredencial(null);
          return;
        }

        const res = await fetch(`${API_BASE}/api/servicios/getinfobydni`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numeroDni: afiliadoDni }),
        });

        const text = await res.text();
        const data: any = safeParseJson(text);

        if (cancelled) return;

        if (!res.ok || !data || data?.habilitado === false) {
          setCredencial(null);
          return;
        }

        setCredencial({
          numeroSocio: String(data.numero_contrato ?? ''),
          nombre: String(data.nombre ?? ''),
          dni: String(data.dni ?? afiliadoDni),
          plan: String(data.plan ?? ''),
        });
      } catch {
        if (!cancelled) setCredencial(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [afiliadoDni]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#005BBF" />
      </SafeAreaView>
    );
  }

  const missingDni = !afiliadoDni;

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
              El uso de esta credencial es exclusivo de su titular y debe presentarse con el documento de identidad.
            </Text>
          </>
        ) : (
          <Text style={styles.errorText}>No se encontraron datos de la credencial.</Text>
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
