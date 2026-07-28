/**
 * lib/ai.ts
 * Thin wrapper around the Groq API so the provider can be swapped later.
 * Uses the first-party `groq-sdk` package (OpenAI-compatible interface).
 *
 * Multi-key rotation: up to 5 Groq API keys are supported.
 * When a key hits its rate limit (HTTP 429), the request is automatically
 * retried on the next key. The rotating pointer is kept in-memory per
 * server instance — no persistence needed.
 */

import Groq from "groq-sdk";
import * as Sentry from "@sentry/nextjs";


// ---------------------------------------------------------------------------
// Build one Groq client per configured key, skipping missing/empty entries
// ---------------------------------------------------------------------------
const keys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
].filter(Boolean) as string[];

const clients = keys.map((key) => new Groq({ apiKey: key }));

/**
 * In-memory rotating pointer.
 * Starts at 0; advances only when the current key is rate-limited.
 * Resets to 0 on server restart — that's intentional.
 */
let currentKeyIndex = 0;

// ---------------------------------------------------------------------------
// Core rotation logic
// ---------------------------------------------------------------------------
async function callGroqWithRotation(messages: Groq.Chat.ChatCompletionMessageParam[]) {
  if (clients.length === 0) {
    throw new Error("No Groq API keys configured");
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < clients.length; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % clients.length;
    const client = clients[keyIndex];

    try {
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 600,
      });

      // Success — pin this key as the preferred starting point next time
      currentKeyIndex = keyIndex;
      return completion.choices[0]?.message?.content ?? "";
    } catch (err: unknown) {
      lastError = err;
      const errObj = err as { status?: number; error?: { type?: string } };
      const isRateLimit =
        errObj?.status === 429 ||
        errObj?.error?.type === "rate_limit_exceeded";

      if (isRateLimit) {
        const nextIndex = (keyIndex + 1) % clients.length;
        console.warn(
          `[ai] Groq key ${keyIndex + 1} rate-limited — rotating to key ${nextIndex + 1}`
        );
        continue; // try next key
      }

      // Non-rate-limit error — don't burn through all keys, propagate immediately.
      // Report to Sentry before re-throwing so it's captured even if the caller
      // swallows the error or shows a generic user-facing message.
      Sentry.withScope((scope) => {
        scope.setContext("groq_key", { index: keyIndex + 1, totalKeys: clients.length });
        scope.setTag("groq.error_type", "non_rate_limit");
        Sentry.captureException(err);
      });
      throw err;
    }
  }

  // All keys exhausted
  console.warn(
    `[ai] All ${clients.length} Groq API keys are rate-limited. Throwing last error.`
  );
  Sentry.withScope((scope) => {
    scope.setContext("groq_key", { totalKeys: clients.length, allExhausted: true });
    scope.setTag("groq.error_type", "all_keys_rate_limited");
    Sentry.captureException(lastError);
  });
  throw lastError;
}

// ---------------------------------------------------------------------------
// Public interface (unchanged signature — API routes need no updates)
// ---------------------------------------------------------------------------
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Calls Groq (llama-3.3-70b-versatile) with a system instruction, recent history,
 * and the new user message. Returns the assistant's text reply.
 * Automatically rotates across up to 5 API keys on rate-limit errors.
 */
export async function askAssistant(
  systemInstruction: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstruction },
    ...history,
    { role: "user", content: userMessage },
  ];

  return callGroqWithRotation(messages);
}
