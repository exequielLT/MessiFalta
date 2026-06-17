import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (value: boolean) => void;
  signUp: (email: string, password: string, nombre: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        } else {
          const localSession = await AsyncStorage.getItem('user_session');
          if (localSession) {
            setUser({ id: 'mock-user-id', email: 'user@example.com' });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        await AsyncStorage.setItem('user_session', session.access_token);
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user_session');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, nombre: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre,
          name: nombre,
          full_name: nombre,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (!data.user) {
      throw new Error('No se pudo autenticar al usuario.');
    }

    // Verificar si el usuario tiene un perfil creado en la tabla `profiles`
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('El usuario no está registrado en la base de datos.');
    }

    return { user: data.user, session: data.session, profile };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = Linking.createURL('auth-callback');
    const isWeb = Platform.OS === 'web';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: !isWeb,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) throw error;

    if (!isWeb && data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        const urlString = result.url;
        const params: Record<string, string> = {};
        const hashIndex = urlString.indexOf('#');
        if (hashIndex !== -1) {
          const hash = urlString.substring(hashIndex + 1);
          hash.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');
            if (key && value) {
              params[key] = decodeURIComponent(value);
            }
          });
        } else {
          const parsed = Linking.parse(urlString);
          Object.assign(params, parsed.queryParams);
        }

        const { access_token, refresh_token } = params;
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) throw sessionError;
        }
      }
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = Linking.createURL('reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('user_session');
    await AsyncStorage.removeItem('has_seen_onboarding');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery,
        signUp,
        signIn,
        signInWithGoogle,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: { id: 'mock-user-id', email: 'user@example.com' },
      loading: false,
      isPasswordRecovery: false,
      setIsPasswordRecovery: () => {},
      signUp: async () => {},
      signIn: async () => {},
      signInWithGoogle: async () => {},
      resetPassword: async () => {},
      updatePassword: async () => {},
      signOut: async () => {},
    };
  }
  return context;
};
