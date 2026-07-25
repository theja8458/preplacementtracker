import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICompanyResource extends Document {
  companyId: Types.ObjectId;
  addedBy: Types.ObjectId;
  title: string;
  url: string;
  createdAt: Date;
}

const CompanyResourceSchema = new Schema<ICompanyResource>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const CompanyResource: Model<ICompanyResource> =
  mongoose.models.CompanyResource ||
  mongoose.model<ICompanyResource>("CompanyResource", CompanyResourceSchema);

export default CompanyResource;
