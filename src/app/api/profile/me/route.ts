import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { branch, year } = await req.json();
  await dbConnect();

  await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { branch: branch ?? "", year: year ?? "" } }
  );

  return NextResponse.json({ ok: true });
}
