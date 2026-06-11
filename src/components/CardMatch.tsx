import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  avatarUrl?: string;
  tradesCount?: number;
}

export const CardMatch: React.FC<CardMatchProps> = ({
  userName,
  reputation,
  offeredFigurita,
  requestedFigurita,
  distance,
  onPress,
  style,
  avatarUrl,
  tradesCount,
}) => {
  const theme = useTheme();
  const scheme = useColorScheme();

  const offersBg = scheme === 'dark' ? 'rgba(83, 225, 111, 0.15)' : 'rgba(52, 199, 89, 0.1)';
  const offersText = scheme === 'dark' ? '#53e16f' : '#34C759';
  const seeksBg = scheme === 'dark' ? 'rgba(255, 184, 116, 0.15)' : 'rgba(255, 149, 0, 0.1)';
  const seeksText = scheme === 'dark' ? '#ffb874' : '#FF9500';

  const renderStars = () => {
    const stars = [];
    const maxStars = 5;
    for (let i = 0; i < maxStars; i++) {
      stars.push(
        <Text
          key={i}
          style={[
            styles.star,
            { color: i < reputation ? colors.warning : '#C7C7CC' },
          ]}
        >
          ★
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderFiguritaInfo = (label: string, figurita: FiguritaInfo, tagColor: string, tagTextColor: string, tagBgColor: string) => {
    const text = figurita.name
      ? `Nº ${figurita.number} - ${figurita.name}`
      : `Nº ${figurita.number}`;
      
    return (
      <View style={styles.figuritaRow}>
        <View style={[styles.tag, { backgroundColor: tagBgColor }]}>
          <Text style={[styles.tagText, { color: tagTextColor }]}>{label}</Text>
        </View>
        <Text style={[styles.figuritaText, { color: theme.onSurface }]} numberOfLines={1}>
          {text}
        </Text>
      </View>
    );
  };

  const content = (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.surfaceContainerLowest, 
        borderColor: theme.outlineVariant 
      }, 
      style
    ]}>
      <View style={styles.headerRow}>
        <View style={styles.userProfileContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar, { backgroundColor: theme.surfaceContainerHigh }]}>
              <Text style={[styles.defaultAvatarText, { color: theme.primary }]}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.onSurface }]} numberOfLines={1}>
              {userName}
            </Text>
            <View style={styles.ratingSubRow}>
              {renderStars()}
              {tradesCount !== undefined && (
                <Text style={[styles.tradesCountText, { color: theme.onSurfaceVariant }]}>
                  ({tradesCount} canjes)
                </Text>
              )}
            </View>
          </View>
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color={theme.outline} />
        )}
      </View>

      <View style={styles.detailsContainer}>
        {renderFiguritaInfo(
          'Ofrece',
          offeredFigurita,
          theme.secondary,
          offersText,
          offersBg
        )}
        {renderFiguritaInfo(
          'Busca',
          requestedFigurita,
          theme.tertiary,
          seeksText,
          seeksBg
        )}
      </View>

      {distance && (
        <View style={styles.distanceContainer}>
          <Ionicons name="location-sharp" size={14} color={theme.onSurfaceVariant} style={styles.distanceIcon} />
          <Text style={[styles.distanceText, { color: theme.onSurfaceVariant }]}>{distance}</Text>
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
    borderRadius: 12,
    padding: spacing.md,
    // iOS shadow matching the .ios-shadow class
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
    marginHorizontal: 0.5,
  },
  tradesCountText: {
    fontSize: 13,
    marginLeft: 4,
  },
  detailsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  figuritaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  tagText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  figuritaText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  distanceIcon: {
    marginRight: 4,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
