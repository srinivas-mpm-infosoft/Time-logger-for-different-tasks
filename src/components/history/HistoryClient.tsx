"use client";

import { useState, useEffect, useCallback } from "react";
import { DailyLog } from "@/types";
import { formatDate, formatDurationLong, formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  ListTodo,
  History,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export function HistoryClient() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const fetchLogs = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const skip = reset ? 0 : page * 20;
      const params = new URLSearchParams({ limit: "20", skip: skip.toString() });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(reset ? data.data : (prev) => [...prev, ...data.data]);
        setTotal(data.total);
        if (reset) setPage(0);
      }
    } catch {
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [page, startDate, endDate]);

  useEffect(() => {
    fetchLogs(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const exportCSV = () => {
    const rows = [["Date", "Task", "Status", "Time Tracked (seconds)", "Time Tracked"]];
    logs.forEach((log) => {
      (log.tasks || []).forEach((task) => {
        rows.push([
          log.date,
          task.taskName,
          task.status,
          task.accumulatedTime.toFixed(0),
          formatDuration(task.accumulatedTime),
        ]);
      });
    });

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetrack-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  const totalHours = logs.reduce((sum, l) => sum + l.totalTrackedTime, 0);

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6" />
            History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} day{total !== 1 ? "s" : ""} · {formatDurationLong(Math.floor(totalHours))} tracked
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start" onClick={exportCSV} disabled={logs.length === 0}>
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">From</span>
        </div>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-8 text-sm w-40"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-8 text-sm w-40"
        />
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => { setStartDate(""); setEndDate(""); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Log list */}
      <div className="space-y-3">
        {isLoading && logs.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No history yet</h3>
            <p className="text-sm text-muted-foreground">Start tracking tasks on the dashboard.</p>
          </div>
        ) : (
          logs.map((log) => {
            const expanded = expandedDates.has(log.date);
            return (
              <div key={log._id} className="rounded-xl border bg-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => toggleExpand(log.date)}
                >
                  <div className="flex items-center gap-4">
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">{formatDate(log.date)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {log.taskCount} task{log.taskCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-mono font-semibold">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatDurationLong(Math.floor(log.totalTrackedTime))}
                    </div>
                  </div>
                </button>

                {expanded && log.tasks && log.tasks.length > 0 && (
                  <div className="border-t divide-y">
                    {log.tasks.map((task) => (
                      <div key={task._id} className="flex items-center justify-between px-4 py-3 bg-muted/10">
                        <div className="flex items-center gap-3 min-w-0">
                          <ListTodo className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">{task.taskName}</span>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0 hidden sm:inline-flex"
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <span className="font-mono text-sm font-semibold tabular-nums shrink-0 ml-4">
                          {formatDuration(task.accumulatedTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {logs.length < total && !isLoading && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { setPage((p) => p + 1); fetchLogs(); }}
          >
            Load more
          </Button>
        )}

        {isLoading && logs.length > 0 && (
          <Skeleton className="h-16 rounded-xl" />
        )}
      </div>
    </main>
  );
}
