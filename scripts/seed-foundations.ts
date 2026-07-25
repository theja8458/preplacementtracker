/**
 * scripts/seed-foundations.ts
 * Run: npx ts-node -r dotenv/config --project tsconfig.json scripts/seed-foundations.ts
 * Idempotent — safe to run multiple times.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── inline mini-schemas so we don't rely on Next.js path aliases ──────────────
const CatSchema = new mongoose.Schema({ name: String, order: Number, description: String, icon: String });
const ProbSchema = new mongoose.Schema({
  categoryId: mongoose.Schema.Types.ObjectId,
  title: String, difficulty: String, statement: String,
  approachHint: String, sampleInput: String, sampleOutput: String, order: Number,
});

const Cat = mongoose.models.FoundationCategory || mongoose.model("FoundationCategory", CatSchema);
const Prob = mongoose.models.FoundationProblem || mongoose.model("FoundationProblem", ProbSchema);

const CATEGORIES = [
  { order: 1, name: "Print Patterns",      icon: "Grid3x3",    description: "Build nested-loop thinking by printing star and number patterns." },
  { order: 2, name: "Numbers & Math Logic", icon: "Hash",       description: "Prime checks, factorials, palindromes — the building blocks of algorithm thinking." },
  { order: 3, name: "Loops & Conditionals", icon: "RefreshCw",  description: "Master control flow with classic problems every developer should know." },
  { order: 4, name: "Array Logic",          icon: "LayoutList", description: "Manipulate arrays without built-in helpers to build real intuition." },
  { order: 5, name: "String Logic",         icon: "Type",       description: "Work through characters, anagrams, and patterns in strings." },
  { order: 6, name: "Recursion Basics",     icon: "GitBranch",  description: "Bridge to recursion and DP — think in smaller sub-problems." },
];

type ProbDef = {
  title: string;
  difficulty: "warmup" | "easy" | "core";
  statement: string;
  approachHint: string;
  sampleInput: string;
  sampleOutput: string;
};

const PROBLEMS: Record<string, ProbDef[]> = {
  "Print Patterns": [
    {
      title: "N × N Square of Stars", difficulty: "warmup",
      statement: "Given n, print an n × n grid of stars (*). Each row should have exactly n stars separated by spaces.",
      approachHint: "You need two loops — one for rows, one for columns. How many times does each loop need to run?",
      sampleInput: "n = 3", sampleOutput: "* * *\n* * *\n* * *",
    },
    {
      title: "Right-Angled Triangle", difficulty: "warmup",
      statement: "Given n, print a right-angled triangle where row i has i stars (row 1 → 1 star, row 2 → 2 stars, …, row n → n stars).",
      approachHint: "The outer loop controls which row you're on. The inner loop should run exactly how many times? Think about the row number.",
      sampleInput: "n = 4", sampleOutput: "*\n* *\n* * *\n* * * *",
    },
    {
      title: "Inverted Right-Angled Triangle", difficulty: "warmup",
      statement: "Given n, print an inverted triangle — row 1 has n stars, row 2 has n-1, down to row n with 1 star.",
      approachHint: "Start the outer loop from n and count down to 1. How does that change what the inner loop does?",
      sampleInput: "n = 4", sampleOutput: "* * * *\n* * *\n* *\n*",
    },
    {
      title: "Centered Pyramid", difficulty: "easy",
      statement: "Given n, print a centered pyramid. Row i has (2i-1) stars, padded with spaces on the left so it looks centered.",
      approachHint: "Each row i has (n - i) leading spaces, then (2i - 1) stars. Figure out the space count first, then the star count.",
      sampleInput: "n = 4", sampleOutput: "   *\n  * * *\n * * * * *\n* * * * * * *",
    },
    {
      title: "Diamond Pattern", difficulty: "easy",
      statement: "Given n, print a diamond — a pyramid of n rows going up, then an inverted pyramid of n-1 rows going down.",
      approachHint: "A diamond is two problems stitched together: an upward pyramid and an inverted one. Solve each separately first.",
      sampleInput: "n = 3", sampleOutput: "  *\n * * *\n* * * * *\n * * *\n  *",
    },
    {
      title: "Number Triangle", difficulty: "easy",
      statement: "Given n, print a triangle where row i contains the numbers 1 to i on that row (e.g., row 3 → 1 2 3).",
      approachHint: "The inner loop variable itself IS the number to print. You don't need a separate counter.",
      sampleInput: "n = 4", sampleOutput: "1\n1 2\n1 2 3\n1 2 3 4",
    },
    {
      title: "Pascal's Triangle", difficulty: "core",
      statement: "Given n, print Pascal's Triangle up to n rows. Each element is the sum of the two elements directly above it.",
      approachHint: "Store each row as an array. Row 0 is [1]. Each subsequent row starts and ends with 1, and middle[j] = prev[j-1] + prev[j]. Build row by row.",
      sampleInput: "n = 4", sampleOutput: "1\n1 1\n1 2 1\n1 3 3 1",
    },
    {
      title: "Hollow Square", difficulty: "core",
      statement: "Given n, print an n × n square where only the border cells have stars (*); all inner cells are spaces.",
      approachHint: "A cell (i, j) is on the border if i is 0 or n-1, OR j is 0 or n-1. Everything else is a space. Check the condition inside your loop.",
      sampleInput: "n = 4", sampleOutput: "* * * *\n*     *\n*     *\n* * * *",
    },
  ],

  "Numbers & Math Logic": [
    {
      title: "Even or Odd", difficulty: "warmup",
      statement: "Given a number n, print 'Even' if it is divisible by 2, otherwise print 'Odd'.",
      approachHint: "Think about what the remainder (%) operator tells you when you divide by 2.",
      sampleInput: "n = 7", sampleOutput: "Odd",
    },
    {
      title: "Is Prime?", difficulty: "easy",
      statement: "Given a number n, determine if it is prime. A prime has exactly two divisors: 1 and itself.",
      approachHint: "Check divisibility from 2 up to √n. If any number in that range divides n evenly, it's not prime. Why does √n suffice?",
      sampleInput: "n = 13", sampleOutput: "Prime",
    },
    {
      title: "All Primes Up to N", difficulty: "easy",
      statement: "Print all prime numbers from 2 up to N (inclusive).",
      approachHint: "Apply your is-prime check inside a loop from 2 to N. Or look up the Sieve of Eratosthenes for a more elegant approach.",
      sampleInput: "N = 20", sampleOutput: "2 3 5 7 11 13 17 19",
    },
    {
      title: "Factorial (Loop & Recursion)", difficulty: "easy",
      statement: "Given n, compute n! (n factorial). Write it twice — first using a loop, then using recursion.",
      approachHint: "Loop: start result = 1, multiply by every integer from 1 to n. Recursion: n! = n × (n-1)!. What's the base case?",
      sampleInput: "n = 5", sampleOutput: "120",
    },
    {
      title: "Palindrome Number", difficulty: "easy",
      statement: "Given an integer n, check if it reads the same forwards and backwards (e.g., 121 or 1331).",
      approachHint: "Reverse the number by extracting digits one by one using % 10 and dividing by 10. Compare the reversed number to the original.",
      sampleInput: "n = 121", sampleOutput: "Palindrome",
    },
    {
      title: "Reverse an Integer", difficulty: "easy",
      statement: "Given an integer n, return the number formed by reversing its digits. Ignore leading zeros in the result.",
      approachHint: "Extract the last digit with (n % 10), build the reversed number with (reversed * 10 + digit), then remove the digit from n with (n / 10).",
      sampleInput: "n = 4521", sampleOutput: "1254",
    },
    {
      title: "Sum of Digits", difficulty: "warmup",
      statement: "Given a number n, find the sum of its digits (e.g., 1234 → 1+2+3+4 = 10).",
      approachHint: "Extract each digit using % 10, add it to a running total, then shrink the number using integer division by 10. Repeat until the number is 0.",
      sampleInput: "n = 1234", sampleOutput: "10",
    },
    {
      title: "Armstrong Number", difficulty: "easy",
      statement: "A number is an Armstrong number if the sum of its digits each raised to the power of the number of digits equals the number itself (e.g., 153 = 1³ + 5³ + 3³).",
      approachHint: "First count the number of digits (length). Then raise each digit to that power and sum them up. Compare the sum to the original number.",
      sampleInput: "n = 153", sampleOutput: "Armstrong",
    },
    {
      title: "GCD and LCM", difficulty: "easy",
      statement: "Given two numbers a and b, find their Greatest Common Divisor (GCD) and Least Common Multiple (LCM).",
      approachHint: "For GCD, use the Euclidean algorithm: gcd(a, b) = gcd(b, a % b) until b is 0. For LCM, remember: LCM = (a × b) / GCD.",
      sampleInput: "a = 12, b = 18", sampleOutput: "GCD = 6, LCM = 36",
    },
    {
      title: "Fibonacci Series", difficulty: "easy",
      statement: "Given N, print the first N terms of the Fibonacci series (0, 1, 1, 2, 3, 5, 8, ...).",
      approachHint: "Keep two variables for the last two terms. Each new term = sum of those two. Shift them forward after each step.",
      sampleInput: "N = 7", sampleOutput: "0 1 1 2 3 5 8",
    },
    {
      title: "Nth Fibonacci Number", difficulty: "core",
      statement: "Given N, return the Nth Fibonacci number. Write it first with a loop, then with recursion. Notice the difference in performance.",
      approachHint: "Loop: maintain two variables and iterate. Recursion: fib(n) = fib(n-1) + fib(n-2), base cases fib(0)=0, fib(1)=1. Why is the recursive version slow for large N?",
      sampleInput: "N = 8", sampleOutput: "21",
    },
  ],

  "Loops & Conditionals": [
    {
      title: "FizzBuzz", difficulty: "warmup",
      statement: "For every integer from 1 to N: print 'FizzBuzz' if divisible by both 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, else print the number.",
      approachHint: "Check divisibility by 15 first (both 3 and 5), then 3, then 5, then fall through. Order matters here!",
      sampleInput: "N = 15", sampleOutput: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz",
    },
    {
      title: "Largest of Three Numbers", difficulty: "warmup",
      statement: "Given three numbers a, b, c, find the largest without using any built-in max() function.",
      approachHint: "Use if-else to compare pairs. First check if a > b and a > c. Then check b vs c in the else branch.",
      sampleInput: "a=4, b=9, c=6", sampleOutput: "9",
    },
    {
      title: "Count Vowels and Consonants", difficulty: "easy",
      statement: "Given a sentence, count the total number of vowels (a, e, i, o, u) and consonants (all other alphabet characters, ignoring spaces and punctuation).",
      approachHint: "Loop through each character. Check if it's a letter first. Then check if it belongs to the vowel set (a, e, i, o, u) — case insensitive.",
      sampleInput: '"Hello World"', sampleOutput: "Vowels: 3, Consonants: 7",
    },
    {
      title: "Largest and Smallest in Array", difficulty: "easy",
      statement: "Given an array, find the largest and smallest element without using any built-in min() or max() functions.",
      approachHint: "Initialize max and min to the first element. Then loop from index 1 onward, updating max and min as you compare each element.",
      sampleInput: "[3, 7, 1, 9, 2]", sampleOutput: "Largest: 9, Smallest: 1",
    },
    {
      title: "Count Even and Odd", difficulty: "warmup",
      statement: "Given an array of integers, count how many are even and how many are odd.",
      approachHint: "A single loop with a modulo check on each element. Maintain two counters.",
      sampleInput: "[1, 2, 3, 4, 5, 6]", sampleOutput: "Even: 3, Odd: 3",
    },
    {
      title: "Second Largest Element", difficulty: "core",
      statement: "Find the second largest unique element in an array. If no such element exists, return -1.",
      approachHint: "Track both 'largest' and 'secondLargest' as you loop. When you find a new largest, the old largest becomes secondLargest. Handle equal elements carefully.",
      sampleInput: "[5, 3, 9, 9, 7]", sampleOutput: "7",
    },
  ],

  "Array Logic": [
    {
      title: "Reverse an Array In Place", difficulty: "warmup",
      statement: "Reverse an array without creating a new array. Use the two-pointer technique: swap elements from both ends moving inward.",
      approachHint: "Use two indices: left = 0, right = length - 1. Swap arr[left] and arr[right], then move left forward and right backward. Stop when left >= right.",
      sampleInput: "[1, 2, 3, 4, 5]", sampleOutput: "[5, 4, 3, 2, 1]",
    },
    {
      title: "Sum and Average", difficulty: "warmup",
      statement: "Given an array of numbers, compute their sum and average without using built-in sum or reduce functions.",
      approachHint: "Maintain a running total. After the loop, divide by the array length. Watch out for an empty array!",
      sampleInput: "[10, 20, 30, 40]", sampleOutput: "Sum: 100, Average: 25",
    },
    {
      title: "Linear Search", difficulty: "warmup",
      statement: "Given an array and a target value, return the index of the first occurrence of target. Return -1 if not found.",
      approachHint: "Loop through each element from index 0. Compare each element to the target. Return the index the moment you find a match.",
      sampleInput: "arr=[4,2,9,1], target=9", sampleOutput: "Index: 2",
    },
    {
      title: "Binary Search (Iterative)", difficulty: "easy",
      statement: "Given a sorted array and a target, return its index using binary search. Do NOT use recursion — use a while loop.",
      approachHint: "Think about cutting the search space in half each time. What do you compare the middle element to? How do you update left or right based on that comparison?",
      sampleInput: "arr=[1,3,5,7,9,11], target=7", sampleOutput: "Index: 3",
    },
    {
      title: "Is Array Sorted?", difficulty: "easy",
      statement: "Given an array, return true if it is sorted in non-decreasing order, false otherwise.",
      approachHint: "Loop from index 1 to end. Compare each element with the previous one. The moment you find arr[i] < arr[i-1], you know it's not sorted.",
      sampleInput: "[1, 3, 5, 7]", sampleOutput: "true",
    },
    {
      title: "Find Duplicates", difficulty: "easy",
      statement: "Given an array of integers, find and return all elements that appear more than once.",
      approachHint: "Use a frequency map (object/dictionary) — first pass: count occurrences. Second pass: collect keys whose count > 1.",
      sampleInput: "[1, 2, 3, 2, 4, 1]", sampleOutput: "[1, 2]",
    },
    {
      title: "Left Rotate by K", difficulty: "core",
      statement: "Rotate an array to the left by k positions. The first k elements move to the end.",
      approachHint: "One approach: slice the array into two parts at index k and rejoin them in reverse order. Or do it in-place using the reverse technique (reverse first k, reverse rest, reverse all).",
      sampleInput: "arr=[1,2,3,4,5], k=2", sampleOutput: "[3, 4, 5, 1, 2]",
    },
    {
      title: "Move Zeros to End", difficulty: "core",
      statement: "Move all zeros in the array to the end while maintaining the relative order of non-zero elements. Do it in-place.",
      approachHint: "Use a write pointer starting at 0. Loop through the array; whenever you find a non-zero element, write it to the write pointer position and advance the pointer. Fill the remaining positions with 0.",
      sampleInput: "[0, 1, 0, 3, 12]", sampleOutput: "[1, 3, 12, 0, 0]",
    },
  ],

  "String Logic": [
    {
      title: "Reverse a String (No Built-in)", difficulty: "warmup",
      statement: "Reverse a string without using any built-in reverse function. Build the reversed string character by character.",
      approachHint: "Loop from the last character index to 0 and concatenate each character to a new string. Or use the two-pointer swap approach on an array of characters.",
      sampleInput: '"hello"', sampleOutput: '"olleh"',
    },
    {
      title: "Palindrome String", difficulty: "easy",
      statement: "Check if a string is a palindrome — reads the same forwards and backwards. Ignore case.",
      approachHint: "Convert to lowercase first. Then use two pointers (left and right) moving inward. Compare characters at each end. If they ever differ, it's not a palindrome.",
      sampleInput: '"Racecar"', sampleOutput: "Palindrome",
    },
    {
      title: "Character Frequency Count", difficulty: "easy",
      statement: "Given a string, count how many times each character appears. Print each character and its count.",
      approachHint: "Use a plain object as a map. For each character, check if it's already a key. If yes, increment. If no, initialize to 1.",
      sampleInput: '"banana"', sampleOutput: "b:1, a:3, n:2",
    },
    {
      title: "Anagram Check", difficulty: "easy",
      statement: "Given two strings, check if they are anagrams of each other (same characters, same frequencies, different order).",
      approachHint: "Sort both strings and compare — if they're equal, they're anagrams. Or use a frequency map: count chars in string 1, subtract for string 2, check all zeros.",
      sampleInput: '"listen", "silent"', sampleOutput: "Anagram",
    },
    {
      title: "Remove Duplicate Characters", difficulty: "core",
      statement: "Given a string, return a new string with duplicate characters removed. Keep only the first occurrence of each character.",
      approachHint: "Loop through the string. Maintain a 'seen' set. For each character, only add it to your result if it's not already in 'seen'. Then add it to 'seen'.",
      sampleInput: '"programming"', sampleOutput: '"progamin"',
    },
    {
      title: "First Non-Repeating Character", difficulty: "core",
      statement: "Given a string, find and return the first character that appears exactly once. Return -1 if no such character exists.",
      approachHint: "Two passes: first build a frequency map of all characters. Second pass through the original string — the first character with frequency 1 is your answer.",
      sampleInput: '"aabbcde"', sampleOutput: "c",
    },
  ],

  "Recursion Basics": [
    {
      title: "Sum of N Natural Numbers (Recursion)", difficulty: "easy",
      statement: "Compute the sum 1 + 2 + 3 + ... + N using recursion, without any loop.",
      approachHint: "sum(n) = n + sum(n-1). What happens when n reaches 0? That's your base case — return 0.",
      sampleInput: "N = 5", sampleOutput: "15",
    },
    {
      title: "Factorial (Recursion)", difficulty: "easy",
      statement: "Compute n! using recursion. This time you are NOT allowed to use any loop.",
      approachHint: "fact(n) = n × fact(n-1). Base case: fact(0) = 1 and fact(1) = 1. Make sure every recursive call moves toward the base case.",
      sampleInput: "n = 6", sampleOutput: "720",
    },
    {
      title: "Fibonacci (Recursion)", difficulty: "easy",
      statement: "Return the Nth Fibonacci number using recursion. Compare how slow this is vs your loop version from the Numbers section.",
      approachHint: "fib(n) = fib(n-1) + fib(n-2). Base cases: fib(0) = 0, fib(1) = 1. Try running for n=35 and see how long it takes — that's the cost of overlapping sub-problems.",
      sampleInput: "N = 7", sampleOutput: "13",
    },
    {
      title: "Reverse a String (Recursion)", difficulty: "core",
      statement: "Reverse a string using recursion without any loop or built-in reverse.",
      approachHint: "reverse(s) = reverse(s without first character) + first character. Base case: empty string or single character returns itself.",
      sampleInput: '"hello"', sampleOutput: '"olleh"',
    },
    {
      title: "Palindrome Check (Recursion)", difficulty: "core",
      statement: "Check if a string is a palindrome using recursion — no loops, no built-in reverse.",
      approachHint: "isPalin(s, left, right): compare s[left] and s[right]. If they match, recurse with left+1 and right-1. Base case: left >= right means it's a palindrome.",
      sampleInput: '"racecar"', sampleOutput: "Palindrome",
    },
    {
      title: "All Subsets of a 3-Element Set", difficulty: "core",
      statement: "Given a set of 3 elements [1, 2, 3], print ALL subsets (there should be 8, including the empty set). This is your first taste of backtracking.",
      approachHint: "For each element, you have two choices: include it or exclude it. Use recursion with a 'current' list. At each level, branch into two recursive calls — one that adds the element and one that doesn't.",
      sampleInput: "[1, 2, 3]", sampleOutput: "[], [3], [2], [2,3], [1], [1,3], [1,2], [1,2,3]",
    },
  ],
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  for (const catDef of CATEGORIES) {
    const cat = await Cat.findOneAndUpdate(
      { name: catDef.name },
      { $set: catDef },
      { upsert: true, new: true }
    );
    console.log(`✓ Category: ${catDef.name} (${cat._id})`);

    const probs = PROBLEMS[catDef.name] ?? [];
    for (let i = 0; i < probs.length; i++) {
      const p = probs[i];
      await Prob.findOneAndUpdate(
        { categoryId: cat._id, title: p.title },
        { $set: { ...p, categoryId: cat._id, order: i + 1 } },
        { upsert: true }
      );
      console.log(`  ✓ Problem: ${p.title}`);
    }
  }

  console.log("\n✅ Foundations seeded successfully!");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
