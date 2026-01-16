"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MemoryFeedSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {[1, 2, 3].map((i) => (
        <article key={i} className="border-b border-border bg-background pb-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          {/* 본문 텍스트 */}
          <div className="px-4 pb-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          {/* 이미지 영역 */}
          <Skeleton className="aspect-square w-full" />

          {/* 액션 버튼 */}
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

