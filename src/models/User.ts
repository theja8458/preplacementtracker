import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  photoUrl: string;
  branch?: string;
  year?: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  dailyGoal: number;
  termsAcceptedVersion?: string | null;
  termsAcceptedAt?: Date | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoUrl: { type: String, default: "" },
    branch: { type: String },
    year: { type: String },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    dailyGoal: { type: Number, default: 5 },
    termsAcceptedVersion: { type: String, default: null },
    termsAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Critical index — every session-authenticated API call does User.findOne({ email })
UserSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
