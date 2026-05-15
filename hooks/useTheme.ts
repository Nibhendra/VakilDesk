import { Colors, ThemeColors } from '../constants/Colors';
import { useThemeContext } from '../store/ThemeContext';

export const useTheme = (): ThemeColors => {
  const { isDark } = useThemeContext();
  return Colors[isDark ? 'dark' : 'light'];
};
