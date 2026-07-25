import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import FoundationCategory from "@/models/FoundationCategory";
import FoundationProblem from "@/models/FoundationProblem";
import UserFoundationProgress from "@/models/UserFoundationProgress";
import mongoose from "mongoose";

// GET /api/foundations — all categories + problems + user's completion status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = new mongoose.Types.ObjectId((session.user as any).id as string);

  const [categories, problems, progress] = await Promise.all([
    FoundationCategory.find().sort({ order: 1 }).lean(),
    FoundationProblem.find().sort({ categoryId: 1, order: 1 }).lean(),
    UserFoundationProgress.find({ userId }).lean(),
  ]);

  // Build a quick lookup: problemId → completed
  const completedMap = new Map(
    progress.map((p) => [p.problemId.toString(), p.completed])
  );

  // Attach completion flag to each problem
  const problemsWithStatus = problems.map((p) => ({
    ...p,
    completed: completedMap.get(p._id.toString()) ?? false,
  }));

  // Group problems by category
  const grouped = categories.map((cat) => {
    const catProblems = problemsWithStatus.filter(
      (p) => p.categoryId.toString() === cat._id.toString()
    );
    const completedCount = catProblems.filter((p) => p.completed).length;
    return { ...cat, problems: catProblems, completedCount };
  });

  const totalProblems = problemsWithStatus.length;
  const totalCompleted = problemsWithStatus.filter((p) => p.completed).length;

  return NextResponse.json({ categories: grouped, totalProblems, totalCompleted });
}
