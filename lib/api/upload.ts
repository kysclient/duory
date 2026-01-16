import { supabase } from '../supabase';

/**
 * 클라이언트에서 API Route를 통해 S3에 파일 업로드
 */
export async function uploadFile(
  file: File,
  folder: 'avatars' | 'memories'
): Promise<string> {
  try {
    // 현재 사용자의 인증 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // API Route로 업로드 요청
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const { url } = await response.json();
    return url;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * 여러 파일을 한 번에 업로드
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: 'avatars' | 'memories'
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadFile(file, folder)));
}

