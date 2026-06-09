import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '../constants/theme';

export interface FiguritaInfo {
  number: number | string;
  name?: string;
}

export interface CardMatchProps {
  userName: string;
  reputation: number;
  offeredFigurita: FiguritaInfo;
  requestedFigurita: FiguritaInfo;
  distance?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CardMatch: React.FC<CardMatchProps> = ({
  userName,
  reputation,
  offeredFigurita,
  requestedFigurita,
  distance,
  onPress,
  style,
}) => {
  const renderStars = () => {
    const stars = [];
    const maxStars = 5;
    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <Text
          key={i}
          style={[
            styles.star,
            { color: i < reputation ? colors.warning : colors.border },
          ]}
        >
          ★
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderFiguritaInfo = (label: string, figurita: FiguritaInfo, tagColor: string) => {
    const text = figurita.name
      ? `Nº ${figurita.number} - ${figurita.name}`
      : `Nº ${figurita.number}`;
      
    return (
      <View style={styles.figuritaRow}>
        <View style={[styles.tag, { backgroundColor: tagColor }]}>
          <Text style={styles.tagText}>{label}</Text>
        </View>
        <Text style={styles.figuritaText} numberOfLines={1}>
          {text}
        </Text>
      </View>
    );
  };

  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.userName} numberOfLines={1}>
          {userName}
        </Text>
        {renderStars()}
      </View>

      <View style={styles.detailsContainer}>
        {renderFiguritaInfo('Ofrece', offeredFigurita, colors.secondary)}
        {renderFiguritaInfo('Busca', requestedFigurita, colors.warning)}
      </View>

      {distance && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceIcon}>📍</Text>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginLeft: 2,
  },
  detailsContainer: {
    gap: spacing.sm,
  },
  figuritaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    minWidth: 65,
    alignItems: 'center',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: fontSizes.caption,
    fontWeight: 'bold',
  },
  figuritaText: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  distanceText: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
