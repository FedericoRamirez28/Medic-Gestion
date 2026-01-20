import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Datos dummy de prestadores (con coords para poder filtrar por distancia)
type Prestador = {
  id: string;
  nombre: string;
  especialidad: string;
  direccion: string;
  telefono: string;
  avatar: any;
  lat?: number;
  lng?: number;
};

const prestadores: Prestador[] = [
  {
    id: '1',
    nombre: 'Vitas',
    especialidad: 'Consultas especialistas',
    direccion: 'Nuestra señora del buen viaje 545, Morón',
    telefono: '011 7078-6100',
    avatar: require('@/assets/icons/prestadores-icons/logo-light.png'),
    lat: -34.6493,
    lng: -58.6196,
  },
  {
    id: '2',
    nombre: 'Dres. Molinas',
    especialidad: 'Estudios de baja, mediana y alta complejidad',
    direccion: '9 de julio 576, Morón',
    telefono: '011 7078-6100',
    avatar: require('@/assets/icons/prestadores-icons/Molinas.png'),
    lat: -34.6514,
    lng: -58.6211,
  },
  {
    id: '3',
    nombre: 'Sigma',
    especialidad: 'Estudios de baja, mediana y alta complejidad',
    direccion: 'Venezuela 1380, C.A.B.A',
    telefono: '011 7078-6100',
    avatar: require('@/assets/icons/prestadores-icons/SIGMA.png'),
    lat: -34.6209,
    lng: -58.3924,
  },
  {
    id: '4',
    nombre: 'Cepem',
    especialidad: 'Estudios de baja, mediana y alta complejidad',
    direccion: 'Machado 729, Morón',
    telefono: '011 7078-6100',
    avatar: require('@/assets/icons/prestadores-icons/Cepem.png'),
    lat: -34.6506,
    lng: -58.6156,
  },
  {
    id: '5',
    nombre: 'Tesla',
    especialidad: 'Estudios de baja, mediana y alta complejidad',
    direccion: 'Pte. Illia 2760, San Justo y sucursales',
    telefono: '011 7078-6100',
    avatar: require('@/assets/icons/prestadores-icons/diagnosticotesla-logo.png'),
    lat: -34.6836,
    lng: -58.5636,
  },
  {
    id: '6',
    nombre: 'TC Haedo SRL',
    especialidad: 'Ecografías, tomografías y resonancias',
    direccion: 'Manuel Fresco 1289, Haedo',
    telefono: '011 7078-6100',
    avatar: require('@/assets/icons/prestadores-icons/TCH.png'),
    lat: -34.6438,
    lng: -58.5939,
  },
];

const cardWidth = Dimensions.get('window').width - 24;

