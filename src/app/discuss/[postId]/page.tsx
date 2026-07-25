import type { Metadata } from "next";
import PostDetail from "@/components/PostDetail";

export const metadata: Metadata = {
  title: "Discussion | PlacementPrep",
};

export default function Page({ params }: { params: { postId: string } }) {
  return (
    <main className="min-h-screen bg-[#0D0F1A] pt-20 pb-10">
      <PostDetail postId={params.postId} />
    </main>
  );
}
