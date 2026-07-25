import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserOnboarding from "@/models/UserOnboarding";
import { CURRENT_TERMS_VERSION } from "@/lib/constants";

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      $set: {
        termsAcceptedVersion: CURRENT_TERMS_VERSION,
        termsAcceptedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Determine where to redirect after acceptance
  const onboarding = await UserOnboarding.findOne({ userId: user._id }).lean();
  const redirectTo = onboarding?.isComplete ? "/dashboard" : "/onboarding";

  return NextResponse.json({
    ok: true,
    termsAcceptedVersion: CURRENT_TERMS_VERSION,
    redirectTo,
  });
}
