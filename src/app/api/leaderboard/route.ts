import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserTopicProgress from "@/models/UserTopicProgress";
import DailyActivityLog from "@/models/DailyActivityLog";

// ── Cached aggregation helpers (60s TTL) ──────────────────────────────────────

/** All-time ranking: sum of problemsSolved per user across all topics */
const getCachedAlltimeRanking = unstable_cache(
  async () => {
    await dbConnect();
    const progresses = await UserTopicProgress.aggregate([
      { $group: { _id: "$userId", totalSolved: { $sum: "$problemsSolved" } } },
      { $sort: { totalSolved: -1 } },
    ]);
    return progresses.map((p) => ({
      userId: p._id.toString(),
      totalSolved: p.totalSolved,
    }));
  },
  ["leaderboard-alltime"],
  { revalidate: 60, tags: ["leaderboard"] }
);

/** Weekly ranking: sum of DailyActivityLog.problemsSolvedThatDay over last 7 days */
const getCachedWeeklyRanking = unstable_cache(
  async () => {
    await dbConnect();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await DailyActivityLog.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$userId", totalSolved: { $sum: "$problemsSolvedThatDay" } } },
      { $sort: { totalSolved: -1 } },
    ]);
    return logs.map((l) => ({
      userId: l._id.toString(),
      totalSolved: l.totalSolved,
    }));
  },
  ["leaderboard-weekly"],
  { revalidate: 60, tags: ["leaderboard"] }
);


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "alltime"; // "alltime" | "weekly"

  await dbConnect();

  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Use cached aggregation — same result served to all users within 60s window
  const ranked = mode === "weekly"
    ? await getCachedWeeklyRanking()
    : await getCachedAlltimeRanking();

  // Fetch user details for ranked users (not cached — needs fresh photo/streak data)
  const userIds = ranked.map((r) => r.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap: Record<string, typeof users[0]> = {};
  users.forEach((u) => { userMap[u._id.toString()] = u; });

  // Build final ranked list with display info
  const currentUserId = currentUser._id.toString();
  let currentUserInTop = false;

  const rankedWithInfo = ranked
    .map((r, idx) => {
      const user = userMap[r.userId];
      if (!user) return null;
      const isMe = r.userId === currentUserId;
      if (isMe) currentUserInTop = true;

      // Build display name: "First L." format
      const nameParts = (user.name as string).trim().split(" ");
      const firstName = nameParts[0];
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + "." : "";
      const displayName = lastInitial ? `${firstName} ${lastInitial}` : firstName;

      return {
        rank: idx + 1,
        userId: r.userId,
        displayName,
        fullName: user.name as string,
        photoUrl: user.photoUrl as string,
        totalSolved: r.totalSolved,
        currentStreak: user.currentStreak as number,
        isMe,
      };
    })
    .filter(Boolean);

  // Top 10
  const top10 = rankedWithInfo.slice(0, 10);

  // If current user is outside top 10, add them separately
  let myEntry = null;
  if (!currentUserInTop) {
    const myRankedIndex = ranked.findIndex((r) => r.userId === currentUserId);
    if (myRankedIndex === -1) {
      // User has no progress yet — place them at the bottom
      const nameParts = currentUser.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + "." : "";
      const displayName = lastInitial ? `${firstName} ${lastInitial}` : firstName;

      myEntry = {
        rank: ranked.length + 1,
        userId: currentUserId,
        displayName,
        fullName: currentUser.name,
        photoUrl: currentUser.photoUrl,
        totalSolved: 0,
        currentStreak: currentUser.currentStreak,
        isMe: true,
      };
    } else {
      myEntry = rankedWithInfo[myRankedIndex];
    }
  }

  return NextResponse.json({
    leaderboard: top10,
    myEntry: currentUserInTop ? null : myEntry,
    totalUsers: ranked.length,
    mode,
  });
}
