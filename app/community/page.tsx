"use client";

import { BottomNav } from "@/components/bottom-nav";
import { MemoryFeed } from "@/components/memory-feed";
import Image from "next/image";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useState } from "react";

export default function CommunityPage() {
  const [feedRefreshToken, setFeedRefreshToken] = useState(0);

  const handleRefresh = async () => {
    setFeedRefreshToken((prev) => prev + 1);
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
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
              <span className="font-semibold translate -translate-y-0.1">커뮤니티</span>
            </div>
          </div>
        </header>

        {/* 추억 피드 - 전체 공개 메모리만 표시 with Pull-to-Refresh */}
        <PullToRefresh
          onRefresh={handleRefresh}
          pullingContent=""
          refreshingContent={
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <div>
            <MemoryFeed publicOnly={true} refreshToken={feedRefreshToken} />
          </div>
        </PullToRefresh>
      </main>

      <BottomNav />
    </div>
  );
}
