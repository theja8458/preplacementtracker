import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserOnboarding from "@/models/UserOnboarding";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dailyGoal } = await req.json();
  const goal = Math.max(1, Math.min(20, Number(dailyGoal)));

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await User.updateOne({ _id: user._id }, { $set: { dailyGoal: goal } });
  await UserOnboarding.updateOne(
    { userId: user._id },
    {
      $set: { dailyGoal: goal },
      $addToSet: { completedSteps: "set_goal" },
    }
  );

  return NextResponse.json({ ok: true });
}
