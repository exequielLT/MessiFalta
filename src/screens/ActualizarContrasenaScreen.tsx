import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';

interface ActualizarContrasenaScreenProps {
  onBackToLogin: () => void;
}

export const ActualizarContrasenaScreen: React.FC<ActualizarContrasenaScreenProps> = ({
  onBackToLogin,
}) => {
  const { updatePassword, signOut, user, setIsPasswordRecovery } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpdatePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // Si el usuario no está autenticado automáticamente (ej. flujo manual),
      // primero debemos establecer la sesión con el token provisto.
      if (!user) {
        if (!token.trim()) {
          setErrorMessage('Por favor, ingresá el token de recuperación recibido en tu correo.');
          setLoading(false);
          return;
        }

        // Si el usuario pegó la URL de recuperación completa, intentamos extraer el access_token del hash fragment
        let cleanToken = token.trim();
        const hashIndex = cleanToken.indexOf('#');
        if (hashIndex !== -1) {
          const hashParams = cleanToken.substring(hashIndex + 1).split('&');
          const tokenParam = hashParams.find(param => param.startsWith('access_token='));
          if (tokenParam) {
            cleanToken = decodeURIComponent(tokenParam.split('=')[1]);
          }
        } else if (cleanToken.includes('access_token=')) {
          const params = cleanToken.split('&');
          const tokenParam = params.find(param => param.includes('access_token='));
          if (tokenParam) {
            cleanToken = decodeURIComponent(tokenParam.split('=')[1]);
          }
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: cleanToken,
          refresh_token: '',
        });

        if (sessionError) {
          throw new Error('El token ingresado no es válido o expiró.');
        }
      }

      // Actualizar la contraseña en la cuenta del usuario
      await updatePassword(password);

      setSuccessMessage('Contraseña actualizada con éxito.');

      // Cerrar la sesión para forzar un nuevo login con la nueva clave
      setTimeout(async () => {
        await signOut();
        setIsPasswordRecovery(false);
        onBackToLogin();
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.message || 'No se pudo actualizar la contraseña. Intentalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await signOut();
    setIsPasswordRecovery(false);
    onBackToLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Establecer nueva contraseña</Text>

          <Text style={styles.subtitle}>
            {user
              ? 'Ingresá tu nueva contraseña para actualizar tu cuenta.'
              : 'Ingresá el token de tu correo y tu nueva contraseña.'}
          </Text>

          {!user && (
            <Input
              label="Token de recuperación"
              placeholder="Pegá el token o la URL completa de tu correo"
              value={token}
              onChangeText={setToken}
            />
          )}

          <Input
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Confirmar contraseña"
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          {successMessage ? (
            <Text style={styles.successText}>
              {successMessage}
            </Text>
          ) : null}

          <Button
            title="Actualizar contraseña"
            onPress={handleUpdatePassword}
            loading={loading}
            variant="primary"
            style={styles.button}
          />

          <Button
            title="Cancelar"
            onPress={handleCancel}
            variant="secondary"
            style={styles.cancelButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 12,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});
