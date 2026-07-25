import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CompanyTracker from "@/components/CompanyTracker";

export const metadata: Metadata = {
  title: "Company Prep | PlacementPrep",
  description: "Track companies you're prepping for, set your status, take notes, and find crowd-sourced interview resources.",
};

export default function CompanyPage() {
  return (
    <>
      <Navbar />
      <CompanyTracker />
    </>
  );
}
