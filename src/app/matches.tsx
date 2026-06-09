import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function MatchesScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText type="headlineMd" style={styles.title}>
          🤝 Intercambios (Matches)
        </ThemedText>
        <ThemedText type="bodyMd" style={styles.description}>
          Encontrá coleccionistas cercanos para cambiar tus figuritas repetidas por las que te faltan. ¡Todo a través de kioscos seguros!
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.three,
    paddingBottom: 110, // room for bottom tab bar
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c1c6d733',
    padding: Spacing.four,
    width: '100%',
    gap: Spacing.two,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
});
