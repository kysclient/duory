-- ============================================
-- memories 테이블에 위치 데이터 컬럼 추가
-- ============================================

-- 기존 location 컬럼을 삭제하고 location_data JSONB 컬럼 추가
ALTER TABLE public.memories 
  DROP COLUMN IF EXISTS location,
  ADD COLUMN IF NOT EXISTS location_data JSONB;

-- location_data 컬럼에 인덱스 추가 (JSONB 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_memories_location_data 
  ON public.memories USING gin(location_data);

-- location_data 컬럼에 대한 코멘트 추가
COMMENT ON COLUMN public.memories.location_data IS '위치 정보를 저장하는 JSONB 컬럼. 구조: {"name": "장소명", "address": "주소", "roadAddress": "도로명주소", "category": "카테고리", "lat": 위도, "lng": 경도}';

-- ============================================
-- 사용 예시
-- ============================================
-- 위치 데이터가 있는 추억 조회:
-- SELECT * FROM memories WHERE location_data IS NOT NULL;
--
-- 특정 위치명으로 검색:
-- SELECT * FROM memories WHERE location_data->>'name' = '강남역';
--
-- 위도/경도로 검색:
-- SELECT * FROM memories WHERE (location_data->>'lat')::numeric BETWEEN 37.0 AND 38.0;
