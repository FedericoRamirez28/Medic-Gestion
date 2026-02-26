import React, { useMemo, useRef } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function OffersCarousel({ onSlidePress }: OffersCarouselProps) {
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const { width, height } = useWindowDimensions();

  const s = useMemo(() => clamp(width / 390, 0.85, 1.15), [width]);

  const sidePadding = clamp(16, 14, 18);
  const cardW = Math.min(width - sidePadding * 2, 520);
  const cardH = clamp(200 * s, 160, height < 720 ? 185 : 220);

  const styles = useMemo(() => createStyles(s, cardW, cardH), [s, cardW, cardH]);

  const onPressDot = (index: number) => {
    ref.current?.scrollTo({ index, animated: true });
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onSlidePress?.(item)} style={styles.slide}>
      <ImageBackground source={item.img} style={StyleSheet.absoluteFill} imageStyle={styles.bg} />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={5}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        width={cardW}
        height={cardH}
        data={slides}
        loop
        pagingEnabled
        autoPlay
        autoPlayInterval={4000}
        renderItem={renderItem}
        style={styles.carousel}
        onConfigurePanGesture={(gesture) => {
          // ✅ súper permisivo al scroll vertical del padre
          gesture
            .activeOffsetX([-24, 24]) // requiere intención horizontal clara
            .failOffsetY([-2, 2]);     // con mínimo gesto vertical, suelta y deja scrollear
        }}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
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

function createStyles(s: number, cardW: number, cardH: number) {
  const radius = clamp(14 * s, 10, 16);
  const pad = clamp(16 * s, 12, 18);

  return StyleSheet.create({
    container: {
      marginVertical: clamp(16 * s, 12, 20),
      alignItems: 'center',
      width: '100%',
    },
    carousel: { alignSelf: 'center' },
    slide: {
      width: cardW,
      height: cardH,
      borderRadius: radius,
      overflow: 'hidden',
    },
    bg: {
      opacity: 0.12,
      backgroundColor: '#424242',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#F5F5F5',
      padding: pad,
      justifyContent: 'center',
      borderRadius: radius,
    },
    title: {
      fontFamily: 'Roboto-SemiBold',
      fontSize: clamp(24 * s, 16, 24),
      color: '#2A2A2A',
      marginBottom: clamp(8 * s, 6, 10),
      lineHeight: clamp(30 * s, 20, 32),
    },
    subtitle: {
      fontFamily: 'Roboto-Regular',
      fontSize: clamp(16 * s, 13, 17),
      color: '#424242',
      lineHeight: clamp(22 * s, 18, 26),
    },
    pagination: { gap: 6, marginTop: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#BDBDBD' },
    activeDot: { backgroundColor: '#3F83CF' },
  });
}
