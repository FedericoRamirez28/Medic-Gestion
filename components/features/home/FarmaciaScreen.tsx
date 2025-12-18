import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FarmaciaScreen: React.FC = () => {
  const telefono = "011 4484-4277";
  const direccion = "Hipolito Yrigoyen 2305, San Justo";
  const nombreFarmacia = "Moscovich";

  const abrirTelefono = () => Linking.openURL(`tel:${telefono}`);
  const abrirMaps = () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`);
  const router = useRouter();

  return (
 <View style={styles.screen}>
    <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <View style={styles.backButton}>
                    <Text style={styles.backArrow}>‹ Volver</Text>
                  </View>
                </TouchableOpacity>
              </View>

    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Farmacia Moscovich</Text>

      {/* Logo */}
      <Image 
        source={require('@/assets/images/logo-medic-simple.png')}
        style={styles.logo}
      />

      {/* Info */}
      <Text style={styles.nombre}>Dirección</Text>
      <Text style={styles.direccion}>{direccion}</Text>
      <Text style={styles.telefono}>{telefono}</Text>

      {/* Botones */}
      <View style={styles.botones}>
        <TouchableOpacity style={styles.boton} onPress={abrirTelefono}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.botonTexto}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.boton} onPress={abrirMaps}>
          <Ionicons name="location" size={20} color="#fff" />
          <Text style={styles.botonTexto}>Ubicación</Text>
        </TouchableOpacity>
      </View>

      {/* Pie */}
      <Text style={styles.footer}>
        Medic trabaja junto a {nombreFarmacia} para tu cobertura.
      </Text>
    </View>
</View>
  );
};

export default FarmaciaScreen;

const styles = StyleSheet.create({
    screen: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9f9f9',  
  },
  container: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1E5631',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 5,
  },
  direccion: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  telefono: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  botones: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E5631',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  botonTexto: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  footer: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
header: { height: 56, alignSelf: 'flex-start' },
  backButton: { padding: 8 },
  backArrow: { fontSize: 16, color: '#005BBF' },
});
