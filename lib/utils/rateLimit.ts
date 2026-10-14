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

import { isIP } from 'node:net';

type RequestWithClientIp = {
  headers: { get(name: string): string | null };
  ip?: string;
};

/** Returns a stable client key without trusting arbitrary forwarded headers. */
export function getRateLimitIdentifier(request: RequestWithClientIp, namespace: string): string {
  const runtimeIp = request.ip?.trim();
  if (runtimeIp && isIP(runtimeIp)) return `${namespace}:${runtimeIp}`;

  const trustedHeader = process.env.TRUSTED_PROXY_IP_HEADER?.trim().toLowerCase();
  if (trustedHeader) {
    const headerValue = request.headers.get(trustedHeader)?.split(',')[0]?.trim();
    if (headerValue && isIP(headerValue)) return `${namespace}:${headerValue}`;
  }

  return `${namespace}:unknown`;
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

/** Uses the configured Upstash-compatible REST store across serverless instances. */
export async function checkDistributedRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60000,
): Promise<RateLimitResult> {
  const restUrl = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!restUrl || !token) return checkRateLimit(identifier, limit, windowMs);

  const bucket = Math.floor(Date.now() / windowMs);
  const key = `iica:ratelimit:${identifier}:${bucket}`;
  try {
    const response = await fetch(`${restUrl.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, windowMs],
      ]),
    });
    if (!response.ok) throw new Error(`Rate limit store returned ${response.status}`);
    const result = await response.json() as Array<{ result?: number }>;
    const count = Number(result[0]?.result);
    if (!Number.isFinite(count)) throw new Error('Invalid rate limit store response');
    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  } catch (error) {
    // Availability of the public API must not depend on an optional rate-limit service.
    return checkRateLimit(identifier, limit, windowMs);
  }
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
