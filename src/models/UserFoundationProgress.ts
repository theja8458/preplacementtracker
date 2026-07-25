import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserFoundationProgress extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
}

const UserFoundationProgressSchema = new Schema<IUserFoundationProgress>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  problemId: { type: Schema.Types.ObjectId, ref: "FoundationProblem", required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

UserFoundationProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
UserFoundationProgressSchema.index({ userId: 1 });

const UserFoundationProgress: Model<IUserFoundationProgress> =
  mongoose.models.UserFoundationProgress ||
  mongoose.model<IUserFoundationProgress>("UserFoundationProgress", UserFoundationProgressSchema);

export default UserFoundationProgress;
