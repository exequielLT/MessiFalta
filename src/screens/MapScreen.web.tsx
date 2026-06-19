import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  Pressable,
  DimensionValue,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppHeader from '@/components/AppHeader';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Kiosco } from '../types';

const KIOSCOS_DATA: Kiosco[] = [
  { id: 1, nombre: 'Kiosco San Cayetano', direccion: 'Av. Virgen del Valle 350, San Fernando del Valle', lat: -28.4686, lng: -65.7795, horario: '8 a 20 h' },
  { id: 2, nombre: 'Kiosco La Esquina',   direccion: 'Salta 920, San Fernando del Valle',                lat: -28.4699, lng: -65.7859, horario: '9 a 21 h' },
  { id: 3, nombre: 'Kiosco Plaza',        direccion: 'Rivadavia 650, San Fernando del Valle',            lat: -28.4662, lng: -65.7791, horario: '7 a 19 h' },
];

// Dynamically load native-only react-native-maps to prevent web/SSR crashes
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView        = Maps.default;
    Marker         = Maps.Marker;
    PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
  } catch (err) {
    console.warn('Failed to load react-native-maps dynamically', err);
  }
}

// Dark map style for native Google Maps
const DARK_MAP_STYLE = [
  { elementType: 'geometry',                 stylers: [{ color: '#1b1b1d' }] },
  { elementType: 'labels.icon',                stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',           stylers: [{ color: '#8b91a0' }] },
  { elementType: 'labels.text.stroke',         stylers: [{ color: '#1b1b1d' }] },
  { featureType: 'administrative',             elementType: 'geometry',          stylers: [{ color: '#717786' }] },
  { featureType: 'administrative.locality',   elementType: 'labels.text.fill',  stylers: [{ color: '#c1c6d7' }] },
  { featureType: 'poi',                        elementType: 'labels.text.fill',  stylers: [{ color: '#8b91a0' }] },
  { featureType: 'poi.park',                   elementType: 'geometry',          stylers: [{ color: '#002107' }] },
  { featureType: 'poi.park',                   elementType: 'labels.text.fill',  stylers: [{ color: '#53e16f' }] },
  { featureType: 'road',                       elementType: 'geometry.fill',     stylers: [{ color: '#2c3140' }] },
  { featureType: 'road',                       elementType: 'labels.text.fill',  stylers: [{ color: '#8b91a0' }] },
  { featureType: 'road.arterial',              elementType: 'geometry.fill',     stylers: [{ color: '#363c4e' }] },
  { featureType: 'road.highway',               elementType: 'geometry.fill',     stylers: [{ color: '#004493' }] },
  { featureType: 'water',                      elementType: 'geometry',          stylers: [{ color: '#001a41' }] },
  { featureType: 'water',                      elementType: 'labels.text.fill',  stylers: [{ color: '#adc6ff' }] },
];

const WEB_MARKER_POSITIONS: Record<number, { top: DimensionValue; left: DimensionValue }> = {
  1: { top: '35%', left: '30%' },
  2: { top: '48%', left: '55%' },
  3: { top: '25%', left: '70%' },
};

const WEB_TAB_BAR_HEIGHT = 72;

interface MapScreenProps {
  kioscoId?: number;
}

export const MapScreen: React.FC<MapScreenProps> = ({ kioscoId: propKioscoId }) => {
  const theme      = useTheme();
  const colorScheme = useColorScheme();
  const isDark     = colorScheme === 'dark';

  let routeParams: { kioscoId?: string } | undefined;
  try {
    routeParams = useLocalSearchParams<{ kioscoId?: string }>();
  } catch { /* no navigation context */ }

  const effectiveKioscoId = propKioscoId ?? (routeParams?.kioscoId ? Number(routeParams.kioscoId) : undefined);

  const [prevKioscoId, setPrevKioscoId] = useState<number | undefined>(effectiveKioscoId);
  const [selectedKiosco, setSelectedKiosco] = useState<number | null>(effectiveKioscoId ?? null);

  // Corregido: Sincronización segura de estados para evitar bucles infinitos en el render
  useEffect(() => {
    if (effectiveKioscoId !== prevKioscoId) {
      setPrevKioscoId(effectiveKioscoId);
      setSelectedKiosco(effectiveKioscoId ?? null);
    }
  }, [effectiveKioscoId, prevKioscoId]);

  const mapRef   = useRef<any>(null);
  const [bounceAnim] = useState(() => new Animated.Value(0));

  const initialRegion = {
    latitude: -28.469, longitude: -65.785,
    latitudeDelta: 0.03, longitudeDelta: 0.03,
  };

  useEffect(() => {
    if (selectedKiosco !== null) {
      if (Platform.OS !== 'web') {
        const k = KIOSCOS_DATA.find(k => k.id === selectedKiosco);
        if (k && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude:      k.lat - 0.003,
            longitude:     k.lng,
            latitudeDelta:  0.015,
            longitudeDelta: 0.015,
          }, 1000);
        }
      }
      bounceAnim.setValue(0);
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -8, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(bounceAnim, { toValue:  0, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      bounceAnim.setValue(0);
    }
  }, [selectedKiosco, bounceAnim]);

  const selectedData = KIOSCOS_DATA.find(k => k.id === selectedKiosco);

  const renderMarker = (isSelected: boolean) => (
    <View style={styles.markerContainer}>
      {isSelected ? (
        <View style={styles.selectedMarkerWrapper}>
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <View style={[styles.selectedCircle, { backgroundColor: theme.secondary }]}>
              <MaterialIcons name="storefront" size={18} color="#FFF" />
            </View>
            <View style={[styles.triangle, { borderTopColor: theme.secondary }]} />
          </Animated.View>
          <View style={styles.groundShadow} />
        </View>
      ) : (
        <Ionicons name="location" size={36} color={theme.primary} />
      )}
    </View>
  );

  const renderCard = (bottomInset: number) =>
    selectedData ? (
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.surface,
            borderColor:     theme.outlineVariant + '44',
            paddingBottom:   20 + bottomInset,
          },
        ]}
      >
        <View style={[styles.dragHandle, { backgroundColor: theme.outlineVariant + '66' }]} />

        <ThemedText type="headlineMd" style={styles.cardTitle}>
          {selectedData.nombre}
        </ThemedText>

        <View style={styles.cardContent}>
          <View style={styles.detailRow}>
            <Ionicons name="location-sharp" size={18} color={theme.onSurfaceVariant} />
            <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant, flex: 1 }}>
              {selectedData.direccion}
            </ThemedText>
          </View>
          {selectedData.horario && (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={18} color={theme.onSurfaceVariant} />
              <ThemedText type="bodyMd" style={{ color: theme.onSurfaceVariant }}>
                Abierto de {selectedData.horario}
              </ThemedText>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => Alert.alert('Cómo llegar', `Abriendo navegación para ${selectedData.nombre}...`)}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={18} color={theme.onPrimary} />
          <ThemedText type="labelMd" style={[styles.actionButtonText, { color: theme.onPrimary }]}>
            Cómo llegar
          </ThemedText>
        </TouchableOpacity>
      </View>
    ) : null;

  if (Platform.OS === 'web') {
    const mapBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK0B5t9LWiBl-JsLUl8B7PLt0tegY0teF893YMYXmEQkMlpgXt_ThmB9WyRUEf_i3EFWOO9BcwtkH5QXOgs-z8O08xKx-qCN9BwvXN97vJsXJR-spsm07i6jHoX4qDIZ_IV8dUEpT76IQs-DX_fn6ymLkVjPGzdJcR0FOXRCXx6TIvSEqoDnmMl1cKl2lyWmmLponitpRnfwCB0G-3xZv6uXlxGXnu_QKOTTz3O0P18IG5zyamfpE93ZUZZ0_EidB-ZImNzx5gGaa_';

    return (
      <ThemedView style={styles.container}>
        <AppHeader title="FiguMatch" showActions />

        <View style={styles.webMapWrapper}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedKiosco(null)}>
            <Image
              source={{ uri: mapBg }}
              style={[styles.mapImage, isDark && { opacity: 0.55 }]}
              resizeMode="cover"
            />
            {isDark && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(17, 19, 24, 0.72)' },
                ]}
              />
            )}
          </Pressable>

          {KIOSCOS_DATA.map(kiosco => {
            const pos = WEB_MARKER_POSITIONS[kiosco.id] ?? { top: '50%', left: '50%' };
            return (
              <TouchableOpacity
                key={kiosco.id}
                style={[styles.markerTouch, { top: pos.top, left: pos.left }]}
                onPress={() => setSelectedKiosco(kiosco.id)}
              >
                {renderMarker(kiosco.id === selectedKiosco)}
              </TouchableOpacity>
            );
          })}

          {renderCard(WEB_TAB_BAR_HEIGHT)}
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="FiguMatch" showActions />

      <View style={[styles.nativeMapWrapper, { backgroundColor: theme.background }]}>
        {MapView && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            onPress={() => setSelectedKiosco(null)}
            customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
          >
            {KIOSCOS_DATA.map(kiosco =>
              Marker ? (
                <Marker
                  key={kiosco.id}
                  coordinate={{ latitude: kiosco.lat, longitude: kiosco.lng }}
                  onPress={(e: any) => { e.stopPropagation(); setSelectedKiosco(kiosco.id); }}
                >
                  {renderMarker(kiosco.id === selectedKiosco)}
                </Marker>
              ) : null
            )}
          </MapView>
        )}

        {renderCard(0)}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webMapWrapper: {
    flex: 1,
    position: 'relative',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', borderLeftWidth: 1, borderRightWidth: 1 },
      default: {},
    }),
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  nativeMapWrapper: {
    flex: 1,
    position: 'relative',
  },
  markerTouch: {
    position: 'absolute',
    zIndex: 10,
    transform: [{ translateX: -30 }, { translateY: -70 }],
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
  },
  selectedMarkerWrapper: {
    alignItems: 'center',
  },
  selectedCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web:     { boxShadow: '0px 4px 12px rgba(0,0,0,0.3)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
    }),
    elevation: 6,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth:  6,
    borderLeftColor:  'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth:   8,
    alignSelf: 'center',
    marginTop: -1,
  },
  groundShadow: {
    width: 14,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 7,
    marginTop: 2,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    zIndex: 20,
    ...Platform.select({
      web:     { boxShadow: '0px -4px 20px rgba(0,0,0,0.10)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16 },
    }),
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  cardContent: {
    gap: 8,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      web:     { boxShadow: '0px 2px 6px rgba(0,0,0,0.12)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
    }),
    elevation: 3,
  },
  actionButtonText: {
    fontWeight: '600',
  },
});