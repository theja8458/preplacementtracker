import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import UserOnboarding from "@/models/UserOnboarding";
import OnboardingFlow from "@/components/OnboardingFlow";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Get Started | PlacementPrep" };

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  // Must be logged in
  if (!session?.user?.email) redirect("/");

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) redirect("/");

  const onboarding = await UserOnboarding.findOne({ userId: user._id });

  // Already completed onboarding
  if (onboarding?.isComplete) redirect("/dashboard");

  return <OnboardingFlow />;
}
