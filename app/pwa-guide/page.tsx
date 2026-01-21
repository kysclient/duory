"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft } from "lucide-react";

export default function PwaGuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center gap-2 px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>뒤로</span>
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_v1.png"
              alt="Duory"
              width={64}
              height={64}
              className="h-10 w-auto"
              priority
            />
            <div>
              <h1 className="text-xl font-semibold">앱으로 추가하기</h1>
              <p className="text-sm text-muted-foreground">
                iOS / Android에서 앱으로 설치하는 방법입니다.
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-background p-4">
            <h2 className="mb-2 text-sm font-semibold">iOS (Safari)</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Safari에서 duory.app을 열어요.</li>
              <li>2. 하단 공유 버튼(⬆︎)을 눌러요.</li>
              <li>3. “홈 화면에 추가”를 선택해요.</li>
              <li>4. 오른쪽 상단 “추가”를 누르면 완료!</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-background p-4">
            <h2 className="mb-2 text-sm font-semibold">Android (Chrome)</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Chrome에서 duory.app을 열어요.</li>
              <li>2. 오른쪽 상단 ⋮ 메뉴를 눌러요.</li>
              <li>3. “홈 화면에 추가” 또는 “앱 설치”를 선택해요.</li>
              <li>4. 확인하면 바로 앱처럼 사용할 수 있어요.</li>
            </ol>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

