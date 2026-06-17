import { supabase } from './supabase';
import { Figurita } from '../types';

export const figuritasService = {
  async getFiguritas(userId: string): Promise<Figurita[]> {
    const { data, error } = await supabase
      .from('figuritas')
      .select('*')
      .eq('user_id', userId)
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error fetching figuritas:', error);
      throw error;
    }

    return data || [];
  }
};
