import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function FiguritasScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText type="headlineMd" style={styles.title}>
          📇 Mi Colección
        </ThemedText>
        <ThemedText type="bodyMd" style={styles.description}>
          Aquí podrás ver, agregar y administrar tus figuritas del Mundial 2026. Marcá las que ya tenés y las que te faltan.
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
    borderColor: '#c1c6d733', // 20% opacity outline
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
