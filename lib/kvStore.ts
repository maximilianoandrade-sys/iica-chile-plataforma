/**
 * Key-Value Store abstraction.
 * Uses Vercel KV (via REST API) in production when KV_REST_API_URL is set.
 * Falls back to in-memory Map for development.
 *
 * To enable in production:
 *   1. Create a Vercel KV store in your project dashboard
 *   2. Set KV_REST_API_URL and KV_REST_API_TOKEN env vars
 */

import { getLogger } from "@/lib/utils/logger";

const logger = getLogger("KVStore");

interface KVStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ttlSeconds?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// ── In-Memory fallback ──────────────────────────────────────────────────────

interface MemEntry {
  value: unknown;
  expiresAt: number | null;
}

const memoryStore = new Map<string, MemEntry>();

const inMemoryKV: KVStore = {
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value as T;
  },
  async set(key: string, value: unknown, options?: { ttlSeconds?: number }): Promise<void> {
    const expiresAt = options?.ttlSeconds ? Date.now() + options.ttlSeconds * 1000 : null;
    memoryStore.set(key, { value, expiresAt });
  },
  async delete(key: string): Promise<void> {
    memoryStore.delete(key);
  },
};

// ── Vercel KV (REST API) ────────────────────────────────────────────────────

function createVercelKV(): KVStore {
  const baseUrl = process.env.KV_REST_API_URL!;
  const token = process.env.KV_REST_API_TOKEN!;

  async function kvFetch(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`KV request failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return (data as { result: unknown }).result;
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      try {
        const result = await kvFetch("/", ["GET", key]);
        if (result === null || result === undefined) return null;
        return (typeof result === "string" ? JSON.parse(result) : result) as T;
      } catch (err) {
        logger.error("KV GET failed", err as Error, { key });
        return null;
      }
    },
    async set(key: string, value: unknown, options?: { ttlSeconds?: number }): Promise<void> {
      try {
        const serialized = JSON.stringify(value);
        const cmd = options?.ttlSeconds
          ? ["SET", key, serialized, "EX", String(options.ttlSeconds)]
          : ["SET", key, serialized];
        await kvFetch("/", cmd);
      } catch (err) {
        logger.error("KV SET failed", err as Error, { key });
      }
    },
    async delete(key: string): Promise<void> {
      try {
        await kvFetch("/", ["DEL", key]);
      } catch (err) {
        logger.error("KV DELETE failed", err as Error, { key });
      }
    },
  };
}

// ── Export singleton ────────────────────────────────────────────────────────

let _kv: KVStore | null = null;

export function getKVStore(): KVStore {
  if (!_kv) {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      logger.info("Using Vercel KV store");
      _kv = createVercelKV();
    } else {
      logger.info("Using in-memory KV store (set KV_REST_API_URL for production)");
      _kv = inMemoryKV;
    }
  }
  return _kv;
}
