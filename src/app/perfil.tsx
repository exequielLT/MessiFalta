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
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';

// Temporary local database storage key (to be replaced with db integration later)
const PROFILE_STORAGE_KEY = 'messifalta_user_profile';

export default function PerfilScreen() {
  const theme = useTheme();

  // State for the profile data
  const [userProfile, setUserProfile] = useState({
    name: 'Lucas',
    location: 'Barrio Centro',
    rating: 4,
    totalTrades: 12,
  });

  // Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile data on focus
  useFocusEffect(
    useCallback(() => {
      if (typeof window !== 'undefined') {
        const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            setUserProfile((prev) => ({
              ...prev,
              name: parsed.name || prev.name,
              location: parsed.location || prev.location,
            }));
          } catch (e) {
            console.error('Error al cargar perfil:', e);
          }
        }
      }
    }, [])
  );

  const recentTrades = [
    {
      id: '1',
      type: 'completed',
      offered: 'Nº 89',
      received: 'Nº 200',
      date: '15/06/2026',
      status: 'Exitoso',
    },
    {
      id: '2',
      type: 'completed',
      offered: 'Nº 12',
      received: 'Nº 45',
      date: '10/06/2026',
      status: 'Exitoso',
    },
    {
      id: '3',
      type: 'pending',
      offered: 'Nº 102',
      received: 'Nº 10',
      date: '08/06/2026',
      status: 'Pendiente',
    },
  ];

  const handleEditProfilePress = () => {
    setEditName(userProfile.name);
    setEditLocation(userProfile.location);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }
    if (!editLocation.trim()) {
      Alert.alert('Error', 'La ubicación no puede estar vacía.');
      return;
    }

    setSaving(true);
    // Simulate save connection to temporary db / storage
    setTimeout(() => {
      const updatedProfile = {
        name: editName.trim(),
        location: editLocation.trim(),
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      }

      setUserProfile((prev) => ({
        ...prev,
        ...updatedProfile,
      }));

      setSaving(false);
      setIsEditModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    }, 1000);
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

  const pendingMatches = 2;

  return (
    <ThemedView style={styles.root}>
      <AppHeader pendingNotificationsCount={pendingMatches} />

      <ScrollView 
        contentInsetAdjustmentBehavior="automatic" 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={[styles.avatarContainer, { backgroundColor: theme.surfaceContainerHigh }]}>
            <Ionicons name="person" size={44} color={theme.onSurfaceVariant} />
          </View>

          {/* User Info */}
          <ThemedText type="headlineMd" style={styles.userName}>
            {userProfile.name}
          </ThemedText>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={14} color={theme.onSurfaceVariant} style={styles.locationIcon} />
            <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant }}>
              {userProfile.location}
            </ThemedText>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer} accessibilityLabel={`Calificación: ${userProfile.rating} de 5 estrellas`}>
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

          {/* Stats */}
          <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant, fontWeight: '500' }}>
            {userProfile.totalTrades} intercambios exitosos
          </ThemedText>
        </View>

        {/* Actions Row */}
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

        {/* Recent Trades Section */}
        <View style={styles.tradesSection}>
          <ThemedText type="headlineSm" style={styles.sectionTitle}>
            Últimos intercambios
          </ThemedText>

          <View style={[styles.tradesCard, { 
            backgroundColor: theme.surfaceContainerLowest, 
            borderColor: theme.outlineVariant + '44' 
          }]}>
            {recentTrades.map((trade, index) => {
              const isCompleted = trade.type === 'completed';
              const iconBg = isCompleted ? theme.secondaryContainer : theme.surfaceContainerHighest;
              const iconColor = isCompleted ? theme.onSecondaryContainer : theme.onSurfaceVariant;
              
              const statusBg = isCompleted ? theme.secondaryContainer : theme.surfaceContainerHighest;
              const statusTextColor = isCompleted ? theme.secondary : theme.onSurfaceVariant;

              return (
                <View 
                  key={trade.id} 
                  style={[
                    styles.tradeItem, 
                    { borderColor: theme.outlineVariant + '22' },
                    index === recentTrades.length - 1 && styles.lastTradeItem
                  ]}
                >
                  {/* Status Icon */}
                  <View style={[styles.tradeIconContainer, { backgroundColor: iconBg }]}>
                    <Ionicons 
                      name={isCompleted ? 'swap-horizontal' : 'time-outline'} 
                      size={20} 
                      color={iconColor} 
                    />
                  </View>

                  {/* Trade Details */}
                  <View style={styles.tradeInfo}>
                    <ThemedText type="bodyMd" style={styles.tradeDescription}>
                      Entregaste <ThemedText type="bodyMd" style={styles.boldText}>{trade.offered}</ThemedText>, recibiste <ThemedText type="bodyMd" style={styles.boldText}>{trade.received}</ThemedText>
                    </ThemedText>
                    <ThemedText type="labelSm" style={{ color: theme.onSurfaceVariant, marginTop: 2 }}>
                      {trade.date}
                    </ThemedText>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <ThemedText 
                      style={[styles.statusBadgeText, { color: statusTextColor }]} 
                      type="labelSm"
                    >
                      {trade.status}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Full History link button */}
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
      </ScrollView>

      {/* Edit Profile Modal (Self-contained for robust routing compatibility) */}
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
              <ThemedText type="labelSm" style={{ color: theme.primary, marginTop: Spacing.two, fontWeight: '700' }}>
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
                    }
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
                    }
                  ]}
                  maxLength={40}
                />
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

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
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  locationIcon: {
    marginRight: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  starIcon: {
    marginHorizontal: 1,
  },
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
    marginTop: 2,
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
  pressed: {
    opacity: 0.7,
  },

  // Modal Styles
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
});
