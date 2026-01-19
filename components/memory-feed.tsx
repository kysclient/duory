"use client";

import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCoupleMemories, MemoryWithAuthor } from "@/lib/hooks/use-memories";
import { CommentSheet } from "@/components/comment-sheet";
import { MemoryFeedSkeleton } from "@/components/memory-feed-skeleton";
import { ImageViewerModal } from "@/components/image-viewer-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export interface MemoryWithFirstComment extends MemoryWithAuthor {
  first_comment?: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    author?: {
      nickname: string;
      avatar_url: string;
    };
  };
}

interface MemoryFeedProps {
  publicOnly?: boolean; // 전체 공개 메모리만 표시할지 여부
}

export function MemoryFeed({ publicOnly = false }: MemoryFeedProps) {
  const { user } = useAuth();
  const { memories: rawMemories, loading, error, refresh, toggleLike, deleteMemory } = useCoupleMemories({ publicOnly });
  const [memories, setMemories] = useState<MemoryWithFirstComment[]>([]);
  
  // 댓글 시트 상태 관리
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  // 이미지 뷰어 상태 관리
  const [activeImages, setActiveImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  // Popover 상태 관리
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  // AlertDialog 상태 관리
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);

  // 각 메모리의 첫 번째 댓글 가져오기
  useEffect(() => {
    const fetchFirstComments = async () => {
      if (!rawMemories || rawMemories.length === 0) {
        setMemories([]);
        return;
      }

      const memoriesWithComments = await Promise.all(
        rawMemories.map(async (memory) => {
          try {
            const { data: comments } = await supabase
              .from("memory_comments")
              .select(`
                id,
                content,
                user_id,
                created_at,
                author:users!user_id (
                  nickname,
                  avatar_url
                )
              `)
              .eq("memory_id", memory.id)
              .order("created_at", { ascending: true })
              .limit(1);

            return {
              ...memory,
              first_comment: comments && comments.length > 0 ? comments[0] : undefined,
            } as MemoryWithFirstComment;
          } catch (error) {
            console.error("첫 댓글 조회 실패:", error);
            return { ...memory } as MemoryWithFirstComment;
          }
        })
      );

      setMemories(memoriesWithComments);
    };

    fetchFirstComments();
  }, [rawMemories]);

  const handleCommentClick = (id: string) => {
    setActiveMemoryId(id);
    setIsCommentOpen(true);
  };

  const handleCommentAdded = () => {
    // 실시간 구독이 자동으로 업데이트하므로 수동 refresh 불필요
    // refresh(); 
  };

  const handleLikeClick = (id: string, isLiked: boolean) => {
    toggleLike(id, isLiked);
  };

  const handleImageClick = (images: string[], index: number) => {
    setActiveImages(images);
    setActiveImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    setMemoryToDelete(memoryId);
    setDeleteDialogOpen(true);
    setOpenPopoverId(null); // Popover 닫기
  };

  const confirmDelete = async () => {
    if (!memoryToDelete) return;

    const success = await deleteMemory(memoryToDelete);
    if (success) {
      toast.success("추억이 삭제되었습니다", {
        description: "삭제된 추억은 복구할 수 없습니다."
      });
      setDeleteDialogOpen(false);
      setMemoryToDelete(null);
    } else {
      toast.error("삭제 실패", {
        description: "다시 시도해주세요."
      });
    }
  };

  if (loading) {
    return <MemoryFeedSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center p-4 text-center text-muted-foreground">
        <p>추억을 불러올 수 없어요 😢<br/>{error}</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
        <Image src="/heart.png" alt="Empty" width={60} height={60} className="opacity-20 grayscale" />
        <p>아직 기록된 추억이 없어요.<br/>오른쪽 아래 버튼을 눌러 첫 추억을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {memories.map((memory) => {
        const isLiked = memory.is_liked || false;
        const images = memory.images || [];
        const date = dayjs(memory.memory_date).format("YYYY년 M월 D일");
        const timeAgo = dayjs(memory.created_at).fromNow();

        return (
          <article key={memory.id} className="border-b border-border bg-background pb-4 last:border-none">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-muted">
                  <Image
                    src={memory.author?.avatar_url || "/heart.png"}
                    alt="profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{memory.author?.nickname || "알 수 없음"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{date}</span>
                    <span>•</span>
                    <span>{memory.location || timeAgo}</span>
                  </div>
                </div>
              </div>
              
              {/* More 버튼 with Popover */}
              <Popover 
                open={openPopoverId === memory.id} 
                onOpenChange={(open) => setOpenPopoverId(open ? memory.id : null)}
              >
                <PopoverTrigger asChild>
                  <button className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                
                {/* 본인이 작성한 추억만 삭제 가능 */}
                {user?.id === memory.created_by && (
                  <PopoverContent align="end" className="w-40 p-0">
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>삭제하기</span>
                    </button>
                  </PopoverContent>
                )}
              </Popover>
            </div>

            {/* 내용 */}
            {memory.content && (
              <div className="px-4 pb-3">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {memory.content}
                </p>
              </div>
            )}

            {/* 이미지 그리드 */}
            {images.length > 0 && (
              <div className={cn(
                "overflow-hidden bg-muted",
                images.length === 1 ? "aspect-square" : 
                images.length === 2 ? "aspect-2/1 grid grid-cols-2 gap-0.5" : 
                "aspect-square grid grid-cols-2 gap-0.5"
              )}>
                {images.map((url, index) => (
                  <button
                    key={index} 
                    onClick={() => handleImageClick(images, index)}
                    className={cn(
                      "relative h-full w-full bg-muted cursor-pointer active:opacity-80",
                      images.length === 3 && index === 0 ? "row-span-2" : ""
                    )}
                  >
                    <Image
                      src={url}
                      alt={`memory-${index}`}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center gap-4 px-4 py-3">
              <button
                onClick={() => handleLikeClick(memory.id, isLiked)}
                className="group flex items-center gap-1.5 transition-colors"
              >
                <Heart
                  className={cn(
                    "h-6 w-6 transition-all group-active:scale-90",
                    isLiked ? "fill-rose-500 text-rose-500" : "text-foreground"
                  )}
                  strokeWidth={isLiked ? 0 : 1.5}
                />
                {memory.likes_count > 0 && (
                  <span className="text-sm font-medium">
                    {memory.likes_count}
                  </span>
                )}
              </button>

              <button 
                onClick={() => handleCommentClick(memory.id)}
                className="group flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="h-6 w-6 text-foreground transition-all group-active:scale-90" strokeWidth={1.5} />
                {memory.comments_count > 0 && (
                  <span className="text-sm font-medium">{memory.comments_count}</span>
                )}
              </button>
            </div>

            {/* 댓글 영역 (Instagram 스타일) */}
            <div className="px-4 space-y-1">
              {/* 좋아요 수 */}
              {memory.likes_count > 0 && (
                <div className="text-sm font-semibold">
                  좋아요 {memory.likes_count}개
                </div>
              )}

              {/* 첫 번째 댓글 */}
              {memory.first_comment && (
                <button
                  onClick={() => handleCommentClick(memory.id)}
                  className="block w-full text-left transition-opacity active:opacity-60"
                >
                  <p className="text-sm leading-snug">
                    <span className="font-semibold mr-1.5">
                      {memory.first_comment.author?.nickname || "알 수 없음"}
                    </span>
                    <span className="text-foreground/90">
                      {memory.first_comment.content}
                    </span>
                  </p>
                </button>
              )}

              {/* 댓글 더보기 */}
              {memory.comments_count > 1 && (
                <button
                  onClick={() => handleCommentClick(memory.id)}
                  className="block text-sm text-muted-foreground transition-opacity active:opacity-60"
                >
                  댓글 {memory.comments_count}개 모두 보기
                </button>
              )}

              {/* 작성 시간 */}
              <div className="text-xs text-muted-foreground pt-0.5">
                {timeAgo}
              </div>
            </div>

            {/* 하단 여백 */}
            <div className="h-3" />
          </article>
        );
      })}

      {/* 댓글 Bottom Sheet */}
      {activeMemoryId && (
        <CommentSheet
          memoryId={activeMemoryId}
          isOpen={isCommentOpen}
          onOpenChange={setIsCommentOpen}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* 이미지 뷰어 */}
      <ImageViewerModal
        images={activeImages}
        initialIndex={activeImageIndex}
        isOpen={isImageViewerOpen}
        onOpenChange={setIsImageViewerOpen}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>추억을 삭제하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 추억은 복구할 수 없습니다. 정말로 삭제하시겠어요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
