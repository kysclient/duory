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
  // 감사와 애정 표현
  "오늘 서로에게 가장 고마웠던 순간은?",
  "서로에게 해주고 싶은 말 한 가지는?",
  "오늘 서로에게 칭찬 한 마디 해볼까?",
  "요즘 상대방이 해준 것 중 가장 감동받은 건?",
  "상대방의 어떤 점이 가장 사랑스러워?",
  "우리가 함께할 때 가장 행복한 순간은 언제야?",
  "상대방 덕분에 내가 변한 점이 있다면?",
  "오늘 하루 상대방이 보고 싶었던 순간은?",

  // 추억과 과거
  "처음 만났을 때 가장 인상 깊었던 점은?",
  "우리의 추억 중 다시 가고 싶은 곳은?",
  "사귀기 전에 상대방을 보며 느꼈던 첫인상은?",
  "우리의 첫 데이트에서 기억나는 순간은?",
  "연애 초기와 지금, 달라진 점이 있다면?",
  "상대방과의 추억 중 가장 웃겼던 에피소드는?",
  "처음 '이 사람이다' 라고 느꼈던 순간은?",
  "우리가 함께한 여행 중 최고의 순간은?",

  // 데이트와 일상
  "요즘 함께 해보고 싶은 데이트는?",
  "다음에 같이 가보고 싶은 장소는 어디야?",
  "함께 보고 싶은 영화나 드라마가 있어?",
  "같이 먹고 싶은 음식은 뭐야?",
  "우리만의 특별한 데이트 코스가 있다면?",
  "집에서 함께 하고 싶은 활동은?",
  "주말에 함께 하고 싶은 일은 뭐야?",
  "새로 생긴 맛집 중 가보고 싶은 곳은?",

  // 미래와 계획
  "우리의 다음 기념일에 하고 싶은 것은?",
  "서로가 더 행복해지기 위해 해보고 싶은 건?",
  "1년 후 우리의 모습은 어떨 것 같아?",
  "함께 이루고 싶은 버킷리스트가 있다면?",
  "나중에 같이 살게 된다면 어떤 집에서 살고 싶어?",
  "미래에 함께 해보고 싶은 취미는?",
  "10년 후 우리는 뭘 하고 있을까?",
  "함께 여행가고 싶은 나라는 어디야?",

  // 상대방 알아가기
  "상대의 어떤 습관이 귀엽게 느껴져?",
  "상대방의 장점 3가지를 말해본다면?",
  "상대방이 가장 예뻐/멋져 보일 때는 언제야?",
  "상대방의 취미 중 함께 하고 싶은 건?",
  "상대방이 요즘 빠져있는 것은 뭐야?",
  "상대방의 어떤 말투나 표정이 좋아?",
  "상대방을 동물에 비유한다면?",
  "상대방의 패션 스타일 중 가장 좋아하는 건?",

  // 감정과 소통
  "요즘 가장 힘이 되는 말은?",
  "서로에게 더 자주 해주고 싶은 말은?",
  "힘들 때 상대방에게 바라는 것은?",
  "우리 사이에서 가장 좋아하는 스킨십은?",
  "상대방이 기분 안 좋을 때 어떻게 위로해줄까?",
  "우리가 싸웠을 때 화해하는 방법은?",
  "서로에게 더 솔직해지고 싶은 부분은?",
  "상대방에게 고마운데 말로 못한 것이 있다면?",

  // 재미있는 질문
  "상대방의 최애 음식은 뭘까? (맞춰봐!)",
  "상대방이 가장 좋아하는 계절은?",
  "우리 커플을 색깔로 표현한다면?",
  "상대방의 잠버릇 중 귀여운 건?",
  "상대방이 자주 하는 말버릇이 있다면?",
  "우리 커플송이 있다면 어떤 노래야?",
  "상대방의 MBTI와 잘 맞는다고 느껴?",
  "상대방이 요즘 스트레스 받는 건 뭘까?",

  // 가치관과 깊은 대화
  "사랑에서 가장 중요하다고 생각하는 건?",
  "좋은 연인의 조건은 뭐라고 생각해?",
  "우리 관계에서 가장 소중한 가치는?",
  "서로를 더 이해하기 위해 노력하는 것은?",
  "연애에서 절대 양보할 수 없는 것은?",
  "우리가 오래 함께할 수 있는 비결은?",
  "상대방과 닮아가고 싶은 부분이 있다면?",
  "우리 관계가 특별한 이유는 뭘까?",

  // 일상 공유
  "오늘 하루 중 가장 기억에 남는 일은?",
  "요즘 가장 큰 고민이 있다면?",
  "최근 새롭게 관심 갖게 된 것은?",
  "요즘 듣는 노래 중 추천하고 싶은 곡은?",
  "오늘 점심/저녁 뭐 먹었어?",
  "요즘 자주 보는 유튜브나 SNS 콘텐츠는?",
  "최근에 읽은 책이나 본 영화가 있어?",
  "요즘 사고 싶은 것이 있다면?",

  // 서프라이즈 & 특별한 날
  "상대방에게 깜짝 선물을 한다면?",
  "받고 싶은 선물이 있어?",
  "기념일에 꼭 하고 싶은 것은?",
  "상대방을 위해 준비해보고 싶은 서프라이즈는?",
  "가장 기억에 남는 선물은 뭐였어?",
  "특별한 날 가고 싶은 레스토랑이 있어?",
  "상대방의 생일에 해주고 싶은 것은?",
  "크리스마스에 함께 하고 싶은 것은?",

  // 성장과 응원
  "상대방이 요즘 열심히 하고 있는 것은?",
  "서로를 위해 응원하고 싶은 말은?",
  "상대방의 꿈을 어떻게 응원해줄 수 있을까?",
  "함께 성장하고 싶은 부분이 있다면?",
  "상대방에게 배우고 싶은 점은?",
  "우리가 함께 도전해보고 싶은 것은?",
  "1년 전과 비교해서 우리가 성장한 점은?",
  "앞으로 함께 만들어가고 싶은 추억은?",
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

