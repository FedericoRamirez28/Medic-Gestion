import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Datos dummy de prestadores
const prestadores = [
  { id: '1', nombre: 'Vitas', especialidad: 'Consultas especialistas', direccion: 'Nuestra señora del buen viaje 545, Moron', telefono: '011 7078-6100', avatar: require('@/assets/icons/prestadores-icons/logo-light.png') },
  { id: '2', nombre: 'Dres. Molinas', especialidad: 'Estudios de baja, mediana y alta complejidad', direccion: '9 de julio 576, Moron', telefono: '011 7078-6100', avatar: require('@/assets/icons/prestadores-icons/Molinas.png') },
  { id: '3', nombre: 'Sigma', especialidad: 'Estudios de baja, mediana y alta complejidad', direccion: 'Venezuela 1380, C.A.B.A', telefono: '011 7078-6100', avatar: require('@/assets/icons/prestadores-icons/SIGMA.png') },
  { id: '4', nombre: 'Cepem', especialidad: 'Estudios de baja, mediana y alta complejidad', direccion: 'Machado 729, Moron', telefono: '011 7078-6100', avatar: require('@/assets/icons/prestadores-icons/Cepem.png') },
  { id: '5', nombre: 'Tesla', especialidad: 'Estudios de baja, mediana y alta complejidad', direccion: 'Pte. Ilia 2760, San Justo y sucursales', telefono: '011 7078-6100', avatar: require('@/assets/icons/prestadores-icons/diagnosticotesla-logo.png') },
  { id: '6', nombre: 'TC Haedo SRL', especialidad: 'Ecografias, tomografias y resonancias', direccion: 'Manuel Fresco 1289, Haedo', telefono: '011 7078-6100', avatar: require('@/assets/icons/prestadores-icons/TCH.png') },
];

const cardWidth = Dimensions.get('window').width - 24; // ocupa casi todo el ancho

export default function PrestadorScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>‹ Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={prestadores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: cardWidth }]}>
            {/* Contenedor del logo */}
            <View style={styles.logoBox}>
              <Image source={item.avatar} style={styles.logoImg} />
            </View>

            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.especialidad}>{item.especialidad}</Text>
              <Text style={styles.direccion}>{item.direccion}</Text>
              <Text style={styles.telefono}>{item.telefono}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, alignSelf: 'flex-start' },
  backButton: { padding: 8 },
  backArrow: { fontSize: 16, color: '#005BBF' },

  container: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 20,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
  },

  // ✅ Caja del logo: tamaño uniforme y centrado
  logoBox: {
    width: 80,
    height: 80,
    marginRight: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // por si algún logo viene muy grande
  },

  // ✅ Imagen: siempre completa dentro de la caja
  logoImg: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },

  info: { flex: 1 },

  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E7490',
    marginBottom: 4,
  },
  especialidad: { fontSize: 14, color: '#1E293B', marginBottom: 2 },
  direccion: { fontSize: 12, color: '#64748B' },
  telefono: { fontSize: 12, color: '#1E5631', marginTop: 6, fontWeight: '600' },
});

