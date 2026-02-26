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

// ✅ Fallback Android (abre dialer / mail apps) cuando Linking falla en prod
import * as IntentLauncher from 'expo-intent-launcher';

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

/**
 * ✅ Safe open URL robusto:
 * - iOS: Linking suele ser suficiente
 * - Android: fallback a intents (dialer / email app chooser) si falla
 */
async function safeOpenURL(url: string) {
  try {
    // algunos dispositivos devuelven false para canOpenURL pero igual abren
    // entonces primero intentamos openURL directo
    await Linking.openURL(url);
    return true;
  } catch {
    // fallback: intentar canOpenURL + reintentar
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      }
    } catch {}
  }

  // ✅ Fallbacks Android específicos
  if (Platform.OS === 'android') {
    try {
      // TEL fallback -> abre marcador SIEMPRE (ACTION_DIAL)
      if (url.startsWith('tel:')) {
        const phone = url.replace('tel:', '').trim();
        await IntentLauncher.startActivityAsync('android.intent.action.DIAL', {
          data: `tel:${phone}`,
        });
        return true;
      }

      // MAIL fallback -> abre chooser de apps de mail
      if (url.startsWith('mailto:')) {
        // mailto:dest?subject=...&body=...
        await IntentLauncher.startActivityAsync('android.intent.action.SENDTO', {
          data: url,
        });
        return true;
      }

      // WhatsApp / https fallback (abrir con VIEW)
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: url });
      return true;
    } catch {}
  }

  Alert.alert('Error', 'No se pudo abrir el enlace en tu dispositivo.');
  return false;
}

