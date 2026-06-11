import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import AppHeader from '@/components/AppHeader';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spacing } from '@/constants/theme';
import { CardMatch } from '@/components/CardMatch';
import { Button } from '@/components/Button';

// Assets
const cloudLightningIcon = require('../../assets/images/matches/Cloud-Lightning-Icon.png');
const emptySearchIcon = require('../../assets/images/matches/img-busqueda-vacia.png');

interface MatchInfo {
  id: string;
  userName: string;
  avatarUrl: string;
  reputation: number;
  tradesCount: number;
  offeredFigurita: { number: number; name: string };
  requestedFigurita: { number: number; name: string };
  distance: string;
  kioscoId: number;
  kioscoNombre: string;
  kioscoDireccion: string;
}

const DUMMY_MATCHES: MatchInfo[] = [
  {
    id: '1',
    userName: 'María',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1tl8OM8e9-ifhgYdCB4f6DE3LPOq3CwIzQjuWA_4sQt5B-GXbOY55dOzlr089DewzxLfVdCr6V-srgOn7vWr9gLC-I5fYXAF-lHwLJ-E56rD6crSSrsPj6zrsKooxLQuHzaUBCuzeySyBCX5SR1wY3Y_PtKbJ6TGVq_4GEmn3tQTZaq9IKGcWrhA5jKkuq1Pjwrb1uNcKPEh2JNfjt6PF3pEGOKKttRA0G-dU66zn_0tlciHWmtgoFJJfVNUvN6eHU5aIihQkHKfs',
    reputation: 4,
    tradesCount: 12,
    offeredFigurita: { number: 200, name: 'Lionel Messi' },
    requestedFigurita: { number: 89, name: 'Julián Álvarez' },
    distance: 'Kiosco a 300 m',
    kioscoId: 1,
    kioscoNombre: 'Kiosco Central',
    kioscoDireccion: 'San Martín 500',
  },
  {
    id: '2',
    userName: 'Juan',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD5VQKt0MBiJBA4W84bu5DeO7s9WezgwYvvdvDy28GuoQN_MRgyNnlSvcZ0x1zJPzsvC93rpT6wYLqcfQEGlm31Lv2k9unLk093zd481hSPQfMGXrB3GwCA0eyRFFRXvv2U9yc5FeQ9_L20GKmnnW7ZCeSraDkr0asJSaM-1Ttl-hhPjzDMQA9tlhwea7d4JF-WQ96mSMmlRDAkfiWM4OI1pLej8QSy4wsyNt4er93Irk8Bz7y-f52P8ijfwUd8Y0ZJLWizVyQJlPj',
    reputation: 5,
    tradesCount: 8,
    offeredFigurita: { number: 12, name: 'Emiliano Martínez' },
    requestedFigurita: { number: 10, name: 'Lautaro Martínez' },
    distance: 'Kiosco a 450 m',
    kioscoId: 2,
    kioscoNombre: 'Parada Sur',
    kioscoDireccion: 'Rivadavia 1200',
  },
  {
    id: '3',
    userName: 'Elena',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASq3tExIEwfq1hvU-vk-WlVoKg7KGjMWVh6aLb_zdT8Ndr0_vAXGOUjxM9NlQ4_Yb4dGd7yQoAHClbSggRwXA2uhsJc04O7eLrgHua1UC9HhjESGCUJbTJYFXsJWGTnvNONhPsz5vyfHyh9I20dJwLr9NlpVlxk76ARAe_AIRZwxxDgJk0gsjWYwDkGkJQ61yMCW824IeVMFQZfTu7l10LiCLV3knVKiWKoEnvcfnw7ScsnOAja0lu3pZTVkCwJ55EgZYQk9sF-uHY',
    reputation: 3,
    tradesCount: 5,
    offeredFigurita: { number: 158, name: 'Rodrigo De Paul' },
    requestedFigurita: { number: 200, name: 'Lionel Messi' },
    distance: 'Kiosco a 1.2 km',
    kioscoId: 3,
    kioscoNombre: 'Kiosquito Norte',
    kioscoDireccion: 'Belgrano 250',
  },
];

