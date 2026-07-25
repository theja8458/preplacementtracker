import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserTopicProgress from "@/models/UserTopicProgress";
import UserCompanyPrep from "@/models/UserCompanyPrep";
import Company from "@/models/Company";
import DiscussPost from "@/models/DiscussPost";
import DiscussReply from "@/models/DiscussReply";
import Topic from "@/models/Topic";
import { seedTopics } from "@/lib/seed";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  await dbConnect();
  await seedTopics();

  const user = await User.findById(params.userId).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ── Batch 1: all queries that only depend on user._id (run in parallel) ──
  const [topics, progresses, companyPreps, recentPosts, totalPosts, totalReplies] =
    await Promise.all([
      Topic.find().sort({ order: 1 }).lean(),
      UserTopicProgress.find({ userId: user._id }).lean(),
      UserCompanyPrep.find({ userId: user._id }).lean(),
      DiscussPost.find({ authorId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      DiscussPost.countDocuments({ authorId: user._id }),
      DiscussReply.countDocuments({ authorId: user._id }),
    ]);

  // ── Batch 2: queries that depend on batch-1 results (run in parallel) ──
  const companyIds = companyPreps.map((c) => c.companyId);
  const postIds = recentPosts.map((p) => p._id);
  const postTopicIds = recentPosts.map((p) => p.topicId);

  const [companies, allReplies, postTopics] = await Promise.all([
    Company.find({ _id: { $in: companyIds } }).lean(),
    DiscussReply.find({ postId: { $in: postIds } })
      .select("postId")
      .lean(),
    Topic.find({ _id: { $in: postTopicIds } })
      .select("name")
      .lean(),
  ]);

  // ── Assemble topic progress ──
  const progressMap: Record<string, number> = {};
  progresses.forEach((p) => {
    progressMap[p.topicId.toString()] = p.problemsSolved;
  });

  const topicsWithProgress = topics.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    order: t.order,
    problemsSolved: progressMap[t._id.toString()] ?? 0,
  }));

  const totalSolved = progresses.reduce((sum, p) => sum + p.problemsSolved, 0);
  const topicsCovered = progresses.filter((p) => p.problemsSolved > 0).length;

  // ── Assemble company list ──
  const companyMap: Record<string, string> = {};
  companies.forEach((c) => { companyMap[c._id.toString()] = c.name; });

  const companyList = companyPreps.map((cp) => ({
    companyId: cp.companyId.toString(),
    name: companyMap[cp.companyId.toString()] ?? "Unknown",
    status: cp.status,
    notes: cp.notes ?? "",
  }));

  // ── Assemble discuss posts ──
  const topicNameMap: Record<string, string> = {};
  postTopics.forEach((t) => { topicNameMap[t._id.toString()] = t.name; });

  const replyCountMap: Record<string, number> = {};
  allReplies.forEach((r) => {
    const key = r.postId.toString();
    replyCountMap[key] = (replyCountMap[key] ?? 0) + 1;
  });

  const postsWithMeta = recentPosts.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    problemTitle: p.problemTitle,
    topicName: topicNameMap[p.topicId.toString()] ?? "",
    replyCount: replyCountMap[p._id.toString()] ?? 0,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({
    user: {
      _id: user._id.toString(),
      name: user.name,
      photoUrl: user.photoUrl,
      branch: user.branch ?? null,
      year: user.year ?? null,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      createdAt: user.createdAt,
    },
    stats: {
      totalSolved,
      topicsCovered,
      companiesPrepping: companyList.length,
      discussActivity: totalPosts + totalReplies,
    },
    topicsWithProgress,
    recentPosts: postsWithMeta,
    companies: companyList,
  });
}