export default function AfiliacionScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);
  const styles = useMemo(() => createStyles(s, insets, height), [s, insets, height]);

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

    // ✅ Si no hay app de correo configurada, avisamos con un texto útil
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View style={styles.flex}>
          {/* Background por debajo */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.bg} />
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
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.botonLogin}
                onPress={() => router.push('/Login')}
                accessibilityRole="button"
                accessibilityLabel="Ingresar"
                activeOpacity={0.9}
              >
                <Text style={styles.textoBotonLogin}>INGRESAR</Text>
              </TouchableOpacity>

              <Image
                source={require('@/assets/images/logo-medic-simple.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.hero}>
              <Text style={styles.titulo}>Bienvenidos</Text>
              <Text style={styles.subtitulo}>Plataforma de gestión y acceso para usuarios habilitados.</Text>
            </View>

            <View style={styles.cajaTexto}>
              <Text style={styles.texto}>
                Desde acá podés solicitar información, pedir alta o comunicarte con el área comercial/soporte para
                activar el acceso.
              </Text>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.bloqueTitulo}>¿Qué podés hacer en la app?</Text>
              <View style={styles.lineaInferior} />
            </View>

            <View style={styles.carouselWrap}>
              <OffersCarousel onSlidePress={(item: Slide) => setSelectedSlide(item)} />
            </View>

            <View style={styles.sectionHead}>
              <View style={styles.lineaInferior2} />
              <Text style={styles.bloqueTitulo}>Contacto</Text>
            </View>

            <View style={styles.cajaTexto}>
              <Text style={styles.texto}>
                Podés escribirnos por WhatsApp, mail o llamarnos. Te respondemos a la brevedad.
              </Text>
            </View>

            <View style={styles.contactoContainer}>
              <TouchableOpacity style={styles.contactoFila} onPress={callPhone} activeOpacity={0.85}>
                <Image source={require('@/assets/icons/telefono-icon-hd.png')} style={styles.iconoContacto} />
                <Text style={styles.iconBox} numberOfLines={2}>
                  {telefonoComercialDisplay}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactoFila} onPress={mailDirect} activeOpacity={0.85}>
                <Image source={require('@/assets/icons/mail-icon-hd.png')} style={styles.iconoContacto} />
                <Text style={styles.iconBox} numberOfLines={2}>
                  {destinatario}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHead}>
              <View style={styles.lineaInferior2} />
              <Text style={styles.bloqueTitulo}>Formulario de contacto</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                label="Tu nombre"
                mode="outlined"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
                contentStyle={styles.inputContent}
                dense
              />

              <TextInput
                label="Tu correo electrónico"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
                style={styles.input}
                contentStyle={styles.inputContent}
                dense
              />

              <TextInput
                label="¿En qué podemos ayudarte?"
                mode="outlined"
                multiline
                value={mensaje}
                onChangeText={setMensaje}
                style={[styles.input, styles.inputMultiline]}
                contentStyle={[styles.inputContent, styles.inputMultilineContent]}
              />

              <TouchableOpacity style={styles.botonEnviar} onPress={handleEnviar} activeOpacity={0.9}>
                <Text style={styles.botonEnviarTexto}>ENVIAR</Text>
              </TouchableOpacity>
            </View>

            {/* espacio para que WhatsApp no tape */}
            <View style={{ height: styles.__spacerBottom.height }} />
          </ScrollView>

          {/* Floating WhatsApp */}
          {!selectedSlide && (
            <TouchableOpacity
              style={styles.fixedWhatsApp}
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
            <Pressable style={styles.modalBg} onPress={() => setSelectedSlide(null)}>
              <Pressable style={styles.modalContent} onPress={() => {}}>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedSlide(null)} hitSlop={24}>
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>{selectedSlide?.title}</Text>

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
                  <Text style={styles.modalText}>{selectedSlide?.extraInfo || ''}</Text>
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
    safe: { flex: 1, backgroundColor: '#BFD6EF' },
    bg: { flex: 1, backgroundColor: '#BFD6EF' },

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
      backgroundColor: '#BFD6EF',
      paddingVertical: clamp(12 * s, 10, 16),
      paddingHorizontal: 12,
      borderRadius: 12,
      elevation: 12,
      marginTop: clamp(6 * s, 4, 10),
    },

    logo: { width: logoW, height: logoH },

    botonLogin: {
      backgroundColor: '#f89f51ff',
      elevation: 4,
      paddingVertical: clamp(8 * s, 7, 10),
      paddingHorizontal: clamp(12 * s, 10, 14),
      borderRadius: 10,
      minWidth: clamp(100 * s, 86, 112),
      alignItems: 'center',
      justifyContent: 'center',
    },

    textoBotonLogin: {
      color: '#424242',
      textAlign: 'center',
      fontFamily: 'Roboto-SemiBold',
      fontSize: clamp(16 * s, 13, 17),
      letterSpacing: 0.5,
    },

    hero: { paddingHorizontal: 6, paddingTop: isShort ? 2 : 8 },

    titulo: {
      textAlign: 'left',
      fontSize: titleSize,
      marginTop: 6,
      color: '#111111',
      fontFamily: 'Roboto-SemiBold',
      lineHeight: clamp(titleSize + 6, 30, 54),
    },

    subtitulo: {
      fontSize: subSize,
      marginTop: 8,
      marginBottom: 6,
      textAlign: 'left',
      fontWeight: '600',
      color: '#424242',
      lineHeight: clamp(subSize + 6, 18, 34),
    },

    cajaTexto: {
      backgroundColor: '#3F83CF',
      padding: clamp(12 * s, 10, 14),
      borderRadius: 12,
      elevation: 8,
    },

    texto: {
      fontFamily: 'Roboto-Regular',
      fontSize: body,
      color: '#F5F5F5',
      lineHeight: clamp(body + 7, 18, 28),
    },

    sectionHead: { gap: 10 },

    lineaInferior: {
      height: 2,
      width: '55%',
      backgroundColor: '#3F83CF',
      borderRadius: 2,
    },

    lineaInferior2: {
      height: 2,
      width: '100%',
      backgroundColor: '#3F83CF',
      borderRadius: 2,
    },

    bloqueTitulo: {
      textAlign: 'left',
      paddingTop: clamp(18 * s, 12, 22),
      paddingBottom: clamp(8 * s, 6, 12),
      fontSize: blockTitle,
      fontFamily: 'Roboto-SemiBold',
      color: '#3A3A3A',
      lineHeight: clamp(blockTitle + 6, 24, 40),
    },

    carouselWrap: { borderRadius: 14, overflow: 'hidden' },

    contactoContainer: { marginHorizontal: 4, marginTop: 4, gap: 12 },
    contactoFila: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    iconoContacto: {
      width: clamp(40 * s, 28, 44),
      height: clamp(40 * s, 28, 44),
      resizeMode: 'contain',
    },

    iconBox: {
      flex: 1,
      fontSize: contactText,
      color: '#212121',
      fontFamily: 'Roboto-Regular',
      lineHeight: clamp(contactText + 6, 18, 30),
    },

    form: { gap: 10 },

    input: {
      backgroundColor: '#F5F5F5',
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
      backgroundColor: '#f89f51ff',
      paddingVertical: clamp(14 * s, 12, 16),
      borderRadius: 12,
      width: '100%',
      marginTop: 14,
      marginBottom: 10,
      elevation: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },

    botonEnviarTexto: {
      color: '#424242',
      fontWeight: '900',
      textAlign: 'center',
      fontSize: clamp(16 * s, 14, 18),
      letterSpacing: 0.5,
    },

    fixedWhatsApp: {
      position: 'absolute',
      bottom: waBottom,
      right: 16,
      backgroundColor: '#25D366',
      borderRadius: 999,
      padding: waPad,
      zIndex: 99,
      elevation: 12,
    },

    whatsappIcon: { width: waSize, height: waSize, alignSelf: 'center' },

    modalBg: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },

    modalContent: {
      width: '90%',
      maxWidth: 520,
      backgroundColor: '#fff',
      borderRadius: 18,
      padding: clamp(22 * s, 16, 26),
      alignItems: 'center',
      maxHeight: isShort ? '80%' : '70%',
    },

    modalClose: { position: 'absolute', top: 10, right: 10, zIndex: 10, borderRadius: 18, padding: 6 },
    modalCloseText: { fontSize: clamp(28 * s, 22, 30), color: '#2A2A2A' },

    modalTitle: {
      fontFamily: 'Roboto-SemiBold',
      fontSize: clamp(22 * s, 16, 24),
      color: '#2A2A2A',
      marginBottom: 12,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: clamp(28 * s, 20, 34),
    },

    modalBody: { width: '100%', flexGrow: 0 },
    modalBodyContent: { paddingBottom: 8 },
    modalText: {
      fontFamily: 'Roboto-Regular',
      fontSize: clamp(16 * s, 13, 18),
      color: '#424242',
      textAlign: 'left',
      lineHeight: clamp(22 * s, 18, 28),
    },
  });
}
