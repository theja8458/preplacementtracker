/**
 * scripts/seed-demo.ts
 * Run with:  npx tsx scripts/seed-demo.ts
 *
 * Idempotent — safe to run multiple times.
 */

import mongoose, { Types } from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

// ── Inline lightweight schemas (avoid Next.js edge-runtime imports) ──────────
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    photoUrl: { type: String, default: "" },
    branch: String,
    year: String,
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
    dailyGoal: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const TopicSchema = new mongoose.Schema({
  name: String,
  order: Number,
  resourceLinks: [{ title: String, url: String }],
});

const UserTopicProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  problemsSolved: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});
UserTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

const DailyActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  problemsSolvedThatDay: { type: Number, default: 0 },
});
DailyActivityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DiscussPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    problemTitle: String,
    problemUrl: String,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    title: String,
    body: String,
    images: [{ url: String, cloudinaryPublicId: String }],
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const DiscussReplySchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussPost" },
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussReply",
      default: null,
    },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    body: String,
    images: [{ url: String, cloudinaryPublicId: String }],
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Models ───────────────────────────────────────────────────────────────────
const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
const Topic =
  mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
const UserTopicProgress =
  mongoose.models.UserTopicProgress ||
  mongoose.model("UserTopicProgress", UserTopicProgressSchema);
const DailyActivityLog =
  mongoose.models.DailyActivityLog ||
  mongoose.model("DailyActivityLog", DailyActivityLogSchema);
const DiscussPost =
  mongoose.models.DiscussPost ||
  mongoose.model("DiscussPost", DiscussPostSchema);
const DiscussReply =
  mongoose.models.DiscussReply ||
  mongoose.model("DiscussReply", DiscussReplySchema);

// ── Data ─────────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    name: "Arjun K.",
    email: "arjun.demo@placementprep.local",
    branch: "MCA",
    year: "Final Year",
    currentStreak: 12,
    longestStreak: 15,
    dailyGoal: 8,
    // problemsSolved per topic (index 0..11 maps to topics in order)
    solved: [18, 15, 12, 10, 8, 7, 5, 4, 3, 2, 2, 1],
    // daily activity last 14 days
    activity: [8, 7, 9, 6, 8, 5, 7, 8, 6, 7, 4, 5, 8, 9],
  },
  {
    name: "Divya M.",
    email: "divya.demo@placementprep.local",
    branch: "MCA",
    year: "Final Year",
    currentStreak: 5,
    longestStreak: 9,
    dailyGoal: 5,
    solved: [14, 10, 9, 8, 6, 5, 4, 3, 2, 1, 1, 1],
    activity: [5, 4, 6, 5, 3, 5, 4, 0, 5, 4, 5, 0, 0, 6],
  },
  {
    name: "Ravi S.",
    email: "ravi.demo@placementprep.local",
    branch: "MCA",
    year: "2nd Year",
    currentStreak: 3,
    longestStreak: 7,
    dailyGoal: 5,
    solved: [10, 8, 6, 5, 4, 3, 2, 2, 1, 1, 1, 0],
    activity: [3, 5, 4, 0, 3, 2, 4, 0, 0, 3, 4, 5, 0, 3],
  },
  {
    name: "Priya T.",
    email: "priya.demo@placementprep.local",
    branch: "MCA",
    year: "2nd Year",
    currentStreak: 1,
    longestStreak: 4,
    dailyGoal: 3,
    solved: [8, 6, 5, 3, 3, 2, 1, 1, 1, 0, 0, 1],
    activity: [2, 0, 3, 2, 0, 0, 2, 3, 0, 0, 2, 0, 3, 2],
  },
  {
    name: "Kiran B.",
    email: "kiran.demo@placementprep.local",
    branch: "MCA",
    year: "1st Year",
    currentStreak: 0,
    longestStreak: 2,
    dailyGoal: 3,
    solved: [5, 4, 3, 2, 1, 1, 1, 0, 0, 0, 0, 1],
    activity: [0, 0, 2, 3, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0],
  },
];

