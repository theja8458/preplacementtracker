import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDiscussPost extends Document {
  authorId: Types.ObjectId;
  problemTitle: string;
  problemUrl?: string;
  topicId: Types.ObjectId;
  title: string;
  body: string;
  images: { url: string; cloudinaryPublicId: string }[];
  upvotes: number;
  upvotedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscussPostSchema = new Schema<IDiscussPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problemTitle: { type: String, required: true },
    problemUrl: { type: String },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    images: [
      {
        url: String,
        cloudinaryPublicId: String,
      },
    ],
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Indexes — covers all three sort modes (latest, upvotes, unanswered) and topic filter
DiscussPostSchema.index({ createdAt: -1 });
DiscussPostSchema.index({ topicId: 1, createdAt: -1 });
DiscussPostSchema.index({ upvotes: -1 });

const DiscussPost: Model<IDiscussPost> =
  mongoose.models.DiscussPost ||
  mongoose.model<IDiscussPost>("DiscussPost", DiscussPostSchema);

export default DiscussPost;
