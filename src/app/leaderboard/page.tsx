import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LeaderboardPage from "@/components/LeaderboardPage";

export const metadata: Metadata = {
  title: "Leaderboard | PlacementPrep",
  description:
    "See who's grinding the hardest. Compare All Time and This Week DSA problem counts across SVCE MCA students.",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0F1A] pb-10">
        <LeaderboardPage />
      </main>
    </>
  );
}
