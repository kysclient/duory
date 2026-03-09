import { useEffect, useState, useCallback } from "react";
import { supabase, type Todo } from "../supabase";
import { useAuth } from "../auth-context";

export interface TodoWithAuthor extends Todo {
  author?: {
    nickname: string;
    avatar_url: string;
  };
  assignee?: {
    nickname: string;
    avatar_url: string;
  };
}

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async (isBackground = false) => {
    if (!user?.couple_id) {
      setLoading(false);
      return;
    }

    if (!isBackground) setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("todos")
        .select(`
          *,
          author:users!created_by (nickname, avatar_url),
          assignee:users!assigned_to (nickname, avatar_url)
        `)
        .eq("couple_id", user.couple_id)
        .order("is_completed", { ascending: true })
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTodos((data as TodoWithAuthor[]) || []);
    } catch (err: any) {
      console.error("Error fetching todos:", err);
      setError(err.message || "할 일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user?.couple_id]);

  useEffect(() => {
    fetchTodos();

    if (!user?.couple_id) return;

    const channel = supabase
      .channel(`todos:couple:${user.couple_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `couple_id=eq.${user.couple_id}`,
        },
        () => fetchTodos(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodos, user?.couple_id]);

  const addTodo = async (todo: {
    title: string;
    description?: string;
    category: Todo["category"];
    priority: Todo["priority"];
    assigned_to?: string;
    due_date?: string;
  }) => {
    if (!user?.id || !user?.couple_id) return false;

    try {
      const { error } = await supabase.from("todos").insert({
        ...todo,
        couple_id: user.couple_id,
        created_by: user.id,
        is_completed: false,
      });
      if (error) throw error;
      await fetchTodos(true);
      return true;
    } catch (err) {
      console.error("할 일 추가 실패:", err);
      return false;
    }
  };

  const toggleTodo = async (todoId: string, currentCompleted: boolean) => {
    if (!user?.id) return;

    setTodos(prev =>
      prev.map(t =>
        t.id === todoId
          ? {
              ...t,
              is_completed: !currentCompleted,
              completed_at: !currentCompleted ? new Date().toISOString() : undefined,
              completed_by: !currentCompleted ? user.id : undefined,
            }
          : t
      )
    );

    try {
      const { error } = await supabase
        .from("todos")
        .update({
          is_completed: !currentCompleted,
          completed_at: !currentCompleted ? new Date().toISOString() : null,
          completed_by: !currentCompleted ? user.id : null,
        })
        .eq("id", todoId);

      if (error) throw error;
    } catch (err) {
      console.error("할 일 토글 실패:", err);
      fetchTodos(true);
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!user?.id) return false;

    setTodos(prev => prev.filter(t => t.id !== todoId));

    try {
      const { error } = await supabase.from("todos").delete().eq("id", todoId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("할 일 삭제 실패:", err);
      fetchTodos(true);
      return false;
    }
  };

  return {
    todos,
    loading,
    error,
    refresh: () => fetchTodos(false),
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
