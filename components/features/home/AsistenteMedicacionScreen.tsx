import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

type MedReminder = {
  id: string;
  name: string;
  dose?: string;
  note?: string;
  hour: number;
  minute: number;
  notificationId?: string;
  createdAt: number;
  stockEnabled?: boolean;
  stockLeft?: number;
  stockDose?: number;
  stockLow?: number;
};

type TabKey = 'hoy' | 'todos' | 'agregar';

const STORAGE_KEY = '@medic_med_reminders_v1';
const TAKEN_KEY = '@medic_med_taken_v1';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function clampInt(n: any, min: number, max: number) {
  const x = Number.parseInt(String(n), 10);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function toPosIntOrUndef(v: any) {
  const n = Number.parseInt(String(v), 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return undefined;
  if (n < 0) return 0;
  return n;
}

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function minutesOf(rem: MedReminder) {
  return rem.hour * 60 + rem.minute;
}

function nextOccurrence(rem: MedReminder, now = new Date()) {
  const base = new Date(now);
  base.setSeconds(0, 0);
  base.setHours(rem.hour, rem.minute, 0, 0);

  if (base.getTime() <= now.getTime()) {
    const t = new Date(base);
    t.setDate(t.getDate() + 1);
    return t;
  }
  return base;
}

function stockWarn(rem: MedReminder) {
  if (!rem.stockEnabled) return false;
  const left = rem.stockLeft;
  const low = rem.stockLow ?? 5;
  if (typeof left !== 'number') return false;
  return left <= low;
}

async function loadReminders(): Promise<MedReminder[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function saveReminders(list: MedReminder[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function loadTaken(): Promise<Record<string, Record<string, number>>> {
  const raw = await AsyncStorage.getItem(TAKEN_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

async function saveTaken(map: Record<string, Record<string, number>>) {
  await AsyncStorage.setItem(TAKEN_KEY, JSON.stringify(map));
}

function getNotificationsModule(): any | null {
  if (Platform.OS === 'web') return null;

  try {
    // Carga diferida para evitar que expo-notifications se evalúe al importar la screen
    // y rompa con ServerRegistrationModule.web.js antes de iniciar el proyecto.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications');
  } catch {
    return null;
  }
}

function configureNotifications() {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureNotifPermissions() {
  const Notifications = getNotificationsModule();
  if (!Notifications) return false;

  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === 'granted') return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

async function scheduleDailyNotification(rem: MedReminder) {
  const Notifications = getNotificationsModule();
  if (!Notifications) return undefined;

  const ok = await ensureNotifPermissions();
  if (!ok) {
    Alert.alert(
      'Permiso requerido',
      'Para recordatorios, activá las notificaciones en Ajustes del teléfono.'
    );
    return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicacion', {
      name: 'Recordatorios de medicación',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de medicación',
      body: `${rem.name}${rem.dose ? ` · ${rem.dose}` : ''}`,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'medicacion' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: rem.hour,
      minute: rem.minute,
    },
  });

  return notifId;
}

async function cancelNotification(notificationId?: string) {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export default function AsistenteMedicacionScreen() {
  const { theme } = useAppTheme();

  const [tab, setTab] = useState<TabKey>('hoy');

  const [items, setItems] = useState<MedReminder[]>([]);
  const [takenMap, setTakenMap] = useState<Record<string, Record<string, number>>>({});

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [note, setNote] = useState('');
  const [hour, setHour] = useState('9');
  const [minute, setMinute] = useState('0');

  const [stockEnabled, setStockEnabled] = useState(false);
  const [stockLeft, setStockLeft] = useState('30');
  const [stockDose, setStockDose] = useState('1');
  const [stockLow, setStockLow] = useState('5');

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [eName, setEName] = useState('');
  const [eDose, setEDose] = useState('');
  const [eNote, setENote] = useState('');
  const [eHour, setEHour] = useState('9');
  const [eMinute, setEMinute] = useState('0');

  const [eStockEnabled, setEStockEnabled] = useState(false);
  const [eStockLeft, setEStockLeft] = useState('0');
  const [eStockDose, setEStockDose] = useState('1');
  const [eStockLow, setEStockLow] = useState('5');

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    (async () => {
      const list = await loadReminders();
      setItems(list);

      const tk = await loadTaken();
      setTakenMap(tk);
    })();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = minutesOf(a);
      const tb = minutesOf(b);
      if (ta !== tb) return ta - tb;
      return a.createdAt - b.createdAt;
    });
  }, [items]);

  const todayKey = dateKey(new Date());

  const nextDose = useMemo(() => {
    if (!items.length) return null;
    const now = new Date();
    let best: { rem: MedReminder; when: Date } | null = null;
    for (const rem of items) {
      const when = nextOccurrence(rem, now);
      if (!best || when.getTime() < best.when.getTime()) best = { rem, when };
    }
    return best;
  }, [items]);

  const todayTimeline = useMemo(() => {
    const list = [...items].sort((a, b) => minutesOf(a) - minutesOf(b));
    return list.map((rem) => {
      const key = todayKey;
      const takenAt = (takenMap[key] ?? {})[rem.id];
      const status: 'tomado' | 'pendiente' = takenAt ? 'tomado' : 'pendiente';
      return { rem, takenAt, status };
    });
  }, [items, takenMap, todayKey]);

  const progress = useMemo(() => {
    const total = todayTimeline.length;
    const done = todayTimeline.filter((x) => x.status === 'tomado').length;
    const pct = total ? done / total : 0;
    return { total, done, pct };
  }, [todayTimeline]);

  const updateReminderStock = async (remId: string, delta: number) => {
    const idx = items.findIndex((x) => x.id === remId);
    if (idx === -1) return;

    const rem = items[idx];
    if (!rem.stockEnabled) return;

    const doseQty = Math.max(1, rem.stockDose ?? 1);
    const current = typeof rem.stockLeft === 'number' ? rem.stockLeft : 0;
    const nextStock = Math.max(0, current + delta * doseQty);

    const nextItems = [...items];
    nextItems[idx] = { ...rem, stockLeft: nextStock };

    setItems(nextItems);
    await saveReminders(nextItems);

    const low = rem.stockLow ?? 5;
    if (delta < 0 && nextStock <= low) {
      Alert.alert('Stock bajo', `Quedan ${nextStock} de ${rem.name}. Considerá reponer.`);
    }
  };

  const markTaken = async (remId: string) => {
    const dk = dateKey(new Date());
    const next = { ...takenMap };
    const day = { ...(next[dk] ?? {}) };

    if (day[remId]) return;

    day[remId] = Date.now();
    next[dk] = day;
    setTakenMap(next);
    await saveTaken(next);

    await updateReminderStock(remId, -1);
  };

  const undoTaken = async (remId: string) => {
    const dk = dateKey(new Date());
    const next = { ...takenMap };
    const day = { ...(next[dk] ?? {}) };

    if (!day[remId]) return;

    delete day[remId];
    next[dk] = day;
    setTakenMap(next);
    await saveTaken(next);

    await updateReminderStock(remId, +1);
  };

  const addReminder = async () => {
    const n = name.trim();
    if (!n) {
      Alert.alert('Falta el medicamento', 'Escribí el nombre del medicamento.');
      return;
    }

    const h = clampInt(hour, 0, 23);
    const m = clampInt(minute, 0, 59);

    const stEnabled = !!stockEnabled;
    const stLeft = stEnabled ? toPosIntOrUndef(stockLeft) : undefined;
    const stDose = stEnabled ? Math.max(1, toPosIntOrUndef(stockDose) ?? 1) : undefined;
    const stLow = stEnabled ? Math.max(0, toPosIntOrUndef(stockLow) ?? 5) : undefined;

    const newItem: MedReminder = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: n,
      dose: dose.trim() || undefined,
      note: note.trim() || undefined,
      hour: h,
      minute: m,
      createdAt: Date.now(),
      stockEnabled: stEnabled,
      stockLeft: stEnabled ? (typeof stLeft === 'number' ? stLeft : 0) : undefined,
      stockDose: stEnabled ? stDose : undefined,
      stockLow: stEnabled ? stLow : undefined,
    };

    const notifId = await scheduleDailyNotification(newItem);
    const finalItem = { ...newItem, notificationId: notifId };

    const next = [finalItem, ...items];
    setItems(next);
    await saveReminders(next);

    setName('');
    setDose('');
    setNote('');
    setHour(String(h));
    setMinute(String(m));
    setStockEnabled(false);
    setStockLeft('30');
    setStockDose('1');
    setStockLow('5');
    setTab('hoy');

    Alert.alert('Listo', 'Recordatorio creado.');
  };

  const removeReminder = async (id: string) => {
    const target = items.find((x) => x.id === id);
    if (!target) return;

    Alert.alert('Eliminar', `¿Querés eliminar “${target.name}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await cancelNotification(target.notificationId);

          const nextTaken = { ...takenMap };
          for (const dk of Object.keys(nextTaken)) {
            if (nextTaken[dk]?.[id]) {
              const day = { ...nextTaken[dk] };
              delete day[id];
              nextTaken[dk] = day;
            }
          }
          setTakenMap(nextTaken);
          await saveTaken(nextTaken);

          const nextItems = items.filter((x) => x.id !== id);
          setItems(nextItems);
          await saveReminders(nextItems);

          if (editId === id) {
            setEditOpen(false);
            setEditId(null);
          }
        },
      },
    ]);
  };

  const clearToday = async () => {
    Alert.alert('Reiniciar hoy', '¿Querés desmarcar todas las tomas de hoy?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reiniciar',
        style: 'destructive',
        onPress: async () => {
          const dk = dateKey(new Date());
          const next = { ...takenMap };
          next[dk] = {};
          setTakenMap(next);
          await saveTaken(next);
        },
      },
    ]);
  };

  const openEdit = (rem: MedReminder) => {
    setEditId(rem.id);
    setEName(rem.name ?? '');
    setEDose(rem.dose ?? '');
    setENote(rem.note ?? '');
    setEHour(String(rem.hour ?? 9));
    setEMinute(String(rem.minute ?? 0));

    const se = !!rem.stockEnabled;
    setEStockEnabled(se);
    setEStockLeft(String(typeof rem.stockLeft === 'number' ? rem.stockLeft : 0));
    setEStockDose(String(Math.max(1, rem.stockDose ?? 1)));
    setEStockLow(String(Math.max(0, rem.stockLow ?? 5)));

    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    const idx = items.findIndex((x) => x.id === editId);
    if (idx === -1) return;

    const old = items[idx];

    const n = eName.trim();
    if (!n) {
      Alert.alert('Falta el medicamento', 'Escribí el nombre del medicamento.');
      return;
    }

    const h = clampInt(eHour, 0, 23);
    const m = clampInt(eMinute, 0, 59);

    const stEnabled = !!eStockEnabled;
    const stLeft = stEnabled ? toPosIntOrUndef(eStockLeft) : undefined;
    const stDose = stEnabled ? Math.max(1, toPosIntOrUndef(eStockDose) ?? 1) : undefined;
    const stLow = stEnabled ? Math.max(0, toPosIntOrUndef(eStockLow) ?? 5) : undefined;

    const updated: MedReminder = {
      ...old,
      name: n,
      dose: eDose.trim() || undefined,
      note: eNote.trim() || undefined,
      hour: h,
      minute: m,
      stockEnabled: stEnabled,
      stockLeft: stEnabled ? (typeof stLeft === 'number' ? stLeft : 0) : undefined,
      stockDose: stEnabled ? stDose : undefined,
      stockLow: stEnabled ? stLow : undefined,
    };

    const timeChanged = old.hour !== updated.hour || old.minute !== updated.minute;
    const contentChanged = old.name !== updated.name || old.dose !== updated.dose;

    let newNotifId = old.notificationId;

    if (timeChanged || contentChanged) {
      await cancelNotification(old.notificationId);
      newNotifId = await scheduleDailyNotification(updated);
    }

    const nextItems = [...items];
    nextItems[idx] = { ...updated, notificationId: newNotifId };

    setItems(nextItems);
    await saveReminders(nextItems);

    setEditOpen(false);
    setEditId(null);
    Alert.alert('Listo', 'Cambios guardados.');
  };

  const confirmOptions = (rem: MedReminder) => {
    Alert.alert(rem.name, 'Opciones', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Configurar', onPress: () => openEdit(rem) },
      { text: 'Borrar', style: 'destructive', onPress: () => removeReminder(rem.id) },
    ]);
  };

  const TabButton = ({ k, label, icon }: { k: TabKey; label: string; icon: any }) => {
    const active = tab === k;
    return (
      <Pressable
        onPress={() => setTab(k)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.tabBtn,
          {
            backgroundColor: active ? theme.colors.tabActive : theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={active ? '#fff' : theme.colors.text} />
        <Text style={[styles.tabBtnText, { color: active ? '#fff' : theme.colors.text }]}>{label}</Text>
      </Pressable>
    );
  };

  const Header = (
    <View style={{ gap: 12 }}>
      <View style={[styles.hero, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Ionicons name="sparkles-outline" size={22} color={theme.colors.text} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Asistente Medic</Text>
          <Text style={[styles.heroSub, { color: theme.colors.muted }]}>
            Recordatorios simples, claros y fáciles de usar.
          </Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TabButton k="hoy" label="Hoy" icon="calendar-outline" />
        <TabButton k="todos" label="Todos" icon="list-outline" />
        <TabButton k="agregar" label="Agregar" icon="add-circle-outline" />
      </View>

      {tab === 'hoy' ? (
        <>
          <View style={[styles.grid2, { gap: 10 }]}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.muted }]}>Próxima toma</Text>
              {nextDose ? (
                <>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {pad2(nextDose.when.getHours())}:{pad2(nextDose.when.getMinutes())}
                  </Text>
                  <Text style={[styles.statSub, { color: theme.colors.muted }]}>
                    {nextDose.rem.name}
                    {nextDose.rem.dose ? ` · ${nextDose.rem.dose}` : ''}
                  </Text>
                </>
              ) : (
                <Text style={[styles.statSub, { color: theme.colors.muted }]}>Agregá tu primer recordatorio.</Text>
              )}
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.muted }]}>Progreso de hoy</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {progress.done}/{progress.total}
              </Text>

              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progress.pct * 100)}%`, backgroundColor: theme.colors.tabActive },
                  ]}
                />
              </View>

              <Pressable
                onPress={clearToday}
                accessibilityRole="button"
                accessibilityLabel="Reiniciar tomas de hoy"
                style={styles.resetBtn}
              >
                <Text style={[styles.resetText, { color: theme.colors.muted }]}>Reiniciar hoy</Text>
              </Pressable>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Agenda de hoy</Text>
          <Text style={[styles.sectionHint, { color: theme.colors.muted }]}>
            Tocá “Tomado” para marcar cada medicación.
          </Text>
        </>
      ) : null}

      {tab === 'todos' ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mis recordatorios</Text>
          <Text style={[styles.sectionHint, { color: theme.colors.muted }]}>
            Estos se repiten todos los días a la hora indicada.
          </Text>
        </>
      ) : null}

      {tab === 'agregar' ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Agregar recordatorio</Text>

          <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Medicamento</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Losartán"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Dosis (opcional)</Text>
            <TextInput
              value={dose}
              onChangeText={setDose}
              placeholder="Ej: 1 comprimido"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Hora</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.small, { color: theme.colors.muted }]}>Hora (0-23)</Text>
                <TextInput
                  value={hour}
                  onChangeText={setHour}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.small, { color: theme.colors.muted }]}>Min (0-59)</Text>
                <TextInput
                  value={minute}
                  onChangeText={setMinute}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Nota (opcional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ej: tomar con comida"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <View style={[styles.stockCard, { borderColor: theme.colors.border }]}>
              <Pressable
                onPress={() => setStockEnabled((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Activar control de stock"
                style={styles.stockToggleRow}
              >
                <Ionicons
                  name={stockEnabled ? 'checkbox-outline' : 'square-outline'}
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={[styles.stockToggleText, { color: theme.colors.text }]}>
                  Controlar stock de este medicamento
                </Text>
              </Pressable>

              {stockEnabled ? (
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.small, { color: theme.colors.muted }]}>Stock actual</Text>
                      <TextInput
                        value={stockLeft}
                        onChangeText={setStockLeft}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.small, { color: theme.colors.muted }]}>Por toma</Text>
                      <TextInput
                        value={stockDose}
                        onChangeText={setStockDose}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.small, { color: theme.colors.muted }]}>Avisar si ≤</Text>
                      <TextInput
                        value={stockLow}
                        onChangeText={setStockLow}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ height: 18 }} />
                      <Text style={[styles.stockHint, { color: theme.colors.muted }]}>
                        Ej: si queda poco, se avisa.
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={addReminder}
              accessibilityRole="button"
              accessibilityLabel="Agregar recordatorio"
              style={[styles.addBtn, { backgroundColor: theme.colors.tabActive }]}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Agregar recordatorio</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );

  const data = tab === 'hoy' ? todayTimeline : tab === 'todos' ? sorted : [];

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg}]}>
      <FlatList
        data={data as any}
        keyExtractor={(x: any) => (tab === 'hoy' ? x.rem.id : x.id)}
        ListHeaderComponent={Header}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }: any) => {
          const rem: MedReminder = tab === 'hoy' ? item.rem : item;
          const takenAt: number | undefined = tab === 'hoy' ? item.takenAt : undefined;
          const isTaken = tab === 'hoy' ? !!takenAt : false;

          return (
            <View style={[styles.item, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  {pad2(rem.hour)}:{pad2(rem.minute)} · {rem.name}
                </Text>
                {!!rem.dose && <Text style={[styles.itemSub, { color: theme.colors.muted }]}>{rem.dose}</Text>}
                {!!rem.note && <Text style={[styles.itemSub, { color: theme.colors.muted }]}>{rem.note}</Text>}

                {rem.stockEnabled ? (
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={stockWarn(rem) ? 'warning-outline' : 'cube-outline'}
                      size={16}
                      color={stockWarn(rem) ? '#f59e0b' : theme.colors.muted}
                    />
                    <Text style={[styles.badgeText, { color: theme.colors.muted }]}>
                      Stock: {typeof rem.stockLeft === 'number' ? rem.stockLeft : 0}
                      {rem.stockDose ? ` · ${rem.stockDose}/toma` : ''}
                      {stockWarn(rem) ? ' · Reponer' : ''}
                    </Text>
                  </View>
                ) : null}

                {tab === 'hoy' ? (
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={isTaken ? 'checkmark-circle' : 'time-outline'}
                      size={16}
                      color={isTaken ? theme.colors.tabActive : theme.colors.muted}
                    />
                    <Text style={[styles.badgeText, { color: theme.colors.muted }]}>
                      {isTaken
                        ? `Tomado ${new Date(takenAt!).toLocaleTimeString().slice(0, 5)}`
                        : 'Pendiente'}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={() => confirmOptions(rem)}
                accessibilityRole="button"
                accessibilityLabel="Opciones"
                hitSlop={10}
                style={styles.moreBtn}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.muted} />
              </Pressable>

              {tab === 'hoy' ? (
                <Pressable
                  onPress={() => (isTaken ? undoTaken(rem.id) : markTaken(rem.id))}
                  accessibilityRole="button"
                  accessibilityLabel={isTaken ? 'Desmarcar tomado' : 'Marcar como tomado'}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor: isTaken ? theme.colors.card : theme.colors.tabActive,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: isTaken ? theme.colors.text : '#fff', fontWeight: '900' }}>
                    {isTaken ? 'Deshacer' : 'Tomado'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          tab === 'agregar' ? null : (
            <View style={{ paddingVertical: 18 }}>
              <Text style={{ color: theme.colors.muted }}>
                {tab === 'hoy'
                  ? 'No hay recordatorios aún. Andá a “Agregar”.'
                  : 'Todavía no tenés recordatorios. Andá a “Agregar”.'}
              </Text>
            </View>
          )
        }
      />

      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Configurar medicamento</Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>Medicamento</Text>
            <TextInput
              value={eName}
              onChangeText={setEName}
              placeholder="Nombre"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Dosis (opcional)</Text>
            <TextInput
              value={eDose}
              onChangeText={setEDose}
              placeholder="Ej: 1 comprimido"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Hora</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.small, { color: theme.colors.muted }]}>Hora (0-23)</Text>
                <TextInput
                  value={eHour}
                  onChangeText={setEHour}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.small, { color: theme.colors.muted }]}>Min (0-59)</Text>
                <TextInput
                  value={eMinute}
                  onChangeText={setEMinute}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Nota (opcional)</Text>
            <TextInput
              value={eNote}
              onChangeText={setENote}
              placeholder="Ej: tomar con comida"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <View style={[styles.stockCard, { borderColor: theme.colors.border }]}>
              <Pressable
                onPress={() => setEStockEnabled((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Activar control de stock"
                style={styles.stockToggleRow}
              >
                <Ionicons
                  name={eStockEnabled ? 'checkbox-outline' : 'square-outline'}
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={[styles.stockToggleText, { color: theme.colors.text }]}>Controlar stock</Text>
              </Pressable>

              {eStockEnabled ? (
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.small, { color: theme.colors.muted }]}>Stock actual</Text>
                      <TextInput
                        value={eStockLeft}
                        onChangeText={setEStockLeft}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.small, { color: theme.colors.muted }]}>Por toma</Text>
                      <TextInput
                        value={eStockDose}
                        onChangeText={setEStockDose}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.small, { color: theme.colors.muted }]}>Avisar si ≤</Text>
                      <TextInput
                        value={eStockLow}
                        onChangeText={setEStockLow}
                        keyboardType="number-pad"
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ height: 18 }} />
                      <Text style={[styles.stockHint, { color: theme.colors.muted }]}>Umbral de aviso.</Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={() => setEditOpen(false)}
                accessibilityRole="button"
                style={[styles.modalBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '900' }}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={saveEdit}
                accessibilityRole="button"
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.tabActive, borderColor: theme.colors.tabActive },
                ]}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Guardar</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                if (editId) removeReminder(editId);
              }}
              accessibilityRole="button"
              style={[styles.deleteRow]}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={styles.deleteText}>Borrar medicamento</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  hero: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 18, fontWeight: '900' },
  heroSub: { marginTop: 2, fontSize: 13 },

  tabsRow: { flexDirection: 'row', gap: 10 },
  tabBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabBtnText: { fontSize: 13, fontWeight: '900' },

  grid2: { flexDirection: 'row' },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  statLabel: { fontSize: 12, fontWeight: '800' },
  statValue: { marginTop: 6, fontSize: 22, fontWeight: '900' },
  statSub: { marginTop: 4, fontSize: 13 },

  progressBar: { marginTop: 10, height: 10, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  resetBtn: { marginTop: 10, alignSelf: 'flex-start' },
  resetText: { fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },

  sectionTitle: { marginTop: 6, fontSize: 16, fontWeight: '900' },
  sectionHint: { marginTop: 3, fontSize: 13 },

  formCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  label: { fontSize: 14, fontWeight: '800', marginTop: 10, marginBottom: 6 },
  small: { fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },

  stockCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  stockToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stockToggleText: {
    fontSize: 14,
    fontWeight: '900',
  },
  stockHint: {
    fontSize: 12,
    fontWeight: '700',
  },

  addBtn: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  item: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  itemTitle: { fontSize: 16, fontWeight: '900' },
  itemSub: { marginTop: 3, fontSize: 13 },

  badgeText: { fontSize: 12, fontWeight: '800' },

  pillBtn: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  moreBtn: {
    padding: 8,
    marginRight: 2,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#ef4444',
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
});