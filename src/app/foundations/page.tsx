import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import FoundationsPage from "@/components/FoundationsPage";

export const metadata: Metadata = {
  title: "Start Here — Foundations",
  description: "Build your coding fundamentals before LeetCode. Work through guided logic problems and learn the 6-step problem-solving framework.",
};

export default function FoundationsRoute() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <FoundationsPage />
      </main>
    </>
  );
}
