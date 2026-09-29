import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const fallbackRateLimit = new Map<string, { count: number; lastReset: number }>();

let upstashRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
  });
} else {
  console.warn("UPSTASH_REDIS_REST_URL not found. Using in-memory fallback rate limiter. This is not suitable for serverless functions.");
}

export async function checkRateLimit(id: string, limit = 5, windowMs = 60000) {
  if (upstashRatelimit) {
    const { success, reset } = await upstashRatelimit.limit(id);
    return { success, reset };
  }

  // Fallback to in-memory map
  const now = Date.now();
  const record = fallbackRateLimit.get(id) || { count: 0, lastReset: now };
  
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }
  
  record.count += 1;
  fallbackRateLimit.set(id, record);
  
  return { success: record.count <= limit, reset: record.lastReset + windowMs };
}

