import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// PATCH /api/profile/update-avatar
// Saves the Cloudinary secure_url as the user's photoUrl
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { photoUrl } = await req.json();
  if (!photoUrl?.trim())
    return NextResponse.json({ error: "photoUrl required" }, { status: 400 });

  await dbConnect();
  await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { photoUrl } }
  );

  return NextResponse.json({ ok: true, photoUrl });
}
