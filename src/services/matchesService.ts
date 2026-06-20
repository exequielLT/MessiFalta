import { supabase } from './supabase';

export interface FiguritaDetail {
  number: number;
  name: string;
  imageUrl?: string;
}

export interface MatchInfo {
  id: string;
  userName: string;
  avatarUrl: string;
  reputation: number;
  tradesCount: number;
  offeredFigurita: FiguritaDetail;
  requestedFigurita: FiguritaDetail;
  distance: string;
  kioscoId: number;
  kioscoNombre: string;
  kioscoDireccion: string;
  barrio: string;
  figuritaMiaId: string;
  figuritaAjenaId: string;
}

export const matchesService = {
  getMatches: async (userId: string): Promise<MatchInfo[]> => {
    try {
      const { data, error } = await supabase.rpc('find_potential_matches');

      if (error) {
        console.error('Error fetching matches:', error);
        return [];
      }

      if (!data) return [];

      return data.map((match: any) => ({
        id: match.id,
        userName: match.user_name || 'Usuario Anónimo',
        avatarUrl: match.avatar_url || 'https://ui-avatars.com/api/?name=User',
        reputation: match.reputation || 0,
        tradesCount: match.trades_count || 0,
        offeredFigurita: {
          number: match.offered_number,
          name: match.offered_name,
          imageUrl: match.offered_image_url || undefined,
        },
        requestedFigurita: {
          number: match.requested_number,
          name: match.requested_name,
          imageUrl: match.requested_image_url || undefined,
        },
        distance: match.distance,
        kioscoId: match.kiosco_id,
        kioscoNombre: match.kiosco_nombre,
        kioscoDireccion: match.kiosco_direccion,
        barrio: match.barrio,
        figuritaMiaId: match.figurita_mia_id,
        figuritaAjenaId: match.figurita_ajena_id,
      }));
    } catch (err) {
      console.error('Exception fetching matches:', err);
      return [];
    }
  },
  confirmExchange: async (figuritaMiaId: string, figuritaAjenaId: string, kioscoId: number, codigo: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('confirm_exchange', {
        p_figurita_mia_id: figuritaMiaId,
        p_figurita_ajena_id: figuritaAjenaId,
        p_kiosco_id: kioscoId,
        p_codigo: codigo
      });

      if (error) {
        console.error('Error confirming exchange:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception confirming exchange:', err);
      return false;
    }
  }
};
