import AppHeader from '@/components/AppHeader';
import { matchesService } from '@/services/matchesService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Figurita } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Lazy-load para evitar que Metro trace @react-navigation/native en el import chain (SDK 56)
const AddFiguritaWrapper = React.lazy(() => import('../components/AddFiguritaWrapper'));

// ─── Tipos ────────────────────────────────────────────────────────────────────
type FilterType = 'todas' | 'repetidas' | 'faltantes';

// ─── Datos de prueba (mock) — se reemplazarán con Supabase ────────────────────
const MOCK_FIGURITAS: Figurita[] = [
  {
    id: 'mock-1',
    user_id: 'mock',
    numero: 128,
    tipo: 'repetida',
    nombre_jugador: 'Lionel Messi',
    created_at: '',
  },
  {
    id: 'mock-2',
    user_id: 'mock',
    numero: 45,
    tipo: 'repetida',
    nombre_jugador: 'Emiliano Martínez',
    created_at: '',
  },
  {
    id: 'mock-3',
    user_id: 'mock',
    numero: 210,
    tipo: 'faltante',
    nombre_jugador: 'Kylian Mbappé',
    created_at: '',
  },
  {
    id: 'mock-4',
    user_id: 'mock',
    numero: 88,
    tipo: 'repetida',
    nombre_jugador: 'Rodrigo De Paul',
    created_at: '',
  },
];

// ─── Constante de página ──────────────────────────────────────────────────────
const PAGE_SIZE = 20;

