"use client";

import { useState, useRef } from "react";
import useAnalytics from "@/hooks/useAnalytics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";
import ExportButtons from "./ExportButtons";

const COLORS = ["#4f46e5", "#06b6d4", "#f97316", "#10b981", "#ef4444", "#a78bfa", "#f59e0b"];

export default function AnalyticsClient() {
  const endDefault = new Date();
  const startDefault = new Date();
  startDefault.setDate(endDefault.getDate() - 29);

  const [start, setStart] = useState<string>(format(startDefault, "yyyy-MM-dd"));
  const [end, setEnd] = useState<string>(format(endDefault, "yyyy-MM-dd"));
  const [granularity] = useState<string>("day");

  const { data, loading, error } = useAnalytics(new Date(start).toISOString(), new Date(end).toISOString(), granularity);

  const rootRef = useRef<HTMLDivElement | null>(null);

  function setPreset(days: number) {
    const e = new Date();
    const s = new Date();
    s.setDate(e.getDate() - (days - 1));
    setStart(format(s, "yyyy-MM-dd"));
    setEnd(format(e, "yyyy-MM-dd"));
  }

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-destructive">Error loading analytics</div>;

  const timeseries = data?.timeseries || [];
  const byTask = data?.byTask || [];
  const sessionCounts = data?.sessionCounts || [];
  const summary = data?.summary || {};

  // Prepare data for charts (ensure continuous dates)
  // For simplicity, use timeseries as-is; missing dates will not show points.

  return (
    <div className="space-y-4" ref={rootRef as any} id="analytics-root">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setPreset(7)} className="btn">7d</button>
          <button onClick={() => setPreset(30)} className="btn">30d</button>
          <button onClick={() => setPreset(90)} className="btn">90d</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">From</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input" />
          <label className="text-sm">To</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
          <ExportButtons data={{ timeseries, byTask, sessionCounts, summary }} start={start} end={end} rootRef={rootRef} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-3">Total time</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={timeseries}>
                <XAxis dataKey="date" tickFormatter={(d) => d} />
                <YAxis />
                <Tooltip formatter={(v: any) => `${Math.floor(v / 3600)}h ${Math.floor((v % 3600) / 60)}m`} />
                <Line type="monotone" dataKey="totalSeconds" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-3">By task</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byTask} dataKey="totalSeconds" nameKey="title" outerRadius={90} label={(entry: any) => `${entry.title}` }>
                  {byTask.map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-medium mb-3">Sessions</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={sessionCounts}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total time</div>
          <div className="text-xl font-bold">{Math.floor((summary.totalSeconds || 0) / 3600)}h {Math.floor(((summary.totalSeconds || 0) % 3600) / 60)}m</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total tasks</div>
          <div className="text-xl font-bold">{summary.totalTasks || 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="text-xl font-bold">{summary.completedCount || 0}</div>
        </div>
      </div>
    </div>
  );
}
