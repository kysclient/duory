-- Schedules Table (Calendar Events)
-- 이 테이블은 캘린더에 기념일 외의 '일정'을 추가하고 싶을 때 사용하세요.
-- Supabase SQL Editor에서 실행하시면 테이블이 생성됩니다.

CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  color TEXT DEFAULT 'primary', -- primary, red, blue, green, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view schedules"
  ON public.schedules FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can insert schedules"
  ON public.schedules FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can update schedules"
  ON public.schedules FOR UPDATE
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can delete schedules"
  ON public.schedules FOR DELETE
  USING (
    couple_id IN (
      SELECT couple_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_schedules_couple_id ON public.schedules(couple_id);
CREATE INDEX idx_schedules_start_time ON public.schedules(start_time);
