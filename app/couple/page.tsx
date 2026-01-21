"use client";

import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  UserX,
  Copy,
  RefreshCw,
  Check,
  Lightbulb,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { createInviteCode, getActiveInviteCode } from "@/lib/api/invite-codes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";

const formatRemainingTime = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();

  if (diffMs <= 0) return "만료됨";

  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}분 남았어요`;
  if (minutes === 0) return `${hours}시간 남았어요`;
  return `${hours}시간 ${minutes}분 남았어요`;
};

export default function CouplePage() {
  const { user, couple, partner, daysCount, signOut } = useAuth();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<string>("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [remainingText, setRemainingText] = useState<string | null>(null);
  const [isBreakupOpen, setIsBreakupOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeLoading, setCodeLoading] = useState(true);

  // 초대코드 가져오기 또는 생성
  useEffect(() => {
    const fetchOrCreateInviteCode = async () => {
      if (!user?.id) return;
      
      setCodeLoading(true);
      try {
        // 기존 활성 코드 가져오기
        const existingCode = await getActiveInviteCode(user.id);
        
        if (existingCode) {
          setInviteCode(existingCode.code);
          setInviteExpiresAt(existingCode.expiresAt);
        } else {
          // 없으면 새로 생성
          const newCode = await createInviteCode(user.id);
          const refreshedCode = await getActiveInviteCode(user.id);
          setInviteCode(refreshedCode?.code ?? newCode);
          setInviteExpiresAt(refreshedCode?.expiresAt ?? null);
        }
      } catch (error) {
        console.error("초대코드 처리 실패:", error);
      } finally {
        setCodeLoading(false);
      }
    };

    fetchOrCreateInviteCode();
  }, [user?.id]);

  useEffect(() => {
    if (!inviteExpiresAt) {
      setRemainingText(null);
      return;
    }

    const updateRemainingText = () => {
      setRemainingText(formatRemainingTime(inviteExpiresAt));
    };

    updateRemainingText();
    const interval = setInterval(updateRemainingText, 30000);
    return () => clearInterval(interval);
  }, [inviteExpiresAt]);

  // 초대코드 복사
  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 초대코드 재발급
  const handleRegenerateCode = async () => {
    if (!user?.id) return;
    setIsProcessing(true);

    try {
      // 기존 코드 무효화
      const { error: updateError } = await supabase
        .from("invite_codes")
        .update({ used: true })
        .eq("created_by", user.id)
        .eq("used", false);

      if (updateError) throw updateError;

      // 새 코드 생성
      const newCode = await createInviteCode(user.id);
      const refreshedCode = await getActiveInviteCode(user.id);
      setInviteCode(refreshedCode?.code ?? newCode);
      setInviteExpiresAt(refreshedCode?.expiresAt ?? null);
      setIsRegenerateOpen(false);
      toast.success("초대코드가 재발급되었습니다", {
        description: "새로운 코드를 공유해주세요."
      });
    } catch (error) {
      console.error("초대코드 재발급 실패:", error);
      toast.error("초대코드 재발급 실패", {
        description: "다시 시도해주세요."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 커플 끊기 (커플이 없으면 토스트 띄우기)
  const handleBreakupClick = () => {
    if (!couple || !user?.couple_id) {
      toast.error("연결된 커플이 없습니다", {
        description: "커플을 먼저 연결해주세요."
      });
      return;
    }
    setIsBreakupOpen(true);
  };

  // 커플 끊기 실행
  const handleBreakup = async () => {
    // couple 객체와 couple_id 모두 체크
    if (!couple || !user?.couple_id || !couple.user1_id || !couple.user2_id) {
      toast.error("커플 정보를 찾을 수 없습니다", {
        description: "페이지를 새로고침해주세요."
      });
      setIsBreakupOpen(false);
      return;
    }
    
    setIsProcessing(true);

    try {
      // users 테이블에서 couple_id 제거
      const { error: user1Error } = await supabase
        .from("users")
        .update({ couple_id: null })
        .eq("id", couple.user1_id);

      if (user1Error) throw user1Error;

      const { error: user2Error } = await supabase
        .from("users")
        .update({ couple_id: null })
        .eq("id", couple.user2_id);

      if (user2Error) throw user2Error;

      // couples 테이블에서 삭제
      const { error: deleteError } = await supabase
        .from("couples")
        .delete()
        .eq("id", user.couple_id);

      if (deleteError) throw deleteError;

      // 성공 토스트
      toast.success("커플 연결이 해제되었습니다", {
        description: "다시 연결하려면 초대코드를 사용하세요."
      });

      // 로그아웃 및 환영 페이지로 이동
      await signOut();
      router.replace("/welcome");
    } catch (error) {
      console.error("커플 끊기 실패:", error);
      toast.error("커플 끊기 실패", {
        description: "다시 시도해주세요."
      });
      setIsProcessing(false);
      setIsBreakupOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>커플 관리</span>
            </button>
          </div>
        </header>

        {/* 커플 정보 카드 */}
        <div className="border-b border-border p-6">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 via-rose-400 to-amber-300 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Image
                  src="/heart.png"
                  alt="커플"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">
              {couple?.couple_name || "우리 커플"}
            </h2>
            <div className="text-sm text-muted-foreground">
              {couple?.start_date
                ? `${dayjs(couple.start_date).format("YYYY. MM. DD")} 부터`
                : "만난 날을 설정해주세요"}
            </div>
            <div className="mt-2 text-lg font-semibold text-primary">
              D+{daysCount}
            </div>
          </div>
        </div>

        {/* 커플 멤버 */}
        <div className="border-b border-border p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            커플 멤버
          </h3>
          <div className="space-y-3">
            {/* 본인 */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-foreground/10 flex items-center justify-center">
                <Image
                  src={user?.avatar_url || "/heart.png"}
                  alt="내 프로필"
                  width={48}
                  height={48}
                  className="object-cover p-2"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{user?.nickname || "나"}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                </div>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                나
              </div>
            </div>

            {/* 파트너 */}
            {partner && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-foreground/10 flex items-center justify-center">
                  <Image
                    src={partner?.avatar_url || "/heart.png"}
                    alt="파트너 프로필"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {partner?.nickname || "파트너"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {partner?.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 초대코드 - connect 페이지 스타일 적용 */}
        <div className="border-b border-border p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            초대코드
          </h3>
          
          {codeLoading ? (
            <div className="rounded-3xl border-2 border-muted bg-muted/30 p-6">
              <div className="text-center text-muted-foreground">
                로딩 중...
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border-2 border-muted bg-muted/30 p-6">
                <div className="space-y-4 text-center">
                  <div className="text-xs font-medium text-muted-foreground">
                    {couple 
                      ? "현재 사용 중인 초대 코드"
                      : "연인에게 공유할 초대 코드"}
                  </div>
                  <div className="text-5xl font-bold tracking-widest">
                    {inviteCode || "없음"}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    disabled={!inviteCode}
                    className="mx-auto flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95 disabled:opacity-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        복사 완료!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        코드 복사하기
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 재발급 버튼 */}
              <div className="mt-4">
                <Dialog
                  open={isRegenerateOpen}
                  onOpenChange={setIsRegenerateOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!inviteCode}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      초대코드 재발급
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-6 sm:p-7">
                    <DialogHeader className="space-y-2 text-center">
                      <DialogTitle>초대코드 재발급</DialogTitle>
                      <DialogDescription className="leading-relaxed">
                        기존 초대코드가 무효화되고 새로운 코드가
                        발급됩니다.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-3 sm:gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setIsRegenerateOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleRegenerateCode}
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                      >
                        {isProcessing ? "발급 중..." : "재발급"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* 안내 */}
              <div className="mt-4 space-y-2 text-center text-xs text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-[#1DA1F2]" />
                  <span>연인이 코드를 입력하면 자동으로 연결돼요</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#1DA1F2]" />
                  <span>
                    {remainingText
                      ? remainingText === "만료됨"
                        ? "코드가 만료되었어요. 재발급해주세요."
                        : `만료까지 ${remainingText}`
                      : "코드는 24시간 동안 유효해요"}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* 커플 정보 */}
        <div className="border-b border-border p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            커플 정보
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">커플 ID</div>
              <div className="font-mono text-xs">
                {user?.couple_id 
                  ? `${user.couple_id.substring(0, 10)}...` 
                  : "-"}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">생성일</div>
              <div className="text-sm">
                {couple?.created_at
                  ? dayjs(couple.created_at).format("YYYY. MM. DD")
                  : "-"}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">함께한 날</div>
              <div className="text-sm font-semibold">{daysCount}일</div>
            </div>
          </div>
        </div>

        {/* 위험 영역 */}
        <div className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            위험 영역
          </h3>
          
          <Dialog open={isBreakupOpen} onOpenChange={setIsBreakupOpen}>
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={handleBreakupClick}
            >
              커플 끊기
            </Button>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl">
                    정말 커플을 끊으시겠습니까?
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    커플 연결을 해제하면 모든 데이터가 삭제됩니다.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <p className="text-sm font-semibold text-foreground">
                    되돌릴 수 없는 작업입니다.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-foreground">
                      다음 데이터가 영구적으로 삭제됩니다:
                    </p>
                    <ul className="ml-4 space-y-2 text-sm text-muted-foreground">
                      <li>• 커플 정보 및 기념일</li>
                      <li>• 공유했던 모든 추억과 사진</li>
                      <li>• 대화 내용 및 댓글</li>
                      <li>• 캘린더 일정 및 메모</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-muted p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      삭제된 데이터는 최대 30일간 임시 보관되며, 이후 완전히 삭제됩니다. 
                      복구를 원하시면 고객센터로 문의해주세요.
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsBreakupOpen(false)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleBreakup}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? "처리 중..." : "끊기"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
