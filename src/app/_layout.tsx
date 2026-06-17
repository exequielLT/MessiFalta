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
import { ActualizarContrasenaScreen } from '@/screens/ActualizarContrasenaScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const ONBOARDING_KEY = '@onboarding_completed';
const LEGACY_ONBOARDING_KEY = 'has_seen_onboarding';

function LayoutContent() {
  const colorScheme = useColorScheme();
  const { user, loading: authLoading, isPasswordRecovery } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    const checkState = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(LEGACY_ONBOARDING_KEY);
        const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (hasCompletedOnboarding === 'true' || hasSeenOnboarding === 'true') {
          if (hasSeenOnboarding === 'true' && hasCompletedOnboarding !== 'true') {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
          }
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error reading storage:', error);
      } finally {
        setLoading(false);
      }
    };
    checkState();
  }, []);

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
  };

  if (loading || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {isPasswordRecovery ? (
        <ActualizarContrasenaScreen
          onBackToLogin={() => {
            setShowForgotPassword(false);
            setShowRegister(false);
          }}
        />
      ) : showOnboarding ? (
        <OnboardingScreen onFinish={handleFinishOnboarding} />
      ) : showForgotPassword ? (
        <RecuperarContrasenaScreen
          onBack={() => setShowForgotPassword(false)}
        />
      ) : showRegister ? (
        <RegistrarUsuarioScreen
          onBack={() => setShowRegister(false)}
          onGoToLogin={(email) => {
            setPrefilledEmail(email);
            setShowRegister(false);
          }}
        />
      ) : !user ? (
        <LoginScreen
          onLogin={() => {}}
          onForgotPassword={() => setShowForgotPassword(true)}
          onRegister={() => {
            setPrefilledEmail('');
            setShowRegister(true);
          }}
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
    <AuthProvider>
      <CustomThemeProvider>
        <LayoutContent />
      </CustomThemeProvider>
    </AuthProvider>
  );
}
