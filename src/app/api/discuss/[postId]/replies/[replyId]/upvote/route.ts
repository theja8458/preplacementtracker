import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import DiscussPost from "@/models/DiscussPost";
import DiscussReply from "@/models/DiscussReply";
import Notification from "@/models/Notification";

// PATCH /api/discuss/[postId]/replies/[replyId]/upvote
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

  const reply = await DiscussReply.findById(params.replyId);
  if (!reply) return NextResponse.json({ error: "Reply not found" }, { status: 404 });

  const userId = user._id;
  const alreadyUpvoted = reply.upvotedBy.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyUpvoted) {
    reply.upvotedBy = reply.upvotedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    reply.upvotes = Math.max(0, reply.upvotes - 1);
  } else {
    reply.upvotedBy.push(userId);
    reply.upvotes += 1;

    // Notify reply author (only when adding upvote, not removing)
    if (reply.authorId.toString() !== userId.toString()) {
      try {
        const post = await DiscussPost.findById(params.postId).lean();
        await Notification.create({
          userId: reply.authorId,
          type: "upvote_reply",
          fromUserId: userId,
          referenceId: post?._id ?? params.postId,
          message: `${user.name} upvoted your reply${post ? ` on "${(post as any).title}"` : ""}`,
        });
      } catch (err) {
        console.error("[notify upvote_reply]", err);
      }
    }
  }

  await reply.save();
  return NextResponse.json({ upvotes: reply.upvotes, hasUpvoted: !alreadyUpvoted });
}
