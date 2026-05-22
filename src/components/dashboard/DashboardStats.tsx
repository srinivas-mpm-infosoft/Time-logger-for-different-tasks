"use client";

import { useTimerStore } from "@/store/timerStore";
import { getCurrentElapsed, formatDurationLong } from "@/lib/utils";
import { useEffect, useReducer, useRef } from "react";
import { Clock, ListTodo, CheckCircle2, Timer } from "lucide-react";

export function DashboardStats() {
  const { tasks } = useTimerStore();
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const hasRunning = tasks.some((t) => t.isRunning);
    if (!hasRunning) return;

    let last = 0;
    const tick = (now: number) => {
      if (now - last > 1000) { last = now; forceRender(); }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [tasks]);

  const totalElapsed = tasks.reduce((sum, t) => sum + getCurrentElapsed(t), 0);
  const runningCount = tasks.filter((t) => t.isRunning).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard icon={<Clock className="w-4 h-4" />} label="Total today" value={formatDurationLong(Math.floor(totalElapsed))} color="text-blue-500" />
      <StatCard icon={<Timer className="w-4 h-4" />} label="Running" value={runningCount.toString()} color="text-green-500" />
      <StatCard icon={<ListTodo className="w-4 h-4" />} label="Total tasks" value={tasks.length.toString()} color="text-purple-500" />
      <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Completed" value={completedCount.toString()} color="text-emerald-500" />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <div className="text-xl font-bold font-mono tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
