/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#181c23',
    background: '#f9f9ff',
    backgroundElement: '#ecedf9',
    backgroundSelected: '#e6e8f3',
    textSecondary: '#414755',
    
    // Design System Tokens (from DESIGN.md)
    surface: '#f9f9ff',
    surfaceDim: '#d8d9e5',
    surfaceBright: '#f9f9ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f1f3fe',
    surfaceContainer: '#ecedf9',
    surfaceContainerHigh: '#e6e8f3',
    surfaceContainerHighest: '#e0e2ed',
    onSurface: '#181c23',
    onSurfaceVariant: '#414755',
    inverseSurface: '#2d3039',
    inverseOnSurface: '#eef0fc',
    outline: '#717786',
    outlineVariant: '#c1c6d7',
    surfaceTint: '#005bc1',
    primary: '#0058bc',
    onPrimary: '#ffffff',
    primaryContainer: '#0070eb',
    onPrimaryContainer: '#fefcff',
    inversePrimary: '#adc6ff',
    secondary: '#006e28',
    onSecondary: '#ffffff',
    secondaryContainer: '#6ffb85',
    onSecondaryContainer: '#00732a',
    tertiary: '#894d00',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ac6300',
    onTertiaryContainer: '#fffbff',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
  },
  dark: {
    text: '#ffffff',
    background: '#121214',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',

    // Design System Tokens (Dark Mode variants)
    surface: '#181c23',
    surfaceDim: '#111318',
    surfaceBright: '#383f4f',
    surfaceContainerLowest: '#0d0f14',
    surfaceContainerLow: '#1c202a',
    surfaceContainer: '#222733',
    surfaceContainerHigh: '#2c3140',
    surfaceContainerHighest: '#363c4e',
    onSurface: '#e2e2e9',
    onSurfaceVariant: '#c1c6d7',
    inverseSurface: '#e2e2e9',
    inverseOnSurface: '#181c23',
    outline: '#8b91a0',
    outlineVariant: '#414755',
    surfaceTint: '#adc6ff',
    primary: '#adc6ff',
    onPrimary: '#002e69',
    primaryContainer: '#004493',
    onPrimaryContainer: '#d8e2ff',
    inversePrimary: '#0058bc',
    secondary: '#53e16f',
    onSecondary: '#003910',
    secondaryContainer: '#00531c',
    onSecondaryContainer: '#72fe88',
    tertiary: '#ffb874',
    onTertiary: '#4a2800',
    tertiaryContainer: '#6a3b00',
    onTertiaryContainer: '#ffdcbf',
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
