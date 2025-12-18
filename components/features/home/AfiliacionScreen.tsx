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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  img: any;
  extraInfo?: string;
};

async function safeOpenURL(url: string) {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) throw new Error('cant-open');
    await Linking.openURL(url);
  } catch {
    Alert.alert('Error', 'No se pudo abrir el enlace en tu dispositivo.');
  }
}

export default function AfiliacionScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  const router = useRouter();

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
    const body =
      `Nombre: ${nombre}\n` +
      `Correo: ${correo}\n\n` +
      `Mensaje:\n${mensaje}`;

    const url = `mailto:${destinatario}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    await safeOpenURL(url);
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
    await safeOpenURL(`mailto:${destinatario}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#BFD6EF' }}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <TouchableOpacity style={styles.botonLogin} onPress={() => router.push('/Login')}>
                <Text style={styles.textoBotonLogin}>INGRESAR</Text>
              </TouchableOpacity>

              <Image
                source={require('@/assets/images/logo-medic-simple.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={{ padding: 8 }}>
              <Text style={styles.titulo}>Bienvenidos</Text>
              <Text style={styles.subtitulo}>
                Plataforma de gestión y acceso para usuarios habilitados.
              </Text>
            </View>

            <View style={styles.cajaTexto}>
              <Text style={styles.texto}>
                Desde acá podés solicitar información, pedir alta o comunicarte con el área comercial/soporte para
                activar el acceso.
              </Text>
            </View>

            <View>
              <Text style={styles.bloqueTitulo}>¿Qué podés hacer en la app?</Text>
              <View style={styles.lineaInferior} />
            </View>

            <OffersCarousel onSlidePress={(item: Slide) => setSelectedSlide(item)} />

            <View>
              <View style={styles.lineaInferior2} />
              <Text style={styles.bloqueTitulo}>Contacto</Text>
            </View>

            <View style={styles.cajaTexto}>
              <Text style={styles.texto}>
                Podés escribirnos por WhatsApp, mail o llamarnos. Te respondemos a la brevedad.
              </Text>
            </View>

            <View style={styles.contactoContainer}>
              <TouchableOpacity style={styles.contactoFila} onPress={callPhone}>
                <Image source={require('@/assets/icons/telefono-icon-hd.png')} style={styles.iconoContacto} />
                <Text style={styles.iconBox}>{telefonoComercialDisplay}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactoFila} onPress={mailDirect}>
                <Image source={require('@/assets/icons/mail-icon-hd.png')} style={styles.iconoContacto} />
                <Text style={styles.iconBox}>{destinatario}</Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.lineaInferior2} />
              <Text style={styles.bloqueTitulo}>Formulario de contacto</Text>

              <TextInput
                label="Tu nombre"
                mode="outlined"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
              />

              <TextInput
                label="Tu correo electrónico"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
                style={styles.input}
              />

              <TextInput
                label="¿En qué podemos ayudarte?"
                mode="outlined"
                multiline
                value={mensaje}
                onChangeText={setMensaje}
                style={styles.input}
              />

              <TouchableOpacity style={styles.botonEnviar} onPress={handleEnviar}>
                <Text style={styles.botonEnviarTexto}>ENVIAR</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 90 }} />
          </ScrollView>

          {!selectedSlide && (
            <TouchableOpacity style={styles.fixedWhatsApp} onPress={openWhatsApp} accessibilityRole="button">
              <Image source={whatsappIcon} style={styles.whatsappIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}

          <Modal
            visible={!!selectedSlide}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedSlide(null)}
          >
            <Pressable style={styles.modalBg} onPress={() => setSelectedSlide(null)}>
              <Pressable style={styles.modalContent} onPress={() => {}}>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedSlide(null)} hitSlop={24}>
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>{selectedSlide?.title}</Text>

                <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalText}>{selectedSlide?.extraInfo || ''}</Text>
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#BFD6EF',
    padding: 16,
    elevation: 15,
  },
  logo: { width: 150, height: 80 },

  botonLogin: {
    backgroundColor: '#f89f51ff',
    elevation: 5,
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    width: 100,
  },
  textoBotonLogin: {
    color: '#424242',
    textAlign: 'center',
    fontFamily: 'Roboto-SemiBold',
    fontSize: 16,
  },

  titulo: {
    textAlign: 'left',
    fontSize: 40,
    marginTop: 8,
    color: '#111111',
    fontFamily: 'Roboto-SemiBold',
  },
  subtitulo: {
    fontSize: 22,
    marginTop: 8,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: '600',
    color: '#424242',
  },

  cajaTexto: {
    backgroundColor: '#3F83CF',
    padding: 8,
    borderRadius: 8,
    elevation: 10,
  },
  texto: {
    margin: 8,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: '#F5F5F5',
  },

  lineaInferior: {
    height: 2,
    width: '48%',
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
    paddingTop: 24,
    paddingBottom: 24,
    fontSize: 28,
    fontFamily: 'Roboto-SemiBold',
    color: '#3A3A3A',
  },

  contactoContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  contactoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconoContacto: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  iconBox: {
    fontSize: 24,
    color: '#212121',
    fontFamily: 'Roboto-Regular',
  },

  input: {
    backgroundColor: '#F5F5F5',
    width: '100%',
    borderRadius: 8,
    marginTop: 12,
  },

  botonEnviar: {
    backgroundColor: '#f89f51ff',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  botonEnviarTexto: {
    color: '#424242',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  fixedWhatsApp: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#25D366',
    borderRadius: 50,
    padding: 16,
    zIndex: 99,
    elevation: 10,
  },
  whatsappIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 18,
    padding: 4,
  },
  modalCloseText: { fontSize: 28, color: '#2A2A2A' },
  modalTitle: {
    fontFamily: 'Roboto-SemiBold',
    fontSize: 22,
    color: '#2A2A2A',
    marginBottom: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  modalBody: { maxHeight: 420, width: '100%' },
  modalText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: '#424242',
    textAlign: 'left',
  },
});
