import { supabase } from '../supabase';

/**
 * Supabase Storage에 파일 업로드 (AWS S3 대신 사용)
 */
export async function uploadToSupabase(
  file: File,
  folder: 'avatars' | 'memories'
): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExtension}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('duory-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from('duory-images').getPublicUrl(fileName);

    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Upload failed');
  }
}

/**
 * 여러 파일을 한 번에 업로드
 */
export async function uploadMultipleToSupabase(
  files: File[],
  folder: 'avatars' | 'memories'
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadToSupabase(file, folder)));
}

