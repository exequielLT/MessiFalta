import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant, loading = false, disabled = false, style }) => {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  let backgroundColor = colors.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';

  if (isSecondary) {
    backgroundColor = 'transparent';
    textColor = colors.primary;
    borderColor = colors.primary;
  } else if (isDanger) {
    backgroundColor = colors.error;
  }

  const containerStyle = [
    styles.container,
    { backgroundColor, borderColor, borderWidth: isSecondary ? 2 : 0 },
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle: TextStyle = {
    ...styles.text,
    color: textColor,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <>
          <ActivityIndicator color={textColor} style={styles.loader} />
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
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  loader: {
    marginRight: 8,
  },
});
