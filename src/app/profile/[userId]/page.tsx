import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";

// ISR: Vercel serves a cached version and regenerates in background every 60s.
// Profile pages are public and don't need to be real-time fresh on every view.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Profile | PlacementPrep",
  description: "View DSA progress, discuss activity, and placement prep status.",
};

export default function Page({ params }: { params: { userId: string } }) {
  return (
    <>
      <Navbar />
      <ProfilePage userId={params.userId} />
    </>
  );
}