// ─── Componente principal ─────────────────────────────────────────────────────
export default function FiguritasScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [figuritas, setFiguritas] = useState<Figurita[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFigurita, setSelectedFigurita] = useState<Figurita | undefined>(undefined);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingMatches, setPendingMatches] = useState(0);

  const { user } = useAuth() as any;

  const loadFiguritas = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { figuritasService } = await import('@/services/figuritasService');
      const data = await figuritasService.getFiguritas(user.id);
      setFiguritas(data);

      try {
        const matchesData = await matchesService.getMatches(user.id);
        setPendingMatches(matchesData.length);
      } catch (matchesErr) {
        console.error('Error fetching matches in FiguritasScreen:', matchesErr);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar datos al enfocar la pantalla (useFocusEffect para re-fetch)
  useFocusEffect(
    useCallback(() => {
      loadFiguritas();
    }, [loadFiguritas])
  );

  // Resetear la página al cambiar el filtro activo
  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  // ── Lógica de filtros ────────────────────────────────────────────────────
  const repetidas = figuritas.filter((f) => f.tipo === 'repetida');
  const faltantes = figuritas.filter((f) => f.tipo === 'faltante');

  // El botón buscar coincidencias depende del array completo (no del filtrado)
  const canSearch = repetidas.length >= 1 && faltantes.length >= 1;

  const filteredFiguritas = (() => {
    switch (activeFilter) {
      case 'repetidas':
        return repetidas;
      case 'faltantes':
        return faltantes;
      default:
        return figuritas;
    }
  })();

  // Paginación real: muestra hasta page * PAGE_SIZE figuritas
  const displayedFiguritas = filteredFiguritas.slice(0, page * PAGE_SIZE);
  const hasMore = filteredFiguritas.length > page * PAGE_SIZE;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddFigurita = () => {
    setSelectedFigurita(undefined);
    setShowAddModal(true);
  };

  const handleBuscarCoincidencias = () => {
    router.push('/matches');
  };

  const handleCardPress = (figurita: Figurita) => {
    setSelectedFigurita(figurita);
    setShowActionsModal(true);
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!loading && figuritas.length === 0) {
    return (
      <ThemedView style={styles.root}>
      <AppHeader pendingNotificationsCount={pendingMatches} />
        <View style={[styles.emptyContainer, { backgroundColor: theme.surfaceContainerLowest }]}>
          {/* Ilustración */}
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../../assets/images/figuritas/img-figuritas-vacias.png')}
              style={styles.emptyIllustration}
              resizeMode="contain"
            />
          </View>

          {/* Texto */}
          <View style={styles.emptyTextContainer}>
            <ThemedText type="headlineMd" style={styles.emptyTitle}>
              No tenés figuritas cargadas todavía.
            </ThemedText>
            <ThemedText type="bodyMd" style={[styles.emptyDescription, { color: theme.onSurfaceVariant }]}>
              Agregá las que te sobran y las que te faltan para empezar a encontrar intercambios.
            </ThemedText>
          </View>

          {/* CTA */}
          <Pressable
            onPress={handleAddFigurita}
            style={({ pressed }) => [
              styles.emptyButton,
              { backgroundColor: pressed ? theme.primaryContainer : theme.primary },
            ]}
            accessibilityLabel="Agregar primera figurita"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle" size={20} color={theme.onPrimary} style={styles.emptyButtonIcon} />
            <ThemedText style={[styles.emptyButtonText, { color: theme.onPrimary }]}>
              Agregar figurita
            </ThemedText>
          </Pressable>
        </View>

        {/* Modal de Agregar Figurita */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => { setShowAddModal(false); setSelectedFigurita(undefined); }}
        >
          <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}><ActivityIndicator size="large" color={theme.primary} /></View>}>
            <AddFiguritaWrapper
              onClose={() => {
                setShowAddModal(false);
                setSelectedFigurita(undefined);
                loadFiguritas();
              }}
              figurita={selectedFigurita}
            />
          </Suspense>
        </Modal>
      </ThemedView>
    );
  }

  // ── Vista principal con datos ─────────────────────────────────────────────
  return (
    <ThemedView style={styles.root}>
      <AppHeader pendingNotificationsCount={pendingMatches} />

      <FlatList
        data={displayedFiguritas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: theme.surface },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Título y contador */}
            <View style={styles.headerSection}>
              <ThemedText type="headlineMd" style={styles.screenTitle}>
                Mis figuritas
              </ThemedText>
              <ThemedText type="bodyLg" style={[styles.counterText, { color: theme.onSurfaceVariant }]}>
                {repetidas.length} {repetidas.length === 1 ? 'repetida' : 'repetidas'} · {faltantes.length} {faltantes.length === 1 ? 'faltante' : 'faltantes'}
              </ThemedText>
            </View>

            {/* Botón "Buscar coincidencias" — solo visible si hay ≥1 repetida y ≥1 faltante */}
            {canSearch && (
              <Pressable
                onPress={handleBuscarCoincidencias}
                style={({ pressed }) => [
                  styles.searchButton,
                  {
                    borderColor: theme.primary,
                    backgroundColor: pressed ? theme.primary + '12' : 'transparent',
                  },
                ]}
                accessibilityLabel="Buscar coincidencias de intercambio"
                accessibilityRole="button"
              >
                <Ionicons name="search" size={20} color={theme.primary} style={styles.searchButtonIcon} />
                <ThemedText
                  type="headlineSm"
                  style={[styles.searchButtonText, { color: theme.primary }]}
                >
                  Buscar coincidencias
                </ThemedText>
              </Pressable>
            )}

            {/* Chips de filtro */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {(['todas', 'repetidas', 'faltantes'] as FilterType[]).map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? theme.primary : theme.surfaceContainerHigh,
                        borderColor: isActive ? theme.primary : theme.outlineVariant,
                      },
                    ]}
                    accessibilityLabel={`Filtrar por ${filter}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <ThemedText
                      style={[
                        styles.chipText,
                        { color: isActive ? theme.onPrimary : theme.onSurfaceVariant },
                      ]}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <FiguritaCard
            figurita={item}
            theme={theme}
            onPress={() => handleCardPress(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.filterEmptyContainer}>
            <Ionicons name="search-outline" size={40} color={theme.onSurfaceVariant} />
            <ThemedText type="bodyMd" style={[styles.filterEmptyText, { color: theme.onSurfaceVariant }]}>
              No hay figuritas con ese filtro.
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              onPress={() => setPage(p => p + 1)}
              style={[
                styles.loadMoreBtn,
                { borderColor: theme.primary },
              ]}
              accessibilityLabel="Ver más figuritas"
              accessibilityRole="button"
            >
              <ThemedText style={[styles.loadMoreText, { color: theme.primary }]}>
                Ver más ({filteredFiguritas.length - page * PAGE_SIZE} restantes)
              </ThemedText>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Botón flotante para agregar figurita */}
      <Pressable
        onPress={handleAddFigurita}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? theme.primaryContainer : theme.primary,
            shadowColor: theme.primary,
          },
        ]}
        accessibilityLabel="Agregar figurita"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={theme.onPrimary} />
      </Pressable>

      {/* Modal de Agregar Figurita */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => { setShowAddModal(false); setSelectedFigurita(undefined); }}
      >
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}><ActivityIndicator size="large" color={theme.primary} /></View>}>
          <AddFiguritaWrapper
            onClose={() => {
              setShowAddModal(false);
              setSelectedFigurita(undefined);
              loadFiguritas();
            }}
            figurita={selectedFigurita}
          />
        </Suspense>
      </Modal>

      {/* ── Sticker Actions Modal (Edit/Delete) ─────────────────────────────── */}
      <Modal
        visible={showActionsModal}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setShowActionsModal(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: theme.surface }]}>
            {/* Header Icon */}
            <View style={[styles.confirmIconBg, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="copy-outline" size={24} color={theme.primary} />
            </View>

            {/* Title / Info */}
            <View style={styles.confirmContent}>
              <ThemedText type="headlineSm" style={[styles.confirmTitle, { color: theme.onSurface }]}>
                Figurita Nº {selectedFigurita?.numero}
              </ThemedText>
              <ThemedText type="bodyMd" style={[styles.confirmDescription, { color: theme.onSurfaceVariant }]}>
                {selectedFigurita?.nombre_jugador || 'Sin nombre'} · {selectedFigurita?.tipo === 'repetida' ? 'Repetida' : 'Faltante'}
              </ThemedText>
            </View>

            {/* Actions List */}
            <View style={styles.confirmActionsContainer}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setShowActionsModal(false);
                  setShowAddModal(true);
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.actionBtnText}>Editar figurita</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.error }]}
                onPress={() => {
                  setShowActionsModal(false);
                  setShowDeleteConfirm(true);
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.actionBtnText}>Eliminar figurita</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtnCancel, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => {
                  setShowActionsModal(false);
                  setSelectedFigurita(undefined);
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.confirmBtnCancelText, { color: theme.onSurfaceVariant }]}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: theme.surface }]}>
            {/* Trash Icon */}
            <View style={[styles.confirmIconBg, { backgroundColor: theme.errorContainer }]}>
              <Ionicons name="trash-outline" size={24} color={theme.error} />
            </View>

            {/* Content */}
            <View style={styles.confirmContent}>
              <ThemedText type="headlineSm" style={[styles.confirmTitle, { color: theme.onSurface }]}>
                ¿Eliminar figurita?
              </ThemedText>
              <ThemedText type="bodyMd" style={[styles.confirmDescription, { color: theme.onSurfaceVariant }]}>
                ¿Estás seguro de que querés eliminar la figurita de {selectedFigurita?.nombre_jugador || `Nº ${selectedFigurita?.numero}`}? Esta acción no se puede deshacer.
              </ThemedText>
            </View>

            {/* Actions */}
            <View style={styles.confirmActionsContainer}>
              <TouchableOpacity
                style={[styles.confirmBtnConfirm, { backgroundColor: theme.error }]}
                onPress={async () => {
                  if (selectedFigurita) {
                    try {
                      const { figuritasService } = await import('@/services/figuritasService');
                      await figuritasService.deleteFigurita(selectedFigurita.id);
                      setShowDeleteConfirm(false);
                      setSelectedFigurita(undefined);
                      await loadFiguritas();
                    } catch (e) {
                      Alert.alert('Error', 'No se pudo eliminar la figurita.');
                    }
                  }
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.confirmBtnConfirmText}>Sí, eliminar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtnCancel, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setSelectedFigurita(undefined);
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.confirmBtnCancelText, { color: theme.onSurfaceVariant }]}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ─── Card de figurita ─────────────────────────────────────────────────────────
interface FiguritaCardProps {
  figurita: Figurita;
  theme: ReturnType<typeof useTheme>;
  onPress?: () => void;
}

function FiguritaCard({ figurita, theme, onPress }: FiguritaCardProps) {
  const isRepetida = figurita.tipo === 'repetida';

  // Colores del círculo: verde para repetidas, terciario (naranja) para faltantes
  const circleBackground = isRepetida ? theme.secondary : theme.tertiaryContainer;
  const circleTextColor = isRepetida ? theme.onSecondary : theme.onTertiaryContainer;

  // Badge (pill) de tipo
  const badgeBg = isRepetida ? theme.secondaryContainer : theme.tertiaryContainer;
  const badgeTextColor = isRepetida ? theme.onSecondaryContainer : theme.onTertiaryContainer;
  const badgeLabel = isRepetida ? 'Repetida' : 'Faltante';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceContainerLowest,
          borderColor: theme.outlineVariant + '66',
        },
      ]}
    >
      {/* Círculo con número */}
      <View style={[styles.numberCircle, { backgroundColor: circleBackground }]}>
        <ThemedText style={[styles.numberText, { color: circleTextColor }]}>
          {figurita.numero}
        </ThemedText>
      </View>

      {/* Info de la figurita */}
      <View style={styles.cardInfo}>
        {figurita.nombre_jugador ? (
          <ThemedText type="headlineSm" style={styles.playerName}>
            {figurita.nombre_jugador}
          </ThemedText>
        ) : (
          <ThemedText type="headlineSm" style={[styles.playerName, { color: theme.onSurfaceVariant }]}>
            Nº {figurita.numero}
          </ThemedText>
        )}

        {/* Badge de tipo */}
        <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
          <ThemedText style={[styles.typeBadgeText, { color: badgeTextColor }]}>
            {badgeLabel}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: 100,
    gap: Spacing.four,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIllustration: {
    width: 256,
    height: 256,
  },
  emptyTextContainer: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '700',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
    gap: Spacing.two,
    shadowColor: '#005bc1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonIcon: {
    marginRight: 2,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Lista principal ───────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 120, // espacio para FAB + tab bar
    minHeight: '100%',
  },
  listHeader: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    marginBottom: Spacing.three,
  },
  screenTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  counterText: {
    marginTop: 2,
  },

  // Botón "Buscar coincidencias"
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  searchButtonIcon: {
    marginRight: 2,
  },
  searchButtonText: {
    fontWeight: '600',
  },

  // Chips de filtro
  chipsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Separador entre cards
  separator: {
    height: Spacing.two,
  },

  // ── Card de figurita ──────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    marginHorizontal: Spacing.three,
    maxWidth: 500 - Spacing.three * 2,
    width: '100%' as const,
    alignSelf: 'center' as const,
    // Sombra sutil (Level 1)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  numberCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
    flexShrink: 0,
  },
  numberText: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  playerName: {
    fontWeight: '600',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },

  // ── Ver más ────────────────────────────────────────────────────────────────
  loadMoreBtn: {
    alignSelf: 'center',
    marginVertical: Spacing.three,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Filter empty state ────────────────────────────────────────────────────
  filterEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: Spacing.two,
  },
  filterEmptyText: {
    textAlign: 'center',
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 96, // encima del tab bar
    right: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Modal de Confirmación / Acciones ──
  confirmOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    padding: 16,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmDescription: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmActionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtnConfirm: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtnCancel: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
