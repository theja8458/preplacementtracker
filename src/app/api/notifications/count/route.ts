import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  // userId is stored in the JWT token by auth.ts — no User.findOne needed
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ unread: 0 });

  await dbConnect();
  const unread = await Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false,
  });
  return NextResponse.json({ unread });
}
