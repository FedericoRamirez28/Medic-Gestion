import { useAuth } from '@/app/(tabs)/context';
import { RatingPromptContext } from '@/components/ui/RatingPromptProvider';
import { getInfoByDni } from '@/lib/supportApi';
import { config } from '@/lib/supportConfig';
import { respond, type Action, type Intent } from '@/lib/supportEngine';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMenu } from './MenuProvider';
import { useAppTheme } from '@/components/theme/AppThemeProvider';
import type { ThemeMode } from '@/components/theme/appTheme';

const W = Dimensions.get('window').width;
const MENU_W = Math.min(320, Math.round(W * 0.86));

const FORCE_TEST_HOUR: number | null = null;
function nowForTest() {
  const d = new Date();
  if (FORCE_TEST_HOUR != null) d.setHours(FORCE_TEST_HOUR, 0, 0, 0);
  return d;
}

type Msg = { from: 'bot' | 'user'; text: string };

/* Helpers DNI */
function normalizeDni(raw: string): string | null {
  const only = (raw || '').replace(/[^\d]/g, '');
  if (/^\d{7,9}$/.test(only)) return only;
  return null;
}
function extractDniFromText(text: string): string | null {
  const t = text.toLowerCase();
  const m = t.match(/dni\s*(es|:)?\s*([0-9.\s-]{7,15})/i);
  if (m?.[2]) {
    const n = normalizeDni(m[2]);
    if (n) return n;
  }
  const onlyNums = normalizeDni(t);
  if (onlyNums) return onlyNums;
  return null;
}
function formatDniDots(dni: string) {
  if (!/^\d{7,9}$/.test(dni)) return dni;
  const s = dni.padStart(8, '0');
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
}

async function safeOpenURL(url: string) {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) throw new Error('cant-open');
    await Linking.openURL(url);
  } catch {
    Alert.alert('Error', 'No se pudo abrir el enlace en tu dispositivo.');
  }
}

