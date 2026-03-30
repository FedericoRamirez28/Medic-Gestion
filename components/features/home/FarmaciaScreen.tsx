import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
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

  const { width, height } = useWindowDimensions();
  const s = useMemo(() => clamp(width / 390, 0.85, 1.2), [width]);
  const isShort = height < 740;

  const styles = useMemo(() => createStyles(s, isShort), [s, isShort]);

  /**
   * ✅ Paleta nueva (fallback) basada en tus tokens:
   * bg: #e0e5f0
   * surface: #ffffff
   * primary: #008f6b
   * border: #dde2ee
   * ink: #1f2933
   * inkSoft: #6b7280
   */
  const C = {
    bg: theme.colors.bg ?? '#e0e5f0',
    surface: theme.colors.surface ?? '#ffffff',
    card: theme.colors.card ?? '#ffffff',
    text: theme.colors.text ?? '#1f2933',
    muted: theme.colors.muted ?? '#6b7280',
    border: theme.colors.border ?? '#dde2ee',

    // “primary” del sistema → usamos tabActive como acento corporativo
    primary: theme.colors.tabActive ?? '#008f6b',
    primarySoft: (theme as any)?.colors?.primarySoft ?? '#e0f4ee',

    headerBg: theme.colors.headerBg ?? (theme.colors.tabActive ?? '#008f6b'),
    headerText: theme.colors.headerText ?? '#ffffff',

    // Status
    statusOpen: (theme as any)?.colors?.success ?? '#059669',
    statusClosed: theme.colors.muted ?? '#6b7280',

    // Progress
    track: theme.colors.tabBorder ?? theme.colors.border ?? '#dde2ee',
    fill: theme.colors.tabActive ?? '#008f6b',

    // Today highlight
    todayRowBg: theme.isDark ? 'rgba(224,244,238,0.10)' : 'rgba(0,143,107,0.08)',
    todayDay: theme.colors.tabActive ?? '#008f6b',
  };

  const telefono = '011 4484-4277';
  const direccion = 'Hipolito Yrigoyen 2305, San Justo';
  const nombreFarmacia = 'Moscovich';

  const abrirTelefono = () => Linking.openURL(`tel:${telefono}`);
  const abrirMaps = () =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`);

  // (Mantengo tu comportamiento: se calcula una vez al entrar)
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
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <View style={styles.backButton}>
            <Text style={[styles.backArrow, { color: C.primary }]}>‹ Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: styles.__pbScroll.paddingBottom }}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: C.text }]}>Farmacia {nombreFarmacia}</Text>

          {/* Horario Card */}
          <View style={[styles.horarioCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={[styles.horarioHeader, { backgroundColor: C.headerBg }]}>
              <View style={styles.horarioHeaderLeft}>
                <Ionicons name="time-outline" size={Math.round(18 * s)} color={C.headerText} />
                <Text style={[styles.horarioHeaderText, { color: C.headerText }]}>HORARIO DE APERTURA</Text>
              </View>
            </View>

            <View style={styles.horarioStatusRow}>
              <View style={[styles.statusPill, { backgroundColor: horarioInfo.openNow ? C.statusOpen : C.statusClosed }]}>
                <Ionicons
                  name={horarioInfo.openNow ? 'checkmark-circle' : 'close-circle'}
                  size={Math.round(16 * s)}
                  color="#fff"
                />
                <Text style={styles.statusPillText}>{horarioInfo.statusText}</Text>
              </View>

              <Text style={[styles.statusSub, { color: C.text }]}>{horarioInfo.subText}</Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: C.track }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: C.fill,
                    width: `${Math.max(0, Math.min(1, horarioInfo.progress)) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.weekTable}>
              {weekRows.map((r) => {
                const isToday = r.key === todayKey;
                return (
                  <View
                    key={r.key}
                    style={[
                      styles.weekRow,
                      isToday ? [styles.weekRowToday, { backgroundColor: C.todayRowBg, borderColor: C.border }] : null,
                    ]}
                  >
                    <Text style={[styles.weekDay, { color: isToday ? C.todayDay : C.text }]}>{r.label}</Text>
                    <Text style={[styles.weekTime, { color: r.value === 'Cerrado' ? C.muted : C.text }]}>{r.value}</Text>
                  </View>
                );
              })}

              <Text style={[styles.todayHint, { color: C.muted }]}>
                Hoy: {todayLabel} ({formatHM(new Date())})
              </Text>
            </View>
          </View>

          {/* Logo */}
          <Image
            source={require('@/assets/images/logo-medic-simple.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Info */}
          <Text style={[styles.nombre, { color: C.text }]}>Dirección</Text>
          <Text style={[styles.direccion, { color: C.muted }]}>{direccion}</Text>
          <Text style={[styles.telefono, { color: C.text }]}>{telefono}</Text>

          {/* Botones */}
          <View style={styles.botones}>
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: C.primary }]}
              onPress={abrirTelefono}
              accessibilityRole="button"
              accessibilityLabel="Llamar a la farmacia"
              activeOpacity={0.9}
            >
              <Ionicons name="call" size={Math.round(20 * s)} color="#fff" />
              <Text style={[styles.botonTexto, { color: '#fff' }]}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.boton, { backgroundColor: C.primary }]}
              onPress={abrirMaps}
              accessibilityRole="button"
              accessibilityLabel="Ver ubicación en el mapa"
              activeOpacity={0.9}
            >
              <Ionicons name="location" size={Math.round(20 * s)} color="#fff" />
              <Text style={[styles.botonTexto, { color: '#fff' }]}>Ubicación</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: C.muted }]}>
            Medic trabaja junto a {nombreFarmacia} para tu cobertura.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(s: number, isShort: boolean) {
  const screenPad = clamp(12 * s, 10, 16);
  const headerH = clamp(56 * s, 50, 64);

  const title = clamp(24 * s, 20, 30);

  const cardRadius = clamp(16 * s, 14, 18);
  const cardGapY = clamp(14 * s, 10, 18);

  const headerPV = clamp(10 * s, 8, 12);
  const headerPH = clamp(14 * s, 12, 16);

  const statusPH = clamp(14 * s, 12, 16);
  const statusPT = clamp(12 * s, 10, 14);
  const statusPB = clamp(10 * s, 8, 12);

  const pillPH = clamp(10 * s, 9, 12);
  const pillPV = clamp(6 * s, 5, 8);

  const progressH = clamp(10 * s, 8, 12);

  const weekPH = clamp(14 * s, 12, 16);
  const weekPB = clamp(12 * s, 10, 14);
  const weekGap = clamp(8 * s, 6, 10);

  const logo = clamp(120 * s, 96, 160);
  const logoRadius = Math.round(logo / 2);

  const h2 = clamp(20 * s, 18, 24);
  const body = clamp(16 * s, 14, 18);

  const btnGap = clamp(15 * s, 10, 16);
  const btnPV = clamp(10 * s, 9, 12);
  const btnPH = clamp(15 * s, 12, 18);
  const btnRadius = clamp(25 * s, 18, 28);
  const btnText = clamp(16 * s, 14, 18);

  const footer = clamp(14 * s, 12, 16);

  const pbScroll = isShort ? 18 : 24;

  return StyleSheet.create({
    __pbScroll: { paddingBottom: pbScroll },

    screen: { flex: 1, padding: screenPad },

    header: { height: headerH, alignSelf: 'flex-start' },
    backButton: { padding: clamp(8 * s, 6, 10) },
    backArrow: { fontSize: clamp(16 * s, 14, 18), fontWeight: '800' },

    container: { alignItems: 'center', paddingVertical: clamp(12 * s, 10, 16) },

    title: { fontSize: title, fontWeight: '900' },

    horarioCard: {
      width: '100%',
      borderRadius: cardRadius,
      overflow: 'hidden',
      borderWidth: 1,
      marginTop: cardGapY,
      marginBottom: clamp(18 * s, 14, 22),
    },

    horarioHeader: { paddingHorizontal: headerPH, paddingVertical: headerPV },
    horarioHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: clamp(10 * s, 8, 12) },
    horarioHeaderText: { fontWeight: '900', letterSpacing: 0.6, fontSize: clamp(12 * s, 11, 14) },

    horarioStatusRow: {
      paddingHorizontal: statusPH,
      paddingTop: statusPT,
      paddingBottom: statusPB,
      gap: clamp(8 * s, 6, 10),
    },

    statusPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: clamp(8 * s, 6, 10),
      paddingHorizontal: pillPH,
      paddingVertical: pillPV,
      borderRadius: 999,
    },
    statusPillText: { color: '#fff', fontWeight: '900', fontSize: clamp(13 * s, 12, 15) },

    statusSub: { fontWeight: '800', fontSize: clamp(14 * s, 12, 16) },

    progressTrack: {
      height: progressH,
      marginHorizontal: statusPH,
      borderRadius: 999,
      overflow: 'hidden',
      marginBottom: clamp(10 * s, 8, 12),
    },
    progressFill: { height: '100%' },

    weekTable: { paddingHorizontal: weekPH, paddingBottom: weekPB, gap: weekGap },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: clamp(4 * s, 3, 6) },
    weekRowToday: {
      borderRadius: clamp(10 * s, 8, 12),
      paddingHorizontal: clamp(10 * s, 8, 12),
      borderWidth: 1,
    },

    weekDay: { fontWeight: '900', fontSize: clamp(14 * s, 12, 16) },
    weekTime: { fontWeight: '900', fontSize: clamp(14 * s, 12, 16) },
    todayHint: { marginTop: clamp(6 * s, 4, 8), fontSize: clamp(12 * s, 11, 13), fontWeight: '700' },

    logo: { width: logo, height: logo, borderRadius: logoRadius, marginBottom: clamp(15 * s, 12, 18) },

    nombre: { fontSize: h2, fontWeight: '900', marginBottom: clamp(5 * s, 4, 8) },
    direccion: { fontSize: body, marginBottom: clamp(5 * s, 4, 8), textAlign: 'center', fontWeight: '700' },
    telefono: { fontSize: body, marginBottom: clamp(20 * s, 14, 24), fontWeight: '800' },

    botones: {
      flexDirection: 'row',
      gap: btnGap,
      marginBottom: clamp(10 * s, 8, 14),
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    boton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: btnPV,
      paddingHorizontal: btnPH,
      borderRadius: btnRadius,
    },
    botonTexto: { marginLeft: clamp(6 * s, 5, 10), fontSize: btnText, fontWeight: '900' },

    footer: { fontSize: footer, textAlign: 'center', marginTop: clamp(14 * s, 10, 18), fontWeight: '700' },
  });
}