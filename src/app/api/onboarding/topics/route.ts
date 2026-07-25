import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserOnboarding from "@/models/UserOnboarding";
import UserTopicProgress from "@/models/UserTopicProgress";
import Topic from "@/models/Topic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topicNames } = await req.json();

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (topicNames && topicNames.length > 0) {
    const topics = await Topic.find({ name: { $in: topicNames } });
    const ops = topics.map((topic) => ({
      updateOne: {
        filter: { userId: user._id, topicId: topic._id },
        update: { $setOnInsert: { userId: user._id, topicId: topic._id, problemsSolved: 0, lastUpdated: new Date() } },
        upsert: true,
      },
    }));
    if (ops.length > 0) await UserTopicProgress.bulkWrite(ops);
  }

  await UserOnboarding.updateOne(
    { userId: user._id },
    { $addToSet: { completedSteps: "picked_topics" } }
  );

  return NextResponse.json({ ok: true });
}
