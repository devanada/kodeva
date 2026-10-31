interface IWindow {
  count: number;
  resetAt: number;
}

const windows = new Map<string, IWindow>();

// Fixed-window limiter kept in memory. On Vercel each warm instance has its own counter, so this only blunts bursts
// from one client; a shared store (Upstash/Redis) is the production answer and is listed in the README.
export function isRateLimited(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });

    return false;
  }

  current.count += 1;

  return current.count > limit;
}
