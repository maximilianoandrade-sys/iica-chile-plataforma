/**
 * In-memory key-value store used by the cron lock.
 * Single-process only; sufficient for the cron route running on one instance.
 */

interface KVStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ttlSeconds?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

interface MemEntry {
  value: unknown;
  expiresAt: number | null;
}

const memoryStore = new Map<string, MemEntry>();

const kvStore: KVStore = {
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

export function getKVStore(): KVStore {
  return kvStore;
}
