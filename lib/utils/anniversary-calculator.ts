import dayjs from "dayjs";

export interface AutoAnniversary {
  id: string;
  title: string;
  date: string;
  type: "days" | "months" | "years";
  daysFromStart: number;
  isAuto: true;
}

/**
 * 커플 시작일 기준으로 자동 계산되는 기념일 목록 생성
 * @param startDate 커플 시작일 (YYYY-MM-DD)
 * @param yearsToCalculate 몇 년치까지 계산할지 (기본 10년)
 */
export function calculateAutoAnniversaries(
  startDate: string,
  yearsToCalculate: number = 10,
): AutoAnniversary[] {
  const start = dayjs(startDate);
  const today = dayjs();
  const anniversaries: AutoAnniversary[] = [];

  // 일수 기념일 (22일, 50일, 100일, 200일, 300일, ...)
  const dayMilestones = [
    22, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
    1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000, 3500, 4000, 4500,
    5000,
  ];

  for (const days of dayMilestones) {
    const date = start.add(days - 1, "day"); // D+1이 시작일이므로 days-1

    // 과거 1년 ~ 미래 yearsToCalculate년 범위만 포함
    if (
      date.isAfter(today.subtract(1, "year")) &&
      date.isBefore(today.add(yearsToCalculate, "year"))
    ) {
      anniversaries.push({
        id: `auto-days-${days}`,
        title: `${days}일`,
        date: date.format("YYYY-MM-DD"),
        type: "days",
        daysFromStart: days,
        isAuto: true,
      });
    }
  }

  // 개월 기념일 (1개월 ~ 11개월, 매년 반복 안함)
  for (let months = 1; months <= 11; months++) {
    const date = start.add(months, "month");

    if (
      date.isAfter(today.subtract(1, "year")) &&
      date.isBefore(today.add(yearsToCalculate, "year"))
    ) {
      anniversaries.push({
        id: `auto-months-${months}`,
        title: `${months}개월`,
        date: date.format("YYYY-MM-DD"),
        type: "months",
        daysFromStart: date.diff(start, "day") + 1,
        isAuto: true,
      });
    }
  }

  // 연 기념일 (1주년 ~ N주년)
  for (let years = 1; years <= yearsToCalculate; years++) {
    const date = start.add(years, "year");

    if (
      date.isAfter(today.subtract(1, "year")) &&
      date.isBefore(today.add(yearsToCalculate, "year"))
    ) {
      anniversaries.push({
        id: `auto-years-${years}`,
        title: `${years}주년`,
        date: date.format("YYYY-MM-DD"),
        type: "years",
        daysFromStart: date.diff(start, "day") + 1,
        isAuto: true,
      });
    }
  }

  // 날짜순 정렬
  return anniversaries.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
}

/**
 * 다가오는 기념일만 필터링 (오늘 포함)
 */
export function getUpcomingAnniversaries(
  anniversaries: AutoAnniversary[],
  limit?: number,
): AutoAnniversary[] {
  const today = dayjs().startOf("day");
  const upcoming = anniversaries.filter((a) =>
    dayjs(a.date).isAfter(today.subtract(1, "day")),
  );

  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * D-day 텍스트 반환
 */
export function getDdayText(targetDate: string): string {
  const today = dayjs().startOf("day");
  const target = dayjs(targetDate).startOf("day");
  const diff = target.diff(today, "day");

  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

/**
 * 기념일 타입에 따른 이모지 반환
 */
export function getAnniversaryEmoji(type: "days" | "months" | "years"): string {
  switch (type) {
    case "days":
      return "📅";
    case "months":
      return "🗓️";
    case "years":
      return "🎉";
    default:
      return "💕";
  }
}

/**
 * 기념일 타입에 따른 배경색 클래스 반환
 */
export function getAnniversaryBgClass(
  type: "days" | "months" | "years",
): string {
  switch (type) {
    case "days":
      return "bg-primary/5 text-primary/80";
    case "months":
      return "bg-primary/10 text-primary";
    case "years":
      return "bg-primary/20 text-primary font-bold";
    default:
      return "bg-primary/5 text-primary";
  }
}
