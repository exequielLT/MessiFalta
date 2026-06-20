import { colors } from '@/constants/theme';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onBack?: () => void;
}

export const RecuperarContrasenaScreen: React.FC<Props> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);

  const { resetPassword, setIsPasswordRecovery } = useAuth();

  const handleSendEmail = async () => {
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresá tu correo electrónico.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());
      setEmailEnviado(true);
      setMessage('Te enviamos un correo. Revisá tu bandeja de entrada.');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al enviar el correo. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setMessage('Correo reenviado correctamente.');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al reenviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recuperar contraseña</Text>

        <Text style={styles.subtitle}>
          Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
            setMessage('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {emailEnviado ? 'Reenviar correo' : 'Enviar correo'}
            </Text>
          )}
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setIsPasswordRecovery(true)}
          style={styles.manualTokenButton}
        >
          <Text style={styles.manualTokenText}>Ingresar código manualmente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  resendText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  manualTokenButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  manualTokenText: {
    color: '#636366',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});