import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationType =
  | "reply_on_post"
  | "reply_on_reply"
  | "upvote_post"
  | "upvote_reply"
  | "accepted_answer"
  | "streak_warning";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  fromUserId?: Types.ObjectId;
  referenceId?: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "reply_on_post",
        "reply_on_reply",
        "upvote_post",
        "upvote_reply",
        "accepted_answer",
        "streak_warning",
      ],
      required: true,
    },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    referenceId: { type: Schema.Types.ObjectId, default: null },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes — userId+isRead is queried every 60s for the bell badge count
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
