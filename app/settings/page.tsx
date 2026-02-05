"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
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
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  UserX,
  Download,
  Info,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { useFcmToken } from "@/hooks/use-fcm-token";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { notificationPermissionStatus, requestForToken } = useFcmToken();
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  const handleEnableNotifications = async () => {
    console.log(" ??");
    if (notificationPermissionStatus === "granted") {
      toast.success("이미 알림이 설정되어 있습니다.");
      return;
    }

    if (notificationPermissionStatus === "denied") {
      toast.error(
        "알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.",
      );
      return;
    }

    if (typeof window !== "undefined" && !("Notification" in window)) {
      toast.error("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }

    setIsNotificationLoading(true);
    try {
      const token = await requestForToken();
      if (token) {
        toast.success("알림이 설정되었습니다.");
      } else {
        toast.error(
          "알림 설정에 실패했습니다.\n(HTTPS 또는 localhost 환경에서만 동작합니다)",
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("알림 설정 중 오류가 발생했습니다.");
    } finally {
      setIsNotificationLoading(false);
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeleting(true);

    try {
      // 1. 커플 연결 해제 (있는 경우)
      if (user.couple_id) {
        await supabase
          .from("users")
          .update({ couple_id: null })
          .eq("id", user.id);
      }

      // 2. 사용자가 생성한 모든 데이터 삭제 (CASCADE로 자동 삭제됨)
      // - 작성한 추억 (memories)
      // - 댓글 (memory_comments)
      // - 좋아요 (memory_likes)
      // - 기념일 (anniversaries)
      // - 초대 코드 (invite_codes)

      // 3. users 테이블에서 삭제 (모든 관련 데이터가 CASCADE로 삭제됨)
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteError) throw deleteError;

      toast.success("회원탈퇴가 완료되었습니다", {
        description: "그동안 Duory를 이용해주셔서 감사합니다.",
      });

      // 4. 로그아웃 및 환영 페이지로 이동
      await signOut();
      router.replace("/welcome");
    } catch (error: any) {
      console.error("회원탈퇴 실패:", error);
      toast.error("회원탈퇴에 실패했습니다", {
        description: error.message || "잠시 후 다시 시도해주세요.",
      });
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // 데이터 다운로드
  const handleDownloadData = async () => {
    if (!user?.id) return;

    try {
      toast.info("데이터를 준비하는 중입니다...");

      // 사용자 데이터 수집
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: memories } = await supabase
        .from("memories")
        .select("*")
        .eq("created_by", user.id);

      const { data: anniversaries } = await supabase
        .from("anniversaries")
        .select("*")
        .eq("created_by", user.id);

      const exportData = {
        exported_at: new Date().toISOString(),
        user: userData,
        memories: memories || [],
        anniversaries: anniversaries || [],
      };

      // JSON 파일 다운로드
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `duory_data_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("데이터 다운로드가 완료되었습니다");
    } catch (error) {
      console.error("데이터 다운로드 실패:", error);
      toast.error("데이터 다운로드에 실패했습니다");
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
              <span>개인정보 설정</span>
            </button>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* 약관 및 정책 */}
          <div>
            <h3 className="mb-3 px-1 text-xs font-semibold text-muted-foreground">
              약관 및 정책
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/terms")}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">서비스 이용약관</div>
                    <div className="text-xs text-muted-foreground">
                      Duory 이용 약관
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => router.push("/privacy")}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">개인정보 처리방침</div>
                    <div className="text-xs text-muted-foreground">
                      개인정보 보호 정책
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* 데이터 관리 */}
          <div>
            <h3 className="mb-3 px-1 text-xs font-semibold text-muted-foreground">
              데이터 관리
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleDownloadData}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      내 데이터 다운로드
                    </div>
                    <div className="text-xs text-muted-foreground">
                      추억, 기념일 등 내보내기
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* 알림 설정 */}
          <div>
            <h3 className="mb-3 px-1 text-xs font-semibold text-muted-foreground">
              알림
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleEnableNotifications}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">알림 설정</div>
                    <div className="text-xs text-muted-foreground">
                      {notificationPermissionStatus === "granted"
                        ? "알림이 켜져있습니다"
                        : notificationPermissionStatus === "denied"
                          ? "알림이 차단되었습니다"
                          : "터치하여 알림 켜기"}
                    </div>
                  </div>
                </div>
                {isNotificationLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : notificationPermissionStatus === "granted" ? (
                  <div className="text-xs text-primary font-medium">ON</div>
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* 앱 정보 */}
          <div>
            <h3 className="mb-3 px-1 text-xs font-semibold text-muted-foreground">
              앱 정보
            </h3>
            <div className="space-y-2">
              <div className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">버전 정보</div>
                    <div className="text-xs text-muted-foreground">
                      현재 버전
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  1.0.0
                </div>
              </div>
            </div>
          </div>

          {/* 위험 영역 */}
          <div>
            <h3 className="mb-3 px-1 text-xs font-semibold text-destructive">
              위험 영역
            </h3>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-destructive/20 bg-card p-4 text-destructive transition-colors hover:bg-destructive/5 active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <UserX className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">회원탈퇴</div>
                  <div className="text-xs text-muted-foreground">
                    계정 및 모든 데이터 삭제
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      {/* 회원탈퇴 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              정말 탈퇴하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              회원탈퇴 확인
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              탈퇴 시 다음 데이터가 영구 삭제됩니다:
            </p>

            <div className="space-y-2 rounded-lg bg-muted p-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 프로필 정보 (닉네임, 사진)</li>
                <li>• 커플 연결 정보</li>
                <li>• 작성한 모든 추억 및 사진</li>
                <li>• 댓글 및 좋아요</li>
                <li>• 기념일 정보</li>
              </ul>
            </div>

            <div className="rounded-lg border-l-4 border-destructive bg-destructive/10 p-3">
              <p className="text-xs leading-relaxed text-foreground">
                ⚠️ <strong>되돌릴 수 없습니다.</strong> 탈퇴 후 동일한 계정으로
                재가입해도 데이터는 복구되지 않습니다.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              데이터 백업이 필요하시면 '내 데이터 다운로드' 기능을 먼저
              이용해주세요.
            </p>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isDeleting} className="flex-1">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "처리 중..." : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
