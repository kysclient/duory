"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, MessageCircle, MoreHorizontal, Play, Trash2, X } from "lucide-react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { cn } from "@/lib/utils";
import { MemoryWithAuthor } from "@/lib/hooks/use-memories";
import { CommentSheet } from "@/components/comment-sheet";
import { ImageViewerModal } from "@/components/image-viewer-modal";
import { VideoViewerModal } from "@/components/video-viewer-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface MemoryDetailModalProps {
  memory: MemoryWithAuthor | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: (memoryId: string) => void;
  onDelete: (memoryId: string) => Promise<boolean>;
  currentUserId?: string;
}

export function MemoryDetailModal({
  memory,
  isOpen,
  onOpenChange,
  onLike,
  onDelete,
  currentUserId,
}: MemoryDetailModalProps) {
  const { user } = useAuth();
  const [openPopover, setOpenPopover] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoUrl = memory?.videos?.[0];

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    const playPromise = videoRef.current.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => undefined);
    }
  }, [isOpen, videoUrl]);

  if (!memory) return null;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleLikeClick = () => {
    if (!memory) return;
    onLike(memory.id);
  };

  const handleDeleteClick = () => {
    setOpenPopover(false);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!memory) return;
    const success = await onDelete(memory.id);
    if (success) {
      toast.success("추억이 삭제되었습니다", {
        description: "삭제된 추억은 복구할 수 없습니다."
      });
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } else {
      toast.error("삭제 실패", {
        description: "다시 시도해주세요."
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-none h-dvh w-screen p-0 m-0 bg-background border-none flex flex-col overflow-hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* 헤더 */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold">추억</h2>
            {/* 액션 버튼 (피드와 동일) */}
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <button className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              {user?.id === memory.created_by && (
                <PopoverContent align="end" className="w-40 p-0">
                  <button
                    onClick={handleDeleteClick}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>삭제하기</span>
                  </button>
                </PopoverContent>
              )}
            </Popover>
          </div>

          {/* 컨텐츠 */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-lg">
              {/* 작성자 정보 */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={memory.author?.avatar_url || "/heart.png"}
                    alt={memory.author?.nickname || "사용자"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {memory.author?.nickname || "알 수 없음"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dayjs(memory.created_at).fromNow()}
                  </div>
                </div>
              </div>

              {/* 이미지 그리드 */}
              {!videoUrl && memory.images && memory.images.length > 0 && (
                <div
                  className={cn(
                    "grid gap-1 bg-muted",
                    memory.images.length === 1
                      ? "grid-cols-1"
                      : memory.images.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2"
                  )}
                >
                  {memory.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={cn(
                        "relative w-full overflow-hidden bg-muted transition-opacity hover:opacity-90",
                        memory?.images?.length === 1
                          ? "aspect-square max-h-[500px]"
                          : memory?.images?.length === 3 && index === 0
                          ? "row-span-2 aspect-square"
                          : "aspect-square"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`추억 이미지 ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 512px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 영상 */}
              {videoUrl && (
                <button
                  onClick={() => setIsVideoViewerOpen(true)}
                  className="relative aspect-video w-full overflow-hidden bg-black"
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    loop
                    autoPlay
                    preload="metadata"
                    poster="/heart.png"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
                      <Play className="h-6 w-6" />
                    </div>
                  </div>
                </button>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center gap-4 px-4 py-3">
                <button
                  onClick={handleLikeClick}
                  className="flex items-center gap-1.5 transition-transform active:scale-90"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6 transition-colors",
                      memory.is_liked
                        ? "fill-red-500 text-red-500"
                        : "text-foreground"
                    )}
                  />
                  {memory.likes_count > 0 && (
                    <span className="text-sm font-medium">
                      {memory.likes_count}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsCommentOpen(true)}
                  className="flex items-center gap-1.5 transition-transform active:scale-90"
                >
                  <MessageCircle className="h-6 w-6" />
                  {memory.comments_count > 0 && (
                    <span className="text-sm font-medium">
                      {memory.comments_count}
                    </span>
                  )}
                </button>
              </div>

              {/* 내용 */}
              {memory.content && (
                <div className="px-4 pb-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {memory.content}
                  </p>
                </div>
              )}

              {/* 날짜 */}
              <div className="px-4 pb-6 text-xs text-muted-foreground">
                {dayjs(memory.memory_date).format("YYYY년 M월 D일")}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 댓글 시트 */}
      {memory && (
        <CommentSheet
          memoryId={memory.id}
          isOpen={isCommentOpen}
          onOpenChange={setIsCommentOpen}
        />
      )}

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

      {/* 이미지 뷰어 */}
      {memory.images && memory.images.length > 0 && (
        <ImageViewerModal
          images={memory.images}
          initialIndex={selectedImageIndex}
          isOpen={isImageViewerOpen}
          onOpenChange={setIsImageViewerOpen}
        />
      )}

      {/* 영상 뷰어 */}
      {videoUrl && (
        <VideoViewerModal
          src={videoUrl}
          isOpen={isVideoViewerOpen}
          onOpenChange={setIsVideoViewerOpen}
        />
      )}
    </>
  );
}

