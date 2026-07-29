import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { format } from "date-fns";

export const runtime = "nodejs";

type SessionUser = { id?: string; _id?: string; email?: string } | undefined;
type AppSession = { user?: SessionUser } | null;

export async function GET(req: Request) {
  const session = (await auth()) as AppSession;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const startIso = url.searchParams.get("start");
  const endIso = url.searchParams.get("end");
  const granularity = url.searchParams.get("granularity") || "day";

  const start = startIso ? new Date(startIso) : new Date();
  const end = endIso ? new Date(endIso) : new Date();
  // normalize to local dates (logDate in Task is YYYY-MM-DD)
  const startKey = format(start, "yyyy-MM-dd");
  const endKey = format(end, "yyyy-MM-dd");

  await connectDB();

  const userIdStr = session?.user?.id || session?.user?._id || session?.user?.email;
  if (!userIdStr) return NextResponse.json({ error: "Invalid user" }, { status: 400 });

  let userId: mongoose.Types.ObjectId | string = String(userIdStr);
  try {
    userId = new mongoose.Types.ObjectId(String(userIdStr));
  } catch (_e) {
    // leave as-is (maybe stored as string)
  }

  const match: Record<string, unknown> = { userId, logDate: { $gte: startKey, $lte: endKey } };

  // timeseries by date
  const timeseriesAgg = await Task.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$logDate",
        totalTime: { $sum: "$totalTime" },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();

  const timeseries = (timeseriesAgg as Array<{ _id: string; totalTime: number; sessions?: number }>).map((r) => ({ date: r._id, totalSeconds: r.totalTime, sessions: r.sessions || 0 }));

  // by task
  const byTaskAgg = await Task.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$taskName",
        totalTime: { $sum: "$totalTime" },
      },
    },
    { $sort: { totalTime: -1 } },
    { $limit: 50 },
  ]).exec();

  const byTask = (byTaskAgg as Array<{ _id: string; totalTime: number }>).map((r) => ({ title: r._id, totalSeconds: r.totalTime }));

  // session counts (per day)
  const sessionCounts = timeseries.map((t) => ({ date: t.date, sessions: t.sessions }));

  // summary
  const totalSeconds = timeseries.reduce((s: number, t) => s + (t.totalSeconds || 0), 0);
  const totalTasks = await Task.countDocuments({ userId, logDate: { $gte: startKey, $lte: endKey } }).exec();
  const completedCount = await Task.countDocuments({ userId, status: "completed", logDate: { $gte: startKey, $lte: endKey } }).exec();

  const topTask = byTask.length > 0 ? byTask[0] : null;

  return NextResponse.json({ timeseries, byTask, sessionCounts, summary: { totalSeconds, totalTasks, completedCount, topTask, granularity } });
}
