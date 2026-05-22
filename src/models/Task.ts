import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "running" | "paused" | "stopped" | "completed";

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  taskName: string;
  isRunning: boolean;
  startedAt?: Date | null;
  pausedAt?: Date | null;
  accumulatedTime: number;
  totalTime: number;
  status: TaskStatus;
  logDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskName: { type: String, required: true, trim: true, maxlength: 200 },
    isRunning: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    accumulatedTime: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    status: { type: String, enum: ["running", "paused", "stopped", "completed"], default: "paused" },
    logDate: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, logDate: 1 });
TaskSchema.index({ userId: 1, status: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
export default Task;
