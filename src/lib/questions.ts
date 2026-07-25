export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "LeetCode" | "GFG";

export interface Problem {
  title: string;
  difficulty: Difficulty;
  url: string;
  platform: Platform;
}

export const topicProblems: Record<string, Problem[]> = {
  Arrays: [
    { title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/", platform: "LeetCode" },
    { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", platform: "LeetCode" },
    { title: "Contains Duplicate", difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate/", platform: "LeetCode" },
    { title: "Maximum Subarray (Kadane's)", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/", platform: "LeetCode" },
    { title: "Merge Intervals", difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/", platform: "LeetCode" },
    { title: "Product of Array Except Self", difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/", platform: "LeetCode" },
    { title: "3Sum", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/", platform: "LeetCode" },
    { title: "Trapping Rain Water", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/", platform: "LeetCode" },
  ],
  Strings: [
    { title: "Valid Palindrome", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/", platform: "LeetCode" },
    { title: "Valid Anagram", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/", platform: "LeetCode" },
    { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", platform: "LeetCode" },
    { title: "Longest Palindromic Substring", difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-substring/", platform: "LeetCode" },
    { title: "Group Anagrams", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/", platform: "LeetCode" },
    { title: "String Compression", difficulty: "Medium", url: "https://leetcode.com/problems/string-compression/", platform: "LeetCode" },
    { title: "Minimum Window Substring", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/", platform: "LeetCode" },
  ],
  "Linked List": [
    { title: "Reverse Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/", platform: "LeetCode" },
    { title: "Merge Two Sorted Lists", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/", platform: "LeetCode" },
    { title: "Linked List Cycle", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/", platform: "LeetCode" },
    { title: "Find Middle of Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/middle-of-the-linked-list/", platform: "LeetCode" },
    { title: "Remove Nth Node From End", difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", platform: "LeetCode" },
    { title: "Add Two Numbers", difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/", platform: "LeetCode" },
    { title: "LRU Cache", difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/", platform: "LeetCode" },
    { title: "Merge K Sorted Lists", difficulty: "Hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/", platform: "LeetCode" },
  ],
  "Stacks & Queues": [
    { title: "Valid Parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/", platform: "LeetCode" },
    { title: "Min Stack", difficulty: "Medium", url: "https://leetcode.com/problems/min-stack/", platform: "LeetCode" },
    { title: "Daily Temperatures", difficulty: "Medium", url: "https://leetcode.com/problems/daily-temperatures/", platform: "LeetCode" },
    { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", platform: "LeetCode" },
    { title: "Next Greater Element", difficulty: "Easy", url: "https://leetcode.com/problems/next-greater-element-i/", platform: "LeetCode" },
    { title: "Implement Queue using Stacks", difficulty: "Easy", url: "https://leetcode.com/problems/implement-queue-using-stacks/", platform: "LeetCode" },
    { title: "Sliding Window Maximum", difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/", platform: "LeetCode" },
  ],
  Trees: [
    { title: "Maximum Depth of Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", platform: "LeetCode" },
    { title: "Invert Binary Tree", difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/", platform: "LeetCode" },
    { title: "Symmetric Tree", difficulty: "Easy", url: "https://leetcode.com/problems/symmetric-tree/", platform: "LeetCode" },
    { title: "Binary Tree Level Order Traversal", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", platform: "LeetCode" },
    { title: "Validate Binary Search Tree", difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/", platform: "LeetCode" },
    { title: "Lowest Common Ancestor", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", platform: "LeetCode" },
    { title: "Binary Tree Right Side View", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-right-side-view/", platform: "LeetCode" },
    { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", platform: "LeetCode" },
  ],
  Graphs: [
    { title: "Number of Islands", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/", platform: "LeetCode" },
    { title: "Clone Graph", difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/", platform: "LeetCode" },
    { title: "Course Schedule (Topological Sort)", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/", platform: "LeetCode" },
    { title: "Pacific Atlantic Water Flow", difficulty: "Medium", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/", platform: "LeetCode" },
    { title: "Detect Cycle in Directed Graph", difficulty: "Medium", url: "https://www.geeksforgeeks.org/detect-cycle-in-a-graph/", platform: "GFG" },
    { title: "Shortest Path in Binary Matrix", difficulty: "Medium", url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/", platform: "LeetCode" },
    { title: "Word Ladder", difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder/", platform: "LeetCode" },
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/", platform: "LeetCode" },
    { title: "House Robber", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/", platform: "LeetCode" },
    { title: "Coin Change", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/", platform: "LeetCode" },
    { title: "Longest Common Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/", platform: "LeetCode" },
    { title: "Longest Increasing Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", platform: "LeetCode" },
    { title: "0/1 Knapsack Problem", difficulty: "Medium", url: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", platform: "GFG" },
    { title: "Edit Distance", difficulty: "Medium", url: "https://leetcode.com/problems/edit-distance/", platform: "LeetCode" },
    { title: "Partition Equal Subset Sum", difficulty: "Medium", url: "https://leetcode.com/problems/partition-equal-subset-sum/", platform: "LeetCode" },
  ],
  "Recursion & Backtracking": [
    { title: "Permutations", difficulty: "Medium", url: "https://leetcode.com/problems/permutations/", platform: "LeetCode" },
    { title: "Subsets", difficulty: "Medium", url: "https://leetcode.com/problems/subsets/", platform: "LeetCode" },
    { title: "Combination Sum", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum/", platform: "LeetCode" },
    { title: "Word Search", difficulty: "Medium", url: "https://leetcode.com/problems/word-search/", platform: "LeetCode" },
    { title: "N-Queens", difficulty: "Hard", url: "https://leetcode.com/problems/n-queens/", platform: "LeetCode" },
    { title: "Rat in a Maze", difficulty: "Medium", url: "https://www.geeksforgeeks.org/rat-in-a-maze-problem-when-movement-in-all-possible-directions-is-allowed/", platform: "GFG" },
    { title: "Sudoku Solver", difficulty: "Hard", url: "https://leetcode.com/problems/sudoku-solver/", platform: "LeetCode" },
  ],
  Greedy: [
    { title: "Jump Game", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/", platform: "LeetCode" },
    { title: "Jump Game II", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game-ii/", platform: "LeetCode" },
    { title: "Gas Station", difficulty: "Medium", url: "https://leetcode.com/problems/gas-station/", platform: "LeetCode" },
    { title: "Activity Selection Problem", difficulty: "Medium", url: "https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/", platform: "GFG" },
    { title: "Non-overlapping Intervals", difficulty: "Medium", url: "https://leetcode.com/problems/non-overlapping-intervals/", platform: "LeetCode" },
    { title: "Minimum Number of Platforms", difficulty: "Medium", url: "https://www.geeksforgeeks.org/minimum-number-platforms-required-railwaybus-station/", platform: "GFG" },
  ],
  "Sorting & Searching": [
    { title: "Binary Search", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/", platform: "LeetCode" },
    { title: "Search in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", platform: "LeetCode" },
    { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", platform: "LeetCode" },
    { title: "Kth Largest Element in Array", difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", platform: "LeetCode" },
    { title: "Merge Sort Implementation", difficulty: "Medium", url: "https://www.geeksforgeeks.org/merge-sort/", platform: "GFG" },
    { title: "Sort Colors (Dutch Flag)", difficulty: "Medium", url: "https://leetcode.com/problems/sort-colors/", platform: "LeetCode" },
    { title: "Median of Two Sorted Arrays", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", platform: "LeetCode" },
  ],
  "Bit Manipulation": [
    { title: "Single Number", difficulty: "Easy", url: "https://leetcode.com/problems/single-number/", platform: "LeetCode" },
    { title: "Number of 1 Bits", difficulty: "Easy", url: "https://leetcode.com/problems/number-of-1-bits/", platform: "LeetCode" },
    { title: "Counting Bits", difficulty: "Easy", url: "https://leetcode.com/problems/counting-bits/", platform: "LeetCode" },
    { title: "Missing Number", difficulty: "Easy", url: "https://leetcode.com/problems/missing-number/", platform: "LeetCode" },
    { title: "Reverse Bits", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-bits/", platform: "LeetCode" },
    { title: "Sum of Two Integers (No + operator)", difficulty: "Medium", url: "https://leetcode.com/problems/sum-of-two-integers/", platform: "LeetCode" },
    { title: "Find XOR of all subsets", difficulty: "Medium", url: "https://www.geeksforgeeks.org/find-xor-of-all-subsets-of-a-set/", platform: "GFG" },
  ],
  Hashing: [
    { title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/", platform: "LeetCode" },
    { title: "Group Anagrams", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/", platform: "LeetCode" },
    { title: "Top K Frequent Elements", difficulty: "Medium", url: "https://leetcode.com/problems/top-k-frequent-elements/", platform: "LeetCode" },
    { title: "Longest Consecutive Sequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-consecutive-sequence/", platform: "LeetCode" },
    { title: "Subarray Sum Equals K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sum-equals-k/", platform: "LeetCode" },
    { title: "4Sum", difficulty: "Medium", url: "https://leetcode.com/problems/4sum/", platform: "LeetCode" },
    { title: "Find All Duplicates in Array", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", platform: "LeetCode" },
  ],
};
