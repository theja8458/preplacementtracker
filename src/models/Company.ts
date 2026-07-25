import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICompany extends Document {
  name: string;
  isCustom: boolean;
  createdBy?: Types.ObjectId;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  isCustom: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
});

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;
