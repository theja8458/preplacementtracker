import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type FoundationDifficulty = "warmup" | "easy" | "core";

export interface IFoundationProblem extends Document {
  categoryId: Types.ObjectId;
  title: string;
  difficulty: FoundationDifficulty;
  statement: string;
  approachHint: string;
  sampleInput: string;
  sampleOutput: string;
  order: number;
}

const FoundationProblemSchema = new Schema<IFoundationProblem>({
  categoryId: { type: Schema.Types.ObjectId, ref: "FoundationCategory", required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["warmup", "easy", "core"], required: true },
  statement: { type: String, required: true },
  approachHint: { type: String, required: true },
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  order: { type: Number, required: true },
});

FoundationProblemSchema.index({ categoryId: 1, order: 1 });

const FoundationProblem: Model<IFoundationProblem> =
  mongoose.models.FoundationProblem ||
  mongoose.model<IFoundationProblem>("FoundationProblem", FoundationProblemSchema);

export default FoundationProblem;
