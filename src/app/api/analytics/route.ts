import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Task from "@/models/Task";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { format } from "date-fns";

export async function GET(req: Request) {
  const session = await auth();
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

  const userIdStr = (session as any).user?.id || (session as any).user?._id || (session as any).user?.email;
  if (!userIdStr) return NextResponse.json({ error: "Invalid user" }, { status: 400 });

  let userId: any = userIdStr;
  try {
    userId = new mongoose.Types.ObjectId(userIdStr);
  } catch (e) {
    // leave as-is (maybe stored as string)
  }

  const match: any = { userId, logDate: { $gte: startKey, $lte: endKey } };

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

  const timeseries = timeseriesAgg.map((r: any) => ({ date: r._id, totalSeconds: r.totalTime, sessions: r.sessions }));

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

  const byTask = byTaskAgg.map((r: any) => ({ title: r._id, totalSeconds: r.totalTime }));

  // session counts (per day)
  const sessionCounts = timeseries.map((t: any) => ({ date: t.date, sessions: t.sessions }));

  // summary
  const totalSeconds = timeseries.reduce((s: number, t: any) => s + (t.totalSeconds || 0), 0);
  const totalTasks = await Task.countDocuments({ userId, logDate: { $gte: startKey, $lte: endKey } }).exec();
  const completedCount = await Task.countDocuments({ userId, status: "completed", logDate: { $gte: startKey, $lte: endKey } }).exec();

  const topTask = byTask.length > 0 ? byTask[0] : null;

  return NextResponse.json({ timeseries, byTask, sessionCounts, summary: { totalSeconds, totalTasks, completedCount, topTask, granularity } });
}
