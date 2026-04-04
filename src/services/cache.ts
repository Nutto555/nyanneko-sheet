const store = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 100;

export function getCached<T>(key: string): T | null {
  const hit = store.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;
  if (hit) store.delete(key); // expired — evict
  return null;
}

export function setCached(key: string, data: unknown): void {
  // Evict oldest entry if at capacity
  if (!store.has(key) && store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { data, ts: Date.now() });
}

export function invalidate(key: string): void {
  store.delete(key);
}

export function invalidateAll(): void {
  store.clear();
}
