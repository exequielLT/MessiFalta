import { supabase } from './supabase';

export async function uploadPlayerImage(photoUrl: string, fileName: string): Promise<string> {
  try {
    // 1. Check if the file already exists in the bucket
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('jugadores')
      .list('', { search: fileName });

    if (!listError && existingFiles && existingFiles.length > 0) {
      // Return public url of existing file
      const { data } = supabase.storage.from('jugadores').getPublicUrl(fileName);
      return data.publicUrl;
    }

    // 2. Download from external photoUrl
    const response = await fetch(photoUrl);
    const blob = await response.blob();

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('jugadores')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Return public URL
    const { data } = supabase.storage.from('jugadores').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    // Fallback to original external URL if upload fails
    return photoUrl;
  }
}
