import mongoose, { Schema, Document, Model } from "mongoose";

export type TopicTier = "fundamentals" | "core" | "trees-graphs" | "advanced";

export interface ITopic extends Document {
  name: string;
  order: number;
  tier: TopicTier;
  resourceLinks: { title: string; url: string }[];
}

const TopicSchema = new Schema<ITopic>({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  tier: {
    type: String,
    enum: ["fundamentals", "core", "trees-graphs", "advanced"],
    default: "fundamentals",
  },
  resourceLinks: [
    {
      title: { type: String },
      url: { type: String },
    },
  ],
});

const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);

export default Topic;
