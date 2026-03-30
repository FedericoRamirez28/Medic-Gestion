import whatsappIcon from '@/assets/icons/whatsapp.png';
import OffersCarousel from '@/components/ui/carrousel';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as IntentLauncher from 'expo-intent-launcher';
import { useAppTheme } from '@/components/theme/AppThemeProvider';

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  img: any;
  extraInfo?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function safeOpenURL(url: string) {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      }
    } catch {}
  }

  if (Platform.OS === 'android') {
    try {
      if (url.startsWith('tel:')) {
        const phone = url.replace('tel:', '').trim();
        await IntentLauncher.startActivityAsync('android.intent.action.DIAL', {
          data: `tel:${phone}`,
        });
        return true;
      }

      if (url.startsWith('mailto:')) {
        await IntentLauncher.startActivityAsync('android.intent.action.SENDTO', {
          data: url,
        });
        return true;
      }

      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: url });
      return true;
    } catch {}
  }

  Alert.alert('Error', 'No se pudo abrir el enlace en tu dispositivo.');
  return false;
}

export default function AfiliacionScreen() {
  const { theme } = useAppTheme();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);
  const styles = useMemo(() => createStyles(s, insets, height), [s, insets, height]);

  const paperTheme = useMemo(
    () => ({
      roundness: 12,
      colors: {
        primary: theme.colors.primary,
        onPrimary: theme.colors.buttonText,
        background: theme.colors.surface,
        surface: theme.colors.card,
        onSurface: theme.colors.text,
        outline: theme.colors.border,
        onSurfaceVariant: theme.colors.muted,
        placeholder: theme.colors.muted,
      },
    }),
    [theme]
  );

  const destinatario = useMemo(() => 'comercial@medic.com.ar', []);
  const telefonoComercialDisplay = useMemo(() => '+54 9 11 3636-3342', []);
  const telefonoComercialTel = useMemo(() => '+5491136363342', []);
  const waDigits = useMemo(() => '5491136363342', []);

  const validar = () => {
    if (!nombre.trim()) return 'Ingresá tu nombre.';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
    if (!emailOk) return 'Ingresá un correo válido.';
    if (!mensaje.trim()) return 'Escribí tu consulta.';
    return null;
  };

  const handleEnviar = async () => {
    const err = validar();
    if (err) return Alert.alert('Falta información', err);

    const subject = 'Consulta de alta / acceso (Medic Gestión)';
    const body = `Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`;

    const url = `mailto:${destinatario}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const ok = await safeOpenURL(url);

    if (!ok) {
      Alert.alert(
        'No se pudo abrir el correo',
        'No se encontró una app de correo configurada en este dispositivo.\n\nPodés escribirnos por WhatsApp desde el botón verde.'
      );
    }
  };

  const openWhatsApp = async () => {
    const msg = 'Hola, quiero info para acceder/activar Medic Gestión';
    const url = `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`;
    await safeOpenURL(url);
  };

  const callPhone = async () => {
    await safeOpenURL(`tel:${telefonoComercialTel}`);
  };

  const mailDirect = async () => {
    const url = `mailto:${destinatario}`;
    const ok = await safeOpenURL(url);
    if (!ok) {
      Alert.alert(
        'No se pudo abrir el correo',
        'No se encontró una app de correo configurada en este dispositivo.\n\nPodés escribirnos por WhatsApp.'
      );
    }
  };

  const keyboardOffset = (insets.top || 0) + (Platform.OS === 'ios' ? 8 : 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View style={styles.flex}>
          {/* Background */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.bg, { backgroundColor: theme.colors.bg }]} />
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
            scrollEventThrottle={16}
            decelerationRate="fast"
            overScrollMode="always"
            alwaysBounceVertical
            nestedScrollEnabled
          >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.botonLogin, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/Login')}
                accessibilityRole="button"
                accessibilityLabel="Ingresar"
                activeOpacity={0.9}
              >
                <Text style={[styles.textoBotonLogin, { color: theme.colors.buttonText }]}>INGRESAR</Text>
              </TouchableOpacity>

              <Image
                source={require('@/assets/images/logo-medic-simple.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.hero}>
              <Text style={[styles.titulo, { color: theme.colors.text }]}>Bienvenidos</Text>
              <Text style={[styles.subtitulo, { color: theme.colors.muted }]}>
                Plataforma de gestión y acceso para usuarios habilitados.
              </Text>
            </View>

            <View style={[styles.cajaTexto, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
              <Text style={[styles.texto, { color: theme.colors.text }]}>
                Desde acá podés solicitar información, pedir alta o comunicarte con el área comercial/soporte para
                activar el acceso.
              </Text>
            </View>

            <View style={styles.sectionHead}>
              <Text style={[styles.bloqueTitulo, { color: theme.colors.text }]}>¿Qué podés hacer en la app?</Text>
              <View style={[styles.lineaInferior, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={[styles.carouselWrap, { borderColor: theme.colors.border }]}>
              <OffersCarousel onSlidePress={(item: Slide) => setSelectedSlide(item)} />
            </View>

            <View style={styles.sectionHead}>
              <View style={[styles.lineaInferior2, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.bloqueTitulo, { color: theme.colors.text }]}>Contacto</Text>
            </View>

            <View style={[styles.cajaTexto, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.texto, { color: theme.colors.text }]}>
                Podés escribirnos por WhatsApp, mail o llamarnos. Te respondemos a la brevedad.
              </Text>
            </View>

            <View style={styles.contactoContainer}>
              <TouchableOpacity
                style={[styles.contactoFila, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={callPhone}
                activeOpacity={0.85}
              >
                <Image source={require('@/assets/icons/telefono-icon-hd.png')} style={styles.iconoContacto} />
                <Text style={[styles.iconBox, { color: theme.colors.text }]} numberOfLines={2}>
                  {telefonoComercialDisplay}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactoFila, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={mailDirect}
                activeOpacity={0.85}
              >
                <Image source={require('@/assets/icons/mail-icon-hd.png')} style={styles.iconoContacto} />
                <Text style={[styles.iconBox, { color: theme.colors.text }]} numberOfLines={2}>
                  {destinatario}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHead}>
              <View style={[styles.lineaInferior2, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.bloqueTitulo, { color: theme.colors.text }]}>Formulario de contacto</Text>
            </View>

            <View style={[styles.form, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                theme={paperTheme as any}
                label="Tu nombre"
                mode="outlined"
                value={nombre}
                onChangeText={setNombre}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                contentStyle={[styles.inputContent, { color: theme.colors.text }]}
                dense
              />

              <TextInput
                theme={paperTheme as any}
                label="Tu correo electrónico"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                contentStyle={[styles.inputContent, { color: theme.colors.text }]}
                dense
              />

              <TextInput
                theme={paperTheme as any}
                label="¿En qué podemos ayudarte?"
                mode="outlined"
                multiline
                value={mensaje}
                onChangeText={setMensaje}
                style={[styles.input, styles.inputMultiline, { backgroundColor: theme.colors.surface }]}
                contentStyle={[styles.inputContent, styles.inputMultilineContent, { color: theme.colors.text }]}
              />

              <TouchableOpacity
                style={[styles.botonEnviar, { backgroundColor: theme.colors.primary }]}
                onPress={handleEnviar}
                activeOpacity={0.9}
              >
                <Text style={[styles.botonEnviarTexto, { color: theme.colors.buttonText }]}>ENVIAR</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: styles.__spacerBottom.height }} />
          </ScrollView>

          {/* Floating WhatsApp */}
          {!selectedSlide && (
            <TouchableOpacity
              style={[styles.fixedWhatsApp, { backgroundColor: '#25D366' }]}
              onPress={openWhatsApp}
              accessibilityRole="button"
              accessibilityLabel="Abrir WhatsApp"
              activeOpacity={0.9}
            >
              <Image source={whatsappIcon} style={styles.whatsappIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}

          {/* Modal */}
          <Modal visible={!!selectedSlide} transparent animationType="fade" onRequestClose={() => setSelectedSlide(null)}>
            <Pressable style={[styles.modalBg, { backgroundColor: theme.colors.overlay }]} onPress={() => setSelectedSlide(null)}>
              <Pressable
                style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => {}}
              >
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedSlide(null)} hitSlop={24}>
                  <Text style={[styles.modalCloseText, { color: theme.colors.text }]}>×</Text>
                </TouchableOpacity>

                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedSlide?.title}</Text>

                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={styles.modalBodyContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  overScrollMode="always"
                  alwaysBounceVertical
                >
                  <Text style={[styles.modalText, { color: theme.colors.muted }]}>{selectedSlide?.extraInfo || ''}</Text>
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(
  s: number,
  insets: { top: number; bottom: number; left: number; right: number },
  height: number
) {
  const isShort = height < 720;

  const padH = clamp(16, 14, 18);
  const titleSize = clamp(40 * s, 26, 44);
  const subSize = clamp(22 * s, 14, 24);
  const blockTitle = clamp(28 * s, 18, 30);
  const body = clamp(16 * s, 13, 18);
  const contactText = clamp(24 * s, 14, 22);

  const logoW = clamp(150 * s, 110, 170);
  const logoH = clamp(80 * s, 54, 92);

  const waSize = clamp(40 * s, 30, 44);
  const waPad = clamp(16 * s, 12, 18);

  const bottomSafe = Math.max(insets.bottom || 0, 10);
  const waBottom = bottomSafe + 14;
  const spacerBottom = waBottom + waPad * 2 + waSize;

  return StyleSheet.create({
    __spacerBottom: { height: spacerBottom },
    flex: { flex: 1 },
    safe: { flex: 1 },
    bg: { flex: 1 },

    container: {
      flexGrow: 1,
      paddingHorizontal: padH,
      paddingBottom: 16,
      gap: clamp(18 * s, 12, 22),
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: clamp(12 * s, 10, 16),
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: clamp(6 * s, 4, 10),
    },

    logo: { width: logoW, height: logoH },

    botonLogin: {
      paddingVertical: clamp(8 * s, 7, 10),
      paddingHorizontal: clamp(12 * s, 10, 14),
      borderRadius: 10,
      minWidth: clamp(100 * s, 86, 112),
      alignItems: 'center',
      justifyContent: 'center',
    },

    textoBotonLogin: {
      textAlign: 'center',
      fontSize: clamp(16 * s, 13, 17),
      letterSpacing: 0.5,
      fontWeight: '900',
    },

    hero: { paddingHorizontal: 6, paddingTop: isShort ? 2 : 8 },

    titulo: {
      textAlign: 'left',
      fontSize: titleSize,
      marginTop: 6,
      lineHeight: clamp(titleSize + 6, 30, 54),
      fontWeight: '900',
    },

    subtitulo: {
      fontSize: subSize,
      marginTop: 8,
      marginBottom: 6,
      textAlign: 'left',
      fontWeight: '600',
      lineHeight: clamp(subSize + 6, 18, 34),
    },

    cajaTexto: {
      padding: clamp(12 * s, 10, 14),
      borderRadius: 12,
      borderWidth: 1,
    },

    texto: {
      fontSize: body,
      lineHeight: clamp(body + 7, 18, 28),
      fontWeight: '700',
    },

    sectionHead: { gap: 10 },

    lineaInferior: {
      height: 2,
      width: '55%',
      borderRadius: 2,
    },

    lineaInferior2: {
      height: 2,
      width: '100%',
      borderRadius: 2,
    },

    bloqueTitulo: {
      textAlign: 'left',
      paddingTop: clamp(18 * s, 12, 22),
      paddingBottom: clamp(8 * s, 6, 12),
      fontSize: blockTitle,
      lineHeight: clamp(blockTitle + 6, 24, 40),
      fontWeight: '900',
    },

    carouselWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },

    contactoContainer: { marginHorizontal: 4, marginTop: 4, gap: 12 },
    contactoFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
    },

    iconoContacto: {
      width: clamp(40 * s, 28, 44),
      height: clamp(40 * s, 28, 44),
      resizeMode: 'contain',
    },

    iconBox: {
      flex: 1,
      fontSize: contactText,
      lineHeight: clamp(contactText + 6, 18, 30),
      fontWeight: '800',
    },

    form: { gap: 10, borderRadius: 16, padding: 14, borderWidth: 1 },

    input: {
      width: '100%',
      borderRadius: 12,
      marginTop: 10,
    },

    inputContent: {
      fontSize: clamp(16 * s, 14, 18),
      lineHeight: clamp(20 * s, 18, 26),
    },

    inputMultiline: { minHeight: clamp(120 * s, 90, 160) },
    inputMultilineContent: { minHeight: clamp(120 * s, 90, 160) },

    botonEnviar: {
      paddingVertical: clamp(14 * s, 12, 16),
      borderRadius: 12,
      width: '100%',
      marginTop: 14,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    botonEnviarTexto: {
      fontWeight: '900',
      textAlign: 'center',
      fontSize: clamp(16 * s, 14, 18),
      letterSpacing: 0.5,
    },

    fixedWhatsApp: {
      position: 'absolute',
      bottom: waBottom,
      right: 16,
      borderRadius: 999,
      padding: waPad,
      zIndex: 99,
      elevation: 12,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },

    whatsappIcon: { width: waSize, height: waSize, alignSelf: 'center' },

    modalBg: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },

    modalContent: {
      width: '90%',
      maxWidth: 520,
      borderRadius: 18,
      padding: clamp(22 * s, 16, 26),
      alignItems: 'center',
      maxHeight: isShort ? '80%' : '70%',
      borderWidth: 1,
    },

    modalClose: { position: 'absolute', top: 10, right: 10, zIndex: 10, borderRadius: 18, padding: 6 },
    modalCloseText: { fontSize: clamp(28 * s, 22, 30) },

    modalTitle: {
      fontSize: clamp(22 * s, 16, 24),
      marginBottom: 12,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: clamp(28 * s, 20, 34),
      fontWeight: '900',
    },

    modalBody: { width: '100%', flexGrow: 0 },
    modalBodyContent: { paddingBottom: 8 },
    modalText: {
      fontSize: clamp(16 * s, 13, 18),
      textAlign: 'left',
      lineHeight: clamp(22 * s, 18, 28),
      fontWeight: '700',
    },
  });
}