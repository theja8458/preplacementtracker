import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Get today's start in IST (UTC+5:30) — subtract offset from UTC
    const now = new Date();
    const todayIST = startOfDay(new Date(now.getTime() + 5.5 * 60 * 60 * 1000));
    const todayUTC = new Date(todayIST.getTime() - 5.5 * 60 * 60 * 1000);

    // Find users with an active streak who haven't solved anything today
    const usersAtRisk = await User.find({
      currentStreak: { $gt: 0 },
      lastActiveDate: { $lt: todayUTC },
    }).lean();

    if (usersAtRisk.length === 0) {
      return NextResponse.json({ notified: 0 });
    }

    const notifications = usersAtRisk.map((u) => ({
      userId: u._id,
      type: "streak_warning" as const,
      fromUserId: null,
      referenceId: null,
      message:
        "🔥 మీ streak పోతుంది! నేడు ఒక్క problem అయినా solve చేయండి.",
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ notified: usersAtRisk.length });
  } catch (err) {
    // A silent failure here means students never get warned — capture explicitly.
    Sentry.captureException(err, {
      tags: { cron: "streak-warning" },
      extra: { message: "Streak warning cron job failed — notifications not sent" },
    });
    console.error("[cron/streak-warning] failed:", err);
    return NextResponse.json(
      { error: "Cron job failed", detail: String(err) },
      { status: 500 }
    );
  }
}

