import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import AIChatMessage from "@/models/AIChatMessage";
import AIChatUsage from "@/models/AIChatUsage";

const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT ?? "15", 10);

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/assistant/history — last 20 messages + questionsRemaining
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = (session.user as any).id as string;
  const today = todayStr();

  const [messages, usageDoc] = await Promise.all([
    AIChatMessage.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    AIChatUsage.findOne({ userId, date: today }),
  ]);

  const questionsAsked = usageDoc?.questionsAsked ?? 0;
  const questionsRemaining = Math.max(DAILY_LIMIT - questionsAsked, 0);

  return NextResponse.json({
    messages: messages.reverse(),
    questionsRemaining,
    dailyLimit: DAILY_LIMIT,
  });
}

// DELETE /api/assistant/history — wipe all chat messages for this user
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = (session.user as any).id as string;

  const result = await AIChatMessage.deleteMany({ userId });

  return NextResponse.json({
    ok: true,
    deleted: result.deletedCount,
  });
}
