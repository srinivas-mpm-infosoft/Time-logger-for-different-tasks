"use client";

import { useState, useEffect } from "react";

export interface AnalyticsData {
  timeseries: Array<{ date: string; totalSeconds: number; sessions: number }>;
  byTask: Array<{ title: string; totalSeconds: number }>;
  sessionCounts: Array<{ date: string; sessions: number }>;
  summary: {
    totalSeconds: number;
    totalTasks: number;
    completedCount: number;
    topTask: { title: string; totalSeconds: number } | null;
    granularity: string;
  };
}

export default function useAnalytics(startIso: string, endIso: string, granularity = "day") {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ start: startIso, end: endIso, granularity });
        const res = await fetch(`/api/analytics?${q.toString()}`);
        const json = await res.json();
        if (!mounted) return;
        if (!res.ok) throw json;
        setData(json);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [startIso, endIso, granularity]);

  return { data, loading, error } as { data: AnalyticsData | null; loading: boolean; error: unknown };
}
