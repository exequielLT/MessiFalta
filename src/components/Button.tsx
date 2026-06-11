import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { borderRadius, sizes, spacing, fontSizes } from '../constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const isSecondary = variant === 'secondary';

  let containerStyle: StyleProp<ViewStyle> = [styles.container];
  let textStyle: any[] = [styles.text];

  if (variant === 'primary') {
    containerStyle.push({ backgroundColor: theme.primary });
    textStyle.push({ color: theme.onPrimary });
  } else if (variant === 'secondary') {
    containerStyle.push({
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.primary,
    });
    textStyle.push({ color: theme.primary });
  } else if (variant === 'danger') {
    containerStyle.push({ backgroundColor: theme.error });
    textStyle.push({ color: theme.onError });
  }

  if (disabled || loading) {
    containerStyle.push(styles.disabled);
  }

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <>
          <ActivityIndicator
            color={isSecondary ? theme.primary : theme.onPrimary}
            style={styles.loader}
          />
          <Text style={textStyle}>Cargando...</Text>
        </>
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: sizes.buttonHeight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  loader: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
