"use client";

import { Plus } from "lucide-react";
import { MemoryFeed } from "@/components/memory-feed";
import { BottomNav } from "@/components/bottom-nav";
import { CreateMemoryModal } from "@/components/create-memory-modal";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import PullToRefresh from "react-simple-pull-to-refresh";

export default function Home() {
  const { user, couple, daysCount, refreshUser } = useAuth();
  const router = useRouter();
  const [feedRefreshToken, setFeedRefreshToken] = useState(0);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  
  // 커플 연결 완료 → 메인 페이지 표시
  const isConnected = !!couple;

  const handleRefresh = async () => {
    await refreshUser();
    setFeedRefreshToken((prev) => prev + 1);
    // 페이지 새로고침을 트리거하기 위해 약간의 딜레이
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasDismissedBanner = () => {
      return document.cookie
        .split("; ")
        .some((row) => row.startsWith("pwa_guide_dismissed="));
    };

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const update = () => {
      const isStandalone =
        mediaQuery.matches || (window.navigator as any).standalone === true;
      setShowPwaBanner(!isStandalone && !hasDismissedBanner());
    };

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(update);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", update);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(update);
      }
    };
  }, []);

  const handleOpenPwaGuide = () => {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    document.cookie = `pwa_guide_dismissed=1; path=/; expires=${expires.toUTCString()}`;
    setShowPwaBanner(false);
    router.push("/pwa-guide");
  };

  return (
    <div className="min-h-screen bg-background">
      {isConnected ? (
        <>
          {showPwaBanner && (
            <>
              <div
                className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg"
                style={{
                  paddingTop: "env(safe-area-inset-top)",
                  height: "calc(44px + env(safe-area-inset-top))",
                }}
              >
                <div className="mx-auto flex h-11 max-w-lg items-center justify-between px-4 text-sm">
                  <span className="font-medium">앱으로 열기</span>
                  <button
                    onClick={handleOpenPwaGuide}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-all active:scale-95"
                  >
                    방법 보기
                  </button>
                </div>
              </div>
              <div style={{ height: "calc(44px + env(safe-area-inset-top))" }} />
            </>
          )}
          {/* 헤더 */}
          <header
            className="sticky z-30 border-b border-border bg-background/80 backdrop-blur-lg"
            style={{
              top: showPwaBanner ? "calc(44px + env(safe-area-inset-top))" : 0,
            }}
          >
            <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
              <div className="flex flex-row items-center">
              <Image
                src="/logo_v1.png"
                alt="Duory"
                width={215}
                height={112}
                className="w-9 h-auto"
                priority
              />
              <span className="font-semibold translate -translate-y-0.1">Duory</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {daysCount !== null ? `D+${daysCount}` : "D+0"}
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <Image
                    src={user?.avatar_url || "/heart.png"}
                    alt="profile"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* 메인 피드 with Pull-to-Refresh */}
          <PullToRefresh
            onRefresh={handleRefresh}
            pullingContent=""
            refreshingContent={
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }
          >
            <main className="mx-auto max-w-lg pb-20">
              <MemoryFeed refreshToken={feedRefreshToken} />
            </main>
          </PullToRefresh>

          {/* FAB - 추억 작성 버튼 */}
          <CreateMemoryModal onCreated={() => setFeedRefreshToken((prev) => prev + 1)} />
        </>
      ) : (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center pb-20">
          <div className="mb-6 flex flex-row items-center">
            <Image
              src="/logo_v1.png"
              alt="듀오리 로고"
              width={215}
              height={112}
              className="w-12 h-auto"
              priority
            />
            <h1 className="text-3xl font-bold">Duory</h1>
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight">우리 둘만의 설레는 기록, 듀오리</h2>
          <p className="mb-8 text-muted-foreground break-keep">
            연인과 함께 소중한 추억을 사진으로 남기고,<br />
            우리만의 기념일을 특별하게 관리해보세요.
          </p>
          <button 
            onClick={() => router.push("/connect")}
            className="rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
          >
            지금 시작하기
          </button>
        </main>
      )}

      {/* 바텀 네비게이션 */}
      <BottomNav />
    </div>
  );
}
