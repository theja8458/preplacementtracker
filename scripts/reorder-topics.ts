/**
 * scripts/reorder-topics.ts
 *
 * Updates every Topic document's `order` and `tier` fields to match
 * the new beginner-to-advanced learning sequence.
 *
 * SAFE: matches by name, never deletes or touches problemsSolved / resourceLinks.
 *
 * Run once with:
 *   npx tsx scripts/reorder-topics.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

// ── New canonical order ────────────────────────────────────────────────────
const TOPIC_REORDER: {
  name: string;
  order: number;
  tier: "fundamentals" | "core" | "trees-graphs" | "advanced";
}[] = [
  // Tier 1 — Fundamentals
  { name: "Arrays",              order: 1,  tier: "fundamentals" },
  { name: "Strings",             order: 2,  tier: "fundamentals" },
  { name: "Hashing",             order: 3,  tier: "fundamentals" },
  { name: "Sorting & Searching", order: 4,  tier: "fundamentals" },

  // Tier 2 — Core Structures
  { name: "LinkedList",                order: 5, tier: "core" },
  { name: "Stacks & Queues",           order: 6, tier: "core" },
  { name: "Recursion & Backtracking",  order: 7, tier: "core" },

  // Tier 3 — Trees & Graphs
  { name: "Trees",  order: 8, tier: "trees-graphs" },
  { name: "Graphs", order: 9, tier: "trees-graphs" },

  // Tier 4 — Advanced
  { name: "Greedy",               order: 10, tier: "advanced" },
  { name: "Bit Manipulation",     order: 11, tier: "advanced" },
  { name: "Dynamic Programming",  order: 12, tier: "advanced" },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db!;
  const col = db.collection("topics");

  let updated = 0;
  let notFound = 0;

  for (const entry of TOPIC_REORDER) {
    // Support both "LinkedList" (old seed) and "Linked List" (post fix-linkedlist-dup)
    const nameQuery =
      entry.name === "LinkedList"
        ? { name: { $in: ["LinkedList", "Linked List"] } }
        : { name: entry.name };

    const result = await col.updateOne(
      nameQuery,
      { $set: { order: entry.order, tier: entry.tier } }
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠️  Not found: "${entry.name}" — skipping`);
      notFound++;
    } else {
      const changed = result.modifiedCount > 0 ? "updated" : "already correct";
      console.log(`  ✓ [${String(entry.order).padStart(2, " ")}] ${entry.name} (${entry.tier}) — ${changed}`);
      updated++;
    }
  }

  console.log(`\n✅ Done — ${updated} topics processed, ${notFound} not found.`);
  if (notFound > 0) {
    console.log("   Run scripts/fix-linkedlist-dup.ts first if 'LinkedList' was not found.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
