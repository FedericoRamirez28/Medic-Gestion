import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type CredencialProps = {
  numeroSocio: string;
  nombre: string;
  dni: string;
};

export default function FlipCard({ numeroSocio, nombre, dni }: CredencialProps) {
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

              <View style={{ height: 10 }} />

              <Text style={styles.memberLabel}>N° de afiliado:</Text>
              <Text style={styles.memberValue}>{numeroSocio}</Text>

              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={styles.fieldLabel}>DNI:</Text>
                <Text style={styles.fieldValue}>{dni}</Text>
              </View>
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

            <View style={styles.glassPill}>
              <View style={styles.pillTab} />
              <Text style={styles.emergenciasLabel}>Emergencias</Text>
              <Text style={styles.emergenciasNumber}>7078 6200</Text>
            </View>

            <View style={styles.columns}>
              <View style={styles.col}>
                <Text style={styles.colTitle}>Atención al Socio</Text>
                <View style={styles.inline}>
                  <Ionicons
                    name="logo-whatsapp"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.colStrong}>11 2031 8064</Text>
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.colTitle}>Solicitar Turnos al</Text>
                <Text style={styles.colText}>7078 6100 int 307 int 200</Text>
              </View>
            </View>

            <View style={styles.footerCard}>
              <Text style={styles.footerLine}>Hipólito Yrigoyen 2246</Text>
              <Text style={styles.footerLine}>San Justo Provincia de Bs. As.</Text>
              <Text style={styles.footerWeb}>www.medic.com.ar</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    width: '90%',
    maxWidth: 360,
    aspectRatio: 1.58,
    alignSelf: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  faceContainer: {
    flex: 1,
    borderRadius: 18,
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

  bg: {
    ...StyleSheet.absoluteFillObject,
  },

  frontInner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  memberLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  memberValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: -2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginVertical: 10,
    width: '90%',
  },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  fieldLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 14 },
  fieldValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  frontCircle: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  glassPill: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  pillTab: {
    position: 'absolute',
    left: 10,
    top: 12,
    width: 8,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#34C3FF',
    opacity: 0.95,
  },
  emergenciasLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', opacity: 0.95 },
  emergenciasNumber: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginTop: -2 },

  columns: {
    position: 'absolute',
    top: 95,
    left: 24,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: { width: '48%' },
  colTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  inline: { flexDirection: 'row', alignItems: 'center' },
  colStrong: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  colText: { color: '#FFFFFF', fontSize: 14, opacity: 0.95 },

  footerCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    backgroundColor: '#1686D9',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  footerLine: { color: '#FFFFFF', fontSize: 13.5 },
  footerWeb: { marginTop: 4, color: '#FFFFFF', fontSize: 14, fontWeight: '800', fontStyle: 'italic' },
});
