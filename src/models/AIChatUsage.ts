import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAIChatUsage extends Document {
  userId: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  questionsAsked: number;
}

const AIChatUsageSchema = new Schema<IAIChatUsage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // e.g. "2024-07-08"
  questionsAsked: { type: Number, default: 0 },
});

AIChatUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

const AIChatUsage: Model<IAIChatUsage> =
  mongoose.models.AIChatUsage ||
  mongoose.model<IAIChatUsage>("AIChatUsage", AIChatUsageSchema);

export default AIChatUsage;
