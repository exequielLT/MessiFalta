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

interface Props {
  onBack?: () => void;
}

export const RecuperarContrasenaScreen: React.FC<Props> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleSendEmail = () => {
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresá tu correo electrónico.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setEmailEnviado(true);
      setMessage('Te enviamos un correo. Revisá tu bandeja de entrada.');
    }, 1200);
  };

  const handleResendEmail = () => {
    setError('');
    setMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessage('Correo reenviado correctamente.');
    }, 1200);
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
          onPress={emailEnviado ? handleResendEmail : handleSendEmail}
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
});