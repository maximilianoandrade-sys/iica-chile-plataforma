/**
 * In-memory Sliding Window Rate Limiter
 * Provides rate-limiting capabilities to protect API routes (especially AI/Gemini endpoints) from abuse.
 */

interface RateLimitStore {
  [key: string]: number[];
}

const store: RateLimitStore = {};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks rate limit for a given identifier (e.g., client IP or device ID).
 * 
 * @param identifier Unique key representing client (e.g. IP address)
 * @param limit Maximum allowed requests within window
 * @param windowMs Time window in milliseconds (default 60000 = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!store[identifier]) {
    store[identifier] = [];
  }

  // Filter out timestamps older than the window
  store[identifier] = store[identifier].filter((timestamp) => timestamp > windowStart);

  const requestCount = store[identifier].length;

  if (requestCount >= limit) {
    const oldestTimestamp = store[identifier][0] || now;
    const resetMs = oldestTimestamp + windowMs - now;
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds: Math.ceil(resetMs / 1000),
    };
  }

  store[identifier].push(now);

  return {
    success: true,
    limit,
    remaining: limit - (requestCount + 1),
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/** Clean up stale entries every 5 minutes */
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    const windowStart = now - 300000;
    for (const key in store) {
      store[key] = store[key].filter((t) => t > windowStart);
      if (store[key].length === 0) {
        delete store[key];
      }
    }
  }, 300000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}
