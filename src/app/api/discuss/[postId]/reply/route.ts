import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import DiscussPost from "@/models/DiscussPost";
import DiscussReply from "@/models/DiscussReply";
import Notification from "@/models/Notification";

// POST /api/discuss/[postId]/reply — add a top-level or nested reply
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body, parentReplyId, images } = await req.json();
  if (!body?.trim())
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const post = await DiscussPost.findById(params.postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const reply = await DiscussReply.create({
    postId: params.postId,
    parentReplyId: parentReplyId ?? null,
    authorId: user._id,
    body,
    images: images ?? [],
    upvotes: 0,
    upvotedBy: [],
    isAccepted: false,
  });

  // --- Notifications ---
  try {
    if (parentReplyId) {
      // Nested reply → notify the parent reply's author
      const parentReply = await DiscussReply.findById(parentReplyId);
      if (parentReply && parentReply.authorId.toString() !== user._id.toString()) {
        await Notification.create({
          userId: parentReply.authorId,
          type: "reply_on_reply",
          fromUserId: user._id,
          referenceId: post._id,
          message: `${user.name} replied to your comment on "${post.title}"`,
        });
      }
    } else {
      // Top-level reply → notify the post author
      if (post.authorId.toString() !== user._id.toString()) {
        await Notification.create({
          userId: post.authorId,
          type: "reply_on_post",
          fromUserId: user._id,
          referenceId: post._id,
          message: `${user.name} replied to your post "${post.title}"`,
        });
      }
    }
  } catch (err) {
    console.error("[notify reply]", err);
  }

  return NextResponse.json({ _id: reply._id.toString() }, { status: 201 });
}
