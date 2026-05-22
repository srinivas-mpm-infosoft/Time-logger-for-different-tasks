import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import DailyLog from "@/models/DailyLog";
import { z } from "zod";
import { getLogDateKey } from "@/lib/utils";

const bulkSchema = z.object({
  action: z.enum(["pause-all", "resume-all", "stop-all"]),
  date: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }

  const { action, date = getLogDateKey() } = parsed.data;
  const now = new Date();

  await connectDB();

  if (action === "pause-all") {
    const runningTasks = await Task.find({
      userId: session.user.id,
      isRunning: true,
      logDate: date,
    });

    for (const task of runningTasks) {
      if (task.startedAt) {
        const elapsed = (now.getTime() - new Date(task.startedAt).getTime()) / 1000;
        task.accumulatedTime += elapsed;
        task.totalTime = task.accumulatedTime;
      }
      task.isRunning = false;
      task.startedAt = null;
      task.pausedAt = now;
      task.status = "paused";
      await task.save();
    }
  } else if (action === "resume-all") {
    const pausedTasks = await Task.find({
      userId: session.user.id,
      status: "paused",
      logDate: date,
    });

    for (const task of pausedTasks) {
      task.isRunning = true;
      task.startedAt = now;
      task.pausedAt = null;
      task.status = "running";
      await task.save();
    }
  } else if (action === "stop-all") {
    const activeTasks = await Task.find({
      userId: session.user.id,
      status: { $in: ["running", "paused"] },
      logDate: date,
    });

    for (const task of activeTasks) {
      if (task.isRunning && task.startedAt) {
        const elapsed = (now.getTime() - new Date(task.startedAt).getTime()) / 1000;
        task.accumulatedTime += elapsed;
        task.totalTime = task.accumulatedTime;
      }
      task.isRunning = false;
      task.startedAt = null;
      task.status = "stopped";
      await task.save();
    }
  }

  const tasks = await Task.find({ userId: session.user.id, logDate: date })
    .sort({ createdAt: -1 })
    .lean();

  const totalTrackedTime = tasks.reduce((sum, t) => sum + t.accumulatedTime, 0);
  await DailyLog.findOneAndUpdate(
    { userId: session.user.id, date },
    { totalTrackedTime, taskCount: tasks.length },
    { upsert: true }
  );

  return NextResponse.json({ success: true, data: tasks });
}
