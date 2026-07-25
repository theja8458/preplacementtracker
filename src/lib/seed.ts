import dbConnect from "./dbConnect";
import Topic from "@/models/Topic";
import type { TopicTier } from "@/models/Topic";

const TOPICS: {
  name: string;
  order: number;
  tier: TopicTier;
  resourceLinks: { title: string; url: string }[];
}[] = [
  // ── Tier 1: Fundamentals ──────────────────────────────────────────────────
  {
    name: "Arrays", order: 1, tier: "fundamentals",
    resourceLinks: [{ title: "Striver's Array Series", url: "https://takeuforward.org/data-structure/top-array-interview-questions-structured-path/" }],
  },
  {
    name: "Strings", order: 2, tier: "fundamentals",
    resourceLinks: [{ title: "NeetCode Strings", url: "https://neetcode.io/roadmap" }],
  },
  {
    name: "Hashing", order: 3, tier: "fundamentals",
    resourceLinks: [{ title: "Hashing — NeetCode", url: "https://neetcode.io/roadmap" }],
  },
  {
    name: "Sorting & Searching", order: 4, tier: "fundamentals",
    resourceLinks: [{ title: "Sorting — Striver", url: "https://takeuforward.org/sorting/sorting-algorithms/" }],
  },

  // ── Tier 2: Core Structures ───────────────────────────────────────────────
  {
    name: "Linked List", order: 5, tier: "core",
    resourceLinks: [{ title: "Striver's LinkedList Series", url: "https://takeuforward.org/linked-list/striver-linked-list-series/" }],
  },
  {
    name: "Stacks & Queues", order: 6, tier: "core",
    resourceLinks: [{ title: "Stacks & Queues — Striver", url: "https://takeuforward.org/data-structure/stack-and-queue-series-by-striver/" }],
  },
  {
    name: "Recursion & Backtracking", order: 7, tier: "core",
    resourceLinks: [{ title: "Striver's Recursion Series", url: "https://takeuforward.org/recursion/introduction-to-recursion-understand-recursion-by-printing-something-n-times/" }],
  },

  // ── Tier 3: Trees & Graphs ────────────────────────────────────────────────
  {
    name: "Trees", order: 8, tier: "trees-graphs",
    resourceLinks: [{ title: "Love Babbar Tree Problems", url: "https://www.youtube.com/watch?v=fH9KGQhSiFc" }],
  },
  {
    name: "Graphs", order: 9, tier: "trees-graphs",
    resourceLinks: [{ title: "Striver's Graph Series", url: "https://takeuforward.org/graph/striver-graph-series/" }],
  },

  // ── Tier 4: Advanced ──────────────────────────────────────────────────────
  {
    name: "Greedy", order: 10, tier: "advanced",
    resourceLinks: [{ title: "Greedy — NeetCode", url: "https://neetcode.io/roadmap" }],
  },
  {
    name: "Bit Manipulation", order: 11, tier: "advanced",
    resourceLinks: [{ title: "Bit Manipulation — Striver", url: "https://takeuforward.org/bit-manipulation/bit-manipulation-series-by-striver/" }],
  },
  {
    name: "Dynamic Programming", order: 12, tier: "advanced",
    resourceLinks: [{ title: "Aditya Verma DP Playlist", url: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go" }],
  },
];

let seeded = false;

export async function seedTopics() {
  if (seeded) return;
  await dbConnect();
  const count = await Topic.countDocuments();
  if (count === 0) {
    await Topic.insertMany(TOPICS);
    console.log("✅ Topics seeded");
  }
  seeded = true;
}
