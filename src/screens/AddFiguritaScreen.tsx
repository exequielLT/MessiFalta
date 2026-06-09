import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, spacing, borderRadius, fontSizes } from '../constants/theme';
// @ts-ignore - Assuming useAuth is exported from AuthContext
import { useAuth } from '../context/AuthContext';
// @ts-ignore - Assuming addFigurita is exported from figuritasService
import { addFigurita } from '../services/figuritasService';
// @ts-ignore - Assuming searchPlayer is exported from api
import { searchPlayer } from '../services/api';
// @ts-ignore - Assuming playerMapping is an object exported from playerMapping
import { playerMapping } from '../constants/playerMapping';

export const AddFiguritaScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [numero, setNumero] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'repetida' | 'faltante' | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [searching, setSearching] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSearchPlayer = async (numToSearch: string) => {
    const numInt = parseInt(numToSearch, 10);
    if (isNaN(numInt) || numInt < 1 || numInt > 678) return;

    const mappedName = playerMapping[numToSearch];
    if (!mappedName) return;

    setSearching(true);
    setApiError('');
    try {
      const response = await searchPlayer(mappedName);
      if (response && response.response && response.response.length > 0) {
        setNombre(response.response[0].player.name);
      } else {
        setApiError('Jugador no encontrado');
      }
    } catch (error) {
      setApiError('No se pudo obtener el nombre. ¿Reintentar?');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!numero) return;

    const timer = setTimeout(() => {
      handleSearchPlayer(numero);
    }, 800);

    return () => clearTimeout(timer);
  }, [numero]);

  const handleSave = async () => {
    if (!numero || !tipo) return;

    const numInt = parseInt(numero, 10);
    if (isNaN(numInt) || numInt < 1 || numInt > 678) {
      setErrorMessage('El número debe estar entre 1 y 678');
      return;
    }

    if (!user || !user.id) {
      setErrorMessage('Debes iniciar sesión para guardar');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      await addFigurita(user.id, {
        numero: numInt,
        tipo,
        nombre_jugador: nombre,
      });
      navigation.goBack();
    } catch (error) {
      setErrorMessage('Error al guardar la figurita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Volver'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar figurita</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Número de la figurita"
          placeholder="Ej: 10"
          value={numero}
          onChangeText={(val) => {
            setNumero(val.replace(/[^0-9]/g, ''));
            setApiError('');
          }}
          keyboardType="numeric"
          maxLength={3}
        />

        <View style={styles.nombreContainer}>
          <Input
            label="Nombre del jugador (opcional)"
            placeholder="Ej: Lionel Messi"
            value={nombre}
            onChangeText={setNombre}
            loading={searching}
          />
          {apiError ? (
            <View style={styles.apiErrorContainer}>
              <Text style={styles.apiErrorText}>{apiError}</Text>
              <TouchableOpacity onPress={() => handleSearchPlayer(numero)}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <Text style={styles.label}>¿Qué tipo de figurita es?</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              tipo === 'repetida' && styles.segmentButtonRepetida,
            ]}
            onPress={() => setTipo('repetida')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentButtonText,
                tipo === 'repetida' && styles.segmentButtonTextActive,
              ]}
            >
              La tengo repetida
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              tipo === 'faltante' && styles.segmentButtonFaltante,
            ]}
            onPress={() => setTipo('faltante')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentButtonText,
                tipo === 'faltante' && styles.segmentButtonTextActive,
              ]}
            >
              La necesito
            </Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button
            title="Guardar figurita"
            onPress={handleSave}
            disabled={!numero || !tipo}
            loading={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddFiguritaScreen;

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
    padding: spacing.lg,
  },
  nombreContainer: {
    marginBottom: spacing.xs,
  },
  apiErrorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  apiErrorText: {
    color: colors.error,
    fontSize: fontSizes.caption,
  },
  retryText: {
    color: colors.primary,
    fontSize: fontSizes.caption,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  segmentButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentButtonRepetida: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  segmentButtonFaltante: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  segmentButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
});
