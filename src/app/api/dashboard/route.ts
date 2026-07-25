import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Topic from "@/models/Topic";
import UserTopicProgress from "@/models/UserTopicProgress";
import UserCompanyPrep from "@/models/UserCompanyPrep";
import DailyActivityLog from "@/models/DailyActivityLog";
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

  // Parallel fetches
  const [topics, progresses, companiesPrepping, todayLog, recentActivity] =
    await Promise.all([
      Topic.find().sort({ order: 1 }),
      UserTopicProgress.find({ userId: user._id }),
      UserCompanyPrep.countDocuments({
        userId: user._id,
        status: { $in: ["in_progress", "done"] },
      }),
      DailyActivityLog.findOne({
        userId: user._id,
        date: startOfDay(new Date()),
      }),
      DailyActivityLog.find({ userId: user._id })
        .sort({ date: -1 })
        .limit(5),
    ]);

  const progressMap: Record<string, number> = {};
  progresses.forEach((p) => {
    progressMap[p.topicId.toString()] = p.problemsSolved;
  });

  const totalSolved = progresses.reduce((s, p) => s + p.problemsSolved, 0);
  const topicsTouched = progresses.filter((p) => p.problemsSolved > 0).length;

  const topicProgress = topics.map((t) => ({
    name: t.name.length > 8 ? t.name.substring(0, 8) + "…" : t.name,
    fullName: t.name,
    problemsSolved: progressMap[t._id.toString()] ?? 0,
  }));

  return NextResponse.json({
    user: {
      name: user.name,
      photoUrl: user.photoUrl,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      dailyGoal: user.dailyGoal,
    },
    totalSolved,
    topicsTouched,
    companiesPrepping,
    todaySolved: todayLog?.problemsSolvedThatDay ?? 0,
    recentActivity: recentActivity.map((a) => ({
      date: a.date,
      problemsSolvedThatDay: a.problemsSolvedThatDay,
    })),
    topicProgress,
  });
}
