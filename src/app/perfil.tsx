import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  Share,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';

// Storage keys
const PROFILE_STORAGE_KEY = 'messifalta_user_profile';
const USER_SESSION_KEY = 'user_session';
const ONBOARDING_KEY = 'has_seen_onboarding';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  email: string;
  location: string;
  rating: number;
  totalTrades: number;
}

interface TradeRecord {
  id: string;
  type: 'completed' | 'pending' | 'cancelled';
  offered: string;
  received: string;
  date: string;
  status: string;
  partner?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const theme = useTheme();

  // ── State ────────────────────────────────────────────────────────────────

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Lucas Rodríguez',
    email: 'lucas.r@gmail.com',
    location: 'Barrio Centro',
    rating: 4,
    totalTrades: 12,
  });

  // Edit profile modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────

  const recentTrades: TradeRecord[] = [
    {
      id: '1',
      type: 'completed',
      offered: 'Nº 89',
      received: 'Nº 200',
      date: '15/06/2026',
      status: 'Exitoso',
      partner: 'Martín G.',
    },
    {
      id: '2',
      type: 'completed',
      offered: 'Nº 12',
      received: 'Nº 45',
      date: '10/06/2026',
      status: 'Exitoso',
      partner: 'Ana P.',
    },
    {
      id: '3',
      type: 'pending',
      offered: 'Nº 102',
      received: 'Nº 10',
      date: '08/06/2026',
      status: 'Pendiente',
      partner: 'Carlos M.',
    },
    {
      id: '4',
      type: 'cancelled',
      offered: 'Nº 55',
      received: 'Nº 301',
      date: '02/06/2026',
      status: 'Cancelado',
      partner: 'Jorge L.',
    },
  ];

  // ── Effects ──────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const saved = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            setUserProfile((prev) => ({
              ...prev,
              name: parsed.name || prev.name,
              email: parsed.email || prev.email,
              location: parsed.location || prev.location,
            }));
          }
        } catch (e) {
          console.error('Error al cargar perfil:', e);
        }
      };
      loadProfile();
    }, [])
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEditProfilePress = () => {
    setEditName(userProfile.name);
    setEditLocation(userProfile.location);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }
    if (!editLocation.trim()) {
      Alert.alert('Error', 'La ubicación no puede estar vacía.');
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = {
        name: editName.trim(),
        location: editLocation.trim(),
        email: userProfile.email,
      };
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
      setIsEditModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el perfil. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `¡Mirá mi perfil de FiguMatch! Llevo ${userProfile.totalTrades} intercambios exitosos coleccionando el álbum del Mundial 2026.`,
      });
    } catch (error) {
      console.error('Error al compartir perfil:', error);
    }
  };

  const handleFullHistory = () => {
    Alert.alert('Historial Completo', 'El historial detallado estará disponible próximamente.');
  };

  const handleAvatarPress = () => {
    Alert.alert('Subir Foto', 'La carga de imágenes estará disponible en la versión final.');
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      // Clear session and onboarding flag as per AGENTS.md rules
      await AsyncStorage.multiRemove([USER_SESSION_KEY, ONBOARDING_KEY]);
      setShowLogoutConfirm(false);
      // Trigger a full app reload to re-evaluate auth state in _layout.tsx
      // For web compatibility and managed workflow
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
      setLoggingOut(false);
      setShowLogoutConfirm(false);
      Alert.alert('Error', 'No se pudo cerrar sesión. Intentá de nuevo.');
    }
  };

  const pendingMatches = 2;

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Returns icon and color config based on trade type */
  const getTradeVisuals = (type: TradeRecord['type']) => {
    switch (type) {
      case 'completed':
        return {
          icon: 'swap-horizontal' as const,
          iconBg: theme.secondaryContainer,
          iconColor: theme.onSecondaryContainer,
          statusBg: theme.secondaryContainer,
          statusColor: theme.secondary,
        };
      case 'pending':
        return {
          icon: 'time-outline' as const,
          iconBg: theme.surfaceContainerHighest,
          iconColor: theme.onSurfaceVariant,
          statusBg: theme.surfaceContainerHighest,
          statusColor: theme.onSurfaceVariant,
        };
      case 'cancelled':
        return {
          icon: 'close-circle-outline' as const,
          iconBg: theme.errorContainer,
          iconColor: theme.onErrorContainer,
          statusBg: theme.errorContainer,
          statusColor: theme.onErrorContainer,
        };
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <ThemedView style={styles.root}>
      <AppHeader pendingNotificationsCount={pendingMatches} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header ─────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <Pressable
            onPress={handleAvatarPress}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View style={[styles.avatarContainer, { backgroundColor: theme.surfaceContainerHigh }]}>
              <Ionicons name="person" size={44} color={theme.onSurfaceVariant} />
            </View>
          </Pressable>

          {/* Name */}
          <ThemedText type="headlineMd" style={styles.userName}>
            {userProfile.name}
          </ThemedText>

          {/* Email */}
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={theme.onSurfaceVariant} style={styles.infoIcon} />
            <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant }}>
              {userProfile.email}
            </ThemedText>
          </View>

          {/* Location / Barrio */}
          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={14} color={theme.onSurfaceVariant} style={styles.infoIcon} />
            <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant }}>
              {userProfile.location}
            </ThemedText>
          </View>

          {/* Reputation Stars */}
          <View
            style={styles.ratingContainer}
            accessibilityLabel={`Reputación: ${userProfile.rating} de 5 estrellas`}
          >
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Ionicons
                key={starValue}
                name={starValue <= userProfile.rating ? 'star' : 'star-outline'}
                size={22}
                color="#FF9500"
                style={styles.starIcon}
              />
            ))}
          </View>

          {/* Trades count */}
          <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant, fontWeight: '500' }}>
            {userProfile.totalTrades} intercambios exitosos
          </ThemedText>
        </View>

        {/* ── Actions Row ─────────────────────────────────────────── */}
        <View style={styles.actionsContainer}>
          <Button
            title="Editar Perfil"
            onPress={handleEditProfilePress}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="Compartir"
            onPress={handleShareProfile}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>

        {/* ── Recent Trades Section ───────────────────────────────── */}
        <View style={styles.tradesSection}>
          <ThemedText type="headlineSm" style={styles.sectionTitle}>
            Últimos intercambios
          </ThemedText>

          <View
            style={[
              styles.tradesCard,
              {
                backgroundColor: theme.surfaceContainerLowest,
                borderColor: theme.outlineVariant + '44',
              },
            ]}
          >
            {recentTrades.map((trade, index) => {
              const visuals = getTradeVisuals(trade.type);

              return (
                <View
                  key={trade.id}
                  style={[
                    styles.tradeItem,
                    { borderColor: theme.outlineVariant + '22' },
                    index === recentTrades.length - 1 && styles.lastTradeItem,
                  ]}
                >
                  {/* Status Icon */}
                  <View style={[styles.tradeIconContainer, { backgroundColor: visuals.iconBg }]}>
                    <Ionicons name={visuals.icon} size={20} color={visuals.iconColor} />
                  </View>

                  {/* Trade Details */}
                  <View style={styles.tradeInfo}>
                    <ThemedText type="bodyMd" style={styles.tradeDescription}>
                      {'Entregaste '}
                      <ThemedText type="bodyMd" style={styles.boldText}>
                        {trade.offered}
                      </ThemedText>
                      {', recibiste '}
                      <ThemedText type="bodyMd" style={styles.boldText}>
                        {trade.received}
                      </ThemedText>
                    </ThemedText>
                    {trade.partner && (
                      <ThemedText type="labelSm" style={{ color: theme.onSurfaceVariant, marginTop: 1 }}>
                        Con {trade.partner}
                      </ThemedText>
                    )}
                    <ThemedText type="labelSm" style={{ color: theme.onSurfaceVariant, marginTop: 1 }}>
                      {trade.date}
                    </ThemedText>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: visuals.statusBg }]}>
                    <ThemedText style={[styles.statusBadgeText, { color: visuals.statusColor }]} type="labelSm">
                      {trade.status}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Full History link */}
          <Pressable
            onPress={handleFullHistory}
            style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
          >
            <ThemedText type="labelMd" style={{ color: theme.primary, fontWeight: '700' }}>
              Ver historial completo
            </ThemedText>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} style={styles.chevron} />
          </Pressable>
        </View>

        {/* ── Logout Button ───────────────────────────────────────── */}
        <View style={styles.logoutSection}>
          <Pressable
            onPress={() => setShowLogoutConfirm(true)}
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: theme.errorContainer },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={20} color={theme.onErrorContainer} style={styles.logoutIcon} />
            <Text style={[styles.logoutText, { color: theme.onErrorContainer }]}>
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ─────────────────────────────────────── */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <ThemedView style={styles.modalRoot}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderColor: theme.outlineVariant + '33' }]}>
            <Pressable
              onPress={() => setIsEditModalVisible(false)}
              style={({ pressed }) => [styles.modalHeaderButton, pressed && styles.pressed]}
            >
              <ThemedText type="bodyLg" style={{ color: theme.primary, fontWeight: '600' }}>
                Cancelar
              </ThemedText>
            </Pressable>
            <ThemedText type="headlineSm" style={styles.modalTitle}>
              Editar Perfil
            </ThemedText>
            <Pressable
              onPress={handleSaveProfile}
              disabled={saving}
              style={({ pressed }) => [styles.modalHeaderButton, pressed && styles.pressed]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <ThemedText type="bodyLg" style={{ color: theme.primary, fontWeight: '700' }}>
                  Guardar
                </ThemedText>
              )}
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar picker */}
            <View style={styles.avatarSection}>
              <Pressable
                onPress={handleAvatarPress}
                style={({ pressed }) => [styles.avatarWrapper, pressed && styles.pressed]}
              >
                <View style={[styles.avatarContainerLarge, { backgroundColor: theme.surfaceContainerHigh }]}>
                  <Ionicons name="person" size={54} color={theme.onSurfaceVariant} />
                </View>
                <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                  <Ionicons name="camera" size={16} color={theme.onPrimary} />
                </View>
              </Pressable>
              <ThemedText
                type="labelSm"
                style={{ color: theme.primary, marginTop: Spacing.two, fontWeight: '700' }}
              >
                Cambiar foto
              </ThemedText>
            </View>

            {/* Inputs Form */}
            <View style={styles.form}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <ThemedText type="labelMd" style={[styles.label, { color: theme.onSurfaceVariant }]}>
                  Nombre
                </ThemedText>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.onSurfaceVariant + '88'}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surfaceContainerHigh,
                      color: theme.onSurface,
                      borderColor: isNameFocused ? theme.primary : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                  maxLength={30}
                />
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <ThemedText type="labelMd" style={[styles.label, { color: theme.onSurfaceVariant }]}>
                  Barrio / Ubicación
                </ThemedText>
                <TextInput
                  value={editLocation}
                  onChangeText={setEditLocation}
                  onFocus={() => setIsLocationFocused(true)}
                  onBlur={() => setIsLocationFocused(false)}
                  placeholder="Barrio o Ciudad"
                  placeholderTextColor={theme.onSurfaceVariant + '88'}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surfaceContainerHigh,
                      color: theme.onSurface,
                      borderColor: isLocationFocused ? theme.primary : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                  maxLength={40}
                />
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* ── Logout Confirmation Modal ─────────────────────────────── */}
      {/* Rendered as a Modal to sit above the tab bar and navigation */}
      <Modal
        visible={showLogoutConfirm}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => !loggingOut && setShowLogoutConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: theme.surface }]}>
            {/* Warning Icon */}
            <View style={[styles.confirmIconBg, { backgroundColor: theme.errorContainer }]}>
              <Ionicons name="log-out-outline" size={28} color={theme.onErrorContainer} />
            </View>

            {/* Content */}
            <View style={styles.confirmContent}>
              <Text style={[styles.confirmTitle, { color: theme.onSurface }]}>
                ¿Cerrás sesión?
              </Text>
              <Text style={[styles.confirmDescription, { color: theme.onSurfaceVariant }]}>
                Tu progreso está guardado. Podés volver a ingresar cuando quieras.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.confirmActionsContainer}>
              <TouchableOpacity
                style={[styles.confirmBtnConfirm, { backgroundColor: theme.error }]}
                onPress={handleLogoutConfirm}
                activeOpacity={0.8}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnConfirmText}>Sí, cerrar sesión</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtnCancel, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => setShowLogoutConfirm(false)}
                activeOpacity={0.8}
                disabled={loggingOut}
              >
                <Text style={[styles.confirmBtnCancelText, { color: theme.onSurfaceVariant }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: Spacing.three,
    paddingBottom: 110, // room for bottom tab bar
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },

  // ── Profile Header ──────────────────────────────────────────────────────
  profileHeader: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  userName: {
    fontWeight: '700',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  starIcon: {
    marginHorizontal: 1,
  },

  // ── Actions ─────────────────────────────────────────────────────────────
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    marginBottom: Spacing.five,
  },
  actionButton: {
    flex: 1,
    maxWidth: 160,
  },

  // ── Trades Section ───────────────────────────────────────────────────────
  tradesSection: {
    width: '100%',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  tradesCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
    elevation: 1,
  },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  lastTradeItem: {
    borderBottomWidth: 0,
  },
  tradeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  tradeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tradeDescription: {
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginLeft: Spacing.one,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chevron: {
    marginLeft: 4,
  },

  // ── Logout ───────────────────────────────────────────────────────────────
  logoutSection: {
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderCurve: 'continuous',
    gap: Spacing.two,
  },
  logoutIcon: {
    // gap handles spacing
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // ── General ──────────────────────────────────────────────────────────────
  pressed: {
    opacity: 0.7,
  },

  // ── Edit Modal ───────────────────────────────────────────────────────────
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  modalHeaderButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    minWidth: 80,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '700',
  },
  modalContent: {
    padding: Spacing.three,
    paddingBottom: 40,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainerLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
    elevation: 2,
  },
  form: {
    gap: Spacing.four,
    marginBottom: Spacing.five,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  label: {
    fontWeight: '600',
    paddingLeft: Spacing.one,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    borderCurve: 'continuous',
  },

  // ── Logout Confirmation Modal (same design as matches.tsx confirmOverlay) ─
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
