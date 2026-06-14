import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MapScreen } from '../screens/MapScreen';

export default function KioscosRoute() {
  const { kioscoId } = useLocalSearchParams<{ kioscoId?: string }>();
  
  return <MapScreen kioscoId={kioscoId ? parseInt(kioscoId, 10) : undefined} />;
}