// Normalización simple (tildes + minúsculas + espacios)
function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Haversine (km)
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function PrestadoresScreen() {
  const router = useRouter();

  // filtros
  const [query, setQuery] = useState('');
  const [especialidadSel, setEspecialidadSel] = useState<string>('Todas');
  const [distSel, setDistSel] = useState<number | null>(null); // null = sin limite

  // ubicación (opcional)
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locEnabled, setLocEnabled] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!alive) return;

        if (status !== 'granted') {
          setLocEnabled(false);
          setMyPos(null);
          return;
        }

        setLocEnabled(true);
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Platform.OS === 'ios' ? Location.Accuracy.Balanced : Location.Accuracy.Low,
        });

        if (!alive) return;

        setMyPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch {
        setLocEnabled(false);
        setMyPos(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const especialidades = useMemo(() => {
    const set = new Set<string>();
    prestadores.forEach((p) => set.add(p.especialidad));
    return ['Todas', ...Array.from(set)];
  }, []);

  const distOptions = useMemo(() => {
    return [
      { label: 'Sin límite', value: null as number | null },
      { label: '1 km', value: 1 },
      { label: '5 km', value: 5 },
      { label: '10 km', value: 10 },
      { label: '25 km', value: 25 },
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return prestadores
      .map((p) => {
        let km: number | null = null;
        if (myPos && p.lat != null && p.lng != null) {
          km = distanceKm(myPos.lat, myPos.lng, p.lat, p.lng);
        }
        return { ...p, _km: km };
      })
      .filter((p: any) => {
        // texto (tokens)
        if (q) {
          const hay = normalize([p.nombre, p.especialidad, p.direccion].join(' '));
          const tokens = q.split(' ').filter(Boolean);
          if (!tokens.every((t) => hay.includes(t))) return false;
        }

        // especialidad
        if (especialidadSel !== 'Todas' && p.especialidad !== especialidadSel) return false;

        // distancia (solo si hay ubicación y coords)
        if (distSel != null) {
          if (!myPos || p._km == null) return false;
          if (p._km > distSel) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
        // si hay distancia, ordenamos por cercanía
        const ak = a._km ?? Number.POSITIVE_INFINITY;
        const bk = b._km ?? Number.POSITIVE_INFINITY;
        return ak - bk;
      });
  }, [query, especialidadSel, distSel, myPos]);

  const resetFilters = useCallback(() => {
    setQuery('');
    setEspecialidadSel('Todas');
    setDistSel(null);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>‹ Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered as any[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <View style={styles.filtersBox}>
            <Text style={styles.screenTitle}>Prestadores</Text>

            {/* Buscador */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#64748B" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre, especialidad o zona..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {(query || especialidadSel !== 'Todas' || distSel != null) ? (
                <Pressable onPress={resetFilters} style={styles.clearBtn}>
                  <Text style={styles.clearText}>Limpiar</Text>
                </Pressable>
              ) : null}
            </View>

            {/* Especialidad */}
            <Text style={styles.filterLabel}>Especialidad</Text>
            <View style={styles.chipsWrap}>
              {especialidades.slice(0, 6).map((esp) => (
                <Chip
                  key={esp}
                  label={esp === 'Todas' ? 'Todas' : esp}
                  active={especialidadSel === esp}
                  onPress={() => setEspecialidadSel(esp)}
                />
              ))}
            </View>

            {/* Distancia */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.filterLabel}>Distancia</Text>
              {!locEnabled ? (
                <Text style={styles.hint}>Activá ubicación para filtrar por distancia.</Text>
              ) : null}

              <View style={styles.chipsWrap}>
                {distOptions.map((opt) => {
                  const disabled = opt.value != null && !locEnabled;
                  const active = distSel === opt.value;

                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => {
                        if (disabled) return;
                        setDistSel(opt.value);
                      }}
                      style={[
                        styles.chip,
                        active ? styles.chipActive : styles.chipInactive,
                        disabled ? styles.chipDisabled : null,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ disabled, selected: active }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active ? styles.chipTextActive : styles.chipTextInactive,
                          disabled ? styles.chipTextDisabled : null,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Resumen resultados */}
            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }: { item: any }) => (
          <View style={[styles.card, { width: cardWidth }]}>
            <View style={styles.logoBox}>
              <Image source={item.avatar} style={styles.logoImg} />
            </View>

            <View style={styles.info}>
              <View style={styles.rowTop}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
              </View>

              <Text style={styles.especialidad} numberOfLines={2}>
                {item.especialidad}
              </Text>

              <Text style={styles.direccion} numberOfLines={2}>
                {item.direccion}
              </Text>

              <View style={styles.rowBottom}>
                <Text style={styles.telefono}>{item.telefono}</Text>

                {item._km != null ? (
                  <Text style={styles.distance}>{item._km.toFixed(1)} km</Text>
                ) : (
                  <Text style={styles.distanceMuted}> </Text>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={28} color="#64748B" />
            <Text style={styles.emptyTitle}>No encontramos resultados</Text>
            <Text style={styles.emptySub}>Probá otra palabra, sacá un filtro o tocá “Limpiar”.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, alignSelf: 'flex-start' },
  backButton: { padding: 8 },
  backArrow: { fontSize: 16, color: '#005BBF' },

  container: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  filtersBox: { width: '100%', paddingBottom: 12 },

  screenTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#EEF2FF' },
  clearText: { fontSize: 12, fontWeight: '800', color: '#1E5631' },

  filterLabel: { marginTop: 12, marginBottom: 6, fontSize: 13, fontWeight: '800', color: '#0F172A' },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  chipActive: { backgroundColor: 'rgba(30, 86, 49, 0.14)', borderColor: 'rgba(30, 86, 49, 0.45)' },
  chipInactive: { backgroundColor: '#fff', borderColor: '#E2E8F0' },

  chipText: { fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#1E5631' },
  chipTextInactive: { color: '#334155' },

  chipDisabled: { opacity: 0.45 },
  chipTextDisabled: { color: '#64748B' },

  hint: { marginTop: 6, color: '#64748B', fontSize: 12 },

  resultsRow: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  resultsText: { color: '#334155', fontSize: 12, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },

  logoBox: {
    width: 66,
    height: 66,
    marginRight: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  logoImg: { width: '88%', height: '88%', resizeMode: 'contain' },

  info: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  nombre: { flex: 1, fontSize: 16, fontWeight: '900', color: '#0E7490' },

  especialidad: { fontSize: 13, color: '#1E293B', marginTop: 4, fontWeight: '700' },
  direccion: { fontSize: 12, color: '#64748B', marginTop: 4 },

  rowBottom: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  telefono: { fontSize: 12, color: '#1E5631', fontWeight: '900' },

  distance: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  distanceMuted: { fontSize: 12, color: '#94A3B8' },

  emptyBox: {
    marginTop: 30,
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#0F172A' },
  emptySub: { marginTop: 6, fontSize: 12, color: '#64748B', textAlign: 'center' },
});
