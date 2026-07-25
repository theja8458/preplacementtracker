import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserCompanyPrep from "@/models/UserCompanyPrep";

// PATCH — update status + notes for a company
export async function PATCH(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { status, notes } = await req.json();
  const validStatuses = ["not_started", "in_progress", "done"];
  if (status && !validStatuses.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const prep = await UserCompanyPrep.findOneAndUpdate(
    { userId: user._id, companyId: params.companyId },
    { $set: { ...(status && { status }), ...(notes !== undefined && { notes }), lastUpdated: new Date() } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ status: prep.status, notes: prep.notes });
}
