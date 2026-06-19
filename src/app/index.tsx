import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { figuritasService } from '@/services/figuritasService';
import { matchesService } from '@/services/matchesService';
import { supabase } from '@/services/supabase';
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth() as any;

  const [loading, setLoading] = useState(true);
  const [myFiguritasCount, setMyFiguritasCount] = useState(0);
  const [missingCount, setMissingCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [pendingMatches, setPendingMatches] = useState(0);
  const [kioscosCount, setKioscosCount] = useState(0);

  const totalFiguritas = 678;

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Obtener todas las figuritas del usuario
      const userFiguritas = await figuritasService.getFiguritas(user.id);
      
      const missing = userFiguritas.filter(f => f.tipo === 'faltante').length;
      const duplicates = userFiguritas.filter(f => f.tipo === 'repetida').length;
      
      // La cantidad total conseguida (pasted in album) es el total menos las faltantes
      const owned = totalFiguritas - missing;

      setMyFiguritasCount(owned);
      setMissingCount(missing);
      setDuplicateCount(duplicates);

      // 2. Obtener matches potenciales pendientes
      const matchesData = await matchesService.getMatches(user.id);
      setPendingMatches(matchesData.length);

      // 3. Obtener cantidad de kioscos activos
      const { count: kCount, error: kErr } = await supabase
        .from('kioscos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);
      
      if (!kErr && kCount !== null) {
        setKioscosCount(kCount);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas en HomeScreen:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const percentage = Math.round((myFiguritasCount / totalFiguritas) * 100);

  if (loading) {
    return (
      <ThemedView style={styles.rootContainer}>
        <AppHeader pendingNotificationsCount={0} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.rootContainer}>
      <AppHeader pendingNotificationsCount={pendingMatches} />

      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Alert Card (Notification) */}
        {pendingMatches > 0 && (
          <Pressable 
            onPress={() => router.push('/matches')}
            style={({ pressed }) => [
              styles.alertCard, 
              { 
                backgroundColor: theme.surfaceContainerLow,
                borderColor: theme.outlineVariant,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
              },
              pressed && styles.pressed
            ]}
          >
            <View style={[styles.alertIconBg, { backgroundColor: theme.primary }]}>
              <Ionicons name="notifications" size={20} color="#ffffff" />
            </View>
            <View style={styles.alertContent}>
              <ThemedText type="headlineSm" style={styles.alertTitle}>
                🔔 ¡{pendingMatches} matches esperan!
              </ThemedText>
              <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant, marginTop: 2 }}>
                Tienes posibles intercambios listos para completar tu colección.
              </ThemedText>
            </View>
            <View style={styles.alertAction}>
              <ThemedText type="labelMd" style={[styles.alertActionText, { color: theme.primary }]}>
                VER
              </ThemedText>
            </View>
          </Pressable>
        )}

        {/* Collection Overview Progress Card */}
        <View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '33' }]}>
          <View style={styles.cardHeader}>
            <View>
              <ThemedText type="labelMd" style={{ color: theme.onSurfaceVariant }}>
                MI COLECCIÓN
              </ThemedText>
              <ThemedText type="headlineMd" style={styles.progressTitle}>
                Mi Progreso
              </ThemedText>
            </View>
            <ThemedText type="headlineMd" style={[styles.progressPercent, { color: theme.primary }]}>
              {percentage}%
            </ThemedText>
          </View>

          {/* Custom Progress Bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: theme.surfaceContainerHighest }]}>
            <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${percentage}%` }]} />
          </View>

          <View style={styles.progressFooter}>
            <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant }}>
              Figuritas conseguidas
            </ThemedText>
            <ThemedText type="bodyMd" style={styles.progressCounter}>
              {myFiguritasCount} / {totalFiguritas}
            </ThemedText>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.gridContainer}>
          {/* Missing Card */}
          <Pressable 
            onPress={() => router.push('/figuritas')}
            style={({ pressed }) => [
              styles.gridCard, 
              { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant },
              pressed && styles.pressed
            ]}
          >
            <View style={[styles.gridIconBg, { backgroundColor: theme.errorContainer }]}>
              <Ionicons name="close-circle" size={20} color={theme.onErrorContainer} />
            </View>
            <ThemedText style={[styles.gridLabel, { color: theme.onSurfaceVariant }]}>
              FALTAN
            </ThemedText>
            <ThemedText type="displayLg" style={styles.gridValue}>
              {missingCount}
            </ThemedText>
          </Pressable>

          {/* Duplicates Card */}
          <Pressable 
            onPress={() => router.push('/figuritas')}
            style={({ pressed }) => [
              styles.gridCard, 
              { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant },
              pressed && styles.pressed
            ]}
          >
            <View style={[styles.gridIconBg, { backgroundColor: theme.secondaryContainer }]}>
              <Ionicons name="copy" size={18} color={theme.onSecondaryContainer} />
            </View>
            <ThemedText style={[styles.gridLabel, { color: theme.onSurfaceVariant }]}>
              REPETIDAS
            </ThemedText>
            <ThemedText type="displayLg" style={styles.gridValue}>
              {duplicateCount}
            </ThemedText>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionContainer}>
          <Pressable 
            onPress={() => router.push('/figuritas')}
            style={({ pressed }) => [
              styles.primaryButton, 
              { backgroundColor: theme.primary },
              pressed && styles.primaryButtonPressed
            ]}
          >
            <Ionicons name="add-circle-outline" size={22} color={theme.onPrimary} />
            <ThemedText style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
              Cargar Figurita
            </ThemedText>
          </Pressable>
        </View>

        {/* Nearby Kiosks Section */}
        <View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant + '33' }]}>
          <View style={styles.kioskHeader}>
            <Ionicons name="map-outline" size={22} color={theme.onSurface} />
            <ThemedText type="headlineSm" style={styles.kioskTitle}>
              Kioscos Cercanos
            </ThemedText>
          </View>
          
          <ThemedText type="bodyMd" style={[styles.kioskSubtitle, { color: theme.onSurfaceVariant }]}>
            Hay {kioscosCount} kioscos adheridos en San Fernando del Valle de Catamarca listos como puntos de canje.
          </ThemedText>

          {/* Premium Map Placeholder */}
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant + '44' }]}>
            {/* Styled visual representations of map lines & circles */}
            <View style={[styles.mapLine, { backgroundColor: theme.outlineVariant + '66', transform: [{ rotate: '30deg' }], top: 40 }]} />
            <View style={[styles.mapLine, { backgroundColor: theme.outlineVariant + '66', transform: [{ rotate: '-45deg' }], top: 70 }]} />
            <View style={[styles.mapLine, { backgroundColor: theme.outlineVariant + '66', transform: [{ rotate: '90deg' }], left: 160 }]} />
            
            {/* Map Pins representing Kiosks */}
            <View style={[styles.mapPin, { backgroundColor: theme.primary, left: 60, top: 30 }]}>
              <Ionicons name="storefront" size={10} color={theme.onPrimary} />
            </View>
            <View style={[styles.mapPin, { backgroundColor: theme.primary, left: 180, top: 60 }]}>
              <Ionicons name="storefront" size={10} color={theme.onPrimary} />
            </View>
            <View style={[styles.mapPin, { backgroundColor: theme.secondary, left: 120, top: 80 }]}>
              <Ionicons name="storefront" size={10} color={theme.onSecondary} />
            </View>
          </View>

          <Pressable 
            onPress={() => router.push('/kioscos')}
            style={({ pressed }) => [
              styles.secondaryButton, 
              { borderColor: theme.outline, backgroundColor: 'transparent' },
              pressed && { backgroundColor: theme.surfaceContainerLow }
            ]}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: theme.primary }]}>
              Ver Mapa Completo
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: 110, // room for bottom tab bar (64px + padding spacing)
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
    borderCurve: 'continuous',
    width: '100%',
  },
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    justifyContent: 'center',
  },
  alertTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 20,
  },
  alertAction: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  alertActionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
    borderCurve: 'continuous',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressTitle: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  progressPercent: {
    fontWeight: '800',
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCounter: {
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  gridCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
    borderCurve: 'continuous',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
  },
  gridIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridLabel: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  gridValue: {
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
  },
  quickActionContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    borderCurve: 'continuous',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  kioskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  kioskTitle: {
    fontWeight: 'bold',
  },
  kioskSubtitle: {
    lineHeight: 20,
  },
  mapPlaceholder: {
    height: 110,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapLine: {
    position: 'absolute',
    height: 2,
    width: '120%',
    left: '-10%',
  },
  mapPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
  },
  secondaryButton: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
