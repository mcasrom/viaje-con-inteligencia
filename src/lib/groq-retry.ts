import { createLogger } from '@/lib/logger';

const log = createLogger('GroqRetry');

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULT_OPTS: Required<RetryOptions> = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 16000,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    if ('status' in err && (err as any).status === 429) return true;
    if ('code' in err && (err as any).code === 429) return true;
    if (err instanceof Error && err.message.includes('429')) return true;
    if (err instanceof Error && err.message.toLowerCase().includes('rate limit')) return true;
    if (err instanceof Error && err.message.toLowerCase().includes('too many requests')) return true;
  }
  return false;
}

export async function withGroqRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_OPTS, ...opts };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (attempt < maxRetries && isRateLimitError(err)) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        const jitter = delay * (0.8 + Math.random() * 0.4);
        log.warn(`Groq rate limit (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(jitter)}ms`);
        await sleep(jitter);
      } else {
        throw err;
      }
    }
  }

  throw new Error('Groq retry exhausted');
}
