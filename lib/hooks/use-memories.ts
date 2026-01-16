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

export function useCoupleMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isBackground: true면 로딩 상태를 변경하지 않음 (깜빡임 방지)
  const fetchMemories = useCallback(async (isBackground = false) => {
    if (!user?.couple_id) {
      setLoading(false);
      return;
    }

    if (!isBackground) {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. 메모리 데이터 조회
      const { data: memoriesData, error: memoriesError } = await supabase
        .from("memories")
        .select(`
          *,
          author:users!created_by (
            nickname,
            avatar_url
          )
        `)
        .eq("couple_id", user.couple_id)
        .order("memory_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (memoriesError) throw memoriesError;

      // 2. 좋아요 상태 조회
      const memoryIds = memoriesData?.map(m => m.id) || [];
      let likedMemoryIds = new Set<string>();

      if (memoryIds.length > 0) {
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
  }, [user?.couple_id, user?.id]);

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
  const toggleLike = async (memoryId: string, currentIsLiked: boolean) => {
    if (!user) return;

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

  return { 
    memories, 
    loading, 
    error, 
    refresh: () => fetchMemories(true), // 수동 리프레시도 백그라운드로
    toggleLike
  };
}
