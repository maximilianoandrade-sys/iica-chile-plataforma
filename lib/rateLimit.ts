/**
 * Rate limiter en memoria usando ventana fija.
 *
 * ponytail: in-memory is fine for Vercel hobby (1-3 instances, worst case 3x limit).
 * Upgrade to @upstash/ratelimit when: paid plan with many concurrent instances,
 * or if abuse is actually observed in production logs.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes (unref to not block process exit)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 5 * 60 * 1000);
if (typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSizeSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request from the given identifier is allowed.
 * Returns whether the request is allowed and remaining quota.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowSizeSeconds * 1000 });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowSizeSeconds * 1000 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers (works on Vercel and most proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
