import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Chip({
  label,
  active,
  disabled,
  onPress,
  C,
  styles,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  C: any;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        onPress?.();
      }}
      style={[
        styles.chip,
        {
          borderColor: active ? C.chipBorderActive : C.border,
          backgroundColor: active ? C.chipBgActive : C.surface,
        },
        disabled ? { opacity: 0.45 } : null,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, { color: active ? C.chipTextActive : C.chipTextInactive }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function PrestadoresScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);
  const isShort = height < 720;

  // ✅ ancho de card responsive (cap para tablets)
  const cardW = useMemo(() => {
    const pad = clamp(12 * s, 10, 14);
    return Math.min(width - pad * 2, 560);
  }, [width, s]);

  const styles = useMemo(() => createStyles(s, cardW, isShort, insets.top), [s, cardW, isShort, insets.top]);

  const isDark = !!theme?.isDark;
  const colors = theme?.colors;

  const C = {
    bg: colors?.bg ?? (isDark ? '#0B1220' : '#F9FAFB'),
    surface: colors?.surface ?? (isDark ? '#0F1B2D' : '#FFFFFF'),
    card: colors?.card ?? (isDark ? '#0F1B2D' : '#FFFFFF'),
    text: colors?.text ?? (isDark ? '#E5E7EB' : '#0F172A'),
    muted: colors?.muted ?? (isDark ? '#9CA3AF' : '#64748B'),
    border: colors?.border ?? (isDark ? '#22324A' : '#E2E8F0'),
    link: colors?.tabActive ?? '#005BBF',

    chipBgActive: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(30, 86, 49, 0.14)',
    chipBorderActive: isDark ? 'rgba(34,197,94,0.45)' : 'rgba(30, 86, 49, 0.45)',
    chipTextActive: isDark ? '#86EFAC' : '#1E5631',
    chipTextInactive: isDark ? '#CBD5E1' : '#334155',

    searchBorder: isDark ? '#2B3B55' : '#E2E8F0',
    clearBg: isDark ? 'rgba(99,102,241,0.18)' : '#EEF2FF',
    clearText: isDark ? '#C7D2FE' : '#1E5631',

    title: isDark ? '#E5E7EB' : '#0F172A',
    providerName: '#0E7490',
    phone: '#1E5631',
    logoBg: isDark ? '#0B1628' : '#F8FAFC',
    emptyIcon: isDark ? '#94A3B8' : '#64748B',
  };

  const [query, setQuery] = useState('');
  const [especialidadSel, setEspecialidadSel] = useState<string>('Todas');
  const [distSel, setDistSel] = useState<number | null>(null);

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
        if (q) {
          const hay = normalize([p.nombre, p.especialidad, p.direccion].join(' '));
          const tokens = q.split(' ').filter(Boolean);
          if (!tokens.every((t) => hay.includes(t))) return false;
        }

        if (especialidadSel !== 'Todas' && p.especialidad !== especialidadSel) return false;

        if (distSel != null) {
          if (!myPos || p._km == null) return false;
          if (p._km > distSel) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
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
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <View style={styles.backButton}>
            <Text style={[styles.backArrow, { color: C.link }]}>‹ Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered as any[]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: styles.__sep.height }} />}
        ListHeaderComponent={
          <View style={styles.filtersBox}>
            <Text style={[styles.screenTitle, { color: C.title }]}>Prestadores</Text>

            {/* Buscador */}
            <View style={[styles.searchRow, { backgroundColor: C.surface, borderColor: C.searchBorder }]}>
              <Ionicons name="search" size={18} color={C.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre, especialidad o zona..."
                placeholderTextColor={C.muted}
                style={[styles.searchInput, { color: C.text }]}
                returnKeyType="search"
              />
              {(query || especialidadSel !== 'Todas' || distSel != null) ? (
                <Pressable
                  onPress={resetFilters}
                  style={[styles.clearBtn, { backgroundColor: C.clearBg }]}
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar filtros"
                >
                  <Text style={[styles.clearText, { color: C.clearText }]}>Limpiar</Text>
                </Pressable>
              ) : null}
            </View>

            {/* Especialidad */}
            <Text style={[styles.filterLabel, { color: C.text }]}>Especialidad</Text>
            <View style={styles.chipsWrap}>
              {especialidades.slice(0, 6).map((esp) => (
                <Chip
                  key={esp}
                  label={esp === 'Todas' ? 'Todas' : esp}
                  active={especialidadSel === esp}
                  onPress={() => setEspecialidadSel(esp)}
                  C={C}
                  styles={styles}
                />
              ))}
            </View>

            {/* Distancia */}
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.filterLabel, { color: C.text }]}>Distancia</Text>
              {!locEnabled ? (
                <Text style={[styles.hint, { color: C.muted }]}>Activá ubicación para filtrar por distancia.</Text>
              ) : null}

              <View style={styles.chipsWrap}>
                {distOptions.map((opt) => {
                  const disabled = opt.value != null && !locEnabled;
                  const active = distSel === opt.value;

                  return (
                    <Chip
                      key={opt.label}
                      label={opt.label}
                      active={active}
                      disabled={disabled}
                      onPress={() => setDistSel(opt.value)}
                      C={C}
                      styles={styles}
                    />
                  );
                })}
              </View>
            </View>

            {/* Resumen resultados */}
            <View style={[styles.resultsRow, { borderTopColor: C.border }]}>
              <Text style={[styles.resultsText, { color: C.muted }]}>
                {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }: { item: any }) => (
          <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={[styles.logoBox, { backgroundColor: C.logoBg, borderColor: C.border }]}>
              <Image source={item.avatar} style={styles.logoImg} />
            </View>

            <View style={styles.info}>
              <View style={styles.rowTop}>
                <Text style={[styles.nombre, { color: C.providerName }]} numberOfLines={1}>
                  {item.nombre}
                </Text>
              </View>

              <Text style={[styles.especialidad, { color: C.text }]} numberOfLines={2}>
                {item.especialidad}
              </Text>

              <Text style={[styles.direccion, { color: C.muted }]} numberOfLines={2}>
                {item.direccion}
              </Text>

              <View style={styles.rowBottom}>
                <Text style={[styles.telefono, { color: C.phone }]} numberOfLines={1}>
                  {item.telefono}
                </Text>

                {item._km != null ? (
                  <Text style={[styles.distance, { color: C.text }]}>{item._km.toFixed(1)} km</Text>
                ) : (
                  <Text style={[styles.distanceMuted, { color: C.muted }]}> </Text>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Ionicons name="search-outline" size={28} color={C.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>No encontramos resultados</Text>
            <Text style={[styles.emptySub, { color: C.muted }]}>Probá otra palabra, sacá un filtro o tocá “Limpiar”.</Text>
          </View>
        }
      />
    </View>
  );
}

function createStyles(s: number, cardW: number, isShort: boolean, safeTop: number) {
  const pad = clamp(12 * s, 10, 14);
  const sep = clamp(10 * s, 8, 12);

  return StyleSheet.create({
    __sep: { height: sep },

    container: {
      flex: 1,
      paddingHorizontal: pad,
      alignItems: 'center',
      paddingTop: Math.max(6, safeTop ? 0 : 6),
    },

    header: { width: '100%', maxWidth: cardW, height: clamp(52 * s, 48, 56), justifyContent: 'center' },
    backButton: { paddingVertical: 6, paddingHorizontal: 6, alignSelf: 'flex-start' },
    backArrow: { fontSize: clamp(16 * s, 14, 18), fontWeight: '900' },

    listContent: {
      paddingBottom: isShort ? 16 : 20,
      alignItems: 'center',
    },

    filtersBox: { width: cardW, paddingBottom: 10 },
    screenTitle: { fontSize: clamp(22 * s, 18, 26), fontWeight: '900', marginBottom: 8 },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: clamp(10 * s, 8, 12),
    },
    searchInput: { flex: 1, fontSize: clamp(14 * s, 13, 16), fontWeight: '700' },

    clearBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    clearText: { fontSize: clamp(12 * s, 11, 13), fontWeight: '900' },

    filterLabel: { marginTop: 12, marginBottom: 6, fontSize: clamp(13 * s, 12, 14), fontWeight: '900' },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: clamp(8 * s, 7, 9), borderWidth: 1 },
    chipText: { fontSize: clamp(12 * s, 11, 13), fontWeight: '900' },

    hint: { marginTop: 6, fontSize: clamp(12 * s, 11, 13), fontWeight: '700' },

    resultsRow: { marginTop: 12, paddingTop: 8, borderTopWidth: 1 },
    resultsText: { fontSize: clamp(12 * s, 11, 13), fontWeight: '800' },

    card: {
      width: cardW,
      flexDirection: 'row',
      borderRadius: 18,
      padding: clamp(14 * s, 12, 16),
      borderWidth: 1,
      alignItems: 'center',
    },

    logoBox: {
      width: clamp(66 * s, 54, 72),
      height: clamp(66 * s, 54, 72),
      marginRight: 12,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
    },
    logoImg: { width: '88%', height: '88%', resizeMode: 'contain' },

    info: { flex: 1, minWidth: 0 },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    nombre: { flex: 1, fontSize: clamp(16 * s, 14, 18), fontWeight: '900' },
    especialidad: { fontSize: clamp(13 * s, 12, 14), marginTop: 4, fontWeight: '800' },
    direccion: { fontSize: clamp(12 * s, 11, 13), marginTop: 4, fontWeight: '700' },

    rowBottom: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    telefono: { flex: 1, fontSize: clamp(12 * s, 11, 13), fontWeight: '900' },

    distance: { fontSize: clamp(12 * s, 11, 13), fontWeight: '900' },
    distanceMuted: { fontSize: clamp(12 * s, 11, 13) },

    emptyBox: {
      width: cardW,
      marginTop: 30,
      alignItems: 'center',
      padding: clamp(18 * s, 14, 20),
      borderRadius: 16,
      borderWidth: 1,
    },
    emptyTitle: { marginTop: 10, fontSize: clamp(16 * s, 14, 18), fontWeight: '900' },
    emptySub: {
      marginTop: 6,
      fontSize: clamp(12 * s, 11, 13),
      textAlign: 'center',
      fontWeight: '700',
      lineHeight: clamp(18 * s, 16, 20),
    },
  });
}
