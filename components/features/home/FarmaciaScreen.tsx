import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
type DaySchedule = { open: string; close: string } | null;

const DAY_LABELS: Record<DayKey, string> = {
  Mon: 'Lunes',
  Tue: 'Martes',
  Wed: 'Miércoles',
  Thu: 'Jueves',
  Fri: 'Viernes',
  Sat: 'Sábado',
  Sun: 'Domingo',
};

// ✅ Horarios (editá acá según tu farmacia)
const WEEK_SCHEDULE: Record<DayKey, DaySchedule> = {
  Mon: { open: '08:00', close: '22:00' },
  Tue: { open: '08:00', close: '22:00' },
  Wed: { open: '08:00', close: '22:00' },
  Thu: { open: '08:00', close: '22:00' },
  Fri: { open: '08:00', close: '22:00' },
  Sat: { open: '08:00', close: '22:00' },
  Sun: null, // Cerrado
};

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function parseHHMM(hhmm: string) {
  const [h, m] = hhmm.split(':').map((x) => Number(x));
  return { h, m };
}
function minutesOfDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}
function formatHM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function dayKeyFromDate(d: Date): DayKey {
  const map: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[d.getDay()];
}
function fmtDuration(mins: number) {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${mm} min`;
  return `${h}h ${mm}m`;
}

export default function FarmaciaScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const isDark = !!theme?.isDark;
  const colors = theme?.colors;

  // ✅ OJO: no usamos `primary` (no existe). Usamos tabActive como “link/acento”.
  const C = {
    bg: colors?.bg ?? (isDark ? '#0B1220' : '#F9FAFB'),
    surface: colors?.surface ?? (isDark ? '#0F1B2D' : '#FFFFFF'),
    text: colors?.text ?? (isDark ? '#E5E7EB' : '#0F172A'),
    muted: colors?.muted ?? (isDark ? '#9CA3AF' : '#64748B'),
    border: colors?.border ?? (isDark ? '#22324A' : '#E5E7EB'),

    link: colors?.tabActive ?? '#005BBF',

    headerBg: colors?.headerBg ?? '#0E7490',
    headerText: colors?.headerText ?? '#FFFFFF',

    greenBtn: '#1E5631',
    greenBtnText: '#FFFFFF',

    statusOpen: '#16A34A',
    statusClosed: isDark ? '#475569' : '#64748B',

    track: isDark ? '#24324A' : '#E5E7EB',
    fill: '#22C55E',

    // “Hoy” highlight
    todayRowBg: isDark ? 'rgba(56,189,248,0.10)' : 'rgba(14,116,144,0.08)',
    todayDay: '#0E7490',
  };

  const telefono = '011 4484-4277';
  const direccion = 'Hipolito Yrigoyen 2305, San Justo';
  const nombreFarmacia = 'Moscovich';

  const abrirTelefono = () => Linking.openURL(`tel:${telefono}`);
  const abrirMaps = () =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`);

  const now = useMemo(() => new Date(), []);
  const todayKey = dayKeyFromDate(now);
  const todayLabel = DAY_LABELS[todayKey];
  const todaySchedule = WEEK_SCHEDULE[todayKey];

  const horarioInfo = useMemo(() => {
    if (!todaySchedule) {
      const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const idx = keys.indexOf(todayKey);

      for (let i = 1; i <= 7; i++) {
        const k = keys[(idx + i) % 7];
        const sch = WEEK_SCHEDULE[k];
        if (sch) {
          return { openNow: false, statusText: 'Cerrado', subText: `Abre ${DAY_LABELS[k]} a las ${sch.open}`, progress: 0 };
        }
      }
      return { openNow: false, statusText: 'Cerrado', subText: 'Sin horario disponible', progress: 0 };
    }

    const { open, close } = todaySchedule;
    const o = parseHHMM(open);
    const c = parseHHMM(close);

    const nowMin = minutesOfDay(now);
    const openMin = o.h * 60 + o.m;
    const closeMin = c.h * 60 + c.m;

    const openNow = nowMin >= openMin && nowMin < closeMin;

    if (openNow) {
      const minsToClose = closeMin - nowMin;
      const progress = (nowMin - openMin) / Math.max(1, closeMin - openMin);
      return { openNow: true, statusText: 'Abierto', subText: `Cierre dentro de ${fmtDuration(minsToClose)}`, progress };
    } else {
      if (nowMin < openMin) {
        const minsToOpen = openMin - nowMin;
        return { openNow: false, statusText: 'Cerrado', subText: `Abre hoy en ${open} (en ${fmtDuration(minsToOpen)})`, progress: 0 };
      }

      const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const idx = keys.indexOf(todayKey);
      for (let i = 1; i <= 7; i++) {
        const k = keys[(idx + i) % 7];
        const sch = WEEK_SCHEDULE[k];
        if (sch) {
          return { openNow: false, statusText: 'Cerrado', subText: `Abre ${DAY_LABELS[k]} a las ${sch.open}`, progress: 0 };
        }
      }

      return { openNow: false, statusText: 'Cerrado', subText: 'Sin horario disponible', progress: 0 };
    }
  }, [now, todayKey, todaySchedule]);

  const weekRows = useMemo(() => {
    const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return keys.map((k) => {
      const sch = WEEK_SCHEDULE[k];
      return { key: k, label: DAY_LABELS[k], value: sch ? `${sch.open} - ${sch.close}` : 'Cerrado' };
    });
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.backButton}>
            <Text style={[styles.backArrow, { color: C.link }]}>‹ Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: C.text }]}>Farmacia {nombreFarmacia}</Text>

          {/* Horario de apertura (destacado) */}
          <View style={[styles.horarioCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={[styles.horarioHeader, { backgroundColor: C.headerBg }]}>
              <View style={styles.horarioHeaderLeft}>
                <Ionicons name="time-outline" size={18} color={C.headerText} />
                <Text style={[styles.horarioHeaderText, { color: C.headerText }]}>HORARIO DE APERTURA</Text>
              </View>
            </View>

            <View style={styles.horarioStatusRow}>
              <View style={[styles.statusPill, { backgroundColor: horarioInfo.openNow ? C.statusOpen : C.statusClosed }]}>
                <Ionicons
                  name={horarioInfo.openNow ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.statusPillText}>{horarioInfo.statusText}</Text>
              </View>

              <Text style={[styles.statusSub, { color: C.text }]}>{horarioInfo.subText}</Text>
            </View>

            {/* Barra progreso */}
            <View style={[styles.progressTrack, { backgroundColor: C.track }]}>
              <View style={[styles.progressFill, { backgroundColor: C.fill, width: `${Math.max(0, Math.min(1, horarioInfo.progress)) * 100}%` }]} />
            </View>

            {/* Horario semanal */}
            <View style={styles.weekTable}>
              {weekRows.map((r) => {
                const isToday = r.key === todayKey;
                return (
                  <View
                    key={r.key}
                    style={[
                      styles.weekRow,
                      isToday ? [styles.weekRowToday, { backgroundColor: C.todayRowBg }] : null,
                    ]}
                  >
                    <Text style={[styles.weekDay, { color: isToday ? C.todayDay : C.text }]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.weekTime, { color: r.value === 'Cerrado' ? C.muted : C.text }]}>
                      {r.value}
                    </Text>
                  </View>
                );
              })}
              <Text style={[styles.todayHint, { color: C.muted }]}>
                Hoy: {todayLabel} ({formatHM(new Date())})
              </Text>
            </View>
          </View>

          {/* Logo */}
          <Image source={require('@/assets/images/logo-medic-simple.png')} style={styles.logo} />

          {/* Info */}
          <Text style={[styles.nombre, { color: C.text }]}>Dirección</Text>
          <Text style={[styles.direccion, { color: C.muted }]}>{direccion}</Text>
          <Text style={[styles.telefono, { color: C.text }]}>{telefono}</Text>

          {/* Botones */}
          <View style={styles.botones}>
            <TouchableOpacity style={[styles.boton, { backgroundColor: C.greenBtn }]} onPress={abrirTelefono}>
              <Ionicons name="call" size={20} color={C.greenBtnText} />
              <Text style={[styles.botonTexto, { color: C.greenBtnText }]}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.boton, { backgroundColor: C.greenBtn }]} onPress={abrirMaps}>
              <Ionicons name="location" size={20} color={C.greenBtnText} />
              <Text style={[styles.botonTexto, { color: C.greenBtnText }]}>Ubicación</Text>
            </TouchableOpacity>
          </View>

          {/* Pie */}
          <Text style={[styles.footer, { color: C.muted }]}>
            Medic trabaja junto a {nombreFarmacia} para tu cobertura.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 12 },

  header: { height: 56, alignSelf: 'flex-start' },
  backButton: { padding: 8 },
  backArrow: { fontSize: 16, fontWeight: '800' },

  container: { alignItems: 'center', paddingVertical: 12 },

  title: { fontSize: 24, fontWeight: '900' },

  /* ======================= HORARIO CARD ======================= */
  horarioCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 18,
  },

  horarioHeader: { paddingHorizontal: 14, paddingVertical: 10 },
  horarioHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  horarioHeaderText: { fontWeight: '900', letterSpacing: 0.6 },

  horarioStatusRow: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, gap: 8 },

  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: { color: '#fff', fontWeight: '900' },

  statusSub: { fontWeight: '800' },

  progressTrack: {
    height: 10,
    marginHorizontal: 14,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%' },

  weekTable: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  weekRowToday: { borderRadius: 10, paddingHorizontal: 10 },

  weekDay: { fontWeight: '900' },
  weekTime: { fontWeight: '900' },
  todayHint: { marginTop: 6, fontSize: 12, fontWeight: '700' },

  /* ======================= INFO ======================= */
  logo: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },

  nombre: { fontSize: 20, fontWeight: '900', marginBottom: 5 },
  direccion: { fontSize: 16, marginBottom: 5, textAlign: 'center', fontWeight: '700' },
  telefono: { fontSize: 16, marginBottom: 20, fontWeight: '800' },

  botones: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  botonTexto: { marginLeft: 6, fontSize: 16, fontWeight: '900' },

  footer: { fontSize: 14, textAlign: 'center', marginTop: 14, fontWeight: '700' },
});
