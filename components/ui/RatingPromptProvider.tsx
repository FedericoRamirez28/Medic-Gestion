// components/RatingPromptProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PromptOptions = {
  onConfirm?: () => void;
  confirmLabel?: string;
};

type Ctx = {
  openPrompt: (opts?: PromptOptions) => void;

  // Compat:
  requestExitWithPrompt: () => void;
  markAsRated: () => Promise<void>;
  setOptOut: (v: boolean) => Promise<void>;

  // Control fino:
  setRootBackHandlerEnabled: (v: boolean) => void;
};

export const RatingPromptContext = createContext<Ctx>({
  openPrompt: () => {},
  requestExitWithPrompt: () => {},
  markAsRated: async () => {},
  setOptOut: async () => {},
  setRootBackHandlerEnabled: () => {},
});

const KEY_DONE = 'ratingPrompt_done';
const KEY_OPTOUT = 'ratingPrompt_optOut';

type Props = {
  children: React.ReactNode;
  isOnRootScreen?: boolean;
};

export default function RatingPromptProvider({ children, isOnRootScreen = true }: Props) {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState<boolean | null>(null);
  const [optOut, setOptOutState] = useState<boolean | null>(null);

  const pendingActionRef = useRef<PromptOptions | null>(null);

  // 👇 Para “blindaje”: por defecto NO interceptamos back con rating.
  const shouldHandleBackRef = useRef<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, o] = await Promise.all([
          AsyncStorage.getItem(KEY_DONE),
          AsyncStorage.getItem(KEY_OPTOUT),
        ]);
        setDone(d === '1');
        setOptOutState(o === '1');
      } catch {
        setDone(false);
        setOptOutState(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isOnRootScreen) return false;
      if (done || optOut) return false;

      if (shouldHandleBackRef.current) {
        pendingActionRef.current = {
          onConfirm: () => {
            if (Platform.OS === 'android') BackHandler.exitApp();
          },
          confirmLabel: 'Salir',
        };
        setVisible(true);
        return true;
      }
      return false;
    });

    return () => sub.remove();
  }, [done, optOut, isOnRootScreen]);

  const openPlayStorePage = useCallback(async () => {
    const appId = Application.applicationId ?? '';
    const httpsUrl = appId
      ? `https://play.google.com/store/apps/details?id=${appId}`
      : 'https://play.google.com/store';

    // market:// solo si tengo appId
    const marketUrl = appId ? `market://details?id=${appId}` : null;

    try {
      if (marketUrl) {
        const supported = await Linking.canOpenURL(marketUrl);
        if (supported) {
          await Linking.openURL(marketUrl);
          return;
        }
      }
      await Linking.openURL(httpsUrl);
    } catch {
      // ignore
    }
  }, []);

  const doReviewFlow = useCallback(async () => {
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
        return;
      }
      await openPlayStorePage();
    } catch {
      await openPlayStorePage();
    }
  }, [openPlayStorePage]);

  const markAsRated = useCallback(async () => {
    try {
      await AsyncStorage.setItem(KEY_DONE, '1');
    } catch {}
    setDone(true);
  }, []);

  const setOptOut = useCallback(async (v: boolean) => {
    try {
      await AsyncStorage.setItem(KEY_OPTOUT, v ? '1' : '0');
    } catch {}
    setOptOutState(v);
  }, []);

  const openPrompt = useCallback((opts?: PromptOptions) => {
    if (done || optOut) {
      opts?.onConfirm?.();
      return;
    }
    pendingActionRef.current = opts ?? null;
    setVisible(true);
  }, [done, optOut]);

  const requestExitWithPrompt = useCallback(() => {
    if (done || optOut) return;
    pendingActionRef.current = {
      onConfirm: () => { if (Platform.OS === 'android') BackHandler.exitApp(); },
      confirmLabel: 'Salir',
    };
    setVisible(true);
  }, [done, optOut]);

  const onRateNow = useCallback(async () => {
    setVisible(false);
    await doReviewFlow();
    // ✅ Importante: marcamos done igual para evitar loops
    await markAsRated();
  }, [doReviewFlow, markAsRated]);

  const onNoMore = useCallback(async () => {
    await setOptOut(true);
    setVisible(false);
    pendingActionRef.current?.onConfirm?.();
    pendingActionRef.current = null;
  }, [setOptOut]);

  const onContinueAnyway = useCallback(() => {
    const action = pendingActionRef.current?.onConfirm;
    setVisible(false);
    action?.();
    pendingActionRef.current = null;
  }, []);

  const value = useMemo<Ctx>(() => ({
    openPrompt,
    requestExitWithPrompt,
    markAsRated,
    setOptOut,
    setRootBackHandlerEnabled: (v: boolean) => { shouldHandleBackRef.current = v; },
  }), [openPrompt, requestExitWithPrompt, markAsRated, setOptOut]);

  const ready = done !== null && optOut !== null;
  const confirmLabel = pendingActionRef.current?.confirmLabel || 'Continuar';

  return (
    <RatingPromptContext.Provider value={value}>
      {children}
      {ready && (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
          <View style={styles.backdrop}>
            <View style={styles.card}>
              <Text style={styles.title}>¿Querés calificar la app?</Text>
              <Text style={styles.subtitle}>
                Si te resultó útil, podés dejarnos una reseña en Play Store. (Opcional)
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onRateNow}>
                  <Text style={styles.btnTxtPrimary}>Calificar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.neutral]} onPress={() => setVisible(false)}>
                  <Text style={styles.btnTxt}>Más tarde</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.neutral]} onPress={onNoMore}>
                  <Text style={styles.btnTxt}>No mostrar más</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, styles.danger]} onPress={onContinueAnyway}>
                  <Text style={styles.btnTxtDanger}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </RatingPromptContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 16, backgroundColor: '#111827', padding: 18, gap: 12, elevation: 6 },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#cbd5e1' },
  actions: { marginTop: 8, gap: 10 },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  primary: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  neutral: { backgroundColor: '#1f2937' },
  danger: { backgroundColor: '#111827', borderColor: '#ef4444' },
  btnTxtPrimary: { color: '#06120a', fontWeight: '700' },
  btnTxt: { color: '#e5e7eb', fontWeight: '600' },
  btnTxtDanger: { color: '#ef4444', fontWeight: '700' },
});
