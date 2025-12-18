import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function confirmCall() {
  Alert.alert(
    'Contacto de emergencias',
    '¿Deseás comunicarte con el servicio de emergencias?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Llamar',
        onPress: () => Linking.openURL('tel:+541170786200'),
      },
    ]
  );
}

export default function ButtonAmbulance() {
  return (
    <View style={styles.underContainer}>
      <TouchableOpacity
        style={styles.boton}
        onPress={confirmCall}
        accessibilityRole="button"
        accessibilityLabel="Contactar servicio de emergencias"
      >
        <Text style={styles.texto}>Contactar emergencias</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  underContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '30%',
  },
  boton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 12,
    width: '90%',
    elevation: 4,
    alignItems: 'center',
  },
  texto: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '700',
  },
});
