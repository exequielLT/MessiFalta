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
  },

  async updateFigurita(id: string, input: Partial<CreateFiguritaInput>): Promise<Figurita> {
    const { data, error } = await supabase
      .from('figuritas')
      .update({
        numero: input.numero,
        tipo: input.tipo,
        nombre_jugador: input.nombreJugador,
        imagen_url: input.imagenUrl,
        seleccion: input.seleccion,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating figurita:', error);
      throw error;
    }

    return data;
  },

  async deleteFigurita(id: string): Promise<void> {
    const { error } = await supabase
      .from('figuritas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting figurita:', error);
      throw error;
    }
  }
};

