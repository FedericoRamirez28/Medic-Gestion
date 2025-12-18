import React, { useRef } from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type Slide = {
  key: string;
  title: string;
  subtitle: string;
  img: any;
  extraInfo?: string;
};

type OffersCarouselProps = {
  onSlidePress?: (item: Slide) => void;
};

const slides: Slide[] = [
  {
    key: '1',
    title: 'Acceso y perfil',
    subtitle: `Gestioná tu acceso y mantené tus datos actualizados desde la app.

ℹ️ Hacé click aquí para más información`,
    img: require('@/assets/images/logo-medic-simple.png'),
    extraInfo: `Acceso y perfil

• Ingreso con DNI o N° de afiliado
• Perfil del usuario y datos básicos
• Acceso a información disponible según tu cuenta

Recomendaciones

• Verificá que tus datos estén correctos
• Si no podés ingresar, contactá al área de soporte/comercial

Canales de ayuda

• WhatsApp: +54 9 11 3636-3342
• Mail: comercial@medic.com.ar`,
  },
  {
    key: '2',
    title: 'Soporte y contacto',
    subtitle: `Escribinos por WhatsApp o mail para consultas, alta o asistencia con el acceso.

ℹ️ Hacé click aquí para más información`,
    img: require('@/assets/images/logo-medic-simple.png'),
    extraInfo: `Soporte y contacto

¿Para qué podés escribirnos?

• Solicitar alta / activación de cuenta
• Recuperar acceso o resolver inconvenientes
• Consultas generales sobre el uso de la app

Qué incluir en tu mensaje (sugerido)

• Nombre y apellido
• DNI o identificador (si aplica)
• Breve descripción del problema o consulta
• Captura de pantalla (si ayuda)

Horario de atención

• Lunes a viernes, 9:00 a 18:00 (horario Argentina)`,
  },
  {
    key: '3',
    title: 'Novedades y avisos',
    subtitle: `Enterate de novedades, cambios y avisos importantes dentro de la app.

ℹ️ Hacé click aquí para más información`,
    img: require('@/assets/images/logo-medic-simple.png'),
    extraInfo: `Novedades y avisos

• Comunicados y recordatorios
• Cambios de versión y mejoras
• Información relevante para el uso de la plataforma

Tip

• Mantené la app actualizada para tener la mejor experiencia.
• Si ves algo raro, avisarnos por los canales de contacto.`,
  },
];

export default function OffersCarousel({ onSlidePress }: OffersCarouselProps) {
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);

  const onPressDot = (index: number) => {
    ref.current?.scrollTo({ index, animated: true });
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSlidePress?.(item)}
      style={styles.slide}
    >
      <ImageBackground
        source={item.img}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.bg}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        width={SCREEN_WIDTH - 32}
        height={200}
        data={slides}
        loop
        pagingEnabled
        autoPlay
        autoPlayInterval={4000}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={renderItem}
        style={styles.carousel}
      />

      <Pagination.Basic
        progress={progress}
        data={slides}
        onPress={onPressDot}
        containerStyle={styles.pagination}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 24, alignItems: 'center' },
  carousel: { alignSelf: 'center' },
  slide: { width: '100%', height: 200, borderRadius: 8, overflow: 'hidden' },
  bg: { opacity: 0.2, backgroundColor: '#424242' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F5',
    padding: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  title: {
    fontFamily: 'Roboto-SemiBold',
    fontSize: 24,
    color: '#2A2A2A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: '#424242',
  },
  pagination: { gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#BDBDBD' },
  activeDot: { backgroundColor: '#3F83CF' },
});
