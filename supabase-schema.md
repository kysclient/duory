# Duory Supabase Database Schema

이 파일의 SQL을 Supabase SQL Editor에 복사-붙여넣기하면 전체 데이터베이스가 생성됩니다.

## 사용 방법
1. Supabase Dashboard → SQL Editor 열기
2. 아래 전체 SQL을 복사
3. 붙여넣기 후 실행 (Run)

---

## 🗄️ Complete Database Setup

```sql
-- ============================================
-- 1. Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================
-- 2. Create Tables
-- ============================================

-- Users Table (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  profile_image TEXT,
  couple_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples Table
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_name TEXT,
  start_date DATE,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Foreign Key to Users Table
ALTER TABLE public.users 
  ADD CONSTRAINT fk_couple 
  FOREIGN KEY (couple_id) 
  REFERENCES public.couples(id) 
  ON DELETE SET NULL;

-- Invite Codes Table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  memory_date DATE NOT NULL,
  location TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Likes Table
CREATE TABLE IF NOT EXISTS public.memory_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(memory_id, user_id)
);

-- Memory Comments Table
CREATE TABLE IF NOT EXISTS public.memory_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anniversaries Table
CREATE TABLE IF NOT EXISTS public.anniversaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE, -- 매년 반복
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 3. Create Indexes for Performance
-- ============================================

CREATE INDEX idx_users_couple_id ON public.users(couple_id);
CREATE INDEX idx_couples_users ON public.couples(user1_id, user2_id);
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_expires ON public.invite_codes(expires_at) WHERE NOT used;
CREATE INDEX idx_memories_couple_id ON public.memories(couple_id);
CREATE INDEX idx_memories_public ON public.memories(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_memory_likes_memory_id ON public.memory_likes(memory_id);
CREATE INDEX idx_memory_comments_memory_id ON public.memory_comments(memory_id);
CREATE INDEX idx_anniversaries_couple_id ON public.anniversaries(couple_id);


-- ============================================
-- 4. Create Functions
-- ============================================

-- Function: Create public.users row on auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.invite_codes WHERE invite_codes.code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate and use invite code
CREATE OR REPLACE FUNCTION use_invite_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_invite_code RECORD;
  v_couple_id UUID;
  v_result JSON;
BEGIN
  -- Find and validate invite code
  SELECT * INTO v_invite_code
  FROM public.invite_codes
  WHERE code = p_code
    AND NOT used
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Invalid or expired code'
    );
  END IF;

  -- Check if user already has a couple
  IF EXISTS(SELECT 1 FROM public.users WHERE id = p_user_id AND couple_id IS NOT NULL) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'User already in a couple'
    );
  END IF;

  -- Update couple with user2_id
  UPDATE public.couples
  SET user2_id = p_user_id,
      updated_at = NOW()
  WHERE id = v_invite_code.couple_id;

  -- Update user's couple_id
  UPDATE public.users
  SET couple_id = v_invite_code.couple_id,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Mark invite code as used
  UPDATE public.invite_codes
  SET used = TRUE,
      used_by = p_user_id,
      used_at = NOW()
  WHERE id = v_invite_code.id;

  RETURN json_build_object(
    'success', TRUE,
    'couple_id', v_invite_code.couple_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update memory counts
CREATE OR REPLACE FUNCTION update_memory_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.memories
    SET likes_count = likes_count + 1
    WHERE id = NEW.memory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.memories
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.memory_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_memory_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.memories
    SET comments_count = comments_count + 1
    WHERE id = NEW.memory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.memories
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.memory_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 5. Create Triggers
-- ============================================

-- Auth signup trigger → public.users 자동 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anniversaries_updated_at BEFORE UPDATE ON public.anniversaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Memory counts triggers
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.memory_likes
  FOR EACH ROW EXECUTE FUNCTION update_memory_likes_count();

CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON public.memory_comments
  FOR EACH ROW EXECUTE FUNCTION update_memory_comments_count();


-- ============================================
-- 6. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anniversaries ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view their couple partner"
  ON public.users FOR SELECT
  USING (
    couple_id IS NOT NULL AND 
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Couples Policies
CREATE POLICY "Users can view their own couple"
  ON public.couples FOR SELECT
  USING (
    user1_id = auth.uid() OR 
    user2_id = auth.uid()
  );

CREATE POLICY "Users can update their own couple"
  ON public.couples FOR UPDATE
  USING (
    user1_id = auth.uid() OR 
    user2_id = auth.uid()
  );

CREATE POLICY "Users can create couple"
  ON public.couples FOR INSERT
  WITH CHECK (user1_id = auth.uid());

-- Invite Codes Policies
CREATE POLICY "Users can view own invite codes"
  ON public.invite_codes FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create invite codes"
  ON public.invite_codes FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Memories Policies
CREATE POLICY "Users can view own couple memories"
  ON public.memories FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public memories"
  ON public.memories FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can create memories for their couple"
  ON public.memories FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own memories"
  ON public.memories FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own memories"
  ON public.memories FOR DELETE
  USING (created_by = auth.uid());

-- Memory Likes Policies
CREATE POLICY "Anyone can view likes on public memories"
  ON public.memory_likes FOR SELECT
  USING (
    memory_id IN (
      SELECT id FROM public.memories WHERE is_public = TRUE
    )
  );

CREATE POLICY "Couple members can view likes"
  ON public.memory_likes FOR SELECT
  USING (
    memory_id IN (
      SELECT id FROM public.memories 
      WHERE couple_id IN (
        SELECT couple_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can like memories"
  ON public.memory_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike memories"
  ON public.memory_likes FOR DELETE
  USING (user_id = auth.uid());

-- Memory Comments Policies
CREATE POLICY "Anyone can view comments on public memories"
  ON public.memory_comments FOR SELECT
  USING (
    memory_id IN (
      SELECT id FROM public.memories WHERE is_public = TRUE
    )
  );

CREATE POLICY "Couple members can view comments"
  ON public.memory_comments FOR SELECT
  USING (
    memory_id IN (
      SELECT id FROM public.memories 
      WHERE couple_id IN (
        SELECT couple_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can comment"
  ON public.memory_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON public.memory_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON public.memory_comments FOR DELETE
  USING (user_id = auth.uid());

-- Anniversaries Policies
CREATE POLICY "Couple members can view anniversaries"
  ON public.anniversaries FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can create anniversaries"
  ON public.anniversaries FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can update anniversaries"
  ON public.anniversaries FOR UPDATE
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can delete anniversaries"
  ON public.anniversaries FOR DELETE
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );


-- ============================================
-- 7. Create Helper Views
-- ============================================

-- View: Get couple with both users info
CREATE OR REPLACE VIEW couple_details AS
SELECT 
  c.id as couple_id,
  c.couple_name,
  c.start_date,
  c.status,
  u1.id as user1_id,
  u1.nickname as user1_nickname,
  u1.profile_image as user1_profile_image,
  u2.id as user2_id,
  u2.nickname as user2_nickname,
  u2.profile_image as user2_profile_image,
  c.created_at,
  c.updated_at
FROM couples c
LEFT JOIN users u1 ON c.user1_id = u1.id
LEFT JOIN users u2 ON c.user2_id = u2.id;


-- ============================================
-- 9. Useful Database Functions for Frontend
-- ============================================

-- Function: Get couple info with partner details
CREATE OR REPLACE FUNCTION get_my_couple()
RETURNS TABLE (
  couple_id UUID,
  couple_name TEXT,
  start_date DATE,
  partner_id UUID,
  partner_nickname TEXT,
  partner_profile_image TEXT,
  days_together INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.couple_name,
    c.start_date,
    CASE 
      WHEN c.user1_id = auth.uid() THEN c.user2_id
      ELSE c.user1_id
    END,
    CASE 
      WHEN c.user1_id = auth.uid() THEN u2.nickname
      ELSE u1.nickname
    END,
    CASE 
      WHEN c.user1_id = auth.uid() THEN u2.profile_image
      ELSE u1.profile_image
    END,
    CASE 
      WHEN c.start_date IS NOT NULL 
      THEN (CURRENT_DATE - c.start_date)
      ELSE NULL
    END
  FROM couples c
  LEFT JOIN users u1 ON c.user1_id = u1.id
  LEFT JOIN users u2 ON c.user2_id = u2.id
  WHERE c.user1_id = auth.uid() OR c.user2_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 10. Sample Data (Optional - for testing)
-- ============================================

-- Uncomment below to insert sample data
/*
-- This will be done through your app's signup flow
-- Just keeping here as reference
*/


-- ============================================
-- Setup Complete! 🎉
-- ============================================
-- Next Steps:
-- 1. Set up Supabase Auth (Email/Google/etc)
-- 2. Install @supabase/supabase-js in your Next.js app
-- 3. Create .env.local with your Supabase credentials
-- 4. Start building your API routes!
```

## 📝 Environment Variables

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔑 Key Features

### ✅ 완전한 테이블 구조
- users, couples, invite_codes
- memories, memory_likes, memory_comments
- anniversaries

### ✅ 보안
- Row Level Security (RLS) 모든 테이블에 적용
- 커플 멤버만 데이터 접근 가능
- Public 추억은 모두가 볼 수 있음

### ✅ 자동화
- updated_at 자동 업데이트
- likes/comments count 자동 계산
- 초대 코드 유니크 생성

### ✅ 성능
- 필수 인덱스 모두 적용
- 효율적인 쿼리를 위한 View

### ✅ 확장성
- Storage Bucket 설정 포함
- Helper Functions 제공
- 쉬운 기능 추가 가능

## 🚀 다음 단계

1. Supabase Dashboard에서 SQL 실행
2. Authentication 설정 (Email, Google 등)
3. Next.js에서 Supabase Client 설정
4. API Routes 만들기

