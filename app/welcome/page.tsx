"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: "💕",
      title: "우리 둘만의 추억",
      subtitle: "Duory에서 특별한 순간들을\n기록하고 공유하세요",
    },
    {
      emoji: "📸",
      title: "함께한 모든 순간",
      subtitle: "사진과 글로 추억을 남기고\n타임라인으로 돌아보세요",
    },
    {
      emoji: "🎉",
      title: "기념일을 기억해요",
      subtitle: "특별한 날들을 알려드리고\nD-day를 함께 세어드려요",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* 로고 */}
      <div className="absolute left-4 top-4 flex flex-row items-center">
        <Image
          src="/logo_v1.png"
          alt="Duory"
          width={215}
          height={112}
          className="h-7 w-auto"
        />
        <span className="text-base font-semibold">Duory</span>
      </div>

      {/* 스킵 버튼 */}
      <div className="absolute right-4 top-4 z-10">
        <a
          href="/auth"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          건너뛰기
        </a>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* 이모지/아이콘 */}
          <div className="mb-6 flex justify-center">
            <div className="text-6xl transition-all duration-500">
              {steps[currentStep].emoji}
            </div>
          </div>

          {/* 텍스트 */}
          <div className="space-y-3 transition-all duration-500">
            <h1 className="text-2xl font-bold leading-tight">
              {steps[currentStep].title}
            </h1>
            <p className="whitespace-pre-line text-base text-muted-foreground">
              {steps[currentStep].subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background px-6 pb-8">
        <div className="mx-auto max-w-md space-y-4">
          {/* 인디케이터 */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-foreground"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* 버튼 */}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95"
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <a
              href="/auth"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95"
            >
              시작하기
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

