import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import FeatureInterest from "@/models/FeatureInterest";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get("feature");

    if (!feature) {
      return NextResponse.json({ error: "Feature parameter is required" }, { status: 400 });
    }

    await dbConnect();
    const interest = await FeatureInterest.findOne({ userId, feature });

    return NextResponse.json({ interested: !!interest });
  } catch (error) {
    console.error("GET /api/features/interest error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { feature } = body;

    if (!feature) {
      return NextResponse.json({ error: "Feature parameter is required" }, { status: 400 });
    }

    await dbConnect();

    // Upsert to avoid duplicates
    await FeatureInterest.findOneAndUpdate(
      { userId, feature },
      { requestedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/features/interest error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
