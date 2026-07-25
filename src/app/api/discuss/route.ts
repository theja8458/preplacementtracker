import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Topic from "@/models/Topic";
import DiscussPost from "@/models/DiscussPost";
import DiscussReply from "@/models/DiscussReply";
import { seedTopics } from "@/lib/seed";

// GET /api/discuss?topic=<id>&sort=latest|upvotes|unanswered&page=0
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const topicFilter = searchParams.get("topic"); // topicId or "all"
  const sort = searchParams.get("sort") ?? "latest";
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const PAGE_SIZE = 20;

  await dbConnect();
  await seedTopics();

  const filter: Record<string, unknown> = {};
  if (topicFilter && topicFilter !== "all") filter.topicId = topicFilter;

  // "unanswered" needs reply-count filtering — fetch slightly more to account for client-side filtering
  const fetchLimit = sort === "unanswered" ? PAGE_SIZE * 3 : PAGE_SIZE;
  const fetchSkip = sort === "unanswered" ? 0 : page * PAGE_SIZE;

  const posts = await DiscussPost.find(filter)
    .sort(sort === "upvotes" ? { upvotes: -1 } : { createdAt: -1 })
    .skip(fetchSkip)
    .limit(fetchLimit)
    .lean();

  // Fetch author info
  const authorIds = [...new Set(posts.map((p) => p.authorId.toString()))];
  const authors = await User.find({ _id: { $in: authorIds } }).lean();
  const authorMap: Record<string, typeof authors[0]> = {};
  authors.forEach((a) => { authorMap[a._id.toString()] = a; });

  // Fetch topic names
  const topics = await Topic.find().sort({ order: 1 }).lean();
  const topicMap: Record<string, string> = {};
  topics.forEach((t) => { topicMap[t._id.toString()] = t.name; });

  // Fetch reply counts
  const postIds = posts.map((p) => p._id);
  const replyCounts = await DiscussReply.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);
  const replyCountMap: Record<string, number> = {};
  replyCounts.forEach((r) => { replyCountMap[r._id.toString()] = r.count; });

  const currentUser = await User.findOne({ email: session.user.email });
  const currentUserId = currentUser?._id.toString();

  let result = posts.map((p) => ({
    _id: p._id.toString(),
    problemTitle: p.problemTitle,
    problemUrl: p.problemUrl,
    title: p.title,
    body: p.body.slice(0, 200),
    topicId: p.topicId.toString(),
    topicName: topicMap[p.topicId.toString()] ?? "General",
    upvotes: p.upvotes,
    hasUpvoted: p.upvotedBy?.some((id) => id.toString() === currentUserId) ?? false,
    replyCount: replyCountMap[p._id.toString()] ?? 0,
    images: p.images ?? [],
    author: {
      name: authorMap[p.authorId.toString()]?.name ?? "Unknown",
      photoUrl: authorMap[p.authorId.toString()]?.photoUrl ?? "",
    },
    createdAt: p.createdAt,
  }));

  // "Unanswered" filter applied after join, then paginate
  if (sort === "unanswered") {
    result = result.filter((p) => p.replyCount === 0);
    // Apply page offset after filtering
    result = result.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  const hasMore = result.length === PAGE_SIZE;

  const allTopics = topics.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
  }));

  return NextResponse.json({ posts: result, topics: allTopics, hasMore, page });
}

// POST /api/discuss — create a new post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { problemTitle, problemUrl, topicId, title, content, images } = body;

  if (!problemTitle || !topicId || !title || !content)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const post = await DiscussPost.create({
    authorId: user._id,
    problemTitle,
    problemUrl: problemUrl || undefined,
    topicId,
    title,
    body: content,
    images: images ?? [],
    upvotes: 0,
    upvotedBy: [],
  });

  return NextResponse.json({ _id: post._id.toString() }, { status: 201 });
}
