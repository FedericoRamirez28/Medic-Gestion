import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Se cambió 'background' por 'bg' que es el valor que acepta tu configuración de tipos
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'bg');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}