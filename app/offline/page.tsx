'use client'
import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <Image
        src="/logo_v1.png"
        alt="Duory"
        width={215}
        height={112}
        className="w-12 h-auto mb-6 opacity-50 grayscale"
        priority
      />
      <h1 className="mb-3 text-2xl font-bold">오프라인 상태예요</h1>
      <p className="mb-6 text-muted-foreground">
        인터넷 연결을 확인하고 다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
      >
        다시 시도
      </button>
    </div>
  );
}

