"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { BottomNav } from "@/components/bottom-nav";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

dayjs.locale("ko");

interface Memory {
  id: string;
  memory_date: string;
  images: string[] | null;
  content: string;
  title: string | null;
}

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  is_all_day: boolean;
  color: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, couple } = useAuth();

  // State for data
  const [memories, setMemories] = useState<Record<string, Memory[]>>({});
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [loading, setLoading] = useState(true);

  // State for view
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State for Schedule Form
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    time: "12:00",
    location: "",
  });

  // Fetch Data (Memories & Schedules)
  const fetchData = async () => {
    if (!user?.couple_id) return;
    setLoading(true);

    const startOfMonth = currentDate.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = currentDate.endOf("month").format("YYYY-MM-DD");

    try {
      // 1. Fetch Memories
      const { data: memData } = await supabase
        .from("memories")
        .select("id, memory_date, images, content, title")
        .eq("couple_id", user.couple_id)
        .gte("memory_date", startOfMonth)
        .lte("memory_date", endOfMonth);

      const memGrouped: Record<string, Memory[]> = {};
      memData?.forEach((m) => {
        if (!memGrouped[m.memory_date]) memGrouped[m.memory_date] = [];
        memGrouped[m.memory_date].push(m);
      });
      setMemories(memGrouped);

      // 2. Fetch Schedules
      const { data: schData } = await supabase
        .from("schedules")
        .select("*")
        .eq("couple_id", user.couple_id)
        .gte("start_time", `${startOfMonth}T00:00:00`)
        .lte("start_time", `${endOfMonth}T23:59:59`);

      const schGrouped: Record<string, Schedule[]> = {};
      schData?.forEach((s) => {
        const dateKey = dayjs(s.start_time).format("YYYY-MM-DD");
        if (!schGrouped[dateKey]) schGrouped[dateKey] = [];
        schGrouped[dateKey].push(s);
      });
      setSchedules(schGrouped);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.couple_id, currentDate]); // Re-fetch when month changes

  // Schedule Actions
  const handleSaveSchedule = async () => {
    if (!selectedDate || !scheduleForm.title.trim() || !user?.couple_id) return;

    try {
      // Combine date and time
      const startTime = `${selectedDate}T${scheduleForm.time}:00`;

      if (editingSchedule) {
        // Update
        const { error } = await supabase
          .from("schedules")
          .update({
            title: scheduleForm.title,
            description: scheduleForm.description,
            start_time: startTime,
            location: scheduleForm.location,
          })
          .eq("id", editingSchedule.id);
        if (error) throw error;
        toast.success("일정이 수정되었습니다");
      } else {
        // Create
        const { error } = await supabase.from("schedules").insert({
          couple_id: user.couple_id,
          created_by: user.id,
          title: scheduleForm.title,
          description: scheduleForm.description,
          start_time: startTime,
          location: scheduleForm.location,
          is_all_day: false,
        });
        if (error) throw error;
        toast.success("일정이 등록되었습니다");
      }

      setIsScheduleFormOpen(false);
      resetScheduleForm();
      fetchData(); // Refresh list
    } catch (e) {
      console.error(e);
      toast.error("일정 저장 실패");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) throw error;
      toast.success("삭제되었습니다");
      fetchData();
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      title: "",
      description: "",
      time: "12:00",
      location: "",
    });
    setEditingSchedule(null);
  };

  // Click Date
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDetailOpen(true);
  };

  // Calendar Helpers
  const generateDays = () => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startDay = startOfMonth.day();
    const daysInMonth = currentDate.daysInMonth();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(startOfMonth.date(i));
    return days;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* Header - Month Navigation */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setCurrentDate((prev) => prev.subtract(1, "month"))
                }
              >
                <ChevronLeft className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              </button>
              <h2 className="text-xl font-bold font-gmarket">
                {currentDate.format("YYYY. MM")}
              </h2>
              <button
                onClick={() => setCurrentDate((prev) => prev.add(1, "month"))}
              >
                <ChevronRight className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <button
              onClick={() => router.push("/anniversaries")}
              className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full"
            >
              기념일 보기
            </button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "text-center text-xs font-medium py-2",
                  idx === 0
                    ? "text-rose-500"
                    : idx === 6
                      ? "text-blue-500"
                      : "text-muted-foreground",
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {generateDays().map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;

              const dateStr = date.format("YYYY-MM-DD");
              const isToday = date.isSame(dayjs(), "day");
              const dailyMemories = memories[dateStr] || [];
              const dailySchedules = schedules[dateStr] || [];
              const hasMemory = dailyMemories.length > 0;
              const hasSchedule = dailySchedules.length > 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  className="flex flex-col items-center h-20 cursor-pointer relative pt-1 group rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Date Number */}
                  <span
                    className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                      isToday
                        ? "bg-primary text-white"
                        : "text-foreground group-hover:bg-accent",
                    )}
                  >
                    {date.date()}
                  </span>

                  {/* Content Preview */}
                  <div className="flex flex-col items-center gap-1 w-full px-1">
                    {/* Schedule Dots */}
                    {hasSchedule && (
                      <div className="flex gap-0.5 justify-center flex-wrap max-w-full">
                        {dailySchedules.slice(0, 3).map((sch, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-rose-400"
                          />
                        ))}
                        {dailySchedules.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                    )}

                    {/* Memory Photo (Thumbnail) */}
                    {hasMemory && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shadow-sm">
                        {dailyMemories[0].images?.[0] ? (
                          <Image
                            src={dailyMemories[0].images[0]}
                            alt="memory"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md rounded-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-background/95 backdrop-blur z-10">
            <DialogTitle className="text-xl">
              {selectedDate && dayjs(selectedDate).format("M월 D일")}
            </DialogTitle>
            <DialogDescription>오늘의 추억과 일정</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="schedule"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-2">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="schedule">
                  일정 (
                  {selectedDate ? schedules[selectedDate]?.length || 0 : 0})
                </TabsTrigger>
                <TabsTrigger value="memory">
                  추억 ({selectedDate ? memories[selectedDate]?.length || 0 : 0}
                  )
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB: SCHEDULE */}
            <TabsContent
              value="schedule"
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {selectedDate && schedules[selectedDate]?.length > 0 ? (
                <div className="space-y-3">
                  {schedules[selectedDate].map((sch) => (
                    <div
                      key={sch.id}
                      className="bg-card border rounded-xl p-4 flex justify-between items-start shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {sch.title}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dayjs(sch.start_time).format("A h:mm")}
                        </div>
                        {sch.location && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {sch.location}
                          </div>
                        )}
                        {sch.description && (
                          <p className="text-sm text-foreground/80 pt-1">
                            {sch.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingSchedule(sch);
                            setScheduleForm({
                              title: sch.title,
                              description: sch.description || "",
                              time: dayjs(sch.start_time).format("HH:mm"),
                              location: sch.location || "",
                            });
                            setIsScheduleFormOpen(true);
                          }}
                          className="p-2 hover:bg-muted rounded-full"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="p-2 hover:bg-destructive/10 rounded-full"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  등록된 일정이 없습니다.
                </div>
              )}

              <div className="pt-4 flex justify-center">
                <Button
                  onClick={() => {
                    resetScheduleForm();
                    setIsScheduleFormOpen(true);
                  }}
                  className="rounded-full shadow-lg"
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />새 일정 추가
                </Button>
              </div>
            </TabsContent>

            {/* TAB: MEMORY */}
            <TabsContent
              value="memory"
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {selectedDate && memories[selectedDate]?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {memories[selectedDate].map((mem) => (
                    <div
                      key={mem.id}
                      className="bg-card border rounded-xl overflow-hidden shadow-sm"
                    >
                      {mem.images?.[0] && (
                        <div className="relative aspect-video w-full">
                          <Image
                            src={mem.images[0]}
                            alt="memory"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-sm whitespace-pre-wrap">
                          {mem.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  <p>이 날의 추억이 없습니다.</p>
                  <Button
                    variant="link"
                    onClick={() => router.push("/memories")}
                  >
                    추억 남기러 가기
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Schedule Form Dialog (Nested) */}
      <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "일정 수정" : "새 일정 추가"}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && dayjs(selectedDate).format("YYYY년 M월 D일")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>일정 제목</Label>
              <Input
                placeholder="데이트, 기념일 등"
                value={scheduleForm.title}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시간</Label>
                <Input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>장소 (선택)</Label>
              <Input
                placeholder="어디서 만나나요?"
                value={scheduleForm.location}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>메모 (선택)</Label>
              <Textarea
                placeholder="간단한 메모를 남겨주세요"
                className="resize-none"
                value={scheduleForm.description}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleFormOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveSchedule}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
