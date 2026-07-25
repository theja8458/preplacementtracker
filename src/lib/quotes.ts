export const dashboardQuotes = [
  {
    quote: "Your future self is watching you from the leaderboard. Don't disappoint them. 👀",
    subtext: "Open LeetCode. Now. We'll wait.",
  },
  {
    quote: "The only difference between you and the placed student is they actually opened LeetCode today. 🚀",
    subtext: "Be that person. Today.",
  },
  {
    quote: "Plot twist: the FAANG offer was inside you all along. But you still need to solve 200 problems first. 😅",
    subtext: "Problem 1 of 200. Let's go.",
  },
  {
    quote: "Interviews are just vibe checks with extra steps. You got this! 💪",
    subtext: "Crack the vibe. Get the offer.",
  },
  {
    quote: "ChatGPT can't attend your interview for you. Your brain has to show up. Train it. 🧠",
    subtext: "No shortcuts in the interview room.",
  },
];

export const topicQuotes: Record<string, { quote: string; subtext: string }> = {
  Arrays: {
    quote: "Arrays: everyone has an index, life always starts at 0. Very relatable. 🙂",
    subtext: "Master Arrays and you've mastered 40% of interviews.",
  },
  "Dynamic Programming": {
    quote: "DP is just recursion with a better memory. Be like DP — remember your past mistakes. 🤔",
    subtext: "Break it down. Memoize. Win.",
  },
  Graphs: {
    quote: "Life is a graph problem. BFS: explore everything. DFS: go too deep and forget why you started. 😂",
    subtext: "Know which traversal your interviewer wants.",
  },
  Trees: {
    quote: "Trees: because someone decided linked lists were too simple and decided to add branches. 🌳",
    subtext: "Left child, right child, no child — just you and the whiteboard.",
  },
  Strings: {
    quote: "Strings are just arrays with trust issues. Handle them carefully. 🧵",
    subtext: "Index out of bounds? We've all been there.",
  },
  LinkedList: {
    quote: "A Linked List is like a treasure hunt — you get to the next clue only if you survive the current one. 🗺️",
    subtext: "Don't forget to handle null. That's where most dreams die.",
  },
  "Stacks & Queues": {
    quote: "Stack: last in, first out — exactly like project deadlines. Queue: first come, first served — unlike placements. 😬",
    subtext: "Push. Pop. Repeat until placed.",
  },
  Greedy: {
    quote: "Greedy algorithms: make the best choice at every step and hope for the best. Relatable life advice. 🍕",
    subtext: "Sometimes greedy works. Sometimes you need DP. Know the difference.",
  },
  "Sorting & Searching": {
    quote: "You literally sort your life every morning — priorities. Turns out computers do it better. 📋",
    subtext: "O(n log n) or bust.",
  },
  "Recursion & Backtracking": {
    quote: "Recursion: to understand recursion, you must first understand recursion. You're welcome. 🔄",
    subtext: "Base case or infinite loop. No in-between.",
  },
  "Bit Manipulation": {
    quote: "Bit manipulation: making interviewers feel smart for asking it and candidates feel dumb for not knowing. 😤",
    subtext: "XOR everything. It usually works.",
  },
  Hashing: {
    quote: "Hash maps: the duct tape of DSA. Everything can be solved with a hash map. Everything. 🗂️",
    subtext: "O(1) lookup. The interviewer's love language.",
  },
  fallback: {
    quote: "You can't spell 'algorithm' without 'I go'. So... go solve it! 🏃",
    subtext: "One problem at a time. You'll get there.",
  },
};

export const leaderboardQuotes = [
  {
    quote: "Rank #1 is right there. It was empty once. Now someone else is sitting in it. Go get them. 🏆",
    subtext: "Leaderboards change every week.",
  },
  {
    quote: "Being #2 just means #1 hasn't heard about your grind yet. Fix that. 💥",
    subtext: "One more problem than yesterday.",
  },
];

export const discussQuotes = [
  {
    quote: "Confused? Good. Confusion is just understanding doing a warm-up. Ask your question! 🙋",
    subtext: "No question is dumb. Silence is dumb.",
  },
  {
    quote: "If you don't ask, the answer is always no. Also, you'll fail the interview. So... ask. 😄",
    subtext: "Someone else has the same doubt. Be the hero.",
  },
];

/** Returns the same quote for everyone on the same calendar day */
export function getDailyQuote<T>(quotes: T[]): T {
  const dayIndex = Math.floor(Date.now() / 86400000) % quotes.length;
  return quotes[dayIndex];
}

export function getTopicQuote(topicName: string) {
  return topicQuotes[topicName] || topicQuotes.fallback;
}
