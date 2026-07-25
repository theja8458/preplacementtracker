import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserTopicProgress extends Document {
  userId: Types.ObjectId;
  topicId: Types.ObjectId;
  problemsSolved: number;
  lastUpdated: Date;
}

const UserTopicProgressSchema = new Schema<IUserTopicProgress>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
  problemsSolved: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

UserTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

const UserTopicProgress: Model<IUserTopicProgress> =
  mongoose.models.UserTopicProgress ||
  mongoose.model<IUserTopicProgress>("UserTopicProgress", UserTopicProgressSchema);

export default UserTopicProgress;
