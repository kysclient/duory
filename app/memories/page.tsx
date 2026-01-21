"use client";

import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { CreateMemoryModal } from "@/components/create-memory-modal";
import { MemoryFeed } from "@/components/memory-feed";
import { MemoryDetailModal } from "@/components/memory-detail-modal";
import { useCoupleMemories, MemoryWithAuthor } from "@/lib/hooks/use-memories";
import { useAuth } from "@/lib/auth-context";
import { LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import PullToRefresh from "react-simple-pull-to-refresh";
import { MemoriesFilledIcon } from "@/components/icons";

type ViewMode = "feed" | "gallery";

function VideoThumbnail({ src }: { src: string }) {
  return (
    <video
      src={src}
      className="h-full w-full object-cover"
      muted
      playsInline
      preload="metadata"
      poster="/heart.png"
    />
  );
}

export default function MemoriesPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const { memories, loading, toggleLike, refresh } = useCoupleMemories();
  const [selectedMemory, setSelectedMemory] = useState<MemoryWithAuthor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const gallerySections = (() => {
    const sections: { key: string; title: string; items: MemoryWithAuthor[] }[] = [];
    const sectionIndex = new Map<string, number>();

    memories.forEach((memory) => {
      const rawDate = memory.memory_date ?? memory.created_at;
      const date = rawDate ? new Date(rawDate) : null;
      const year = date ? date.getFullYear() : NaN;
      const month = date ? date.getMonth() + 1 : NaN;
      const key = Number.isFinite(year) && Number.isFinite(month)
        ? `${year}-${String(month).padStart(2, "0")}`
        : "unknown";
      const title = key === "unknown" ? "날짜 없음" : `${year}년 ${month}월`;

      const index = sectionIndex.get(key);
      if (index === undefined) {
        sectionIndex.set(key, sections.length);
        sections.push({ key, title, items: [memory] });
      } else {
        sections[index].items.push(memory);
      }
    });

    return sections;
  })();

  const handleMemoryClick = (memory: MemoryWithAuthor) => {
    setSelectedMemory(memory);
    setIsDetailOpen(true);
  };

  const handleLike = (memoryId: string) => {
    toggleLike(memoryId);
  };

  const handleRefresh = async () => {
    await refresh();
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex flex-row items-center">
              <Image
                src="/logo_v1.png"
                alt="Duory"
                width={215}
                height={112}
                className="w-9 h-auto"
                priority
              />
              <span className="font-semibold translate -translate-y-0.1">
                Memories
              </span>
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setViewMode("feed")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "feed"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("gallery")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  viewMode === "gallery"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 컨텐츠 with Pull-to-Refresh */}
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
            {viewMode === "feed" ? (
              <MemoryFeed />
            ) : (
              <div className="p-1">
                {loading ? (
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square animate-pulse bg-muted"
                      />
                    ))}
                  </div>
                ) : memories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 rounded-full bg-muted p-6">
                      <MemoriesFilledIcon className="h-12 w-12 text-muted-foreground" />
                      {/* <LayoutGrid className="h-12 w-12 text-muted-foreground" /> */}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">추억이 없습니다</h3>
                    <p className="text-sm text-muted-foreground">
                      특별한 순간을 기록해보세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gallerySections.map((section) => (
                      <div key={section.key}>
                        <div className="px-2 py-2 text-xs font-semibold text-muted-foreground">
                          {section.title}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {section.items.map((memory) => {
                            const thumbnail = memory.images?.[0];
                            const videoUrl = memory.videos?.[0];
                            return (
                              <button
                                key={memory.id}
                                onClick={() => handleMemoryClick(memory)}
                                className="group relative aspect-square overflow-hidden bg-muted transition-opacity hover:opacity-90"
                              >
                                {videoUrl ? (
                                  <VideoThumbnail src={videoUrl} />
                                ) : thumbnail ? (
                                  <Image
                                    src={thumbnail}
                                    alt="추억"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 33vw, 170px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-muted p-3">
                                    <p className="line-clamp-4 text-xs text-muted-foreground">
                                      {memory.content}
                                    </p>
                                  </div>
                                )}
                                
                                {/* 다중 이미지 인디케이터 */}
                                {memory.images && memory.images.length > 1 && !videoUrl && (
                                  <div className="absolute right-2 top-2">
                                    <LayoutGrid className="h-4 w-4 text-white drop-shadow-lg" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </PullToRefresh>

        {/* FAB - 추억 작성 버튼 */}
        <CreateMemoryModal onCreated={refresh} />
      </main>

      {/* 메모리 디테일 모달 */}
      <MemoryDetailModal
        memory={selectedMemory}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onLike={handleLike}
        currentUserId={user?.id}
      />

      <BottomNav />
    </div>
  );
}
