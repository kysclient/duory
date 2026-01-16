"use client";

import { BottomNav } from "@/components/bottom-nav";
import { CreateMemoryModal } from "@/components/create-memory-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoupleMemories } from "@/lib/hooks/use-memories";
import { Grid3x3, Calendar, MapPin } from "lucide-react";
import Image from "next/image";

export default function MemoriesPage() {
  const { memories, loading } = useCoupleMemories();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* 헤더 */}
        <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-lg">
          <div className="mb-3 flex items-center justify-between">
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

          {/* 필터 버튼 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
              <Grid3x3 className="h-3.5 w-3.5" />
              전체
            </button>
            <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent">
              <Calendar className="h-3.5 w-3.5" />
              날짜별
            </button>
            <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent">
              <MapPin className="h-3.5 w-3.5" />
              장소별
            </button>
          </div>
        </div>

        {/* 그리드 앨범 */}
        <div className="grid grid-cols-3">
          {loading ? (
            // 로딩 스켈레톤 (3x7 = 21개)
            Array.from({ length: 21 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="aspect-square border-[0.5px] border-border/50 rounded-none"
              />
            ))
          ) : memories.length === 0 ? (
            // 빈 상태
            <div className="col-span-3 flex h-60 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Image src="/heart.png" alt="Empty" width={60} height={60} className="opacity-20 grayscale" />
              <p>아직 추억이 없어요.<br />첫 추억을 만들어보세요!</p>
            </div>
          ) : (
            // 실제 데이터
            memories.map((memory) => {
              const thumbnailImage = memory.images?.[0] || "/heart.png";
              return (
                <button
                  key={memory.id}
                  className="relative aspect-square overflow-hidden border-[0.5px] border-border/50 bg-muted transition-all hover:opacity-80 active:opacity-60"
                >
                  <Image
                    src={thumbnailImage}
                    alt="memory"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </button>
              );
            })
          )}
        </div>
      </main>

      <CreateMemoryModal />
      <BottomNav />
    </div>
  );
}
