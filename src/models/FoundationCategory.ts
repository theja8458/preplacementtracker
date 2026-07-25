import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFoundationCategory extends Document {
  name: string;
  order: number;
  description: string;
  icon: string;
}

const FoundationCategorySchema = new Schema<IFoundationCategory>({
  name: { type: String, required: true, unique: true },
  order: { type: Number, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
});

FoundationCategorySchema.index({ order: 1 });

const FoundationCategory: Model<IFoundationCategory> =
  mongoose.models.FoundationCategory ||
  mongoose.model<IFoundationCategory>("FoundationCategory", FoundationCategorySchema);

export default FoundationCategory;
