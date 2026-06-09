import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Share } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, borderRadius, fontSizes } from '../constants/theme';
import { Button } from '../components/Button';

export interface CodeScreenParams {
  codigo: string;
  kioscoNombre: string;
  kioscoDireccion: string;
  kioscoId: number;
  figuritaEntregar: { number: number; name?: string };
  figuritaRecibir: { number: number; name?: string };
  otroUsuario?: string;
}

type RootStackParamList = {
  Code: CodeScreenParams;
  Map: { kioscoId: string };
};

export const CodeScreen = () => {
  // Any para simplificar navegación si no está el stack completamente tipado globalmente
  const navigation = useNavigation<any>(); 
  const route = useRoute<RouteProp<RootStackParamList, 'Code'>>();
  const params = route.params;

  if (!params) return null; // Fallback temporal

  const {
    codigo,
    kioscoNombre,
    kioscoDireccion,
    kioscoId,
    figuritaEntregar,
    figuritaRecibir,
    otroUsuario,
  } = params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: codigo,
      });
    } catch (error) {
      console.log('Error compartiendo código', error);
    }
  };

  const handleGoToMap = () => {
    // casteamos a string porque MapScreen suele esperar id string
    navigation.navigate('Map', { kioscoId: String(kioscoId) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Volver'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código de intercambio</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={codigo}
            size={200}
            color={colors.textPrimary}
            backgroundColor={colors.background}
          />
        </View>

        <Text style={styles.codigoText}>{codigo}</Text>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            Prepará tu figurita Nº {figuritaEntregar.number} en un sobre con el código <Text style={styles.boldText}>{codigo}</Text>.
          </Text>
          <Text style={styles.instructionText}>
            Llevalo a <Text style={styles.boldText}>{kioscoNombre}</Text> ({kioscoDireccion}) antes de las 20 h.
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.boldText}>{otroUsuario || 'La otra persona'}</Text> dejará la Nº {figuritaRecibir.number}. Podés retirarla desde mañana.
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
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
    </View>
  );
};

export default CodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSizes.body,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: fontSizes.h2,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg, // 24
    alignItems: 'center',
  },
  qrContainer: {
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    // Sombra para destacar el código QR sutilmente
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codigoText: {
    fontSize: fontSizes.code, // 24px
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
    color: colors.textPrimary, // #1C1C1E
    backgroundColor: colors.surface, // #F2F2F7
    padding: spacing.md, // 16
    borderRadius: borderRadius.sm, // 8
    textAlign: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  instructionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: spacing.xl,
  },
  instructionText: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
  },
});
