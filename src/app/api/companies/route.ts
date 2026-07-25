import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Company from "@/models/Company";
import UserCompanyPrep from "@/models/UserCompanyPrep";

const PRELOADED_COMPANIES = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Accenture",
  "HCL Technologies", "Amazon", "Capgemini", "Tech Mahindra",
  "L&T Technology Services", "Mphasis", "Hexaware",
  "IBM", "Zoho", "Freshworks", "Mindtree",
];

async function seedCompanies() {
  const existing = await Company.countDocuments({ isCustom: false });
  if (existing === 0) {
    await Company.insertMany(
      PRELOADED_COMPANIES.map((name) => ({ name, isCustom: false, createdBy: null }))
    );
  }
}

// GET — return all companies with user's prep status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  await seedCompanies();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const companies = await Company.find().sort({ isCustom: 1, name: 1 });
  const preps = await UserCompanyPrep.find({ userId: user._id });

  const prepMap: Record<string, { status: string; notes: string }> = {};
  preps.forEach((p) => {
    prepMap[p.companyId.toString()] = { status: p.status, notes: p.notes ?? "" };
  });

  const result = companies.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
    isCustom: c.isCustom,
    status: prepMap[c._id.toString()]?.status ?? "not_started",
    notes: prepMap[c._id.toString()]?.notes ?? "",
  }));

  return NextResponse.json({ companies: result });
}

// POST — add a custom company
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Check duplicates (case-insensitive)
  const existing = await Company.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
  if (existing) return NextResponse.json({ error: "Company already exists" }, { status: 409 });

  const company = await Company.create({ name: name.trim(), isCustom: true, createdBy: user._id });
  return NextResponse.json({
    _id: company._id.toString(),
    name: company.name,
    isCustom: true,
    status: "not_started",
    notes: "",
  }, { status: 201 });
}
