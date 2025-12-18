import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMenu } from './MenuProvider';

export default function HeaderWithMenu({ nombre }: { nombre: string }) {
  const { open } = useMenu();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Bienvenido, {nombre}</Text>
      <TouchableOpacity onPress={open} accessibilityRole="button" accessibilityLabel="Abrir menú">
        <View style={styles.burger}>
          <View style={styles.bar} /><View style={styles.bar} /><View style={styles.bar} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#6FA7D9' },
  title: { color: '#fff', fontWeight: '700', fontSize: 18 },
  burger: { width: 28, height: 22, justifyContent: 'space-between', paddingVertical: 2 },
  bar: { height: 3, borderRadius: 2, backgroundColor: '#fff' },
});
