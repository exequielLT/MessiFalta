import { useThemeContext } from '@/context/theme-context';

export function useColorScheme() {
  try {
    const { themeMode } = useThemeContext();
    return themeMode;
  } catch {
    return 'light';
  }
}
