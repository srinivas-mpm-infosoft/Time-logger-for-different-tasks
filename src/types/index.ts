export type TaskStatus = "running" | "paused" | "stopped" | "completed";

export interface Task {
  _id: string;
  userId: string;
  taskName: string;
  isRunning: boolean;
  startedAt?: string | null;
  pausedAt?: string | null;
  accumulatedTime: number;
  totalTime: number;
  status: TaskStatus;
  logDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  _id: string;
  userId: string;
  date: string;
  totalTrackedTime: number;
  taskCount: number;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: string;
  createdAt: string;
}

export interface UserStats {
  totalTrackedTime: number;
  totalTasks: number;
  completedTasks: number;
  totalDays: number;
  avgDailyTime: number;
}

export interface CreateTaskInput {
  taskName: string;
  startImmediately?: boolean;
}

export interface UpdateTaskInput {
  taskName?: string;
  action?: "start" | "pause" | "resume" | "stop" | "complete";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
