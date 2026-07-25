import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import UserOnboarding from "@/models/UserOnboarding";
import User from "@/models/User";
import LandingPage from "@/components/LandingPage";
import type { Metadata } from "next";
import { CURRENT_TERMS_VERSION } from "@/lib/constants";

export const metadata: Metadata = {
  title: "PlacementPrep — Crack Placements Together",
  description:
    "Track DSA progress, compete on leaderboards, and discuss problems — built for SVCE MCA students.",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) {
      // Terms gate — must accept before entering the app
      if (dbUser.termsAcceptedVersion !== CURRENT_TERMS_VERSION) {
        redirect("/terms");
      }
      const onboarding = await UserOnboarding.findOne({ userId: dbUser._id });
      if (!onboarding || !onboarding.isComplete) {
        redirect("/onboarding");
      } else {
        redirect("/dashboard");
      }
    }
  }

  return <LandingPage />;
}
