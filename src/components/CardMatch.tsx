import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
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
  avatarUrl?: string;
  tradesCount?: number;
  style?: any;
}

export const CardMatch: React.FC<CardMatchProps> = ({
  userName,
  reputation,
  offeredFigurita,
  requestedFigurita,
  distance,
  onPress,
  avatarUrl,
  tradesCount,
  style,
}) => {
  const theme = useTheme();

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={{ color: i <= reputation ? '#FF9500' : theme.outlineVariant, fontSize: 14 }}>
          {i <= reputation ? '★' : '☆'}
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const content = (
    <View style={[styles.container, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }, style]}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.userName, { color: theme.onSurface }]}>{userName}</Text>
          {renderStars()}
        </View>

        <View style={tradeRowStyle(styles.tradeRow)}>
          <Text style={[styles.tradeLabel, { color: theme.onSurface }]}>Ofrece: </Text>
          <View style={[styles.tag, { backgroundColor: theme.secondary + '20' }]}>
            <Text style={[styles.tagText, { color: theme.secondary }]}>
              Nº {offeredFigurita.number}{offeredFigurita.name ? ` - ${offeredFigurita.name}` : ''}
            </Text>
          </View>
        </View>

        <View style={tradeRowStyle(styles.tradeRow)}>
          <Text style={[styles.tradeLabel, { color: theme.onSurface }]}>Busca: </Text>
          <View style={[styles.tag, { backgroundColor: theme.tertiary + '20' }]}>
            <Text style={[styles.tagText, { color: theme.tertiary }]}>
              Nº {requestedFigurita.number}{requestedFigurita.name ? ` - ${requestedFigurita.name}` : ''}
            </Text>
          </View>
        </View>

        {distance && (
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={14} color={theme.onSurfaceVariant} />
            <Text style={[styles.distanceText, { color: theme.onSurfaceVariant }]}>{distance}</Text>
          </View>
        )}
      </View>

      {onPress && (
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={24} color={theme.outlineVariant} />
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

// Helper helper for tradeRow styling types
const tradeRowStyle = (style: any): any => style;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
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
    marginLeft: 4,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
