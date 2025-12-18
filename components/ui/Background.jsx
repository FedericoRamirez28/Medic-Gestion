import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const CustomBackground = () => (
  <View style={styles.container}>
    <Svg width={width} height={height} viewBox="0 0 360 640" preserveAspectRatio="none">
      <Path
        d="M0,0 L360,0 L360,690 L0,690 L0,0 Z"
        fill="#BFD6EF"
        fillRule="evenodd"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
});

export default CustomBackground;








