import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';
import { Button } from './Button';

interface StatusScreenProps {
  type: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {type === 'loading' && (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      )}

      {type === 'empty' && (
        <View style={styles.emptyPlaceholder} />
      )}

      {type === 'error' && (
        <View style={styles.errorCircle}>
          <Text style={styles.errorCross}>X</Text>
        </View>
      )}

      <Text style={[styles.title, type === 'loading' && styles.titleLoading]}>{title}</Text>
      
      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <View style={styles.buttonContainer}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
          />
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
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  emptyPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.border,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorCross: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleLoading: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
});
