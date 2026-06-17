import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/screens/LoginScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { RecuperarContrasenaScreen } from '@/screens/RecuperarContrasenaScreen';
import { RegistrarUsuarioScreen } from '@/screens/RegistrarUsuarioScreen';

function LayoutContent() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading, signIn } = useAuth();

  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  // Email pre-relleno al ir de Registro → Login (usuario ya existente)
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        if (hasSeenOnboarding === 'true') {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error reading onboarding flag:', error);
      } finally {
        setOnboardingLoaded(true);
      }
    };
    checkOnboarding();
  }, []);

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
  };

  // Llamado por LoginScreen al confirmar login (mock MVP)
  const handleLogin = async () => {
    try {
      await signIn({ id: 'mock-user-id', email: 'user@example.com' });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  // Mientras el contexto de auth o el flag de onboarding no cargaron
  if (authLoading || !onboardingLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {showOnboarding ? (
        <OnboardingScreen onFinish={handleFinishOnboarding} />
      ) : showForgotPassword ? (
        <RecuperarContrasenaScreen
          onBack={() => setShowForgotPassword(false)}
        />
      ) : showRegister ? (
        <RegistrarUsuarioScreen
          onBack={() => setShowRegister(false)}
          onGoToLogin={(email) => {
            // Email ya existente: pre-rellenar login y volver
            setPrefilledEmail(email);
            setShowRegister(false);
          }}
        />
      ) : !user ? (
        <LoginScreen
          onLogin={handleLogin}
          onForgotPassword={() => setShowForgotPassword(true)}
          onRegister={() => setShowRegister(true)}
          initialEmail={prefilledEmail}
        />
      ) : (
        <AppTabs />
      )}
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    // AuthProvider envuelve todo para que useAuth() funcione en cualquier pantalla
    <AuthProvider>
      <CustomThemeProvider>
        <LayoutContent />
      </CustomThemeProvider>
    </AuthProvider>
  );
}
