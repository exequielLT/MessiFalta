import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Evita el error de WebSocket ausente en entornos Node.js (durante pre-renderizado/SSR en Expo)
if (typeof globalThis.WebSocket === 'undefined' && typeof window === 'undefined') {
  (globalThis as any).WebSocket = class {} as any;
}

// Validamos si el entorno actual es el servidor (Node.js) durante el renderizado de Expo
const isServer = typeof window === 'undefined';

// Adaptador híbrido y seguro para Web (SSR/Client) y Mobile
const customStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (!isServer) return localStorage.getItem(key);
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (!isServer) localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (!isServer) localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});