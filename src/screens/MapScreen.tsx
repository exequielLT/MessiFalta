import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { StatusScreen } from '../components/StatusScreen';
import { Kiosco } from '../types';

type MapScreenRouteProp = RouteProp<{ params: { kioscoId?: number } }, 'params'>;

const KIOSCOS_DATA: Kiosco[] = [
  { id: 1, nombre: 'Kiosco San Cayetano', direccion: 'Av. Belgrano 450', lat: -28.468, lng: -65.782, horario: '8 a 20 h' },
  { id: 2, nombre: 'Kiosco La Esquina', direccion: 'Rivadavia 1200', lat: -28.470, lng: -65.788, horario: '9 a 21 h' },
  { id: 3, nombre: 'Kiosco Plaza', direccion: 'Sarmiento 300', lat: -28.465, lng: -65.780, horario: '7 a 19 h' },
];

export const MapScreen: React.FC = () => {
  const route = useRoute<MapScreenRouteProp>();
  const [selectedKiosco, setSelectedKiosco] = useState<number | null>(null);

  const initialRegion = {
    latitude: -28.469,
    longitude: -65.785,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    // Si la pantalla recibe un kioscoId en los parámetros, auto-seleccionamos ese kiosco
    if (route.params?.kioscoId) {
      setSelectedKiosco(route.params.kioscoId);
    }
  }, [route.params?.kioscoId]);

  const targetKioscoId = route.params?.kioscoId;
  const selectedKioscoData = KIOSCOS_DATA.find(k => k.id === selectedKiosco);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={() => setSelectedKiosco(null)} // Cierra la tarjeta si tocas fuera de los markers
      >
        {KIOSCOS_DATA.map((kiosco) => {
          const isTarget = kiosco.id === targetKioscoId;
          const pinColor = isTarget ? colors.secondary : colors.primary;

          return (
            <Marker
              key={kiosco.id}
              coordinate={{ latitude: kiosco.lat, longitude: kiosco.lng }}
              title={kiosco.nombre}
              description={kiosco.direccion}
              pinColor={pinColor}
              onPress={(e) => {
                e.stopPropagation(); // Evita que se dispare el onPress del MapView
                setSelectedKiosco(kiosco.id);
              }}
            />
          );
        })}
      </MapView>

      {selectedKioscoData && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>{selectedKioscoData.nombre}</Text>
          <Text style={styles.cardAddress}>{selectedKioscoData.direccion}</Text>
          {selectedKioscoData.horario && (
            <Text style={styles.cardTime}>Horario: {selectedKioscoData.horario}</Text>
          )}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Cómo llegar', 'Abrir mapas (simulado)')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Cómo llegar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: -8, // Para alinear visualmente el texto del padding
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
