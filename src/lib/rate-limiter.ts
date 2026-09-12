/**
 * In-Memory Sliding Window Rate Limiter
 * Tracks request counts per IP address to prevent spam and DDoS
 */

interface RateLimitRecord {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  __rateLimitMap?: Map<string, RateLimitRecord>;
  __rateLimitInterval?: NodeJS.Timeout;
};

const rateLimitMap = globalForRateLimit.__rateLimitMap ?? new Map<string, RateLimitRecord>();
globalForRateLimit.__rateLimitMap = rateLimitMap;

const MAX_MAP_SIZE = 50000; // Protection against unbounded memory growth

// Cleanup stale records periodically (every 5 minutes)
if (!globalForRateLimit.__rateLimitInterval && typeof setInterval !== "undefined") {
  globalForRateLimit.__rateLimitInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 600000); // 10 minutes
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
    // Hard cap eviction if map grows too large under DDoS
    if (rateLimitMap.size > MAX_MAP_SIZE) {
      const keysToDelete = Array.from(rateLimitMap.keys()).slice(0, 10000);
      keysToDelete.forEach((k) => rateLimitMap.delete(k));
    }
  }, 300000);
}

/**
 * Checks if an IP has exceeded the allowed request limit within the window.
 * @param ip - Client IP address
 * @param limit - Maximum allowed requests in the time window (default 2)
 * @param windowMs - Time window in milliseconds (default 10 mins = 600,000ms)
 * @returns { allowed: boolean, remaining: number, retryAfterSeconds: number }
 */
export function checkRateLimit(
  ip: string,
  limit = 2,
  windowMs = 600000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  // Record this request
  record.timestamps.push(now);
  rateLimitMap.set(ip, record);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}
