import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDailyActivityLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  problemsSolvedThatDay: number;
}

const DailyActivityLogSchema = new Schema<IDailyActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  problemsSolvedThatDay: { type: Number, default: 0 },
});

DailyActivityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyActivityLog: Model<IDailyActivityLog> =
  mongoose.models.DailyActivityLog ||
  mongoose.model<IDailyActivityLog>("DailyActivityLog", DailyActivityLogSchema);

export default DailyActivityLog;
