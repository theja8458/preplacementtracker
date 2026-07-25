import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import DiscussPost from "@/models/DiscussPost";
import Notification from "@/models/Notification";

// PATCH /api/discuss/[postId]/upvote — toggle upvote on a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const post = await DiscussPost.findById(params.postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const userId = user._id;
  const alreadyUpvoted = post.upvotedBy.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyUpvoted) {
    post.upvotedBy = post.upvotedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    post.upvotes = Math.max(0, post.upvotes - 1);
  } else {
    post.upvotedBy.push(userId);
    post.upvotes += 1;

    // Notify post author (only when adding upvote, not removing)
    if (post.authorId.toString() !== userId.toString()) {
      try {
        await Notification.create({
          userId: post.authorId,
          type: "upvote_post",
          fromUserId: userId,
          referenceId: post._id,
          message: `${user.name} upvoted your post "${post.title}"`,
        });
      } catch (err) {
        console.error("[notify upvote_post]", err);
      }
    }
  }

  await post.save();
  return NextResponse.json({ upvotes: post.upvotes, hasUpvoted: !alreadyUpvoted });
}
