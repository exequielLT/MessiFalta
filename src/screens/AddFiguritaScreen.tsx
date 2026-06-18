import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';
import { searchPlayer } from '../services/api';
import { buildPlayerImageFileName, uploadPlayerImage } from '../services/storageService';
import { figuritasService } from '../services/figuritasService';
import { useAuth } from '@/context/AuthContext';

interface AddFiguritaScreenProps {
  onClose?: () => void;
}

const formatNationality = (value?: string | null) => {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Se genera un numero deterministico en base al nombre del jugador
// Así evitamos tener que pedirle el número al usuario y mantenemos
// la compatibilidad con el sistema de Matchmaking (que requiere un numero del 1 al 678)
const generateNumberFromName = (name: string): number => {
  let hash = 0;
  const str = name.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  return (Math.abs(hash) % 678) + 1;
};

export const AddFiguritaScreen: React.FC<AddFiguritaScreenProps> = ({ onClose }) => {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'repetida' | 'faltante' | null>(null);
  const [nacionalidad, setNacionalidad] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [showCheck, setShowCheck] = useState(false);

  const isFirstMount = useRef(true);
  const searchIdRef = useRef(0);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      if (nombre.trim().length >= 3) {
        handleSearch(nombre.trim());
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [nombre]);

  const handleSearch = async (nameStr: string) => {
    const currentSearchId = searchIdRef.current + 1;
    searchIdRef.current = currentSearchId;

    setApiError('');
    setShowCheck(false);

    setSearching(true);
    try {
      const { data, error } = await searchPlayer(nameStr);
      if (searchIdRef.current !== currentSearchId) return;

      if (error === 'RATE_LIMIT') {
        setApiError('Demasiadas búsquedas. Esperá un minuto.');
        return;
      }

      if (error === 'NOT_FOUND') {
        setApiError('Jugador no encontrado. Podés guardarlo igual.');
        return;
      }

      if (error === 'NETWORK_ERROR' || error === 'SERVER_ERROR') {
        setApiError('No se pudo buscar en la API. ¿Reintentar?');
        return;
      }

      if (data) {
        if (data.nationality) {
          setNacionalidad(formatNationality(data.nationality) || '');
        }

        if (data.photo) {
          const generatedNum = generateNumberFromName(data.name || nameStr);
          const fileName = buildPlayerImageFileName(generatedNum, data.name || nameStr);
          const url = await uploadPlayerImage(data.photo, fileName);
          if (searchIdRef.current === currentSearchId) {
            setImageUrl(url);
          }
        }

        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 2000);
      }
    } catch (err) {
      if (searchIdRef.current === currentSearchId) {
        console.error(err);
        setApiError('No se pudo buscar en la API. ¿Reintentar?');
      }
    } finally {
      if (searchIdRef.current === currentSearchId) {
        setSearching(false);
      }
    }
  };

  const handleNameChange = (text: string) => {
    setNombre(text);
    searchIdRef.current += 1;
    setApiError('');
    setErrorMessage('');
    setSearching(false);
    setShowCheck(false);
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!nombre.trim()) {
      setErrorMessage('Ingresá el nombre del jugador');
      return;
    }

    if (!nacionalidad.trim()) {
      setErrorMessage('Ingresá la nacionalidad');
      return;
    }

    if (!tipo) {
      setErrorMessage('Seleccioná el tipo de figurita');
      return;
    }

    if (!user?.id) {
      setErrorMessage('Error de sesión. Volvé a ingresar.');
      return;
    }

    const generatedNum = generateNumberFromName(nombre);

    setSaving(true);
    try {
      await figuritasService.createFigurita({
        userId: user.id,
        numero: generatedNum,
        tipo,
        nombreJugador: nombre.trim(),
        imagenUrl: imageUrl,
        seleccion: nacionalidad.trim(),
      });

      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error al guardar la figurita. Reintentá.');
    } finally {
      setSaving(false);
    }
  };

  const canPreview = nombre.trim().length > 0;
  const isSaveDisabled = !nombre.trim() || !nacionalidad.trim() || !tipo || searching;
  const selectedTypeLabel = tipo === 'repetida' ? 'Repetida' : tipo === 'faltante' ? 'Faltante' : 'Sin elegir';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.outlineVariant }]}>
        <TouchableOpacity onPress={() => (onClose ? onClose() : router.back())} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Agregar figurita</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.nameInputContainer}>
            <Input
              label="Nombre del jugador"
              placeholder="Ej: Lionel Messi"
              value={nombre}
              onChangeText={handleNameChange}
              loading={searching}
              rightIcon={showCheck ? <Ionicons name="checkmark-circle" size={20} color={theme.secondary} /> : undefined}
              labelStyle={{ color: theme.textSecondary }}
              inputContainerStyle={{ backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant }}
              inputStyle={{ color: theme.text }}
              placeholderTextColor={theme.textSecondary}
            />
            {apiError ? (
              <View style={styles.apiErrorContainer}>
                <Text style={[styles.apiErrorText, { color: theme.error }]}>{apiError}</Text>
                {apiError.includes('¿Reintentar?') && (
                  <TouchableOpacity onPress={() => handleSearch(nombre)} disabled={searching}>
                    <Text style={[styles.retryText, { color: theme.primary }]}>Reintentar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>

          <Input
            label="Nacionalidad"
            placeholder="Ej: Argentina"
            value={nacionalidad}
            onChangeText={setNacionalidad}
            labelStyle={{ color: theme.textSecondary }}
            inputContainerStyle={{ backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant, marginBottom: 16 }}
            inputStyle={{ color: theme.text }}
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.typeLabel, { color: theme.textSecondary }]}>Tipo de figurita</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant },
                tipo === 'repetida' && { backgroundColor: theme.secondary, borderColor: theme.secondary },
              ]}
              onPress={() => setTipo('repetida')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeButtonText, { color: tipo === 'repetida' ? theme.onSecondary : theme.text }]}>
                La tengo repetida
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant },
                tipo === 'faltante' && { backgroundColor: theme.tertiary, borderColor: theme.tertiary },
              ]}
              onPress={() => setTipo('faltante')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeButtonText, { color: tipo === 'faltante' ? theme.onTertiary : theme.text }]}>
                La necesito
              </Text>
            </TouchableOpacity>
          </View>

          {canPreview ? (
            <View style={[styles.previewCard, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.outlineVariant }]}>
              <Text style={[styles.previewTitle, { color: theme.text }]}>Revisá antes de guardar</Text>
              <View style={styles.previewContent}>
                <View style={[styles.previewImage, { backgroundColor: theme.surfaceContainerHigh }]}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.playerImage} resizeMode="cover" />
                  ) : (
                    <Ionicons name="person" size={34} color={theme.onSurfaceVariant} />
                  )}
                </View>
                <View style={styles.previewInfo}>
                  <Text style={[styles.previewName, { color: theme.text }]}>{nombre.trim()}</Text>
                  <Text style={[styles.previewMeta, { color: theme.textSecondary }]}>Nacionalidad: {nacionalidad || 'Sin dato'}</Text>
                  <Text style={[styles.previewMeta, { color: theme.textSecondary }]}>Tipo: {selectedTypeLabel}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {errorMessage ? <Text style={[styles.mainErrorText, { color: theme.error }]}>{errorMessage}</Text> : null}

          <View style={styles.footer}>
            <Button
              title="Guardar figurita"
              onPress={handleSave}
              variant="primary"
              disabled={isSaveDisabled}
              loading={saving}
              style={{ backgroundColor: theme.primaryContainer }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background || '#FFFFFF',
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  nameInputContainer: {
    marginBottom: 8,
  },
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 16,
  },
  apiErrorText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  retryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    flex: 1,
    gap: 3,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewMeta: {
    fontSize: 13,
  },
  mainErrorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
  },
});
