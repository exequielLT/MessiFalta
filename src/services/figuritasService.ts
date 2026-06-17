import { supabase } from './supabase';
import { Figurita } from '../types';

interface CreateFiguritaInput {
  userId: string;
  numero: number;
  tipo: 'repetida' | 'faltante';
  nombreJugador?: string | null;
  imagenUrl?: string | null;
  seleccion?: string | null;
}

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
  },

  async createFigurita(input: CreateFiguritaInput): Promise<Figurita> {
    const { data, error } = await supabase
      .from('figuritas')
      .insert({
        user_id: input.userId,
        numero: input.numero,
        tipo: input.tipo,
        nombre_jugador: input.nombreJugador || null,
        imagen_url: input.imagenUrl || null,
        seleccion: input.seleccion || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating figurita:', error);
      throw error;
    }

    return data;
  }
};
