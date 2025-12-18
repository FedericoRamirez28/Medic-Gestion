import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const MyImageComponent = () => (
  <View style={styles.container}>
    <Image
      source={require('@/assets/images/logo-medic-simple.png')} // Imagen local
      style={styles.image}
      resizeMode="contain" // Puedes usar 'cover', 'stretch', etc.
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding:36,
  },
  image: {
    width: 250,
    height: 250,
  },
});

export default MyImageComponent;

    

