import { useAppTheme } from '@/components/theme/AppThemeProvider';
import type { AppTheme } from '@/components/theme/appTheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof AppTheme['colors']
) {
  const { theme } = useAppTheme();

  // Si te pasan override directo, lo respetamos
  if (!theme.isDark && props.light) return props.light;
  if (theme.isDark && props.dark) return props.dark;

  return theme.colors[colorName];
}