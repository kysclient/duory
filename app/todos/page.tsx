"use client";

import { useState, useMemo } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth-context";
import { useTodos, TodoWithAuthor } from "@/lib/hooks/use-todos";
import type { Todo } from "@/lib/supabase";
import Image from "next/image";
import {
  Plus,
  Check,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { TodoFilledIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PullToRefresh from "react-simple-pull-to-refresh";

const CATEGORIES: { value: Todo["category"]; label: string }[] = [
  { value: "date", label: "데이트" },
  { value: "travel", label: "여행" },
  { value: "food", label: "맛집" },
  { value: "gift", label: "선물" },
  { value: "home", label: "함께할 것" },
  { value: "health", label: "건강" },
  { value: "etc", label: "기타" },
];

const PRIORITIES: { value: Todo["priority"]; label: string; color: string }[] = [
  { value: "high", label: "높음", color: "text-red-500" },
  { value: "medium", label: "보통", color: "text-amber-500" },
  { value: "low", label: "낮음", color: "text-blue-500" },
];

function getCategoryLabel(category: string) {
  return CATEGORIES.find(c => c.value === category)?.label || "기타";
}

function getPriorityInfo(priority: string) {
  return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
}

function formatDueDate(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { text: `${Math.abs(diff)}일 지남`, isOverdue: true };
  if (diff === 0) return { text: "오늘", isOverdue: false };
  if (diff === 1) return { text: "내일", isOverdue: false };
  if (diff <= 7) return { text: `${diff}일 남음`, isOverdue: false };

  const date = new Date(dateStr);
  return {
    text: `${date.getMonth() + 1}/${date.getDate()}`,
    isOverdue: false,
  };
}

export default function TodosPage() {
  const { user, partner } = useAuth();
  const { todos, loading, refresh, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<Todo["category"]>("date");
  const [newPriority, setNewPriority] = useState<Todo["priority"]>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeTodos, completedTodos, stats } = useMemo(() => {
    let filtered = todos;
    if (activeCategory !== "all") {
      filtered = todos.filter(t => t.category === activeCategory);
    }

    const active = filtered.filter(t => !t.is_completed);
    const completed = filtered.filter(t => t.is_completed);

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    active.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

    return {
      activeTodos: active,
      completedTodos: completed,
      stats: {
        total: todos.length,
        completed: todos.filter(t => t.is_completed).length,
        active: todos.filter(t => !t.is_completed).length,
      },
    };
  }, [todos, activeCategory]);

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.error("할 일을 입력해주세요");
      return;
    }
    setIsSubmitting(true);
    const success = await addTodo({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
      priority: newPriority,
      assigned_to: newAssignedTo || undefined,
      due_date: newDueDate || undefined,
    });
    setIsSubmitting(false);

    if (success) {
      toast.success("추가 완료");
      setNewTitle("");
      setNewDescription("");
      setNewCategory("date");
      setNewPriority("medium");
      setNewDueDate("");
      setNewAssignedTo("");
      setShowAddForm(false);
    } else {
      toast.error("추가에 실패했어요");
    }
  };

  const handleToggle = async (todo: TodoWithAuthor) => {
    await toggleTodo(todo.id, todo.is_completed);
  };

  const handleDelete = async (todoId: string) => {
    setDeletingId(todoId);
    const success = await deleteTodo(todoId);
    setDeletingId(null);
    if (success) toast.success("삭제 완료");
  };

  const handleRefresh = async () => {
    await refresh();
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
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
              우리의 할 일
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
      </header>

      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent=""
        refreshingContent={
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <main className="mx-auto max-w-lg pb-20">
          {stats.total > 0 && (
            <div className="mx-4 mt-4 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-medium">
                  {stats.completed}/{stats.total} 완료
                </p>
                <p className="text-sm font-bold">{completionRate}%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                activeCategory === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              전체
            </button>
            {CATEGORIES.map(cat => {
              const count = todos.filter(t => t.category === cat.value).length;
              if (count === 0 && activeCategory !== cat.value) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                    activeCategory === cat.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="px-4 space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))
            ) : activeTodos.length === 0 && completedTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <TodoFilledIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {activeCategory !== "all"
                    ? `${getCategoryLabel(activeCategory)} 할 일이 없습니다`
                    : "할 일이 없습니다"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  함께 하고 싶은 것들을 적어보세요
                </p>
              </div>
            ) : (
              <>
                {activeTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => handleToggle(todo)}
                    onDelete={() => handleDelete(todo.id)}
                    isDeleting={deletingId === todo.id}
                    currentUserId={user?.id}
                  />
                ))}

                {completedTodos.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="flex w-full items-center gap-2 py-2 text-sm text-muted-foreground"
                    >
                      {showCompleted ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      완료됨 ({completedTodos.length})
                    </button>
                    {showCompleted && (
                      <div className="space-y-2">
                        {completedTodos.map(todo => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={() => handleToggle(todo)}
                            onDelete={() => handleDelete(todo.id)}
                            isDeleting={deletingId === todo.id}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </PullToRefresh>

      {showAddForm && (
        <div className="fixed inset-0 z-[60] bg-background animate-in fade-in duration-200">
          <header className="sticky top-0 z-10 border-b border-border bg-background">
            <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="text-sm text-muted-foreground"
              >
                취소
              </button>
              <span className="font-semibold">새로운 할 일</span>
              <button
                onClick={handleAdd}
                disabled={isSubmitting || !newTitle.trim()}
                className="text-sm font-semibold text-primary disabled:opacity-40"
              >
                {isSubmitting ? "추가 중..." : "추가"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-lg overflow-y-auto px-4 pt-4 pb-20" style={{ maxHeight: 'calc(100vh - 3.5rem)' }}>
            <input
              type="text"
              placeholder="할 일 입력"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="mb-3 w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />

            <textarea
              placeholder="메모 (선택)"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              rows={3}
              className="mb-4 w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setNewCategory(cat.value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      newCategory === cat.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">우선순위</p>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setNewPriority(p.value)}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all border",
                      newPriority === p.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">마감일</p>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">담당</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewAssignedTo("")}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all border",
                    !newAssignedTo
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  둘 다
                </button>
                <button
                  onClick={() => setNewAssignedTo(user?.id || "")}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all border",
                    newAssignedTo === user?.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  나
                </button>
                {partner && (
                  <button
                    onClick={() => setNewAssignedTo(partner.id)}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all border truncate",
                      newAssignedTo === partner.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {partner.nickname?.slice(0, 4) || "상대"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  isDeleting,
  currentUserId,
}: {
  todo: TodoWithAuthor;
  onToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  currentUserId?: string;
}) {
  const [showActions, setShowActions] = useState(false);
  const priority = getPriorityInfo(todo.priority);
  const dueInfo = todo.due_date ? formatDueDate(todo.due_date) : null;
  const isMyTask = todo.assigned_to === currentUserId;
  const isCompleted = todo.is_completed;

  return (
    <div
      className={cn(
        "rounded-xl border border-border p-3.5 transition-all",
        isCompleted && "opacity-50",
        isDeleting && "scale-95 opacity-0"
      )}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex gap-3">
        <button
          onClick={e => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            isCompleted
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {isCompleted && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </p>

          {todo.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {todo.description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {getCategoryLabel(todo.category)}
            </span>

            {!isCompleted && (
              <span className={cn("text-[10px] font-medium", priority.color)}>
                {priority.label}
              </span>
            )}

            {dueInfo && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  dueInfo.isOverdue && !isCompleted
                    ? "font-medium text-red-500"
                    : "text-muted-foreground"
                )}
              >
                <Calendar className="h-2.5 w-2.5" />
                {dueInfo.text}
              </span>
            )}

            {todo.assigned_to && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <User className="h-2.5 w-2.5" />
                {isMyTask ? "나" : todo.assignee?.nickname || "상대"}
              </span>
            )}

            {isCompleted && todo.completed_at && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(todo.completed_at).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                완료
              </span>
            )}
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-2 flex justify-end border-t border-border pt-2 animate-in fade-in duration-150">
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-all active:scale-95"
          >
            <Trash2 className="h-3 w-3" />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
