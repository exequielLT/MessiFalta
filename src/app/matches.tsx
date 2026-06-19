import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { CardMatch } from '@/components/CardMatch';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Assets
const cloudLightningIcon = require('../../assets/images/matches/Cloud-Lightning-Icon.png');
const emptySearchIcon = require('../../assets/images/matches/img-busqueda-vacia.png');

import { useAuth } from '@/context/AuthContext';
import { matchesService, MatchInfo } from '@/services/matchesService';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Pulse animation values for loading state
  const [ring1Scale] = useState(() => new Animated.Value(1));
  const [ring1Opacity] = useState(() => new Animated.Value(0.5));
  const [ring2Scale] = useState(() => new Animated.Value(1));
  const [ring2Opacity] = useState(() => new Animated.Value(0.3));

  const { user } = useAuth() as any;
  const [matches, setMatches] = useState<any[]>([]);

  const loadMatches = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(false);
    
    try {
      const data = await matchesService.getMatches(user.id);
      setMatches(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar matches al montar (useFocusEffect podría agregarse cuando haya datos reales)
  useEffect(() => {
    loadMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMatches]);

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
    setShowConfirmModal(true);
  };

  const handleConfirmExchange = async () => {
    if (!selectedMatch) return;
    setShowConfirmModal(false);
    
    // Generate a simulated unique code in format FIG-XXXX-XX (e.g. FIG-8472-K9)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randomChar1 = chars.charAt(Math.floor(Math.random() * chars.length));
    const randomChar2 = chars.charAt(Math.floor(Math.random() * chars.length));
    const code = `FIG-${randomNum}-${randomChar1}${randomChar2}`;
    
    const success = await matchesService.confirmExchange(
      selectedMatch.figuritaMiaId,
      selectedMatch.figuritaAjenaId,
      selectedMatch.kioscoId,
      code
    );

    if (success) {
      setGeneratedCode(code);
      setModalView('code');
      // Recargar la lista de matches para ocultar el aceptado
      loadMatches();
    } else {
      console.error('No se pudo guardar el intercambio en la base de datos');
      alert('Error al guardar el intercambio');
    }
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



  const filteredMatches = matches.filter(match => {
    // 1. Búsqueda por texto — número usa .includes() para búsqueda parcial
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      match.userName.toLowerCase().includes(query) ||
      match.offeredFigurita.name.toLowerCase().includes(query) ||
      match.requestedFigurita.name.toLowerCase().includes(query) ||
      match.offeredFigurita.number.toString().includes(query) ||
      match.requestedFigurita.number.toString().includes(query);

    if (!matchesQuery) return false;

    // TODO: Implementar filtro por "ofrecidas" y "buscadas" cuando haya estructura de datos completa
    // if (activeFilter === 'ofrecidas') { ... }
    // if (activeFilter === 'buscadas') { ... }

    return true; // 'todas'
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
              <Ionicons name="arrow-back" size={24} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitleText, { color: theme.onSurface }]}>
              {modalView === 'detail' ? 'Detalle de intercambio' : 'Código de Intercambio'}
            </Text>
            {modalView === 'code' ? (
              <TouchableOpacity 
                onPress={() => alert('Para realizar el intercambio, guardá tu figurita repetida en un sobre, escribí el código en el exterior y depositalo en el kiosco asignado. Una vez que ambos dejen su figurita, podrán retirar la suya.')} 
                style={styles.modalHelpBtn}
              >
                <Ionicons name="help-circle-outline" size={24} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40, marginRight: 8 }} />
            )}
          </View>

          {/* Modal Content */}
          {modalView === 'detail' && selectedMatch && (
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* User Info Card */}
              <View style={[styles.userInfoCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }]}>
                <View style={styles.userInfoHeader}>
                  <Image source={{ uri: selectedMatch.avatarUrl }} style={styles.userInfoAvatar} />
                  <View style={styles.userInfoCol}>
                    <Text style={[styles.userInfoName, { color: theme.onSurface }]}>
                      {selectedMatch.userName} - {selectedMatch.barrio}
                    </Text>
                    <View style={styles.userInfoStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Text 
                          key={star} 
                          style={[
                            styles.userInfoStar, 
                            { color: star <= selectedMatch.reputation ? '#FF9500' : '#C7C7CC' }
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={[styles.userInfoTrades, { color: theme.onSurfaceVariant }]}>
                  {selectedMatch.tradesCount} intercambios exitosos
                </Text>
              </View>

              {/* Proposed Exchange Section */}
              <View style={styles.proposedSection}>
                <Text style={[styles.proposedTitle, { color: theme.onSurface }]}>Intercambio propuesto</Text>
                
                <View style={styles.proposedCardsRow}>
                  {/* Left Card: Vos entregás */}
                  <View style={[styles.stickerCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }]}>
                    <View style={[styles.stickerChip, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                      <Text style={[styles.stickerChipText, { color: '#FF9500' }]}>Repetida</Text>
                    </View>
                    <Text style={[styles.stickerLabel, { color: theme.onSurfaceVariant }]}>Vos entregás</Text>
                    
                    <View style={[styles.stickerImgContainer, { backgroundColor: theme.surfaceContainerHigh }]}>
                      {selectedMatch.requestedFigurita.imageUrl ? (
                        <Image source={{ uri: selectedMatch.requestedFigurita.imageUrl }} style={styles.stickerImage} />
                      ) : (
                        <View style={[styles.stickerFallback, { backgroundColor: theme.primary }]}>
                          <Ionicons name="football" size={24} color="#FFFFFF" />
                          <Text style={styles.stickerFallbackText}>FIGUMATCH</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[styles.stickerNameText, { color: theme.onSurface }]}>
                      Nº {selectedMatch.requestedFigurita.number}{'\n'}
                      {selectedMatch.requestedFigurita.name}
                    </Text>
                  </View>

                  {/* Swap Divider Circle */}
                  <View style={[styles.swapDividerCircle, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}>
                    <Ionicons name="swap-horizontal" size={20} color={theme.outline} />
                  </View>

                  {/* Right Card: Vos recibís */}
                  <View style={[styles.stickerCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }]}>
                    <View style={[styles.stickerChip, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                      <Text style={[styles.stickerChipText, { color: '#34C759' }]}>Faltante</Text>
                    </View>
                    <Text style={[styles.stickerLabel, { color: theme.onSurfaceVariant }]}>Vos recibís</Text>
                    
                    <View style={[styles.stickerImgContainer, { backgroundColor: theme.surfaceContainerHigh }]}>
                      {selectedMatch.offeredFigurita.imageUrl ? (
                        <Image source={{ uri: selectedMatch.offeredFigurita.imageUrl }} style={styles.stickerImage} />
                      ) : (
                        <View style={[styles.stickerFallback, { backgroundColor: theme.primary }]}>
                          <Ionicons name="football" size={24} color="#FFFFFF" />
                          <Text style={styles.stickerFallbackText}>FIGUMATCH</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[styles.stickerNameText, { color: theme.onSurface }]}>
                      Nº {selectedMatch.offeredFigurita.number}{'\n'}
                      {selectedMatch.offeredFigurita.name}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Spacer */}
              <View style={{ height: 32 }} />

              {/* Bottom Actions */}
              <View style={styles.detailBottomWrapper}>
                <TouchableOpacity 
                  style={[styles.acceptBtn, { backgroundColor: '#34C759' }]}
                  onPress={handleAcceptMatch}
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptBtnText}>Aceptar intercambio</Text>
                </TouchableOpacity>
                <Text style={[styles.acceptInfoText, { color: theme.onSurfaceVariant }]}>
                  Al aceptar, se bloqueará el acuerdo y recibirás un código único.
                </Text>
              </View>
            </ScrollView>
          )}

          {modalView === 'code' && selectedMatch && (
            <ScrollView contentContainerStyle={styles.codeScrollContainer} showsVerticalScrollIndicator={false}>
              {/* Code & QR Card */}
              <View style={[styles.qrCardContainer, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }]}>
                {/* Share Button (absolute positioned) */}
                <TouchableOpacity 
                  style={[styles.cardShareBtn, { backgroundColor: theme.surfaceContainer }]}
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social-outline" size={20} color={theme.primary} />
                </TouchableOpacity>

                <Text style={[styles.qrCardLabel, { color: theme.onSurfaceVariant }]}>Tu código seguro</Text>
                
                {/* Code Box */}
                <View style={[styles.codeBoxContainer, { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant + '44' }]}>
                  <Text style={[styles.codeBoxText, { color: theme.onSurface }]}>{generatedCode}</Text>
                </View>

                {/* QR Code Container */}
                <View style={[styles.qrImgContainer, { borderColor: theme.outlineVariant }]}>
                  <QRCode
                    value={generatedCode}
                    size={180}
                    color="#1b1b1d"
                    backgroundColor="#ffffff"
                  />
                </View>

                <Text style={[styles.qrCardCaption, { color: theme.onSurfaceVariant }]}>
                  Mostrá este código en el punto de encuentro.
                </Text>
              </View>

              {/* Instructions Section */}
              <View style={styles.instructionsWrapper}>
                <Text style={[styles.instructionsTitle, { color: theme.onSurface }]}>
                  Instrucciones de entrega
                </Text>

                <View style={styles.instructionStepsList}>
                  {/* Step 1 */}
                  <View style={styles.instructionStepRow}>
                    <View style={[styles.stepCircle, { backgroundColor: theme.primaryContainer }]}>
                      <Text style={[styles.stepCircleText, { color: theme.onPrimaryContainer }]}>1</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.onSurfaceVariant }]}>
                      Prepará tu figurita <Text style={[styles.boldStepText, { color: theme.onSurface }]}>Nº {selectedMatch.requestedFigurita.number}</Text> en un sobre con el código <Text style={[styles.boldStepText, { color: theme.onSurface }]}>{generatedCode}</Text>.
                    </Text>
                  </View>

                  {/* Step 2 */}
                  <View style={styles.instructionStepRow}>
                    <View style={[styles.stepCircle, { backgroundColor: theme.primaryContainer }]}>
                      <Text style={[styles.stepCircleText, { color: theme.onPrimaryContainer }]}>2</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.onSurfaceVariant }]}>
                      Llevalo a <Text style={[styles.boldStepText, { color: theme.onSurface }]}>{selectedMatch.kioscoNombre}</Text> ({selectedMatch.kioscoDireccion}) antes de las 20 h.
                    </Text>
                  </View>

                  {/* Step 3 */}
                  <View style={styles.instructionStepRow}>
                    <View style={[styles.stepCircle, { backgroundColor: theme.primaryContainer }]}>
                      <Text style={[styles.stepCircleText, { color: theme.onPrimaryContainer }]}>3</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.onSurfaceVariant }]}>
                      <Text style={[styles.boldStepText, { color: theme.onSurface }]}>{selectedMatch.userName}</Text> dejará la <Text style={[styles.boldStepText, { color: theme.onSurface }]}>Nº {selectedMatch.offeredFigurita.number}</Text>. Podés retirarla desde mañana.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Spacer to push actions down proportionally */}
              <View style={{ height: 24 }} />

              {/* Bottom Actions */}
              <View style={styles.codeBottomWrapper}>
                <TouchableOpacity 
                  style={[styles.mapBtn, { borderColor: theme.primary }]}
                  onPress={handleGoToMap}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.mapBtnText, { color: theme.primary }]}>Ver en el mapa</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Confirmation Modal Overlay */}
          {showConfirmModal && (
            <View style={styles.confirmOverlay}>
              <View style={[styles.confirmCard, { backgroundColor: theme.surface }]}>
                {/* Info Icon */}
                <View style={[styles.confirmIconBg, { backgroundColor: theme.surfaceContainerHigh }]}>
                  <Ionicons name="information-circle" size={28} color={theme.primary} />
                </View>

                {/* Content */}
                <View style={styles.confirmContent}>
                  <Text style={[styles.confirmTitle, { color: theme.onSurface }]}>
                    ¿Confirmás el intercambio?
                  </Text>
                  <Text style={[styles.confirmDescription, { color: theme.onSurfaceVariant }]}>
                    Al aceptar, el acuerdo se bloquea y ya no podrá modificarse.
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.confirmActionsContainer}>
                  <TouchableOpacity 
                    style={[styles.confirmBtnConfirm, { backgroundColor: '#34C759' }]}
                    onPress={handleConfirmExchange}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmBtnConfirmText}>Sí, confirmar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.confirmBtnCancel, { backgroundColor: theme.surfaceContainerHigh }]}
                    onPress={() => setShowConfirmModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmBtnCancelText, { color: theme.onSurfaceVariant }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    flexGrow: 1,
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
    flexGrow: 1,
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
  // New modal header support
  modalHelpBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  // Detail Modal styles
  userInfoCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfoCol: {
    flex: 1,
  },
  userInfoName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userInfoStars: {
    flexDirection: 'row',
  },
  userInfoStar: {
    fontSize: 14,
    marginHorizontal: 0.5,
  },
  userInfoTrades: {
    fontSize: 16,
    fontWeight: '400',
  },
  proposedSection: {
    width: '100%',
    marginBottom: 24,
  },
  proposedTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  proposedCardsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
  },
  stickerCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginHorizontal: 4,
  },
  stickerChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 8,
  },
  stickerChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stickerLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  stickerImgContainer: {
    width: 80,
    height: 112,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stickerFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  stickerFallbackText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  stickerNameText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  swapDividerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailBottomWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  acceptBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  acceptInfoText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Confirmation Modal Overlay styles
  confirmOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    padding: 16,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmDescription: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmActionsContainer: {
    width: '100%',
    gap: 12,
  },
  confirmBtnConfirm: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtnCancel: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Code screen styles
  qrCardContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  cardShareBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  qrCardLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  codeBoxContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeBoxText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  qrImgContainer: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  qrCardCaption: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  instructionsWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionStepsList: {
    gap: 16,
  },
  instructionStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepCircleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  boldStepText: {
    fontWeight: '700',
  },
  codeBottomWrapper: {
    width: '100%',
    paddingBottom: 24,
  },
  mapBtn: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
