import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserCompanyPrep extends Document {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  status: "not_started" | "in_progress" | "done";
  notes?: string;
  lastUpdated: Date;
}

const UserCompanyPrepSchema = new Schema<IUserCompanyPrep>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "done"],
    default: "not_started",
  },
  notes: { type: String, default: "" },
  lastUpdated: { type: Date, default: Date.now },
});

UserCompanyPrepSchema.index({ userId: 1, companyId: 1 }, { unique: true });

const UserCompanyPrep: Model<IUserCompanyPrep> =
  mongoose.models.UserCompanyPrep ||
  mongoose.model<IUserCompanyPrep>("UserCompanyPrep", UserCompanyPrepSchema);

export default UserCompanyPrep;
