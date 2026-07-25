/**
 * scripts/fix-linkedlist-dup.ts
 * Removes the old "LinkedList" topic (no space) and reassigns any
 * UserTopicProgress records pointing at it to the correct "Linked List" topic.
 * Run once with: npx tsx scripts/fix-linkedlist-dup.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  console.log("🔌 Connecting…");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db!;

  // Find both documents
  const topics = await db.collection("topics").find({
    name: { $in: ["LinkedList", "Linked List"] },
  }).toArray();

  console.log("Found topics:", topics.map(t => `${t.name} (${t._id})`));

  const oldTopic = topics.find(t => t.name === "LinkedList");
  const newTopic = topics.find(t => t.name === "Linked List");

  if (!oldTopic) {
    console.log("✅ No duplicate 'LinkedList' found — already clean!");
    await mongoose.disconnect();
    return;
  }

  if (!newTopic) {
    // Just rename the old one if the new one doesn't exist
    await db.collection("topics").updateOne(
      { _id: oldTopic._id },
      { $set: { name: "Linked List" } }
    );
    console.log("✅ Renamed 'LinkedList' → 'Linked List'");
    await mongoose.disconnect();
    return;
  }

  // Both exist — reassign UserTopicProgress from old to new, then delete old
  const reassigned = await db.collection("usertopicprogresses").updateMany(
    { topicId: oldTopic._id },
    { $set: { topicId: newTopic._id } }
  );
  console.log(`🔄 Reassigned ${reassigned.modifiedCount} UserTopicProgress records`);

  await db.collection("topics").deleteOne({ _id: oldTopic._id });
  console.log(`🗑️  Deleted old 'LinkedList' topic (id: ${oldTopic._id})`);

  console.log("\n✅ Done! Refresh the tracker — only 'Linked List' remains.");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
