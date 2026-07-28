import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import authOptions from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/cloudinary/sign — generate a signed upload params object
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "placement-discuss";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { layer: "cloudinary", operation: "sign" },
      user: { email: session.user.email ?? undefined },
    });
    return NextResponse.json({ error: "Failed to generate upload signature" }, { status: 500 });
  }
}

