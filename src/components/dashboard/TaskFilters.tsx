"use client";

import { useTimerStore } from "@/store/timerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "paused", label: "Paused" },
  { value: "stopped", label: "Stopped" },
  { value: "completed", label: "Completed" },
] as const;

const sortOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "totalTime", label: "Most time" },
  { value: "taskName", label: "Name A-Z" },
] as const;

export function TaskFilters() {
  const { searchQuery, filterStatus, sortBy, setSearchQuery, setFilterStatus, setSortBy } =
    useTimerStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filterStatus === f.value ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setFilterStatus(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        className="h-8 text-xs rounded-md border border-input bg-background px-2 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
