"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DailyLog } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartData {
  date: string;
  hours: number;
}

export function ProductivityChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0];

      const res = await fetch(`/api/logs?startDate=${startDate}&endDate=${endDate}&limit=30`);
      const json = await res.json();

      if (json.success) {
        const chartData: ChartData[] = (json.data as DailyLog[])
          .reverse()
          .map((log) => ({
            date: log.date.slice(5),
            hours: parseFloat((log.totalTrackedTime / 3600).toFixed(2)),
          }));
        setData(chartData);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No data yet — start tracking tasks.
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            unit="h"
          />
          <Tooltip
            formatter={(v) => [`${v}h`, "Hours"]}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="hours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
