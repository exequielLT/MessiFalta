import React from 'react';
import { 
  StyleSheet, 
  Pressable, 
  ActivityIndicator, 
  View,
  type ViewStyle,
  type TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();

  // Determine colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: theme.surfaceContainerHighest,
          text: theme.onSurface,
          loader: theme.onSurface,
        };
      case 'danger':
        return {
          background: theme.error,
          text: theme.onError,
          loader: theme.onError,
        };
      case 'primary':
      default:
        return {
          background: theme.primary,
          text: theme.onPrimary,
          loader: theme.onPrimary,
        };
    }
  };

  const colors = getColors();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: theme.outlineVariant + '33',
        },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.loader} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={18} 
              color={colors.text} 
              style={styles.icon} 
            />
          )}
          <ThemedText 
            style={[styles.text, { color: colors.text }]} 
            type="labelMd"
          >
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderCurve: 'continuous',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.two,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
