"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { uploadToSupabase } from "@/lib/api/upload-supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, supabaseUser, loading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState<"nickname" | "photo">("nickname");
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return; // 로딩 중이면 아무것도 안 함

    // 우선순위: 로그인 체크 → 프로필 체크
    if (!supabaseUser) {
      router.replace("/auth");
      return;
    }

    // user가 있고 nickname이 있으면 connect로 (이미 온보딩 완료)
    // user가 null이거나 nickname이 없으면 여기서 온보딩 진행
    if (user && user.nickname) {
      router.replace("/connect");
      return;
    }
  }, [authLoading, supabaseUser, user, router]);

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setStep("photo");
    }
  };

  const handlePhotoSkip = async () => {
    if (!supabaseUser || uploading) return;

    setUploading(true);

    try {
      let avatarUrl: string | undefined;

      // 프로필 사진이 있으면 업로드
      if (avatarFile) {
        avatarUrl = await uploadToSupabase(avatarFile, "avatars");
      }

      // users 테이블에 사용자 정보 저장/업데이트
      const { error } = await supabase.from("users").upsert({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        nickname: nickname.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // 사용자 정보 새로고침
      await refreshUser();

      // connect 페이지로 이동 (router.push 대신 router.replace)
      router.replace("/connect");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      // AbortError는 무시 (페이지 이동으로 인한 정상적인 취소)
      if (error.name !== 'AbortError') {
        toast.error("프로필 저장 실패", {
          description: "프로필 저장 중 오류가 발생했습니다."
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  // 인증 로딩 중이거나 supabaseUser가 없으면 로딩 표시
  if (authLoading || !supabaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">로딩 중...</div>
          <div className="text-xs text-muted-foreground">
            인증 정보를 확인하고 있어요
          </div>
        </div>
      </div>
    );
  }

  // user가 있고 nickname이 있으면 리다이렉트 중 (화면 깜빡임 방지)
  if (user && user.nickname) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">잠시만 기다려주세요...</div>
        </div>
      </div>
    );
  }

  if (step === "nickname") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* 진행바 */}
        <div className="h-1 bg-muted">
          <div className="h-full w-1/2 bg-foreground transition-all duration-300" />
        </div>

        {/* 컨텐츠 */}
        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="flex-1 pt-12">
            <div className="mx-auto max-w-md space-y-6">
              {/* 질문 */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">어떻게 부르면 될까요?</h1>
                <p className="text-base text-muted-foreground">
                  연인이 보게 될 닉네임이에요
                </p>
              </div>

              {/* 입력 */}
              <form onSubmit={handleNicknameSubmit} className="space-y-6">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  className="w-full border-b-2 border-border bg-transparent pb-3 text-xl font-medium transition-colors focus:border-foreground focus:outline-none"
                  maxLength={20}
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!nickname.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  다음
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 진행바 */}
      <div className="h-1 bg-muted">
        <div className="h-full w-full bg-foreground transition-all duration-300" />
      </div>

      {/* 컨텐츠 */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1 pt-12">
          <div className="mx-auto max-w-md space-y-6">
            {/* 질문 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                프로필 사진을
                <br />
                추가할까요?
              </h1>
              <p className="text-base text-muted-foreground">
                나중에 언제든 변경할 수 있어요
              </p>
            </div>

            {/* 프로필 사진 업로드 */}
            <div className="flex flex-col items-center space-y-4">
              <label htmlFor="avatar-upload" className="group cursor-pointer">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted transition-all hover:bg-muted/80">
                  {avatarFile ? (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

              <label
                htmlFor="avatar-upload"
                className="cursor-pointer rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95"
              >
                {avatarFile ? "사진 변경하기" : "사진 선택하기"}
              </label>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="space-y-2">
          <button
            onClick={handlePhotoSkip}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "저장 중..." : "다음"}
            {!uploading && <ArrowRight className="h-4 w-4" />}
          </button>

          <button
            onClick={handlePhotoSkip}
            disabled={uploading}
            className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}
