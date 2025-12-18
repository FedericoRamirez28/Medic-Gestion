import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet
} from 'react-native';

interface SplashProps {
  onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        SplashScreen.hideAsync();
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [fadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#e3f2fd', '#ffffff']}
        style={styles.gradient}
      >
        <Image
          source={require('@/assets/images/logo-medic-simple.png')}
          style={styles.logo}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const { width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '600',
    color: '#0d47a1',
  },
});

export default Splash;
