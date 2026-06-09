import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 
        'displayLg' | 'displayLgMobile' | 'headlineMd' | 'headlineSm' | 'bodyLg' | 'bodyMd' | 'labelMd' | 'labelSm';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        // Design System Typography mappings
        type === 'displayLg' && styles.displayLg,
        type === 'displayLgMobile' && styles.displayLgMobile,
        type === 'headlineMd' && styles.headlineMd,
        type === 'headlineSm' && styles.headlineSm,
        type === 'bodyLg' && styles.bodyLg,
        type === 'bodyMd' && styles.bodyMd,
        type === 'labelMd' && styles.labelMd,
        type === 'labelSm' && styles.labelSm,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  title: {
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: '600',
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
  
  // Design System Typography (DESIGN.md)
  displayLg: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -0.68, // -0.02em of 34px
  },
  displayLgMobile: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  headlineMd: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: -0.24, // -0.01em of 24px
  },
  headlineSm: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
  },
  bodyLg: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelMd: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  labelSm: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
});
