import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Topic from "@/models/Topic";
import UserTopicProgress from "@/models/UserTopicProgress";
import { seedTopics } from "@/lib/seed";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  await seedTopics();

  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const topics = await Topic.find().sort({ order: 1 });
  const progresses = await UserTopicProgress.find({ userId: user._id });

  const progressMap: Record<string, number> = {};
  progresses.forEach((p) => {
    progressMap[p.topicId.toString()] = p.problemsSolved;
  });

  const topicsWithProgress = topics.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    order: t.order,
    resourceLinks: t.resourceLinks,
    problemsSolved: progressMap[t._id.toString()] ?? 0,
  }));

  const totalSolved = progresses.reduce((sum, p) => sum + p.problemsSolved, 0);

  return NextResponse.json({
    topics: topicsWithProgress,
    totalSolved,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  });
}
