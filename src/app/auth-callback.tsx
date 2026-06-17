import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            
            if (params.get('error_description')) {
              setErrorMsg(params.get('error_description') || 'Error en el login');
              return;
            }

            if (hash.includes('access_token')) {
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');
              
              if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({ access_token, refresh_token });
                if (error) {
                  console.error('Error setting session:', error);
                  setErrorMsg(error.message);
                  return;
                }
              }
            }
          }
        }
        // Redirect to home which will render AppTabs since user is now authenticated
        router.replace('/');
      } catch (err: any) {
        console.error('Callback error:', err);
        setErrorMsg(err?.message || 'Error processing login');
      }
    };

    handleAuth();
  }, []);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>Error: {errorMsg}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.text}>Completando inicio de sesión...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#1C1C1E',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  }
});
