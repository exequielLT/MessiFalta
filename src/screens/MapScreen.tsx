import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSizes } from '../constants/theme';

// Import opcional si el día de mañana se agrega la llamada a backend
// import { getKioscos } from '../services/kioscosService';
// import { StatusScreen } from '../components/StatusScreen';

// 1. Datos dummy (Catamarca)
const DUMMY_KIOSCOS = [
  {
    id: '1',
    nombre: 'Kiosco Central',
    direccion: 'San Martín 500',
    lat: -28.468,
    lng: -65.786,
    horario: '08:00 a 22:00',
  },
  {
    id: '2',
    nombre: 'Parada Sur',
    direccion: 'Rivadavia 1200',
    lat: -28.472,
    lng: -65.780,
    horario: '24 hs',
  },
  {
    id: '3',
    nombre: 'Kiosquito Norte',
    direccion: 'Belgrano 250',
    lat: -28.465,
    lng: -65.788,
    horario: '09:00 a 21:00',
  },
];

const INITIAL_REGION: Region = {
  latitude: -28.469,
  longitude: -65.785,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type MapScreenRouteParams = {
  params?: {
    kioscoId?: string;
  };
};

export const MapScreen = () => {
  const route = useRoute<RouteProp<MapScreenRouteParams, 'params'>>();
  // 2. Kiosco destacado opcional
  const targetKioscoId = route.params?.kioscoId;

  // 3. Estado local
  const [selectedKioscoId, setSelectedKioscoId] = useState<string | null>(targetKioscoId || null);

  const handleMapPress = () => {
    // 8. Ocultar tarjeta
    setSelectedKioscoId(null);
  };

  const selectedKioscoData = DUMMY_KIOSCOS.find((k) => k.id === selectedKioscoId);

  return (
    <View style={styles.container}>
      {/* 4. MapView centrado en Catamarca */}
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onPress={handleMapPress}
      >
        {/* 5. Renderizado de marcadores */}
        {DUMMY_KIOSCOS.map((kiosco) => {
          const isTarget = kiosco.id === targetKioscoId;
          const pinColor = isTarget ? colors.secondary : colors.primary;

          return (
            <Marker
              key={kiosco.id}
              coordinate={{ latitude: kiosco.lat, longitude: kiosco.lng }}
              title={isTarget ? kiosco.nombre : undefined}
              pinColor={pinColor}
              onPress={(e) => {
                e.stopPropagation(); // Evitar que se dispare onPress del MapView
                setSelectedKioscoId(kiosco.id);
              }}
            />
          );
        })}
      </MapView>

      {/* 6 y 7. Tarjeta inferior */}
      {selectedKioscoData && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>{selectedKioscoData.nombre}</Text>
          <Text style={styles.cardAddress}>{selectedKioscoData.direccion}</Text>
          <Text style={styles.cardSchedule}>Horario: {selectedKioscoData.horario}</Text>

          <TouchableOpacity style={styles.routeButton} activeOpacity={0.7}>
            <Text style={styles.routeButtonText}>Cómo llegar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background, // Blanco por defecto según theme
    borderTopLeftRadius: borderRadius.lg, // 16
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg, // 24
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cardTitle: {
    fontSize: fontSizes.body, // 16px
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardSchedule: {
    fontSize: fontSizes.caption, // 12px
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  routeButton: {
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  routeButtonText: {
    color: colors.primary,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
});
