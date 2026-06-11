import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { CustomThemeProvider, useThemeContext } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { LoginScreen } from '@/screens/LoginScreen';

function LayoutContent() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkState = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        if (hasSeenOnboarding === 'true') {
          setShowOnboarding(false);
        }
        
        // Also check for user session / login state (mock for MVP)
        const userSession = await AsyncStorage.getItem('user_session');
        if (userSession) {
          setIsAuthenticated(true);
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

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem('user_session', 'mock-session-id');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error writing session:', error);
      setIsAuthenticated(true);
    }
  };

  if (loading) {
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
      ) : !isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <AppTabs />
      )}
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <CustomThemeProvider>
      <LayoutContent />
    </CustomThemeProvider>
  );
}

