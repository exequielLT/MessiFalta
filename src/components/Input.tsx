import React, { ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  errorMessage?: string;
  loading?: boolean;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  errorMessage,
  secureTextEntry,
  keyboardType,
  loading = false,
  rightIcon,
  style,
  containerStyle,
  ...rest
}) => {
  const hasError = !!errorMessage;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          style,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...rest}
        />
        
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.rightElement}
          />
        )}
        
        {!loading && rightIcon && (
          <View style={styles.rightElement}>{rightIcon}</View>
        )}
      </View>
      
      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: fontSizes.body,
  },
  rightElement: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.caption,
    marginTop: spacing.xs,
  },
});
