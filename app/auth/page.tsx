"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      console.log("🔗 Redirect URL:", redirectUrl);
      console.log("🔗 Full redirect:", `${redirectUrl}/onboarding`);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectUrl}/onboarding`,
        },
      });

      if (error) throw error;

      setMessage("이메일로 로그인 링크를 보냈어요! 메일함을 확인해주세요");
    } catch (error: any) {
      console.error("Error:", error);
      setMessage(error.message || "오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4">
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

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 flex-col justify-center px-6">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* 타이틀 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">반가워요!</h1>
            <p className="text-base text-muted-foreground">
              이메일로 시작해볼까요?
            </p>
          </div>

          {/* 이메일 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base transition-colors focus:border-foreground focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                "전송 중..."
              ) : (
                <>
                  계속하기
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {message && (
              <div className="rounded-xl bg-muted p-3 text-center text-sm">
                {message}
              </div>
            )}
          </form>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                supabase.auth.signInWithOAuth({ 
                  provider: 'google', 
                  options: { redirectTo: `${redirectUrl}/onboarding` } 
                });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-3.5 text-sm font-medium transition-all hover:bg-muted active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 시작하기
            </button>

            <button
              type="button"
              onClick={() => {
                const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                supabase.auth.signInWithOAuth({ 
                  provider: 'kakao', 
                  options: { redirectTo: `${redirectUrl}/onboarding` } 
                });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] py-3.5 text-sm font-medium text-[#000000] transition-all hover:bg-[#FEE500]/90 active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.466-1.675 3.464-2.353.541.08 1.1.123 1.67.123 4.97 0 9-3.186 9-7.115C21 6.185 16.97 3 12 3z" />
              </svg>
              카카오로 시작하기
            </button>
          </div>

          {/* 약관 동의 */}
          <p className="text-center text-xs text-muted-foreground">
            계속 진행하면{" "}
            <a href="/terms" className="underline">
              서비스 이용약관
            </a>
            과{" "}
            <a href="/privacy" className="underline">
              개인정보 처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
