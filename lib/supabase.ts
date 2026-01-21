import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';


if (!supabaseUrl || !supabaseAnonKey) {
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // visibility change 시 자동 갱신 비활성화
    storageKey: 'duory-auth',
  },
  global: {
    headers: {
      'x-client-info': 'duory-app',
    },
  },
  db: {
    schema: 'public',
  },
  // 네트워크 타임아웃 설정
  realtime: {
    timeout: 5000,
  },
});

// 타입 정의
export type User = {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  couple_id?: string;
  created_at: string;
  updated_at: string;
};

export type Couple = {
  id: string;
  user1_id: string;
  user2_id: string;
  couple_name?: string;
  start_date: string;
  created_at: string;
  updated_at: string;
};

export type InviteCode = {
  id: string;
  code: string;
  created_by: string;
  couple_id: string;
  used: boolean;
  expires_at: string;
  created_at: string;
};

export type Memory = {
  id: string;
  couple_id: string;
  created_by: string; // author_id -> created_by
  title?: string; // 추가됨
  content: string;
  images?: string[]; // image_urls -> images (배열)
  videos?: string[]; // 영상 URL 배열
  location?: string;
  memory_date: string; // date -> memory_date
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  
  // Join된 유저 정보 (선택적)
  profiles?: {
    nickname: string;
    avatar_url: string;
  };
};

export type MemoryLike = {
  id: string;
  user_id: string;
  memory_id: string;
  created_at: string;
};

export type MemoryComment = {
  id: string;
  memory_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Anniversary = {
  id: string;
  couple_id: string;
  title: string;
  date: string;
  repeat_yearly: boolean;
  created_at: string;
  updated_at: string;
};

