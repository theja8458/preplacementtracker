/**
 * scripts/remove-demo-data.ts
 *
 * Removes ONLY the 5 fake demo users (matched by their exact .local emails)
 * and all their dependent records:
 *   - User documents (5)
 *   - UserTopicProgress records belonging to those users
 *   - DailyActivityLog records belonging to those users
 *   - UserOnboarding records belonging to those users
 *   - DiscussPost documents authored by those users
 *   - DiscussReply documents authored by those users OR on those posts
 *
 * Safe-by-default: runs a DRY-RUN first and exits without deleting anything.
 * Pass --confirm to actually delete.
 *
 * Usage:
 *   npx tsx scripts/remove-demo-data.ts           ← dry-run (safe)
 *   npx tsx scripts/remove-demo-data.ts --confirm  ← live deletion (CONFIRM FIRST)
 */

import mongoose, { Types } from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

// ── Inline schemas (avoid Next.js edge-runtime imports) ──────────────────────
const UserSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true }, photoUrl: String,
    branch: String, year: String, currentStreak: Number, longestStreak: Number,
    dailyGoal: Number, lastActiveDate: Date },
  { timestamps: true }
);
const UserTopicProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  problemsSolved: Number, lastUpdated: Date,
});
const DailyActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date, problemsSolvedThatDay: Number,
});
const UserOnboardingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isComplete: Boolean, branch: String, year: String, dailyGoal: Number,
}, { timestamps: true });
const DiscussPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String, body: String, problemTitle: String,
  problemUrl: String, topicId: { type: mongoose.Schema.Types.ObjectId },
  images: [{ url: String, cloudinaryPublicId: String }],
  upvotes: Number, upvotedBy: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });
const DiscussReplySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussPost" },
  parentReplyId: { type: mongoose.Schema.Types.ObjectId, default: null },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  body: String, upvotes: Number, isAccepted: Boolean,
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

// ── Models ───────────────────────────────────────────────────────────────────
const User           = mongoose.models.User           || mongoose.model("User", UserSchema);
const UserTopicProgress = mongoose.models.UserTopicProgress || mongoose.model("UserTopicProgress", UserTopicProgressSchema);
const DailyActivityLog  = mongoose.models.DailyActivityLog  || mongoose.model("DailyActivityLog", DailyActivityLogSchema);
const UserOnboarding    = mongoose.models.UserOnboarding    || mongoose.model("UserOnboarding", UserOnboardingSchema);
const DiscussPost       = mongoose.models.DiscussPost       || mongoose.model("DiscussPost", DiscussPostSchema);
const DiscussReply      = mongoose.models.DiscussReply      || mongoose.model("DiscussReply", DiscussReplySchema);

// ── EXACT demo emails — match seed-demo.ts; nothing broader ──────────────────
const DEMO_EMAILS = [
  "arjun.demo@placementprep.local",
  "divya.demo@placementprep.local",
  "ravi.demo@placementprep.local",
  "priya.demo@placementprep.local",
  "kiran.demo@placementprep.local",
] as const;

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const isDryRun = !process.argv.includes("--confirm");

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  // ── Step 1: find the demo user IDs ──────────────────────────────────────
  const demoUsers = await User.find({ email: { $in: DEMO_EMAILS } }).lean();
  const demoUserIds: Types.ObjectId[] = demoUsers.map((u: any) => u._id);

  console.log(`📋 Demo users found in DB: ${demoUsers.length} / ${DEMO_EMAILS.length}`);
  if (demoUsers.length === 0) {
    console.log("ℹ️  No demo users exist in this database — nothing to delete.");
    await mongoose.disconnect();
    return;
  }

  demoUsers.forEach((u: any) => console.log(`   • ${u.name} <${u.email}> (${u._id})`));

  // ── Step 2: count what WOULD be deleted ─────────────────────────────────
  const [
    userCount,
    progressCount,
    activityCount,
    onboardingCount,
    postDocs,
  ] = await Promise.all([
    User.countDocuments({ email: { $in: DEMO_EMAILS } }),
    UserTopicProgress.countDocuments({ userId: { $in: demoUserIds } }),
    DailyActivityLog.countDocuments({ userId: { $in: demoUserIds } }),
    UserOnboarding.countDocuments({ userId: { $in: demoUserIds } }),
    DiscussPost.find({ authorId: { $in: demoUserIds } }, "_id").lean(),
  ]);

  const postIds = postDocs.map((p: any) => p._id);
  const replyCount = await DiscussReply.countDocuments({
    $or: [
      { authorId: { $in: demoUserIds } },
      { postId: { $in: postIds } },
    ],
  });
  const postCount = postDocs.length;

  // ── DRY-RUN REPORT ───────────────────────────────────────────────────────
  console.log("\n📊 DRY-RUN SUMMARY — documents that WOULD be deleted:");
  console.log(`   User                : ${userCount}`);
  console.log(`   UserTopicProgress   : ${progressCount}`);
  console.log(`   DailyActivityLog    : ${activityCount}`);
  console.log(`   UserOnboarding      : ${onboardingCount}`);
  console.log(`   DiscussPost         : ${postCount}`);
  console.log(`   DiscussReply        : ${replyCount} (authored by demo users OR on demo posts)`);
  console.log(`   ─────────────────────────────────`);
  console.log(`   TOTAL               : ${userCount + progressCount + activityCount + onboardingCount + postCount + replyCount}`);

  if (isDryRun) {
    console.log(
      "\n⚠️  DRY-RUN COMPLETE — nothing was deleted.\n" +
      "   Review the counts above, then re-run with --confirm to actually delete:\n\n" +
      "     npx tsx scripts/remove-demo-data.ts --confirm\n"
    );
    await mongoose.disconnect();
    return;
  }

  // ── LIVE DELETION ─────────────────────────────────────────────────────────
  console.log("\n🗑️  --confirm flag detected. Proceeding with deletion…\n");

  const r1 = await DiscussReply.deleteMany({
    $or: [
      { authorId: { $in: demoUserIds } },
      { postId: { $in: postIds } },
    ],
  });
  console.log(`   ✅ DiscussReply deleted   : ${r1.deletedCount}`);

  const r2 = await DiscussPost.deleteMany({ authorId: { $in: demoUserIds } });
  console.log(`   ✅ DiscussPost deleted    : ${r2.deletedCount}`);

  const r3 = await UserTopicProgress.deleteMany({ userId: { $in: demoUserIds } });
  console.log(`   ✅ UserTopicProgress deleted: ${r3.deletedCount}`);

  const r4 = await DailyActivityLog.deleteMany({ userId: { $in: demoUserIds } });
  console.log(`   ✅ DailyActivityLog deleted : ${r4.deletedCount}`);

  const r5 = await UserOnboarding.deleteMany({ userId: { $in: demoUserIds } });
  console.log(`   ✅ UserOnboarding deleted  : ${r5.deletedCount}`);

  const r6 = await User.deleteMany({ email: { $in: DEMO_EMAILS } });
  console.log(`   ✅ User deleted            : ${r6.deletedCount}`);

  console.log("\n🎉 Demo data removal complete!\n");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
