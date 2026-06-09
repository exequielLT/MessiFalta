import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, sizes, spacing, fontSizes } from '../constants/theme';

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
  const isSecondary = variant === 'secondary';

  let containerStyle: StyleProp<ViewStyle> = [styles.container];
  let textStyle = [styles.text];

  if (variant === 'primary') {
    containerStyle.push(styles.primaryContainer);
    textStyle.push(styles.primaryText);
  } else if (variant === 'secondary') {
    containerStyle.push(styles.secondaryContainer);
    textStyle.push(styles.secondaryText);
  } else if (variant === 'danger') {
    containerStyle.push(styles.dangerContainer);
    textStyle.push(styles.dangerText);
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
            color={isSecondary ? colors.primary : '#FFFFFF'}
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
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
