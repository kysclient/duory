"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  createInviteCode,
  connectWithInviteCode,
} from "@/lib/api/invite-codes";

type Step = "choice" | "create-code" | "enter-code";

export default function ConnectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("choice");
  const [inviteCode, setInviteCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return; // 로딩 중이면 아무것도 안 함

    // 우선순위: 로그인 체크 → 커플 체크
    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.couple_id) {
      router.replace("/");
      return;
    }
  }, [authLoading, user, router]);

  // 코드 생성
  const generateCode = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const code = await createInviteCode(user.id);
      setInviteCode(code);
      setStep("create-code");
    } catch (error: any) {
      console.error("Error generating code:", error);
      setError(error.message || "코드 생성 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 클립보드 복사
  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 코드로 연결
  const handleConnect = async () => {
    if (!user || inputCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const result = await connectWithInviteCode(inputCode, user.id);

      if (!result.success) {
        setError(result.error || "연결에 실패했습니다");
        return;
      }

      // 연결 성공! 메인 페이지로 이동
      router.replace("/");
    } catch (error: any) {
      console.error("Error connecting:", error);
      // AbortError는 무시
      if (error.name !== 'AbortError') {
        setError("연결 중 오류가 발생했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  // 선택 화면
  if (step === "choice") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* 헤더 */}
        <div className="flex items-center p-4">
          <div className="flex flex-row items-center">
            <Image
              src="/logo_v1.png"
              alt="Duory"
              width={215}
              height={112}
              className="h-7 w-auto"
            />
            <span className="text-base font-semibold">Duory</span>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="flex flex-1 flex-col justify-center px-6">
          <div className="mx-auto w-full max-w-md space-y-8">
            {/* 타이틀 */}
            <div className="space-y-2 text-center">
              <div className="mb-4 flex justify-center">
                <Image
                  src="/heart.png"
                  alt="heart"
                  width={64}
                  height={64}
                  className="h-16 w-16"
                />
              </div>
              <h1 className="text-2xl font-bold">연인과 연결해볼까요?</h1>
              <p className="text-base text-muted-foreground">
                코드로 간편하게 연결할 수 있어요
              </p>
            </div>

            {/* 선택 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={generateCode}
                disabled={loading}
                className="group w-full rounded-2xl border-2 border-border bg-background p-5 text-left transition-all hover:border-foreground hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="space-y-1">
                  <div className="text-lg font-bold">코드 만들기</div>
                  <p className="text-sm text-muted-foreground">
                    연인에게 공유할 코드를 생성해요
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-medium">
                  새로 시작하기
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => setStep("enter-code")}
                className="group w-full rounded-2xl border-2 border-border bg-background p-5 text-left transition-all hover:border-foreground hover:bg-muted active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <div className="text-lg font-bold">코드 입력하기</div>
                  <p className="text-sm text-muted-foreground">
                    받은 코드를 입력하고 연결해요
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-medium">
                  코드가 있어요
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 코드 생성 완료 화면
  if (step === "create-code") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* 뒤로가기 */}
        <button
          onClick={() => setStep("choice")}
          className="absolute left-4 top-4 p-2 text-muted-foreground hover:text-foreground"
        >
          ← 뒤로
        </button>

        {/* 컨텐츠 */}
        <div className="flex flex-1 flex-col justify-center px-6">
          <div className="mx-auto w-full max-w-md space-y-8">
            {/* 타이틀 */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">코드가 생성됐어요!</h1>
              <p className="text-base text-muted-foreground">
                연인에게 이 코드를 공유해주세요
              </p>
            </div>

            {/* 코드 표시 */}
            <div className="rounded-3xl border-2 border-muted bg-muted/30 p-6">
              <div className="space-y-4 text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  초대 코드
                </div>
                <div className="text-5xl font-bold tracking-widest">
                  {inviteCode}
                </div>
                <button
                  onClick={copyCode}
                  className="mx-auto flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95"
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

            {/* 안내 */}
            <div className="space-y-2 text-center text-xs text-muted-foreground">
              <p>💡 연인이 코드를 입력하면 자동으로 연결돼요</p>
              <p>⏰ 코드는 24시간 동안 유효해요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 코드 입력 화면
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 뒤로가기 */}
      <button
        onClick={() => {
          setStep("choice");
          setError("");
          setInputCode("");
        }}
        className="absolute left-4 top-4 p-2 text-muted-foreground hover:text-foreground"
      >
        ← 뒤로
      </button>

      {/* 컨텐츠 */}
      <div className="flex flex-1 flex-col justify-between p-6 pt-20">
        <div className="flex-1">
          <div className="mx-auto max-w-md space-y-8">
            {/* 타이틀 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                초대 코드를
                <br />
                입력해주세요
              </h1>
              <p className="text-base text-muted-foreground">
                연인이 공유한 6자리 코드에요
              </p>
            </div>

            {/* 코드 입력 */}
            <div>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase().slice(0, 6));
                  setError("");
                }}
                placeholder="코드 입력"
                className="w-full border-b-2 border-border bg-transparent pb-3 text-center text-4xl font-bold uppercase tracking-widest transition-colors focus:border-foreground focus:outline-none"
                maxLength={6}
                autoFocus
              />
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {inputCode.length}/6
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleConnect}
          disabled={inputCode.length !== 6 || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? "연결 중..." : "연결하기"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
