import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import DiscussPost from "@/models/DiscussPost";
import DiscussReply from "@/models/DiscussReply";
import Notification from "@/models/Notification";

// PATCH /api/discuss/[postId]/replies/[replyId]/accept
// Only the post author can mark/unmark a reply as accepted answer
export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string; replyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await DiscussPost.findById(params.postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Only the post author can accept answers
  if (post.authorId.toString() !== user._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reply = await DiscussReply.findById(params.replyId);
  if (!reply) return NextResponse.json({ error: "Reply not found" }, { status: 404 });

  // Toggle: if already accepted, unaccept; otherwise accept and unaccept all others
  const newState = !reply.isAccepted;

  // Unaccept all other replies on this post
  await DiscussReply.updateMany(
    { postId: params.postId, _id: { $ne: params.replyId } },
    { $set: { isAccepted: false } }
  );

  reply.isAccepted = newState;
  await reply.save();

  // Notify reply author when their answer is accepted (not when un-accepted)
  if (newState && reply.authorId.toString() !== user._id.toString()) {
    try {
      await Notification.create({
        userId: reply.authorId,
        type: "accepted_answer",
        fromUserId: user._id,
        referenceId: post._id,
        message: `${user.name} accepted your answer on "${post.title}" ✅`,
      });
    } catch (err) {
      console.error("[notify accepted_answer]", err);
    }
  }

  return NextResponse.json({ isAccepted: newState });
}
