import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';

type CredencialProps = {
  numeroSocio: string;
  nombre: string;
  dni: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function FlipCard({ numeroSocio, nombre, dni }: CredencialProps) {
  const { width, height } = useWindowDimensions();

  // ✅ Escala general
  const s = useMemo(() => clamp(width / 390, 0.85, 1.2), [width]);
  const isShort = height < 720;

  // ✅ Ancho real tarjeta
  const cardWidth = useMemo(() => {
    const horizontalSafe = 32;
    return clamp(width - horizontalSafe, 280, 520);
  }, [width]);

  // ✅ Helpers FUERA del StyleSheet (para que TS no rompa)
  const spacerH = useMemo(() => clamp(10 * s, 8, 12), [s]);
  const waIconSize = useMemo(() => clamp(15 * s, 13, 16), [s]);

  const [flipped, setFlipped] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const frontRotate = animation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = animation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const toggleFlip = () => {
    Animated.spring(animation, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const styles = useMemo(() => createStyles(s, cardWidth, isShort), [s, cardWidth, isShort]);

  return (
    <TouchableWithoutFeedback onPress={toggleFlip}>
      <View style={styles.shadowWrap}>
        <View style={styles.faceContainer}>
          {/* Frente */}
          <Animated.View
            style={[
              styles.face,
              { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
            ]}
          >
            <LinearGradient
              colors={['#1E88E5', '#E53935']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bg}
            />

            <View style={styles.frontCircle} />

            <View style={styles.frontInner}>
              <Text numberOfLines={1} style={styles.name}>
                {nombre}
              </Text>

              <View style={{ height: spacerH }} />

              <Text style={styles.memberLabel}>N° de afiliado:</Text>
              <Text style={styles.memberValue} numberOfLines={1}>
                {numeroSocio}
              </Text>

              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={styles.fieldLabel}>DNI:</Text>
                <Text style={styles.fieldValue} numberOfLines={1}>
                  {dni}
                </Text>
              </View>

              <Text style={styles.tapHint} numberOfLines={1}>
                Tocá la tarjeta para ver el dorso
              </Text>
            </View>
          </Animated.View>

          {/* Dorso */}
          <Animated.View
            style={[
              styles.face,
              { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
            ]}
          >
            <LinearGradient
              colors={['#E53935', '#1E88E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bg}
            />

            <View style={styles.backWrap}>
              {/* Emergencias */}
              <View style={styles.glassPill}>
                <View style={styles.pillTab} />
                <Text style={styles.emergenciasLabel} numberOfLines={1}>
                  Emergencias
                </Text>
                <Text style={styles.emergenciasNumber} numberOfLines={1}>
                  7078 6200
                </Text>
              </View>

              {/* Columnas */}
              <View style={styles.columns}>
                <View style={styles.colLeft}>
                  <Text style={styles.colTitle} numberOfLines={1}>
                    Atención al Socio
                  </Text>

                  <View style={styles.inline}>
                    <Ionicons
                      name="logo-whatsapp"
                      size={waIconSize}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.colStrong} numberOfLines={1}>
                      11 2031 8064
                    </Text>
                  </View>
                </View>

                <View style={styles.colRight}>
                  <Text style={styles.colTitle} numberOfLines={1}>
                    Solicitar Turnos al
                  </Text>
                  <Text style={styles.colText} numberOfLines={2}>
                    7078 6100 int 307 int 200
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footerCard}>
                <Text style={styles.footerLine} numberOfLines={1}>
                  Hipólito Yrigoyen 2246
                </Text>
                <Text style={styles.footerLine} numberOfLines={1}>
                  San Justo Provincia de Bs. As.
                </Text>
                <Text style={styles.footerWeb} numberOfLines={1}>
                  www.medic.com.ar
                </Text>
              </View>

              <Text style={styles.tapHintBack} numberOfLines={1}>
                Tocá para volver al frente
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

function createStyles(s: number, cardWidth: number, isShort: boolean) {
  const radius = clamp(18 * s, 16, 20);

  const padHFront = clamp(18 * s, 14, 20);
  const padVFront = clamp(16 * s, 12, 18);

  const backPadH = clamp(16 * s, 12, 18);
  const backPadVTop = clamp(10 * s, 8, 12);
  const backPadVBottom = clamp(12 * s, 10, 14);

  const nameSize = clamp(20 * s, 16, 22);
  const memberLabelSize = clamp(13 * s, 11, 14);
  const memberValueSize = clamp(30 * s, 22, 32);

  const fieldLabelSize = clamp(14 * s, 12, 15);
  const fieldValueSize = clamp(16 * s, 13, 17);

  const pillHeight = clamp(60 * s, 52, 64);
  const pillLabel = clamp(14 * s, 12, 15);
  const pillNumber = clamp(28 * s, 20, 30);

  const colTitle = clamp(13 * s, 11, 14);
  const colStrong = clamp(13 * s, 11, 14);
  const colText = clamp(12 * s, 10, 13);

  const footerLine = clamp(12.5 * s, 11, 13);
  const footerWeb = clamp(13 * s, 11, 14);

  const hintSize = clamp(11.5 * s, 10, 12);

  const circleSize = clamp(240 * s, 170, 260);

  return StyleSheet.create({
    shadowWrap: {
      width: cardWidth,
      aspectRatio: 1.58,
      alignSelf: 'center',
      borderRadius: radius,
      backgroundColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 6 },
      }),
    },

    faceContainer: {
      flex: 1,
      borderRadius: radius,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#0000',
    },

    face: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backfaceVisibility: 'hidden',
    },

    bg: { ...StyleSheet.absoluteFillObject },

    /* ===== FRONT ===== */
    frontInner: {
      flex: 1,
      paddingHorizontal: padHFront,
      paddingVertical: padVFront,
      justifyContent: 'center',
    },
    name: { fontSize: nameSize, fontWeight: '900', color: '#FFFFFF' },

    memberLabel: {
      fontSize: memberLabelSize,
      color: 'rgba(255,255,255,0.95)',
      letterSpacing: 0.2,
      marginTop: 2,
      fontWeight: '800',
    },
    memberValue: {
      fontSize: memberValueSize,
      fontWeight: '900',
      color: '#FFFFFF',
      marginTop: -2,
    },

    separator: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.35)',
      marginVertical: clamp(10 * s, 8, 12),
      width: '92%',
    },

    row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },

    fieldLabel: { color: 'rgba(255,255,255,0.95)', fontSize: fieldLabelSize, fontWeight: '800' },
    fieldValue: { color: '#FFFFFF', fontSize: fieldValueSize, fontWeight: '900', flexShrink: 1 },

    tapHint: {
      marginTop: clamp(10 * s, 8, 12),
      fontSize: hintSize,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '800',
    },

    frontCircle: {
      position: 'absolute',
      top: -circleSize * 0.35,
      right: -circleSize * 0.18,
      width: circleSize,
      height: circleSize,
      borderRadius: circleSize / 2,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },

    /* ===== BACK ===== */
    backWrap: {
      flex: 1,
      paddingTop: backPadVTop,
      paddingHorizontal: backPadH,
      paddingBottom: backPadVBottom,
    },

    glassPill: {
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: clamp(14 * s, 12, 16),
      paddingVertical: clamp(8 * s, 6, 10),
      height: pillHeight,
      paddingHorizontal: clamp(16 * s, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    pillTab: {
      position: 'absolute',
      left: 10,
      top: 10,
      width: clamp(7 * s, 6, 7),
      height: clamp(22 * s, 18, 22),
      borderRadius: 4,
      backgroundColor: '#34C3FF',
      opacity: 0.95,
    },
    emergenciasLabel: { color: '#FFFFFF', fontSize: pillLabel, fontWeight: '900', opacity: 0.95 },
    emergenciasNumber: { color: '#FFFFFF', fontSize: pillNumber, fontWeight: '900', marginTop: -5 },

    columns: {
      marginTop: clamp(10 * s, 8, 12),
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: clamp(10 * s, 8, 12),
      flex: 1,
      alignItems: 'flex-start',
      minHeight: isShort ? 78 : 92,
    },

    colLeft: { width: '46%', minWidth: 0 },
    colRight: { width: '54%', minWidth: 0 },

    colTitle: { color: '#FFFFFF', fontSize: colTitle, fontWeight: '900', marginBottom: 5 },
    inline: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },

    colStrong: { color: '#FFFFFF', fontSize: colStrong, fontWeight: '900', flexShrink: 1 },
    colText: {
      color: '#FFFFFF',
      fontSize: colText,
      fontWeight: '800',
      opacity: 0.98,
      lineHeight: clamp(15 * s, 13, 16),
      flexShrink: 1,
    },

    footerCard: {
      marginTop: clamp(10 * s, 8, 12),
      backgroundColor: '#1686D9',
      borderRadius: clamp(14 * s, 12, 16),
      paddingVertical: clamp(8 * s, 6, 10),
      paddingHorizontal: clamp(12 * s, 10, 14),
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 4 },
      }),
    },

    footerLine: { color: '#FFFFFF', fontSize: footerLine, fontWeight: '800' },
    footerWeb: {
      marginTop: 3,
      color: '#FFFFFF',
      fontSize: footerWeb,
      fontWeight: '900',
      fontStyle: 'italic',
    },

    tapHintBack: {
      marginTop: clamp(10 * s, 8, 12),
      fontSize: hintSize,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '800',
      textAlign: 'center',
    },
  });
}
