import type { Metadata } from "next";
import NewPostForm from "@/components/NewPostForm";

export const metadata: Metadata = {
  title: "New Post | Discuss | PlacementPrep",
  description: "Ask a DSA question — describe your problem, paste your code, and get help from the community.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0D0F1A] pt-20 pb-10">
      <NewPostForm />
    </main>
  );
}
