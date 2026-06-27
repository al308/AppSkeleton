import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export type AppColors = (typeof Colors)[keyof typeof Colors];

export function useTheme(): { colors: AppColors; isDark: boolean } {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore((s) => s.theme);

  const isDark = themeSetting === 'dark' || (themeSetting === 'auto' && systemScheme === 'dark');

  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
  };
}