export function RightMenu() {
  const { theme, mode, setMode } = useAppTheme();

  const { isOpen, close } = useMenu();
  const { user, setUser } = useAuth();
  const router = useRouter();
  const x = useRef(new Animated.Value(MENU_W)).current;

  const { openPrompt } = useContext(RatingPromptContext);

  const [messages, setMessages] = useState<Msg[]>([
    { from: 'bot', text: 'Hola 👋 Soy tu asistente. ¿Qué necesitás?' },
  ]);
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const [input, setInput] = useState('');

  const listRef = useRef<FlatList<Msg>>(null);
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
    });
  };

  useEffect(() => {
    Animated.timing(x, {
      toValue: isOpen ? 0 : MENU_W,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isOpen, x]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const pushBot = (text: string) => setMessages((m) => [...m, { from: 'bot', text }]);
  const pushUser = (text: string) => setMessages((m) => [...m, { from: 'user', text }]);

  function answerFromCache(feature: 'mi_plan' | 'mi_estado' | 'mi_credencial'): boolean {
    const u: any = user || {};
    if (!u?.dni) return false;

    const nombre = u.nombre ?? 'Socio';
    const plan = u.plan;
    const contrato = u.numero_contrato;
    const habilitado = typeof u.habilitado === 'boolean' ? u.habilitado : undefined;

    const hasPlan = !!plan;
    const hasContrato = !!contrato;
    const hasEstado = typeof habilitado === 'boolean';

    if (feature === 'mi_plan' && (hasPlan || hasContrato || hasEstado)) {
      pushBot(
        `👤 ${nombre}\n` +
          `Plan: ${plan ?? '—'}\n` +
          `Contrato: ${contrato ?? '—'}\n` +
          `Cobertura: ${
            habilitado === true ? '✅ VIGENTE' : habilitado === false ? '❌ NO VIGENTE' : '—'
          }`
      );
      return true;
    }

    if (feature === 'mi_estado' && hasEstado) {
      pushBot(
        `🧾 Estado de cobertura para ${nombre}:\n` +
          (habilitado ? '✅ ACTIVA y al día' : '❌ SUSPENDIDA / INACTIVA')
      );
      return true;
    }

    if (feature === 'mi_credencial' && (hasContrato || hasEstado)) {
      pushBot(
        `📇 Credencial digital:\n` +
          `• Nº de contrato: ${contrato ?? '—'}\n` +
          `• Titular: ${nombre}\n` +
          `• Estado: ${habilitado === true ? '✅ Vigente' : habilitado === false ? '❌ No vigente' : '—'}\n` +
          `Podés verla en la pestaña “Credencial”.`
      );
      return true;
    }

    return false;
  }

  async function answerWithDni(feature: 'mi_plan' | 'mi_estado' | 'mi_credencial') {
    const dni = (user as any)?.dni || (user as any)?.documento || (user as any)?.doc;
    if (!dni) {
      pushBot(
        'Necesito tu DNI para consultar tu información. Escribí: "mi dni es 30.123.456" (o sin puntos).'
      );
      return;
    }

    if (answerFromCache(feature)) return;

    try {
      const info = await getInfoByDni(String(dni));
      if (!info) {
        pushBot(`No pude obtener datos para el DNI ${dni}. Probá más tarde.`);
        return;
      }

      const nextUser = {
        ...(user as any),
        dni: String(info.dni ?? dni),
        nombre: info.nombre ?? (user as any)?.nombre ?? 'Afiliado',
        plan: info.plan ?? (user as any)?.plan,
        numero_contrato: info.numero_contrato ?? (user as any)?.numero_contrato,
        habilitado: typeof info.habilitado === 'boolean' ? info.habilitado : (user as any)?.habilitado,
      };
      try {
        setUser(nextUser);
      } catch {}

      const nombre = nextUser.nombre ?? 'Socio';
      if (feature === 'mi_plan') {
        pushBot(
          `👤 ${nombre}\n` +
            `Plan: ${nextUser.plan ?? '—'}\n` +
            `Contrato: ${nextUser.numero_contrato ?? '—'}\n` +
            `Cobertura: ${nextUser.habilitado ? '✅ VIGENTE' : '❌ NO VIGENTE'}`
        );
      } else if (feature === 'mi_estado') {
        pushBot(
          `🧾 Estado de cobertura para ${nombre}:\n` +
            (nextUser.habilitado ? '✅ ACTIVA y al día' : '❌ SUSPENDIDA / INACTIVA')
        );
      } else {
        pushBot(
          `📇 Credencial digital:\n` +
            `• Nº de contrato: ${nextUser.numero_contrato ?? '—'}\n` +
            `• Titular: ${nombre}\n` +
            `• Estado: ${nextUser.habilitado ? '✅ Vigente' : '❌ No vigente'}\n` +
            `Podés verla en la pestaña “Credencial”.`
        );
      }
    } catch {
      pushBot('Tuvimos un problema consultando tu información. Intentá nuevamente más tarde.');
    }
  }

  async function maybeCaptureDni(text: string) {
    const found = extractDniFromText(text);
    if (!found) return false;
    const formatted = formatDniDots(found);
    const prevDni = (user as any)?.dni ? String((user as any).dni) : null;

    if (prevDni && prevDni !== found) {
      setUser({ ...(user as any), dni: found });
      pushBot(`Actualicé tu DNI a ${formatted}.`);
    } else if (!prevDni) {
      setUser({ ...(user as any), dni: found });
      pushBot(`Perfecto, guardé tu DNI: ${formatted}. Podés preguntarme "mi plan" o "mi estado".`);
    } else {
      pushBot(`Ya tenía registrado tu DNI: ${formatDniDots(prevDni)}.`);
    }
    return true;
  }

  const send = async (q: string) => {
    const text = q.trim();
    if (!text) return;

    pushUser(text);
    scrollToBottom();

    await maybeCaptureDni(text);

    const action = respond(text, nowForTest());
    setLastAction(action);

    setTimeout(() => {
      pushBot(action.message);
      scrollToBottom();
    }, 80);

    const feature = action.meta?.feature as 'mi_plan' | 'mi_estado' | 'mi_credencial' | undefined;
    if (action.meta?.requiresDni && feature) {
      await answerWithDni(feature);
      scrollToBottom();
    }

    setInput('');
  };

  const triggerIntent = (intent: Intent) => {
   const ph =
  intent === 'reclamos'
    ? 'Tengo un reclamo'
    : intent === 'comercial'
      ? 'Consulta comercial'
      : intent === 'mi_plan'
        ? 'Mi plan'
        : intent === 'mi_estado'
          ? 'Mi estado'
          : 'Mi credencial';

    send(ph);
  };

  const doPrimaryAction = async () => {
    if (!lastAction) return;

    if (lastAction.call) {
      const tel = `tel:${String(lastAction.call).replace(/\s/g, '')}`;
      await safeOpenURL(tel);
      return;
    }
    if (lastAction.whatsapp) {
      await safeOpenURL(lastAction.whatsapp);
      return;
    }
  };

  const doRealLogout = () => {
    close();
    try {
      setUser(null as any);
    } catch {}
    router.replace('/Login');
  };

  const logout = () => {
    openPrompt({
      onConfirm: doRealLogout,
      confirmLabel: 'Cerrar sesión sin calificar',
    });
  };

  const ThemeChip = ({ label, value }: { label: string; value: ThemeMode }) => {
    const active = mode === value;
    return (
      <TouchableOpacity
        onPress={() => setMode(value)}
        style={[
          styles.chip,
          {
            backgroundColor: active ? theme.colors.buttonBg : theme.colors.chipBg,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={{ color: active ? theme.colors.buttonText : theme.colors.chipText, fontSize: 12, fontWeight: '700' }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={close}
        style={[styles.overlay, { display: isOpen ? 'flex' : 'none', backgroundColor: theme.colors.overlay }]}
      />

      <Animated.View style={[styles.drawer, { transform: [{ translateX: x }], backgroundColor: theme.colors.drawerBg }]}>
        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Menú</Text>

        {/* ✅ Selector de tema */}
        <View style={[styles.botCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apariencia</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <ThemeChip label="Sistema" value="system" />
            <ThemeChip label="Claro" value="light" />
            <ThemeChip label="Oscuro" value="dark" />
          </View>
        </View>

        <View style={[styles.botCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Asistente</Text>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            style={{ maxHeight: 220 }}
            contentContainerStyle={{ paddingBottom: 6 }}
            onContentSizeChange={scrollToBottom}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.from === 'user'
                    ? { backgroundColor: theme.colors.bubbleUserBg, alignSelf: 'flex-end' }
                    : { backgroundColor: theme.colors.bubbleBotBg, alignSelf: 'flex-start' },
                ]}
              >
                <Text style={[styles.bubbleText, { color: theme.colors.text }]}>{item.text}</Text>
              </View>
            )}
          />

          <View style={styles.quickRow}>
            <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.chipBg, borderColor: theme.colors.border }]} onPress={() => triggerIntent('reclamos')}>
              <Text style={[styles.chipText, { color: theme.colors.chipText }]}>Reclamos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.chipBg, borderColor: theme.colors.border }]} onPress={() => triggerIntent('comercial')}>
              <Text style={[styles.chipText, { color: theme.colors.chipText }]}>Comercial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.chipBg, borderColor: theme.colors.border }]} onPress={() => triggerIntent('mi_plan')}>
              <Text style={[styles.chipText, { color: theme.colors.chipText }]}>Mi plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.chipBg, borderColor: theme.colors.border }]} onPress={() => triggerIntent('mi_estado')}>
              <Text style={[styles.chipText, { color: theme.colors.chipText }]}>Mi estado</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.chipBg, borderColor: theme.colors.border }]} onPress={() => triggerIntent('mi_credencial')}>
              <Text style={[styles.chipText, { color: theme.colors.chipText }]}>Mi credencial</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              placeholder="Escribí: mi plan, mi estado, credencial… o 'mi dni es 30.123.456'"
              placeholderTextColor={theme.isDark ? '#93A4B8' : '#99A2AD'}
              style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border, borderWidth: 1 }]}
              returnKeyType="send"
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.colors.buttonBg }]} onPress={() => send(input)}>
              <Text style={{ color: theme.colors.buttonText, fontWeight: '800' }}>Enviar</Text>
            </TouchableOpacity>
          </View>

          {lastAction && (lastAction.call || lastAction.whatsapp) && (
            <View style={{ marginTop: 10 }}>
              <TouchableOpacity style={[styles.callBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={doPrimaryAction}>
                <Text style={[styles.callText, { color: theme.colors.text }]}>
                  {lastAction.call ? `Llamar ${lastAction.call}` : 'Abrir WhatsApp'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={{ marginTop: 6, color: theme.colors.muted, fontSize: 12 }}>
            Horario atención: {config.horario.start}:00–{config.horario.end}:00
          </Text>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.colors.border }]} onPress={logout}>
          <Text style={[styles.logoutText, { color: theme.colors.text }]}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.isDark ? '#8BC6F0' : '#2d5c72' }]}>versión : 1.1.0</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },

  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: MENU_W,
    paddingTop: Platform.select({ ios: 54, android: 24 }),
    paddingHorizontal: 16,
    gap: 12,
  },

  menuTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },

  botCard: { borderRadius: 12, padding: 12 },

  sectionTitle: { fontWeight: '700', marginBottom: 8 },

  bubble: { borderRadius: 10, padding: 8, marginVertical: 4, maxWidth: '92%' },
  bubbleText: {},

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 12 },

  inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { paddingHorizontal: 12, borderRadius: 10, justifyContent: 'center' },

  callBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  callText: { fontWeight: '600' },

  logoutBtn: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  logoutText: { fontWeight: '700' },

  version: { textAlign: 'center', marginTop: 6 },
});

export default RightMenu;
