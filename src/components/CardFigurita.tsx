import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';

interface CardFiguritaProps {
  number: number;
  type: 'repetida' | 'faltante';
  playerName?: string;
  onPress?: () => void;
}

export const CardFigurita: React.FC<CardFiguritaProps> = ({ number, type, playerName, onPress }) => {
  const isRepetida = type === 'repetida';
  const circleColor = isRepetida ? colors.secondary : colors.warning;
  const tagText = isRepetida ? 'Repetida' : 'Faltante';

  const content = (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <Text style={styles.number}>{number}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        {playerName && <Text style={styles.playerName}>{playerName}</Text>}
        <Text style={styles.tagText}>{tagText}</Text>
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
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
