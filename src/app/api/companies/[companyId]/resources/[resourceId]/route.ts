import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import CompanyResource from "@/models/CompanyResource";

// DELETE — remove a resource (only the owner can delete it)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { companyId: string; resourceId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const resource = await CompanyResource.findById(params.resourceId);
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (resource.addedBy.toString() !== user._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await resource.deleteOne();
  return NextResponse.json({ success: true });
}
