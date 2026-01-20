import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  // JS: 0=Domingo ... 6=Sábado
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

const FarmaciaScreen: React.FC = () => {
  const router = useRouter();

  const telefono = '011 4484-4277';
  const direccion = 'Hipolito Yrigoyen 2305, San Justo';
  const nombreFarmacia = 'Moscovich';

  const abrirTelefono = () => Linking.openURL(`tel:${telefono}`);
  const abrirMaps = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
    );

  const now = useMemo(() => new Date(), []);
  const todayKey = dayKeyFromDate(now);
  const todayLabel = DAY_LABELS[todayKey];
  const todaySchedule = WEEK_SCHEDULE[todayKey];

  const horarioInfo = useMemo(() => {
    // Si hoy está cerrado todo el día
    if (!todaySchedule) {
      const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const idx = keys.indexOf(todayKey);

      for (let i = 1; i <= 7; i++) {
        const k = keys[(idx + i) % 7];
        const sch = WEEK_SCHEDULE[k];
        if (sch) {
          return {
            openNow: false,
            statusText: 'Cerrado',
            subText: `Abre ${DAY_LABELS[k]} a las ${sch.open}`,
            progress: 0,
          };
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

      return {
        openNow: true,
        statusText: 'Abierto',
        subText: `Cierre dentro de ${fmtDuration(minsToClose)}`,
        progress,
      };
    } else {
      if (nowMin < openMin) {
        const minsToOpen = openMin - nowMin;
        return {
          openNow: false,
          statusText: 'Cerrado',
          subText: `Abre hoy en ${open} (en ${fmtDuration(minsToOpen)})`,
          progress: 0,
        };
      }

      // ya pasó el cierre -> buscar próximo día abierto
      const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const idx = keys.indexOf(todayKey);
      for (let i = 1; i <= 7; i++) {
        const k = keys[(idx + i) % 7];
        const sch = WEEK_SCHEDULE[k];
        if (sch) {
          return {
            openNow: false,
            statusText: 'Cerrado',
            subText: `Abre ${DAY_LABELS[k]} a las ${sch.open}`,
            progress: 0,
          };
        }
      }

      return { openNow: false, statusText: 'Cerrado', subText: 'Sin horario disponible', progress: 0 };
    }
  }, [now, todayKey, todaySchedule]);

  const weekRows: { key: DayKey; label: string; value: string }[] = useMemo(() => {
    const keys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return keys.map((k) => {
      const sch = WEEK_SCHEDULE[k];
      return {
        key: k,
        label: DAY_LABELS[k],
        value: sch ? `${sch.open} - ${sch.close}` : 'Cerrado',
      };
    });
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>‹ Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Farmacia {nombreFarmacia}</Text>

          {/* Horario de apertura (destacado) */}
          <View style={styles.horarioCard}>
            <View style={styles.horarioHeader}>
              <View style={styles.horarioHeaderLeft}>
                <Ionicons name="time-outline" size={18} color="#fff" />
                <Text style={styles.horarioHeaderText}>HORARIO DE APERTURA</Text>
              </View>
            </View>

            <View style={styles.horarioStatusRow}>
              <View
                style={[
                  styles.statusPill,
                  horarioInfo.openNow ? styles.statusOpen : styles.statusClosed,
                ]}
              >
                <Ionicons
                  name={horarioInfo.openNow ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.statusPillText}>{horarioInfo.statusText}</Text>
              </View>

              <Text style={styles.statusSub}>{horarioInfo.subText}</Text>
            </View>

            {/* Barra progreso */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(0, Math.min(1, horarioInfo.progress)) * 100}%` },
                ]}
              />
            </View>

            {/* Horario semanal */}
            <View style={styles.weekTable}>
              {weekRows.map((r) => {
                const isToday = r.key === todayKey;
                return (
                  <View key={r.key} style={[styles.weekRow, isToday ? styles.weekRowToday : null]}>
                    <Text style={[styles.weekDay, isToday ? styles.weekDayToday : null]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.weekTime, r.value === 'Cerrado' ? styles.weekClosed : null]}>
                      {r.value}
                    </Text>
                  </View>
                );
              })}
              <Text style={styles.todayHint}>Hoy: {todayLabel} ({formatHM(new Date())})</Text>
            </View>
          </View>

          {/* Logo */}
          <Image source={require('@/assets/images/logo-medic-simple.png')} style={styles.logo} />

          {/* Info */}
          <Text style={styles.nombre}>Dirección</Text>
          <Text style={styles.direccion}>{direccion}</Text>
          <Text style={styles.telefono}>{telefono}</Text>

          {/* Botones */}
          <View style={styles.botones}>
            <TouchableOpacity style={styles.boton} onPress={abrirTelefono}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.botonTexto}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.boton} onPress={abrirMaps}>
              <Ionicons name="location" size={20} color="#fff" />
              <Text style={styles.botonTexto}>Ubicación</Text>
            </TouchableOpacity>
          </View>

          {/* Pie */}
          <Text style={styles.footer}>Medic trabaja junto a {nombreFarmacia} para tu cobertura.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FarmaciaScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },

  header: { height: 56, alignSelf: 'flex-start' },
  backButton: { padding: 8 },
  backArrow: { fontSize: 16, color: '#005BBF' },

  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E5631',
  },

  /* ======================= HORARIO CARD ======================= */
  horarioCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 14,
    marginBottom: 18,
  },

  horarioHeader: {
    backgroundColor: '#0E7490',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  horarioHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  horarioHeaderText: { color: '#fff', fontWeight: '900', letterSpacing: 0.6 },

  horarioStatusRow: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },

  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusOpen: { backgroundColor: '#16A34A' },
  statusClosed: { backgroundColor: '#64748B' },
  statusPillText: { color: '#fff', fontWeight: '900' },

  statusSub: { color: '#334155', fontWeight: '700' },

  progressTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 14,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
  },

  weekTable: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  weekRowToday: {
    backgroundColor: 'rgba(14,116,144,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  weekDay: { color: '#0F172A', fontWeight: '800' },
  weekDayToday: { color: '#0E7490' },
  weekTime: { color: '#0F172A', fontWeight: '800' },
  weekClosed: { color: '#64748B' },
  todayHint: { marginTop: 6, color: '#64748B', fontSize: 12 },

  /* ======================= INFO ======================= */
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },

  nombre: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#0F172A',
  },
  direccion: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  telefono: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },

  botones: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E5631',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  botonTexto: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 14,
  },
});
