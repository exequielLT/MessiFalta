import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CardFiguritaProps {
  number: number;
  type: 'repetida' | 'faltante';
  playerName?: string;
  onPress?: () => void;
}

export const CardFigurita: React.FC<CardFiguritaProps> = ({ number, type, playerName, onPress }) => {
  const theme = useTheme();
  const isRepetida = type === 'repetida';
  const circleColor = isRepetida ? theme.secondary : theme.tertiary;
  const tagText = isRepetida ? 'Repetida' : 'Faltante';

  const content = (
    <View style={[styles.container, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }]}>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <Text style={styles.number}>{number}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        {playerName && <Text style={[styles.playerName, { color: theme.onSurface }]}>{playerName}</Text>}
        <Text style={[styles.tagText, { color: theme.onSurfaceVariant }]}>{tagText}</Text>
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
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 2,
  },
  tagText: {
    fontSize: 12,
  },
});
