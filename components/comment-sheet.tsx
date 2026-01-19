"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MoveUp, Send, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Comment {
  id: string;
  memory_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    nickname: string;
    avatar_url: string;
  };
}

interface CommentSheetProps {
  memoryId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentAdded?: () => void; // 댓글 수 업데이트용
}

export function CommentSheet({ memoryId, isOpen, onOpenChange, onCommentAdded }: CommentSheetProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 댓글 불러오기
  const fetchComments = async () => {
    if (!memoryId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("memory_comments") // 테이블명 수정: comments -> memory_comments
        .select(`
          *,
          author:users!user_id (
            nickname,
            avatar_url
          )
        `)
        .eq("memory_id", memoryId)
        .order("created_at", { ascending: true }); // 댓글은 시간순

      if (error) throw error;

      const formattedComments: Comment[] = (data || []).map((item: any) => ({
        ...item,
        author: item.author
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, memoryId]);

  // 댓글 작성
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("memory_comments") // 테이블명 수정: comments -> memory_comments
        .insert({
          memory_id: memoryId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      await fetchComments(); // 목록 새로고침
      onCommentAdded?.(); // 부모 컴포넌트에 알림 (카운트 증가 등)
      
      // 키보드 유지 (모바일 UX)
      inputRef.current?.focus();

    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error("댓글 작성 실패", {
        description: "다시 시도해주세요."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle className="text-center text-base font-semibold">댓글</DrawerTitle>
          <DrawerDescription className="sr-only">댓글 목록</DrawerDescription>
        </DrawerHeader>

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground opacity-60">
              <MessageSquareDashed className="h-10 w-10" strokeWidth={1.5} />
              <p className="text-sm">아직 댓글이 없어요.<br />첫 번째 댓글을 남겨보세요!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-muted border border-border/50">
                    <Image
                      src={comment.author?.avatar_url || "/heart.png"}
                      alt="profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{comment.author?.nickname || "알 수 없음"}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {dayjs(comment.created_at).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed break-all">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 댓글 입력창 (하단 고정) */}
        <div className="border-t bg-background p-3 pb-8 sm:pb-3">
          <form 
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-2 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-colors"
          >
            <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-muted">
              <Image
                src={user?.avatar_url || "/heart.png"}
                alt="my profile"
                fill
                className="object-cover"
              />
            </div>
            <input
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`@${user?.nickname || "나"} (으)로 댓글 달기...`}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              disabled={submitting}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                newComment.trim() 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-muted-foreground"
              )}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoveUp className="h-4 w-4 ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// 아이콘 컴포넌트 추가
function MessageSquareDashed({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  );
}

