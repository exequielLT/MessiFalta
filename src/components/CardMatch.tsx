import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FiguritaInfo {
  number: number;
  name?: string;
}

interface CardMatchProps {
  userName: string;
  reputation: number;
  offeredFigurita: FiguritaInfo;
  requestedFigurita: FiguritaInfo;
  distance?: string;
  onPress?: () => void;
}

export const CardMatch: React.FC<CardMatchProps> = ({
  userName,
  reputation,
  offeredFigurita,
  requestedFigurita,
  distance,
  onPress,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={{ color: i <= reputation ? colors.primary : colors.border, fontSize: 14 }}>
          {i <= reputation ? '★' : '☆'}
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.userName}>{userName}</Text>
          {renderStars()}
        </View>

        <View style={styles.tradeRow}>
          <Text style={styles.tradeLabel}>Ofrece: </Text>
          <View style={[styles.tag, { backgroundColor: colors.secondary + '20' }]}>
            <Text style={[styles.tagText, { color: colors.secondary }]}>
              Nº {offeredFigurita.number}{offeredFigurita.name ? ` - ${offeredFigurita.name}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.tradeRow}>
          <Text style={styles.tradeLabel}>Busca: </Text>
          <View style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.tagText, { color: colors.warning }]}>
              Nº {requestedFigurita.number}{requestedFigurita.name ? ` - ${requestedFigurita.name}` : ''}
            </Text>
          </View>
        </View>

        {distance && (
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        )}
      </View>

      {onPress && (
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={24} color={colors.border} />
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
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tradeLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  distanceText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
