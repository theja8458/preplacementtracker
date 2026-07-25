import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDiscussReply extends Document {
  postId: Types.ObjectId;
  parentReplyId?: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  images: { url: string; cloudinaryPublicId: string }[];
  upvotes: number;
  upvotedBy: Types.ObjectId[];
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussReplySchema = new Schema<IDiscussReply>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "DiscussPost", required: true },
    parentReplyId: { type: Schema.Types.ObjectId, ref: "DiscussReply", default: null },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    images: [{ url: String, cloudinaryPublicId: String }],
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const DiscussReply: Model<IDiscussReply> =
  mongoose.models.DiscussReply ||
  mongoose.model<IDiscussReply>("DiscussReply", DiscussReplySchema);

export default DiscussReply;
