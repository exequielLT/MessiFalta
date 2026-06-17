import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

interface RegistrarUsuarioScreenProps {
  onBack?: () => void;
  onGoToLogin?: (email: string) => void;
}

export const RegistrarUsuarioScreen: React.FC<
  RegistrarUsuarioScreenProps
> = ({ onBack, onGoToLogin }) => {
  const { signUp, signInWithGoogle } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailYaExiste, setEmailYaExiste] = useState(false);

  const validarEmail = (correo: string) => {
    return /\S+@\S+\.\S+/.test(correo);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error(error);
      if (error?.message && !error.message.toLowerCase().includes('cancel')) {
        setErrorMessage(error.message || 'Error al registrarse con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setEmailYaExiste(false);

    if (!nombre.trim()) {
      setErrorMessage('Ingresá tu nombre.');
      return;
    }

    if (!validarEmail(email)) {
      setErrorMessage('Ingresá un email válido.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, nombre);
      setSuccessMessage(
        'Registro exitoso. Revisá tu correo para verificar tu cuenta.'
      );
    } catch (error: any) {
      console.error(error);
      const isAlreadyRegistered = error?.message?.toLowerCase().includes('already registered');
      if (isAlreadyRegistered) {
        setEmailYaExiste(true);
        setErrorMessage(
          'Ya existe una cuenta registrada con este email.'
        );
      } else {
        setErrorMessage(error?.message || 'Hubo un error al registrarse. Intentalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Crear cuenta</Text>

          <Text style={styles.subtitle}>
            Registrate para comenzar a intercambiar figuritas.
          </Text>

          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
          />

          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Repetir contraseña"
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
            title="Registrarse"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            style={styles.button}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Continuar con Google"
            onPress={handleGoogleRegister}
            loading={loading}
            variant="secondary"
          />

          {emailYaExiste && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() =>
                onGoToLogin?.(email)
              }
            >
              <Text style={styles.loginButtonText}>
                Ir al inicio de sesión
              </Text>
            </TouchableOpacity>
          )}

          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backText}>
                Volver al inicio de sesión
              </Text>
            </TouchableOpacity>
          )}
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
    fontSize: 28,
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

  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },

  successText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 12,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D6',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#636366',
  },

  loginButton: {
    marginTop: 16,
    alignItems: 'center',
  },

  loginButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },

  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },

  backText: {
    color: colors.primary,
    fontWeight: '600',
  },
});