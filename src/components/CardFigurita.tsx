import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '../constants/theme';

interface CardFiguritaProps {
  number: number | string;
  type: 'repetida' | 'faltante';
  playerName?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CardFigurita: React.FC<CardFiguritaProps> = ({
  number,
  type,
  playerName,
  onPress,
  style,
}) => {
  const isRepetida = type === 'repetida';
  const typeLabel = isRepetida ? 'Repetida' : 'Faltante';
  const circleColor = isRepetida ? colors.secondary : colors.warning;

  const content = (
    <View style={[styles.container, style]}>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <View style={styles.infoContainer}>
        {playerName ? (
          <Text style={styles.playerName} numberOfLines={1}>
            {playerName}
          </Text>
        ) : (
          <Text style={styles.playerName}>Figurita #{number}</Text>
        )}
        <Text style={styles.typeLabel}>{typeLabel}</Text>
      </View>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.caption,
  },
});
