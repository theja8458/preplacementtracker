import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth";
import Navbar from "@/components/Navbar";
import DashboardPage from "@/components/DashboardPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | PlacementPrep",
  description: "Your personal placement prep overview — track daily goals, streaks, topic progress, and recent activity all in one place.",
};

export default async function DashboardRoute() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <>
      <Navbar />
      <DashboardPage />
    </>
  );
}
