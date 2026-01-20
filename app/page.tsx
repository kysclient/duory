"use client";

import { Plus } from "lucide-react";
import { MemoryFeed } from "@/components/memory-feed";
import { BottomNav } from "@/components/bottom-nav";
import { CreateMemoryModal } from "@/components/create-memory-modal";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import PullToRefresh from "react-simple-pull-to-refresh";

export default function Home() {
  const { user, couple, daysCount, refreshUser } = useAuth();
  const router = useRouter();
  
  // 커플 연결 완료 → 메인 페이지 표시
  const isConnected = !!couple;

  const handleRefresh = async () => {
    await refreshUser();
    // 페이지 새로고침을 트리거하기 위해 약간의 딜레이
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div className="min-h-screen bg-background">
      {isConnected ? (
        <>
          {/* 헤더 */}
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
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
              <MemoryFeed />
            </main>
          </PullToRefresh>

          {/* FAB - 추억 작성 버튼 */}
          <CreateMemoryModal />
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
