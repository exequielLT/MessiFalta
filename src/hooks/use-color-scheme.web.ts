import { useEffect, useState } from 'react';
import { useThemeContext } from '@/context/theme-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  try {
    const { themeMode } = useThemeContext();
    if (hasHydrated) {
      return themeMode;
    }
    return 'light';
  } catch {
    return 'light';
  }
}
