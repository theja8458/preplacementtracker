import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserOnboarding extends Document {
  userId: Types.ObjectId;
  isComplete: boolean;
  completedSteps: string[];
  dailyGoal: number;
  createdAt: Date;
}

const UserOnboardingSchema = new Schema<IUserOnboarding>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    isComplete: { type: Boolean, default: false },
    completedSteps: [{ type: String }],
    dailyGoal: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const UserOnboarding: Model<IUserOnboarding> =
  mongoose.models.UserOnboarding ||
  mongoose.model<IUserOnboarding>("UserOnboarding", UserOnboardingSchema);

export default UserOnboarding;
