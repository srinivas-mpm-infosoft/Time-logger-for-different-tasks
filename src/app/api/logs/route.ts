import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import DailyLog from "@/models/DailyLog";
import Task from "@/models/Task";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "30");
  const skip = parseInt(searchParams.get("skip") || "0");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  }

  const logs = await DailyLog.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const logsWithTasks = await Promise.all(
    logs.map(async (log) => {
      const tasks = await Task.find({ userId: session.user.id, logDate: log.date })
        .sort({ createdAt: -1 })
        .lean();
      return { ...log, tasks };
    })
  );

  const total = await DailyLog.countDocuments(query);

  return NextResponse.json({ success: true, data: logsWithTasks, total });
}
