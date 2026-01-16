"use client";

import { BottomNav } from "@/components/bottom-nav";
import { MemoryFeed } from "@/components/memory-feed";
import Image from "next/image";

export default function CommunityPage() {
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
              <span className="font-semibold translate -translate-y-0.1">Duory</span>
            </div>
          </div>
        </header>

        {/* 추억 피드 */}
        <MemoryFeed />
      </main>

      <BottomNav />
    </div>
  );
}
