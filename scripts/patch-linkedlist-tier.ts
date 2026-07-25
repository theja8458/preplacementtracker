import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const result = await db.collection("topics").updateMany(
    { name: { $in: ["Linked List", "LinkedList"] } },
    { $set: { order: 5, tier: "core" } }
  );
  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  if (result.matchedCount === 0) {
    console.log("No LinkedList / Linked List topic found.");
  } else {
    console.log("Done! -> order=5, tier=core");
  }
  await mongoose.disconnect();
})();
