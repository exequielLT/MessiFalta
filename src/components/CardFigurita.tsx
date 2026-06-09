import React from 'react';
import { StyleSheet, View, Pressable, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface CardFiguritaProps {
  type: 'repetida' | 'faltante';
  number: string;
  playerName?: string;
  country?: string;
  imageUrl?: string;
  quantity?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CardFigurita({
  type,
  number,
  playerName = 'Jugador Desconocido',
  country = 'Mundial 2026',
  imageUrl,
  quantity = 1,
  onPress,
  style,
}: CardFiguritaProps) {
  const theme = useTheme();
  const isMissing = type === 'faltante';

  // Choose colors based on type
  const statusColor = isMissing ? theme.tertiaryContainer : theme.secondaryContainer;
  const statusTextColor = isMissing ? theme.onTertiaryContainer : theme.onSecondaryContainer;
  const badgeText = isMissing ? 'FALTANTE' : 'REPETIDA';

  // Standard placeholder image if none is provided
  const defaultPlayerImage = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=60';
  const displayImage = imageUrl || defaultPlayerImage;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: theme.surfaceContainerLowest,
          borderColor: theme.outlineVariant + '33', // 20% opacity outline
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Corner Ribbon */}
      <View style={[styles.ribbonContainer, { borderTopColor: statusColor }]}>
        <View style={styles.ribbonTextContainer}>
          <ThemedText style={[styles.ribbonText, { color: statusTextColor }]} type="labelSm">
            {badgeText.substring(0, 4)}
          </ThemedText>
        </View>
      </View>

      {/* Multiplier Badge (if duplicate & quantity > 1) */}
      {!isMissing && quantity > 1 && (
        <View style={[styles.quantityBadge, { backgroundColor: theme.secondary }]}>
          <ThemedText style={styles.quantityText} type="labelSm">
            x{quantity}
          </ThemedText>
        </View>
      )}

      {/* Player Image container */}
      <View style={[styles.imageContainer, { backgroundColor: theme.surfaceDim }]}>
        <Image
          source={{ uri: displayImage }}
          style={[
            styles.playerImage,
            isMissing && styles.grayscaleImage,
          ]}
          contentFit="cover"
          transition={200}
        />
        {/* Shadow fade gradient at bottom of the image */}
        <View style={styles.gradientOverlay} />
      </View>

      {/* Card Information */}
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <ThemedText style={styles.stickerNumber} type="headlineSm">
            {number}
          </ThemedText>
          <View style={[styles.countryBadge, { backgroundColor: theme.surfaceContainerHighest }]}>
            <ThemedText style={{ color: theme.onSurfaceVariant }} type="labelSm">
              {country}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.playerName} type="bodyMd" numberOfLines={1}>
          {playerName}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    borderCurve: 'continuous',
    marginVertical: 6,
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  grayscaleImage: {
    opacity: 0.5,
    tintColor: '#cccccc', // Adds grayscale tint in React Native
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoContainer: {
    padding: 12,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  stickerNumber: {
    fontWeight: '800',
  },
  countryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  playerName: {
    fontWeight: '600',
    opacity: 0.9,
  },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 44,
    borderLeftWidth: 44,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ribbonTextContainer: {
    position: 'absolute',
    top: -38,
    right: -2,
    width: 40,
    height: 20,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonText: {
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
  },
  quantityText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
