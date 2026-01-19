"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  RefreshCw,
  Download,
  Share2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar22 } from "@/components/calendar22";
import { toast } from "sonner";
import dayjs from "dayjs";
import { createEvent, EventAttributes } from "ics";

interface Anniversary {
  id: string;
  title: string;
  date: string;
  is_recurring: boolean;
  created_by: string;
  created_at: string;
}

export default function AnniversariesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAnniversary, setSelectedAnniversary] = useState<Anniversary | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 기념일 불러오기
  const fetchAnniversaries = async () => {
    if (!user?.couple_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("anniversaries")
        .select("*")
        .eq("couple_id", user.couple_id)
        .order("date", { ascending: true });

      if (error) throw error;
      setAnniversaries(data || []);
    } catch (error) {
      console.error("기념일 조회 실패:", error);
      toast.error("기념일을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnniversaries();
  }, [user?.couple_id]);

  // 기념일 추가
  const handleCreate = async () => {
    if (!user?.couple_id || !title.trim() || !date) {
      toast.error("모든 항목을 입력해주세요");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("anniversaries").insert({
        couple_id: user.couple_id,
        title: title.trim(),
        date: dayjs(date).format("YYYY-MM-DD"),
        is_recurring: isRecurring,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("기념일이 추가되었습니다");
      setIsCreateOpen(false);
      resetForm();
      fetchAnniversaries();
    } catch (error) {
      console.error("기념일 추가 실패:", error);
      toast.error("기념일 추가에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  // 기념일 수정
  const handleEdit = async () => {
    if (!selectedAnniversary || !title.trim() || !date) {
      toast.error("모든 항목을 입력해주세요");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("anniversaries")
        .update({
          title: title.trim(),
          date: dayjs(date).format("YYYY-MM-DD"),
          is_recurring: isRecurring,
        })
        .eq("id", selectedAnniversary.id);

      if (error) throw error;

      toast.success("기념일이 수정되었습니다");
      setIsEditOpen(false);
      resetForm();
      fetchAnniversaries();
    } catch (error) {
      console.error("기념일 수정 실패:", error);
      toast.error("기념일 수정에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  // 기념일 삭제
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("anniversaries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("기념일이 삭제되었습니다");
      fetchAnniversaries();
    } catch (error) {
      console.error("기념일 삭제 실패:", error);
      toast.error("기념일 삭제에 실패했습니다");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setTitle("");
    setDate(undefined);
    setIsRecurring(false);
    setSelectedAnniversary(null);
  };

  // 수정 모달 열기
  const openEditModal = (anniversary: Anniversary) => {
    setSelectedAnniversary(anniversary);
    setTitle(anniversary.title);
    setDate(new Date(anniversary.date));
    setIsRecurring(anniversary.is_recurring);
    setIsEditOpen(true);
  };

  // D-day 계산
  const getDday = (targetDate: string) => {
    const today = dayjs();
    const target = dayjs(targetDate);
    const diff = target.diff(today, "day");

    if (diff === 0) return "D-Day";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  // 캘린더에 추가 (.ics 파일 다운로드)
  const addToCalendar = async (anniversary: Anniversary) => {
    try {
      const anniversaryDate = dayjs(anniversary.date);
      
      const event: EventAttributes = {
        start: [
          anniversaryDate.year(),
          anniversaryDate.month() + 1, // ics는 1-based month
          anniversaryDate.date(),
        ],
        startInputType: 'local',
        title: anniversary.title,
        description: `Duory에서 생성된 기념일입니다.`,
        status: 'CONFIRMED',
        busyStatus: 'FREE',
        organizer: { name: 'Duory', email: 'noreply@duory.app' },
        duration: { days: 1 },
      };

      // 매년 반복 설정
      if (anniversary.is_recurring) {
        event.recurrenceRule = 'FREQ=YEARLY';
      }

      createEvent(event, (error, value) => {
        if (error) {
          console.error('캘린더 이벤트 생성 실패:', error);
          toast.error('캘린더 추가에 실패했습니다');
          return;
        }

        // .ics 파일 다운로드
        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${anniversary.title}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        toast.success('캘린더 파일이 다운로드되었습니다', {
          description: '캘린더 앱에서 열어주세요'
        });
      });
    } catch (error) {
      console.error('캘린더 추가 실패:', error);
      toast.error('캘린더 추가에 실패했습니다');
    }
  };

  // 구글 캘린더에 직접 추가
  const addToGoogleCalendar = (anniversary: Anniversary) => {
    const anniversaryDate = dayjs(anniversary.date);
    const startDate = anniversaryDate.format('YYYYMMDD');
    const endDate = anniversaryDate.add(1, 'day').format('YYYYMMDD');
    
    let recurrence = '';
    if (anniversary.is_recurring) {
      recurrence = '&recur=RRULE:FREQ=YEARLY';
    }

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(anniversary.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent('Duory에서 생성된 기념일입니다.')}${recurrence}`;
    
    window.open(googleUrl, '_blank');
    toast.success('구글 캘린더가 열렸습니다');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>기념일 관리</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              추가
            </button>
          </div>
        </header>

        {/* 기념일 리스트 */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : anniversaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">기념일이 없습니다</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                특별한 날을 추가해보세요
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                기념일 추가
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {anniversaries.map((anniversary) => (
                <div
                  key={anniversary.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10">
                    <div className="text-xs font-medium text-primary">
                      {dayjs(anniversary.date).format("M월")}
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {dayjs(anniversary.date).format("D")}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{anniversary.title}</h3>
                      {anniversary.is_recurring && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          매년
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{dayjs(anniversary.date).format("YYYY년 M월 D일")}</span>
                      <span>•</span>
                      <span className="font-medium text-primary">
                        {getDday(anniversary.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                          <Share2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="end">
                        <div className="space-y-1">
                          <button
                            onClick={() => addToGoogleCalendar(anniversary)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                          >
                            <CalendarIcon className="h-4 w-4" />
                            구글 캘린더에 추가
                          </button>
                          <button
                            onClick={() => addToCalendar(anniversary)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                          >
                            <Download className="h-4 w-4" />
                            캘린더 파일 다운로드
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <button
                      onClick={() => openEditModal(anniversary)}
                      className="rounded-lg p-2 transition-colors hover:bg-muted"
                    >
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(anniversary.id)}
                      className="rounded-lg p-2 transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 기념일 추가 Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기념일 추가</DialogTitle>
            <DialogDescription>
              특별한 날을 기록해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">기념일 이름</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 처음 만난 날"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>날짜</Label>
              <Calendar22 date={date} setDate={setDate} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="is-recurring" className="cursor-pointer">
                매년 반복
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button onClick={handleCreate} disabled={isSaving || !title.trim() || !date}>
              {isSaving ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기념일 수정 Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기념일 수정</DialogTitle>
            <DialogDescription>
              기념일 정보를 변경할 수 있어요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">기념일 이름</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 처음 만난 날"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>날짜</Label>
              <Calendar22 date={date} setDate={setDate} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is-recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="edit-is-recurring" className="cursor-pointer">
                매년 반복
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button onClick={handleEdit} disabled={isSaving || !title.trim() || !date}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

