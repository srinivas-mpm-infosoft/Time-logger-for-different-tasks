"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  ListTodo,
  CheckCircle2,
  CalendarDays,
  Zap,
  User,
} from "lucide-react";
import { formatDurationLong, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ProductivityChart } from "./ProductivityChart";

interface StatsData {
  user: {
    name: string;
    email: string;
    image?: string;
    provider: string;
    createdAt: string;
  };
  stats: {
    totalTrackedTime: number;
    totalTasks: number;
    completedTasks: number;
    totalDays: number;
    avgDailyTime: number;
  };
}

export function ProfileClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Profile card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="w-20 h-20 border-2 border-border">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
              <Badge variant="secondary" className="text-xs">
                {data?.user?.provider === "google" ? "Google" : "Email"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{session?.user?.email}</p>
            {data?.user?.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                Member since {formatDate(data.user.createdAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total tracked"
          value={formatDurationLong(Math.floor(data?.stats?.totalTrackedTime || 0))}
          color="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          icon={<ListTodo className="w-5 h-5" />}
          label="Total tasks"
          value={String(data?.stats?.totalTasks || 0)}
          color="text-purple-500 bg-purple-500/10"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed"
          value={String(data?.stats?.completedTasks || 0)}
          color="text-emerald-500 bg-emerald-500/10"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Avg / day"
          value={formatDurationLong(Math.floor(data?.stats?.avgDailyTime || 0))}
          color="text-orange-500 bg-orange-500/10"
        />
      </div>

      {/* Productivity chart */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Last 30 days activity</h2>
        </div>
        <Separator />
        <ProductivityChart />
      </div>

      {/* Account details */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Account details</h2>
        <Separator />
        <div className="space-y-3 text-sm">
          <Row label="Name" value={session?.user?.name || "—"} />
          <Row label="Email" value={session?.user?.email || "—"} />
          <Row label="Sign-in method" value={data?.user?.provider === "google" ? "Google OAuth" : "Email & Password"} />
          <Row label="Active days" value={String(data?.stats?.totalDays || 0)} />
          <Row
            label="Completion rate"
            value={
              data?.stats?.totalTasks
                ? `${Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)}%`
                : "—"
            }
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <div className="font-bold text-lg font-mono tabular-nums leading-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
