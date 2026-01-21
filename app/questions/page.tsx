"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History } from "lucide-react";

type DailyQuestion = {
  id: string;
  question: string;
  created_at: string;
};

type DailyAnswer = {
  id: string;
  user_id: string;
  answer: string;
  created_at: string;
};

type HistoryItem = {
  key: string;
  question: string;
  date: string;
  myAnswer?: string;
  partnerAnswer?: string;
};

const DEFAULT_QUESTIONS = [
  "오늘 서로에게 가장 고마웠던 순간은?",
  "요즘 함께 해보고 싶은 데이트는?",
  "서로에게 해주고 싶은 말 한 가지는?",
  "처음 만났을 때 가장 인상 깊었던 점은?",
  "우리의 추억 중 다시 가고 싶은 곳은?",
  "상대의 어떤 습관이 귀엽게 느껴져?",
  "서로가 더 행복해지기 위해 해보고 싶은 건?",
  "요즘 가장 힘이 되는 말은?",
  "우리의 다음 기념일에 하고 싶은 것은?",
  "오늘 서로에게 칭찬 한 마디 해볼까?",
];

export default function QuestionsPage() {
  const { user, partner } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const todayKey = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const loadQuestionAndAnswers = async () => {
    if (!user?.couple_id) return;

    setLoading(true);
    try {
      const { data: questions, error: questionError } = await supabase
        .from("daily_questions")
        .select("id, question, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (questionError) throw questionError;
      if (!questions || questions.length === 0) {
        setQuestion(null);
        setAnswers([]);
        return;
      }

      const dayIndex = dayjs().diff(dayjs().startOf("year"), "day");
      const selected = questions[dayIndex % questions.length];
      setQuestion(selected);

      const { data: answerData, error: answerError } = await supabase
        .from("daily_answers")
        .select("id, user_id, answer, created_at")
        .eq("couple_id", user.couple_id)
        .eq("question_id", selected.id)
        .eq("answer_date", todayKey)
        .order("created_at", { ascending: true });

      if (answerError) throw answerError;
      setAnswers(answerData ?? []);
    } catch (error: any) {
      console.error("질문 로딩 실패:", error);
      toast.error("오늘의 질문을 불러오지 못했어요", {
        description: error?.message || "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.couple_id) return;
    loadQuestionAndAnswers();
  }, [user?.couple_id]);

  const handleSubmit = async () => {
    if (!user?.id || !user.couple_id || !question) return;
    const trimmed = answerText.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("daily_answers")
        .insert({
          couple_id: user.couple_id,
          question_id: question.id,
          user_id: user.id,
          answer: trimmed,
          answer_date: todayKey,
        });

      if (error) throw error;

      toast.success("답변이 저장됐어요", {
        description: "상대방이 답변하면 함께 볼 수 있어요.",
      });
      setAnswerText("");
      await loadQuestionAndAnswers();
    } catch (error: any) {
      console.error("답변 저장 실패:", error);
      toast.error("답변 저장 실패", {
        description: error?.message || "다시 시도해주세요.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSeedQuestions = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      const { error } = await supabase.from("daily_questions").insert(
        DEFAULT_QUESTIONS.map((questionText) => ({
          question: questionText,
          is_active: true,
        }))
      );

      if (error) throw error;
      toast.success("질문이 등록되었습니다", {
        description: "오늘의 질문을 바로 확인할 수 있어요.",
      });
      await loadQuestionAndAnswers();
    } catch (error: any) {
      console.error("질문 생성 실패:", error);
      toast.error("질문 생성 실패", {
        description: error?.message || "다시 시도해주세요.",
      });
    } finally {
      setSeeding(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.couple_id) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_answers")
        .select("question_id, answer_date, answer, user_id, created_at, question:daily_questions(question)")
        .eq("couple_id", user.couple_id)
        .order("answer_date", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(200);

      if (error) throw error;

      const grouped = new Map<string, HistoryItem>();
      (data ?? []).forEach((item: any) => {
        const key = `${item.answer_date}-${item.question_id}`;
        const existing = grouped.get(key);
        const base: HistoryItem = existing ?? {
          key,
          question: item.question?.question ?? "질문",
          date: item.answer_date,
        };

        if (item.user_id === user?.id) {
          base.myAnswer = item.answer;
        } else if (item.user_id === partner?.id) {
          base.partnerAnswer = item.answer;
        }

        grouped.set(key, base);
      });

      const completed = Array.from(grouped.values())
        .filter((item) => item.myAnswer && item.partnerAnswer)
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      setHistoryItems(completed);
    } catch (error: any) {
      console.error("지난 질문 로딩 실패:", error);
      toast.error("지난 질문을 불러오지 못했어요", {
        description: error?.message || "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!user?.couple_id) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold">커플 연결 후 이용할 수 있어요</h1>
          <p className="text-sm text-muted-foreground">
            오늘의 질문은 커플이 연결된 이후에 사용할 수 있습니다.
          </p>
          <button
            onClick={() => router.push("/connect")}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            커플 연결하러 가기
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const myAnswer = answers.find((item) => item.user_id === user?.id);
  const partnerAnswer = answers.find((item) => item.user_id === partner?.id);

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
              <span className="font-semibold translate -translate-y-0.1">
                오늘의 질문
              </span>
            </div>
            <Dialog
              open={historyOpen}
              onOpenChange={(open) => {
                setHistoryOpen(open);
                if (open) {
                  loadHistory();
                }
              }}
            >
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted">
                  <History className="h-4 w-4" />
                  지난 답변
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto p-0">
                <div className="px-5 pb-6 pt-5 sm:px-6">
                  <DialogHeader className="space-y-1.5">
                    <DialogTitle>지난 질문 & 답변</DialogTitle>
                  </DialogHeader>
                </div>
                <div className="px-5 pb-6 sm:px-6">
                  {historyLoading ? (
                    <div className="space-y-3">
                      <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
                      <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
                      <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
                    </div>
                  ) : historyItems.length === 0 ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                      아직 완료된 질문이 없어요.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historyItems.map((item) => (
                        <div key={item.key} className="rounded-2xl border border-border bg-background p-4">
                          <div className="text-xs font-semibold text-muted-foreground">
                            {dayjs(item.date).format("YYYY년 M월 D일")}
                          </div>
                          <div className="mt-2 text-base font-semibold">
                            {item.question}
                          </div>
                          <div className="mt-3 space-y-3 text-sm">
                            <div>
                              <div className="mb-1 text-xs font-semibold text-muted-foreground">내 답변</div>
                              <p className="leading-relaxed text-foreground">{item.myAnswer}</p>
                            </div>
                            <div>
                              <div className="mb-1 text-xs font-semibold text-muted-foreground">
                                {partner?.nickname ? `${partner.nickname}의 답변` : "상대의 답변"}
                              </div>
                              <p className="leading-relaxed text-foreground">{item.partnerAnswer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              <div className="h-20 w-full animate-pulse rounded-2xl bg-muted" />
              <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
            </div>
          ) : !question ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              <div>아직 등록된 질문이 없어요.</div>
              <button
                onClick={handleSeedQuestions}
                disabled={seeding}
                className="mt-4 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {seeding ? "질문 생성 중..." : "기본 질문 생성하기"}
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground">
                  {dayjs().format("YYYY년 M월 D일")}
                </div>
                <h2 className="mt-2 text-xl font-semibold leading-relaxed">
                  {question.question}
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">
                    내 답변
                  </div>
                  {myAnswer ? (
                    <p className="text-sm leading-relaxed text-foreground">
                      {myAnswer.answer}
                    </p>
                  ) : (
                    <>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="내 답변을 적어주세요"
                        className="min-h-[96px] w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30"
                        maxLength={500}
                        disabled={saving}
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={handleSubmit}
                          disabled={!answerText.trim() || saving}
                          className={cn(
                            "rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                          )}
                        >
                          {saving ? "저장 중..." : "답변 저장"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">
                    {partner?.nickname ? `${partner.nickname}의 답변` : "상대의 답변"}
                  </div>
                  {partnerAnswer ? (
                    <p className="text-sm leading-relaxed text-foreground">
                      {partnerAnswer.answer}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      아직 답변이 없어요.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

