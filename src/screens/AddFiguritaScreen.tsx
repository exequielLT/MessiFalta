import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/theme';
import { useTheme } from '../hooks/use-theme';
import { supabase } from '../services/supabase';
import { searchPlayer } from '../services/api';
import { uploadPlayerImage } from '../services/storageService';
import { playerMapping } from '../constants/playerMapping';
import { useAuth } from '../context/AuthContext';

interface AddFiguritaScreenProps {
  onClose?: () => void;
}

export const AddFiguritaScreen: React.FC<AddFiguritaScreenProps> = ({ onClose }) => {
  const router = useRouter();
  const { user } = useAuth() as any;
  const theme = useTheme();

  const [numero, setNumero] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'repetida' | 'faltante' | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [apiError, setApiError] = useState('');
  
  const [userEditedName, setUserEditedName] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showCheck, setShowCheck] = useState(false);

  const isFirstMount = useRef(true);

  // Debounce search effect
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      if (numero) {
        handleSearch(numero);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [numero]);

  const handleSearch = async (numStr: string) => {
    const num = parseInt(numStr, 10);
    
    // Reset flags for new search
    setApiError('');
    setShowCheck(false);
    
    if (isNaN(num) || num < 1 || num > 678) {
      return;
    }

    const mapped = playerMapping[num];
    if (mapped) {
      if (!userEditedName) {
        setNombre(mapped.name);
      }
      
      setSearching(true);
      try {
        const { data, error } = await searchPlayer(mapped.name);
        
        if (error) {
          setApiError('No se pudo obtener la imagen. ¿Reintentar?');
        } else if (data) {
          if (!userEditedName) {
            setNombre(data.name);
          }
          
          if (data.photo) {
            try {
              const url = await uploadPlayerImage(data.photo, `${num}-${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
              setImageUrl(url);
            } catch (err) {
              console.error('Error uploading image', err);
            }
          }
          
          setShowCheck(true);
          setTimeout(() => setShowCheck(false), 2000);
        } else {
          setApiError('Jugador no encontrado. Podés guardarlo sin nombre.');
        }
      } catch (err) {
        setApiError('No se pudo obtener la imagen. ¿Reintentar?');
      } finally {
        setSearching(false);
      }
    } else {
      if (!userEditedName) {
        setNombre('');
      }
    }
  };

  const handleNameChange = (text: string) => {
    setNombre(text);
    setUserEditedName(true);
  };

  const handleRetrySearch = () => {
    handleSearch(numero);
  };

  const handleSave = async () => {
    setErrorMessage('');
    
    const num = parseInt(numero, 10);
    if (isNaN(num) || num < 1 || num > 678) {
      setErrorMessage('El número debe estar entre 1 y 678');
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

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('figuritas')
        .insert({
          user_id: user.id,
          numero: num,
          tipo,
          nombre_jugador: nombre || null,
          imagen_url: imageUrl,
          seleccion: playerMapping[num]?.seleccion || null
        });

      if (error) throw error;
      
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

  const numError = numero && (parseInt(numero, 10) < 1 || parseInt(numero, 10) > 678) 
    ? 'El número debe estar entre 1 y 678' 
    : undefined;

  const isSaveDisabled = !numero || !!numError || !tipo;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.outlineVariant }]}>
        <TouchableOpacity onPress={() => onClose ? onClose() : router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Agregar figurita</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Input
            label="Número de figurita"
            placeholder="Ej: 10"
            value={numero}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setNumero(numericValue);
            }}
            keyboardType="number-pad"
            errorMessage={numError}
            labelStyle={{ color: theme.textSecondary }}
            inputContainerStyle={{ backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant }}
            inputStyle={{ color: theme.text }}
            placeholderTextColor={theme.textSecondary}
          />

          <View style={styles.nameInputContainer}>
            <Input
              label="Nombre del jugador (Opcional)"
              placeholder="Ej: Lionel Messi"
              value={nombre}
              onChangeText={handleNameChange}
              loading={searching}
              rightIcon={
                showCheck ? <Ionicons name="checkmark-circle" size={20} color={theme.secondary} /> : undefined
              }
              labelStyle={{ color: theme.textSecondary }}
              inputContainerStyle={{ backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant }}
              inputStyle={{ color: theme.text }}
              placeholderTextColor={theme.textSecondary}
            />
            {apiError ? (
              <View style={styles.apiErrorContainer}>
                <Text style={[styles.apiErrorText, { color: theme.error }]}>{apiError}</Text>
                {apiError.includes('¿Reintentar?') && (
                  <TouchableOpacity onPress={handleRetrySearch}>
                    <Text style={[styles.retryText, { color: theme.primary }]}>Reintentar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>

          <Text style={[styles.typeLabel, { color: theme.textSecondary }]}>Tipo de figurita</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant },
                tipo === 'repetida' && { backgroundColor: theme.secondary, borderColor: theme.secondary }
              ]}
              onPress={() => setTipo('repetida')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeButtonText,
                { color: theme.text },
                tipo === 'repetida' && { color: theme.onSecondary }
              ]}>
                La tengo repetida
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant },
                tipo === 'faltante' && { backgroundColor: theme.tertiary, borderColor: theme.tertiary }
              ]}
              onPress={() => setTipo('faltante')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeButtonText,
                { color: theme.text },
                tipo === 'faltante' && { color: theme.onTertiary }
              ]}>
                La necesito
              </Text>
            </TouchableOpacity>
          </View>

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
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
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
