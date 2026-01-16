"use client";

import { Heart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoupleHeaderProps {
  coupleName?: string;
  startDate?: string;
  className?: string;
}

export function CoupleHeader({
  coupleName = "우리 커플",
  startDate = "2024-01-01",
  className,
}: CoupleHeaderProps) {
  // D-day 계산
  const calculateDday = (start: string) => {
    const startDateTime = new Date(start).getTime();
    const today = new Date().getTime();
    const diff = today - startDateTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const dday = calculateDday(startDate);

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* 커플 정보 */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg">
            <Heart className="h-7 w-7 fill-primary-foreground text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{coupleName}</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{startDate.replace(/-/g, ". ")}</span>
            </div>
          </div>
        </div>

        {/* D-day */}
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">D+{dday}</div>
          <div className="text-xs text-muted-foreground">함께한 날들</div>
        </div>
      </div>
    </div>
  );
}

