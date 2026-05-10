const WINDOW_MS = 60 * 1000;
const BURST_WINDOW_MS = 10 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

interface Window {
  count: number;
  resetAt: number;
}

const ipLimits = new Map<string, Window>();
const globalLimits: Window[] = [];
const burstLimits = new Map<string, Window>();

setInterval(() => {
  const now = Date.now();
  for (const [key, win] of ipLimits) {
    if (now > win.resetAt) ipLimits.delete(key);
  }
  for (const [key, win] of burstLimits) {
    if (now > win.resetAt) burstLimits.delete(key);
  }
  const cutoff = now - WINDOW_MS;
  for (let i = globalLimits.length - 1; i >= 0; i--) {
    if (globalLimits[i].resetAt < cutoff) globalLimits.splice(i, 1);
  }
}, CLEANUP_INTERVAL);

export function checkIpRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = WINDOW_MS,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = ipLimits.get(ip);

  if (!existing || now > existing.resetAt) {
    ipLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  existing.count++;
  const remaining = Math.max(0, maxRequests - existing.count);
  return {
    allowed: existing.count <= maxRequests,
    remaining,
    resetAt: existing.resetAt,
  };
}

export function checkGlobalGroqRateLimit(
  maxRequests: number = 20,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  while (globalLimits.length > 0 && globalLimits[0].resetAt < cutoff) {
    globalLimits.shift();
  }

  if (globalLimits.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  globalLimits.push({ count: 1, resetAt: now });
  return { allowed: true, remaining: maxRequests - globalLimits.length };
}

export function checkBurstRateLimit(
  key: string,
  maxBurst: number = 3,
  windowMs: number = BURST_WINDOW_MS,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = burstLimits.get(key);

  if (!existing || now > existing.resetAt) {
    burstLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxBurst - 1, resetAt: now + windowMs };
  }

  existing.count++;
  const remaining = Math.max(0, maxBurst - existing.count);
  return {
    allowed: existing.count <= maxBurst,
    remaining,
    resetAt: existing.resetAt,
  };
}
