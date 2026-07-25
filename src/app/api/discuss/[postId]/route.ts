import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Topic from "@/models/Topic";
import DiscussPost from "@/models/DiscussPost";
import DiscussReply from "@/models/DiscussReply";

// GET /api/discuss/[postId] — full post + threaded replies
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const post = await DiscussPost.findById(params.postId).lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentUser = await User.findOne({ email: session.user.email });
  const currentUserId = currentUser?._id.toString();

  // Fetch author
  const author = await User.findById(post.authorId).lean();
  // Fetch topic
  const topic = await Topic.findById(post.topicId).lean();
  // Fetch all replies for this post
  const replies = await DiscussReply.find({ postId: params.postId })
    .sort({ createdAt: 1 })
    .lean();

  // Fetch all reply authors
  const replyAuthorIds = [...new Set(replies.map((r) => r.authorId.toString()))];
  const replyAuthors = await User.find({ _id: { $in: replyAuthorIds } }).lean();
  const replyAuthorMap: Record<string, typeof replyAuthors[0]> = {};
  replyAuthors.forEach((a) => { replyAuthorMap[a._id.toString()] = a; });

  // Shape replies into a tree (2 levels)
  const topLevel = replies.filter((r) => !r.parentReplyId);
  const nested = replies.filter((r) => r.parentReplyId);

  const nestedMap: Record<string, typeof replies> = {};
  nested.forEach((r) => {
    const parentId = r.parentReplyId!.toString();
    if (!nestedMap[parentId]) nestedMap[parentId] = [];
    nestedMap[parentId].push(r);
  });

  interface ShapedReply {
    _id: string;
    body: string;
    images: { url: string; cloudinaryPublicId: string }[];
    upvotes: number;
    hasUpvoted: boolean;
    isAccepted: boolean;
    isAuthor: boolean;
    createdAt: Date;
    author: { name: string; photoUrl: string };
    children: ShapedReply[];
  }

  const shapeReply = (r: typeof replies[0]): ShapedReply => ({
    _id: r._id.toString(),
    body: r.body,
    images: r.images ?? [],
    upvotes: r.upvotes,
    hasUpvoted: r.upvotedBy?.some((id) => id.toString() === currentUserId) ?? false,
    isAccepted: r.isAccepted,
    isAuthor: r.authorId.toString() === currentUserId,
    createdAt: r.createdAt,
    author: {
      name: replyAuthorMap[r.authorId.toString()]?.name ?? "Unknown",
      photoUrl: replyAuthorMap[r.authorId.toString()]?.photoUrl ?? "",
    },
    children: (nestedMap[r._id.toString()] ?? []).map(shapeReply),
  });


  return NextResponse.json({
    post: {
      _id: post._id.toString(),
      problemTitle: post.problemTitle,
      problemUrl: post.problemUrl,
      topicName: (topic as any)?.name ?? "General",
      title: post.title,
      body: post.body,
      images: post.images ?? [],
      upvotes: post.upvotes,
      hasUpvoted: post.upvotedBy?.some((id) => id.toString() === currentUserId) ?? false,
      isAuthor: post.authorId.toString() === currentUserId,
      createdAt: post.createdAt,
      author: {
        name: (author as any)?.name ?? "Unknown",
        photoUrl: (author as any)?.photoUrl ?? "",
      },
    },
    replies: topLevel.map(shapeReply),
  });
}
