import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Share, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { StatusScreen } from '../components/StatusScreen';
import { colors } from '../constants/theme';
import { CodeScreenParams } from '../types';

type CodeScreenRouteProp = RouteProp<{ params: CodeScreenParams }, 'params'>;

export const CodeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CodeScreenRouteProp>();

  const params = route.params;

  if (!params) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusScreen
          type="error"
          title="Error"
          description="No se encontraron los datos del intercambio"
          actionLabel="Volver"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const {
    codigo,
    kioscoNombre,
    kioscoDireccion,
    kioscoId,
    figuritaEntregar,
    figuritaRecibir,
    otroUsuario
  } = params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mi código de intercambio FiguMatch: ${codigo}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewMap = () => {
    navigation.goBack();
    // Pequeño timeout para permitir que el modal se cierre antes de navegar al tab
    setTimeout(() => {
      navigation.navigate('KioscosTab', {
        screen: 'Map',
        params: { kioscoId }
      });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código de intercambio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{codigo}</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={codigo}
            size={200}
          />
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            1. Prepará tu figurita Nº {figuritaEntregar.number} en un sobre con el código {codigo}.
          </Text>
          <Text style={styles.instructionText}>
            2. Llevalo a {kioscoNombre} ({kioscoDireccion}) antes de las 20 h.
          </Text>
          <Text style={styles.instructionText}>
            3. {otroUsuario || 'La otra persona'} dejará la Nº {figuritaRecibir.number}. Podés retirarla desde mañana.
          </Text>
        </View>

        <Text style={styles.infoText}>
          El Kiosco {kioscoNombre} es parte de la red FiguMatch y ya recibió tu solicitud de intercambio.
        </Text>

        <View style={styles.buttonsContainer}>
          <Button
            title="Compartir código"
            variant="secondary"
            onPress={handleShare}
          />
          <Button
            title="Ver en el mapa"
            variant="secondary"
            onPress={handleViewMap}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    gap: 24,
  },
  codeContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  instructionsContainer: {
    width: '100%',
    gap: 12,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginTop: 8,
  },
});
