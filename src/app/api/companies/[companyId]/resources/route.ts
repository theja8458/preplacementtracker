import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import CompanyResource from "@/models/CompanyResource";

// GET — list all resources for a company
export async function GET(
  _req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const resources = await CompanyResource.find({ companyId: params.companyId })
    .populate("addedBy", "name photoUrl")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    resources: resources.map((r) => ({
      _id: r._id.toString(),
      title: r.title,
      url: r.url,
      createdAt: r.createdAt,
      isOwner: r.addedBy._id.toString() === user._id.toString(),
      addedBy: {
        name: (r.addedBy as any).name,
        photoUrl: (r.addedBy as any).photoUrl,
      },
    })),
  });
}

// POST — add a resource to a company
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { title, url } = await req.json();
  if (!title?.trim() || !url?.trim())
    return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });

  const resource = await CompanyResource.create({
    companyId: params.companyId,
    addedBy: user._id,
    title: title.trim(),
    url: url.trim(),
  });

  return NextResponse.json({
    _id: resource._id.toString(),
    title: resource.title,
    url: resource.url,
    createdAt: resource.createdAt,
    isOwner: true,
    addedBy: { name: user.name, photoUrl: user.photoUrl },
  }, { status: 201 });
}
