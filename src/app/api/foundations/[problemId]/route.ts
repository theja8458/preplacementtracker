import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import UserFoundationProgress from "@/models/UserFoundationProgress";
import mongoose from "mongoose";

// PATCH /api/foundations/[problemId] — toggle completed
export async function PATCH(
  req: NextRequest,
  { params }: { params: { problemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = new mongoose.Types.ObjectId((session.user as any).id as string);
  const problemId = new mongoose.Types.ObjectId(params.problemId);

  const { completed } = await req.json();

  const doc = await UserFoundationProgress.findOneAndUpdate(
    { userId, problemId },
    {
      $set: {
        completed,
        completedAt: completed ? new Date() : undefined,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ completed: doc.completed });
}
