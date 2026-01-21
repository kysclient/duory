import { useEffect, useState, useCallback } from "react";
import { supabase, type Memory } from "../supabase";
import { useAuth } from "../auth-context";

// Memory 타입 확장 (작성자 정보 및 좋아요 상태 포함)
export interface MemoryWithAuthor extends Memory {
  author?: {
    nickname: string;
    avatar_url: string;
  };
  is_liked?: boolean;
}

interface UseMemoriesOptions {
  publicOnly?: boolean; // 전체 공개 메모리만 가져올지 여부
}

export function useCoupleMemories(options: UseMemoriesOptions = {}) {
  const { publicOnly = false } = options;
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isBackground: true면 로딩 상태를 변경하지 않음 (깜빡임 방지)
  const fetchMemories = useCallback(async (isBackground = false) => {
    // publicOnly일 때는 couple_id가 없어도 조회 가능
    if (!publicOnly && !user?.couple_id) {
      setLoading(false);
      return;
    }

    if (!isBackground) {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. 메모리 데이터 조회
      let query = supabase
        .from("memories")
        .select(`
          *,
          author:users!created_by (
            nickname,
            avatar_url
          )
        `);

      // 필터 적용
      if (publicOnly) {
        // 전체 공개 메모리만
        query = query.eq("is_public", true);
      } else if (user?.couple_id) {
        // 커플 메모리만 (우리끼리만 + 전체 공개)
        query = query.eq("couple_id", user.couple_id);
      }

      const { data: memoriesData, error: memoriesError } = await query
        .order("memory_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (memoriesError) throw memoriesError;

      // 2. 좋아요 상태 조회
      const memoryIds = memoriesData?.map(m => m.id) || [];
      let likedMemoryIds = new Set<string>();

      if (memoryIds.length > 0 && user?.id) {
        const { data: likesData, error: likesError } = await supabase
          .from("memory_likes")
          .select("memory_id")
          .eq("user_id", user.id)
          .in("memory_id", memoryIds);

        if (!likesError && likesData) {
          likesData.forEach(like => likedMemoryIds.add(like.memory_id));
        }
      }

      // 3. 데이터 병합
      const formattedMemories: MemoryWithAuthor[] = (memoriesData || []).map((item: any) => ({
        ...item,
        author: item.author,
        is_liked: likedMemoryIds.has(item.id),
      }));

      setMemories(formattedMemories);
    } catch (err: any) {
      console.error("Error fetching couple memories:", err);
      setError(err.message || "추억을 불러오는 중 오류가 발생했습니다.");
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [user?.couple_id, user?.id, publicOnly]);

  useEffect(() => {
    fetchMemories();

    if (!user?.couple_id) return;

    const memoryChannel = supabase
      .channel(`memories:couple:${user.couple_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memories",
          filter: `couple_id=eq.${user.couple_id}`,
        },
        () => fetchMemories(true) // 백그라운드 업데이트
      )
      .subscribe();

    const interactionChannel = supabase
      .channel(`interactions:${user.couple_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "memory_likes" }, () => fetchMemories(true))
      .on("postgres_changes", { event: "*", schema: "public", table: "memory_comments" }, () => fetchMemories(true))
      .subscribe();

    return () => {
      supabase.removeChannel(memoryChannel);
      supabase.removeChannel(interactionChannel);
    };
  }, [fetchMemories, user?.couple_id]);

  // 좋아요 토글 함수
  const toggleLike = async (memoryId: string, currentIsLiked?: boolean) => {
    if (!user?.id) return;

    const memory = memories.find(m => m.id === memoryId);
    const currentCount = memory?.likes_count || 0;

    // Optimistic Update
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        return {
          ...m,
          is_liked: !currentIsLiked,
          likes_count: currentCount + (currentIsLiked ? -1 : 1)
        };
      }
      return m;
    }));

    try {
      if (currentIsLiked) {
        // 좋아요 취소 (트리거가 likes_count 감소시킴)
        await supabase.from("memory_likes").delete().eq("memory_id", memoryId).eq("user_id", user.id);
      } else {
        // 좋아요 추가 (트리거가 likes_count 증가시킴)
        await supabase.from("memory_likes").insert({ memory_id: memoryId, user_id: user.id });
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      fetchMemories(true);
    }
  };

  // 추억 삭제 함수
  const deleteMemory = async (memoryId: string) => {
    if (!user?.id) return false;

    try {
      // Optimistic Update - 즉시 UI에서 제거
      setMemories(prev => prev.filter(m => m.id !== memoryId));

      // Supabase Storage에서 이미지 삭제
      const memory = memories.find(m => m.id === memoryId);
      if (memory?.images && memory.images.length > 0) {
        for (const imageUrl of memory.images) {
          // URL에서 storage 경로 추출
          const pathMatch = imageUrl.match(/\/duory-images\/(.+)$/);
          if (pathMatch) {
            const filePath = pathMatch[1];
            await supabase.storage.from("duory-images").remove([filePath]);
          }
        }
      }

      // DB에서 추억 삭제 (CASCADE로 댓글, 좋아요도 자동 삭제됨)
      const { error: deleteError } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId)
        .eq("created_by", user.id); // 본인이 작성한 것만 삭제 가능

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error("추억 삭제 실패:", error);
      fetchMemories(true); // 실패 시 데이터 다시 로드
      return false;
    }
  };

  const refresh = useCallback(() => fetchMemories(false), [fetchMemories]);

  return { 
    memories, 
    loading, 
    error, 
    refresh, // Pull-to-refresh는 로딩 표시
    toggleLike,
    deleteMemory
  };
}
