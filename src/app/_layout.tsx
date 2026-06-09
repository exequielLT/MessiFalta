import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { CustomThemeProvider, useThemeContext } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

function LayoutContent() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <CustomThemeProvider>
      <LayoutContent />
    </CustomThemeProvider>
  );
}
