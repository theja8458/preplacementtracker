import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import DiscussFeed from "@/components/DiscussFeed";

export const metadata: Metadata = {
  title: "Discuss | PlacementPrep",
  description: "Ask DSA questions, share solutions, and help each other crack placements — community discussion for SVCE MCA students.",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0F1A] pb-10">
        <DiscussFeed />
      </main>
    </>
  );
}
