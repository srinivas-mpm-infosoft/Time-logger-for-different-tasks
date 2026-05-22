import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import DailyLog from "@/models/DailyLog";
import { z } from "zod";

const updateSchema = z.object({
  taskName: z.string().min(1).max(200).optional(),
  action: z.enum(["start", "pause", "resume", "stop", "complete"]).optional(),
});

async function updateDailyLog(userId: string, date: string) {
  const tasks = await Task.find({ userId, logDate: date });
  const totalTrackedTime = tasks.reduce((sum, t) => {
    let elapsed = t.accumulatedTime;
    if (t.isRunning && t.startedAt) {
      elapsed += (Date.now() - new Date(t.startedAt).getTime()) / 1000;
    }
    return sum + elapsed;
  }, 0);

  await DailyLog.findOneAndUpdate(
    { userId, date },
    { totalTrackedTime, taskCount: tasks.length },
    { upsert: true }
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await connectDB();
  const task = await Task.findOne({ _id: id, userId: session.user.id });
  if (!task) {
    return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
  }

  const { taskName, action } = parsed.data;
  const now = new Date();

  if (taskName) task.taskName = taskName;

  if (action) {
    switch (action) {
      case "start":
      case "resume":
        if (!task.isRunning) {
          task.isRunning = true;
          task.startedAt = now;
          task.pausedAt = null;
          task.status = "running";
        }
        break;

      case "pause":
        if (task.isRunning && task.startedAt) {
          const elapsed = (now.getTime() - new Date(task.startedAt).getTime()) / 1000;
          task.accumulatedTime += elapsed;
          task.totalTime = task.accumulatedTime;
          task.isRunning = false;
          task.startedAt = null;
          task.pausedAt = now;
          task.status = "paused";
        }
        break;

      case "stop":
        if (task.isRunning && task.startedAt) {
          const elapsed = (now.getTime() - new Date(task.startedAt).getTime()) / 1000;
          task.accumulatedTime += elapsed;
          task.totalTime = task.accumulatedTime;
        }
        task.isRunning = false;
        task.startedAt = null;
        task.status = "stopped";
        break;

      case "complete":
        if (task.isRunning && task.startedAt) {
          const elapsed = (now.getTime() - new Date(task.startedAt).getTime()) / 1000;
          task.accumulatedTime += elapsed;
          task.totalTime = task.accumulatedTime;
        }
        task.isRunning = false;
        task.startedAt = null;
        task.status = "completed";
        break;
    }
  }

  await task.save();
  await updateDailyLog(session.user.id, task.logDate);

  return NextResponse.json({ success: true, data: task });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const task = await Task.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!task) {
    return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
  }

  await updateDailyLog(session.user.id, task.logDate);

  return NextResponse.json({ success: true, message: "Task deleted" });
}
