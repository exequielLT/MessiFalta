import { supabase } from './supabase';

export async function uploadPlayerImage(photoUrl: string, fileName: string): Promise<string> {
  try {
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('jugadores')
      .list('', { search: fileName });

    if (!listError && existingFiles?.some((file) => file.name === fileName)) {
      const { data } = supabase.storage.from('jugadores').getPublicUrl(fileName);
      return data.publicUrl;
    }

    const response = await fetch(photoUrl);
    if (!response.ok) {
      throw new Error(`No se pudo descargar la imagen (${response.status})`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const imageBytes = await response.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('jugadores')
      .upload(fileName, imageBytes, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('jugadores').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    return photoUrl;
  }
}

export function buildPlayerImageFileName(number: number, playerName: string): string {
  const sanitizedName = playerName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  return `${number}-${sanitizedName || 'jugador'}.png`;
}
