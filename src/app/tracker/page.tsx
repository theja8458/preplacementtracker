import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth";
import Navbar from "@/components/Navbar";
import TrackerPage from "@/components/TrackerPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DSA Tracker | PlacementPrep",
  description: "Track your DSA problem-solving progress across 12 topics. Log problems, watch your streak grow, and get curated LeetCode + GFG links.",
};

export default async function TrackerRoute() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0F1A]">
        <TrackerPage />
      </main>
    </>
  );
}
