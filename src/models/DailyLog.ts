import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  totalTrackedTime: number;
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    totalTrackedTime: { type: Number, default: 0 },
    taskCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyLog: Model<IDailyLog> =
  mongoose.models.DailyLog || mongoose.model<IDailyLog>("DailyLog", DailyLogSchema);
export default DailyLog;
