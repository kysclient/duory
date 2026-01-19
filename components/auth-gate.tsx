"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

const PUBLIC_ROUTES = new Set([
  "/welcome",
  "/auth",
  "/onboarding",
  "/connect",
  "/privacy",
  "/terms",
]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { supabaseUser, user, loading } = useAuth();
  const [graceActive, setGraceActive] = useState(false);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUsedGraceRef = useRef(false);

  const isPublicRoute = useMemo(
    () => PUBLIC_ROUTES.has(pathname),
    [pathname]
  );

  useEffect(() => {
    if (loading) return;

    // 로그인 안 됐으면 공개 페이지 허용, 보호 페이지는 welcome으로
    if (!supabaseUser) {
      if (!isPublicRoute) {
        router.replace("/welcome");
      }
      return;
    }

    // 로그인은 됐는데 유저 데이터가 잠깐 비는 경우(탭 이동/복귀 시) 그레이스 1회만 부여
    if (!user) {
      if (!hasUsedGraceRef.current && !graceActive) {
        hasUsedGraceRef.current = true;
        setGraceActive(true);
        if (graceTimerRef.current) {
          clearTimeout(graceTimerRef.current);
        }
        graceTimerRef.current = setTimeout(() => {
          setGraceActive(false);
        }, 1500);
        return;
      }

      // 그레이스 이후에도 user가 없으면 온보딩으로 이동
      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
      return;
    }

    if (graceActive) {
      setGraceActive(false);
    }
    hasUsedGraceRef.current = false;

    // 로그인 됐으면 상태에 따라 흐름 제어
    if (!user.nickname) {
      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
      return;
    }

    if (!user.couple_id) {
      // 커플이 없어도 접근 가능한 페이지들
      const allowedWithoutCouple = ["/connect", "/couple", "/profile", "/", "/memories", "/community"];
      if (!allowedWithoutCouple.includes(pathname)) {
        router.replace("/connect");
      }
      return;
    }

    // 로그인 완료 상태면 공개 페이지에서는 메인으로 보내기
    if (isPublicRoute && pathname !== "/") {
      router.replace("/");
    }
  }, [loading, supabaseUser, user, pathname, isPublicRoute, router, graceActive]);

  useEffect(() => {
    return () => {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
      }
    };
  }, []);

  if (loading || (supabaseUser && !user && graceActive)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <Image
              src="/logo_v1.png"
              alt="Duory"
              fill
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          <div className="text-sm text-muted-foreground">Duory를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

