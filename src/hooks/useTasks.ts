"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTimerStore } from "@/store/timerStore";
import { Task } from "@/types";
import { getLogDateKey } from "@/lib/utils";

export function useTasks(date: string = getLogDateKey()) {
  const { setTasks, addTask, updateTask, removeTask, setLoading, tasks } = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?date=${date}`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [date, setTasks, setLoading]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Sync running tasks every 30s to keep server state accurate
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const running = tasks.filter((t) => t.isRunning);
      if (running.length > 0) fetchTasks();
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tasks, fetchTasks]);

  const createTask = useCallback(
    async (taskName: string, startImmediately = true) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskName, startImmediately }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        addTask(data.data as Task);
        toast.success(`Task "${taskName}" created`);
        return data.data as Task;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create task");
        throw e;
      }
    },
    [addTask]
  );

  const performAction = useCallback(
    async (taskId: string, action: "start" | "pause" | "resume" | "stop" | "complete") => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        updateTask(taskId, data.data as Task);
        return data.data as Task;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update task");
        throw e;
      }
    },
    [updateTask]
  );

  const editTask = useCallback(
    async (taskId: string, taskName: string) => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskName }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        updateTask(taskId, data.data as Task);
        toast.success("Task renamed");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to rename task");
      }
    },
    [updateTask]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        removeTask(taskId);
        toast.success("Task deleted");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete task");
      }
    },
    [removeTask]
  );

  const bulkAction = useCallback(
    async (action: "pause-all" | "resume-all" | "stop-all") => {
      try {
        const res = await fetch("/api/tasks/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, date }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setTasks(data.data as Task[]);
        const labels = { "pause-all": "paused", "resume-all": "resumed", "stop-all": "stopped" };
        toast.success(`All tasks ${labels[action]}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to perform action");
      }
    },
    [date, setTasks]
  );

  return { fetchTasks, createTask, performAction, editTask, deleteTask, bulkAction };
}
