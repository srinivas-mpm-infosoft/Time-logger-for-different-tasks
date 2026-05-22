import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import DailyLog from "@/models/DailyLog";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [user, taskStats, logStats] = await Promise.all([
    User.findById(session.user.id).lean(),
    Task.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          totalTime: { $sum: "$accumulatedTime" },
        },
      },
    ]),
    DailyLog.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalTrackedTime: { $sum: "$totalTrackedTime" },
        },
      },
    ]),
  ]);

  const taskData = taskStats[0] || { totalTasks: 0, completedTasks: 0, totalTime: 0 };
  const logData = logStats[0] || { totalDays: 0, totalTrackedTime: 0 };

  return NextResponse.json({
    success: true,
    data: {
      user,
      stats: {
        totalTrackedTime: logData.totalTrackedTime || taskData.totalTime,
        totalTasks: taskData.totalTasks,
        completedTasks: taskData.completedTasks,
        totalDays: logData.totalDays,
        avgDailyTime: logData.totalDays > 0 ? logData.totalTrackedTime / logData.totalDays : 0,
      },
    },
  });
}
