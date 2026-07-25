import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserOnboarding from "@/models/UserOnboarding";
import UserTopicProgress from "@/models/UserTopicProgress";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await UserOnboarding.updateOne(
    { userId: user._id },
    {
      $set: { isComplete: true },
      $addToSet: { completedSteps: "joined_leaderboard" },
    }
  );

  // Compute rank = number of users with more total problems than this user + 1
  const userTotal = await UserTopicProgress.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, total: { $sum: "$problemsSolved" } } },
  ]);
  const myTotal = userTotal[0]?.total ?? 0;

  const totalUsers = await User.countDocuments();

  return NextResponse.json({ ok: true, rank: totalUsers, totalUsers });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const totalUsers = await User.countDocuments();
  return NextResponse.json({ totalUsers });
}
