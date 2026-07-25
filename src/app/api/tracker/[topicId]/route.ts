import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isToday, isYesterday, startOfDay } from "date-fns";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Topic from "@/models/Topic";
import UserTopicProgress from "@/models/UserTopicProgress";
import DailyActivityLog from "@/models/DailyActivityLog";

export async function PATCH(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { increment, exactValue } = body;

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const topic = await Topic.findById(params.topicId);
  if (!topic)
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  // ── Update UserTopicProgress ──
  let progress = await UserTopicProgress.findOne({
    userId: user._id,
    topicId: topic._id,
  });

  let actualIncrement = 0;

  if (exactValue !== undefined) {
    const newVal = Math.max(0, Number(exactValue));
    actualIncrement = newVal - (progress?.problemsSolved ?? 0);
    if (progress) {
      progress.problemsSolved = newVal;
      progress.lastUpdated = new Date();
      await progress.save();
    } else {
      progress = await UserTopicProgress.create({
        userId: user._id,
        topicId: topic._id,
        problemsSolved: newVal,
        lastUpdated: new Date(),
      });
    }
  } else {
    actualIncrement = Number(increment ?? 1);
    if (progress) {
      progress.problemsSolved = Math.max(0, progress.problemsSolved + actualIncrement);
      progress.lastUpdated = new Date();
      await progress.save();
    } else {
      progress = await UserTopicProgress.create({
        userId: user._id,
        topicId: topic._id,
        problemsSolved: Math.max(0, actualIncrement),
        lastUpdated: new Date(),
      });
    }
  }

  // ── Streak + DailyActivityLog (only on positive increment) ──
  if (actualIncrement > 0) {
    const today = startOfDay(new Date());

    await DailyActivityLog.findOneAndUpdate(
      { userId: user._id, date: today },
      { $inc: { problemsSolvedThatDay: actualIncrement } },
      { upsert: true, new: true }
    );

    // Recompute streak
    const lastActive = user.lastActiveDate;
    let newStreak = user.currentStreak;

    if (!lastActive) {
      newStreak = 1;
    } else if (isToday(lastActive)) {
      // Already active today — streak unchanged
      newStreak = user.currentStreak;
    } else if (isYesterday(lastActive)) {
      // Consecutive day — increment streak
      newStreak = user.currentStreak + 1;
    } else {
      // Missed one or more days — reset
      newStreak = 1;
    }

    const newLongest = Math.max(user.longestStreak, newStreak);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: new Date(),
        },
      }
    );
  }

  return NextResponse.json({
    ok: true,
    problemsSolved: progress.problemsSolved,
  });
}
