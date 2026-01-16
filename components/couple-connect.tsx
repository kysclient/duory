"use client";

import { useState } from "react";
import { Heart, Copy, Check, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CoupleConnectProps {
  onComplete?: (coupleData: { coupleName: string; startDate: string }) => void;
}

export function CoupleConnect({ onComplete }: CoupleConnectProps) {
  const [step, setStep] = useState<"choice" | "create" | "join" | "setup">(
    "choice"
  );
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");

  // 초대 코드 생성
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    setStep("create");
  };

  // 클립보드 복사
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 선택 화면
  if (step === "choice") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* 헤더 */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex flex-row items-center">
                <Image
                  src="/logo_v1.png"
                  alt="Duory"
                  width={215}
                  height={112}
                  className="w-12 h-auto"
                  priority
                />
                <span className="text-3xl font-bold">Duory</span>
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold">
              Duory에 오신 걸 환영해요!
            </h1>
            <p className="text-muted-foreground">
              연인과 함께 특별한 추억을 만들어보세요
            </p>
          </div>

          {/* 연결 방법 선택 */}
          <div className="space-y-4">
            <button
              onClick={generateCode}
              className="group w-full rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:bg-accent active:scale-[0.98]"
            >
              <div className="mb-2 flex items-center justify-between">
                <LinkIcon className="h-6 w-6 text-primary" />
                <div className="text-xs font-medium text-primary">
                  새로 시작
                </div>
              </div>
              <h3 className="mb-1 text-lg font-semibold">초대 코드 만들기</h3>
              <p className="text-sm text-muted-foreground">
                코드를 생성하고 연인에게 공유해보세요
              </p>
            </button>

            <button
              onClick={() => setStep("join")}
              className="group w-full rounded-2xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:bg-accent active:scale-[0.98]"
            >
              <div className="mb-2 flex items-center justify-between">
                <Heart className="h-6 w-6 text-primary" />
                <div className="text-xs font-medium text-primary">연결하기</div>
              </div>
              <h3 className="mb-1 text-lg font-semibold">코드로 연결하기</h3>
              <p className="text-sm text-muted-foreground">
                연인이 보낸 초대 코드를 입력해주세요
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 코드 생성 화면
  if (step === "create") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mb-3 text-2xl font-bold">
              초대 코드가 생성되었어요!
            </h2>
            <p className="text-muted-foreground">
              이 코드를 연인에게 공유해주세요
            </p>
          </div>

          {/* 초대 코드 카드 */}
          <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 p-8">
            <div className="mb-6 text-center">
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                초대 코드
              </div>
              <div className="text-5xl font-bold tracking-wider text-primary">
                {inviteCode}
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold transition-all active:scale-95",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  복사 완료!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  코드 복사하기
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              연인이 코드를 입력하면 자동으로 연결됩니다
            </p>
          </div>

          <button
            onClick={() => setStep("setup")}
            className="w-full rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent/80"
          >
            다음에 설정하기
          </button>
        </div>
      </div>
    );
  }

  // 코드 입력 화면
  if (step === "join") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mb-3 text-2xl font-bold">
              초대 코드를 입력해주세요
            </h2>
            <p className="text-muted-foreground">
              연인이 공유한 6자리 코드를 입력하세요
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.toUpperCase().slice(0, 6))
              }
              placeholder="코드 입력"
              className="w-full rounded-xl border-2 border-border bg-card px-6 py-4 text-center text-2xl font-bold tracking-wider uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={6}
            />

            <button
              onClick={() => setStep("setup")}
              disabled={joinCode.length !== 6}
              className="w-full rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              연결하기
            </button>
          </div>

          <button
            onClick={() => setStep("choice")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            ← 뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  // 커플 정보 설정 화면
  if (step === "setup") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 fill-primary text-primary" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold">거의 다 완성됐어요!</h2>
            <p className="text-muted-foreground">
              우리 커플 정보를 입력해주세요
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                커플 이름
              </label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="예: 지은♥민수"
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                사귄 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={() => {
                if (onComplete) {
                  onComplete({ coupleName, startDate });
                }
              }}
              disabled={!coupleName || !startDate}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-4 font-semibold text-primary-foreground transition-all hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Duory 시작하기 💕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
