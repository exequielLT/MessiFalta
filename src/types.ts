/**
 * Representa una figurita cargada por un usuario.
 */
export interface Figurita {
  id: string;
  user_id: string;
  numero: number;
  tipo: 'repetida' | 'faltante';
  nombre_jugador?: string;
  imagen_url?: string;
  seleccion?: string;
  created_at: string;
}

/**
 * Representa una coincidencia entre dos usuarios.
 */
export interface Match {
  id: number;
  user1_id: string;
  user2_id: string;
  fig1_id: string;
  fig2_id: string;
  estado: 'propuesto' | 'aceptado' | 'completado';
  usuario_nombre?: string;
  usuario_barrio?: string;
  usuario_reputacion?: number;
  ofrecida_numero?: number;
  ofrecida_nombre?: string;
  buscada_numero?: number;
  buscada_nombre?: string;
  distancia?: string;
  created_at: string;
}

/**
 * Representa un comercio adherido.
 */
export interface Kiosco {
  id: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  horario?: string;
}

/**
 * Representa un intercambio concretado.
 */
export interface Intercambio {
  id: number;
  match_id: number;
  codigo: string;
  kiosco_id: number;
  kiosco_nombre?: string;
  kiosco_direccion?: string;
  estado: 'pendiente' | 'retirado' | 'expirado' | 'cancelado';
  fecha_entrega?: string;
  fecha_retiro?: string;
}

/**
 * Representa el perfil de un usuario.
 */
export interface Perfil {
  id: string;
  email: string;
  nombre: string;
  barrio?: string;
  reputacion: number;
  created_at: string;
}

/**
 * Parámetros que recibe la pantalla de código.
 */
export interface CodeScreenParams {
  codigo: string;
  kioscoNombre: string;
  kioscoDireccion: string;
  kioscoId: number;
  figuritaEntregar: {
    number: number;
    name?: string;
  };
  figuritaRecibir: {
    number: number;
    name?: string;
  };
  otroUsuario?: string;
}
