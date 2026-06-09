import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../constants/theme';
import { Button } from './Button';

export interface StatusScreenProps {
  type: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const renderIcon = () => {
    if (type === 'loading') {
      return (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loadingIcon}
        />
      );
    }
    
    if (type === 'empty') {
      return <View style={styles.emptyIconPlaceholder} />;
    }
    
    if (type === 'error') {
      return (
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIconText}>×</Text>
        </View>
      );
    }
    
    return null;
  };

  const isActionable = !!actionLabel && !!onAction;

  return (
    <View style={[styles.container, style]}>
      {renderIcon()}
      
      <Text style={[styles.title, type === 'loading' && styles.titleLoading]}>
        {title}
      </Text>
      
      {description && type !== 'loading' && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {isActionable && type !== 'loading' && (
        <View style={styles.buttonContainer}>
          <Button title={actionLabel} onPress={onAction} variant="primary" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingIcon: {
    marginBottom: spacing.md,
  },
  emptyIconPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorIconText: {
    fontSize: 54,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -6, // Optical centering adjustment
  },
  title: {
    fontSize: fontSizes.h2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  titleLoading: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.sm,
    width: '100%',
    maxWidth: 320,
  },
});
