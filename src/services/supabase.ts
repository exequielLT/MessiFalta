import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Evita el error de WebSocket ausente en entornos Node.js (durante pre-renderizado/SSR en Expo)
if (typeof globalThis.WebSocket === 'undefined' && typeof window === 'undefined') {
  (globalThis as any).WebSocket = class {} as any;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
  },
});