export default function MatchesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();

  // Screen states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todas' | 'ofrecidas' | 'buscadas'>('todas');

  // Modal navigation states
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchInfo | null>(null);
  const [modalView, setModalView] = useState<'detail' | 'code'>('detail');
  const [generatedCode, setGeneratedCode] = useState('');

  // Pulse animation values for loading state
  const [ring1Scale] = useState(() => new Animated.Value(1));
  const [ring1Opacity] = useState(() => new Animated.Value(0.5));
  const [ring2Scale] = useState(() => new Animated.Value(1));
  const [ring2Opacity] = useState(() => new Animated.Value(0.3));

  const loadMatches = useCallback(() => {
    setLoading(true);
    setError(false);
    
    // Simulate API retrieval delay
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Pulse ring animation loop
  useEffect(() => {
    if (loading) {
      const ring1 = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ring1Scale, { toValue: 2.2, duration: 2000, useNativeDriver: true }),
            Animated.timing(ring1Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ring1Opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
            Animated.timing(ring1Opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );

      const ring2 = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ring2Scale, { toValue: 2.8, duration: 2500, useNativeDriver: true }),
            Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ring2Opacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
            Animated.timing(ring2Opacity, { toValue: 0.3, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );

      ring1.start();
      ring2.start();

      return () => {
        ring1.stop();
        ring2.stop();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleCardPress = (match: MatchInfo) => {
    setSelectedMatch(match);
    setModalView('detail');
    setShowModal(true);
  };

  const handleAcceptMatch = () => {
    // Generate a simulated unique code
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const hexPart = Math.random().toString(16).substr(2, 3).toUpperCase();
    const code = `FM-${randomSuffix}-${hexPart}B`;
    
    setGeneratedCode(code);
    setModalView('code');
  };

  const handleShare = async () => {
    if (!generatedCode) return;
    try {
      await Share.share({
        message: `Mi código de intercambio en FiguMatch: ${generatedCode}`,
      });
    } catch (err) {
      console.log('Error sharing code:', err);
    }
  };

  const handleGoToMap = () => {
    if (!selectedMatch) return;
    setShowModal(false);
    // Push map screen route with kioscoId param
    router.push({
      pathname: '/kioscos',
      params: { kioscoId: String(selectedMatch.kioscoId) }
    });
  };



  // Filter matches based on search query and active filter pill
  const filteredMatches = DUMMY_MATCHES.filter(match => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      match.userName.toLowerCase().includes(query) ||
      match.offeredFigurita.name.toLowerCase().includes(query) ||
      match.requestedFigurita.name.toLowerCase().includes(query) ||
      match.offeredFigurita.number.toString() === query ||
      match.requestedFigurita.number.toString() === query;

    if (!matchesQuery) return false;

    // 2. Filter Pills
    if (activeFilter === 'ofrecidas') {
      // Offers matching user needs (María offers Messi etc.)
      return true; 
    }
    if (activeFilter === 'buscadas') {
      // Seeks matching user duplicates
      return true;
    }

    return true;
  });

  // Render sub-views depending on screen states
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <AppHeader showActions={false} />

        <View style={styles.loadingCenterContent}>
          {/* Pulsing rings around the activity indicator */}
          <View style={styles.animationCircleWrapper}>
            <Animated.View 
              style={[
                styles.pulsingRing, 
                { 
                  borderColor: theme.primary,
                  transform: [{ scale: ring1Scale }], 
                  opacity: ring1Opacity 
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.pulsingRing, 
                { 
                  borderColor: theme.primary,
                  transform: [{ scale: ring2Scale }], 
                  opacity: ring2Opacity 
                }
              ]} 
            />
            <ActivityIndicator size="large" color={theme.primary} style={styles.spinner} />
          </View>
          
          <Text style={[styles.loadingText, { color: theme.onSurfaceVariant }]}>
            Buscando las mejores coincidencias...
          </Text>

          {/* Decorative placeholder */}
          <View style={styles.loadingDecor}>
            <View style={[styles.decorCard, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainerLow }]}>
              <Ionicons name="copy" size={24} color={theme.outline} />
            </View>
            <Ionicons name="swap-horizontal" size={20} color={theme.outline} style={styles.decorArrow} />
            <View style={[styles.decorCard, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainerLow }]}>
              <Ionicons name="copy" size={24} color={theme.outline} />
            </View>
          </View>
        </View>
      </ThemedView>
    );
  }

  if (error && !loading) {
    return (
      <ThemedView style={styles.errorContainer}>
        <AppHeader showActions={false} />

        <View style={styles.errorCenterContent}>
          <Image source={cloudLightningIcon} style={styles.errorImg} />
          <Text style={[styles.errorText, { color: theme.onSurfaceVariant }]}>
            Sin conexión a internet. Revisá tu red.
          </Text>
          <View style={styles.errorBtnWrapper}>
            <Button title="Reintentar" onPress={loadMatches} variant="primary" />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.titleText, { color: theme.onSurface }]}>Coincidencias</Text>
          <Text style={[styles.subtitleText, { color: theme.onSurfaceVariant }]}>
            {filteredMatches.length} {filteredMatches.length === 1 ? 'match encontrado' : 'matches encontrados'} cerca de vos
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.outlineVariant }]}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.onSurface }]}
            placeholder="Buscar por número o nombre"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters Row */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <TouchableOpacity 
              style={[
                styles.filterPill, 
                activeFilter === 'todas' ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceContainerHigh }
              ]}
              onPress={() => setActiveFilter('todas')}
            >
              <Text style={[styles.filterPillText, activeFilter === 'todas' ? { color: theme.onPrimary } : { color: theme.onSurfaceVariant }]}>
                Todas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterPill, 
                activeFilter === 'ofrecidas' ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceContainerHigh }
              ]}
              onPress={() => setActiveFilter('ofrecidas')}
            >
              <Text style={[styles.filterPillText, activeFilter === 'ofrecidas' ? { color: theme.onPrimary } : { color: theme.onSurfaceVariant }]}>
                Ofrecidas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.filterPill, 
                activeFilter === 'buscadas' ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceContainerHigh }
              ]}
              onPress={() => setActiveFilter('buscadas')}
            >
              <Text style={[styles.filterPillText, activeFilter === 'buscadas' ? { color: theme.onPrimary } : { color: theme.onSurfaceVariant }]}>
                Buscadas
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Empty State View */}
        {filteredMatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={emptySearchIcon} style={styles.emptyImg} />
            <Text style={[styles.emptyTitle, { color: theme.onSurface }]}>Ningún match coincide con tu búsqueda</Text>
            <Text style={[styles.emptySubtitle, { color: theme.onSurfaceVariant }]}>Probá con otros números o nombres.</Text>
            <TouchableOpacity 
              style={[styles.clearFilterBtn, { borderColor: theme.primary }]}
              onPress={() => setSearchQuery('')}
            >
              <Text style={[styles.clearFilterBtnText, { color: theme.primary }]}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Results list */
          <View style={styles.listContainer}>
            {filteredMatches.map(match => (
              <CardMatch
                key={match.id}
                userName={match.userName}
                avatarUrl={match.avatarUrl}
                reputation={match.reputation}
                tradesCount={match.tradesCount}
                offeredFigurita={match.offeredFigurita}
                requestedFigurita={match.requestedFigurita}
                distance={match.distance}
                onPress={() => handleCardPress(match)}
                style={styles.cardSpacing}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Full Screen Detail/Code Modal Navigation */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowModal(false)}
      >
        <ThemedView style={styles.modalRoot}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderColor: theme.outlineVariant + '33', borderBottomWidth: 1 }]}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalBackBtn}>
              <Ionicons name="chevron-back" size={24} color={theme.primary} />
              <Text style={[styles.modalBackText, { color: theme.primary }]}>Volver</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitleText, { color: theme.onSurface }]}>
              {modalView === 'detail' ? 'Detalle del Match' : 'Código de intercambio'}
            </Text>
            <View style={{ width: 64 }} />
          </View>

          {/* Modal Content */}
          {modalView === 'detail' && selectedMatch && (
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.detailCard}>
                <Image source={{ uri: selectedMatch.avatarUrl }} style={styles.detailAvatar} />
                <Text style={[styles.detailUserName, { color: theme.onSurface }]}>{selectedMatch.userName}</Text>
                
                {/* Stars */}
                <View style={styles.detailRatingRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Text 
                      key={star} 
                      style={[
                        styles.detailStar, 
                        { color: star <= selectedMatch.reputation ? '#FF9500' : '#C7C7CC' }
                      ]}
                    >
                      ★
                    </Text>
                  ))}
                  <Text style={[styles.detailTradesCount, { color: theme.onSurfaceVariant }]}>({selectedMatch.tradesCount} canjes exitosos)</Text>
                </View>

                {/* Match Exchange Box */}
                <View style={[styles.swapContainer, { backgroundColor: theme.surfaceContainerLow, borderColor: theme.outlineVariant }]}>
                  {/* Offered Column */}
                  <View style={styles.swapColumn}>
                    <View style={[styles.swapTag, { backgroundColor: scheme === 'dark' ? 'rgba(83, 225, 111, 0.15)' : 'rgba(52, 199, 89, 0.1)' }]}>
                      <Text style={[styles.swapTagText, { color: scheme === 'dark' ? '#53e16f' : '#34C759' }]}>Ofrece</Text>
                    </View>
                    <Text style={[styles.swapCardNumber, { color: theme.onSurface }]}>Nº {selectedMatch.offeredFigurita.number}</Text>
                    <Text style={[styles.swapCardName, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                      {selectedMatch.offeredFigurita.name}
                    </Text>
                  </View>

                  {/* Divider Icon */}
                  <View style={styles.swapDivider}>
                    <Ionicons name="swap-horizontal" size={24} color={theme.primary} />
                  </View>

                  {/* Requested Column */}
                  <View style={styles.swapColumn}>
                    <View style={[styles.swapTag, { backgroundColor: scheme === 'dark' ? 'rgba(255, 184, 116, 0.15)' : 'rgba(255, 149, 0, 0.1)' }]}>
                      <Text style={[styles.swapTagText, { color: scheme === 'dark' ? '#ffb874' : '#FF9500' }]}>Busca</Text>
                    </View>
                    <Text style={[styles.swapCardNumber, { color: theme.onSurface }]}>Nº {selectedMatch.requestedFigurita.number}</Text>
                    <Text style={[styles.swapCardName, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                      {selectedMatch.requestedFigurita.name}
                    </Text>
                  </View>
                </View>

                {/* Exchange Location info */}
                <View style={[styles.locationInfoBox, { backgroundColor: theme.surfaceContainerLow }]}>
                  <Ionicons name="storefront" size={22} color={theme.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.locationLabel, { color: theme.primary }]}>Punto de encuentro asignado</Text>
                    <Text style={[styles.locationValName, { color: theme.onSurface }]}>{selectedMatch.kioscoNombre}</Text>
                    <Text style={[styles.locationValAddress, { color: theme.onSurfaceVariant }]}>{selectedMatch.kioscoDireccion}</Text>
                  </View>
                </View>

                <Text style={[styles.disclaimerText, { color: theme.onSurfaceVariant }]}>
                  Al aceptar, se reservará un casillero seguro en este kiosco. Tenés 24 horas para entregar tu figurita.
                </Text>
              </View>

              <View style={styles.modalBtnContainer}>
                <Button title="Aceptar Match" onPress={handleAcceptMatch} variant="primary" />
              </View>
            </ScrollView>
          )}

          {modalView === 'code' && selectedMatch && (
            <ScrollView contentContainerStyle={styles.codeScrollContainer}>
              {/* QR Code */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={generatedCode}
                  size={200}
                  color="#1C1C1E"
                  backgroundColor="#FFFFFF"
                />
              </View>

              {/* Code Box */}
              <Text style={[styles.codeTextBox, { color: theme.onSurface, backgroundColor: theme.surfaceContainer }]}>{generatedCode}</Text>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionStep}>
                  <View style={[styles.stepNumberBg, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.stepNumberText, { color: theme.onPrimary }]}>1</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: theme.onSurfaceVariant }]}>
                    Guardá tu figurita <Text style={[styles.boldText, { color: theme.onSurface }]}>Nº {selectedMatch.requestedFigurita.number}</Text> en un sobre y escribí el código <Text style={[styles.boldText, { color: theme.onSurface }]}>{generatedCode}</Text> afuera.
                  </Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={[styles.stepNumberBg, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.stepNumberText, { color: theme.onPrimary }]}>2</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: theme.onSurfaceVariant }]}>
                    Llevalo a <Text style={[styles.boldText, { color: theme.onSurface }]}>{selectedMatch.kioscoNombre}</Text> ({selectedMatch.kioscoDireccion}) antes de que cierre hoy.
                  </Text>
                </View>

                <View style={styles.instructionStep}>
                  <View style={[styles.stepNumberBg, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.stepNumberText, { color: theme.onPrimary }]}>3</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: theme.onSurfaceVariant }]}>
                    <Text style={[styles.boldText, { color: theme.onSurface }]}>{selectedMatch.userName}</Text> dejará la <Text style={[styles.boldText, { color: theme.onSurface }]}>Nº {selectedMatch.offeredFigurita.number}</Text>. Te avisaremos para que pases a retirarla.
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.codeButtonsContainer}>
                <Button
                  title="Ver en el mapa"
                  variant="secondary"
                  onPress={handleGoToMap}
                />
                <View style={{ height: spacing.md }} />
                <Button
                  title="Compartir código"
                  variant="secondary"
                  onPress={handleShare}
                />
              </View>
            </ScrollView>
          )}
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: 110,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#636366',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  filtersWrapper: {
    marginBottom: spacing.lg,
  },
  filtersScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    gap: spacing.md,
  },
  cardSpacing: {
    marginBottom: 2,
  },

  // Loading view styles
  loadingContainer: {
    flex: 1,
  },
  loadingCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  animationCircleWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  pulsingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  spinner: {
    zIndex: 10,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 22,
  },
  loadingDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
  decorCard: {
    width: 60,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorArrow: {
    marginHorizontal: 16,
  },

  // Error state styles
  errorContainer: {
    flex: 1,
  },
  errorCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  errorImg: {
    width: 90,
    height: 90,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorBtnWrapper: {
    width: '100%',
    maxWidth: 260,
  },

  // Empty Search styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyImg: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFilterBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearFilterBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal navigation styles
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: { paddingTop: 20, height: 76 },
      android: { paddingTop: 0 },
    }),
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    width: 80,
  },
  modalBackText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 2,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalScroll: {
    padding: spacing.md,
    alignItems: 'center',
  },
  detailCard: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  detailUserName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  detailRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailStar: {
    fontSize: 16,
    marginHorizontal: 1,
  },
  detailTradesCount: {
    fontSize: 13,
    color: '#636366',
    marginLeft: 6,
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 24,
  },
  swapColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  swapTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  swapTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  swapCardNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  swapCardName: {
    fontSize: 14,
    color: '#636366',
    fontWeight: '500',
    textAlign: 'center',
  },
  swapDivider: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  locationInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  locationValName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  locationValAddress: {
    fontSize: 13,
    color: '#636366',
    marginTop: 1,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  modalBtnContainer: {
    width: '100%',
    maxWidth: 320,
    paddingBottom: 40,
  },

  // Code View inside modal styles
  codeScrollContainer: {
    padding: spacing.md,
    alignItems: 'center',
    paddingBottom: 40,
  },
  qrContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  codeTextBox: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  instructionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: spacing.xl,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumberBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#636366',
    lineHeight: 22,
  },
  boldText: {
    color: '#1C1C1E',
    fontWeight: 'bold',
  },
  codeButtonsContainer: {
    width: '100%',
    maxWidth: 320,
  },
});
