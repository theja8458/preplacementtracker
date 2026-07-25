import mongoose from "mongoose";

const FeatureInterestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feature: {
    type: String,
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

FeatureInterestSchema.index({ userId: 1, feature: 1 }, { unique: true });

export default mongoose.models.FeatureInterest ||
  mongoose.model("FeatureInterest", FeatureInterestSchema);
