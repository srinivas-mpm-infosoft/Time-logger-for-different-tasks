"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTimerStore } from "@/store/timerStore";
import { getLogDateKey, formatDate } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { AddTaskForm } from "./AddTaskForm";
import { GlobalControls } from "./GlobalControls";
import { TaskFilters } from "./TaskFilters";
import { DashboardStats } from "./DashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ClipboardList } from "lucide-react";

interface Props {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardClient({ user }: Props) {
  const [date] = useState(getLogDateKey());
  const { createTask, performAction, editTask, deleteTask, bulkAction } = useTasks(date);
  const { isLoading, getFilteredTasks, getRunningCount } = useTimerStore();

  const filteredTasks = getFilteredTasks();
  const runningCount = getRunningCount();

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Good {getGreeting()}, {user.name?.split(" ")[0] || "there"}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(new Date())}
          </div>
        </div>
        {runningCount > 0 && (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg px-3 py-1.5 text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {runningCount} timer{runningCount !== 1 ? "s" : ""} running
          </div>
        )}
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Add task */}
      <AddTaskForm onCreate={createTask} />

      {/* Global controls */}
      <GlobalControls onBulkAction={bulkAction} runningCount={runningCount} />

      {/* Filters */}
      <TaskFilters />

      {/* Task list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : filteredTasks.length === 0 ? (
          <EmptyState />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onAction={(id, action) => performAction(id, action).then(() => {})}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>
    </main>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <ClipboardList className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">No tasks yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Add your first task above to start tracking time. Timers start automatically.
      </p>
    </div>
  );
}