// 12 DSA topics in order + resource links
const TOPICS_SEED = [
  {
    name: "Arrays",
    order: 1,
    resourceLinks: [
      {
        title: "Striver's Array Series",
        url: "https://takeuforward.org/data-structure/top-array-interview-questions-structured-path/",
      },
      { title: "NeetCode Arrays", url: "https://neetcode.io/roadmap" },
    ],
  },
  {
    name: "Strings",
    order: 2,
    resourceLinks: [
      {
        title: "Striver's String Problems",
        url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
      },
    ],
  },
  {
    name: "Linked List",
    order: 3,
    resourceLinks: [
      {
        title: "Striver's Linked List Series",
        url: "https://takeuforward.org/linked-list/complete-linked-list-series-by-striver/",
      },
    ],
  },
  {
    name: "Stacks & Queues",
    order: 4,
    resourceLinks: [
      {
        title: "NeetCode Stack & Queue",
        url: "https://neetcode.io/roadmap",
      },
    ],
  },
  {
    name: "Trees",
    order: 5,
    resourceLinks: [
      {
        title: "Love Babbar Tree Problems",
        url: "https://www.youtube.com/watch?v=fH9KGQhSiFc",
      },
      {
        title: "Striver's Tree Series",
        url: "https://takeuforward.org/binary-tree/binary-tree-series/",
      },
    ],
  },
  {
    name: "Graphs",
    order: 6,
    resourceLinks: [
      {
        title: "Striver's Graph Series",
        url: "https://takeuforward.org/graph/striver-graph-series/",
      },
      { title: "NeetCode Graphs", url: "https://neetcode.io/roadmap" },
    ],
  },
  {
    name: "Dynamic Programming",
    order: 7,
    resourceLinks: [
      {
        title: "Aditya Verma DP Playlist",
        url: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go",
      },
      {
        title: "Striver's DP Series",
        url: "https://takeuforward.org/dynamic-programming/striver-dp-series-dynamic-programming-problems/",
      },
    ],
  },
  {
    name: "Recursion & Backtracking",
    order: 8,
    resourceLinks: [
      {
        title: "Aditya Verma Recursion Playlist",
        url: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWeT1ffjiImo0sYTcnLzo-wY",
      },
    ],
  },
  {
    name: "Sorting & Searching",
    order: 9,
    resourceLinks: [
      {
        title: "Striver's Sorting Series",
        url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
      },
    ],
  },
  {
    name: "Hashing",
    order: 10,
    resourceLinks: [
      {
        title: "NeetCode Hashing",
        url: "https://neetcode.io/roadmap",
      },
    ],
  },
  {
    name: "Greedy",
    order: 11,
    resourceLinks: [
      {
        title: "Striver's Greedy Algorithms",
        url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
      },
    ],
  },
  {
    name: "Bit Manipulation",
    order: 12,
    resourceLinks: [
      {
        title: "NeetCode Bit Manipulation",
        url: "https://neetcode.io/roadmap",
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  // ── 1. Upsert Topics + resource links ──────────────────────────────────────
  console.log("📚 Seeding topics…");
  const topicDocs: any[] = [];
  for (const t of TOPICS_SEED) {
    const existing = await Topic.findOne({ name: t.name });
    if (existing) {
      // Patch resource links if empty
      if (!existing.resourceLinks || existing.resourceLinks.length === 0) {
        existing.resourceLinks = t.resourceLinks;
        await existing.save();
        console.log(`   Updated links for: ${t.name}`);
      } else {
        console.log(`   Topic exists, skipping links: ${t.name}`);
      }
      topicDocs.push(existing);
    } else {
      const doc = await Topic.create(t);
      console.log(`   Created topic: ${t.name}`);
      topicDocs.push(doc);
    }
  }

  // ── 2. Upsert demo users ───────────────────────────────────────────────────
  console.log("\n👥 Seeding demo users…");
  const userDocs: any[] = [];
  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`   User exists, skipping: ${u.name}`);
      userDocs.push(existing);
      continue;
    }
    const doc = await User.create({
      name: u.name,
      email: u.email,
      branch: u.branch,
      year: u.year,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
      dailyGoal: u.dailyGoal,
      lastActiveDate: new Date(),
    });
    console.log(`   Created user: ${u.name}`);
    userDocs.push(doc);
  }

  // ── 3. UserTopicProgress ───────────────────────────────────────────────────
  console.log("\n📊 Seeding topic progress…");
  for (let ui = 0; ui < DEMO_USERS.length; ui++) {
    const user = userDocs[ui];
    const solvedArr = DEMO_USERS[ui].solved;
    for (let ti = 0; ti < topicDocs.length; ti++) {
      const topic = topicDocs[ti];
      const solved = solvedArr[ti] ?? 0;
      await UserTopicProgress.findOneAndUpdate(
        { userId: user._id, topicId: topic._id },
        { $setOnInsert: { problemsSolved: solved, lastUpdated: new Date() } },
        { upsert: true, new: true }
      );
    }
    console.log(`   Progress set for: ${DEMO_USERS[ui].name}`);
  }

  // ── 4. DailyActivityLog — last 14 days ────────────────────────────────────
  console.log("\n📅 Seeding daily activity logs…");
  for (let ui = 0; ui < DEMO_USERS.length; ui++) {
    const user = userDocs[ui];
    const activity = DEMO_USERS[ui].activity; // 14 entries newest→oldest
    for (let day = 0; day < 14; day++) {
      const count = activity[day] ?? 0;
      await DailyActivityLog.findOneAndUpdate(
        { userId: user._id, date: daysAgo(day) },
        { $setOnInsert: { problemsSolvedThatDay: count } },
        { upsert: true }
      );
    }
    console.log(`   Activity logged for: ${DEMO_USERS[ui].name}`);
  }

  // ── 5. Discuss posts ───────────────────────────────────────────────────────
  console.log("\n💬 Seeding discuss posts…");

  // Map topic names to IDs
  const topicMap: Record<string, Types.ObjectId> = {};
  for (const t of topicDocs) topicMap[t.name] = t._id;

  const postSeeds = [
    {
      authorIdx: 0, // Arjun
      problemTitle: "Two Sum",
      problemUrl: "https://leetcode.com/problems/two-sum/",
      topicName: "Arrays",
      title: "Two Sum — sliding window or hashmap?",
      body: `I'm confused about which approach to use for Two Sum.\n\n**Sliding window** seems intuitive but I think it only works for sorted arrays?\n\n\`\`\`js\n// Hashmap approach\nconst twoSum = (nums, target) => {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) return [map[complement], i];\n    map[nums[i]] = i;\n  }\n};\n\`\`\`\n\nIs the hashmap always the right approach here? What's the time/space tradeoff?`,
      upvotes: 7,
      replies: [
        {
          authorIdx: 1,
          body: "Yes! Hashmap is O(n) time and O(n) space — optimal for unsorted input. Sliding window only works when the array is **sorted**. Since Two Sum doesn't guarantee order, hashmap is the go-to.\n\nFor sorted arrays you'd use two pointers instead.",
          isAccepted: true,
          upvotes: 5,
        },
        {
          authorIdx: 2,
          body: "Great question. Also worth noting — brute force is O(n²) which will TLE on large inputs. Always go hashmap for Two Sum variants.",
          isAccepted: false,
          upvotes: 3,
        },
        {
          authorIdx: 3,
          body: "Striver has a great video on this exact problem in his A2Z sheet. Check [NeetCode Two Sum](https://neetcode.io) for clean explanation too!",
          isAccepted: false,
          upvotes: 2,
        },
      ],
    },
    {
      authorIdx: 1, // Divya
      problemTitle: "Climbing Stairs",
      problemUrl: "https://leetcode.com/problems/climbing-stairs/",
      topicName: "Dynamic Programming",
      title: "I don't understand memoization in DP",
      body: `I've been stuck on understanding when to use memoization vs tabulation.\n\nFor Climbing Stairs I wrote this recursive solution but it's too slow:\n\n\`\`\`python\ndef climbStairs(n):\n    if n <= 1: return 1\n    return climbStairs(n-1) + climbStairs(n-2)\n\`\`\`\n\nHow do I add memoization here? And when should I prefer tabulation?`,
      upvotes: 12,
      replies: [
        {
          authorIdx: 0,
          body: "Memoization = top-down DP. Add a cache dict:\n\n```python\ndef climbStairs(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return 1\n    memo[n] = climbStairs(n-1, memo) + climbStairs(n-2, memo)\n    return memo[n]\n```\n\nTabulation = bottom-up DP and is usually more memory efficient. For this problem both work great.",
          isAccepted: true,
          upvotes: 8,
        },
        {
          authorIdx: 4,
          body: "Also check out Aditya Verma's DP playlist on YouTube — it's the best resource for understanding DP from scratch. Covered memoization vs tabulation really well.",
          isAccepted: false,
          upvotes: 4,
        },
        {
          authorIdx: 2,
          body: "Rule of thumb: start with recursion → add memoization → convert to tabulation if needed for space optimization. That's the DP journey for most problems!",
          isAccepted: false,
          upvotes: 6,
        },
      ],
    },
    {
      authorIdx: 2, // Ravi
      problemTitle: "Number of Islands",
      problemUrl: "https://leetcode.com/problems/number-of-islands/",
      topicName: "Graphs",
      title: "BFS vs DFS — when to use which?",
      body: `For Number of Islands both BFS and DFS seem to give the same answer.\n\nIs there a rule of thumb for when to pick one over the other?\n\nMy DFS solution:\n\`\`\`python\ndef numIslands(grid):\n    count = 0\n    for i in range(len(grid)):\n        for j in range(len(grid[0])):\n            if grid[i][j] == '1':\n                dfs(grid, i, j)\n                count += 1\n    return count\n\`\`\``,
      upvotes: 9,
      replies: [
        {
          authorIdx: 0,
          body: "Great question! General rule:\n\n- **DFS** → better for exploring all paths, detecting cycles, connected components\n- **BFS** → better for shortest path, level-order traversal, nearest neighbor\n\nFor Number of Islands both work identically since you just need to mark visited cells.",
          isAccepted: true,
          upvotes: 7,
        },
        {
          authorIdx: 3,
          body: "BFS uses a queue (iterative), DFS uses a stack (or recursion). For very deep graphs DFS can hit Python's recursion limit — in those cases prefer BFS.",
          isAccepted: false,
          upvotes: 5,
        },
        {
          authorIdx: 1,
          body: "Striver's Graph series covers this really well! He shows both approaches for most graph problems so you can see the tradeoffs clearly.",
          isAccepted: false,
          upvotes: 3,
        },
      ],
    },
  ];

  for (const seed of postSeeds) {
    const topicId = topicMap[seed.topicName];
    if (!topicId) {
      console.log(`   ⚠ Topic not found: ${seed.topicName}`);
      continue;
    }

    // Check idempotency by title
    const existingPost = await DiscussPost.findOne({ title: seed.title });
    if (existingPost) {
      console.log(`   Post exists, skipping: "${seed.title}"`);
      continue;
    }

    const authorId = userDocs[seed.authorIdx]._id;
    const post = await DiscussPost.create({
      authorId,
      problemTitle: seed.problemTitle,
      problemUrl: seed.problemUrl,
      topicId,
      title: seed.title,
      body: seed.body,
      upvotes: seed.upvotes,
      upvotedBy: [],
      images: [],
    });
    console.log(`   Created post: "${seed.title}"`);

    // Replies
    for (const r of seed.replies) {
      await DiscussReply.create({
        postId: post._id,
        authorId: userDocs[r.authorIdx]._id,
        body: r.body,
        upvotes: r.upvotes,
        isAccepted: r.isAccepted,
        upvotedBy: [],
        images: [],
      });
    }
    console.log(`   Inserted ${seed.replies.length} replies`);
  }

  console.log("\n✅ Seed complete!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
