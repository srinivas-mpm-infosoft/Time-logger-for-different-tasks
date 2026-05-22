import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import DailyLog from "@/models/DailyLog";
import { z } from "zod";
import { getLogDateKey } from "@/lib/utils";

const createSchema = z.object({
  taskName: z.string().min(1, "Task name is required").max(200),
  startImmediately: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || getLogDateKey();

  await connectDB();
  const tasks = await Task.find({ userId: session.user.id, logDate: date })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { taskName, startImmediately } = parsed.data;
  const logDate = getLogDateKey();

  await connectDB();

  const now = new Date();
  const task = await Task.create({
    userId: session.user.id,
    taskName,
    isRunning: startImmediately,
    startedAt: startImmediately ? now : null,
    accumulatedTime: 0,
    totalTime: 0,
    status: startImmediately ? "running" : "paused",
    logDate,
  });

  await DailyLog.findOneAndUpdate(
    { userId: session.user.id, date: logDate },
    { $inc: { taskCount: 1 } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, data: task }, { status: 201 });
}
