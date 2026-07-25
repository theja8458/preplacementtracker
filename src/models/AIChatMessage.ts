import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAIChatMessage extends Document {
  userId: Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const AIChatMessageSchema = new Schema<IAIChatMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

AIChatMessageSchema.index({ userId: 1, createdAt: -1 });

const AIChatMessage: Model<IAIChatMessage> =
  mongoose.models.AIChatMessage ||
  mongoose.model<IAIChatMessage>("AIChatMessage", AIChatMessageSchema);

export default AIChatMessage;
